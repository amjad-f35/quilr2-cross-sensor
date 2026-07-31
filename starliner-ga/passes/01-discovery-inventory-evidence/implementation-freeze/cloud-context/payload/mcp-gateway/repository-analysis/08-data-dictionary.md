# Repository-wide data dictionary

This chapter defines data that crosses module, storage, network, or trust boundaries. Exact field declarations for every Pydantic model, dataclass, function parameter, constant, and JavaScript object are searchable in the [symbol reference](07-symbol-reference/README.md). Exact SQL columns are preserved in the [DDL ledger](evidence/ddl-statements.md).

## Identity and tenancy

| Data point | Type/allowed form | Origin and consumers | Lifecycle/validation/sensitivity |
| --- | --- | --- | --- |
| `tenant_id` | string; required on most tenant rows | IdP claims, admin company configuration, backend backfill; consumed by routes, policies, logs, memories, workflows | Tenant-isolation key. Comparisons are enforced in repositories/routes; absent values can trigger backfill or request rejection |
| `subscriber_id` | string | gateway user/company identity | Stored on `users`; combined with tenant information for internal identity |
| `user_email`/`username` | string, often normalized to lowercase | JWT/IdP/login/MCP headers | Stored in OAuth, memory, log, workflow, and preference rows; personally identifying and crosses trust boundaries |
| `company_id` | string identifier | company creation/repositories | Parent for admins and domain aliases |
| `admin_email` | string email | admin-management APIs | Used to derive eligible domain aliases unless public/Quilr/canonical |
| `domain`/`email_domain` | normalized domain string | company configuration and email extraction | `utils.domain_matching` rejects/handles public and Quilr domains in alias derivation |
| `smart_groups` | list/set of group names or IDs, serialized in logs | ClickHouse/ZIA snapshot sync and identity context | Cached and persisted as snapshots; sync failure degrades to no groups |
| `user_claims` | JSON claims object and `X-User-Claims` header | trusted caller/platform | Parsed by claim utilities; forwarded identity data must be treated as trust-boundary input |

## Backend and catalog data

| Data point | Type/allowed form | Meaning and consumers | Absence/invalid behavior |
| --- | --- | --- | --- |
| `backend_id` | string/UUID-like repository ID | Primary backend key; direct MCP path key | Missing/unresolvable backend produces 404 or JSON-RPC error depending surface |
| `slug` | optional human-readable string | Alternate URL/backend resolver key | Generated/backfilled; duplicate/miss behavior is logged |
| `name`, `description` | strings | Display/search/catalog metadata | Name required for registration |
| `transport`/`endpoint` | URL string | Remote MCP endpoint | Probed and normalized; invalid/unreachable endpoints surface probe or transport errors |
| `transport_type` | `sse` or `http` in `TransportType`; legacy strings exist | Selects MCP transport | Unknown values can fail connection/validation |
| `status` | `active` or `inactive` (`BackendStatus`) | Availability and UI state | Inactive backends are not treated as normal callable connections |
| `is_system` | boolean/integer | Protects seeded/default backends | System backends cannot be deleted through normal path |
| `catalog_id` | optional string FK-like identifier | Links installed backend to `mcp_catalog` | Backfilled at startup; not declared as an SQLite foreign key |
| `capabilities` | JSON object with `tools`, `resources`, `prompts` arrays | Discovery cache and UI/tool routing | Empty default; per-section errors can be retained separately |
| `settings` | JSON `BackendSettings` | Tool, DLP, access, token saving, ZIA/web-search behavior | Pydantic defaults apply when parsed; malformed stored JSON has repository-specific fallback/error paths |
| `auth_type`/`supported_auth_modes` | strings/lists | Probe result and UI decision | Derived from discovery/probe evidence |
| `log_export_key`, `tenant_log_export_key` | secret strings | Developer log export authorization | Sensitive; stored with backend/tenant state |

`BackendConfig` accepts optional static upstream credentials, auth placement (`bearer`, `header`, `query`), upstream mode, extra headers/query parameters, OAuth DCR/login/passthrough flags, custom OAuth client credentials, and callback mode. Exact names and defaults are in `models/backend.py::BackendConfig`.

