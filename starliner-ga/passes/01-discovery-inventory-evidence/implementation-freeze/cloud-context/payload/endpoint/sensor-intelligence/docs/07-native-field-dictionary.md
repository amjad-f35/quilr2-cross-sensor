# 07 — Native Field and Data-Point Dictionary

## Scope and reading rules

The canonical row-level ledger is
[native-fields.csv](../../../matrices/sensor-intelligence/endpoint-sensor/native-fields.csv).
Each row identifies the owning native record, exact field path and Rust type,
required/default behavior, origin, consumers, transformation, persistence,
sensitivity, trust-boundary behavior and invalid/missing handling.

**Verified coverage:** the machine ledger contains 639 field or variant-payload
rows spanning all 66 record families from chapter 06. R-002 and R-018 are
variant/container records rather than ordinary structs; their process-delta
collections and change-event payloads are nevertheless represented explicitly.

This chapter groups the same data for human review. A Rust field being required
for construction does not mean its string value is validated or non-empty.
`Option<T>` means the field may be absent in native state; it may still be
serialized as JSON `null` unless a `skip_serializing_if` annotation is stated.

## Sensitivity classes

| Class | Meaning in this analysis |
| --- | --- |
| `Public operational` | ordinary component/status/config name with no evident secret |
| `Device identifier` | host/device IDs, hostname, OS details, IP/port |
| `Human identity` | email, username, full name, groups, roles, permissions |
| `Credential/secret` | access/refresh token, environment value, audit token, detected secret |
| `User content` | prompt, command, file content/path, request/response content, justification |
| `Security evidence` | detections, governance, policy/decision/action/failure reason |
| `Potentially sensitive metadata` | process path/command line, URL, repository path, tool/file names |

## System process observation

### `platform::process_info::ProcessInfo` (R-001)

| Field | Type | Origin | Semantics and handling |
| --- | --- | --- | --- |
| `pid` | `u32` | OS enumerator | Required numeric process ID; used for diff/action matching; PID is recyclable |
| `name` | `String` | `normalize_name` | Executable basename, then command basename, then raw name; Windows strips terminal `.exe` and lowercases |
| `raw_process_name` | `String` | OS enumerator | Unnormalized OS name; copied into Application detail |
| `exe_path` | `Option<String>` | OS enumerator | Full executable path when accessible; access/lookup failure becomes `None` |
| `ppid` | `Option<u32>` | OS enumerator | Parent PID when available |
| `start_time_secs` | `u64` | OS enumerator | Process start time; retained in process table but not the entity wire |
| `user` | `Option<String>` | OS enumerator | OS account when available; sensitive attribution metadata |
| `cmd_line` | `Vec<String>` | OS enumerator | Command arguments; may contain secrets; copied to Application entity/wire context |

### Process delta and store change events (R-002 and R-018)

`ProcessTable::diff` produces separate `started` and `exited` `Vec<ProcessInfo>`
collections. `ChangeEvent` is a Tokio-broadcast enum whose payloads are
`Added(Uuid)`, `GovernanceUpdated(Uuid)`, `Rediscovered(Uuid)`, and
`Removed(Uuid)`. The UUID is the `EntityStore` key; consumers must perform a
store lookup to recover the current entity, and `Removed` consumers cannot do
so after removal. These messages are transient, do not carry an event ID or
sequence, and may be lost by lagging broadcast receivers.

## Entity envelope and governance

### `Entity` (R-003)

| Field | Type | Origin | Consumers/lifecycle |
| --- | --- | --- | --- |
| `id` | `Uuid` | deterministic ID helper | Store key, change events, current wire `id`; collision limitations differ by kind |
| `name` | `String` | correlator/converter | Upsert refreshes it; warns above 512 bytes and current sync truncates |
| `kind` | `EntityKind` | producer-specific | Tagged JSON in snapshot; current upsert preserves old value on rediscovery |
| `governance` | `GovernanceFields` | defaults/backend | Enforcer, snapshot, current wire; preserved on discovery upsert |
| `discovered_at` | `DateTime<Utc>` | creation time | Preserved on rediscovery; RFC3339 in current wire |
| `last_seen_at` | `DateTime<Utc>` | observation/upsert/touch | Updated on rediscovery; RFC3339 in current wire |
| `synced_to_backend` | `bool` | local sync state | Selects pending ingest; false on create and selected field updates |
| `backend_sync_at` | `Option<DateTime<Utc>>` | ingest success | Local acceptance timestamp; snapshot persists it |

