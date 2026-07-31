# Source-to-target coverage

## MCP Profile 1.0.0

The profile contains ten payload kinds and 118 top-level target fields.

| Status | Count | Meaning |
| --- | ---: | --- |
| `PARTIALLY_CONFIRMED` | 50 | source concept exists; complete target emission is not implemented |
| `SOURCE_FACT_UNMAPPED` | 44 | native/logged fact exists but current Starliner mapper does not emit it |
| `UNSOURCED` | 21 | source capture is absent, principally snapshot/gap families |
| `REQUIRES_FUTURE_CONNECTOR` | 2 | signed cross-sensor/agent attribution is not current gateway authority |
| `CONTRADICTED` | 1 | required server product identity conflicts with custom backend reality |

No target field is marked fully `CONFIRMED` because the current mapper emits a
different Starliner contract and lacks the frozen envelope/WAL/certification
boundary.

## Strong current source support

Current source can supply or derive:

- tenant and gateway deployment context;
- backend/server deployment IDs;
- tool names scoped to backend;
- Direct call outcome, block state, upstream-called flag, latency, and DLP
  labels;
- sensor/runtime identity;
- outbox and delivery state;
- richer operation/rejection facts through existing source-local logs.

## Weak or unavailable support

- distinct product identity for every custom backend;
- full entity lifecycle/tombstone/snapshot completeness;
- OneMCP/native/workflow coverage parity;
- resource/prompt/session/progress/cancel mappings;
- stable gateway-native agent/workload attribution;
- signed Endpoint-to-MCP attribution;
- durable per-surface health and loss;
- frozen admission receipt and sequence.

## Required unavailable behavior

When a target field is unavailable, the adapter/platform must:

- omit the unsupported field when schema permits;
- emit explicit capability/gap/coverage state;
- require future connector or change control;
- never synthesize from name, email, timing, URL, or tool overlap.

Machine coverage:
[target-field-coverage.csv](../../lg008/reconciliation/target-field-coverage.csv).
