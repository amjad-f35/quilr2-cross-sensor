# Final sensor integration decision


| Decision | Result |
| --- | --- |
| Sensor | Quilr LLM Gateway |
| Unique visibility | Inline routed model request/response, provider/model route, guardrail decision/action, latency, tokens and errors |
| Supported environments | BlackSheep/deployment configurations evidenced at `92b0462c583b`; effective production matrix unresolved |
| Current maturity | Rich inline gateway and telemetry, but no Quilr 2.0 source adapter/outbox contract |
| Current emission boundary | finalized request DB log plus Axis/DLP NATS evidence |
| Recommended adapter placement | in-process finalized-record/evidence bridge plus Starliner local publisher |
| Durable outbox status | existing SQLite/NATS durability is not a Quilr 2.0 outbox |
| Primary inventory | gateway, application surface/account candidate, provider/model route, credential metadata |
| Primary events | request observed/blocked/redacted/failed, response received/blocked/redacted, guardrail signal |
| Primary metrics | requests, success/error, latency, tokens, controls, derived cost/provider health |
| Primary enforcement | redact/transform, block, rate/concurrency/model/source restrictions |
| Critical changes | stable versioned envelope, signed sensor identity/manifest, outbox/ack/replay, stage/effect records |
| MVS finding | Sensitive data sent to model, coverage-gated |
| Overall integration readiness | **Requires a new stable sensor integration boundary** |

The gateway has reusable native records and worker durability patterns, so a
new sensor is unnecessary. It is not adapter-ready today because its current
SQLite/NATS/Axis paths lack the stable versioned observation envelope, signed
sensor identity, capability manifest and end-to-end acknowledgement required
for trustworthy Quilr 2.0 ingestion.
