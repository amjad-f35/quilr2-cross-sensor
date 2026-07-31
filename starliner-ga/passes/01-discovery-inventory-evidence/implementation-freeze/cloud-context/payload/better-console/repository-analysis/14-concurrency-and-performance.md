# Concurrency and Performance

## Verified concurrency

- Tokio multi-thread runtime drives Axum and background loops.
- `agent_query_gate` is a per-process semaphore.
- Activity-topic classifier waves are tested not to exceed 64 requests; per-tenant Redis leases prevent multi-replica leaders.
- Moka caches bound selected in-memory state; SQLite provides local mirrors/caches.
- Query modules use parallel futures in selected aggregations; source tests check caps and pagination.

## Build/runtime observations

- Vite transformed 6,920 modules and produced a successful build.
- Vite warned that `quilr-kit`, `EChartsWidget`, and `UserDetailDrawer` chunks exceed the 520 kB configured warning threshold.
- Backend tests finish quickly after compilation; no live-data performance benchmark ran.
- TODO.md explicitly requires real-data measurements for inventory, MCP, LLM, dashboards, and deployment.

**Potential issue requiring measurement:** repeated ClickHouse `FINAL`, cross-source fan-out, and large SPA chunks may be expensive. Source controls (caches, semaphores, pagination, body caps) are verified; production impact is unresolved.
