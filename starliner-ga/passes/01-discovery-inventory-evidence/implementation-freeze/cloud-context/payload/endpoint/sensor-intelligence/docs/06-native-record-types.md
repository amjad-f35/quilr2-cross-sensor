# 06 — Native Record-Type Catalog

## Scope and record classes

This catalog distinguishes:

- `Observation`: source-derived state or activity.
- `Derived observation`: correlation, classification or aggregation.
- `Control/config input`: backend or local command material.
- `Control result`: a decision or attempted effect.
- `Operational`: health, lifecycle, diagnostic or traffic-log material.
- `Persistence/transport`: an envelope or stored representation.
- `Internal state`: meaningful runtime state that is not currently serialized.

“Native” means declared or constructed by the endpoint source. It does not mean
that the record is exported, durable, stable, safe for platform use, or present
in the proposed endpoint source profile.

Machine-readable companions:

- [native-record-types.csv](../../../matrices/sensor-intelligence/endpoint-sensor/native-record-types.csv)
- [native-record-types.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/native-record-types.yaml)

## Record inventory

| ID | Native type | Class | Producer | Current consumer/persistence | Serialization | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | `platform::process_info::ProcessInfo` | Observation | macOS/Windows enumerators | process diff/correlator; memory | none | `Active`, not directly emitted |
| R-002 | process start/exit delta | Derived observation | `ProcessTable::diff` | process monitor | internal collections | `Active`, transient |
| R-003 | `entity::Entity` | Observation/current state | correlation/scanners | `EntityStore`, snapshot, ingest converter | JSON through snapshot | `Active` |
| R-004 | `ApplicationData` | Observation/derived | process correlation/Lua/package scans | `EntityKind::Application` | tagged under R-003 | `Active` |
| R-005 | `McpServerData` | Observation candidate | Lua converter | `EntityKind::McpServer` | tagged under R-003 | `Active when script emits retained form` |
| R-006 | `HookData` | Observation candidate | Lua converter | `EntityKind::Hook` | tagged under R-003 | same |
| R-007 | `SkillData` | Observation candidate | Lua converter | `EntityKind::Skill` | tagged under R-003 | same |
| R-008 | `AgentData` | Observation candidate | Lua converter | `EntityKind::Agent` | tagged under R-003 | same |
| R-009 | `ModelData` | Observation candidate | Lua converter | `EntityKind::Model` | tagged under R-003 | same |
| R-010 | `ControlledRepoData` | Observation candidate | Lua converter | `EntityKind::ControlledRepo` | tagged under R-003 | same |
| R-011 | `PermissionData` | Observation candidate | Lua converter | `EntityKind::Permission` | tagged under R-003 | same |
| R-012 | `PluginData` | Observation candidate | Lua converter | `EntityKind::Plugin` | tagged under R-003 | same |
| R-013 | `GovernanceFields` | Control/current state | defaults + backend response/delta | entity/enforcer/snapshot/ingest | JSON under R-003/R-019 | `Active`; mixed source/backend ownership |
| R-014 | monitor `DeviceContext` | Context | `ContextManager::new` | sync/hook/enforcement | internal; mapped to R-022 | `Active` |
| R-015 | monitor `UserContext` | Sensitive context | Persona → orchestrator | sync/hook/enforcement | internal; mapped to R-023 | `Active`; contains access token |
| R-016 | monitor `TenantContext` | Context | Persona → orchestrator | sync | internal; mapped to R-020 | `Active` |
| R-017 | `snapshot::Snapshot` | Persistence | snapshot timer/shutdown | local JSON restore | pretty JSON | `Active`, version fixed to 1 |
| R-018 | `store::ChangeEvent` | Internal event | `EntityStore` | hook manager/enforcer | broadcast enum, not serialized | `Active` |
| R-019 | `sync::types::DiscoveredEntity` | Current outbound wire | `to_discovered_entity` | `/ea/v1/sync/discovered-apps` | JSON then gzip batch | `Active and lossy` |
| R-020 | `SyncTenantContext` | Wire context | ingest converter | R-019 | JSON | `Active` |
| R-021 | `SyncGovernance` | Wire control state | ingest converter | R-019 | JSON | `Active` |
| R-022 | `SyncDeviceContext` | Wire context | ingest/activity builders | R-019/R-024 | JSON | `Active` |
| R-023 | `SyncUserContext` | Wire context | ingest/activity builders | R-019/R-024 | JSON | `Active`; no access token |
| R-024 | `ActivityEntry` | Derived observation | hook evaluator | memory batch → `/ea/v1/sync/activity` | JSON array | `Active`, best effort |
| R-025 | `HookRequest` | Observation/transport | Cursor/Claude thin client | hook IPC/evaluator | JSON frame | `Active when hook invoked` |
| R-026 | `HookResponse` + `DetectionInfo` | Control result | evaluator | thin client/IDE | JSON frame | `Active`; production response is Allow/empty |
| R-027 | `IngestResponse` + `IngestMapping` | Control/ack input | current API | monitor store | JSON | `Active`, subsystem-specific ack |
| R-028 | `IngestSettings` | Control input | current API ingest response | governance mapping | nested JSON | `Active` |
| R-029 | `AppAddEnvelope` + `AppResolution` | Identity/control input | `/endpoint/app/add` | app-ID resolver | JSON with source renames | `Active` |
| R-030 | `DeltaResponse` + `DeltaSetting` | Control input | `/ea/v1/sync/delta` | store/governance cursor | JSON | `Active` |
| R-031 | process-map response graph | Configuration input | `/ea/v1/sync/process-map` | Correlator | JSON | `Active` |
| R-032 | `InstalledFile` | Internal control result | hook installer | integrity registration | none | `Active when hooks install` |
| R-033 | `MonitoredFile` | Internal state/config | hook manager | integrity monitor | none | `Active when hooks install` |
| R-034 | proxy `RequestContext` | Derived observation state | request constructor/handlers | DLP/policy/alerts/logs | dynamic JSON map internally; type not serialized wholesale | `Active` |
| R-035 | `ClientConnMeta` + `RequestId` + `SniHost` | Context | proxy accept/TLS paths | request extensions | none | `Active` |
| R-036 | proxy `ProcessAttribution` | Observation/attribution | redirectors/app refresh | request extensions/DLP/alerts | none | `Conditional`; TTL cache |
| R-037 | `BodyCaptureMeta` | Internal observation state | body capture | extraction/forwarding | none | `Conditional` |
| R-038 | `DlpPattern`/`DlpField`/`ExtractStage` | Configuration input | file/backend config | extractor | serde/config-specific | `Active when loaded` |
| R-039 | templating `Detection` | Derived observation | DLP analyzers | finding/decision/UI/alerts | JSON in popup/alert paths | `Conditional` |
| R-040 | `DlpFinding` | Derived observation | `DlpEngine` | request policy/action | none on its own | `Conditional` |
| R-041 | `DlpDecision` | Control result | DLP action logic | request handler | none on its own | `Conditional` |
| R-042 | `PopupRequest` | Local control request | proxy templating client | template service | JSON over broker | `Conditional`; contains original text |
| R-043 | `PopupResponse` | Local user/control result | template service | proxy waiter | JSON over broker | `Conditional` |
| R-044 | core alert `LogPayload` | Evidence/outbound alert | proxy DLP alert builder | `SerializedAlert` | JSON | `Active selected DLP paths` |
| R-045 | core alert `UploadLogPayload` | Evidence/outbound alert | proxy upload alert builder | `SerializedAlert` | JSON | `Active selected upload paths` |
| R-046 | `SerializedAlert` | Transport envelope | `Alertable::serialize` | alert IPC/local storage | opaque bytes + metadata | `Active` |
| R-047 | `AlertIpcPayload`/`AlertIpcMessage` | Local transport envelope | `AlertSender` | `AlertReceiver` | broker JSON with byte vector | `Active` |
| R-048 | `StoredAlert` / `alerts` row | Persistence | alert ingestor/storage | dispatcher | SQLite columns | `Active` |
| R-049 | `QuarantinedAlert` / quarantine row | Persistence/failure | alert storage | operator/retry tooling | SQLite columns | `Active path exists` |
| R-050 | `DlqEntry` / DLQ row | Persistence/failure | alert storage | operator acknowledgement | SQLite columns | `Active path exists` |
| R-051 | `DiagnosticPayload` | Operational evidence | agent/proxy diagnostic macros | broker/optional receiver | JSON | `Active producer` |
| R-052 | diagnostics `ServiceLifecycleEvent` | Operational event | diagnostics sender | broker/receiver | JSON, snake-case event type | `Active for start/heartbeat/stop; Crashed constructor uncalled` |
| R-053 | `DiagnosticsMessage` | Transport envelope | diagnostics sender | receiver | tagged JSON `event|batch|lifecycle` | `Active`; Batch producer not found |
| R-054 | traffic `LogEvent` | Operational observation | proxy response paths | local async logger | tabular line format, not serde | `Conditional`, local only |
| R-055 | proxy health `HealthMetrics`/`HealthResponse` | Operational state | health monitor/endpoint | local health response/logs | JSON response types | `Active unless disabled`; remote use unresolved |
| R-056 | `ConnectionPoolSnapshot` | Operational metric sample | proxy atomics | structured log | none/trace fields | `Active` |
| R-057 | circuit-breaker metrics | Operational state | circuit breakers | health response/logs | derived structs | `Conditional` |
| R-058 | destination `MetricsSnapshot` | Operational metric sample | destination resolver counters | logs/debug consumers | plain struct | `Active transparent path` |
| R-059 | macOS `ConnectionMetadata` | Observation/transport | Network Extension | Rust relay/attribution | length-prefixed JSON | `Conditional`, macOS |
| R-060 | `ExtensionMessage` | Local transport event | Network Extension | Rust proxy | tagged length-prefixed JSON | `Conditional`, macOS |
| R-061 | `ProxyMessage` | Local control/ack | Rust proxy | Network Extension | tagged length-prefixed JSON | `Conditional`, macOS |
| R-062 | Windows `UdpFlowKey`/`UdpFlowInfo` | Internal observation state | WinDivert UDP tracker | redirector attribution/maintenance | none | `Conditional`, Windows |
| R-063 | `Persona` | Sensitive identity/current state | auth response/vault | bridge, monitor, proxy | serde JSON/vault/broker projections | `Active` |
| R-064 | `EmailCandidate` | Sensitive observation candidate | Persona discovery sources | validation/dedup | framed JSON in helper flow | `Conditional`; crate-private |
| R-065 | Persona `UserContext`/`UserDevice` | Control/identity input | fetch-user-details backend | kill switch and Persona | JSON | `Active` |
| R-066 | `ServiceState`/`StatusUpdate` | Operational state/event | lifecycle/wrappers | service monitor/supervisor | service state serde; update channel internal | `Active` |

