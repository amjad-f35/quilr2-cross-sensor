# Negative observability matrix

## Scope

The matrix contains 62 required and material concepts. The MCP Gateway column
uses only the mandated observability vocabulary.

The Browser, Browser Backend, Endpoint, and LLM Gateway cells deliberately
contain `NOT_EVALUATED_MCP_ONLY_SCOPE`, which is outside the controlled
vocabulary. The validator rejects those columns so a one-profile run cannot
masquerade as the global matrix.

## MCP observations

### Observable and collected

- registered MCP server/deployment;
- tool names and selected discovery;
- sensor/runtime identity and version;
- outbox and delivery state.

### Conditional or partial

- gateway subject and service identity;
- stable client/application identity;
- MCP connections and sessions;
- tool calls/results outside the Direct normal-return path;
- policy decisions, native effects, and actual effects;
- network origin after minimization;
- permission/configuration state and enforcement readiness.

### Observable but not currently collected by Starliner

- agent/workflow definitions, deployments, runs, and steps;
- stable tool schema/version digest;
- resource/prompt/session/progress/cancellation lifecycle;
- heartbeat and per-surface capture health;
- file/artifact metadata;
- raw content-bearing values, which are visible to native execution but
  prohibited from the ordinary profile.

### Unobservable or requires another source

- authoritative enterprise person, department, employment status, and group;
- browser profile/origin;
- desktop process/device/binary/package;
- model provider/version/invocation;
- uploads/downloads outside MCP semantics.

## Absence semantics

Missing MCP telemetry never proves that activity did not occur. Coverage must
carry surface, configuration, freshness, outbox/delivery, and gap state.

Machine matrix:
[negative-observability.csv](../../lg008/reconciliation/negative-observability.csv).
