# Discovery and Inventory Contributions

| entity | source | identifier | attributes | freshness | authority |
| --- | --- | --- | --- | --- | --- |
| application | LLM/MCP/Endpoint/Browser projections | source app/backend/domain IDs | profile/config/activity | window/snapshot | candidate |
| human/account | PostgreSQL/directory/source logs | user ID/email | identity/grants/activity | session/mirror/window | source-specific |
| device | Endpoint/Browser/Neo4j | device/workstation ID | version/status/last seen | snapshot | source-specific |
| conversation | LLM/Endpoint/MCP | conversation/correlation identifiers | participants/content metadata/findings | event/window | source evidence |
| model/provider | LLM configuration/logs | provider/model label | usage/health/settings | window/current | candidate |
| MCP backend/tool | MCP config/logs | backend ID/tool name | usage/settings/outcome | window/current | candidate |
| topic | derived activity topic tables | deterministic topic ID | label/parent/evidence refs | bucket/state | derived |

The platform discovers from persisted source projections and mirrors, not direct instrumentation. Absence can mean source not configured, mirror cold/stale, no observation in window, or true absence; v2 readiness/observed/provisioned fields preserve these distinctions.
