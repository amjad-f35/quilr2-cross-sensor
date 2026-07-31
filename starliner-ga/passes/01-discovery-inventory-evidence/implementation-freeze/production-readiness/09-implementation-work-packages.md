# Production Implementation Work Packages

These work packages are dependency-ordered. They are not permission to omit
later work, weaken contracts or substitute mocks for release evidence.

## WP-00 — Reproducible authority

Deliver clean-room validation, intrinsic/source LG-008 modes, pinned
toolchains, CI, evidence schema, mutation tests and clean immutable baseline.

Exit: intrinsic validation passes from a fresh checkout and source mode
reproduces zero drift in the authorized workspace.

## WP-01 — Storage conformance foundations

Implement expanded PostgreSQL and ClickHouse harnesses before domain workers
depend on accidental engine behavior.

Exit: required `LG001-*` and `LG002-*` correctness cases pass; load/failover
may continue in parallel but any semantic failure reopens the contract.

## WP-02 — Generated protocol and trust libraries

Generate wire types and shared vector runners for Go, Java, Python, TypeScript
and Rust. Implement JCS/JWS/digest/replay/configuration verification.

Exit: `LG006-*` passes and producer enrollment can trust every supported
implementation.

## WP-03 — Control, enrollment and edge runtime

Implement tenant bootstrap, producer/workload identity, certification,
capability history, signed configuration, edge privacy gate and durable WAL.

Exit: common `LG005-*` restart/offline/privacy/receipt cases pass.

## WP-04 — Ingest and evidence

Implement bounded delivery admission, idempotency, evidence-object conditional
put, metadata transaction, receipts, orphan reconciliation, retention and
mediated reads.

Exit: ingest conformance plus `LG003-*` provider cases pass.

## WP-05 — Normalization and source truth

Implement generated dispatch and the five deterministic multi-output
normalizers. Persist observations/claims/candidates/bundles with provenance.

Exit: every supported LG-008 trace has a golden native-to-normalized case and
no new-capture/optional field is fabricated.

## WP-06 — Resolution and canonical materialization

Implement source-scoped bindings/conflicts, merge/split/alias, versioned
entities, relationships, activity, coverage, reconciliation and pointer
outbox.

Exit: identity/graph temporal, concurrency and replay suites pass.

## WP-07 — Projectors and read generations

Implement PostgreSQL product materializers, ClickHouse projectors, destination
acknowledgements, checkpoints, generation build/verify/activate/standby and
rebuild.

Exit: complete `LG002-*` and cross-store rebuild equivalence passes.

## WP-08 — Authorization and product API

Implement identity/authentication integration, authorization revision,
RBAC/ABAC/ReBAC planner, RLS context, field masks, cursors, export and evidence
redemption, auditing and generated clients.

Exit: tenant/field/export/API contract and security suites pass.

## WP-09 — Nuxt customer product

Replace fixtures through `DieRepository`; implement overview, inventories,
detail, graph, activity/evidence and progressive disclosure using only frozen
DTOs. Continue the existing shell through native Nuxt/Vue composition and its
checked-in shadcn-vue/Reka primitives, semantic tokens and typed variants under
`35-nuxt-shadcn-ui-engineering-constitution.md`; do not introduce a parallel
wrapper design system or alternate component framework.

Exit: `LG004-*` and `UI-GATE-001..010` pass.

## WP-10 — Native release certification

Build signed sensor artifacts and run profile matrices on supported native
environments.

Exit: applicable `LG005-*` passes per advertised profile/artifact/runtime.

## WP-11 — Erasure and operational qualification

Implement placement authority, sealed planner, provider/ClickHouse/cache/export
workers, independent negative scanner, restore reconciliation, SLOs, load,
chaos, backup and runbooks.

Exit: `LG007-*`, remaining operational/security gates and pilot acceptance
pass.

## Change control

Implementation may choose private code structure, libraries behind frozen
interfaces, concurrency values within bounded profiles and equivalent query
plans. It must raise an ADR before changing authority, identity, graph,
evidence, replay, cryptographic, tenancy, transaction, API or UI truth
semantics.
