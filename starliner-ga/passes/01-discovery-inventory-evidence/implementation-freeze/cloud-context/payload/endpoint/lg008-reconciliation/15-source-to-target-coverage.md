# 15 — Source-to-Target Coverage

Target items reconciled: 2485

| Reconciliation status | Items |
| --- | --- |
| CONFIRMED | 3 |
| NEEDS_LIVE_VALIDATION | 2015 |
| PARTIALLY_CONFIRMED | 438 |
| REQUIRES_FUTURE_CONNECTOR | 2 |
| UNSOURCED | 27 |

| Target item kind | Items |
| --- | --- |
| API_OPERATION | 47 |
| FIELD_FAMILY | 32 |
| INDEX | 72 |
| JSON_SCHEMA_FIELD | 327 |
| MATERIALIZER | 3 |
| NORMALIZATION_RULE | 1 |
| OPENAPI_SCHEMA_FIELD | 628 |
| PROFILE_CAPABILITY | 11 |
| PROFILE_ENTITY | 24 |
| RELATIONSHIP_RULE | 24 |
| SENSOR_CAPABILITY | 19 |
| SQL_COLUMN | 1165 |
| TABLE | 99 |
| UI_FIXTURE | 1 |
| UI_READ_MODEL_FIELD | 32 |

Coverage includes endpoint/shared JSON Schema properties, PostgreSQL and
ClickHouse tables/columns/indexes, OpenAPI operations and component-schema
fields, endpoint-relevant UI lineage, endpoint
capability/entity/field/relationship register rows, normalization and
materializer responsibilities.

`PARTIALLY_CONFIRMED` means native facts or a frozen generated/runtime field
source exists, but the adapter/platform implementation and live certification
are not proven. `UNSOURCED` identifies new-capture requirements. Storage/API/UI
items generally remain `NEEDS_LIVE_VALIDATION`.

No target item is reported `CONFIRMED` merely because a schema exists.
