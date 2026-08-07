#!/usr/bin/env python3
"""Validate the frozen customer, ingest and installed-producer control contracts."""

from __future__ import annotations

import copy
from pathlib import Path

from jsonschema import Draft202012Validator
from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename
import yaml


ROOT = Path(__file__).resolve().parent.parent
CONTRACTS = (
    ROOT / "openapi" / "die-v1.openapi.yaml",
    ROOT / "openapi" / "starliner-ingest-v1.openapi.yaml",
    ROOT / "openapi" / "starliner-control-v1.openapi.yaml",
)

CONTROL_SCHEMA_COMPONENTS = {
    "sensor-enrollment-request.schema.json": "InstalledSensorEnrollmentRequest",
    "sensor-enrollment-response.schema.json": "InstalledSensorEnrollmentResponse",
    "producer-component-set.schema.json": "InstalledProducerComponentSet",
    "producer-enrollment-manifest.schema.json": "ProducerEnrollmentManifest",
    "edge-configuration.schema.json": "EdgeConfiguration",
}


class UniqueKeyLoader(yaml.SafeLoader):
    """Safe YAML loader that rejects ambiguous duplicate mapping keys."""


def construct_unique_mapping(loader, node, deep=False):
    loader.flatten_mapping(node)
    value = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in value:
            raise AssertionError(f"duplicate YAML mapping key: {key}")
        value[key] = loader.construct_object(value_node, deep=deep)
    return value


UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    construct_unique_mapping,
)


def bundle_control_schemas(spec: dict) -> dict:
    """Bundle local JSON Schemas so validation is deterministic and offline."""
    bundled = copy.deepcopy(spec)
    schemas = bundled["components"]["schemas"]
    source_schemas = {
        filename: yaml.safe_load((ROOT / "schemas" / filename).read_text())
        for filename in CONTROL_SCHEMA_COMPONENTS
    }
    id_to_component = {
        schema.get("$id"): CONTROL_SCHEMA_COMPONENTS[filename]
        for filename, schema in source_schemas.items()
        if schema.get("$id")
    }

    def rewrite(node: object, current_component: str | None = None) -> object:
        if isinstance(node, list):
            return [rewrite(item, current_component) for item in node]
        if not isinstance(node, dict):
            return node
        result = {}
        for key, item in node.items():
            if key == "$ref" and isinstance(item, str):
                filename = Path(item).name
                if item in id_to_component:
                    item = f"#/components/schemas/{id_to_component[item]}"
                elif filename in CONTROL_SCHEMA_COMPONENTS:
                    item = f"#/components/schemas/{CONTROL_SCHEMA_COMPONENTS[filename]}"
                elif item.startswith("#/") and current_component:
                    item = f"#/components/schemas/{current_component}/{item[2:]}"
                result[key] = item
            else:
                result[key] = rewrite(item, current_component)
        return result

    for filename, component_name in CONTROL_SCHEMA_COMPONENTS.items():
        schema = copy.deepcopy(source_schemas[filename])
        schema.pop("$id", None)
        schemas[component_name] = rewrite(schema, component_name)
    return rewrite(bundled)


