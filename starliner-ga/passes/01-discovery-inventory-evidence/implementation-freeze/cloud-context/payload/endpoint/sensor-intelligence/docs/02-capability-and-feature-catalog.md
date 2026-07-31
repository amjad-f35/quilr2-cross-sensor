# 02 — Capability and Feature Catalog

## Scope and classification rules

This catalog describes behaviors at endpoint commit
`a022e52bf2fff6a9445ebad96c3afeaf277e259f`. It does not promote a public
module, commented service definition, test-only helper, design document, or
dashboard capability into an active endpoint feature without a runtime
registration path.

The companion machine-readable table is
[features.csv](../../../matrices/sensor-intelligence/endpoint-sensor/features.csv).
Feature IDs are stable within this analysis.

Status terms:

- `Active`: reached from the default endpoint runtime at the pinned revision.
- `Conditional`: compiled or entered only when a feature, platform, argument,
  environment variable, policy, or source-specific configuration enables it.
- `Partial`: a current path exists but does not meet the full claimed or implied
  behavior.
- `Dormant`: compiled/public code exists, but no caller or runtime registration
  was found after repository-wide search.
- `Inactive default`: runnable code exists but the default service graph does
  not start it.
- `Legacy`, `Experimental`, `Placeholder`, and `Documentation-only` have their
  literal meanings.

`Verified in source` describes static reachability. It is not a claim that a
particular production installation enabled or successfully exercised the path.

## Capability hierarchy

```text
Endpoint sensor
├── Agent lifecycle and supervision
│   ├── console / Windows SCM startup
│   ├── eight-service default graph
│   ├── dependency-ordered start/stop
│   ├── child-process polling and retry
│   └── distributed kill-switch state
├── Identity and context
│   ├── Persona broker bridge
│   ├── access-token cache and refresh
│   ├── local email discovery
│   └── device/user/tenant context
├── System Monitor v2
│   ├── process enumeration and application correlation
│   ├── process-map refresh
│   ├── marker-driven Lua artifact discovery
│   ├── npm/Cargo/Go package discovery
│   ├── entity snapshot, ingest, app-ID, and governance delta
│   ├── Application process enforcement
│   └── Cursor/Claude hook installation and activity batching
├── Inline proxy
│   ├── explicit HTTP/CONNECT proxying
│   ├── transparent TLS interception
│   ├── WebSocket forwarding and selected frame analysis
│   ├── WinDivert / macOS Network Extension redirectors
│   ├── process and destination attribution
│   ├── DLP extraction/classification
│   ├── policy evaluation and local justification UI
│   └── alerts, traffic logs, health, caches, and circuit breakers
├── Local presentation
│   ├── integrated templating engine
│   └── separate template-service process
├── Diagnostics and alerts
│   ├── brokered structured diagnostic producers
│   ├── brokered alerts → SQLite → HTTP
│   └── optional centralized diagnostics receiver
└── Build, installation, update, and support
    ├── signed platform packages and update metadata
    ├── privileged installation/update/uninstall
    └── dormant/legacy developer and transport facilities
```

## Feature traceability matrix

