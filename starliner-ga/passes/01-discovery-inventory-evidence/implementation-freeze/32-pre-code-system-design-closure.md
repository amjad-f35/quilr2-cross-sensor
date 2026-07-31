# Pre-Code System-Design Closure

## Verdict

For the bounded Discovery, Inventory/Catalog, Activity/Observability and
Evidence pass, the pre-code system design is determined. A coding agent is not
expected or permitted to choose a different spine, authority model, component
topology, communication model, data model, concurrency model, API shape,
authorization order, UI data seam or failure/rebuild strategy.

This statement concerns the intended production system. It is separate from
whether the implementation has been written or accepted.

## Structural closure matrix

| Area | Frozen decision | Normative authority |
|---|---|---|
| Product boundary | Browser, Browser Backend, Endpoint, LLM Gateway and MCP Gateway facts become one evidence-backed observed/configured AI estate with inventory, activity, coverage and provenance | `01-scope-claims-and-non-goals.md`; `03-sensor-discovery-and-event-coverage.md` |
| Exclusions | Findings/intelligence, policy/enforcement orchestration, cost/value, final deployment portfolio and migration/cutover are not hidden dependencies of this pass | `13-closure-and-non-blockers.md` |
| Core repository | Extend `quilrbusiness/project-starliner`; do not create a second backend spine | `12-repository-and-delivery-map.md` |
| UI repository | Keep `quilr-platform-nuxt`; replace fixtures with the generated client and `DieRepository` seam | `09-nuxt-ui-integration.md` |
| Architectural style | Modular monolith in source, domain and release authority; independently replicated role processes at runtime | `01-system-architecture.md` |
| Central language | Go for the platform core; generated Go/Java/Python/TypeScript/Rust wire bindings | `01-system-architecture.md`; `12-repository-and-delivery-map.md` |
| Module pattern | Hexagonal ports/adapters with dependency direction `transport → app → domain → ports ← infrastructure adapters` | `01-system-architecture.md`; `12-repository-and-delivery-map.md` |
| Deployable roles | One signed binary/container digest with explicit `ingest`, `normalizer`, `truth`, `projector`, `api` and `maintenance` roles | `01-system-architecture.md`; `12-repository-and-delivery-map.md` |
| Role isolation | Each role has separate credentials, database grants, lease stages and scaling keys; API read/admin and bootstrap credentials remain distinct | `01-system-architecture.md`; `03-physical-data-and-storage.md`; `07-authorization-and-audit.md` |
| Internal communication | No synchronous role-to-role RPC or internal service mesh; roles communicate through committed PostgreSQL state, leased work and the canonical transactional outbox | `01-system-architecture.md`; `04-workers-transactions-and-replay.md` |
| External communication | Sensors deliver typed authenticated HTTP batches; UI uses the generated TypeScript HTTP client; object storage and ClickHouse are accessed only through restricted adapters | `02-protocol-and-source-profiles.md`; OpenAPI contracts |
| Edge design | Thin native adapter plus Starliner privacy filter, sequence/epoch, WAL/outbox, retry, partial acknowledgement, backpressure, health and signed configuration | `02-protocol-and-source-profiles.md`; `14-sensor-adapter-bindings.md` |
| Sensor authority | Sensors preserve strongest source-native identity and facts; they never assign canonical identity or fabricate unsupported fields | `02-protocol-and-source-profiles.md`; `16-sensor-capability-and-field-traceability.md` |
| Wire contracts | Small common envelope plus five typed source-profile schemas, versioned compatibility rules, exact digest/idempotency/signature shapes and partial receipts | schemas; `02-protocol-and-source-profiles.md` |
| Admission | Authenticate producer and tenant, verify certification/profile/schema/privacy/integrity, make evidence durable, then atomically commit metadata, receipt and normalize work | `01-system-architecture.md`; `03-physical-data-and-storage.md` |
| Evidence authority | Content-addressed immutable object bytes plus append-only PostgreSQL evidence metadata, disposition, provenance and audit | `03-physical-data-and-storage.md`; `05-evidence-activity-and-provenance.md` |
| Normalization | Deterministic, versioned, multi-output bundles; one source record may produce several source objects, observations, claims and candidates without collision | normalization schemas; `04-workers-transactions-and-replay.md` |
| Identity | Continuous central resolution over source-scoped objects and claims; exact-only automatic binding, confidence/review boundaries, negative constraints, merge/split/alias/correction history | `05-identity-and-canonicalization.md` |
| Asset layering | Product/definition, deployment/configuration, runtime/session and activity remain distinct; a local-agent inventory row has an exact definition/device/source-authority scope | `05-identity-and-canonicalization.md`; `15-connected-asset-inventory-and-exposure.md` |
| Canonical truth | PostgreSQL versioned canonical entity, relationship, activity and coverage ledgers are authoritative; sensors, API, UI and projections cannot mutate truth | `03-physical-data-and-storage.md`; SQL |
| Relationships | Typed bitemporal edges with valid endpoint pairs and explicit structural/configured/entitlement/observed/ownership/coverage semantics | `06-relationships-activity-and-coverage.md`; predicate and relationship registries |
| Activity | Evidence-backed canonical events with frozen family/subtype/outcome/correlation/dedupe and lifecycle semantics | `06-relationships-activity-and-coverage.md`; activity ontology |
| Coverage | Expected populations, producer capability, gaps, freshness and absence rules are explicit; unsupported coverage stays unknown rather than becoming a negative claim | `06-relationships-activity-and-coverage.md` |
| Materialization | The truth role performs canonical materialization transactionally; projectors consume immutable typed pointers and cannot reinterpret identity | `01-system-architecture.md`; `04-workers-transactions-and-replay.md` |
| Read projections | Purpose-built PostgreSQL customer read models and ClickHouse activity/evidence search are disposable, generation-aware and rebuildable from authority | `03-physical-data-and-storage.md`; `04-workers-transactions-and-replay.md` |
| Rebuild protocol | Snapshot plus tail, required-partition manifest, all-partition acknowledgement, verification, active/standby generation swap, rollback and retirement | `04-workers-transactions-and-replay.md` |
| Storage topology | PostgreSQL canonical/work/authz/audit authority, certified object-store adapter for evidence, ClickHouse projection; no Redis, Neo4j, Kafka or search authority in the minimum pass | `01-system-architecture.md`; `03-physical-data-and-storage.md` |
| Transaction model | No distributed transaction; object conditional-put precedes admission commit, PostgreSQL owns atomic stage effects, ClickHouse uses idempotent insertion plus reconciliation | `01-system-architecture.md`; `04-workers-transactions-and-replay.md` |
| Delivery semantics | At-least-once delivery and work execution with idempotent effects, durable receipts, stage-specific uniqueness and explicit loss/gap states | `02-protocol-and-source-profiles.md`; `04-workers-transactions-and-replay.md` |
| Concurrency | Tenant/aggregate partitioning, `SKIP LOCKED` leasing, lease tokens, fencing, immutable executions, optimistic revisions, authorization-revision locks and serialized canonical heads | `04-workers-transactions-and-replay.md`; SQL |
| Retry/failure | Frozen retry taxonomy, bounded exponential backoff, poison quarantine, blast-radius isolation, dependency wake-up, overload/backpressure and graceful shutdown | `04-workers-transactions-and-replay.md`; `10-performance-reliability-and-operations.md` |
| APIs | Two OpenAPI 3.1 contracts and 45 operations freeze resources, authentication, capability checks, field masks, query rules, pagination, sorting, watermarks, errors, idempotency, exports and corrections | `08-product-api-contract.md`; `openapi/` |
| Authorization | In-process typed RBAC/ReBAC/ABAC before query planning, fail-closed field masking, PostgreSQL RLS defense in depth, explicit evidence/download capabilities and append-only audit | `07-authorization-and-audit.md`; `authz/`; SQL |
| Tenant boundary | Tenant derives from authenticated identity, exists on every row/object/cache/query, scopes all worker leases, and is mandatory in restricted ClickHouse queries | `01-system-architecture.md`; `07-authorization-and-audit.md` |
| UI | Nuxt/shadcn progressive disclosure with Home, AI Estate, typed inventories/details, Activity, Evidence and Coverage/Producers; no frontend joins or telemetry spreadsheet | `09-nuxt-ui-integration.md`; `17-customer-information-architecture.md`; UI matrix |
| Privacy | Field-level admit/minimize/tokenize/prohibit/unsupported dispositions, restricted-content separation, purpose-bound access and explicit retention/hold/erasure lifecycle | field registry; `03-physical-data-and-storage.md`; `07-authorization-and-audit.md` |
| Performance | Scaling keys, SLOs, bounded query shapes, cardinality budgets, backpressure thresholds, partition/index principles and capacity-certification procedure are frozen | `10-performance-reliability-and-operations.md` |
| Observability | OpenTelemetry logs/metrics/traces, stage watermarks, queue/lease/gap/projection/evidence signals, readiness/liveness rules, alerts and ownership expectations | `10-performance-reliability-and-operations.md` |
| Backup/recovery | PostgreSQL/object backup and restore, ClickHouse rebuild, replay, integrity reconciliation, disaster validation and explicit RPO/RTO environment binding | `03-physical-data-and-storage.md`; `10-performance-reliability-and-operations.md` |
| Build/release | One release train, generated-and-committed contracts, architecture import tests, pinned toolchains, clean-room validation, signed artifacts and evidence-bound release gates | `12-repository-and-delivery-map.md`; `production-readiness/` |
| Test strategy | Positive, negative, property, contract, integration, security, concurrency, chaos, load, restore, native certification, cross-language and live UI suites have named obligations | `11-testing-conformance-and-release-gates.md`; gate catalog |
| Technical debt | Existing Python protocol/delivery/ingest is explicitly retain/refactor/compatibility work; missing Go central modules, fixture UI, selected MCP failures and repository lint debt are dispositioned rather than silently inherited | `00-current-implementation-disposition.md`; `12-repository-and-delivery-map.md`; defect ledger |
| Future connector compatibility | The five launch profiles are release-managed registry entries, not a permanent protocol enum; future discovery/telemetry/control/response/export connectors enter the same evidence, identity, graph, authz and materialization plane | `18-future-authoritative-connectors.md`; `33-enterprise-connector-platform-direction.md` |
| Change control | Authority, identity, profile meaning, predicate, transaction, technology, synchronous hop, API semantics or weakened gate changes require ADR plus regenerated contracts/tests | `13-closure-and-non-blockers.md` |

