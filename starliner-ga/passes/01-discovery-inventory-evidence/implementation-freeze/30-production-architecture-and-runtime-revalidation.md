# Production Architecture and Runtime Revalidation

> **Historical evidence record:** this exact-date runtime report is not live
> program state. Current product capability and component revisions come only
> from implementation-repository program state and one runtime manifest under
> document 41.

**Review date:** 2026-07-30
**Scope:** the bounded Discovery, Inventory/Catalog,
Activity/Observability and Evidence pass
**Source boundary:** Browser, Browser Backend, Endpoint, LLM Gateway and MCP
Gateway selected revisions in `registers/source-revision-selection.csv`
**Defect authority:** `registers/defect-closure-ledger.csv`

## Direct verdict

The bounded architecture, domain semantics and implementation direction are
ready to freeze and build.

There is no known unresolved decision requiring an implementation team to
invent:

- which sensor facts are supported at the selected source cutoff;
- where native fact preservation ends and canonical authority begins;
- how evidence, normalization, identity, relationships, activity and coverage
  compose;
- which system owns authoritative state and which stores are rebuildable
  projections;
- how work is ordered, fenced, replayed and published transactionally;
- how RBAC, ABAC, ReBAC, tenant RLS and field masking compose;
- which product APIs and UI read models expose the resulting estate; or
- which modules, deployable worker roles and implementation dependencies form
  the production spine.

This does **not** mean future code is automatically correct or that all provider
and native runtime behavior has been certified. No engineering plan can
truthfully promise mathematical flawlessness. The bounded assurance achieved
here is:

> source-complete, cross-contract validated, exact-target-engine-smoke-tested
> implementation authority, with every remaining production acceptance claim
> isolated as an executable live gate.

Production engineering may start autonomously inside the frozen contracts.
Production acceptance and customer claims remain unqualified where
`LG-001..007` evidence is open. Product construction remains authorized.

## Re-derived sensor-to-product architecture

```text
Browser / Browser Backend / Endpoint / LLM Gateway / MCP Gateway
  │ native records, IDs, timestamps, capture context, health and capabilities
  ▼
thin typed source adapter
  │ preserve native semantics; prohibit unsupported or privacy-disallowed data
  ▼
Starliner edge runtime
  │ producer identity, epoch + sequence, UUIDv7 record ID, privacy gate,
  │ durable WAL/outbox, retry, receipt handling and signed configuration
  ▼
authenticated ingest admission
  │ profile/envelope validation, tenant/producer binding, idempotency,
  │ ordered receipt and evidence-scoped conditional object put
  ▼
immutable evidence + admission ledger
  │ raw bytes/object version + digest + provenance + lifecycle
  ▼
artifact-bound deterministic normalization
  │ one bundle may emit multiple source objects, claims, relationship
  │ candidates, activity candidates, coverage and conflicts
  ▼
continuous central identity resolution
  │ source-scoped objects → bindings/conflicts/decisions → canonical versions
  ▼
canonical truth transaction
  │ entity + relationship + activity + coverage + support lineage
  │ + exactly one typed transactional outbox pointer
  ▼
rebuildable, generation-bound read materialization
  ├─ PostgreSQL product-current inventory/graph/coverage projections
  └─ ClickHouse immutable activity/evidence search histories and current views
  ▼
authorization-before-query-planning API
  │ RBAC + ABAC + ReBAC + authorization revision + RLS + fail-closed masks
  ▼
generated TypeScript client → DieRepository → Nuxt/shadcn UI
```

This is a modular platform core in one versioned source authority, with
independently deployable and scalable runtime roles. It is neither a
request-time API mashup nor a fleet of independently semantic microservices.

## Why this does not recreate the Quilr 1 backend

Quilr 1 behavior is evidence context, not target architecture. The target has:

- one canonical mutation authority in PostgreSQL transactions;
- immutable source evidence and explicit evidence-to-claim-to-canonical
  lineage;
- typed, artifact-bound normalization rather than frontend interpretation;
- a transactional pointer outbox rather than cross-store dual writes;
- generation manifests, watermarks, acknowledgements and rollback-ready
  projections;
- ClickHouse and product read tables that can be rebuilt from authority;
- authorization before search, count, pagination and serialization; and
- one generated product contract through the Nuxt repository seam.

