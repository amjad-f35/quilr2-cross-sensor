# Platform contract mapping

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Maps native Backend records/fields/events to proposed platform objects without claiming implemented canonicalization.

## Verified findings

- **Verified:** Mappings retain lossiness, identity, timestamp, and sensitive-data rules.
- **Verified:** Mapping rows are adapter design unless source says otherwise.

## `platform-contract-mapping.csv`

Complete machine-readable ledger: [`platform-contract-mapping.csv`](../../../matrices/sensor-intelligence/browser-backend/platform-contract-mapping.csv) (2 rows).

| Mapping ID | Native source | Native field/event | Target object | Target field/type | Transformation | Lossiness | Owner | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PM-003 | VisitCheck | visit | CanonicalActivity | activity_type=application_visit | Use source context_id/request time | No reliable visit event time in backend wrapper if omitted | Adapter | Available through adapter mapping only | Proposed |
| PM-016 | HeartBeatRequest/DeviceHeartbeat | versions/freshness | SensorHealthEvent plus Device/Browser observations | capability health and version attributes | Use server receipt and bucket times separately | agentEnabled/extensionEnabled currently dropped | Adapter | Requires minor sensor instrumentation | Proposed |

## `event-mappings.csv`

Complete machine-readable ledger: [`event-mappings.csv`](../../../matrices/sensor-intelligence/browser-backend/event-mappings.csv) (2 rows).

| Mapping ID | Event ID | Native event | Target contract | Mapping rule | Timestamp rule | Identity requirements | Sensitive-data rule | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EM-046 | EV-046 | EventLogKafkaRecord publication | No platform mapping | Retain only as source evidence or internal runtime signal | Preserve source occurred_at when present; add adapter observed_at and envelope emitted_at | tenant_id, sensor_instance_id and source correlation ID; entity IDs where applicable | Allow-list safe scalar summary; put raw content/path/headers only in restricted evidence or drop | Not observable by this sensor | Verified in source; Proposed |
| EM-047 | EV-047 | HeartbeatBatch publication | SensorHealthEvent plus Device/Browser SourceObservation | Heartbeat is freshness evidence; do not convert absence directly to deletion | Preserve source occurred_at when present; add adapter observed_at and envelope emitted_at | tenant_id, sensor_instance_id and source correlation ID; entity IDs where applicable | Allow-list safe scalar summary; put raw content/path/headers only in restricted evidence or drop | Available through adapter mapping only | Verified in source; Proposed |
