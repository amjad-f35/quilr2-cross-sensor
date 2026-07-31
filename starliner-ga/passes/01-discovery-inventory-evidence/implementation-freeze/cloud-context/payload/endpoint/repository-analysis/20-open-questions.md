# 20 — Open Questions

## Dashboard/API

- **Unresolved:** which compatible component populates and refreshes `endpoint_app_catalog`. The committed app-intel loader instead writes legacy `app_catalog` and reads legacy `entity_device_state`; no migration alias or deployed compatibility view is present.
- **Unresolved:** which production reverse proxy or network policy, if any, verifies portal JWTs and prevents direct access to port 33333. No such artifact is tracked here.
- **Unresolved:** whether the external reusable security workflow compiles or tests Go.
- **Unresolved:** whether production runs seed; repository Compose development mode does, production Compose does not.
- **Unresolved:** intended semantics of the 30-day inventory predicate based on `min(last_synced_at)` rather than recent activity.
- **Unresolved:** intended conflict behavior for simultaneous tenant-policy writers across API instances.

Other subsystem questions will be appended as analysis progresses.

## Dashboard frontend

- **Unresolved:** whether the portal guarantees the login token query is protected from URL/referrer/proxy logging outside repository configuration.
- **Unresolved:** whether switching tenant identities within one SPA instance is supported; current caches are tenant-agnostic.
- **Unresolved:** whether alert actions are intended as verbs (`block`, `allow`) or past-tense states (`blocked`, `allowed`); server does not constrain them and UI assumes the latter.
- **Unresolved:** whether Claude OTel and Skills UI are intentionally retired or temporarily disconnected.

## Endpoint core scripting

- **Unresolved:** which OS/deployment controls protect packaged Lua files and configured script roots from modification by less-trusted principals.
- **Unresolved:** whether the CI-supplied Ed25519 public key is correctly formed/rotated and which external process, if any, signs manifests; secret contents are intentionally absent.
- **Unresolved:** whether external crates use the locally uncalled manifest engine, event dispatcher, updater, emitted-event, or error-collector APIs.
- **Unresolved:** dependency-level archive path/link hardening and complete mlua base-global behavior not specified by repository code; Rust dependencies/toolchain are unavailable locally.
- **Unresolved:** intended downstream representation for `RawEntityDescriptor`, emitted events, aggregate `set_risk`, and the many typed skill/agent/application fields currently discarded.
- **Unresolved:** whether the older branch-specific CI workflow can build scripting from a clean checkout despite not materializing the required PEM.

## Endpoint core DLP templating engine

- **Unresolved:** which ACL/signature/integrity controls protect installed HTML templates and environment-selected template roots.
- **Unresolved:** which production principals can address `templating_engine_service` through the self-asserted broker identity boundary.
- **Unresolved:** exact Tauri/Tera versions and corresponding dynamic-CSP/JSON-encoding behavior because no Cargo lockfile is committed.
- **Potential issue requiring validation:** whether first-render raw text can inject and execute a fixed-nonce script under the target OS webview/Tauri build.
- **Unresolved:** whether external crates construct true `resp_sender: None` contexts, zero/oversized timeouts, or additional template names.
- **Unresolved:** whether `dismissed` should mean cancellation like `closed`; current Rust treats it as `Some(value)`.
- **Unresolved:** whether block decisions should return `None` rather than `Some("blocked_automatically")`; checked notification callers discard the result.
- **Unresolved:** the intended event-ID uniqueness and request-binding guarantee for simultaneous proxy work.

## Endpoint core crate shell, tests, and decompression

- **Unresolved:** whether decompression was intentionally disabled for safety/build reasons or merely never integrated after its feature work.
- **Unresolved:** approved provenance, copyright/license, and data classification for the 129,115,948 bytes of committed document/email archive fixtures.
- **Unresolved:** exact archive/Tauri/transitive versions in deployed builds because no Cargo lockfile is committed.
- **Unresolved:** dependency-level canonical path, symlink, reparse-point, and fallback extraction protections beyond the repository's lexical checks.
- **Potential issue requiring validation:** whether timed-out `spawn_blocking`/fallback workers continue filesystem writes after the public archive call returns, and for how long on supported targets.
- **Unresolved:** whether RAR dynamic-library requirements are satisfied by platform builders despite the source header calling support pending.
- **Unresolved:** whether deployed Tauri uses `core/icons` by convention or builders merely install unused duplicate resources.
- **Unresolved:** whether an external CI layer outside the checked workflows runs core tests, benches, Clippy, or `grpc_server` checks.
- **Unresolved:** whether legacy Vault/TimeKeeper wrappers/tests should be removed, feature-separated, or restored to defaults.
- **Unresolved:** whether any developer/CI run has modified real user Vault data through the fixed-key direct integration tests.
- **Unresolved:** intended `table` versus `schema_id` gRPC wire/API name and whether any external patch step exists.

