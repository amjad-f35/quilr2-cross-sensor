# Gap and Platform-Change Plan

**Decision context:** Quilr 1 is an existing platform/query/workflow layer, not
a native sensor. Its data migrates as immutable legacy evidence and
source-scoped facts. It is not promoted wholesale to canonical truth.

The row-level implementation ledger is
[`gaps.csv`](../../../matrices/sensor-intelligence/quilr1-platform/gaps.csv).

## P0: required before the first production cohort

### 1. Pin the source contract

The adapter must select a named extraction profile that binds:

- source system and environment;
- table/query name;
- expected columns, types, nullability, and key/order semantics;
- migration/schema fingerprint;
- tenant/subscriber binding rule;
- cursor/checkpoint rule;
- privacy classification;
- mapping version.

Source-controlled ClickHouse/PostgreSQL migrations are evidence, but not proof
of the deployed version. Neo4j still lacks a live constraints/indexes
snapshot. Any unexpected fingerprint must produce
`schema_incompatible/quarantined`, not best-effort silent coercion.

### 2. Add an immutable observation boundary

Each selected source row or response needs a versioned wrapper containing the
raw or losslessly canonicalized payload, source profile, source-scoped record
identity, cursor, capture time, schema fingerprint, digest, tenant binding,
and extraction version. The adapter may emit safe fact candidates in
addition; it must not discard evidence needed to reproduce the mapping.

### 3. Make delivery restartable

The Starliner WAL/outbox must persist evidence before delivery, retry
transient failures, quarantine permanent/schema/privacy failures, and advance
the durable source checkpoint only after the defined acknowledgement. The
legacy Redis `popFromSet` behavior cannot fill this role because its claim is
non-atomic and removal precedes downstream success.

### 4. Make identity and relationships source-scoped

The adapter emits source IDs, aliases, entity candidates, and relationship
assertions with evidence. The platform resolver owns canonical merge/split,
authority weighting, and conflict handling. Email, domain, app ID, account ID,
and graph aliases must not become global canonical IDs solely because their
strings match.

### 5. Add reconciliation and capability health

For every source/profile/window, report:

`extracted = admitted + intentionally_filtered + quarantined + rejected`

Also report checkpoint, source maximum watermark where measurable, lag,
schema compatibility, WAL depth/age, retry count, oldest failure, mapping
version, and last successful acknowledgement. Capability health must not be
derived from `/qb/health`, TCP readiness, or process liveness alone.

### 6. Define privacy handling before content migration

Identifiers, prompts, responses, URLs, headers, tokens, and audit payloads
cross trust boundaries. The default MVS excludes restricted content and
retains only approved metadata unless field-level classification, tenant
policy, encryption, access, retention, deletion, and secret rejection are
defined.

### 7. Build a selected compatibility facade

The project should prioritize critical read paths using live usage evidence,
not attempt to preserve every one of 141 backend operations and every
frontend branch in the first cohort. Each selected route needs:

- verified legacy request/response fixture;
- target read-model source;
- field-level equivalence/tolerance decision;
- error/status compatibility decision;
- unsupported-field behavior;
- cohort routing and rollback.

Known caller/controller contradictions must be resolved deliberately rather
than copied into a new canonical API.

## P1: required before broader feature parity

### Event and metric semantics

Define which rows are occurrences, snapshots, corrections, or aggregates.
Specify event time, observation time, update/retraction rules, and
late-arrival handling. Version the current executive metric formulas,
dimensions, null handling, and coverage. Monetary cost must wait for
finance-owned price/currency/allocation definitions.

### Finding admission

Legacy alert, status, and finding-shaped rows enter as evidence or signals.
Canonical findings require a detector identity/version, evidence policy,
severity/confidence semantics, lifecycle, deduplication, resolution, and
tests. No adapter mapping should infer this contract from table or DTO names.

### Commands and effects

Selected legacy mutations can become compatibility command candidates only
after idempotency, target identity/version, authorization, acknowledgement,
effect observation, timeout/unknown outcome, and rollback behavior are
defined. A 2xx or successful wrapper proves request handling, not native
effect.

### External contracts

Complete the real issuer, PDP, gateway, instance-manager, Kafka audit, MCP,
compliance, graph, extension, and other service contracts that selected
features depend upon. Repository-visible client code proves expected calls,
not the deployed provider behavior.

## P2: optimization and retirement

- measure data-backed query plans, throughput, lag, WAL growth, and cost;
- add partitioning, batching, and rate controls from measurements;
- automate drift detection and mapping compatibility reports;
- expose repair/replay operator workflows;
- retire unused compatibility routes only after traffic and owner evidence;
- retire Quilr 1 only after selected cohorts satisfy parity, retention, and
  rollback-exit criteria.

## Required changes by component

| Component | Required change | Not its responsibility |
| --- | --- | --- |
| Quilr 1 source stores/APIs | provide stable read access and schema/profile evidence | canonical identity, canonical findings, or delivery durability |
| Quilr 1 adapter | extraction, evidence wrapping, safe normalization, candidate/assertion emission, checkpointing inputs, reconciliation | global merge decisions, canonical product calculations, native enforcement claims |
| Starliner runtime | privacy gate, WAL/outbox, retry, acknowledgement, replay, quarantine, runtime health | inventing source semantics |
| platform ingest | validate envelope, tenant/integrity/evidence admission, deduplicate | source-specific semantic guesses |
| identity resolver | canonical identity and relationship decisions | source extraction |
| materializers | canonical inventory/activity/evidence/coverage and later metrics/findings | modifying immutable source evidence |
| compatibility API | selected legacy contracts over target projections | becoming a second canonical model |
| product UI/API | expose provenance, coverage, degradation, and actions | hiding unresolved source or mapping state |

## Delivery sequence

1. obtain live schema/profile evidence and choose the first tenant/table cohort;
2. freeze mappings and generate typed fixtures;
3. implement read-only extraction into Starliner WAL;
4. admit raw evidence and safe candidates/assertions;
5. validate restart, replay, drift, tenant, privacy, and reconciliation;
6. run shadow backfill and incremental catch-up;
7. compare selected legacy and target read models;
8. enable a compatibility-read cohort;
9. observe and repair until exit thresholds are met;
10. expand scope or roll back from recorded checkpoints.

No source mutation or Quilr 1 retirement is part of the first sequence.