## MCP protocol data

| Data point | Type/values | Origin/flow | Handling |
| --- | --- | --- | --- |
| `jsonrpc` | string, normally `"2.0"` | MCP request/response | Transport helpers validate JSON-RPC framing |
| `id` | string/number/null | Client correlation identifier | Preserved in responses; notifications may omit it |
| `method` | MCP method string | Client or upstream notification | Dispatch branches cover initialize, tools/resources/prompts, subscriptions, ping, and notifications |
| `params` | object | Client request | Method/tool-specific extraction and validation |
| `params.name` | tool/resource/prompt name | `tools/call` and related methods | OneMCP may decode a namespaced backend/tool or native tool |
| `params.arguments` | object | Tool call input | Crosses policy/DLP/logging boundary; may be transformed/redacted/blocked |
| `result`/`error` | JSON-RPC mutually exclusive response members | Handler/upstream | Gateway creates protocol errors for auth, policy, backend, and internal failures |
| `content` | array of typed MCP content | Tool result | Token-saving and metadata helpers can transform text/JSON representation |
| `protocolVersion` | one of `2025-03-26`, `2025-06-18`, `2025-11-25` in gateway constants | Initialize negotiation | Latest listed version is gateway default; unsupported negotiation follows handler validation |
| `Mcp-Session-Id`/session IDs | header/string | Streamable HTTP/OneMCP session management | Direct and OneMCP session behavior differ; OneMCP state is process-local |
| `Last-Event-ID` | header/string | SSE resume | Consumed by OneMCP event-store replay logic |

## Authentication and credential data

| Data point | Storage/transport | Consumers | Sensitivity and failure behavior |
| --- | --- | --- | --- |
| `Authorization: Bearer …` | HTTP header | admin/user dependencies, MCP auth, OAuth passthrough, runner internal auth | Secret; branch-specific verification. Invalid/missing tokens yield 401/403 or MCP auth challenge |
| `mcpuser` | header/value | direct MCP identity branch | Identity/trust-boundary input; paired with API token in supported path |
| Internal JWT | HS256 token | gateway sessions/delegation helpers | Contains identity/tenant claims and expiration; default TTL is configured |
| External JWT | RS512 verified token | external platform identity | Public key comes from env/file; signature/claims checked by auth service |
| API token | random/token string; hashed lookup fields in repository | MCP/user access | Token value is sensitive; repository lookup supplies tenant/user identity |
| Workflow delegation token | signed short-lived token | runner→gateway MCP calls | Includes constrained identity/run context; default TTL 600 seconds |
| OAuth `state` | random string, expiry | OAuth initiation/callback | Persisted with backend/user/redirect/PKCE context; expired states cleaned at startup |
| `code_verifier`/authorization `code` | strings | PKCE/callback exchange | Sensitive and transient in OAuth state rows |
| OAuth client ID/secret | strings | DCR or configured OAuth | Client secret sensitive; stored in OAuth client tables |
| Access/refresh token | strings | upstream OAuth calls and refresh | Sensitive. Columns have `*_encrypted` names but repository behavior is plaintext |
| Proxy token | token string | OAuth proxy/MCP auth | Sensitive; stored in gateway DB |
| Static upstream auth | Fernet ciphertext plus mode/header/query metadata | `UpstreamAuthService` | Encrypted at rest with key derived from configured secret; decryption failure prevents use |
| Runner internal token | HTTP header/token | gateway↔runner admin/control operations | Sensitive; source contains a default and env override |

## Policy and settings data

| Name | Type/allowed values | Meaning |
| --- | --- | --- |
| Tool `enabled` | optional boolean | Whether a tool is exposed/callable |
| Tool `enforce_confirmation` | optional boolean | Requires confirmation before dispatch |
| `DLPAction` | `monitor`, `redact`, `block` | Global input/output DLP outcome |
| Category action | `default`, `monitor`, `redact`, `block` | Per-category override |
| Category toggles | maps of known category ID → boolean | Enable built-in data-risk/adversarial/EDM categories; unknown keys are rejected |
| Token-saving flags | `smart_json_compression`, `html_to_text`, `markdown_to_text`, `text_compression` booleans | Select output transforms |
| Scoped setting scope | backend/tenant/smart-group/user identifiers | Resolver merges increasingly specific setting layers |
| `SMART_MODE_POLICIES` | `all`, `none`, `selected` | Tenant smart-mode access |
| Static upstream auth mode | `admin_shared`, `user_required` plus no-auth/OAuth modes in service constants | Selects shared versus per-user credential requirement |

