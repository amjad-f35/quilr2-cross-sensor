# 03 — Architecture

This chapter reconstructs the verified cross-repository architecture at the pinned revisions. Subsystem maps and symbol-level evidence are linked from the [module reference](06-module-and-file-reference.md). Dotted diagram edges are explicitly inferred, unresolved, or negatively traced as their labels state.

## Endpoint Lua scripting boundary

```mermaid
flowchart LR
    CFG["System Monitor v2 scan rules"] --> EX["scanner executor"]
    EX --> SB["core sandbox factory"]
    SB --> LUA["fresh Lua 5.4 VM"]
    LUA --> HOST["filesystem/platform/result/JSON/log/workspace host APIs"]
    HOST --> RC["mutex-protected ScriptResult"]
    RC --> CV["v2 typed-entity converter"]
    CV --> ST["EntityStore"]
    ENG["manifest ScriptEngine"] -. "no production caller found" .-> SB
    UP["HTTP ScriptUpdater"] -. "no production caller found" .-> SG["manifest-only signature verifier"]
    ENG -. "invalid-signature Boolean ignored" .-> SG
```

Verified: the active monitor directly uses sandbox/collector primitives and bypasses engine/signing. Dotted reachability labels reflect repository-wide caller searches. See [the scripting analysis](06-endpoint-core-scripting.md).

## Endpoint DLP popup boundary

```mermaid
flowchart LR
    DLP["Proxy DLP/policy action"] --> MODE{"SENTINEL_SERVICE_MODE present?"}
    MODE -->|no| LOCAL["in-process Tauri adapter"]
    MODE -->|yes| ACTOR["templating IPC actor"]
    ACTOR --> BROKER["ipc-light broker"] --> PROC["standalone templating-engine"]
    PROC --> LOCAL
    LOCAL --> CH["unbounded context channel"]
    CH --> FIFO["singleton popup + 30 waiting FIFO"]
    FIFO --> STATE["AppState mutexes/atomics"]
    STATE --> TERA["runtime Tera template"]
    TERA --> WEB["alert-window webview"]
    WEB --> CMD["seven registered Tauri commands"]
    CMD --> STATE
    CMD --> ONE["oneshot result/default fallback"]
```

Verified: both proxy paths call the same adapter, which always attaches a oneshot sender. Consequently proxy notifications described as nonblocking still occupy the core's blocking FIFO; only the originating request is detached. The templates execute across the Rust/webview trust boundary and return decisions through `log_dlp_decision`. See [the templating-engine analysis](06-endpoint-core-templating-engine.md).

## Sentinel-core compile-time boundary

```mermaid
flowchart LR
    CARGO["core/Cargo.toml"] --> BUILD["build.rs: tauri_build always"]
    BUILD --> LIB["sentinel_core rlib/cdylib"]
    CARGO --> DEF["default: file_index + file_search + local_discovery"]
    CARGO -->|"optional scripting"| LUA["Lua surface"]
    CARGO -->|"optional grpc_server"| PROTO["tonic generated DB API"]
    PROTO --> BAD["handwritten schema_id consumers"]
    SCHEMA["proto field: table"] --> PROTO
    LIB -. "commented mod declaration" .-> ARCH["decompression implementation"]
    ARCH -. "tests only; uncompiled" .-> FIX["129 MB archive fixtures"]
```

The `grpc_server` mismatch and absent decompression edge are verified source facts, not inferred runtime failures. `compress-tools` is optional, while the excluded archive source imports it unconditionally. Exact dependency versions are unresolved because lockfiles are ignored. See [the core crate-shell analysis](06-endpoint-core-crate-shell-tests-and-decompression.md).

## Endpoint system-monitor runtime topology

```mermaid
flowchart LR
    IDE["Cursor / Claude"] --> HC["thin hook client"]
    HC -->|"local framed JSON; unauthenticated"| HM["hook manager"]
    HM --> ACT["activity batcher"]
    ACT -->|"POST activity"| API["dashboard API"]
    KS["local IPC broker"] -->|"kill-switch state"| MON["sentinel-monitor-v2"]
    PER["Persona service through broker"] --> MON
    MON --> PROC["macOS / Windows processes"]
    MON --> FS["user config + workspace files"]
    MON --> SNAP["user snapshot JSON"]
    MON -->|"app ID / ingest / delta / map / alerts"| API
    MON -->|"render request"| TS["template service"]
```

The broker, filesystem, HTTP, hook socket/pipe, process-control, and template-service edges are verified. The hook endpoint intentionally has broad local access but no caller authentication. The kill-switch consumer validates message shape but not sender identity. Deployed OS/broker ACLs beyond the checked code remain unresolved.

