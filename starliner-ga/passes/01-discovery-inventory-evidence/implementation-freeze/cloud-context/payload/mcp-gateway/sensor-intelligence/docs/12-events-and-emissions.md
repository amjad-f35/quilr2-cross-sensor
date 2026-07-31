# Events and emissions

## Starliner canonical event catalog

| Event/record | Trigger | Destination | Durability | Delivery | Current status |
| --- | --- | --- | --- | --- | --- |
| backend `SourceObservation` | successful registration | SQLite outbox → optional ingest | durable pending/retry; metadata-only terminal | at-least-once | `Implemented` |
| tool `SourceObservation` | discovery/refresh/call | same | same | same | `Implemented` |
| `ActionEvent` | completed normal Direct tool-call branch | same | same | same | `Implemented` |
| call-count `MetricEvent` | same | same | same | same | `Implemented` |
| latency `MetricEvent` | same with latency | same | same | same | `Implemented` |
| `FindingSignal` | native input/output DLP block | same | same | same | `Implemented` |
| `RelationshipEvent` | none | — | — | — | `Disabled`/deferred |
| `SensorHealthEvent` | none | — | route-only health exists | — | `Disabled`/deferred |
| `DecisionResult` | none in observe path | — | — | — | `Disabled`/deferred |
| `TraceSpan` | none | — | — | — | `Disabled`/deferred |

## Gateway native event log

`services/event_logging_service.py` writes asynchronously to the `events` table.
The event schema is open string vocabulary rather than an enum. Static AST
inspection found these literal category/type pairs:

| Category | Event types |
| --- | --- |
| `system` | `backend_not_found`, `session_terminated`, `backend_error` |
| `admin` | `smart_mode_policy_updated`, `memory_feature_settings_updated`, `memory_deleted`, `user_created`, `company_created`, `backend_registered`, `backend_status_changed`, `backend_deleted`, `scoped_settings_updated`, `scoped_settings_deleted`, `upstream_auth_updated`, `settings_updated`, `api_token_created`, `api_token_revoked` |
| `auth` | `login`, `entra_login`, `google_login`, `auth0_login`, `auth_challenge`, `api_token_used` |
| `access` | `access_denied` |
| `mcp_request` | `tool_call`, `mcp_method`, dynamic OneMCP diagnostic event types |
| `oauth` | `auth_started`, `auth_callback`, `token_failed`, `token_obtained`, `token_cleared`, `dcr_registration`, `token_refresh` |

OneMCP diagnostics dynamically select
`onemcp_client_negotiation`, `onemcp_connection_prompt`,
`onemcp_tools_list`, or `onemcp_ui_resource_read`.

Native event fields are timestamp, level, category, event type, optional tenant,
user, backend ID/name, duration, success, error message, and JSON data.

**Platform availability:** `Available through adapter mapping only`. These
events are not currently copied to the Starliner outbox. The SQLite→ClickHouse
syncer already exports them to `mcp_events_v2`, providing another extraction
path.

**Privacy:** user email, error messages, and free-form data can be sensitive.
Universal content safety is not established; mapping must use allowlists.

## Rejected-request records

`mcp_rejected_requests` stores a structured rejection event with:

- tenant/backend/path/user/auth/client-agent context;
- reason and processing stage;
- HTTP status and JSON-RPC code;
- request ID, MCP method, optional tool name;
- bounded message and metadata.

These records are `Available through adapter mapping only` and are stronger
control/failure evidence than the current reduced block signal for
authentication/access failures. They are separately synchronized to
`mcp_rejected_requests_v2`.

## Tool-call logs

`tool_call_logs` is a durable activity record containing timing, request ID,
backend/transport/auth/user/profile, headers, tool arguments, DLP input/output,
response, error, and metadata.

It is `Available through adapter mapping only`, but it crosses a materially
more sensitive boundary than current observe output. Recommended mapping is a
strict safe projection. Raw headers, bearer tokens, arguments, response content,
prediction values, and error messages are `Raw-only retention` or
`Discard with reason` unless an explicit privacy/retention policy authorizes a
bounded evidence store.

## Workflow event records

`workflow_agent_schedule_events` records schedule lifecycle. Literal worker
types include `due_claimed`, `run_skipped`, `concurrency_blocked`,
`quota_blocked`, `readiness_failed`, `run_enqueued`, and `enqueue_failed`;
repository methods also record create/update/status transitions.

Runner runs/steps/chat turns/messages/steps/artifacts are stateful execution
records, not currently normalized Starliner events. They are
`Available through adapter mapping only` and require a separate process/store
extraction design.

## OneMCP in-memory events

OneMCP uses bounded, process-local event stores, notification queues, SSE
replay IDs, and session registries. These are transport/session events rather
than durable audit records. They expire, are lost at restart, and have
per-process bounds.

`Requires minor sensor instrumentation` to emit durable session/connection
events. Reading process memory externally is not an approved adapter strategy.

## HTTP/SSE/WebSocket emissions

- 275 primary Python HTTP/WebSocket operations;
- 25 workflow-runner operations;
- Direct MCP JSON-RPC/streaming GET/POST/DELETE;
- OneMCP SSE/session replay and notifications;
- 45 partial Rust Axum routes;
- 18 FastMCP tool/resource declarations across auxiliary/example servers.

These interfaces expose operational data but are not all telemetry emission
channels. Exact routes remain indexed in the first-pass interface registry.

## ClickHouse emission

The sync utility exports three SQLite families into:

- `mcp_tool_calls_v2`;
- `mcp_events_v2`;
- `mcp_rejected_requests_v2`.

There is no transaction spanning SQLite and ClickHouse. Sync is a separate
process/CLI with source-key reconciliation. Live deployment and retention are
`Unresolved`.

## Process logs

Python logging/print and Rust tracing emit operational text. Observe and
delivery logs generally retain exception classes rather than payloads. Other
gateway logs can include backend IDs, user email, error text, URLs, and debug
DLP arguments/content excerpts.

`Potential issue:` `MCPHandler` is created with `debug=True` in `gateway.py`,
and its debug path prints truncated input arguments and DLP summaries. Runtime
log configuration and collection are unresolved.

## Event semantics and time

| Time | Meaning | Source |
| --- | --- | --- |
| mapper `occurred_at` | time mapping ran after call/registration result | gateway clock |
| tool log `started_at/completed_at` | request processing interval | gateway clock |
| event `timestamp` | log call time | gateway clock |
| rejection `created_at` | rejection persistence time | gateway clock |
| workflow run/schedule times | queue/claim/execution lifecycle | gateway/runner clocks |
| outbox `created_at/updated_at` | local persistence/transition | gateway clock |
| terminal `terminal_at` | local terminalization | gateway clock |

No source clock offset, monotonic sequence, or cross-process clock-quality field
is emitted by current Starliner records.

## Delivery guarantees

- observe task before SQLite: best effort; memory-only and droppable;
- `enqueue_many`: transactional all-new-record insert after validation, with
  duplicate suppression;
- active outbox: durable SQLite at-least-once queue;
- remote ingest: per-record result, retry/backoff, no central transaction proof;
- terminal local state: metadata only;
- event/tool logging workers: asynchronous queues with independent saturation
  behavior;
- ClickHouse sync: eventual/batch, no cross-store transaction.