`ScopedBackendSettingsPatch` forbids unknown fields and requires at least one of `tools`, `dlp`, or `token_saving`. Nested patches also reject empty changes.

## Logging and event data

| Data point | Meaning | Persistence/transform |
| --- | --- | --- |
| `request_id`, `log_id`, `source_id` | correlation/deduplication IDs | SQLite logs/events; ClickHouse source keys |
| `started_at`, `completed_at`, `duration_ms` | timing | ISO text in SQLite; transformed for ClickHouse |
| `backend_id/name/slug`, `tool_name` | action attribution | log and analytics columns |
| `input_data`/arguments, response/result data | operation payload | Can be sensitive; targeted redaction/metadata extraction occurs but full universal scrubbing is not proven |
| `success`, `blocked`, DLP outcomes | result flags | tool/event/rejection logs and ClickHouse |
| `auth_mode`, `transport_type` | execution context | analytics dimensions |
| `metadata` | JSON extension object | token-saving/classifier/client-app and diagnostic information |
| `event_type`, `event_data` | gateway lifecycle/security event | `events` table and ClickHouse event table |
| rejection code/reason/stage | rejected MCP request detail | `mcp_rejected_requests` and ClickHouse |

## Memory data

| Data point | Meaning/lifecycle |
| --- | --- |
| memory `id`, `tenant_id`, `user_email` | ownership and isolation |
| `content` | plaintext memory text; sensitive user data |
| embedding/vector fields | search representation generated by `EmbeddingService` when configured |
| metadata/timestamps | JSON labels, creation/update and soft-state information |
| tenant memory enabled/limits/settings | feature gate and retention/limit policy |

`Verified:` memory content is not passed through the MCP DLP pipeline before persistence. Tenant/user checks are implemented in services/repositories; exact CRUD schemas are in `routes/admin_memories.py`, `routes/user_memories.py`, and memory symbol entries.

## Workflow data

| Data point | Values/meaning |
| --- | --- |
| Agent status | `draft`, `published`, `archived` |
| Agent mode | `background`, `chat` |
| Binding scope | `tenant`, `smart_group`, `user` |
| Trigger type | `manual`, `scheduled`, `rerun` |
| Execution identity type | currently `user` |
| Schedule status | `active`, `paused`, `deleted`, `error` |
| Schedule type/catch-up | `interval`; `skip` |
| Chat session status | `active`, `archived`, `deleted` |
| Quota scope/kind | tenant/smart-group/user; `entitlement`/`hard_cap` |
| Run status | queued/leased/running/terminal values manipulated by runner repository/engine |
| `worker_id`, `lease_expires_at`, `attempt_count`, `max_attempts` | distributed work claim and retry state |
| `cancel_requested` | cooperative cancellation flag |
| deadline/tool/Python counters and maxima | execution resource limits |
| `network_access`, `web_fetch_enabled` | runtime capability gates |
| retention timestamps | run/chat/artifact expiry |
| artifact `storage_path`, `size_bytes`, `sha256`, encoding/content type | filesystem object descriptor/integrity metadata |

The runner scrubs existing `start_payload` rows to a fixed allowlist of keys during database initialization.

## UI/browser data

Static JavaScript stores or transports admin/user bearer tokens, selected backend/client IDs, filter/search state, pagination, and API response objects. Exact assignments and API strings are in the [JavaScript symbol index](07-symbol-reference/javascript-and-shell-symbol-index.md). Browser token storage is a security boundary; the static UI does not create a separate server-side session mechanism.

## Configuration data

All 130 executable or explicitly declared environment/build names, evidence sites, and redacted defaults are in [11-configuration-reference.md](11-configuration-reference.md) and the [generated environment ledger](evidence/executable-environment-reference.md).
