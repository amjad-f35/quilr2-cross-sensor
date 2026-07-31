# Concurrency and performance

## Runtime concurrency model

`quilr-query-builder` uses the embedded servlet model: concurrent request threads invoke singleton Spring controllers/services/processors. It additionally enables Spring scheduling and async execution. `quilr-web` uses Next.js/Node request handling plus browser event loops and concurrent React/data-fetching behavior.

No benchmark, load test, profiler output, or production metric snapshot is tracked. Items labeled **Potential performance concern** require measurement.

## Backend executors and asynchronous work

### Dashboard executor

`DashboardExecutorConfig.dashboardQueryExecutor` creates a `ThreadPoolTaskExecutor`:

| Parameter | Value |
| --- | ---: |
| core threads | 8 |
| maximum threads | 32 |
| queue capacity | 200 |
| rejection policy | `CallerRunsPolicy` |
| wait for tasks on shutdown | true |
| shutdown wait | 30 seconds |

`AIUsersServiceImpl` submits three `CompletableFuture.supplyAsync` queries to this executor for KPI, user, and department data, then waits on `CompletableFuture.allOf(...).join()`.

Implications:

- the three I/O queries can overlap;
- the request still blocks until all complete;
- an exception completes a future exceptionally and `join()` propagates a completion exception;
- when the pool and queue saturate, `CallerRunsPolicy` runs work on the submitting servlet thread, providing backpressure at the cost of request latency.

### Spring `@Async`

Four `AuditService` methods are annotated `@Async`; `TenantAppSettingsService.onApplicationReady` is both async and an application-ready listener. No explicit general-purpose async executor is selected on those annotations, so Spring's configured/default async executor semantics apply.

The code resolves actor/client IP before crossing into asynchronous audit publication, avoiding request-thread context access after dispatch.

**Framework constraint:** `@Async` only takes effect through a Spring proxy. Direct self-invocation would be synchronous. Known calls originate from other injected services, but the complete generated reference should be consulted for each call.

### Dedicated bootstrap executor

`MasterDataBootstrap` creates a daemon single-thread `ExecutorService`. The scheduled hook submits bootstrap work after a Redis state transition. `@PreDestroy` shuts down the executor. The single worker serializes its bootstrap tasks but the state marker can outlive a failed task.

## Scheduled work

Seven active scheduled methods were parser-verified:

| Job | Schedule | Work/concurrency behavior |
| --- | --- | --- |
| app-admin backfill | initial 60 s, then fixed delay 1 h | Redis marker plus per-record graph/warehouse work |
| app sync queue | fixed delay, default 5 s | Redis lock and pop/process batch, default 50 |
| hunting start | daily 00:10 | iterates an empty scheduler list at this commit, effectively no-op |
| latest app/settings sync | every minute | synchronization service calls |
| latest user sync | every minute | synchronization service calls |
| apps DB → tenant settings | hourly | cache/warehouse synchronization |
| master bootstrap | initial 20 ms, then fixed delay `Long.MAX_VALUE` | practical run-once submission |

The commented testing cron is not an active hook. Scheduler methods can overlap with HTTP-triggered manual sync operations. Local `synchronized` methods serialize calls only on one `AIUsersServiceImpl` instance/JVM.

Redis locks provide a cross-process mechanism for selected scheduler paths. Not every manual endpoint and sync method uses a distributed lock.

## Shared mutable state

| State | Synchronization | Scope / concern |
| --- | --- | --- |
| `QueryProcessorFactory` name map | built during construction, then read | effectively immutable after construction; duplicate names overwrite during build |
| `AbstractQueryProcessor.redisCacheService` | lazy null-check with no `volatile`/lock | singleton bean threads can initialize more than one client; final winning instance is shared |
| `AIUsersCache` nested maps | synchronized accessor/mutator methods | JVM-local cache; exact underlying map implementations in symbol reference |
| `AIUsersServiceImpl` sync methods | Java `synchronized` | serializes all callers of each instance, not cluster-wide |
| `GlobalAppCacheService.synchAppTenantSettingsToCH` | Java `synchronized` | JVM-local only |
| Redis locks/markers | distributed Redis operations | cluster coordination where used; not atomic with ClickHouse |
| browser React/store state | browser event loop and React updates | per-tab/page; asynchronous fetches can race unless component guards/cancellation apply |

## Database connections and blocking I/O

### ClickHouse

Multiple adapters create `DriverManagerDataSource` rather than a pooled managed data source:

- `ClickHouseClient` retains one data source/template;
- `ClickHouseDbUtil.namedJdbcTemplate()` creates a new wrapper per call;
- `AbstractQueryProcessor.namedJdbcTemplate()` does the same;
- domain services repeat the pattern.

`DriverManagerDataSource` obtains a new physical connection on each operation. **Potential performance concern:** connection setup and lack of bounded pooling can increase latency/load under concurrency. Measurement and driver/server settings are needed.

All JDBC and Neo4j client calls are blocking. They execute on servlet, scheduler, async, or dashboard-pool threads—not a reactive event loop.

### PostgreSQL

Spring Boot datasource/JPA dependencies can use the normal Boot-managed pool if configuration binds successfully. Pool sizing is not explicitly configured locally, so dependency defaults apply.

### Redis

