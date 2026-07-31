# End-to-end lineage

## Source lineage

Every one of the 31 native fields has a lineage edge. Each edge terminates at:

- a frozen target-field ID;
- evidence-only/source-local state;
- coverage/health;
- privacy prohibition;
- explicit out-of-scope reasoning.

No source field terminates at an unnamed “adapter” or `TODO`.

## Target path

The frozen MCP path is:

```text
native source field/event
→ typed MCP safe fact
→ MCP profile payload
→ profile/envelope binding
→ source normalization rule
→ immutable evidence and PostgreSQL claims
→ resolver and canonical transaction
→ PostgreSQL materializer / ClickHouse activity projection
→ OpenAPI operation
→ UI read model
```

Every target edge is distinguished from current implementation. Frozen
lineage is `SOURCE_PROVEN` as a target contract, not runtime proof.

## Current loss and contradiction points

- actor email is replaced with tenant-keyed HMAC and key epoch is absent;
- token-shaped identifiers may become opaque hashes;
- labels are allowlisted and secret-like values dropped;
- raw arguments/results are excluded;
- producer-created `canonical_entity` is not admitted to target lineage;
- exception-converted Direct failures lack current observe lineage;
- resources/prompts/sessions and several protocol events remain unmapped;
- current delivery lacks frozen signed receipt/sequence semantics.

## UI/API lineage

MCP-relevant frozen UI rows cover:

- overview server/tool and activity counts;
- MCP server list/detail;
- tool/resource/prompt counts;
- observed callers and recent activity;
- source-scoped identity assurance;
- activity fields and safe metrics.

The UI may show `unknown`, `partial`, `unsupported`, or `source_scoped`; it may
not infer zero or canonical identity.

Machine outputs:

- [lineage edges](../../lg008/reconciliation/end-to-end-lineage.ndjson)
- [PostgreSQL mappings](../../lg008/reconciliation/source-to-postgres.yaml)
- [ClickHouse mappings](../../lg008/reconciliation/source-to-clickhouse.yaml)
- [OpenAPI mappings](../../lg008/reconciliation/source-to-openapi.yaml)
- [UI mappings](../../lg008/reconciliation/source-to-ui.yaml)