## Exact System Monitor native state schemas

### R-001 — raw `ProcessInfo`

**Location:** `system-monitor/v2/src/platform/process_info.rs`

| Field | Rust type | Meaning/derivation |
| --- | --- | --- |
| `pid` | `u32` | OS process identifier |
| `name` | `String` | normalized best name; executable basename, then command basename, then raw name |
| `raw_process_name` | `String` | original OS-reported name |
| `exe_path` | `Option<String>` | executable path when available |
| `ppid` | `Option<u32>` | parent PID when available |
| `start_time_secs` | `u64` | enumerator-provided process start time |
| `user` | `Option<String>` | OS user/account when available |
| `cmd_line` | `Vec<String>` | command-line elements |

Windows normalization strips a terminal `.exe` and lowercases; macOS retains
case. The struct is not serialized or persisted directly.

### R-003 — `Entity`

**Location:** `system-monitor/v2/src/entity/mod.rs`

```text
Entity {
  id: Uuid,
  name: String,
  kind: EntityKind,
  governance: GovernanceFields,
  discovered_at: DateTime<Utc>,
  last_seen_at: DateTime<Utc>,
  synced_to_backend: bool,
  backend_sync_at: Option<DateTime<Utc>>
}
```

`EntityKind` is serialized as `{ "type": "<variant>", "data": { ... } }`.
Its exact variants are:

