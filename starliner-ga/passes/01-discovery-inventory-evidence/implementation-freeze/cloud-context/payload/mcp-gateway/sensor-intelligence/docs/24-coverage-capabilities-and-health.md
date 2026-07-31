# Coverage, capabilities, and health

## Current capability manifest

Current observe declarations:

| Capability | Declared mode | Source verification |
| --- | --- | --- |
| backend discovery | observe | registration hook + mapper |
| tool discovery | observe | registration/update/refresh hooks + mapper |
| Direct `tools/call` | observe | handler hook + mapper |
| source observation record | observe | mapper |
| action event record | observe | mapper |
| metric event record | observe | mapper |
| finding signal record | observe | mapper |
| entity snapshot | deferred | no producer |
| relationship event | deferred | no producer |
| decision result | deferred | no observe producer |
| trace span | deferred | no producer |
| sensor health event | deferred | no producer |

Delivery capability is added at runtime as `observe`,
`deferred_authentication`, or `deferred`.

## Coverage profile

| Surface | Discovery | Activity | Control outcome | Lifecycle | Certification |
| --- | --- | --- | --- | --- | --- |
| backend registration | partial create | n/a | n/a | no update/delete/snapshot | hook tests |
| tool discovery | partial upsert/name | n/a | n/a | no removal/completeness | hook/mapper tests |
| Direct tool call | call-time sighting | partial normal-return paths | native DLP block/upstream/error reduced | no session/progress/cancel | two M1 golden traces |
| Direct resources/prompts | none | none | none | none | deferred |
| Direct init/capability negotiation | cache exists | none | none | no change event | deferred |
| OneMCP remote calls | possible reused internal services but no certified surface hook | incomplete/unproven | incomplete | process-local sessions | deferred |
| OneMCP native tools | none | none | none | none | explicitly deferred |
| workflows | source state exists | none in Starliner | none | none | not covered |
| auxiliary Google/Rust/example servers | none | none | none | none | not covered |
| delivery | n/a | records after enqueue | per-record result | retries/terminal | fake/local tests; production deferred |

## Health sources

### Manifest/static state

- enabled/mode/identity configured;
- runtime status/disabled reason;
- delivery configured/authenticated/ready/capability;
- adapter/sensor/runtime/certification/contract identifiers;
- product ref/commit if environment supplied;
- declared/deferred capabilities and known degraded modes.

### Process counters

Scheduler/enqueue/delivery counters described in
`13-metrics-and-analytics.md`.

### Persistent health

Outbox depth/age/lag and terminal delivery counts/timestamps.

### Logs

Startup, scheduling, enqueue, loop, transport, shutdown, and manifest errors.

## Missing health semantics

- no heartbeat or durable health event;
- no expected reporting cadence;
- no per-tenant loss/backlog;
- no source-snapshot completeness;
- no last-successful registry scan;
- no OneMCP/Direct per-capability counters;
- no record sequence/gap detection;
- no disk usage/free-space metric;
- no outbox terminal retention health;
- no live remote ingest round-trip self-test;
- no workload identity/certificate expiry;
- no active certification hash verification;
- no multi-replica instance set/topology.

## Health state proposal

`Proposed` state machine:

```text
unknown
→ starting
→ healthy
→ degraded_capture
→ degraded_delivery
→ stale
→ offline
→ unsupported
```

States are capability-specific. A healthy Direct tool-call capability does not
make OneMCP/resources/prompts healthy.

## Self-test coverage

Current self-test verifies:

- mapper can generate normal synthetic Direct call records;
- each delivery wrapper validates.

It does not verify:

- SQLite enqueue/migration/lease;
- network/DNS/TLS/auth/central receipt;
- backend/tool hooks;
- real MCP call;
- DLP processor;
- OneMCP/resources/prompts/sessions;
- control decision/effect;
- restart/crash recovery;
- multi-replica behavior;
- privacy beyond contract validation.

## Coverage claims

Approved wording:

- “Direct MCP tool calls routed through this gateway are observed when the
  observe runtime is active and healthy, excluding documented exception and
  loss paths.”
- “Registered backend and tool names are observed at selected registration and
  refresh hooks.”

Rejected wording:

- “All MCP activity is monitored.”
- “All tools are inventoried.”
- “Blocked means the upstream never executed.”
- “No observation means no activity.”
- “Certified” when certification ID remains `uncertified-local` or tests did
  not run.

## Product disposition

- customer: source/capability/version/freshness/coverage gaps;
- operator: queue depth, retries, failure classes, dependency reason, task loss;
- evidence drill-down: manifest, self-test/certification, source record/receipt;
- raw/internal: individual scheduler tasks and DB row IDs.

