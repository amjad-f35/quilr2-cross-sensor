# 17 — Dependency and Call Graph

## Dashboard/API major flows

```text
POST discovered-apps
→ TenantAuth → GzipDecompress → IngestHandler.IngestApps
→ IngestService.Process
→ BatchWriter.Add(state) → BulkInsertEntityState → endpoint_entity_device_state
→ BatchWriter.Add(mapping) → BulkInsertMapping → endpoint_id_mapping
→ BatchWriter.Add(edge) → BulkInsertEdges → endpoint_entity_edges
→ SettingsRepository.GetSettingsBulk → endpoint_entity_settings
→ IngestResponse
```

```text
GET dashboard assets
→ PortalAuth → DashboardHandler.ListAssets
→ DashboardService.ListAssets
→ AppStateRepository.ListAssets → endpoint_entity_device_state
→ OverlayCatalog → endpoint_app_catalog
→ OverlaySettings → endpoint_entity_settings
→ PaginatedAssets
```

```text
PUT dashboard policy
→ PortalAuth → TenantPolicyHandler.Put
→ TenantPolicy.Validate / embedded policy catalog
→ TenantPolicyRepository.Get (If-Match precheck)
→ TenantPolicyRepository.Upsert → endpoint_tenant_policy
→ TenantPolicy response with server version
```

```text
GET conversation detail
→ PortalAuth → ActivityHandler.GetConversation
→ ActivityService.GetConversation
→ ActivityRepository.GetConversationTurns → endpoint_activity_log
→ HookEventsRepository.ListByConversation → endpoint_hook_events
→ ConversationDetail
```

The complete registration table and indirect writer callback behavior are in [Dashboard/API deep reference](06-dashboard-api.md).

```text
Browser /login?token
→ LoginPage → decodeJwt → buildIdentityFromJwt
→ localStorage(token + identity) → AuthProvider user
→ ProtectedRoute → routed page
```

```text
DashboardPage
→ useAssets/useKpis → api.request
→ PortalAuth → DashboardHandler → DashboardService → AppStateRepository
→ ClickHouse → React Query cache → DiscoveryTable
```

```text
Settings DLP selection
→ useUpdateDlpRule optimistic cache mutation
→ module-global scheduler → putPolicy(If-Match)
→ TenantPolicyHandler.Put → TenantPolicyRepository
→ response echo or conflict invalidation
```

The complete frontend import/runtime surface is in [Dashboard frontend deep reference](06-dashboard-frontend.md).

## Endpoint scripting flows

```text
System Monitor v2 scanner::scan_cycle
→ scanner::executor::execute_script
→ std::fs::read_to_string
→ sentinel_core::scripting::sandbox::create_sandboxed_lua
→ remove_dangerous_globals
→ configure_require_path
→ set_timeout
→ register_host_apis
  → host_api::{register_fs_api, register_platform_api,
     register_result_api, register_json_api, register_log_api,
     register_workspace_api}
→ set scan_context
→ Lua::load(...).exec()
→ ResultCollector::take_result
→ scanner::converter::convert_results
→ EntityStore::{find_by_name/touch_and_enforce/upsert}
```

```text
ScriptEngine::new [no checked production caller]
→ ScriptBundleVerifier::verify_bundle
  → verify_ed25519 → decode_pem_public_key
→ ScriptEngine::load_manifest → ScriptManifest::from_file
→ run_trigger → scripts_for_trigger → trigger_matches/url_matches
→ execute_script → sandbox factory → collector
```

```text
ScriptUpdater::check_and_update [no checked caller]
→ reqwest::get → response.bytes
→ extract_tar_gz → tar::Archive::unpack
→ ScriptBundleVerifier::verify_bundle [false discarded]
→ copy_dir_contents → read_current_version
```

Indirect relationships: Lua strings register callbacks into Rust; sandbox capability strings control table membership; Serde derives map manifest/result fields; the timeout hook calls Rust every 1,000 instructions; `EventDispatcher::run` submits detached callbacks through Tokio's blocking pool.

## Endpoint DLP templating flows