## Design patterns intentionally selected

- modular monolith with role-separated distributed execution;
- domain/application/port/adapter boundaries;
- append-only and bitemporal ledgers;
- evidence-first provenance;
- transactional outbox and durable inbox/work tables;
- at-least-once processing with idempotent effects;
- leases plus fencing tokens and optimistic revision checks;
- deterministic materializers and generation-based projectors;
- CQRS-style read projections without a second write authority;
- content-addressed immutable evidence;
- fail-closed authorization and privacy;
- progressive-disclosure UI over typed read models.

No generic event bus, distributed transaction, request-time cross-service
composition, graph database authority or frontend data integration is part of
the minimum design.

## Choices implementers may still make

These are implementation details, not architecture gaps:

- private function/type names inside a frozen module;
- worker replica counts, batch sizes and pool sizes within certified limits;
- indexes and query rewrites that preserve semantics and pass plans/load gates;
- internal algorithms that produce the same deterministic frozen result;
- provider-specific code behind the frozen object-store and identity ports;
- deployment values, endpoints, credentials, regions, certificates and
  customer-specific retention/SLO settings.

Implementers may not use those freedoms to move authority, add an unregistered
store or synchronous hop, weaken identity/privacy/authz, change API semantics,
invent sensor facts or bypass a gate.

