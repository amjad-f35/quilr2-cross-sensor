# Quilr 1 Migration and Cutover

Status: **normative migration plan**

## Objective

Move customers from Quilr 1’s composite, source-dependent inventory and analytics to the Quilr 2 canonical architecture without losing evidence, identity history, policy state, customer workflow, or rollback.

## Migration principles

- Extract legacy data as evidence with lineage.
- Do not grant legacy tables/graph nodes canonical authority by default.
- Re-resolve under the Quilr 2 claim/authority model.
- Compare semantic customer outcomes, not only row counts.
- Cut over tenant cohorts and feature domains independently.
- One system is authoritative for each mutation during coexistence.
- Preserve external IDs through aliases and compatibility mappings.
- Never decommission before rollback and retention obligations are complete.

## Discovery and inventory

Before implementation:

- enumerate legacy stores, tables, graphs, caches, APIs, exports, jobs, and consumers;
- classify data authority, retention, volume, region, quality, and source;
- identify active tenants and feature usage;
- identify external integrations and undocumented dependencies;
- pin extraction code/version and source watermarks;
- register unsupported or contradictory semantics.

The existing repository analyses are the starting evidence, not a substitute for live production discovery.

## Legacy extraction

Each export record contains:

- tenant and environment;
- source system/store;
- table/label/resource and legacy ID;
- extraction job/version/watermark;
- raw or normalized legacy fields;
- source timestamps and known ambiguity;
- deletion/tombstone state;
- source strategy/type;
- evidence availability;
- checksum and count partition.

Exports are immutable, encrypted, resumable, and region-bound.

## Transformation

```text
legacy export
  -> Starliner legacy source record
  -> immutable evidence
  -> legacy normalizer
  -> imported claims/source objects
  -> central resolver
  -> canonical entities/relationships/activity
  -> Quilr 2 findings/metrics
```

Every transformation is versioned and replayable.

## Compatibility mapping

Maintain:

- legacy ID -> source object;
- legacy ID -> current canonical entity, with history;
- legacy source strategy -> normalized source profile;
- legacy event/finding/policy type -> successor or explicit retirement;
- legacy API field -> successor field/semantic difference;
- legacy graph edge -> typed relationship disposition.

Mappings can be one-to-many or unresolved; forced one-to-one mappings are prohibited.

## Coexistence phases

### 1. Dark backfill

Quilr 1 remains authoritative. Quilr 2 imports and materializes without customer exposure.

### 2. Shadow comparison

Automated and human comparison of inventory, relationships, findings, activity, policy, and metrics.

### 3. Dual read

Selected users see Quilr 2 with documented fallback to Quilr 1. Mutations still have one named authority.

### 4. Domain cutover

One domain becomes Quilr 2 authoritative for a tenant cohort. Compatibility events/API map back only where required.

### 5. Stabilization

Monitor correctness, SLO, workflow, support, and rollback triggers through the defined window.

### 6. Legacy read-only

No new legacy mutations. Retained only for audit/support/rollback under policy.

### 7. Decommission

After approvals, erase/archive according to retention and remove infrastructure, credentials, jobs, and access.

## Parity

Parity dimensions:

- entity identity and lifecycle;
- ownership/approval;
- source coverage;
- relationships;
- activity counts under the same semantics;
- findings and lifecycle;
- policy state and decisions;
- users/roles;
- API/export behavior;
- retention and regional placement.

Differences are classified as defect, intended semantic correction, unsupported legacy behavior, or data-quality limitation. Equal counts with different members fail parity.

## Mutation authority

During coexistence, the authority matrix declares per domain:

- authoritative system;
- permitted writer;
- propagation direction;
- idempotency;
- conflict behavior;
- rollback;
- cutoff watermark.

Avoid bidirectional dual-write. Where unavoidable, use an explicit synchronizer and conflict ledger.

## Rollback

Rollback triggers include material identity corruption, missing customer data, unsafe policy/control, breached SLO, incompatible integration, or unresolved security/privacy issue. Rollback preserves Quilr 2 evidence and decisions for analysis; it does not destructively reverse imports.

## Tenant cohort readiness

- source/profile coverage sufficient;
- backfill and parity complete;
- user/role mapping tested;
- policy/workflow mapping approved;
- integrations and exports migrated;
- customer communication/training;
- support and rollback staffed;
- region/retention verified;
- accountable customer and Quilr approvals.

## Completion

Migration completes only after every tenant/domain is cut over or contractually retired, external consumers are migrated, legacy mutation stops, rollback window closes, retention/legal hold is satisfied, and decommission proof is approved.
