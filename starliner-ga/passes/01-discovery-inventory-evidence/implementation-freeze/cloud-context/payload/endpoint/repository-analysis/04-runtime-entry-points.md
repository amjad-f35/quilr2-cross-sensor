# 04 — Runtime Entry Points

## Endpoint build, deployment, update, and test-support entries

| Entry | Invocation | Initialization / runtime model | Shutdown/failure |
| --- | --- | --- | --- |
| Current release workflow | manual `.github/workflows/build.yml` dispatch | validate/materialize secrets → platform builder → optional compile/embed/sign → update manifest → collect/upload | no tests; path defects can collect originals/stale metadata; any-file check only |
| Windows builder | `scripts/builder/sentinel_builder.ps1` | menu/noninteractive dispatch → named Cargo builds → nine-binary/resource ZIP → optional QA/embed/sign/update JSON | strict required binaries; signing writes separate `signed/`; secrets in subprocess arguments |
| macOS builder | `scripts/builder/sentinel_builder.sh` | Cargo/Swift → app/support staging → inside-out sign/notary → ZIP/update JSON | missing companions warn; Invalid/unclear notarization fatal; staple/assessment can warn |
| Windows distribution installer | compiled/direct `sentinel-endpoint.ps1` | local/CDN package → trust/env/network/service/schedule/install or signed update/rollback | nontransactional; first-update rollback backup is incoming package |
| macOS distribution installer | compiled wrapper or `sentinel-endpoint.sh` | local/CDN package → app/support/hooks/cert/extension/daemon/schedule | zip-safety function uncalled; health only sentinel; rollback omits broader state |
| Distribution uninstallers | compiled/direct platform script | stop → extension/driver/service → files/cert/env/network/schedule | Windows continues/warns; mac wrappers clobber every step return code to success |
| Local CI mapper | `scripts/ci/run_local.sh --mode ...` | validates and expands one workflow mode into builder commands | seven env labels conflict with three accepted downstream values |
| Alternate Python deployment | `python deployment/deployment.py` | special CA/profile paths work; ordinary path should preflight/extract/provision/install/service | ordinary path reads nonexistent `args.workspace_root` and fails before main try block |
| Old root build | `build.sh` / `build.ps1` | outer Cargo build → `build/build.py` second Cargo build → old manifest/sign/package | stale file manifest and signature/cert-path incompatibilities; signing can continue unsigned |
| Install checker | `tools/check_install.sh` | twelve platform-state groups → PASS/WARN/FAIL counts | always exits with final echo status, even with FAIL |
| Local CDN | `python tools/local_cdn.py --root ...` | unauthenticated 0.0.0.0 HTTP server with mutable filesystem root | single-thread; Ctrl+C; network peer can switch roots if exposed |
| Persona mock | `python tools/mock_user_details_server.py` | loopback HTTP server + interactive global flag mutation | single-thread; Ctrl+C/quit |
| Test server | Rust `TestServer::start` or direct Python | spawn/bind → control/message/fault endpoints | startup first-line read has no actual timeout; Unix stale cleanup replaces caller via `exec` |
| Root integration tests | documented Cargo commands | no runtime entry at this revision because root is a virtual workspace | undiscovered; 48 test cases plus 12 common helper tests are not compiled |

Exact paths, CLI/data inputs, package contents, and mode-specific failures are in [the delivery chapter](06-endpoint-build-release-install-and-update.md) and [the root/tools chapter](06-endpoint-root-tools-tests-and-documentation.md).

## Verified dashboard entry points

