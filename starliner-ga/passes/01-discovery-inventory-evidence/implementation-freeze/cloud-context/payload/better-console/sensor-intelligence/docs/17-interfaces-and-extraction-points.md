# Interfaces and Extraction Points

| interface | direction | protocol | location | authentication | status |
| --- | --- | --- | --- | --- | --- |
| legacy LLM admin | inbound | HTTP JSON/NDJSON | /llmgateway_admin_platform_apis/v1 | tenant/export key | implemented |
| MCP analytics/admin | inbound | HTTP JSON/NDJSON | /mcpgatewayapis and v2 | tenant/session/export key | implemented |
| Endpoint APIs | inbound | HTTP JSON | /endpointagentapis/v2 and v2 | tenant/session | implemented |
| Browser APIs | inbound | HTTP JSON/binary | browser routes and v2 | tenant/session | implemented |
| Platform v2 | inbound | HTTP JSON | /platformadminapis/v2 | console session; select public auth | implemented |
| Internal admin | inbound | HTTP JSON | /quilr_internal_admin | operator session | implemented |
| SPA | inbound | HTTP assets/navigation | explicit allowlist | session enforced in app | implemented |
| ClickHouse | outbound | HTTP native client | three read clients + topic writer | database credentials | implemented |
| PostgreSQL | outbound | SQLx | auth/saved views/dashboards/assist | database credentials | implemented |
| Redis | outbound | Redis protocol | sessions/cache/lease | password/URL | implemented |
| Neo4j | outbound | Bolt | deployment/persona graph | graph credentials | optional |
| external management | outbound | HTTP | closed allowlist services | user/service bearer | implemented |
| AI providers | outbound | HTTP/CLI | DeepSeek/Workers AI/Anthropic/Claude | provider secrets | conditional |
| Slack | outbound | webhook | assist/dashboard alerts | secret URL | conditional |

## Extraction decision

Use dedicated read-only adapters at approved source stores/configuration APIs, not the interactive UI or presentation cache. Use root platform APIs only for selected compatibility reads. Never extract canonical truth from LocalStore, browser state, or formatted v2 labels without retaining underlying evidence/profile.
