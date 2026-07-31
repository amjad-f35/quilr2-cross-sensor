# Discovery, Inventory, Activity & Evidence — Evidence-Gated Engineering Freeze

**Status:** source-complete architecture and semantic freeze; exact target-engine
local smoke validated; expanded production acceptance gates remain open

**Scope:** end-to-end Discovery, Inventory/Catalog, Activity/Observability and
Evidence design from Browser, Endpoint, LLM Gateway, MCP Gateway and Browser
Backend adapters through customer-facing Nuxt UI; selected-source completeness
is closed by `LG-008`, while native artifact/runtime behavior remains gated by
`LG-005`

**Source cutoff:** `project-starliner@b747393468045425b3f07a24775dcbc93d380cb5`;
`quilr-platform-nuxt@8c745c88e56cb6fc88a022415a596b5d436a5264`
dirty working tree inspected 2026-07-30 without mutation; current five-profile
producer revisions and their separate build/release qualifications are pinned
in
[source revision selection](registers/source-revision-selection.csv)

## Decision

This package defines the engineering design for the entire Discovery, Inventory, Activity & Evidence pass. It is not considered accepted merely because prose exists: every product fact is bounded by audited native capture, an explicit support state, executable schemas, relationship rules, and validation. Teams implement slices only after this whole contract is accepted. A slice is a delivery unit, not permission to invent the rest of the platform.

“Entire pass” defines the product and processing boundary. The selected-source
cutoff is exhaustively dispositioned by the
[five-profile authority](lg008/README.md). A later source revision or
runtime-proven contradiction reopens only the affected contracts under
[sensor capability and field traceability](16-sensor-capability-and-field-traceability.md).

The target is:

> A modular Go platform core in `quilrbusiness/project-starliner`, deployed as independently scalable roles from one versioned codebase and one release digest; generated wire contracts for Go, Java, Python, TypeScript and Rust plus generated Go/TypeScript product clients; existing sensor repositories with thin source adapters and durable local delivery; authoritative PostgreSQL canonical state; immutable object evidence; ClickHouse activity search; authorized APIs; and the existing Nuxt/shadcn application as the customer UI.

This is neither a single-process monolith nor independently owned microservices. It is a **modular monolith in source and authority, with role-separated distributed execution**.

## Full frozen path

```text
native sensor fact
→ source-specific adapter
→ privacy filter
→ producer sequence + edge WAL
→ authenticated batch delivery
→ admission + immutable evidence
→ durable normalization work
→ immutable multi-output normalization run/claims/candidates
→ central resolver
→ canonical entity/relationship/activity/coverage transaction
→ transactional outbox
→ PostgreSQL read materializers + ClickHouse activity projector
→ authorization-constrained product API
→ generated TypeScript client
→ Nuxt/shadcn UI
```

No stage may be replaced by a frontend join, direct sensor query, source-created canonical ID, request-time fanout across product services, or projection acting as mutation authority.

## Package map

