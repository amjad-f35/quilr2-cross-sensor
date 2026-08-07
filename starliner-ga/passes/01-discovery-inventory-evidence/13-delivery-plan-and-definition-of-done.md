# Delivery Plan and Definition of Done

Status: **normative product-delivery accountability plan; scheduling is governed
by implementation-freeze document 41**

`P01..P10` retain responsibility coverage; they are not sequential permission
gates. Product construction advances through the cross-package `PI-001..PI-007`
vertical outcomes in document 41. Release evidence remains a separate axis.

[ADR-0022](../../adrs/0022-installed-product-vertical-delivery.md) and
[implementation-freeze document 43](implementation-freeze/43-installed-product-lifecycle-and-source-verticals.md)
govern installed-product prerequisites and source-vertical order. The complete
first customer release remains all five profiles; the first implementation
vertical is one real source through the permanent funnel.

## Work packages

### P01 — Freeze and ownership

- approve pass charter and claim language;
- assign named technical/product/security/SRE owners for bounded DIE;
- accept pass decisions;
- record external release/environment inputs without treating them as coding
  blockers;
- bind target repositories/modules and engineering system of record.

### P02 — Contracts and SDK

- concrete envelope and receipts;
- Browser/Backend/Endpoint/LLM/MCP typed record schemas;
- lifecycle/snapshot/gap/correction semantics;
- producer management API;
- product OpenAPI;
- generated SDKs;
- conformance CLI/fixtures.

### P03 — Edge/runtime and adapters

- common privacy/WAL/delivery/health;
- exact browser, endpoint, LLM, MCP adapters;
- workload identity and enrollment;
- capability manifests;
- source corrections and security remediation;
- exact artifact certification.

### P04 — Cell foundation

- ingest/admission/quarantine/receipt;
- PostgreSQL/object storage/ClickHouse;
- tenant routing and authorization;
- evidence replay;
- audit/observability;
- backup/restore;
- deploy/upgrade/rollback.

### P05 — Source intelligence

- five source-profile normalizers;
- source objects/claims/snapshots;
- catalog/source authority;
- drift/reprocessing;
- coverage/gap data.

### P06 — Canonical truth

- physical schema/migrations;
- resolver and bindings;
- canonical entity/relationship/activity/coverage transactions;
- merge/split/correction;
- outbox;
- evaluation corpus and quality gates.

### P07 — Product projections and APIs

- PostgreSQL inventory/overview/coverage read models;
- ClickHouse activity/evidence projection;
- rebuild/promotion;
- APIs, authorization, pagination, exports;
- complete generated product API/client contracts.

### P08 — UI

- Overview;
- five inventory collections;
- entity/source/identity pages;
- Activity & Evidence;
- Sources & Coverage;
- operator/audit/export;
- empty/partial/error/accessibility/large-tenant behavior.

### P09 — Separate parallel Quilr 1 migration/coexistence track

P09 is retained as the future continuity program. It is not a bounded DIE work
package, code dependency, UI requirement, or DIE-GA exit condition.

- live production inventory;
- immutable backfill;
- ID/API/export mapping;
- parity engine;
- dark/shadow/dual-read pilot;
- cohort cutover and fallback;
- customer/support communication.

### P10 — Production proof

- all-source E2E;
- performance/capacity;
- security/privacy/tenant;
- backup/DR;
- upgrades/version skew;
- pilots;
- gate evidence and signoff.

## Product-first coordination

```text
P01 maintains authority and ownership

P02..P08 + P10
  -> execute concurrently where their actual interface/data dependencies exist
  -> integrate through PI-001..PI-007 native-to-UI product outcomes
  -> close applicable release evidence in parallel

P09 migration/coexistence
  -> separate program consuming stable DIE seams
  -> never blocks bounded DIE construction or DIE-GA
```

Teams work in parallel against frozen contracts. A frontend fixture can support
design development but cannot become product proof. Missing code, a failing
test, an open release gate or unavailable remote validation is active work, not
a permission stop.

