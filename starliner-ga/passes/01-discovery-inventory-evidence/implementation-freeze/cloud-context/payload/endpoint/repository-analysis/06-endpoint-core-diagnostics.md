# Endpoint Core Diagnostics Facade and Code Registry

**Repository:** `sentinel-endpoint-agent`  
**Revision:** `a022e52bf2fff6a9445ebad96c3afeaf277e259f`  
**Primary scope:** `core/src/diagnostic_codes.rs`, `core/src/diagnostics/mod.rs`, and `core/src/diagnostics/macros.rs`  
**Context traced into:** the local `sentinel-diagnostics` crate, producer startup sites, broker service declarations, packaging scripts, and every checked `DiagCode`/`diag_*!` reference  
**Confidence:** Verified except where explicitly marked `Inference` or `Unresolved`

## Scope and conclusions

Verified: these three handwritten files form a small, always-compiled facade over the workspace-local `sentinel-diagnostics` crate. The facade provides:

1. a macro-generated `DiagCode` enum with 56 codes;
2. five severity wrapper macros and one dispatch macro;
3. process-global, one-time initialization of a `DiagnosticsSender`; and
4. a hidden-but-public `emit` function that builds a payload and either enqueues it or drops it.

Verified: the checked tree contains 41 executable `diag_*!` invocations. They use 35 of the 56 codes. Twenty-one codes have no executable emitter after searches for enum references, macro calls, comments, documentation, tests, and service registrations. This is reported as a checked dead-code candidate classification, not proof that an external downstream crate never names the public enum variants.

Verified: default runtime reachability is narrower than syntactic reachability. Database and Persona emitters participate in active core paths; proxy emitters participate when the proxy process runs. Scheduler has no checked production constructor/caller. The Vault, Keystore, and Diagnostics service emitters are in legacy wrappers that are exported but not present in `get_default_services`.

Verified: the proxy emits `ProxyPolicyEngineInit` in `proxy/src/platform/common.rs:2342-2346` before it calls `sentinel_core::diagnostics::init_ipc("sentinel_proxy_diag")` at line 2350. No earlier proxy initialization site was found. That payload is constructed, produces the facade's one-time warning, and is dropped.

## File classification

| Path | Role | Runtime status | Generated/vendored | Analysis status |
| --- | --- | --- | --- | --- |
| `core/src/diagnostic_codes.rs` | Code registry and macro-generated formatting API | Always compiled through `core/src/lib.rs`; public enum is used by core and proxy | Handwritten; enum/method source is macro-generated at compilation from a handwritten invocation | Fully analyzed |
| `core/src/diagnostics/macros.rs` | Exported producer macros | Always compiled through `diagnostics::macros`; 41 executable invocations found | Handwritten | Fully analyzed |
| `core/src/diagnostics/mod.rs` | Process-global sender facade | Always compiled; initialized by agent and proxy entry paths | Handwritten | Fully analyzed |

## Compilation and public surface

Verified: `core/src/lib.rs` publicly declares both `diagnostic_codes` and `diagnostics`. `DiagCode`, its methods, `init_ipc`, and the re-exported diagnostics types are therefore reachable through the `sentinel_core` library. Each `#[macro_export]` macro is exported at the crate root, even though its source file is a private `mod macros`.

The facade re-exports these dependency-owned types:

| Re-export | Defined in | Relevant representation |
| --- | --- | --- |
| `DiagnosticsSender` | `diagnostics/src/ipc/client.rs:23-25` | Cloneable wrapper around `tokio::sync::mpsc::UnboundedSender<DiagnosticPayload>` |
| `Level` | `diagnostics/src/types.rs:16-22` | `debug`, `info`, `warn`, `error`, `critical` under Serde snake case |
| `Category` | `diagnostics/src/types.rs:49-60` | `startup`, `shutdown`, `runtime`, `network`, `security`, `dlp`, `performance`, `config`, `ipc`, `database` |
| `Component` | `diagnostics/src/types.rs:92-109` | Sixteen component values; macro call sites use `from_module_path` |
| `DiagnosticPayload` | `diagnostics/src/types.rs:184-196` | UUID, UTC timestamp, level, category, component, optional code, message, optional JSON context |

