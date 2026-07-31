# Error and recovery model

## Error representation

The repositories do not use one uniform error contract.

| Mechanism | Where used | Observable result |
| --- | --- | --- |
| thrown runtime/checked exception | Spring bootstrap, factory lookup, JDBC/services, frontend JSON/cookie parsing | Spring/Next/framework response or process failure unless caught |
| `ServiceResponse<T>` extra information | many backend controllers/processors | logical `status`, `error`, `SIZE`, warning, or metadata may be returned inside an otherwise successful HTTP response |
| `ResponseEntity` | selected controllers | explicit HTTP status/body |
| partial-result DTO/map | bulk status resolution and batch work | per-item success/failure without rollback |
| swallowed/logged exception | cache initialization, schedulers, JSON mapping, selected services | request/job may continue with missing data |
| Axios rejection / returned `AxiosError` | frontend API service | normal rejection for most errors; refresh helper can resolve an error object |
| Next JSON 500 | download route | fixed `{ "error": "Failed to download file" }` |

No complete local `@ControllerAdvice` was found. `server.error.include-*` suppresses exception, stack, message, and binding details for standard Spring errors, but private dependencies could register additional advice.

## Error-handling matrix

| Failure | Detection | Handling | Retry / rollback / cleanup | Result |
| --- | --- | --- | --- | --- |
| missing CORS origins | `SecurityConfig` constructor | throws `IllegalStateException` | none | fatal application startup |
| invalid master key | key bootstrap/first encryption use | startup warning described by code; illegal state on use | none | masking call fails; comment/default contradiction noted |
| missing data-store credentials/host | bean creation or first lazy use | connection/JDBC exception | generally propagated or caught by domain | startup may succeed due lazy initialization and fail on first request |
| unknown query processor name | `QueryProcessorFactory` map lookup | throws | none | request failure through framework |
| duplicate processor name | registry `HashMap.put` | no detection | later bean overwrites earlier | nondeterministic/ordering-dependent selection risk |
| ClickHouse query failure | `ClickHouseDbUtil`/processor catch | logs SQL/error; ops endpoint puts raw message in response | no retry | logical failure response or propagated exception |
| ClickHouse oversized result | result list size after fetch | adds warning | no truncation or cancellation | full materialized result can still be returned |
| invalid ClickHouse ops code | exact comparison | warning log + logical unauthorized/error data | no HTTP status change visible in processor | request completes with error-bearing wrapper |
| invalid ad-hoc SQL | string guards or JDBC | logical error / raw JDBC error | none | no database rollback abstraction locally |
| PostgreSQL failure | Spring Data/JPA | framework exception | transaction behavior is Spring repository default; no explicit domain transaction | request fails |
| Redis unavailable | Redisson/private cache client | varies by caller; scheduler lock cannot be acquired/work can fail | no circuit breaker; some work skipped | missing cache, skipped job, or propagated failure |
| scheduler lock denied | `RedisLockService` | return null/false and log/skip | next scheduled invocation | current run omitted |
| sync item fails after queue pop | worker catch | error logged | no local requeue/dead-letter | item can be lost |
| app-admin row failure | per-row catch | continues loop | marker still set, no TTL | incomplete data can be treated as processed |
| master bootstrap async failure | work begins after CAS marker | error/logging path | marker is not reset/retried | later startup can skip failed work |
| findings graph data null | initializer dereference/catch | catches broad exception | no later stage repair | remaining population can be skipped |
| status bulk item fails | per-item processing | records failed item and continues | no cross-table rollback | partial master/drilldown updates |
| conversation filter update fails | broad catch | service returns `true` in inspected path | no correction | caller can observe success despite failure |
| conversation `masked_attributes` null | dereference/processing | exception | no null fallback in flow | unmask request fails |
| individual inline decrypt fails | token-level catch | original encrypted token retained | continues other fields | partially decrypted output |
| attribute decrypt fails | service exception | propagated | none | whole operation fails |
| malformed asset JSON | `putJson` catch | field omitted | row continues | silent partial representation |
| browser-extension HTTP timeout | configured connect/read timeout | client exception, service catch varies | no generic retry | whitelist integration can partially fail |
| generic `RestTemplate` network stall | platform/network exception | domain catch varies | many clients lack explicit timeout/circuit breaker | request thread may be occupied |
| malformed auth cookie | `JSON.parse` in proxy | no catch | none | proxy request can fail rather than redirect cleanly |
| missing server auth cookie | direct `.value` read | throws | none | server-side API call fails |
| API 401 | Axios response interceptor | refresh then replay | `_retry` is checked but never set | repeated refresh/retry is possible |
| refresh non-406 Axios failure | catch returns error object | resolves helper result | none | caller can receive an error as a fulfilled value |
| API 403 role mismatch | validation call | deletes selected cookies and redirects | pending promise prevents continued UI work | forced login |
| API 406 | Axios interceptor | deletes selected cookies and reloads | permissions session storage not equivalently cleared | forced reload with possible stale tab state |
| remote MDM download non-2xx/fetch error | route `response.ok`/catch | fixed JSON 500 | no retry | no upstream detail exposed |
| unbounded MDM download body | no guard | whole `arrayBuffer()` | none | memory pressure/failure handled only by outer catch if thrown |
| React render error | global/page error boundaries | error UI/reset behavior by boundary | navigation/retry UI varies | component subtree recovery |

