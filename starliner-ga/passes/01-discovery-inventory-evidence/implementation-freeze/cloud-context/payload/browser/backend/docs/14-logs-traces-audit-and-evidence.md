# Logs, traces, audit, and evidence

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents structured records, operational logs, graph projections, sensitivity, retention boundaries, and evidentiary limitations.

## Verified findings

- **Verified:** Spring logs and broker/graph artifacts are distinct evidence classes.
- **Verified:** Producer calls and derived graph state are not equivalent to immutable delivery evidence.

## Unresolved or non-implemented behavior

- **Unresolved:** Runtime logging backend and retention are deployment-external.

## `logs-traces-audit.csv`

Complete machine-readable ledger: [`logs-traces-audit.csv`](../../../matrices/sensor-intelligence/browser-backend/logs-traces-audit.csv) (4 rows).

| Evidence ID | Layer | Artifact | Contents | Structured | Persistence | Delivery | Sensitivity | Use | Limitations | Evidence | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LA-013 | Backend | Spring application logs | HTTP, validation, heartbeat, Kafka and graph messages | No/parameterized | Runtime logging backend external | Operations pipeline external | Sensitive | Operations | Several lines include tenant/email/device/payload | Verified in source | browser-extension-service/src/main/java |
| LA-014 | Backend | EventLogKafkaRecord | Structured event envelope | Yes | Kafka/pipeline external | Producer/StreamBridge | Sensitive | Activity/evidence ingestion | Producer call is not end-to-end materialization acknowledgement | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay |
| LA-015 | Backend | HeartbeatBatch | Structured tenant/window/device batch | Yes | Kafka external then Neo4j | Producer/consumer | Sensitive | Coverage/inventory evidence | Process-local pre-publish bucket can be lost | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat |
| LA-016 | Backend | Neo4j heartbeat projection | Persona/workstation/browser nodes/relations | Yes | Neo4j | Internal graph | Sensitive | Inventory/health projection | Projection is derived; should not replace source evidence | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat/Neo4jHeartbeatIngestionService.java |