```text
Application | McpServer | Hook | Skill | Agent | Model |
ControlledRepo | Permission | Plugin
```

The store treats `name` and `last_seen_at` as discovery-owned on update while
preserving the existing `kind`, governance, discovery time and sync state.
Consequently later discovery cannot refresh most kind-specific fields through
ordinary `upsert`.

### R-004–R-012 — entity-kind payloads

| Record | Exact fields |
| --- | --- |
| `ApplicationData` | `canonical_id: Option<String>`; `bundle_id: Option<String>`; `version: Option<String>`; `vendor: Option<String>`; `install_path: Option<String>`; `process_name: Option<String>`; `raw_process_name: Option<String>`; `exe_path: Option<String>`; `cmd_line: Vec<String>`; `parent_process_name: Option<String>`; `is_system: bool`; `privilege: Option<String>`; `source: String`; `installation_type: String`; `is_active: bool`; `is_dev_tool: bool`; `known_executables: Vec<String>`; `pids: Vec<u32>` |
| `McpServerData` | `name`; `app_name`; `transport`; `command?`; `args[]`; `env_vars[]`; `url?`; `scope`; `risk_level`; `description?` |
| `HookData` | `app_name`; `event`; `hook_type`; `command?`; `matcher?`; `risk_level`; `description?`; `binary_name?`; `binary_path?` |
| `SkillData` | `app_name`; `name`; `path`; `scope`; `risk_level`; `description?` |
| `AgentData` | `app_name`; `name`; `path`; `agent_type`; `scope`; `risk_level`; `description?` |
| `ModelData` | `app_name`; `name`; `provider`; `scope`; `description?` |
| `ControlledRepoData` | `app_name`; `repo_path`; `trust_level?`; `session_count: u32`; `local_mcp_count: u32`; `local_hook_count: u32`; `risk_score: u32` |
| `PermissionData` | `app_name`; `command`; `permission_type`; `scope`; `risk_level` |
| `PluginData` | `app_name`; `name`; `plugin_type`; `version?`; `risk_level`; `description?` |