### `GovernanceFields` (R-013)

| Field | Type/default | Allowed values | Origin/consumer |
| --- | --- | --- | --- |
| `approval_status` | enum / `NeedsReview` | `NeedsReview`, `Approved`, `Blocked` | default or backend; current wire/UI |
| `criticality` | enum / `NotCritical` | `NotCritical`, `Critical` | default or backend |
| `execution_policy` | enum / `Allowed` | `Allowed`, `Audit`, `Blocked`, `Quarantined` | backend; Enforcer |
| `owner` | `Option<String>` / `None` | unvalidated string | backend; current wire |
| `category` | `Option<String>` / `None` | unvalidated string | backend; current wire |
| `domain` | `Option<String>` / `None` | unvalidated string | backend; current wire |
| `is_new_entity` | `bool` / `true` | boolean | default/backend mapping |
| `last_synced_time` | `Option<DateTime<Utc>>` / `None` | UTC time | backend mapping/local governance state |

## Entity-kind field dictionary

### Application (R-004)

| Field | Type | Origin and transformation | Notes |
| --- | --- | --- | --- |
| `canonical_id` | `Option<String>` | `/endpoint/app/add` or ingest mapping | Backend identity; resolver owns first assignment |
| `bundle_id` | `Option<String>` | platform discovery/Lua | Used for hook lookup |
| `version` | `Option<String>` | discovery | No common version normalization |
| `vendor` | `Option<String>` | discovery | Free string |
| `install_path` | `Option<String>` | correlation/discovery | Participates in Application UUID when present |
| `process_name` | `Option<String>` | normalized process | Windows normalization differs from macOS |
| `raw_process_name` | `Option<String>` | raw process | Potentially sensitive metadata |
| `exe_path` | `Option<String>` | process enumerator | Potentially sensitive path |
| `cmd_line` | `Vec<String>` | process enumerator | May contain credentials/user content |
| `parent_process_name` | `Option<String>` | process table/correlation | Name only, not a stable parent instance ID |
| `is_system` | `bool` | process map/correlation | Mapping-derived classification |
| `privilege` | `Option<String>` | platform observation | Free string; changes mark entity unsynced |
| `source` | `String` | producer | Current source label, not a cryptographic provenance ID |
| `installation_type` | `String` | producer/default | Free string |
| `is_active` | `bool` | constructor | Not set false on process exit in active path |
| `is_dev_tool` | `bool` | discovery/mapping | Source classification |
| `known_executables` | `Vec<String>` | mapping/discovery | Used for hook lookup |
| `pids` | `Vec<u32>` | process correlation | Current matching set; PIDs recyclable |

### AI/config artifact entities (R-005–R-012)

| Record | Field | Type | Meaning/sensitivity |
| --- | --- | --- | --- |
| MCP server | `name` | `String` | source server label |
| MCP server | `app_name` | `String` | owning/discovering application label |
| MCP server | `transport` | `String` | configured transport string |
| MCP server | `command` | `Option<String>` | launch command; may contain sensitive paths/material |
| MCP server | `args` | `Vec<String>` | launch arguments; may contain secrets |
| MCP server | `env_vars` | `Vec<String>` | environment entries/names as converter supplies; secret risk |
| MCP server | `url` | `Option<String>` | configured endpoint; may expose internal host |
| MCP server | `scope` | `String` | source scope label |
| MCP server | `risk_level` | `String` | script-supplied/free classification |
| MCP server | `description` | `Option<String>` | source description |
| Hook | `app_name` | `String` | owning application |
| Hook | `event` | `String` | configured hook event |
| Hook | `hook_type` | `String` | hook classification |
| Hook | `command` | `Option<String>` | configured command |
| Hook | `matcher` | `Option<String>` | event/tool matcher |
| Hook | `risk_level` | `String` | source classification |
| Hook | `description` | `Option<String>` | description |
| Hook | `binary_name` | `Option<String>` | referenced executable name |
| Hook | `binary_path` | `Option<String>` | referenced executable path |
| Skill | `app_name` | `String` | owning application |
| Skill | `name` | `String` | discovered skill label |
| Skill | `path` | `String` | local artifact path |
| Skill | `scope` | `String` | source scope |
| Skill | `risk_level` | `String` | script-supplied risk |
| Skill | `description` | `Option<String>` | description |
| Agent | `app_name` | `String` | owning application |
| Agent | `name` | `String` | agent label |
| Agent | `path` | `String` | local definition path |
| Agent | `agent_type` | `String` | source type label |
| Agent | `scope` | `String` | source scope |
| Agent | `risk_level` | `String` | script-supplied risk |
| Agent | `description` | `Option<String>` | description |
| Model | `app_name` | `String` | owning application |
| Model | `name` | `String` | configured model label |
| Model | `provider` | `String` | configured provider label |
| Model | `scope` | `String` | source scope |
| Model | `description` | `Option<String>` | description |
| Controlled repository | `app_name` | `String` | owning application |
| Controlled repository | `repo_path` | `String` | local repository path |
| Controlled repository | `trust_level` | `Option<String>` | source trust label |
| Controlled repository | `session_count` | `u32` | script-derived count |
| Controlled repository | `local_mcp_count` | `u32` | script-derived count |
| Controlled repository | `local_hook_count` | `u32` | script-derived count |
| Controlled repository | `risk_score` | `u32` | script-derived score; no enforced range visible in struct |
| Permission | `app_name` | `String` | owning application |
| Permission | `command` | `String` | permission command/pattern |
| Permission | `permission_type` | `String` | source classification |
| Permission | `scope` | `String` | source scope |
| Permission | `risk_level` | `String` | source risk label |
| Plugin | `app_name` | `String` | owning application |
| Plugin | `name` | `String` | plugin label |
| Plugin | `plugin_type` | `String` | source type |
| Plugin | `version` | `Option<String>` | source version |
| Plugin | `risk_level` | `String` | source risk label |
| Plugin | `description` | `Option<String>` | description |