Verified: the core facade calls `DiagnosticPayload::new`, so every facade event has `code: Some(...)`, a fresh UUID v4, and `Utc::now()` at the time of the call. The public dependency type still permits deserialized or manually constructed payloads whose code is absent.

## Diagnostic-code construction

`DIAGNOSTIC_BASE` is `0x1000`. Each declared offset is stored as the `#[repr(u32)]` enum discriminant. `DiagCode::code()` adds the base. `code_str()` formats uppercase hexadecimal as `DIAG-{:04X}`. `Display` formats `DIAG-{:04X}:<LABEL>`.

Verified examples derived directly from the implementation:

- `DiagCode::DbConnFail.code()` is `0x1100` / decimal 4352.
- `DiagCode::DbConnFail.code_str()` is `DIAG-1100`.
- `DiagCode::DbConnFail.to_string()` is `DIAG-1100:DB_CONN_FAIL`.

Verified: core macros call only `code_str()`. The human-readable label is not included in `DiagnosticPayload.code`, `message`, or context unless a caller separately adds it; no checked caller does.

### Complete code registry and reachability

“Executable sites” counts syntactically live Rust calls; “runtime qualification” distinguishes active/default wiring from dormant wrappers. Documentation and comments do not count as executable sites.

| Variant | Offset | Emitted code | Label | Executable sites | Runtime qualification |
| --- | ---: | --- | --- | ---: | --- |
| `DbConnFail` | `0x100` | `DIAG-1100` | `DB_CONN_FAIL` | 1 | Active database registry path |
| `DbPragmaFail` | `0x101` | `DIAG-1101` | `DB_PRAGMA_FAIL` | 1 | Active database registry path |
| `DbPoolCreated` | `0x102` | `DIAG-1102` | `DB_POOL_CREATED` | 1 | Active database registry path |
| `DbUnsupported` | `0x103` | `DIAG-1103` | `DB_UNSUPPORTED` | 1 | Registry path; non-SQLite configuration branch |
| `DbConfigMismatch` | `0x104` | `DIAG-1104` | `DB_CONFIG_MISMATCH` | 2 | Active registry conflict branches |
| `SchedStarted` | `0x200` | `DIAG-1200` | `SCHED_STARTED` | 1 | Scheduler has no checked production caller |
| `SchedStopped` | `0x201` | `DIAG-1201` | `SCHED_STOPPED` | 1 | Scheduler has no checked production caller |
| `SchedTaskSkipped` | `0x202` | `DIAG-1202` | `SCHED_TASK_SKIPPED` | 1 | Scheduler has no checked production caller |
| `SvcStarted` | `0x300` | `DIAG-1300` | `SVC_STARTED` | 0 | Dead-code candidate; documentation example only |
| `SvcStartFailed` | `0x301` | `DIAG-1301` | `SVC_START_FAILED` | 0 | Dead-code candidate |
| `SvcStopped` | `0x302` | `DIAG-1302` | `SVC_STOPPED` | 0 | Dead-code candidate |
| `SvcValidationFailed` | `0x303` | `DIAG-1303` | `SVC_VALIDATION_FAILED` | 0 | Dead-code candidate |
| `SvcRegistered` | `0x304` | `DIAG-1304` | `SVC_REGISTERED` | 0 | Dead-code candidate |
| `SvcCrashDetected` | `0x305` | `DIAG-1305` | `SVC_CRASH_DETECTED` | 0 | Dead-code candidate |
| `SvcRetryScheduled` | `0x306` | `DIAG-1306` | `SVC_RETRY_SCHEDULED` | 0 | Dead-code candidate |
| `SvcRetryExhausted` | `0x307` | `DIAG-1307` | `SVC_RETRY_EXHAUSTED` | 0 | Dead-code candidate |
| `SvcRestartOk` | `0x308` | `DIAG-1308` | `SVC_RESTART_OK` | 0 | Dead-code candidate |
| `SvcRestartFailed` | `0x309` | `DIAG-1309` | `SVC_RESTART_FAILED` | 0 | Dead-code candidate |
| `SvcMonitorStarted` | `0x30A` | `DIAG-130A` | `SVC_MONITOR_STARTED` | 0 | Dead-code candidate |
| `SvcAllStarted` | `0x30B` | `DIAG-130B` | `SVC_ALL_STARTED` | 0 | Dead-code candidate |
| `SvcAllStopped` | `0x30C` | `DIAG-130C` | `SVC_ALL_STOPPED` | 0 | Dead-code candidate |
| `SvcHealthTimeout` | `0x30D` | `DIAG-130D` | `SVC_HEALTH_TIMEOUT` | 0 | Dead-code candidate |
| `VaultMetadataFail` | `0x400` | `DIAG-1400` | `VAULT_METADATA_FAIL` | 1 | Legacy Vault wrapper; absent from default graph |
| `VaultMigrationFail` | `0x401` | `DIAG-1401` | `VAULT_MIGRATION_FAIL` | 1 | Legacy Vault wrapper; absent from default graph |
| `VaultMasterKeyFail` | `0x402` | `DIAG-1402` | `VAULT_MASTER_KEY_FAIL` | 1 | Legacy Vault wrapper; absent from default graph |
| `VaultInitialized` | `0x403` | `DIAG-1403` | `VAULT_INITIALIZED` | 1 | Legacy Vault wrapper; absent from default graph |
| `PersonaManagerFail` | `0x500` | `DIAG-1500` | `PERSONA_MANAGER_FAIL` | 1 | Active Persona service factory path |
| `PersonaAuthOk` | `0x501` | `DIAG-1501` | `PERSONA_AUTH_OK` | 1 | Active Persona service factory path |
| `PersonaAuthFail` | `0x502` | `DIAG-1502` | `PERSONA_AUTH_FAIL` | 1 | Active Persona service factory path |
| `DiagnosticsStarted` | `0x600` | `DIAG-1600` | `DIAGNOSTICS_STARTED` | 1 | Legacy Diagnostics wrapper; absent from default graph |
| `KeystoreInitialized` | `0x601` | `DIAG-1601` | `KEYSTORE_INITIALIZED` | 2 | Legacy Keystore wrapper; absent from default graph; same code used for success and unsupported warning |
| `ProxyStarted` | `0x700` | `DIAG-1700` | `PROXY_STARTED` | 1 | Proxy startup after diagnostics initialization |
| `ProxyShutdown` | `0x701` | `DIAG-1701` | `PROXY_SHUTDOWN` | 1 | Proxy shutdown path |
| `ProxyPersonaReady` | `0x702` | `DIAG-1702` | `PROXY_PERSONA_READY` | 0 | Dead-code candidate; one call is commented out |
| `ProxyPersonaFail` | `0x703` | `DIAG-1703` | `PROXY_PERSONA_FAIL` | 0 | Dead-code candidate |
| `ProxyCertLoaded` | `0x704` | `DIAG-1704` | `PROXY_CERT_LOADED` | 1 | Proxy certificate-manager startup |
| `ProxyCertGenerated` | `0x705` | `DIAG-1705` | `PROXY_CERT_GENERATED` | 1 | Proxy CA generation |
| `ProxyCertFail` | `0x706` | `DIAG-1706` | `PROXY_CERT_FAIL` | 2 | Missing-certificate and missing-key branches |
| `ProxyDlpInitialized` | `0x707` | `DIAG-1707` | `PROXY_DLP_INITIALIZED` | 1 | Proxy DLP-enabled branch |
| `ProxyDlpDisabled` | `0x708` | `DIAG-1708` | `PROXY_DLP_DISABLED` | 1 | Proxy DLP-disabled branch |
| `ProxyDlpSensitive` | `0x709` | `DIAG-1709` | `PROXY_DLP_SENSITIVE` | 0 | Dead-code candidate |
| `ProxyDlpBlocked` | `0x70A` | `DIAG-170A` | `PROXY_DLP_BLOCKED` | 0 | Dead-code candidate |
| `ProxyDlpError` | `0x70B` | `DIAG-170B` | `PROXY_DLP_ERROR` | 0 | Dead-code candidate |
| `ProxyListenerBound` | `0x70C` | `DIAG-170C` | `PROXY_LISTENER_BOUND` | 1 | Proxy listener bind completion |
| `ProxyConnLimitHit` | `0x70D` | `DIAG-170D` | `PROXY_CONN_LIMIT_HIT` | 2 | HTTP and HTTPS acceptance limits |
| `ProxyTlsHandshakeFail` | `0x70E` | `DIAG-170E` | `PROXY_TLS_HANDSHAKE_FAIL` | 2 | Two MITM handshake error branches |
| `ProxyH2Fallback` | `0x70F` | `DIAG-170F` | `PROXY_H2_FALLBACK` | 2 | Two forwarding fallback branches |
| `ProxyForwardFail` | `0x710` | `DIAG-1710` | `PROXY_FORWARD_FAIL` | 1 | Forwarding error branch |
| `ProxyForwardTimeout` | `0x711` | `DIAG-1711` | `PROXY_FORWARD_TIMEOUT` | 1 | Forwarding timeout branch |
| `ProxyRedirectorStart` | `0x712` | `DIAG-1712` | `PROXY_REDIRECTOR_START` | 1 | Redirector start completion |
| `ProxyRedirectorFail` | `0x713` | `DIAG-1713` | `PROXY_REDIRECTOR_FAIL` | 1 | Spawned redirector error result |
| `ProxyMitmBypass` | `0x714` | `DIAG-1714` | `PROXY_MITM_BYPASS` | 1 | MITM bypass path |
| `ProxyAlertingReady` | `0x715` | `DIAG-1715` | `PROXY_ALERTING_READY` | 0 | Dead-code candidate |
| `ProxyAlertingFail` | `0x716` | `DIAG-1716` | `PROXY_ALERTING_FAIL` | 0 | Dead-code candidate |
| `ProxyDnsCacheInit` | `0x717` | `DIAG-1717` | `PROXY_DNS_CACHE_INIT` | 1 | Proxy DNS-cache startup |
| `ProxyPolicyEngineInit` | `0x718` | `DIAG-1718` | `PROXY_POLICY_ENGINE_INIT` | 1 | Executed before sender initialization, so dropped |