Startup is `main → logging/config → kill-switch listener → fixed 6 s gate → Orchestrator → Persona loop → context/snapshot/map → ten joined workers`. Only process discovery and enforcement are power-gated. See [runtime topology](06-endpoint-system-monitor-runtime-discovery-and-state.md) and [sync/hook topology](06-endpoint-system-monitor-sync-enforcement-and-hooks.md).

## Endpoint template-service runtime topology

```mermaid
flowchart LR
    MON["system-monitor TemplateClient"] -->|"JSON render_request"| BROKER["pinned IPC broker"]
    OTHER["other local participant"] --> BROKER
    BROKER --> IPC["template-engine async IPC loop"]
    IPC -->|"std MPSC + source"| HANDLER["render handler"]
    HANDLER --> REG["hardcoded + local JSON registry"]
    HANDLER --> TERA["runtime Tera fragments"]
    HANDLER --> REGULAR["regular active slots + FIFO"]
    HANDLER --> NOTIFY["notification active slots + FIFO"]
    REGULAR --> WEB["one regular Tauri WebView"]
    NOTIFY --> NWEB["one notification Tauri WebView"]
    WEB --> COMMANDS["registered Tauri commands"]
    NWEB --> COMMANDS
    COMMANDS -->|"unbounded TargetedResponse"| IPC
    KILL["kill_switch_service through broker"] -->|"disable"| EXIT["standard shutdown channel → Tauri exit"]
```

Verified trust/state boundaries: broker identities are claimed rather than authenticated by this consumer; local template directories and registry files affect privileged WebView content; active/queued state is not persisted; queues omit sender identity. There is one native window per category, not one per configured concurrent slot. See [the complete template-service analysis](06-endpoint-template-service.md).

## Email-discovery privilege boundary

```mermaid
flowchart LR
    ROOT["privileged Persona process"] -->|"service mode fallback"| BIND["fixed Unix socket / Windows pipe"]
    ROOT --> SPAWN["run_in_user_space ProcessSpawner"]
    SPAWN --> CHILD["email-discovery"]
    CHILD --> NINE["nine core local sources"]
    NINE --> FRAME["u32 BE length + JSON vector"]
    FRAME -->|"single unauthenticated connection"| BIND
    BIND --> CAP["1 MiB cap + Serde"]
    CAP --> DEDUP["Persona deduplicate/sort"]
```

The fixed names are `/tmp/sentinel-email-discovery.sock` and `\\.\pipe\sentinel-email-discovery`. Unix applies no explicit socket mode or peer credential check; Windows grants a null DACL and performs no client SID check. This is the actual user-to-privileged trust boundary. See [the helper analysis](06-endpoint-email-discovery.md).

## Endpoint diagnostics topology

```mermaid
flowchart LR
    AG["agent core diagnostics facade"] --> BROKER["pinned IPC broker"]
    PX["proxy core diagnostics facade"] --> BROKER
    BROKER -. "receiver startup unresolved" .-> RX["sentinel-diagnostics receiver"]
    RX --> Q["unbounded local queue"]
    Q --> BUF["RingBuffer"]
    BUF --> LOG["diagnostics.log NDJSON"]
    LOG --> BULK["OpenSearch Bulk HTTP"]
    BULK --> SENT["diagnostics.sent UUIDs"]
    BULK --> OS["diagnostics index"]
    OS --> DASH["OpenSearch Dashboards"]
```

The producer edges are active. The dotted edge marks verified receiver implementation without a checked launcher: its core default registration is commented out. Receiver dispatch trusts the broker-routed JSON structure, local files use host-default permissions, and the committed local OpenSearch stack disables security. See [the complete diagnostics analysis](06-endpoint-diagnostics-receiver.md).

## Endpoint infra platform/process topology

```mermaid
flowchart LR
    CORE["core ProcessInstancedSpawner"] --> SEL["compile-time select_platform_services"]
    SEL -->|"macOS"| MAC["resolver + Command/launchctl + Unix socket client"]
    SEL -->|"Windows"| WIN["resolver + Command/CreateProcessAsUser + Job Object"]
    SEL -->|"Linux"| LIN["LinuxServices"]
    LIN --> PANIC["four todo! panics"]
    WIN --> PIPE["named-pipe channel stub"]
    PIPE --> NOOP["core non-fatal NoOpIpcChannel fallback"]
    MAC --> PROBE["standard IPC probe"]
    CORE --> CUSTOM["active services declare custom ipc-light IPC"]
    CUSTOM --> BROKER["pinned ipc-light broker"]
```