| Document or artifact | Frozen subject |
|---|---|
| [Current implementation disposition](00-current-implementation-disposition.md) | What to retain, refactor, replace, quarantine, or add in `project-starliner` |
| [System architecture](01-system-architecture.md) | Modules, deployable roles, boundaries, authority and dependency rules |
| [Protocol and source profiles](02-protocol-and-source-profiles.md) | Common envelope, typed payload families, receipts, ordering, compatibility |
| [Physical data and storage](03-physical-data-and-storage.md) | PostgreSQL, object evidence, ClickHouse, keys, indexes and lifecycle |
| [Workers and distributed processing](04-workers-transactions-and-replay.md) | Work tables, leasing, fencing, idempotency, retries, replay and rebuild |
| [Identity and canonicalization](05-identity-and-canonicalization.md) | Source objects, claims, bindings, resolution, field authority, merge/split |
| [Relationships, activity and coverage](06-relationships-activity-and-coverage.md) | Typed bitemporal edges, event semantics, correlation and coverage |
| [RBAC/ABAC/ReBAC](07-authorization-and-audit.md) | Product authorization, field security, RLS and audit |
| [Product API](08-product-api-contract.md) | Query rules, consistency, pagination, errors and export |
| [Nuxt integration](09-nuxt-ui-integration.md) | Existing shell, live-data seam, screens, states and performance |
| [Performance and reliability](10-performance-reliability-and-operations.md) | Engineering SLOs, capacity, backpressure, failure modes and observability |
| [Verification](11-testing-conformance-and-release-gates.md) | Unit through chaos/security/accessibility certification |
| [Implementation map](12-repository-and-delivery-map.md) | Exact target directories, ownership boundaries and dependency order |
| [Closure ledger](13-closure-and-non-blockers.md) | What is closed and the small set of environment/certification inputs left |
| [Sensor adapter bindings](14-sensor-adapter-bindings.md) | Exact verified capture seams, runtime placement, profile output and certification stop lines |
| [Connected asset inventory and exposure](15-connected-asset-inventory-and-exposure.md) | Definition/deployment/runtime layering, local-agent identity, device/account/MCP joins, application classification and the hard entitlement boundary |
| [Sensor capability and field traceability](16-sensor-capability-and-field-traceability.md) | Exact native facts, support states, field dispositions, false-join boundaries and current product estate |
| [Customer information architecture](17-customer-information-architecture.md) | Microsoft-style progressive disclosure, overview/inventory/detail organization and read-model expectations |
| [Future authoritative connectors](18-future-authoritative-connectors.md) | IdP, HRIS, MDM/CMDB, cloud/IAM, SaaS, repository and ACL expansion boundary |
| [Audit corrections and build readiness](19-audit-corrections-and-build-readiness.md) | Prior overclaims corrected, unresolved truth behavior, automated guards and exact readiness verdict |
| [Adversarial architecture review](20-adversarial-architecture-review.md) | P0/P1 defect corrections, final transaction invariants, tenant/partition hardening and mandatory implementation gates |
| [Independent falsification verdict](21-independent-falsification-and-readiness-verdict.md) | Fresh cross-contract findings, bounded assurance and direct readiness verdict |
| [Live storage conformance](22-live-storage-conformance.md) | Exact PostgreSQL, ClickHouse and object-store evidence-producing gates |
| [Production implementation handoff](23-production-implementation-handoff.md) | Coding-agent authority order, complete module target, gate order and stop conditions |
| [Source-analysis intake and LG gate plan](24-source-analysis-intake-and-lg-gate-plan.md) | Content-addressed disposition of supplied analyses, LG-008 admission defects and exact remaining evidence for every LG gate |
| [Browser package admission and owner inputs](25-browser-package-admission-and-owner-inputs.md) | Independent archive/validator review, two-profile admission and exact owner-controlled Browser evidence still required |
| [LG-008 evidence acquisition disposition](26-lg008-cto-evidence-checklist.md) | Correction of former owner requests: source is engineering-derived from GitHub and executable proof is routed to its proper live gate |
| [Quilr organization source reconciliation](27-quilrbusiness-org-source-reconciliation.md) | Authenticated 377-repository inventory, current producer cutoffs, recovered dependencies/consumers, Browser/MCP deltas and corrected LG-008 responsibility |
| [LG-008 five-profile static authority](28-lg008-five-profile-static-authority.md) | Completed Browser/Backend/Endpoint/LLM/MCP semantic reconciliation and exact assurance boundary |
| [LG-008 saturation and readiness](29-lg008-saturation-and-readiness.md) | Two-pass zero-drift closure and remaining independent live gates |
| [Production architecture and runtime revalidation](30-production-architecture-and-runtime-revalidation.md) | Final sensor-to-UI structural verdict, target-engine runtime evidence, bounded implementation authorization and exact remaining acceptance gates |
| [External readiness-audit reconciliation](31-external-readiness-audit-reconciliation.md) | Claim-by-claim disposition of the audit performed against historical commit 2614e7b |
| [Pre-code system-design closure](32-pre-code-system-design-closure.md) | Definitive component, communication, concurrency, pattern, API, limitation, technical-debt and implementation-choice closure matrix |
| [Enterprise connector platform direction](33-enterprise-connector-platform-direction.md) | Future managed-connector roles, agent/security/observability ecosystems, shared canonical plane and current-build compatibility invariants |
| [Agentic engineering execution system](34-agentic-engineering-execution-system.md) | Durable agent state, Cursor rules/skills, branch/PR hygiene, exact-SHA local/remote workflow, Jira import and coding-agent prompt |
| [Nuxt and shadcn-vue UI engineering constitution](35-nuxt-shadcn-ui-engineering-constitution.md) | Native Nuxt/Vue composition, source-owned shadcn/Reka primitives, token/variant styling, data boundary, accessibility and UI architecture gates |
| [Engineering execution kit](engineering-execution/README.md) | Ready-to-install repository instructions, state/topology/ledger templates, repository map and live branch-disposition baseline |
| [Production-readiness gate authority](production-readiness/README.md) | Executable LG-001..007 architectures, test catalog, evidence model, clean-room CI and implementation work packages |
| [Generated LG-008 authority](lg008/README.md) | Content-addressed profile, record, field, access, delta and target-trace authority |
| [Architecture decisions](registers/decisions.yaml) | Machine-readable binding decisions |
| [Module disposition](registers/module-disposition.csv) | Existing and target module classification |
| [Data authority](registers/data-authority.csv) | Every principal data class and its writer/read path |
| [Input disposition](registers/input-disposition.yaml) | Parent open-input items resolved, rebound to environment/certification, or deferred |
| [Authorization model](authz/model.yaml) | Capabilities, roles, attributes, relations and decision contract |
| [API field policy](authz/api-field-policy.yaml) | Fail-closed schema/field/dynamic-map classifications |
| [Entity ontology](ontology/entity-types.yaml) | Entity classes, strong-key classes and public prefixes |
| [Relationship ontology](ontology/predicates.yaml) | Predicates, semantics and valid endpoint type pairs |
| [Activity ontology](ontology/activity-types.yaml) | Families, subtypes, outcomes and correlation levels |
| [Field authority](ontology/field-authority.yaml) | Per-field precedence, sensitivity and conflict behavior |
| [Source normalization routing](ontology/source-normalization.yaml) | Profile record-to-normalized-output obligations |
| [Exact source relationship rules](ontology/source-relationship-rules.yaml) | Profile/type/predicate/type/semantic admission mapped to valid canonical ontology pairs |
| [Profile/envelope bindings](ontology/profile-envelope-bindings.yaml) | Allowed payload kind and lifecycle/stage to common record-type combinations |
| [Profile capability disposition](registers/profile-capability-disposition.csv) | Whether every profile kind is derivable, needs new capture, is legacy-only, or is unsupported |
| [Profile entity disposition](registers/profile-entity-disposition.csv) | Every Endpoint/LLM/MCP source entity enum, its canonical target, native evidence, conditions and forbidden promotion |
| [Sensor capability register](registers/sensor-capability-register.csv) | Exact native seam/field to target-object evidence |
| [Field disposition](registers/field-disposition.csv) | Admit, minimize, tokenize, prohibit, or leave unsupported for each important field family |
| [Relationship support](registers/relationship-support.csv) | Exact proof and automatic-materialization rule for every graph edge |
| [Future connector backlog](registers/future-connector-backlog.csv) | Deferred authoritative source and resulting entity/relationship coverage |
| [UI field lineage](registers/ui-field-lineage.csv) | Exact native/profile/canonical/read-model/API/UI chain for every primary customer-visible field |
| [Product OpenAPI](openapi/die-v1.openapi.yaml) | Executable customer API contract |
| [Edge ingest OpenAPI](openapi/starliner-ingest-v1.openapi.yaml) | Producer batch and signed configuration HTTP contract |
| [Producer enrollment manifest](schemas/producer-enrollment-manifest.schema.json) | Signed producer/scope/capability/certification bootstrap and revocation contract |
| [Tenant bootstrap manifest](schemas/tenant-bootstrap-manifest.schema.json) | Signed one-time tenant-root scope, closure, authorization-revision and audit bootstrap contract |
| [Normalization bundle](schemas/normalization-bundle.schema.json) | Deterministic multi-output normalization publication contract |
| [Canonical change pointer](schemas/canonical-change-pointer.schema.json) | Typed aggregate/evidence pointer-outbox wire contract |
| [Core PostgreSQL DDL](sql/001-die-core.sql) | Physical schema baseline |
| [ClickHouse DDL](sql/002-die-clickhouse.sql) | Activity/evidence search projection |
| [PostgreSQL roles and grants](sql/003-die-roles-and-grants.sql) | Runtime writer/read boundaries and RLS posture |
| [UI screen/API matrix](ui/screen-api-matrix.csv) | Route-to-query-to-state binding |
| [Nuxt seam verification](ui/nuxt-seam-verification.yaml) | Actual inspected shell evidence and UI-GATE-001..010 |
| [Defect closure ledger](registers/defect-closure-ledger.csv) | Consolidated AR/FP defects and LG live blockers with evidence/remediation |
| [Source-analysis inputs](registers/source-analysis-inputs.csv) | Every supplied context/analysis package, pinned revisions, evidence strength, permitted use and remaining admission work |
| [LG evidence needs](registers/lg-evidence-needs.csv) | Exact proof and closure state for LG-001 through LG-008 |
| [LG-008 evidence dispositions](registers/lg008-owner-inputs.csv) | Resolution or runtime-gate disposition of every former owner-input request; no developer input remains for static closure |
| [GitHub repository relevance](registers/github-repository-relevance.csv) | Every organization repository classified for the bounded source trace |
| [Source revision selection](registers/source-revision-selection.csv) | Historical dossier, current source, successful build and release qualifications kept separate |
| [Production source reachability](registers/production-source-reachability.csv) | Verified producer-to-relay/consumer/store/API edges and explicit unproven edges |
| [Implementation validation](tools/validate-freeze.mjs) | Structural and cross-reference checks |
| [Clean-room validation](tools/run-clean-room-validation.mjs) | One-command intrinsic or source-backed validation with retained evidence |
| [Schema contract tests](tools/test-schema-contracts.py) | Draft 2020-12 meta-validation and positive/negative fixtures for every source profile and core wire contract |
| [PostgreSQL DDL parse test](tools/test-postgres-ddl.py) | PostgreSQL grammar parse for the core and role/grant migrations; real database execution remains mandatory |
| [OpenAPI contract test](tools/test-openapi-contracts.py) | Independent OpenAPI 3.1 validation, including local schema references |
| [Live storage runner](tools/run-live-storage-conformance.sh) | Pinned PostgreSQL/ClickHouse DDL and behavioral conformance entry point |
| [Local PostgreSQL runner](tools/run-local-postgres-conformance.sh) | Disposable native PostgreSQL execution for exact target/compatibility prechecks; it does not replace retained container-digest evidence |
| [Local ClickHouse runner](tools/run-local-clickhouse-conformance.sh) | Disposable exact-engine DDL/current-view smoke execution; extended lifecycle, mutation and capacity gates remain mandatory |
| [Organization snapshot tool](tools/snapshot-quilrbusiness-org.mjs) | Repeatable authenticated GitHub repository inventory |
| [Repository classifier](tools/classify-quilrbusiness-repositories.mjs) | Deterministic triage plus evidence-based manual source/dependency/consumer classes |
| [Selected source/build snapshot](tools/snapshot-selected-github-revisions.mjs) | Pinned checkout and GitHub Actions evidence for selected repositories |
| [LG-008 authority generator](tools/build-lg008-authority.mjs) | Deterministic five-profile semantic merger and content-addressed manifest |
| [LG-008 authority validator](tools/validate-lg008-authority.mjs) | Cross-profile semantic, privacy, traceability, propagation and digest checks |
| [LG-008 authority query](tools/query-lg008-authority.mjs) | Exact stable-ID/profile/record/field lookup for source-access recipes |
| [LG-008 saturation runner](tools/run-lg008-saturation.mjs) | Two complete regeneration passes and final digest-bound validation |