| ID | Capability | Feature | Entry point | Core symbols | Inputs | Outputs/current consumer | Status | Platform use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | Agent lifecycle | Console startup | `agent/src/main.rs::main` | `run`, `init::run_with_shutdown` | CLI, process environment, signals | Starts default graph; stderr/tracing; process exit code | `Active`; `Verified in source` | macOS, Windows; target-neutral console code |
| F-002 | Agent lifecycle | Windows SCM service startup | `main --service` | `windows_service::run_as_service`, `run_service` | SCM control/session events, service environment | SCM state, shared lifecycle, session wakeups | `Conditional`; `Verified in source` | Windows |
| F-003 | Agent lifecycle | Bootstrap-spawn validation | `init::bootstrap_validation` | CLI flags, parent PID checks | bootstrap arguments/process tree | validation result/error | `Implemented but inactive`; call commented out | macOS, Windows |
| F-004 | Agent lifecycle | Default service registration | `service_manager_init` | `ServiceManager::from_defaults`, `get_default_services` | eight active definitions | in-process bridges and child-process definitions | `Active`; tests contradict implementation | macOS, Windows |
| F-005 | Agent lifecycle | Dependency-ordered start/stop | `start_services`, `shutdown_gracefully` | `start_all_with_dependencies`, `stop_all_with_dependencies` | service graph/state/timeouts | child processes, bridge tasks, registry states | `Active`; readiness is framework-level | macOS, Windows |
| F-006 | Agent lifecycle | Child-process crash detection and retry | `start_process_supervisor` | `ProcessSupervisor`, `Supervisor` | retained process handles, service config | `Crashed`/`Retrying` transitions and respawn attempts | `Active`; bounded per config | macOS, Windows |
| F-007 | Agent lifecycle | Generic health/status monitor | `start_health_monitor` | `ServiceManager::start_monitor`, `StatusUpdate` | unbounded status channel | process-local service health bookkeeping | `Active but incomplete`; no active heartbeat wiring | target-neutral |
| F-008 | Control | Distributed kill switch | persona refresh and broker bridges | `AgentStateController`, `KillSwitchBrokerBridge`, proxy/monitor/template listeners | backend user state, broker query/event | selected process startup suppression or shutdown | `Active but inconsistent/time-racy` | macOS, Windows |
| F-009 | Identity | Persona initialization and token lifecycle | persona bridge factory | `PersonaManager::initialize`, bridge handlers | local discovery, vault, backend auth | persona/token over pinned IPC | `Active`; hard dependency for monitor | macOS, Windows |
| F-010 | Identity | User-space email discovery helper | Persona service-mode fallback | `discover_via_subprocess`, `email-discovery::main` | nine local account/browser/mail sources | framed candidate vector to parent | `Conditional`; source failures suppressed | macOS, Windows |
| F-011 | Local transport | IPC broker | default service graph | `IpcBrokerService`, pinned `ipc-light-broker` | local framed broker messages | request/reply/events among processes | `Active`; peer authentication/ACL unresolved | macOS, Windows |
| F-012 | Alerts | Brokered alert persistence and dispatch | proxy `send_alert` | `AlertSender`, `AlertBrokerBridge`, `AlertReceiver`, `AlertingSystem` | serialized DLP/upload alerts, Persona auth | local SQLite then backend HTTP | `Active`; queue/shutdown gaps | macOS, Windows |
| F-013 | Diagnostics | Structured diagnostic production | agent/proxy initialization | `diag_*` macros, `DiagnosticsSender` | code/severity/message/attributes | best-effort broker events | `Active producers`; receiver startup unresolved | macOS, Windows |
| F-014 | Diagnostics | Central diagnostics receiver/export | diagnostics binary `main` | `DiagnosticsReceiver`, `run_worker`, OpenSearch `Sender` | broker diagnostic messages | local ring/file and OpenSearch bulk | `Inactive default`; built/packaged | target-neutral executable |
| F-015 | Discovery | Process enumeration | `process_monitor::run` | `MacOsEnumerator`, `WindowsEnumerator`, `ProcessTable::diff` | OS process table, power state | process start/exit deltas | `Active`; Linux absent | macOS, Windows |
| F-016 | Discovery | Process-to-application correlation | process discovery loop | `Correlator::correlate`, `default_process_map` | process path/name/parent and process map | `Application` entities and rediscovery events | `Active`; exit does not deactivate entity | macOS, Windows |
| F-017 | Discovery | Backend process-map refresh | orchestrator startup/loop | `fetch_process_map`, `start_refresh_loop`, `update_process_map` | authenticated HTTP process map | replaces correlation map | `Active`; empty success can replace defaults | macOS, Windows |
| F-018 | State | Entity store and change broadcast | every monitor producer | `EntityStore::upsert`, `subscribe` | typed `Entity` values | in-memory map, `ChangeEvent` broadcast | `Active`; process-local/transient | target-neutral |
| F-019 | State | Snapshot recovery | orchestrator startup/timer/shutdown | `load_snapshot`, `save_snapshot` | JSON path, entities, delta cursor | local snapshot file | `Active`; no durable event log/migration gate | macOS, Windows |
| F-020 | Discovery | Marker-driven Lua artifact scan | `scanner::run` | walker, `execute_script`, `convert_results` | configured folders/markers, seven scripts, host APIs | selected typed entities into store | `Active but lossy`; not exhaustive discovery | macOS, Windows |
| F-021 | Discovery | npm package/CLI discovery | `pkg_scanner::run` | `npm::discover` | configured npm bin roots/metadata | package/application candidates | `Active`; bounded ecosystem | macOS, Windows |
| F-022 | Discovery | Cargo package/binary discovery | `pkg_scanner::run` | `cargo::discover` | Cargo bin paths/metadata | package/application candidates | `Active`; bounded ecosystem | macOS, Windows |
| F-023 | Discovery | Go package/binary discovery | `pkg_scanner::run` | `go::discover` | Go binary/tool output | package/application candidates | `Active`; child tool has no timeout | macOS, Windows |
| F-024 | Sync | Application canonical-ID resolution | five-second ingest loop | `resolve_app_ids` | unsynced Applications, backend app-add API | `canonical_id` mutation in store | `Active`; backend-derived identity | macOS, Windows |
| F-025 | Sync | Bulk discovered-entity ingest | five-second ingest loop | `sync_entities`, `to_discovered_entity` | unsynced store entities, Persona context | gzip HTTP to `/ea/v1/sync/discovered-apps` | `Active`; zero batch-size panic potential | macOS, Windows |
| F-026 | Sync/control | Governance delta polling | orchestrator delta loop | `poll_delta`, `SyncCursor` | backend delta response and cursor | local governance mutations/pending buffer | `Active`; whole-response polling | macOS, Windows |
| F-027 | Enforcement | Governed Application process action | `Enforcer::run` | `Enforcer::enforce`, `PlatformActions` | Application governance and matching PIDs | terminate/platform action attempt | `Active for Application`; effect proof incomplete | macOS, Windows |
| F-028 | Enforcement | Enforcement notification and audit | `Enforcer::enforce` | `Notifier`, `TemplateClient`, `Auditor::report` | action/outcome/context | local popup and backend alert/audit HTTP | `Active`; notification/audit failure can be partial | macOS, Windows |
| F-029 | Hooks | Proactive Cursor/Claude hook installation | `HookManagerService::run` | `probe_and_install`, `deploy_thin_client`, `HookInstaller::install_merged` | marker paths, installation path, templates | copied thin client and merged IDE hook JSON | `Active when enabled`; overwrites hooks object semantics | macOS, Windows |
| F-030 | Hooks | Discovery-triggered hook installation | store `ChangeEvent::Added` | `on_app_discovered`, lookup by bundle/process | discovered Application | same installation pipeline | `Active when enabled` | macOS, Windows |
| F-031 | Hooks | Hook-file integrity monitoring | hook manager | `IntegrityMonitor::start`, `register`, `watch_path` | installed JSON and expected hooks/binary | repair/reinstall attempts and logs | `Active when hook manager enabled` | macOS, Windows |
| F-032 | Hooks | Cursor hook client | IDE invokes thin client | `sentinel-hook-client::main`, common IPC client | Cursor JSON on stdin | Cursor-compatible allow/deny/justify JSON | `Active for installed hooks`; defaults allow on most failures | macOS, Windows |
| F-033 | Hooks | Claude hook client | IDE invokes thin client | `sentinel-claude-hook-client::main`, common IPC client | Claude hook JSON on stdin | JSON or exit code 2 | `Active for installed hooks`; defaults allow on most failures | macOS, Windows |
| F-034 | Hooks | Session correlation and idle flush | hook IPC server | `HookIpcServer`, `SessionQueue`, `ActivityEvaluator` | hook events/session IDs/tool/file data | per-session prompt-turn activity candidate | `Active`; process-local session state | macOS, Windows |
| F-035 | Telemetry | Prompt activity batching/delivery | evaluator flush | `ActivityBatcher::start` | activity records | best-effort HTTP to activity endpoint | `Active`; bounded queue/drop and retry limitations | macOS, Windows |
| F-036 | Hooks/control | Hook policy/DLP decision | evaluator callback | `ActivityEvaluator::evaluate` | accumulated hook request | `Allow` | `Placeholder`; always Allow, no policy/DLP call | macOS, Windows |
| F-037 | Proxy | Explicit HTTP proxying | `run_http_server` | `handle_request`, `forward_request` | client HTTP requests | upstream request/response | `Active` | macOS, Windows |
| F-038 | Proxy | HTTP CONNECT/TLS handling | `handle_request` CONNECT branch | `handle_connect`, `handle_tls_stream` | CONNECT authority/client stream | tunnel or intercepted TLS flow | `Active`; branch/policy dependent | macOS, Windows |
| F-039 | Proxy | Transparent TLS interception | `run_https_server` | destination resolution, `handle_transparent_tls_client` | redirected TCP, ClientHello, original destination | per-host MITM request flow | `Conditional`; requires redirector/cert trust | macOS, Windows |
| F-040 | Proxy | Fail-open tunnel and destination fallback | transparent path | NAT/extension/SNI resolution, `handle_tcp_tunnel` | connection metadata and ClientHello | raw tunnel or connection drop | `Active`; not all handshake failures recoverable | macOS, Windows |
| F-041 | Proxy | WebSocket forwarding/inspection | upgrade path | `handle_websocket` | upgraded bidirectional frames | forwarded frames and selected DLP decisions | `Active`; large frames can bypass analysis | macOS, Windows |
| F-042 | Attribution | Network process attribution | redirectors/state | socket listener/NE metadata, `PROCESS_ATTR_MAP` | peer tuple, PID/process/app details | request extension and DLP/audit context | `Conditional/partial`; platform-specific gaps | macOS, Windows |
| F-043 | Proxy capture | Windows packet interception | `run_packet_redirector` | `WinPacketRedirector`, WinDivert loops | configured filters, TCP/UDP packets | rewritten/injected packets, attribution | `Conditional`; Windows feature/build only | Windows |
| F-044 | Proxy capture | macOS Network Extension interception | `run_packet_redirector` / extension runtime | `sysext::run`, `TransparentProxyProvider` | NE TCP/UDP flows, control/relay IPC | redirected TCP; UDP 443 reject behavior | `Conditional`; extension can report start without IPC | macOS |
| F-045 | Proxy utility | Destination/DNS/application caches | proxy startup/request path | `DestinationCache`, `DnsCache`, app-details refresh | NAT/SNI/DNS/backend application data | cached destinations/app attribution | `Active when configured`; TTL/size bounded | macOS, Windows |
| F-046 | DLP | Request/response body capture and extraction | `handle_request` | `capture_body_with_streaming`, extraction transforms | whole HTTP bodies, configured fields/transforms | extracted candidate text/values | `Active when patterns match`; “streaming” still buffers body | macOS, Windows |
| F-047 | DLP | DLP classification | proxy startup/request path | `DlpEngine`, analyzers, pattern manager | extracted content, patterns, optional model/backend | findings/decision input | `Conditional`; heuristic fallback when Persona unavailable | macOS, Windows |
| F-048 | Policy | Policy load/cache/evaluation | `run_proxy` and request path | `start_policy_engine_init_with_auth_provider`, policy engine | Persona token, backend controls, request context | allow/block/justify-like policy result | `Active but fail-open paths`; background readiness | macOS, Windows |
| F-049 | Enforcement/UI | DLP block/justification handling | request policy/DLP branch | native UI or templating IPC, `obtain_justification_blocking` | detections, original text, options, timeout | user decision/default and request disposition | `Active when configured`; timeout/close defaults matter | macOS, Windows |
| F-050 | Telemetry | Proxy traffic logging | `--enable-traffic-log` | `traffic_logger` singleton | request/response metadata/body summaries | local `proxy_traffic.log` | `Conditional`; local file, async loss possible | macOS, Windows |
| F-051 | Telemetry | DLP/upload alert generation | DLP/request paths | alert payload builders, `send_alert` | decision/detections/user/app context | F-012 brokered alert flow | `Active for selected paths` | macOS, Windows |
| F-052 | Configuration | Dynamic DLP/application refresh | proxy startup | `dlp_config_refresh_task`, `app_details_refresh_task` | backend HTTP, Persona token | process-local config/app caches | `Active`; detached retry loops | macOS, Windows |
| F-053 | Reliability | Proxy health/circuit breakers/connection limits | proxy startup/accept/request paths | `ProxyHealthMonitor`, `CircuitBreaker`, `Semaphore`, metrics | request/probe results and thresholds | state/logs/rejections/restart request | `Active unless disabled`; restart integration partial | macOS, Windows |
| F-054 | Presentation | Integrated templating-engine popup UI | `templating-engine.service` | core Tauri `TauriContext` | broker/local popup commands, HTML templates | user block/prompt/justification UI | `Active default`; runtime template dependency | macOS, Windows |
| F-055 | Presentation | Separate template-service registry/UI | `template-engine.service` | `TemplateRegistry`, render queues, Tauri commands | local config/broker render commands | regular/notification windows and responses | `Active default`; overlaps F-054 | macOS, Windows |
| F-056 | Delivery | Signed package build/install/update | platform build/distribution entry points | PowerShell/shell builders/installers, update JSON signing | source/artifacts/keys/CDN/config | signed packages, services, certs, extension/driver | `Implemented`; CI/runtime rollout gaps | macOS, Windows |
| F-057 | Delivery | Uninstall and host restoration | platform uninstall entry points | service/cert/network/file cleanup phases | installed host state | removed components/restored networking | `Implemented but nontransactional`; overstatement possible | macOS, Windows |
| F-058 | Dormant transport | Generic database gRPC bridge | Cargo `grpc_server` feature | protobuf build, Tonic server/client | database query/read/write models | hypothetical gRPC DB operations | `Dormant and statically incompatible`; no runtime caller | target-neutral feature |
| F-059 | Dormant discovery | File index/search service | public core modules | `FileIndexer`, SQLite DAL, search providers | filesystem paths/metadata | local SQLite/search results | `Dormant`; no default runtime registration | target-neutral source, platform helpers |
| F-060 | Dormant scripting | Manifest/event/updater scripting framework | public library calls | `ScriptEngine`, `EventDispatcher`, `ScriptUpdater` | manifests/events/remote bundles | script results/files | `Dormant/partial`; active scanner bypasses verifier/updater | target-neutral |
| F-061 | Consumer boundary | Current dashboard/API projection | endpoint HTTP routes | dashboard handlers/repos/ClickHouse writers | inventory/activity/alerts and policy/admin requests | React administrative UI and ClickHouse | `External current consumer`; not endpoint runtime | server/browser |
| F-062 | Unsupported environment | Linux endpoint runtime | target selection | Linux config/docs and incomplete infra factories | Linux host | no complete monitor/proxy/default-graph support | `Partial/Contradiction`; not supportable as complete | Linux |
| F-063 | Unsupported estate | Cloud/serverless/container/CI-native discovery | none | none found for cloud metadata, control plane, runner/job, container identity | external estate | none as authoritative environment records | `Not observable by this sensor` | all such environments |

