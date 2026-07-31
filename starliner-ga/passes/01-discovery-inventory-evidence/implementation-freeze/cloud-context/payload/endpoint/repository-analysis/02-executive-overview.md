# 02 — Executive Overview

At the analyzed revisions, the repositories form a host endpoint stack plus a tenant-scoped server/dashboard, connected by HTTP and by a local endpoint IPC layer.

| Repository/runtime | Verified role | Principal implemented capabilities | Important qualification |
| --- | --- | --- | --- |
| Endpoint agent | Privileged and user-session host processes | Persona/device identity, service supervision, asset/application discovery, governance sync/enforcement, IDE hook telemetry, explicit/transparent DLP proxying, alerts/diagnostics, UI templates, installers and updater | Platform support is asymmetric; several documented/registered features are dormant, partial, fail-open, legacy, or externally dependent |
| Dashboard/API | Go HTTP service plus ClickHouse | Tenant-scoped asset, relationship, activity, policy, configuration, integration, and health routes; background batch writes; static catalogs | Migration has no ledger/rollback; queue shutdown can be unbounded; several documented routes/contracts disagree with code |
| Dashboard frontend | React/Vite/Nginx browser application | Authentication/tenant selection, overview, inventory/detail/relationship graphs, activity, integrations, and policy/settings editing | Browser state trusts localStorage; policy-save ordering and API/base-path inconsistencies are documented |
| IPC library | Local process messaging | Current `ipc-light` supplies the smaller requested API; the endpoint-pinned tree additionally supplies broker, macro, typed, duplex, benchmark, and example surfaces | The endpoint pins a detached 108-path revision materially different from the requested 30-path current `main`; they are not interchangeable |

The primary verified data/control chain is:

```text
host discovery / hooks / proxy
→ endpoint process-local state and pinned local IPC broker
→ tenant-authenticated dashboard HTTP routes
→ ClickHouse tables and static configuration
→ dashboard API responses
→ React Query/browser UI
```

Not every capability traverses the whole chain. Some endpoint services write only local state, some broker consumers have no verified launcher, hook DLP enforcement is documentation-only, and the proxy may allow traffic when policy initialization or analysis does not yield an applicable enforcement result. External CI, artifact publication, production deployment, private SDKs, backend dependencies, and deployed OS/IPC ACLs remain explicit `Unresolved` boundaries.

## Completed sentinel-core conclusion

All 314 tracked paths in the endpoint's `core/` package are semantically closed. The active library supplies the default service graph, alerting, Persona/Vault, policy, HTTP, database, file, time/scheduler, diagnostics, utilities, scripting, and Tauri templating surfaces documented in the module index. Its final package-shell audit materially qualifies apparent repository capabilities:

- recursive decompression is a 1,084-line implementation excluded from the crate root, with an optional-dependency prerequisite and no enabled tests;
- the default-off database gRPC feature is statically inconsistent with its own protobuf (`table` versus handwritten `schema_id`);
- both registered alerting benchmarks target a removed API and are not current performance evidence;
- 91 direct integration tests are not called by checked CI and largely target retired Vault/TimeKeeper defaults, while 12 shared-helper tests are not discovered by Cargo;
- large archive fixtures total 129,115,948 committed bytes and have no documented generator, upstream attribution, or data classification;
- no dependency lockfile is committed, so exact transitive code—including Tauri and archive libraries—cannot be reconstructed from this revision alone.

See [the final core-package chapter](06-endpoint-core-crate-shell-tests-and-decompression.md). Later sections preserve the subsequent checkpoint sequence and end with the completed repository closure.

## Endpoint system monitor v2 closure

All 141 `system-monitor/` paths are now closed, reducing the endpoint remainder to 356 paths. Verified architectural findings are:

- the monitor is a separate three-binary crate and starts only after a fixed-time, fail-open kill-switch gate and an unbounded Persona hard dependency;
- its state is an in-memory `DashMap` plus one JSON snapshot—there is no system-monitor database despite requirements documents;
- process discovery/enforcement support macOS and Windows; Linux scan configuration exists but the orchestrator has no Linux enumerator/actions declarations;
- Lua discovery runs seven committed detectors directly in a trusted sandbox, bypassing the committed manifest/signature engine; conversion discards raw graph relationships, composite risk, and many rich artifact fields;
- application IDs are first resolved through a separate backend route, then all entities are gzip-ingested and governance is pulled by cursor; several checked documents show stale wire schemas;
- blocked/quarantined Applications are rescanned and terminated, while the other eight entity kinds are never process-enforced;
- Cursor/Claude hooks are installed and produce telemetry, but the production evaluator always allows and never invokes DLP/policy;
- no checked CI job runs the crate's 283 Rust tests, and the committed E2E assets are manual/stale.

See the three system-monitor module chapters and [semantic symbol reference](07-symbol-reference/endpoint-system-monitor-v2-semantic.md). Later sections close the other endpoint scopes.

## Endpoint template service closure

