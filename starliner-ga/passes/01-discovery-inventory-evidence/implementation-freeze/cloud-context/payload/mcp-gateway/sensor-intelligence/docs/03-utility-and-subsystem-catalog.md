# Utility and subsystem catalog

## Current observe subsystem

| Subsystem | Exact path/symbols | Responsibility | State owned | External dependency | Failure behavior |
| --- | --- | --- | --- | --- | --- |
| Configuration parser | `starliner/config.py::ObserveConfig`, `_as_bool`, `_as_int`, `_as_float`, `_ingest_url`, `_ingest_bearer_token` | Parse, bound, and validate observe/delivery environment configuration | immutable config object | environment | malformed URL, embedded credentials, whitespace bearer, or non-loopback unauthenticated target raises; runtime factory converts general construction failure to disabled runtime |
| Identifier safety | `starliner/identity.py` | normalize source IDs, opacity-hash token-shaped values, pseudonymize email, derive stable IDs | none | stdlib hash/HMAC | empty identifiers use fallback; no exception handling around invalid hash-key type because config supplies string |
| Payload safety | `starliner/payload_safety.py` | reduce prediction objects to bounded labels and build safe delivery summaries | none | pinned contract `find_secret_like` | ignores non-dicts and invalid/secret-like labels |
| Mapper | `starliner/mapping.py::MCPObserveMapper` | create canonical bodies and delivery wrappers | immutable config reference | pinned contract models/builders | mapper/model exceptions propagate to runtime `_emit` caller and are caught by scheduled-task supervisor or handler/registry hook |
| Runtime supervisor | `starliner/runtime.py::MCPObserveRuntime` | lifecycle hooks, bounded async scheduling, enqueue, counters, manifest, local health/self-test | task set, counters, health cache | mapper, outbox, optional worker | fail-open; logs exception class, increments bounded counters |
| Disabled runtime | `DisabledObserveRuntime` | stable no-op interface when off/unavailable | config, reason, empty counters | none at method call time | closes unscheduled coroutine objects; returns explicit disabled manifest/self-test |
| Outbox repository | `db/starliner_outbox_repository.py::StarlinerOutboxRepository` | validate, migrate, enqueue, deduplicate, lease, retry, terminalize, aggregate | SQLite queue and terminal tables | `aiosqlite`, contract validator | transactional rollback; invalid record raises; full queue raises `OutboxFullError`; migration failure raises `OutboxMigrationError` |
| Outbox schema constants | `db/starliner_outbox_schema.py` | canonical local DDL and column/index lists | none | SQLite | used by gateway DB initialization and repository |
| HTTP transport | `starliner/delivery.py::HttpDeliveryTransport` | serialize/post batches and parse frozen result list | URL, bearer, timeout | stdlib HTTP | HTTP error converted to status-only response; malformed JSON/shape raises dedicated exception; other network errors propagate |
| Delivery worker | `StarlinerDeliveryWorker` | polling, batch claim, result handling, retry/backoff, shutdown release | background task, stop event, counters | outbox, transport | catches loop exceptions; retries all delivery failures; releases/retries claims on cancellation |
| Manifest builder | `starliner/manifest.py::build_sensor_manifest` | build contract-validated capability manifest | none | pinned `SensorManifest` | runtime catches builder failure and returns unavailable status/type |
| Self-test facade | `starliner/selftest.py::run_selftest` | invoke local runtime self-test | none | runtime | returns runtime result |
| Operational routes | `routes/starliner.py` | expose manifest, self-test, metrics/health | module-global runtime reference | FastAPI/auth dependency | missing runtime raises `RuntimeError`; manifest public; self-test/metrics require admin |
| Certification adapter | `services/starliner_mcp_certification.py` | run real mapper against two synthetic contract traces | recording outbox, last delivery records | pinned contract package/golden traces | raises for non-M1 trace; certification fails if trace count/assertions fail |

