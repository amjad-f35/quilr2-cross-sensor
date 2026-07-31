# 05 — Feature Catalog

## Endpoint delivery and support features

| Feature | Entry point | Primary symbols/files | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| Cross-platform release package | `build.yml` → platform builder | `New-Package`; `create_app_bundle`; `create_final_package` | Cargo, Swift/Xcode, WinDivert, GitHub artifacts | no CI build tests | Implemented with artifact-collection discrepancies |
| Windows cloud signing | builder `-Sign` | `Invoke-SignRelease`, CodeSignTool JAR | SSL.com CSC/HSM/TOTP | no automated verification gate | Implemented for allowlisted subset; output collection defective |
| macOS Developer ID/notary | mac builder/generate-dist | `sign_components`, `notarize_app` | Keychain, codesign, notarytool, stapler | post-sign checks only | Implemented; some verification failures warn |
| Signed update metadata | builder/update-json scripts | canonical JSON + RSA-PSS | updater private key, ZIP SHA-256 | static/self tests only | Implemented; string `force_update` |
| Endpoint install/update | distribution scripts | `Invoke-Install`/`Invoke-Update`; `run_install`/`run_update` | filesystem, services, cert stores, network extension/driver, CDN | QA gates defective; no CI E2E | Implemented with nontransactional rollback gaps |
| Endpoint removal | distribution uninstallers | platform phase functions | services, certs, files, network, user env | manual only | Implemented but success can overstate restoration |
| Manual predecessor operations | `scripts/installer`, `runner`, `uninstaller` | platform scripts | same privileged host state | manual only | Legacy/manual, still documented |
| Alternate Python deployment | `deployment.py` | `main`, CA/SCEP/profile/daemon helpers | MDM/GPO/keychain/service | no tests | Experimental/incomplete; normal mode broken |
| Old secure-manifest package | root build → `build/build.py` | parse/copy/sign/transform/package | platform signing stores | old manual smoke | Legacy; internally incompatible |
| Local updater CDN | `tools/local_cdn.py` | `CDNHandler` | test filesystem + HTTP | none | Test utility; unsafe if network-exposed |
| HTTP fault server | `tools/test-server` | `TestServer`, Python handler/state | child Python HTTP process | seven Rust test functions, not CI | Test utility with startup/cleanup defects |
| Root bootstrap/service integration suite | root `tests/` | two integration files/common helpers | core managers/temp env | 48 cases + 12 helper cases | Dormant/undiscovered |
| Proposed E2E harness | superpowers plan | planned `sentinel-e2e` crate/workflows | planned Wiremock/axum/process helpers | none committed | Documentation-only |

The full repository-wide feature matrix remains cumulative; this table closes the delivery/support features without treating plans as code.

## Dashboard feature traceability

| Feature | Entry point | Primary symbols | Data/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| Portal-token SPA login | `/login?token=` | `LoginPage`, `decodeJwt`, `AuthProvider` | localStorage | none | Implemented; decode-only |
| Overview | `/` | `OverviewDashboard`, `useOverview`, `GetOverview` | ClickHouse + two cache layers | API integration coverage partial | Implemented; donut/governance component unreachable |
| Nine typed inventories | sidebar routes | `DashboardPage`, `DiscoveryTable`, `ListAssets` | entity/catalog/settings tables | API integration partial; no UI tests | Implemented |
| Asset detail/ego graph | row click | `AssetDetailModal`, `GetAsset`, `RelationshipGraph` | state/edge tables | API detail tests | Implemented; errors suppressed in UI |
| Application execution policy | allow/block buttons | `useUpdatePolicy`, `UpdatePolicy` | settings table | API integration | Implemented |
| Relationship graph | `/relationships` | `RelationshipGraphPage`, `GetRelationships` | entities/edges/activity | no current production-route integration test | Implemented |
| Conversation activity | `/activity` | `ActivityLogPage`, `ListConversations` | activity table | repository/unit + integration | Implemented; hook events not surfaced |
| Alerts | `/alerts` | `AlertsPage`, `ListAlerts` | alert table | no frontend tests | Implemented |
| DLP tenant policy | settings/DLP | `useSettings`, DLP components, policy handler/repo | embedded catalog + policy table | policy unit/integration | Implemented |
| Dangerous permissions | settings/permissions | permissions components, static config handler, policy perms | JSON config + policy table | handler/catalog tests | Implemented |
| Inventory overview API | no routed consumer | `useInventoryOverview`, backend overview symbols | state/edges | API integration | Backend/client implemented; frontend unreachable |
| OTel Claude activity | no route | `ClaudeActivityPage`, `useOtel` | missing server endpoints | none | Incomplete/unreachable |
| Skills policy UI | no settings tab | `SkillsTree`, skill hooks | static mock skills + policy | policy model tests only | Code-present/unreachable |

