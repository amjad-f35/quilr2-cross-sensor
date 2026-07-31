# Coverage, capabilities, and health

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents positive/partial/unavailable Backend coverage and the exact signals needed to distinguish healthy, degraded, and unavailable paths.

## Verified findings

- **Verified:** Heartbeat ingress, bucket durability, publish, consume, and graph-write health are separate stages.
- **Verified:** No record is not automatically a healthy negative event.

## Unresolved or non-implemented behavior

- **Unresolved:** Some health signals are log-derived or proposed rather than currently emitted metrics.

## `coverage.csv`

Complete machine-readable ledger: [`coverage.csv`](../../../matrices/sensor-intelligence/browser-backend/coverage.csv) (2 rows).

| Coverage ID | Environment/surface | Capability | Supported code path | Coverage class | Known blind spots | Negative-event semantics | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CV-011 | Browser backend ingress | Event acceptance | BES HTTP | Direct when request reaches service | Network failure, auth, validation, missing extension-log-service | No backend record may be upstream delivery failure | Available through adapter mapping only | Verified in source |
| CV-012 | Backend heartbeat | Health aggregation | Process-local bucket/Kafka/Neo4j | Partial durability | Pod restart, multi-pod fragmentation, false send deletion | Missing graph update does not prove sensor offline | Requires substantial sensor changes | Verified in source |

## `health-metrics.csv`

Complete machine-readable ledger: [`health-metrics.csv`](../../../matrices/sensor-intelligence/browser-backend/health-metrics.csv) (5 rows).

| Health ID | Metric/signal | Layer | Source | Healthy condition | Degraded condition | Unavailable condition | Emission today | Target action | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H-001 | extension heartbeat freshness | Extension/backend | DeviceHeartbeat.lastAccessedTimestamp | Within configured window | Late beyond warning | No heartbeat beyond outage threshold with expected install evidence | Heartbeat graph/Kafka | SensorHealthEvent | Verified in source |
| H-019 | heartbeat bucket durability | Backend | process-local map | Process running until flush | Backlog | Pod death loses unflushed data | Logs only | Replace with durable/shared outbox | Verified in source |
| H-020 | heartbeat Kafka publish | Backend | send result | All chunks true | Partial false | Producer unavailable | Logs | Do not delete failed bucket; emit metric | Verified in source |
| H-021 | heartbeat consumer validity | Backend | deserialize count | All valid | Some malformed | All malformed committed | Logs | Quarantine and metric | Verified in source |
| H-022 | Neo4j heartbeat write | Backend | write/retry/timeout | Success | Transient retries | Terminal/timeout | Logs | Metric/health | Verified in source |
