#!/usr/bin/env python3
"""Executable positive/negative contract corpus for the frozen DIE schemas."""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
UUID_1 = "11111111-1111-4111-8111-111111111111"
UUID_2 = "22222222-2222-4222-8222-222222222222"
UUID_3 = "33333333-3333-7333-8333-333333333333"
NOW = "2026-07-29T12:00:00Z"
LATER = "2026-07-29T13:00:00Z"
DIGEST = "sha256:" + ("a" * 64)
SIGNATURE = {"format": "jws-detached-jcs", "algorithm": "ES256", "key_id": "key-1", "value": "e30..c2ln"}
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
    return Draft202012Validator(schema, format_checker=FormatChecker())


def accept(name: str, value: dict, label: str) -> None:
    errors = sorted(validator(name).iter_errors(value), key=lambda error: list(error.path))
    if errors:
        details = "; ".join(error.message for error in errors[:3])
        raise AssertionError(f"{name} rejected valid case {label}: {details}")


def reject(name: str, value: dict, label: str) -> None:
    if validator(name).is_valid(value):
        raise AssertionError(f"{name} accepted invalid case {label}")


def normalization_bundle_digest(output_refs: list[dict]) -> str:
    digest = hashlib.sha256()
    for output in sorted(output_refs, key=lambda item: item["output_key"].encode("utf-8")):
        for value in (output["output_key"], output["observation_id"], output["output_digest"]):
            encoded = value.encode("utf-8")
            digest.update(len(encoded).to_bytes(8, byteorder="big", signed=False))
            digest.update(encoded)
    return "sha256:" + digest.hexdigest()


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
    for name, cases in PROFILE_CASES.items():
        for case in cases:
            accept(name, case, case["kind"])
            positive_count += 1

    backend_cases = [
        {"kind": "application_catalog", "operation": "observed", "source_id": "1", "status": "succeeded", "application_source_id": "a", "catalog_revision": "1"},
        {"kind": "application_configuration", "operation": "changed", "source_id": "2", "status": "succeeded", "application_source_id": "a", "config_version": "1"},
        {"kind": "browser_event", "operation": "accepted", "source_id": "3", "status": "succeeded", "client_record_id": "c", "installation_source_id": "i"},
        {"kind": "native_decision", "operation": "decided", "source_id": "4", "status": "blocked", "client_record_id": "c", "native_decision": "block"},
        {"kind": "action_outcome", "operation": "effect_observed", "source_id": "5", "status": "blocked", "client_record_id": "c", "effect": "prevented"},
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

    configuration = {
        "api_version": "starliner.management.v1",
        "generation": 1,
        "issued_at": NOW,
        "expires_at": LATER,
        "tenant_id": "tenant-1",
        "producer_id": UUID_1,
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
        "signature": SIGNATURE,
    }
    accept("edge-configuration.schema.json", configuration, "minimal configuration")
    positive_count += 1

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
        "tenant_id": "tenant-1",
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
    }
    accept("normalized-observation.schema.json", normalized, "minimal normalized observation")
    positive_count += 1

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
        "tenant_id": "tenant-1",
        "producer_id": UUID_2,
        "revision": 1,
        "issued_at": NOW,
        "expires_at": LATER,
        "issuer": "quilr-control",
        "installation_id": "installation-1",
        "source_profile": "endpoint",
        "business_scope_id": UUID_3,
        "environment": "production",
        "display_name": "Endpoint",
        "credential_subject": "spiffe://quilr/endpoint/1",
        "artifact_digest": DIGEST,
        "capabilities": [{"capability": "inventory", "mode": "observe", "profile_version": "1.0.0", "effective_from": NOW}],
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
        ("profile-browser-backend-v1.schema.json", {"kind": "browser_event", "operation": "page", "source_id": "1", "status": "succeeded", "client_record_id": "c", "installation_source_id": "i"}, "backend operation mismatch"),
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

    print(
        f"DIE schema contract tests passed: {len(schema_names)} meta-schemas; "
        f"{positive_count} accepted fixtures; {negative_count} rejected fixtures."
    )


if __name__ == "__main__":
    run()
