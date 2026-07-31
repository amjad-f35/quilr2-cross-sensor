# Error and recovery model

## Error classes and transports

| Layer | Error form | Conversion/consumer |
| --- | --- | --- |
| REST | `fastapi.HTTPException` | FastAPI JSON `{detail: …}` with handler-selected status |
| Pydantic | validation exception | FastAPI 422 before handler |
| MCP | JSON-RPC `error` object or transport status/challenge | direct/OneMCP handler and route shaping |
| OAuth | HTTP redirect/error page, HTTPException, `InvalidClientError`, `DCRRegistrationError`, `ValueError` | OAuth route/service branch |
| Database/config | `sqlite3`/`aiosqlite`, `ClickHouseNotConfigured`, `ClickHouseSettingsMissing` | fatal, caught best-effort, or HTTP conversion by caller |
| Starliner | `OutboxFullError`, `OutboxMigrationError`, `MalformedDeliveryResponse`, config `ValueError` | drop/retry/terminal metrics or optional-start warning |
| Workflow | `WorkflowQuotaExceeded`, `RunCancelled`, HTTP errors, repository `ValueError` | route status conversion or terminal run/chat state |
| Audit rollback | `AuditRollbackError` | 400 conversion |
| CLI | `SystemExit`, integer return, uncaught exception | shell exit status |

Exact `raise`, `except`, and error-return sites are indexed under each symbol's failure behavior.

## HTTP status semantics

Common checked-in uses:

- 400: malformed business input, missing tenant/subscriber context, invalid OAuth state/code/request, wrong agent mode;
- 401: missing/invalid credentials or OAuth challenge;
- 403: authenticated role/tenant/ownership mismatch;
- 404: missing backend/memory/workflow/artifact/catalog/resource;
- 409: duplicate/conflict or state transition conflict;
- 410: deleted/expired runner resources in workflow proxy paths;
- 422: Pydantic request validation;
- 429: workflow quota/limit conversion where selected by service mapping;
- 500: unconfigured injected service or internal failure;
- 502: upstream OAuth/runner/backend failure conversion;
- 503: runner URL/service unavailable.

`Unresolved:` not every unexpected exception is wrapped; FastAPI's default 500 behavior applies when it propagates.

## Startup and shutdown matrix

| Operation | Failure handling | Outcome |
| --- | --- | --- |
| Import-time core/log/event DB init | uncaught | application import/start fails |
| `registry.load()` | uncaught in lifespan | startup fails |
| default cleanup, catalog seed, slug/tenant backfill | caught and logged | startup continues with possibly stale/incomplete data |
| expired OAuth state cleanup | caught and logged | startup continues; stale state remains |
| initial smart-group sync | 15-second `wait_for`, caught warning | startup continues with snapshot/no groups |
| smart-group background task creation | not independently guarded after warm-up | task runs until shutdown |
| Starliner `start()` | caught warning | gateway continues without observe delivery |
| Starliner `stop()` | caught warning | remaining delivery may be incomplete |
| smart-group task cancellation | cancellation/exception suppressed | shutdown continues |
| log-worker drain/DB closes | awaited; later errors not globally caught | shutdown may propagate after earlier cleanup |

## Upstream/network failures

- OAuth discovery tries ordered strategies and candidate URLs. Network and invalid metadata errors can fall through to later strategies; final failure becomes a probe/HTTP/OAuth error.
- Token exchange recognizes invalid-client cases and can self-heal/re-register in selected flows. Refresh uses per-process locks to avoid duplicate local refresh.
- OneMCP read-only resource/prompt operations can terminate a bad upstream session and retry once. The code deliberately does not apply the same retry indiscriminately to side-effecting tool calls.
- DLP/ZIA/embedding/LLM/runner clients use explicit timeouts at their call sites. Failure-open versus failure-closed is setting/feature-specific.
- Background Axis logging uses a five-second synchronous request inside a worker task, keeping it off the immediate response path.