## Known product limitations are also determined

- The five owned profiles support the observed/configured estate they can
  evidence; they do not prove a complete enterprise entitlement graph.
- IdP, HRIS, MDM/CMDB, cloud/IAM, SaaS, repository and ACL connectors are
  required for authoritative people, groups, permissions and reachability.
- A source field classified `new_capture_required` or
  `optional_not_currently_sourced` remains unsupported until implemented and
  certified.
- Absence is asserted only inside an authoritative expected population and
  valid coverage window.
- Raw customer content is not collected or displayed by default.
- Findings, risk, policy, enforcement, cost/value, migration mechanics and the
  final deployment portfolio are outside this bounded build.

These are deliberate boundaries recorded in the product and future-connector
registers, not accidental omissions.

## Final pre-code authorization

```text
system components and ownership: FROZEN
module boundaries and dependency direction: FROZEN
role topology and communication: FROZEN
protocols, schemas and source semantics: FROZEN
data authority and physical model: FROZEN
concurrency, failure, replay and rebuild: FROZEN
identity, canonicalization, graph and materialization: FROZEN
authorization, APIs and UI seam: FROZEN
performance, observability and operational design: FROZEN
technical-debt and limitation disposition: FROZEN
implementation dependency order and acceptance criteria: FROZEN

full bounded-pass production implementation: AUTHORIZED
```

Any contrary source or implementation evidence reopens only the smallest
affected contract under formal change control. It does not give an implementer
permission to invent a replacement architecture.
