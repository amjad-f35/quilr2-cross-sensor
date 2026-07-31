# Performance, Reliability, and Operations

## Service objectives

These are engineering release objectives for the pass, measured per production cell and per tenant. Contractual SLAs may be lower and are a commercial decision.

| Indicator | Objective | Measurement boundary |
|---|---:|---|
| Ingest availability | 99.95% monthly | valid certified record receives terminal or retry receipt |
| Product read API availability | 99.9% monthly | authorized bounded request, excluding invalid caller input |
| Evidence durability | no acknowledged record lost | receipt `accepted` through object/metadata restore verification |
| Ingest latency | p95 ≤ 300 ms, p99 ≤ 1 s | ≤100 records and ≤1 MiB compressed request, cell below saturation |
| Evidence-to-canonical freshness | p95 ≤ 10 s, p99 ≤ 60 s | admitted evidence to committed canonical watermark |
| Canonical-to-product freshness | p95 ≤ 5 s, p99 ≤ 30 s | canonical outbox to active product projection |
| Overview/list API latency | p95 ≤ 300 ms, p99 ≤ 1 s | default page, bounded filters |
| Entity/activity detail latency | p95 ≤ 500 ms, p99 ≤ 1.5 s | no raw evidence body |
| Activity search latency | p95 ≤ 1 s, p99 ≤ 3 s | 24-hour range, default page |
| Raw evidence access grant | p95 ≤ 1 s | authorization/grant creation, not full object transfer |
| Correction commit | p95 ≤ 1 s, p99 ≤ 3 s | already generated valid preview |
| Projection rebuild | old generation remains available | zero partial-generation customer exposure |
| Authorization isolation | zero unauthorized rows/fields | every request and export |

The system publishes good-event, valid-event and exclusion counters. It never improves SLOs by discarding slow or failed work.

## Capacity certification

Architecture supports horizontal scaling, but a GA artifact is certified against named reference profiles rather than “unlimited scale.” Each profile records:

- tenants and noisy-neighbor distribution;
- producers and concurrent connections;
- records/second and bytes/second, sustained and burst;
- entity/relationship cardinality;
- activity records/day and retention;
- source-object hot-key distribution;
- query/export concurrency;
- database/object/ClickHouse topology and resource limits;
- measured latency, lag, utilization, cost and saturation point.

The initial mandatory profile is `enterprise-cell-standard-v1`:

- 100 active tenants, including one tenant responsible for 40% of load;
- 10,000 active producers;
- 2,000 admitted records/second sustained;
- 10,000 records/second for a five-minute burst;
- 10 million current canonical entities;
- 50 million current relationships;
- 10 million activity versions/day;
- 250 concurrent product reads;
- 20 concurrent bounded export jobs.

These are release-test loads, not a promise that one database node carries them. A cell may use HA PostgreSQL, horizontally scaled stateless roles and a ClickHouse cluster. If the reference profile is changed, the version and measured evidence change; code semantics do not.

## Scaling model

| Role | Stateless | Horizontal unit | Saturation signal |
|---|---|---|---|
| ingest | yes, except object/PG authorities | request/producer shard | CPU, object put latency, PG admission commits |
| normalizer | yes | profile/partition leases | oldest work age, CPU, quarantine rate |
| truth | yes | aggregate partition leases | oldest truth age, lock contention, PG WAL/commit |
| projector | yes | destination/aggregate partition | outbox lag, ClickHouse insert/reconcile |
| API | yes | request/query class | concurrency, DB pool, query time |
| maintenance/export | yes with fenced jobs | job/tenant | job age, object/DB I/O |

Scaling adds replicas within a role artifact digest. Roles are independently
built and canary-deployed from one signed platform-release manifest; the
manifest declares the compatible role digests and N/N-1 protocol, work-contract
and database-schema ranges. A role does not own private truth. Partition
ownership is leased/fenced; rescheduling is safe.

## Workload isolation lanes

Low-volume enterprise truth must not wait behind high-volume activity. The
shared durable work table preserves one transaction/idempotency model, while
`partition_key` has the frozen routing form:

```text
lane:<control|inventory|activity|bulk>:<stable-partition>
```

