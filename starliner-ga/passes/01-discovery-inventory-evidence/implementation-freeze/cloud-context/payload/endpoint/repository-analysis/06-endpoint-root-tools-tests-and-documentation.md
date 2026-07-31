# Endpoint Root, Test Utilities, Dormant Root Tests, and Documentation Audit

This chapter closes the endpoint repository's remaining root/support files, `tools/`, root `tests/`, and 52 previously pending `docs/` artifacts. Build/deployment roots are detailed separately in [Endpoint build, release, installation, update, and removal](06-endpoint-build-release-install-and-update.md).

## Root file inventory and role

| Path | Verified role | Status / important evidence |
| --- | --- | --- |
| `Cargo.toml` | virtual Cargo workspace manifest | Active; 13 members including three pinned IPC crates and `tools/test-server`; 11 default members; resolver 3; release debug level 2 |
| `Cargo.sentinel-monitor.toml` | alternate virtual-workspace manifest | **Dead-code candidate / legacy:** excludes proxy and email-discovery, has no repository caller, and is not a Cargo conventional filename |
| `.gitmodules` | pinned IPC submodule declaration | Active source dependency; SSH URL, `dev` tracking hint, checked detached commit `9ce5b251…` |
| `.gitignore` | source/build ignore policy | Active developer/build metadata; ignores all Cargo locks, PEMs, WinDivert, generated deployment/dist, credentials, targets, and much local-agent metadata |
| `LICENSE.txt` | commercial license notice | Active repository/legal metadata; same product license family as crate copies |
| `manifest.xml` | old build file list and current package version source | Mixed active/legacy: current builders read `<Version>0.30.276</Version>`; old builder consumes file records that name obsolete outputs |
| `config.json` | empty global-config-shaped JSON | **Dead-code candidate:** exact filename/path and distinctive description/field searches found no production consumer |
| `readme.md` | one-command root README | Outdated/incomplete; only a Cargo command and no operational contract |
| `usage.md` | alpha usage guide | Substantially outdated and contradictory; root tests it names are undiscoverable and bootstrap contract is wrong |
| `release_notes.md` | release 0.2.0 prose dated November 2025 | Historical; current code/package is 0.30.276 and implements/changes many listed planned or ready capabilities |
| `Project.md` | typo-heavy task list | Planning-only; does not state completion and must not be treated as implementation |
| `coding_guidelines.md` | review/test/documentation aspirations | Governance prose; repository code and checked CI do not satisfy “test each function” or test/coverage gating |
| `logs.txt` | committed UTF-16LE operational log | **Generated runtime artifact:** 522,888 bytes / 1,180 decoded lines, committed April 3 2026; contains process/service/IPC/log context; no runtime consumer |
| `run_agent_debug.sh` | developer launch helper | Stale/broken: runs nonexistent `target/debug/agent`; Cargo binary is `sentinel` |
| `test_bootstrap_integration.sh` | manual old package/bootstrap smoke script | Legacy/manual, not a Cargo test or current CI step; warning-only exit interpretation undermines its success summary |
| `build.sh`, `build.ps1` | old build launchers | Legacy/manual; see build chapter |

### Workspace dependency shape

The root manifest has no `[package]`; it is a virtual workspace. Members are core, agent, infra, proxy, bootstrap, test-server, diagnostics, monitor v2, three IPC crates, template-service, and email-discovery. `default-members` excludes `tools/test-server`, `ipc-light`, and `ipc-light-macro` as direct default targets, though dependencies can still build them.

`Cargo.sentinel-monitor.toml` omits proxy and email-discovery and has no release profile. Exact-name searches across scripts, CI, documentation, and source found no consumer. External `cargo --manifest-path Cargo.sentinel-monitor.toml` invocation remains possible, so it is a candidate rather than conclusively dead.

All `Cargo.lock` paths are ignored and absent. Exact transitive versions are not recoverable from the commit without re-resolution.

### Root manifest contradiction

