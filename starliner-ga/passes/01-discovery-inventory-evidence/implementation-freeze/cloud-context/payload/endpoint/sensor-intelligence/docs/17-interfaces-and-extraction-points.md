# 17 — Interfaces and Extraction Points

## Scope and conclusion

This chapter inventories the endpoint sensor boundaries through which native
inputs, controls, observations, health, and evidence enter or leave the pinned
implementation. The row-level ledger is
[interfaces.csv](../../../matrices/sensor-intelligence/endpoint-sensor/interfaces.csv).

**Verified in source:** there is no single existing interface that exposes all
endpoint inventory, hook activity, proxy/DLP evidence, control attempts,
observed effects, and health with durable delivery semantics.

**Recommended / Proposed:** use an in-process adapter with separate capture
bridges at the native semantic seams listed below, writing all telemetry to one
local durable outbox. Reusing only `POST /ea/v1/sync/discovered-apps`, the alert
queue, logs, or `/metrics` would lose source semantics that the sensor has
already computed.

## Interface families

### System Monitor capture and configuration

| Interface | Implementation | Semantics |
| --- | --- | --- |
| OS process enumeration | `system-monitor/v2/src/platform/{macos,windows}.rs`; `discovery/process_monitor.rs` | Periodic process snapshots become `ProcessInfo` and a `ProcessDelta`. There is no native process-event subscription. |
| Filesystem discovery | `discovery/scanner/*`, `discovery/config_scanner.rs`, `discovery/pkg_scanner/*`, checked-in Lua scripts | Reads known config/project/package paths and produces typed entities. Coverage is rule and path dependent. |
| Embedded process map | `defaults/default_process_map.json` | Startup fallback/correlation input. It is configuration, not observed installed software. |
| Remote process map | `sync/process_map.rs::fetch_process_map` | `GET {base_url}/ea/v1/sync/process-map`; replaces platform maps after a successful fetch and refreshes every 600 seconds. |
| System Monitor config | `system-monitor/v2/src/config.rs` | TOML, defaults, and selected environment-derived paths control scan, sync, hook, enforcement, and snapshot behavior. |

The process and filesystem inputs are the highest-fidelity inventory extraction
source. The current sync wire is later and lossy: `to_discovered_entity` converts
the tagged native `EntityKind`, truncates names to 512 bytes, serializes the
kind-specific body into `entity_context`, injects a parent canonical ID when it
can, and defers child records whose declared parent has not been resolved.

### Current discovery/control HTTP

| Method/path | Client symbol | Authentication implemented by client | Delivery and failure behavior |
| --- | --- | --- | --- |
| `POST {base_app_sync_url}` | `sync::app_id::resolve_app_ids` | shared helper adds tenant/subscriber headers and optional bearer | best effort; partial/missing mappings remain pending |
| `POST {base_url}/ea/v1/sync/discovered-apps` | `sync::ingest::sync_entities` | tenant/subscriber headers and optional bearer; gzip body | five-second loop; no durable queue; non-success retries on a later cycle |
| `GET {base_url}/ea/v1/sync/delta?tenant_id=&since=&os_type=` | `sync::delta::poll_delta` | tenant/subscriber headers; this path does not add the Persona bearer | cursor and settings; parse errors propagate; backend error text is logged and retried later |
| `GET {base_url}/ea/v1/sync/process-map` | `sync::process_map::fetch_process_map` | tenant/subscriber headers; no bearer in this implementation | ten-second client timeout; current map retained after refresh failure |
| `POST {base_url}/ea/v1/sync/activity` | `ActivityBatcher::post_batch` | shared helper adds tenant/subscriber and optional bearer | 100 records or 30 seconds; one delayed retry; then the batch is dropped |
| `POST {base_url}/ea/v1/sync/alerts` | `Auditor::report` | tenant/subscriber; no bearer | one immediate retry; a non-success status on the second response is not treated as an error |

**Contradiction:** the pinned dashboard registers the five `/ea/v1/sync/*`
interfaces above except the app-ID route. `SyncConfig` defaults the latter to
`/bff/browser-extension/endpoint/app/add`, which belongs to a different backend
surface. The dashboard also registers `POST /ea/v1/sync/hooks-activity-logs`,
but the active v2 hook path sends reduced prompt-turn activity to
`/ea/v1/sync/activity` and has no checked caller for the hook-event batch route.

**Security boundary:** the dashboard's `TenantAuth` accepts either an HMAC bearer
form when its secret is configured or directly trusts tenant/subscriber headers
when the secret is empty. The agent's shared helper can send an ordinary Persona
bearer, but source inspection alone cannot prove that the deployed backend
expects the same token form.