## Detailed capability behavior

### F-001–F-008 — Agent startup, supervision, and kill switch

**Purpose.** These features create and supervise the compound endpoint runtime.

**Trigger and preconditions.** `agent/src/main.rs::main` enters Windows SCM mode
when any raw argument equals `--service`; otherwise it creates a multi-threaded
Tokio runtime and calls `run`. `init::run_with_shutdown` parses arguments,
initializes the environment and diagnostics sender, creates a
`ServiceManager`, starts its monitor, starts services, starts the process
supervisor, then waits on the shutdown channel.

**Execution and state.**

1. `core/src/defaults/services.rs::get_default_services` returns exactly eight
   active definitions.
2. `ServiceManager::from_defaults` registers them into a process-global service
   context and local registries.
3. `start_all_with_dependencies` uses the declared dependency graph. In Windows
   service mode, user-space start/readiness failures are logged and suppressed
   so the session-notification path may retry later.
4. The lifecycle layer records `Running` after wrapper `start()` returns. This
   is not an application-level readiness probe.
5. `ProcessSupervisor` polls retained process handles; `Supervisor` applies the
   configured retry count and exponential delay.
6. Shutdown reverses dependency order and attempts every stop, returning the
   first error after the loop.

**Outputs.** Child processes, bridge tasks, service-state changes, logs and
diagnostic events. There is no single sensor-instance registration record or
capability manifest emitted by this path.

