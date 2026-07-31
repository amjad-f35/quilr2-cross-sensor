# Field Transformation Lineage

Public v2 lineage is: source/store row → source-specific Rust decoder → console aggregate/domain model → `platform_admin_v2::mapping` → Utoipa DTO → JSON/OpenAPI → Orval TypeScript model → React Query/page component.

| Stage | Authority | Transformation |
| --- | --- | --- |
| source row | upstream/source-specific | typed/bound query and decoder |
| LocalStore | derived cache/read model | normalization/materialization; never source authority |
| console model | derived | cross-source aggregation, readiness, caps |
| v2 DTO | transport contract | semantic naming/camelCase serialization |
| generated client | generated | OpenAPI-to-TypeScript mapping |
| UI | presentation | formatting, sorting, visibility; not canonical state |

Every seeded field has a row in `field-lineage.csv`; source implementation remains addressable through the schema and symbol indexes.