These records contain no native evidence-source field, parser version,
observation ID, match rule, raw artifact digest or confidence. The entity
envelope supplies timestamps but not per-field lineage.

## Monitor context and current wire fields

### Native contexts (R-014–R-016)

| Record.field | Type | Origin | Sensitivity/behavior |
| --- | --- | --- | --- |
| `DeviceContext.device_id` | `String` | core device-ID generation | device identifier; generator source can vary |
| `DeviceContext.hostname` | `String` | local host | device identifier |
| `DeviceContext.os_type` | `String` | local platform | operational/device |
| `DeviceContext.os_version` | `String` | local platform | operational/device |
| `UserContext.username` | `String` | initial OS context | human identity |
| `UserContext.user_id` | `Option<String>` | Persona backend ID | human identity |
| `UserContext.email` | `Option<String>` | Persona | human identity |
| `UserContext.fullname` | `Option<String>` | Persona | human identity |
| `UserContext.is_authenticated` | `bool` | Persona | auth state |
| `UserContext.groups` | `Vec<String>` | Persona user context | authorization/identity |
| `UserContext.access_token` | `Option<String>` | Persona IPC | credential; used for HTTP, not copied to sync wire |
| `TenantContext.tenant_id` | `String` | Persona | tenant boundary |
| `TenantContext.subscriber_id` | `String` | Persona or `"default-subscriber"` fallback | tenant/subscriber context; fallback is not authoritative |

### `DiscoveredEntity` wire (R-019)

| Field | Type / wire omission | Source | Meaning |
| --- | --- | --- | --- |
| `id` | `String` | native UUID | endpoint-local/source ID |
| `canonical_id` | `Option<String>`, omitted when `None` | Application only/backend | central ID |
| `entity_type` | `String` | `EntityKind::kind_label` mapping | current API discriminator |
| `name` | `String` | native entity name | sync truncates above implementation limit |
| `discovered_at` | `String` | native UTC time | RFC3339 |
| `last_seen_at` | `String` | native UTC time | RFC3339 |
| `tenant_context` | R-020 | ContextManager | tenant/subscriber |
| `entity_context` | `Value` | kind-specific converter | flattened current payload; exact variant mapping in chapter 08 |
| `properties` | optional map, omitted when `None` | converter | additional strings where supplied |
| `governance` | R-021 | native governance | current policy/settings state |
| `device_context` | R-022 | native device | device context |
| `user_context` | R-023 | native user projection | no access token |

### Sync nested contexts (R-020–R-023)

| Record | Fields |
| --- | --- |
| `SyncTenantContext` | `tenant_id: String`; `subscriber_id: String` |
| `SyncGovernance` | `approval_status: String`; `criticality: String`; `execution_policy: String`; `owner?`; `category?`; `domain?`; `is_new_entity: bool`; `last_synced_time?: String` |
| `SyncDeviceContext` | `device_id`; `hostname`; `os_type`; `os_version` — all `String` |
| `SyncUserContext` | `username: String`; `email?: String`; `department?: String`; `role?: String`; `groups: Vec<String>` |

