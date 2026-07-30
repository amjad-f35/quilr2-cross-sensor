#!/usr/bin/env python3
"""Validate the frozen customer and Starliner ingest OpenAPI 3.1 contracts."""

from pathlib import Path

from jsonschema import Draft202012Validator
from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename
import yaml


ROOT = Path(__file__).resolve().parent.parent
CONTRACTS = (
    ROOT / "openapi" / "die-v1.openapi.yaml",
    ROOT / "openapi" / "starliner-ingest-v1.openapi.yaml",
)


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
        validate(spec, base_uri=base_uri)
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
        print(f"PASS {path.relative_to(ROOT)}")
    print(f"OpenAPI contract validation passed: {len(CONTRACTS)} specifications.")


if __name__ == "__main__":
    main()