Current builders use `manifest.xml` only as the version source. Its per-platform file lists still name `sentinel-monitor(.exe)` rather than `sentinel-monitor-v2`, require `libsentinel_core.{dll,dylib}`, omit template-engine/email-discovery/hook clients, and describe macOS support-directory binaries rather than the current app-bundle shape. The old Python builder consumes these stale file records and can therefore fail or create a package incompatible with current deployment.

The active distribution scripts often look for a package manifest during fallback version discovery, but current builders do not add root `manifest.xml` to their final ZIPs. The mac installer searches lowercase `<version>`, which does not match this file's `<Version>` even if externally inserted.

### Committed operational log

`logs.txt` begins with IPC broker output and includes ANSI-coded trace records such as monitor Persona connection failures. It is not ignored because the rule covers `*.log`, not `logs.txt`. **Potential issue:** operational logs can expose host/process/path/identity context; exact data sensitivity depends on content and organizational policy. This analysis did not reproduce potentially sensitive records beyond structural classification.

## Root test tree is not discovered by Cargo

The six tracked paths under `tests/` contain 60 test attributes: 22 in `integration_bootstrap_agent.rs`, 26 in `integration_service_lifecycle.rs`, and four each in three common helper modules. `tests/common/mod.rs` is a module index.

Because root `Cargo.toml` is virtual and declares no root package, root `tests/*.rs` are not Cargo integration-test targets. There is no `[[test]]` mapping from any member package to these paths. Commands documented in `usage.md` such as `cargo test --test integration_bootstrap_agent` therefore do not select these files from this workspace revision.

### What the dormant tests model

The integration files construct core `ServiceManager` state and mainly exercise retired Vault/TimeKeeper/default-service expectations. Despite the filename/header, `integration_bootstrap_agent.rs` does not run the bootstrap or agent executable, and it does not invoke the validation chain. Common helpers offer:

- `AssertService` registration/state/dependency assertions;
- bootstrap environment guards and fake bootstrap variables;
- `TestFixtures` managers, definitions, temp paths, and registrations.

They assume Vault and TimeKeeper are default services, while `core/src/defaults/services.rs` currently registers eight different services and comments those definitions out. Some helpers also use environment mutation patterns incompatible with edition-2024 unsafe requirements in the checked context. Since the files are undiscovered, neither compilation nor assertion behavior is currently enforced.

### Manual bootstrap script

`test_bootstrap_integration.sh` builds, invokes the old root build, checks old `out/` files/signatures, and launches bootstrap. Under `set -e`, branches that inspect `$?` immediately after an unguarded failing command are unreachable. Several unexpected bootstrap exit codes are converted to warnings, and the script prints a success summary regardless. It is macOS/code-sign/log oriented and absent from checked CI.

## `tools/check_install.sh`

This manual macOS installation verifier checks twelve groups of file, app, service, environment, certificate, system-extension, process, hook, config, network, scheduler, and log state. Its paths reflect current support/app deployment better than the alternate Python docs: it expects hooks under the user home, service installation path under support, and app-bundle proxy state.

It counts PASS/WARN/FAIL and prints a failure summary, but never calls `exit` with the failure count or nonzero status. A caller sees success if the final `echo` succeeds. When run under sudo, use of `$HOME` can select root rather than the console user's files. It is a diagnostic report, not a gating health check.

## `tools/local_cdn.py`

This is a single-threaded `http.server.HTTPServer` bound to `0.0.0.0` (default port 8443) for updater testing. It strips the endpoint CDN prefix and serves `update.json` or the requested ZIP basename from a mutable root. Optional TLS wraps the socket with operator-supplied cert/key.

Interfaces:

| Request | Behavior |
| --- | --- |
| `GET /endpoint-agent/prod/<platform>/<arch>/update.json` | serves `<root>/update.json` |
| `GET /endpoint-agent/prod/<platform>/<arch>/<name>.zip` | serves `<root>/<basename>` |
| `GET /cdn/switch?root=<directory>` | changes the process-wide root after checking it is a directory |
| `GET /cdn/status` | returns root, directory files, and request count |
| other GET | returns server help/status JSON |

