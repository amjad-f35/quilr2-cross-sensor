# Capability and feature catalog

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Catalogs implemented, partial, dead-code-candidate, and proposed capabilities with their preserved source classifications.

## Verified findings

- **Verified:** Event ingress, risk publication, heartbeat aggregation, Kafka consumption, and graph projection are source-visible capabilities.
- **Verified:** The legacy transformer remains separately classified.

## Unresolved or non-implemented behavior

- **Unresolved:** No capability row is promoted from proposed or unresolved to implemented.

## `features.csv`

Complete machine-readable ledger: [`features.csv`](../../../matrices/sensor-intelligence/browser-backend/features.csv) (5 rows).

| Feature ID | Domain | Feature | Trigger or entry point | Primary symbols | Inputs | Outputs and effects | Implementation status | Evidence status | Availability | Product disposition | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-009 | Credential security | Credential-reuse detection | Authentication event resolution and backend fan-out | AuthLogDrop; UserActionController.convertEventForCredsReused | Credential fingerprint, domain/email details and current identity | credential_reused status/details; related backend records | Implemented | Verified in source | Available through adapter mapping only | Finding signal; Customer finding; Relationship view | Project-Vanguard/src/core/LogDrop/AuthLogDrop/index.ts; browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay/controller/UserActionController.java |
| F-032 | Health | Browser/device/native heartbeat | Bootstrap timer and periodic middleware | sendHeartbeat; PersonaController.recordHeartbeat; HeartbeatBucketService | Extension/browser/OS/device/version/config-sync values and auth context | DeviceHeartbeat bucket, Kafka HeartbeatBatch, Neo4j updates | Implemented | Verified in source | Available through adapter mapping only | Coverage and health; Inventory list | Project-Vanguard/src/core/network/middleware/hearBeat.ts; browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona |
| F-040 | Backend ingress | Browser event validation and Kafka publication | POST /browser/interaction/log, /log/v2, /events | UserActionController; UserActionService.ingestRiskEvents | EventLogRequest untyped maps plus UserContext | EventLogKafkaRecord and producer callback initiation | Implemented | Verified in source | Available through adapter mapping only | Activity explorer; Evidence drill-down | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay |
| F-041 | Backend processing | Legacy schema-based event transformation | Private transformAndIngestEvents path | UserActionService; 137 transformer YAML mappings | EventLogRequest and transformer schema | Risk/status/action/interaction objects if invoked | Dead-code candidate | Verified in source | Requires substantial sensor changes | Internal implementation only | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay/service/UserActionService.java |
| F-042 | Backend health | Heartbeat aggregation, Kafka and graph ingestion | POST persona heartbeat and five-minute scheduler | HeartbeatBucketService; HeartbeatKafkaProducer/Thread; Neo4jHeartbeatIngestionService | HeartbeatRequest and UserContext | Last-write-wins bucket, HeartbeatBatch, WORKSTATION/BROWSER graph updates | Implemented | Verified in source | Available through adapter mapping only | Coverage and health; Inventory list | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat |

## `control-capabilities.csv`

Complete machine-readable ledger: [`control-capabilities.csv`](../../../matrices/sensor-intelligence/browser-backend/control-capabilities.csv) (0 rows).

_No Browser Backend source row was identified for this artifact class._
