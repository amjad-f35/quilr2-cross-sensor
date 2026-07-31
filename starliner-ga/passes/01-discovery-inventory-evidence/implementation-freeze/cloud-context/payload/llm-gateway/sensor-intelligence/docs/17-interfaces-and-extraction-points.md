# Interfaces and extraction points


The complete interface matrix contains 257 HTTP/WebSocket,
NATS, storage and Axis rows:
[`interfaces.csv`](../../../matrices/sensor-intelligence/llm-gateway/interfaces.csv).

| extraction_point | fidelity | latency | coupling | missing_fields | reliability | privacy | recommended |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Immediately after ingress capture | Highest raw content | lowest | high request-path | decision, route, provider result, tokens, outcome | no durable boundary | maximum content exposure | No |
| After request parsing/DLP | request plus decision | low | high and handler-specific | provider response/outcome | no common durable boundary | can filter/redact locally | Secondary signal only |
| PerformanceLoggerAsync finalized record | common request outcome/metrics | request completion | moderate common utility | full field parity varies; raw evidence separate | existing DB queue/store but no Quilr ack | metadata-first feasible | Yes, primary observation boundary |
| Axis alert construction | rich DLP evidence/original-final text | near request | guardrail-specific | clean requests and some protocols | NATS/db writer; final delivery unresolved | highly sensitive content | Yes, linked evidence/finding signal only |
| ClickHouse polling | persisted analytics rows | higher | warehouse schema | dropped/failed writes; content tables separate | central persistence dependent | stored data already crossed boundary | Backfill only |
| Existing logs | diagnostic fragments | variable | message templates | schemas, acknowledgements, stable semantics | rotation/retention unresolved | possible leakage | No |

**Recommended extraction:** the finalized `PerformanceLoggerAsync` record is
the primary observation boundary; Axis/DLP construction is a linked,
privacy-sensitive evidence/signal boundary. Neither current boundary provides a
Quilr 2.0 durable acknowledgement, so a Starliner outbox must be inserted after
immutable record construction and before asynchronous transport.
