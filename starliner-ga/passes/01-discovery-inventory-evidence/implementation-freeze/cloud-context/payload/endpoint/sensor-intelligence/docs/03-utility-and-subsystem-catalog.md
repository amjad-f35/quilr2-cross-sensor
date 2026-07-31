# 03 — Utility and Internal Subsystem Catalog

## Purpose

This chapter separates reusable mechanisms from user- or system-visible
features. A utility can support several features and can exist without being
reachable from the default runtime. The companion table is
[utilities.csv](../../../matrices/sensor-intelligence/endpoint-sensor/utilities.csv).

## Utility matrix

| ID | Utility | Category | Location / primary symbols | Callers | Inputs → outputs | Side effects and silent behavior | Feature users | Adapter reuse | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U-001 | macOS process enumerator | Capture | `system-monitor/v2/src/platform/macos.rs::MacOsEnumerator` | `process_monitor::run` | OS process data → `ProcessInfo` set | OS reads; enumeration errors returned | F-015, F-016 | No direct reuse; adapter should consume facts after capture | `Active`, macOS |
| U-002 | Windows process enumerator | Capture | `system-monitor/v2/src/platform/windows.rs::WindowsEnumerator` | `process_monitor::run` | Windows process data → `ProcessInfo` set | OS reads; enumeration errors returned | F-015, F-016 | Same as U-001 | `Active`, Windows |
| U-003 | Process diff table | Capture/state | `discovery/process_table.rs::ProcessTable::diff` | process monitor | current enumeration + prior PID/name state → started/exited | Same-PID/same-name reuse can be missed | F-015 | Candidate source-side observation seam | `Active` |
| U-004 | Recursive marker walker | Capture | `discovery/scanner/walker.rs` | `scanner::scan_cycle` | scan rules/home paths → matched markers/workspaces | Reads bounded configured paths; not full filesystem coverage | F-020 | Reuse only if raw match provenance is preserved | `Active` |
| U-005 | Sandboxed Lua execution | Capture/parsing | `discovery/scanner/executor.rs::execute_script`; core scripting sandbox | scanner | script + `scan_context` + host APIs → collector result | 10-second instruction hook; blocking host calls can outlive cancellation | F-020 | Adapter should not execute scripts; consume normalized source observations | `Active` |
| U-006 | Package scanners | Capture/parsing | `discovery/pkg_scanner/{npm,cargo,go}.rs` | package loop | bin roots/tool metadata → entity candidates | Go child has no timeout; errors handled per loop | F-021–F-023 | No; preserve package source/evidence instead | `Active` |
| U-007 | Hook IPC server | Capture/transport | `hook_manager/ipc.rs::HookIpcServer::run` | hook manager | local framed request → queued evaluation response | Local socket/pipe creation; ACL unresolved | F-032–F-036 | Possible source record seam after authentication/health work | `Active when hooks enabled` |
| U-008 | Hook integrity watcher | Capture/operational | `hook_manager/integrity.rs::IntegrityMonitor` | hook manager | expected hooks/file events → validation/repair | Watches and rewrites local IDE config | F-029–F-031 | No adapter reuse | `Active when hooks enabled` |
| U-009 | Hyper accept/request wrapper | Capture | `proxy/src/platform/common.rs::{run_http_server,run_https_server,create_request_service}` | proxy runtime | TCP/TLS/HTTP → request with peer/connection/request-ID extensions | Connection limits/rejections/logging | F-037–F-041 | Adapter should tap post-capture records, not the hot handler | `Active` |
| U-010 | WinDivert redirector | Capture | `proxy/src/packet_redirector/windows/**::WinPacketRedirector` | `run_packet_redirector` | Windows packets/socket events → redirected packets + attribution | Packet rewrite/injection and UDP state | F-042, F-043 | No direct reuse | `Conditional`, Windows |
| U-011 | Network Extension relay | Capture | `proxy/src/packet_redirector/macos/**`; Swift `TransparentProxyProvider` | macOS redirector/extension | NE flows/control messages → relay connections/metadata | Starts/stops tunnel; rejects selected UDP | F-039, F-042, F-044 | Adapter may consume normalized flow facts after Rust boundary | `Conditional`, macOS |
| U-012 | WebSocket relay | Capture | `proxy/src/websocket*.rs::handle_websocket` | request upgrade path | client/upstream frames → forwarded frames | Detached bidirectional work; large-frame analysis blind spot | F-041 | Only reuse emitted facts | `Active` |
| U-013 | Context manager | Identification/state | `system-monitor/v2/src/entity/context.rs::ContextManager` | scanner, sync, hook evaluator, enforcement | Persona/device defaults → tenant/user/device context | Process-local mutable user context; default subscriber fallback | F-020, F-024–F-028, F-034–F-035 | Useful source context, but adapter must not turn fallback into authority | `Active` |
| U-014 | Application correlator | Identification | `discovery/correlator.rs::Correlator::correlate` | process monitor | process path/name/parent + maps → Application candidate | Maps multiple process observations into a durable app entity | F-016 | Reusable source attribution, with raw provenance retained | `Active` |
| U-015 | Process-map registry | Identification/config | `default_process_map`, `update_process_map` | correlator/refresh | embedded or backend map → lookup state | Successful backend response replaces defaults, including empty map | F-016, F-017 | Adapter should carry mapping version/source if instrumented | `Active` |
| U-016 | Entity ID functions | Identification | `entity/id.rs::{entity_id,user_scoped_entity_id,mcp_server_id}` | converters/scanners | names/type/selected parent data → UUID | Same-name user-scoped kinds can collide; MCP ID omits parent/transport | F-016, F-020–F-023 | Must be repaired/versioned before stable adapter identity | `Active with identity defects` |
| U-017 | Proxy process attribution map | Identification/state | `proxy/src/state.rs::PROCESS_ATTR_MAP` and lookup/cleanup helpers | redirectors/request service | socket peer/PID/app details → `ProcessAttribution` | TTL/max-size cache; capture at connection accept | F-042, F-045–F-051 | Candidate source fact; include attribution method/confidence | `Active when interception supplies data` |
| U-018 | Destination resolver | Identification | proxy transparent destination modules | HTTPS server | NAT/extension/SNI/local tuple → `DestinationSource` | Can tunnel, DNS-fallback, or drop; mismatch fails open to kernel source | F-039, F-040, F-045 | Reusable only as observation plus method/mismatch evidence | `Active in transparent mode` |
| U-019 | Local identity-source aggregation | Identification | core Persona discovery + email helper | Persona | local accounts/mail/browser/Teams candidates → ranked/merged emails | Per-source errors suppressed; authority not established | F-009, F-010 | Emit candidates/provenance, never canonical identity | `Conditional` |
| U-020 | Monitor config loader | Parsing/config | `system-monitor/v2/src/config.rs::Config::load` | monitor `main` | defaults/files/environment → typed config | Missing/invalid top-level config can abort startup | F-015–F-035 | Adapter may read resolved values for coverage manifest | `Active` |
| U-021 | Proxy CLI/config transformer | Parsing/config | `proxy/src/args.rs::Args`; `config.rs::ProxyConfig::from_args` | proxy `main` | hard-coded wrapper args + CLI/files/env → runtime config | Pattern files and feature flags change capture/enforcement scope | F-037–F-053 | Adapter needs resolved coverage subset, not secret/material paths | `Active` |
| U-022 | Hook event parsers/translators | Parsing | hook-client common plus two client mains | IDE thin clients | source-specific JSON → common request and client-specific response | Parse/IPC errors frequently become Allow | F-032, F-033 | Good source normalization seam after explicit failure records | `Active` |
| U-023 | Lua result converter | Parsing/normalization | `discovery/scanner/converter.rs::convert_results` | scanner | collector entities/relations/events/errors/risk → selected typed entities | **Silently discards** raw relationships, events, errors, risk and rich fields | F-020 | Must be instrumented before conversion or extended; do not reuse unchanged | `Active and lossy` |
| U-024 | Entity ingest converter | Parsing/normalization | `sync/ingest.rs::to_discovered_entity` | sync loop | native Entity + context → dashboard wire entity | Renames/flattens fields and omits source-native detail | F-025 | Existing extraction point is too late for full-fidelity adapter | `Active and lossy` |
| U-025 | HTTP body capture | Parsing/capture | proxy body module `capture_body_with_streaming` | request handler | Hyper body + thresholds → bytes/file-backed captured body | Whole body read before forward; temp-file and size behavior | F-046 | Do not put durable export in hot path | `Active when capture selected` |
| U-026 | DLP transform pipeline | Parsing/normalization | proxy config transform/selector operations | DLP extraction | URL/base64/JSON/text/document/image transforms → values | Transform errors can omit fields or degrade classification; feature-gated formats | F-046, F-047 | Adapter can consume derived classification evidence, not raw secret content by default | `Conditional` |
| U-027 | Gzip ingest serializer | Parsing/transport | `sync/ingest.rs` | monitor sync | wire batch → JSON/gzip HTTP body | Batch-size configuration can panic at zero | F-025 | Replace with adapter serializer/outbox for platform integration | `Active` |
| U-028 | DLP pattern manager | Classification/config | `DlpConfigManager`, pattern models | refresh and request path | backend/file patterns → hot-reloaded match configuration | Starts empty for dynamic load; readiness not coupled to listeners | F-046, F-047, F-052 | Emit config digest/version and health, not pattern secrets | `Active` |
| U-029 | DLP engine/analyzers | Classification | `proxy/src/dlp/engine.rs::DlpEngine` | request/WebSocket handlers | extracted content + model/endpoint/heuristics → detections | Startup auth failure degrades to heuristic; errors can fail open | F-047, F-049, F-051 | Adapter can map finding candidates with analyzer/evidence metadata | `Conditional` |
| U-030 | Policy engine | Classification/policy | `sentinel_core::policy_engine` | proxy startup/request path | backend control list + context → policy decision | Background initialization; absence/error paths can allow | F-048, F-049 | Control provenance useful; central platform should own canonical policy | `Active` |
| U-031 | Health state classifier | Classification/operational | `ProxyHealthMonitor` | proxy probes/request outcomes | failure windows/thresholds → Healthy/Degraded/Unhealthy/Critical | May request restart; several fields/integrations incomplete | F-053 | Strong candidate for structured sensor health records after schema work | `Active unless disabled` |
| U-032 | Process enforcer | Policy/enforcement | `system-monitor/v2/src/enforcement/mod.rs::Enforcer` | store changes and sweep | Application governance + running processes → action workflow | Terminates/acts on OS processes; partial errors logged | F-027, F-028 | Adapter should export attempts/results; must not own central policy | `Active when enforcement enabled` |
| U-033 | Platform action adapters | Policy/enforcement | `enforcement/actions/{macos,windows}.rs` | Enforcer | PID/action → native result | Host mutation; Linux adapter absent | F-027 | No adapter execution reuse; wrap with control-result instrumentation | `Active`, macOS/Windows |
| U-034 | Enforcement notifier/auditor | Policy/evidence | `Notifier`; `Auditor::report` | Enforcer | action/context/result → popup + backend payload | Notification and audit have separate failure paths | F-028 | Evidence mapping candidate, but add durable admission | `Active` |
| U-035 | Templating UI adapters | Policy/enforcement/UI | core Tauri context, proxy native UI, templating IPC client | DLP and process enforcement | prompt/options/content → user response or default | Timeouts/close/queue errors select defaults; local templates can fail | F-028, F-049, F-054, F-055 | Adapter must receive decision event after UI, not render UI | `Active/conditional` |
| U-036 | Kill-switch controller/clients | Policy/control | core controller and per-process IPC clients | Persona/agent/components | backend enabled state + broker messages → atomic state/shutdown | Fixed startup sleeps; semantics differ by process | F-008 | Replace/augment with typed signed control while retaining emergency local gate | `Active but inconsistent` |
| U-037 | Pinned broker client/server API | Transport | endpoint-pinned `ipc-event-bus` | bridges, proxy, monitor, template, hooks indirectly | local frames → request/reply/event delivery | Reconnect/drop behaviors differ per wrapper; no common durability | F-008–F-014, F-029–F-036, F-049 | Adapter IPC boundary requires authentication and bounded backpressure | `Active` |
| U-038 | Persona IPC client/cache | Transport/state | `core/src/ipc_clients/persona.rs` | proxy/monitor/policy/DLP | broker response/broadcast → cached Persona/token | Refresh task can stop on broker shutdown; stale/None semantics vary | F-009, F-017, F-024–F-052 | Source context only; redact token and report freshness | `Active` |
| U-039 | Monitor HTTP sync clients | Transport | `system-monitor/v2/src/sync/**` | orchestrator loops | entities/cursor/context ↔ HTTP endpoints | Warn/retry loops; no shared durable admission/ack | F-017, F-024–F-028, F-035 | Existing HTTP should be replaced or isolated behind adapter/outbox | `Active` |
| U-040 | Activity batcher | Transport/state | `sync/activity.rs::ActivityBatcher` | hook evaluator | activity queue → HTTP batches | Bounded queue and best-effort send; overload/failure can drop | F-034, F-035 | Useful record builder; delivery should move to durable outbox | `Active` |
| U-041 | Alert sender/receiver | Transport/state | core alert IPC modules | proxy and agent bridge | serialized alerts → broker → local queue | Oversize degradation, memory queues and shutdown ownership gaps | F-012, F-051 | Map admitted alert facts after persistence; avoid duplicate dispatch ownership | `Active` |
| U-042 | Diagnostics sender/receiver | Transport/operational | core facade + diagnostics crate | agent/proxy and optional receiver | diagnostic payloads → broker/local/OpenSearch | Drops on failure; receiver absent by default | F-013, F-014 | Reuse payload construction selectively; delivery belongs in outbox | `Partial active topology` |
| U-043 | Core HTTP client framework | Transport | `core/src/http/**` | selected endpoint services/library callers | profiles/requests → parsed response | Independent retry/parser/logging framework; not all active HTTP uses it | multiple support paths | Avoid multiplying clients; adapter should use Starliner transport | `Implemented; mixed reachability` |
| U-044 | Entity store | State/persistence | `store/entity_store.rs::EntityStore` | all monitor workers | Entity upsert/governance/sync marks → map/events | In-memory only; change broadcast can lag | F-018–F-035 | High-value current-state read seam; not durable history | `Active` |
| U-045 | Snapshot store | State/persistence | `store/snapshot.rs` | orchestrator | entity vector/cursor ↔ JSON file | Whole-file best effort; no schema migration or atomic event history | F-019 | Not a Starliner outbox; may seed current-state adapter snapshot | `Active` |
| U-046 | Sync cursor and pending governance | State/persistence | `sync/delta.rs`; EntityStore fields | delta loop | cursor/delta/governance → local state | Cursor persisted only through snapshot | F-019, F-026 | Do not reuse as delivery cursor; separate source and outbox cursors | `Active` |
| U-047 | Hook session queue | State | `hook_manager/queue.rs::SessionQueue` | hook IPC server | session-scoped events → serialized evaluator tasks | Process-memory only; idle sweep; queue behavior can affect latency | F-034, F-036 | Candidate for source event assembly, not durable delivery | `Active` |
| U-048 | Proxy caches/global singletons | State | `proxy/src/state.rs` | startup and hot paths | config/DNS/ALPN/attribution/circuit state → cached lookup | Process-global `OnceCell`/DashMap state; first initialization wins | F-039–F-053 | Adapter must not couple to unsafe/global hot-path internals | `Active` |
| U-049 | Alert SQLite storage | State/persistence | core alert storage/schema | alert bridge/system | alert batches → `alerts`, quarantine, DLQ tables | Local durable-ish queue with dispatcher lifecycle; not generic telemetry | F-012 | May be reused only for alert migration; do not generalize silently | `Active` |
| U-050 | Template render queues/state | State/UI | core and template-service popup queues | UI render handlers | commands/user actions/timeouts → queue/window state | Dedup/overflow/default behavior can lose later lifecycle/source data | F-049, F-054, F-055 | No adapter reuse beyond emitted decisions | `Active` |
| U-051 | Service manager/lifecycle | Operational | `core/src/service/**` | agent | service definitions/status/process handles → lifecycle transitions | Global context and placeholder generic APIs; spawns/kills children | F-004–F-008 | Capability registration could be emitted from here after readiness semantics are fixed | `Active` |
| U-052 | Process supervisor | Operational | `service/process_supervisor.rs`; `supervisor.rs` | agent | child liveness/config/session notifications → retry | Polling, state mutation, respawn | F-006 | Emit structured lifecycle/health records; no transport reuse | `Active` |
| U-053 | Logging stacks | Operational | per-crate logging modules and proxy initialization | all processes | tracing events/environment/path selection → console/rotating files | Multiple formats/retentions; proxy prunes ten daily files | F-001–F-057 | Adapter should emit structured health, not scrape logs as primary source | `Active` |
| U-054 | Diagnostic code registry/macros | Operational | `core/src/diagnostic_codes.rs`; diagnostics facade | agent/proxy | component/code/message/fields → payload | Component inference and best-effort broker send | F-013, F-014, F-053 | Reusable code taxonomy if versioned; transport must change | `Active` |
| U-055 | Build/install/update utilities | Operational | root build/distribution scripts | operator/CI | source/signing/config/host state → artifacts/install | Privileged host mutation; partial rollback/verification gaps | F-056, F-057 | Platform integration should report artifact/version/health, not reuse deployment scripts as telemetry | `Implemented` |
| U-056 | DB gRPC transport | Transport | core `ipc/{grpc,server,client}` | no active caller | protobuf DB operations → Tonic calls | Default-off; `table`/`schema_id` mismatch | F-058 | Do not reuse in MVS | `Dormant and incompatible` |
| U-057 | File index/search framework | Capture/state | core file index/search modules | no default caller | filesystem metadata → SQLite/search | Would crawl/persist local file metadata if started | F-059 | Privacy-heavy; not part of current source profile | `Dormant` |
| U-058 | Script verifier/updater/event dispatcher | Capture/operational | core scripting engine/updater/dispatcher | no active v2 caller | manifests/signatures/events/bundles → scripts/files/tasks | Verifier false can be ignored; updater non-atomic; event results discarded | F-060 | Do not reuse until call semantics and integrity are repaired | `Dormant/partial` |

