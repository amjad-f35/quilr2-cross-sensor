# Source-to-Adapter Reconciliation


Every source field has one adapter mapping. The recommended placement is the Vanguard background context; Sentinel returns source-native facts to it. Starliner owns enrollment identity, privacy gating, WAL/outbox, sequence, receipts, replay and canonicalization.

Mappings are `INFERRED` recommendations, not implementation. Current source has no complete Starliner adapter/WAL.

See [`source-to-adapter.yaml`](../../lg008/reconciliation/source-to-adapter.yaml).