The endpoint and cross-repository feature mapping is completed by the sections below and the linked subsystem chapters.

## Endpoint core scripting traceability

| Feature | Entry point | Primary symbols | Data/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| Scripted file discovery | v2 `scanner::scan_cycle` | `executor::execute_script`, `create_sandboxed_lua`, `ResultCollector`, `convert_results` | packaged Lua, endpoint filesystem, `EntityStore` | one fixture integration plus conditional real-home tests | Active; raw entities/events and several typed fields are dropped |
| Capability-gated Lua host access | sandbox construction | `register_host_apis`, filesystem/process/platform APIs | filesystem and OS subprocesses | workspace traversal only plus broad fixture | Active; workspace/result/JSON/log ungated; process capability unused by v2 |
| Manifest-trigger execution | public library call | `ScriptEngine`, `Trigger`, `ScriptManifest` | local manifest/scripts | predicate tests only | Implemented, repository-locally uncalled |
| Event-driven script dispatch | public library call | `EventDispatcher`, `ScriptEvent`, `create_event_channel` | Tokio MPSC/blocking pool | none | Implemented, repository-locally uncalled; successful results discarded |
| Signed script bundle validation | engine/updater construction | `ScriptBundleVerifier` | embedded CI key, manifest/signature files | none | Partial: active v2 bypasses; known callers ignore false; Lua bytes unsigned |
| Remote script updates | public library call | `ScriptUpdater::check_and_update` | HTTP, tar.gz, filesystem overlay | none | Implemented, repository-locally uncalled; non-atomic/no rollback |

## Endpoint core DLP templating traceability

| Feature | Entry point | Primary symbols | Data/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| Mandatory DLP justification popup | `obtain_justification_blocking` | `invoke_tauri_on_main_thread`, `TauriContext`, `alert.html`, `log_dlp_decision` | original text/detections, local webview, oneshot | model highlighting only | Active; default returned on close/timeout/cancel/queue rejection |
| Informational block/prompt notices | `spawn_non_blocking_prompt` | `block.html`, `prompt.html`, same adapter/FIFO | local or broker IPC, webview | none | Active; detached from request but core-classified blocking; double-hide can skip next queued waiter |
| Sensitive-text highlighting | `ContentConfigBuilder::build` | `ContentConfig::build`, `escape_attr` | transient HTML/event | five ASCII unit tests | Active; raw body HTML and Unicode-offset panic concern |
| Popup FIFO and pagination | context receiver | `build_context_and_launch_window`, `display_next_queued_popup`, `get_queue_info` | unbounded ingress + singleton + 30 waiting | none | Active; alert counter only; block/prompt double-advance defect |
| Runtime template discovery | `TauriContext::initiate_tauri` | Tera, `SENTINEL_DLP_TEMPLATE_DIR`, platform globs | installed filesystem HTML | none | Active; requires `alert.html`; ACL/integrity unresolved |
| Legacy queue UI | external selection of `index.html` only | obsolete `get_dlp_queue`/`submit_justification` calls | Tera/webview | none | Dead-code candidate/incompatible |

## Endpoint core build/test/decompression traceability

