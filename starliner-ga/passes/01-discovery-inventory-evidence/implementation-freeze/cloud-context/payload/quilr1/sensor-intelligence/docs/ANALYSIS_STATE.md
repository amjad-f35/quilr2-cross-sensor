# Durable Analysis State

## Subject and immutable anchors

- Subject: combined Quilr 1 platform (`quilr-web` + `quilr-query-builder`)
- Classification: aggregation/query/product runtime and imported legacy
  evidence source; not a native sensor
- Query-builder: `c794c45a9c22b75f101c7c73da508d6e7870f97b`
- Web: `e6f9d03ddedde756ec447e3fabccdb3a8c418ea9`
- Accepted target decision: Quilr 1 migrates as immutable evidence and
  source-scoped facts, not canonical truth

## Current status

**Specialized analysis complete against available evidence. Production
integration is not implemented or certified.**

The source archaeology accounts for all 2,903 tracked target files. The
second pass has completed all 34 numbered chapters plus README/state, all 30
CSV matrices, all nine YAML artifacts, and all ten fixture families.

**Current phase:** final validation complete.

**Next exact task if the work resumes:** obtain OQ-001/OQ-002/OQ-003 live
store schema evidence, select the OQ-009 first cohort, and instantiate the
approved source profile without changing any proposed mapping to
`implemented` beforehand.

## Important verified facts

- Quilr 1 is not a native sensor.
- The web has 112 pages, 20 layouts, and two route-handler operations.
- Query-builder has 141 runtime-confirmed custom operations across 26
  application controllers.
- ClickHouse is the dominant legacy operational/analytics store.
- PostgreSQL has the target-local whitelist JPA family; migration evidence also
  defines `ai_conv_filters`.
- Redis is cache/coordination/work-set/marker state, not durable observation
  delivery; dynamic testing reproduced duplicate claims.
- Neo4j is an enrichment/synchronization source whose live authority and
  deployed schema remain unresolved.
- No universal Quilr 1 raw-record envelope, schema version, sequence,
  acknowledgement, replay, or capability manifest exists.
- Both pinned targets build and run locally; the exact green GitHub Actions
  runs skipped application builds.
- The backend can be HTTP/TCP-ready while ClickHouse/Neo4j capabilities are
  degraded.

## Completed artifact counts

- 36 substantive Markdown documents, 5,672 lines at validation;
- 30 populated CSV files with 741 data rows;
- nine populated YAML artifacts with 204 items;
- ten fixture families with 24 parseable JSON examples;
- seven proposed source-observation fixtures validated against the checked-in
  Draft 2020-12 Starliner envelope schema and one expected-invalid fixture
  confirmed to fail for missing tenant.

## Completed specialized subjects

- 30/30 features and product dispositions;
- 41/41 utility/subsystem rows;
- 26 lifecycle mechanisms;
- 21 capture points;
- 29 record families;
- 62/62 inherited field/lineage seed rows;
- 21 inventory entity contributions;
- 26 identifiers and 15 identity-coverage rows;
- 27 relationships;
- 22 native/runtime event families and 17 target event mappings;
- 30 metrics;
- 15 detectors/classifiers;
- 16 control capabilities;
- 25 grouped interface families and 15 extraction points;
- 24 proposed adapter components and 16 platform-contract mappings;
- 16 finding/insight dispositions;
- 26 gaps, 22 MVS decisions, and 30 acceptance scenarios.

## Field closure qualification

All 62 inherited Quilr 1 seed rows have reviewed dispositions and lineage.
This seed includes ten grouped warehouse resource-family rows. It does not
enumerate every physical column in every deployed ClickHouse/Neo4j profile.
Live metadata is required for that production profile closure.

## Corrections made

The inherited generalized cross-sensor matrix mechanically misclassified
selected Quilr 1 platform/configuration fields:

- `pageSize` as economic usage;
- `ServiceResponse` as finding signal;
- interaction cache as finding signal;
- app settings cache as entity identity;
- service ports as entity identity;
- cache TTL and status-page defaults as finding signals.

The specialized `native-fields.csv` and field-lineage ledger contain the
reviewed corrections. The historical matrix is retained as evidence, not
treated as authoritative.

## Contradictions retained

- frontend/backend route mismatches for conversation-filter users and
  `/findings/kpi`;
- Redis TTL property names do not bind to the consuming cache properties;
- decoder DWH exclusion does not match the rewritten servlet path;
- green reusable CI runs skipped both application builds;
- container files create a non-root user but start as root;
- startup/listener comments claim work absent from executable bodies;
- selected mutation/error paths report success despite internal failure;
- `/qb/health` can report `RUNNING` while Actuator reports `DOWN`.

## External blockers

- live ClickHouse/PostgreSQL/Neo4j schemas, grants, data, retention, and plans;
- authoritative external IdP/PDP/gateway/service/MCP/audit contracts;
- production tenant and privacy-policy fixtures;
- rendered cluster/Vault/ingress/image state and Jenkins logs;
- product route cohort, parity, SLO, retention, and ownership decisions;
- realistic load, soak, chaos, upgrade, and rollback evidence.

These are tracked with owners and blocker effects in
`31-open-questions.md`.

## Generated-analysis helpers

The following scripts make the machine-readable artifacts reproducible:

- `work/generate-quilr1-intelligence-scaffold.mjs`;
- `work/populate-quilr1-field-ledgers.mjs`;
- `work/populate-quilr1-product-disposition.mjs`;
- `work/generate-quilr1-analysis-yaml.mjs`;
- `work/generate-quilr1-analysis-fixtures.mjs`.

Generated YAML/fixture files remain analysis artifacts and explicitly do not
claim current Quilr 1 runtime implementation.

## Continuation protocol

If live evidence or implementation code is later added, read:

1. this file;
2. `32-analysis-coverage.md`;
3. `31-open-questions.md`;
4. `33-final-integration-decision-sheet.md`;
5. the relevant topical chapter/matrix;
6. the original `quilr-platform-analysis/` evidence.

Reopen only the questions for which new evidence exists. Do not relabel a
proposed target mapping as implemented without code and test evidence.
