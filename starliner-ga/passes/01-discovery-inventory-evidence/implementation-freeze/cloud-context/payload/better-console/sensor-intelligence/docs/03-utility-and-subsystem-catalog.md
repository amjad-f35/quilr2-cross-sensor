# Utility and Subsystem Catalog

| Utility | Purpose | Location | Status |
| --- | --- | --- | --- |
| ObservedClickHouseClient | query timing wrapper | src/api_log.rs | active |
| AppError | HTTP error conversion and safe body | src/error.rs | active |
| Config::from_env | typed environment loading and validation | src/config.rs | active |
| AuthService | login/session/principal orchestration | src/auth/service.rs | active |
| SessionStore | Redis session lifecycle | src/auth/session_store.rs | active |
| PrincipalCache | bounded identity cache with grace/fail-closed semantics | src/auth/principal_cache.rs | active |
| authorize | resource/action permission decision | src/authz.rs | active |
| LocalStore | SQLite mirror and materialized read model | src/local_store.rs; src/local_store/ | active |
| run_refresher | periodic local mirror refresh | src/local_store.rs | active |
| ConversationDetailCache | bounded sanitized detail cache | src/conversation_detail_cache.rs | active |
| QueryExpression | typed bounded query AST | src/query_language.rs | active |
| GatewayManagementService | allowlisted gateway adapter | src/gateway_management.rs | active |
| PolicyManagementService | allowlisted policy adapter | src/policy_management.rs | active |
| DetectionModelsService | detection-model service adapter | src/detection_models.rs | active |
| AppsManagementService | legacy app-management adapter | src/apps_management.rs | active |
| BrowserExtensionAdminService | browser admin repositories/adapters | src/browser_extension/administration.rs | active |
| EndpointDeploymentService | Neo4j endpoint deployment circuit | src/endpointagent/deployment.rs | active |
| InventoryIconService | safe image fetch/cache | src/inventory_icons.rs | active |
| CustomDashboardService | dashboard lifecycle coordinator | src/custom_dashboards/service.rs | active |
| SavedViewService | personal view persistence | src/saved_views.rs | active |
| ConsoleAssistService | assist conversation coordinator | src/console_assist/service.rs | active |
| TopicClassifier | classification provider abstraction | src/activity_topics/classifier.rs | active |
| OwnedLease | Redis token-owned leader lease | src/activity_topics/lease.rs | active |
| RunnerState | topic pipeline checkpoint/retry/dead-letter state | src/activity_topics/runner.rs | active |
| source adapters | LLM/MCP/Endpoint/Browser event reads | src/activity_topics/sources/ | active |
| canonical_json | stable digest serialization | src/activity_topics/persistence.rs | active |
| platform mapping | legacy aggregates to semantic v2 DTOs | src/platform_admin_v2/mapping.rs | active |
| OpenAPI exporter | writes checked-in v2 specification | src/bin/export_platform_openapi.rs | active |
| Orval generator | generates React Query client/models | frontend/orval.config.ts | active |
| SessionBoundary | frontend auth/session routing state machine | frontend/src/app/SessionBoundary.tsx | active |
| QueryClient | frontend fetch cache/retry/error routing | frontend/src/app/App.tsx | active |
| Zustand session store | browser in-memory session projection | frontend/src/store/session.store.ts | active |
| safeReturnPath | same-origin relative navigation guard | frontend/src/lib/utils.ts | active |
| localStorageHelpers | theme/preferences browser persistence | @quilrbusiness/kit | external dependency |
| API error reporter | reports selected API failures to Console Assist | frontend/src/app/App.tsx::reportApiFailure | active |
| SPA fallback | explicit navigation allowlist | src/spa.rs | active |
| ApiJsonEventFormat | exact API completion log formatter | src/main.rs | active |
| GeoAnnotation | optional GeoIP projection | src/state.rs | active |
| agent_query_gate | per-process analytics concurrency semaphore | src/state.rs | active |
| build.rs freshness check | rebuilds SPA when source is newer | build.rs | active |

Exact signatures, branches, loops, calls, error paths, and excerpts are indexed under `better-console-backend-analysis/07-symbol-reference/`.