The lane is centrally derived, never accepted from a sensor:

- `control`: producer health/gaps, identity commands and other bounded
  control-plane work;
- `inventory`: entity claims, identity, relationships, coverage,
  reconciliation and any mixed normalization bundle;
- `activity`: an activity-only normalization bundle/candidate and its
  append-oriented activity projection;
- `bulk`: replay, backfill, rebuild, export and maintenance.

If one normalization run contains activity plus any entity claim, relationship,
coverage or reconciliation output, it stays one atomic run in the `inventory`
lane. It is never split merely for throughput. Pure activity uses independent
normalizer/truth/projector replica pools, database connection budgets,
concurrency caps, autoscaling signals and oldest-work SLOs. Lane borrowing is
bounded and cannot exhaust the inventory/control reserve.

Activity remains evidence-backed canonical truth, but its physical path is
append-oriented: immutable candidates and versions, time partitions, per-
activity aggregate locks, batched outbox publication and batched ClickHouse
projection. There is no tenant-global or platform-global activity lock.

## PostgreSQL coordination limits

PostgreSQL work coordination is the frozen starting mechanism because it provides the required atomic output-plus-handoff boundary without dual writes. It is operated as a queue, not an indefinite event warehouse:

- only pending/retry/leased rows are hot;
- completed work is durably represented by `stage_execution` and may be pruned from `work_item` after the replay-safety window;
- partial indexes exclude completed work;
- autovacuum parameters are tuned per hot table and monitored;
- work is claimed in small batches using `SKIP LOCKED`;
- database pools are bounded per role and reserve operational capacity;
- no worker polls with a full-table scan;
- notification may reduce idle polling, but PostgreSQL state remains authoritative;
- large backfills use separate priority/concurrency pools.

A broker becomes justified only when measured queue update/WAL/vacuum load threatens canonical OLTP objectives after batching/partition/tuning. The replacement must preserve atomic handoff through the canonical transactional outbox and identical idempotency; it does not become truth.

## Contention control

- aggregate locks are tenant-scoped and transaction-scoped;
- acquire multiple locks in sorted UUID order;
- identity candidate search happens before the lock, then revalidates inside;
- canonical transactions contain no network call;
- transaction time and locked-row counts are bounded and measured;
- serialization/deadlock retries are capped with fresh reads and jitter;
- one hot aggregate gets its own partition budget and cannot block unrelated work;
- index changes are online/concurrent where supported and tested against write amplification.

## Query engineering

- every query has tenant, authorization and time/cardinality bounds;
- endpoint query plans are stored as reviewed fixtures using production-like statistics;
- CI detects sequential scans on protected high-cardinality paths where not deliberately accepted;
- keyset pagination includes stable ID tie-breaker;
- counts use maintained scoped rollups or bounded exact queries;
- API repository methods accept typed filters, not raw query fragments;
- ClickHouse queries always use tenant and time partition predicates;
- graph queries are one/two-hop bounded SQL, not recursive user expressions;
- statement/query timeouts and cancellation are mandatory;
- expensive exports run asynchronously from a fixed snapshot;
- N+1 database calls are release-gate failures.

## Backpressure and overload

Each cell has budgets for:

- object-put concurrency/bytes;
- admission transactions;
- work depth and oldest age per tenant/profile/stage;
- canonical outbox bytes/age;
- ClickHouse insert batches;
- API query concurrency and cost class;
- export bytes/concurrency.

Overload order:

1. shed optional/expensive exports and nonessential operator queries;
2. reduce projector/backfill concurrency where it competes with truth;
3. enforce per-tenant fairness;
4. return retryable `429/503` to affected data lanes;
5. preserve control/heartbeat/gap-reporting lane;
6. edge producers retain/retry from WAL;
7. declare an explicit coverage gap if a producer exhausts certified WAL capacity.

Ingest never acknowledges then drops. A cell does not silently sample audit-grade evidence.

## Failure matrix