Except for explicit types shown, fields are `String`, optional `String`, or
`Vec<String>` as indicated.

### R-013 — `GovernanceFields`

```text
approval_status: NeedsReview | Approved | Blocked
criticality: NotCritical | Critical
execution_policy: Allowed | Audit | Blocked | Quarantined
owner: Option<String>
category: Option<String>
domain: Option<String>
is_new_entity: bool
last_synced_time: Option<DateTime<Utc>>
```

Defaults are `NeedsReview`, `NotCritical`, `Allowed`, no optional values,
`is_new_entity = true`.

### R-017 — `Snapshot`

```text
version: u32                 // writer always uses 1
snapshot_at: DateTime<Utc>
delta_cursor: u64
entities: Vec<Entity>
```

The save path writes pretty JSON to `<path with json.tmp extension>` and renames
it. Load deserializes but does not reject an unsupported `version`.

### R-018 — `ChangeEvent`

```text
Added(Uuid)
GovernanceUpdated(Uuid)
Rediscovered(Uuid)
Removed(Uuid)
```

This is a Tokio broadcast event, not a persisted event log. `Removed` is
produced only when `EntityStore::remove` is explicitly called; process exit does
not call it in the active discovery path.

## Current monitor wire records

### R-019 — `DiscoveredEntity`

```text
id: String
canonical_id: Option<String>            // omitted if None
entity_type: String
name: String
discovered_at: String
last_seen_at: String
tenant_context: SyncTenantContext
entity_context: serde_json::Value
properties: Option<HashMap<String,String>> // omitted if None
governance: SyncGovernance
device_context: SyncDeviceContext
user_context: SyncUserContext
```

The entire batch is JSON-serialized and gzip-compressed. It is a current
dashboard contract, not the proposed Starliner observation schema.

### R-024 — `ActivityEntry`

```text
prompt_text: Option<String>
authenticated_user: Option<String>
tools: Vec<String>
files: Vec<String>
skills: Vec<String>        // current builder always []
mcp_server: Vec<String>    // current builder always []
project: Option<String>    // basename of cwd
model: Option<String>      // current builder always None
app_name: Option<String>   // "claude" maps to "claude-code"
app_version: Option<String>// current builder always None
decision: String           // current production builder "allow"
time: String               // Utc RFC3339
device_information: SyncDeviceContext
user_context: SyncUserContext
```

The batcher capacity is 1,000; it flushes at 100 items or every 30 seconds,
tries a POST twice with a two-second delay, and then drops the batch.

