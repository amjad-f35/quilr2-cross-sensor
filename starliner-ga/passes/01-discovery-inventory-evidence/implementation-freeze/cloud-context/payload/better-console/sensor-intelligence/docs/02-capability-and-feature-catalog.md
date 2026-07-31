# Capability and Feature Catalog

## Feature: `session-authentication`

### Purpose
OIDC, SAML, password login, session creation/revocation

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/auth.rs; src/auth/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
PostgreSQL; Redis.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `tenant-selection`

### Purpose
select and switch trusted tenant context

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/routes/platform_admin_v2.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
PostgreSQL; session.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `platform-authorization`

### Purpose
permission/resource/action checks and wildcard evaluation

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/authz.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
principal grants.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `llm-log-analytics`

### Purpose
query LLM requests, details, usage, provider health, exports

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/routes/admin_logs.rs; src/analytics/admin_logs.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
ClickHouse llmgateway_logs_v3.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `mcp-log-analytics`

### Purpose
tool-call, rejection, graph, insight, and export views

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/mcpgateway/; src/routes/mcpgateway.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
ClickHouse mcp_*_v2.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `endpoint-analytics`

### Purpose
Endpoint DLP/activity/entity analytics and conversation detail

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/endpointagent/; src/console/conversations/endpoint/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
Endpoint ClickHouse V4.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `browser-analytics`

### Purpose
browser inventory, activity, findings, personas, settings

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/browser_extension/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
Browser ClickHouse; PostgreSQL; Neo4j.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `unified-inventory`

### Purpose
cross-channel asset catalog, details, metrics, findings, configuration

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/console/inventory/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
LocalStore; ClickHouse.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `unified-users`

### Purpose
directory/user views, query language, product summaries

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/console/users/; src/query_language.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
LocalStore; PostgreSQL; ClickHouse.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `overview-dashboards`

### Purpose
posture, coverage, flows, graph, and executive views

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/console/overview/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
LocalStore; ClickHouse.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `conversation-explorer`

### Purpose
cross-source conversations, facets, detail, caching

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/console/conversations/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
ClickHouse; SQLite cache.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `activity-topics`

### Purpose
bounded classification pipeline with Redis leadership and ClickHouse derived state

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/activity_topics/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
Redis; ClickHouse; SQLite; DeepSeek/Workers AI.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `custom-dashboards`

### Purpose
AI-assisted dashboard design, storage, execution, ACL, cleanup

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/custom_dashboards/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
PostgreSQL; ClickHouse; Claude CLI/Python.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `saved-views`

### Purpose
personal Inventory, Users, and Interactions views/preferences

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/saved_views.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
PostgreSQL.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `console-assist`

### Purpose
help/error/feature-request conversations and history

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/console_assist/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
PostgreSQL; Anthropic; Slack.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `policy-management`

### Purpose
closed-allowlist proxies for controls/playbooks/templates

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/policy_management/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
external policy services.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `detection-models`

### Purpose
model catalog, validation, suggestions, upload

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/detection_models/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
data-definitions service.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `gateway-management`

### Purpose
LLM/MCP service management and streaming proxy

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/gateway_management/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
auth/LLM/MCP services.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `browser-app-management`

### Purpose
posture/classification/owners/detection control adapters

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/apps_management/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
legacy browser/query services.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `platform-access`

### Purpose
RBAC, group grants, directory/readiness projection

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/platform_admin_v2/platform_access.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
PostgreSQL; LocalStore.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `audit-log-view`

### Purpose
audit queries, facets, snapshots

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/console/audit_logs.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
LocalStore.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `internal-admin`

### Purpose
separate operator authentication and diagnostics

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/internal_admin/`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
SQLite.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `embedded-spa`

### Purpose
compile-time Vite asset embedding and navigation fallback

### Trigger
Registered route, browser navigation, background startup, or build command identified at `build.rs; src/spa.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
embedded files.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `export-surfaces`

### Purpose
streaming NDJSON and legacy exports with redaction

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/routes/admin_export.rs; src/routes/mcpgateway_export.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
ClickHouse.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `conversation-detail-cache`

### Purpose
bounded SQLite detail cache with secret-value redaction

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/conversation_detail_cache.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
SQLite.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `geoip-annotation`

### Purpose
best-effort public-IP city/country annotation

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/state.rs::geo_annotation`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
GeoLite2 file.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `inventory-icon-proxy`

### Purpose
allowlisted HTTPS raster icon proxy and cache

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/inventory_icons.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
external HTTPS; memory.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `model-pricing`

### Purpose
versioned token cost computation from JSON

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/model_pricing.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
model_pricing.json.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `api-completion-telemetry`

### Purpose
one-line completion JSON plus internal timing capture

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/api_log.rs`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
tracing; SQLite telemetry.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
runtime-tested.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.

## Feature: `openapi-client-generation`

### Purpose
Utoipa export and Orval TypeScript generation

### Trigger
Registered route, browser navigation, background startup, or build command identified at `src/bin/export_platform_openapi.rs; frontend/orval.config.ts`.

### Preconditions
Validated configuration and the route-specific session/permission/source readiness.

### Inputs
Typed route/query/body fields from the checked-in OpenAPI/legacy route contract plus trusted principal scope.

### Execution
Transport adapter → validation/auth → service/console module → store or fixed upstream adapter → mapping/response. Exact symbol execution is in the repository symbol reference.

### Local state
checked-in OpenAPI/client.