## Utilities that transform or discard data

| Utility | Verified transformation | Consequence |
| --- | --- | --- |
| U-003 `ProcessTable::diff` | Reduces full enumerations to PID/name-based starts/exits | PID reuse and richer per-poll process changes are not represented |
| U-014 `Correlator` | Collapses process observations into Application identity | Source process provenance and application lifecycle can diverge |
| U-016 entity ID helpers | Hash/UUID construction from selected attributes | Collisions are possible where kind/parent/transport are omitted |
| U-019 identity aggregation | Merges local email candidates | Candidate provenance is not authoritative identity |
| U-023 Lua converter | Retains selected typed entities only | Raw relationships/events/errors/risk and several rich fields disappear before the store |
| U-024 ingest converter | Flattens native entities to current dashboard wire records | An adapter at current HTTP ingest cannot reconstruct all source detail |
| U-025 body capture | Converts streaming bodies into complete captured bytes/files | Latency/memory/disk behavior differs from true streaming |
| U-026 transform pipeline | Decodes/selects/extracts fields | The resulting text is derived evidence and needs lineage |
| U-027 gzip serializer | Batches and compresses current wire entities | Batching is not a durable acknowledgement boundary |
| U-040 activity batcher | Aggregates per prompt turn and batches HTTP | Individual hook events and dropped batches may be unrecoverable |