The monitor builder always sets `department` and `role` to `None` in hook
activity. It maps native `Vec<String> department` from Persona only through
other component-specific paths, not this structure.

## Hook and activity fields

### `HookRequest` (R-025)

| Field | Type | Origin/meaning | Current handling |
| --- | --- | --- | --- |
| `session_id` | `String` | IDE event | session map key; no global uniqueness guarantee |
| `ide_type` | `String` | thin-client translator | `"claude"` later maps to `"claude-code"` in activity |
| `event_name` | `String` | IDE event | exact string branches select tool/prompt/stop handling |
| `tool_name` | `Option<String>` | IDE event | distinct list capped at 500 per turn |
| `tool_input` | `Option<Value>` | IDE event | sensitive user/tool content; evaluator currently ignores it |
| `command` | `Option<String>` | IDE event | sensitive command; evaluator currently ignores it |
| `file_path` | `Option<String>` | IDE event | collected only for six hard-coded file tools; cap 500 |
| `prompt` | `Option<String>` | prompt event | stored until next prompt/stop/idle, then emitted |
| `cwd` | `Option<String>` | IDE event | only basename becomes `project` in activity |
| `timestamp` | `u64` | thin client/source | serialized but evaluator does not use it; activity gets new endpoint UTC time |

### `HookResponse` / `DetectionInfo` (R-026)

| Field | Type | Current behavior |
| --- | --- | --- |
| `decision` | `Allow|Deny|Ask|Justify` | active evaluator always constructs `Allow` |
| `message` | `Option<String>` | `None` for active evaluator |
| `detections` | `Vec<DetectionInfo>` | empty for active evaluator |
| `detections[].detection_type` | `String` | protocol capability only in active evaluator |
| `detections[].severity` | `String` | same |
| `detections[].description` | `String` | same |

### `ActivityEntry` (R-024)

| Field | Type | Transformation/current value |
| --- | --- | --- |
| `prompt_text` | `Option<String>` | pending turn prompt |
| `authenticated_user` | `Option<String>` | current Persona email |
| `tools` | `Vec<String>` | distinct observed tool names, max 500 |
| `files` | `Vec<String>` | distinct paths for selected file tools, max 500 |
| `skills` | `Vec<String>` | current builder always empty |
| `mcp_server` | `Vec<String>` | current builder always empty |
| `project` | `Option<String>` | final path component of `cwd`, UTF-8 only |
| `model` | `Option<String>` | current builder always `None` |
| `app_name` | `Option<String>` | IDE type; `claude` → `claude-code` |
| `app_version` | `Option<String>` | current builder always `None` |
| `decision` | `String` | map of response; current `allow` |
| `time` | `String` | new `Utc::now().to_rfc3339()`, not hook timestamp |
| `device_information` | R-022 | current device context |
| `user_context` | R-023 | username/email/groups; department/role `None` |

## Current backend response/config fields

### Ingest acknowledgement (R-027/R-028)

| Path | Type | Behavior |
| --- | --- | --- |
| `mappings` | `Vec<IngestMapping>` | mappings processed after ingest |
| `mappings[].agent_id` | `String` | parsed as native UUID when applying |
| `mappings[].canonical_id` | `String` | central ID; first Application canonical ID is preserved |
| `mappings[].settings` | `Option<IngestSettings>` | optional governance override |
| `settings.approval_status` | `Option<String>` | parsed/mapped to native enum |
| `settings.execution_policy` | `Option<String>` | parsed/mapped |
| `settings.criticality` | `Option<String>` | parsed/mapped |
| `settings.category` | `Option<String>` | free string |
| `settings.aliases` | `Option<Vec<String>>` | current local use is limited; entity kind is preserved |

### App-ID response (R-029)

| Path | Type | Wire name/behavior |
| --- | --- | --- |
| `status` | `Option<String>` | optional envelope status |
| `response` | `Option<Vec<AppResolution>>` | optional result list |
| `app_name` | `String` | JSON `appName`; minimum expected field |
| `app_id` | `Option<String>` | JSON `appId`; becomes `canonical_id` |
| `name` | `Option<String>` | optional canonical display name |
| `approval_status` | `Option<String>` | optional current governance |
| `criticality` | `Option<String>` | optional |
| `app_category` | `Option<String>` | optional |
| `is_blocked` | `Option<String>` | JSON `isBlocked`; string, not bool |
| `is_browser` | `Option<bool>` | JSON `isBrowser` |
| `source` | `Option<String>` | backend source |
| `is_new` | `Option<bool>` | JSON `isNew` |

