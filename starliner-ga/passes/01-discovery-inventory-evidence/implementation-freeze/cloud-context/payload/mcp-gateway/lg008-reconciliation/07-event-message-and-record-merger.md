# Event, message, and record merger

## Catalogs

| Catalog | Count |
| --- | ---: |
| Native/current records | 13 |
| Native/current events | 20 |
| Frozen MCP profile messages | 10 |

## Current record families

The current implementation includes:

- handler `ToolCallResult`;
- Starliner `SourceObservation`, `ActionEvent`, `MetricEvent`,
  `FindingSignal`, and `DeliveryRecord`;
- outbox and terminal-delivery rows;
- tool-call, event, and rejected-request log rows;
- workflow run and artifact records.

These contracts are not renamed to the frozen MCP profile. Compatibility is
assessed separately.

## Frozen message families

MCP Gateway Profile 1.0.0 defines:

```text
mcp.entity
mcp.relationship
mcp.tool_call
mcp.operation
mcp.rejection
mcp.native_decision
mcp.native_effect
mcp.snapshot
mcp.health
mcp.gap
```

The target schema is `SOURCE_PROVEN` as a contract. Current emission
reachability is separate and generally partial/configuration-dependent.

## Reconciliation

- current Direct `ActionEvent` is semantically related to `mcp.tool_call`, not
  an identical contract;
- current backend/tool `SourceObservation` is adapter-related to `mcp.entity`;
- current DLP `FindingSignal` is a source-local signal, not a finding or target
  policy decision;
- SQLite/ClickHouse protocol logs contain operation/rejection facts that are
  not currently emitted by the Starliner mapper;
- `mcp.snapshot` and complete `mcp.gap` require new capture.

Delivery guarantees remain source-specific. The global system may not claim a
stronger guarantee than the current source path.

Machine catalogs:

- [records](../../lg008/catalogs/records.csv)
- [events](../../lg008/catalogs/events.csv)
- [messages](../../lg008/catalogs/messages.csv)