A projection is not a second backend authority. It is a disposable,
versioned query representation whose exact input watermark and generation are
verified before activation. A worker is not a new microservice owner; it is a
role-isolated execution of one frozen module with a narrow credential and
stage-specific lease/fence.

## Sensor and product completeness boundary

`LG-008` closed the static selected-source authority with:

| Measure | Closed value |
|---|---:|
| admitted profiles | 5 |
| source records | 148 |
| native fields dispositioned | 1,837 |
| exact access recipes | 422 |
| target traces | 931 |
| current-delta files classified | 140 |
| deterministic saturation passes | 2, zero drift |

These facts can drive the bounded connected estate:

- devices and observed operating-system/process context;
- local agents, applications, browser surfaces/profiles and accounts when
  supported by source evidence;
- LLM providers, products, accounts, models and observed requests;
- MCP clients, servers, configurations, capabilities/tools and observed tool
  calls;
- source-proven user/device/application/agent/server/model/tool relationships;
- activity, health, coverage, provenance, confidence, first/last seen and
  lifecycle state; and
- raw/restricted evidence references and authorized investigation views.

The platform must not synthesize enterprise person, group, role, entitlement,
filesystem ACL, cloud-resource, SaaS or repository reachability that the five
profiles do not prove. Those remain explicit future connector authorities.
Weak browser names, email-like strings, hostnames or temporal proximity cannot
create a person or cross-sensor merge.

## Cross-contract invariants rechecked

### Protocol and admission

- The common envelope is small and profiles remain typed.
- Canonical identity is never accepted from a sensor.
- `content_sha256` is the JCS digest of an explicit envelope-without-digest plus
  payload object.
- Delivery idempotency is producer, epoch and base-10 sequence scoped.
- Record IDs are UUIDv7 and JavaScript-safe numeric boundaries are explicit.
- Go, Java, Python, TypeScript and Rust use one generated wire representation
  and one detached JWS shape; execution parity remains `LG-006`.

### Evidence and lifecycle

- One object key belongs to one tenant/evidence identity, including when bytes
  have the same digest.
- Object keys include `evidence_id`, digest path and opaque provider version.
- No evidence-prefix lifecycle policy may delete bytes autonomously.
- Legal hold and erasure execution share one database linearization point.
- Terminal deletion requires receipts for every sealed placement target, not
  only the object store.

### Processing, replay and publication

- One admitted source record may produce a deterministic multi-output bundle.
- Every work execution is tenant, stage, subject, input and immutable
  implementation-version scoped.
- Lease tokens and execution fences prevent a stale worker from publishing.
- Final expired attempts have an evidenced maintenance recovery path.
- Canonical/evidence changes and their typed pointer commit atomically.
- Projectors acknowledge destination writes before checkpoint advancement.

### Identity, graph and time

- Source keys remain producer/profile scoped unless an accepted resolver rule
  proves a stronger binding.
- Canonical versions are immutable; heads start at one and advance exactly.
- Merge, split, alias and conflict history remain explicit and replayable.
- Relationship identity includes source-proven authorization/configuration
  scope where semantics vary by scope.
- Valid time and system time are separate; current rows are materialized from
  exact version heads, not overwritten history.
- Observed activity is not promoted into configured permission or theoretical
  entitlement.

### Authorization and tenancy

- Session tenant context must match an active role-specific principal binding
  in the assigned cell.
- Runtime logins have one effective DIE workload role, including transitive
  role membership checks.
- Worker stage authorization is independent from tenant RLS.
- Product authorization occurs before query planning, count, search,
  pagination, export and object redemption.
- Unknown schemas and fields fail closed; structured masking precedes
  serialization.
- Audit hashes use an explicit timezone-stable format.

### API, projections and UI

- OpenAPI is the product contract and generated clients are mandatory.
- Cursors bind authorization revision, filter, sort and generation.
- Exports bind an active caught-up product generation.
- PostgreSQL and ClickHouse projections retain authority watermark and
  generation; neither can mutate canonical truth.
- The Nuxt shell and shadcn components are retained, but fixture repositories
  and invented findings/risk/policy/spend data cannot enter production.
- Inventory lists remain concise; detail drawers/pages progressively disclose
  device, user/account, model, MCP, relationship, activity, coverage and
  evidence context rather than exposing raw telemetry spreadsheets.

## Runtime proof obtained in this pass

