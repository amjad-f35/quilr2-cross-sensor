# Global stable-ID registry

## Registry decision

The MCP contribution creates deterministic version-5 UUID URNs:

```text
urn:quilr:lg008:<kind>:<uuid>
```

The UUID input is:

```text
LG-008 namespace UUID
+ item kind
+ canonical machine key
```

Source-versioned keys include repository, full revision, kind, and canonical
locator. Line numbers are evidence attributes, not identity.

## Namespace

- LG-008 namespace UUID: recorded in the machine registry.
- Registry rows: 1,523.
- Duplicate IDs: zero.
- Invalid shapes: zero.
- Orphan parent/repository/revision references: zero.

## Registered identity families

The registry includes:

- five source-profile IDs;
- repository and revision IDs for MCP source and target package;
- 351 source-file IDs;
- component and component-version IDs;
- entry point, feature, capability, record, event, message, and field IDs;
- relationship type/claim IDs;
- persisted artifact, health, diagnostic, evidence, recipe, runtime,
  adapter-mapping, target-contract, target-field, lineage, requirement, defect,
  change-request, and unresolved-evidence IDs;
- materializer, normalization-rule, API-operation, and UI-read-model IDs.

## Identity boundaries

- A logical component ID is separate from its pinned component-version ID.
- A native field ID is separate from a frozen target-field ID even when names
  match.
- The MCP backend deployment ID is not a canonical platform entity ID.
- Human-readable keys are aliases/navigation only.
- Placeholder profile IDs for the other four sensors contain no semantic
  catalog claims.

## Validator

`validate-ids.mjs` checks shape, kind, duplicates, owners, parent/reference
existence, and catalog registration. It passes.

The complete registry is
[machine-readable here](../../lg008/registries/global-id-registry.yaml).
