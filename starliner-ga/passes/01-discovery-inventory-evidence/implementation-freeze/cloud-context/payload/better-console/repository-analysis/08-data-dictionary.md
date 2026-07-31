# Data Dictionary

## Environment interface

All 130 names from `.env.example` are in `generated-analysis/environment-variables.csv`. Secret-like values are not reproduced. `Config::from_env` and its helper types are indexed with line ranges in the Rust reference.

## HTTP contract fields

`generated-analysis/openapi-schema-fields.csv` contains 2748 recursively expanded field/reference rows from every checked-in v2 schema. `generated-analysis/openapi-operations.csv` contains method, path, operation ID, security, parameters, request-body presence, and response codes for all 214 operations.

## Meaningful runtime identifiers

| Name | Meaning | Origin | Scope | Authority | Sensitivity/boundary |
| --- | --- | --- | --- | --- | --- |
| tenant_id | tenant UUID/string | session/principal and trusted store | tenant-scoped | high within source | crosses API/store trust boundary |
| subscriber_id | subscriber UUID/string | session/principal | tenant subordinate | high within source | optional for some sources |
| user_id | account identifier | PostgreSQL/graph/source | source-scoped | candidate | PII-linked |
| email | normalized human identifier | principal/source rows | tenant/provider scoped | candidate | personal data |
| session_id | opaque session identifier | AuthService | Redis TTL | authoritative session key | credential-sensitive |
| app_id | application identifier | source rows | source-scoped | candidate | not globally canonical |
| asset_id | opaque unified inventory identifier | LocalStore mapping | tenant/read-model scoped | derived | API path parameter |
| request_id | bounded log-safe request correlation | middleware/header | request lifetime | operational | sanitized |
| correlation_id | audit/conversation correlation | source rows | source-scoped | candidate | drill-down key |
| conversation_id | conversation identifier | LLM/Endpoint source | source-scoped | candidate | may be absent |
| gateway_key_hash | gateway application key digest | LLM logs/config | source-scoped | stable alias | sensitive derivative |
| backend_id | MCP backend identifier | MCP service/logs | source-scoped | candidate | validated path segment |
| tool_name | MCP tool label | MCP logs | backend-scoped | semantic label | not unique |
| device_id | endpoint/browser device identifier | sensor/graph | source-scoped | candidate | hardware/user linkage |
| persona_id | browser persona identifier | Neo4j | graph-scoped | candidate | nullable |
| view_id | saved view UUID | PostgreSQL | tenant/user/page scoped | authoritative for document | optimistic updates |
| dashboard_id | custom dashboard UUID | PostgreSQL | tenant scoped | authoritative for document | ACL protected |
| run_id | dashboard generation run UUID | PostgreSQL | dashboard scoped | workflow identity | expires/cleanup |
| topic_id | deterministic topic ID | activity topic pipeline | tenant/version scoped | derived stable | digest/alias rules |
| evidence_ref | bounded source event reference | activity topic source adapter | batch scoped | transient | content excluded |
| export_key | LLM/MCP export credential | request | credential scope | authoritative access secret | must be redacted |
| csrf_header | X-Quilr-CSRF sentinel | browser request | request scoped | mutation guard input | not secret |

## Constants and limits

Notable verified constants include 31-day initial topic backfill, 90-day topic mirror horizon, classifier concurrency configured with a default of 64, four attempts before a poison bucket is dead-lettered, 15-minute bucket retry, 30-second long-operation logging, a 30-second Endpoint selection cache TTL, and the API/query limits encoded in contract types/tests. Exact declarations are searchable in the symbol CSVs.
