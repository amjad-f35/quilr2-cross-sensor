# Active Python interface registry

Static route-composition evidence for the pinned tree.

`Verified:` Gateway rows are direct `@app` handlers in `gateway.py` or decorators attached to router objects explicitly included by `gateway.py`, including the five router objects nested into `routes.quilrone.router`. Prefixes are literal `APIRouter(prefix=...)` values. `Unresolved:` FastAPI dependency internals, runtime monkey-patching, or routes added by third-party objects are not expanded.

## Active Python gateway HTTP/WebSocket operations (275)

| Method | Path | Handler | Response model | Route-local authentication evidence |
| --- | --- | --- | --- | --- |
| `GET` | `/` | `gateway.py:696::user_login_page` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/.well-known/oauth-authorization-server/quilrone` | `routes/quilrone_oauth_routes.py:38::onemcp_tenantless_oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-authorization-server/quilrone/mcp` | `routes/quilrone_oauth_routes.py:38::onemcp_tenantless_oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-authorization-server/quilrone/{tenant_id}` | `routes/quilrone_oauth_routes.py:277::onemcp_oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-authorization-server/quilrone/{tenant_id}/mcp` | `routes/quilrone_oauth_routes.py:277::onemcp_oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-authorization-server/{backend_id}` | `routes/oauth.py:929::oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-authorization-server/{backend_id}/mcp` | `routes/oauth.py:929::oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-protected-resource/quilrone` | `routes/quilrone_oauth_routes.py:54::onemcp_tenantless_oauth_protected_resource` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/.well-known/oauth-protected-resource/quilrone/mcp` | `routes/quilrone_oauth_routes.py:54::onemcp_tenantless_oauth_protected_resource` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/.well-known/oauth-protected-resource/quilrone/{tenant_id}` | `routes/quilrone_oauth_routes.py:299::onemcp_oauth_protected_resource` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-protected-resource/quilrone/{tenant_id}/mcp` | `routes/quilrone_oauth_routes.py:299::onemcp_oauth_protected_resource` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-protected-resource/{backend_id}` | `routes/oauth.py:988::oauth_protected_resource` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/oauth-protected-resource/{backend_id}/mcp` | `routes/oauth.py:988::oauth_protected_resource` | `Unspecified` | authorization-header handling |
| `GET` | `/.well-known/openid-configuration/quilrone` | `routes/quilrone_oauth_routes.py:16::onemcp_tenantless_openid_configuration` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/.well-known/openid-configuration/quilrone/{tenant_id}` | `routes/quilrone_oauth_routes.py:249::onemcp_openid_configuration` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/.well-known/openid-configuration/{backend_id}` | `routes/oauth.py:874::openid_configuration` | `Unspecified` | authorization-header handling |
| `POST` | `/add_company` | `routes/auth.py:259::add_company` | `CompanyResponse` | `ADMIN_AUTH_TOKEN` comparison/use |
| `GET` | `/add_user` | `gateway.py:680::add_user_page` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `POST` | `/add_user` | `routes/auth.py:200::add_user` | `UserResponse` | `ADMIN_AUTH_TOKEN` comparison/use |
| `GET` | `/admin/catalog` | `routes/auth.py:700::list_catalog_admin` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `POST` | `/admin/catalog` | `routes/auth.py:710::add_catalog_entry` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `POST` | `/admin/catalog/probe` | `routes/auth.py:542::probe_mcp` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `DELETE` | `/admin/catalog/{catalog_id}` | `routes/auth.py:856::delete_catalog_entry` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `GET` | `/api` | `gateway.py:577::api_info` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/audit-logs` | `routes/admin_audit.py:31::list_admin_audit_logs` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/audit-logs/{audit_id}` | `routes/admin_audit.py:66::get_admin_audit_log` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/admin/audit-logs/{audit_id}/rollback` | `routes/admin_audit.py:78::rollback_admin_audit_log` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/memories` | `routes/admin_memories.py:90::list_admin_memories` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/admin/memories/{memory_id}` | `routes/admin_memories.py:144::delete_admin_memory` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/memories/{memory_id}` | `routes/admin_memories.py:127::get_admin_memory` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/platform-info` | `routes/admin_dashboard.py:50::get_platform_info` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/rejected-mcp-requests` | `routes/admin_dashboard.py:545::get_admin_rejected_mcp_requests` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/settings/memories` | `routes/admin_dashboard.py:119::get_memory_feature_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/admin/settings/memories` | `routes/admin_dashboard.py:130::set_memory_feature_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/settings/smart-mode` | `routes/admin_dashboard.py:65::get_smart_mode_policy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/admin/settings/smart-mode` | `routes/admin_dashboard.py:76::set_smart_mode_policy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/user-mcp-status` | `routes/admin_dashboard.py:366::get_admin_user_mcp_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/admin/workflow-agent-quota-policies` | `routes/workflow_agents.py:734::delete_workflow_agent_quota_policy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-agent-quota-policies` | `routes/workflow_agents.py:689::list_workflow_agent_quota_policies` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PUT` | `/api/admin/workflow-agent-quota-policies` | `routes/workflow_agents.py:698::upsert_workflow_agent_quota_policy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/admin/workflow-agent-quota-policies/resolve` | `routes/workflow_agents.py:719::resolve_workflow_agent_quota_policy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-agents/ops-status` | `routes/workflow_agents.py:757::get_workflow_agents_ops_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-agents/{agent_id}/runs` | `routes/workflow_run_admin.py:486::list_admin_workflow_agent_runs` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs` | `routes/workflow_run_admin.py:398::list_admin_workflow_runs` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/summary` | `routes/workflow_run_admin.py:439::get_admin_workflow_run_summary` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/{run_id}` | `routes/workflow_run_admin.py:549::get_admin_workflow_run` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/{run_id}/artifacts` | `routes/workflow_run_admin.py:616::list_admin_workflow_run_artifacts` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/{run_id}/artifacts/{artifact_id}` | `routes/workflow_run_admin.py:646::get_admin_workflow_run_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/{run_id}/artifacts/{artifact_id}/download` | `routes/workflow_run_admin.py:694::download_admin_workflow_run_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/{run_id}/artifacts/{artifact_id}/preview` | `routes/workflow_run_admin.py:664::preview_admin_workflow_run_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/admin/workflow-runs/{run_id}/cancel` | `routes/workflow_run_admin.py:530::cancel_admin_workflow_run` | `Unspecified` | authorization-header handling |
| `POST` | `/api/admin/workflow-runs/{run_id}/rerun` | `routes/workflow_run_admin.py:716::rerun_admin_workflow_run` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/admin/workflow-runs/{run_id}/steps` | `routes/workflow_run_admin.py:585::list_admin_workflow_run_steps` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/clients` | `routes/clients.py:221::list_clients` | `ClientListResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/clients/{client_id}` | `routes/clients.py:249::get_client` | `ClientInfo` | No route-local auth evidence; middleware/service checks remain possible |
| `PUT` | `/api/clients/{client_id}/backends/{backend_id}` | `routes/clients.py:278::update_client_backend_access` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/custom-agents` | `routes/clients.py:379::list_custom_agents` | `CustomAgentListResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/custom-agents` | `routes/clients.py:396::create_custom_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/custom-agents/{keyword}` | `routes/clients.py:483::delete_custom_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/detailed-logs` | `gateway.py:1390::get_detailed_logs` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/auth-challenges` | `gateway.py:1850::get_auth_challenge_groups` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/connection-attempts` | `gateway.py:2002::get_connection_attempts` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/issues` | `gateway.py:1888::get_detailed_log_issues` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/oauth-cleared-tokens` | `gateway.py:1813::get_oauth_cleared_tokens` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/oauth-health` | `gateway.py:2133::get_oauth_health` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/oauth-refresh-failures` | `gateway.py:1771::get_oauth_refresh_failures` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/oauth-stuck` | `gateway.py:2093::get_oauth_stuck_flows` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/stats` | `gateway.py:1433::get_detailed_logs_stats` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/tool-calls-per-minute` | `gateway.py:1684::get_detailed_logs_tool_calls_per_minute` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/tool-usage` | `gateway.py:1564::get_detailed_logs_tool_usage` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/detailed-logs/user-mcp-status` | `gateway.py:1150::get_user_mcp_status` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/api/logs` | `routes/logs.py:207::get_logs` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/logs/analytics` | `routes/logs.py:455::get_logs_analytics` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/logs/filter-options` | `routes/logs.py:351::get_logs_filter_options` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/logs/graph` | `routes/logs.py:385::get_logs_graph` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/logs/mcp-usage` | `routes/logs.py:523::get_mcp_usage` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/mcp-store` | `routes/store.py:245::list_store` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/mcp-store/catalog` | `routes/store.py:273::list_catalog` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/mcp-store/requests` | `routes/store.py:458::list_requests` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/mcp-store/requests/{request_id}/dismiss` | `routes/store.py:483::dismiss_request` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/mcp-store/{catalog_id}/install` | `routes/store.py:512::install_catalog_mcp` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/mcp-store/{catalog_id}/request` | `routes/store.py:735::request_catalog_mcp` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/mcp-store/{catalog_id}/uninstall` | `routes/store.py:699::uninstall_catalog_mcp` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/mcp_base_url` | `gateway.py:633::mcp_base_url` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/my-access` | `gateway.py:2224::get_my_access` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/oauth/disconnect/{backend_id}` | `routes/oauth.py:3330::oauth_disconnect` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/oauth/status/{backend_id}` | `routes/oauth.py:3272::oauth_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/smart-groups` | `gateway.py:2202::get_smart_groups` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/backends` | `routes/backends.py:860::list_user_backends` | `List[BackendInfo]` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/backends/{backend_id}` | `routes/backends.py:1051::get_user_backend` | `BackendInfo` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/backends/{backend_id}/capabilities` | `routes/backends.py:1176::get_user_backend_capabilities` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/backends/{backend_id}/settings` | `routes/backends.py:1368::get_user_backend_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/logs` | `routes/logs.py:293::get_user_logs` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/logs/analytics` | `routes/logs.py:501::get_user_logs_analytics` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/logs/graph` | `routes/logs.py:427::get_user_logs_graph` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/logs/mcp-usage` | `routes/logs.py:565::get_user_mcp_usage` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/mcp-dashboard/summary` | `routes/backends.py:866::get_user_mcp_dashboard_summary` | `UserMCPDashboardSummary` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/mcp-preferences` | `routes/oauth.py:3372::get_mcp_preferences` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PUT` | `/api/user/mcp-preferences/{backend_id}` | `routes/oauth.py:3382::set_mcp_preference` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/me` | `routes/auth.py:247::get_user_me` | `UserResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/memories` | `routes/user_memories.py:113::list_user_memories` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/user/memories` | `routes/user_memories.py:171::create_user_memory` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/memories/status` | `routes/user_memories.py:104::get_memory_feature_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/user/memories/{memory_id}` | `routes/user_memories.py:215::delete_user_memory` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/memories/{memory_id}` | `routes/user_memories.py:150::get_user_memory` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PATCH` | `/api/user/memories/{memory_id}` | `routes/user_memories.py:192::update_user_memory` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/smart-mode` | `routes/oauth.py:3406::get_smart_mode` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PUT` | `/api/user/smart-mode` | `routes/oauth.py:3421::set_smart_mode` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/user/upstream-auth/status/{backend_id}` | `routes/oauth.py:3229::user_upstream_auth_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/user/upstream-auth/{backend_id}` | `routes/oauth.py:3253::delete_user_upstream_auth` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/user/upstream-auth/{backend_id}` | `routes/oauth.py:3236::save_user_upstream_auth` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/v2/mcp-store` | `routes/store.py:338::list_store_v2` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/v2/mcp-store/catalog` | `routes/store.py:383::list_catalog_v2` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/v2/mcp-store/{catalog_id}` | `routes/store.py:440::get_store_item_v2` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents` | `routes/workflow_agents.py:1041::list_workflow_agents` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents` | `routes/workflow_agents.py:1057::create_workflow_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/available` | `routes/workflow_agents.py:678::list_available_workflow_agents` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/llm-api-keys` | `routes/workflow_agents.py:667::list_workflow_agent_llm_api_keys` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/tool-picker` | `routes/workflow_agents.py:653::list_workflow_agent_tool_picker` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}` | `routes/workflow_agents.py:1099::get_workflow_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PATCH` | `/api/workflow-agents/{agent_id}` | `routes/workflow_agents.py:1110::update_workflow_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/archive` | `routes/workflow_agents.py:1198::archive_workflow_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/bindings` | `routes/workflow_agents.py:1239::list_workflow_agent_bindings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PUT` | `/api/workflow-agents/{agent_id}/bindings` | `routes/workflow_agents.py:1251::replace_workflow_agent_bindings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/chat-sessions` | `routes/workflow_agents.py:1396::list_workflow_agent_chat_sessions` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/chat-sessions` | `routes/workflow_agents.py:1339::create_workflow_agent_chat_session` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/effective-access` | `routes/workflow_agents.py:1282::get_workflow_agent_effective_access` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/publish` | `routes/workflow_agents.py:1143::publish_workflow_agent` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/readiness` | `routes/workflow_agents.py:1327::get_workflow_agent_readiness` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/run-config` | `routes/workflow_agents.py:1304::get_workflow_agent_run_config` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/runs` | `routes/workflow_agents.py:1670::start_workflow_agent_run` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/schedules` | `routes/workflow_agents.py:1736::list_workflow_agent_schedules` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/schedules` | `routes/workflow_agents.py:1753::create_workflow_agent_schedule` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}` | `routes/workflow_agents.py:1833::delete_workflow_agent_schedule` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}` | `routes/workflow_agents.py:1796::get_workflow_agent_schedule` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PATCH` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}` | `routes/workflow_agents.py:1807::update_workflow_agent_schedule` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}/events` | `routes/workflow_agents.py:1915::list_workflow_agent_schedule_events` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}/pause` | `routes/workflow_agents.py:1855::pause_workflow_agent_schedule` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}/readiness` | `routes/workflow_agents.py:1899::get_workflow_agent_schedule_readiness` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-agents/{agent_id}/schedules/{schedule_id}/resume` | `routes/workflow_agents.py:1877::resume_workflow_agent_schedule` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-agents/{agent_id}/versions` | `routes/workflow_agents.py:1224::list_workflow_agent_versions` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/api/workflow-chat-sessions/{session_id}` | `routes/workflow_agents.py:1453::delete_workflow_chat_session` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}` | `routes/workflow_agents.py:1425::get_workflow_chat_session` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PATCH` | `/api/workflow-chat-sessions/{session_id}` | `routes/workflow_agents.py:1434::update_workflow_chat_session` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/artifacts` | `routes/workflow_agents.py:1550::list_workflow_chat_artifacts` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/artifacts/{artifact_id}` | `routes/workflow_agents.py:1597::get_workflow_chat_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/artifacts/{artifact_id}/download` | `routes/workflow_agents.py:1639::download_workflow_chat_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/artifacts/{artifact_id}/preview` | `routes/workflow_agents.py:1611::preview_workflow_chat_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/messages` | `routes/workflow_agents.py:1470::list_workflow_chat_messages` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-chat-sessions/{session_id}/messages` | `routes/workflow_agents.py:1481::send_workflow_chat_message` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/turns/{turn_id}` | `routes/workflow_agents.py:1530::get_workflow_chat_turn` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/turns/{turn_id}/artifacts` | `routes/workflow_agents.py:1574::list_workflow_chat_turn_artifacts` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-chat-sessions/{session_id}/turns/{turn_id}/cancel` | `routes/workflow_agents.py:1659::cancel_workflow_chat_turn` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-chat-sessions/{session_id}/turns/{turn_id}/steps` | `routes/workflow_agents.py:1540::list_workflow_chat_turn_steps` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs` | `routes/workflow_agents.py:796::list_workflow_runs` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs/{run_id}` | `routes/workflow_agents.py:865::get_workflow_run` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs/{run_id}/artifacts` | `routes/workflow_agents.py:945::list_workflow_run_artifacts` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs/{run_id}/artifacts/{artifact_id}` | `routes/workflow_agents.py:974::get_workflow_run_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs/{run_id}/artifacts/{artifact_id}/download` | `routes/workflow_agents.py:1020::download_workflow_run_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs/{run_id}/artifacts/{artifact_id}/preview` | `routes/workflow_agents.py:991::preview_workflow_run_artifact` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/workflow-runs/{run_id}/cancel` | `routes/workflow_agents.py:930::cancel_workflow_run` | `Unspecified` | authorization-header handling |
| `POST` | `/api/workflow-runs/{run_id}/rerun` | `routes/workflow_agents.py:1937::rerun_workflow_run` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/workflow-runs/{run_id}/steps` | `routes/workflow_agents.py:900::list_workflow_run_steps` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/api/zia/connect` | `gateway.py:2246::zia_connect` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/zia/groups-departments` | `gateway.py:2347::zia_groups_departments` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/api/zia/status` | `gateway.py:2324::zia_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/auth0/complete` | `routes/entra_auth.py:344::complete_auth0_login` | `CompleteResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/auth0/initiate` | `routes/entra_auth.py:328::initiate_auth0_login` | `InitiateResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/auth0/user/complete` | `routes/entra_auth.py:385::complete_auth0_user_login` | `UserCompleteResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/auth0/user/initiate` | `routes/entra_auth.py:369::initiate_auth0_user_login` | `InitiateResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/auth/callback` | `gateway.py:688::auth_callback` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/entra/complete` | `routes/entra_auth.py:154::complete_entra_login` | `CompleteResponse` | authorization-header handling |
| `POST` | `/auth/entra/initiate` | `routes/entra_auth.py:137::initiate_entra_login` | `InitiateResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/entra/internal-login` | `routes/entra_auth.py:413::internal_login` | `CompleteResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/auth/entra/state/{state}` | `routes/entra_auth.py:118::check_state_type` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/entra/user/complete` | `routes/entra_auth.py:203::complete_user_login` | `UserCompleteResponse` | authorization-header handling |
| `POST` | `/auth/entra/user/initiate` | `routes/entra_auth.py:186::initiate_user_login` | `InitiateResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/entra/user/logout` | `routes/entra_auth.py:234::logout_user` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/google/complete` | `routes/entra_auth.py:259::complete_google_login` | `CompleteResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/google/initiate` | `routes/entra_auth.py:243::initiate_google_login` | `InitiateResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/google/user/complete` | `routes/entra_auth.py:300::complete_google_user_login` | `UserCompleteResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/auth/google/user/initiate` | `routes/entra_auth.py:284::initiate_google_user_login` | `InitiateResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends` | `routes/backends.py:849::list_backends` | `List[BackendInfo]` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends` | `routes/backends.py:586::register_backend` | `BackendInfo` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/probe` | `routes/backends.py:644::probe_backend` | `ProbeResponse` | authorization-header handling |
| `DELETE` | `/backends/{backend_id}` | `routes/backends.py:1094::unregister_backend` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends/{backend_id}` | `routes/backends.py:1042::get_backend` | `BackendInfo` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends/{backend_id}/api-tokens` | `routes/backends.py:1857::list_api_tokens` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/{backend_id}/api-tokens` | `routes/backends.py:1784::create_api_token` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/backends/{backend_id}/api-tokens/{token_id}` | `routes/backends.py:1872::revoke_api_token` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends/{backend_id}/capabilities` | `routes/backends.py:1168::get_backend_capabilities` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/{backend_id}/fetch-capabilities` | `routes/backends.py:1339::fetch_backend_capabilities` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/{backend_id}/refresh-capabilities` | `routes/backends.py:1184::refresh_backend_capabilities` | `Unspecified` | authorization-header handling |
| `DELETE` | `/backends/{backend_id}/scoped-settings` | `routes/backends.py:1456::delete_scoped_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends/{backend_id}/scoped-settings` | `routes/backends.py:1376::list_scoped_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PUT` | `/backends/{backend_id}/scoped-settings` | `routes/backends.py:1389::upsert_scoped_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/{backend_id}/scoped-settings/resolve` | `routes/backends.py:1501::resolve_scoped_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends/{backend_id}/settings` | `routes/backends.py:1360::get_backend_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/{backend_id}/settings` | `routes/backends.py:1727::update_backend_settings` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `PATCH` | `/backends/{backend_id}/status` | `routes/backends.py:1064::update_backend_status` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/backends/{backend_id}/upstream-auth` | `routes/backends.py:1526::get_upstream_auth` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/backends/{backend_id}/upstream-auth` | `routes/backends.py:1542::update_upstream_auth` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/companies` | `routes/auth.py:298::list_companies` | `List[CompanyResponse]` | `ADMIN_AUTH_TOKEN` comparison/use |
| `DELETE` | `/companies/{company_id}` | `routes/auth.py:313::delete_company` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `GET` | `/companies/{company_id}/admins` | `routes/auth.py:381::list_company_admins` | `List[AdminResponse]` | `ADMIN_AUTH_TOKEN` comparison/use |
| `POST` | `/companies/{company_id}/admins` | `routes/auth.py:399::add_company_admin` | `AdminResponse` | `ADMIN_AUTH_TOKEN` comparison/use |
| `DELETE` | `/companies/{company_id}/admins/{admin_email}` | `routes/auth.py:426::remove_company_admin` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `GET` | `/companies/{company_id}/domain-aliases` | `routes/auth.py:451::list_company_domain_aliases` | `List[DomainAliasResponse]` | `ADMIN_AUTH_TOKEN` comparison/use |
| `POST` | `/companies/{company_id}/domain-aliases` | `routes/auth.py:469::add_company_domain_alias` | `DomainAliasResponse` | `ADMIN_AUTH_TOKEN` comparison/use |
| `DELETE` | `/companies/{company_id}/domain-aliases/{alias_id}` | `routes/auth.py:488::remove_company_domain_alias` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `PUT` | `/companies/{company_id}/platform-url` | `routes/auth.py:359::update_company_platform_url` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `PUT` | `/companies/{company_id}/tenant` | `routes/auth.py:331::update_company_tenant_id` | `Unspecified` | `ADMIN_AUTH_TOKEN` comparison/use |
| `GET` | `/detailed_logs` | `gateway.py:716::detailed_logs_page` | `Unspecified` | `DETAILED_LOGS_TOKEN` comparison/use |
| `GET` | `/dlp/defaults` | `routes/backends.py:1768::get_dlp_defaults` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/health` | `gateway.py:622::health` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/healthx` | `gateway.py:641::healthx` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/internal/workflow-agents/delegation-token` | `routes/workflow_agents.py:2031::internal_workflow_delegation_token` | `Unspecified` | authorization-header handling |
| `POST` | `/internal/workflow-agents/{agent_id}/resolve-run` | `routes/workflow_agents.py:1991::internal_resolve_workflow_run` | `Unspecified` | authorization-header handling |
| `POST` | `/internal/workflow-chat-sessions/{session_id}/turns/{turn_id}/resolve` | `routes/workflow_agents.py:2011::internal_resolve_workflow_chat_turn` | `Unspecified` | authorization-header handling |
| `POST` | `/login` | `routes/auth.py:184::login` | `LoginResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/mcp_base_url` | `gateway.py:633::mcp_base_url` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/mcpadmin` | `gateway.py:668::admin_dashboard` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/mcpadmin/login` | `gateway.py:674::admin_login_page` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/mcpgateway/logs/export` | `routes/log_export.py:331::mcpgateway_logs_export` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/me` | `routes/auth.py:231::get_me` | `UserResponse` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/oauth/callback` | `routes/oauth.py:2348::oauth_callback` | `Unspecified` | authorization-header handling |
| `GET` | `/quilrone/.well-known/oauth-authorization-server` | `routes/quilrone_oauth_routes.py:38::onemcp_tenantless_oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/quilrone/.well-known/openid-configuration` | `routes/quilrone_oauth_routes.py:16::onemcp_tenantless_openid_configuration` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/quilrone/mcp` | `routes/quilrone_mcp_routes.py:37::onemcp_tenantless_session_termination` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/quilrone/mcp` | `routes/quilrone_mcp_routes.py:16::onemcp_tenantless_sse_stream` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/mcp` | `routes/quilrone_mcp_routes.py:57::onemcp_tenantless_proxy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/oauth/auth0/initiate` | `routes/quilrone_oauth_routes.py:139::onemcp_tenantless_oauth_auth0_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/quilrone/oauth/authorize` | `routes/quilrone_oauth_routes.py:83::onemcp_tenantless_oauth_authorize` | `Unspecified` | authorization-header handling |
| `POST` | `/quilrone/oauth/entra/initiate` | `routes/quilrone_oauth_routes.py:121::onemcp_tenantless_oauth_entra_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/oauth/google/initiate` | `routes/quilrone_oauth_routes.py:130::onemcp_tenantless_oauth_google_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/oauth/register` | `routes/quilrone_oauth_routes.py:63::onemcp_tenantless_oauth_register` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/oauth/token` | `routes/quilrone_oauth_routes.py:207::onemcp_tenantless_oauth_token` | `Unspecified` | authorization-header handling |
| `GET` | `/quilrone/oauth/{auth_provider}/callback` | `routes/quilrone_oauth_routes.py:148::onemcp_tenantless_oauth_platform_callback` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/quilrone/{tenant_id}/.well-known/oauth-authorization-server` | `routes/quilrone_oauth_routes.py:277::onemcp_oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/quilrone/{tenant_id}/.well-known/openid-configuration` | `routes/quilrone_oauth_routes.py:249::onemcp_openid_configuration` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `DELETE` | `/quilrone/{tenant_id}/mcp` | `routes/quilrone_mcp_routes.py:280::onemcp_session_termination` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/quilrone/{tenant_id}/mcp` | `routes/quilrone_mcp_routes.py:259::onemcp_sse_stream` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/{tenant_id}/mcp` | `routes/quilrone_mcp_routes.py:300::onemcp_proxy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/{tenant_id}/oauth/auth0/initiate` | `routes/quilrone_oauth_routes.py:403::onemcp_oauth_auth0_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/quilrone/{tenant_id}/oauth/authorize` | `routes/quilrone_oauth_routes.py:337::onemcp_oauth_authorize` | `Unspecified` | authorization-header handling |
| `GET` | `/quilrone/{tenant_id}/oauth/connect` | `routes/quilrone_connect_routes.py:123::onemcp_oauth_connect` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/quilrone/{tenant_id}/oauth/connect/success` | `routes/quilrone_connect_routes.py:156::onemcp_oauth_connect_success` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/{tenant_id}/oauth/entra/initiate` | `routes/quilrone_oauth_routes.py:383::onemcp_oauth_entra_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/{tenant_id}/oauth/google/initiate` | `routes/quilrone_oauth_routes.py:393::onemcp_oauth_google_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/{tenant_id}/oauth/register` | `routes/quilrone_oauth_routes.py:311::onemcp_oauth_register` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/quilrone/{tenant_id}/oauth/token` | `routes/quilrone_oauth_routes.py:477::onemcp_oauth_token` | `Unspecified` | authorization-header handling |
| `GET` | `/quilrone/{tenant_id}/oauth/{auth_provider}/callback` | `routes/quilrone_oauth_routes.py:413::onemcp_oauth_platform_callback` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/starliner/manifest` | `routes/starliner.py:28::starliner_manifest` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/starliner/metrics` | `routes/starliner.py:45::starliner_metrics` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/starliner/selftest` | `routes/starliner.py:38::starliner_selftest` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/token-saving/defaults` | `routes/backends.py:1774::get_token_saving_defaults` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/user/dashboard` | `gateway.py:702::user_dashboard` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/user/mcp-callback` | `gateway.py:708::user_mcp_callback` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/{backend_id}/.well-known/oauth-authorization-server` | `routes/oauth.py:929::oauth_discovery` | `Unspecified` | authorization-header handling |
| `GET` | `/{backend_id}/.well-known/openid-configuration` | `routes/oauth.py:874::openid_configuration` | `Unspecified` | authorization-header handling |
| `DELETE` | `/{backend_id}/mcp` | `routes/mcp.py:1185::mcp_session_termination` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/{backend_id}/mcp` | `routes/mcp.py:1150::mcp_sse_stream` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/{backend_id}/mcp` | `routes/mcp.py:1211::mcp_proxy` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/{backend_id}/oauth/auth0/initiate` | `routes/oauth.py:2278::oauth_auth0_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `GET` | `/{backend_id}/oauth/authorize` | `routes/oauth.py:1170::oauth_authorize` | `Unspecified` | authorization-header handling |
| `POST` | `/{backend_id}/oauth/authorize/login` | `routes/oauth.py:1341::oauth_authorize_login` | `Unspecified` | authorization-header handling |
| `GET` | `/{backend_id}/oauth/callback` | `routes/oauth.py:2348::oauth_callback` | `Unspecified` | authorization-header handling |
| `GET` | `/{backend_id}/oauth/connect/complete` | `routes/oauth.py:2561::oauth_connect_complete` | `Unspecified` | authorization-header handling |
| `POST` | `/{backend_id}/oauth/entra/initiate` | `routes/oauth.py:2268::oauth_entra_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/{backend_id}/oauth/google/initiate` | `routes/oauth.py:2273::oauth_google_initiate` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/{backend_id}/oauth/register` | `routes/oauth.py:1023::oauth_register` | `Unspecified` | authorization-header handling |
| `POST` | `/{backend_id}/oauth/revoke` | `routes/oauth.py:3137::oauth_revoke` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/{backend_id}/oauth/token` | `routes/oauth.py:2689::oauth_token` | `Unspecified` | authorization-header handling |
| `GET` | `/{backend_id}/oauth/{auth_provider}/callback` | `routes/oauth.py:2283::oauth_platform_callback` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |
| `POST` | `/{backend_id}/upstream-auth/connect/complete` | `routes/oauth.py:3185::upstream_auth_connect_complete` | `Unspecified` | No route-local auth evidence; middleware/service checks remain possible |