| Feature/capability | Entry point | Primary symbols/files | Data/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| Core library export | Cargo dependency | `core/src/lib.rs`, `core/Cargo.toml` | Rust callers and `cdylib`/`rlib` products | subsystem-specific | Active; decompression omitted, scripting optional |
| DB gRPC transport | `grpc_server` build feature | `build::main`, protobuf, `ipc::{grpc,server,client}` | generated protobuf/Tonic transport | none in checked CI | Default-off and statically incompatible (`table`/`schema_id`) |
| Recursive archive expansion | no compiled entry | `Extractor`, five strategies, helpers | target filesystem, ZIP/7z/RAR/TAR/compress-tools | two excluded fixture tests | Dead-code candidate; root module commented |
| Alert performance measurement | two Criterion targets | complex/string benchmark groups | temp SQLite/global alert queues | none | Registered but compile-incompatible legacy code |
| Proxy service diagnostics | two Cargo examples | example `main` functions | default graph; second starts child proxy | none | Developer-only; spawn example has no cleanup |
| Core integration suite | `cargo test -p sentinel-core` only | five direct test files | process environment, default graph, Vault filesystem, child services | 91 direct tests | Not run by checked CI; extensive stale/nonisolated coverage |
| Shared core test fixtures | no discovered parent | `core/tests/common/**` | temp dir, environment, legacy wrappers | 12 internal | Undiscovered/dead-code candidate |

## System monitor feature-to-code traceability

| Feature | Entry point | Primary symbols | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| process application discovery | `process_monitor::run` | platform enumerators, `ProcessTable`, `Correlator` | OS process table, `EntityStore` | unit-heavy, no full runtime test | active macOS/Windows; exit does not deactivate entity |
| process-map resolution | orchestrator/start refresh | `default_process_map`, `fetch_process_map`, `update_process_map` | embedded JSON + backend | mapping tests | active; successful empty backend replaces defaults |
| Lua AI-artifact discovery | `scanner::run` | walker, executor, converter, 7 scripts/4 libs | user files/workspaces | fixture + host-dependent tests | active but lossy; manifest/signing bypassed |
| package discovery | `pkg_scanner::run` | npm/Cargo/Go `discover` | bin dirs, metadata, child tools | helper unit tests | active; only three ecosystems |
| snapshot recovery | orchestrator load/save | `save_snapshot`, `load_snapshot` | one JSON file | one snapshot test | active; no migration/version enforcement |
| Persona bootstrap/refresh | `init_persona` | Persona IPC/fetch/update/listener | local IPC broker | IPC parsing tests | active hard dependency; unbounded retry |
| kill-switch startup gate | monitor `main` | kill-switch listener/atomic | local IPC broker | partial module tests | active but time-racy/fail-open; disable does not trigger stored shutdown sender |
| app canonical-ID resolution | five-second ingest loop | `resolve_app_ids` | app-add backend route | unit mappings | active |
| entity ingest | five-second ingest loop | `sync_entities`, `to_discovered_entity` | gzip HTTP backend | unit serialization/mappings | active; zero batch panics |
| governance delta | delta loop | `poll_delta` | HTTP/backend, pending governance | no direct delta test | active whole-response polling |
| Application enforcement | `Enforcer::run` | PID matching, actions, notifier, auditor | processes, template IPC, alert HTTP | helper/unit only | active for Application only |
| Cursor/Claude hook installation | `HookManagerService::run` | registry, installer, integrity, templates | IDE JSON, copied binaries, filesystem watch | substantial unit tests | active; replaces whole hooks object |
| hook policy evaluation | thin client → IPC → evaluator | `HookIpcServer`, `SessionQueue`, `ActivityEvaluator` | local socket/pipe | parser/queue/response tests | placeholder: always Allow |
| prompt activity telemetry | evaluator flush | `ActivityBatcher` | memory queue + activity HTTP | no end-to-end server contract | active best effort; drops on overload/failure |
| DLP detection | exported `DetectionClient::detect` | cache/stream/types | DLP HTTP | module tests | Dead-code candidate: no production caller |
| automated E2E harness | design document | none | proposed mock backend/fake app | none | Documentation-only |

## Template service feature-to-code traceability