### Hook interfaces

The hook flow has three boundaries:

1. Cursor or Claude invokes a thin executable with one JSON document on stdin.
2. The thin executable converts that native document to `HookRequest` and sends
   `[u32 big-endian length][JSON]` through a local Unix socket or Windows named
   pipe.
3. The manager queues by `session_id`, returns `HookResponse`, and the evaluator
   emits a reduced `ActivityEntry` only for the completed prompt-turn path.

Defaults are `$HOME/.sentinel/hook.sock` on Unix and
`\\.\pipe\sentinel_hook` on Windows. The Unix server changes the socket mode to
`0666`. The Windows server rejects remote clients but applies a permissive DACL
and low mandatory label so non-elevated IDE processes can write. The thin client
defaults to a 500 ms timeout and fail-open, while the server wraps a connection
in a five-second timeout and permits 128 concurrent connections.

**Verified in source:** `HookRequest` has `session_id`, `ide_type`,
`event_name`, optional tool/command/file/prompt data, `cwd`, and `timestamp`.
It has no request/event/turn ID. `ActivityEntry` also has no session or event ID.
The JSONL hook log is richer evidence than `ActivityEntry`, but is append-only
best effort and has no rotation, acknowledgement, integrity chain, or delivery.

**Recommended extraction:** construct a stable source record immediately after
native hook conversion and before queue aggregation. Emit a second decision
record after evaluation and an effect record only when the IDE protocol gives
evidence of an effect. Do not infer execution success from `Allow`.

### Persona, kill-switch, template, alert, and diagnostics IPC

These services share the pinned broker channel `ipc_light_broker` and JSON
payloads in `BrokerMessage`.

| Service ID | Producers/consumers | Relevant semantics |
| --- | --- | --- |
| `persona_service` | core Persona bridge; System Monitor and proxy clients | commands include `get_persona`, `get_access_token`, and `is_authenticated`; v2 uses per-request client IDs and a five-second response timeout |
| kill-switch service IDs | agent controller and child service clients | tenant/device enabled state and broadcasts; missing state defaults enabled |
| `alerting_service` | proxy/core alert senders and alert receiver | typed alert payloads and lifecycle messages; local durable SQLite exists in alerting, but it is not a general sensor outbox |
| `template_engine_service` | template service and System Monitor | prompt/notification UI requests and decisions |
| `diagnostics_service` | diagnostic senders and standalone receiver | event/batch/lifecycle records; receiver can write OpenSearch Bulk |

Broker registration and message source strings are routing identifiers, not
authenticated workload identities. No adapter should treat them as proof of
producer identity without Starliner enrollment/workload credentials.

### Proxy and network interfaces

The proxy accepts explicit HTTP proxy traffic and, when enabled and privileged,
transparently redirected TCP/UDP traffic. It supports HTTP/1.1, HTTP/2 in
selected paths, CONNECT/TLS interception, WebSocket upgrade/tunneling, Windows
packet redirection, and a macOS NetworkExtension path.

The macOS extension connects to `/var/run/sentinel-proxy.sock` with framed JSON
messages. Windows traffic redirection crosses WinDivert/driver and process-table
boundaries. These are capture/control interfaces, not telemetry delivery APIs.

The proxy also calls:

- `GET /bff/browser-extension/browser/extension/fetch-app-details?domain={domain}`;
- `GET /bff/extension-api-service/extension/v2/fetch-app-details?domain={domain}`;
- `GET /bff/extension-api-service/extension/interceptor-config/v1/agent`;
- an operator-configured remote DLP endpoint with raw content;
- feature-gated `POST /dlp/v2/stream/detect` through the AI analyzer path;
- the alerting service through local IPC and its configured HTTP delivery path.

`GET /health` and `GET /metrics` are dispatched only for a `Host` accepted by
`is_proxy_bind_address`. They have no application authentication. If the proxy
bind address is `0.0.0.0`, any IP with the configured HTTP/HTTPS port satisfies
that check. `/metrics` is Prometheus text; `/health` is a JSON status projection.
The version emitted by `proxy_info` is hard-coded to `0.1.0`.

### Files, databases, and logs

