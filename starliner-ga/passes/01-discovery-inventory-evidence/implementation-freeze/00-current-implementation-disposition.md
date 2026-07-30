# Current `project-starliner` Implementation Disposition

## Verified source

The current private repository was cloned and inspected at:

```text
repository: quilrbusiness/project-starliner
branch: main
commit: b747393468045425b3f07a24775dcbc93d380cb5
commit date: 2026-07-16T08:10:40-05:00
tracked paths: 226
Python/SQL implementation and test lines: 15,863
tests collected: 413
non-integration result: 408 passed; 5 skipped
schema regeneration: exact match with committed JSON Schema
```

The current repository is a real contracts/delivery/ingest foundation. It is not the complete platform.

## Retain and harden

| Current area | Evidence | Disposition |
|---|---|---|
| `starliner_contracts` schema export, golden/negative corpus and certification types | Generated schemas match committed schemas; contract tests pass | **REFACTOR then retain** as generated compatibility SDK; move authority to versioned schema files |
| `starliner_delivery` validation, retry classification, partial acknowledgement and SQLite outbox concepts | Delivery tests pass | **HARDEN** into shared Python Edge Runtime and use as behavioral reference for other languages |
| `starliner_ingest` authentication, producer registry/trust gate, request limits, safe errors and per-record admission | Tests cover JWT, registry, payload safety, partial results and production guards | **REIMPLEMENT/HARDEN in Go** behind the frozen protocol; retain Python service as compatibility reference until conformance passes |
| PostgreSQL append-only evidence and atomic evidence/outbox transaction | Migration and integration tests exist | **REFACTOR** into the physical schema in this package |
| positive and negative trace corpus | Browser, Endpoint, LLM and MCP fixtures exist | **EXPAND** to full typed profiles and retain as certification foundation |

## Supersede or isolate

| Current area | Reason | Disposition |
|---|---|---|
| `starliner_contracts.SourceObservation.canonical_entity` | Allows the producer to mint or assert canonical identity | **BREAKING REPLACEMENT**: emit source object reference and candidate claims only |
| producer-emitted `EntitySnapshot` | Makes a sensor capable of writing canonical entity state | **QUARANTINED COMPATIBILITY INPUT**; it is not admitted by the five v1 profiles. A migration-owned translator may later convert it into typed source claims under a separate accepted compatibility contract |
| producer-emitted `RelationshipEvent` | Conflates source relationship evidence with canonical typed relationships | **QUARANTINED COMPATIBILITY INPUT**; it is not admitted by the five v1 profiles. Any later translator emits source relationship candidates, never canonical edges |
| duplicate `starliner/contracts/*` and `starliner_contracts/*` ABIs | Two contract authorities can drift | **DEPRECATE legacy package**; generated SDKs derive from one schema authority |
| `starliner/sdk` remote Decision API and enforcement modules | New policy/control is outside this pass | **ISOLATE**; do not make it a dependency of discovery/evidence |
| top-level OPA server, Rego demo, bundle service and Kubernetes examples | Prototype policy engine with mock risk and unauthenticated/demo assumptions; policy is deferred | **QUARANTINE under `legacy/policy-prototype`** or separate branch; not deployed with DIE |
| `Finding`, `FindingSignal`, `MetricEvent`, `CostEvent` | Findings, risk and cost are deferred | **ACCEPT AS LEGACY INPUT ONLY**; do not materialize or expose in pass APIs |
| SQLite central evidence store | Useful local/test adapter but not production authority | **TEST-ONLY** |
| file-backed producer registry | Suitable for preproduction proof, not mutable production enrollment | **TEST/PREPROD-ONLY** |

## Verified missing implementation

No current source implements:

- source-profile normalizers;
- normalized observation ledger;
- source-object and claim ledgers;
- continuous identity resolution;
- reversible binding, merge, split and correction;
- canonical entity, relationship, activity and coverage ledgers;
- authoritative materializers;
- central canonical transactional outbox;
- leased normalization/truth/projection workers;
- rebuildable PostgreSQL product read models;
- ClickHouse activity/evidence projection;
- product RBAC/ABAC/ReBAC;
- customer product API;
- TypeScript SDK;
- Nuxt live-data integration;
- pass-specific export/audit;
- the complete Browser, Endpoint and LLM edge runtimes.

These are `MISSING`, not “probably present.”

## Quality findings affecting reuse

- The non-integration suite passes, but five tests are skipped and PostgreSQL integration depends on Docker.
- Repository-wide Ruff currently reports hundreds of style/modernization findings. CI invokes Ruff only on selected packages/branches; a green test suite is not a repository-wide quality gate.
- Delivery SQLite sequencing uses `MAX(sequence_id)+1` and queue-depth checks through separate connections; it is a prototype concurrency pattern, not the final edge WAL algorithm.
- The current canonical models allow additive unknown fields broadly. The frozen protocol uses strict envelopes and explicit namespaced `extensions`.
- Current ingest persists full JSON bodies in PostgreSQL. The frozen design separates evidence metadata from content-addressed object bodies.
- Current service-JWT identity is a useful foundation, but production workload identity must be pluggable and short-lived; no static shared secret is a GA default.

## Final reuse verdict

Build in the existing `project-starliner` repository. Preserve its tested behavioral corpus and compatibility surface. Add the new Go platform core and generated contract pipeline there. Do not construct a second central repository and do not force the Python prototype to become the permanent high-throughput backend.
