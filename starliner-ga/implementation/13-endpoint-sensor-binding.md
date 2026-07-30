# Endpoint Sensor: Current-Code Binding

Status: **normative target binding; current behavior verified at the audited endpoint revisions**

## Boundary

The endpoint agent is a compound sensor, not one executable:

- privileged agent/bootstrap and service manager;
- System Monitor v2;
- HTTP/TLS/DLP proxy;
- hook clients and hook manager;
- template/UI services;
- Persona, policy, alerting, diagnostics, updater, and platform helpers;
- local IPC broker.

The product has one endpoint profile and multiple authenticated producer components. Component evidence is not flattened before lineage and capability checks.

## Runtime placement decision

The endpoint uses one device-local Starliner Edge Runtime process supervised by the endpoint service manager.

```text
system monitor adapter ─┐
proxy adapter ──────────┤
hook adapter ───────────┤ authenticated local IPC
agent/service adapter ──┼→ Starliner Edge Runtime
native/browser helper ──┘   ├─ privacy gate
                             ├─ durable WAL
                             ├─ delivery
                             ├─ bundle/command verification
                             ├─ health/certification
                             └─ component identity registry
```

Reasons:

- the compound agent needs one durable sequence/WAL owner;
- several current producers use memory or best-effort HTTP and can lose data;
- multiple processes must not each invent device/user/tenant identity;
- policy, command, update, and trust material require one hardened lifecycle;
- a single runtime can bound disk/network/backpressure and report component-specific degradation.

Latency-sensitive PEP evaluation remains embedded in the proxy, monitor, and hook process. The runtime distributes an atomically versioned, already verified local policy snapshot. A proxy request does not synchronously call the central platform or block on the local WAL.

The runtime IPC is not the current unauthenticated hook socket. It uses a dedicated Unix-domain socket or Windows named pipe with:

- OS peer identity and restrictive ACL;
- enrolled component/artifact identity;
- length and message-count limits;
- typed protocol and capability allowlist;
- per-component sequence and backpressure;
- no raw content by default.

## Current discovery flow and required replacement

`Verified current:`

```text
ProcessEnumerator::enumerate
→ process_monitor::run
→ Correlator::correlate
→ EntityStore::upsert
→ resolve_app_ids
→ backend assigns app ID
→ sync_entities
→ POST /ea/v1/sync/discovered-apps
→ backend mappings/governance
→ EntityStore::mark_synced/apply_governance
```

`Target:`

```text
ProcessEnumerator / scanner / package scanner
→ EntityStore source-native object
→ endpoint adapter safe-fact record
→ local Starliner WAL
→ central ingest/evidence
→ normalization
→ continuous identity resolution
→ canonical binding
```

`sync::app_id::resolve_app_ids` is a migration-only compatibility path. The endpoint must not request or mint a canonical application ID before emitting source evidence.

An optional platform binding token can later return through management/control state. It is a revisioned reference to a central resolution, not an endpoint-owned identity. Stale or missing binding never prevents source evidence delivery.

## Exact capture seams

### Agent lifecycle and health

| Current path/symbol | Verified current meaning | Target binding |
|---|---|---|
| agent `main` and shared shutdown | process lifecycle | runtime/component start, stop, crash, version and gap |
| `ServiceManager`, `LifecycleManager`, process wrappers | default service graph and state transitions | component inventory, declared capability, health and effect |
| Persona manager/context | tenant, subscriber, user, device and token context | approved source identity claims; token never exported |
| bootstrap manifest/signature validation | install/start integrity | artifact/provenance evidence and certification input |
| updater status and staging | update check/download state | update command outcome; no “verified install” until independent effect |

### System Monitor v2

| Current symbol | Verified current meaning | Target binding |
|---|---|---|
| `Orchestrator::run` | starts discovery, scan, sync, enforcement, hook and snapshot tasks | registers component capabilities and degradation independently |
| `ProcessEnumerator`, `process_monitor::run` | OS process discovery and diff | process-instance observations with boot epoch |
| `Correlator::correlate` and process map | maps process facts to application candidates | source alias claims only; no canonical merge |
| `scanner::run` / `execute_script` / `convert_results` | Lua-based artifact/entity discovery | source observations retaining scanner/script version and discarded-field policy |
| `pkg_scanner::{npm,cargo,go}` | package/application discovery | package/artifact observations and snapshot scope |
| `EntityStore::upsert`, governance and events | in-memory current source state | primary adapter hook; emit changes without blocking store mutation |
| snapshot save/load | best-effort local recovery of monitor state | not evidence durability; Starliner WAL is separate |
| `ActivityEvaluator::evaluate` / `build_entry` | IDE hook telemetry, currently always Allow | privacy-safe activity and, only after certification, local PEP decision |
| `ActivityBatcher` | best-effort HTTP batch with drops | replaced by the Starliner runtime WAL |

### Proxy

| Current symbol/path | Verified current meaning | Target binding |
|---|---|---|
| `handle_request` and `RequestContext` | HTTP/TLS request lifecycle and attributed context | action start with source request/process/destination refs |
| `capture_body_with_streaming` | currently buffers/captures content | ordinary evidence receives structural metadata only |
| DLP `evaluate_body` / `handle_dlp_for_ctx` | extraction, analysis and sensitive finding | approved data-class signal, no content |
| core `PolicyEngine` invocation | current local policy result | local PEP adapter consuming signed bundle |
| block/403, forward, redaction/transform, justification | native action | typed decision result and attempted effect |
| alert construction/send | current local/backend alert path | source signal/action evidence; never admitted finding authority |
| `/health` and `/metrics` | proxy-local operational surface | component health input; access remains separately secured |

