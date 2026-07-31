# Native Record Types

## Native Record: `llm_gateway_log`

**Store/transport:** ClickHouse llmgateway_logs_v3  
**Producer:** upstream LLM gateway  
**Lifecycle:** read-only projection  
**Platform mapping:** interaction/activity/evidence

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `mcp_tool_call`

**Store/transport:** ClickHouse mcp_tool_calls_v2  
**Producer:** MCP gateway  
**Lifecycle:** read-only projection  
**Platform mapping:** tool activity/evidence

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `mcp_rejected_request`

**Store/transport:** ClickHouse mcp_rejected_requests_v2  
**Producer:** MCP gateway  
**Lifecycle:** read-only projection  
**Platform mapping:** rejection evidence

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `endpoint_dlp_log`

**Store/transport:** Endpoint ClickHouse endpoint_dlp_logs_v4  
**Producer:** Endpoint sensor  
**Lifecycle:** read-only projection  
**Platform mapping:** DLP activity/evidence

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `endpoint_activity`

**Store/transport:** Endpoint ClickHouse endpoint_activity_log  
**Producer:** Endpoint sensor  
**Lifecycle:** read-only projection  
**Platform mapping:** activity

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `endpoint_entity`

**Store/transport:** Endpoint entity tables  
**Producer:** Endpoint sensor  
**Lifecycle:** read-only projection  
**Platform mapping:** inventory candidate

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `browser_alert_event`

**Store/transport:** Browser ClickHouse quilr_alert_events  
**Producer:** Browser sensor  
**Lifecycle:** read-only projection  
**Platform mapping:** finding signal

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `browser_app_setting`

**Store/transport:** Browser ClickHouse app_tenant_settings  
**Producer:** Browser/query services  
**Lifecycle:** read-only projection  
**Platform mapping:** configuration snapshot

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `auth_principal`

**Store/transport:** PostgreSQL auth schema  
**Producer:** instance manager/auth  
**Lifecycle:** read  
**Platform mapping:** identity/authorization

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `auth_session`

**Store/transport:** Redis  
**Producer:** AuthService  
**Lifecycle:** read/write with TTL  
**Platform mapping:** session state

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `console_saved_view`

**Store/transport:** PostgreSQL console_saved_views  
**Producer:** SavedViewService  
**Lifecycle:** CRUD/soft delete  
**Platform mapping:** personal UI configuration

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `saved_view_preference`

**Store/transport:** PostgreSQL console_saved_view_preferences  
**Producer:** SavedViewService  
**Lifecycle:** upsert/delete  
**Platform mapping:** personal default

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `custom_dashboard_document`

**Store/transport:** PostgreSQL custom_dashboard_documents  
**Producer:** CustomDashboardService  
**Lifecycle:** CRUD  
**Platform mapping:** dashboard definition

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `custom_dashboard_run`

**Store/transport:** PostgreSQL custom_dashboard_runs  
**Producer:** CustomDashboardService  
**Lifecycle:** workflow updates/cleanup  
**Platform mapping:** generation state

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `console_assist_message`

**Store/transport:** PostgreSQL console_assist  
**Producer:** ConsoleAssistService  
**Lifecycle:** append/read  
**Platform mapping:** support conversation

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `topic_catalog`

**Store/transport:** ClickHouse ai_activity_topic_catalog_v1  
**Producer:** activity topic writer  
**Lifecycle:** create/insert  
**Platform mapping:** derived topic

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `topic_classification`

**Store/transport:** ClickHouse ai_activity_topic_classifications_v1  
**Producer:** activity topic writer  
**Lifecycle:** create/insert  
**Platform mapping:** derived mapping

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `topic_runner_state`

**Store/transport:** ClickHouse ai_activity_topic_runner_state_v1  
**Producer:** activity topic writer  
**Lifecycle:** create/insert  
**Platform mapping:** checkpoint/dead letter

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `local_mirror`

**Store/transport:** SQLite LocalStore tables  
**Producer:** refreshers  
**Lifecycle:** transactional replace/read  
**Platform mapping:** read model/cache

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `conversation_cache`

**Store/transport:** SQLite  
**Producer:** ConversationDetailCache  
**Lifecycle:** bounded sanitized writes  
**Platform mapping:** performance cache

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `internal_telemetry`

**Store/transport:** SQLite internal_admin_telemetry.db  
**Producer:** API timing logger  
**Lifecycle:** append/read  
**Platform mapping:** operator diagnostics

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `neo4j_persona`

**Store/transport:** Neo4j  
**Producer:** external deployment graph  
**Lifecycle:** read only  
**Platform mapping:** identity/deployment candidate

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `neo4j_device`

**Store/transport:** Neo4j  
**Producer:** external deployment graph  
**Lifecycle:** read only  
**Platform mapping:** device candidate

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `provider_configuration`

**Store/transport:** PostgreSQL/external service  
**Producer:** gateway management  
**Lifecycle:** read/update proxy  
**Platform mapping:** configuration

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `openapi_document`

**Store/transport:** openapi/platform-admin-v2.json  
**Producer:** Utoipa exporter  
**Lifecycle:** generated/committed  
**Platform mapping:** contract

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `orval_client`

**Store/transport:** frontend/src/api/generated  
**Producer:** Orval  
**Lifecycle:** generated/committed  
**Platform mapping:** client contract

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `vite_asset`

**Store/transport:** frontend/dist  
**Producer:** Vite  
**Lifecycle:** generated/untracked/embedded  
**Platform mapping:** runtime UI

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `api_completion_event`

**Store/transport:** structured stdout  
**Producer:** api_log middleware  
**Lifecycle:** one per routed request  
**Platform mapping:** operational log

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `dashboard_alert`

**Store/transport:** Slack webhook  
**Producer:** Console Assist/dashboard alerts  
**Lifecycle:** network emission  
**Platform mapping:** operator alert

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

## Native Record: `product_analytics_state`

**Store/transport:** frontend query/Zustand/localStorage  
**Producer:** browser  
**Lifecycle:** transient/client persistence  
**Platform mapping:** presentation state

The exact concrete fields are repository-contract dependent. OpenAPI-visible fields are exhaustively expanded in the field ledger; deployed physical source columns remain subject to live schema validation.

