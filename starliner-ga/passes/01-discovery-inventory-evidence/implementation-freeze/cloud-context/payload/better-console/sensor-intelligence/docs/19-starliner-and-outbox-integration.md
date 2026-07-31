# Starliner and Durable Outbox Integration

**Verified:** the repository has transactional PostgreSQL operations, source data stores, Redis leases, and derived ClickHouse inserts, but no universal Starliner envelope/WAL/outbox/checkpoint.

**Proposed:** each extractor writes immutable evidence to a local durable WAL; acknowledgement advances the source checkpoint only after Starliner admission; duplicate replay uses deterministic source IDs/digests; poison records quarantine without skipping reconciliation. Telemetry and control commands use separate channels.