Redisson config includes pool/timeouts/retry. Interaction caching can avoid repeated ClickHouse work for three minutes. Other common-library Redis clients are manually constructed. Supporting source resolves the set-pop path as iterate-then-`removeAll`, not an atomic claim.

## Query cost and data volume

Verified cost controls and gaps:

| Area | Control | Gap |
| --- | --- | --- |
| status events | default 50, maximum 100 | negative page/page size not clamped |
| tables/processors | pagination/limits in domain queries | no repository-global maximum |
| ClickHouse ops | warning at 10,000 rows | no SQL `LIMIT`; all rows materialized before warning |
| endpoint sync | default batch 300 | total volume and backpressure depend on source |
| app sync queue | default batch 50 and scheduler distributed lock | set selection/removal is non-atomic; failed items not requeued |
| interactions | Redis cache, whitelisted filters, pagination | cache stampede behavior not explicitly controlled |
| MDM download | none | full response buffered in memory |
| asset inventory | paged query and separate count | dynamic predicates and count can scan independently |

Many query processors build aggregation, `FINAL`, distinct, and multi-table ClickHouse queries. Without table engines, sort keys, row counts, and `EXPLAIN` output, N+1 or scan-cost conclusions cannot be proven.

The AI users dashboard intentionally fires three queries in parallel. Other dashboards issue multiple queries sequentially or per widget; generated service/processor bodies preserve the exact order.

## Caching

Interaction cache serialization uses generic Jackson JSON and string keys. Four caches have a three-minute TTL. The key generator includes subscriber, tenant, and request arguments, reducing cross-tenant collision.

Tenant/global app caches use one-day defaults in services, but the YAML environment variables are wired to `redis.*` while consumers read `cache.*`. **Verified effect:** setting only `CACHE_TENANT_APP_SETTINGS_TTL` or `CACHE_GLOBAL_APP_DETAILS_TTL` through the shown YAML does not alter the consumer property, which retains its `@Value` default.

**Potential performance concern:** no explicit stampede/single-flight mechanism is visible for cache misses. Concurrent misses can repeat ClickHouse work.

## Frontend performance behavior

- Next.js 16 App Router splits pages/layouts by route, but a large codebase (2,439 TS/JS modules and 408,862 parser-counted lines, including root tooling) can still create sizable chunks. No checked-in bundle report establishes actual bundle cost.
- `ANALYZE` can enable bundle analysis through `next.config.js`.
- SWR and immutable SWR hooks cache/deduplicate at the browser layer according to individual options.
- PostHog session replay initializes only on selected production-like Quilr domains and is paused/suppressed around OAuth.
- Images are served through Next image configuration for the allowed blob host; SVG/static imports are handled in webpack config.
- `/api/download-mdm-file` buffers the complete upstream file into an `ArrayBuffer`, so memory scales with file size.
- Module-scope Axios creation avoids rebuilding an instance per call but captures the base configuration at module evaluation time.
- Numerous large tables render pagination/filter components; virtualization use is component-specific and cannot be generalized.

## Backpressure and overload

- Dashboard executor: bounded queue + caller-runs backpressure.
- Servlet request pool: container defaults; no explicit Tomcat thread/connection limit configured.
- Redis/scheduler queues: batch processing but no durable depth metric or dead-letter behavior.
- HTTP outbound: browser-extension client has timeouts; generic `RestTemplate` has no visible timeout config.
- Next download route: no size limit, concurrency gate, or streaming pipe.
- ClickHouse ops: no statement timeout, row cap, or cancellation in local code.

## Metrics and observability

YAML intends to expose all management endpoints and enable metrics/Prometheus. Runtime dependency resolution proved Actuator is present and exposed mappings, health, environment, and metrics handlers. Whether a deployed scraper collects them remains unresolved.

ClickHouse utility/ops logs execution milliseconds. There are no local custom Micrometer counters/timers, queue-depth gauges, cache-hit metrics, or dashboard-executor saturation metrics found in the symbol index.

## Performance questions requiring measurement

1. Connection-creation cost and maximum concurrent ClickHouse sessions.
2. P95/P99 latency of multi-query dashboard calls and caller-runs saturation.
3. ClickHouse table sort-key fit for tenant/time/filter predicates.
4. Cache hit ratio and concurrent miss amplification.
5. Scheduler duration relative to one-minute cadence.
6. Browser route chunk sizes and hydration cost.
7. MDM file sizes and route memory concurrency.
8. Outbound-service timeout behavior for clients without explicit timeouts.

## Dynamic concurrency and smoke measurements

### Redis queue

A barrier-synchronized two-consumer test loaded 800 unique set members. Both calls returned all 800 before removal became exclusive. This proves duplicate delivery under concurrent direct consumption. The scheduler's distributed lock reduces normal scheduled overlap but does not make the underlying claim atomic.

### Lightweight HTTP probes

On one development machine:

| Target | Request | Requests/concurrency | Failures | Mean request | Longest |
| --- | --- | ---: | ---: | ---: | ---: |
| query-builder | internal `/qb/health` | 100/10 | 0 | 5.068 ms | 26 ms |
| web | `/en/login` | 100/10 | 0 | 11.765 ms | 16 ms |

These are cheap health/static-cache paths with substitute/missing data stores. They verify basic concurrent serving only and are not capacity, production-latency, database, or full-page hydration benchmarks.
