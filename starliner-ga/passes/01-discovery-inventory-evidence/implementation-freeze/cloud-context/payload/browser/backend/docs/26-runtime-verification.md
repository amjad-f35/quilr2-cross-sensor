# Runtime and dynamic verification

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Records what static evidence proves and what requires an authorized live Browser Extension Service environment.

## Verified findings

- **Verified:** The pinned source and complete static atlas are verified.
- **Verified:** No live BES deployment was required to claim static source facts.

## Unresolved or non-implemented behavior

- **Unresolved:** Kafka, Neo4j, Redis, auth middleware, producer callbacks, shutdown, and retry behavior need authorized live validation.

## `runtime-entry-points.csv`

Complete machine-readable ledger: [`runtime-entry-points.csv`](../../../matrices/sensor-intelligence/browser-backend/runtime-entry-points.csv) (8 rows).

| Entry ID | Layer | File and symbol | Invocation | Inputs | Initialization or processing model | Shutdown | Failure behavior | Downstream | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EP-024 | Backend | BrowserExtensionServiceApplication.main | Spring Boot process start | Properties, env, beans and external services | Builds MVC/security/data/stream/scheduler context | Spring shutdown and bean cleanup | Bean/config/dependency failures abort startup | Controllers and background workers | Implemented | Verified in source |
| EP-025 | Backend | UserActionController.logUserInteraction | POST /browser/interaction/log | EventLogRequest and UserContext | Validate, create reuse records, initiate ingest | Request completion | Catches all and returns 400 with message | UserActionService/StreamBridge | Implemented | Verified in source |
| EP-026 | Backend | UserActionController.logBrowserEvent | POST /browser/interaction/log/v2 | EventLogRequest and UserContext | Directly calls ingestRiskEvents | Request completion | Service response determines result | QuilrProducerService | Implemented | Verified in source |
| EP-027 | Backend | UserActionController.logBrowserEvents | POST /browser/interaction/events | List of EventLogRequest | Loops synchronously through logUserInteraction | Request completion | One thrown failure returns 400; nested method itself catches | Same single-event path | Implemented | Verified in source |
| EP-028 | Backend | PersonaController.recordHeartbeatV2 | POST /browser/personas/v2/heartbeat | HeartbeatRequest and UserContext | Validates tenant/device then writes process-local bucket | Request completion | 400 missing tenant/device; other errors propagate | HeartbeatBucketService | Implemented | Verified in source |
| EP-029 | Backend | HeartbeatBatchScheduler.run | Spring schedule fixedDelay 5 minutes | Expired process-local bucket keys | Publishes each bucket then deletes it | Spring scheduler shutdown | Exception retains bucket for next run except false-return publication is not thrown | HeartbeatKafkaProducer | Implemented | Verified in source |
| EP-030 | Backend | HeartbeatKafkaThread.call | Bean-managed Kafka consumer thread | HeartbeatBatch Kafka records | Poll, deserialize, ingest and commit | Wakeup/close | Malformed-only poll commits without write; ingestion failures control commit path | Neo4jHeartbeatIngestionService | Implemented | Verified in source |
| EP-034 | Build | browser-extension-service Maven/Spring scripts | Maven/CI/container start | JDK, properties and dependencies | Compiles/tests/packages Spring application | Process exit | Maven/test status | Service artifact/container | Implemented | Verified in source |

## `health-metrics.csv`

Complete machine-readable ledger: [`health-metrics.csv`](../../../matrices/sensor-intelligence/browser-backend/health-metrics.csv) (5 rows).

| Health ID | Metric/signal | Layer | Source | Healthy condition | Degraded condition | Unavailable condition | Emission today | Target action | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H-001 | extension heartbeat freshness | Extension/backend | DeviceHeartbeat.lastAccessedTimestamp | Within configured window | Late beyond warning | No heartbeat beyond outage threshold with expected install evidence | Heartbeat graph/Kafka | SensorHealthEvent | Verified in source |
| H-019 | heartbeat bucket durability | Backend | process-local map | Process running until flush | Backlog | Pod death loses unflushed data | Logs only | Replace with durable/shared outbox | Verified in source |
| H-020 | heartbeat Kafka publish | Backend | send result | All chunks true | Partial false | Producer unavailable | Logs | Do not delete failed bucket; emit metric | Verified in source |
| H-021 | heartbeat consumer validity | Backend | deserialize count | All valid | Some malformed | All malformed committed | Logs | Quarantine and metric | Verified in source |
| H-022 | Neo4j heartbeat write | Backend | write/retry/timeout | Success | Transient retries | Terminal/timeout | Logs | Metric/health | Verified in source |
