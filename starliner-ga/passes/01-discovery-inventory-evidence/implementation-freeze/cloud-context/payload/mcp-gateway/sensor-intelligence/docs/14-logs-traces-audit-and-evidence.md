# Logs, traces, audit, and evidence

## Log surfaces

| Surface | Owner | Content | Persistence | Sensor suitability |
| --- | --- | --- | --- | --- |
| Python application log | gateway/services/workers | lifecycle, warnings, errors, debug text | external collector/console; unresolved | operator diagnostics; not a canonical evidence source |
| Direct MCP debug print | `MCPHandler(debug=True)` | argument excerpt, DLP categories/predictions, output summaries | console | sensitive; `Discard with reason` from platform ingest |
| `tool_call_logs` | `ToolCallLoggingService` | full tool activity and DLP/result context | `mcp_logs.db` | rich but sensitive adapter source |
| `events` | `EventLoggingService` | auth/admin/OAuth/access/system/MCP events | `mcpgateway_logs.db` | useful safe-projection source |
| `mcp_rejected_requests` | rejection repository | structured denied request context | `mcpgateway_logs.db` | high-value control evidence |
| admin audit log | `AdminAuditService` | mutation/rollback metadata with key redaction | `gateway.db` | configuration/control evidence |
| workflow run/step logs | runner repository/engine | status, steps, errors, limits | runner DB | execution evidence requiring separate extraction |
| Starliner runtime logs | observe runtime/worker | exception classes and state warnings | console | operator health only |
| ClickHouse v2 tables | syncer | normalized tool/event/rejection records | external ClickHouse | analytics extraction; live guarantees unresolved |

## Trace coverage

Current Starliner action records carry `request_id`, `flow_id`, and `span_id`,
but the runtime does not emit `TraceSpan`.

The three values are independently prefixed hashes of the same tenant and
per-dispatch seed. There is no parent span, upstream span, trace context header,
phase timing, or cross-process propagation in current observe output.

`Potential issue:` these IDs look like trace identifiers but represent one
gateway-mapped event, not a verified distributed trace.

Other correlation sources include:

- client JSON-RPC request ID;
- gateway tool-log request ID and row ID;
- event/rejection request ID;
- workflow request/run/step IDs;
- OAuth state/code/client/backend/user context;
- OneMCP session/event IDs;
- outbox/idempotency/body/record/evidence IDs.

No universal correlation schema joins all of them.

## Audit

The admin audit subsystem records administrative changes and rollback metadata.
Backends/settings/auth/API-token/memory/smart-mode mutations also emit ordinary
event-log records. Current Starliner mapping does not consume either source.

`Available through adapter mapping only:` bounded audit activity, actor,
resource, changed-field names, result, and rollback link.

`Discard with reason:` secret before/after values, tokens, credential payloads,
raw free-form request bodies.

## Evidence chain

Current observe evidence chain:

```text
native lifecycle metadata
→ canonical Pydantic model validation
→ delivery wrapper + body hash + record hash
→ transactional SQLite outbox
→ lease/batch HTTP delivery
→ per-record accepted/duplicate/rejected response
→ metadata-only local terminal ledger
```

### Integrity properties

- deterministic canonical JSON;
- SHA-256 body and record hashes;
- wrapper revalidation before enqueue;
- tenant/type/schema/correlation equality checks;
- unique local idempotency scope;
- terminal evidence ID retention when returned.

### Missing provenance properties

- no digital signature or MAC on records;
- no workload identity/certificate binding in source;
- bearer authentication does not prove record signing;
- no monotonic sequence or hash chain;
- no trusted timestamp;
- no local append-only/WORM guarantee;
- SQLite administrators can mutate state;
- terminal payload deletion prevents local post-delivery reconstruction;
- no recorded remote receipt body/signature.

Therefore current evidence quality is operational, not independently
audit-grade.

## Evidence grades

| Evidence | Grade supported | Reason |
| --- | --- | --- |
| current delivery record before terminalization | operational | validated, content-hashed, locally durable; unsigned |
| terminal local metadata | operational receipt metadata | identity/hashes/outcome only |
| process counters/logs | best effort | reset/loss/collector unresolved |
| tool/event/rejection SQLite rows | operational | durable local DB but mutable and sensitive |
| process-local OneMCP/session state | debug/best effort | volatile |
| synthetic self-test/certification output | fixture/certification evidence | no live upstream/ingest |
| live central receipt | unresolved | external system not exercised |

## Retention

Current outbox:

- active payload retained until terminal outcome;
- terminal payload deleted;
- terminal metadata has no visible retention/expiration job;
- bounded capacity applies to active rows, not terminal rows.

Other SQLite logs and gateway state have no general retention worker in scope.
Workflow runner has an explicit retention worker for run/chat/artifact state.
ClickHouse retention is `Unresolved`.

## Evidence product disposition

| Artifact | Disposition |
| --- | --- |
| canonical body + envelope + hashes | `Evidence drill-down`, `Raw-only retention` |
| source/action/metric/signal safe projection | `Activity explorer`, `Analytics`, `Finding signal` |
| delivery terminal metadata | `Coverage and health`, `Operator-only` |
| raw tool logs | `Raw-only retention` with strict access, or `Discard with reason` |
| secret/header/token fields | `Discard with reason` |
| admin audit safe projection | `Activity explorer`, `Evidence drill-down` |
| process logs | `Operator-only` |

