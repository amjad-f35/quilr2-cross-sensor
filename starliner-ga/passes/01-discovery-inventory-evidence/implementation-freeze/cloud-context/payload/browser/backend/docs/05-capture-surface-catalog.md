# Capture and ingress surfaces

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents where Browser Backend first receives, mutates, publishes, caches, consumes, and materializes records.

## Verified findings

- **Verified:** Authenticated HTTP ingress is the preferred source boundary for already-delivered browser events.
- **Verified:** Heartbeat cache, Kafka, and graph boundaries do not have equivalent durability.

## Unresolved or non-implemented behavior

- **Unresolved:** Upstream browser events that never reach HTTP ingress remain invisible.

## `capture-points.csv`

Complete machine-readable ledger: [`capture-points.csv`](../../../matrices/sensor-intelligence/browser-backend/capture-points.csv) (6 rows).

| Capture ID | Layer | Surface | Trigger | Native input | Captured output | Blind spots or conditions | Implementation status | Evidence | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-036 | Backend HTTP | EventLogRequest ingress | Browser interaction POST | user/check/browser/extension/application maps and UserContext | EventLogKafkaRecord | Untyped maps and limited validation | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay |
| CP-037 | Backend HTTP | HeartbeatRequest ingress | Persona heartbeat POST | Device/browser/version/sync values and UserContext | DeviceHeartbeat | Unknown Vanguard fields ignored; required fields differ | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona |
| CP-038 | Backend cache | Heartbeat bucket | recordHeartbeatV2 | DeviceHeartbeat | Last-write-wins process-local entry | Lost on process/pod death; not shared across pods | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/HeartbeatBucketService.java |
| CP-039 | Backend Kafka | Risk event producer | ingestRiskEvents | EventLogKafkaRecord and routing IDs | Kafka/producer publication attempt | HTTP return precedes confirmed downstream materialization | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay/service/UserActionService.java |
| CP-040 | Backend Kafka | Heartbeat producer/consumer | Expired bucket flush and consumer poll | HeartbeatBatch JSON | Neo4j writes | Producer false-result path deletes bucket; malformed-only polls commit | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat |
| CP-041 | Backend graph | Neo4j heartbeat ingestion | Consumed heartbeat batch | DeviceHeartbeat | WORKSTATION/BROWSER/persona access state | Only heartbeat-derived inventory; not proof of current browser session activity | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/Neo4jHeartbeatIngestionService.java |

## `extraction-points.csv`

Complete machine-readable ledger: [`extraction-points.csv`](../../../matrices/sensor-intelligence/browser-backend/extraction-points.csv) (5 rows).

| Extraction ID | Boundary | Exact symbol/hook | Records available | Advantages | Losses/risks | Required sensor change | Recommended | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| X-009 | BES UserActionService ingress | logEventValidation/getEventLogKafkaRecord before ingestRiskEvents | All HTTP-received browser event records plus authenticated context | Central deployment; reliable auth context; simplest MVS | Misses events lost before backend and external extension-log-service feed; server timestamp mutation | Adapter plugin and durable server outbox before asynchronous publish | Yes for MVS browser events | Verified in source |
| X-010 | BES risk producer call | QuilrProducerService.publishEvents | Backend-enriched EventLogKafkaRecord | Existing broker integration | Publication callback not tied to source retry/idempotency; payload mutated | Tee to transactional/durable Starliner outbox | Yes if ingress hook unavailable | Verified in source |
| X-011 | HeartbeatBatch Kafka | HeartbeatKafkaProducer/consumer topic | Authenticated/enriched DeviceHeartbeat batch | Central, compact health feed | Process-local pre-publish loss; five-minute delay; field mismatch | Starliner heartbeat consumer plus source health instrumentation | Yes | Verified in source |
| X-012 | Neo4j heartbeat projection | Neo4jHeartbeatIngestionService | Device/browser/persona graph state | Already materialized relationships | Derived/lossy projection and last-write-wins state, not raw evidence | Migration-only adapter with provenance | No for primary path | Verified in source |
| X-013 | Legacy transformer path | UserActionService.transformAndIngestEvents | 137 normalized mapping outputs if invoked | Rich mapping inventory | No caller found; required metadata not enforced | Do not reactivate as adapter without tests/contract audit | No | Verified in source |