### R-025/R-026 — hook IPC

`HookRequest` contains:

```text
session_id: String
ide_type: String
event_name: String
tool_name: Option<String>
tool_input: Option<serde_json::Value>
command: Option<String>
file_path: Option<String>
prompt: Option<String>
cwd: Option<String>
timestamp: u64
```

`HookResponse` contains `decision`, `message?`, and `detections[]`.
`Decision` serializes exactly as `Allow`, `Deny`, `Ask`, or `Justify`.
`DetectionInfo` contains `detection_type`, `severity`, and `description`.
`Verified in source`: the active evaluator returns `Allow`, no message, and an
empty detection array.

## Proxy native records

### R-034 — `RequestContext`

The stable fields are `id`, `intercepted_at` and a dynamic
`serde_json::Map<String, Value>`. It also owns non-serialized DLP work, upload
metadata, an alert-dedup flag and a start timer. Because much of the semantic
content is inserted into a dynamic map, field closure requires tracing every
insertion; it is covered in chapters 07–08.

### R-036 — `ProcessAttribution`

```text
pid: u32
name: Option<String>
process_path: Option<PathBuf>
audit_token: Option<Vec<u8>>
orig_dst_ip: u32
orig_dst_port: u16
inserted_at: Instant
```

It is process-memory state keyed by client IPv4/port, with configurable TTL and
maximum entries. `Instant` prevents direct durable serialization.

### R-039 — DLP `Detection`

```text
entity: String
category: Option<String>
sub_category: Option<String>
category_id: Option<String>
category_code_name: Option<String>
reason: Option<String>
detection_method: Option<String>
detection_type: SensitiveContent | AdversarialPrompt
snippet: Option<String>
```

This record may contain raw sensitive substrings and snippets. It crosses the
local UI and alert boundaries in selected paths.

### R-040/R-041 — DLP finding and decision

`DlpFinding` is `sensitive: bool` plus `HashSet<Detection>`.
`DlpDecision` is `verdict: Sensitive|NonSensitive`, `message: String`, and the
same detection set. Neither type is itself a durable/emitted event; downstream
builders convert it into request disposition, UI and alert records.

### R-042/R-043 — popup IPC

`PopupRequest` includes `msg_type`, `request_id`, full `original_text`,
`detections`, default justification, timeout, options, template name and a
blocking flag. `PopupResponse` returns `msg_type`, matching `request_id`,
optional `justification`, and optional `error`.

### R-044/R-045 — alert business payloads

Both are browser-extension-compatible top-level JSON objects:

```text
user
extension          // Rust field agent, serde-renamed
check
client_details
application
```

`LogPayload` uses DLP `CheckSection`; `UploadLogPayload` uses
`UploadCheckSection` with file/detection metadata. These are large nested
schemas documented field-by-field in chapter 07.

## Alert transport and persistence records

### R-046 — `SerializedAlert`

```text
id: Uuid
bytes: Vec<u8>
content_type: &'static str
batch_family: &'static str
http_config: Option<AlertHttpConfig>
```

The alert system treats `bytes` as opaque. Same-family payloads can be combined
according to their registered `BatchCombiner`.

### R-047–R-050 — IPC and SQLite forms

- `AlertIpcPayload` owns the same ID/bytes/content-type/family plus an optional
  owned HTTP configuration.
- `StoredAlert` adds status, retry count, next retry time, create/update times
  and serialized HTTP configuration.
- `QuarantinedAlert` adds original alert ID, quarantine reason/time and retry
  count.
- `DlqEntry` adds failure reason, first-failure/DLQ times and acknowledgement
  fields.

This is the only current endpoint subsystem with a local SQLite persistence,
retry/quarantine/DLQ model. It is alert-specific and does not make inventory,
activity or diagnostics durable.

## Diagnostic and operational records

### R-051 — `DiagnosticPayload`

```text
id: Uuid                    // UUIDv4
timestamp: DateTime<Utc>
level: Level
category: Category
component: Component
code: Option<String>        // omitted when None
message: String
context: Option<Value>      // omitted when None
```

`DiagnosticsMessage` is tagged by `type` as `event`, `batch`, or `lifecycle`.
No current Batch producer was found. Lifecycle event types serialize
`started|stopped|crashed|heartbeat`.

