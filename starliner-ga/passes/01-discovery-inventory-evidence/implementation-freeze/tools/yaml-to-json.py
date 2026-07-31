#!/usr/bin/env python3
"""Parse one YAML document safely and emit JSON with duplicate-key rejection."""

from __future__ import annotations

import json
from pathlib import Path
import sys

import yaml


class UniqueKeyLoader(yaml.SafeLoader):
    """Safe loader that rejects ambiguous duplicate mapping keys."""


def construct_unique_mapping(loader, node, deep=False):
    loader.flatten_mapping(node)
    value = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in value:
            raise ValueError(f"duplicate YAML mapping key: {key}")
        value[key] = loader.construct_object(value_node, deep=deep)
    return value


UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    construct_unique_mapping,
)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: yaml-to-json.py <document.yaml>")
    path = Path(sys.argv[1])
    value = yaml.load(path.read_text(encoding="utf-8"), Loader=UniqueKeyLoader)
    json.dump(value, sys.stdout, separators=(",", ":"), sort_keys=True)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
