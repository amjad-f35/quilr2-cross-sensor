# Architecture

```mermaid
flowchart LR
  Browser["React/Vite SPA<br/>embedded in Rust"] -->|HTTP + session cookie| Axum["Axum router<br/>legacy + v2 + internal APIs"]
  Axum --> Auth["AuthService<br/>PostgreSQL + Redis"]
  Axum --> Console["Console aggregators<br/>inventory/users/overview/conversations"]
  Axum --> Adapters["Management adapters<br/>LLM/MCP/policy/browser/detections"]
  Console --> CH1["LLM ClickHouse<br/>readonly=2"]
  Console --> CH2["Endpoint ClickHouse<br/>readonly=2"]
  Console --> CH3["Browser ClickHouse<br/>readonly=2"]
  Console --> Local["LocalStore + caches<br/>SQLite"]
  Console --> Graph["Neo4j<br/>optional read graph"]
  Adapters --> External["Auth / gateway / policy / data-definition services"]
  Axum --> Pg["PostgreSQL<br/>saved views/dashboards/assist"]
  Topics["Activity-topic background subsystem"] --> CH1
  Topics --> CH2
  Topics --> CH3
  Topics --> Writer["3 derived topic tables<br/>narrow write client"]
  Topics --> Redis["Redis per-tenant lease"]
  Topics --> AI["DeepSeek or Workers AI"]
```

## Runtime boundaries

The root image starts three processes: config-manager Gunicorn on 8000, Compliance DLP on 8282, and this Rust server on 2002. Only the Rust/SPA implementation is primary scope here. The shell command traps TERM/INT and signals all three; an isolated Rust exit does not directly kill the two Python siblings.

## Dependency direction

`main.rs` → `Config` → `AppState` → route/service/storage adapters. Route adapters use domain/console modules and shared state; the frontend consumes the generated v2 client and selected handwritten legacy clients. Build-time flows run in the opposite contract direction: Rust Utoipa → checked-in OpenAPI → Orval TypeScript → Vite assets → Rust embedding.

## Trust boundaries

1. Browser to Axum: cookie/session, Origin/CSRF, request validation.
2. Axum to data stores: tenant/subscriber scope must derive from trusted principal, not caller widening.
3. Axum to external management services: fixed roots and validated path segments.
4. Source records to local caches/exports: sensitive values are bounded/redacted.
5. Background classifier to AI provider: content blocks are treated as untrusted data and persisted topic outputs exclude full bodies.
