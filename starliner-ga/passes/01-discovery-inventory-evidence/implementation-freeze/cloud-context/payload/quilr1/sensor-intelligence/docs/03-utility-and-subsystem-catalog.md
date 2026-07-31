# Utility and Internal Subsystem Catalog

The exhaustive current ledger is
[`utilities.csv`](../../../matrices/sensor-intelligence/quilr1-platform/utilities.csv).
It distinguishes product features from reusable implementation mechanisms.

## Catalog summary

| Category | Representative mechanisms | Adapter decision |
| --- | --- | --- |
| Runtime routing | Next proxy, locale middleware, auth middleware | retain for compatibility UI only |
| Identity/presentation | cookie hydration, PermissionGuard, route rules | never treat as canonical identity or backend policy |
| HTTP transport | Axios singleton, FetchService, SWR wrappers, route handlers | legacy clients; adapter requires separate authenticated transport |
| Backend trust | `SecurityConfig`, decoder, `RequestFilter`, authz aspect | compatibility API boundary; not source attestation |
| Dispatch/query | `QueryProcessorFactory`, `AbstractQueryProcessor`, time utilities | preserve source semantics but add typed registry/versioning |
| Data access | `ClickHouseDbUtil`, `ClickHouseClient`, DAOs, JPA repository | use bounded read-only backfill adapters; do not inherit unsafe dynamic SQL |
| Parsing/enrichment | interaction strategies, row mappers, findings maps | version as transformations with field lineage |
| Privacy | masking encryption/decryption, PostHog sanitizer | preserve rules but re-govern keys/content/evidence |
| State/coordination | Redis caches, set queue, locks, markers | never canonical; replace queue completion with durable work/outbox |
| Background work | schedulers, app sync, master bootstrap, async audit | model execution/retry/repair explicitly |
| Operations | diagnostics, logs, Actuator, snippet files | operator-only or evidence-reference surfaces |

## Utilities that transform or lose information

### Asset and JDBC row mapping

`AssetInventoryDao` and other JDBC paths convert rows into maps/DTOs.
`AssetInventoryDao.putJson` silently omits malformed JSON fields rather than
failing the row. This is information loss and must be represented in lineage
as a parse failure, not as source absence.

### Interaction source strategies

Browser-extension, endpoint-agent, LLM Gateway, and MCP Gateway strategies
modify predicates and output enrichment according to a request `source`.
That selector is a query strategy, not a repository-wide canonical source
profile. A target adapter must preserve both the native source value and the
normalization version.

### Findings mappings

`FindingsCacheInitializer` loads graph-backed behavior/use-case mappings into
mutable process-local maps; static mappings coexist. The POSTURE population
stage is disabled. Rendered names therefore require the mapping source and
version to remain explainable.

### Masking and analytics sanitization

Conversation encryption uses current AES-GCM and legacy decrypt support.
Individual token failures can preserve ciphertext while attribute-level
failure can abort an operation. PostHog sanitization removes credential-like
properties and bounds nested traversal. Neither mechanism is a general
source-evidence privacy contract.

## Utilities that hide or weaken failure signals

- conversation-filter update can return success after caught failure;
- abstract processor defaults return empty `ServiceResponse` values rather
  than an unsupported-operation error;
- malformed asset JSON is omitted;
- schedulers log and continue without a durable failure record;
- Redis app-sync items are removed before downstream work;
- app-admin processing writes a permanent completion marker despite row
  errors;
- master bootstrap advances Redis state before asynchronous writes complete;
- Axios refresh checks `_retry` without setting it and can resolve an error
  object from its helper.

These behaviors are inputs to the adapter and gap plans; none is silently
normalized into successful delivery.

## Candidate reuse

### Reuse behind a compatibility or migration boundary

- verified SQL/row mappings for source-specific backfill;
- time-range and known filter/operator parsers;
- source-specific interaction transformations;
- legacy decryption only for authorized migration;
- current JPA schema mapping;
- audit event construction where exact fields and delivery limits are
  retained.

### Replace for the target integration

- Redis set-based queue as an outbox;
- cache/graph rows as identity authority;
- frontend route permission as policy enforcement;
- `ServiceResponse` as a telemetry envelope;
- query-processor name map without duplicate/schema/version checks;
- ad-hoc shared-code SQL extraction;
- browser cookie as source identity;
- request-time frontend joins as canonical resolution.

## Duplicate mechanisms

- Axios and FetchService implement overlapping authentication/refresh/error
  stacks.
- Several ClickHouse callers construct their own non-pooled
  `DriverManagerDataSource`/JDBC template.
- Application/global/tenant cache paths repeat source and TTL semantics.
- Graph, static maps, Redis caches, and warehouse cache tables can all enrich
  an application/finding at different points.

The target adapter must choose one explicit extraction and transformation
path per record family rather than reproducing every duplicate mechanism.
