# 13 — Metrics and Analytics

## Classification

Metrics are classified as:

- `Current exposed`: a structured local metric/endpoint exists.
- `Current log-only`: calculated and written to logs.
- `Current internal`: counter/state exists but has no supported export.
- `Centrally derivable`: current delivered records are sufficient if coverage
  and deduplication are handled.
- `Requires instrumentation`: required inputs or delivery semantics are absent.

The machine catalog is
[metrics.csv](../../../matrices/sensor-intelligence/endpoint-sensor/metrics.csv)
and [native-metric-types.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/native-metric-types.yaml).

## Proxy Prometheus endpoint

`GET /metrics` exposes:

- `proxy_info{version="0.1.0"} 1`;
- `proxy_requests_total`;
- `proxy_requests_failed`;
- `proxy_failure_rate`;
- `proxy_health_state` (`0..3`);
- DNS failures;
- connection timeouts;
- upstream 502/503 counts;
- seconds since last successful request;
- restart count;
- circuit-breaker total/open/half-open/closed;
- current process-attribution map size.

**Contradiction:** `proxy_info` uses literal version `0.1.0`, while alert
`AgentSection.version` uses `CARGO_PKG_VERSION` with fallback. The metric label
must not be trusted as the actual deployed version without build/runtime
verification.

**Potential issue:** `HealthMonitorConfig.failure_window_secs` is documented as
the calculation window, but `get_metrics` and `evaluate_health_state` divide
cumulative process-lifetime atomic failures by cumulative total requests.
The shown code does not expire/reset samples by the configured window.

## Proxy health endpoint

`GET /health` returns the same cumulative request/failure/DNS/timeout/502/503
data, last-success recency, restart count, and circuit-breaker hosts/states.
It returns HTTP 503 for Unhealthy/Critical and 200 for Healthy/Degraded or when
monitoring is disabled.

This endpoint has no authentication in the handler itself; listener exposure
and surrounding routing determine the effective boundary.

## Internal/log-only operational metrics

### Connection pool

- active;
- capacity;
- integer utilization percent;
- available;
- total accepted;
- rejected due to permit-wait timeout;
- average wait milliseconds.

These are logged periodically when configured; distribution/percentiles are
not retained.

### Destination resolution

- macOS DIOCNATLOOK success/failure;
- extension metadata success;
- SNI success/failure;
- destination and extension mismatch counts;
- dropped connections;
- cache hits/misses/size in the cache helper.

Summary logging derives NAT/SNI success percentages.

### Circuit breaker

Per host: state, failure count, success count and last state-change `Instant`.
The `/metrics` endpoint exposes only aggregate state counts, while `/health`
also lists open/half-open hosts.

### DLP configuration

`DlpConfigMetrics` tracks last fetch, last successful fetch, fetch count,
failed count, auth-failure count and current version. The public method returns
a formatted log summary, not structured Prometheus output.

### Traffic/activity/alert loss

- traffic logger counts overwritten oldest events, but only emits a summary
  line on flush;
- activity queue drops are logged; no durable central counter is exposed;
- alert retry state is queryable from SQLite but no current public metrics
  endpoint was found for queue depth/retry age/quarantine/DLQ counts.

## Centrally derivable analytics from current delivered records

Subject to source freshness, deduplication and delivery loss:

- discovered entities by kind/device/user/tenant;
- new-versus-rediscovered entities;
- approved/blocked/critical governance state;
- hook activity count by IDE/tool/user/device;
- DLP alert count by application, user, device, process, category, policy mode
  and outcome;
- upload alerts by file type/size/category/action;
- justification rate and selected justification text presence;
- delivery failure/retry counts if alert status is exported.

These are not equivalent to total enterprise usage. Proxy/hook coverage is
selected and bypassable, discovery is not exhaustive, and activity delivery
can drop.

## Metrics that cannot be truthfully produced today

- complete active agent/user/session/run counts;
- model invocations, tokens, provider latency or cost;
- MCP connections, tool schemas, calls, results or success rate;
- complete process/file/network activity;
- coverage percentage without a known expected-source denominator;
- enforcement success/effect rate across all paths;
- durable telemetry admission/replay lag across every record family;
- cloud/serverless/container/CI coverage.

## Recommended product cards

| Card | Disposition | Reason |
| --- | --- | --- |
| Endpoint sensors healthy/stale | Coverage and health | actionable if unified health record is added |
| Devices with observed AI applications | Inventory/Analytics | current discovery supports qualified count |
| Newly observed local agent/MCP/skill configs | Inventory/Finding signal | useful with selected-scope label |
| DLP detections/actions by application | Analytics | current alert fields support it |
| Alert delivery backlog/DLQ | Operator-only | operationally actionable, not customer risk by itself |
| Proxy failure rate/circuit state | Operator-only or Coverage | cumulative semantics and local-only endpoint |
| “All agents discovered” | Discard | unsupported completeness claim |
| Model spend/token usage | Discard | inputs absent |

## Time and reset semantics

Most proxy atomics reset on process restart. `Instant` fields are monotonic and
not portable. Health counts are cumulative in the shown process. Discovery
metrics must use entity `discovered_at`/`last_seen_at`; activity uses local
timestamp rather than hook source time. An adapter must add sensor boot ID,
sample interval, monotonic/cumulative type, and reset detection.