## System monitor unresolved questions

- **Unresolved:** whether a production supervisor passes the committed `sysmon-config.json` (localhost general sync plus preprod app-add) or a replaced environment-specific file.
- **Unresolved:** whether external packaging/OS ACLs protect the broker, Lua scripts, snapshot, hook configs, JSONL logs, and template IPC beyond code-visible controls.
- **Unresolved:** what local principal/source validation the pinned broker supplies for kill-switch and Persona messages.
- **Unresolved:** whether Linux is intentionally unsupported despite committed Linux rules, or whether an external patch/target excludes orchestrator code.
- **Unresolved:** whether backend `/endpoint/app/add`, discovered-apps, delta, alerts, activity, and process-map schemas at deployment exactly match this agent revision; dashboard analysis must cross-check each.
- **Unresolved:** intended handling for same-name cross-kind UUID collisions and same-name MCP servers in different parent applications.
- **Unresolved:** whether existing entity payloads are intentionally immutable; current upsert prevents version/URL/command/risk/count refresh.
- **Unresolved:** intended lifecycle for exited process Applications, whose stored `is_active` remains true.
- **Unresolved:** whether hook evaluator is intentionally telemetry-only or missing the proposed DLP/policy stage.
- **Unresolved:** whether raw Lua relationships/composite risk/rich artifact fields are intentionally excluded from sync or were lost during v2 conversion.
- **Unresolved:** intended manifest/signature trust model for staged Lua scripts, because the active executor bypasses it.
- **Unresolved:** actual log/raw-hook-event retention, redaction, and access policy for prompt/command/path/user/device data.
- **Unresolved:** whether any external CI job compiles both supported targets and runs the 283 tests; checked repository jobs do not.
- **Unresolved:** why ADR 016 is absent and which, if any, intended decision it contained.
- **Unresolved:** whether the manual E2E script's main-agent binary target is intentional integration or stale naming.

## Template service unresolved questions

- **Unresolved:** which production principals/ACLs can register with or address the pinned local broker, and whether they can spoof render/dismiss/status/kill-switch sources.
- **Unresolved:** production contents, ownership, permissions, update mechanism, and integrity controls for `template_engine.toml`, both registry JSON paths, and runtime HTML templates.
- **Unresolved:** whether deployed builds retain the compile-time source `CARGO_MANIFEST_DIR/templates` directory, which would outrank installation-path templates.
- **Unresolved:** final combined CSP behavior between Tauri's fixed-nonce policy and the HTML meta policy allowing inline scripts under the exact beta/Tauri versions; no lockfile is committed.
- **Potential issue requiring validation:** whether configurable template markup can execute script or invoke privileged Tauri operations after `innerHTML` insertion under production CSP/ACLs.
- **Unresolved:** native close behavior for undecorated but closable windows and whether a close can strand active state without a response.
- **Unresolved:** intended semantics for duplicate requests: aggregate one visual event while responding to every ID, or explicitly treat later IDs as coalesced without responses.
- **Unresolved:** intended response target for queued requests and for a third-party broker dismiss command; current code reuses the completing/dismissing source.
- **Unresolved:** whether the notification X control is intentionally “dismiss all,” including silently abandoning pending items, or should dismiss only current.
- **Unresolved:** whether status/dismiss should include notification and queued state and what response a not-found ID should receive.
- **Unresolved:** intended purpose of config default timeout fields and whether absent request options should be defaultable at the Serde boundary.
- **Unresolved:** whether `show_timer = false` with positive timeout is intended to auto-dismiss invisibly; JavaScript uses timeout alone.
- **Unresolved:** whether navigation should preserve elapsed time via `created_at`; current navigation restarts the full timer and `created_at` is unread.
- **Unresolved:** intended use of theme/original/header/justification choices/logo URL fields and whether their current no-op behavior is compatibility scaffolding.
- **Unresolved:** whether backend templates are populated by an external file-producing component absent from the repositories; this service performs no HTTP fetch.
- **Unresolved:** whether external CI runs the 27 automatic tests or any target-specific build/CSP/UI test; checked workflows do not.
- **Unresolved:** why template-service icons are duplicated but excluded from its Tauri icon list, and whether packaging consumes them by convention.