```text
Mandatory DLP policy action
→ proxy::dlp::obtain_justification_blocking
→ [service] templating_ipc_client → broker → templating_engine_main::handle_request_concurrent
  OR [integrated] direct adapter
→ dlp::tauri_ui::invoke_tauri_on_main_thread
→ std::mpsc<JustificationContext>
→ TauriContext::build_context_and_launch_window
→ ContentConfigBuilder::build → ContentConfig::build
→ AppState → alert-window → render_alert_ui → Tera::render
→ alert.html::sendDecision → log_dlp_decision
→ oneshot Some/None → adapter default collapse
→ policy allow/block and alert logging
```

```text
Policy Block/Prompt informational action
→ spawn_non_blocking_prompt → detached task
→ same adapter [always resp_sender Some]
→ same blocking FIFO despite “non-blocking” label
→ block.html/prompt.html log_dlp_decision
→ display_next_queued_popup
→ template invokes hide_alert_window again
→ next queued done_tx receives None and queue advances again
```

```text
TauriContext::initiate_tauri
→ environment/platform/fallback template globs
→ Tera::new + require alert.html
→ manage AppState
→ context receiver + shutdown threads
→ seven-command handler
→ generate_context(core config + UI asset)
→ Tauri event loop
```

Indirect relationships include Tauri macro command registration/deserialization, Tera/Serde exposure of crate-private fields, browser event callbacks, policy-to-template selection, and pinned-broker routing. See [the complete templating call model](06-endpoint-core-templating-engine.md).

## Core build and dormant archive graphs

```text
Cargo compiles sentinel-core
→ core/build.rs::main
  → tauri_build::build [always]
  → [grpc_server only] protoc_bin_vendored::protoc_bin_path
  → tonic_build::configure(build_server + build_client)
  → compile_protos(core/proto/db_service.proto)
→ core/src/ipc/grpc/mod.rs::include_proto!("quilr.db.v2")
→ handwritten IPC server/client [expects schema_id; generated schema defines table]
```

```text
core/src/lib.rs
-. commented `mod decompression` [no compiled edge]
  → decompression/mod.rs re-export Extractor
  → Extractor::extract
    → tokio::time::timeout
    → spawn_with_cpu_limit → CPU_SEMAPHORE → spawn_blocking
    → extract_archive_recursive
      → get_strategy(MIME)
      → detect_root
      → derive_output_dir
      → strategy.extract
      → shared result vector
      → magic_bytes::get_file_type
      → recursive child archive (depth < 5)
```

Strategy dependency direction:

- ZIP → `fs::read` + `zip::ZipArchive` + Rayon + local lexical path/copy helpers;
- 7z → `sevenz_rust` + local helpers;
- RAR → `unrar` delegation plus a computed lexical path;
- TAR/gzip/bzip2/zstd → decoder → `tar::Archive` + local helpers;
- fallback → optional `compress_tools` in an OS thread → `WalkDir`, bypassing local path helper.

Development-only graphs:

```text
criterion_main! → registered benchmark groups → legacy AlertPayload API [compile-incompatible]
cargo example debug_proxy_startup → ServiceManager::from_defaults → graph inspection only
cargo example test_proxy_spawn → LifecycleManager::start_service(proxy) → real child; no stop
cargo test -p sentinel-core → five direct integration crates → 91 tests
core/tests/common → no `mod common` edge → 12 tests undiscovered
```

Exact per-symbol lexical callees and reachability qualification are in [the final core semantic reference](07-symbol-reference/endpoint-core-crate-shell-tests-and-decompression.md).

## System monitor major call graphs

```text
sentinel-monitor-v2::main
→ initialize_logging → Config::load
→ setup_shutdown_signal + kill_switch listener
→ fixed six-second gate
→ Orchestrator::run
→ persona::init_persona → broker IPC
→ ContextManager + snapshot::load_snapshot + process maps
→ {process_monitor, scanner, pkg_scanner, Enforcer, delta, app-id/ingest,
   snapshot timer, Persona refresh, HookManager, process-map refresh}
```

```text
OS process → ProcessEnumerator::enumerate → ProcessTable::diff
→ Correlator::correlate → EntityStore::{upsert,touch_and_enforce}
→ ChangeEvent → Enforcer::run
→ PID rescan → PlatformActions::{quit,terminate,force_kill}
→ Notifier → TemplateClient → pinned IPC broker/template service
→ Auditor → alerts HTTP
```

