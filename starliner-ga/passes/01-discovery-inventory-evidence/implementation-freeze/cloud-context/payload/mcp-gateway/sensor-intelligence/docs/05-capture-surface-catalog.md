# Capture-surface catalog

## Capture CS-001 — successful backend registration

**Capture point:** `mcpgateway/services/registry.py:947`,
`BackendRegistry._observe_backend_registration`

**Evidence:** `Verified in source`; hook behavior is `Verified by test` in
`mcpgateway/test_starliner_registry_hooks.py`.

**Trigger:** the backend registration path has saved capabilities/raw
capabilities, updated the in-memory backend cache and slug index, and logged
registration.

**Inputs exposed to observe runtime:**

| Input | Origin | Transformation before mapper |
| --- | --- | --- |
| `tenant_id` | `BackendInfo.tenant_id` | unchanged; runtime substitutes `"unknown"` if missing |
| `backend_id` | `BackendInfo.id` | mapper applies `safe_identifier` |
| `backend_name` | `BackendInfo.name` | passed to runtime, then explicitly discarded |
| `transport_type` | `BackendInfo.transport_type` | mapper applies `safe_identifier` if present |
| `tools` | fetched capabilities | `_safe_observe_tools` keeps only valid string `name` |

**Outputs:** one backend `SourceObservation`, plus one tool
`SourceObservation` for each valid tool name. Each canonical body is wrapped in
a delivery record and asynchronously enqueued.

**Timing and transaction relation:** post-persistence and post-cache update;
outside the registration transaction. Observation failure cannot roll back the
backend registration.

**Not captured:** backend URL/transport address, description, headers, auth
tokens, OAuth credentials, backend display name, tool description, input schema,
annotations, resources, prompts, deletion lifecycle.

## Capture CS-002 — tool-capability overwrite

**Capture point:** `BackendRegistry.update_capabilities_tools` after
`save_capabilities` and optional `save_raw_capabilities`.

**Trigger:** a successful fresh `tools/list` update through the registry
callback.

**Inputs:** backend ID and processed `tools` list. Tenant is looked up from
`registry.backends[backend_id]`; absent backend/tenant becomes `"unknown"` in
runtime.

**Outputs:** one wrapped tool `SourceObservation` per valid name.

**Not captured:** previous tool set, removed tools, list completeness, cursor,
fetch error details, source schema, description, enablement/settings, ownership.

## Capture CS-003 — full capability refresh

**Capture point:** `BackendRegistry.refresh_all_capabilities` after saving tools,
resources, resource templates, prompts, raw capabilities, and optional
initialize capabilities.

**Trigger:** successful full refresh.

**Inputs and outputs:** same reduced tool-name surface as CS-002.

**Coverage limitation:** resources, resource templates, prompts, protocol
version, initialize capabilities, counts, and fetch-error recovery are not
mapped even though they are available at this point.

## Capture CS-004 — completed Direct MCP `tools/call`

**Capture point:** `mcpgateway/services/mcp_handler.py:188-219`,
`MCPHandler.handle_request`.

**Trigger:** `_handle_tools_call` returns a `ToolCallResult` normally.

**Correlation timing:** immediately before dispatch, the handler records
`time.perf_counter()` and generates `uuid.uuid4().hex` as
`observation_id`. After result construction, it computes integer elapsed
milliseconds and schedules observation.

**Inputs exposed to mapper:**

| Mapper input | Immediate origin | Meaning |
| --- | --- | --- |
| `tenant_id` | route-resolved tenant | tenant scope; runtime fallback is `"unknown"` |
| `observation_id` | gateway UUID hex | unique per handler dispatch; preferred correlation source |
| `request_id` | JSON-RPC request ID | fallback correlation source and input to legacy control |
| `backend_id` | direct endpoint binding | target backend |
| `tool_name` | `ToolCallResult.tool_name`, fallback `"unknown"` | attempted tool |
| `user_email` | authenticated request context | mapper HMAC input; raw value not retained |
| `input_predictions` | `ToolCallResult.dlp_input_predictions` | reduced to safe labels |
| `input_dlp_outcome` | native DLP result | safe-summary risk label unless `allowed`/`safe` |
| `output_predictions` | native output DLP | reduced to safe labels |
| `output_dlp_outcome` | native DLP result | safe-summary risk label unless `allowed`/`safe` |
| `input_blocked` | native DLP flag | action status/signal reason |
| `output_blocked` | native DLP flag | action status/signal reason |
| `upstream_called` | `ToolCallResult.upstream_called` coerced to bool | boundary and execution evidence |
| `latency_ms` | wall duration of complete handler branch | handler processing latency, not pure upstream latency |
| `response_is_error` | JSON-RPC top-level `error` or result `isError` | action status/error summary |

