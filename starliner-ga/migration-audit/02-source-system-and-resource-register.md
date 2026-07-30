# Source System and Resource Register

The authoritative populated inventory is [`registers/source-resources.csv`](registers/source-resources.csv).

## What the register proves

It classifies repository-visible Quilr 1 and sensor resources across:

- ClickHouse;
- PostgreSQL;
- Redis;
- Neo4j;
- Azure Blob Storage;
- Kafka;
- NATS and JetStream;
- Chrome local/sync storage and IndexedDB;
- sensor-local SQLite;
- sensor filesystem, certificate store, JSON, JSONL, object, vector, and artifact state;
- in-memory queues, sessions, locks, correlation maps, and caches;
- better-console-owned PostgreSQL, ClickHouse, SQLite, and legacy HTTP adapters.

Every row has a customer semantic role, a target disposition, a transition mechanism, a parity gate, and an evidence status. A table is not omitted merely because it is not part of the new UI.

## Disposition semantics

| Disposition family | Meaning |
|---|---|
| `PRESERVE_AS_EVIDENCE` | Copy source records immutably with provenance and then normalize |
| `TRANSFORM_TO_CANONICAL` | Produce claims and resolver inputs; never copy directly into canonical tables |
| `REBUILD_PROJECTION` | Recompute from Quilr 2 authority; legacy value is comparison input only |
| `COMPATIBILITY_ONLY` | Preserve current behavior during coexistence without making it the long-term architecture |
| `RETAIN_NATIVE` | Keep state in the sensor or product where it is required for correct local behavior |
| `ROTATE_OR_REENROLL` | Preserve metadata but replace credential material through a security ceremony |
| `DRAIN_AND_BRIDGE` | Reach a named queue watermark and bridge old and new consumers during coexistence |
| `DO_NOT_PROMOTE` | Keep only for reconciliation or retention; never make it canonical |

Composite dispositions use two of these steps deliberately; for example, preserve raw compliance events but rebuild the score projection.

## Required extraction manifest

Each durable export must produce:

```text
source_system
source_resource
source_schema_version
tenant_source_id
partition_or_shard
extraction_started_at
extraction_completed_at
low_watermark
high_watermark
row_or_object_count
ordered_or_partitioned_checksums
object_manifest
extractor_artifact_digest
query_or_snapshot_identifier
consistency_semantics
known_exclusions
```

For mutable tables, the extractor must either use a consistent snapshot or pair a snapshot with change capture. “We exported it once” is not a completeness property.

## Required row-level lineage

An accepted legacy record must retain:

- source resource;
- original primary or composite key;
- source tenant ID;
- original event time and available ingest/update time;
- raw schema/version;
- extraction run and watermark;
- payload digest;
- privacy disposition;
- normalization version;
- resolution decision and canonical bindings;
- supersession/correction history.

## Cache, queue, and graph rules

Redis entries are never migrated as canonical truth. Queues and locks are drained or fenced. Neo4j is exported as source relationship evidence and compared against reconstructed typed relationships; it is not cloned as the Quilr 2 authority. ClickHouse summaries are rebuilt. The existence of a read model in better-console does not promote that application to a source of truth.

## Production completion

The static inventory is a lower bound. The production catalog collector in `LIVE-001` through `LIVE-009` must discover:

- tables or topics present only in deployed environments;
- schema drift;
- views, dictionaries, TTLs, materialized views, triggers, and grants;
- partitions, replicas, retention, and codecs;
- live file/object prefixes;
- queue lag and consumer groups;
- undocumented readers and writers visible through logs or access metadata.

Any discovered resource receives a new register row before pilot cutover.