**Failure behavior.** Factory panics and non-user-space startup errors can abort
startup. The health APIs contain placeholders and the default wrappers do not
wire heartbeat tasks. Kill-switch listeners wait fixed times and generally
start fail-open when no initial state is received.

**Tests and contradictions.** Tests in
`core/src/defaults/services.rs` assert nine services and search for commented
Keystore/Vault/TimeKeeper definitions. `Verified in source`: these tests do not
match the current eight-service implementation.

### F-009–F-014 — Identity, local IPC, alerts, and diagnostics

**Purpose.** Establish tenant/user context, move local messages across process
boundaries, and emit operational/security records.

Persona initialization is synchronous inside a factory-owned thread/runtime.
System Monitor then performs its own Persona IPC bootstrap and will not start
its worker graph until Persona is available or cancellation occurs. The proxy
starts policy/DLP work with Persona IPC and may degrade to heuristic analysis
after six one-second startup attempts.

The email helper is not a general identity authority. It aggregates candidate
addresses from nine local sources and sends a length-prefixed JSON frame to the
parent. Per-source failures and selected framing/timeout failures become empty
candidate success.

The pinned broker is the active local message plane. Alerts use it to reach the
agent-side bridge, which owns local SQLite persistence and authenticated HTTP
dispatch. Diagnostics producers also use the broker, but the central receiver
binary is not in the active default graph. Therefore a producer send attempt is
not evidence of durable diagnostic storage.

