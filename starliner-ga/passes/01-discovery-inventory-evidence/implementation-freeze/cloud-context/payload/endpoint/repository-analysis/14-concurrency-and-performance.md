# 14 — Concurrency and Performance

## Dashboard/API

Verified concurrency and performance-relevant mechanisms:

- Six independent bounded generic queues, each with configurable worker count. Each worker owns a buffer and periodic ticker; see [Batch writer concurrency and durability](06-dashboard-api.md#batch-writer-concurrency-and-durability).
- Retry uses fresh 30-second contexts and exponential delays. Shutdown waits without a batch-writer deadline after HTTP drain.
- Dashboard overview uses a mutex-protected two-minute map cache with no capacity or expired-entry cleanup.
- Static configuration uses RWMutex-protected raw-byte caches with five-minute TTL; hook config caches per tenant without a capacity bound.
- Inventory overview fetches related entity IDs in 1,000-ID chunks. General asset relationship detail does not use the same chunking.
- Device detail caps devices at 100; overview previews cap each type at 10; direct conversation hook events cap at 2,000; conversation activity-turn retrieval and some relationship queries can still be large.
- Activity conversation listing performs a paged conversation-key query followed by a second turn query capped at 10,000 rows.
- **Potential issue requiring measurement:** `ListAssetInventory` and large aggregation queries perform substantial ClickHouse grouping/`argMax` work; no benchmark or query-plan artifact is committed.
- **Potential issue requiring validation:** lack of stable secondary sorting can make offset pages repeat/skip tied records.

No application-defined metrics exporter, tracing initialization, request rate limiter, circuit breaker, or backpressure signal beyond channel blocking was found in the API source.

## Frontend

- React Query deduplicates/caches requests; per-page searches debounce 300 ms and asset filters 400 ms.
- Tenant-policy edits use a module-global 400 ms serialized save scheduler; dangerous-permission clicks first use a per-key one-second debounce.
- DLP revision tracking is incomplete and can allow an older response to overwrite a concurrent local edit; see [settings analysis](06-dashboard-frontend.md#tenant-policy-settings).
- Relationship layout is synchronous concentric-ring calculation deferred by `requestAnimationFrame`, not ELK/worker execution.
- Production build emits one 582.62 kB JS chunk and triggers Vite's >500 kB warning; no code splitting/dynamic imports are used.
- Client asset-detail ego graphs cap ten neighbors per type; full relationship page does not impose a frontend node cap.
- **Potential issue requiring measurement:** several graph algorithms repeatedly call `Array.find` inside edge loops and can approach quadratic work on large graphs.

## Endpoint Lua scripting

- Active v2 scan matches and scripts run serially inside a synchronous `scan_cycle` called from an async task; Lua, filesystem calls, workspace walking, and subprocess waits block that task.
- Manifest engine runs matching scripts sequentially and creates one VM per script.
- Event dispatcher has a bounded 256-item receive channel but converts every received item into a detached `spawn_blocking` job with no semaphore/join set, so outstanding work is not bounded by channel capacity.
- Timeout checks occur every 1,000 Lua instructions and cannot interrupt Rust host calls.
- `ResultCollector` serializes additions behind `std::sync::Mutex`; poison panics. `take_result` normally deep-clones because Lua closures retain `Arc`s.
- Directory, glob, workspace, process-output, result-vector, script-source, HTTP-response, and extracted-archive sizes have no repository-level caps.
- Workspace traversal is depth-limited to three but root count and directory breadth are unbounded; output is unsorted.
- Updater buffers the entire compressed response before extraction and has no retry/backpressure/total deadline.

Performance concerns require measurement; no scripting benchmarks are tracked.

## Endpoint DLP templating

- Tauri uses the main thread; one unjoined native receiver serializes context/window setup and another waits for shutdown.
- Producer ingress is unbounded `std::mpsc`; only the later FIFO is capped at 30 waiting contexts.
- Standalone broker mode spawns one Tokio task per request and has an unbounded response channel; no task cap precedes UI serialization.
- Six mutexes protect related resources, but context/event/sender replacement is not one atomic operation.
- Rendering is synchronous while Tera/UI locks are held. Context refresh clones full text, HTML, and detections.
- Highlighting lowercases full input and performs detection/occurrence/range scans with no input/output size limit.
- Relaxed atomics track active/sequence. FIFO decisions are locked, but counters are live nontransactional snapshots.
- Same-template reuse avoids reconstruction; a template change blocks the receiver thread for 150 ms.

## Template service concurrency and performance

- `main` creates a multi-thread Tokio runtime but blocks its own OS thread for the six-second gate and then in Tauri. Tokio owns Ctrl+C, main IPC, and kill-switch tasks.
- Tauri setup creates two unjoined standard threads: one blocks on render-command MPSC and directly calls Tauri/state handlers; one blocks once on shutdown MPSC.
- The render-command channel is unbounded standard MPSC. The response channel is unbounded Tokio MPSC. Neither provides backpressure or memory limits under a producer faster than rendering/IPC.
- Regular and notification state use separate standard mutexes. Tera has another mutex. Poison is recovered; no async lock is held across an `.await` in these synchronous handlers.
- IPC has two independent broker connections for the main service and kill listener, plus transient query connections. Main reconnect stops after ten cumulative errors; kill reconnect is unbounded.
- Active lists use linear duplicate lookup, ID removal, ID view cloning, and vector removal shifts. Default sizes are five, so this is small under defaults; unvalidated large configuration can make work linear in caller-selected bounds.
- Queue operations are FIFO `VecDeque` constant-time at ends. Notification queue is fixed at 50; regular queue is configurable.
- Each render locks Tera and constructs JSON/context/rendered HTML synchronously on the render thread. Files are parsed only at startup; no per-request disk template load occurs.
- Window creation and monitor enumeration run synchronously on the render thread. Regular builder panic ends that sole consumer; later unbounded command producers can continue until send sees receiver disconnect and drops requests.
- JavaScript owns one interval per window/current view. Navigation cancels/restarts it from the full timeout rather than remaining elapsed time.
- `dedup_count += 1` is unchecked. Overflow behavior depends on Rust build overflow settings and is not tested; reaching `u32::MAX` is not plausible under intended defaults but not structurally prevented.

**Potential performance issue requiring measurement:** unbounded channels plus synchronous rendering/window calls can grow memory or latency during bursts. No benchmark, load test, queue latency metric, or backpressure measurement exists.

**Potential correctness/performance issue:** setting an active limit to zero creates a queue with no active completion capable of draining it; traffic fills the FIFO and is then rejected.

Potential performance concern requiring measurement: concurrent service-mode messages can accumulate in unbounded task/channel layers even though only 31 requests fit active/FIFO state. No templating benchmark exists.

## Dormant archive extraction and legacy benchmark caveats

- The lazy semaphore admits `ceil(75% of logical CPUs)` top-level `spawn_blocking` closures, minimum one. It does not reserve 75% CPU or bound the Rayon global pool used inside every ZIP closure.
- ZIP reads the full compressed input into one byte vector and reparses a new `ZipArchive` for every parallel entry. Peak memory and CPU can materially exceed the compressed size; no repository benchmark/limit measures it.
- 7z, RAR, and TAR-like processing is sequential within an archive. Recursive child archives are also processed sequentially; only ZIP entry work is parallel.
- Fallback holds a standard mutex while polling, sleeps 100 ms, and uses an unjoined OS thread. Cancellation releases the guard before the worker ends, enabling overlap with a later fallback call.
- Timeout drops the await on a blocking closure but relies on cooperative checks. Result-vector cloning can race with later worker additions after return.
- No byte, entry-count, compression-ratio, disk, memory, queue, or password-work quota exists.
- The two Criterion targets cannot compile against the current alert API. Even conceptually, their send timers stop at handoff, ignore send errors, do not drain the queue, and label 519 bytes as 512/end-to-end handoff as delivery.
- Five direct integration-test binaries are serial at Cargo target level, while libtest functions within each executable may run in parallel. They share process environment, default Vault state, and real service resources without consistent serialization.

All performance concerns above require target measurement after reachability/API repair; none is claimed from benchmark output. See [the detailed concurrency audit](06-endpoint-core-crate-shell-tests-and-decompression.md#criterion-benchmarks).

## System monitor concurrency and performance

- The orchestrator retains ten task handles, plus unjoined Persona/kill-switch listeners and detached activity/connection/session tasks.
- `EntityStore` uses `DashMap`, a 256-slot broadcast, an atomic cursor, and concurrent pending governance. Per-key mutation is concurrent, but compound scans (`all`, name/canonical lookup) are O(n) snapshots.
- Process monitor and enforcer are the only sleep-aware workers. Sync, Persona, scanner, package, activity, snapshot, and map refresh continue during sleep.
- macOS enumeration uses `spawn_blocking`; Lua scanner and npm/Cargo/Go filesystem work are synchronous in async tasks. Six Lua scripts can repeat the same workspace traversal per scan.
- Go metadata waits for an external process without timeout. macOS native quit has five-second timeout; shared HTTP has 30 seconds; Auditor has no explicit timeout.
- Enforcer scans the OS process list per action/sweep and can do native quit + 3-second wait + signal + another 3-second wait. Multiple blocked entities are processed sequentially in sweep.
- Hook IPC permits 128 concurrent connection tasks, but an unbounded number of distinct session IDs can create 64-slot queues and worker tasks. Caller-provided frame length is not bounded before allocation.
- `ActivityEvaluator` caps distinct tools/files at 500 each per turn. Activity channel is 1,000 and batch 100/30 seconds; overflow/failure drops rather than backpressures IDE calls.
- DLP cache eviction and many store searches are O(n). The cache is FIFO-by-insertion, not LRU.
- Snapshot pretty-serializes and writes every entity in one operation every 30 seconds by default; there is no incremental persistence.
- Correlation cache hits do not renew TTL. Process-map refresh is fixed at 600 seconds.

These are source-level characteristics and measurement targets. No working benchmark for this crate or checked CI performance run exists, so latency/memory/CPU severity is **Unresolved**.

## Email-discovery concurrency and performance

- The helper uses Tokio's default multi-thread runtime through `#[tokio::main]`.
- Linked core code starts nine discovery futures in a `JoinSet` and awaits all; there is no per-source timeout at that layer.
- Completion order determines pre-dedup candidate order. Parent dedup/sort happens after the full frame is received.
- Candidate data is held in a vector, serialized to another vector, copied into a framed vector, allocated/read again by the parent, then deserialized. The parent bounds payload to 1 MiB; the producer does not.
- The parent 30-second timeout covers accept and complete read. Child connect/write/flush lacks a local timeout/retry.
- Reaping uses an unretained blocking task with five-second wait; its result is discarded.
- Fixed endpoint naming makes concurrent runs collide or interfere. No mutex, nonce, per-run suffix, or in-flight guard is visible in the parent/helper path.

The documentation's statement that elapsed discovery approximates the slowest source is **Inference** rather than measured evidence: individual source internals can contain blocking work and no benchmark/timing test covers the combined flow.

## Diagnostics concurrency and performance

- Producer and local worker ingress channels are unbounded; the bounded RingBuffer does not bound upstream memory.
- Producer forwarding, heartbeat, broker receive, serialization, and reconnection share one task. Error cycles explicitly drain/drop queued work.
- Receiver callbacks are synchronous and sequential on the broker task; Batch invokes every handler with no yield.
- The worker performs synchronous file open/scan/parse/write/flush operations on a Tokio task.
- A Bulk POST can occupy the only worker for up to 30 seconds while local ingress accumulates.
- The select constructs a new sleep after every received event. Sustained input can keep resetting the flush/export deadline indefinitely.
- Both append-only files grow without retention/compaction. Startup sent-set memory and every full-history scan grow with historical event count.
- Each marked event independently opens and flushes `.sent`; batching applies only to HTTP.
- One outbound HTTP body is built as a complete in-memory String of all selected payloads.
- IPC retry delays grow to 60 seconds and do not reset after a successful connection.

These are verified structural concerns; no benchmark or load test measures throughput, memory, scan growth, event latency, drop count, or queue depth. See [the detailed diagnostics concurrency section](06-endpoint-diagnostics-receiver.md#concurrency-and-performance).

## Endpoint infra concurrency and performance

- Process waits, Unix socket operations, stale scans, and retry loops are synchronous/blocking.
- Ordinary timed waits poll every 10 ms; launchctl-backed waits poll every 100 ms. No cancellation token exists.
- Unix connect doubles sleep without a cap and can overshoot the caller deadline; accept polls every 10 ms.
- Mac stale cleanup runs one `pgrep` plus one `ps` subprocess per candidate.
- Windows Job Object initialization is serialized by `OnceLock` and cannot reset/retry after a cached invalid result.
- Resolver executable directories are per-object snapshots; platform selection/getters allocate fresh boxes on each call.
- Raw IPC supplies only OS buffering; no framing, batching, queue bound, or backpressure policy exists at this layer.
- `UnixSocketChannel` satisfies `Send + Sync`, but every I/O method needs mutable access; shared use requires caller locking.
- Active process services bypass standard infra IPC and use the separately analyzed pinned broker, so infra socket performance is not representative of product messaging.

No infra benchmark or load test measures spawn latency, cleanup cost, connection timeout accuracy, Job assignment, session discovery, or IPC throughput.

## Endpoint proxy concurrency and performance

- Each accepted HTTP/TLS connection spawns asynchronous work behind a configurable 2,000-permit semaphore. Several refresh/listener/cleanup tasks are detached and not joined at shutdown.
- Important body paths buffer complete payloads despite streaming names. PDF/Office/OCR add CPU, allocation, and temporary-file work; OCR uses `block_in_place` and has a 30-second timeout around engine work.
- Traffic logging uses an asynchronous channel/runtime path with no tested shutdown flush; intercepted bodies/context can increase allocation and I/O substantially.
- WebSocket upgrade spawns unbounded bidirectional relay work with no I/O deadline or global relay limit. Text/frame processing converts or inspects complete frames.
- Request retries can repeat upstream I/O and body handling. Breakers are shared under fixed names rather than per-origin, so unrelated destinations can affect one another.
- Windows creates one blocking WinDivert receive per configured worker and batches up to 64 packets into `max_packet_size * 64`. A zero/very large size is not validated. Receive errors retry without delay.
- Windows process fallback synchronously snapshots/scans the TCP table in a packet worker. TCP flow maps have no complete periodic expiry; long-lived churn can retain state.
- UDP tracker capacity check and insertion are not atomic; concurrent insertions can overshoot the configured maximum. Attribution cache keys omit destination/process generation.
- Rust macOS relay permits 4,096 flows; Swift independently permits 200, caps pending at 64, and uses a backpressure threshold of 16. The mismatched limits mean Swift is normally the effective bound.
- Rust spawns a task for each relay/control message; control response capacity is 10,000. Swift `AsyncStream(bufferingNewest: 64)` silently drops older control messages.
- Swift TCP relay has a hard five-minute lifetime and one blocking connect/single header send; Rust documentation says no wall-clock cap. `AsyncSemaphore.signal` schedules another Task, so permit release is asynchronous.
- Dormant UDP code has per-flow sockets/tasks and no global maximum on Rust; it is not reachable from the active Swift UDP branch.
- OCR cache bounds entry count, not bytes; successful text can consume variable/unbounded aggregate memory. Uniqueness/DNS/attribution caches use separate bounds and cleanup schedules.

These are structural properties and measurement candidates, not measured performance claims. The repository contains no proxy load benchmark for throughput, latency, memory, packet loss, backpressure, or shutdown time.

## Endpoint delivery and test-tool concurrency

- `core/src/update.rs` uses an exclusive lock file to serialize updater executions. The lock protects updater processes that honor that path; the repository does not prove coordination with installers, package managers, or manual file replacement.
- The macOS and Windows GitHub build workflows define branch-scoped Actions concurrency groups with cancellation of an older in-progress run. They do not serialize different branches or manual local builders.
- Build scripts invoke multiple independent Cargo builds and then copy artifacts into shared repository-local output directories. The scripts do not lock those directories; concurrent local invocations can overwrite or mix outputs.
- The Rust test server annotates `test_configure_response` twice with `#[tokio::test]`. Static counting therefore finds eight attributes for seven functions; whether rustc accepts or rejects the duplicated test transformation was not executable in this environment.
- `tools/local_cdn.py` and `tools/mock_user_details_server.py` use Python's single-threaded `HTTPServer`; one slow client can delay all other requests.
- `test-server/python-server/server.py` uses `ThreadingHTTPServer` without an application-defined thread or request-body bound. This is a source-level concurrency characteristic, not a measured exhaustion result.
- Both test-server implementations discover/choose ports without an atomic external reservation protocol. The Python server binds directly; the Rust test helper can race between selecting a port and binding it.
- The Rust server's request helper places a blocking first-line read in `spawn_blocking` with no read timeout. A connected client that never sends a line can occupy a blocking-pool task indefinitely.
- Test-server response bodies and the local-CDN file path are materialized in memory. No repository load test measures large-response memory, concurrent thread growth, or slow-client behavior.

The complete delivery/tool evidence is in [the build/release/install chapter](06-endpoint-build-release-install-and-update.md) and [the root/tools/tests chapter](06-endpoint-root-tools-tests-and-documentation.md).