There is no authentication or source-address restriction. Because root switching accepts any existing directory and status lists filenames, a network peer can redirect the server to arbitrary locally readable directories and fetch known basenames. **Potential issue requiring validation:** this is explicitly test tooling, but binding it to a non-isolated network exposes a local-file oracle/reader for guessed filenames. The standard `HTTPServer` is non-threaded, so one slow transfer blocks later requests; the request log is process-local and capped to the last 100 entries.

## `tools/mock_user_details_server.py`

This localhost-only (`127.0.0.1`, default 8080) manual Persona/kill-switch mock returns a fixed fetch-user-details response for matching POST paths, `/health`, and `/config`. Its mutable global configuration controls tenant/device enabled flags and identity fields.

The interactive commands do not match their descriptions:

- `disable` sets tenant and device false despite a TODO saying device should remain unchanged;
- `device` sets tenant and device false despite saying device-only;
- `enable` sets both true.

It is unauthenticated but loopback-bound. Requests execute on one `HTTPServer` thread. No automated tests or current CI caller were found.

## `tools/test-server`

### Python server

`server.py` is a general HTTP fault-injection process. It binds `0.0.0.0`, records parsed and raw requests under a lock, supports all common verbs, and reserves `__control` endpoints for configuration, message/raw retrieval/clear, health, and shutdown. Config modes are normal, drop, block, delay, and reset; status, headers, body, and delay values are accepted without schema/range validation.

The control plane is unauthenticated. A test host exposed beyond a trusted network lets any peer change response behavior, read captured headers/bodies, clear state, or stop the server. Captured Authorization/user payloads are retained in memory until clear/exit.

Every verb, including HEAD, reaches the common response writer. The writer emits the body for HEAD after advertising Content-Length, contrary to HTTP HEAD response semantics. The server is `ThreadingHTTPServer` in the checked startup path, so shared state locks serialize mutation/read snapshots but response threads are otherwise unbounded by repository code.

The Python cleanup path examines PID files and removes dead/invalid entries; it does not terminate a live stale server.

### Rust library

`tools/test-server/src/lib.rs` exports `Mode`, `Message`, `RawMessage`, `Config`, `TestServer`, `TestServerPool`, assertion helpers, and `cleanup_stale_servers`. `TestServer::start_internal` chooses an unused port, spawns `python3 server.py --quiet -p`, synchronously reads the first stdout line in `spawn_blocking`, parses startup JSON, then polls health.

The comment calls the startup read timed, but no Tokio timeout wraps the blocking read. If the child keeps stdout open without a line, start can hang indefinitely. `cleanup_stale_servers` is not called by `start` despite its documentation saying automatic cleanup. On Unix it calls `std::os::unix::process::CommandExt::exec()` on `kill -9`; the first valid PID replaces the entire test process, preventing subsequent cleanup and PID-file removal.

Seven test functions exist, represented by eight `#[tokio::test]` attributes because `test_configure_response` has the attribute twice. **Potential static issue requiring compilation:** duplicate procedural test attributes may not expand as intended. No checked CI job runs this non-default workspace member, and Cargo is unavailable in the analysis environment.

### Documentation contradiction

`tools/test-server/README.md` and `QUICKSTART.md` describe convenient automatic cleanup and reliable startup. Cleanup is neither called on start nor safe on Unix if called, and startup has no actual first-line timeout. The control-plane trust boundary is not emphasized.

## Documentation artifact classification

The following 52 paths are all accounted for. Documentation claims were compared to implementation rather than accepted as truth.