**Trust boundary.** Persona tokens, user identity, alerts and diagnostics cross
local process IPC. Effective socket/pipe ACLs, broker peer authentication and
deployed service accounts are `Unresolved`.

### F-015–F-028 — System discovery, local state, sync, and process control

**Trigger.** `system-monitor/v2/src/main.rs::main` initializes logging and
configuration, starts its kill-switch listener, waits six seconds, and enters
`Orchestrator::run` if the process-local enabled flag is true.

**Execution order.**

1. `Orchestrator::run` bridges broadcast shutdown into one cancellation token.
2. It blocks on Persona, sets `QUILR_TENANT_ID` and optionally
   `QUILR_SUBSCRIBER_ID`, builds `ContextManager`, and fetches an access token.
3. It loads a best-effort JSON snapshot.
4. It loads a compiled process map, replaces it on a successful backend fetch,
   and starts the refresh loop.
5. It creates macOS or Windows process enumeration and action adapters.
6. It starts ten retained workers: process discovery, Lua scan, package scan,
   enforcement, delta, ingest/app-ID, snapshot, Persona refresh, hook manager,
   and process-map refresh. Persona broadcast and the initial shutdown bridge
   are additional detached tasks not joined by the orchestrator.
7. Cancellation joins the ten retained handles without a timeout and writes a
   final snapshot.

