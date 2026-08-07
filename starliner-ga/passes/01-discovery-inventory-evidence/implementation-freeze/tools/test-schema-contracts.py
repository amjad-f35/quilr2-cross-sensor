#!/usr/bin/env python3
"""Executable positive/negative contract corpus for the frozen DIE schemas."""

from __future__ import annotations

import copy
import base64
import hashlib
import json
from datetime import datetime, timedelta
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
UUID_1 = "11111111-1111-4111-8111-111111111111"
UUID_2 = "22222222-2222-4222-8222-222222222222"
UUID_3 = "33333333-3333-7333-8333-333333333333"
NOW = "2026-07-29T12:00:00Z"
LATER = "2026-07-29T13:00:00Z"
DIGEST = "sha256:" + ("a" * 64)
SIGNATURE = {"format": "jws-detached-jcs", "algorithm": "ES256", "key_id": "key-1", "value": "e30..c2ln"}
HEALTH_POLICY = {
    "policy_version": "health.v1",
    "expected_report_interval_seconds": 60,
    "degraded_after_seconds": 300,
    "offline_after_seconds": 900,
    "queue_degraded_after_ms": 60000,
    "queue_unhealthy_after_ms": 300000,
    "required_components": ["capture", "delivery"],
}
ATTRIBUTION = {
    "assertion_id": UUID_1,
    "issuer_producer_id": UUID_2,
    "subject_profile": "endpoint",
    "subject_namespace": "endpoint-agent",
    "agent_deployment_source_id": "agent-deployment-1",
    "workload_source_id": "workload-1",
    "issued_at": NOW,
    "expires_at": LATER,
    "nonce": "0123456789abcdef",
    "audience_gateway_source_id": "gateway-1",
    "request_binding_digest": DIGEST,
    "assurance": "signed_starliner_context",
    "signature": SIGNATURE,
}
QUALIFIED_BROWSER_RECORD = {
    "producer_id": UUID_1,
    "producer_epoch": UUID_2,
    "record_id": UUID_3,
    "content_sha256": DIGEST,
}


def reject_duplicate_object_keys(pairs: list[tuple[str, object]]) -> dict:
    value = {}
    for key, item in pairs:
        if key in value:
            raise AssertionError(f"duplicate JSON object key: {key}")
        value[key] = item
    return value


def load(name: str) -> dict:
    return json.loads(
        (SCHEMAS / name).read_text(),
        object_pairs_hook=reject_duplicate_object_keys,
    )


def validator(name: str) -> Draft202012Validator:
    schema = load(name)
    Draft202012Validator.check_schema(schema)
    registry = Registry().with_resources(
        (
            candidate["$id"],
            Resource.from_contents(candidate),
        )
        for candidate in (load(path.name) for path in sorted(SCHEMAS.glob("*.json")))
        if "$id" in candidate
    )
    return Draft202012Validator(
        schema,
        format_checker=FormatChecker(),
        registry=registry,
    )


def accept(name: str, value: dict, label: str) -> None:
    errors = sorted(validator(name).iter_errors(value), key=lambda error: list(error.path))
    if errors:
        details = "; ".join(error.message for error in errors[:3])
        raise AssertionError(f"{name} rejected valid case {label}: {details}")


def reject(name: str, value: dict, label: str) -> None:
    if validator(name).is_valid(value):
        raise AssertionError(f"{name} accepted invalid case {label}")