Verified totals: 56 variants; 35 variants with at least one executable call; 21 without one; 41 executable macro invocations.

## Macro contract

### `core_diagnostics_emit!`

The no-context arm accepts four syntactic elements: a level identifier, category identifier, code path, and message expression. The context arm additionally accepts one or more `identifier = expression` pairs and an optional trailing comma.

Execution order is:

1. evaluate `$code.code_str()` into a local `String`;
2. select `Level::$level` and `Category::$category`;
3. pass `&__code` and the message expression to `diagnostics::emit`;
4. derive `Component` from the compile-time `module_path!()` string;
5. for the context arm, eagerly build a `serde_json::Value::Object` through `serde_json::json!`, using `stringify!($key)` as each field name.

Verified limitations and behavior:

- The macro pattern says `$code:path`, but semantic compatibility is enforced only when the expansion invokes `.code_str()`; it is not pattern-restricted to `DiagCode`.
- Category and level must be dependency enum variant identifiers that compile in the generated paths.
- Context keys must be Rust identifiers; arbitrary string keys and computed field names are not accepted.
- Context expressions, string allocation, component inference, UUID generation, and UTC timestamp creation occur even when `init_ipc` has not run and the payload will be dropped.
- The macro has no return/status contract beyond the unit result of `emit` and cannot report enqueue, broker, receiver, storage, or backend success.
- There is no severity filter, sampling, rate limiting, redaction, or validation in the facade.
- There is no arm that permits a caller-selected `Component`. Documentation examples elsewhere that supply one are incompatible with this macro surface.