## Authority

When implementation details conflict, precedence is:

1. architecture constitution and accepted ADRs;
2. executable schema/OpenAPI/DDL in this package;
3. decisions and data-authority registers in this package;
4. prose in this package;
5. parent DIE Pass;
6. broader Starliner corpus;
7. current `project-starliner` code;
8. sensor code and Quilr 1 behavior as evidence.

Current code is not target authority merely because it exists, but it is the required evidence authority for claims about what a current sensor captures. A target profile may demand new adapter/runtime behavior only when it is marked `new_capture_required`; it may not describe that behavior as current support. In particular, `SourceObservation.canonical_entity`, producer-emitted `EntitySnapshot`, producer-emitted `RelationshipEvent`, the legacy `starliner` ABI, and the top-level OPA demo are superseded as target contracts where they conflict with this package.

## What coding agents may choose

Only local, non-semantic implementation details:

- private function and file organization within a frozen module;
- equivalent tested library implementation behind a frozen interface;
- batch sizes and worker concurrency within configured limits;
- query plans and indexes that preserve contract and measured SLOs;
- component composition and styling within the accepted UI information architecture.

Changing an authority, schema meaning, identity key, authorization outcome, event family, relationship semantic, transaction boundary, API shape, or UI truth source requires an implementation ADR and corpus update.