The native entity store is a process-local map with a broadcast change stream.
Process enumeration produces deltas; correlation maps them to Applications.
`Verified in source`: an observed process exit does not mark the Application
inactive or delete it. Marker-driven Lua and three package ecosystems add
selected entities. The Lua converter does not preserve every object produced
by the script collector.

Sync is best effort: app-ID lookup and ingest run every five seconds; governance
delta uses a separate configured interval. The snapshot saves entities and the
delta cursor, not an acknowledged outbound event stream. Application
governance can trigger platform process actions, notification and audit, but an
attempt/result is not independent proof that the intended native effect
persisted.

### F-029–F-036 — Hook installation and prompt-turn observation

The hook manager is conditional on `HookManagerConfig.enabled`. It starts an
integrity monitor, activity batcher, session queue/evaluator and local IPC
server; proactively probes configured markers; then reacts to new Application
entities and periodic probes.

Installation copies a thin client from `SENTINEL_INSTALLATION_PATH`, creates
parent directories, adjusts ownership/permissions, generates template hooks,
merges them into the target IDE JSON, and registers the file for integrity
monitoring. An in-memory `installed_apps` set provides process-lifetime
idempotency.

Cursor and Claude clients read JSON from stdin, write JSONL/debug material in
their own paths, call local IPC, and translate the response into client-specific
output. Most local IPC/parse failures default to Allow unless the thin-client
fail-closed environment behavior is explicitly enabled.

`Verified in source`: `ActivityEvaluator::evaluate` accumulates tool/file state
and schedules activity delivery, but always returns `Allow`. The repository
contains response models for Deny/Justify; their existence does not make hook
enforcement implemented.

### F-037–F-053 — Proxy, redirectors, DLP, policy, and reliability

`proxy/src/platform/common.rs::run_proxy` performs the current shared startup:
global configuration, background policy initialization, diagnostics, DLP
engine, dynamic DLP manager, attribution cleanup, alert IPC, DNS cache, health,
metrics, circuit breakers, shutdown signals, Persona and kill-switch clients,
optional templating IPC, a six-second startup gate, optional traffic logging,
certificate/root-store/client construction, service-state initialization,
background config/application refresh, listener construction, optional packet
redirector, and `try_join!` of HTTP and HTTPS servers.

The proxy is both a capture and enforcement surface:

- explicit HTTP and CONNECT requests enter Hyper handlers;
- transparent connections require WinDivert or the macOS Network Extension,
  destination metadata, and certificate trust for MITM;