| Group | Paths/count | Classification and result |
| --- | --- | --- |
| overview | `docs/Overview.md` (1) | Handwritten architecture aspiration; byte-identical to `.cursor/AGENTS.md`; partially implemented and materially overstated |
| hook integration | `docs/adr-detection-hook-integration.md` (1) | Proposed ADR; evaluator plumbing exists but active evaluator is allow/telemetry behavior, not the full proposed DLP chain |
| bootstrap | `docs/bootstrap/{architecture,security_model,spec}.md` (3) | Handwritten design/spec; audited against bootstrap; many cryptographic/path/state claims are not implemented |
| certificate management | `docs/certificate_management.md` (1) | Old build chain guide; contradicted by verifier and committed key material |
| alerting | `docs/core/alerting/` (11) | Six Markdown guides, four exported PNG diagrams, one Draw.io source; design-heavy and substantially inconsistent with active SQLite/dispatcher/IPC behavior |
| core integration | `docs/core/integration.md` (1) | Example/integration design; current service graph and APIs diverge |
| Persona IPC | `docs/core/ipc_clients/persona.md` (1) | Broker-client design; active command/event caveats documented in Persona-client chapter |
| Persona | `docs/core/persona/` four files | Architecture, discovery, decoupling, and plain-text `.doc`; partially implemented, with retry/endpoint/auth/storage contradictions |
| service framework | `docs/core/services/` 11 Markdown files | Architecture/spec/usage/config/dependency/communication/health/crash/testing/troubleshooting/quick-reference; mainly old intended framework, not the active eight-service process graph |
| deployment | `docs/deployment/` four files | Alternate Python/mac app design, manual guide, flowchart, and incomplete Mermaid modes fragment; normal deployment is broken and SCEP is a stub |
| Draw.io backup | `docs/drawio/.$Vault.drawio.bkp` (1) | Editor backup/generated working artifact; a current `Vault.drawio` is separately covered in completed Vault scope |
| proxy | `docs/proxy/` nine Markdown files | Design/behavior guides; all mapped in proxy chapters, with active Network Extension, buffering, health, DLP, alert, and upload contradictions |
| superpowers | `docs/superpowers/` three files | Design/implementation plans, not implementation; the E2E crate/workflows do not exist and proxy-v2 architecture is largely future-state |
| technical debt | `docs/tech-debts.md` (1) | Small handwritten issue list; some causes/defaults are outdated/unverified |

The four PNGs are exported diagram artifacts: file inspection verifies valid PNG dimensions, but image pixels are not executable evidence. `Alert_system.drawio` is the editable XML diagram source. `.$Vault.drawio.bkp` is a Draw.io/editor backup based on its name/content; it is classified **Generated working artifact** rather than source behavior.

`docs/core/persona/usage.doc` is ASCII text despite the `.doc` extension; it is not a binary Microsoft Word document.

## Documentation consistency audit

### Root and overview claims

| Claim | Source | Code evidence | Result |
| --- | --- | --- | --- |
| project is production-grade, complete, fully tested, and ready for macOS deployment | `usage.md:5-7` | no checked CI tests; bootstrap trust incomplete; current installers/updates have verified failure gaps | Contradicted |
| root integration tests run through named Cargo commands | `usage.md:36-50` | virtual workspace has no package/test target for root `tests/` | Contradicted |
| agent must be started with `--spawned-by-bootstrap` and bootstrap PID | `usage.md:53-67` | current CLI/bootstrap validation does not enforce claimed chain; standalone is accepted | Contradicted |
| core is hardware/OS agnostic and every module uses infra interfaces | `docs/Overview.md`, `.cursor/AGENTS.md` | platform constants/APIs appear directly in core; several modules bypass or duplicate infra | Aspirational/contradicted |
| every module/function has unit/integration/security tests | overview/coding guidelines | extensive untested paths and no CI test stage | Governance-only, not true of implementation |
| root README build command is sufficient/current | `readme.md` | current build requires private sibling/submodule, compile-time PEM, target dependencies, and package scripts | Incomplete |
| version 0.2.0 capabilities/compatibility describe current product | `release_notes.md` | workspace/package version 0.30.276; Windows paths now exist; many “ready” service claims are obsolete | Historical/outdated |
| uninstall is delete support directory + reboot | `release_notes.md:406-411` | active install creates app, daemon, extension, cert, schedules, hooks, env, adapter changes | Unsafe/incomplete guidance |

### Bootstrap and certificate documents

The three bootstrap docs describe a comprehensive chain with platform selection validation, certificate alias binding, manifest signature verification, child-only startup, validation-result transfer, and fail-closed behavior. Checked code instead:

- leaves several parser validation error variants unused;
- implements mac signature verification as nonempty-input success and Windows as structural checks without a public-key cryptographic verify;
- allows agent standalone startup and does not consume bootstrap validation results;
- has path/version/file-list mismatches with the committed manifest and current packages.

