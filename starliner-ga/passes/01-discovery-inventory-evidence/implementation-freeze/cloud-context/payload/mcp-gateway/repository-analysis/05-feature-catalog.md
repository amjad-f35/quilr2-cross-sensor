# Feature catalog and traceability

The table maps implemented and partially implemented capabilities to concrete code. “Tests” names tracked files; it does not imply the test is selected by CI.

| Feature | Entry point | Primary symbols/modules | Data stores | External systems | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Backend registration/configuration | `/backends*` | `routes/backends.py`, `BackendRegistry`, `BackendRepository` | `backends`, catalog/settings/auth tables | Optional remote discovery | `e2e_test/test_backend_*`, store/auth tests | Active |
| Direct MCP proxy | `GET/POST/DELETE /{backend_id}/mcp` | `routes.mcp`, `MCPHandler.handle_request` | registry, logs/events, OAuth/auth state | Remote MCP | direct transport/OAuth/DLP/token-saving tests | Active |
| OneMCP aggregate endpoint | `/quilrone[/tenant]/mcp` | `quilrone_mcp_routes`, `OneMCPHandler`, `onemcp_*` services | sessions in memory; backend/log/memory DB state | Multiple remote MCPs | `test_onemcp_*`, transport tests | Active |
| MCP SSE/event sessions | OneMCP GET/DELETE and event routes | `onemcp_sessions`, `onemcp_routes`, `onemcp_events` | Process memory | Client connection | OneMCP tests | Active; process-local |
| Native memory MCP tools | OneMCP tool calls | `onemcp_native_tools`, memory repositories/services | `memories`, tenant memory settings | Optional embedding API | memory API/feature tests | Active |
| Tool confirmation | OneMCP/native dispatch | `onemcp_confirmation`, policies/settings | Process memory plus settings | Browser/client response | confirmation tests and frontend notes | Active; process-local |
| Client-app metadata | OneMCP tool discovery | `onemcp_client_apps.py` | transient metadata/logs | Remote MCP metadata | `test_onemcp_tool_metadata.py` | Active; module exceeds tested size ceiling |
| Gateway/admin authentication | `/auth*`, dependencies | `AuthService`, `routes.auth`, `dependencies.auth` | users, companies, admins, API tokens | None/IdPs | auth/admin tests | Active |
| Platform SSO | Entra/Google/Auth0 routes | `EntraAuthService`, `routes.entra_auth` | auth state/users/companies | Entra, Google, Auth0 | provider login tests | Active, configuration-dependent |
| Upstream OAuth proxy/DCR | `/oauth*`, OneMCP OAuth routes | `OAuthProxyService`, `OAuthService`, OAuth repositories | OAuth clients/states/tokens/proxy tokens | Remote OAuth servers | OAuth passthrough/refresh/DCR tests | Active |
| Static upstream auth | store/backend auth endpoints | `UpstreamAuthService`, `upstream_auth_*` repositories | encrypted static-auth rows | Remote MCP | upstream API-key tests | Active |
| Scoped tool/DLP/token-saving policy | admin/backend settings and tool dispatch | `ScopedSettingsResolver`, `DLPService`, policy/token-saving helpers | scoped settings, backend settings, logs | Optional tokenizer assets | scoped/DLP/token-saving tests | Active |
| MCP store/catalog | `/api/mcp-store*` v1/v2 | `routes.store`, seed/catalog services/repositories | `mcp_catalog`, FTS, backends | Catalog backend endpoints | store v1/v2 tests | Active |
| User/admin memory APIs | `/api/admin/memories*`, `/api/user/memories*` | memory routes/services/repositories | memory tables | Embedding API | memory tests | Active |
| Smart groups and ZIA | `/api/smart-groups`, `/api/zia/*` | `smart_groups_service`, `zia_utils`, gateway handlers | snapshots/cache/settings | ClickHouse, Zscaler ZIA | smart-group snapshot tests | Active, external-service dependent |
| Tool/event logging and admin analytics | `/api/logs*`, `/api/detailed-logs*`, export | logging services and repositories | `mcp_logs.db`, `mcpgateway_logs.db` | Optional ClickHouse | log/rejection/status tests | Active |
| SQLite→ClickHouse synchronization | sync CLI | `clickhouse_sync_utils.syncer` | reads three SQLite DBs/settings | ClickHouse | `test_sync_sqlite_to_clickhouse.py` | Active standalone utility |
| Workflow authoring/publishing/scheduling | `/api/workflow-agents*` | `WorkflowAgentService`, workflow routes/repos | gateway workflow tables | Runner for execution | `test_workflow_agents.py`, scheduler tests | Active control plane |
| Workflow run administration | `/api/workflow-runs*` | `routes.workflow_run_admin` | gateway and runner run metadata | Runner HTTP | workflow tests | Active |
| Workflow execution/chat/artifacts | runner API/worker | `workflow_runner.app`, `engine`, `worker` | runner DB and artifact directory | Gateway MCP/LLM URLs from payload | workflow runner tests | Active separate process |
| Workflow retention | retention worker | `retention_worker` | runner DB/artifacts | None | workflow tests | Active separate process |
| Starliner observe delivery | gateway lifespan/routes | `starliner.runtime.MCPObserveRuntime`, mapper/outbox/exporter | gateway outbox/terminal tables | Private Starliner contracts/export target | Starliner policy/outbox tests | Optional; private dependency missing locally |
| Legacy Starliner enforcement adapter | MCP handler hook | `services.starliner_adapter` | event/log state | Legacy `starliner.adapters` package | top-level adapter/handler tests | Optional/compatibility path |
| Google Workspace MCP | FastMCP server | `google_workspace.server` tools and Google helpers | token state owned by auth provider | Gmail/Calendar/Google OAuth | no scoped test files | Separate server; root secret helper missing in scope |
| Rust dashboard/API slice | Rust binary | `main.rs`, `routes::*` | gateway/log SQLite DBs | None shown | no Rust tests | Partial implementation |
| Remote backend research/probing | tools CLIs | `probe_remote_mcp_servers`, `probe_lazy_auth` | JSON input/output files | Public remote MCPs | probe unit tests | Operational/research utility |

## Important alternative paths

- Direct MCP identity resolution can use a workflow delegation token, OAuth passthrough, API-token/MCP-user identity, proxy token, or legacy raw token. Failure paths differ by branch.
- Policy resolution is scoped; backend/user/tenant settings can affect tool availability, DLP, confirmation, and token-saving.
- OneMCP can dispatch a native tool or a remote backend tool.
- OAuth supports discovery/DCR and static/manual configurations, with refresh/self-heal paths.
- Starliner observe mode is best-effort at startup; enforcement mode in the older adapter can run in shadow or enforce behavior when its external package is present.

Full operation-by-operation interface records are in [10-api-and-interface-reference.md](10-api-and-interface-reference.md).
