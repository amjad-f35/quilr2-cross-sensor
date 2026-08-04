# Production Implementation Capability Work Packages

These work packages are concurrent capability and accountability domains. They
are not sequential permissions and a package exit is not a prerequisite for
writing independent code in another package. Product increments in document
41 span multiple WPs and integrate continuously.

Every WP distinguishes:

- **implementation outcome**: production-path code and coherent integration;
- **release qualification**: applicable LG evidence on exact artifacts.

An open or failed release qualification keeps the release claim open. It does
not stop implementation.

## WP-00 — Reproducible authority

Implementation outcome: clean-room validation, intrinsic/source LG-008 modes,
pinned toolchains, CI, evidence schema, mutation tests and immutable authority
baseline are usable by every repository.

Qualification: intrinsic validation passes from a fresh checkout and source
mode reproduces zero drift in the authorized workspace.

## WP-01 — Storage product foundations and conformance

Implementation outcome: production PostgreSQL and ClickHouse adapters,
migrations, work/lease/outbox/checkpoint behavior and local integration
environments exist behind the frozen ports. Domain code may use those frozen
ports while extended engine tests continue.

Qualification: required `LG001-*` and `LG002-*` correctness, contention,
lifecycle, load and recovery rows pass at their specified evidence levels.

## WP-02 — Generated protocol and trust libraries

Implementation outcome: generated wire types and shared Go, Java, Python,
TypeScript and Rust trust libraries implement JCS/JWS/digest/replay and
configuration contracts required by the languages actually shipped.

Qualification: applicable `LG006-*` rows pass on release artifacts.

## WP-03 — Product control, enrollment and edge runtime

Implementation outcome: a real administrator can bootstrap a tenant; enroll,
rotate and revoke producer/installations; distribute verified configuration;
observe capabilities/health; and drive the durable privacy/WAL/delivery path.
No fixed UUID, persona shim, unsigned manifest, shared preview secret or manual
SQL substitutes for this product path.

Qualification: common `LG005-*` identity, restart, offline, privacy, receipt,
artifact and configuration cases pass.

## WP-04 — Ingest and immutable evidence product

Implementation outcome: bounded authenticated admission, idempotency, exact
receipts, conditional object put, evidence metadata transaction, orphan
reconciliation, retention and mediated reads operate in the coherent runtime.

Qualification: ingest conformance plus applicable `LG003-*` and `LG007-*`
provider/lifecycle rows pass.

## WP-05 — Five-profile normalization and source truth

Implementation outcome: registry dispatch and all five deterministic
multi-output normalizers persist observations, claims, typed candidates,
bundles and provenance for every frozen supported route. Native adapter work
and normalizer work proceed together; release qualification does not defer
either.

Qualification: every advertised LG-008 trace has native-to-normalized exact-
artifact evidence under `LG005-*`, and unsupported/new-capture facts remain
truthfully absent.

## WP-06 — Resolution and canonical materialization

Implementation outcome: source-scoped bindings/conflicts, type-specific
resolution, merge/split/alias, canonical entities, exact relationships,
activity, coverage, reconciliation, temporal succession, dependencies and the
pointer outbox operate continuously across all five profiles.

Qualification: identity/graph temporal, concurrency, replay, retraction and
failure suites pass at their required LG evidence level.

## WP-07 — Projectors and product read generations

Implementation outcome: PostgreSQL product read models and ClickHouse
activity/evidence projections consume pointer outboxes with destination
acknowledgements, checkpoints, generation build/verify/activate/standby,
rollback and rebuild. Manual activation remains harness-only.

Qualification: complete `LG002-*`, cross-store rebuild equivalence and
applicable erasure rows pass on exact candidates.

## WP-08 — Authorization and complete product API

Implementation outcome: OIDC/session identity, authorization revision,
RBAC/ABAC/ReBAC planning, RLS context, field policy, existence hiding, cursors,
all frozen operations, exports/evidence redemption, audit and generated clients
operate on canonical read models.

Qualification: tenant/field/export/API/security rows under `LG001-*`,
`LG004-*` and `LG006-*` pass.

## WP-09 — Nuxt customer product

Implementation outcome: the existing shell uses generated clients and
`DieRepository` for overview, inventories, details, connected graph, activity,
evidence, coverage, ambiguity, provenance and source health. Native Nuxt/Vue
composition and checked-in shadcn-vue/Reka primitives remain mandatory; no
fixture interior or alternate design system counts as product integration.

Qualification: `LG004-*` and `UI-GATE-001..010` pass against the coherent live
backend with production authentication and masking behavior.

## WP-10 — Native product integration and release qualification

Implementation outcome: Browser, Browser Backend, Endpoint, LLM Gateway and
MCP Gateway production adapters, WAL/senders, enrollment/configuration and
health paths are integrated into the coherent product. This is implementation,
not a test-only certification lane.

Qualification: signed artifacts pass every applicable `LG005-*` profile,
platform, degraded-mode and runtime matrix before the profile is shipped or
advertised.

## WP-11 — Lifecycle and operational product qualification

Implementation outcome: placement authority, sealed erasure planner,
provider/ClickHouse/cache/export workers, negative scanning, restore
reconciliation, observability, SLOs, load, chaos, backup and runbooks operate
on the integrated candidate.

Qualification: `LG007-*`, remaining security/operational gates and pilot
acceptance pass.

## Cross-WP integration responsibility

No WP owner may claim a product outcome from an isolated branch. Product
increments `PI-001..PI-007` in document 41 and the machine capability map bind
the cross-WP outcome. If a native/provider lane has a valid external blocker,
other backend, graph, authz, API, UI and operations work continues.

## Change control

Implementation may choose private code structure, libraries behind frozen
interfaces, concurrency values within bounded profiles and equivalent query
plans. It raises an ADR only when executable evidence proves that fulfilling
the product would otherwise change authority, identity, graph, evidence,
replay, cryptographic, tenancy, transaction, API or UI truth semantics.