### Hooks

| Current symbol | Verified current meaning | Target binding |
|---|---|---|
| `HookManagerService` | installs clients and runs IPC/activity services | hook coverage, installed version and integrity state |
| `HookInstaller::install_merged` | replaces the complete `hooks` value | configuration command effect with explicit destructive scope |
| `HookIpcServer` | local framed JSON server | not suitable as Starliner runtime IPC without security and size fixes |
| `SessionQueue` | per-session serialization | may remain native hook state |
| `ActivityEvaluator` | records prompt/tool/file metadata and returns Allow | evidence seam; enforcement is unavailable today |
| Cursor/Claude thin-client response mapping | IDE allow/deny/ask effect | certified effect observation after local PEP is implemented |

## Endpoint-to-platform records

The endpoint profile emits:

- device/agent/component lifecycle and coverage;
- process instance and process-tree observations;
- executable/package/artifact observations;
- installed application/runtime/model/MCP candidates;
- normalized network-destination observations;
- privacy-safe hook/tool/activity metadata;
- proxy request/execution metadata and data-class signals;
- local policy decisions, native action outcomes, and effect observations;
- reconciliation snapshot pages and completion;
- health, gap, loss, permission, sleep/wake, and degraded-capability events.

Paths, command lines, prompts, responses, tool input, file content, environment variables, memory, credentials, and tokens are prohibited or restricted according to profile policy.

## Platform-to-endpoint flow

### Policy

```text
central policy version
→ signed bundle publication
→ device runtime discovers/downloads/verifies
→ compatibility and tenant/device targeting
→ staged local snapshot
→ atomic activation
→ embedded PEP evaluates
→ decision and native effect evidence
```

The current unsigned/direct governance delta is retained only during controlled migration. It is not the GA trust path.

### Typed commands

Examples of command families that may be certified:

- rescan a declared scope;
- refresh a signed policy/configuration bundle;
- block/quarantine/release a source-bound application/artifact;
- disable or restore a certified component;
- collect a bounded diagnostics bundle under approved privacy scope;
- stage/activate/rollback a signed update artifact.

Commands bind the central target to a current endpoint source binding and binding revision. The adapter rejects stale, ambiguous, expired, unsupported, unauthorized, or mismatched targets.

Arbitrary shell, PowerShell, Lua, SQL, filesystem path, or executable payload commands are prohibited.

### Effect verification

For process blocking:

```text
command or policy decision
→ adapter resolves current source binding
→ Enforcer evaluates preconditions
→ graceful/forced native action
→ action outcome
→ process rescan
→ effect observed / not observed / conflicting
→ central verification
```

The current HTTP audit call is not effect verification. A successful `taskkill`/signal invocation is an action outcome; the post-action process state is the effect.

## Existing paths to retire or constrain

| Current path | Quilr 2 disposition |
|---|---|
| `resolve_app_ids` | remove from normal evidence path; central identity owns resolution |
| `/ea/v1/sync/discovered-apps` | migration adapter only; replace with typed Starliner evidence |
| `/ea/v1/sync/delta` | migration-only governance channel; replace with signed bundles/commands |
| `/ea/v1/sync/activity` | replace with durable edge WAL |
| `/ea/v1/sync/alerts` | replace with action/signal/effect records; central finding admission |
| process-map fetch | retain only as a signed catalog/config input with version/provenance, not identity authority |
| local JSON snapshot | retain for native monitor recovery; never use as evidence receipt |
| current IPC participant identity | do not rely on it until OS peer authentication/ACL certification passes |

## Current security and GA blockers

1. The source-verified development private key/certificate/PKCS#12 and CA-packaging path require immediate incident disposition, rotation/revocation evidence, and clean artifact proof.
2. Hook IPC permits broad local access, authenticates no caller, and can allocate from an unbounded caller length.
3. Current broker identity is application-claimed; deployed OS ACL/peer identity is unresolved.
4. System Monitor kill-switch startup is time-based and fail-open.
5. hook policy enforcement is not implemented; it is telemetry-only.
6. proxy analysis/policy failures commonly allow traffic.
7. updater source does not verify declared checksum/size and has no visible signature check before staging.
8. Linux support is materially incomplete.
9. several delivery paths drop on failure and lack durable local retry.
10. current build/sign/package paths disagree, and checked CI does not establish tests, publication, rollout, or rollback.

No endpoint command or enforcement capability can be certified while its relevant blocker remains.

## Migration increments

1. Introduce the supervised runtime and authenticated component IPC in observe-only mode.
2. Map `EntityStore`, proxy, hooks, lifecycle, and health to safe source records.
3. Add WAL durability, sequence/replay, manifests, and per-component certification.
4. dual-emit while current dashboard HTTP remains the mutation authority.
5. move canonical-ID resolution entirely central and compare mappings.
6. replace activity/alert best-effort HTTP with Starliner delivery.
7. distribute signed policy in shadow mode and compare current native policy results.
8. introduce typed command adapters one family at a time.
9. require independent effect observation before product claims.
10. retire endpoint dashboard/API inventory authority only after semantic parity, customer cutover, and rollback closure.