**Normal branches that reach capture:**

- disabled tool;
- confirmation required/denied/not found/invalid;
- native input DLP block;
- legacy Starliner enforce deny;
- upstream success or error-shaped tool result;
- native output or structured-output DLP block;
- token-saving transformed response.

`Potential issue:` an exception raised inside `_handle_tools_call` and converted
by the outer `except McpError` or `except Exception` returns a `ToolCallResult`
after the scheduling statement has been bypassed. That converted failure is not
observed.

**Not exposed to mapper:** raw arguments, processed arguments, raw/processed
content, structured content, transport headers, OAuth/API tokens, DLP entity
values, ZIA blocked URLs, confirmation ID/status, token-saving metadata, failure
diagnostics, upstream HTTP status, progress messages, policy decision ID/reason.

## Capture CS-005 — legacy pre-tool policy seam

**Capture point:** `MCPHandler._handle_tools_call` calls
`evaluate_starliner_mcp_pre_tool` after input DLP and ZIA input processing, but
before the upstream call.

**Status:** separate compatibility/control surface, not part of the observe
runtime.

**Inputs accepted locally:** tenant, JSON-RPC request ID, backend ID, tool name,
user email, arguments, safe DLP predictions/outcome, optional app ID.

**Transformations:** `arguments` is immediately deleted. Prediction objects are
reduced to safe labels and `dlp.<label>` signals. A non-safe input outcome adds
`dlp.input_<outcome>`.

**External request construction:** the private SDK builder receives backend,
tool, optional app, no agent, raw user email as `human_user_id`, labels, and
signals. The exact final request schema and transport behavior are
`Unresolved` because the matching private SDK version is not present.

**Output:** local `StarlinerMCPPreToolResult`; enforce-mode deny returns JSON-RPC
error code `-32003`, shadow mode proceeds. Optional external
decision-applied event emission is SDK-defined.

## Extraction ES-001 — manifest

**Endpoint:** unauthenticated `GET /starliner/manifest`

**Source:** runtime manifest, safe config projection, process counters, cached
delivery health; the route refreshes delivery health for the response.

**Side effects:** repository queries for delivery health; no evidence emission.

**Failure:** unset module-global runtime raises `RuntimeError`. Manifest builder
exceptions are converted to `{manifest_status:"unavailable",
manifest_error:<exception class>}`.

## Extraction ES-002 — self-test

**Endpoint:** admin-authenticated `POST /starliner/selftest`

**Source:** synthetic one-call mapper output and pinned
`validate_delivery_record`.

**Side effects:** no outbox and no network. CPU/memory only.

## Extraction ES-003 — local operational metrics

**Endpoint:** admin-authenticated `GET /starliner/metrics`

**Source:** process counters, outbox status counts, delivery health aggregates.

**Side effects:** SQLite reads; health cache update.

## Transmission TS-001 — HTTP ingest

**Destination:** exact configured `STARLINER_INGEST_URL`; the code does not append
a path.

**Method/body:** `POST`, `application/json`,
`{"api_version":"v1","records":[<delivery records>]}`.

**Authentication:** `Authorization: Bearer <token>` when configured. An
unauthenticated destination is ready only with
`STARLINER_ALLOW_UNAUTHENTICATED_INGEST=true`, and configuration parsing permits
that only for `localhost`, `127.0.0.1`, or `::1`.

**Expected response:** JSON object containing a list-valued `results`; each item
must be an object. Per-record statuses recognized are `accepted`, `duplicate`,
and `rejected`. All others are retried.

## Uninstrumented functional surfaces

| Surface | Current behavior | Observe status |
| --- | --- | --- |
| Direct `initialize`, `ping`, `tools/list` client request | functional | no action-event mapping |
| Direct resource list/template/read/subscribe/unsubscribe | functional | no mapping |
| Direct prompt list/get | functional | no mapping |
| Direct completion and logging-level operations | functional | no mapping |
| MCP progress/event messages | functional support | no mapping |
| OneMCP-native memory and confirmation tools | functional | deferred in certification |
| Workflow runs/tasks/artifacts | functional separate subsystem | no Starliner mapper |
| Admin/API configuration changes | functional | no Starliner mapper |
| Backend/tool deletion or disable lifecycle | functional | no tombstone/lifecycle emission |
| DLP/ZIA decisions beyond final labels/outcome | functional | no detailed evidence record |

