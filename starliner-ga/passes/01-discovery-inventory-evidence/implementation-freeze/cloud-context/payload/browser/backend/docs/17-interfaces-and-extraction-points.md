# Interfaces and extraction points

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents HTTP, Kafka/StreamBridge, Neo4j, Redis/Redisson, and adapter extraction boundaries.

## Verified findings

- **Verified:** Each interface preserves protocol, schema, authorization, semantics, errors, and source.
- **Verified:** The service uses REST/HTTP, Kafka/StreamBridge, Neo4j, and Redis/Redisson boundaries.

## Unresolved or non-implemented behavior

- **Unresolved:** No gRPC client, server, service definition, protobuf schema, or generated stub was found in the pinned three-repository corpus.

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

## `extraction-points.csv`

Complete machine-readable ledger: [`extraction-points.csv`](../../../matrices/sensor-intelligence/browser-backend/extraction-points.csv) (5 rows).

| Extraction ID | Boundary | Exact symbol/hook | Records available | Advantages | Losses/risks | Required sensor change | Recommended | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| X-009 | BES UserActionService ingress | logEventValidation/getEventLogKafkaRecord before ingestRiskEvents | All HTTP-received browser event records plus authenticated context | Central deployment; reliable auth context; simplest MVS | Misses events lost before backend and external extension-log-service feed; server timestamp mutation | Adapter plugin and durable server outbox before asynchronous publish | Yes for MVS browser events | Verified in source |
| X-010 | BES risk producer call | QuilrProducerService.publishEvents | Backend-enriched EventLogKafkaRecord | Existing broker integration | Publication callback not tied to source retry/idempotency; payload mutated | Tee to transactional/durable Starliner outbox | Yes if ingress hook unavailable | Verified in source |
| X-011 | HeartbeatBatch Kafka | HeartbeatKafkaProducer/consumer topic | Authenticated/enriched DeviceHeartbeat batch | Central, compact health feed | Process-local pre-publish loss; five-minute delay; field mismatch | Starliner heartbeat consumer plus source health instrumentation | Yes | Verified in source |
| X-012 | Neo4j heartbeat projection | Neo4jHeartbeatIngestionService | Device/browser/persona graph state | Already materialized relationships | Derived/lossy projection and last-write-wins state, not raw evidence | Migration-only adapter with provenance | No for primary path | Verified in source |
| X-013 | Legacy transformer path | UserActionService.transformAndIngestEvents | 137 normalized mapping outputs if invoked | Rich mapping inventory | No caller found; required metadata not enforced | Do not reactivate as adapter without tests/contract audit | No | Verified in source |