### Severity wrappers

| Macro | Prepended level | Executable calls found |
| --- | --- | ---: |
| `diag_debug!` | `Debug` | 0 |
| `diag_info!` | `Info` | 18 |
| `diag_warn!` | `Warn` | 6 |
| `diag_error!` | `Error` | 17 |
| `diag_critical!` | `Critical` | 0 |

Verified: all five wrappers accept arbitrary token trees and delegate validation to `core_diagnostics_emit!` and the Rust compiler. `diag_debug!` and `diag_critical!` are public APIs with no checked executable call sites.

## Executable producer map

| Producer file | Count | Categories / levels | Context keys |
| --- | ---: | --- | --- |
| `core/src/db/connection/registry.rs` | 6 | `Database` info/error | `alias`, `error`, `url`, `backend` |
| `core/src/scheduler/service.rs` | 3 | `Runtime` info; `Shutdown` info; `Performance` warn | `cmd_capacity`, `task_id` |
| `core/src/services/vault.rs` | 4 | `Startup` info/error; `Security` error | `error` |
| `core/src/services/persona.rs` | 3 | `Security` info/error | `error` |
| `core/src/services/diagnostics.rs` | 1 | `Startup` info | none |
| `core/src/services/keystore.rs` | 2 | `Startup` info/warn | none |
| `proxy/src/cert_gen.rs` | 3 | `Security` info/error | `reason` |
| `proxy/src/forward.rs` | 4 | `Network` error/warn | `uri`, `duration_secs`, `host`, `error` |
| `proxy/src/mitm.rs` | 3 | `Network` info; `Security` error | `host`, `error` |
| `proxy/src/platform/common.rs` | 12 | `Startup`, `Network`, `Performance`, `Shutdown`; info/warn/error | `error`, `http_port`, `https_port` |

