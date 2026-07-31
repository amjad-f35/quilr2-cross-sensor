# 18 — Documentation Consistency Audit

| Documentation Claim | Source | Actual Code Evidence | Result |
| --- | --- | --- | --- |
| Current IPC is cross-platform with Windows named pipes. | `ipc-event-bus/README.md:3`; `docs/architecture.md` | Current `platform/mod.rs` only declares Unix; no Windows implementation is tracked. | Contradicted |
| Current IPC uses typed messages, schema version/type IDs, and an `IpcMessage` derive. | `ipc-event-bus/docs/architecture.md`; `product/prd.md` | The only transport model is concrete `Message { content, timestamp }`; frame is u32 length + JSON. | Planned/documentation-only |
| Socket files use mode 0600 and runtime directories are always user-specific/0700. | `ipc-event-bus/docs/architecture.md`; `product/prd.md`; `platform/mod.rs` comment | No socket chmod occurs; XDG and `TMPDIR` are returned directly. Only `/tmp/ipc-light-{uid}` fallback is chmod 0700. | Contradicted |
| `IPC_LIGHT_CONNECT_TIMEOUT_MS` controls connection timeout. | `ipc-event-bus/config.rs` docs | Value is parsed/stored/logged but not applied to `UnixStream::connect` or the retry loop; invalid values are suppressed there. | Contradicted |
| Shutdown timeout forces exit. | `ipc-event-bus/shutdown.rs` log/comment | Timeout branch logs and returns without process termination. | Contradicted |
| Verification scripts use the library's socket path. | `README.md`, `verify_poc.sh`, `cleanup.sh`, `test_phase1.sh` | Library may use XDG/TMPDIR and prefixes `ipc_light_` to channel `ipc_light_poc`; scripts disagree on path/name. | Contradicted |
| Pinned IPC rate limiter is a token bucket. | Pinned `rate_limiter.rs` documentation | It stores all timestamps in a one-second sliding window; it has no token/refill state. | Contradicted |
| Pinned Windows IPC restricts named-pipe access to the current user SID. | Pinned security documentation | `get_current_user_sid` is a stub returning an error; remote clients are rejected, but a current-user ACL is not applied. | Contradicted |
| Pinned duplex `split()` provides independently concurrent send and receive. | Pinned duplex documentation/examples | Both halves share one mutex and hold it across awaited I/O. | Contradicted |
| Pinned broker exposes health and complete metrics behavior. | Pinned broker documentation | Health/statistics types exist, but the executable does not instantiate `HealthChecker` or expose an interface; several typed stats paths are test-only. | Partially confirmed |
| Broker connect retries and shutdown timeout settings control broker runtime. | Pinned broker configuration documentation | Both values are parsed/validated, but no production consumer uses either value. | Contradicted |
| All pinned Cargo examples conform to the pinned public API. | Pinned Cargo manifest | `examples/broker_poc.rs` calls `connected` with the wrong arity and treats `MessageType` as a string. | Contradicted |
| Dashboard production exposes the internal authentication routes exercised by integration tests. | `api_server/v2/tests/helpers_test.go` route table | `api_server/v2/cmd/server/main.go` does not instantiate auth service/handler or register login/me. | Contradicted |
| Portal JWT signature verification occurs at a reverse proxy in the repository deployment. | `internal/middleware/portal_auth.go` comment | Middleware ignores signatures; both Compose files publish API port 33333 directly; no enforcing proxy configuration is present. | Not verifiable / potential deployment gap |
| Policy identifiers are intentionally not whitelisted. | `internal/model/tenant_policy.go` validation comment | `TenantPolicy.Validate` rejects app IDs and classifier IDs not in the embedded catalog. | Contradicted |
| Updating the embedded policy catalog requires no server recompile. | `internal/model/tenant_policy_catalog.go` comment | `data/embed.go` uses Go `embed`; catalog bytes are compiled into the binary. | Contradicted |
| API development commands use `api_server/v1`, `--migrate-clickhouse`, and a live PostgreSQL database. | Root `CLAUDE.md` | Current server is v2, only exposes tenant-policy migration flags, uses a separate migration executable, and has no PostgreSQL dependency. | Outdated / contradicted |
| Integration tests represent production routes. | `tests/helpers_test.go` | Test router adds auth endpoints and omits multiple production endpoints. | Contradicted |
| Frontend login uses email/password, SHA-256, login/me, logout, and a user menu. | frontend product/architecture specs | Current login consumes a URL token; context has no login/logout; no user menu exists. | Outdated/contradicted |
| Frontend logs out on 401 and backend validates its JWT. | frontend architecture spec | Client only throws on 401; portal middleware does not verify signatures. | Contradicted |
| Relationship layout uses ELK. | frontend architecture spec; `useElkLayout` name | `elkjs` is installed but not imported; custom concentric layout executes. | Partially confirmed / misleading name |
| Policy status donut and governance score are displayed. | frontend product spec | `PolicyStatus` implements them but is not rendered. | Planned/code-present but unreachable |
| Claude Activity is a frontend feature. | frontend product spec | Page/client/hooks exist but have no route and server has no OTel routes. | Incomplete/runtime-unreachable |
| YAML preview is the backend contract. | `YamlPreviewDrawer` helper text | It combines real policy with static mock data in a different shape. | Contradicted |
| Asset-detail errors are displayed. | frontend product spec | Detail fetch catch is empty. | Contradicted |
| Nginx supports agent SSE at `/ea/v1/sync/stream`. | `frontend/nginx.conf` comment | Server registers no stream route. | Documentation-only |
| The entity request `id` is the canonical ID and no separate field is needed. | `docs/contracts/entity-sync-contract.md` | Handler requires `canonical_id`; ingestion stores `id` separately as `agent_id`. | Contradicted |
| Canonical-ID consumption is only proposed. | `docs/adr/adr-canonical-id-consumption.md` status | Model, handler, service, parent-edge extraction, and tests implement the decision. | Implemented; status stale |
| V2 is applications-only with four unprefixed tables and port 8443. | `docs/adr/v2-architecture-decision-record.md` | Production supports nine entity types, validates ten `endpoint_*` tables, and defaults to port 33333. | Superseded/contradicted |
| Dashboard architecture has five writers and production AuthService/JWT verification. | `docs/architecture/backend-architecture-spec.md` | Server starts six writers, never constructs AuthService, and `PortalAuth` ignores signatures. | Contradicted |
| Tenant-policy `since` is mandatory and policy versions are JSON numbers. | `docs/contracts/tenant-policy-sync-contract.md` | Missing `since` defaults to zero; `PolicyVersion` marshals as a JSON string. | Contradicted exact wire contract |
| Local DevSecOps precheck defaults to INFO and accepts `--org`. | Bash runner usage | Code defaults to ERROR and has no `-o/--org` parser branch. | Contradicted |
| Local precheck findings fail the invoking process. | Precheck stage semantics/summary | Both variants retain codes for display but do not explicitly exit with aggregate failure. | Not implemented as a gate |
| The app-intel loader populates dashboard app enrichment. | `app-intel/README.md` | Loader writes `app_catalog`; API reads `endpoint_app_catalog`. | Contradicted at this commit |
| Core scripting verifies signed script bundles before execution/update. | signing types/names and manifest-engine structure | Both known callers discard `Ok(false)`; only verifier errors stop them. | Contradicted |
| A signed bundle protects its scripts. | bundle/signing terminology | Verifier signs only `manifest.json`; referenced Lua bytes are not verified. | Contradicted |
| `RawEntityDescriptor` is validated/normalized into strongly typed entities downstream. | `result_collector.rs:4-7` doc comment | Active v2 converter never reads `raw_entities`. | Contradicted |
| All script entity types flow through v2 pipeline. | ADR-011 | Nine typed vectors flow; raw entities/events and several typed fields are dropped. | Partially confirmed |
| Script risk summaries are emitted through `set_risk`. | six committed Lua scripts | Registered callback returns success without reading/storing table. | Planned/placeholder |
| v2 reuses sandbox primitives and bypasses manifest signing. | ADR-011 | executor imports/calls sandbox and collector directly. | Confirmed |
| Scripting builds require a materialized public-key PEM. | `.github/SECRETS.md` | `include_bytes!`; current build workflow decodes secret. | Confirmed |
| Capability access confines filesystem reads. | ADR capability wording | `fs.read` allows any process-readable path; workspace is ungated. | Partially confirmed / boundary broader than name |
| Core templating is a “complete” DLP alert system. | `core/src/templating_engine/mod.rs:3-32` | Submission command is unregistered, legacy template incompatible, and queue/window behavior is untested. | Contradicted |
| Default justification is handled by the core request context. | `JustificationContext` field/docs | Core never reads it; proxy adapters retain a clone and substitute it after `None`/cancel/timeout. | Contradicted |
| Nonblocking popup contexts bypass the blocking FIFO. | `ui.rs::build_context_and_launch_window` docs/branch | Branch exists only for `resp_sender=None`; every checked proxy adapter always supplies `Some`. | Implemented but not used by checked production callers |
| A second hide after decision would steal the next popup's sender. | `alert.html:508-512` comment | Alert avoids it, but `block.html` and `prompt.html` invoke hide after Rust already advances. | Confirmed warning; sibling templates contradict it |
| `hide_alert_window` returns absence/hide errors. | `commands.rs:207-220` docs | Function always returns `Ok(())`; queue helper suppresses hide failures. | Contradicted |
| Tauri startup panics when template parsing fails. | `ui.rs:222-226` docs | Candidate failures are logged; exhaustion returns. Only app/window builds use `expect`. | Contradicted |
| Module usage example constructs current types. | `templating_engine/mod.rs:34-64` | Example omits extended `Detection` fields and `template_name`; doctests are disabled. | Outdated/not verified |
| Legacy `templates/index.html` is a usable queue UI. | file content/name | It expects missing top-level variables, nonexistent `get_dlp_queue`, and unregistered/mis-shaped `submit_justification`. | Legacy/incompatible |
| All shared templating state is mutex-protected. | `mod.rs:66-69` | Related state uses six mutexes plus relaxed atomics and is updated in separate critical sections. | Partially confirmed |
| Archive extraction is a safe, production-ready recursive feature. | `archive_extractor.rs:1-85` header | `core/src/lib.rs:14` comments out the entire module; no production API exists. | Documentation-only / contradicted reachability |
| `MAX_EXTRACTION_TIMEOUT` enforces a maximum. | constant name/header | Only zero maps to 300 seconds; any nonzero `u64` is accepted unchanged. | Contradicted |
| GZIP, BZIP2, and ZSTD are directly supported archive types. | extractor support list | Each decoded stream is passed to `tar::Archive`; raw single-file compressed streams are not handled by that strategy. | Partially confirmed / overstated |
| RAR individual support is pending. | extractor header | `RarStrategy` and direct `unrar` dependency exist, though runtime linking/behavior is unresolved. | Partially contradicted |
| Progressive extraction returns verified filesystem-equivalent results. | decompression test comments/output | Exact equality assertion is commented out; timeout can return while workers continue. | Contradicted |
| Alert benchmarks measure current handoff/end-to-end behavior. | benchmark headers/group names | They reference absent `AlertPayload`, implement removed `to_alert_payload`, suppress errors, and never wait for persistence/upload. | Outdated/compile-incompatible |
| The happy-path payload is 512 bytes. | `STRING_512_BYTES` name/comment | It is 519 ASCII bytes. | Contradicted |
| `RawStringAlert` defers serialization. | benchmark comments | Legacy payload construction is synchronous before submission. | Contradicted |
| Core integration tests verify Bootstrap → Agent security and exit codes. | `integration_bootstrap_agent.rs` header | No bootstrap/agent executable or validation symbol is invoked; only environment/core manager are used. | Contradicted |
| Vault and TimeKeeper are current default services. | common/lifecycle/status tests | Both definitions are commented from defaults; active graph has eight different services. | Outdated/contradicted |
| Vault retrieve/list are unimplemented. | communication-test comments | Current `VaultService::retrieve` and `VaultManager::list` are implemented. | Outdated |
| Repository CI validates core tests and benchmarks. | test/benchmark presence | Checked workflows/builders call named-package `cargo build` only. | Not implemented |
| The database gRPC feature matches its schema. | protobuf/server/client names | Proto generates `table`; Rust destructures `schema_id`. | Contradicted / statically incompatible |
| Exact dependency revisions are recoverable from the source revision. | Cargo version constraints | All Cargo lockfiles are ignored/absent. | Not verifiable |

