# Minimum viable Browser Backend integration

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Defines the bounded source-to-outbox-to-platform path needed for a first evidence-grade integration.

## Verified findings

- **Verified:** Authenticated browser-event ingress is the highest-value existing server boundary.
- **Verified:** Heartbeat integration needs loss/partial-delivery controls.

## Unresolved or non-implemented behavior

- **Unresolved:** MVS acceptance requires duplicate, restart, partial publish, malformed message, and authorization scenarios.

## `mvs-scope.csv`

Complete machine-readable ledger: [`mvs-scope.csv`](../../../matrices/sensor-intelligence/browser-backend/mvs-scope.csv) (3 rows).

| MVS ID | Scope item | Include/exclude | Existing boundary | New work | Starliner dependency | Acceptance test | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MVS-001 | Browser activity records login/signup/visit/prompt/copy/paste/upload/download | Include | BES UserActionService ingress | Version gate, auth-bound adapter mapping and durable server outbox | DeliveryEnvelope, CanonicalActivity/ActionEvent | Golden fixtures accepted and replay duplicate | Highest-value existing central feed |
| MVS-002 | Heartbeat health/device/browser observations | Include | HeartbeatBatch Kafka | Consumer adapter and SensorHealthEvent mapping | SensorHealthEvent/SourceObservation | Normal/late/duplicate/malformed fixtures | Existing compact central feed |
| MVS-004 | Stable compound/component sensor identity | Include | No adequate boundary | Persist IDs in browser/native/backend registration | SensorManifest/DeliveryEnvelope | Restart/reinstall/multi-profile tests | Required for trustworthy attribution |