## Startup sequence and failure

1. `QBApp.main` starts Spring and scans both `com.quilr` and `ai.quilr`.
2. Configuration properties bind. Missing `CORS_ALLOWED_ORIGINS` is deliberately fatal.
3. Security chain requires an injectable external `Decoder`; a missing/incompatible private dependency is fatal.
4. Lazy initialization defers many data-store/service construction failures.
5. `ApplicationRunner`/`@PostConstruct` hooks initialize findings/cache/processors. Broad catches make some failures nonfatal.
6. `ApplicationReadyEvent` listener logs readiness; no health-state transition is implemented there.

The application can therefore be “started” while an unused/lazy database path is broken. Actual readiness must be proven by endpoint/data-store checks; no Kubernetes readiness probe is checked in.

Dynamic startup confirmed the split:

- unavailable Redis/decoder initialization prevented a usable start;
- available Redis plus unavailable configured PostgreSQL failed JPA bootstrap;
- Redis plus an H2 relational substitute allowed HTTP readiness while ClickHouse and Neo4j were unavailable;
- `/actuator/health` then returned 503/DOWN while `/qb/health` returned `RUNNING` through the enabled internal-header path;
- failed ClickHouse client creation left later async/scheduled paths producing repeated null/client errors.

The Axis chart's TCP probe would consider the last state ready/alive because port 8052 is listening.

## HTTP and validation failure

Typed DTOs with `@Valid` use Spring Bean Validation. Many controllers instead accept maps, so:

- missing keys often fail later through casts, null checks, or SQL construction;
- type mismatch can produce `ClassCastException`;
- unknown map keys can be ignored or interpreted as field identifiers;
- status-event summary and drilldown do not have identical validation strength.

`server.error.include-*` reduces standard error leakage. The ClickHouse operations controller/processor deliberately returns raw database exception messages and the submitted mutation query in its wrapper, bypassing that standard error-body suppression.

## Data-store partial failure

There is no application-level distributed transaction across ClickHouse, Redis, Neo4j, PostgreSQL, and external HTTP services.

Examples:

- whitelist workflows may check/create state across graph, ClickHouse, browser-extension service, and JPA; some intended writes are TODO-only;
- endpoint sync reads graph batches and writes warehouse rows;
- status resolution writes two ClickHouse record families;
- cache sync moves queue/marker state separately from ClickHouse writes.

Recovery is mostly “run the endpoint/scheduler again.” Supporting ClickHouse migrations resolve source-controlled DDL for many tables, but idempotency still depends on the selected deployed migration profile/version and the exact mutation path.

## Retry, backoff, circuit breaking, and dead letters

- No Resilience4j/Spring Retry/circuit-breaker policy is locally configured.
- Redisson has connection/retry settings, but that is client transport behavior rather than domain-job retry.
- Browser Axios implements one conceptual token refresh/replay, with the missing `_retry` assignment noted above.
- Schedulers naturally run again at the next interval but do not maintain a durable retry/dead-letter ledger.
- Queue items popped before processing have no local dead-letter or requeue path.
- The inspected reusable CI workflow does not add a target application retry/recovery path; the exact target application build jobs were skipped.

## Shutdown

`QBAppListener` observes context closure and logs. No explicit drain/close orchestration is implemented there.

The dashboard executor bean:

- waits up to 30 seconds on shutdown;
- uses the configured thread-pool executor's Spring lifecycle;
- can still have incomplete tasks if the timeout expires.

Database drivers, Redisson, and Spring-managed resources rely on framework lifecycle hooks. Imperatively created `RedisCacheServiceImpl` and repeated `DriverManagerDataSource` objects have no explicit local close sequence.

Observed SIGINT shutdown logged `QBAppListener`, closed all tracked Kafka producers, and invoked ClickHouse-client cleanup. Next exited on SIGINT without an application-specific cleanup hook.

Frontend Next.js has no application-specific shutdown handler; container termination follows Node/Next behavior.

## Logging and suppression

Backend logging uses JSON-like patterns, root level `error`, and `com.quilr` level `info`. `RequestFilter` clears MDC in `finally`, preventing request context from leaking across reused threads.

Potentially sensitive error outputs:

- `ClickHouseDbUtil` logs SQL and parameter maps on errors;
- ops processor logs caller tenant/subscriber and exception stack, returns error message/query;
- sync jobs log record identifiers and per-item failures;
- frontend role-validation errors can be encoded into login query parameters.

Several code paths catch broad `Exception`; they keep the process/job alive but can suppress a strongly typed failure signal. Specific examples are recorded in the generated symbol entries rather than being generalized to every service.

## Recovery gaps

- Target web dev/preprod manifests have no probes; supporting Axis has query-builder TCP probes and commented web probes. TCP does not represent data-store readiness.
- No queue dead-letter or durable job state.
- No cross-store transaction/compensation framework.
- No reset of master bootstrap state on async failure.
- No expiration of the app-admin processed marker.
- No standardized frontend API error type.
- External analysis tests now cover startup dependency failure, malformed cookie/JSON, selected endpoint store outage, queue duplication, and shutdown. These are not checked into the targets, and retry/partial-write/bootstrap-repair coverage remains absent.
