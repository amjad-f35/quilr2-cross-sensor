# Backend versus central-platform responsibilities

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Separates source capture/attribution from canonical identity, durable delivery, correlation, materialization, product policy, and cross-sensor findings.

## Verified findings

- **Verified:** Browser Backend owns truthful source emission and authenticated source context.
- **Verified:** The central platform owns cross-sensor canonicalization and product projection.

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

## `platform-contract-mapping.csv`

Complete machine-readable ledger: [`platform-contract-mapping.csv`](../../../matrices/sensor-intelligence/browser-backend/platform-contract-mapping.csv) (2 rows).

| Mapping ID | Native source | Native field/event | Target object | Target field/type | Transformation | Lossiness | Owner | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PM-003 | VisitCheck | visit | CanonicalActivity | activity_type=application_visit | Use source context_id/request time | No reliable visit event time in backend wrapper if omitted | Adapter | Available through adapter mapping only | Proposed |
| PM-016 | HeartBeatRequest/DeviceHeartbeat | versions/freshness | SensorHealthEvent plus Device/Browser observations | capability health and version attributes | Use server receipt and bucket times separately | agentEnabled/extensionEnabled currently dropped | Adapter | Requires minor sensor instrumentation | Proposed |
