# Authorized-access cookbook

## Coverage

Seventy-six recipes cover:

- 13 native records;
- 20 events;
- 10 frozen target messages;
- nine persistent artifact families;
- 15 health signals;
- nine diagnostic signals.

Every source field inherits at least one recipe from its owning record.

## Modes

Recipes use only:

- `SAFE_LOCAL_RUNTIME`;
- `DATABASE`;
- `FILE_OR_OBJECT`;
- `API`;
- `NO_CURRENT_ACCESS_PATH`.

No recipe requires production, a customer environment, destructive mutation,
or embedded credentials.

## Current API recipes

Source-proven operational paths include:

| Path | Method | Access |
| --- | --- | --- |
| `/starliner/manifest` | GET | route behavior is public in source; deployment middleware may still apply |
| `/starliner/metrics` | GET | admin dependency |
| `/starliner/selftest` | POST | admin dependency; safe local mapping/envelope checks |

## Database/file recipes

The cookbook describes read-only, authorized non-production access for:

- `gateway.db`;
- `mcp_logs.db`;
- `mcpgateway_logs.db`;
- `workflow_runner.db`;
- workflow artifact metadata/files;
- `starliner_outbox` and terminal-delivery state;
- three ClickHouse v2 table families.

Unknown paths, authentication, freshness, or deployment-specific locations are
explicit rather than omitted.

## Target-message access

Frozen profile messages use `NO_CURRENT_ACCESS_PATH` because the current
gateway does not emit the complete target contracts. Their rationale and
post-implementation validation path are included.

## Validation

The validator checks:

- required recipe fields;
- subject coverage;
- authorization requirements;
- rationale for no-current-path rows;
- credential-like material;
- production/customer target language.

It passes.

Machine cookbook:
[authorized-access-recipes.yaml](../../lg008/catalogs/authorized-access-recipes.yaml).
