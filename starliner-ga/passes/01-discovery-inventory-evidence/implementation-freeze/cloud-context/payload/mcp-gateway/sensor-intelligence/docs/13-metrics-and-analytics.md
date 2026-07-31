# Metrics and analytics

## Emitted canonical metrics

### Metric: `mcp.tool.calls`

**Definition:** one sample per normally completed Direct `tools/call` branch.

**Formula:** `value = 1`, metric type `counter`.

**Inputs:** tenant, safe backend ID, safe tool name, derived final status.

**Time semantics:** mapper completion time, not request start time.

**Dimensions:** `backend_id`, `tool_name`, `status`.

**Known blind spots:** OneMCP-native calls, non-tool MCP methods, workflow/Google
server activity, exception-converted tool failures, and any dropped observe
task/outbox batch.

**Product action:** `Analytics`, `Entity detail`, `Coverage and health`.

**Availability:** `Available now without sensor changes`.

### Metric: `mcp.tool.latency_ms`

**Definition:** one histogram sample per observed tool call when handler latency
is available.

**Formula:** `max(0, int(full_tools_call_branch_elapsed_ms))`.

**Time semantics:** measures confirmation/DLP/ZIA/legacy policy/upstream/output
processing/token-saving and local overhead together. It is not pure upstream
latency.

**Dimensions:** backend, tool, status.

**Known blind spots:** same coverage gaps; no phase breakdown; no percentile
calculation locally; dropped evidence biases results.

**Product action:** `Analytics`, `Entity detail`, operator latency debugging.

**Availability:** `Available now without sensor changes`.

## Process-local observe/delivery counters

These are not canonical `MetricEvent` records and reset on restart.

| Counter family | Exact names/pattern | Meaning |
| --- | --- | --- |
| scheduling | `background.dropped`, `.unscheduled`, `.failed`, `.cancelled` | async evidence work loss/failure |
| enqueue | `<kind>.records`, `<kind>.duplicates`, `<kind>.enqueue_failed`, `outbox_dropped` | mapping/outbox outcomes for backend discovery, tool discovery, and calls |
| worker lifecycle | `delivery.shutdown_timeout`, `.shutdown_cancelled`, `.loop_error` | worker operational failures |
| transport | `delivery.network_timeout`, `.network_error`, `.malformed_response`, `.retryable_http`, `.non_success_http` | batch failure classes |
| record result | `delivery.accepted`, `.duplicate`, `.rejected`, `.dead_letter`, `.unknown_result` | per-record central result |
| retry | `delivery.retry`, `.failed_terminal` | retry/terminal retry outcomes |

Product disposition is `Coverage and health` and `Operator-only`. Platform
availability is `Available through adapter mapping only` through the metrics
route, or `Requires minor sensor instrumentation` for durable tenant-aware
health events.

## Repository delivery-health metrics

| Metric | Definition | Persistence |
| --- | --- | --- |
| `outbox_depth` | active pending/retry/in-flight rows | derived live |
| `oldest_record_age_seconds` | now minus oldest active created time | derived live |
| `delivery_lag_seconds` | local lag based on pending/terminal times per repository implementation | derived live |
| `last_success_at` | latest accepted/duplicate terminal time | terminal table |
| `last_error_at` | latest rejected/failed/retry error time | active/terminal state |
| `accepted_total` | accepted terminal count | terminal table |
| `duplicate_total` | duplicate terminal count | terminal table |
| `rejected_total` | rejected terminal count | terminal table |
| `retry_total` | accumulated retry count | active + terminal metadata |
| `dead_letter_total` | rejected + failed-terminal outcomes as repository defines | terminal table |

These aggregate all tenants/sensors in the local DB unless repository queries
scope them; the route exposes no tenant parameter. Product disposition:
`Coverage and health`, `Operator-only`.

## Metrics derivable from existing gateway stores

| Metric family | Native source | Example verified computation inputs | Availability | Blind spots |
| --- | --- | --- | --- | --- |
| tool success/error/block rate | `tool_call_logs` | response success, error, input/output blocked | `Available through adapter mapping only` | async log drops and retention |
| request latency distributions | `tool_call_logs` | started/completed/duration | same | no pure upstream phase |
| authentication failures/challenges | `events`, rejection table | auth event types, success, reasons/stages | same | event vocabulary open; duplicate pathways |
| OAuth completion/refresh health | events | `auth_started`, `token_obtained`, token refresh/failure/clear | same | correlation fields can be partial |
| rejected requests by tenant/backend/user/agent/reason | rejection table | structured columns | same | only gateway-observed rejects |
| active/catalog backend counts | gateway DB | backend status/catalog/system/tenant fields | same | configured does not imply used |
| tool/resource/prompt counts | cached capabilities | list lengths | same | cache staleness/completeness |
| user/backend adoption | logs + preferences | distinct users, calls, connection config | same | identity normalization required |
| DLP category/outcome counts | tool logs | input/output outcomes/predictions | same | prediction payload privacy; safe label reducer needed |
| token-saving effect | tool log metadata | transformation metadata | same | exact denominator/bytes depend on metadata completeness |
| workflow queue/run reliability | runner DB | status, attempts, lease, timing, errors | same | separate process/store and retention |
| workflow schedule reliability | schedule events | enqueue/blocked/failure event types | same | scheduler deployment unresolved |
| artifact volume/integrity | runner artifacts | size/hash/status | same | filesystem cleanup/retention |
| ClickHouse sync freshness | sync state/logs | source IDs/timestamps/batches | `Requires minor sensor instrumentation` for stable health contract | live deployment not verified |
| OneMCP session saturation/replay loss | process-local stores | bounds/eviction/current state | `Requires minor sensor instrumentation` | reset/restart, replica-local |

## Metrics not defensible from current evidence

- enterprise-wide MCP usage outside this gateway;
- unique human count across pseudonym key rotations;
- exact active user count without a defined time window and identity authority;
- pure upstream tool latency;
- prevented-risk monetary value;
- model token/cost for ordinary MCP tool calls;
- device/process/network coverage;
- production delivery SLOs without live ingest telemetry;
- “all tools discovered” completeness without snapshot markers.

## Product-card recommendations

`Proposed:` cards should display denominator and coverage status, not a bare
number.

| Card | Numerator | Required denominator/context | Disposition |
| --- | --- | --- | --- |
| observed tool calls | count metric/action events | active sensor instances, observation-loss counters, time window | `Overview`, `Analytics` |
| blocked tool calls | blocked action/signal | observed call count, Direct-only coverage label | `Overview`, `Analytics`, `Finding signal` |
| tool-call latency | latency samples | sample count, coverage/method scope | `Analytics` |
| delivery backlog | outbox depth/age | configured delivery state, sensor instance | `Coverage and health` |
| delivery failures | retries/rejected/dead letters | delivery attempt/accepted totals | `Coverage and health`, `Operator-only` |
| inventory freshness | source observations | expected source snapshot/last-seen policy | needs lifecycle instrumentation before customer claim |

## Aggregation and cardinality

Current metric dimensions include raw-safe backend and tool names. Large or
attacker-controlled tool catalogs can create high dimension cardinality.
Central aggregation should cap/query-cardinality and use resolved entity IDs.

No local sampling is implemented. Evidence loss occurs through bounded
scheduler/log queues and outbox capacity, so central rates require health
denominators and loss indicators.