def canonical_sha256(value: dict, omitted_keys: set[str] | None = None) -> str:
    canonical = copy.deepcopy(value)
    for key in omitted_keys or set():
        canonical.pop(key, None)
    encoded = json.dumps(
        canonical,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")
    return "sha256:" + hashlib.sha256(encoded).hexdigest()


def rfc7638_thumbprint(public_jwk: dict) -> str:
    """Validate public coordinate encoding and hash only RFC 7638 members."""
    if public_jwk.get("kty") == "OKP" and public_jwk.get("crv") == "Ed25519":
        selected = {
            "crv": public_jwk["crv"],
            "kty": public_jwk["kty"],
            "x": public_jwk["x"],
        }
        encoded_coordinates = (public_jwk["x"],)
    elif public_jwk.get("kty") == "EC" and public_jwk.get("crv") == "P-256":
        selected = {
            "crv": public_jwk["crv"],
            "kty": public_jwk["kty"],
            "x": public_jwk["x"],
            "y": public_jwk["y"],
        }
        encoded_coordinates = (public_jwk["x"], public_jwk["y"])
    else:
        raise AssertionError("unsupported installation-key type/curve")
    for coordinate in encoded_coordinates:
        try:
            decoded = base64.urlsafe_b64decode(coordinate + "=" * (-len(coordinate) % 4))
        except Exception as error:
            raise AssertionError("installation-key coordinate is not base64url") from error
        if len(decoded) != 32:
            raise AssertionError("installation-key coordinate has the wrong curve length")
    return canonical_sha256(selected)


def manifest_operation(value: dict, operation: str, manifest_id: str, revision: int) -> dict:
    """Create an operation payload without carrying stale fields from another arm."""
    common = {
        key: copy.deepcopy(value[key])
        for key in (
            "manifest_version",
            "tenant_id",
            "producer_id",
            "issued_at",
            "expires_at",
            "issuer",
            "signature",
        )
    }
    common.update(
        {
            "manifest_id": manifest_id,
            "operation": operation,
            "revision": revision,
        }
    )
    return common


def validate_manifest_state(value: dict, current: dict | None) -> None:
    """Executable state preconditions that JSON Schema cannot compare."""
    accept("producer-enrollment-manifest.schema.json", value, value["operation"])
    operation = value["operation"]
    if operation == "apply":
        if current is not None or value["revision"] != 1:
            raise AssertionError("apply requires a new producer at revision 1")
        return
    if current is None:
        raise AssertionError(f"{operation} requires a current producer")
    if value["producer_id"] != current["producer_id"]:
        raise AssertionError("manifest producer differs from current producer")
    if value["revision"] != current["revision"] + 1:
        raise AssertionError("manifest revision is stale or noncontiguous")
    if operation == "rotate":
        if value["producer_epoch"] != current["producer_epoch"]:
            raise AssertionError("credential rotation crossed producer epoch")
        if (
            value["installation_key_thumbprint"]
            != current["installation_key_thumbprint"]
        ):
            raise AssertionError("credential rotation used a noncurrent installation key")
        if value["credential_subject"] != current["credential_subject"]:
            raise AssertionError("credential rotation changed producer subject")
        if value["credential_id"] == current["credential_id"]:
            raise AssertionError("credential rotation reused current credential ID")
    elif operation == "certify":
        certification = value["certification"]
        expected = {
            "source_profile": current["source_profile"],
            "profile_version": current["profile_version"],
            "component_set_digest": current["component_set_digest"],
            "delivery_artifact_digest": current["artifact_digest"],
            "artifact_digest": current["artifact_digest"],
            "contract_digest": current["contract_digest"],
        }
        for field, expected_value in expected.items():
            if certification[field] != expected_value:
                raise AssertionError(f"certification has stale or mismatched {field}")
        if (
            certification["profile_versions"].get(certification["source_profile"])
            != certification["profile_version"]
        ):
            raise AssertionError("certification profile_versions does not bind its exact profile")
        if certification["result"] != "passed":
            raise AssertionError("only a passing current certification activates trust")


def reject_manifest_state(value: dict, current: dict | None, label: str) -> None:
    try:
        validate_manifest_state(value, current)
    except AssertionError:
        return
    raise AssertionError(f"manifest state validator accepted invalid case {label}")


def validate_component_set(value: dict) -> None:
    accept("producer-component-set.schema.json", value, "installed component set")
    package_ids = [item["package_id"] for item in value["packages"]]
    component_ids = [item["component_id"] for item in value["components"]]
    if len(package_ids) != len(set(package_ids)):
        raise AssertionError("component set repeats package_id")
    if len(component_ids) != len(set(component_ids)):
        raise AssertionError("component set repeats component_id")
    unknown_packages = {
        item["package_id"] for item in value["components"]
    } - set(package_ids)
    if unknown_packages:
        raise AssertionError(f"components reference unknown packages: {unknown_packages}")
    ownership = value["ownership"]
    ownership_ids = set(ownership["capture_component_ids"])
    ownership_ids.add(ownership["wal_component_id"])
    ownership_ids.add(ownership["delivery_component_id"])
    ownership_ids.update(ownership["health_component_ids"])
    unknown_owners = ownership_ids - set(component_ids)
    if unknown_owners:
        raise AssertionError(f"ownership references unknown components: {unknown_owners}")
    role_by_component = {
        item["component_id"]: item["role"] for item in value["components"]
    }
    if set(ownership["health_component_ids"]) != set(component_ids):
        raise AssertionError("health coverage must name every admitted runtime component")
    for owner_id_field, owner_role_field in (
        ("wal_component_id", "wal_component_role"),
        ("delivery_component_id", "delivery_component_role"),
    ):
        if role_by_component[ownership[owner_id_field]] != ownership[owner_role_field]:
            raise AssertionError(
                f"{owner_role_field} does not match the referenced component role"
            )
    if (
        value["source_profile"] == "browser"
        and (
            role_by_component[ownership["delivery_component_id"]]
            != "browser_extension"
            or role_by_component[ownership["wal_component_id"]]
            != "browser_extension"
            or ownership["delivery_component_role"] != "browser_extension"
            or ownership["wal_component_role"] != "browser_extension"
        )
    ):
        raise AssertionError("Browser delivery and WAL stream must remain WebExtension-owned")
    expected_digest = canonical_sha256(value, {"component_set_digest"})
    if value["component_set_digest"] != expected_digest:
        raise AssertionError("component_set_digest does not bind the measured component set")


def validate_enrollment_request(value: dict) -> None:
    accept("sensor-enrollment-request.schema.json", value, "sensor enrollment request")
    validate_component_set(value["component_set"])
    if value["source_profile"] != value["component_set"]["source_profile"]:
        raise AssertionError("enrollment profile differs from component-set profile")
    proof_input = copy.deepcopy(value)
    proof_input["installation_proof"].pop("request_digest", None)
    proof_input["installation_proof"].pop("detached_jws", None)
    expected_digest = canonical_sha256(proof_input)
    if value["installation_proof"]["request_digest"] != expected_digest:
        raise AssertionError("installation proof does not bind the enrollment request")
    public_jwk = value["installation_proof"]["public_jwk"]
    expected_thumbprint = rfc7638_thumbprint(public_jwk)
    if value["installation_proof"]["key_thumbprint"] != expected_thumbprint:
        raise AssertionError("installation key thumbprint is not the RFC 7638 JWK digest")
    requested_at = datetime.fromisoformat(value["requested_at"].replace("Z", "+00:00"))
    signed_at = datetime.fromisoformat(
        value["installation_proof"]["signed_at"].replace("Z", "+00:00")
    )
    if abs(signed_at - requested_at) > timedelta(minutes=5):
        raise AssertionError("installation proof timestamp is outside request freshness window")


def validate_enrollment_response(value: dict, request: dict) -> None:
    accept("sensor-enrollment-response.schema.json", value, "sensor enrollment response")
    identity = value["workload_identity"]
    issued = datetime.fromisoformat(identity["issued_at"].replace("Z", "+00:00"))
    renew = datetime.fromisoformat(identity["renew_after"].replace("Z", "+00:00"))
    expires = datetime.fromisoformat(identity["expires_at"].replace("Z", "+00:00"))
    if not issued < renew < expires <= issued + timedelta(minutes=15):
        raise AssertionError("workload credential is not ordered and bounded to 15 minutes")
    manifest = value["enrollment_manifest"]
    configuration = value["edge_configuration"]
    manifest_fields = (
        "tenant_id",
        "producer_id",
        "installation_id",
        "producer_epoch",
        "source_profile",
        "component_set_digest",
    )
    for field in manifest_fields:
        if manifest[field] != value[field]:
            raise AssertionError(f"manifest {field} differs from enrollment response")
    for field in (
        "tenant_id",
        "producer_id",
        "installation_id",
        "producer_epoch",
        "component_set_digest",
    ):
        if configuration[field] != value[field]:
            raise AssertionError(f"edge configuration {field} differs from enrollment response")
    if not any(
        profile["profile"] == value["source_profile"]
        and profile["profile_version"] == value["profile_version"]
        for profile in configuration["profiles"]
    ):
        raise AssertionError("edge configuration does not admit the response profile/version")
    if value["request_id"] != request["request_id"]:
        raise AssertionError("response request_id does not match request")
    if value["tenant_id"] != request["organization_tenant_id"]:
        raise AssertionError("response tenant is not the bootstrapped organization tenant")
    if manifest["bootstrap_id"] != request["bootstrap_id"]:
        raise AssertionError("manifest bootstrap_id does not match consumed bootstrap")
    if value["component_set_digest"] != request["component_set"]["component_set_digest"]:
        raise AssertionError("response does not bind the admitted component set")
    delivery_component_id = request["component_set"]["ownership"]["delivery_component_id"]
    delivery_artifact = next(
        component["runtime_artifact_digest"]
        for component in request["component_set"]["components"]
        if component["component_id"] == delivery_component_id
    )
    if manifest["artifact_digest"] != delivery_artifact:
        raise AssertionError("manifest artifact_digest is not the delivery-owner runtime artifact")
    if manifest["installation_key_thumbprint"] != request["installation_proof"]["key_thumbprint"]:
        raise AssertionError("manifest installation key differs from proof key")
    if identity["confirmation_thumbprint"] != request["installation_proof"]["key_thumbprint"]:
        raise AssertionError("DPoP credential is not bound to the installation proof key")
    if manifest["credential_subject"] != identity["subject"]:
        raise AssertionError("manifest credential subject differs from the issued identity")
    edge_identity = configuration["workload_identity"]
    identity_fields = (
        "credential_id",
        "subject",
        "confirmation_thumbprint",
        "scopes",
        "issued_at",
        "renew_after",
        "expires_at",
        "renewal_url",
    )
    for field in identity_fields:
        if edge_identity[field] != identity[field]:
            raise AssertionError(f"edge workload identity {field} differs from response")
    if manifest["credential_id"] != identity["credential_id"]:
        raise AssertionError("manifest credential_id differs from issued credential")
    if manifest["credential_expires_at"] != identity["expires_at"]:
        raise AssertionError("manifest credential expiry differs from issued credential")
    component_ids = {
        item["component_id"] for item in request["component_set"]["components"]
    }
    if set(manifest["health_policy"]["required_components"]) != component_ids:
        raise AssertionError(
            "health policy required_components must equal the admitted component set"
        )


def apply_json_pointer_mutation(value: dict, mutation: dict) -> dict:
    result = copy.deepcopy(value)
    tokens = [
        token.replace("~1", "/").replace("~0", "~")
        for token in mutation["path"].split("/")[1:]
    ]
    parent: object = result
    for token in tokens[:-1]:
        parent = parent[int(token)] if isinstance(parent, list) else parent[token]
    key = tokens[-1]
    operation = mutation["op"]
    if isinstance(parent, list):
        index = int(key)
        if operation == "remove":
            parent.pop(index)
        elif operation == "replace":
            parent[index] = mutation["value"]
        elif operation == "add":
            parent.insert(index, mutation["value"])
        else:
            raise AssertionError(f"unsupported fixture mutation: {operation}")
    elif operation == "remove":
        del parent[key]
    elif operation in {"add", "replace"}:
        parent[key] = mutation["value"]
    else:
        raise AssertionError(f"unsupported fixture mutation: {operation}")
    return result


def normalization_bundle_digest(output_refs: list[dict]) -> str:
    digest = hashlib.sha256()
    for output in sorted(output_refs, key=lambda item: item["output_key"].encode("utf-8")):
        for value in (output["output_key"], output["observation_id"], output["output_digest"]):
            encoded = value.encode("utf-8")
            digest.update(len(encoded).to_bytes(8, byteorder="big", signed=False))
            digest.update(encoded)
    return "sha256:" + digest.hexdigest()


def runtime_profile_registry_digest(entries: list[dict]) -> str:
    canonical = sorted(
        [
            {
                "profile": entry["profile"],
                "profile_version": entry["profile_version"],
                "component_role": entry["component_role"],
                "schema_digest": entry["schema_digest"],
            }
            for entry in entries
        ],
        key=lambda entry: (entry["profile"], entry["profile_version"]),
    )
    encoded = json.dumps(canonical, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return "sha256:" + hashlib.sha256(encoded).hexdigest()


def validate_normalization_bundle(value: dict) -> None:
    accept("normalization-bundle.schema.json", value, "normalization bundle")
    refs = value["output_refs"]
    if value["output_count"] != len(refs):
        raise AssertionError("normalization bundle output_count does not match output_refs")
    keys = [item["output_key"] for item in refs]
    if len(keys) != len(set(keys)):
        raise AssertionError("normalization bundle repeats output_key")
    if value["bundle_digest"] != normalization_bundle_digest(refs):
        raise AssertionError("normalization bundle digest mismatch")


PROFILE_CASES: dict[str, list[dict]] = {
    "profile-browser-v1.schema.json": [
        {"kind": "browser.installation", "installation_source_id": "i", "component": "extension", "lifecycle": "observed"},
        {"kind": "browser.device", "device_source_id": "d", "lifecycle": "observed", "os_platform": "macos"},
        {"kind": "browser.application", "application_id": "a", "origin": "https://example.com", "display_name": "Example", "lifecycle": "observed"},
        {"kind": "browser.account_context", "application_id": "a", "authentication_context": "guest", "evidence_method": "extension_native"},
        {"kind": "browser.relationship", "subject_type": "installation", "subject_id": "i", "predicate": "installed_on", "object_type": "device", "object_id": "d", "semantic": "structural", "operation": "upsert"},
        {"kind": "browser.local_binding", "assertion_id": UUID_1, "issuer_producer_id": UUID_2, "issuer_installation_id": "endpoint-i", "browser_installation_source_id": "browser-i", "device_ref": {"producer_id": UUID_2, "namespace": "endpoint-agent", "object_type": "device", "object_id": "d"}, "issued_at": NOW, "expires_at": LATER, "nonce": "0123456789abcdef", "signature": SIGNATURE, "assurance": "signed_local_runtime"},
        {"kind": "browser.activity", "activity_type": "application_use", "application_id": "a", "status": "succeeded"},
        {"kind": "browser.upload", "upload_id": "u", "application_id": "a", "stage": "observed", "file_count": 1},
        {"kind": "browser.native_outcome", "native_request_id": "n", "outcome": "clean"},
        {"kind": "browser.snapshot", "snapshot_id": "s", "stage": "started", "scope_type": "applications", "completeness": "full"},
        {"kind": "browser.health", "component": "extension", "state": "healthy", "capabilities": []},
        {"kind": "browser.gap", "capability": "application_activity", "from": NOW, "reason_code": "extension_suspended"},
    ],
    "profile-endpoint-v1.schema.json": [
        {"kind": "endpoint.entity", "entity_type": "device", "source_id": "d", "lifecycle": "observed"},
        {"kind": "endpoint.entity", "entity_type": "agent_deployment", "source_id": "ad", "definition_source_id": "def", "device_source_id": "d", "observation_user_source_id": "u", "installation_scope_id": "desktop", "deployment_locality": "local", "lifecycle": "observed"},
        {"kind": "endpoint.relationship", "subject_type": "process", "subject_id": "p", "predicate": "executed_as", "object_type": "local_user", "object_id": "u", "semantic": "observed", "operation": "upsert"},
        {"kind": "endpoint.activity", "activity_type": "process_start", "status": "succeeded"},
        {"kind": "endpoint.native_decision", "decision_id": "n", "decision": "allow"},
        {"kind": "endpoint.native_effect", "decision_id": "n", "effect": "forwarded"},
        {"kind": "endpoint.snapshot", "snapshot_id": "s", "stage": "started", "scope_type": "devices", "completeness": "full"},
        {"kind": "endpoint.health", "component": "monitor", "state": "healthy", "snapshot_watermark": "w"},
        {"kind": "endpoint.gap", "component": "monitor", "capability": "process", "from": NOW, "reason_code": "service_stopped"},
    ],
    "profile-llm-gateway-v1.schema.json": [
        {"kind": "llm.entity", "entity_type": "provider", "source_id": "p", "lifecycle": "observed"},
        {"kind": "llm.relationship", "subject_type": "model_route", "subject_id": "r", "predicate": "routes_to", "object_type": "model_deployment", "object_id": "m", "semantic": "configured", "operation": "upsert"},
        {"kind": "llm.invocation", "invocation_id": "i", "stage": "accepted", "model_source_id": "m", "status": "succeeded"},
        {"kind": "llm.invocation", "invocation_id": "i-attributed", "stage": "accepted", "model_source_id": "m", "status": "succeeded", "cross_sensor_attribution": ATTRIBUTION},
        {"kind": "llm.native_decision", "decision_id": "n", "invocation_id": "i", "decision": "allow"},
        {"kind": "llm.native_effect", "decision_id": "n", "invocation_id": "i", "effect": "provider_called"},
        {"kind": "llm.snapshot", "snapshot_id": "s", "stage": "started", "scope_type": "models", "completeness": "full"},
        {"kind": "llm.health", "component": "gateway", "state": "healthy", "transports": []},
        {"kind": "llm.gap", "transport": "kafka", "from": NOW, "reason_code": "queue_publish_unconfirmed"},
    ],
    "profile-mcp-gateway-v1.schema.json": [
        {"kind": "mcp.entity", "entity_type": "server_product", "source_id": "s", "lifecycle": "observed"},
        {"kind": "mcp.entity", "entity_type": "agent_deployment", "source_id": "ad", "definition_source_id": "def", "deployment_locality": "gateway", "lifecycle": "observed"},
        {"kind": "mcp.relationship", "subject_type": "server_deployment", "subject_id": "s", "predicate": "exposes", "object_type": "tool", "object_id": "t", "semantic": "structural", "operation": "upsert", "capability_scope": "authorization_context", "authorization_context_token": "hmac-sha256:" + ("b" * 64), "endpoint_configuration_token": "hmac-sha256:" + ("c" * 64), "protocol_version": "2025-06-18"},
        {"kind": "mcp.tool_call", "call_id": "c", "surface": "direct", "stage": "requested", "server_source_id": "s", "tool_source_id": "t", "status": "unknown"},
        {"kind": "mcp.tool_call", "call_id": "c-attributed", "surface": "direct", "stage": "requested", "server_source_id": "s", "tool_source_id": "t", "status": "unknown", "cross_sensor_attribution": ATTRIBUTION},
        {"kind": "mcp.operation", "operation_id": "o", "activity_type": "resource_read", "server_source_id": "s", "resource_source_id": "r", "status": "succeeded"},
        {"kind": "mcp.rejection", "request_id": "r", "surface": "direct", "reason_code": "policy_denied", "status": "blocked"},
        {"kind": "mcp.native_decision", "decision_id": "n", "call_id": "c", "decision": "allow"},
        {"kind": "mcp.native_effect", "decision_id": "n", "call_id": "c", "effect": "invoked"},
        {"kind": "mcp.snapshot", "snapshot_id": "snap", "stage": "started", "scope_type": "servers", "completeness": "full"},
        {"kind": "mcp.health", "component": "gateway", "state": "healthy", "surfaces": []},
        {"kind": "mcp.gap", "surface": "direct", "from": NOW, "reason_code": "process_restart"},
    ],
}


def run() -> None:
    schema_names = sorted(path.name for path in SCHEMAS.glob("*.json"))
    for name in schema_names:
        Draft202012Validator.check_schema(load(name))

    positive_count = 0
    negative_count = 0

    installed_product_fixtures = ROOT / "fixtures" / "installed-product"
    browser_enrollment_request = json.loads(
        (installed_product_fixtures / "browser-enrollment-request.valid.json").read_text()
    )
    endpoint_enrollment_request = json.loads(
        (installed_product_fixtures / "endpoint-enrollment-request.valid.json").read_text()
    )
    browser_enrollment_response = json.loads(
        (installed_product_fixtures / "browser-enrollment-response.valid.json").read_text()
    )
    browser_source_product_path = json.loads(
        (installed_product_fixtures / "browser-source-product-path.valid.json").read_text()
    )
    validate_enrollment_request(browser_enrollment_request)
    validate_enrollment_request(endpoint_enrollment_request)
    validate_enrollment_response(browser_enrollment_response, browser_enrollment_request)
    accept(
        "source-product-path.schema.json",
        browser_source_product_path,
        "content-addressed Browser installed-product path",
    )
    positive_count += 4

    installed_observed = copy.deepcopy(browser_source_product_path)
    installed_observed["normal_path_state"] = "INSTALLED_OBSERVED"
    installed_observed["enrollment"]["status"] = "EXTERNAL_INPUT_REQUIRED"
    installed_observed["prerequisites"][0]["status"] = "MISSING"
    installed_observed["data_path"].update(
        {
            "sender_component_id": "UNASSIGNED",
            "sender_component_kind": "UNASSIGNED",
            "sender_symbol": "UNASSIGNED",
            "sender_evidence_ref": "UNASSIGNED",
            "receipt_handler_symbol": "UNASSIGNED",
            "receipt_evidence_ref": "UNASSIGNED",
        }
    )
    accept(
        "source-product-path.schema.json",
        installed_observed,
        "installed components observed before sender and receipt exist",
    )
    positive_count += 1

    stage_evidence = {
        "schema": "die.sensor-stage-evidence.v1",
        "vertical_id": "SV-BROWSER-001",
        "capability_id": "PC-002",
        "profile": "browser",
        "stage": "NATIVE_CAPTURE",
        "observed_at": NOW,
        "integration_run_id": "run-browser-1",
        "logical_tenant_id": UUID_1,
        "producer_id": UUID_2,
        "installation_id": "browser-installation-1",
        "source_record_id": "record-1",
        "source_commit": "a" * 40,
        "source_product_path_digest": DIGEST,
        "install_artifact_digest": DIGEST,
        "installed_artifact_digest": DIGEST,
        "component_set_digest": DIGEST,
        "runtime_manifest_digest": "NONE",
        "runtime_manifest_id": "NONE",
        "proof_origin": "EXACT_INSTALLED_PRODUCT",
        "runtime_mode": "COHERENT_LOCAL_PRODUCT",
        "normal_entrypoint": True,
        "fixture_substitution": False,
        "manual_bypass": False,
        "preview_path": False,
        "contamination_state": "CLEAN",
        "predecessor_digest": "NONE",
        "assertion": {
            "native_record_id": "native-1",
            "capture_component_id": "browser-extension",
            "capture_symbol": "PackageLog.sendLogs",
            "native_record_digest": DIGEST,
        },
    }
    accept(
        "sensor-stage-evidence.schema.json",
        stage_evidence,
        "closed native-capture stage evidence",
    )
    generic_stage = copy.deepcopy(stage_evidence)
    generic_stage["assertion"] = {"status": "passed"}
    reject(
        "sensor-stage-evidence.schema.json",
        generic_stage,
        "generic self-authored stage pass",
    )
    positive_count += 1
    negative_count += 1

    endpoint_duplicate_agent = copy.deepcopy(endpoint_enrollment_request)
    for component in endpoint_duplicate_agent["component_set"]["components"]:
        if component["role"] == "endpoint_monitor":
            component["role"] = "endpoint_agent"
            break
    reject(
        "sensor-enrollment-request.schema.json",
        endpoint_duplicate_agent,
        "Endpoint duplicate agent cannot replace its required monitor role",
    )
    negative_count += 1

    browser_health_omission = copy.deepcopy(browser_enrollment_response)
    browser_health_omission["enrollment_manifest"]["health_policy"][
        "required_components"
    ] = ["browser-extension"]
    accept(
        "sensor-enrollment-response.schema.json",
        browser_health_omission,
        "shape-only Browser health component omission",
    )
    try:
        validate_enrollment_response(browser_health_omission, browser_enrollment_request)
    except AssertionError:
        pass
    else:
        raise AssertionError(
            "installed-product semantic validator accepted a health policy that omits the native host"
        )
    negative_count += 1

    browser_native_wal_owner = copy.deepcopy(browser_source_product_path)
    browser_native_wal_owner["data_path"].update({
        "wal_owner_component_id": "browser-native-host",
        "wal_owner_component_kind": "browser_native_host",
    })
    reject(
        "source-product-path.schema.json",
        browser_native_wal_owner,
        "Browser native host claiming WAL ownership",
    )
    negative_count += 1

    incomplete_bypass_set = copy.deepcopy(browser_source_product_path)
    incomplete_bypass_set["prohibited_bypasses"].pop()
    reject(
        "source-product-path.schema.json",
        incomplete_bypass_set,
        "coherent source path omitting required bypass prohibition",
    )
    negative_count += 1

    unknown_bypass = copy.deepcopy(browser_source_product_path)
    unknown_bypass["prohibited_bypasses"][0] = "none"
    reject(
        "source-product-path.schema.json",
        unknown_bypass,
        "coherent source path with arbitrary bypass assertion",
    )
    negative_count += 1

    browser_reinstall = copy.deepcopy(browser_enrollment_request)
    browser_reinstall["request_id"] = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"
    browser_reinstall["bootstrap_id"] = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"
    browser_reinstall["idempotency_key_digest"] = (
        "sha256:9e4e9fb5ef1588e02fc773eec32403a769d2521eeabc6ab020c033ecfe4d213f"
    )
    browser_reinstall["intent"] = "reinstall"
    browser_reinstall["replaces"] = {
        "producer_id": browser_enrollment_response["producer_id"],
        "installation_id": browser_enrollment_response["installation_id"],
        "producer_epoch": browser_enrollment_response["producer_epoch"],
    }
    reinstall_proof_input = copy.deepcopy(browser_reinstall)
    reinstall_proof_input["installation_proof"].pop("request_digest")
    reinstall_proof_input["installation_proof"].pop("detached_jws")
    browser_reinstall["installation_proof"]["request_digest"] = canonical_sha256(
        reinstall_proof_input
    )
    validate_enrollment_request(browser_reinstall)
    positive_count += 1

    replay_response = copy.deepcopy(browser_enrollment_response)
    replay_response["status"] = "idempotent_replay"
    validate_enrollment_response(replay_response, browser_enrollment_request)
    positive_count += 1

    apply_manifest = browser_enrollment_response["enrollment_manifest"]
    current_manifest_state = {
        "producer_id": apply_manifest["producer_id"],
        "revision": 1,
        "producer_epoch": apply_manifest["producer_epoch"],
        "credential_subject": apply_manifest["credential_subject"],
        "credential_id": apply_manifest["credential_id"],
        "installation_key_thumbprint": apply_manifest[
            "installation_key_thumbprint"
        ],
        "source_profile": apply_manifest["source_profile"],
        "profile_version": browser_enrollment_response["profile_version"],
        "component_set_digest": apply_manifest["component_set_digest"],
        "artifact_digest": apply_manifest["artifact_digest"],
        "contract_digest": DIGEST,
    }
    validate_manifest_state(apply_manifest, None)

    rotate_manifest = manifest_operation(
        apply_manifest,
        "rotate",
        "ffffffff-ffff-4fff-8fff-ffffffffffff",
        2,
    )
    rotate_manifest.update(
        {
            "producer_epoch": apply_manifest["producer_epoch"],
            "credential_subject": apply_manifest["credential_subject"],
            "credential_id": "abababab-abab-4bab-8bab-abababababab",
            "installation_key_thumbprint": apply_manifest[
                "installation_key_thumbprint"
            ],
            "credential_expires_at": apply_manifest["credential_expires_at"],
            "reason_code": "scheduled_rotation",
        }
    )
    validate_manifest_state(rotate_manifest, current_manifest_state)
    positive_count += 1

    revoke_manifest = manifest_operation(
        apply_manifest,
        "revoke",
        "cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd",
        2,
    )
    revoke_manifest["reason_code"] = "installation_revoked"
    validate_manifest_state(revoke_manifest, current_manifest_state)
    positive_count += 1

    certify_manifest = manifest_operation(
        apply_manifest,
        "certify",
        "dededede-dede-4ded-8ded-dededededede",
        2,
    )
    certify_manifest["certification"] = {
        "certification_id": "efefefef-efef-4fef-8fef-efefefefefef",
        "source_profile": apply_manifest["source_profile"],
        "profile_version": "1.0.0",
        "component_set_digest": apply_manifest["component_set_digest"],
        "delivery_artifact_digest": apply_manifest["artifact_digest"],
        "artifact_digest": apply_manifest["artifact_digest"],
        "contract_digest": DIGEST,
        "profile_versions": {apply_manifest["source_profile"]: "1.0.0"},
        "test_pack_digest": DIGEST,
        "result": "passed",
        "certified_at": apply_manifest["issued_at"],
        "evidence_object_key": "certification/browser/test-pack.json",
    }
    validate_manifest_state(certify_manifest, current_manifest_state)
    positive_count += 1

    rotate_with_apply_state = copy.deepcopy(rotate_manifest)
    rotate_with_apply_state["bootstrap_id"] = apply_manifest["bootstrap_id"]
    reject(
        "producer-enrollment-manifest.schema.json",
        rotate_with_apply_state,
        "rotate manifest carrying stale apply fields",
    )
    negative_count += 1

    revoke_with_credential = copy.deepcopy(revoke_manifest)
    revoke_with_credential["credential_id"] = apply_manifest["credential_id"]
    reject(
        "producer-enrollment-manifest.schema.json",
        revoke_with_credential,
        "revoke manifest carrying stale credential fields",
    )
    negative_count += 1

    certify_with_reason = copy.deepcopy(certify_manifest)
    certify_with_reason["reason_code"] = "stale"
    reject(
        "producer-enrollment-manifest.schema.json",
        certify_with_reason,
        "certify manifest carrying revoke fields",
    )
    negative_count += 1

    apply_with_certification = copy.deepcopy(apply_manifest)
    apply_with_certification["certification"] = copy.deepcopy(
        certify_manifest["certification"]
    )
    reject(
        "producer-enrollment-manifest.schema.json",
        apply_with_certification,
        "apply manifest carrying certify payload",
    )
    negative_count += 1

    stale_rotation = copy.deepcopy(rotate_manifest)
    stale_rotation["revision"] = 1
    reject_manifest_state(stale_rotation, current_manifest_state, "stale revision")
    negative_count += 1

    cross_epoch_rotation = copy.deepcopy(rotate_manifest)
    cross_epoch_rotation["producer_epoch"] = UUID_3
    reject_manifest_state(
        cross_epoch_rotation, current_manifest_state, "cross-epoch rotation"
    )
    negative_count += 1

    wrong_key_rotation = copy.deepcopy(rotate_manifest)
    wrong_key_rotation["installation_key_thumbprint"] = "sha256:" + ("c" * 64)
    reject_manifest_state(
        wrong_key_rotation, current_manifest_state, "noncurrent installation key"
    )
    negative_count += 1

    stale_certification = copy.deepcopy(certify_manifest)
    stale_certification["certification"]["component_set_digest"] = "sha256:" + (
        "d" * 64
    )
    reject_manifest_state(
        stale_certification, current_manifest_state, "stale component-set certification"
    )
    negative_count += 1

    negative_fixtures = json.loads(
        (installed_product_fixtures / "negative-cases.json").read_text()
    )
    fixture_values = {
        "browser-enrollment-request.valid.json": browser_enrollment_request,
        "endpoint-enrollment-request.valid.json": endpoint_enrollment_request,
        "browser-enrollment-response.valid.json": browser_enrollment_response,
    }
    for case in negative_fixtures:
        mutated = apply_json_pointer_mutation(
            fixture_values[case["base_fixture"]], case["mutation"]
        )
        if case.get("recompute_enrollment_digests", False):
            mutated["component_set"]["component_set_digest"] = canonical_sha256(
                mutated["component_set"], {"component_set_digest"}
            )
            proof_input = copy.deepcopy(mutated)
            proof_input["installation_proof"].pop("request_digest")
            proof_input["installation_proof"].pop("detached_jws")
            mutated["installation_proof"]["request_digest"] = canonical_sha256(
                proof_input
            )
        if not case.get("semantic_only", False):
            reject(case["schema"], mutated, case["case_id"])
        else:
            accept(case["schema"], mutated, f"shape-only {case['case_id']}")
            try:
                if case["schema"] == "sensor-enrollment-request.schema.json":
                    validate_enrollment_request(mutated)
                else:
                    validate_enrollment_response(mutated, browser_enrollment_request)
            except AssertionError:
                pass
            else:
                raise AssertionError(
                    f"installed-product semantic validator accepted {case['case_id']}"
                )
        negative_count += 1

    final_fixtures = ROOT / "fixtures" / "final-delta-freeze"
    fixture_contracts = [
        ("trusted-oidc-issuer.schema.json", "trusted-oidc-issuer.valid.json"),
        ("runtime-session-record.schema.json", "runtime-session-record.valid.json"),
        ("manifest-signer-key.schema.json", "manifest-signer-key.valid.json"),
    ]
    loaded_final: dict[str, dict] = {}
    for schema_name, fixture_name in fixture_contracts:
        value = json.loads((final_fixtures / fixture_name).read_text())
        accept(schema_name, value, fixture_name)
        loaded_final[schema_name] = value
        positive_count += 1

    precedence_cases = json.loads(
        (final_fixtures / "source-temporal-precedence-cases.json").read_text()
    )
    if len(precedence_cases) != 25:
        raise AssertionError(f"expected 25 temporal precedence cases, got {len(precedence_cases)}")
    precedence_ids = [case["case_id"] for case in precedence_cases]
    if precedence_ids != [f"PRC-{index:03d}" for index in range(1, 26)]:
        raise AssertionError("temporal precedence cases must be unique, contiguous PRC-001..PRC-025")
    for case in precedence_cases:
        accept("source-temporal-precedence-case.schema.json", case, case["case_id"])
        positive_count += 1

    oidc = loaded_final["trusted-oidc-issuer.schema.json"]
    if oidc["jwks_hard_ttl_seconds"] < oidc["jwks_soft_ttl_seconds"]:
        raise AssertionError("OIDC hard JWKS TTL cannot be lower than soft TTL")
    session = loaded_final["runtime-session-record.schema.json"]
    if not (session["created_at"] <= session["last_seen_at"] < session["idle_expires_at"] <= session["absolute_expires_at"]):
        raise AssertionError("runtime session timestamps violate frozen ordering")
    for name, cases in PROFILE_CASES.items():
        for case in cases:
            accept(name, case, case["kind"])
            positive_count += 1

    insecure_issuer = copy.deepcopy(oidc)
    insecure_issuer["issuer_uri"] = "http://id.acme.example/"
    reject("trusted-oidc-issuer.schema.json", insecure_issuer, "non-HTTPS issuer")
    negative_count += 1

    hmac_issuer = copy.deepcopy(oidc)
    hmac_issuer["allowed_algorithms"] = ["HS256"]
    reject("trusted-oidc-issuer.schema.json", hmac_issuer, "symmetric OIDC algorithm")
    negative_count += 1

    raw_session = copy.deepcopy(session)
    raw_session["access_token"] = "must-not-be-stored"
    reject("runtime-session-record.schema.json", raw_session, "raw session credential")
    negative_count += 1

    reactivated_session = copy.deepcopy(session)
    reactivated_session["state"] = "revoked"
    reject("runtime-session-record.schema.json", reactivated_session, "terminal session without revocation time")
    negative_count += 1

    terminal_session = copy.deepcopy(session)
    terminal_session["state"] = "logged_out"
    terminal_session["revoked_at"] = "2026-08-01T12:02:00Z"
    terminal_session["revocation_reason"] = "logout"
    terminal_session["purge_after"] = "2026-08-02T12:02:00Z"
    accept("runtime-session-record.schema.json", terminal_session, "bounded terminal session tombstone")
    revoked_at = datetime.fromisoformat(terminal_session["revoked_at"].replace("Z", "+00:00"))
    purge_after = datetime.fromisoformat(terminal_session["purge_after"].replace("Z", "+00:00"))
    if not revoked_at < purge_after <= revoked_at + timedelta(days=7):
        raise AssertionError("terminal session purge deadline violates frozen retention bound")
    positive_count += 1

    unbounded_terminal_session = copy.deepcopy(terminal_session)
    unbounded_terminal_session["purge_after"] = "2026-08-09T12:02:01Z"
    accept("runtime-session-record.schema.json", unbounded_terminal_session, "shape-valid unbounded session tombstone")
    try:
        unbounded_purge = datetime.fromisoformat(
            unbounded_terminal_session["purge_after"].replace("Z", "+00:00")
        )
        if not revoked_at < unbounded_purge <= revoked_at + timedelta(days=7):
            raise AssertionError("terminal session purge deadline violates frozen retention bound")
    except AssertionError:
        negative_count += 1
    else:
        raise AssertionError("runtime session semantic validator accepted unbounded tombstone retention")

    inverted_session = copy.deepcopy(session)
    inverted_session["idle_expires_at"] = "2026-08-02T01:00:00Z"
    try:
        if not (inverted_session["created_at"] <= inverted_session["last_seen_at"] < inverted_session["idle_expires_at"] <= inverted_session["absolute_expires_at"]):
            raise AssertionError("runtime session timestamps violate frozen ordering")
    except AssertionError:
        negative_count += 1
    else:
        raise AssertionError("runtime session semantic validator accepted expiry beyond absolute bound")

    signer = loaded_final["manifest-signer-key.schema.json"]
    private_signer = copy.deepcopy(signer)
    private_signer["public_jwk"]["d"] = "private"
    reject("manifest-signer-key.schema.json", private_signer, "private JWK member")
    negative_count += 1

    mismatched_signer = copy.deepcopy(signer)
    mismatched_signer["algorithm"] = "EdDSA"
    reject("manifest-signer-key.schema.json", mismatched_signer, "algorithm and key-type mismatch")
    negative_count += 1

    backend_cases = [
        {"kind": "application_catalog", "operation": "observed", "source_id": "1", "status": "succeeded", "application_source_id": "a", "catalog_revision": "1"},
        {"kind": "application_configuration", "operation": "changed", "source_id": "2", "status": "succeeded", "application_source_id": "a", "config_version": "1"},
        {"kind": "browser_event", "operation": "accepted", "source_id": "3", "status": "succeeded", "qualified_client_record": QUALIFIED_BROWSER_RECORD, "installation_source_id": "i"},
        {"kind": "native_decision", "operation": "decided", "source_id": "4", "status": "blocked", "qualified_client_record": QUALIFIED_BROWSER_RECORD, "native_decision": "block", "execution_authority": "browser_backend"},
        {"kind": "action_outcome", "operation": "effect_observed", "source_id": "5", "status": "blocked", "qualified_client_record": QUALIFIED_BROWSER_RECORD, "effect": "prevented", "execution_authority": "browser_backend"},
        {"kind": "installation", "operation": "observed", "source_id": "6", "status": "succeeded", "installation_source_id": "i"},
        {"kind": "heartbeat", "operation": "observed", "source_id": "7", "status": "succeeded", "installation_source_id": "i"},
        {"kind": "publication_gap", "operation": "started", "source_id": "8", "status": "partial", "installation_source_id": "i", "reason_code": "publish_failed"},
        {"kind": "reconciliation_snapshot", "operation": "started", "source_id": "9", "status": "succeeded", "snapshot_id": "s", "scope_type": "application_catalog", "completeness": "full"},
    ]
    for case in backend_cases:
        accept("profile-browser-backend-v1.schema.json", case, case["kind"])
        positive_count += 1

    envelope = {
        "protocol": "starliner.edge.v1",
        "tenant_id": "tenant-1",
        "producer_id": UUID_1,
        "installation_id": "installation-1",
        "runtime_instance_id": "runtime-1",
        "producer_epoch": UUID_2,
        "sequence": 1,
        "record_id": UUID_3,
        "record_type": "object.observed",
        "profile": "endpoint",
        "profile_version": "1.0.0",
        "schema_ref": "endpoint/1.0.0",
        "occurred_at": NOW,
        "observed_at": NOW,
        "enqueued_at": NOW,
        "source_object": {"type": "device", "namespace": "endpoint", "id": "d"},
        "artifact": {"product": "endpoint", "version": "1.0.0", "digest": DIGEST},
        "certification_id": UUID_1,
        "record_origin": "live_sensor",
        "evidence_quality": "audit_grade",
        "privacy": {"policy_version": "1", "capture_state": "complete"},
        "idempotency_key": f"v1:{UUID_1}:{UUID_2}:1",
        "content_sha256": DIGEST,
    }
    batch = {"api_version": "starliner.ingest.v1", "batch_id": "batch-1", "records": [{"envelope": envelope, "payload": PROFILE_CASES["profile-endpoint-v1.schema.json"][0]}]}
    accept("delivery-batch.schema.json", batch, "minimal batch")
    positive_count += 1

    qualified_parent_batch = copy.deepcopy(batch)
    qualified_parent_batch["records"][0]["envelope"]["correlation"] = {
        "qualified_parent_record": QUALIFIED_BROWSER_RECORD,
    }
    accept(
        "delivery-batch.schema.json",
        qualified_parent_batch,
        "cross-producer qualified parent record",
    )
    positive_count += 1

    backend_relay_batch = copy.deepcopy(batch)
    backend_relay_envelope = backend_relay_batch["records"][0]["envelope"]
    backend_relay_envelope["profile"] = "browser_backend"
    backend_relay_envelope["schema_ref"] = "browser-backend/1.0.0"
    backend_relay_envelope["record_type"] = "source_processing.observed"
    backend_relay_envelope["source_object"] = {
        "type": "browser_backend_deployment",
        "namespace": "browser-backend",
        "id": "backend-1",
    }
    backend_relay_batch["records"][0]["payload"] = copy.deepcopy(backend_cases[2])
    accept(
        "delivery-batch.schema.json",
        backend_relay_batch,
        "Browser Backend relay with one canonical payload parent",
    )
    positive_count += 1
    for backend_stage in ("transformed", "published"):
        backend_stage_batch = copy.deepcopy(backend_relay_batch)
        backend_stage_batch["records"][0]["payload"]["operation"] = backend_stage
        accept(
            "profile-browser-backend-v1.schema.json",
            backend_stage_batch["records"][0]["payload"],
            f"Browser Backend {backend_stage} payload",
        )
        accept(
            "delivery-batch.schema.json",
            backend_stage_batch,
            f"Browser Backend {backend_stage} lineage stage",
        )
        positive_count += 2

    duplicate_backend_parent = copy.deepcopy(backend_relay_batch)
    duplicate_backend_parent["records"][0]["envelope"]["correlation"] = {
        "qualified_parent_record": copy.deepcopy(QUALIFIED_BROWSER_RECORD),
    }
    reject(
        "delivery-batch.schema.json",
        duplicate_backend_parent,
        "Browser Backend relay with duplicate equal parent carrier",
    )
    negative_count += 1

    mismatched_backend_parent = copy.deepcopy(duplicate_backend_parent)
    mismatched_backend_parent["records"][0]["envelope"]["correlation"][
        "qualified_parent_record"
    ]["content_sha256"] = "sha256:" + ("b" * 64)
    reject(
        "delivery-batch.schema.json",
        mismatched_backend_parent,
        "Browser Backend relay with divergent parent carriers",
    )
    negative_count += 1

    double_counted_backend_relay = copy.deepcopy(backend_relay_batch)
    double_counted_backend_relay["records"][0]["envelope"][
        "record_type"
    ] = "activity.observed"
    reject(
        "delivery-batch.schema.json",
        double_counted_backend_relay,
        "Browser Backend processing stage mislabeled as customer activity",
    )
    negative_count += 1

    normalization_rules = yaml.safe_load(
        (ROOT / "ontology" / "source-normalization.yaml").read_text()
    )["profiles"]["browser_backend"]
    if normalization_rules["mappings"].get("source_processing") != [
        "lineage_only_observation"
    ]:
        raise AssertionError("Browser Backend processing must normalize lineage-only")
    if "activity" in normalization_rules["mappings"]:
        raise AssertionError(
            "Browser Backend relay stages cannot use the customer activity mapping"
        )
    processing_rule = normalization_rules["source_processing_mapping"][
        "browser_event"
    ]
    if processing_rule.get("lineage_carrier") != "payload.qualified_client_record":
        raise AssertionError("Browser Backend has no single canonical relay parent")
    if "activity_candidates MUST be empty" not in processing_rule.get(
        "output_rule", ""
    ):
        raise AssertionError("Browser Backend relay mapping lacks no-double-count rule")

    configuration = {
        "api_version": "starliner.management.v1",
        "generation": 1,
        "issued_at": NOW,
        "expires_at": LATER,
        "tenant_id": UUID_2,
        "producer_id": UUID_1,
        "installation_id": UUID_2,
        "producer_epoch": UUID_3,
        "component_set_digest": DIGEST,
        "workload_identity": {
            "credential_id": UUID_1,
            "subject": "urn:quilr:producer:" + UUID_1,
            "confirmation_thumbprint": DIGEST,
            "scopes": ["starliner.ingest", "starliner.credential.renew"],
            "issued_at": NOW,
            "renew_after": "2026-07-29T12:05:00Z",
            "expires_at": "2026-07-29T12:10:00Z",
            "renewal_url": "https://control.example.com/starliner/control/v1/producers/" + UUID_1 + "/credentials:renew",
        },
        "ingest": {
            "url": "https://ingest.example.com/v1",
            "max_batch_records": 500,
            "max_compressed_bytes": 4194304,
            "max_decompressed_bytes": 8388608,
            "max_record_bytes": 262144,
            "compressions": ["zstd"],
            "retry": {"initial_ms": 100, "maximum_ms": 1000, "multiplier": 2, "full_jitter": True},
        },
        "profiles": [{"profile": "endpoint", "profile_version": "1.0.0", "schema_ref": "endpoint/1.0.0", "schema_sha256": DIGEST, "capabilities": ["inventory"]}],
        "privacy": {"policy_version": "1", "policy_sha256": DIGEST, "policy_ref": "privacy/1"},
        "trust": {"certification_id": UUID_1, "artifact_digest": DIGEST, "contract_digest": DIGEST},
        "health_policy": HEALTH_POLICY,
        "signature": SIGNATURE,
    }
    accept("edge-configuration.schema.json", configuration, "minimal configuration")
    positive_count += 1

    configuration_without_health_policy = copy.deepcopy(configuration)
    del configuration_without_health_policy["health_policy"]
    reject(
        "edge-configuration.schema.json",
        configuration_without_health_policy,
        "edge configuration without a signed health policy",
    )
    negative_count += 1

    configuration_unknown_health_field = copy.deepcopy(configuration)
    configuration_unknown_health_field["health_policy"]["offline_grace_seconds"] = 60
    reject(
        "edge-configuration.schema.json",
        configuration_unknown_health_field,
        "edge health policy with an unfrozen timing field",
    )
    negative_count += 1

    gate_evidence = {
        "schema_version": "die-gate-evidence/1.0.0",
        "evidence_id": UUID_3,
        "gate_id": "LG-001",
        "test_id": "LG001-T001",
        "result": "PASS",
        "started_at": NOW,
        "finished_at": LATER,
        "candidate": {
            "repository_commit": "a" * 40,
            "repository_tree": "b" * 40,
            "contract_digest": DIGEST,
            "artifact_digests": {"postgres": DIGEST},
        },
        "environment": {
            "environment_id": "ci-postgresql-17",
            "kind": "release_qualification",
            "os": "linux",
            "architecture": "amd64",
            "component_versions": {"postgresql": "17.10"},
            "configuration_digest": DIGEST,
            "fixture_digest": DIGEST,
        },
        "commands": [{"argv": ["run-lg001"], "exit_code": 0}],
        "assertions": [
            {
                "assertion_id": "LG001.BASELINE",
                "result": "PASS",
                "message": "baseline applied",
            }
        ],
        "artifacts": [
            {
                "kind": "report",
                "relative_path": "reports/lg001.json",
                "sha256": "a" * 64,
                "contains_customer_data": False,
            }
        ],
        "limitations": [],
    }
    accept(
        "gate-evidence-package.schema.json",
        gate_evidence,
        "release-bound gate evidence",
    )
    positive_count += 1

    absolute_gate_artifact = copy.deepcopy(gate_evidence)
    absolute_gate_artifact["artifacts"][0]["relative_path"] = "/tmp/lg001.json"
    reject(
        "gate-evidence-package.schema.json",
        absolute_gate_artifact,
        "absolute gate artifact path",
    )
    negative_count += 1

    unsafe_gate_commit = copy.deepcopy(gate_evidence)
    unsafe_gate_commit["candidate"]["repository_commit"] = "main"
    reject(
        "gate-evidence-package.schema.json",
        unsafe_gate_commit,
        "mutable gate candidate",
    )
    negative_count += 1

    legacy_configuration_signature = copy.deepcopy(configuration)
    legacy_configuration_signature["signature"] = {
        "protected": "e30",
        "signature": "c2ln",
    }
    reject(
        "edge-configuration.schema.json",
        legacy_configuration_signature,
        "configuration using a second detached-JWS representation",
    )
    negative_count += 1

    receipt = {
        "api_version": "starliner.ingest.v1",
        "batch_id": "batch-1",
        "ingest_request_id": UUID_1,
        "received_at": NOW,
        "results": [{"index": 0, "record_id": UUID_3, "status": "accepted", "evidence_id": UUID_2, "producer_epoch": UUID_1, "sequence": 1}],
    }
    accept("ingest-receipt.schema.json", receipt, "accepted receipt")
    positive_count += 1

    normalized = {
        "normalization_run_id": UUID_3,
        "output_key": "device:endpoint:d",
        "observation_id": UUID_1,
        "tenant_id": UUID_1,
        "producer_id": UUID_2,
        "evidence_id": UUID_3,
        "normalizer": {"profile": "endpoint", "profile_version": "1.0.0", "name": "endpoint", "version": "1.0.0", "artifact_digest": DIGEST},
        "source_object": {"type": "device", "namespace": "endpoint", "id": "d", "lifecycle": "active"},
        "observed_at": NOW,
        "normalized_at": NOW,
        "output_digest": DIGEST,
        "claims": [],
        "relationship_candidates": [],
        "activity_candidates": [],
        "coverage_candidates": [],
        "reconciliation_candidates": [],
        "health_observations": [],
    }
    accept("normalized-observation.schema.json", normalized, "minimal normalized observation")
    positive_count += 1

    endpoint_health = copy.deepcopy(normalized)
    endpoint_health["health_observations"] = [{
        "observation_key": "endpoint_proxy",
        "component": "proxy",
        "state": "unhealthy",
        "source_native_state": "Critical",
        "source_native_metric": "proxy_health_state",
        "observed_at": NOW,
        "queue_depth": 12,
        "snapshot_watermark": "w-1",
    }]
    accept(
        "normalized-observation.schema.json",
        endpoint_health,
        "endpoint native Critical normalized to unhealthy with the native token retained",
    )
    positive_count += 1

    backend_health = copy.deepcopy(normalized)
    backend_health["health_observations"] = [
        {
            "observation_key": "relay",
            "component": "relay",
            "state": "degraded",
            "source_native_state": "partial",
            "observed_at": NOW,
            "queue_depth": 4,
        },
        {
            "observation_key": "downstream_delivery",
            "component": "downstream_delivery",
            "state": "degraded",
            "source_native_state": "kafka",
            "observed_at": NOW,
        },
    ]
    accept(
        "normalized-observation.schema.json",
        backend_health,
        "browser backend heartbeat status mapped to relay and downstream delivery components",
    )
    positive_count += 1

    aggregate_health = copy.deepcopy(normalized)
    aggregate_health["health_observations"] = [{
        "observation_key": "producer",
        "component": "producer",
        "state": "healthy",
        "source_native_state": "healthy",
        "observed_at": NOW,
    }]
    reject(
        "normalized-observation.schema.json",
        aggregate_health,
        "normalizer asserting an aggregate producer component",
    )
    negative_count += 1

    untyped_health = copy.deepcopy(normalized)
    untyped_health["health_observations"] = [{
        "observation_key": "endpoint_proxy",
        "component": "proxy",
        "state": "critical",
        "source_native_state": "Critical",
        "observed_at": NOW,
    }]
    reject(
        "normalized-observation.schema.json",
        untyped_health,
        "component health widening the closed state vocabulary",
    )
    negative_count += 1

    unprovenanced_health = copy.deepcopy(normalized)
    unprovenanced_health["health_observations"] = [{
        "observation_key": "endpoint_proxy",
        "component": "proxy",
        "state": "unhealthy",
        "observed_at": NOW,
    }]
    reject(
        "normalized-observation.schema.json",
        unprovenanced_health,
        "component health dropping the pre-normalization native token",
    )
    negative_count += 1

    normalization_outputs = [{
        "output_key": normalized["output_key"],
        "observation_id": normalized["observation_id"],
        "output_digest": normalized["output_digest"],
    }]
    normalization_bundle = {
        "normalization_run_id": normalized["normalization_run_id"],
        "tenant_id": normalized["tenant_id"],
        "evidence_id": normalized["evidence_id"],
        "producer_id": normalized["producer_id"],
        "source_profile": normalized["normalizer"]["profile"],
        "profile_version": normalized["normalizer"]["profile_version"],
        "normalizer": {
            "name": normalized["normalizer"]["name"],
            "version": normalized["normalizer"]["version"],
            "artifact_digest": normalized["normalizer"]["artifact_digest"],
        },
        "output_count": 1,
        "output_refs": normalization_outputs,
        "bundle_digest": normalization_bundle_digest(normalization_outputs),
        "normalized_at": normalized["normalized_at"],
    }
    validate_normalization_bundle(normalization_bundle)
    positive_count += 1

    cross_sensor_normalized = copy.deepcopy(normalized)
    cross_sensor_normalized["observation_id"] = UUID_2
    cross_sensor_normalized["output_key"] = "relationship:browser-installation:endpoint-device"
    cross_sensor_normalized["relationship_candidates"] = [{
        "candidate_id": UUID_3,
        "subject": {"producer_id": UUID_1, "profile": "browser", "type": "browser_installation", "namespace": "browser", "id": "i"},
        "predicate": "installed_on",
        "object": {"producer_id": UUID_2, "profile": "endpoint", "type": "device", "namespace": "endpoint-agent", "id": "d"},
        "semantic": "structural",
        "confidence": 1,
        "valid_from": NOW,
        "state": "active",
    }]
    accept("normalized-observation.schema.json", cross_sensor_normalized, "qualified cross-sensor relationship")
    positive_count += 1

    scoped_relationship = copy.deepcopy(cross_sensor_normalized)
    scoped_relationship["observation_id"] = UUID_3
    scoped_relationship["output_key"] = "relationship:mcp-server:tool:authorization-context"
    scoped_relationship["relationship_candidates"][0]["scope"] = {
        "kind": "authorization_context",
        "key": DIGEST,
    }
    accept("normalized-observation.schema.json", scoped_relationship, "authorization-scoped relationship")
    positive_count += 1

    typed_claims = copy.deepcopy(normalized)
    typed_claims["observation_id"] = UUID_2
    typed_claims["output_key"] = "device:endpoint:d:typed-claims"
    typed_claims["claims"] = [
        {
            "claim_id": UUID_1,
            "claim_key": "integer",
            "kind": "attribute",
            "path": "metrics.integer",
            "value": 1,
            "value_type": "integer",
            "normalized_value": "1",
            "normalized_value_type": "string",
            "authority_class": "source_native",
            "confidence": 1,
            "valid_from": NOW,
            "sensitivity": "internal",
        },
        {
            "claim_id": UUID_2,
            "claim_key": "number",
            "kind": "attribute",
            "path": "metrics.number",
            "value": 1.5,
            "value_type": "number",
            "authority_class": "source_native",
            "confidence": 1,
            "valid_from": NOW,
            "sensitivity": "internal",
        },
    ]
    accept("normalized-observation.schema.json", typed_claims, "wire-safe typed and normalized claims")
    positive_count += 1

    manifest = {
        "manifest_version": "starliner.producer-enrollment.v1",
        "manifest_id": UUID_1,
        "operation": "apply",
        "tenant_id": UUID_3,
        "producer_id": UUID_2,
        "revision": 1,
        "issued_at": NOW,
        "expires_at": LATER,
        "issuer": "quilr-control",
        "bootstrap_id": UUID_2,
        "enrollment_intent": "enroll",
        "installation_id": UUID_1,
        "producer_epoch": UUID_3,
        "source_profile": "endpoint",
        "business_scope_id": UUID_3,
        "environment": "production",
        "display_name": "Endpoint",
        "credential_subject": "spiffe://quilr/endpoint/1",
        "credential_id": UUID_1,
        "installation_key_thumbprint": DIGEST,
        "credential_expires_at": "2026-07-29T12:10:00Z",
        "artifact_digest": DIGEST,
        "component_set_digest": DIGEST,
        "capabilities": [{"capability": "inventory", "mode": "observe", "profile_version": "1.0.0", "effective_from": NOW}],
        "health_policy": HEALTH_POLICY,
        "expected_populations": [{
            "population_id": UUID_1,
            "capability": "inventory",
            "population_type": "producer",
            "source_namespace": "die_control.producer",
            "source_population_id": "endpoint-1:inventory",
            "expected_count": 1,
            "authority_type": "producer_enrollment",
            "authority_ref": "enrollment-1",
            "valid_from": NOW,
        }],
        "signature": SIGNATURE,
    }
    accept("producer-enrollment-manifest.schema.json", manifest, "apply manifest")
    positive_count += 1

    connector_profile = "connector.copilot_studio"

    connector_batch = copy.deepcopy(batch)
    connector_batch["records"][0]["envelope"]["profile"] = connector_profile
    connector_batch["records"][0]["envelope"]["record_origin"] = "managed_connector"
    accept(
        "delivery-batch.schema.json",
        connector_batch,
        "registered-profile-shaped managed connector delivery",
    )
    positive_count += 1

    connector_normalized = copy.deepcopy(normalized)
    connector_normalized["output_key"] = "agent:copilot-studio:agent-1"
    connector_normalized["normalizer"]["profile"] = connector_profile
    connector_normalized["normalizer"]["name"] = connector_profile
    connector_normalized["source_object"]["namespace"] = connector_profile
    accept(
        "normalized-observation.schema.json",
        connector_normalized,
        "registered-profile-shaped connector normalization",
    )
    positive_count += 1

    connector_bundle = copy.deepcopy(normalization_bundle)
    connector_bundle["source_profile"] = connector_profile
    validate_normalization_bundle(connector_bundle)
    positive_count += 1

    connector_manifest = copy.deepcopy(manifest)
    connector_manifest["source_profile"] = connector_profile
    connector_manifest["display_name"] = "Copilot Studio Connector"
    connector_manifest["expected_populations"][0][
        "population_type"
    ] = "integration_instance"
    accept(
        "producer-enrollment-manifest.schema.json",
        connector_manifest,
        "registered-profile-shaped connector enrollment",
    )
    positive_count += 1

    tenant_bootstrap = {
        "manifest_version": "starliner.tenant-bootstrap.v1",
        "manifest_id": UUID_1,
        "tenant_id": "tenant-1",
        "root_scope_id": UUID_2,
        "display_name": "Tenant 1",
        "revision": 1,
        "issued_at": NOW,
        "expires_at": LATER,
        "issuer": "quilr-control",
        "signature": SIGNATURE,
    }
    accept("tenant-bootstrap-manifest.schema.json", tenant_bootstrap, "tenant root bootstrap")
    positive_count += 1

    outbox_pointer = {
        "tenant_id": "tenant-1",
        "outbox_id": 1,
        "aggregate_type": "entity",
        "aggregate_id": UUID_1,
        "aggregate_version": 1,
        "change_type": "created",
        "partition_key": "entity:" + UUID_1,
        "payload_version": "die.outbox.pointer.v1",
        "aggregate_digest": DIGEST,
        "causation": {"execution_id": UUID_2},
        "payload": {"entity_type": "device"},
        "created_at": NOW,
    }
    accept("canonical-change-pointer.schema.json", outbox_pointer, "canonical outbox pointer")
    positive_count += 1

    evidence_pointer = copy.deepcopy(outbox_pointer)
    evidence_pointer["aggregate_type"] = "evidence"
    evidence_pointer["aggregate_id"] = UUID_2
    evidence_pointer["change_type"] = "evidence_disposition_changed"
    evidence_pointer["partition_key"] = "evidence:" + UUID_2
    evidence_pointer["causation"] = {"evidence_id": UUID_2}
    evidence_pointer["payload"] = {"disposition_state": "active"}
    accept("canonical-change-pointer.schema.json", evidence_pointer, "evidence disposition outbox pointer")
    positive_count += 1

    invalid_cases = [
        ("profile-browser-v1.schema.json", {"kind": "browser.application", "application_id": "a", "origin": "https://example.com/private/path", "display_name": "Example", "lifecycle": "observed"}, "browser origin with path"),
        ("profile-browser-v1.schema.json", {"kind": "browser.local_binding", "assertion_id": UUID_1, "issuer_producer_id": UUID_2, "issuer_installation_id": "endpoint-i", "browser_installation_source_id": "browser-i", "device_ref": {"producer_id": UUID_2, "namespace": "endpoint-agent", "object_type": "device", "object_id": "d"}, "issued_at": NOW, "expires_at": LATER, "nonce": "0123456789abcdef", "assurance": "signed_local_runtime"}, "local binding without signature"),
        ("profile-endpoint-v1.schema.json", {"kind": "endpoint.entity", "entity_type": "agent_deployment", "source_id": "ad", "device_source_id": "d", "installation_scope_id": "desktop", "deployment_locality": "local", "lifecycle": "observed"}, "local agent deployment without definition"),
        ("profile-endpoint-v1.schema.json", {"kind": "endpoint.entity", "entity_type": "mcp_server_deployment", "source_id": "msd", "mcp_locality": "local", "transport": "stdio", "lifecycle": "observed"}, "endpoint MCP deployment without parent and configuration scope"),
        ("profile-endpoint-v1.schema.json", {"kind": "endpoint.native_decision", "decision_id": "n", "decision": "allow", "effect": "forwarded"}, "decision/effect conflation"),
        ("profile-endpoint-v1.schema.json", {"kind": "endpoint.relationship", "subject_type": "agent_deployment", "subject_id": "a", "predicate": "runs_as", "object_type": "local_user", "object_id": "u", "semantic": "configured", "operation": "upsert"}, "endpoint observed execution identity promoted to configured runs_as"),
        ("profile-llm-gateway-v1.schema.json", {"kind": "llm.native_decision", "decision_id": "n", "invocation_id": "i", "decision": "allow", "effect": "provider_called"}, "LLM decision/effect conflation"),
        ("profile-llm-gateway-v1.schema.json", {"kind": "llm.relationship", "subject_type": "client_application", "subject_id": "a", "predicate": "configured_to_use", "object_type": "model_product", "object_id": "m", "semantic": "configured", "operation": "upsert"}, "LLM observed call promoted to configured model use"),
        ("profile-llm-gateway-v1.schema.json", {"kind": "llm.invocation", "invocation_id": "i", "stage": "accepted", "model_source_id": "m", "status": "succeeded", "cross_sensor_attribution": {key: value for key, value in ATTRIBUTION.items() if key != "signature"}}, "LLM attribution without signature"),
        ("profile-llm-gateway-v1.schema.json", {"kind": "llm.invocation", "invocation_id": "i", "stage": "accepted", "model_source_id": "m", "status": "succeeded", "cross_sensor_attribution": {key: value for key, value in ATTRIBUTION.items() if key != "nonce"}}, "LLM attribution without replay nonce"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.native_decision", "decision_id": "n", "call_id": "c", "decision": "allow", "effect": "invoked"}, "MCP decision/effect conflation"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.relationship", "subject_type": "agent_deployment", "subject_id": "a", "predicate": "allows", "object_type": "tool", "object_id": "t", "semantic": "configured", "operation": "upsert"}, "MCP observed invocation promoted to can-invoke configuration"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.relationship", "subject_type": "server_deployment", "subject_id": "s", "predicate": "exposes", "object_type": "tool", "object_id": "t", "semantic": "structural", "operation": "upsert"}, "MCP exposes relationship without capability scope"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.relationship", "subject_type": "server_deployment", "subject_id": "s", "predicate": "exposes", "object_type": "tool", "object_id": "t", "semantic": "structural", "operation": "upsert", "capability_scope": "authorization_context"}, "MCP authorization-scoped capability without pseudonymous scope keys"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.relationship", "subject_type": "server_deployment", "subject_id": "s", "predicate": "exposes", "object_type": "tool", "object_id": "t", "semantic": "structural", "operation": "upsert", "capability_scope": "authorization_context", "authorization_context_token": "not-a-token", "endpoint_configuration_token": "hmac-sha256:" + ("c" * 64)}, "MCP authorization scope with unsafe token shape"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.operation", "operation_id": "o", "activity_type": "resource_read", "server_source_id": "s", "status": "succeeded"}, "resource operation without resource"),
        ("profile-mcp-gateway-v1.schema.json", {"kind": "mcp.entity", "entity_type": "agent_deployment", "source_id": "ad", "deployment_locality": "gateway", "lifecycle": "observed"}, "MCP agent deployment without definition"),
        ("profile-browser-backend-v1.schema.json", {"kind": "browser_event", "operation": "page", "source_id": "1", "status": "succeeded", "qualified_client_record": QUALIFIED_BROWSER_RECORD, "installation_source_id": "i"}, "backend operation mismatch"),
        ("profile-browser-backend-v1.schema.json", {"kind": "browser_event", "operation": "accepted", "source_id": "1", "status": "succeeded", "client_record_id": "c", "installation_source_id": "i"}, "backend relay with unqualified client record"),
        ("profile-browser-backend-v1.schema.json", {"kind": "browser_event", "operation": "accepted", "source_id": "1", "status": "succeeded", "qualified_client_record": QUALIFIED_BROWSER_RECORD, "installation_source_id": "i", "email": "fabricated@example.com"}, "backend relay carrying client observation fields"),
        ("profile-browser-backend-v1.schema.json", {"kind": "native_decision", "operation": "decided", "source_id": "1", "status": "blocked", "client_record_id": "c", "native_decision": "block"}, "backend decision with unqualified client record"),
        ("profile-browser-backend-v1.schema.json", {"kind": "native_decision", "operation": "decided", "source_id": "1", "status": "blocked", "qualified_client_record": QUALIFIED_BROWSER_RECORD, "native_decision": "block"}, "backend decision without backend execution authority"),
    ]
    for name, value, label in invalid_cases:
        reject(name, value, label)
        negative_count += 1

    prohibited = copy.deepcopy(batch)
    prohibited["records"][0]["envelope"]["privacy"]["capture_state"] = "prohibited"
    reject("delivery-batch.schema.json", prohibited, "prohibited fact admitted to WAL/delivery")
    negative_count += 1

    unsafe_sequence = copy.deepcopy(batch)
    unsafe_sequence["records"][0]["envelope"]["sequence"] = 9007199254740992
    reject("delivery-batch.schema.json", unsafe_sequence, "sequence beyond cross-language safe integer")
    negative_count += 1

    non_uuid7_record = copy.deepcopy(batch)
    non_uuid7_record["records"][0]["envelope"]["record_id"] = UUID_1
    reject(
        "delivery-batch.schema.json",
        non_uuid7_record,
        "non-UUIDv7 durable record identity",
    )
    negative_count += 1

    malformed_record_idempotency = copy.deepcopy(batch)
    malformed_record_idempotency["records"][0]["envelope"][
        "idempotency_key"
    ] = "record-1"
    reject(
        "delivery-batch.schema.json",
        malformed_record_idempotency,
        "record idempotency key without producer/epoch/sequence shape",
    )
    negative_count += 1

    unsafe_extension_number = copy.deepcopy(batch)
    unsafe_extension_number["records"][0]["envelope"]["extensions"] = {
        "quilr.test.metric": 1e100
    }
    reject("delivery-batch.schema.json", unsafe_extension_number, "extension number beyond wire-safe range")
    negative_count += 1

    missing_receipt_evidence = copy.deepcopy(receipt)
    del missing_receipt_evidence["results"][0]["evidence_id"]
    reject("ingest-receipt.schema.json", missing_receipt_evidence, "accepted receipt without evidence")
    negative_count += 1

    missing_scope = copy.deepcopy(manifest)
    del missing_scope["business_scope_id"]
    reject("producer-enrollment-manifest.schema.json", missing_scope, "apply manifest without business scope")
    negative_count += 1

    invalid_profile_name = copy.deepcopy(manifest)
    invalid_profile_name["source_profile"] = "Unregistered Profile"
    reject(
        "producer-enrollment-manifest.schema.json",
        invalid_profile_name,
        "invalid source-profile identifier shape",
    )
    negative_count += 1

    missing_health_policy = copy.deepcopy(manifest)
    del missing_health_policy["health_policy"]
    reject(
        "producer-enrollment-manifest.schema.json",
        missing_health_policy,
        "apply manifest without a signed health policy",
    )
    negative_count += 1

    empty_required_components = copy.deepcopy(manifest)
    empty_required_components["health_policy"]["required_components"] = []
    reject(
        "producer-enrollment-manifest.schema.json",
        empty_required_components,
        "health policy aggregating no required component",
    )
    negative_count += 1

    unfrozen_health_timing = copy.deepcopy(manifest)
    unfrozen_health_timing["health_policy"]["unhealthy_after_seconds"] = 600
    reject(
        "producer-enrollment-manifest.schema.json",
        unfrozen_health_timing,
        "health policy carrying an unfrozen timing constant",
    )
    negative_count += 1

    invalid_bootstrap_revision = copy.deepcopy(tenant_bootstrap)
    invalid_bootstrap_revision["revision"] = 2
    reject("tenant-bootstrap-manifest.schema.json", invalid_bootstrap_revision, "tenant bootstrap replay revision")
    negative_count += 1

    uncaused_outbox_pointer = copy.deepcopy(outbox_pointer)
    uncaused_outbox_pointer["causation"] = {}
    reject("canonical-change-pointer.schema.json", uncaused_outbox_pointer, "outbox pointer without causation")
    negative_count += 1

    unsafe_outbox_version = copy.deepcopy(outbox_pointer)
    unsafe_outbox_version["aggregate_version"] = 9007199254740992
    reject("canonical-change-pointer.schema.json", unsafe_outbox_version, "unsafe outbox aggregate version")
    negative_count += 1

    mismatched_outbox_change = copy.deepcopy(outbox_pointer)
    mismatched_outbox_change["change_type"] = "coverage_changed"
    reject("canonical-change-pointer.schema.json", mismatched_outbox_change, "outbox change incompatible with aggregate")
    negative_count += 1

    invalid_reconciliation = copy.deepcopy(normalized)
    invalid_reconciliation["reconciliation_candidates"] = [{
        "candidate_id": UUID_1,
        "run_id": UUID_2,
        "snapshot_id": "s",
        "stage": "page",
        "scope_type": "devices",
        "completeness": "full",
        "page_sequence": 0,
        "members": [],
    }]
    reject("normalized-observation.schema.json", invalid_reconciliation, "page without computed digest")
    negative_count += 1

    incomplete_normalization_bundle = copy.deepcopy(normalization_bundle)
    incomplete_normalization_bundle["output_count"] = 2
    try:
        validate_normalization_bundle(incomplete_normalization_bundle)
    except AssertionError:
        negative_count += 1
    else:
        raise AssertionError("normalization bundle accepted mismatched output_count")

    corrupt_normalization_bundle = copy.deepcopy(normalization_bundle)
    corrupt_normalization_bundle["bundle_digest"] = "sha256:" + ("b" * 64)
    try:
        validate_normalization_bundle(corrupt_normalization_bundle)
    except AssertionError:
        negative_count += 1
    else:
        raise AssertionError("normalization bundle accepted corrupt digest")

    unqualified_relationship = copy.deepcopy(cross_sensor_normalized)
    del unqualified_relationship["relationship_candidates"][0]["object"]["producer_id"]
    reject("normalized-observation.schema.json", unqualified_relationship, "cross-sensor relationship without object producer")
    negative_count += 1

    raw_relationship_scope = copy.deepcopy(scoped_relationship)
    raw_relationship_scope["relationship_candidates"][0]["scope"]["key"] = "raw-auth-context"
    reject("normalized-observation.schema.json", raw_relationship_scope, "relationship scope containing a raw source key")
    negative_count += 1

    coverage_without_population = copy.deepcopy(normalized)
    coverage_without_population["coverage_candidates"] = [{
        "candidate_id": UUID_1,
        "capability": "inventory",
        "state": "covered",
        "valid_from": NOW,
    }]
    reject("normalized-observation.schema.json", coverage_without_population, "coverage without exact expected population")
    negative_count += 1

    untyped_normalized_value = copy.deepcopy(typed_claims)
    del untyped_normalized_value["claims"][0]["normalized_value_type"]
    reject("normalized-observation.schema.json", untyped_normalized_value, "normalized claim value without its own type")
    negative_count += 1

    integer_masquerading_as_number = copy.deepcopy(typed_claims)
    integer_masquerading_as_number["claims"][1]["value"] = 2
    reject("normalized-observation.schema.json", integer_masquerading_as_number, "integer encoded as number claim")
    negative_count += 1

    execution_status = {
        "capability_id": "PC-001",
        "implementation_state": "ACTIVE",
        "integration_state": "PARTIAL_PATH",
        "evidence_state": "TEST_VERIFIED",
        "release_state": "INTERNAL_ONLY",
        "runtime_mode": "UNIT_HARNESS",
        "highest_proven_stage": "NONE",
        "development_blocked": False,
        "blocker_class": "NONE",
        "blocked_on": "NONE",
        "blocked_action": "NONE",
        "blocker_evidence": "NONE",
        "blocker_owner": "NONE",
        "unblock_condition": "NONE",
        "blocker_recheck_at": "NONE",
        "independent_next_action": "NONE",
        "authority_commit": "a" * 40,
        "last_verified_sha": "b" * 40,
        "runtime_manifest": "NONE",
        "runtime_manifest_digest": "NONE",
        "next_product_action": "Replace preview enrollment with the production control path",
        "limitations": ["Control path is not integrated"],
    }
    accept("execution-status.schema.json", execution_status, "active product capability")
    positive_count += 1

    valid_external_blocker = copy.deepcopy(execution_status)
    valid_external_blocker.update({
        "development_blocked": True,
        "blocker_class": "EXTERNAL_CREDENTIAL",
        "blocked_on": "provider test account",
        "blocked_action": "execute the provider-specific object-lock race",
        "blocker_evidence": "evidence/blockers/provider-account-unavailable.json",
        "blocker_owner": "platform-infrastructure",
        "unblock_condition": "isolated provider account and scoped credentials are issued",
        "blocker_recheck_at": "2026-08-05T12:00:00Z",
        "independent_next_action": "complete the deterministic object-port failure harness",
    })
    accept("execution-status.schema.json", valid_external_blocker, "bounded external blocker with continuing work")
    positive_count += 1

    endpoint_registry_entries = [{
        "profile": "endpoint",
        "profile_version": "1.0.0",
        "component_role": "endpoint",
        "schema_digest": "sha256:fb686ed047e38ca311cb6fcc724b63b4bf8857f648a438b310dc0403734372d6",
    }]
    endpoint_runtime_component_ids = [
        "endpoint-agent",
        "endpoint-monitor",
        "endpoint-proxy",
        "endpoint-ipc-broker",
        "endpoint-template-engine",
        "endpoint-system-extension",
    ]
    endpoint_runtime_components = [
        {
            "component_id": component_id,
            "repository": "quilrbusiness/sentinel-endpoint-agent",
            "branch": "feat/die-endpoint",
            "commit_sha": "b" * 40,
            "artifact_digest": "sha256:" + ("f" * 64),
            "contract_digest": DIGEST,
            "role": "endpoint",
            "clean_tree": True,
            "provenance": "exact_source_build",
            "build_ref": f"evidence/build/{component_id}.json",
            "installation_class": "package",
            "install_artifact_digest": "sha256:" + ("f" * 64),
            "installed_artifact_digest": "sha256:" + ("f" * 64),
            "installed_path_ref": f"evidence/install/{component_id}-path.json",
            "supervisor": "launchd",
            "service_unit": f"com.quilr.{component_id}",
            "runtime_identity": f"com.quilr.{component_id}",
            "normal_entrypoint": f"evidence/install/{component_id}-entrypoint.json",
            "effective_configuration_digest": DIGEST,
            "installation_evidence_ref": f"evidence/install/{component_id}.json",
        }
        for component_id in endpoint_runtime_component_ids
    ]
    coherent_runtime = {
        "schema_version": "1.0",
        "schema": "die.runtime-manifest.v1",
        "manifest_id": UUID_1,
        "candidate_digest": DIGEST,
        "environment_id": "local-die-01",
        "runtime_mode": "COHERENT_LOCAL_PRODUCT",
        "authority_commit": "a" * 40,
        "generated_contract_digest": DIGEST,
        "database_migration_digest": "sha256:" + ("b" * 64),
        "configuration_digest": "sha256:" + ("c" * 64),
        "tenant_authority": {
            "mode": "starliner_control",
            "tenant_ref": "tenant-ref:sha256:" + ("d" * 64),
            "configuration_digest": "sha256:" + ("e" * 64),
        },
        "profile_registry": {
            "registry_ref": "evidence/control/source-profile-registry.json",
            "registry_digest": runtime_profile_registry_digest(endpoint_registry_entries),
            "entries": endpoint_registry_entries,
        },
        "components": endpoint_runtime_components,
        "stores": {
            "postgresql": {"version": "17.10", "endpoint_ref": "secret-ref:pg", "configuration_digest": DIGEST},
            "object_store": {"provider": "s3-compatible", "version": "2026.1", "endpoint_ref": "secret-ref:object", "configuration_digest": DIGEST},
            "clickhouse": {"version": "26.3", "endpoint_ref": "secret-ref:ch", "configuration_digest": DIGEST},
        },
        "producers": [{
            "profile": "endpoint",
            "profile_version": "1.0.0",
            "producer_id": UUID_2,
            "installation_id": "endpoint-installation-1",
            "certification_id": UUID_3,
            "component_id": "endpoint-agent",
            "component_ids": endpoint_runtime_component_ids,
            "artifact_digest": "sha256:" + ("f" * 64),
            "component_set_digest": DIGEST,
            "configuration_digest": DIGEST,
            "credential_class": "dpop_jwt",
            "credential_issuer_class": "starliner_control",
            "enrollment_evidence_ref": "evidence/enrollment/endpoint-agent.json",
            "source_product_path_ref": "source-path/endpoint.yaml",
            "source_product_path_digest": DIGEST,
        }],
        "customer_endpoints": {
            "api": "http://127.0.0.1:62069/die/v1",
            "bff": "http://127.0.0.1:3000/die/v1",
            "ui": "http://127.0.0.1:3000/estate",
        },
        "contamination": {
            "mixed_candidates": False,
            "dirty_components": False,
            "manual_database_mutation": False,
            "untracked_hotfixes": False,
            "overlapping_runtime": False,
            "manual_configuration_override": False,
            "parallel_product_daemon": False,
            "devtools_or_storage_injection": False,
            "synthetic_identity_or_persona": False,
            "fixture_interior_stage": False,
            "uninstalled_artifact": False,
            "normal_entrypoint_bypassed": False,
            "notes": [],
        },
        "created_at": NOW,
        "started_at": LATER,
        "evidence_ref": "evidence/runtime/local-die-01",
        "limitations": ["Only Endpoint producer is attached"],
    }
    accept("runtime-manifest.schema.json", coherent_runtime, "coherent local runtime")
    positive_count += 1

    connector_runtime = copy.deepcopy(coherent_runtime)
    connector_entries = [{
        "profile": "salesforce.discovery",
        "profile_version": "1.0.0",
        "component_role": "connector_poller",
        "schema_digest": "sha256:" + ("9" * 64),
    }]
    connector_runtime["profile_registry"] = {
        "registry_ref": "evidence/control/source-profile-registry.json",
        "registry_digest": runtime_profile_registry_digest(connector_entries),
        "entries": connector_entries,
    }
    connector_runtime["components"] = [copy.deepcopy(coherent_runtime["components"][0])]
    connector_runtime["components"][0].update({
        "component_id": "salesforce-poller",
        "repository": "quilrbusiness/salesforce-connector",
        "branch": "feat/die-salesforce-discovery",
        "role": "connector_poller",
        "build_ref": "evidence/build/salesforce-poller.json",
        "installed_path_ref": "evidence/install/salesforce-poller-path.json",
        "service_unit": "salesforce-poller",
        "runtime_identity": "salesforce-poller",
        "normal_entrypoint": "evidence/install/salesforce-poller-entrypoint.json",
        "installation_evidence_ref": "evidence/install/salesforce-poller.json",
    })
    connector_runtime["producers"][0].update({
        "profile": "salesforce.discovery",
        "profile_version": "1.0.0",
        "installation_id": "salesforce-connection-1",
        "component_id": "salesforce-poller",
        "component_ids": ["salesforce-poller"],
        "credential_class": "oidc_workload",
        "credential_issuer_class": "external_oidc",
        "source_product_path_ref": "source-path/salesforce-discovery.yaml",
    })
    accept("runtime-manifest.schema.json", connector_runtime, "registered connector runtime")
    positive_count += 1

    draft_runtime = copy.deepcopy(coherent_runtime)
    draft_runtime.update({
        "manifest_id": "UNASSIGNED",
        "candidate_digest": "UNASSIGNED",
        "environment_id": "UNASSIGNED",
        "runtime_mode": "NONE",
        "authority_commit": "UNASSIGNED",
        "generated_contract_digest": "UNASSIGNED",
        "database_migration_digest": "UNASSIGNED",
        "configuration_digest": "UNASSIGNED",
        "tenant_authority": {"mode": "UNASSIGNED", "tenant_ref": "REDACTED", "configuration_digest": "UNASSIGNED"},
        "profile_registry": {"registry_ref": "UNASSIGNED", "registry_digest": "UNASSIGNED", "entries": []},
        "components": [],
        "producers": [],
        "customer_endpoints": {"api": "UNASSIGNED", "bff": "UNASSIGNED", "ui": "UNASSIGNED"},
        "created_at": "UNASSIGNED",
        "started_at": "UNASSIGNED",
        "evidence_ref": "UNASSIGNED",
        "limitations": [],
    })
    draft_runtime["stores"] = {
        "postgresql": {"version": "UNASSIGNED", "endpoint_ref": "UNASSIGNED", "configuration_digest": "UNASSIGNED"},
        "object_store": {"provider": "UNASSIGNED", "version": "UNASSIGNED", "endpoint_ref": "UNASSIGNED", "configuration_digest": "UNASSIGNED"},
        "clickhouse": {"version": "UNASSIGNED", "endpoint_ref": "UNASSIGNED", "configuration_digest": "UNASSIGNED"},
    }
    accept("runtime-manifest.schema.json", draft_runtime, "unassigned runtime template")
    positive_count += 1

    preview_e2e = copy.deepcopy(execution_status)
    preview_e2e.update({
        "integration_state": "E2E_DEV",
        "evidence_state": "RUNTIME_OBSERVED_DEV",
        "runtime_mode": "DEV_PREVIEW",
        "runtime_manifest": "runtime/preview.yaml",
        "runtime_manifest_digest": DIGEST,
    })
    reject("execution-status.schema.json", preview_e2e, "preview claiming E2E product integration")
    negative_count += 1

    exact_without_manifest = copy.deepcopy(execution_status)
    exact_without_manifest.update({
        "integration_state": "E2E_EXACT_SHA",
        "evidence_state": "EXACT_SHA_ISOLATED",
        "runtime_mode": "ISOLATED_INTEGRATION",
    })
    reject("execution-status.schema.json", exact_without_manifest, "exact-SHA claim without runtime manifest")
    negative_count += 1

    release_qualified_not_releasable = copy.deepcopy(execution_status)
    # Keep this fixture valid under every other execution-status invariant so
    # MUT-015 can only survive when the RELEASE_QUALIFIED -> RELEASABLE
    # implication itself is weakened.  A UNIT_HARNESS fixture would also fail
    # the unrelated UNIT_HARNESS -> highest_proven_stage=NONE rule and could
    # therefore let a broken release implication pass mutation testing.
    release_qualified_not_releasable.update({
        "implementation_state": "IMPLEMENTED",
        "integration_state": "E2E_EXACT_SHA",
        "evidence_state": "RELEASE_BOUND",
        "release_state": "INTERNAL_ONLY",
        "runtime_mode": "RELEASE_CANDIDATE",
        "highest_proven_stage": "RELEASE_QUALIFIED",
        "runtime_manifest": "runtime/release-candidate.yaml",
        "runtime_manifest_digest": DIGEST,
        "limitations": ["Release qualification has not authorized release"],
    })
    reject("execution-status.schema.json", release_qualified_not_releasable, "release-qualified stage without releasable state")
    negative_count += 1

    not_started_live_ui = copy.deepcopy(execution_status)
    not_started_live_ui.update({
        "implementation_state": "NOT_STARTED",
        "highest_proven_stage": "LIVE_UI",
    })
    reject("execution-status.schema.json", not_started_live_ui, "not-started capability claiming live UI")
    negative_count += 1

    implemented_not_run = copy.deepcopy(execution_status)
    implemented_not_run.update({
        "implementation_state": "IMPLEMENTED",
        "integration_state": "NOT_CONNECTED",
        "evidence_state": "NOT_RUN",
        "runtime_mode": "NONE",
        "highest_proven_stage": "NONE",
        "last_verified_sha": "NONE",
    })
    reject("execution-status.schema.json", implemented_not_run, "implemented capability without evidence")
    negative_count += 1

    omitted_blocker_class = copy.deepcopy(execution_status)
    del omitted_blocker_class["blocker_class"]
    reject("execution-status.schema.json", omitted_blocker_class, "omitted blocker class")
    negative_count += 1

    invalid_blocker = copy.deepcopy(execution_status)
    invalid_blocker["development_blocked"] = True
    invalid_blocker["blocker_class"] = "NONE"
    invalid_blocker["blocked_on"] = "open LG-005"
    reject("execution-status.schema.json", invalid_blocker, "open gate as development blocker")
    negative_count += 1

    incomplete_external_blocker = copy.deepcopy(execution_status)
    incomplete_external_blocker.update({
        "development_blocked": True,
        "blocker_class": "EXTERNAL_INFRASTRUCTURE",
        "blocked_on": "isolated provider account",
        "blocked_action": "run provider retention race",
        "blocker_evidence": "NONE",
        "blocker_owner": "platform-infrastructure",
        "unblock_condition": "provider account assigned",
        "blocker_recheck_at": "2026-08-05T12:00:00Z",
        "independent_next_action": "build deterministic provider boundary harness",
    })
    reject("execution-status.schema.json", incomplete_external_blocker, "external blocker without retained evidence")
    negative_count += 1

    gate_masquerading_as_external_blocker = copy.deepcopy(valid_external_blocker)
    gate_masquerading_as_external_blocker.update({
        "blocker_class": "EXTERNAL_INFRASTRUCTURE",
        "blocked_on": "open LG-005",
    })
    reject("execution-status.schema.json", gate_masquerading_as_external_blocker, "release gate masquerading as external blocker")
    negative_count += 1

    overbroad_external_blocker = copy.deepcopy(valid_external_blocker)
    overbroad_external_blocker["blocked_action"] = "all implementation"
    reject("execution-status.schema.json", overbroad_external_blocker, "external condition claiming to block all implementation")
    negative_count += 1

    dirty_runtime = copy.deepcopy(coherent_runtime)
    dirty_runtime["components"][0]["clean_tree"] = False
    dirty_runtime["contamination"]["dirty_components"] = True
    reject("runtime-manifest.schema.json", dirty_runtime, "dirty coherent runtime")
    negative_count += 1

    generic_bearer_runtime = copy.deepcopy(coherent_runtime)
    generic_bearer_runtime["producers"][0]["credential_class"] = "workload_jwt"
    reject(
        "runtime-manifest.schema.json",
        generic_bearer_runtime,
        "installed launch producer without enrollment-issued DPoP credential",
    )
    negative_count += 1

    unbound_installed_artifact = copy.deepcopy(coherent_runtime)
    del unbound_installed_artifact["components"][0]["installed_artifact_digest"]
    reject(
        "runtime-manifest.schema.json",
        unbound_installed_artifact,
        "coherent component without installed artifact digest",
    )
    negative_count += 1

    unsafe_source_path = copy.deepcopy(coherent_runtime)
    unsafe_source_path["producers"][0]["source_product_path_ref"] = "../endpoint.yaml"
    reject(
        "runtime-manifest.schema.json",
        unsafe_source_path,
        "coherent producer with escaping source product path",
    )
    negative_count += 1

    empty_active_runtime = copy.deepcopy(coherent_runtime)
    empty_active_runtime["components"] = []
    empty_active_runtime["producers"] = []
    reject("runtime-manifest.schema.json", empty_active_runtime, "active runtime without components or producers")
    negative_count += 1

    print(
        f"DIE schema contract tests passed: {len(schema_names)} meta-schemas; "
        f"{positive_count} accepted fixtures; {negative_count} rejected fixtures."
    )


if __name__ == "__main__":
    run()