Verified: these event contexts can contain full request URIs, host names, database URLs, and dependency error text. The facade performs no redaction. Whether a particular runtime value contains credentials, query data, paths, or personal data depends on the call-time value and is therefore `Unresolved` from static source alone.

## Component inference

`Component::from_module_path` is implemented in `diagnostics/src/types.rs:134-167` as a first-match substring chain. The relevant checked mappings are:

| Module-path condition | Component | Checked producer effect |
| --- | --- | --- |
| contains `sentinel_proxy::dlp` or `proxy::dlp` | `DlpEngine` | Proxy DLP modules, if calls exist there |
| contains `sentinel_proxy` or `proxy::` | `Proxy` | Current proxy producer files |
| contains `::service::` | `ServiceManager` | Singular `service` namespace only |
| contains `persona` | `Persona` | `core::services::persona` producer |
| contains `vault` or `keystore` | `Vault` | Both legacy Vault and Keystore wrappers |
| contains `scheduler` | `Scheduler` | Scheduler producer |
| contains `db` or `database` | `Database` | Database registry producer |
| contains `diagnostics` | `Diagnostics` | Diagnostics wrapper producer |

Verified: order matters. Proxy matches occur before all core checks. `services` plural does not satisfy the `::service::` check, but the later Persona/Vault/diagnostics checks still categorize the current wrappers. Unmatched paths become `Unknown`; the facade does not reject them.

## Initialization and lifecycle

### Process-global state

- `IPC_SENDER: OnceLock<DiagnosticsSender>` starts empty and can be assigned only once per process.
- `IPC_NOT_INIT_WARNED: AtomicBool` starts `false` and changes to `true` on the first pre-initialization `emit`; it is never reset.
- `init_ipc(process_id)` calls `IPC_SENDER.get_or_init(|| DiagnosticsSender::start(process_id))` and discards the returned reference.

Verified consequences:

- the first process ID wins; later calls cannot replace it or restart a stopped sender;
- there is no validation of empty, duplicate, or conflicting process IDs in the facade;
- `DiagnosticsSender::start` calls `tokio::spawn`, so initialization requires a live Tokio runtime even though `init_ipc` is synchronous;
- there is no facade shutdown, flush, join, readiness, health, reset, or retry-status API;
- dropping caller references does not stop the global sender because `OnceLock` retains its handle for process lifetime.

### Known initialization sites

| Site | Process ID | Ordering / status |
| --- | --- | --- |
| `agent/src/init.rs:357` | `sentinel_agent` | Called during active agent initialization before service-manager startup |
| `proxy/src/platform/common.rs:2350` | `sentinel_proxy_diag` | Called in proxy startup, after `ProxyPolicyEngineInit` has already been dropped |
| `core/src/services/diagnostics.rs:76` | wrapper-configured `producer` | Wrapper is exported but its default service definition is commented out |

