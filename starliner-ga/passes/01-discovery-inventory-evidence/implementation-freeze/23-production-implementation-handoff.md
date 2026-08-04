# Production Implementation Handoff

This is the coding-agent entry point for the bounded Discovery,
Inventory/Catalog, Activity/Observability and Evidence pass. Product boundaries
and selected-source enumeration are complete. Native artifact/runtime claims
remain certified separately by `LG-005`.

## Authority order

When artifacts disagree, use this order:

1. JSON Schema, OpenAPI, PostgreSQL/ClickHouse DDL and authorization policy;
2. ontology and exact source normalization/relationship rules;
3. decision and defect-closure registers;
4. implementation-freeze architecture documents;
5. outer pass documents and legacy/source analyses as evidence context;
6. existing project code.

Existing code never overrides a frozen invariant merely because it already
works differently.

## Complete target path

```text
Browser / Browser Backend / Endpoint / LLM Gateway / MCP Gateway
  → typed source adapter
  → Starliner envelope, privacy gate and edge WAL
  → authenticated bounded batch admission and exact ordered receipt
  → immutable content-addressed evidence + admission metadata
  → artifact-bound deterministic normalization bundle
  → source objects, claims and typed candidates
  → continuous source-scoped resolution and explicit conflicts
  → canonical entity, relationship, activity and coverage versions
  → transactional typed canonical/evidence-disposition pointer outbox
  → synchronized required-partition generation
  → PostgreSQL current read models + ClickHouse immutable search histories
  → authorization-before-query-planning API and field mask
  → generated client, DieRepository and information-dense Nuxt screens
```

No sensor assigns canonical IDs. No API joins sensors or legacy services at
request time. No projection is authority. No browser name/email/hostname/timing
creates a person or cross-sensor merge. No observed call becomes a configured
permission or entitlement.

## Required module boundaries

A modular monolith may host these modules initially, but their ownership and
transactions remain explicit:

- control: release-managed source-profile/version registry, tenant bootstrap,
  producer enrollment, certification, capability and expected populations;
- ingest: credential resolution, envelope/profile admission, object put,
  sequence/idempotency receipt and normalize work;
- normalization: registry-dispatched typed profile implementations (the five
  launch profiles in this pass), replay ledger, bundle digest and candidates;
- truth: resolution, conflicts, relationships, activity, coverage,
  reconciliation and pointer outbox;
- projection: one synchronized product generation, immutable required
  PostgreSQL/ClickHouse partition manifest, destination acknowledgements,
  current read models and rollback-ready standby;
- API: authentication, authorization planning, field mask, cursor,
  evidence/export redemption and audit;
- maintenance: partitions, retention, idempotency expiry, orphan checks,
  projection rebuild and signed audit checkpoints;
- UI: generated client, repository seam and screens from the UI matrix.

Workers are independently scalable processes or deployments by stage. They use
the shared codebase/contracts but have distinct database credentials, queues,
resource limits, SLOs and autoscaling signals. A worker never receives a
schema-wide writer credential.

## Product implementation order

Implementation is organized around customer-visible increments, not a
horizontal gate chain:

1. Build the real minimum control path: tenant bootstrap, signed producer and
   installation enrollment, credentials/configuration, revocation and health.
2. Drive one real source fact through WAL, admission, evidence, normalization,
   canonical truth, projection, authorized API and live Nuxt; then expand that
   same coherent runtime across all five profiles and every supported route.
3. Materialize exact identity, relationship, activity, coverage, ambiguity,
   succession and provenance semantics as the native source paths arrive.
4. Complete all frozen API/UI breadth, authorization, rebuild, lifecycle and
   operational behavior on that same product runtime.
5. Run `LG-001..LG-007` conformance continuously against exact candidates and
   correct failures without stopping independent product lanes.

Protocol generation, storage harnesses, native qualification, cryptographic
vectors, provider lifecycle tests and remote exact-SHA validation run in
parallel with product construction. They are mandatory release evidence, not
permission to implement another module. Hard code dependencies and release
gates are tracked in separate fields under document 41.

The target remains the complete intended bounded pass at the selected source
cutoff. The 1,837-field generated authority supersedes any inference that the
curated 71-row product field register is itself a native field inventory.

## Transaction stop conditions

Engineering stops and raises an ADR if implementation would:

- change an envelope/profile field meaning or admit prohibited content;
- synthesize a field a sensor cannot produce;
- skip raw evidence or provenance to create canonical truth;
- merge source identities on a weak key;
- publish a canonical/evidence disposition version without one pointer;
- mark work terminal without the same-transaction fenced execution, or commit
  an execution while work remains retryable;
- lease, retry, cancel, quarantine or publish execution for a stage not mapped
  to the session workload role;
- reclaim an expired lease by replacing its token, or leave a final expired
  attempt without the maintenance-only lease-recovery execution and quarantine;
- verify/activate a projection without every frozen required partition
  acknowledged at the same watermark;
- update a projection checkpoint without destination acknowledgement;
- authorize after count/search/pagination/query planning;
- return a field absent from the fail-closed field policy;
- expose an object-store URL;
- weaken RLS, cell assignment or runtime grants;
- make a failed live conformance assertion pass by deleting the invariant.

## Existing Nuxt seam

The inspected shell is
`/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt` at revision
`8c745c88e56cb6fc88a022415a596b5d436a5264`, with a dirty worktree. It was not
modified by this review.

The shell and shadcn-vue components are reusable. Its fixture repository is not
the production data layer. `ui/nuxt-seam-verification.yaml` is the exact
transition checklist and `ui/screen-api-matrix.csv` is the screen/operation
contract. `35-nuxt-shadcn-ui-engineering-constitution.md` is the UI
implementation authority: extend the shell through native Nuxt/Vue SFCs and
the checked-in shadcn-vue/Reka primitives, shared semantic tokens and typed
variants. Product components may compose primitives; a second wrapper design
system, cloned common primitives, alternate UI framework and arbitrary
per-page utility policy are prohibited.

## Readiness and implementation authorization

- Architecture and semantic authority: frozen for the selected-source facts;
  later source or runtime contradictions reopen only affected contracts.
- Executable static contracts: corrected and subject to two clean validator
  passes.
- Target-engine local smoke: PostgreSQL 17.10 passes the complete current DDL,
  roles and conformance transaction with checksums; ClickHouse 26.3.17.56 LTS
  passes DDL/materialized-view/tie/deletion smoke. Expanded contention,
  server-mode lifecycle, load, recovery and immutable CI evidence are active
  `LG-001`/`LG-002` qualification work.
- Object retention, erasure-target completeness, native runtime support,
  cross-language crypto and live Nuxt are active implementation and release-
  qualification work under `LG-003` through `LG-007`. Open evidence prevents
  the applicable production claim; it does not block continued construction.
- Migration, deployment portfolio, policy engine, findings/intelligence and
  cost/value: intentionally outside this bounded pass.

Production engineering is authorized to build and integrate the entire pass
from this handoff. Start with the real control/enrollment path and a coherent
native-to-UI product increment while conformance runs alongside it. Do not
rebuild a query-builder, wire Nuxt fixtures to ad hoc endpoints, or let a
diagnostic preview substitute for a missing internal product component.

The gate implementations must follow the exact topologies, catalog IDs,
evidence schema and exits in
[production-readiness](production-readiness/README.md). “Close LG-001” or
“close LG-005” is not an open-ended engineering instruction.

The active scheduling, status and blocker rules are in
[document 41](41-product-first-continuous-delivery-authority.md). They
supersede older gate-first wording without changing any gate assertion.

The final delta-freeze adds binding authority that supersedes any older open
wording in this handoff:

- [source temporal precedence](36-source-revision-and-retraction-precedence.md)
  plus its per-kind register and 25 executable PRC cases;
- [OIDC/JWKS and server-private sessions](37-oidc-jwks-and-runtime-session-lifecycle.md)
  plus machine schemas and PostgreSQL authorities;
- [manifest signer registry](38-manifest-signing-and-key-registry-lifecycle.md)
  plus machine schema, RLS, grants and immutable verification audit;
- [implementation conformance](39-implementation-conformance-and-transitional-removal.md)
  for the exact present-code/debt distinction; and
- [final closure](40-final-delta-freeze-closure.md) for the current build
  authorization.

The Nuxt revision above is the original inspected seam baseline, not a claim
about the current implementation branch. Current committed implementation
revisions and dirty-worktree exclusion are tracked only in
`registers/implementation-conformance.csv`.