### R-054 — traffic `LogEvent`

`method`, `uri`, `status`, and UTC timestamp are queued in a 10,000-entry
lock-free queue. On overflow the oldest event is removed and a drop counter is
incremented. The writer emits local file lines rather than a source-native JSON
contract.

### R-055–R-058 — proxy health/metrics

The proxy maintains health request counts/failure rate/DNS/timeouts/502/503,
last-success age, restart count, circuit state, connection-pool utilization and
destination-resolution counters. Most are process-local snapshots or logs; the
health endpoint has a JSON response type. None is currently emitted through a
durable platform metric stream.

## Redirector records

### R-059 — `ConnectionMetadata`

```text
id: String
process: { pid: u32, name: String, path: PathBuf }
source: SocketAddr
destination: SocketAddr
domain: Option<String>
protocol: tcp | udp
timestamp: i64             // documented as Unix milliseconds
```

### R-060/R-061 — extension protocol

The macOS extension uses four-byte big-endian length-prefixed JSON, maximum
1 MiB:

- extension → proxy: `tcp_redirect`, `udp_packet`, `connection_close`,
  `heartbeat`, `ping`;
- proxy → extension: `ack`, `udp_response`, `heartbeat_ack`,
  `close_request`, `config_update`, `pong`, `backpressure`, `shutdown`.

These are local runtime transport records, not platform telemetry. `AckStatus`
means the local message was accepted/rejected; it is unrelated to Starliner
durable observation acknowledgement.

## Persona and service records

### R-063 — `Persona`

Fields include backend user ID/email/profile roles/permissions, subscriber,
tenant, local validation/token-expiry times, optional backend user context and
a generated device ID. Tokens are kept in the crate-private
`PersonaWithToken`, not the public `Persona`, but access-token projections cross
local IPC.

### R-064 — `EmailCandidate`

Contains email, primary/all `EmailSource` values, discovery time and last-access
time. The user-session helper serializes a vector of these records. The
candidate is not authoritative identity.

### R-066 — service lifecycle state

`ServiceState` declares `NotStarted`, `Initializing`, `Running`, `Stopping`,
`Stopped`, `Crashed`, `Retrying`, and `Failed`. `StatusUpdate` additionally
carries state, heartbeat, crash and error messages on an internal channel.
These state sources can disagree with immutable wrapper fields.

## Current-versus-proposed boundary

The following records in the frozen endpoint source profile are not current
native records merely because they appear in target documentation:

- `endpoint.gap`;
- a unified `sensor.health` record;
- durable outbox envelope/receipt/sequence records;
- complete snapshot begin/end markers;
- generic file-operation events;
- independent native-effect verification;
- adapter-produced canonical observation/evidence/event/metric envelopes.

They remain `Proposed` until chapters 18–20 define them and implementation
evidence exists.

## Immediate schema risks

- `Entity` IDs have collision/omission problems for user-scoped and MCP kinds.
- `EntityStore::upsert` preserves the old kind payload, so rediscovery does not
  refresh most kind-specific fields.
- `ApplicationData.is_active` is not made false on process exit.
- `ActivityEntry.skills`, `mcp_server`, `model`, and `app_version` are present
  but current builder output is empty/None.
- `RequestContext.map` is dynamically typed and can silently change without a
  compiler-visible schema change.
- DLP/alert/popup records can contain prompt text, sensitive substrings, file
  paths, email and process context.
- Alert SQLite durability cannot be generalized to other record families.
- Local extension acknowledgement is not central durable admission.

## Evidence references

- `work/sentinel-endpoint-agent/system-monitor/v2/src/entity/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/platform/process_info.rs`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/store/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/sync/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/hook_client_common/**`
- `work/sentinel-endpoint-agent/proxy/src/request_context.rs`
- `work/sentinel-endpoint-agent/proxy/src/dlp/**`
- `work/sentinel-endpoint-agent/proxy/src/packet_redirector/**`
- `work/sentinel-endpoint-agent/core/src/templating_engine/models.rs`
- `work/sentinel-endpoint-agent/core/src/alerting/**`
- `work/sentinel-endpoint-agent/diagnostics/src/types.rs`
- `work/sentinel-endpoint-agent/core/src/persona/types.rs`