### Outputs
HTTP/read-model output, derived/persistent state, or background logs as defined by the implementing symbols.

### Failure behavior
Request errors become `AppError`; background failures log/retry without stopping HTTP unless startup construction failed.

### Tests and verification
build-verified.

### Platform value
Provides platform visibility/control; source authority remains with named source systems.

### Current limitations
No universal native observation/outbox or independent control-effect proof.


## Feature traceability matrix

| feature_id | purpose | entry_or_symbols | implementation_status | verification | state_or_dependency |
| --- | --- | --- | --- | --- | --- |
| session-authentication | OIDC, SAML, password login, session creation/revocation | src/auth.rs; src/auth/ | implemented | runtime-tested | PostgreSQL; Redis |
| tenant-selection | select and switch trusted tenant context | src/routes/platform_admin_v2.rs | implemented | runtime-tested | PostgreSQL; session |
| platform-authorization | permission/resource/action checks and wildcard evaluation | src/authz.rs | implemented | runtime-tested | principal grants |
| llm-log-analytics | query LLM requests, details, usage, provider health, exports | src/routes/admin_logs.rs; src/analytics/admin_logs.rs | implemented | runtime-tested | ClickHouse llmgateway_logs_v3 |
| mcp-log-analytics | tool-call, rejection, graph, insight, and export views | src/mcpgateway/; src/routes/mcpgateway.rs | implemented | runtime-tested | ClickHouse mcp_*_v2 |
| endpoint-analytics | Endpoint DLP/activity/entity analytics and conversation detail | src/endpointagent/; src/console/conversations/endpoint/ | implemented | runtime-tested | Endpoint ClickHouse V4 |
| browser-analytics | browser inventory, activity, findings, personas, settings | src/browser_extension/ | implemented | runtime-tested | Browser ClickHouse; PostgreSQL; Neo4j |
| unified-inventory | cross-channel asset catalog, details, metrics, findings, configuration | src/console/inventory/ | implemented | runtime-tested | LocalStore; ClickHouse |
| unified-users | directory/user views, query language, product summaries | src/console/users/; src/query_language.rs | implemented | runtime-tested | LocalStore; PostgreSQL; ClickHouse |
| overview-dashboards | posture, coverage, flows, graph, and executive views | src/console/overview/ | implemented | runtime-tested | LocalStore; ClickHouse |
| conversation-explorer | cross-source conversations, facets, detail, caching | src/console/conversations/ | implemented | runtime-tested | ClickHouse; SQLite cache |
| activity-topics | bounded classification pipeline with Redis leadership and ClickHouse derived state | src/activity_topics/ | implemented | runtime-tested | Redis; ClickHouse; SQLite; DeepSeek/Workers AI |
| custom-dashboards | AI-assisted dashboard design, storage, execution, ACL, cleanup | src/custom_dashboards/ | implemented | runtime-tested | PostgreSQL; ClickHouse; Claude CLI/Python |
| saved-views | personal Inventory, Users, and Interactions views/preferences | src/saved_views.rs | implemented | runtime-tested | PostgreSQL |
| console-assist | help/error/feature-request conversations and history | src/console_assist/ | implemented | runtime-tested | PostgreSQL; Anthropic; Slack |
| policy-management | closed-allowlist proxies for controls/playbooks/templates | src/policy_management/ | implemented | runtime-tested | external policy services |
| detection-models | model catalog, validation, suggestions, upload | src/detection_models/ | implemented | runtime-tested | data-definitions service |
| gateway-management | LLM/MCP service management and streaming proxy | src/gateway_management/ | implemented | runtime-tested | auth/LLM/MCP services |
| browser-app-management | posture/classification/owners/detection control adapters | src/apps_management/ | implemented | runtime-tested | legacy browser/query services |
| platform-access | RBAC, group grants, directory/readiness projection | src/platform_admin_v2/platform_access.rs | implemented | runtime-tested | PostgreSQL; LocalStore |
| audit-log-view | audit queries, facets, snapshots | src/console/audit_logs.rs | implemented | runtime-tested | LocalStore |
| internal-admin | separate operator authentication and diagnostics | src/internal_admin/ | implemented | runtime-tested | SQLite |
| embedded-spa | compile-time Vite asset embedding and navigation fallback | build.rs; src/spa.rs | implemented | runtime-tested | embedded files |
| export-surfaces | streaming NDJSON and legacy exports with redaction | src/routes/admin_export.rs; src/routes/mcpgateway_export.rs | implemented | runtime-tested | ClickHouse |
| conversation-detail-cache | bounded SQLite detail cache with secret-value redaction | src/conversation_detail_cache.rs | implemented | runtime-tested | SQLite |
| geoip-annotation | best-effort public-IP city/country annotation | src/state.rs::geo_annotation | implemented | runtime-tested | GeoLite2 file |
| inventory-icon-proxy | allowlisted HTTPS raster icon proxy and cache | src/inventory_icons.rs | implemented | runtime-tested | external HTTPS; memory |
| model-pricing | versioned token cost computation from JSON | src/model_pricing.rs | implemented | runtime-tested | model_pricing.json |
| api-completion-telemetry | one-line completion JSON plus internal timing capture | src/api_log.rs | implemented | runtime-tested | tracing; SQLite telemetry |
| openapi-client-generation | Utoipa export and Orval TypeScript generation | src/bin/export_platform_openapi.rs; frontend/orval.config.ts | implemented | build-verified | checked-in OpenAPI/client |