| Feature | Entry point | Primary symbols | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| protocol-only library | `src/lib.rs` | `ipc_messages_inner`, public re-export | compile-time feature boundary | serialization tests; System Monitor consumer | active |
| process startup/supervision | `main` / core service wrapper | runtime, channels, `initiate_tauri` | environment, files, Tauri | none | active; several panic/normal-exit failure modes |
| kill-switch gate/shutdown | `start_kill_switch_listener` | atomic/query/listener/apply state | local pinned broker | none | active; startup time-racy/fail-open |
| template registry | `TemplateRegistry::load` | defaults, simple/backend parsers | two optional local JSON files | conversion tests | active; no backend HTTP load |
| regular Block/Justify popup | `handle_render` | Tera, `PaginationState`, regular window | in-memory state/WebView | fragment/state tests only | active; title dedup loses later request lifecycle |
| notification popup | `handle_render` | Tera, `NotificationPaginationState`, notification window | in-memory state/WebView | fragment/state tests only | active; dedup/source and dismiss-all losses |
| queue overflow | render handler | two FIFOs, Closed responses | memory/IPC | regular bound test | active; queued sources discarded |
| user decisions | Tauri commands/browser | submit/dismiss/timers | response channel/broker | none | active; unknown IDs use fallback target |
| broker dismiss/status | handler | regular remove/status | regular state/window only | none | partial; omits notification/queue semantics |
| theme/original/header/options | handler context | sanitization/context maps | rendered fragments | raw context/fragment tests | incomplete; many fields unused by committed templates |
| custom backend-shaped templates | registry file overlay | `BackendTemplate*`, converter | local JSON only | substantial mapping tests | active local import; documented network loading absent |
| build/package/install | root scripts/core wrapper | Cargo/Tauri build, staging, environment | OS packages/supervisor | file checks only | active script paths; subtree build not run here |

## Email-discovery feature-to-code traceability

| Feature | Entry point | Primary symbols | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| service-mode user discovery | Persona `run_local_discovery` | `discover_via_subprocess`, helper `main` | user files, platform session/process | no executable E2E | active when service-mode fallback reached |
| nine-source discovery reuse | core frame wrapper | JoinSet over OS/mail/browser/Teams | transient candidate vector | one host smoke test | active; source failures suppressed |
| framed candidate handoff | helper `send_frame` / parent `read_frame` | u32 BE + JSON | fixed Unix socket/named pipe | Unix round-trip only | active; 1 MiB parent cap |
| user-session launch | platform ProcessSpawner | launchctl asuser / CreateProcessAsUserW | OS tokens/environment | none for helper flow | active; Windows config env omitted |
| parent timeout/recovery | `discover_via_subprocess` | 30 s timeout, kill, detached reap | process/socket | none | active; read/timeout becomes empty success |
| build/package availability | workspace/builders/installers | package/default member and binary lists | release artifacts | no CI invocation | partially evidenced; distribution/QA omission unresolved |

## Diagnostics feature-to-code traceability

| Feature | Entry point | Primary symbols | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| structured producer API | core `diag_*!` macros | core facade, `DiagnosticPayload::new`, `DiagnosticsSender` | process global + broker | core pre-init test only | active in agent/proxy |
| broker event forwarding | `DiagnosticsSender::start` | handshake, targeted Event, lifecycle heartbeat | unbounded MPSC + pinned broker | none | active; drops on failure |
| centralized receiver | binary `main` | `DiagnosticsReceiver::run`, dispatch handler | broker → local queue | none | implemented/built; startup unresolved |
| memory/file buffering | `sentinel_diagnostics::init` | `run_worker`, `Storage`, `RingBuffer`, `LogFile` | memory + `.log`/`.sent` | one success-cycle unit test | active when receiver/direct caller starts it |
| OpenSearch export | worker timer | `Sender::send_batch` | Bulk HTTP to diagnostics index | weak live integration test | active; ignores Bulk item failures |
| lifecycle telemetry | IPC sender | `ServiceLifecycleEvent`, wildcard message | broker | serde Started test | active for started/heartbeat/stopped; crashed unused |
| Batch receive | receiver dispatcher | `DiagnosticsMessage::Batch` | broker payload vector | serde only | implementation-only; no producer found |
| local analytics environment | `setup.sh` / binary auto-start | Compose services/template/saved objects | Docker/OpenSearch/Dashboards | syntax only | developer tooling; security disabled |
| build/package artifact | Cargo/builders/installers | build script and companion lists | profile/package filesystem | checked CI builds only | binary staged; Docker directory staging unresolved |

## Endpoint infra feature-to-code traceability

