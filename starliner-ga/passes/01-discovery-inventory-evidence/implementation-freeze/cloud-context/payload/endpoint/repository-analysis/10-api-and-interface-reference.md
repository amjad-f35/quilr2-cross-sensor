# 10 — API and Interface Reference

## Endpoint delivery and local-test interfaces

| Interface | Invocation/path | Authentication | Inputs/outputs/side effects |
| --- | --- | --- | --- |
| GitHub build dispatch | `workflow_dispatch` in `build.yml` | GitHub repository authorization | mode/platform/profile/embed/sign/input artifact → uploaded artifact/summary |
| Windows builder CLI | PowerShell parameters in `sentinel_builder.ps1` | local process privilege/files/secrets | build/package/embed/sign/update-json/compile-only/sign-only |
| macOS builder CLI | options in `sentinel_builder.sh` | local developer tools/keychain | build app/package/sign/notarize/update JSON |
| Windows distribution CLI | parameters in `sentinel-endpoint.ps1` | elevation for install/update | local ZIP or CDN update, service/cert/network/files; no implemented Env parameter |
| macOS distribution CLI | options in `sentinel-endpoint.sh` | sudo/root | local/CDN install/update and environment/email/trust behavior |
| update manifest | CDN `update.json` | RSA-PSS signature | verified four-field schema documented in data dictionary |
| local CDN | `GET /endpoint-agent/prod/...`, `/cdn/switch`, `/cdn/status` | none | serves basename files, changes/reports root |
| Persona mock | matching POST, `GET /health`, `GET /config` | none; loopback bind | fixed identity/kill-switch data; interactive flags |
| test server control | `GET/DELETE /__control/messages`, raw/config/health; `POST /__control/shutdown` | none | configure/read/clear/stop fault server |
| test server response | all common HTTP verbs | none | configured status/headers/body or drop/block/delay/reset |
| alternate deployment CLI | `deployment.py` CA/profile flags and intended normal flags | root/admin for mutation | profile/check modes work structurally; normal path broken by missing parser field |

Examples are intentionally not fabricated here; verified command forms and wire fields appear in the source-linked delivery/tool chapters.

## IPC library interfaces

