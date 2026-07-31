# Capability and feature catalog

This is the live second-pass catalog. Entries are admitted from source behavior,
not from product names. The full gateway feature set will be added
subsystem-by-subsystem; this revision closes the current Starliner-related
surface and its immediate capture seams.

## Status vocabulary

- `Implemented`: executable code path exists.
- `Partially implemented`: code exists but important lifecycle/platform
  behavior is absent.
- `Configured but inactive`: implementation exists but current defaults or
  missing required configuration disable it.
- `Dependency-gated`: implementation requires an optional/private dependency.
- `Deferred`: explicitly declared outside the current milestone.
- `Unresolved`: available evidence does not establish behavior.

## Feature catalog

| Feature ID | Feature | Primary path/symbol | Trigger | Native inputs | Native outputs/state | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CAP-OBS-001 | Observe runtime construction | `starliner/runtime.py::create_observe_runtime` | module initialization in `gateway.py` | `STARLINER_*`, `db.connection.DB_PATH` | `DisabledObserveRuntime` or `MCPObserveRuntime` | Implemented; dependency-gated | `Verified in source`, `Verified by test` |
| CAP-OBS-002 | Runtime start/stop | `MCPObserveRuntime.start`, `.stop`; `gateway.py::lifespan` | FastAPI lifespan | delivery worker, pending observe tasks | worker task start; bounded drain/cancel | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-003 | Backend discovery observation | `BackendRegistry._observe_backend_registration` → `MCPObserveRuntime.observe_backend_discovered` | successful backend registration after persistence/cache update | tenant ID, backend ID/name, transport type | one wrapped `SourceObservation`; name discarded | Implemented for registration | `Verified in source`, `Verified by test` |
| CAP-OBS-004 | Tool discovery observation | registry hooks → `observe_tools_discovered` | registration, tools overwrite, full capability refresh | tenant, backend ID, tool list | one wrapped `SourceObservation` per valid tool name | Implemented for listed hooks | `Verified in source`, `Verified by test` |
| CAP-OBS-005 | Direct tool-call observation | `MCPHandler.handle_request` → `_observe_completed_tool_call` → runtime mapper | completed Direct `tools/call` branch | IDs, optional email, DLP labels/outcomes, block flags, upstream flag, latency, response error class | source observation, action event, count metric, optional latency metric, optional block signal | Partially implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-006 | Safe label extraction | `starliner/payload_safety.py::safe_labels` | mapping/certification/legacy label preparation | prediction objects | sorted distinct label strings | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-007 | Pseudonymous actor identity | `starliner/identity.py::pseudonymous_actor_id` | tool-call mapping with email | tenant, normalized email, hash key | `actor:<32 hex>` or null | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-008 | Token-shaped identifier opacity | `safe_identifier`, `_looks_sensitive_identifier` | backend/tool/transport identifiers | arbitrary object | normalized bounded identifier or `opaque:<32 hex>` | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-009 | Delivery-wrapper construction | `MCPObserveMapper._wrap` → external `build_delivery_record` | every mapped canonical record | canonical body, config, time, summary, idempotency | `{envelope, body}` with hashes | Implemented; dependency-gated | `Verified in source`, contract pin inspected |
| CAP-OBS-010 | Validated durable outbox enqueue | `StarlinerOutboxRepository.enqueue_many` | runtime emission | delivery records | transactional pending rows; duplicate suppression | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-011 | Outbox schema migration | repository `_ensure_schema`, `_migrate_legacy_schema`, `_migrate_retained_terminal_rows` | first DB operation against old schema | legacy rows | current queue + metadata-only terminal rows | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-012 | Batch claim and lease recovery | `claim_due`, `release_claims` | delivery polling | due pending/retry rows | in-flight lease or retry release | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-013 | HTTP batch delivery | `HttpDeliveryTransport.post_records` | delivery worker with ready config | wrapper records, ingest URL, optional bearer | parsed per-record results | Implemented; configured but inactive by default | `Verified in source`, `Verified by test` with fake transport |
| CAP-OBS-014 | Retry/backoff | `StarlinerDeliveryWorker._retry_one` | network, malformed response, HTTP failure, unknown per-record result | attempt count, retry config | retry timestamp or terminal failure | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-015 | Terminal delivery metadata | repository `mark_accepted`, `mark_rejected`, `mark_retry(...terminal=True)` | terminal ingest result or exhausted retry | active row | payload deletion; terminal metadata row | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-016 | Operational manifest | `routes/starliner.py::starliner_manifest`; runtime `.manifest` | `GET /starliner/manifest` | runtime/config/local health | non-secret capability/config/metric/health object | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-017 | Offline mapping self-test | route → `run_selftest` → runtime `.selftest` | authenticated admin POST | synthetic metadata only | validation check results; no outbox/network | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-018 | Operational metrics/health endpoint | `routes/starliner.py::starliner_metrics` | authenticated admin GET | runtime counters, repository aggregates | metrics/outbox/delivery JSON | Implemented | `Verified in source`, `Verified by test` |
| CAP-OBS-019 | Product-local certification | `services/starliner_mcp_certification.py` | direct module/test invocation | two pinned golden traces | contract test result and certification record | Implemented for M1 trace pair | `Verified in source`, `Verified by test` when optional contract package is available |
| CAP-CTL-001 | Legacy pre-tool shadow policy | `evaluate_starliner_mcp_pre_tool` | Direct `tools/call`, mode `shadow` | safe labels/signals plus IDs and raw user email | external evaluation; proceed regardless of deny | Implemented; dependency-gated | `Verified in source`, `Verified by test` with fakes |
| CAP-CTL-002 | Legacy pre-tool enforce policy | same | Direct `tools/call`, mode `enforce` | same | possible JSON-RPC `-32003` before upstream | Implemented; dependency-gated | `Verified in source`, `Verified by test` with fakes |
| CAP-CTL-003 | Legacy decision-applied event | external SDK `build_action_event`/`runtime.emit` | config `emits_events` | request/evaluation evidence | external event emission | Partially implemented locally; external semantics unresolved | `Verified in source`; private ABI unresolved |
| CAP-GAP-001 | OneMCP native memory-tool observation | no current hook | OneMCP native call | — | — | Deferred | certification record and source search |
| CAP-GAP-002 | Resource-read observation | no current mapper/hook | `resources/read` | — | — | Deferred | certification record and source search |
| CAP-GAP-003 | Prompt-get observation | no current mapper/hook | `prompts/get` | — | — | Deferred | certification record and source search |
| CAP-GAP-004 | Entity snapshot emission | manifest only | — | — | — | Deferred | `starliner/manifest.py` |
| CAP-GAP-005 | Relationship event emission | manifest only | — | — | — | Deferred | `starliner/manifest.py` |
| CAP-GAP-006 | Decision-result emission in observe runtime | manifest only | — | — | — | Deferred | `starliner/manifest.py` |
| CAP-GAP-007 | Trace-span emission | manifest only | — | — | — | Deferred | `starliner/manifest.py` |
| CAP-GAP-008 | Sensor-health event emission | manifest only | — | — | health available only through local route JSON | Deferred | `starliner/manifest.py`, runtime routes |
| CAP-GAP-009 | Production-ingest certification | not exercised | live delivery | — | — | Deferred | certification record |