The active process services skip the standard infra IPC probe and use the pinned broker. macOS and Windows process services still depend on infra for address preparation, binary resolution, stale-child cleanup, process creation, and lifecycle handles. Linux reaches runtime panics at its first requested adapter. Windows user-session process creation omits the per-spawn environment map, while macOS user-session tracking binds a handle through newest-name `pgrep`, not an OS-returned child handle. Full verified flows are in [the infra chapter](06-endpoint-infra-platform-runtime.md).

## Endpoint proxy runtime topology

```mermaid
flowchart LR
    APP["client application"] -->|"explicit HTTP or OS redirect"| RP["Rust sentinel-proxy"]
    RP --> HTTP["HTTP handler"]
    RP --> MITM["CONNECT / transparent TLS MITM"]
    HTTP --> CAP["body capture + request context"]
    MITM --> CAP
    CAP --> DLP["extractors + DLP + core policy engine"]
    DLP -->|"allow/monitor"| FWD["reqwest forwarding"]
    DLP -->|"ask"| UI["templating broker or native/Tauri UI"]
    DLP -->|"alert"| ALERT["core alert sender"]
    FWD --> NET["destination network"]
    UI --> DLP
    WIN["WinDivert workers"] --> RP
    SWIFT["NETransparentProxyProvider"] -->|"localhost metadata + TCP relay"| RELAY["Rust macOS relay"]
    RELAY --> RP
    IPC["pinned ipc-light broker"] -->|"Persona / kill-switch / templating"| RP
```

All solid edges are verified call, socket, or broker relationships. Windows rewrites intercepted TCP to the proxy and maintains client-to-server masquerade state. The active macOS path does not pass file descriptors: Swift opens a new localhost TCP connection to a Rust relay, prefixes JSON metadata, then bridges Network Extension flow bytes. The retained SCM_RIGHTS control messages and Rust/Swift UDP forwarders are legacy or unreachable from the current active branch.

### macOS startup and trust-boundary sequence

```mermaid
sequenceDiagram
    participant R as Rust redirector
    participant M as NE manager
    participant S as Swift provider
    participant U as Unix control listener
    participant L as localhost relay
    R->>M: start tunnel
    M->>S: startProxy
    S->>U: one initial connect attempt
    Note over S,U: U is bound only afterward; failure continues startup
    R->>U: bind/chmod control socket
    R->>L: bind random localhost relay/heartbeat ports
    U-->>S: relay address, only if control channel connected
    S->>L: JSON metadata + relayed TCP bytes
```

The ordering above is a verified startup race. Relay and heartbeat listeners accept localhost peers without authentication or peer-credential validation. See [packet-redirection architecture](06-endpoint-proxy-packet-redirection.md).

## Endpoint build-to-install topology

```mermaid
flowchart LR
    SRC["tracked Rust/scripts/assets"] --> WF["GitHub Actions or local builder"]
    WF --> BUILD["Cargo builds + platform assembly"]
    BUILD --> SIGN["platform signing/notarization helpers"]
    SIGN --> PKG["ZIP/installer/update metadata"]
    PKG --> ART["Actions uploaded artifact"]
    ART -. "Unresolved external publication/rollout" .-> DIST["CDN / MDM / operator"]
    DIST --> INST["privileged Windows/macOS installer"]
    INST --> BIN["application and support binaries"]
    INST --> OS["services / launchd / trust stores / network components"]
    META["signed update metadata"] -. "external hosting unresolved" .-> UPD["endpoint updater"]
    UPD --> BIN
```

Solid edges are verified in workflows/builders/installers. Dotted edges identify missing external deployment evidence, not verified repository processes. The updater uses a lock and staged extraction but does not atomically replace the complete installed set. Multiple legacy/manual/Python paths coexist beside the current workflow and do not form one consistent release pipeline. See [the complete delivery analysis](06-endpoint-build-release-install-and-update.md).

## Endpoint support-tool boundary

```mermaid
flowchart LR
    DEV["developer/operator"] --> CDN["tools/local_cdn.py"]
    DEV --> MOCK["tools/mock_user_details_server.py"]
    TEST["tests/manual clients"] --> PY["Python programmable test server"]
    TEST --> RS["Rust programmable test server"]
    CDN --> MEM["in-memory switch/status + served files"]
    MOCK --> UJSON["in-memory user/device JSON"]
    PY --> PMEM["in-memory response rules"]
    RS --> RMEM["in-memory response rules"]
    PRODUCT["endpoint product runtime"] -. "no caller found" .-> CDN
    PRODUCT -. "no caller found" .-> MOCK
    PRODUCT -. "no caller found" .-> PY
    PRODUCT -. "no caller found" .-> RS
```

The dotted edges deliberately state negative repository reachability after searches; external/manual use remains possible. These servers are support/test entry points, not established production components. See [the root/tools/tests analysis](06-endpoint-root-tools-tests-and-documentation.md).
