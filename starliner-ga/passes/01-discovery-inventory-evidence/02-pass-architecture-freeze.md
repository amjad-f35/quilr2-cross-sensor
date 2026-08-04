# Pass Architecture Freeze

Status: **normative implementation architecture for DIE-GA**

## Frozen end-to-end path

```text
native sensor seam
→ typed adapter
→ local privacy disposition
→ durable edge WAL
→ authenticated tenant-cell ingest
→ immutable evidence and per-record receipt
→ deterministic source normalizer
→ normalized observation
→ continuous central resolver
→ canonical inventory, relationship, activity and coverage ledgers
→ transactional outbox
→ PostgreSQL product read models and ClickHouse activity projection
→ unified product APIs
→ DIE Pass UI
```

No stage may be replaced by a frontend join, source-specific BFF, or direct sensor write to canonical state.

## Code and deployment form

The pass uses a **modular platform codebase with a small number of role-specific deployments**.

Logical modules do not become independent microservices. The baseline roles are:

| Runtime role | Responsibility | Canonical write authority |
|---|---|---|
| `die-ingest-api` | workload authentication, tenant routing, validation, evidence admission, receipt | evidence inbox/metadata only |
| `die-normalizer-worker` | profile-specific deterministic normalization | normalized observation ledger only |
| `die-truth-worker` | identity resolution, canonical entity/relationship/activity/coverage mutation | canonical module |
| `die-projection-worker` | PostgreSQL read models, ClickHouse activity/aggregate projection, rebuild | projection schemas only |
| `die-product-api` | authorized inventory, activity, evidence, coverage, export, audit reads | no new truth |
| `die-maintenance` | projection lifecycle, integrity, retention, repair, export and signed tenant/producer administration | maintenance state; producer/control registry only under short-lived dedicated credentials |
| `die-web` | customer and operator UI | API only |

Roles may be built from one governed repository/artifact family and may share domain libraries. They run separately where workload or failure isolation requires it. Small supported deployments may colocate roles without weakening transaction or authority rules.

## Minimal stores

Required:

- **PostgreSQL:** control/producer state, evidence metadata/inbox, normalized observations, identity claims/bindings, canonical ledgers, inventory read models, projection checkpoints, audit, maintenance state, and transactional outbox;
- **object storage:** encrypted immutable evidence payloads, large safe snapshots, exports, rebuild artifacts;
- **ClickHouse:** high-volume activity/evidence search projection and bounded activity aggregates.

Not required for the pass:

- graph database;
- external search engine;
- Redis cache;
- durable workflow engine;
- policy engine;
- independent event broker.

PostgreSQL inbox/outbox and leased work partitions are the baseline durable work mechanism. A Kafka-compatible log may be introduced only through an ADR after measured throughput/replay evidence demonstrates that PostgreSQL cannot satisfy the certified profile. It does not become an authority.

## Product read-path rule

- Overview → precomputed PostgreSQL pass summary.
- Inventory list/detail/relationships/coverage → PostgreSQL product read models.
- Activity/evidence search → ClickHouse, returning canonical/evidence IDs and safe summary fields.
- Evidence chain-of-custody detail → PostgreSQL/object-storage metadata through the Evidence API.
- Search → PostgreSQL full-text/trigram indexes for the pass.
- Export → immutable authorized snapshot job.

Normal UI requests never query multiple sensor APIs. A screen requiring repeated ad hoc cross-store reconciliation must receive a proper read model before release.

## Consistency

- evidence is immutable and append-only;
- normalized observations are versioned and replayable;
- canonical mutation and outbox commit atomically;
- projections are at-least-once, idempotent, and disposable;
- APIs expose canonical/projection watermarks;
- read-after-write uses canonical PostgreSQL or waits for a bounded watermark;
- ClickHouse never assigns identity or owns lifecycle;
- rebuild occurs in a candidate namespace followed by validation and atomic promotion.

## Worker scaling

- online APIs are stateless and horizontally replicated;
- workers form leased partitions/consumer groups;
- partitioning always includes tenant;
- truth ordering adds resolution/aggregate key;
- only one active owner mutates an aggregate partition at a time;
- retries and duplicates are normal;
- bounded evidence replay, normalization reprocessing and projection rebuild have
  separate quotas from live ingest;
- lag, oldest-item age, throughput, errors, lock contention, disk, memory, and tenant fairness drive scaling;
- exact replica counts remain capacity-profile values, not architecture semantics.

## Source placements

- Browser: embedded background runtime; native host and Browser Backend have distinct producer identities.
- Endpoint: one supervised installation runtime with authenticated local IPC and local hot-path policy snapshots.
- LLM Gateway: in-process adapter plus per-pod Starliner sidecar.
- MCP Gateway: embedded runtime for a certified single-replica profile; sidecar/shared durability required before scale-out.

The [four binding specifications](../../implementation/12-browser-sensor-binding.md) remain authoritative for exact current-code seams.

## Tenant and environment boundary

Every row, object, sequence, partition, watermark, cache key, export, log and query is tenant/environment scoped. Shared SaaS may use one physical cell for multiple tenants, but:

- authorization is established before query planning;
- cross-tenant joins are prohibited;
- customer evidence does not enter the global metadata control plane;
- tenant routing comes from authenticated registry state, not the producer body alone;
- every rebuild, replay, export and maintenance job carries an immutable tenant scope.

## Deferred architecture

Findings, metrics/cost, policies, commands, workflows, graph traversal, external
search, broad connector portfolios, dedicated/BYOC/on-prem packaging, and all
Quilr 1 extraction/backfill/parity/coexistence/cutover/rollback/retirement work
are explicitly outside this pass. Their reserved identifiers and compatibility
seams cannot force their services, workers, state or UI into the release.