`docs/certificate_management.md` claims per-environment alias isolation and verification of every binary/manifest. The old build selects aliases, but the bootstrap controls do not establish those claims, and the repository commits a usable dev signing key set. Status: **Contradicted / partially configuration-only**.

### Alerting documents and diagrams

The alerting HLD/LLD/DDD/flow/decision/README set depicts intended producers, queues, batching, DLQ/quarantine, HTTP profiles, and observability. The active implementation does have producer APIs, broker bridges, an ingestion worker, three SQLite tables, dispatcher/retry/DLQ operations, and HTTP upload. Material divergences include:

- dispatcher always combines a family as JSON array rather than respecting every stored combiner/content type;
- empty family values batch together rather than send individually;
- documented Fibonacci retry is a fixed retry schedule;
- poison quarantine exists as storage APIs but has no automatic validator/caller;
- direct `initialize()` does not set the public initialized flag;
- documented example constructors/config types do not exist;
- linked relative docs paths in the source README are broken.

The diagrams are therefore architecture/design evidence, not proof of current runtime topology. Exact active behavior is in [core alerting](06-endpoint-core-alerting.md).

### Core service documents

The 11 service guides form a coherent intended service framework but repeatedly assume Vault, TimeKeeper, Keystore, old Persona wrappers, mutable wrapper state, health callbacks, crash-policy recovery, and complete cleanup orchestration. The active default graph instead registers eight process/facade services, and many wrapper methods are public but inactive. State fields asserted by tests cannot change through `&self` methods. Health/cleanup/crash policy prose often describes interfaces or tests, not the active process supervisor.

Classification: all 11 are **Handwritten design/legacy documentation**, fully audited; no file is skipped. Use [core service runtime](06-endpoint-core-service-runtime.md) for actual control flow.

### Persona documents

- `architecture.md` describes default OAuth fallback, stronger normalization/cache/storage guarantees, and device data in user context that code does not consistently provide.
- `email_discovery.md` substantially maps local sources but overstates retry/normalization/nonblocking behavior.
- `email_discovery_decoupling.md` correctly anticipates a subprocess IPC boundary but documents wildcard endpoint names, child-exit detection, and race/security behavior that differs from fixed unauthenticated endpoints.
- `usage.doc` uses old APIs/service assumptions and is plain text.
- `docs/core/ipc_clients/persona.md` does not cover access-token exposure to broker-addressable peers, self-asserted source/event identity, the cache comparison defect, or unjoined refresh tasks.

All are partially useful design context but not authoritative operational documentation.

### Deployment documents

`docs/deployment/architecture.md` describes a four-binary app bundle and working `deployment.py`. Current main builder carries additional companions; `deployment.py` reads missing `args.workspace_root`, has Windows binary suffix/role defects, and cannot perform ordinary deployment. The diagram's IPC socket path and process topology also overstate receiver/service activation.

`manual-testing.md` invokes nonexistent `proxy/build-and-notarize.sh` (the tracked builder is elsewhere), tells users to configure a `workspace_root` CLI/config path the parser does not expose, and expects only four app binaries. Its uninstall command defaults to leaving the app/support data.

`modes.md` is only an unterminated Mermaid code fence. Enterprise use is incomplete, SCEP is unimplemented, and auto/standalone local generation is blocked by the normal parser defect. `flowchart.md` repeats the intended successful path. Status: **Documentation-only/contradicted** for executable deployment.

### Proxy documents

The nine pending docs are fully tied to the four proxy implementation chapters. Principal discrepancies:

- older PF/SCM_RIGHTS/UDP-forwarding architecture is superseded by Swift Network Extension plus localhost TCP relay; active UDP is rejected;
- listener bind order is opposite comments;
- request/DLP “streaming” buffers complete bodies on important paths;
- health/restart/fail-closed settings include inert fields;
- alert env documentation names `QUILR_ALERT_API_URL`, while implementation maps through `QUILR_BACKEND_BASE_URL`;
- truncation/highlighting on UTF-8 can panic at byte boundaries;
- upload scenarios document outcomes broader than active test coverage.