### Delta response (R-030)

| Path | Type | Meaning |
| --- | --- | --- |
| `cursor` | `u64` | next/current server cursor |
| `settings` | `Vec<DeltaSetting>` | governance changes |
| `error` | `Option<String>` | server error field |
| `settings[].entity_id` | `String` | central entity ID used for lookup/buffer |
| `category` | `Option<String>` | governance category |
| `approval_status` | `Option<String>` | governance |
| `criticality` | `Option<String>` | governance |
| `execution_policy` | `Option<String>` | governance/action |
| `aliases` | `Option<Vec<String>>` | returned aliases |
| `updated_at` | `Option<String>` | backend time string |
| `os_type` | `Option<String>` | platform-qualified setting |

### Process map (R-031)

| Field | Type | Behavior |
| --- | --- | --- |
| `platform` | `ProcessMapPlatforms` | API wrapper |
| `windows` / `mac` | `HashMap<String,ProcessMapEntry>` | process-name keyed maps |
| `exclusion_rules` | `Vec<ExclusionRule>` | top-level rules; defaults empty |
| `ProcessMapEntry.app_name` | `String` | canonical application label |
| `cmd_line_patterns` | `Vec<CmdLinePattern>` | defaults empty |
| `is_system` | `bool` | defaults false |
| `CmdLinePattern.pattern` | `String` | matching pattern |
| `CmdLinePattern.app_name` | `String` | alternate mapped application |
| `ExclusionRule.field` | `String` | source field label; matching function uses process name |
| `condition` | `String` | recognized: `starts_with`, `starts_with_number`, `is_empty`, `equals`, `contains`; unknown is false |
| `value` | `Option<String>` | required by selected conditions; missing makes them false |

## Persona identity fields

### `Persona` (R-063)

| Field | Type | Origin/sensitivity |
| --- | --- | --- |
| `id` | `String` | backend user UUID |
| `email` | `String` | validated user email |
| `profile.fullname` | `String` | human identity |
| `profile.emailaddress` | `String` | duplicate/profile email |
| `profile.roles` | `Vec<String>` | role UUIDs |
| `profile.permissions` | `Vec<String>` | permission strings |
| `subscriber` | `String` | subscriber UUID |
| `tenant` | `String` | tenant UUID |
| `last_validated` | `SystemTime` | local validation time |
| `token_expires_at` | `Option<SystemTime>` | locally calculated/optional |
| `user_context` | `Option<Persona UserContext>` | fetched separately |
| `device_id` | `String` | generated hardware/fallback SHA-256-like identifier |

`PersonaWithToken` adds `access_token: String` and optional
`refresh_token: String`. It is crate-private but is projected through Persona
IPC commands/caches; tokens must never enter adapter observations.

### `EmailCandidate` (R-064)

| Field | Type | Meaning |
| --- | --- | --- |
| `email` | `String` | discovered candidate |
| `source` | `EmailSource` | most-recent/primary candidate source |
| `all_sources` | `Vec<EmailSource>` | merged source list |
| `discovered_at` | `SystemTime` | local discovery time |
| `last_access_time` | `SystemTime` | source-reported/access metadata |

`EmailSource` can be `IpcBrowserExtension`, feature-gated `OsAccount`,
`Outlook`, `AppleMail`, `Thunderbird`, `Teams`, `Chrome`, `Firefox`, `Edge`,
`Safari`, plus `DevOverride` and `OAuth`.

### Persona kill-switch/user context (R-065)

| Field | Type/default | Meaning |
| --- | --- | --- |
| `tenant_endpoint_agent_enabled` | `Option<bool>` / effective `true` when absent | tenant-wide enabled state |
| `groups` | `Vec<String>` / empty | organizational groups |
| `is_admin` | `bool` / false | admin flag |
| `department` | `Vec<String>` / empty | department values |
| `user` | `Option<UserInfo>` | detailed user data |
| `UserInfo.display_name` | `Option<String>` | human name |
| `job_title` | `Option<String>` | job title |
| `location` | `Option<String>` | location |
| `id` | `String` / empty | backend user ID |
| `account_enabled` | `Option<String>` / `Some("ACTIVE")` | account status string |
| `UserDevice.id` | `Option<String>` | string-or-number normalized to string |
| `endpoint_agent_enabled` | `bool` / true | per-device enabled state; alias `extensionEnabled` accepted |