```text
configured marker → walker::resolve_matches → executor::execute_script
→ core::create_sandboxed_lua → detector + required Lua libraries
→ ScriptResult → converter::convert_results → EntityStore
→ app_id::resolve_app_ids → sync_entities → gzip ingest
← poll_delta → apply/buffer governance → GovernanceUpdated → Enforcer
```

```text
IDE → thin-client stdin parser → raw JSONL
→ blocking-event filter → ipc_client framed JSON
→ HookIpcServer → SessionQueue → ActivityEvaluator (always Allow)
→ HookResponse → IDE adapter
→ completed prompt → ActivityBatcher → activity HTTP
```

Dynamic relationships checked include Cargo binary registration, `#[cfg]` platform implementations, Tokio task spawns, broadcast subscriptions, template trait factory, static hook registry lookups, Lua `require`, host API registration, environment configuration, and manual test scripts. The full per-declaration lexical graph remains in the 1,054-entry catalog.

## Template service dependency and call graphs

```text
OS/Cargo → template-service::main
→ tracing + TemplateEngineConfig::load + TemplateRegistry::load
→ Tokio runtime → {Ctrl+C task, kill-switch listener, run_ipc_loop}
→ ui::initiate_tauri
→ Tera::new + Tauri managed AppState
→ {render-command thread, shutdown thread, ten registered commands}
→ Tauri event loop
```

```text
pinned broker BrokerMessage::Message
→ client::handle_broker_message (Serde + claimed source)
→ std::mpsc::Sender<InternalRenderCommand>
→ UI render thread → handler::handle_command
→ handler::handle_render
→ TemplateRegistry::lookup → Tera::render
→ PaginationState::add_template OR NotificationPaginationState::add_notification
→ ensure_window / ensure_notification_window
→ index.html invoke(get_current_*) → innerHTML + event bindings/timer
→ invoke(submit/dismiss*) → ui::commands
→ ipc::send_response → global unbounded response channel
→ run_ipc_loop → BrokerMessage::message(target)
```

```text
capacity full → state::enqueue(TemplateRenderRequest only)
→ active completion/dismiss → dequeue_next
→ handler::handle_render(queued_request, completed_request_target)
→ queued response routed under completed target
```

```text
duplicate title OR duplicate (criticality,title,description)
→ mutate/select first active slot
→ later request_id/source not stored
→ no independent response path for later request
```

```text
system-monitor::Enforcer
→ Notifier → TemplateClient (bounded 64, fire-and-forget)
→ template_engine::ipc::messages public re-export
→ pinned broker target template_engine_service
→ this service; responses return to System Monitor and are ignored by its sender loop
```

Dynamic/framework edges checked include Cargo binary/build-script conventions, `cfg(feature = "ui")`, hidden path-module re-export, Tauri command macro registration, Tauri managed-state lookup, browser event listeners/invocations, Tera template-name lookup, Serde tagged enums/aliases/flattening, OnceLock globals, Tokio task spawns/select, standard threads/channels, environment path resolution, core service-factory registration, builder/installer string references, and ignored Cargo test convention. The exact 172-declaration lexical catalog and semantic qualification are [linked here](07-symbol-reference/endpoint-template-service-semantic.md).

## Email-discovery call graph

```text
DiscoveryCoordinator::discover_all
→ IPC discovery unavailable/mock path
→ DiscoveryCoordinator::run_local_discovery
→ SENTINEL_SERVICE_MODE present
→ spawned_discovery::discover_via_subprocess
→ IpcAddress::for_service("email-discovery")
→ bind_server(fixed path)
→ BinaryResolver + ProcessSpawner(ProcessConfig run_in_user_space)
→ email-discovery::main
→ Args::parse → CLI/env path
→ core::run_local_discovery_as_ipc_frame
→ core::run_local_discovery
→ JoinSet{OS, Outlook, Apple Mail, Thunderbird, Chrome, Firefox, Edge, Safari, Teams}
→ serde_json + u32 BE frame
→ email-discovery::send_frame
→ parent accept_and_read → read_frame(max 1 MiB + Serde)
→ DiscoveryCoordinator::deduplicate_and_sort
```

