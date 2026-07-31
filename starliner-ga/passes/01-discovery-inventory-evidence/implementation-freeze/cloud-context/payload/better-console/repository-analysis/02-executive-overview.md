# Executive Overview

**Verified:** this is a Rust/Axum customer-admin API and embedded React console. It aggregates and manages LLM Gateway, MCP Gateway, Endpoint, and Browser Extension data, plus identity, policy, dashboard, saved-view, and support workflows.

**Verified:** it is not itself one of the four native sensors. It reads their persisted projections and calls management services. The only ClickHouse write exception is the activity-topic subsystem's three derived `ai_activity_topic_*_v1` tables.

## Product surfaces

| Feature | Purpose | Status | Primary state |
| --- | --- | --- | --- |
| session-authentication | OIDC, SAML, password login, session creation/revocation | implemented | PostgreSQL; Redis |
| tenant-selection | select and switch trusted tenant context | implemented | PostgreSQL; session |
| platform-authorization | permission/resource/action checks and wildcard evaluation | implemented | principal grants |
| llm-log-analytics | query LLM requests, details, usage, provider health, exports | implemented | ClickHouse llmgateway_logs_v3 |
| mcp-log-analytics | tool-call, rejection, graph, insight, and export views | implemented | ClickHouse mcp_*_v2 |
| endpoint-analytics | Endpoint DLP/activity/entity analytics and conversation detail | implemented | Endpoint ClickHouse V4 |
| browser-analytics | browser inventory, activity, findings, personas, settings | implemented | Browser ClickHouse; PostgreSQL; Neo4j |
| unified-inventory | cross-channel asset catalog, details, metrics, findings, configuration | implemented | LocalStore; ClickHouse |
| unified-users | directory/user views, query language, product summaries | implemented | LocalStore; PostgreSQL; ClickHouse |
| overview-dashboards | posture, coverage, flows, graph, and executive views | implemented | LocalStore; ClickHouse |
| conversation-explorer | cross-source conversations, facets, detail, caching | implemented | ClickHouse; SQLite cache |
| activity-topics | bounded classification pipeline with Redis leadership and ClickHouse derived state | implemented | Redis; ClickHouse; SQLite; DeepSeek/Workers AI |
| custom-dashboards | AI-assisted dashboard design, storage, execution, ACL, cleanup | implemented | PostgreSQL; ClickHouse; Claude CLI/Python |
| saved-views | personal Inventory, Users, and Interactions views/preferences | implemented | PostgreSQL |
| console-assist | help/error/feature-request conversations and history | implemented | PostgreSQL; Anthropic; Slack |
| policy-management | closed-allowlist proxies for controls/playbooks/templates | implemented | external policy services |
| detection-models | model catalog, validation, suggestions, upload | implemented | data-definitions service |
| gateway-management | LLM/MCP service management and streaming proxy | implemented | auth/LLM/MCP services |
| browser-app-management | posture/classification/owners/detection control adapters | implemented | legacy browser/query services |
| platform-access | RBAC, group grants, directory/readiness projection | implemented | PostgreSQL; LocalStore |
| audit-log-view | audit queries, facets, snapshots | implemented | LocalStore |
| internal-admin | separate operator authentication and diagnostics | implemented | SQLite |
| embedded-spa | compile-time Vite asset embedding and navigation fallback | implemented | embedded files |
| export-surfaces | streaming NDJSON and legacy exports with redaction | implemented | ClickHouse |
| conversation-detail-cache | bounded SQLite detail cache with secret-value redaction | implemented | SQLite |
| geoip-annotation | best-effort public-IP city/country annotation | implemented | GeoLite2 file |
| inventory-icon-proxy | allowlisted HTTPS raster icon proxy and cache | implemented | external HTTPS; memory |
| model-pricing | versioned token cost computation from JSON | implemented | model_pricing.json |
| api-completion-telemetry | one-line completion JSON plus internal timing capture | implemented | tracing; SQLite telemetry |
| openapi-client-generation | Utoipa export and Orval TypeScript generation | implemented | checked-in OpenAPI/client |

## Core implementation decisions

- One binary exports a library, the HTTP server, and an OpenAPI exporter.
- The SPA is built by Vite and embedded at compile time with `include_dir!`.
- `AppState` owns clients and services shared by Axum handlers.
- Three request-facing ClickHouse clients enforce session setting `readonly=2`.
- PostgreSQL owns authentication-associated product documents; Redis owns sessions and leader leases; SQLite owns local mirrors/caches/diagnostics.
- A typed v2 API coexists with legacy compatibility APIs.