The full per-document audit, including all 15 root `docs/` files and three guidance files, is in [Dashboard operations and documentation audit](06-dashboard-operations-and-documentation.md#documentation-consistency-audit).

## System monitor documentation contradictions

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| v2 stores discoveries in local/relational DB | `features.md`, historical v1 docs | DashMap + JSON snapshot only | Contradicted |
| scans full drives and pip/gem/brew/chocolatey | `features.md` | selected markers/workspaces + npm/Cargo/Go | Planned but not implemented |
| process removal makes Application inactive | architecture/ADR 002 | removed PID only untracked | Contradicted |
| production alias/app caches receive backend data | ADR 003 | update APIs called only by tests | Contradicted |
| snapshot includes cache metadata/eviction | ADR 004 | only version/entities/cursor | Contradicted |
| delta is chunk-streamed and trait-adapted | ADR 006/architecture | complete collect; no SyncClient trait | Contradicted |
| one Error enum/no panic paths | ADR 007/architecture | anyhow/String/unwrap/expect/zero-setting panics | Contradicted |
| notification payload has entity/policy/reason/time | ADR 008 | TemplateRenderRequest shape | Outdated |
| audit is durable asynchronous queue | ADR 009 | awaited direct POST/no spool | Contradicted |
| scanner enforces manifest/signatures | ADR 011/manifest | direct script path with hard-coded caps/limit | Contradicted |
| three v1 scripts ported as-is | ADR 012 | seven extensively developed detectors | Outdated |
| DLP env is `DLP_BASE_URL` and hooks call it | ADR 013/015 | `QUILR_DLP_ENDPOINT`; no production caller | Contradicted/planned |
| Persona retries three times and falls back | ADR 014 | retries indefinitely until tenant | Contradicted |
| sync pauses during sleep | ADR 019 | only monitor/enforcer use power channel | Contradicted |
| max attempts stops enforcement | ADR 020 | Rediscovered bypasses check | Partially contradicted |
| hook merge preserves all user hooks | ADR 021 | whole hooks object replaced | Partially contradicted |
| automated mock-backend E2E exists | E2E design | only manual/stale assets | Planned but not implemented |

All 43 Markdown paths are individually classified in [the system-monitor documentation audit](06-endpoint-system-monitor-scripting-packages-tests-and-documents.md#documentation-classification-and-consistency-audit). ADR 016 is absent; the reason is unresolved.

## Template service documentation contradictions

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| startup is logging/config/registry/runtime/IPC/Tauri | `template-service/docs/CONTEXT.md:66-80` | current `main` also creates Ctrl+C, starts kill listener, blocks for fixed gate, and can return disabled | Partially confirmed; security/lifecycle stage omitted |
| four hard-coded templates exist | `CONTEXT.md:156-163` | `get_hardcoded_defaults` returns eight | Outdated |
| response source follows request through the flow | context IPC/data-flow discussion | active slots retain it; both queues discard it; dedup discards later request identities | Contradicted for accepted queue/dedup paths |
| alert/block fragments embed style tags | `CONTEXT.md:229` | fragments contain no style tags; shared host owns CSS | Contradicted |
| templates resolve installation, Cargo, relative | `CONTEXT.md:173` | environment template dir is first; Cargo precedes installation | Contradicted/incomplete |
| all Tera context fields provide functionality | `CONTEXT.md:218-228` | current fragments ignore theme, original text, header, content, justification choices, and logo URL | Partially confirmed as insertion; not presentation |
| NeedsAttention forces user acknowledgment | `CONTEXT.md:279`; `USAGE.md:330` | timeout is zero, but close yields NotificationDismissed and X bulk-dismisses | Partially confirmed |
| max concurrent values are windows/toasts shown at once | `USAGE.md:341-343` | one window per category paginates active slots | Contradicted |
| default timeout config supplies default behavior | `USAGE.md:351-360` | both parsed timeout fields are unused by request handling | Contradicted |
| templates dynamically load from backend API | `USAGE.md:373-383` | only local JSON in backend-shaped format is read; no HTTP client | Contradicted |
| `acknowledged_buttons` selects block | docs mapping text | converter checks Notification, then justification-list presence, then falls back to Block | Partially confirmed outcome; causal claim wrong |
| status queries current engine state | `USAGE.md:174-197` | notification active/queue/window state is absent | Incomplete |
| dismiss request dismisses active template | `USAGE.md:163-173` | only active regular slots; queued/notification IDs omitted; response goes to dismisser | Incomplete |
| environment table covers runtime inputs | `USAGE.md:364-370` | omits active `SENTINEL_TEMPLATE_DIR` and active deprecated `SENTINEL_TEMPLATE_FILE` | Incomplete |
| spawn/render script starts and kills process and checks help | `tests/test_spawn_render.sh:4-7,38` | script only builds/tests and checks file existence/size | Contradicted |
| queue full returns immediate Closed; process is stateless | both guides | code matches for full queues and has no persistence | Confirmed, except silent queued clear/source-loss behavior is undocumented |

The full source comparison and exact implementation references are in [the template-service documentation audit](06-endpoint-template-service.md#documentation-consistency-audit).

## Email-discovery documentation contradictions

| Claim | Source | Actual evidence | Result |
| --- | --- | --- | --- |
| any helper error exits nonzero | `email-discovery/src/main.rs:19-21` | source/task errors and serialization failure produce partial/empty frame and can exit zero | Contradicted |
| parent detects nonzero child exit | same module comment | parent ordinarily waits IPC and ignores detached wait result | Contradicted/limited macOS wrapper exception |
| endpoint names use wildcard suffix | `docs/core/persona/email_discovery_decoupling.md:97,105` | fixed `IpcAddress::for_service` paths | Contradicted |
| bind-before-spawn means no race | decoupling guide | server-ready race removed; no peer auth, so client race remains | Partially confirmed |
| timeout kills process and returns empty | guide line 87 | kill is attempted/ignored; read/timeout does return empty Ok | Partially confirmed |
| path is passed by environment and CLI | parent comments/code | ProcessConfig contains both, but Windows user-session CreateProcess call omits config environment | Contradicted on Windows path |
| null DACL is acceptable | guide/source comments | broad grant/single connection verified; risk assertion untested | Not verifiable policy claim |
| direct and subprocess paths use same nine-source logic | guide | both call core `run_local_discovery` | Confirmed |

See [the complete helper audit](06-endpoint-email-discovery.md#tests-and-documentation-audit).

## Diagnostics documentation contradictions

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| macros accept no-code calls | crate README and usage guide | both macro arms require a code path and call `.code_str()` | Contradicted |
| `component =` overrides component | both guides | key/value pairs form context; component always inferred | Contradicted |
| persistence is crash-safe / always writes NDJSON | README/lib/usage guide | default buffer retains up to 49 only in memory; no shutdown flush/fsync | Contradicted |
| every process needs local init plus core IPC init | usage guide | core macros route only to core's separate sender; local worker receives nothing from them | Contradicted |
| process ID appears in payload | usage guide JSON | no `process_id` field; receiver drops broker source | Contradicted |
| `sentinel_core::service` infers Agent | usage guide | code maps `::service::` to ServiceManager | Contradicted |
| ordinary `fn main` can call init | usage guide | init immediately calls Tokio spawn | Contradicted/incomplete |
| first broker failure produces one warning | client/server comments | first failure only flips Boolean; later errors debug-log | Contradicted |
| receiver max backoff is 30 seconds | server docs | constant is 60 seconds | Contradicted |
| Docker readiness is bounded to 60 seconds | binary comment/error | request and unbounded Docker-command time extend total | Partially confirmed |
| Docker resources are beside installed binary | build docs | Cargo output gets them; checked packaging copies only binary | Partially confirmed/unresolved externally |
| helper test-data script exists | setup output | named file absent | Contradicted |
| integration target is `opensearch` | README | file target is `opensearch_integration` | Contradicted |
| integration Compose name exists | test source | named file absent | Contradicted |
| deployment graph mirrors core defaults | deployment Python | diagnostics default definition is commented out | Contradicted |

See [the complete source/documentation comparison](06-endpoint-diagnostics-receiver.md#documentation-consistency-audit).

## Endpoint infra contradictions

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| interfaces contain no implementation/application logic | `infra/src/interface/readme.md` | builders, helpers, address formatting, defaults, tests | Contradicted |
| selector detects the OS at runtime | selector module docs | mutually exclusive compile-time `cfg` | Contradicted |
| Linux shares Unix process/socket implementation | interface/platform comments | all Linux getters `todo!`; macOS HAL cfg-excluded | Planned but not implemented |
| Windows process layer is a Phase-4 stub | Windows parent module docs | ordinary/native spawn, Job Object, cleanup implemented | Outdated/partly contradicted |
| Windows named-pipe IPC is available | IPC/interface docs | all operations `NotImplemented`, no server | Contradicted |
| timed receive returns timeout | `IpcChannel` docs | Unix maps OS timeout to `ReceiveFailed` | Contradicted |
| connected check performs zero-byte write | Unix method comment | only `take_error().is_ok()` | Contradicted |
| server shutdown stops accepting | `IpcServer` docs | Unix only unlinks path; listener stays open | Contradicted |
| process `is_alive` reflects OS state | process trait docs | ordinary handles return true until a wait caches status | Contradicted |
| configured IPC address is passed to child | `ProcessConfig` field docs | concrete adapters never read field; separate env/CLI may carry it | Partially confirmed |
| Windows native child receives configured env | process/core comments | native spawn never reads map and passes null environment block | Contradicted |
| macOS tracked PID is the requested user child | user-session docs | uid finder parameter unused; newest same-name PID chosen | Not verifiable / weaker implementation |

See [the complete infra consistency audit](06-endpoint-infra-platform-runtime.md#documentation-consistency-audit).

## Endpoint proxy documentation consistency

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| listeners bind before interception | startup comments/docs | async listener futures are constructed but not polled until after redirector startup | Contradicted |
| non-macOS path supports Windows/Linux | README/main comment | Windows module is target-gated and no Linux redirector exists | Contradicted |
| macOS uses pf/pfctl interception | older architecture/readmes | active path is Network Extension + Rust relay | Outdated |
| macOS data plane is zero-copy SCM_RIGHTS | Swift/Rust protocol docs | current Swift opens localhost relay TCP and never emits `tcp_redirect` | Outdated/contradicted |
| macOS UDP is forwarded | packet/Swift docs | active monitored UDP branch closes `ECONNREFUSED`; helper path is unreachable | Contradicted |
| configured ports/TLS control extension rules | redirector docs/config | Swift hard-codes TCP and UDP 443 include rules | Contradicted |
| process matching is case-insensitive | config comments | Swift exclusion `Set` uses case-sensitive names | Contradicted on macOS |
| relay concurrency is 200/no wall cap | mixed Rust/Swift docs | Rust allows 4,096, Swift allows 200 and forces five-minute relay | Contradicted/internally inconsistent |
| flow metadata preserves client source | architecture text | active Swift sends `0.0.0.0:0` | Contradicted |
| proxy streams large bodies | README/source comments | important capture/extraction/forward paths buffer whole bodies | Partially confirmed at transport only / contradicted at application path |
| health/restart settings provide self-healing | CLI/docs | several fields are stored/inert and restart path is incomplete | Partially implemented |
| fail-closed unknown-destination option controls behavior | CLI/config comments | field has no active decision read | Planned but not implemented |
| DLP model path runs local model | CLI/docs | optional external SDK/feature boundary and analyzer implementation do not substantiate a repository-contained model | Not independently verifiable |
| alert docs use `QUILR_ALERT_API_URL` | alert comments | core backend mapping uses `QUILR_BACKEND_BASE_URL` | Contradicted |
| tests include config/MITM/DLP/cert suites named in guide | `proxy/tests/README.md` | named files do not exist; actual roots differ | Contradicted |
| IPC integration is portable/discoverable | test layout implication | root lacks target/feature gate and imports mac-only module | Contradicted |
| system extension bundle uses documented output/name | Swift README/build docs | active build output/bundle ID is `ai.quilr.agent.sentinel.extension` | Outdated |
| extension bundle ID is `com.sentinel...` | setup/architecture examples | plists/build scripts use `ai.quilr...` | Outdated |
| Swift multi-architecture build follows `ARCH` | build-script output/comments | `ARCH` is printed but not passed to `swift build` | Contradicted |

The larger claim-by-claim audit, including test-guide mismatches, is in [proxy build/tests/docs](06-endpoint-proxy-build-tests-docs.md#documentation-consistency-table).

## Endpoint delivery, root, and repository-documentation contradictions

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| old CI performs a supported macOS skip-sign build | `.github/workflows/ci.yml` | current macOS builder exposes skip-notarization but no matching `--skip-sign` option | Contradicted |
| workflow success implies all prechecks succeeded | `.github/scripts/precheck.*` summaries | stage status is collected/displayed but never returned as aggregate process failure | Contradicted |
| deployment parser supports a workspace root | `deployment/deploy.py` main path | parser defines no `--workspace-root`; `main` reads `args.workspace_root` | Contradicted/broken |
| Windows proxy preflight uses the configured executable | deployment configuration/preflight | configured name already ends in `.exe`; preflight appends another `.exe` | Contradicted |
| generated Intune Windows deployment is self-contained | generated guide/generator purpose | output script expects an external PFX at a fixed path; generator neither creates nor copies it | Contradicted |
| Intune `--config` selects a configuration file | CLI help | `main` always constructs the default deployment object and never passes the CLI value | Contradicted |
| certificate verification checks the configured macOS certificate name | generated verification intent | generated search uses literal `Custom` rather than configured name | Contradicted |
| root integration tests are part of the workspace test surface | root `tests/` placement | virtual root has no package or explicit test target | Not discovered as committed |
| debug helper runs the built agent | `run_agent_debug.sh` | helper names `target/debug/agent`; workspace executable is `sentinel` | Outdated/broken |
| E2E implementation plan describes existing test infrastructure | `docs/e2e_test_implementation_plan.md` | proposed `e2e/`, crates, workflows, fixtures, and seams are absent | Planned but not implemented |
| proxy v2 plugin/service design is current implementation | proxy v2 specification documents | active proxy uses the separately documented static Rust module/feature topology; proposed plugin/sled/service-context surfaces are absent | Planned/future design |
| hook ADR describes active DLP enforcement | `docs/hook-architecture-adr.md` (`Proposed`) | hook evaluator currently returns Allow/telemetry and no proposed DLP chain is registered | Partially implemented/planned |
| manual deployment guide names a usable proxy build script | `docs/deployment/manual-testing.md` | referenced `proxy/build-and-notarize.sh` path does not exist; actual file is elsewhere/name differs | Contradicted |
| current workflows validate and publish a release | workflow/readme implications | workflows build/upload artifacts; no test stage, production publication, rollout, or rollback job is committed | Partially implemented |
| code-signing output is always the packaged binary | signing/builder flow | multiple collection/package steps copy original build paths rather than every signed-output path | Contradicted for affected branches |

The 52 documentation paths in the closing slice were each classified. Design documents explicitly marked proposed are retained as planning evidence and are not treated as implemented behavior. Full grouping and claim qualification are in [the root/tools/documentation chapter](06-endpoint-root-tools-tests-and-documentation.md); build/install contradictions are in [the delivery chapter](06-endpoint-build-release-install-and-update.md).
