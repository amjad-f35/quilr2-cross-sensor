# Runtime, Storage, Workers, and Scaling

Status: **normative physical topology for the pass**

## Cell topology

```mermaid
flowchart LR
  S["Certified sensor adapters and Edge WALs"] --> I["die-ingest-api"]
  I --> O["Immutable object storage"]
  I --> P["PostgreSQL evidence inbox"]
  P --> N["die-normalizer-worker"]
  N --> T["die-truth-worker"]
  T --> C["PostgreSQL canonical ledgers and outbox"]
  C --> R["die-projection-worker"]
  R --> PR["PostgreSQL product read models"]
  R --> CH["ClickHouse activity projection"]
  PR --> A["die-product-api"]
  CH --> A
  A --> UI["die-web"]
  Q1["Quilr 1 stores/APIs"] --> M["die-migration-worker"]
  M --> I
```

## Deployment units

### `die-ingest-api`

- stateless replicas behind regional routing;
- verifies workload identity, tenant, artifact/capability, schema, size, privacy and idempotency;
- commits evidence metadata/inbox and object reference before `accepted`;
- returns per-record dispositions;
- does not normalize or resolve identity synchronously.

### `die-normalizer-worker`

- one governed artifact hosting profile-specific modules;
- claims leased evidence partitions;
- deterministic by evidence bytes, profile, catalog, and normalizer version;
- writes versioned normalized observations;
- never assigns canonical IDs;
- reprocessing writes a candidate version before promotion.

### `die-truth-worker`

- owns resolver, source bindings, canonical inventory, relationships, activity and coverage;
- partitions by tenant and resolution/aggregate key;
- serializes conflicting aggregate mutations;
- commits canonical mutation and transactional outbox together;
- supports merge/split/correction impact and replay;
- cannot read ClickHouse as authority.

### `die-projection-worker`

- consumes canonical outbox at least once;
- writes PostgreSQL product read models and ClickHouse activity rows;
- stores checkpoints and source versions;
- builds candidate namespaces for rebuild;
- cannot create entities, relationships, activities, confidence, or lifecycle facts.

### `die-product-api`

- stateless authorized replicas;
- reads versioned pass contracts;
- never calls sensors for customer inventory/activity;
- exposes freshness and degraded state;
- initiates bounded export jobs through an internal job module;
- does not perform background identity or projection work in request handlers.

### `die-migration-worker`

- tenant/domain-scoped leased jobs;
- extracts immutable legacy records;
- maintains watermarks/checksums;
- builds compatibility mappings and parity reports;
- cannot silently write back into Quilr 1;
- has lower resource priority than live ingest and interactive reads.

## PostgreSQL ownership

Suggested logical schemas:

```text
evidence
  admission
  object_reference
  sequence_state
  quarantine
  work_partition

source
  normalized_observation
  source_object
  source_claim
  snapshot

identity
  binding
  decision
  conflict
  merge_split_history

canonical
  entity
  entity_version
  relationship
  relationship_version
  activity
  activity_version
  coverage_interval
  outbox

product
  overview
  inventory_item
  entity_detail
  relationship_summary
  coverage_summary
  projection_checkpoint

migration
  extraction
  watermark
  legacy_mapping
  parity_result
  cohort_state

audit
  event
```

Exact DDL, indexes, partitions, RLS, migrations, and retention are a release-blocking design artifact.

## ClickHouse ownership

ClickHouse contains only rebuildable:

- canonical activity projection;
- safe evidence-search projection;
- bounded activity aggregates;
- source/producer operational time series where approved.

Every row includes tenant, canonical/evidence IDs, projection version, source watermark, event time, ingest time, retention class, and authorization-safe filter dimensions.

No identity merge, ownership, lifecycle, coverage denominator, or canonical mutation originates in ClickHouse.

## Work and partition model

| Stage | Partition key |
|---|---|
| ingest idempotency | tenant + producer + epoch + sequence/idempotency key |
| normalize | tenant + source profile + producer/source object |
| resolve | tenant + resolution key or source-object namespace |
| canonical activity | tenant + correlation/aggregate key |
| product projection | tenant + canonical aggregate |
| ClickHouse projection | tenant + time bucket + activity partition |
| migration | tenant + legacy store/domain + extraction range |

Partition reassignment uses leases with fencing tokens. A stale worker cannot commit after lease loss.

## Backpressure

Priority order:

1. ingest durability and receipts;
2. tenant/security/audit state;
3. live normalization and truth;
4. interactive product reads;
5. live projections;
6. reconciliation;
7. migration/backfill;
8. rebuild/export.

Queues are bounded. Lag and coverage impact are visible. Batch work cannot starve live traffic.

## Rebuild

```text
declare projection/version/tenant scope
→ pin canonical input watermark
→ create candidate namespace
→ replay idempotently
→ validate counts, members, invariants, authorization, samples
→ catch up to current outbox
→ compare customer-impact diff
→ atomic alias/checkpoint promotion
→ monitor
→ retain prior namespace for rollback
→ expire under policy
```

Canonical state is never cleared to rebuild a projection.

## Scaling and HA

Exact replica counts require a certified profile. Architecture requires:

- failure of one stateless replica does not lose accepted data;
- worker scale-out preserves partition fencing and idempotency;
- largest supported tenant and noisy-neighbor tests pass;
- ClickHouse and PostgreSQL have backup/restore and capacity headroom;
- migration/replay can pause independently;
- all roles expose readiness, lag, oldest age, throughput, rejects, retries, saturation, tenant fairness, watermark, and version;
- on-prem or small deployments may colocate roles only under an explicitly certified profile.

## Technology admission

Adding Kafka, a graph database, external search, Redis, or another service requires:

- measured unmet requirement;
- named query/workload;
- authority remains unchanged;
- failure and recovery design;
- tenancy/privacy assessment;
- backup/restore and SLO;
- cost and operational owner;
- rebuild/removal plan;
- approved ADR.