Indirect edges checked include Clap derive entry, Tokio main/cfg platform implementations, core Cargo feature selection, IpcAddress platform cfg, binary resolver, `run_in_user_space` dispatch, macOS launchctl/PID convention, Windows active-session token/CreateProcessAsUserW, frame Serde, builder/installer string lists, and Cargo test conventions. The helper has only three local declarations; its meaningful logic deliberately resides in core.

## Diagnostics dependency and call graph

Active producer path:

```text
agent::init / proxy::platform::common
→ sentinel_core::diagnostics::init_ipc(process_id)
→ sentinel_diagnostics::DiagnosticsSender::start
→ sender_loop
→ connect_and_forward
→ DuplexChannel::with_config("ipc_light_broker")
→ BrokerMessage::register(process_id)
→ DiagnosticsMessage::Event
→ BrokerMessage::message(process_id, "diagnostics_service", json)
→ pinned broker
```

Implemented receiver/export path:

```text
sentinel-diagnostics::main
→ ensure_opensearch
→ sentinel_diagnostics::init(Config::default)
→ tokio::spawn(run_worker)
→ DiagnosticsReceiver::run
→ connect_and_run / dispatch_message
→ main handler
→ sentinel_diagnostics::emit
→ unbounded local MPSC
→ Storage::write / read_batch
→ RingBuffer / LogFile
→ Sender::send_batch
→ reqwest POST OpenSearch Bulk
→ Storage::mark_sent
```

Product registration trace:

```text
ServiceManager::new_with_defaults
→ get_default_services
→ diagnostics ServiceDefinition is commented out

deployment.py DEFAULT_RUNTIME_SERVICE_DEPS
→ still lists sentinel-diagnostics.service
```

Dynamic/registration searches covered Cargo workspace/member/build-script/binary conventions, feature cfgs, macro expansion routes, OnceLocks, Tokio spawn/select, Serde tags, broker registration/targets, core service factories/defaults, process-spawner references, builder/package/manifest/uninstaller names, Docker resource paths, CI commands, and test discovery. See [the semantic call reference](07-symbol-reference/endpoint-diagnostics-semantic.md).

## Endpoint infra call graph

Process service:

```text
ServiceManager / ProcessInstancedSpawner::spawn
→ IpcAddress::for_service
→ select_platform_services
→ IpcAddressManager::prepare
→ BinaryResolver::resolve_service_binary
→ ProcessConfig builders
→ ProcessSpawner::kill_stale_children
→ ProcessSpawner::spawn
→ ordinary Command OR interactive-user platform path
→ Box<dyn ProcessHandle>
→ custom IPC: core NoOpIpcChannel
  standard IPC: select_platform_services → IpcChannelFactory::create_channel
  → UnixSocketChannel OR Windows NotImplemented → core NoOpIpcChannel
```

Email discovery:

```text
discover_via_subprocess
→ IpcAddress::for_service("email-discovery")
→ core async bind_server (not infra IpcServer)
→ select_platform_services
→ BinaryResolver::resolve_service_binary
→ ProcessSpawner::spawn(ProcessConfig run_in_user_space=true)
→ macOS launchctl/pgrep OR Windows WTS/token/CreateProcessAsUserW
→ core async accept/read frame
```

Windows child containment:

```text
WindowsProcessSpawner::spawn / native spawn
→ global_job_object (OnceLock)
→ CreateJobObjectW + SetInformationJobObject(KILL_ON_CLOSE)
→ assign_pid/handle_to_job_object
→ warning-only fallback on any containment failure
```

Repository-wide searches found no production caller for `ProcessSpawnerFactory`, `spawn_service`, `IpcServer`, or `UnixSocketServer`. See [the complete infra dependency analysis](06-endpoint-infra-platform-runtime.md) and [symbol reference](07-symbol-reference/endpoint-infra-platform-runtime.md).

## Endpoint proxy call and dependency graph

Primary HTTP flow:

```text
main
→ platform::{tauri|macos|windows}
→ platform::common::run_proxy
→ run_http_server / run_https_server
→ handle_request
→ RequestContext + capture_body_with_streaming
→ evaluate_body / handle_dlp_for_ctx
→ extractors + DlpEngine + core policy_engine::evaluate_event
→ optional templating/native/Tauri justification
→ alert_payload/core alert sender
→ forward_request/get_response OR generated block/error response
```

Transparent TLS:

```text
redirected TCP
→ original-destination/process state
→ handle_connect or handle_tls_stream
→ CertificateManager host certificate
→ rustls server accept
→ Hyper HTTP service
→ same request/DLP/forward path
```

Windows packet path:

```text
WinPacketRedirector::run
→ SocketLayer attribution thread + N NetworkLayer worker tasks
→ packet_processing_loop
→ NetworkUtils::parse_packet
→ process_tcp_packet / process_udp_packet
→ ProcessPolicy or UDP-specific rule
→ C2S/S2C/process maps
→ WinDivert address/port rewrite + checksum + send
→ Rust proxy listener
```

macOS active flow:

```text
run_packet_redirector
→ NetworkExtensionRedirector::run
→ sysext::run
→ Objective-C load_transparent_proxy_config (starts extension)
→ Rust start_listener (Unix control + relay + heartbeat)

Swift TransparentProxyProvider::handleNewFlow
→ ProcessAttribution
→ open NE TCP flow
→ AsyncSemaphore(200)
→ localhost relay connect + length-prefixed JSON metadata
→ bidirectional relay
→ Rust handle_flow_relay_connection
→ attribution record + proxy HTTP handler
```

Registration/dynamic relationships:

- Cargo features and target `cfg` select redirectors/extractors/OCR/private SDK.
- `main.rs` declares a private duplicate module tree instead of using only the library crate.
- state uses `OnceCell`/global concurrent maps for DLP, clients, health, circuits, config, and attribution.
- pinned broker relationships are registration/address driven and include Persona, diagnostics, alerting, kill switch, and templating.
- Swift Network Extension lifecycle is framework-invoked through `NETransparentProxyProvider`; Objective-C bridges export C symbols linked by `build.rs`.
- Current Swift does not call the SCM_RIGHTS `tcp_redirect` path or UDP forwarder; those edges are retained protocol/code, not active-flow edges.

External dependencies of architectural importance include Hyper/hyper-util, reqwest/rustls, Tokio, rcgen, serde, DashMap, eframe/Tauri, WinDivert/Windows APIs, Apple NetworkExtension/SystemExtensions/Foundation, PDF/Office libraries, `uni-ocr`, and the external optional Quilr SDK. Exact manifest versions are in the raw file/symbol records and package chapter.

## Endpoint delivery and update call graphs

Current workflow-to-package flow:

```text
GitHub Actions workflow_dispatch / push
→ external precheck checkout and local wrapper
→ scripts/builder/build.{sh,ps1}
→ cargo build for workspace executables
→ signing/notarization helpers
→ installer/package assembly
→ checksums and update.json metadata
→ uploaded Actions artifact
```

The final upload is verified. No checked job publishes to a production CDN/package repository or starts a rollout.

Updater flow:

```text
sentinel updater invocation
→ acquire updater lock file
→ fetch update metadata/archive
→ verify metadata signature and archive digest
→ extract to staging
→ stop selected services/processes
→ replace installed files
→ attempt restart and cleanup
→ success/error return
```

This is not a single filesystem transaction. Exact platform branches, backup behavior, version checks, and failure gaps are traced in [the delivery chapter](06-endpoint-build-release-install-and-update.md).

Installer flow:

```text
operator / MDM runs platform installer with privilege
→ parse mode/flags and locate package
→ create application/support directories
→ copy executables/assets/configuration
→ optionally import trust/signing material
→ register launchd jobs or Windows services
→ start components and print status
```

The Intune generator is a generator edge, not the deployment itself:

```text
intune_mdm_deploy.py
→ read JSON/default configuration and certificate/key files
→ emit macOS .mobileconfig containing the public certificate
→ emit Windows PowerShell expecting an external PFX at a fixed path
→ emit broad store-enumeration verification scripts and a guide
```

The private key is read and length-logged by the generator but is not embedded in either generated deployment payload. No PFX-generation/copy edge exists in that module.

Support-server relationships:

```text
operator → tools/local_cdn.py → unauthenticated in-memory switch/status/file routes
operator → tools/mock_user_details_server.py → loopback user/device JSON controls
tests/operator → test-server Python or Rust server → programmable HTTP response state
```

No product runtime caller was found for these support servers. They remain tools/test utilities rather than deployed product services.