## Email-discovery unresolved questions

- **Unresolved:** effective Unix socket permissions and whether the intended user can connect while other local principals cannot.
- **Unresolved:** whether a per-run nonce/authenticated peer is required to bind returned identity candidates to the spawned child.
- **Unresolved:** whether fixed-name concurrent runs are structurally prevented by Persona call serialization elsewhere.
- **Unresolved:** intended error contract for partial source failure and serialization failure: successful empty/partial result versus nonzero child status.
- **Unresolved:** whether parent should watch/reap child exit concurrently rather than wait a 30-second accept deadline.
- **Potential issue requiring validation:** local Windows client preemption/injection through the predictable null-DACL pipe.
- **Potential issue requiring validation:** correct Windows user-profile discovery without a user-token environment block or merged `ProcessConfig.env`.
- **Unresolved:** correctness of macOS `HOME`/`USER` copied from the daemon under multiple interactive sessions/fast user switching.
- **Unresolved:** whether distribution/QA artifacts include `email-discovery` through an indirect builder path despite no direct name reference.
- **Unresolved:** why the guide documents wildcard endpoint names while the implemented address is fixed.

## Diagnostics unresolved questions

- **Unresolved:** what deployed supervisor, if any, launches `sentinel-diagnostics` after its core default definition was commented out.
- **Unresolved:** whether an external release stage copies the Cargo-generated `docker` directory beside installed binaries.
- **Unresolved:** whether OpenSearch is intended only for development or receives external production authentication/TLS/configuration.
- **Unresolved:** effective receiver working directory and OS permissions for `.log`/`.sent`.
- **Unresolved:** whether receiver regeneration of UUID/timestamp and loss of broker process identity are intentional.
- **Unresolved:** external monitoring/recovery, if any, for OpenSearch Bulk item failures and failed `.sent` writes.
- **Unresolved:** intended file retention, rotation, corruption repair, and privacy policy.
- **Unresolved:** whether external crates use Batch, Crashed, direct macros, `is_initialized`, or the `centralized` feature.
- **Unresolved:** whether an external CI system runs diagnostics tests/IPC contracts not represented in checked workflows.
- **Potential issue requiring validation:** local broker injection under claimed participant identity, subject to deployed IPC ACLs.
- **Potential issue requiring validation:** privileged relative-path file creation/symlink exposure, subject to deployed working-directory ownership.

## Endpoint infra unresolved questions

- **Unresolved:** whether Linux is intentionally unsupported despite being a workspace target/selector branch, or an external patch supplies its four missing factories.
- **Unresolved:** whether external users consume the public `IpcServer`, process factory, spawn-service helper, or inert-looking module-index paths.
- **Unresolved:** exact macOS `launchctl asuser` wrapper wait/reparent behavior under deployed OS versions and whether newest-name `pgrep` ever attaches an unrelated process.
- **Unresolved:** correct `HOME`/`USER` source under macOS fast-user-switching; code copies the privileged parent's values, not values derived from the console uid.
- **Unresolved:** exact ambient environment inherited by `CreateProcessAsUserW` with the null environment pointer, and observable failures caused by dropping the per-spawn map.
- **Unresolved:** whether Windows active process services depend on `SERVICE_NAME`, `IPC_SOCKET`, `NO_COLOR`, log, or template entries absent from the native map path, beyond separately supplied broker ambient state.
- **Unresolved:** whether target Windows host Job policies permit assignment and whether containment warnings are operationally monitored.
- **Unresolved:** deployed Unix socket modes/ACLs/umask and whether a less-trusted local process can connect to or replace standard endpoints.
- **Potential issue requiring validation:** destructive stale-child basename/parent heuristics under PID reuse, permission-denied parent probes, or unrelated same-name binaries.
- **Potential issue requiring validation:** Windows command-line argument round-trip for quote/backslash edge cases.
- **Unresolved:** whether an external CI system runs supported-target infra tests and catches the statically failing Linux selector test.
- **Unresolved:** whether unused `tokio`/`zeroize`, duplicated interface indexes, and public placeholder surfaces are compatibility commitments or removable debt.

## Endpoint proxy unresolved questions