| Feature | Entry point | Primary symbols | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| platform selection | `select_platform_services` | `MacOSServices`, `WindowsServices`, `LinuxServices` | compile-time target cfg | object/selector tests | macOS/Windows active; Linux factories panic |
| service binary lookup | core process/discovery | resolver trait and two adapters | executable directory, install paths, PATH | 10 target tests | active macOS/Windows; no name validation |
| ordinary child lifecycle | process spawner | Unix/Windows spawner and handles | OS child process | 12 ordinary tests | active; immutable liveness can be stale |
| interactive-user child | service-mode spawner branch | launchctl/pgrep or WTS/token/native APIs | console/RDP session, credentials | none | active; target binding/env gaps |
| crash child containment | Windows spawn | global Job Object helpers | process-lifetime kernel handle | none | active best-effort; fails open |
| orphan cleanup | core pre-spawn | Unix/Windows stale-child scanners | system process table/signals | none | active best-effort basename heuristic |
| standard IPC addressing | core process spawner | `IpcAddress`, address managers | `/tmp` socket or pipe name | basic format tests | active naming; unsanitized service input |
| standard IPC client | optional probe | Unix channel/factory, Windows stubs | OS byte stream | weak/no round trip | macOS implemented; Windows placeholder |
| standard IPC server | external concrete use | `IpcServer`, `UnixSocketServer` | Unix listener/path | bind-only test | dead-code candidate in checked products |
| device-ID hashing | heartbeat helper | `hash_data` | in-memory bytes | no direct test | active SHA-256/hex utility |

## Endpoint proxy feature-to-code traceability

| Feature | Entry point | Primary symbols | State/external systems | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| explicit HTTP proxy | TCP listener | `run_http_server`, `handle_request`, `forward_request` | reqwest client, circuit map, request context | handler/integration helpers | active |
| transparent TLS MITM | HTTPS listener / CONNECT | `handle_connect`, `handle_tls_stream`, `CertificateManager` | local CA/key, per-host certs, upstream TLS | cert helper tests | active; temp/cert cleanup gaps |
| WebSocket relay | upgrade request | `handle_websocket` | two upgraded streams and detached copy tasks | structural tests only | active; no timeout/proxy/circuit bound |
| body extraction | request handler | `capture_body_with_streaming`, transform pipeline, PDF/Office/OCR extractors | memory/temp files/OCR cache | unit/integration/OCR tests | active; whole-body and lossy paths |
| DLP analysis | body evaluation | `DlpEngine`, heuristic/AI/remote analyzers | findings, remote service/model config | analyzer/helper tests | active/feature-dependent; error paths allow |
| policy enforcement | proxy startup/request | core `init_policy_engine_background`, `evaluate_event` bridge | remote controls API, in-memory policy set | core policy tests | active fail-open boundary |
| justification UI | Ask action | templating IPC, native eframe, Tauri adapter | broker or local popup queue | no end-to-end response-correlation test | active; failures map to default |
| DLP alert delivery | decision path | alert payload builder/core sender | diagnostics/alert broker/backend | payload tests undiscovered | active; caps/truncation apply |
| kill-switch response | broker listener | `start_kill_switch_listener` | process-global state/broadcast | helper tests | active; broker failure behavior documented separately |
| health endpoints | health listener | `handle_health_request`, `HealthMonitor` | in-memory counters/state | inline tests | active, unauthenticated; multiple settings inert |
| Windows TCP interception | redirector feature | `WinPacketRedirector`, WinDivert workers | flow DashMaps, process tables | parser/tracker tests | active; shutdown/cleanup defects |
| Windows UDP interception | redirector UDP clause | `process_udp_packet`, `UdpAttributionCache` | UDP owner table/cache/tracker | cache/tracker tests | active block/pass subset; config policy mismatch |
| macOS TCP interception | Network Extension | Swift provider, Rust relay/listener, Objective-C manager | Unix control + localhost TCP | model/helper tests | active with startup/auth/attribution gaps |
| macOS UDP interception | Network Extension UDP rule | Swift UDP branch | NE UDP flow | dormant helper tests | partially implemented: active branch rejects monitored UDP |
| extension management | proxy CLI/subcommands | `sysext_manager`, activation FFI | `systemextensionsctl`, codesign, NE preferences | limited parser tests | active macOS administrative path |
| production package/sign | shell scripts | `build-and-notarize.sh`, Swift build | Xcode, certs, sudo, notarization | no automation test | operator tooling; external credentials required |

The complete per-file implementation status and contradictions are in the four proxy chapters linked from [the module reference](06-module-and-file-reference.md).