## Queue, retry, and terminal behavior

| Mechanism | On failure | Recovery |
| --- | --- | --- |
| Tool/Axis log queues | `enqueue` catches `QueueFull`, increments drop count, returns false | no replay; response path continues |
| OneMCP request notification queue | full notification is dropped/logged | later notifications may proceed |
| OneMCP client notification queue | drops oldest then admits newer message | partial loss, session remains |
| Starliner outbox | bounded capacity can raise `OutboxFullError`; delivery claims rows | exponential capped retry; terminal-delivery records for permanent/exhausted results |
| Workflow run worker | loop logs exception and sleeps error backoff | lease/attempt logic can requeue until max attempts |
| Workflow scheduler | per-dispatch errors recorded as schedule events/status | polling continues; claims expire/release |
| Retention worker | logs and backs off | retries later |
| ClickHouse continuous sync | loop sleeps/retries according to mode/options | SQLite remains source; partial destination progress possible |

## Transactions and partial failures

Repositories normally execute SQL then commit on the shared connection. Multi-statement OAuth state writes and schedule/run claims use dedicated connections/explicit transaction patterns to reduce interleaving. Artifact creation spans filesystem write and database metadata and therefore is not one atomic storage transaction.

`Potential issue:` no distributed transaction covers remote tool/OAuth calls and local logs/state. A remote side effect can succeed before a local timeout/crash, so retrying a non-idempotent action can duplicate effects. The code avoids a general automatic tool-call retry, but callers can retry.

`Potential issue:` schema migrations are imperative and some are additive/rebuild operations. A process crash during a nontransactional migration or disk-full condition requires manual recovery; no migration-version/rollback framework is present.

## Data corruption/invalid persisted values

- JSON columns are generally parsed with fallback to `{}`/`[]` or surfaced errors, depending repository.
- Static-secret decryption failure logs a warning and returns no secret.
- Runner initialization rewrites malformed/non-object start payloads to `{}` and scrubs keys.
- Artifact schema is inspected and rebuilt when required constraints/columns are absent.
- Starliner outbox validates records and raises on invalid migration/delivery data.

## Error observability

Python logging records startup, auth, OAuth, transport, policy, retry, and queue failures. Tool/event/rejected-request databases supply structured diagnostics. Rust uses `tracing` and `TraceLayer`. There is no OpenTelemetry setup in scope. Starliner maintains internal metrics exposed by a route when configured.

Some errors are intentionally suppressed to preserve availability (startup maintenance, optional Starliner, log queue drops). Their recovery depends on logs/metrics; no alert routing is configured in scope.

## Error-handling matrix

| Failure | Handled | Logged | Retried | Fatal |
| --- | --- | --- | --- | --- |
| Invalid REST body | yes, framework | framework | no | no |
| Invalid auth/role | yes | selected warnings | no | no |
| Missing backend/resource | yes | backend 404 special logger plus route logs | no | no |
| SQLite initialization | no top-level recovery | underlying/log | no | yes at startup |
| SQLite busy during request | repository-dependent | generally exception logs | limited/no generic retry | request/process-dependent |
| Remote OAuth discovery | yes, strategy loop | yes | alternative candidates/strategies | no |
| Remote tool timeout | handler error response | yes/log DB best effort | no general side-effect retry | no |
| Read-only OneMCP stale session | yes | yes | once | no |
| DLP unavailable | feature/settings-specific | yes | no central breaker | no/response-dependent |
| Log queue full | yes | yes/count | no | no; log lost |
| Starliner delivery | yes | metrics/log | exponential bounded | optional subsystem only |
| Workflow execution | yes | step/run error | attempt/lease policy | run may become terminal failed |
| Scheduler dispatch | yes | schedule event/log | next loop/lease | no |
| Shutdown drain timeout | worker handles timeout | yes | no | shutdown continues/partial |