Verified: the agent and proxy are separate processes, so their statics do not compete. The proxy ID differs from the documentation example `sentinel_proxy` and from the IPC-broker wrapper's stale expected-client argument `sentinel_proxy`; the pinned broker actually accepts dynamic registration and does not bind later message sources to the registered identity.

## End-to-end data and control flow

```mermaid
sequenceDiagram
    participant C as "Producer call site"
    participant M as "core diag macro"
    participant F as "core diagnostics facade"
    participant Q as "unbounded Tokio channel"
    participant B as "ipc-light broker"
    participant R as "diagnostics receiver"
    participant P as "local diagnostics pipeline"

    C->>M: "diag_info!/warn!/error!(category, code, message, context)"
    M->>M: "code_str + component inference + JSON context"
    M->>F: "emit(level, category, code, message, component, context)"
    F->>F: "UUID v4 + UTC timestamp + payload allocation"
    alt "IPC_SENDER initialized"
        F->>Q: "unbounded send"
        Q->>B: "DiagnosticsMessage::Event as broker JSON"
        B->>R: "route to diagnostics_service"
        R->>P: "handler(payload)"
    else "sender absent"
        F-->>C: "drop; warn only on first drop"
    end
```

Verified: the diagram's solid edges correspond to source. The final receiver/pipeline edge requires the separately built `sentinel-diagnostics` executable to be running; packaging includes it, but the checked active default service graph does not start it.

## Dependency-owned sender behavior

The following behavior is verified in `diagnostics/src/ipc/client.rs` and is material to the core facade:

1. `DiagnosticsSender::start` creates an unbounded MPSC channel and detaches `sender_loop` with `tokio::spawn`.
2. The loop waits 500 ms, then connects to `ipc_light_broker` using a duplex client.
3. It requires `Connected`, registers the caller-supplied process ID, requires `Ack`, and best-effort broadcasts `Started`.
4. It serializes each payload as `DiagnosticsMessage::Event` and sends a broker message from the claimed process ID to `diagnostics_service`.
5. It best-effort broadcasts a heartbeat every 30 seconds.
6. A broker `Shutdown` causes a best-effort `Stopped` event and an `Ok(())` return; `sender_loop` then exits permanently.
7. Connect/protocol/send/receive errors return to `sender_loop`, which drains and discards every currently queued payload, sleeps 5, 10, 20, 40, then 60 seconds, and continues at 60 seconds.

Contradiction: the sender-loop comment says the first connection failure logs one warning. The first failure merely sets `warned = true`; it emits no log. Only later failures emit `debug`.

Verified: retry delay and `warned` do not reset after a later successful connection. A broker shutdown is treated as normal termination rather than a reconnectable failure. The facade's `OnceLock` then prevents replacing the closed sender; later `emit` calls reach `DiagnosticsSender::send`, whose failed channel send produces a warning and drops the payload.

Potential issue: the channel is unbounded. When connected but writes are slow, producer memory can grow without a facade-imposed limit or backpressure. When a connection attempt fails, the explicit drain bounds that accumulated backlog by data loss rather than persistence. This is a static behavior concern; runtime impact requires measurement.

## Receiver and deployment boundary

Verified: the standalone `diagnostics/src/bin/diagnostics.rs` executable registers a `DiagnosticsReceiver`, forwards received payloads into the crate's local storage/send pipeline, and attempts to ensure a local OpenSearch Docker Compose deployment. The binary is built and copied by packaging scripts and appears in root manifests and uninstall process lists.

Contradiction: `deployment/deployment.py` says its service graph mirrors `get_default_services` and lists `sentinel-diagnostics.service` as process-backed. The actual `core/src/defaults/services.rs` Diagnostics service definition is commented out. The deployment script only prints/verifies that binary in the inspected section; no checked launcher registration for it was found in the searches completed for this slice.

