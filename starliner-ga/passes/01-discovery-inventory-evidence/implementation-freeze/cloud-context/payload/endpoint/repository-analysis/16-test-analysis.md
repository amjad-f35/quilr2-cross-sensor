# 16 — Test Analysis

## Dashboard/API

The API has 15 `_test.go` files: nine ordinary package/unit test files and six integration-package files carrying the `integration` build tag. Their behavior coverage and production-router differences are documented in [Tests and verification status](06-dashboard-api.md#tests-and-verification-status).

**Verified CI status:** the Jenkinsfile builds and pushes images without a test stage. The visible GitHub workflow delegates security CI to an external reusable workflow; its actual Go test behavior is unresolved. Therefore repository test presence is not evidence that it runs in CI.

**Execution status:** Go is unavailable in the analysis environment. No Go tests were executed. Integration tests additionally require migrated ClickHouse and environment credentials.

IPC test analysis is complete in the current and pinned IPC deep references. The remaining sections complete the other repository test suites and CI-discovery checks.

## Dashboard frontend

- No test/spec files, frontend test runner, Playwright config, or test script are tracked.
- TypeScript and Vite production build passed during analysis.
- The 15 repository Playwright console logs are historical diagnostics, not executable/assertive tests; several refer to obsolete authentication behavior.
- No visible Jenkins stage tests the frontend. External security CI behavior remains unresolved.
- Current critical untested behavior includes identity replacement/cache clearing, policy save races, query error states, detail stale-state handling, and client/server parameter parity.

## Dashboard operational-script verification

- `bash -n` passed for `.github/scripts/devsecops-precheck.sh`; scanners/linters were not executed because they require Docker, private images, and a mutable external repository.
- PowerShell is unavailable, so `.github/scripts/devsecops-precheck.ps1` received static analysis only.
- Neither wrapper has repository tests. The external GitHub workflow and Jenkins shared-library code are not visible.
- Both Python app-intel files parse with Python AST, but their dependencies/private services were unavailable and the destructive loader was not run.

## Endpoint core scripting

- Seven local tests exist: two private engine predicates, one duplicate URL matcher, and four workspace traversal cases.
- No local test constructs the engine/sandbox/dispatcher/updater or verifies manifest defaults, host API contracts, timeouts, capabilities, collector poison/clone behavior, signing, invalid-signature enforcement, unsigned environment values, archive/copy safety, or partial recovery.
- System Monitor v2 adds six scanner integration tests. The fixture flow verifies four typed entity kinds. Disabled and missing-script handling are checked.
- Three integration tests inspect real developer home state and return early while printing `SKIPPED` if prerequisites are missing; they are not marked ignored, so no-op execution can report pass.
- Converter unit tests cover application, MCP ID scope, and skill ID scope, not raw entity/event loss, `set_risk`, or dropped typed fields.
- No scripting benchmark is tracked.
- Tests were not executed here: Rust/Cargo is unavailable and the compile-time PEM is absent. CI test execution remains unproven; current production build workflow builds/packages but has no explicit Cargo test stage in the inspected portion.

See [exact test inventory](06-endpoint-core-scripting.md#tests-and-execution-evidence).

## Endpoint DLP templating tests

The completed 11-file templating/UI scope has five tests, all in `models.rs`: ordinary ASCII case-insensitive highlighting, two separated repeated occurrences, one nested overlap, two nonoverlapping entities, and a loose nine-entity case.

There are no tests for commands/registration, Tauri/template startup, window reuse, FIFO order/overflow/counters, shutdown, service IPC integration, HTML/CSP escaping, Unicode offsets, event-ID mismatch, timeout truncation, or active template JavaScript. No test detects the `block.html`/`prompt.html` second-hide skip or stale prompt tags.

Core sets `doctest = false`, so its outdated module usage example is not compiled. Cargo is unavailable locally; CI execution remains unproven. See [the templating test audit](06-endpoint-core-templating-engine.md#tests-and-verification-status).

## Remaining sentinel-core tests and benchmarks

### Discovery accounting

| Surface | Declarations/tests | Cargo status | Checked CI status |
| --- | ---: | --- | --- |
| `core/tests/integration_bootstrap_agent.rs` | 20 tests | direct integration-test executable | not invoked |
| `core/tests/integration_service_lifecycle.rs` | 21 | direct integration-test executable | not invoked |
| `core/tests/service_communication.rs` | 32 | direct integration-test executable | not invoked |
| `core/tests/service_monitoring.rs` | 7 | direct integration-test executable | not invoked |
| `core/tests/service_status_updates.rs` | 11 | direct integration-test executable | not invoked |
| `core/tests/common/**` | 12 internal tests | undiscovered: no direct core test declares `mod common` | not compiled |
| decompression unit tests | 2 | excluded with commented root module | not compiled |
| Criterion targets | 2 targets / 15 group functions | registered but statically incompatible with current alerting API | not built/run |

### Behavioral assessment

- Active defaults register eight broker/process bridge services, not `vault.service` or `timekeeper.service`. Most bootstrap/lifecycle/status tests assert the retired graph and therefore contradict current code; conditional ordering tests can pass vacuously.
- The purported end-to-end Bootstrap → Agent file imports no bootstrap/agent symbol, runs no executable, validates no CLI handoff, and checks no exit code. It only mutates environment and exercises core manager calls.
- Several lifecycle tests suppress startup/wait errors and can report success after failing to establish stated service conditions; others can start the real current default graph and interact with child processes/network/storage.
- Communication tests invoke inactive wrapper objects directly. Vault tests use fixed keys and the ordinary current-user Vault path on macOS/Windows, not a temporary fixture; retrieve/list claims in comments are outdated and several named retrieve tests contain no retrieve call.
- Monitor tests directly call handler methods on a private monitor instance; they do not run the channel loop, crash detector, or process recovery.
- Shared common helpers are byte-identical to workspace-root copies. Under the core edition their environment mutation lacks required unsafe blocks, but the module is currently undiscovered.
- No `serial_test` marker protects environment, fixed Vault keys, or real service state in this final test slice.
- Decompression tests use large realistic documents but no traversal/link/bomb/corruption/permission/quota case. One always writes a hard-coded developer path; the other comments out exact disk/result equality.
- Benchmarks use removed `to_alert_payload`/`AlertPayload`, ignore send errors, do not drain persistence/upload, and mislabel a 519-byte constant as 512.

The companion chapter maps every test name to its actual assertions and current status; the semantic reference covers all 285 Rust declarations. No pass/fail execution is claimed because Rust tooling is unavailable.

## System monitor tests

| Suite | Count/scope | What it demonstrates | Limitation/status |
| --- | --- | --- | --- |
| inline Rust unit tests | 277 declarations (283 total minus 6 integration) | config, maps/correlation, entities/store, native parsers, packages, hooks, sync conversions, DLP | no checked CI invocation; some environment/host-sensitive |
| scanner integration | 6 tests | one deterministic Lua fixture, disabled/missing behavior, real Claude/path/Cursor scans | three use HOME and conditional early-return “skip”; five detectors untested |
| Lua fixture | 1 file | Application/MCP/Skill/Permission collection | does not cover raw graph/risk/rich-field loss |
| manual E2E | Markdown + 5 scripts | operator intent for blocking OpenClaw with local backend/dashboard | not automated; POSIX/sudo/Docker; start script targets main agent binary |
| proposed E2E framework | one design spec | desired mock backend/fake app/macros/CI | Documentation-only; no implementation |

There are 283 `test` attributes and no `ignore`/`should_panic` markers. Twenty-seven tests in `platform/windows.rs` include native/environment behavior. Environment-mutating tests have process-global race risk. No test covers full orchestrator startup, kill-switch/Persona race, live HTTP contracts, Application termination end-to-end, hook client-to-server-to-backend activity, Linux compilation, or production DLP integration.

Exact test declarations and per-file counts are in [the semantic reference](07-symbol-reference/endpoint-system-monitor-v2-semantic.md); behavioral analysis is in [the scripting/test chapter](06-endpoint-system-monitor-scripting-packages-tests-and-documents.md#test-inventory-and-trustworthiness).

## Template service tests

| Test target/location | Automatic declarations | Ignored/manual | Verified behavior |
| --- | ---: | ---: | --- |
| library unit tests in `src/state/mod.rs` | 6 | 0 | regular pagination/FIFO/bound; notification pagination/dedup; one criticality assertion |
| integration target `tests/test_render.rs` | 21 | 0 | protocol round trips, default names/options, three Tera fragments, branding, backend-shaped conversion/skip/override |
| integration target `tests/manual_ipc_sender.rs` | 0 | 5 | live broker/Tauri block, justify, and three notification scenarios when explicitly unignored |
| shell `tests/test_spawn_render.sh` | script steps | manual script | build, package test, duplicate render test, binary existence/size |

Total Rust test declarations are 32: 27 automatic and five ignored. The test named `test_needs_attention_no_timeout` does not check timeout; its helper sets timeout 10 and the assertion checks only criticality. Manual tests wait up to 120 seconds and need separately running broker/service.

Important uncovered behavior includes startup/config fallback, kill-switch gate/shutdown, IPC cumulative retry/malformed frames, handler registry/type routing, regular dedup, both queue-source paths, every response-correlation edge, broker dismiss/status notification omissions, every Tauri command, window creation/native close, JavaScript timers/dismiss-all/duplicate IDs, CSP, zero limits, and full System Monitor-to-template-service behavior.

The shell script's comments claim spawn/start/kill/help verification, but it never executes the binary. `cargo test -p template-engine` already includes `test_render`, so the next step repeats it. Its displayed JSON contains obsolete `company_name`, which current Serde ignores, instead of `branding_text`.

No checked repository CI command names the package or script. External reusable CI behavior is unresolved. Rust/Cargo were unavailable, so no tests were run during this analysis.

## Email-discovery tests

The two-file package contains zero test declarations. Related core code has three tests: one host-dependent nine-source smoke test, one Unix length-frame round-trip with a PID-suffixed test path, and one nonexistent-socket cleanup test.

The frame test manually constructs/writes bytes; it does not invoke helper `send_frame` or launch the binary. There is no Windows test and no coverage for CLI/env precedence, empty path, exit status, serialization fallback, source failure conversion, fixed production path, Unix permissions/peer identity, null-DACL client race, 1 MiB rejection, timeout/kill/reap, platform user-session spawning/environment, concurrent runs, or artifact packaging.

No checked CI command names `email-discovery`. External workflow behavior is unresolved; the package was not runnable in this analysis environment.

## Diagnostics tests

The subtree has five ordinary unit tests and one nonignored Tokio integration test:

- one payload JSON round-trip;
- Event, Batch, and Lifecycle envelope round-trips;
- one three-event storage write/read/mark/read success cycle;
- one live fixed-localhost OpenSearch test that emits three records, waits three seconds, and accepts any prior/current `message:Integration*` hit.

The integration test uses persistent fixed `/tmp/diag_integration_test`, performs no cleanup/isolation, does not assert search HTTP status, and waits less than the committed five-second refresh interval. Old records can satisfy it. It is not feature-gated/ignored, so ordinary package tests attempt external OpenSearch. README and test-source commands name incorrect/nonexistent targets/config files.

No test covers macros compiling, component inference, config boundaries, repeated/no-runtime init, worker scheduling/starvation/shutdown, storage corruption/restart/partial I/O/zero limits, IPC connect/retry/drop/source/malformed/Batch dispatch/lifecycle/shutdown, receiver ID/time rewrite, Bulk item failures, Docker startup/setup failure, security/permissions, build-resource staging, or process registration. Neither checked workflow invokes tests. Rust/Cargo were unavailable locally, so these declarations were inspected but not run.

See [the complete diagnostics test analysis](06-endpoint-diagnostics-receiver.md#tests).

## Endpoint infra tests

The final 46-file platform-runtime slice has 47 inline `#[test]` functions: five interface, 23 macOS resolver/IPC/process, four platform-object/selector, and 15 Windows resolver/IPC/process tests. They are target-compiled through the library module cfgs.

- Linux selector test obtains `LinuxServices` and calls two `todo!` getters, so source inspection shows it will panic/fail.
- macOS and Windows ordinary process tests exercise shell commands, environment addition, missing binary, PID, and force kill.
- No test exercises macOS launchctl/console/PID attachment, Windows WTS/token/native user spawning, Job Objects, either stale-process scanner, Windows config-env omission, Windows quoting, Unix IPC round trip, server shutdown/Drop, socket permissions, timeout error mapping, EOF mapping, or connected-state accuracy.
- One macOS test removes global `SENTINEL_SERVICE_MODE` without restoring it or serializing environment access.
- Resolver tests include tautological creation assertions and host-dependent executable/PATH assumptions.
- The Unix server test uses fixed `/tmp/test-server.sock`, permitting parallel/external collision.
- Stub IPC tests check only construction, not that all operations return `NotImplemented`.
- No checked GitHub workflow invokes `cargo test`; builds do not prove test success.

Rust/Cargo were unavailable, so these tests were classified but not executed. See [the infra test matrix](06-endpoint-infra-platform-runtime.md#test-analysis).

## Endpoint proxy tests

Static source declares 318 tests: 154 under `proxy/tests/*.rs` roots and 164 inline under `proxy/src/`. The `tests/lib.rs` tree accounts for 121 (4 WebSocket, 9 forward, 11 body, 28 request-context, 29 state, 7 traffic-logger, 33 proxy-flow). Separate roots/files add 10 undiscovered alert-payload tests, 13 feature-gated OCR tests, and 10 IPC integration tests.

Discovery and compile boundaries matter:

- `tests/unit/alert_payload_tests.rs` is not imported by `tests/unit/mod.rs`, so its ten declarations are not discovered through the main harness.
- `tests/ipc_integration_test.rs` unconditionally imports the mac redirector module without a target/feature gate or Cargo `required-features`; plain/non-mac configurations cannot resolve the path.
- OCR is gated by `image-ocr`; one oversize test is an empty placeholder.
- Rust/Cargo is unavailable in the analysis environment, so no test was executed. Root CI execution remains unresolved until the remaining `.github/` pass; a compile-looking test file is not counted as passing.

Coverage quality findings:

- WebSocket tests build requests and independently recompute the accept hash; they do not call production upgrade/relay code.
- Forward tests cover `safe_method_no_body`, not request reconstruction, header preservation, proxy routing, retries, or circuits.
- Body tests do not truncate at a multibyte UTF-8 boundary and therefore miss the verified slicing panic.
- Request-context tests pass lowercase direction and miss the production capitalized-direction mismatch.
- Traffic tests do not inspect output files, force write failures, or shut down the intentionally leaked logger runtime.
- Proxy-flow “bypass” tests mostly call `is_dlp_domain`, not the actual monitor/bypass method. Their mock server proves TCP acceptance, not proxying.
- Certificate tests use fixed relative files, creating parallel-run collision risk.
- OCR correctness assertions accept success, empty result, or engine failure; failed results are not cached, weakening cache-eviction coverage.
- IPC tests use a test-owned Unix listener and do not run production listener, FD passing, permissions, relay authentication, or Swift interoperability.
- No test covers the Windows shutdown hang, FIN/RST reinsertion, UDP policy mismatch, macOS initial-listener race, heartbeat restart failure, relay spoofing, active UDP rejection, or Swift hard-coded rules.

The per-file map and documentation-only test claims are in [the proxy test audit](06-endpoint-proxy-build-tests-docs.md#test-topology).

## Endpoint root, delivery, and support tests

- Root `tests/` declares 60 Rust test attributes: 48 integration-style cases across two files and 12 helper-module tests. Because the root manifest is a virtual workspace with no root package and no `[[test]]` target, those files are not discovered by ordinary root `cargo test --workspace` target discovery. They are dormant test sources as committed.
- `test_bootstrap_integration.sh` is a manual shell test. `set -e` causes several intended status-inspection branches to exit before their custom diagnostics, and the final message can still label a warning path successful.
- `run_agent_debug.sh` expects `target/debug/agent`, while the checked primary executable name is `sentinel`; no matching root binary target named `agent` was found.
- `test-server/rust-server` contains seven test functions and eight `#[tokio::test]` attributes because one function is annotated twice. It is outside root `default-members`, and no checked workflow targets it.
- The Python test server, local CDN, mock user-details server, installation checker, signing wrappers, package builders, installers, uninstallers, updater orchestration, and Intune profile/script generator have no dedicated automated test suite in the repository.
- `tools/check_install.sh` accumulates failures but does not return a nonzero final exit status. It is therefore an observational helper, not a reliable CI assertion command.
- The checked macOS/Windows build workflows do not run any Rust, Python, shell, PowerShell, installer, update, signing, or package smoke test. The external precheck repositories may run tools, but exact checked-out behavior is **Unresolved** and the local wrappers do not propagate their aggregate failure.
- Documentation proposes a 34-task `e2e/` test program and additional seams/workflows; no `e2e/` tree or named implementation exists. This is `Documentation-only`, not test coverage.

Rust/Cargo were unavailable, so dormant/duplicated tests were not compiled. The complete evidence is in [the endpoint root/tools/tests chapter](06-endpoint-root-tools-tests-and-documentation.md) and [delivery chapter](06-endpoint-build-release-install-and-update.md).
