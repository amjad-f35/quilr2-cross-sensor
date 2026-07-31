# Concurrency and performance

## Execution model

The Python HTTP services run on an asyncio event loop under Uvicorn/FastAPI. Remote MCP, HTTP, and `aiosqlite` operations are generally asynchronous. SQLite initialization/migrations and selected diagnostic/version calls are synchronous at import/startup. The Rust service uses Tokio/Axum.

Separate OS processes are intended for the main gateway, workflow runner API, workflow runner worker, retention worker, scheduler, ClickHouse syncer, and Google Workspace server.

## Concurrency mechanisms

| Mechanism | Location | Behavior |
| --- | --- | --- |
| Lazy connection locks | core/log/event/runner DB modules | `asyncio.Lock` prevents duplicate per-process connection creation |
| SQLite WAL + busy timeout | all SQLite initializers | readers/writers can overlap under SQLite WAL rules; waits up to 5 seconds when busy |
| Dedicated DB connections | OAuth multi-write/schedule transaction/read-only analytics paths | reduces shared-connection head-of-line blocking |
| Background logging queues | `services.background_log_worker` | response path enqueues without blocking; worker performs persistence/Axis I/O |
| Per-user/backend OAuth locks | OAuth service | serializes refresh in one process |
| OneMCP queues/locks | event store, request stream, client sessions, inflight registry | bounds and coordinates session notifications/events |
| Workflow DB leases | runner repository/engine | workers claim rows and heartbeat about every lease/3 |
| Schedule leases | workflow agent repository/scheduler | prevents ordinary duplicate due-schedule claims |
| Scheduler semaphore | scheduler worker | bounds concurrent runner enqueue requests |
| Starliner leases/outbox | outbox repository/delivery | claims batches, retries with backoff, supports shutdown drain |
| Probe semaphore/task set | remote probe tool | bounds concurrent remote probes |

## Process-local state limitations

Backend cache, OneMCP sessions/event buffers, confirmations, refresh locks, in-flight requests, logging queues, and current smart-group view are process-local. Restart loses transient state. Multiple replicas would not share locks/session state and could route a continuation to a process that lacks it.

`Verified operational consequence:` checked-in PaaS guidance recommends one container/replica. `Unresolved:` no sticky-session or distributed-state implementation exists in scope.

## Backpressure and loss

- Background log queues are bounded and deliberately drop new jobs when full.
- OneMCP request notifications are dropped when full; client-session queues drop the oldest item.
- SSE/event stores have TTL/session/event limits configured by environment.
- Starliner uses a bounded durable outbox and explicit “full” behavior.
- Workflow limits cap tools, Python executions, artifacts, chat messages, due schedules, parallel enqueues, and retries.

These choices protect response latency or storage but permit loss of observability/notifications. They are not equivalent to a durable message queue.

## Blocking work in async contexts

- `services.axis_logging` uses `requests.post`, but it is invoked through the background log worker rather than the immediate route path.
- Database schema creation uses synchronous `sqlite3` before/as processes start.
- `gateway.py` invokes `git` through `subprocess.check_output` for version metadata; this is diagnostic/startup/request-adjacent synchronous work depending cache/call path.
- `clickhouse_sync_utils` is a standalone synchronous loop and uses `time.sleep`, so it does not block the gateway event loop.

`Potential performance concern requiring measurement:` large detailed-log aggregation routes execute multiple SQLite queries and in-Python grouping. The source bounds many query limits, but database size and indexes determine latency.

## Caching

- Backend registry caches backend models for the process.
- Capability/tool discovery caches have TTL controls.
- Embedding service caches tool/name embeddings in memory.
- OneMCP client metadata and connection status use targeted caches/markers.
- External public key and Fernet object use `lru_cache`.
- Smart groups use memory plus persistent snapshot.

Cache invalidation is implemented per subsystem rather than through a common cache. No Redis/Memcached/distributed cache exists.

## Streaming

Direct MCP and OneMCP support streamable HTTP/SSE. OneMCP replay uses event IDs and timeout polling. Bounded notification queues prevent unbounded memory use. Session termination and upstream-session negotiation are separated.

`Potential issue requiring measurement:` slow clients retain per-session buffers/tasks until TTL/termination. Environment limits mitigate but do not establish a production capacity number.

## Database/query considerations

- Core schemas create indexes for major ownership, status, schedule, log, and time filters.
- JSON is stored as text and parsed in Python; settings/capabilities cannot use typed relational constraints.
- Some analytics fetch broad sets for in-process aggregation (for example client access/log summaries).
- Workflow chat message reconstruction requests up to 10,000 stored messages in an engine path.
- SQLite shared-connection serialization can become a throughput ceiling despite WAL.

`Potential performance concern requiring measurement:` SQLite plus one replica is a deliberate simplicity/consistency tradeoff but can limit concurrent writes and horizontal scaling.

## Token-saving CPU/network behavior

Token-saving can parse/transform JSON, HTML, Markdown, and text and computes token counts with `tiktoken`. The local default test run showed first-use tokenizer data attempted a network download; three tests failed when DNS/network was unavailable.

`Potential issue:` cold-start/air-gapped environments need the tokenizer data pre-cached or a fallback, otherwise tool responses can fail in paths that enable token saving.

## Workflow execution

Runner workers lease one work item per iteration and maintain heartbeats. Engine loops can make LLM/tool calls, persist every step, and produce artifacts. Cancellation is cooperative: the flag is observed between stages/calls, not an OS-level interruption of an in-flight remote side effect.

There is no proof of exactly-once execution. Leases provide at-least-once-style recovery for local work, while external side effects require idempotency at the tool/application layer.

## Performance verification status

No benchmark suite, load test, profiler output, capacity model, or latency SLO is tracked in scope. The repository has functional/contract tests and configuration bounds. All throughput, memory, and tail-latency concerns above are code-based candidates requiring measurement, not measured regressions.
