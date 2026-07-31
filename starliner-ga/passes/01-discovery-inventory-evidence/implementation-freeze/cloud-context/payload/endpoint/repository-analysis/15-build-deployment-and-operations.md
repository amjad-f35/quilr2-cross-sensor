# 15 — Build, Deployment, and Operations

## Dashboard/API server

The verified [build, migration, seed, and deployment flow](06-dashboard-api.md#build-migration-seed-and-deployment) covers Go/Docker inputs, the non-root runtime, the PaaS/SaaS schema switch, Compose dependency order, image pipeline, health checks, and missing visible test stages.

Operational summary:

- Build: Go 1.24.1, three Linux static binaries, Alpine runtime.
- Install/package: Docker image contains server, migrate, seed, schemas, and runtime data.
- Migrate: lexically sorted, semicolon-split, idempotent ClickHouse DDL; no ledger/rollback.
- Start: API validates all ten tables before listening.
- Stop: 30-second HTTP drain, then unbounded queue drain.
- Health: unauthenticated ClickHouse ping at `/v1/health`; Docker/Compose use it.
- Logs: JSON application logs, except Chi request logger uses its dependency-defined format.
- Metrics/traces: none exported by repository code.
- Release: Jenkins builds and pushes both images; deployment/rollback manifests are not in the repository.

Dashboard root CI/Compose/release details and their external boundaries are in [the operations reference](06-dashboard-operations-and-documentation.md). Endpoint and final cross-system deployment findings are completed in the later sections.

## Dashboard frontend

See [Build, dependencies, and deployment](06-dashboard-frontend.md#build-dependencies-and-deployment).

- `npm ci` plus `npm run build` was successfully verified from the pinned lockfile.
- Docker uses Node 20 Alpine and Nginx 1.27 Alpine.
- Jenkins builds with `/sentinel-dashboard/`; local Compose uses `/` and Nginx supports both.
- The committed `dist` fragment is incomplete and not used by Docker, which rebuilds it.
- Nginx proxies `/api` and `/ea`; its documented SSE sync route is absent from the API.
- No frontend runtime health beyond Nginx root `wget`, telemetry, source-map publication, or client error reporting is configured.

## Dashboard CI and local security tooling

- GitHub Actions delegates entirely to an external reusable workflow on a floating branch; local evidence cannot prove its checks.
- Jenkins builds/pushes images but has no explicit test, scan, deploy, rollback, SBOM, or signing stage.
- Manual Bash/PowerShell prechecks clone external scripts and use private scanner images. They report findings but do not intentionally exit with an aggregate failure status.
- Their cleanup removes generic project paths without determining whether the runner created them; even help invokes cleanup.
- The API `.env` is included in the API builder context/layer because builds use the subdirectory as context and it has no `.dockerignore`.

## Endpoint scripting build and packaging

- Core scripting is optional and not in core defaults, but `sentinel-monitor-v2` explicitly enables it; production package builders select that binary.
- Enabling it pulls vendored Lua 5.4 through `mlua`, Ed25519 verification, and glob support.
- `signing_public_key.pem` is gitignored and absent. Current `.github/workflows/build.yml` validates the secret and decodes it before Windows/macOS builds; a clean local build needs a developer-provided copy.
- The older `ci-build.yml`, scoped to `app-discovery-integration`, does not materialize it before invoking builders; branch-specific external state is Unresolved.
- Builder copies the complete committed v2 scripts directory and manifest to package `support/hooks/scripts/`.
- macOS LaunchDaemon sets `SENTINEL_ALLOW_UNSIGNED_SCRIPTS=1`, although active v2 executes scripts without consulting verifier.
- Core provides an updater implementation but no checked scheduler/caller. It overlays files in place and does not reload a running engine or notify monitor.
- No scripting-specific health, readiness, metrics, rollback, script-version report, or signature-failure telemetry exists beyond tracing logs.

See [compile-time and updater operations](06-endpoint-core-scripting.md#compile-time-public-key-prerequisite).

## Endpoint DLP templating build and deployment

- `core/build.rs` always calls `tauri_build::build`; `generate_context!()` consumes `core/tauri.conf.json` and bundled `core/ui/index.html`.
- The core library (`cdylib`, `rlib`) carries the Tauri configuration/assets used by proxy binaries.
- `proxy/Cargo.toml` declares both `sentinel-proxy` and standalone `templating-engine`.
- The default agent graph includes both `templating-engine.service` (this core UI via proxy binary) and `template-engine.service` (a separate newer service); they are not aliases.
- In service mode the spawner injects platform log paths for proxy/templating processes and a fixed template directory only for `templating-engine.service`.
- Startup requires the chosen filesystem glob to parse and include `alert.html`; Tera templates are runtime files, not `include_str!` assets.
- `**/Cargo.lock` is ignored and absent, so exact Tauri/Tera resolution is not reproducible from the commit.
- No health/readiness/metrics interface exists. Operations rely on tracing/daily standalone logs.
- Shutdown closes the window best-effort and exits zero; threads are unjoined and requests are not explicitly drained.

Packaging copy/ACL evidence will be finalized with remaining deployment files. Core behavior is complete in [the templating operations analysis](06-endpoint-core-templating-engine.md).

## Sentinel-core package build and validation boundary

- `sentinel-core` is a workspace/default member and produces both `rlib` and `cdylib`; package version is `0.30.276`, edition 2024, doctests disabled.
- Every core compilation runs `tauri_build::build()`. The default-off `grpc_server` branch additionally asks vendored-protoc for a binary, generates Tonic client/server code, and panics on compile failure.
- Generated protobuf Rust lives only in Cargo `OUT_DIR`; it is not committed. The checked handwritten server/client uses `schema_id` where the checked schema generates `table`, so that optional target is not build-consistent.
- Root `.gitignore` excludes all Cargo lockfiles. Release builds resolve allowed dependency ranges at build/cache time rather than from committed lock state.
- Platform production builders select named binary packages with `cargo build`; they do not request tests, benches, examples, Clippy, or all targets. GitHub workflow execution routes through these builders.
- The two registered Criterion targets are legacy and statically incompatible. The two examples are automatic Cargo examples only; one can start a real proxy without cleanup.
- Archive extraction code and tests are omitted by a commented crate-root declaration. Its three 129-MB fixtures are shipped in source history but builders do not stage them in the support bundle.
- Builder scripts do stage `core/icons` and `core/templates`. Core/template-service icons are byte-identical. Tauri config does not list explicit icon paths, so target selection by Tauri convention remains unresolved.
- `core/LICENSE.txt` is active `license-file` metadata and matches agent/infra commercial notices byte-for-byte.

No Rust command could be executed in this analysis environment because Cargo/rustc are absent. Static build incompatibilities and checked CI absence are distinguished from captured build/test results in [the final core package analysis](06-endpoint-core-crate-shell-tests-and-decompression.md).

## System monitor build and operations

- `system-monitor/v2/Cargo.toml` builds library `sentinel_monitor_v2` and three binaries: monitor, Cursor hook client, Claude hook client.
- Direct internal paths bind it to `sentinel-core`, `template-engine`, and endpoint-pinned `ipc-light`/`ipc-light-broker`; `mlua` enables vendored Lua 5.4.
- macOS adds plist/libc; Windows adds winreg, Windows API bindings, windows-sys SMBIOS, and WMI. No Linux platform action/enumerator is wired in orchestrator despite Linux config.
- Production builders reviewed in the endpoint repository stage all three executables, `sysmon-config.json`, and detector scripts. Hook deployment later copies thin-client binaries from `SENTINEL_INSTALLATION_PATH` to user-specific targets.
- The committed config points general sync at `http://localhost:33333` but app-ID resolution at preproduction HTTPS; built-in defaults derive both from `BackendUrl::Default`. Deployment must determine which config is staged.
- Logs go to stdout and daily monitor files; only ten newest matching files are retained by best-effort cleanup. Snapshot and hook state live below the selected user home by default.
- Health/readiness/liveness/metrics/tracing-export endpoints are absent from this binary. Startup logs are the only direct readiness indication; Persona can hold startup indefinitely.
- Graceful stop is Ctrl+C/shared cancellation plus joined workers and final snapshot. Stored kill-switch shutdown sender is unused. No system-monitor-specific rollback/migration exists.
- Checked CI/build evidence does not run the 283 tests, Clippy, benches, or all targets. Manual E2E scripts use Docker/local services and one starts the wrong `sentinel` binary.
- Rust/Cargo are unavailable in the analysis environment, so static source/build review is not represented as a successful compile.

Full package and artifact details are in [the scripting/build chapter](06-endpoint-system-monitor-scripting-packages-tests-and-documents.md#build-and-packaging).

## Template service build, deployment, and operations

- `template-service/Cargo.toml` declares package/binary `template-engine`, library `template_engine`, edition 2024, and default `ui`. Protocol-only consumers disable defaults.
- `build.rs` calls the Tauri build hook only for `ui`; `tauri.conf.json` identifies `ai.quilr.sentinel.template-engine`, frontend directory `ui`, no startup windows, and bundle `active: false`.
- The root workspace includes the package. macOS/Windows builder scripts explicitly build it and stage/verify the executable; code-sign input lists include the Windows binary.
- Installer/distribution/uninstaller scripts include `template-engine` in process and artifact lists. They install templates and set `SENTINEL_TEMPLATE_DIR`; exact scripts remain part of the pending 327-path operations slice, so their full correctness is not yet closed.
- Core's active default graph declares `template-engine.service` as process-instanced, user-space, dependent on `ipc-light-broker.service`, retry-on-crash with 10-second timeout and maximum three retries. The service wrapper uses custom IPC and no process arguments/working directory.
- The same default graph also runs the older `templating-engine.service`; these are distinct binaries and implementations.
- Runtime startup needs filesystem templates to parse. The compile-time source-tree directory precedes installation path if it exists on the deployed machine, unless `SENTINEL_TEMPLATE_DIR` is valid.
- There is no health/readiness/liveness endpoint, metrics exporter, structured audit trail, migration, or rollback facility inside the package. Logs go through tracing and `RUST_LOG`.
- Graceful process stop is Ctrl+C or kill-switch disable through the standard channel, window close, and `AppHandle::exit(0)`. Main IPC broker shutdown alone does not stop the process, and no request/response drain occurs.
- The two icon assets duplicate core icons; the Tauri bundle icon list is empty. Their package-time use is not demonstrated by this crate.

`tests/test_spawn_render.sh` is not a process smoke test despite its comments: it builds/tests and checks binary existence only. No checked CI workflow invokes it or the package tests. Rust/Cargo absence prevented local build/test validation.

## Email-discovery build and deployment

- The root workspace and default-members lists include `email-discovery`.
- Its manifest builds one 2021-edition binary and links `sentinel-core` with defaults disabled and `local_discovery` enabled.
- Standard shell/PowerShell builders explicitly use `-p email-discovery`, include it in staged companion arrays, and verify the artifact.
- Standard installers/uninstallers include the helper in expected/process-removal lists.
- No checked `.github` workflow directly names the package. No helper-local build/test script exists.
- Repository-wide searches found no helper name in `scripts/distribution/` or `scripts/qa/`; whether those packaging paths inherit the older builder output or omit the runtime dependency is unresolved pending their full analysis.
- Core resolves the binary at runtime by service name rather than a configured explicit path. Bind/resolve/spawn failure prevents service-mode local discovery and propagates `NoEmailSourcesFound` to higher Persona fallback logic.
- The helper writes only stderr logs and has no health endpoint, service wrapper, persistent state, upgrade/migration, or independent monitor. Parent owns timeout/kill/reap/cleanup.

Rust/Cargo absence prevented a clean build and target compilation check. Exact transitive versions are unavailable because Cargo lockfiles are ignored.

## Diagnostics build, deployment, and operations

- The root workspace/default-members and builders compile package/binary `sentinel-diagnostics`; core depends on the library under default features.
- Cargo always runs `diagnostics/build.rs`, which copies compose/template/saved objects to the Cargo profile output and warns rather than fails on copy errors.
- The build script does not copy `setup.sh`. Checked packagers/stagers copy the companion executable but contain no diagnostics-Docker-directory copy.
- macOS app assembly puts/signs the binary in `Contents/MacOS`; Windows/macOS package layouts, `manifest.xml`, preflight lists, and uninstallers also name it.
- `core/src/services/diagnostics.rs` can model it as a process service, but the default `ServiceDefinition` is commented out. Deployment Python still declares it an active dependency of the broker graph.
- On direct startup the binary probes fixed localhost OpenSearch, then may run Docker Compose from a sibling directory. Docker commands have no timeout; containers remain running after receiver exit.
- `setup.sh` is the manual start/stop/clean/status interface. `stop` retains the named volume and `clean` removes it.
- The Compose environment pins OpenSearch/Dashboards 2.11.0, disables both security plugins, maps 9200/5601, and uses a curl setup container whose HTTP failures need not fail the container.
- Neither checked GitHub workflow runs Cargo tests, the live integration test, Docker setup, IPC contract checks, Clippy, or a receiver launch smoke test.

**Unresolved:** whether an external release stage installs the Docker resources or launches the receiver. Exact commands and discrepancies are in [the diagnostics operations analysis](06-endpoint-diagnostics-receiver.md#build-packaging-and-ci).

## Endpoint infra build and operations

- `infra` is a Rust 2024 library workspace/default member with no executable, build script, feature flags, examples, benchmarks, or integration-test directory.
- Target `cfg` exposes `macos_hal` only on macOS and `windows_hal` only on Windows. Linux still compiles/selects `LinuxServices`, whose getters panic at runtime.
- Standard builders compile endpoint executables that transitively use infra; no separate infra artifact is packaged or started.
- The workflow/build scripts run `cargo build`, not infra tests, Clippy, or cross-target contract tests.
- Target-only dependencies provide Security.framework/Core Foundation/libc on macOS and Win32 APIs/zeroize on Windows. `tokio` full and `zeroize` have no checked source use.
- The commercial license file is handwritten and referenced through `license-file`.
- No Cargo lockfile is committed; deployed transitive versions cannot be reconstructed exactly.
- Runtime debugging relies only on tracing emitted by resolvers/process helpers and core logs. No infra metrics, health endpoint, trace exporter, or operator CLI exists.

Rust/Cargo absence prevented executing Linux's statically failing selector test or supported-target builds/tests. Full package evidence is in [the infra chapter](06-endpoint-infra-platform-runtime.md#crate-build-and-module-topology).

## Endpoint proxy build and operations

- `proxy/Cargo.toml` defines package `sentinel-proxy` version `0.1.347`, Rust 2024, a library, `sentinel-proxy`, and `templating-engine`. Optional features are `dlp-oob`, `redirector`, `mac-packet-redirector`, `win-packet-redirector`, `image-ocr`, `extract-pdf`, `extract-office`, and `extract-all`.
- `dlp-oob` depends on `../../ai-internal-sdks/rust_sdk`, outside the repository. That feature is not reproducible from the three checked trees alone.
- On every macOS build, `build.rs` runs the Swift bundle script even without the mac redirector feature, then compiles Objective-C bridges. Swift failure warns/continues; Objective-C failure is fatal. Rerun inputs omit some plists/entitlements.
- `swift/build.sh` constructs `ai.quilr.agent.sentinel.extension.systemextension`, optionally signs it, and copies plist/entitlements. `ARCH` is not passed to Swift, so its printed multi-architecture default does not create a universal binary.
- `build-and-notarize.sh` builds the full DLP/mac/OCR/extractor feature set, requires untracked provisioning profiles/signing/notary setup, constructs/signs an app and extension, zips, notarizes, staples, and assesses. It uses `sudo` for many workspace/build actions.
- `dev-build-install-run.sh` builds/installs/runs, kills/removes prior application state, and tolerates multiple signing/verification failures. Its proxy argument string is expanded unquoted.
- Actual identifiers are host `ai.quilr.agent.sentinel` and extension `ai.quilr.agent.sentinel.extension`; committed guides still contain `com.sentinel` examples. Cargo is `0.1.347`, plist version/build are `1.0`/`1`, and health metrics expose `0.1.0`.
- There is no container/Kubernetes/Terraform/Helm definition specific to the proxy. macOS deployment is an application/system extension; Windows runtime relies on WinDivert and administrative privilege. Exact root packaging/installer integration is documented in [the delivery chapter](06-endpoint-build-release-install-and-update.md).
- Operational endpoints are `/health` and `/metrics`; both are unauthenticated. Logs use platform/`SENTINEL_LOG_DIR` files and optional `proxy_traffic.log`. No repository trace exporter or documented rollback mechanism was found in proxy scope.
- The proxy has no migrations. Upgrade behavior is replace/reinstall for app/extension; Objective-C manager loads the first saved Network Extension manager instead of filtering by bundle identity.

Full commands, feature relationships, signing inputs, and discrepancies are in [the proxy build/operations chapter](06-endpoint-proxy-build-tests-docs.md).

## Endpoint repository-wide build, release, install, update, and support closure

The final 145-path audit closes the repository shell around the previously analyzed Rust packages. The authoritative evidence and command-by-command behavior are in [06 — Endpoint build, release, install, and update](06-endpoint-build-release-install-and-update.md) and [06 — Endpoint root, tools, tests, and documentation](06-endpoint-root-tools-tests-and-documentation.md).

Verified operational conclusions:

- Root Cargo is a virtual Rust 2024 workspace with 13 members and 11 default members. `test-server/rust-server` and `ipc-light/ipc-light-macro` are not direct default build targets. Release profiles retain debug level 2, and lockfiles are ignored rather than committed.
- The current macOS and Windows Actions workflows build/package artifacts but contain no test, Clippy, release publication, rollout, or rollback job. Their external reusable precheck scripts and third-party actions are not pinned to immutable commits.
- The current builders assemble nine primary executable artifacts plus support assets. Multiple signing/copy stages use mismatched source and destination paths, so a successful signing step does not prove that the signed bytes are the bytes embedded in every package.
- Windows packaging can include a development CA private key, depending on selected mode. The old `build/` tree also commits a matching unencrypted development private key, certificate, PKCS#12 file, and signing configuration; these are repository inputs, not inferred production credentials.
- Update metadata uses RSA-PSS signatures, but the updater's replace sequence is not a transaction across all files. Rollback and version-floor behavior are partial and platform-specific.
- The active Windows and macOS installers/uninstallers are handwritten scripts. Several validation/status/rollback branches report success despite partial work; exact findings and affected symbols are cataloged in the delivery chapter.
- `deployment/deploy.py` cannot complete its ordinary path because its parser does not define `workspace_root` while `main` reads `args.workspace_root`. Its Windows proxy name also receives a second `.exe` suffix in preflight. This alternate deployment path is therefore broken as committed.
- `.github` precheck wrappers summarize failed stages but never exit with their aggregate failure result. Their cleanup functions remove generic report/build names without proving ownership.
- No Kubernetes, Helm, Terraform, package-repository publication, staged rollout controller, or checked production deployment/rollback definition exists in this repository. **Unresolved:** external deployment systems may supply those functions.

Local verification was constrained by the absence of Rust/Cargo and by the lack of signing/notarization credentials and supported target operating systems. Static source, archive metadata, tracked compiled artifacts, scripts, and configuration were inspected; no claim of a successful release build is made.