| Entry | Invocation | Initialization / runtime model | Shutdown/failure |
| --- | --- | --- | --- |
| API `cmd/server.main` | `/app/server` or `go run ./cmd/server` | Config → ClickHouse/table check → six writers → repositories/services/handlers → Chi | signal drain; see [API deep reference](06-dashboard-api.md#server-startup-and-shutdown) |
| API policy migration mode | `server --migrate-tenant-policy [--dry-run]` | ClickHouse scan/rewrite then exit | per-row failures logged but exit remains success |
| Schema runner `cmd/migrate.main` | `/app/migrate` | select PaaS/SaaS SQL tree, lexical DDL execution | first error exits 1 |
| User seed `cmd/seed.main` | `/app/seed` | insert and verify hardcoded development admin | first error exits 1 |
| Frontend `src/main.tsx` | browser loads Vite bundle | React root → QueryClient → AuthProvider → BrowserRouter | browser lifecycle; no explicit cleanup beyond component effects |
| Vite dev server | `npm run dev` | port 5173, proxies `/api` and `/ea` | process signal |
| Frontend production | Nginx container | static SPA plus API/EA proxy | Nginx process lifecycle |
| App-intel enrichment | `python enrich_apps.py` | dotenv → legacy ClickHouse read → concurrent `claude -p` batches → JSON overwrite | uncaught extraction/file errors are fatal; per-batch known failures become placeholders |
| App-intel loader | `python update_clickhouse.py` | load/filter JSON → create legacy catalog → truncate → insert → print checks | uncaught errors are fatal; no transaction restores a truncated table |
| Development stack | `docker compose -f docker-compose.dev.yml up` | ClickHouse → migrate → seed → API → frontend | Compose health/dependency/restart model |
| Production-like stack | `docker compose up` | externally provisioned ClickHouse → API health → frontend | API fails startup on database/table validation; no migration job |
| Jenkins image pipeline | Jenkins loads `Jenkinsfile` | external tag helper → parallel API/frontend builds → external registry pushes | external shared-library behavior and post-failure handling unresolved |
| GitHub security CI | pull request to `main`/`quilr-preprod` | calls external reusable workflow with inherited secrets | external workflow behavior unresolved |
| Local security prechecks | execute `.github/scripts/devsecops-precheck.sh` or `.ps1` | clone external scripts → Docker scanner/linter stages → summary/cleanup | findings are not propagated as aggregate process failure; cleanup is provenance-blind |

The operational details are in [the dashboard operations reference](06-dashboard-operations-and-documentation.md). IPC entry points are documented in their deep references. Endpoint-agent entry-point analysis is partially complete.

## Endpoint scripting execution entries

| Entry | Invocation | Initialization / runtime model | Shutdown/failure |
| --- | --- | --- | --- |
| Active v2 per-match Lua execution | `scanner::scan_cycle` calls `executor::execute_script` | read named script → fresh core sandbox with `fs.read`, `platform.info`, 10 s instruction-hook deadline → `scan_context` → synchronous exec → collector → converter/store | outer scanner logs error and continues; partial result discarded; cancellation cannot interrupt current script/host call |
| Public manifest engine | external/library call to `ScriptEngine::new`/`run_trigger`; no checked production caller | verifier call → manifest/eager sources → fresh VM per matching script, sequential order | per-script errors become results; invalid-signature false is ignored; no explicit shutdown |
| Public event dispatcher | external construction + `EventDispatcher::run`; no checked caller | 256-item MPSC receiver → detached `spawn_blocking` per event | channel close returns without joining submitted tasks |
| Public updater | external call to `ScriptUpdater::check_and_update`; no checked caller | bare HTTP GET → whole tar.gz → verifier call → recursive overlay | errors propagate, but copy can leave partial state; no rollback/reload |

Exact symbols and inputs are in [Endpoint Core Lua Scripting](06-endpoint-core-scripting.md).

## Endpoint templating/UI execution entries

| Entry | Invocation | Initialization / runtime model | Shutdown/failure |
| --- | --- | --- | --- |
| Integrated proxy Tauri mode | proxy `main` routes to `platform::tauri::main_tauri` when Tauri is enabled outside service mode | background proxy Tokio runtime + main-thread `TauriContext::initiate_tauri`; global context sender | proxy completion or kill-switch sends shutdown; service safety thread may force `exit(0)` after three seconds |
| Standalone `templating-engine` | Cargo binary and default `templating-engine.service` process | logging → kill-switch listeners → reconnecting broker loop/tasks → main-thread core Tauri loop | kill switch sends shutdown; channel disconnect also causes core exit; IPC loop itself reconnects every two seconds |
| Core Tauri runtime | direct public call to `TauriContext::initiate_tauri` | ordered filesystem template discovery → managed `AppState` → context/shutdown threads → seven commands → event loop | template exhaustion logs/returns; build panics; context disconnect leaves app running; shutdown disconnect exits zero |
| Webview bootstrap | `alert-window` opens bundled `core/ui/index.html` | invoke `render_alert_ui` → first-render `document.write` of Tera result → template-owned update listener | invoke/render failures attempt `hide_alert_window`; outer caller eventually defaults |

Exact startup sequences and both process shapes are in [Endpoint Core DLP Templating Engine](06-endpoint-core-templating-engine.md#entry-points-and-startup).

## Core build, development, and test entries

| Entry | Invocation | Initialization/runtime model | Shutdown/failure |
| --- | --- | --- | --- |
| Core Cargo build script | Any build that compiles `sentinel-core` | unconditional `tauri_build::build`; optional vendored-protoc/tonic generation | tonic generation panics on error; protoc lookup failure is ignored |
| DB protobuf generation | core build with `grpc_server` | generates client/server Rust to `OUT_DIR`, then `include_proto!` | checked generated `table` field disagrees with handwritten `schema_id`, so feature is statically incompatible |
| `debug_proxy_startup` example | explicit `cargo run -p sentinel-core --example debug_proxy_startup` | constructs defaults and prints service/dependency state | early returns print errors; starts no service |
| `test_proxy_spawn` example | explicit Cargo example run | starts real `sentinel-proxy.service` through lifecycle manager | no stop/supervisor cleanup in example |
| Two Criterion targets | explicit `cargo bench -p sentinel-core` | each initializes alerting and Criterion groups | statically uses removed `AlertPayload`/trait method; not runnable as checked |
| Five direct integration-test crates | `cargo test -p sentinel-core` | 91 tests; several can start current real services or write default Vault | not invoked by checked CI; many fail retired-default assertions |
| Decompression entry/tests | no current invocation | `Extractor::extract` source exists downstream of commented module edge | absent from compiled crate and test discovery |

Full invocation and reachability evidence is in [the core crate-shell chapter](06-endpoint-core-crate-shell-tests-and-decompression.md#reachability-summary).

## System monitor executable and worker entry points

| Entry point | Invocation | Initialization/downstream calls | Shutdown/failure |
| --- | --- | --- | --- |
| `system-monitor/v2/src/main.rs::main` | packaged `sentinel-monitor-v2` | logging → config → Ctrl+C/broadcast → kill-switch listener → fixed gate → `Orchestrator::run` | config fatal; kill-switch fail-open; orchestrator result propagates |
| `Orchestrator::run` | monitor main | Persona hard bootstrap, context, snapshot, maps, platform adapters, then ten tasks | cancellation joins ten handles without deadline, final snapshot best effort |
| `process_monitor::run` | orchestrator task | enumerate → diff → correlate → store/Rediscovered | logs enumerator failures and retries; sleep-aware |
| `scanner::run` | orchestrator task | resolve markers → direct Lua sandbox → lossy convert → store | HOME or top-level error ends task |
| `pkg_scanner::run` | orchestrator task | npm/Cargo/Go synchronous scans → store | external Go child has no timeout |
| delta/ingest loops | orchestrator tasks | governance pull; app ID then gzip ingest every 5 s | warn/retry; not power-gated |
| `Enforcer::run` | orchestrator task | store events + sweep + OS process control + popup/audit | disabled returns; power-aware; partial kill errors logged |
| `HookManagerService::run` | orchestrator task | deploy/merge/watch hooks, local IPC, session evaluator, activity batcher | disabled returns; child errors warn |
| Cursor `main` | IDE-spawned `sentinel-hook-client` | stdin JSON → JSONL → optional local IPC → Cursor JSON | read/parse/IPC defaults allow unless fail-closed env for IPC |
| Claude `main` | IDE-spawned `sentinel-claude-hook-client` | stdin JSON → JSONL → optional local IPC → JSON or exit 2 | same; Deny/Justify exits 2 |
| Cargo tests | `cargo test -p sentinel-monitor-v2` by convention | 283 declarations across unit/integration targets | no checked CI invocation; Rust unavailable locally |
| manual E2E shell | operator invocation only | Docker/local endpoints/build/start/stop/cleanup | start script targets `target/debug/sentinel`, not monitor binary |

Exact symbols and inputs are in [the semantic reference](07-symbol-reference/endpoint-system-monitor-v2-semantic.md).

## Template service entry points

| Entry point | Invocation | Initialization/downstream calls | Shutdown/failure |
| --- | --- | --- | --- |
| `template-service/build.rs::main` | Cargo build script | `tauri_build::build` only with `ui` | build-hook failure propagates through Cargo |
| `template-service/src/main.rs::main` | packaged `template-engine` or `cargo run -p template-engine` | tracing → TOML config → registry → Tokio → Ctrl+C/kill listener → fixed six-second gate → response channel/IPC → Tauri | disabled returns; runtime/Tauri `expect` panics; Tera init logs and returns success |
| `run_ipc_loop` | detached task from `main` | 3 s delay → broker connect/register → inbound/outbound select | cumulative ten-error limit; task exit does not stop UI |
| `start_kill_switch_listener_with_process_ids` | `main` wrapper | 5 s delay → one-shot query → persistent query/listen/reconnect | fail-open startup; unbounded reconnect; false transition exits Tauri through standard channel |
| `initiate_tauri` | blocking call from `main` | resolve Tera glob → managed state → render/shutdown threads → ten commands → event loop | Tera parse returns; build panics; user exit without code prevented |
| render thread | Tauri setup | `InternalRenderCommand → handle_command → registry/Tera/state/window` | regular window build can panic only this thread; channel close ends thread |
| `ui/index.html` | either on-demand WebView | `DOMContentLoaded`/immediate load → get/navigate/submit/dismiss commands and timers | invoke errors logged in browser console; no native-close response hook |
| protocol-only library root | Cargo dependency with `default-features = false` | re-exports `ipc/messages.rs` without Tauri | verified System Monitor v2 consumer |
| automatic tests | `cargo test -p template-engine` by convention | 27 automatic declarations across state and `test_render` | no checked CI invocation; Rust unavailable locally |
| manual IPC tests | ignored Cargo test filters | separately running broker/UI, five request scenarios | 120 s per-test receive timeouts |

Exact symbols and failure paths are in [the template-service semantic reference](07-symbol-reference/endpoint-template-service-semantic.md).

## Email-discovery entry points

| Entry point | Invocation | Initialization/downstream calls | Shutdown/failure |
| --- | --- | --- | --- |
| `email-discovery/src/main.rs::main` | Persona parent spawns binary in user session; also direct operator/Cargo invocation | stderr tracing → Clap → CLI/env path → core nine-source frame producer → `send_frame` | absent path/transport exits 1; source/serialization failures can still exit 0 |
| `Args` generated parser | `main` | optional `--ipc-socket`; fallback handled in `main` | Clap owns help/syntax termination; empty value not rejected |
| `send_frame` | `main` | Unix connect/write/flush or Windows pipe open/write/flush | no local retry/timeout/reply; error code 1 |
| `run_local_discovery_as_ipc_frame` | linked core public function | nine-source JoinSet → JSON or `[]` → big-endian frame | per-source/panic/serialization failures suppressed |
| `discover_via_subprocess` | core service-mode Persona fallback | bind fixed endpoint → resolve/spawn → 30 s accept/read → detached reap/cleanup | bind/resolve/spawn Err; read/timeout empty Ok with kill attempt |

There is no helper-local test entry. Core separately has one host-dependent discovery smoke test and two parent utilities tests; none launches the binary.

## Diagnostics entry points

| Entry point | Invocation | Initialization/downstream calls | Shutdown/failure |
| --- | --- | --- | --- |
| `diagnostics/build.rs::main` | automatic Cargo build hook | derive profile directory → copy compose/template/saved objects | missing `OUT_DIR` panics; copy failures warn and do not fail build |
| `sentinel_diagnostics::init` | receiver/integration/direct library caller | first-call unbounded channel → detached `run_worker` | requires Tokio runtime; later config ignored; no shutdown/join |
| `sentinel_diagnostics::init_ipc` | only with `centralized` feature | first-call `DiagnosticsSender::start` | no checked workspace feature enablement; closed sender cannot reset |
| `DiagnosticsSender::start` | active core facade in agent/proxy | broker handshake → event/heartbeat select → reconnect loop | errors drop queued events; broker Shutdown stops permanently |
| `diagnostics` binary `main` | packaged binary/direct Cargo invocation; product launcher unresolved | tracing → OpenSearch/Docker setup → local worker → receiver | backend setup warns/continues; broker Shutdown drops runtime without drain |
| `DiagnosticsReceiver::run` | standalone `main` | register `diagnostics_service` → parse Event/Batch/Lifecycle | errors retry to 60 s; first silent; Shutdown returns normally |
| `setup.sh` command dispatch | operator `start`/`stop`/`clean`/`status` | Compose lifecycle, setup polling, test event/count | `set -e`; curl HTTP errors can still count as reachability/success |
| unit/integration tests | `cargo test -p sentinel-diagnostics` by convention | five local unit tests plus live fixed OpenSearch test | integration is not ignored/gated; no checked CI invocation |

Exact symbols and flow/failure details are in [the diagnostics semantic reference](07-symbol-reference/endpoint-diagnostics-semantic.md).

## Infra platform-runtime entry points

| Entry point | Invocation | Initialization/downstream calls | Shutdown/failure |
| --- | --- | --- | --- |
| `select_platform_services` | core process spawn and email-discovery parent | compile-time target object → boxed adapter getters | unsupported target compile error; Linux getter panic |
| `ProcessInstancedSpawner::spawn` → infra adapters | active core default graph | address prepare → resolve → stale cleanup → spawn → optional IPC probe | address/resolve/spawn fatal; standard IPC failure degrades to no-op |
| `MacOSBinaryResolver::new/resolve_service_binary` | macOS platform getter | cached executable dir → fixed candidates → PATH | earlier non-executable candidate aborts search |
| `UnixProcessSpawner::spawn` | macOS service/email helper | ordinary `Command` or console-user `launchctl asuser` path | structured spawn error; user PID poll up to 15 attempts |
| `WindowsProcessSpawner::spawn` | Windows service/email helper | ordinary `Command` or WTS/token/`CreateProcessAsUserW`; Job Object assignment | containment/log failures warn; spawn/session failures fatal |
| `UnixSocketChannelFactory` | core standard-IPC probe | blocking Unix connect/retry | probe failure is non-fatal in core |
| `NamedPipeChannelFactory` | Windows standard-IPC probe | stub connect | always `NotImplemented` |
| 47 inline unit tests | `cargo test -p infra` by convention | target-specific builders/adapters | no checked CI invocation; Linux selector test hits `todo!` |

There is no infra executable, worker loop, scheduled job, or migration command. Exact method semantics are in [the infra symbol reference](07-symbol-reference/endpoint-infra-platform-runtime.md).

## Endpoint proxy entry points

| Entry point | Invocation | Initialization/downstream calls | Shutdown/failure |
| --- | --- | --- | --- |
| `proxy/src/main.rs::main` | `sentinel-proxy` Cargo binary | parse Clap args, logging, config, diagnostics, state/certs/clients, policy background task, platform proxy | top-level error exits; duplicates library module declarations |
| `platform::common::run_proxy` | macOS/Windows platform adapters | HTTP and transparent listeners, Persona refresh, kill switch, optional redirector, task joins | Ctrl+C/broadcast; several detached tasks survive until process/runtime exit |
| `run_http_server` | TCP bind on configured proxy port | Hyper connection per accepted stream | accept-classification loop; per-connection errors logged |
| `run_https_server` | transparent TLS port | original-destination lookup → TLS MITM → HTTP handler | connection-local error; destination-cache miss can fail closed |
| `handle_request` | Hyper service callback | context → body capture → DLP/policy/UI → forward/WebSocket/response | converts multiple failures to responses; several subsystems explicitly fail open |
| `run_packet_redirector` | optional feature task | config → target platform redirector → LAN-change restart on non-macOS | constructor unwrap/panic; Windows worker receive can prevent shutdown |
| `WinPacketRedirector::run` | Windows redirector | SocketLayer attribution thread, NetworkLayer worker tasks, UDP maintenance | ineffective local wake connections can leave `recv_ex` blocked |
| `sysext::run` | macOS redirector | starts tunnel, then control/relay/heartbeat listener | initial control-socket race; normal listener exit stops tunnel |
| `TransparentProxyProvider.startProxy` | Network Extension runtime | one control connect/Ping, reader/heartbeat on success, hard-coded TCP/UDP 443 rules | reports startup success even with no IPC; `stopProxy` cancels selected tasks |
| Swift `main.swift` | system-extension executable | `NEProvider.startSystemExtensionMode()` then `dispatchMain()` | process/runtime owned |
| `templating_engine_main` | alternate binary target | Tauri templating UI startup | target-specific UI/runtime behavior |
| Cargo build script | build of proxy crate | protobuf/Tauri metadata plus macOS Swift/Objective-C compilation | Swift build failure warns and continues; Objective-C failure is fatal |
| proxy test roots | Cargo convention | `lib.rs`, OCR, IPC roots plus inline modules | 318 static declarations; discovery/compilation is not equivalent to passing |

Exact startup order, inputs, and failure paths are in [runtime semantics](07-symbol-reference/endpoint-proxy-runtime.md) and [redirector semantics](07-symbol-reference/endpoint-proxy-redirector.md).