Unresolved: an external supervisor, MDM policy, launch daemon, service definition, or installation step outside the checked tree may start `sentinel-diagnostics`. Packaging is not evidence that it is running. If it is absent, the broker returns routing errors after producer connection; the sender logs the broker error but does not persist or retry that already-sent diagnostic.

## Trust and security boundaries

Verified controls and absences:

- The facade accepts only typed severity/category/component values, but code and message become owned strings without content or length validation.
- Macro context is valid JSON by construction; the public `emit` accepts any `serde_json::Value`.
- Payloads are unsigned and unencrypted at this layer.
- The pinned broker registration and message source are unauthenticated and not cryptographically bound. A client can claim a source or target identifier.
- The receiver deserializes `DiagnosticsMessage` solely from `BrokerMessage.payload`; it logs `msg.source` but does not compare it with payload content or an authenticated connection identity.
- The facade and sender do not apply redaction, schema constraints, size limits, quotas, authorization, or tenant association.

Potential issue requiring validation: diagnostic context crosses a local IPC trust boundary and may contain URIs, hostnames, errors, or database URLs. Broker access controls and endpoint filesystem/socket permissions need deployment validation before confidentiality or spoof-resistance claims can be made.

## Error and recovery matrix

| Failure | Facade/sender behavior | Caller-visible result | Recovery/data outcome |
| --- | --- | --- | --- |
| `emit` before initialization | Builds payload; warns once; drops it | Unit; no error | No retry or persistence |
| `init_ipc` outside Tokio runtime | `tokio::spawn` can panic under Tokio's runtime contract | No `Result` boundary | No facade recovery |
| Repeated `init_ipc` | `OnceLock` returns first sender | Unit; conflicting ID is invisible | First identity remains |
| Background task already stopped | Unbounded send returns error; warning emitted | Unit | Payload dropped; no restart |
| Broker connect/handshake error | Return error; drain queued events; exponential sleep | Invisible to producer | Retries connection; buffered events lost |
| Payload serialization error | `connect_and_forward` returns error | Invisible to producer | Queue drained on loop boundary; reconnect |
| Broker send error | Warning, then return error | Invisible to producer | Current payload lost; queue drained; reconnect |
| Broker routing error | Warning containing broker payload | Invisible to producer | Already-dequeued event is not retried |
| Broker shutdown | Sender broadcasts stopped and exits normally | Invisible until later sends warn | No restart because facade is one-shot |
| Receiver absent | Broker may return routing error | Producer still observes unit | No sender-level durable retry |

Verified: `emit` does not panic on an absent sender for ordinary serializable inputs. The test demonstrates only this narrow property. Serialization normally occurs later in the sender; `serde_json::Value` itself is serializable, while an extremely large allocation or process termination lies outside normal recoverable Rust behavior.

## Concurrency and performance

- `OnceLock` makes initialization race-safe but first-writer-wins; it does not validate that the chosen background task remains alive.
- `AtomicBool::swap(..., Relaxed)` is sufficient for “warn at most once” selection because no other state is synchronized through it.
- `DiagnosticsSender` clones share one unbounded MPSC sender; event order is channel order, but concurrent producer ordering depends on scheduling.
- The detached sender task is neither joined nor cancelled by the facade.
- JSON context and payload allocation are synchronous producer-side costs; JSON message serialization is sender-task work.
- There is no batching on the facade path even though the shared protocol defines a `Batch` variant.
- The 30-second sender heartbeat is independent of diagnostic volume.

Potential issue requiring measurement: high-rate call sites can allocate UUIDs, timestamps, strings, and JSON objects before unbounded enqueue. No benchmarks or load tests for this facade were found.

## Tests and verification status

The only test in the three-file scope is `core/src/diagnostics/mod.rs::tests::test_emit_before_init_does_not_panic`. It calls `emit` directly with `TEST_001` and proves only that an uninitialized facade does not panic in that isolated process. It does not assert the warning or inspect state.

No checked test covers:

