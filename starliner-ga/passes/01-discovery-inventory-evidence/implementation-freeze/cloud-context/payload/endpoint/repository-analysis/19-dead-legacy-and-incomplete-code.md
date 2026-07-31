# 19 — Dead, Legacy, and Incomplete Code

## Current IPC `main`

- **Dead-code candidate:** `Error::ChannelNotFound`, `Error::InvalidFrame`, and `Error::PermissionDenied` have display branches but no constructors after exact repository-wide searches.
- **Dead-code candidate:** `Error::is_recoverable` has a unit-test caller but no production caller.
- **Incomplete configuration:** `Config.connect_timeout` and `IPC_LIGHT_CONNECT_TIMEOUT_MS` are parsed and logged but do not control connection timing.
- **Platform gap:** a Windows path-format branch exists, but factory functions and transport implementation are Unix-only at current `main`.
- **Documentation-only/planned:** typed/schema, broker, duplex, rate-limit, health/metrics, inspector, and Windows behavior described by product/architecture documents.

## Endpoint-pinned IPC

See [Endpoint-pinned IPC: dead, incomplete, or misleading surfaces](06-ipc-endpoint-pinned.md#dead-incomplete-or-misleading-surfaces). Confirmed candidates include unused broker retry/timeout settings, unused duplex buffer configuration, an unimplemented Windows SID helper, unintegrated lock-free halves, test-only health/statistics paths, the explicit duplex proof of concept, and a stale registered Cargo example. These remain candidates rather than unqualified dead code because public consumers outside the three checked repositories could exist.

## Dashboard/API

- **Production-dead candidate:** internal auth service/handler, internal HS256 helpers, several user-repository reads, and JWT config are wired only by integration tests.
- **Dead-code candidate:** `IDMappingRepository.Upsert`; production uses `BatchWriter[MappingItem]`.
- **Compatibility/test helper:** `AppStateRepository.UpsertDeviceState`; the production ingest service uses `BatchWriter[EntityStateItem]`.
- **Unused configuration candidate:** parsed `CatalogNamespaceSecret`; canonical ID generation moved to agents and no v2 production consumer remains.
- **Incomplete observability:** `WriterStats` has no production consumer/exporter.
- **Stale/incompatible loader:** `app-intel/update_clickhouse.py` writes legacy `app_catalog`, while the API reads `endpoint_app_catalog`; no compatible loader or DB alias was found.
- **Misleading location:** `internal/middleware/jwt_auth.go` implements CORS and no JWT behavior.

Details and search qualifications are in [Dashboard/API deep reference](06-dashboard-api.md#dead-legacy-incomplete-and-ambiguous-code).

## Dashboard frontend

Runtime-unreachable groups include Claude OTel page/hooks/types/API methods, Skills settings tree, Tooltip, mock graph data, inventory-overview/search/useAsset hooks, three orphan CSS modules, unused overview policy chart, and installed-but-unimported `elkjs`. The committed `dist` fragment is generated but missing its referenced JS/CSS. See [the fully qualified frontend list](06-dashboard-frontend.md#dead-legacy-incomplete-and-unused-surfaces).

## Dashboard root/operations

- Root `version` (`1.33.96`) has no in-repository consumer.
- Root `assets/QuilrLogo.svg` is byte-identical to the active frontend asset and has no caller/build copy.
- Two `.DS_Store` files and 15 Playwright console logs are generated/stale host diagnostics, not runtime inputs or tests.
- Root `.env` still declares PostgreSQL settings ignored by v2.
- Root and backend guidance points to v1, an absent migration flag, PostgreSQL, and Rust conventions.
- Nginx carries an SSE `/ea/v1/sync/stream` comment/configuration without a server route.
- The original v2 ADR, entity-sync contract, architecture specs, and product specs contain substantial superseded behavior; see the [qualified audit](06-dashboard-operations-and-documentation.md#documentation-consistency-audit).

## Endpoint core scripting

- Dead-code candidate: public `url_matcher::matches`; own test is its only caller, while engine contains an identical private function.
- Repository-locally uncalled public subsystems: `ScriptEngine`, `EventDispatcher`/event channel, and `ScriptUpdater`. They remain qualified because external crates may consume them.
- Incomplete security: known verifier callers discard invalid-signature false, Lua content is outside the signature, and active v2 deliberately bypasses verification.
- Placeholder: Lua `sentinel.result.set_risk` is an unconditional no-op despite committed calls.
- Disconnected outputs: Rust `add_event`/`add_error` are not registered to Lua; active converter drops events and raw entities.
- Partial transport: Windows `process.by_name` returns an empty table because it has no Windows body.
- Duplicate technical debt: two URL matchers and duplicated macOS/Linux process-list blocks.
- Partial update lifecycle: updater has no scheduler/caller, atomic install, rollback, stale-file removal, or running-engine reload.

Search evidence and qualification are in [the scripting deep reference](06-endpoint-core-scripting.md#dead-legacy-incomplete-and-unresolved-classifications).

## Endpoint core DLP templating engine

- **Legacy/incompatible:** `core/templates/index.html` uses obsolete context variables, nonexistent `get_dlp_queue`, and an unregistered/mis-shaped `submit_justification` call. No checked selector chooses it.
- **Incomplete public command:** `commands::submit_justification` has a Tauri macro but is omitted from the checked handler; it would hide without resolving `done_tx` or advancing FIFO.
- **Repository-locally unused branch:** core informational behavior requires `resp_sender: None`; the only checked adapter always supplies `Some`, even for proxy functions named nonblocking.
- **Unused field:** `JustificationContext.default_justification` is never read by core; fallback is implemented in adapters.
- **Unused serialized field:** `UiContext.template_name` crosses to JavaScript but no active template reads it.
- **Ignored inputs:** active decision handling ignores `UserJustification.comments` and `_original_text`.
- **Incomplete association/control:** event ID mismatch does not stop response-sender consumption; arbitrary decision strings become affirmative values.
- **Template defect:** block/prompt perform a second hide after FIFO advancement and can default/skip a queued request.
- **Reuse defect:** prompt category tags remain from the first same-template popup; timer-enabled structure is fixed at first render.
- **Security TODO:** window content protection is explicitly false; raw highlighted body HTML is marked safe.

Search and behavioral qualifications are in [the templating deep reference](06-endpoint-core-templating-engine.md#dead-incomplete-and-ambiguous-code).

## Endpoint core crate shell, tests, and decompression

- **Dead-code candidate:** `core/src/decompression/**`; its only crate-root declaration is commented. This classification follows repository-wide searches, not filename inference.
- **Compile prerequisite gap:** the excluded source imports optional `compress-tools` unconditionally; restoring only the module declaration is insufficient under defaults.
- **Excluded tests:** both decompression tests are inside the excluded source, use weak assertions, and one always targets a developer's absolute directory.
- **Legacy/compile-incompatible:** both registered Criterion targets implement the removed alerting API and reference absent `AlertPayload`.
- **Dead-code candidates:** all four `core/tests/common` files and their 12 internal tests; no direct core integration test declares the module.
- **Duplicated legacy helpers:** those four files are byte-identical to workspace-root copies.
- **Outdated integration suites:** bootstrap/lifecycle/status files assume retired Vault/TimeKeeper defaults; some tests pass vacuously or suppress the very failure they claim to check.
- **Nonisolated tests:** direct Vault wrapper tests use real default user storage and fixed keys; lifecycle tests can start real default processes.
- **Misleading tests:** three retrieve-named tests never retrieve; “communication” often means direct method invocation or registration only; monitor integration bypasses the channel loop.
- **Default-off incomplete interface:** protobuf generation defines `table`, while all handwritten DB IPC code expects `schema_id`.
- **Dead-dependency candidates:** no core lexical use found for `lazy_static`, `directories`, `which`, `tower`, or `tower_http`; metrics calls are commented and crates.io `testing` has no crate path use. Generated/target behavior remains a qualification.
- **Unresolved static assets:** core icons are copied and duplicate template-service icons, but no explicit Tauri icon list or handwritten reader identifies their final consumer.

Evidence and exact symbols are in [the final core package chapter](06-endpoint-core-crate-shell-tests-and-decompression.md).

## System monitor dead/legacy/incomplete candidates

- **Dead-code candidate:** public DLP `DetectionClient`/cache/stream have tests but no production construction/call; hook evaluator never uses them.
- **Dead-code candidates in current runtime:** `Correlator::update_alias` and `update_app` have test callers only, leaving documented caches empty in production.
- **Dead state:** kill-switch `IPC_CONNECTED` is written without functional read; `SHUTDOWN_TX` is stored but never used to send monitor shutdown.
- **Dead configuration candidate:** `PersonaConfig.ipc_timeout_secs` is deserialized/defaulted but not used by the active request path.
- **Placeholder:** `ActivityEvaluator` always returns Allow; DLP/policy/governance decisions are absent.
- **Incomplete platform:** Linux config/rules/scripts exist, but orchestrator declares enumerator/actions only for macOS/Windows.
- **Incomplete data path:** converter ignores raw entities, relationships, emitted events/errors, composite risk, and many rich typed fields.
- **Inactive manifest/security path:** `scripts/manifest.json`, signing, updater, dispatcher, and ScriptEngine are bypassed by active scanner.
- **Historical/legacy documents:** root v1/P0/P1 architectures, consolidation, process-chain, storage optimization, and manual guide target absent code/binaries.
- **Documentation-only:** proposed E2E harness, full-drive/file-index database, ecosystem scanners beyond npm/Cargo/Go, quarantine rename/restore, hook policy/DLP enforcement.
- **Stale task/test assets:** `tasks/todo.md` says decoder plan unexecuted despite implementation; E2E start script launches `target/debug/sentinel` rather than monitor.
- **Implementation-only:** current seven-detector set, `Rediscovered`, app-ID parent linking, package scan, and richer hook telemetry exceed or differ from main architecture/ADRs.

Each dead-code claim includes repository-wide symbol/import/registration/config/test searches. Public external-library use remains possible where noted; that is why these are candidates rather than absolute claims.

## Template service dead/incomplete candidates

- **Dead-code candidate:** public `_TemplateEngineError`; no construction, return, conversion, match, import, or external repository caller was found.
- **Dead-dependency candidates:** optional `uuid`, `chrono`, `clap`, and `ctrlc` have no source/test import; UUID appears only in a guide example and shutdown uses Tokio signals.
- **Dead state:** `IPC_CONNECTED` is written but never read; kill-listener `SHUTDOWN_TX` is initialized but has no receiver/read/cancellation branch.
- **Dead asset candidate:** both icons are exact core-icon duplicates, no subtree reader references them, and the Tauri bundle icon array is empty. External packaging convention remains unresolved.
- **Incomplete configuration:** both default-timeout fields are parsed but do not default or override request timeouts; notification queue length is fixed instead of configured.
- **Incomplete presentation:** theme colors, original text, registry header, content object, justification choices, and logo URL are inserted/accepted but unused by all committed fragments.
- **Incomplete broker API:** status and dismiss cover only regular active slots; notifications and queued IDs have no equivalent operations.
- **Response-lifecycle defect:** regular/notification dedup accepts later requests but retains only the first request ID/target, so later requesters receive no correlated response.
- **Response-routing defect:** both queues omit source/target and dequeue under the completed/dismissing request's target.
- **Bulk-dismiss defect:** notification X calls dismiss-all; active items receive responses, queued items are cleared without responses.
- **Unknown-ID behavior:** Tauri submit/dismiss emits a response to fallback `decision_engine_service` and dequeues even when removal fails.
- **Zero-capacity state:** active limit zero yields a FIFO with no active completion event capable of draining it.
- **Misleading test:** `test_needs_attention_no_timeout` never asserts timeout; it asserts only the enum value.
- **Misleading script:** `test_spawn_render.sh` does not spawn, kill, or invoke help and repeats the integration target.
- **Documentation-only:** dynamic backend API loading does not exist; backend-shaped local JSON loading does.
- **Implementation-only:** four additional hard-coded registry keys, kill-switch startup/exit, `SENTINEL_TEMPLATE_DIR`, bulk notification dismiss, and title-based regular dedup are absent or contradicted in guides.

Repository-wide searches covered symbols, imports, Cargo features/dependencies, Tauri handlers/configuration, environment strings, service/default registration, builders/installers, tests, and the System Monitor protocol consumer. See [the complete template-service analysis](06-endpoint-template-service.md#dead-incomplete-and-ambiguous-elements).

## Email-discovery incomplete behavior

- **Incomplete exit contract:** discovery/task/serialization failures can exit zero despite the “any error” comment.
- **Incomplete parent supervision:** child exit is not watched concurrently and detached reap status is ignored.
- **Potential issue:** fixed endpoint names have no run/parent nonce or concurrency guard.
- **Potential issue:** Unix binding applies no explicit mode/owner or peer credential; Windows deliberately uses a null DACL with no client SID validation.
- **Incomplete Windows environment:** the user-session spawner ignores `ProcessConfig.env` and supplies no explicit environment block; CLI preserves only the socket path.
- **Producer/consumer mismatch:** parent caps one MiB while producer uses unchecked `usize as u32` and no size bound.
- **Coverage gap:** helper has no tests; parent tests avoid the executable, Windows, production fixed name, security, and process lifecycle.
- **Deployment ambiguity:** standard builders/installers name the helper; newer distribution/QA trees do not.

There are no dead local symbols or unused manifest dependencies: all three declarations and all five dependency groups have active paths.

## Diagnostics dead/incomplete candidates

- **Dead-code candidate:** manifest dependency `bincode`; no source/test/build/script use found.
- **Dead-code candidate:** `DiagnosticsError::Storage`; no construction/match/reference found.
- **Dead feature controls:** `embedded`, `standalone`, `ipc-client`, and `ipc-server` are empty and do not gate modules; only `centralized` changes compilation.
- **Dead-code candidate:** crashed lifecycle constructor/variant in production code.
- **Implementation-only:** receiver accepts Batch, but no production Batch constructor/sender was found.
- **Apparently unreachable branch:** sender `select! else` labelled channel closed while heartbeat and duplex receive remain enabled.
- **Inactive product registration:** complete DiagnosticsService/receiver exists and is packaged, but its only default core definition is commented out.
- **Incomplete persistence:** memory buffering contradicts crash-safe claims; no shutdown drain/fsync, recovery, rotation, compaction, retention, or corruption signal.
- **Incomplete export:** Bulk 200 body is not inspected; item failures are marked sent; `_id` is not set, so retries can duplicate.
- **Incomplete delivery:** sender failure drops queued events; no acknowledgements, durable producer spool, backpressure, restartable global, or metrics.
- **Incomplete security:** no diagnostics-layer broker source authorization, file hardening/redaction, or backend authentication.
- **Stale documentation/tests:** invalid macro forms, phantom payload process ID, wrong test target/Compose file, absent dummy script, and non-running default-service claim.

Repository-wide searches covered exact symbols, dependencies/features/cfgs, macro users, broker strings, service/default factories, spawners, builders/installers/deployment, Docker assets, tests, and CI. See [the complete diagnostics qualification](06-endpoint-diagnostics-receiver.md#dead-incomplete-and-unused-surfaces).

## Endpoint infra platform runtime

- **Placeholder:** all four native Linux factory getters.
- **Placeholder:** Windows named-pipe channel/factory; no Windows infra server exists.
- **Dead-code candidate:** five interface `mod.rs` indexes shadowed by inline declarations in `interface/mod.rs`.
- **Dead-code candidate:** `ProcessSpawnerFactory` and `UnixProcessSpawnerFactory`; production uses `PlatformServices` directly.
- **Dead-code candidate:** default `ProcessSpawner::spawn_service`; no checked caller.
- **Dead-code candidate:** `IpcServer` and `UnixSocketServer` outside inline tests.
- **Dead-code candidate:** `UnixSocketChannel.address` and both Unix timeout-loop `last_error` variables.
- **Dead-code candidate:** unconstructed `BinaryError`, `IpcError`, and `ProcessError` variants cataloged in the semantic reference.
- **Unused dependency candidates:** full Tokio and Windows `zeroize` manifest dependencies.
- **Incomplete lifecycle:** immutable ordinary handle liveness is stale; Windows graceful stop is no-op; macOS wrapper status is synthesized as success.
- **Incomplete IPC:** no framing/auth/peer contract; Unix timeout/EOF/connected/shutdown semantics contradict interfaces; Windows transport absent.
- **Outdated docs:** no-implementation interface rule, runtime selector wording, Linux parity, and whole-Windows-process stub labels.

Repository-wide searches included exports, module loading, traits, factory getters, core callers, user-session flows, exact variants, environment names, tests, builders, and CI. External crate consumers remain unresolved, so exported unused surfaces are candidates rather than definitive dead code. See [the full infra qualification](06-endpoint-infra-platform-runtime.md#dead-legacy-incomplete-and-apparently-unused-code).

## Endpoint proxy dead, legacy, and incomplete code

- **Dead-code candidate:** shared domain-to-IP extraction/resolution/monitored-IP helpers; active capture is port-based and no caller was found.
- **Dead-code candidate:** Windows `flows_s2c` read path; the map is populated/removed but no lookup was found.
- **Incomplete:** redirector `sniff_mode` and `verbose` do not alter active capture/logging; `pfctl_check_interval_secs` is legacy naming under Network Extension.
- **Incomplete:** Linux entry/support claims have no compatible proxy/redirector implementation.
- **Incomplete:** `fail_closed_on_unknown_dest`, several health/probe/restart fields, and other accepted CLI controls have no active behavior matching their descriptions.
- **Legacy:** macOS SCM_RIGHTS file-descriptor path, ACK wait/state machine, `waitForAckAndRelay`, close requests, and associated tracked-stream machinery; current Swift uses TCP relay.
- **Dead-code candidate:** Swift/Rust UDP forwarders and grace-buffer call to `handleUDPFlow`; active UDP branch opens and rejects instead.
- **Dead-code candidate:** Rust reconnection/error-recovery helpers outside tests; Swift owns active reconnect logic.
- **Protocol-only/incomplete:** `ConfigUpdate` receiver type exists but no active Rust sender was found; heartbeat ACK state is written/cleared but not used for health decisions.
- **Incomplete:** Windows receive-worker shutdown, TCP map cleanup, UDP policy consistency, and validation of worker/packet/capacity scalars.
- **Incomplete:** macOS initial control connection has no retry from `startProxy` failure, heartbeat monitor cannot restart after one recovery path, and recovery suppression can remain set until success.
- **Incomplete:** active macOS attribution uses a constant source tuple and rejects IPv6 despite IPv6 Network Extension rules/types.
- **Dead-code candidate:** Windows MessageBox POC has no caller and ignores the user's OK/Cancel result; it also slices UTF-8 by raw byte index.
- **Dead-code candidate:** destination resolver configuration/module paths coexist with a separate active cache and have no production consumer for several knobs.
- **Undiscovered test code:** `tests/unit/alert_payload_tests.rs` is not registered by `unit/mod.rs`.
- **Placeholder test:** the OCR oversize case has no assertions/body exercising production behavior.
- **Alternate artifact:** `SentinelProxyExtension.entitlements` is not referenced by the active Swift build, which uses `TransparentProxyExtension.entitlements`.

Each candidate was searched across exact names, exports, module declarations, feature gates, framework hooks, protocol tags, tests, scripts, and docs. Public/library or external framework use remains labeled as a candidate where repository-only reachability cannot prove absence.

## Endpoint repository shell, delivery, and support candidates

- **Legacy tree:** root `build/` implements an older compile/sign/deploy pipeline parallel to the current `scripts/builder/` and `scripts/distribution/` paths. Both remain committed; current workflows primarily call the newer tree.
- **Legacy/manual predecessors:** multiple root/manual installer, deploy, sign, uninstall, and package scripts duplicate current distribution scripts with incompatible options, paths, and component sets.
- **Broken alternate implementation:** `deployment/deploy.py` reads an undefined parsed `workspace_root` attribute on ordinary execution; its Windows preflight also forms a double-`.exe` proxy name.
- **Dead-code candidate:** `Cargo.sentinel-monitor.toml` is an alternate workspace manifest with no repository caller.
- **Dead-code candidate:** root `config.json` has no exact runtime/configuration loader reference after searches by filename and serialized keys.
- **Dead-code candidate:** `scripts/builder/quilr_endpointagent_mac_installer.zip` is a committed compiled installer archive; no current caller or extraction reference was found.
- **Dormant tests:** root `tests/*.rs` are outside any root Cargo package/test target; their 60 test attributes are not ordinary workspace-discovered tests.
- **Broken helper:** `run_agent_debug.sh` points at nonexistent `target/debug/agent` rather than the checked executable target.
- **Incomplete assertion helpers:** `tools/check_install.sh` and both `.github` precheck wrappers record failures but do not propagate aggregate nonzero status.
- **Incomplete Intune generator:** `--config` is ignored, the private key is read but unused, Windows output depends on an externally supplied PFX, and macOS verification uses a literal rather than configured name.
- **Incomplete mock controls:** mock user-details `disable` and `device` commands both set tenant and device false, contrary to their distinct help/TODO intent.
- **Potentially dangerous test cleanup:** Rust test-server Unix cleanup uses `CommandExt::exec()` while iterating found PIDs, replacing the cleanup process at the first match; the cleanup function has no active caller.
- **Vendored binary:** the 34,196,706-byte SSL.com CodeSignTool JAR is a bundled third-party executable archive. Its release notes establish upstream identity/version family; no committed upstream checksum or reproducible acquisition command exists.
- **Generated/compiled artifact:** the committed macOS installer ZIP contains two arm64 Mach-O executables. Exact source/flags equivalence to the current installer sources is **Unresolved**.
- **Operational artifact:** root `logs.txt` is a committed UTF-16LE broker/monitor log, not source. No generator/retention/redaction policy is committed.
- **Generated documentation assets:** four alert-flow PNG exports and one Draw.io editor-backup file are grouped artifacts; the editable Draw.io source remains separately analyzed.
- **Documentation-only:** the 34-task E2E program, proposed hook DLP chain, proxy v2 plugin/storage/service-context architecture, and SCEP deployment flow are not present as implemented runtime paths.

Candidate reachability was checked through exact names, manifest/workflow/script references, package layouts, tests, docs, generated archive members, and runtime entry points. External systems remain capable of invoking public/manual artifacts, so repository-only non-reachability is labeled as a candidate rather than absolute dead code.