def main() -> None:
    yaml_contracts = sorted(ROOT.rglob("*.yaml"))
    for yaml_path in yaml_contracts:
        yaml.load(yaml_path.read_text(encoding="utf-8"), Loader=UniqueKeyLoader)
    print(
        "YAML duplicate-key validation passed: "
        f"{len(yaml_contracts)} normative documents."
    )
    for path in CONTRACTS:
        spec, base_uri = read_from_filename(str(path))
        validation_spec = (
            bundle_control_schemas(spec)
            if path.name == "starliner-control-v1.openapi.yaml"
            else spec
        )
        validate(validation_spec, base_uri=base_uri)
        if path.name == "die-v1.openapi.yaml":
            safe_attributes = {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "components": {"schemas": spec["components"]["schemas"]},
                "$ref": "#/components/schemas/SafeAttributeMap",
            }
            validator = Draft202012Validator(safe_attributes)
            accepted = (
                {"integer": 1},
                {"number": 1.5},
                {"array": [1, 1.5, True, None, "value"]},
            )
            rejected = (
                {"integer": 9007199254740992},
                {"number": 9007199254740992.0},
                {"nested": {"not": "a safe scalar"}},
            )
            for instance in accepted:
                errors = list(validator.iter_errors(instance))
                assert not errors, f"SafeAttributeMap rejected {instance}: {errors}"
            for instance in rejected:
                assert list(validator.iter_errors(instance)), (
                    f"SafeAttributeMap accepted invalid instance {instance}"
                )
        if path.name == "starliner-control-v1.openapi.yaml":
            operations = {
                operation["operationId"]
                for path_item in spec["paths"].values()
                for method, operation in path_item.items()
                if method in {"get", "post", "put", "patch", "delete"}
            }
            assert operations == {
                "issueSensorBootstrap",
                "enrollInstalledProducer",
                "renewInstalledProducerCredential",
                "revokeInstalledProducer",
            }, f"unexpected Starliner control operations: {operations}"
            enrollment = spec["paths"]["/starliner/control/v1/enrollments"]["post"]
            assert enrollment["security"] == [{"discoveryBootstrap": []}]
            enrollment_ref = enrollment["requestBody"]["content"]["application/json"][
                "schema"
            ]["$ref"]
            assert enrollment_ref.endswith("sensor-enrollment-request.schema.json")
            bootstrap = spec["paths"]["/starliner/control/v1/sensor-bootstraps"]["post"]
            assert bootstrap["security"] == [
                {"operatorOAuth": ["starliner.bootstrap.issue"]}
            ]
            schema_document = {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "components": {"schemas": spec["components"]["schemas"]},
                "$ref": "#/components/schemas/SensorBootstrapIssueRequest",
            }
            bootstrap_request_validator = Draft202012Validator(schema_document)
            bootstrap_request = {
                "api_version": "starliner.control.bootstrap-issue.v1",
                "request_id": "11111111-1111-4111-8111-111111111111",
                "organization_tenant_id": "22222222-2222-4222-8222-222222222222",
                "source_profile": "endpoint",
                "business_scope_id": "33333333-3333-4333-8333-333333333333",
                "environment": "production",
                "intent": "enroll",
                "installer_subject_ref": "urn:quilr:discovery:deployment:42",
                "reason_code": "initial_install",
                "requested_ttl_seconds": 900,
                "requested_at": "2026-08-05T12:00:00Z",
            }
            assert not list(bootstrap_request_validator.iter_errors(bootstrap_request))
            invalid_bootstrap_request = dict(bootstrap_request)
            invalid_bootstrap_request["requested_ttl_seconds"] = 901
            assert list(bootstrap_request_validator.iter_errors(invalid_bootstrap_request))
            invalid_enroll_replaces = dict(bootstrap_request)
            invalid_enroll_replaces["replaces"] = {
                "producer_id": "44444444-4444-4444-8444-444444444444",
                "installation_id": "55555555-5555-4555-8555-555555555555",
                "producer_epoch": "66666666-6666-4666-8666-666666666666",
            }
            assert list(bootstrap_request_validator.iter_errors(invalid_enroll_replaces))

            response_document = {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "components": {"schemas": spec["components"]["schemas"]},
                "$ref": "#/components/schemas/SensorBootstrapIssueResponse",
            }
            bootstrap_response_validator = Draft202012Validator(response_document)
            bootstrap_response = {
                "api_version": "starliner.control.bootstrap-issue-response.v1",
                "request_id": bootstrap_request["request_id"],
                "status": "issued",
                "bootstrap_id": "77777777-7777-4777-8777-777777777777",
                "organization_tenant_id": bootstrap_request["organization_tenant_id"],
                "source_profile": "endpoint",
                "business_scope_id": bootstrap_request["business_scope_id"],
                "environment": "production",
                "intent": "enroll",
                "issued_at": "2026-08-05T12:00:00Z",
                "expires_at": "2026-08-05T12:15:00Z",
                "enrollment_url": "https://control.example.test/starliner/control/v1/enrollments",
                "secret_delivery": "returned_once",
                "bootstrap_secret": "fixture-only-one-use-bootstrap-secret",
            }
            assert not list(bootstrap_response_validator.iter_errors(bootstrap_response))
            replay = dict(bootstrap_response)
            replay["status"] = "idempotent_replay"
            replay["secret_delivery"] = "already_delivered"
            replay.pop("bootstrap_secret")
            assert not list(bootstrap_response_validator.iter_errors(replay))
            replay["bootstrap_secret"] = "must-not-be-redisclosed-on-replay"
            assert list(bootstrap_response_validator.iter_errors(replay))
            renewal = spec["paths"][
                "/starliner/control/v1/producers/{producer_id}/credentials:renew"
            ]["post"]
            assert {parameter["$ref"] for parameter in renewal["parameters"]} >= {
                "#/components/parameters/IdempotencyKey",
                "#/components/parameters/DPoPProof",
            }
            dpop_description = spec["components"]["parameters"]["DPoPProof"][
                "description"
            ]
            for required_term in (
                "asymmetric signature",
                "RFC 7638",
                "cnf.jkt",
                "htm",
                "htu",
                "ath",
                "nonce",
                "jti",
                "replay ledger",
            ):
                assert required_term in dpop_description, (
                    f"DPoP contract omits semantic check {required_term}"
                )
            for status, delivery_header in (
                ("201", "#/components/headers/InitialCredentialDelivery"),
                ("200", "#/components/headers/ReplacementCredentialDelivery"),
            ):
                response = enrollment["responses"][status]
                assert response["headers"]["Starliner-Assignment-Digest"]["$ref"] == (
                    "#/components/headers/AssignmentDigest"
                )
                assert response["headers"]["Starliner-Credential-Delivery"]["$ref"] == (
                    delivery_header
                )
            revocation = spec["paths"][
                "/starliner/control/v1/producers/{producer_id}:revoke"
            ]["post"]
            assert revocation["security"] == [
                {"operatorOAuth": ["starliner.producer.revoke"]}
            ]
            assert "#/components/parameters/IdempotencyKey" in {
                parameter["$ref"] for parameter in revocation["parameters"]
            }
            revocation_required = set(
                spec["components"]["schemas"]["ProducerRevocationRequest"]["required"]
            )
            assert {"idempotency_key_digest", "request_digest"} <= revocation_required
        print(f"PASS {path.relative_to(ROOT)}")
    print(f"OpenAPI contract validation passed: {len(CONTRACTS)} specifications.")


if __name__ == "__main__":
    main()
