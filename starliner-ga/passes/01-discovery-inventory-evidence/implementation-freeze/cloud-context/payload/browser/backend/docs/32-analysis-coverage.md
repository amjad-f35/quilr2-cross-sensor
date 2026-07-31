# Analysis coverage

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Provides measurable file, symbol, route, configuration, record, field, event, interface, schema, fixture, and validator coverage for this profile.

## Verified findings

- **Verified:** All pinned tracked Browser Extension Service files are hash-accounted.
- **Verified:** All parsed declarations are preserved in the evidence symbol ledger.

## `input-ledger.csv`

Complete machine-readable ledger: [`input-ledger.csv`](../../../matrices/sensor-intelligence/browser-backend/input-ledger.csv) (5 rows).

| Input | Type | Version/commit | Purpose | Sensor relevance | Status |
| --- | --- | --- | --- | --- | --- |
| quilrbusiness/browser-extension-service | Spring backend repository | 99e9599e1582184f5061492b430cd0b2af38d753 | Browser event ingress, heartbeat aggregation, Kafka and graph projections | Primary server component | Verified in source |
| Browser-extension-sensor-analysis/outputs/repository-analysis | Existing complete repository archaeology | Pinned to the three commits above | 1,226-file inventory, source atlas, symbol references, interfaces, config, tests and coverage | Complete file-accounting evidence base | Verified in source |
| project-starliner-audit/starliner_contracts | Target Python contracts | Workspace version inspected 2026-07-30 | DeliveryEnvelope, SourceObservation, canonical events, metrics, findings, manifest and health | Target adapter contract | Verified in source |
| project-starliner-audit/starliner_delivery | Reference delivery/outbox implementation | Workspace version inspected 2026-07-30 | SQLite/WAL outbox statuses, idempotency, sequence and retry semantics | Target durable delivery model | Verified in source |
| docs/quilr2-cross-sensor | Cross-sensor architecture and identity guidance | Workspace version inspected 2026-07-30 | Canonical model, source observations, identity, browser/device and MCP boundaries | Platform responsibility/correlation rules | Verified in source |
