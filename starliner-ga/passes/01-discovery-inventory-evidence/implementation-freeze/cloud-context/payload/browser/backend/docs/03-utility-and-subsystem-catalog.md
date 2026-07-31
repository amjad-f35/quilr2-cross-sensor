# Utility and subsystem catalog

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Catalogs the Browser Extension Service controllers, services, producers, consumers, schedulers, configuration loaders, and stores.

## Verified findings

- **Verified:** Backend utilities retain their exact primary symbols and external effects.
- **Verified:** Adapter components are target proposals, not current source components.

## `utilities.csv`

Complete machine-readable ledger: [`utilities.csv`](../../../matrices/sensor-intelligence/browser-backend/utilities.csv) (9 rows).

| Utility ID | Layer | Subsystem or utility | Role | Primary symbols | State or external effects | Implementation status | Evidence status | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U-049 | Backend | UserActionController | Exposes browser interaction ingestion endpoints | UserActionController | HTTP responses and service calls | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay/controller/UserActionController.java |
| U-050 | Backend | UserActionService | Validates/enriches browser records and starts publication | UserActionService | Event mutation and producer calls | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay/service/UserActionService.java |
| U-051 | Backend | QuilrProducerService | Publishes event records to backend pipeline | QuilrProducerService.publishEvents | Kafka/producer callback | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay/service/QuilrProducerService.java |
| U-052 | Backend | HeartbeatBucketService | Deduplicates heartbeats per tenant/device/email/window | HeartbeatBucketService | Process-local ConcurrentHashMap, last-write-wins | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/HeartbeatBucketService.java |
| U-053 | Backend | HeartbeatBatchScheduler | Flushes expired heartbeat buckets every five minutes | HeartbeatBatchScheduler.run | Kafka production then bucket deletion | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/scheduler/HeartbeatBatchScheduler.java |
| U-054 | Backend | HeartbeatKafkaProducer | Chunks and serializes HeartbeatBatch messages | HeartbeatKafkaProducer | Kafka publish attempts | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/HeartbeatKafkaProducer.java |
| U-055 | Backend | HeartbeatKafkaThread | Consumes heartbeat batches and commits offsets | HeartbeatKafkaThread | Kafka consumer and ingestion service calls | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/HeartbeatKafkaThread.java |
| U-056 | Backend | Neo4jHeartbeatIngestionService | Materializes workstation/browser heartbeat state | Neo4jHeartbeatIngestionService | Neo4j writes, retries and timeouts | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/Neo4jHeartbeatIngestionService.java |
| U-057 | Backend | Transformer schema registry | Loads 137 source-to-target YAML mappings | TransformationConfig; five root-level schema YAML resources | Transformation metadata; required markers are not enforced | Legacy | Verified in source | browser-extension-service/src/main/resources |

## `adapter-components.csv`

Complete machine-readable ledger: [`adapter-components.csv`](../../../matrices/sensor-intelligence/browser-backend/adapter-components.csv) (9 rows).

| Component ID | Component | Placement | Inputs | Outputs | Responsibilities | Durability | Current/new | Dependencies | Acceptance criterion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-001 | Compound sensor instance registry | Vanguard plus Sentinel/BES registration | tenant, device, browser profile, extension install, native install | stable sensor_instance_id and component_instance_ids | Persist IDs, rotate on reinstall, bind browser/native/backend components | Browser IndexedDB/native SQLite/backend registry | New | Identity policy | Same IDs survive restart and distinguish profiles/reinstalls |
| A-008 | BES ingress adapter | browser-extension-service UserActionService | EventLogRequest plus UserContext | DeliveryEnvelope source/native records | Central auth binding, version validation, outbox enqueue before async publish | Server SQLite/Postgres/Kafka-outbox depending deployment | New | BES and Starliner SDK | HTTP accepted record is durably queued or request fails explicitly |
| A-009 | Heartbeat adapter consumer | BES heartbeat Kafka sidecar/consumer | HeartbeatBatch | SensorHealthEvent and inventory observations | Map freshness/capability/version; track producer gaps | Server durable outbox | New | Kafka/Starliner | Late/duplicate/malformed heartbeat scenarios are deterministic |
| A-011 | Schema registry/version gate | Shared adapter library | native schema ID/version | Validated typed records or quarantine | Reject unsupported version, preserve raw evidence metadata | Outbox/quarantine | New | Starliner contracts | Unsupported version does not poison stream and emits health signal |
| A-012 | DeliveryEnvelope builder | Shared adapter SDK | Mapped record, IDs and timestamps | DeliveryEnvelope | Origin/evidence quality, record/body hash, idempotency, correlation and safe summary | Outbox | New | Starliner contracts | Golden fixtures validate against pinned contracts |
| A-013 | Starliner delivery worker | Local/server adapter | Pending envelopes | accepted/duplicate/rejected/retry statuses | Batch, authenticate, retry with jitter, respect backpressure | Outbox status machine | New | Starliner API | Offline/replay/partial acceptance tests pass |
| A-015 | Coverage/health reporter | All components plus platform adapter | Manifest, outbox, heartbeat, hook counters | SensorHealthEvent/metrics | Report per-layer reachability and blind spots | Outbox | New | Capability manifest | Browser/native/backend degradation distinguished |
| A-016 | Evidence reference store | Server/operator plane | Restricted raw payloads | Immutable/restricted evidence reference | Encrypt, authorize, expire and audit raw content | External authoritative evidence store | New | Security/retention service | Canonical records contain refs/hashes, not raw sensitive content |
| A-017 | Correlation service | Platform | Source observations/events across sensors | Canonical entities/relationships/findings | Tenant-scoped matching with confidence and weak-ID controls | Platform state | Platform responsibility | Canonical model | No sensor-side auto-merge on email/hostname/domain |
