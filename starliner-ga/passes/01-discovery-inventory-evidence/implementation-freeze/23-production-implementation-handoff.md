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

## Build and gate order

1. Extend the passing exact-version local storage smoke into the digest-pinned,
   multi-session/server-mode `LG-001` and `LG-002` conformance suites.
2. Generate protocol/OpenAPI clients and shared JCS/JWS/safe-integer vectors.
3. Implement signed tenant bootstrap and producer enrollment/certification.
4. Implement ingest admission, object storage and exact receipts.
5. Generate the five normalizers from the closed `LG-008` authority, then
   implement and run native golden certification packs under `LG-005`.
6. Implement source identity, truth materialization and reconciliation.
7. Implement pointer projectors and generation verification.
8. Implement authorization planner, API serializers, evidence/export redemption
   and audit.
9. Replace the fixture Nuxt repository with the generated `DieRepository`,
   preserving fixtures only behind an unreachable production switch.
10. Run the full functional, security, chaos, restore, performance,
    accessibility and supply-chain gates.

This order is dependency order, not permission to omit later modules. The
target is the complete intended bounded pass at the selected source cutoff.
The 1,837-field generated authority supersedes any inference that the curated
71-row product field register is itself a native field inventory.

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
contract.

## Readiness at handoff

- Architecture and semantic authority: frozen for the selected-source facts;
  later source or runtime contradictions reopen only affected contracts.
- Executable static contracts: corrected and subject to two clean validator
  passes.
- Target-engine local smoke: PostgreSQL 17.10 passes the complete current DDL,
  roles and conformance transaction with checksums; ClickHouse 26.3.17.56 LTS
  passes DDL/materialized-view/tie/deletion smoke. Expanded contention,
  server-mode lifecycle, load, recovery and immutable CI evidence remain
  blocked until `LG-001`/`LG-002` pass.
- Object retention and erasure-target completeness, sensor certification,
  cross-language crypto and live Nuxt: blocked until their applicable
  `LG-003` through `LG-007` gates pass.
- Migration, deployment portfolio, policy engine, findings/intelligence and
  cost/value: intentionally outside this bounded pass.

Production engineering is authorized to begin from this handoff. Start with
the expanded live conformance and generated contract foundations, then follow
the dependency order above. Do not start by rebuilding a query-builder or
wiring the Nuxt fixtures to ad hoc endpoints.

The gate implementations must follow the exact topologies, catalog IDs,
evidence schema and exits in
[production-readiness](production-readiness/README.md). “Close LG-001” or
“close LG-005” is not an open-ended engineering instruction.
