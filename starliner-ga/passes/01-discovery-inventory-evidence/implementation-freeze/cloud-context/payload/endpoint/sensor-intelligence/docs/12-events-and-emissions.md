# 12 — Events and Emissions

## Emission boundaries

The endpoint emits or exposes information through:

- gzip JSON HTTP discovery ingest and governance/app-ID responses;
- JSON HTTP activity batches;
- broker JSON for alerts, Persona, kill switch, diagnostics and templating;
- SQLite alert/retry/quarantine/DLQ tables;
- Unix-domain/named-pipe style IPC through the shared broker;
- macOS length-prefixed JSON over Unix socket;
- local health/metrics HTTP endpoints;
- local snapshots, traffic logs and ordinary logs;
- in-memory Tokio broadcast/mpsc queues.

No gRPC producer/server/client is active in the endpoint runtime. Dormant
generated/prototype gRPC-related material does not create a production
interface.

The event catalogs are:

- [native-events.csv](../../../matrices/sensor-intelligence/endpoint-sensor/native-events.csv)
- [event-mappings.csv](../../../matrices/sensor-intelligence/endpoint-sensor/event-mappings.csv)
- [native-event-types.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/native-event-types.yaml)

## Discovery/state emissions

### Process deltas

`ProcessTable::diff` constructs started/exited collections on each snapshot.
They are internal observations, not delivered canonical events. The monitor
uses them to correlate applications and manage tracked processes.

### Entity change broadcast

`EntityStore` produces `Added`, `GovernanceUpdated`, `Rediscovered` and
`Removed` on a Tokio broadcast channel.

- No event ID, source timestamp or sequence is present.
- Slow receivers can lag and miss messages.
- The store remains the local current-state source after a missed broadcast.
- `Removed` exists, but ordinary process exit does not make Application removal
  the normal lifecycle outcome.

### Discovery HTTP ingest

The current HTTP batch is a current-state observation upload, not a canonical
event stream. It contains discovery/last-seen times and receives mappings and
settings. It has no explicit per-observation idempotency/ack envelope beyond
the record ID and current response mapping.

## Hook emissions

`HookRequest` is a local observed request. `HookResponse` is a local decision.
`ActivityEntry` is a derived activity record.

The semantics are:

```text
hook.requested
→ hook.decided (currently Allow)
→ source continues or handles response
```

There is no endpoint event proving:

```text
tool.executed
tool.succeeded
tool.failed
tool.effect_observed
```

Activity delivery is lossy: queue overflow drops individual entries; two
failed HTTP attempts drop the batch.

## Proxy/DLP/alert emissions

The proxy observes an intercepted request and can produce detector, user
interaction and alert records. There is no single native event envelope for
every request stage.

The defensible semantic stages are:

```text
request.observed
detection.produced
policy.decision_produced
user.justification_requested
user.justification_received
enforcement.action_selected
request.forwarded_or_locally_responded
alert.admitted_to_local_storage
alert.delivery_attempted
alert.sent_or_retry_or_failed
```

Current alert payload fields sometimes combine several stages. A value such as
`action_taken = Block` must not be promoted to
`enforcement.effect_observed` without path-specific evidence.

Alert delivery is the most durable endpoint path:

- broker transport into alerting;
- SQLite `Pending`/`Sending`/`Retry`/`Sent`/`Failed`;
- quarantine for poison records;
- DLQ with acknowledgement/retry tooling.

There is still no shared cross-record sequence and no common Starliner
admission receipt.

## Diagnostics and service lifecycle

`DiagnosticPayload` carries event ID/time/severity/category/component/code,
message and arbitrary context. `DiagnosticsMessage` has event, batch and
lifecycle variants.

- Event and lifecycle producers exist.
- No producer was found for diagnostics `Batch`.
- The receiver is not active in the default eight-service graph.
- Broker-send success is not backend-delivery proof.

Alert IPC independently duplicates a lifecycle-event shape. Service manager
`StatusUpdate` independently has state, heartbeat, error and crash variants.
There is no unified service lifecycle stream.

## Network Extension protocol events

The macOS protocol is length-prefixed JSON with a 1 MiB maximum:

- inbound TCP redirect, UDP packet, connection close, heartbeat and ping;
- outbound ack, UDP response, heartbeat ack, close request, config update,
  pong, backpressure and shutdown.

These are local transport/control events. They are not currently exported as
customer activity or central network telemetry.

## Timing, ordering and duplication

| Path | Event time | Ordering | Retry | Duplicate/loss semantics |
| --- | --- | --- | --- | --- |
| discovery | entity discovered/last-seen | batch order only | task-level HTTP behavior | no common durable replay; same entity can recur |
| hook activity | local activity time | queue/batch order | one retry | queue/batch drops; source time discarded |
| alert | payload/request time plus DB times | per DB query/batch | configured dispatcher retries | ID available; quarantine/DLQ |
| diagnostics | producer time | broker arrival | broker/receiver dependent | receiver absent by default |
| extension | source timestamp for connection/heartbeat | socket frame order | protocol-specific | disconnect/reconnect behavior local |
| service status | `SystemTime` heartbeat or message order | unbounded channel order | none | process-local history not durable |
| traffic log | `DateTime<Utc>` | ring drain/file append | none | oldest overwritten when 10,000 queue full |

## Canonical mapping rule

`Proposed:` adapters should emit distinct canonical event candidates for
observation, decision, requested action, execution result and observed effect.
If a source record contains only a decision, the later stages must remain
absent—not synthesized.

