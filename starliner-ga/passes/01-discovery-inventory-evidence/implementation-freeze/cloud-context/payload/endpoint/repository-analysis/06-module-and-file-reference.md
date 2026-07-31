# 06 — Module and File Reference

## Endpoint repository shell, delivery, and support surface

All endpoint paths outside the previously closed product crates are now semantically classified:

- [Build, GitHub CI, packaging, code signing, installers, auto-update, rollback, uninstall, manual predecessors, and alternate Python/old build paths](06-endpoint-build-release-install-and-update.md)
- [Root workspace/config/artifacts, root test discovery, local HTTP/test tools, and all remaining documentation/design artifacts](06-endpoint-root-tools-tests-and-documentation.md)
- [AST-backed build/deployment/script declarations](07-symbol-reference/endpoint-build-deployment-scripts.md)
- [AST-backed root/support declarations](07-symbol-reference/endpoint-root-and-support.md)
- [AST-backed tool/root-test declarations](07-symbol-reference/endpoint-tools-and-tests.md)

**Verified:** current release CI routes through `scripts/builder/` and `scripts/distribution/`; the root `build/` and alternate `deployment/` trees are manual/legacy and contain multiple incompatibilities. All 876 tracked endpoint paths plus the separately expanded 108-path IPC dependency are now accounted for.

## Endpoint system monitor v2

All 141 tracked paths under `sentinel-endpoint-agent/system-monitor/` are now semantically classified. The subsystem is split across:

- [Runtime, configuration, identity, state, process discovery, power, logging, and dormant DLP](06-endpoint-system-monitor-runtime-discovery-and-state.md)
- [Backend sync, enforcement, template notification, hook installation/IPC, and activity telemetry](06-endpoint-system-monitor-sync-enforcement-and-hooks.md)
- [Lua detectors/libraries, package scanners, tests, build behavior, and every design/documentation artifact](06-endpoint-system-monitor-scripting-packages-tests-and-documents.md)
- [All 1,054 exact declarations with semantic classification](07-symbol-reference/endpoint-system-monitor-v2-semantic.md)

**Verified:** the active crate has three binaries, no database, nine entity variants, macOS/Windows process adapters, selected-marker Lua discovery, npm/Cargo/Go discovery, cursor-based governance sync, process enforcement for Applications, Cursor/Claude hook injection, and best-effort activity telemetry. Linux configuration/scripts exist but the orchestrator has no Linux enumerator/actions declarations.

## Endpoint template service

All 29 tracked paths under `sentinel-endpoint-agent/template-service/` are semantically classified:

- [IPC protocol/library, executable and kill-switch startup, registry, state, Tauri/browser UI, templates/assets, tests, operations, and documentation audit](06-endpoint-template-service.md)
- [All 172 exact declarations with semantic status and implementation-level entries](07-symbol-reference/endpoint-template-service-semantic.md)

**Verified:** the default-feature process has one regular and one notification WebView, separate active lists/FIFOs, and an unbounded response bridge. System Monitor consumes the protocol-only feature shape. Queue and dedup paths do not preserve every request source/ID, so accepted requests do not all have a correctly correlated response lifecycle.

## Endpoint email-discovery helper

Both tracked paths are closed:

- [User-session helper, core/parent/platform call chain, framed IPC, security/errors/concurrency, build/tests, and documentation audit](06-endpoint-email-discovery.md)
- [All three exact declarations with semantic status](07-symbol-reference/endpoint-email-discovery-semantic.md)

**Verified:** this binary is active only in Persona's service-mode local-discovery fallback. It delegates all nine sources to core, then sends one frame over a fixed-name, unauthenticated local endpoint. Its own package contains no tests.

## Endpoint diagnostics receiver and library

All 15 tracked `diagnostics/` paths are closed:

- [Producer broker path, receiver startup/reachability, local file lifecycle, OpenSearch/Docker operations, configuration, security, tests, and documentation audit](06-endpoint-diagnostics-receiver.md)
- [All 100 exact declarations plus exhaustive meaningful-symbol semantics](07-symbol-reference/endpoint-diagnostics-semantic.md)

## Endpoint infrastructure platform runtime

All 69 tracked `infra/` paths are now closed. The 23 keystore/trusted-environment paths are covered by the Vault chapter; the remaining 46-path/4,911-line platform-runtime slice is covered by:

- [Platform selection, process lifecycle, binary resolution, raw Unix IPC, Windows placeholders, Linux failure boundary, configuration, security, errors, tests, and contradictions](06-endpoint-infra-platform-runtime.md)
- [Manual semantic symbol reference](07-symbol-reference/endpoint-infra-platform-runtime.md)
- [AST-backed catalog of all 736 infra declarations](07-symbol-reference/endpoint-infra.md)

**Verified:** agent/proxy producer forwarding is active, while the packaged receiver's core service registration is commented out. If started, the receiver rewrites IDs/timestamps, persists through unbounded/partly in-memory state, and marks any HTTP-2xx Bulk request sent without item-result inspection.

- [Current IPC `main`](06-ipc-current-main.md) — exhaustive module, lifecycle, error, concurrency, test, script, and documentation analysis for `0cf45bc…`.
- [Endpoint-pinned IPC revision](06-ipc-endpoint-pinned.md) — typed one-way, duplex, broker, cross-platform, security, failure, concurrency, and test analysis for `9ce5b25…`.
- [Dashboard/API server](06-dashboard-api.md) — production bootstrap, routes, middleware, ingest and dashboard flows, ClickHouse storage, configuration, operations, tests, and implementation discrepancies for `cd755d3…`.
- [Dashboard frontend](06-dashboard-frontend.md) — route graph, portal-token lifecycle, browser cache boundary, HTTP contract, every active page, policy editor concurrency, build/deployment, generated artifacts, tests, and unreachable code.
- [Dashboard application intelligence](06-dashboard-app-intel.md) — manual Claude enrichment workflow, legacy ClickHouse loader, generated 885-record catalog, configuration, failure/security behavior, and API table-name incompatibility.
- [Dashboard operations and documentation](06-dashboard-operations-and-documentation.md) — all 44 remaining paths: Compose, Jenkins, external CI boundary, local security runners, root configuration/artifacts, and per-document consistency audit.
- [Endpoint agent and bootstrap](06-endpoint-agent-and-bootstrap.md) — console/Windows-service startup plus bootstrap state machine, validation, integrity controls, fixtures, and contradictions.
- [Endpoint core service runtime](06-endpoint-core-service-runtime.md) — active eight-service graph, lifecycle, supervision, process bridges, and inactive wrappers.
- [Endpoint core alerting](06-endpoint-core-alerting.md) — IPC queues, persistence, dispatch, retries, schemas, and tests.
- [Endpoint core Persona](06-endpoint-core-persona.md) — identity discovery, validation, storage, OAuth, monitoring, and broker lifecycle.
- [Endpoint core Vault and keystore](06-endpoint-core-vault-and-keystore.md) — encrypted persistence, key derivation, macOS/Windows HAL behavior, migration, and design audit.
- [Endpoint core file index, search, and metadata](06-endpoint-core-file-index-search-and-metadata.md) — dormant runtime wiring, scan/search pipelines, SQLite schema, configuration, label/type utilities, tests, and contradictions.
- [Endpoint database core](06-endpoint-core-database.md) — active alert SQLite initialization, global/local connection ownership, schema migrations/dispatch/retry, telemetry/security placeholders, dormant and proto-incompatible gRPC adapter, tests/samples, and documentation contradictions.
- [Endpoint core HTTP client](06-endpoint-core-http-client.md) — active alert/kill-switch/delta consumers, profile/builder transformation, shared reqwest adapter, retries/timeouts, JSON/RS/text/raw parsing, logging/security boundary, tests, and documentation contradictions.
- [Endpoint core kill switch](06-endpoint-core-kill-switch.md) — tenant/device backend decision, controller/global/watch consistency, Persona and shutdown writers, supervision/IPC propagation, deferred persistence, tests, and draft-architecture contradictions.
- [Endpoint core cache, managed configuration, and global constants](06-endpoint-core-cache-config-global.md) — Persona cache storage/page-lock/zeroization semantics, managed TOML replacement and path lookup, backend URL caching/environment mapping, platform resource paths, OAuth constants, tests, and contradictions.
- [Endpoint core gRPC IPC and Persona broker client](06-endpoint-core-ipc-and-persona-client.md) — default-off database gRPC generation/server/client boundary, checked proto incompatibility, and the active broker-based Persona request/cache/poll/broadcast path.
- [Endpoint core trusted time and interval scheduler](06-endpoint-core-time-and-scheduler.md) — synchronous global NTP facade, UDP packet/offset/fallback behavior, file-index relationship, exported-but-unregistered scheduler actor, heap-ordering defect, run/event/shutdown semantics, tests, and documentation contradictions.
- [Endpoint core logging module](06-endpoint-core-logging.md) — orphan/inert configuration sources, dormant platform path and dual-layer formatter, worker-guard and initialization failure semantics, active-process logger comparison, and README contradictions.
- [Endpoint core diagnostics facade and code registry](06-endpoint-core-diagnostics.md) — all 56 codes, 41 executable emit sites, macro expansion/data construction, global sender initialization, broker transport/failure lifecycle, security boundary, tests, and documentation/deployment contradictions.
- [Endpoint core utilities](06-endpoint-core-utilities.md) — dormant JSON configuration schema/manager, active environment singleton initialization, positive-only cache semantics, active Vault default-directory creation, filesystem/security failures, empty placeholder, and all tests/contradictions.
- [Endpoint core policy engine](06-endpoint-core-policy-engine.md) — active proxy initialization/auth/fetch/refresh path, complete remote schema, behavior index, property/operator/logical/action semantics, fail-open enforcement boundary, concurrency/errors/security, all tests, and verified edge-case defects.
- [Endpoint core Lua scripting](06-endpoint-core-scripting.md) — feature/build gating, active System Monitor v2 sandbox/collector use versus dormant manifest/event/update paths, every Lua host API and result field, signing enforcement defects, data loss, concurrency, security, tests, and contradictions.
- [Endpoint core DLP templating engine and legacy UI assets](06-endpoint-core-templating-engine.md) — integrated and standalone Tauri deployment, DLP-to-popup mapping, highlighted-HTML generation, FIFO/oneshot state, all commands and templates, CSP/trust boundary, queue failure modes, tests, and contradictions.
- [Endpoint core crate shell, build interface, dormant decompression, benchmarks, examples, and integration harness](06-endpoint-core-crate-shell-tests-and-decompression.md) — all final 25 core paths: manifest/public modules, Tauri/protobuf build path, disabled archive strategies and 129-MB fixtures, compile-incompatible benchmarks, diagnostic examples, icon/license assets, Cargo test discovery, and all 91 direct plus 12 undiscovered tests.
- [Endpoint template service](06-endpoint-template-service.md) — complete 29-path package analysis spanning protocol, registry, rendering/state, Tauri/browser behavior, response correlation, kill switch, build/tests/assets, and guide contradictions.
- [Endpoint email-discovery helper](06-endpoint-email-discovery.md) — complete two-path package plus its active core/infra caller and privilege-boundary trace.
- [Endpoint diagnostics receiver and library](06-endpoint-diagnostics-receiver.md) — complete 15-path analysis spanning producer/receiver IPC, payload/lifecycle schemas, append/sent files, worker scheduling, OpenSearch/Docker, build/deployment, tests, and guide contradictions.
- [Endpoint proxy bootstrap and HTTP runtime](06-endpoint-proxy-bootstrap-http.md) — package surfaces, exact startup/configuration precedence, listeners, request/body/context flow, forwarding/circuits, TLS MITM, WebSocket, state, kill switch, IPC, health, logging, and cleanup gaps.
- [Endpoint proxy DLP, UI, and alerts](06-endpoint-proxy-dlp-ui-alerts.md) — analyzers, findings, transforms and extraction, OCR/PDF/Office paths, core policy bridge, uniqueness, justification implementations, alert schemas/caps, WebSocket DLP, and incomplete code.
- [Endpoint proxy packet redirection](06-endpoint-proxy-packet-redirection.md) — shared configuration/orchestration, Windows WinDivert filters/workers/attribution/rewrites/UDP, macOS Rust/Objective-C/Swift control and relay planes, build identity, failures, and legacy paths.
- [Endpoint proxy build, tests, and documentation audit](06-endpoint-proxy-build-tests-docs.md) — Cargo features/build script, Swift and app packaging, committed configuration/assets, all 318 static test declarations and discovery boundaries, and source-versus-guide contradictions.

All 118 proxy paths have final classifications in the [endpoint inventory appendix](01-inventory-sentinel-endpoint-agent.md). Exact declaration locations remain in the 1,870-entry [raw proxy catalog](07-symbol-reference/endpoint-proxy.md), enriched by [runtime](07-symbol-reference/endpoint-proxy-runtime.md), [DLP](07-symbol-reference/endpoint-proxy-dlp.md), and [redirector](07-symbol-reference/endpoint-proxy-redirector.md) semantic references.