| State/output | Writer | Adapter value and limitation |
| --- | --- | --- |
| System Monitor snapshot | `store/snapshot.rs` | Complete serialized current entity state plus cursor; useful for bootstrap/backfill, but not an event log |
| Hook JSONL | thin hook clients | Native activity evidence; no durability contract or stable record ID |
| Process-local `EntityStore` | discovery and sync workers | Best native inventory seam; transient and needs a snapshot/outbox bridge |
| Alert SQLite/outbox | core alerting | Reusable implementation ideas and alert persistence; schema is alert-specific, not all telemetry |
| Proxy traffic log | `traffic_logger.rs` when enabled | Operator diagnostic text/JSON line source; sampled/truncated and unsuitable as the canonical adapter seam |
| Service logs | tracing/logging modules | Valuable operational evidence, but field stability and delivery are not a telemetry contract |
| File index/search database | core file subsystem | Internal search/index state; it does not establish that all indexed files are agent artifacts |
| Persona vault/storage | core Persona | credential/identity state; secrets must not be exported as telemetry |
| Diagnostics/OpenSearch | diagnostics receiver | separate operational pipeline; no common endpoint-sensor sequence or acknowledgement |

## gRPC status

**Verified in source:** `core/proto/db_service.proto`, optional `tonic`/`prost`
dependencies, the `grpc_server` feature, and feature-gated code generation exist.

**Verified in source:** no active endpoint executable in the pinned default
build starts a tonic server or uses this protobuf service as the sensor
transport. The handwritten gRPC client/server code also expects generated
`schema_id` fields absent from the checked proto.

**Disposition:** `Placeholder / incompatible dormant interface`. gRPC could be
a future transport choice, but enabling it would not solve identity,
durability, sequencing, evidence integrity, or canonical mapping by itself.
The MVS should use the common Starliner transport contract selected across
sensors rather than introduce an endpoint-only gRPC control plane.

## Extraction-point assessment

The complete assessment is
[extraction-points.csv](../../../matrices/sensor-intelligence/endpoint-sensor/extraction-points.csv).

### Recommended composite boundary

One host-local adapter service should expose typed capture calls through small
in-process bridges, because the endpoint is a compound multi-process sensor.
The calls must be placed at several native seams:

1. **Inventory:** after `Entity` construction/upsert and before
   `to_discovered_entity`. Store the complete typed entity and native
   identifiers. Emit add/refresh/governance/remove observations with explicit
   source semantics; bootstrap from the snapshot.
2. **Hook activity:** after native thin-client conversion to `HookRequest`,
   before `SessionQueue` loses per-event structure; emit a separate
   `HookResponse` decision record.
3. **Proxy/DLP:** after `RequestContext` enrichment and after each detection,
   policy-decision, alert-construction, and local-response/forward stage. Raw
   content must pass through the privacy filter before outbox persistence.
4. **Enforcement:** at attempted action, per-step result, notification/audit
   result, and final re-observation. The current code needs new final effect
   verification to distinguish attempted from effective.
5. **Health and coverage:** from explicit lifecycle, scan completion,
   configuration freshness, queue/outbox, hook integrity, extension heartbeat,
   and proxy outcome counters—not by scraping log strings.

Every bridge writes an immutable record to the same durable local outbox. It
must not synchronously wait for central delivery on request/hook/enforcement
hot paths.

### Why current outbound interception is insufficient

Capturing immediately before current HTTP delivery is easy but already loses:

- process start time and complete native kind typing in some paths;
- hook `session_id`, `event_name`, `cwd`, and fine-grained events in the
  `ActivityEntry` projection;
- proxy request-stage, detection-stage, policy-stage, and effect-stage
  distinctions;
- unsuccessful enforcement attempts and step-level outcomes;
- unsent/dropped records;
- a reliable removal/tombstone stream;
- stable record IDs, monotonic sensor sequence, acknowledgements, replay, and
  backfill boundaries.

### Bootstrap and deletion

The snapshot can seed current inventory, but snapshot presence is not proof of
current activity. `ChangeEvent::Removed(Uuid)` exists, yet normal process exit
does not remove the corresponding Application in the active discovery path.
Therefore:

- emit explicit tombstones only for verified `EntityStore::remove` calls;
- represent scan absence as coverage/last-seen evidence, not deletion;
- let central lifecycle policy age stale observations;
- add source-side scan/run IDs and complete-snapshot markers before claiming
  absence-based inventory removal.

## Interface quality gaps

- No common workload-authenticated sensor transport.
- No common schema/version envelope.
- No stable native record ID or sensor sequence.
- No full-fidelity durable outbox.
- No central acknowledgement/replay cursor.
- No event-time/observation-time pair on every interface.
- No complete deletion/absence semantics.
- No verified rate-limit or maximum-payload contract for most backend calls.
- No authenticated health endpoint.
- No single privacy filter before all outbound evidence.
- Multiple independent HTTP clients have different bearer, timeout, retry, and
  status-handling behavior.
- IPC broker IDs are unauthenticated routing labels.
- Dynamic deployment compatibility with external BFF endpoints remains
  **Unresolved** without live contracts/runtime captures.