All 29 `template-service/` paths are now closed, reducing the endpoint remainder to 327 paths. Verified architectural findings are:

- the crate is both a Tauri process and a feature-light protocol library; System Monitor v2 imports the message types with default features disabled;
- startup uses another fixed six-second, initially-enabled kill-switch gate, but unlike system monitor a later disable signals Tauri and exits the process;
- the service accepts targeted JSON from the local pinned broker, renders one of three Tera fragments, and maintains separate regular/notification active lists and FIFOs entirely in memory;
- notification routing follows the request's optional type rather than registry metadata, and multiple accepted context fields are not consumed by any committed template;
- both FIFOs discard the original response target, and both dedup paths collapse later request IDs without preserving a response lifecycle; dequeue responses can therefore be misrouted and duplicates can remain unanswered;
- notification close invokes bulk dismiss: active items receive responses, while all queued notifications are cleared without responses;
- status and broker dismiss apply only to regular active state, not notifications or queued work;
- configuration default timeout fields are inert, backend-shaped templates are loaded only from local JSON rather than an API, and the two checked guides contradict several current behaviors;
- 32 tests cover models, fragments, conversion, and state helpers, but not handlers, response correlation, IPC retry, kill switch, Tauri commands/JavaScript, windows, or CSP; no checked CI invokes them.

See [the module chapter](06-endpoint-template-service.md) and [semantic symbol reference](07-symbol-reference/endpoint-template-service-semantic.md). Later sections close the other endpoint scopes.

## Endpoint email-discovery closure

Both `email-discovery/` paths are closed, reducing the endpoint remainder to 325 paths. The short-lived helper exists only to run the same nine core Persona local-discovery sources in a user session and write one length-prefixed JSON vector to its privileged parent. Important findings are:

- discovery-source and serialization failures become partial/empty successful frames, contradicting the binary comment that any error exits nonzero;
- the parent does not generally monitor exit status concurrently, so pre-connect failure can consume the full 30-second IPC timeout;
- the endpoint name is fixed, not wildcard/randomized, and neither Unix nor Windows authenticates the connecting client; Windows intentionally uses a null DACL;
- the 1 MiB parent cap limits allocation, but structurally valid spoofed candidates are not bound to the spawned child;
- Windows user-session spawning passes the IPC path through CLI but calls `CreateProcessAsUserW` with no explicit environment block, ignoring the `ProcessConfig.env` values used by discovery comments/configuration;
- the package has no executable-level tests and no checked CI invocation; newer distribution/QA scripts do not name it although standard builders/installers do.

See [the helper analysis](06-endpoint-email-discovery.md) and [semantic reference](07-symbol-reference/endpoint-email-discovery-semantic.md).

## Endpoint diagnostics closure

All 15 `diagnostics/` paths and the cross-scope `docs/diagnostics/USAGE.md` are closed, reducing the endpoint remainder to 309 paths. The crate supplies an actively used producer-side broker sender and an implemented standalone broker receiver/local OpenSearch pipeline. Important findings are:

- agent and proxy initialize only the core IPC facade; the receiver binary is built and packaged, but its sole core default-service definition is commented out while deployment metadata still calls it active;
- producer queues are unbounded, failed connection cycles drain/drop all queued events, the first failure is silent, and broker Shutdown permanently closes a process-global facade that cannot restart;
- the receiver reconstructs each event through `emit`, replacing its UUID/timestamp, dropping broker process identity, and mapping a missing optional code to `UNKNOWN`;
- up to 49 default-capacity events can remain only in memory, contradicting crash-safe/always-written documentation; storage errors after draining can lose records;
- the worker recreates its sleep on every select iteration, so sustained events can indefinitely defer file flush/export;
- append-only log and sent-ID files never compact; every batch rescans history and marking performs one open/write/flush per event;
- any 2xx Bulk response is treated as success without checking item failures, and the Bulk action hard-codes the `diagnostics` index;
- the local Compose stack disables OpenSearch/Dashboards security and exposes host ports, while setup can report success after failed curl operations;
- five unit tests and one environment-dependent integration test omit IPC/lifecycle/failure/security behavior, and neither checked CI workflow runs tests.

See [the diagnostics receiver analysis](06-endpoint-diagnostics-receiver.md) and [semantic reference](07-symbol-reference/endpoint-diagnostics-semantic.md). At that checkpoint 309 endpoint paths remained; the infra closure below supersedes that count.

## Endpoint infra closure

All 69 `infra/` paths are closed: 23 keystore/trusted-environment paths were already included in the Vault audit, and the final 46 platform-runtime paths reduce the endpoint remainder to 263. The active crate provides macOS/Windows binary and process adapters plus a raw Unix client; its support claims are materially asymmetric:

- Linux is selected successfully but all four factory getters immediately panic through `todo!`; the selector test is therefore statically failing on Linux.
- Windows ordinary and interactive-user process spawning are implemented, including a process-lifetime Job Object, but the named-pipe channel is an all-`NotImplemented` placeholder and no infra server exists.
- Windows native user-session spawn never reads `ProcessConfig.env`, so per-spawn `SERVICE_NAME`, `IPC_SOCKET`, logging, template, and color values are not explicitly supplied by that path.
- macOS user-session attachment discovers the newest same-name process with `pgrep`; its uid argument is unused, and natural wrapper completion is always reported as exit zero.
- ordinary Unix/Windows `is_alive` returns true until a mutable wait method caches status; Windows graceful stop inherits a successful no-op.
- Unix receive timeouts are reported as `ReceiveFailed`, normal EOF is `Ok(0)`, `is_connected` can return true with a pending socket error, and server shutdown only unlinks the path.
- privileged stale-child cleanup uses basename/parent-PID heuristics and is intentionally warning-only; path/user/start-time identity is not established.
- five interface module-index files are inert duplicates, the factory/server helpers have no production caller, and `tokio`/Windows `zeroize` are unused manifest dependency candidates.
- 47 inline tests omit the user-session, containment, cleanup-race, named-pipe, and critical timeout paths; checked CI runs builds but no tests.

See [the complete infra analysis](06-endpoint-infra-platform-runtime.md) and [manual semantic reference](07-symbol-reference/endpoint-infra-platform-runtime.md). The 263-path checkpoint at this boundary is superseded by the proxy closure below.

## Endpoint proxy closure

All 118 `proxy/` paths are now semantically classified. The package is a separate Rust process with ordinary HTTP proxy and transparent HTTPS listeners, optional Windows WinDivert or macOS Network Extension interception, content extraction, local/remote/heuristic DLP analysis, the core policy engine, UI justification, alert delivery, health endpoints, and broker clients.

The checked implementation is substantially less uniform than its documents imply:

- startup initializes policy asynchronously and explicitly allows traffic while the engine is absent, initializing, timed out, or returns no applicable enforcement action;
- HTTP body capture buffers complete bodies and performs lossy UTF-8 conversions in several paths; the advertised streaming behavior is not implemented as end-to-end streaming;
- forwarding retries can replay non-idempotent requests, rebuild requests without preserving all headers, and applies fixed circuit-breaker names rather than a destination-scoped breaker;
- WebSocket relay has no circuit breaker, upstream proxy, I/O timeout, or task bound;
- the native/Tauri justification paths map timeout, queue saturation, cancellation, and UI failure to the configured default action;
- Windows interception has an ineffective receive-worker wake path that can hang shutdown, and its monitored UDP policy ignores the configured allow lists and deny PIDs;
- macOS starts the Network Extension before binding its Rust control listener, while Swift attempts its initial connection only once; active TCP uses an unauthenticated localhost relay and claimed metadata, and active UDP is rejected rather than forwarded;
- 154 external-root plus 164 inline test declarations exist statically, but the IPC root is not target/feature gated, an alert test file is undiscovered, and the completed root-automation audit found no checked CI test execution.

Detailed evidence is split across [runtime/HTTP](06-endpoint-proxy-bootstrap-http.md), [DLP/UI/alerts](06-endpoint-proxy-dlp-ui-alerts.md), [packet redirection](06-endpoint-proxy-packet-redirection.md), and [build/tests/docs](06-endpoint-proxy-build-tests-docs.md). This checkpoint left 145 endpoint paths; the repository closure below supersedes that interim count.

## Endpoint repository closure

The remaining 145 endpoint paths—root files, `.github`, build/deployment/distribution scripts, tools, dormant root tests, and documentation—are now fully classified. This closes all 876 tracked paths in `sentinel-endpoint-agent` at commit `a022e52`.

The final shell audit materially changes the operational picture:

- current Actions workflows build and upload packages but do not run tests or publish/deploy/rollback a production release;
- current, old, manual, and alternate Python release trees coexist and disagree on flags, component sets, filenames, signing paths, and validation behavior;
- several package branches do not consume the signed output they produced, so workflow signing success is not proof of packaged-byte signing;
- a development EC private key/certificate/PKCS#12 set is committed under the old build tree, and Windows packaging has a mode that can include a CA private key;
- the alternate Python deployment path fails on an undefined parsed field before ordinary deployment, and its Windows preflight forms a double `.exe` suffix;
- root Rust integration-looking tests are not attached to a Cargo package/test target, while checked workflows run no tests;
- the 52 closing documentation paths contain valuable design context but also proposed E2E, hook, proxy-v2, and SCEP behavior that is not implemented as committed;
- committed support artifacts include a vendored 34 MB signing JAR, a compiled arm64 installer ZIP with no current caller, and a UTF-16LE operational log.

See [the build/release/install/update analysis](06-endpoint-build-release-install-and-update.md) and [the root/tools/tests/documentation analysis](06-endpoint-root-tools-tests-and-documentation.md). Cross-repository inventory coverage is 1,265 of 1,265 tracked paths accounted for; confidence and unresolved external boundaries remain recorded rather than converted into implementation claims.