## Direct `tools/call` coverage limitations

`Verified in source:` the observe scheduling call occurs only after
`_handle_tools_call()` returns normally inside the `MCPMethod.TOOLS_CALL`
branch. Normal early returns—disabled tool, pending confirmation, native input
DLP block, legacy policy deny, upstream success, output DLP block, and ordinary
error-shaped results—produce a `ToolCallResult` and reach the hook.

`Potential issue:` if `_handle_tools_call()` raises and the outer
`handle_request()` exception handlers convert the exception into a
`ToolCallResult`, control does not return to the scheduling statement. Those
converted exceptions are therefore absent from the observe stream.

`Verified in source:` `MCPHandler._observe_completed_tool_call` infers
`response_is_error` from a top-level JSON-RPC `error` or result `isError`. It
does not receive the `ToolCallResult.metadata.failure` object.

## Discovery lifecycle limitations

- Backend discovery occurs after registration persistence and cache update.
- Tool discovery occurs after registration, `update_capabilities_tools`, and
  `refresh_all_capabilities`.
- Backend display name is passed to the runtime then deliberately discarded.
- Only tool `name` is forwarded by `_safe_observe_tools`; descriptions and
  input schemas are excluded.
- No deletion, disable, ownership-change, or stale-tool removal emission was
  found.
- Registry `load()` does not emit observations for existing persisted
  backends.

## Certification boundary

`Verified in source:` `CanonicalMcpObserveAdapter` executes the real mapper and
runtime with a recording outbox for two trace IDs:
`mcp.observe_tool_call.v1` and `mcp.observe_tool_blocked.v1`. It validates
delivery wrappers, canonical records, backend/tool context, and absence of the
raw fixture email and `sensitive_entities`.

`Unresolved:` default pytest discovery excludes these top-level certification
tests, and the optional package is absent from the default environment. A
passing-looking test file is therefore not evidence that CI currently executes
the certification pack.

