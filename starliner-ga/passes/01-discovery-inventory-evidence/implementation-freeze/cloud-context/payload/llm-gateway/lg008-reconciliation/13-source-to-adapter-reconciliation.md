# Source-to-adapter reconciliation


Adapter mappings: **26,292**.

| Mapping status | Rows |
| --- | --- |
| BLOCKED_BY_UNRESOLVED_EVIDENCE | 1635 |
| NOT_REQUIRED | 19750 |
| READY_WITH_MINOR_SOURCE_CHANGE | 4907 |

## Responsibility boundary

- LLM source: construct finalized native facts at cited capture points.
- Adapter: map only semantically validated fields and omit prohibited content.
- Starliner: producer identity, privacy gate, WAL/outbox, acknowledgement,
  retry/replay, health, and delivery.
- Central platform: canonical identity, relationships, persistence,
  materialization, APIs, analytics, and UI.

Name/alias target matches are
`BLOCKED_BY_UNRESOLVED_EVIDENCE`; they are not marked `READY`. Source-local and
privacy-prohibited values terminate explicitly. The sensor does not assign
canonical identity.

Mappings:
[`source-to-adapter.yaml`](../../lg008-llm-gateway/reconciliation/source-to-adapter.yaml) and
[`source-to-protocol.yaml`](../../lg008-llm-gateway/reconciliation/source-to-protocol.yaml).