The files remain useful for intent/history but are not runtime truth.

### Proposed hook ADR

`docs/adr-detection-hook-integration.md` is explicitly `Status: Proposed`. Some named plumbing now exists: Hook Manager IPC, `ActivityEvaluator`, event conversion, and activity telemetry. The active evaluator always returns Allow and emits best-effort prompt activity; it does not implement the proposed DLP/policy decision chain. Status: **Partially implemented, proposal status appropriately prevents treating the rest as shipped**.

### Superpowers design artifacts

`docs/superpowers/specs/2026-04-02-e2e-testing-skill-design.md` defines a future agent-assisted test skill. No corresponding checked skill tree from its proposed file list is present.

`docs/superpowers/plans/2026-04-17-e2e-test-harness.md` is a 34-task implementation plan. Exact searches verify there is no root `e2e/` crate, `sentinel-e2e` package, `ProcessSource`/`TestClock` seam matching the plan, `docs/testing-e2e.md`, or `e2e-library.yml`/`e2e-binary.yml`. Status: **Planned but not implemented**.

`docs/superpowers/specs/2026-04-11-proxy-v2-architecture-design.md` proposes a plugin router, sled-backed context store, decision/enforcer abstraction, service context replacing globals, configuration hot reload, and a reorganized platform layer. Current proxy has analyzers/policy/caches/redirectors but not that proposed plugin/context architecture. Status: **Future design with partial conceptual overlap, not implemented as specified**.

### Tech-debt file

Multiple-certificate/revocation items remain unimplemented. Its service environment/health/shutdown causes are not tied to current active symbols and the stated 5–10 second health/default 10-second shutdown values do not uniformly control the active supervisor. Status: **Mixed valid backlog intent and outdated troubleshooting assertions**.

## Generated, vendored, and deliberately grouped artifacts

| Artifact | Classification | Provenance/runtime importance |
| --- | --- | --- |
| `logs.txt` | generated runtime log | produced by running components; committed; no runtime read |
| four alerting PNG files | generated/exported documentation images | exported from diagram tooling; documentation-only |
| `docs/core/alerting/Diagrams/Alert_system.drawio` | editable diagram source | handwritten/design source, not generated runtime code |
| `docs/drawio/.$Vault.drawio.bkp` | generated/editor backup | backup working artifact; no runtime use |
| `scripts/builder/CodeSignTool...jar` | vendored third-party executable JAR | active only when Windows signing requested |
| `scripts/builder/quilr_endpointagent_mac_installer.zip` | generated committed binary package | two arm64 compiled installer executables; no current caller found |
| `build/certs/dev/*` | committed credential artifacts, not classified generated for exclusion | security-relevant inputs; individually analyzed rather than skipped |

No source file in this closed scope was skipped merely because it was large, stale, binary, or poorly connected. Binary images/JAR/Mach-O outputs are grouped after provenance/type/interface inspection, as permitted for verified generated/vendored content.

## Test and verification limitations

- No Cargo/rustc executable is installed in the analysis environment, so root/test-server Rust compilation and execution remain unverified.
- Root tests are statically undiscoverable regardless of tool availability.
- Python source parsing and Bash syntax checks do not prove privileged deployment, native service, Network Extension, Windows named-pipe, or code-sign behavior.
- The committed log, diagram PNGs, JAR, Mach-O ZIP, certificate/container, and Draw.io backup were inspected structurally; third-party JAR internals and image pixel-level semantics were not reverse engineered symbol by symbol.
- No checked workflow runs the 60 dormant root test attributes or seven test-server functions.

## Remaining questions

- **Unresolved:** whether an external Cargo invocation maps root tests or alternate workspace manifests through untracked configuration.
- **Unresolved:** whether `config.json` is consumed by a separately distributed component absent from the three repositories.
- **Unresolved:** intended retention and data classification for the committed operational log.
- **Unresolved:** which documentation/design generation tools and source versions produced each PNG and editor backup; no generation command is committed.
- **Unresolved:** whether external CI implements the proposed E2E harness or test gates outside this revision.
- **Unresolved:** whether test HTTP/control tools are firewalled to disposable hosts in practice.

