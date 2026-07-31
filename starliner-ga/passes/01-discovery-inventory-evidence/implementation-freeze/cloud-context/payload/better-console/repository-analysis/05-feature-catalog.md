# Feature Catalog

The complete traceability matrix is `../matrices/sensor-intelligence/better-console-backend/features.csv`; below is the repository-level catalog.

## `session-authentication`

**Purpose:** OIDC, SAML, password login, session creation/revocation  
**Primary implementation:** `src/auth.rs; src/auth/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** PostgreSQL; Redis

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `tenant-selection`

**Purpose:** select and switch trusted tenant context  
**Primary implementation:** `src/routes/platform_admin_v2.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** PostgreSQL; session

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `platform-authorization`

**Purpose:** permission/resource/action checks and wildcard evaluation  
**Primary implementation:** `src/authz.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** principal grants

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `llm-log-analytics`

**Purpose:** query LLM requests, details, usage, provider health, exports  
**Primary implementation:** `src/routes/admin_logs.rs; src/analytics/admin_logs.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** ClickHouse llmgateway_logs_v3

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `mcp-log-analytics`

**Purpose:** tool-call, rejection, graph, insight, and export views  
**Primary implementation:** `src/mcpgateway/; src/routes/mcpgateway.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** ClickHouse mcp_*_v2

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `endpoint-analytics`

**Purpose:** Endpoint DLP/activity/entity analytics and conversation detail  
**Primary implementation:** `src/endpointagent/; src/console/conversations/endpoint/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** Endpoint ClickHouse V4

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `browser-analytics`

**Purpose:** browser inventory, activity, findings, personas, settings  
**Primary implementation:** `src/browser_extension/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** Browser ClickHouse; PostgreSQL; Neo4j

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `unified-inventory`

**Purpose:** cross-channel asset catalog, details, metrics, findings, configuration  
**Primary implementation:** `src/console/inventory/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** LocalStore; ClickHouse

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `unified-users`

**Purpose:** directory/user views, query language, product summaries  
**Primary implementation:** `src/console/users/; src/query_language.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** LocalStore; PostgreSQL; ClickHouse

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `overview-dashboards`

**Purpose:** posture, coverage, flows, graph, and executive views  
**Primary implementation:** `src/console/overview/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** LocalStore; ClickHouse

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `conversation-explorer`

**Purpose:** cross-source conversations, facets, detail, caching  
**Primary implementation:** `src/console/conversations/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** ClickHouse; SQLite cache

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `activity-topics`

**Purpose:** bounded classification pipeline with Redis leadership and ClickHouse derived state  
**Primary implementation:** `src/activity_topics/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** Redis; ClickHouse; SQLite; DeepSeek/Workers AI

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `custom-dashboards`

**Purpose:** AI-assisted dashboard design, storage, execution, ACL, cleanup  
**Primary implementation:** `src/custom_dashboards/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** PostgreSQL; ClickHouse; Claude CLI/Python

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `saved-views`

**Purpose:** personal Inventory, Users, and Interactions views/preferences  
**Primary implementation:** `src/saved_views.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** PostgreSQL

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `console-assist`

**Purpose:** help/error/feature-request conversations and history  
**Primary implementation:** `src/console_assist/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** PostgreSQL; Anthropic; Slack

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `policy-management`

**Purpose:** closed-allowlist proxies for controls/playbooks/templates  
**Primary implementation:** `src/policy_management/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** external policy services

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `detection-models`

**Purpose:** model catalog, validation, suggestions, upload  
**Primary implementation:** `src/detection_models/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** data-definitions service

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `gateway-management`

**Purpose:** LLM/MCP service management and streaming proxy  
**Primary implementation:** `src/gateway_management/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** auth/LLM/MCP services

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `browser-app-management`

**Purpose:** posture/classification/owners/detection control adapters  
**Primary implementation:** `src/apps_management/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** legacy browser/query services

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `platform-access`

**Purpose:** RBAC, group grants, directory/readiness projection  
**Primary implementation:** `src/platform_admin_v2/platform_access.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** PostgreSQL; LocalStore

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `audit-log-view`

**Purpose:** audit queries, facets, snapshots  
**Primary implementation:** `src/console/audit_logs.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** LocalStore

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `internal-admin`

**Purpose:** separate operator authentication and diagnostics  
**Primary implementation:** `src/internal_admin/`  
**Status:** implemented; runtime-tested  
**State/dependencies:** SQLite

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `embedded-spa`

**Purpose:** compile-time Vite asset embedding and navigation fallback  
**Primary implementation:** `build.rs; src/spa.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** embedded files

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `export-surfaces`

**Purpose:** streaming NDJSON and legacy exports with redaction  
**Primary implementation:** `src/routes/admin_export.rs; src/routes/mcpgateway_export.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** ClickHouse

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `conversation-detail-cache`

**Purpose:** bounded SQLite detail cache with secret-value redaction  
**Primary implementation:** `src/conversation_detail_cache.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** SQLite

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `geoip-annotation`

**Purpose:** best-effort public-IP city/country annotation  
**Primary implementation:** `src/state.rs::geo_annotation`  
**Status:** implemented; runtime-tested  
**State/dependencies:** GeoLite2 file

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `inventory-icon-proxy`

**Purpose:** allowlisted HTTPS raster icon proxy and cache  
**Primary implementation:** `src/inventory_icons.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** external HTTPS; memory

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `model-pricing`

**Purpose:** versioned token cost computation from JSON  
**Primary implementation:** `src/model_pricing.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** model_pricing.json

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `api-completion-telemetry`

**Purpose:** one-line completion JSON plus internal timing capture  
**Primary implementation:** `src/api_log.rs`  
**Status:** implemented; runtime-tested  
**State/dependencies:** tracing; SQLite telemetry

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

## `openapi-client-generation`

**Purpose:** Utoipa export and Orval TypeScript generation  
**Primary implementation:** `src/bin/export_platform_openapi.rs; frontend/orval.config.ts`  
**Status:** implemented; build-verified  
**State/dependencies:** checked-in OpenAPI/client

**Execution:** the registered Axum handler or background entry validates trusted scope, invokes the named console/service/storage layer, maps source-specific records into legacy or typed v2 output, and converts failures through `AppError`. Exact functions, signatures, branches, callees, and line ranges are indexed in `07-symbol-reference/`.

