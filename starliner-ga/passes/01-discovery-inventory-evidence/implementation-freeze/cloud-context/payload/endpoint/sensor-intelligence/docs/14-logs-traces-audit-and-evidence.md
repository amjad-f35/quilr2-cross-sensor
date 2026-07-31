# 14 — Logs, Traces, Audit, and Evidence

## Logs

The Rust components primarily use `tracing` macros. Logs cover startup,
configuration, discovery scan counts, HTTP failures, DLP decisions, service
state, retries, integrity repair and shutdown. They are useful operational
records but are not a stable structured event API merely because structured
fields appear in individual calls.

The proxy traffic logger is separate:

- lock-free queue capacity 10,000;
- oldest event overwritten when full;
- 300 ms flush interval;
- local line format containing UTC timestamp, method, URI and status;
- write/open errors are ignored by the shown flush path;
- no rotation/retention logic in the logger itself.

URIs can contain sensitive metadata. No built-in traffic-log redaction is
visible in that writer.

## Traces

No OpenTelemetry exporter or distributed trace protocol is active in the
endpoint runtime at the pinned revision. Request IDs, timers and structured
logs provide correlation fragments, but they are not trace spans.

`RequestProfile`, DLP timings, request ID and response duration can support
future spans. Current data lacks a uniform trace ID/parent span ID, sampling
decision, exporter and backend.

## Audit

There is no single append-only endpoint audit ledger.

Audit-like evidence exists in:

- alert JSON plus SQLite status/retry/DLQ state;
- DLP decision/action/justification fields;
- governance settings in entity snapshots;
- hook request/response/activity;
- hook file content digest and integrity-repair logs;
- service/diagnostic lifecycle messages;
- local logs.

The alert database is mutable operational storage, not documented as
tamper-evident. Entity snapshots are ordinary JSON. Hook activity is lossy.
Consequently these records can support investigation but must not be described
as a complete, immutable audit trail.

## Evidence

### Stronger evidence

- alert UUID, opaque original payload bytes, status, retry and time fields;
- detector metadata plus matched entities/snippets, with privacy controls;
- macOS kernel audit token while still in process-attribution state;
- installed hook SHA-256 digest;
- backend source IDs and governance responses;
- Persona validation time and backend account ID.

### Weaker evidence

- display names without namespaces;
- current entity state without scan boundary;
- hook activity without arguments/result/effect;
- action labels without independently observed effect;
- local log lines without durable admission;
- health counters without boot/sample identity;
- cached Persona association as proof of remote SaaS principal.

## Provenance gaps

Current outbound records do not uniformly carry:

- sensor instance and artifact digest;
- collector name/version;
- exact source API/hook;
- source sequence/scan boundary;
- transformation/redaction history;
- delivery/admission receipt;
- evidence integrity digest;
- configuration/policy version;
- coverage/bypass state.

These are required before the platform can give strong evidence-completeness
claims.

## Privacy and retention

- prompt/entity/snippet/justification/body/header/URI/file/process fields can
  contain secrets or personal data;
- alert payloads persist in SQLite and may reach backend HTTP;
- traffic logs persist locally at a configured path;
- body capture can create temporary files;
- Persona tokens persist through vault logic and are intentionally excluded
  from ordinary wire contexts;
- retention/rotation for deployed logs, temp files, SQLite and backend storage
  is unresolved without runtime/deployment configuration.

The companion classification is
[logs-traces-audit.csv](../../../matrices/sensor-intelligence/endpoint-sensor/logs-traces-audit.csv).