- [Current IPC `main` public API and wire protocol](06-ipc-current-main.md#package-and-export-surface)
- [Current IPC framing](06-ipc-current-main.md#wire-model-and-framing)
- [Endpoint-pinned typed, duplex, and broker interfaces](06-ipc-endpoint-pinned.md)
- [Endpoint-pinned typed one-way frame](06-ipc-endpoint-pinned.md#one-way-frame-layout)
- [Endpoint-pinned duplex frame and channel](06-ipc-endpoint-pinned.md#duplex-protocol-and-channel)
- [Endpoint-pinned broker protocol](06-ipc-endpoint-pinned.md#broker-protocol)

The remaining sections complete the other repository interfaces.

## Dashboard/API interfaces

- [Verified production route table, auth boundary, request validation, response shapes, and persistence effects](06-dashboard-api.md#production-http-interface)
- [Entity-sync transport and ingestion semantics](06-dashboard-api.md#entity-discovery-ingestion)
- [Activity, tool-call, conversation, alert, and hook-event interfaces](06-dashboard-api.md#activity-tools-conversations-alerts-and-hook-telemetry)
- [Settings delta and tenant-policy interfaces](06-dashboard-api.md#settings-delta-and-tenant-policy)

**Contradiction:** the production server does not register the internal login or `me` endpoints that are registered by the integration-test router. See the linked route table; test-only interfaces are not represented as production APIs.

## Frontend client interface

[The frontend HTTP contract audit](06-dashboard-frontend.md#http-client-surface-and-contract-audit) identifies every client method, active consumer, matching production route, absent server interface, and parameter/type mismatch. Notably, asset detail sends unused `type` instead of server `os_type`; search sends plural `types`; OTel calls have no server implementation; and several server endpoints have no active UI consumer.

## Endpoint Lua/library interfaces

The feature-gated public Rust surface includes `ScriptEngine`, `Trigger`, `TriggerContext`, manifest/trigger DTOs, `ScriptEvent`, `EventDispatcher`, channel factory, sandbox factory/config, result collector/DTOs, signature verifier, updater, and URL matcher. Only sandbox/result DTOs have checked production consumers.

The Lua global is `sentinel`:

- `fs`: `read_file`, `read_json`, `exists`, `list_dir`, `glob`, `basename`, `dirname`, `modified_time`, `is_dir` when `fs.read` is granted;
- `process`: `list`, `by_name` when `process.list` is granted;
- `platform`: `os`, `home_dir`, `arch` when `platform.info` is granted;
- always: `result.add_app/add_mcp/add_hook/add_skill/add_agent/add_repo/add_permission/add_model/add_plugin/add_entity/set_risk`, `json.parse/encode`, `log.info/warn/error`, and `workspace.repos`.

`set_risk` is a no-op. Rust `add_event` and `add_error` are not exposed to Lua. Exact inputs/defaults/outputs/failures are in [the scripting host API reference](06-endpoint-core-scripting.md#lua-host-api-reference).

## Endpoint DLP templating interfaces

The public Rust request surface is `JustificationContext` plus `TauriContext::initiate_tauri`. Checked proxy consumers use `invoke_tauri_on_main_thread(original_text, detections, default_justification, timeout_seconds, semicolon_options, template_name) -> Result<String, boxed error>`; every cancellation, `None`, or safety timeout becomes the configured default.

The registered webview command surface is:

| Command name | JavaScript payload | Serialized result/effect |
| --- | --- | --- |
| `render_alert_ui` | none | complete HTML string or empty; render errors are HTML strings |
| `get_current_dlp_event` | none | nullable `{ id, original_text, entities, timestamp }` |
| `get_dlp_event_id` | none | ID string, empty for entity-free event, or `<none>` |
| `log_dlp_decision` | `{ decision, justification: { event_id, value, comments }, originalText }` | unit; resolves sender and advances FIFO |
| `hide_alert_window` | none | `Result<(),String>` serialized as success/error; implementation always returns success unless it panics |
| `get_current_ui_context` | none | nullable nested theme/content/options/template object |
| `get_queue_info` | none | two-element `[position,total]` tuple |

`submit_justification` has a command macro but is not registered. Legacy `get_dlp_queue` does not exist. The service-mode IPC transport uses `PopupRequest`/`PopupResponse` JSON with serialized types `templating_popup_request` and `templating_popup_response`; its full actor/broker semantics are documented in [the proxy DLP chapter](06-endpoint-proxy-dlp-ui-alerts.md), while the core boundary is documented in [the templating command interface](06-endpoint-core-templating-engine.md#tauri-command-interface).

## Core crate/build/decompression interfaces

- `core/src/lib.rs` publicly registers all active module namespaces; `scripting` requires its feature. `decompression` has no public path because its root declaration is commented.
- Dormant `Extractor::extract(&FileCheckResult, &Path, u64) -> io::Result<Vec<(PathBuf, FileCheckResult)>>` is public only inside the excluded module. It maps zero timeout to 300 seconds and otherwise returns the partial recorded vector even after most internal errors.
- `ArchiveStrategy` is private and supplies `detect_root` plus `extract`; factory choice uses exact MIME strings.
- `core/build.rs::main` is Cargo's active build interface. With `grpc_server` it generates `quilr.db.v2` client/server code into `OUT_DIR`.
- The protobuf service exposes unary `HandleQuery`, server-stream `HandleReadStream`, client-stream `SyncBatch`, and unary `HealthCheck`. Request table/operation/JSON and write ID fields are exact strings; the handwritten server/client expect nonexistent generated `schema_id` fields.
- Cargo examples are development interfaces only. The spawn example can start a real proxy and defines no cleanup.
- Both benchmark interfaces are invalid against current `Alertable::serialize`/`SerializedAlert` and reference absent `AlertPayload`; they are not callable current API examples.

Exact signatures for all 285 Rust declarations are in [the semantic symbol reference](07-symbol-reference/endpoint-core-crate-shell-tests-and-decompression.md), with non-Rust wire fields in [the companion analysis](06-endpoint-core-crate-shell-tests-and-decompression.md#wire-schema).

## System monitor HTTP/IPC/executable interfaces

| Interface | Exact invocation | Request/response implementation | Side effects/errors |
| --- | --- | --- | --- |
| app ID | `POST {sync.base_app_sync_url}` | app-name request; `AppAddEnvelope.response[]` with required `appName` and optional resolution/governance fields | stamps Application canonical IDs; error retries next 5 s |
| entity ingest | `POST {sync.base_url}/ea/v1/sync/discovered-apps` | gzip JSON `Vec<DiscoveredEntity>`; `IngestResponse.mappings` | governance/sync update; non-2xx warns/retries |
| delta | `GET .../ea/v1/sync/delta?tenant_id=&since=&os_type=` | `DeltaResponse {cursor,settings,error}` | apply/buffer governance; whole response buffered |
| process map | `GET .../ea/v1/sync/process-map` | platform windows/mac maps plus exclusions | replaces correlator maps; 600 s refresh |
| alerts | `POST .../ea/v1/sync/alerts` | one-element array with Application/app/action/time/email/device/os/properties | one immediate retry; no bearer/explicit timeout |
| activity | `POST .../ea/v1/sync/activity` | `Vec<ActivityEntry>` including device/user contexts | 100/30 s batching, two attempts, then drop |
| DLP | `POST .../dlp/v2/stream/detect` | request text/tenant metadata; RS-delimited detections | exported but no production caller |
| hook IPC | Unix socket/named pipe | `[u32 BE length][HookRequest JSON]` → same framing with `HookResponse` | unauthenticated local caller; no frame maximum; 5 s server timeout |
| template IPC | pinned event bus target `template_engine_service` | `TemplateRenderRequest` with request/title/description/PID/options | best-effort user popup |
| Persona/kill-switch IPC | pinned broker JSON commands/broadcasts | module-specific Serde structs | startup identity hard dependency; kill switch fail-open |
| Cursor stdin/stdout | one JSON input document | Cursor allow/deny/ask JSON | malformed/nonblocking allows; raw JSONL append |
| Claude stdin/stdout/exit | one JSON input document | hookSpecificOutput or `{}`; deny/justify stderr + exit 2 | malformed/nonblocking allows; raw JSONL append |

Tenant/subscriber headers are generally present. The shared POST helper adds bearer when available; delta's direct core HTTP call and the standalone Auditor do not add the context bearer in their source. Exact payload fields and verified generated examples are in [the sync/hook chapter](06-endpoint-system-monitor-sync-enforcement-and-hooks.md).

## Template service interfaces

### IPC-Light broker protocol

**Channel:** `ipc_light_broker`  
**Registered service:** `template_engine_service`  
**Authentication/authorization:** none in the consumer; broker source is trusted as the response target  
**Encoding:** JSON inside pinned `BrokerMessage`

| Operation | Required fields | Optional fields | Output/side effects/errors |
| --- | --- | --- | --- |
| `render_request` | `request_id`, `template_name`, complete `options` | type/title/description/original/theme/criticality | activate/dedup/queue; unknown/full returns `render_response` Closed |
| `dismiss_request` | `request_id` | none | active regular only; found returns Closed to dismisser; not-found has no response |
| `status_query` | `query_id` | none | `status_response` with regular active/queue counts and window visibility |
| `render_response` | `request_id`, one `UserDecision` | justification/comments | service output; inbound instance ignored |
| `status_response` | query ID/counts/visibility | none | service output; inbound instance ignored |

All Rust field definitions and exact defaults are in [the message symbol reference](07-symbol-reference/endpoint-template-service-semantic.md#protocol-models-and-constants). Examples in the repository tests/guides are audited in the module chapter; no invented example is added here.

### Tauri command API

The two on-demand windows share ten registered commands:

| Command | Request | Response/effect |
| --- | --- | --- |
| `get_pagination_state` | none | `{total,current,request_ids}` for regular state |
| `get_current_template` | none | nullable `{request_id,html,template_type,title,timeout_seconds,dedup_count}` |
| `navigate_template` | `{direction: i32}` | circular movement; emits `template-update` |
| `submit_decision` | `{requestId,decision,justification?,comments?}` | response/remove/dequeue; unit |
| `dismiss_template` | `{requestId}` | submit Closed; unit |
| `get_notification_pagination_state` | none | notification totals/index/IDs |
| `get_current_notification` | none | nullable ID/HTML/criticality/title/timeout/count |
| `navigate_notification` | `{direction: i32}` | circular movement; emits `notification-update` |
| `dismiss_notification` | `{requestId}` | NotificationDismissed/remove/dequeue; unit |
| `dismiss_all_notifications` | none | replies for active, drops queued, hides window |

Tauri macro registration and JavaScript camelCase-to-Rust argument mapping are directly present. Unknown decision strings become Closed; unknown IDs can generate responses to fallback `decision_engine_service`.

### File/environment/build interfaces

- TOML configuration and simple/backend-shaped registry JSON are startup inputs.
- Three filesystem Tera fragments are runtime inputs chosen by four-level path precedence.
- `template_engine::ipc::messages` is a public protocol-only Rust API and has a verified `system-monitor` consumer with UI features disabled.
- The binary has no CLI command/flag parser. Cargo build/test, ignored manual tests, and repository package scripts are its operational interfaces.

## Email-discovery interfaces

| Interface | Invocation/schema | Authentication/validation | Output/errors |
| --- | --- | --- | --- |
| CLI | `email-discovery [--ipc-socket <STRING>]` | Clap syntax only; empty accepted | missing both CLI/env exits 1 |
| environment | `IPC_SOCKET`, `RUST_LOG`; parent also configures `SERVICE_NAME`, `NO_COLOR` | string presence/filter parse | Windows user-session spawner does not explicitly pass config env; CLI still supplies path |
| Unix IPC | fixed Unix socket, `[u32 BE len][JSON Vec<EmailCandidate>]` | no peer credentials; parent 1 MiB cap/Serde | one requestless frame, no response |
| Windows IPC | fixed named pipe, same frame | null DACL, no client SID; first server instance | one frame, no response |
| Rust library call | `run_local_discovery_as_ipc_frame() -> Vec<u8>` | core feature `local_discovery` | always returns a frame; serialization failure encodes `[]` |
| parent orchestration | `discover_via_subprocess() -> Result<Vec<EmailCandidate>, PersonaError>` | binary resolution/platform spawn | bind/resolve/spawn Err; read/timeout empty Ok |

The repository's verified generated example is the Unix round-trip test in `core/src/persona/discovery/spawned_discovery.rs`; this documentation does not invent a payload.

## Diagnostics interfaces

| Interface | Invocation/schema | Authentication/validation | Output/errors/effects |
| --- | --- | --- | --- |
| Rust local init | `sentinel_diagnostics::init(Config)` | first call only; no runtime/config validation | detached local worker; no readiness/shutdown result |
| Rust emit | level/category/code/message/component/context | typed enums; arbitrary strings/JSON | local enqueue and optionally IPC; returns no delivery status |
| macro API | `diag_*! (Category, DiagCodePath, message[, key=value...])` | compile-time macro shape; `.code_str()` required | inferred component and optional JSON context |
| IPC sender registration | arbitrary `process_id` on `ipc_light_broker` | broker handshake; no diagnostics source binding | targeted Event plus wildcard lifecycle |
| receiver registration | fixed `diagnostics_service` | broker Connected/Ack and Serde schema | Event/Batch handler calls; Lifecycle logs only |
| Event wire schema | `{type:"event",payload:DiagnosticPayload}` | required typed payload fields | standalone receiver regenerates ID/time |
| Batch wire schema | `{type:"batch",payloads:[...]}` | no diagnostics-layer count limit | sequential handler calls; no production sender found |
| Lifecycle wire schema | `{type:"lifecycle",event:{...}}` | typed event; arbitrary process/context | informational log only at receiver |
| OpenSearch Bulk | POST configured URL, x-ndjson | no auth/default HTTP; HTTP status only | hard-coded diagnostics index; non-2xx error body logged |
| backend health | GET fixed `http://localhost:9200` | any 2xx | Boolean only; not tied to configured backend |
| shell CLI | `setup.sh [start|stop|clean|status]` | Docker/curl availability | Compose lifecycle and test event |
| binary CLI | `sentinel-diagnostics` | no parser/flags | attempts Docker/backend then broker receiver |
| file interface | `<db_path>.log`, `<db_path>.sent` | JSON/UUID parse; corrupt lines skipped | append/read/mark only; no management API |

Exact fields, enum values, defaults, status handling, and tests are in [the diagnostics interface chapter](06-endpoint-diagnostics-receiver.md).

## Endpoint infra public interfaces

| Interface | Invocation/schema | Validation/security | Output/effects/status |
| --- | --- | --- | --- |
| `BinaryResolver` | service/PATH/path methods | implementation-specific; no name restriction | `PathBuf` or `BinaryError`; macOS/Windows only |
| `IpcAddress` | `new(String)` / `for_service(&str)` | constructor none; manager separate | public mutable path string |
| `IpcAddressManager` | prepare/cleanup/validate | Unix empty/108/NUL; Windows pipe prefix/length | filesystem mutation or `io::Error` |
| `IpcChannel` | synchronous raw `send`/`recv` and timeout variants | no framing/authentication/peer contract | mutable byte stream or `IpcError` |
| `IpcServer` | bind/accept/local/shutdown | no server factory/policy contract | implemented only by exported Unix concrete type |
| `IpcChannelFactory` | boxed client creation | none beyond transport | macOS channel; Windows `NotImplemented` |
| `ProcessConfig` | public fields plus consuming builders | no environment/name/path validation | complete child-spawn request model; IPC field itself unused by adapters |
| `ProcessSpawner` | spawn/stale cleanup/default `spawn_service` | OS and implementation-specific | boxed `ProcessHandle`; default stale cleanup no-op |
| `ProcessHandle` | PID/liveness/wait/signal/kill/status | no ownership proof in interface | cached `ExitStatus`; default graceful signal is no-op success |
| `ProcessSpawnerFactory` | `create()` | none | exported but no production caller found |
| `PlatformServices` | four boxed adapter getters | compile-time selector | Mac/Windows concrete; Linux getters panic |
| `select_platform_services` | no arguments | target `cfg` | boxed target object; not runtime detection |
| `hash_data` | byte slice | none | lowercase SHA-256 hex string |

Exact signatures, variants, side effects, callers, and tests are in [the infra semantic reference](07-symbol-reference/endpoint-infra-platform-runtime.md).

## Endpoint proxy interfaces

### HTTP and TLS surface

| Interface | Invocation/schema | Authentication/validation | Response/effect |
| --- | --- | --- | --- |
| explicit HTTP proxy | arbitrary HTTP method/absolute or origin URI on configured HTTP listener | no proxy authentication; host/context/body validation is request-path specific | DLP/policy processing then upstream response or generated error/block response |
| HTTP `CONNECT` | authority target | hostname/port parsing, bypass/domain checks | upgraded tunnel or TLS MITM path |
| transparent TLS | redirected TCP on HTTPS listener | original-destination/process attribution and SNI logic | generated server certificate, parsed HTTP-over-TLS, upstream TLS/HTTP |
| WebSocket upgrade | standard upgrade headers | header checks; no separate auth | 101 then bidirectional relay with optional frame DLP |
| `GET /health` | exact path on normal request handler | no authentication | JSON `HealthResponse`; 200 healthy/degraded, 503 unhealthy/critical, 500 serialization failure |
| `GET /metrics` | exact path | no authentication | Prometheus text with request/health/circuit/process counters; 200 or generated handler error |

The proxy is not a repository-defined REST application beyond health/metrics; it is an intermediary for arbitrary HTTP traffic. Request and response examples are intentionally omitted because no single application payload schema applies.

### Broker interfaces

The process uses the pinned IPC library for Persona request/response/events, diagnostics producer events, alert delivery, kill-switch updates, and templating requests. Their wire framing and security model are documented in the pinned-IPC and relevant subsystem chapters. Proxy-side consumers include `kill_switch_ipc_client`, `templating_ipc_client`, core Persona client, diagnostics facade, and alert sender.

### macOS extension control protocol

Frames are `u32` big-endian JSON length followed by an externally tagged JSON object. Swift→Rust message types are `tcp_redirect`, `udp_packet`, `connection_close`, `heartbeat`, and `ping`. Rust→Swift types are `ack`, `udp_response`, `heartbeat_ack`, `close_request`, `config_update`, `pong`, `backpressure`, and `shutdown`. `pong` supplies exclusion lists, UDP mode/ports, relay address/port, and heartbeat port. Several variants are retained only for the legacy file-descriptor/UDP path.

The active TCP data interface is separate: Swift opens a localhost relay TCP connection, writes a four-byte metadata length, JSON `ConnectionMetadata`, then raw flow bytes. Metadata fields are process PID/name/path, source and destination `SocketAddress`, optional domain, protocol, and timestamp. Rust limits metadata to 64 KiB and applies five-second reads. No relay authentication or peer credential exists.

The heartbeat interface is an HTTP-like request to a random localhost port; Rust reads one 256-byte chunk and accepts a substring path match without method or authentication checking.

### Windows interception interface

WinDivert filters and rewrites raw IPv4 TCP/UDP packets. This is not an externally versioned application protocol. `NetworkUtils` exposes borrowed IP/TCP/UDP header views, and `ProcessPolicy` is the configurable interception decision interface. Packet parsing is fixed-header and IPv4-only; it does not validate fragmentation, total length, TCP data offset, or checksums before mutation.

See [runtime symbols](07-symbol-reference/endpoint-proxy-runtime.md), [DLP symbols](07-symbol-reference/endpoint-proxy-dlp.md), and [redirector symbols](07-symbol-reference/endpoint-proxy-redirector.md) for exact signatures and failure values.
