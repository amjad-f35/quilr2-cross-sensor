# Metrics and analytics

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents current/log-derived/proposed Backend metrics and their exact formulas, exclusions, dimensions, and product disposition.

## Verified findings

- **Verified:** Backend metric rows preserve current versus derived classification.
- **Verified:** Heartbeat loss modes constrain negative interpretations.

## Unresolved or non-implemented behavior

- **Unresolved:** Several metrics require instrumentation rather than existing emission.

## `metrics.csv`

Complete machine-readable ledger: [`metrics.csv`](../../../matrices/sensor-intelligence/browser-backend/metrics.csv) (7 rows).

| Metric ID | Metric | Current or derived | Exact meaning | Numerator/input | Denominator/exclusions | Dimensions | Producer | Current destination | Availability | Product disposition | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M-007 | heartbeat_received | Current backend observable | Heartbeat HTTP requests accepted | recordHeartbeatV2 calls | Rejected requests excluded | tenant, device, browser, versions | BES | Logs/process cache | Available through adapter mapping only | Coverage and health | Verified in source |
| M-008 | heartbeat_bucket_devices | Current log/payload | Distinct device+email entries in a bucket | HeartbeatBatch devices count | Overwritten within-window heartbeats excluded | tenant, bucket | BES | Kafka/logs | Available through adapter mapping only | Coverage and health | Verified in source |
| M-010 | heartbeat_publish_chunks | Current log-derived | Number of chunks attempted per batch | HeartbeatKafkaProducer chunks | None | tenant, bucket | BES | Logs | Derivable centrally from current output | Operator-only | Verified in source |
| M-011 | heartbeat_publish_failures | Current log-derived | StreamBridge/producers returning failure | Failed send result | Thrown serialization failures separate | tenant, bucket, chunk | BES | Logs | Derivable centrally from current output | Coverage and health | Verified in source |
| M-012 | heartbeat_consumer_malformed | Current log-derived | Kafka heartbeat records failing JSON conversion | Malformed record count | Valid records excluded | topic | BES | Logs | Derivable centrally from current output | Coverage and health | Verified in source |
| M-013 | heartbeat_graph_write_retries | Current log-derived | Transient Neo4j write retries | Retry attempt count | Non-transient failures excluded | batch size | BES | Logs | Derivable centrally from current output | Operator-only | Verified in source |
| M-014 | heartbeat_graph_write_latency_ms | Current measurable/loggable | Neo4j heartbeat write duration/timeout | write task duration | N/A | batch size, outcome | BES | Logs/metrics annotation depending runtime | Available through adapter mapping only | Coverage and health | Verified in source |