The four owned sensors can support only the connected observed/configured subset marked `adapter_derivable` in the capability and relationship registers. `new_capture_required` facts require sensor/runtime changes before advertisement. They do not by themselves prove complete enterprise people, group, role, permission, credential, cloud, SaaS, repository or resource reachability. Coding agents must preserve `unsupported`/`unknown` entitlement coverage unless an authoritative connector profile is separately accepted and certified.

## Validation

```bash
python -m pip install \
  -r starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/requirements-test.lock
node \
  starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/run-clean-room-validation.mjs \
  --intrinsic
```

Source-authority regeneration is separate because it requires the authorized
revision-pinned source/evidence workspace:

```bash
CONSOLIDATE_ROOT=/authorized/evidence-root \
node \
  starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/run-clean-room-validation.mjs \
  --source
```

Then, on a host with Docker:

```bash
./starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/run-live-storage-conformance.sh
```

Passing the static suite, two zero-drift source regenerations and exact
PostgreSQL/ClickHouse target-engine smoke makes this package the implementation
authority for the bounded pass. It does not claim that production software,
provider behavior or native adapters have already been implemented. Engineering
may implement the full pass behind these contracts. Production acceptance and
customer claims remain gated by the expanded `LG-*` evidence in
[live conformance](22-live-storage-conformance.md) and the
[defect ledger](registers/defect-closure-ledger.csv). Exact topologies,
assertions and evidence exits for those gates are frozen in the
[production-readiness authority](production-readiness/README.md).