| Area | Evidence obtained | Result | Remaining boundary |
|---|---|---|---|
| PostgreSQL | disposable PostgreSQL `17.10`, data checksums, full current core DDL, roles/grants and conformance transaction | PASS | multi-session contention, crash/failover, expanded negative matrix and immutable image evidence (`LG-001`) |
| ClickHouse | SHA-256-verified official `26.3.17.56` LTS ARM64 binary, DDL/MV/current-view/tie/deletion smoke | PASS after `FP-069` correction | server-mode mutations, lifecycle negative scans, generation/load/query plans, recovery and immutable image evidence (`LG-002`) |
| Static contracts | freeze, schemas, OpenAPI, PostgreSQL grammar, source authority, link and outer-pass validators | PASS | rerun on every authority change |
| Source completeness | two deterministic five-profile regenerations | PASS, zero drift | native adapter execution/certification (`LG-005`) |

The exact evidence is retained in
`evidence/runtime/2026-07-30-target-engine-local-conformance.md`.

## Defects this final runtime pass caught

Static coherence alone had missed production-blocking defects. The revalidation
found and corrected:

- a nonexistent PostgreSQL JSONB function;
- invalid PL/pgSQL `IS DISTINCT FROM CASE` syntax;
- a deferred historical-head trigger that rejected a valid advance;
- generic trigger field access against incompatible row shapes;
- timezone-dependent audit hashing;
- ambiguous digest, idempotency and cross-language signature shapes;
- unsafe evidence-object sharing and a colliding digest-only key;
- a legal-hold/delete race and over-broad append-only privileges;
- stale PostgreSQL and ClickHouse version pins;
- ClickHouse 26.3 async-insert acknowledgement ambiguity; and
- an illegal nested aggregate in the ClickHouse evidence-current view.

Each correction has a ledger entry (`FP-055..069`) and a regression assertion.
The important lesson is preserved as policy: a passing parser or coherent
document set never substitutes for execution on the selected engine.

## Remaining production acceptance gates

| Gate | What is still unproven | Exact effect |
|---|---|---|
| `LG-001` | PostgreSQL contention, role/RLS expansion, crash/failover and immutable CI evidence | blocks production acceptance of canonical/storage behavior |
| `LG-002` | ClickHouse server-mode mutation, physical erasure, lifecycle, scale/query plans and recovery | blocks production acceptance of projections and physical deletion receipts |
| `LG-003` | selected object-provider versioning, retention, Object Lock/legal hold, exact-version delete, restore and races | blocks evidence retention/erasure/legal-hold claims |
| `LG-004` / `FP-014` | generated API client and live `DieRepository` through `UI-GATE-001..010` | blocks production customer UI |
| `LG-005` / `FP-050` | native capture-to-profile golden packs and selected MCP qualification | blocks shipping/advertising each sensor profile |
| `LG-006` | shared signing/digest/replay vectors executed in five languages | blocks cross-language trust and GA |
| `LG-007` | authoritative enumeration and negative scan of every historical physical evidence placement | blocks complete deletion claims |

These are not missing architecture decisions. They are implementation and
environment evidence that must be produced by the code being built and the
selected deployment providers. No developer input is required to close the
static design. Their exact harness topologies, test cases, artifacts and exit
criteria are frozen in
[the production-readiness gate authority](production-readiness/README.md).

## Implementation authorization and stop line

The engineering team and coding agents may now implement the full bounded pass
in the dependency order in `23-production-implementation-handoff.md`. They may
choose only local non-semantic details listed in `README.md`.

They must stop and raise a versioned ADR plus corpus change if implementation
would alter:

- an authority boundary, transaction or publication point;
- sensor/profile field meaning or privacy disposition;
- identity, merge/split, relationship or time semantics;
- replay/idempotency/signature bytes;
- tenancy, RLS, role/stage or field-mask outcome;
- API/DTO/cursor/export behavior; or
- the requirement that projections are rebuildable and non-authoritative.

An `LG-*` failure reopens only the affected contract. It does not authorize an
ad hoc workaround or a return to Quilr 1 API composition.

## Final bounded claim

For the selected source revisions and this bounded product pass:

- planning and architecture are complete enough to freeze;
- production implementation may begin autonomously from the package;
- no known in-scope structural or semantic blocker remains;
- the target database baselines have direct exact-version local smoke evidence;
- seven named runtime/provider integration gates still block their respective
  production or GA claims; and
- future source revisions, deployment selections or contrary runtime evidence
  require controlled revalidation rather than silent assumption.
