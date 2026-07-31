# Findings and insights

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Catalogs Backend-relevant findings with required fields, coverage, logic, lifecycle, actions, and MVS status.

## Verified findings

- **Verified:** Findings preserve sensor-only versus cross-sensor scope.
- **Verified:** Potential issues remain labelled rather than asserted as exploited vulnerabilities.

## `findings.csv`

Complete machine-readable ledger: [`findings.csv`](../../../matrices/sensor-intelligence/browser-backend/findings.csv) (1 rows).

| Finding ID | Finding | Sensor-only or cross-sensor | Required fields | Required coverage | Exact logic | Dedup/lifecycle | Action | Availability | MVS | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FN-021 | Heartbeat data loss on pod restart | Operational finding | process-local bucket and pod lifecycle | BES current architecture | Potential issue: unflushed bucket disappears on process death | Operational incident lifecycle | Use durable/shared bucket/outbox | Requires substantial sensor changes | Yes blocker for evidence-grade health | Verified in source |