- **Unresolved:** which exact proxy feature set, CLI arguments, config files, CA material, extension profiles, and environment values production deployments use; proxy-local scripts show examples, not authoritative deployment state.
- **Unresolved:** whether the external `quilr_rust_sdk` implementation supplies the intended local/AI behavior and what version is paired with this commit.
- **Unresolved:** whether external CI runs any of the 318 static test declarations, and on which macOS/Windows targets/features.
- **Unresolved:** whether a supervising agent reliably restarts the proxy when a startup listener/redirector task fails or the internal auto-restart path is inert.
- **Unresolved:** deployed listener exposure, firewall rules, CA/key modes, log ACLs/retention, and whether health/metrics are reachable outside the host.
- **Unresolved:** deployed broker ACLs and whether less-trusted local clients can request Persona tokens, send kill-switch/template messages, or inject diagnostics/alerts.
- **Unresolved:** whether macOS sandbox/network policy prevents unrelated local processes from connecting to the random relay/heartbeat ports despite the absence of application authentication.
- **Potential issue requiring validation:** forged relay metadata/process attribution from a localhost peer.
- **Potential issue requiring validation:** Windows shutdown hang under real WinDivert blocking semantics and whether external process termination masks it operationally.
- **Potential issue requiring validation:** Windows TCP FIN/RST cleanup followed by same-function map reinsertion and long-term flow-map growth under churn.
- **Potential issue requiring validation:** UDP local-port reuse causing stale process attribution within TTL, and tracker-capacity overshoot under concurrent insertions.
- **Unresolved:** whether the Swift initial control-socket race occurs consistently in packaged startup ordering or an external pre-existing socket/listener masks it.
- **Unresolved:** intended behavior for monitored UDP/QUIC on macOS: bypass, block, or forward. Code blocks while retained docs/helpers describe forwarding.
- **Unresolved:** intended source-address and IPv6 model for relayed flows; current Swift/Rust serialization and attribution cannot preserve it.
- **Unresolved:** which of the two extension entitlement files is authoritative and whether their differences affect shipped capability/signing.
- **Unresolved:** why Cargo/plist/health versions differ and which one is operationally consumed for upgrades/monitoring.
- **Unresolved:** whether fixed/shared circuit-breaker identities intentionally couple unrelated upstream destinations.
- **Unresolved:** the correct failure policy when analyzers, policy, UI, alerts, or logging fail; current behavior mixes fail-open traffic, default-action enforcement, and dropped observability.

## Endpoint delivery, root, and support unresolved questions

- **Unresolved:** which of the overlapping current, old, manual, and Python build/deployment trees is authoritative in each production environment.
- **Unresolved:** what external system consumes uploaded Actions artifacts, publishes update metadata/archives, performs staged rollout, or implements rollback.
- **Unresolved:** whether an external CI service runs Rust tests, Clippy, installer smoke tests, signature validation, or E2E suites absent from checked workflows.
- **Unresolved:** exact deployed feature sets and byte provenance for each packaged executable because lockfiles are ignored and several packaging branches copy unsigned/original paths after signing.
- **Unresolved:** whether the committed development private key/PKCS#12 material has ever crossed into a distributed package or environment, and whether it has been rotated/revoked externally.
- **Unresolved:** upstream acquisition checksum and repository-specific modifications, if any, for the vendored CodeSignTool JAR and support bundle.
- **Unresolved:** source commit, flags, and intended consumer for the committed arm64 macOS installer ZIP.
- **Unresolved:** whether external configuration or wrappers compensate for `deployment/deploy.py`'s undefined parser field and Windows double-suffix preflight.
- **Unresolved:** how updater replacement coordinates with privileged installers/package managers and whether external supervision repairs a partial multi-file update.
- **Unresolved:** actual OS ACLs/modes for installed binaries, keys, certificates, logs, IPC endpoints, launchd jobs, and Windows services after administrator/MDM execution.
- **Unresolved:** intended service account for Windows services; active script behavior uses the current/default service context and no repository service-account hardening policy was found.
- **Unresolved:** whether the Intune workflow expects a separately generated PFX and, if so, how it is delivered and protected.
- **Unresolved:** whether root `tests/` are intentionally archival or were expected to be attached to a package/explicit test target.
- **Unresolved:** whether root `config.json`, `Cargo.sentinel-monitor.toml`, committed operational logs, and the macOS installer ZIP are compatibility artifacts or removable residue.
- **Potential issue requiring validation:** unauthenticated local-CDN switch/file controls if the server is bound beyond an isolated developer host.
- **Potential issue requiring validation:** unbounded test-server threads/blocking reads and cleanup behavior when used on shared hosts.
- **Potential issue requiring validation:** packaging a development CA private key or trusting/importing broadly scoped certificates under production-selected modes.