## Duplication and ownership findings

- `Verified in source`: two different template UI services are active by
  default. Their render queues, state models and failure behavior overlap.
- `Verified in source`: endpoint components use multiple HTTP clients, retry
  loops, caches and logging stacks instead of one transport/health abstraction.
- `Verified in source`: snapshot state, activity queues, alert SQLite,
  diagnostic buffers, traffic logs and broker queues are separate persistence
  mechanisms. None is a common telemetry outbox.
- `Inference`: a source adapter should reuse entity/activity/decision builders
  where semantics are sound, but Starliner should own durable admission,
  sequencing, compression, retry, acknowledgement, gap records and export.
- `Potential issue`: placing adapter export directly in U-009, U-025 or other
  proxy hot paths would add latency and failure coupling to inline enforcement.

## Evidence references

Primary source locations are named in the matrix. Deep semantic verification is
also available in:

- [System Monitor semantic reference](../../../repository-analysis/07-symbol-reference/endpoint-system-monitor-v2-semantic.md)
- [Proxy runtime reference](../../../repository-analysis/07-symbol-reference/endpoint-proxy-runtime.md)
- [Proxy redirector reference](../../../repository-analysis/07-symbol-reference/endpoint-proxy-redirector.md)
- [Core service runtime](../../../repository-analysis/06-endpoint-core-service-runtime.md)
- [Alerting analysis](../../../repository-analysis/06-endpoint-core-alerting.md)
- [Diagnostics analysis](../../../repository-analysis/06-endpoint-core-diagnostics.md)
- [File-index analysis](../../../repository-analysis/06-endpoint-core-file-index-search-and-metadata.md)

