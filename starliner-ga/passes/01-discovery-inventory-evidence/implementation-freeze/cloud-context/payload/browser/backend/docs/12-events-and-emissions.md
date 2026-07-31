# Events, messages, and emissions

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Defines Browser Backend-owned event types, target mappings, broker interfaces, and acknowledgement limits.

## Verified findings

- **Verified:** Backend publication events are distinct from the upstream extension events they carry.
- **Verified:** HTTP completion, producer initiation, broker acceptance, and graph write are separate states.

## Unresolved or non-implemented behavior

- **Unresolved:** End-to-end acceptance receipts are not implemented.

## `native-events.csv`

Complete machine-readable ledger: [`native-events.csv`](../../../matrices/sensor-intelligence/browser-backend/native-events.csv) (2 rows).

| Event ID | Layer | Native event name | Trigger | Payload record | Producer | Consumer | Delivery/ack semantics | Implementation status | Evidence | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EV-046 | Backend output | EventLogKafkaRecord publication | ingestRiskEvents | EventLogKafkaRecord | UserActionService/QuilrProducerService | Kafka/pipeline | HTTP response may precede callback delivery | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay |
| EV-047 | Backend output | HeartbeatBatch publication | Expired bucket flush | HeartbeatBatch | HeartbeatKafkaProducer | Kafka consumer | Bucket deleted after producer call; false result is logged but not thrown | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat |

## `event-mappings.csv`

Complete machine-readable ledger: [`event-mappings.csv`](../../../matrices/sensor-intelligence/browser-backend/event-mappings.csv) (2 rows).

| Mapping ID | Event ID | Native event | Target contract | Mapping rule | Timestamp rule | Identity requirements | Sensitive-data rule | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EM-046 | EV-046 | EventLogKafkaRecord publication | No platform mapping | Retain only as source evidence or internal runtime signal | Preserve source occurred_at when present; add adapter observed_at and envelope emitted_at | tenant_id, sensor_instance_id and source correlation ID; entity IDs where applicable | Allow-list safe scalar summary; put raw content/path/headers only in restricted evidence or drop | Not observable by this sensor | Verified in source; Proposed |
| EM-047 | EV-047 | HeartbeatBatch publication | SensorHealthEvent plus Device/Browser SourceObservation | Heartbeat is freshness evidence; do not convert absence directly to deletion | Preserve source occurred_at when present; add adapter observed_at and envelope emitted_at | tenant_id, sensor_instance_id and source correlation ID; entity IDs where applicable | Allow-list safe scalar summary; put raw content/path/headers only in restricted evidence or drop | Available through adapter mapping only | Verified in source; Proposed |

## `interfaces.csv`

Complete machine-readable ledger: [`interfaces.csv`](../../../matrices/sensor-intelligence/browser-backend/interfaces.csv) (14 rows).

| Interface ID | Layer | Interface | Direction | Protocol/invocation | Schema | Authentication/authorization | Semantics | Errors | Status | Evidence | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IF-005 | Extension/backend | Single browser event log | Outbound | HTTPS POST /browser-extension/browser/interaction/log -> /browser/interaction/log | EventLogRequest/PackageLogEnvelope | Persona bearer/JWT middleware | Accepts event then starts backend publication | BES returns 400 on caught exception | Implemented | Verified in source | Project-Vanguard/src/constants/index.ts; UserActionController.java |
| IF-006 | Extension/backend | Batched browser events | Outbound | HTTPS POST /browser-extension/browser/interaction/events -> /browser/interaction/events | Array<EventLogRequest> | Persona bearer/JWT middleware | Loops through single-event controller | 400 on outer failure; nested calls may return bad response without throw | Implemented | Verified in source | UserActionController.java |
| IF-007 | Extension/backend | Browser event v2 | Outbound/available | POST /browser/interaction/log/v2 | EventLogRequest | Backend UserContext | Direct ingestRiskEvents | Service response | Implemented | Verified in source | UserActionController.java |
| IF-008 | Extension/backend | Prompt snippets | Outbound | POST /browser-extension/browser/interaction/log/snippets | EventLogRequest | Backend UserContext | Snippet ingestion path | Service response | Implemented | Verified in source | UserActionController.java |
| IF-009 | Extension/backend | User justification | Outbound | POST /browser/interaction/log/justification | Map body | Backend UserContext | Interaction/justification ingestion | Service response | Implemented | Verified in source | UserActionController.java |
| IF-010 | Backend | LLM proxy log | Inbound | POST /browser/interaction/llm/log | EventLogKafkaRecord | Backend security context | Ingests already-wrapped LLM record | 400 on exception | Implemented | Verified in source | UserActionController.java |
| IF-011 | Extension/backend | Heartbeat | Outbound | POST /extension-api-service/browser/personas/heartbeat -> /browser/personas/heartbeat | HeartBeatRequestPayload to HeartbeatRequest | Persona bearer/JWT UserContext | Writes local heartbeat bucket | 400/500 depending validation/path | Implemented | Verified in source | Project-Vanguard/src/core/network/middleware/hearBeat.ts; PersonaController.java |
| IF-012 | Backend | Heartbeat v2 | Inbound | POST /browser/personas/v2/heartbeat | HeartbeatRequest | UserContext selected tenant | Requires device and writes local bucket | 400 missing tenant/device | Implemented | Verified in source | PersonaController.java |
| IF-026 | Backend broker | Risk event publisher | Outbound | Kafka/custom producer | EventLogKafkaRecord and routing key | Backend service credentials/config | Asynchronous publication | Callback logging; controller can return first | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay |
| IF-027 | Backend broker | Legacy StreamBridge outputs | Outbound | Spring Cloud Stream | rawOutput-out-0 and transformation bindings | Backend config | Credential-reuse related events and legacy streams | send boolean; active path varies | Partially implemented | Verified in source | UserActionController.java; UserActionService.java |
| IF-028 | Backend broker | Heartbeat Kafka producer | Outbound | Spring Cloud Stream/Kafka | HeartbeatBatch JSON | Backend config | Chunked heartbeat publication | False send logged; caller still deletes bucket | Implemented | Verified in source | HeartbeatKafkaProducer.java |
| IF-029 | Backend broker | Heartbeat Kafka consumer | Inbound | KafkaConsumer poll/commit | HeartbeatBatch or DeviceHeartbeat deserialization | Backend config/group | Batch graph ingestion | Malformed records can be committed/discarded | Implemented | Verified in source | HeartbeatKafkaThread.java |
| IF-030 | Backend storage | Neo4j | Bidirectional | Neo4j driver/query service | Heartbeat graph params | Backend DB credentials | Materializes device/browser/persona freshness | Retries transient errors and timeouts | Implemented | Verified in source | Neo4jHeartbeatIngestionService.java |
| IF-031 | Backend storage | Redis/Redisson legacy heartbeat | Bidirectional | Redisson sorted set/bucket/lock | Legacy payload map | Backend Redis credentials | Separate legacy heartbeat batch path | Errors logged | Legacy | Verified in source | PersonaService.java |