- WebSocket upgrades are relayed bidirectionally;
- configured request/response fields are transformed and classified;
- policy and DLP results may allow, block, prompt or request justification;
- alerts and logs record selected outcomes.

Capture is not complete. Traffic outside redirector/listener scope, unsupported
protocols, bypassed destinations, unrecoverable TLS handshakes and oversized
WebSocket analysis paths are blind spots. Several DLP/policy/config/auth errors
fail open to preserve connectivity. The “streaming” body path captures the
complete body before forwarding.

Windows and macOS redirectors are not semantically identical. WinDivert uses
packet/socket layers and local attribution caches. The macOS extension has a
control/relay protocol and TCP flow handling; its UDP 443 path rejects
intercepted flows, and extension startup can report success when the initial
control connection is unavailable.

### F-054–F-057 — Presentation and delivery

Two separate process services exist in the active graph:
`templating-engine.service` and `template-engine.service`. The former wraps the
core templating engine used for DLP popup flows; the latter is the separate
template-service crate with its own registry, render queues and regular versus
notification state. This is verified duplication, not a naming alias.

Build/distribution code produces and signs platform packages and update
metadata, installs certificates/drivers/extensions/services, and has update and
uninstall paths. These operational features are part of the endpoint system,
but they are not telemetry capture surfaces. The repository analysis found
nontransactional rollback, artifact-collection and CI verification gaps; the
existence of scripts is not proof of production rollout success.

### F-058–F-063 — Dormant, external, and unsupported scope

- The generic database gRPC path is behind a default-off Cargo feature, has no
  active caller/server startup, and the checked protobuf field `table` disagrees
  with handwritten Rust access to `schema_id`. It is not current sensor
  transport.
- File indexing/search and the general script manifest/event/updater framework
  are public code without default runtime registration. The active Lua scanner
  calls a narrower direct execution path.
- The dashboard/API is a current remote consumer and administrator surface. It
  must not be counted as device-local capture.
- Linux cannot be claimed as a complete endpoint environment: principal
  enumerator/action/infra paths are absent or `todo!`.
- No cloud-control-plane, serverless, container-orchestrator, CI-runner/job,
  remote repository, or generic MCP-backend inventory source exists in the
  endpoint. Some artifacts from those environments may appear as ordinary
  local files/processes/network traffic, but that does not create authoritative
  environment discovery.

## Coverage implications

| Question | Verified answer |
| --- | --- |
| Does the endpoint discover every agent everywhere? | No. It discovers selected host-local processes, marker/config artifacts and three package ecosystems, plus selected hook/network observations. |
| Are proxy and hooks part of sensor coverage? | Yes. Both are first-class feature families, with their capture and enforcement limitations kept separate. |
| Is gRPC an active transport? | No. The only repository gRPC bridge is dormant/default-off and source-incompatible at the pinned revision. Active local transport is the pinned IPC broker; active remote transport is HTTP. |
| Does a source record imply durable platform delivery? | No. Current paths use snapshots, memory queues, files, SQLite and best-effort HTTP/broker delivery without one common acknowledged outbox. |
| Does `Allow` from the hook path prove policy approval? | No. The current evaluator always returns Allow; it does not execute hook policy or DLP. |

## Evidence references

- `work/sentinel-endpoint-agent/agent/src/main.rs`
- `work/sentinel-endpoint-agent/agent/src/init.rs`
- `work/sentinel-endpoint-agent/core/src/defaults/services.rs`
- `work/sentinel-endpoint-agent/core/src/service/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/main.rs`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/orchestrator.rs`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/discovery/**`
- `work/sentinel-endpoint-agent/system-monitor/v2/src/hook_manager/**`
- `work/sentinel-endpoint-agent/proxy/src/platform/common.rs`
- `work/sentinel-endpoint-agent/proxy/src/http_handlers/**`
- `work/sentinel-endpoint-agent/proxy/src/packet_redirector/**`
- [Existing feature catalog](../../../repository-analysis/05-feature-catalog.md)
- [Service runtime analysis](../../../repository-analysis/06-endpoint-core-service-runtime.md)
- [System Monitor semantic reference](../../../repository-analysis/07-symbol-reference/endpoint-system-monitor-v2-semantic.md)
- [Proxy runtime reference](../../../repository-analysis/07-symbol-reference/endpoint-proxy-runtime.md)
- [Proxy redirector reference](../../../repository-analysis/07-symbol-reference/endpoint-proxy-redirector.md)

