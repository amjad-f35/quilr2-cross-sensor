# Acceptance Scenarios

These scenarios define production-integration acceptance, not tests already
present in Quilr 1. Current runtime coverage is separately identified in
[`26-runtime-verification.md`](26-runtime-verification.md).

## Contract and schema

### A01 — Exact source profile

**Given** a source whose schema fingerprint, table/query profile, and mapping
version match the approved fixture, **when** extraction starts, **then** the
adapter reports the selected profile and emits typed observations.

### A02 — Compatible optional-field drift

**Given** an explicitly allowed additive nullable field, **when** the approved
compatibility rule sees it, **then** raw evidence retains it, known fields
still map, and health reports the observed fingerprint.

### A03 — Breaking schema drift

**Given** a renamed/removed field, incompatible type, key/order change, or
unknown profile, **then** the affected profile becomes
`schema_incompatible`, records are quarantined or extraction stops according
to the profile, and no checkpoint crosses the incompatible data.

### A04 — Null, empty, malformed, array, and timestamp cases

Verified source-field fixtures cover null versus absent, empty strings,
malformed JSON, arrays, time zones, precision, and boundary values. Expected
output must distinguish retained raw evidence, normalized value, explicit
filter, and quarantine.

## Identity, tenancy, and privacy

### A05 — Tenant binding

A row with an unambiguous allowed tenant is admitted to that tenant. Missing,
conflicting, or unauthorized tenant evidence is quarantined; it is never
assigned a default tenant.

### A06 — Alias collision

Two sources reporting the same email/domain/name but different source IDs
produce two source candidates and an explicit resolution case. The adapter
does not merge them.

### A07 — Cross-tenant collision

Identical source-local identifiers in different tenants remain isolated
through observation, candidate, relationship, canonical materialization, and
compatibility read.

### A08 — Sensitive content and secrets

Fixtures containing prompts/responses, credentials, access tokens, cookie
values, authorization headers, or secret-like strings follow the field policy:
reject, redact/tokenize, or restricted route. Such values never appear in
ordinary logs, health labels, or unrestricted evidence.

### A09 — Retention and deletion

An approved retention/deletion case proves behavior across WAL, quarantine,
raw evidence, normalized facts, materialized views, and backups or explicitly
documents each system that cannot yet comply.

## Delivery, replay, and recovery

### A10 — Restart at every boundary

Terminate the adapter before WAL persistence, after WAL persistence, during
delivery, after ingest acknowledgement, and before checkpoint commit. On
restart, every source row is either admitted once logically or retried with
the same deterministic observation ID.

### A11 — Duplicate source rows

Repeated extraction of the same source identity and content yields the same
observation ID and no duplicate canonical effect.

### A12 — Same identity, different content

The same source-scoped identity with a different digest is handled using the
declared correction/conflict rule. It must not silently overwrite immutable
evidence.

### A13 — Out-of-order and late rows

Late event-time records and out-of-order update-time rows retain event and
observation time and follow the profile-specific correction/materialization
rule.

### A14 — Network, ingest, and acknowledgement failure

Transient failure retries from WAL with bounded backoff; permanent validation
failure quarantines with a typed reason; checkpoint advancement follows the
defined durable acknowledgement only.

### A15 — WAL disk pressure/corruption

High-water and full-disk behavior is fail-closed and visible. Corrupt entries
are isolated with repair evidence; no source checkpoint skips unknown work.

### A16 — Source reset or truncation

When a cursor moves backward, a table is rebuilt, or a source identity is
reused, the adapter detects the reset and requires the configured recovery
procedure rather than assuming continuation.

### A17 — Reconciliation balance

For each profile/window:

`extracted = admitted + filtered + quarantined + rejected`

and admitted acknowledgements can be tied to materialization or a documented
in-flight state. Any imbalance produces a visible failure with record locators.

## Dependency degradation

### A18 — ClickHouse unavailable

Only ClickHouse-backed profiles become degraded; their checkpoints do not
advance. Process health must not report full capability merely because HTTP or
TCP is ready.

### A19 — PostgreSQL unavailable

Relational snapshots pause or fail according to startup policy. No H2
substitute is used in certification; PostgreSQL dialect, constraints,
transactions, and migrations are exercised.

### A20 — Neo4j unavailable

Graph extraction degrades independently. Other profiles continue. No empty
graph snapshot is interpreted as relationship deletion.

### A21 — Identity/PDP/external-service unavailable

The configured failure mode is tested per boundary. Tenant/policy uncertainty
must not admit data or commands unless an explicitly approved rule says
otherwise.

## Semantic admission

### A22 — Snapshot versus occurrence

Status/current-state rows are not emitted as occurrence events unless the
profile proves occurrence semantics. Re-running a snapshot produces stable
state assertions.

### A23 — Legacy signal versus finding

An alert/status/finding-shaped row enters as imported evidence or signal. It
becomes a canonical finding only when the separate finding admission rule and
detector version accept it.

### A24 — Relationship authority

A Neo4j or joined-row assertion carries source/evidence/authority. Conflicting
authoritative facts are not overwritten by a low-authority legacy assertion.

### A25 — Metric formula version

Legacy and canonical metric results include formula version, dimensions,
window/time basis, null behavior, and coverage. A formula change does not
silently rewrite historical meaning.

## Compatibility and product

### A26 — Golden route parity

For every selected route, golden fixtures compare request validation,
authorization input, response fields/types, null/empty behavior, ordering,
pagination, and error/status semantics. Each difference has an approved
exact/tolerated/retired decision.

### A27 — Known route contradictions

The frontend/backend AI-conversation filters and findings KPI mismatches have
one explicit compatibility result: implement the caller contract, implement
the controller contract, redirect/version, or retire. No test may pass by
silently ignoring the route.

### A28 — Coverage-visible empty results

When a capability is unavailable or the cohort excludes a source, the product
shows degraded/not-covered state. It does not present an ordinary empty list
as proof that no assets/activity/findings exist.

### A29 — Cohort isolation

Enabled tenants/routes read the target compatibility view; excluded cohorts
remain on legacy. Requests cannot cross cohort or tenant boundaries.

### A30 — Rollback

After a deliberately failed parity/health gate, routing returns to the prior
read path and the adapter returns to its recorded checkpoint/recovery state
without losing admitted evidence. The rollback drill records duration,
operator actions, and remaining reconciliation work.

## Future command scenarios

These are excluded from the MVS but required before any control cutover:

- duplicate idempotency key returns the original command identity/result;
- accepted-but-unobserved effect becomes `effect_unknown`, not `succeeded`;
- stale target version is rejected;
- authorization is re-evaluated at execution where required;
- native timeout and partial batch result remain distinguishable;
- a subsequent observation confirms, contradicts, or cannot determine effect;
- rollback/compensation is capability-specific and never assumed.

## Evidence required to mark a scenario passed

Each result must retain:

- source and target versions;
- source profile/schema fingerprint and mapping version;
- fixture or dataset locator and privacy classification;
- exact command/test version;
- expected and actual result;
- record counts and reconciliation output;
- logs/metrics/traces without unrestricted secrets;
- operator and timestamp;
- unresolved deviations and approval.