The primary integration lane advances through:

```text
PI-001  real tenant/bootstrap/enrollment and source health
PI-002  Endpoint installed-product vertical
PI-003A Browser Extension plus native host as one Browser producer stream
PI-003B Browser Backend server-owned-fact vertical
PI-004A LLM Gateway deployed-source vertical
PI-004B MCP Gateway deployed-source vertical
PI-005  exhaustive cross-source resolution and graph closure
```

Each source first proves one continuous native-to-UI trace. Endpoint and
Browser then prove the first real cross-source binding/relationship and an
unresolved negative before the remaining Gate-A verticals. Full supported-
profile breadth closes in parallel after that proof and remains mandatory for
the all-source definition of done.

## Final all-source production walking scenario

This is the customer-release acceptance scenario, not a prerequisite for the
first real source vertical.

1. Browser discovers a supported AI web surface and activity.
2. Endpoint discovers a related desktop artifact/process.
3. LLM Gateway observes a routed model execution for the application/workload.
4. MCP Gateway observes a registered server/tool and a supported invocation.
5. All records survive edge restart, duplicate delivery and one delayed source.
6. Platform admits immutable evidence and discloses one source gap.
7. Resolver creates one application product with distinct surfaces, plus agent/model/MCP/tool objects where supported.
8. Activity remains correctly distinct/correlated under exact identifiers.
9. UI shows inventory, relationships, timelines, evidence, coverage and provenance.

The separate migration track later proves Quilr 1 continuity, legacy backfill,
member-level parity, cohort enablement and read rollback. Those are not steps in
the bounded product scenario above.

## Definition of done

### Product

- every advertised question has a complete workflow;
- UI is simple and does not expose raw sensor spreadsheets;
- partial, empty, stale, conflict and error states are designed;
- accessibility and large-tenant UX pass;
- documentation, onboarding, support and limitations ship;
- no excluded capability is implied.

### Source/evidence

- all advertised event types are implemented and certified;
- exact official install/deploy artifacts, normal tenant/bootstrap and
  enrollment, normal supervisor/entrypoint and continuous native-to-UI traces
  are bound under document 43;
- WAL, receipts, replay, corrections and gaps pass;
- source-native IDs/provenance retained;
- no source canonical IDs;
- privacy/prohibited content tests pass;
- exact production artifacts are bound.
- Browser Extension owns the one logical Browser producer/WAL/delivery stream;
  the native host is a supporting capture component, never a WAL or delivery
  owner, and retains component lineage; Browser Backend remains a separate hosted
  producer and never double-counts relayed client activity.

### Inventory/activity

- required entities/relationships/lifecycle are implemented;
- resolver quality is approved;
- merge/split/correction/deletion/late data work;
- every material field has provenance;
- canonical/outbox atomicity passes;
- activity correlation is explainable;
- coverage gates negative/complete language.

### Runtime/API/UI

- deployment units and write authorities match the freeze;
- stores contain only their authorized state;
- workers are idempotent, fenced and observable;
- projections rebuild/promote/rollback;
- APIs are versioned, tenant-safe, paginated and bounded;
- no source-API or frontend truth mashup;
- SLO/capacity/backup/upgrade/support proof passes.

### Separate migration-track definition of done

This subsection applies only when the separately authorized migration program
is active. It is not part of bounded DIE completion or DIE-GA.

- live Quilr 1 inventory complete for cohort;
- backfill and member-level parity approved;
- compatibility mappings and consumers covered;
- one authority per domain;
- dark/shadow/pilot/cutover/rollback rehearsed;
- Quilr 1 remains available through stabilization;
- customer acceptance and support signoff.

### Governance

- all pass requirements trace to code/tests/artifacts;
- every valid external blocker is resolved for the affected release claim or
  remains isolated from independent product work;
- risks/owners/approvals current;
- immutable DIE-GA package approved;
- no critical waiver hides durability, privacy, security, tenant, identity, customer continuity, or unsupported claim.