## Immediate capture-seam utilities

| Utility | Path | Observe relevance |
| --- | --- | --- |
| Registry safe-tool reducer | `services/registry.py::_safe_observe_tools` | passes only `{"name": <string>}` for valid tool names |
| Registry scheduler | `BackendRegistry._schedule_observe` | delegates to runtime bounded scheduler; closes coroutine and logs on missing/broken supervisor |
| Handler result reducer | `MCPHandler._observe_completed_tool_call` | converts `ToolCallResult` into the mapper’s safe metadata parameter set |
| Handler scheduler | `MCPHandler._schedule_observe` | delegates to runtime supervisor; closes coroutine on failure |
| Native DLP | `services/dlp_service.py` and handler call sites | produces input/output outcomes, predictions, and block flags consumed by mapper |
| Tool confirmation store | `services/tool_confirmation.py` | changes whether upstream is called; current mapper sees only final status/upstream flag, not a first-class confirmation event |
| Legacy policy adapter | `services/starliner_adapter.py` | independent pre-upstream control; observe mapper sees the resulting blocked ToolCallResult but not the external decision record |

## Process-local state

| State | Owner | Lifecycle | Concurrency |
| --- | --- | --- | --- |
| `MCPObserveRuntime._observe_tasks` | runtime instance | task added on schedule, removed callback, drained/cancelled at shutdown | event-loop task set; maximum from `STARLINER_MAX_PENDING_TASKS` |
| `ObserveMetrics._counts` | runtime and worker separately | process lifetime; no persistence | `Counter`; methods are synchronous and assumed same event loop |
| `_delivery_health_cache` | runtime | initialized zero; updated only when `delivery_health()` is called | process-local copy |
| `StarlinerDeliveryWorker._task` | worker | created at start, cleared at stop | one background task per runtime |
| `StarlinerDeliveryWorker._stopping` | worker | clear at start, set at stop | `asyncio.Event` |
| `routes.starliner._runtime` | route module | set during gateway module initialization | module-global singleton |

`Inference:` multiple gateway replicas would have independent scheduler queues,
counters, route caches, and delivery workers, although they might share or not
share the SQLite file depending on deployment. The deployment evidence needed
to establish that topology is unavailable.

## Utility-level privacy rules

- `safe_identifier` replaces characters outside `[A-Za-z0-9_.:-]` with `_`,
  uses a fallback for empty results, and truncates to 160 characters.
- Values beginning with known token prefixes, JWT-shaped values, and dense
  32+-character token-shaped values are replaced by a SHA-256-derived opaque ID.
- `pseudonymous_actor_id` HMACs `tenant_id + NUL + lowercased/trimmed email`
  with the deployment-provided actor hash key and retains 32 hex characters.
- `safe_labels` accepts only `id`, `name`, or `label` from mapping-like
  predictions, requires a 1–128-character safe-label regex, rejects
  secret-looking values, deduplicates, and sorts.
- `safe_summary` emits only `data_labels`, `risk_labels`, and an `error_class`
  limited to `upstream_error` or `native_dlp_block`.

## Known utility contradictions and risks

1. `Contradiction:` source-side `backend_entity_id` and `tool_entity_id` create
   canonical-looking entity IDs, while the target source-observation contract
   assigns canonical identity to central resolution.
2. `Potential issue:` `safe_identifier` preserves ordinary email-like strings
   after replacing `@` with `_`; callers must not use it as a general PII
   sanitizer. Current actor mapping correctly uses HMAC instead.
3. `Potential issue:` the delivery worker retries every non-2xx HTTP response,
   including permanently invalid client requests, until the bounded attempt
   limit.
4. `Potential issue:` duplicate idempotency scope with a different body hash is
   silently ignored by the local outbox. The first body wins; no conflict
   counter or error is emitted.
5. `Unresolved:` SQLite file sharing and lock behavior under the actual
   production replica topology.