- code values, uniqueness, labels, `Display`, or `code_str`;
- macro expansion, context keys/values, or component inference;
- simultaneous or repeated initialization;
- an invalid/empty/conflicting process ID;
- sender readiness, reconnect, draining, broker shutdown, or receiver absence;
- the proxy's pre-initialization dropped event;
- sensitive-context redaction or payload-size bounds;
- the complete producer-to-storage path.

Verified: no checked CI workflow runs `cargo test` for this workspace. Rust/Cargo are absent from the analysis environment, so static findings could not be complemented by a local compile or test run.

## Documentation consistency audit

| Claim | Source | Actual evidence | Result |
| --- | --- | --- | --- |
| An uninitialized event is “silently dropped with a trace log” | `core/src/diagnostics/mod.rs:46` | First drop emits `tracing::warn!`; later drops are silent | Contradicted |
| `init_ipc` logs the resolved broker socket | `core/src/diagnostics/mod.rs:35` | Facade does not log a path; dependency sender logs only registration/retry state | Contradicted |
| Subsequent initialization calls are no-ops | `core/src/diagnostics/mod.rs:33` | `OnceLock::get_or_init` preserves the first sender | Confirmed, but conflicting IDs are silent |
| Every call requires a `DiagCode` | Module/macro docs | Macros require only a path with `.code_str()`; public `emit` accepts any `&str` | Partially confirmed |
| Service lifecycle codes represent implemented manager instrumentation | Code names/range | All 14 `Svc*` variants lack executable call sites | Planned/incomplete or unused registry entries |
| First sender connection failure logs a warning | `diagnostics/src/ipc/client.rs:49` | First branch only flips `warned`; it emits nothing | Contradicted |
| Sender reconnects with exponential backoff | `DiagnosticsSender::start` docs | Error loop sleeps 5/10/20/40/60 seconds and retries | Confirmed, with no reset after success |
| Deployment runtime graph mirrors core defaults | `deployment/deployment.py` | Diagnostics is listed there but commented out of actual core defaults | Contradicted |
| Packaged diagnostics binary means collection is active | Build/install documentation implication | Binary is packaged; active in-agent launcher is absent | Not verifiable at runtime |

## Dead, incomplete, and unresolved items

- Dead-code candidate: all 14 `Svc*` variants and seven proxy variants (`ProxyPersonaReady`, `ProxyPersonaFail`, `ProxyDlpSensitive`, `ProxyDlpBlocked`, `ProxyDlpError`, `ProxyAlertingReady`, and `ProxyAlertingFail`) have no executable call site. The exact variant total without a site is 21. Separately, `diag_debug!` and `diag_critical!` have no executable call site.
- Dead-code candidate qualification: public macros and enum variants may be consumed by external crates, so this classification is repository-local.
- Incomplete: no lifecycle API can flush, stop, restart, or observe the facade sender.
- Incomplete: code-range allocation is comment-governed; no compile-time/test uniqueness or range enforcement exists beyond Rust rejecting duplicate discriminants.
- Unresolved: which deployed component, if any, launches the packaged diagnostics receiver in production.
- Unresolved: broker filesystem permissions and production access controls.
- Receiver/store retention, export, and OpenSearch behavior is now closed in [the diagnostics receiver analysis](06-endpoint-diagnostics-receiver.md); this core chapter retains only the producer-facade boundary.

## Practical call graph

```text
diag_info!/diag_warn!/diag_error!
→ core_diagnostics_emit!
→ DiagCode::code_str
→ sentinel_diagnostics::Component::from_module_path
→ serde_json::json! (context arm only)
→ sentinel_core::diagnostics::emit
→ sentinel_diagnostics::DiagnosticPayload::new
→ DiagnosticsSender::send OR first-drop warning
→ unbounded MPSC
→ sender_loop
→ connect_and_forward
→ ipc_light::DuplexChannel<BrokerMessage, BrokerMessage>
→ broker target diagnostics_service
→ DiagnosticsReceiver::dispatch_message
→ standalone diagnostics handler
→ sentinel_diagnostics::emit/local pipeline
```

Every arrow through `DiagnosticsSender::send` is fire-and-forget from the producer's perspective. Neither a macro invocation nor successful queue insertion proves broker delivery, receiver execution, storage, or backend export.