## Secondary decorated interfaces (25)

These are not part of the `gateway:app` route graph unless their own process is started.

| Process classification | Method/decorator | Path | Handler | Security evidence |
| --- | --- | --- | --- | --- |
| workflow-runner | `GET` | `/health` | `workflow_runner/app.py:81::health` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/status` | `workflow_runner/app.py:86::status` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `POST` | `/workflow-chat-sessions` | `workflow_runner/app.py:219::create_workflow_chat_session` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}` | `workflow_runner/app.py:231::get_workflow_chat_session` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `PATCH` | `/workflow-chat-sessions/{session_id}` | `workflow_runner/app.py:239::update_workflow_chat_session` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/artifacts` | `workflow_runner/app.py:269::list_workflow_chat_artifacts` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/artifacts/{artifact_id}` | `workflow_runner/app.py:303::get_workflow_chat_artifact` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/artifacts/{artifact_id}/content` | `workflow_runner/app.py:315::get_workflow_chat_artifact_content` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/artifacts/{artifact_id}/download` | `workflow_runner/app.py:335::download_workflow_chat_artifact` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/messages` | `workflow_runner/app.py:254::list_workflow_chat_messages` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `POST` | `/workflow-chat-sessions/{session_id}/turns` | `workflow_runner/app.py:356::create_workflow_chat_turn` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/turns/{turn_id}` | `workflow_runner/app.py:374::get_workflow_chat_turn` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/turns/{turn_id}/artifacts` | `workflow_runner/app.py:287::list_workflow_chat_turn_artifacts` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `POST` | `/workflow-chat-sessions/{session_id}/turns/{turn_id}/cancel` | `workflow_runner/app.py:390::cancel_workflow_chat_turn` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-sessions/{session_id}/turns/{turn_id}/steps` | `workflow_runner/app.py:382::list_workflow_chat_steps` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-chat-turns/count` | `workflow_runner/app.py:403::count_workflow_chat_turns` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs` | `workflow_runner/app.py:107::list_workflow_runs` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `POST` | `/workflow-runs` | `workflow_runner/app.py:95::start_workflow_run` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs/{run_id}` | `workflow_runner/app.py:144::get_workflow_run` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs/{run_id}/artifacts` | `workflow_runner/app.py:171::list_workflow_run_artifacts` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs/{run_id}/artifacts/{artifact_id}` | `workflow_runner/app.py:178::get_workflow_run_artifact` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs/{run_id}/artifacts/{artifact_id}/content` | `workflow_runner/app.py:186::get_workflow_run_artifact_content` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs/{run_id}/artifacts/{artifact_id}/download` | `workflow_runner/app.py:202::download_workflow_run_artifact` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `POST` | `/workflow-runs/{run_id}/cancel` | `workflow_runner/app.py:159::cancel_workflow_run` | No route-local auth evidence; middleware/service checks remain possible |
| workflow-runner | `GET` | `/workflow-runs/{run_id}/steps` | `workflow_runner/app.py:152::list_workflow_run_steps` | No route-local auth evidence; middleware/service checks remain possible |