| Failure | Correct behavior |
|---|---|
| object store unavailable | no accepted acknowledgement; retry/backpressure |
| object written, PG transaction fails | retry same digest; orphan scan after safety window |
| PostgreSQL primary failover | in-flight transaction aborts; lease/idempotency retry |
| normalizer crash | lease expires; identical deterministic output |
| resolver/materializer crash | transaction rolls back; aggregate work retries |
| ClickHouse unavailable | canonical truth continues within outbox budget; activity API marks stale/partial or fails |
| projector corrupt/buggy | stop generation, rebuild new generation, retain active old generation |
| authorization store stale/unavailable | sensitive requests fail closed |
| producer duplicate | digest match returns duplicate/accepted-equivalent receipt |
| producer sequence conflict | terminal integrity rejection and audit |
| late/out-of-order event | append system-time version; preserve event time |
| hot/noisy tenant | per-tenant quotas/fairness; other tenants retain SLO |
| region/cell loss | restore/failover per environment RPO/RTO; no change of data authority |

## Observability

All roles emit OpenTelemetry metrics, structured logs and traces with:

- tenant as a controlled high-level attribute only where telemetry tenancy permits;
- request, batch, evidence, work, aggregate and projection correlation IDs;
- no raw prompt/file/tool body, token, credential or unrestricted native ID;
- implementation/profile/schema/resolver/materializer/projector versions;
- outcome/reason and latency stage.

Mandatory metrics:

- ingest records/bytes/latency/receipt status;
- object put conflicts/errors/orphans;
- sequence duplicates/conflicts/gaps;
- work depth, oldest age, lease expiry, retry and quarantine;
- normalization/canonicalization latency and output changes;
- resolver result/conflict/merge/split counts;
- canonical transaction duration, locks and serialization retries;
- outbox depth/bytes/oldest age;
- projection checkpoint, lag, reconciliation mismatch and generation;
- API latency/error/rate/rows/bytes by operation;
- authorization allow/deny/error and revision age;
- database pools, connections, WAL, replication, locks, vacuum and partition health;
- ClickHouse insert/query/merge/part health;
- evidence/object referential verification;
- coverage by capability/population and freshness.

Metrics labels use bounded enums. Entity IDs, request IDs and native identifiers belong in traces/log lookup, not metric labels.

## Readiness, liveness and shutdown

- liveness answers only whether the process event loop/runtime is functioning;
- readiness verifies the role's required dependencies and ability to make progress;
- a projector can be unready without making ingest unready;
- startup validates contract/DDL compatibility and refuses an unsupported schema;
- shutdown stops accepting/leasing, drains bounded work, closes pools and lets leases expire safely;
- deploy systems use a termination grace period longer than maximum ordinary work unit;
- long exports checkpoint and resume instead of depending on termination grace.

## Alerts and ownership

Page on symptoms requiring immediate action:

- accepted-evidence integrity failure;
- cross-tenant/RLS/authz invariant failure;
- ingest availability burn;
- canonical freshness burn;
- outbox budget exhaustion risk;
- canonical/object restore verification failure;
- audit-chain/checkpoint failure.

Ticket or notify for:

- individual producer gap/degradation;
- identity conflict growth;
- certification approaching expiry;
- index/vacuum/capacity trend;
- failed optional export.

Every alert links a runbook, dashboard, owning module and safe diagnostic query. Alerts use multi-window burn rates for SLOs rather than isolated threshold noise.

## Backup, restore and disaster validation

Even though deployment-model selection is deferred, implementation must support:

- PostgreSQL point-in-time recovery with encrypted backups;
- object versioning/immutability and inventory manifests;
- coordinated manifest mapping PostgreSQL watermark to object inventory;
- restore into an isolated verification cell;
- ClickHouse rebuild from canonical/activity ledgers;
- audit/evidence digest sampling after restore;
- quarterly automated restore exercises in every supported deployment class.

Environment-specific RPO/RTO values are bindings, but restore correctness and tested procedures are release requirements.

## Optimization rule

Optimize only after preserving:

1. authority and evidence durability;
2. tenant/authorization isolation;
3. deterministic replay;
4. stable API semantics;
5. measured bottleneck evidence.

Caches, brokers, graph databases, secondary indexes and denormalized rollups are adapters. None may become the only copy of truth.