## Proxy and alert field coverage

The endpoint proxy, alert, diagnostics, health and redirector field rows are
included in the CSV ledger under R-034–R-062. Key high-risk families are
summarized here.

### Request/DLP fields

- `RequestContext`: `id`, `intercepted_at`, dynamic `map`, transient `dlp_work`,
  upload state and dedup/timing state.
- `ProcessAttribution`: PID/name/path/audit token/original destination/insert
  instant.
- `BodyCaptureMeta`: preview, optional in-memory body, optional temp path,
  known total and truncation flag.
- `Detection`: raw entity, category/subcategory/upstream IDs/reason/method,
  detection type and snippet.
- `PopupRequest`: full original text, detections, options/default, timeout,
  template and blocking flag.

These can cross local process/UI boundaries and contain credentials, sensitive
content, internal URLs and file/process paths.

### Alert fields

`LogPayload` and `UploadLogPayload` contain nested:

- user name/email/machine/IP/tenant/subscriber/roles/permissions;
- agent name/version/OS/architecture/device ID;
- source process, destination URL/domain and authentication labels;
- original/final prompt, justification, action/control/mode/outcome;
- detections, snippets, file paths/names/types/sizes and extracted-file trees.

`SerializedAlert` then wraps opaque bytes with ID, content type, batch family
and optional HTTP routing. SQLite forms add status/retry/timestamps,
quarantine/DLQ reasons and acknowledgement identity.

### Diagnostics and health fields

Diagnostics contain UUID/time/level/category/component/code/message and
arbitrary JSON context. Lifecycle events contain process ID/event type/epoch
milliseconds/context. Health snapshots contain request/failure/DNS/timeout/502/
503/last-success/restart and circuit/connection/destination counters.

### Redirector fields

macOS connection metadata includes connection ID, PID/process name/path,
source/destination socket addresses, optional domain, TCP/UDP and epoch
milliseconds. Extension messages can contain UDP payload bytes and local
configuration/acknowledgement values. Windows UDP state contains 5-tuple-like
keys, PID/name and `Instant`-based lifecycle/counts.

## Validation/defaulting patterns

| Pattern | Verified behavior |
| --- | --- |
| Optional source metadata | commonly becomes `None`, empty string/vector, or omitted JSON depending on struct annotation |
| Unknown process-map exclusion condition | evaluates false |
| Missing Persona kill-switch fields | default enabled (`true`) |
| Hook parse/IPC failure | normally returns Allow in source-specific clients |
| Hook event timestamp | carried in request, discarded for activity time |
| Dynamic request headers | non-UTF-8 values become Rust debug strings |
| Query parameters | URL-decoded into string/array map; malformed decode keeps original text |
| DLP analyzer/auth failure | can degrade to heuristic or fail open depending stage |
| Activity queue full | entry dropped |
| Activity two POST failures | whole batch dropped |
| Entity rediscovery | updates envelope name/time but preserves kind-specific fields |

## Unresolved field semantics

- Units/epoch semantics for every hook client `timestamp` producer.
- Exact production values and allowed vocabularies for source/script strings
  such as risk, scope, agent type, permission type, installation type and
  privilege.
- Whether MCP `env_vars` contains names, `KEY=value`, redacted values or mixed
  forms for every script.
- Effective maximum prompt/body/file/URL/command sizes after all layers.
- Live redaction/scrubbing performed downstream of endpoint logs and alerts.
- Which dynamic `RequestContext.map` keys are present in every protocol/path;
  chapter 08 traces source insertions, but runtime path coverage remains needed.

## Evidence references

- [Native record catalog](06-native-record-types.md)
- `work/sentinel-endpoint-agent/system-monitor/v2/src/entity/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/sync/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/hook_client_common/**`
- `work/sentinel-endpoint-agent/core/src/persona/types.rs`
- `work/sentinel-endpoint-agent/proxy/src/request_context.rs`
- `work/sentinel-endpoint-agent/core/src/templating_engine/models.rs`
- `work/sentinel-endpoint-agent/core/src/alerting/**`
- `work/sentinel-endpoint-agent/diagnostics/src/types.rs`
