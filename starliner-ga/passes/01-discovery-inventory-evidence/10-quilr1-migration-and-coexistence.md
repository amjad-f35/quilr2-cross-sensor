# Quilr 1 Migration and Coexistence

Status: **normative pass migration plan**

## Non-negotiable objective

No customer loses their existing inventory, event visibility, export, identity reference, integration, or support workflow because Quilr 2 discovery is introduced.

Quilr 1 remains operational until each tenant/domain cohort passes explicit parity and stabilization. No big-bang replacement is permitted.

## Two evidence paths during coexistence

### Live sensor path

Current sensor-native behavior continues. The new Starliner adapter observes the audited seam and sends Quilr 2 evidence through its own WAL. Existing product delivery remains intact until cohort cutover.

### Legacy backfill path

```text
Quilr 1 store/API
→ immutable tenant/domain extraction
→ legacy Starliner evidence profile
→ legacy normalizer
→ central resolver
→ canonical inventory/activity
→ explicit compatibility mapping
```

Legacy evidence never receives higher authority merely because it was customer-visible.

## Authority rule

During every phase, each domain declares:

- customer read authority;
- mutation authority;
- extraction direction;
- compatibility direction;
- watermark;
- fallback;
- conflict behavior;
- rollback trigger.

The pass has almost no customer governance mutations. Identity corrections, export jobs, and operational configuration still require one named authority.

## Cohort phases

### M0 — Production inventory

- enumerate live tenants, stores, tables, graphs, caches, APIs, jobs, exports and consumers;
- measure volumes, retention, region, quality, latency and active feature use;
- identify undocumented external dependencies;
- classify every field/event/edge into successor, legacy-only, ambiguous, or retired-later;
- freeze tenant/domain authority matrix.

### M1 — Dark live capture

- enable Starliner evidence path without customer reads;
- preserve all native delivery;
- prove durability, isolation, privacy, resource impact and source correctness;
- compare source event counts/members/gaps.

### M2 — Backfill and resolution

- extract immutable legacy evidence by watermark;
- resolve legacy IDs as aliases;
- split legacy composite rows where required;
- validate source/canonical membership and history;
- repeat incrementally until caught up.

### M3 — Shadow semantic comparison

Compare:

- canonical entity membership;
- lifecycle;
- aliases;
- relationships;
- source coverage;
- activity members and outcome semantics;
- timestamps/watermarks;
- API fields and filters;
- exports;
- authorization;
- retention.

Equal counts with different members fail.

### M4 — Internal and customer pilot

- enable explicit Quilr 2 UI/API for approved users/tenants;
- show migration status and known differences;
- maintain Quilr 1 read access;
- collect support, product, correctness and performance evidence;
- no silent per-request fallback/mashup.

### M5 — Cohort domain cutover

- Quilr 2 becomes customer read authority for discovery/inventory/evidence;
- compatibility endpoints translate approved legacy IDs/fields;
- Quilr 1 remains fallback for the declared window;
- monitor parity, SLO, support and rollback triggers.

### M6 — Stabilization

- resolve defects and intended differences;
- maintain reversible cohort state;
- approve end of fallback window for this domain;
- do not decommission broader Quilr 1 infrastructure in this pass.

## Compatibility mappings

Maintain versioned:

- legacy tenant/environment → Quilr 2 tenant/environment;
- legacy asset/event/graph ID → legacy source object;
- legacy source object → current canonical entity/activity;
- old API resource/field/filter → successor or unsupported;
- old export column → successor/semantic difference;
- source strategy → profile/subtype;
- legacy lifecycle/edge → typed disposition;
- legacy UI route/bookmark → successor;
- external consumer → migration status.

Mappings can be one-to-many, many-to-one, historical, unresolved, or retired. Forced one-to-one mapping is prohibited.

## Rollback

Triggers:

- material missing inventory/evidence;
- identity corruption or false merge rate beyond approval;
- cross-tenant/security/privacy defect;
- source resource regression;
- sustained SLO/capacity failure;
- incompatible export/API consumer;
- failed backup/restore;
- unacceptable customer/support impact.

Rollback:

- routes customer reads back to Quilr 1 for that tenant/domain;
- stops/promotes no destructive writes;
- retains Quilr 2 evidence and diagnostics;
- preserves watermarks and cohort state;
- does not delete or reverse immutable imports;
- requires corrective proof before retry.

## No dangerous dual write

- sensors may continue native product delivery while independently emitting evidence;
- canonical Quilr 2 state has only Quilr 2 writers;
- Quilr 1 remains its own authority before cutover;
- the frontend never writes the same mutation to both systems;
- any required propagation uses an explicit idempotent compatibility adapter and conflict ledger.

## Pilot acceptance

- customer member-level parity approved or differences signed as intended;
- supported queries and exports work;
- users/roles/tenant scope match;
- source freshness and gaps visible;
- no material performance regression in sensors or Quilr 1;
- rollback tested;
- support/runbooks staffed;
- customer communication and known limitations approved.

The machine authority matrix is [`registers/migration-matrix.csv`](registers/migration-matrix.csv).
