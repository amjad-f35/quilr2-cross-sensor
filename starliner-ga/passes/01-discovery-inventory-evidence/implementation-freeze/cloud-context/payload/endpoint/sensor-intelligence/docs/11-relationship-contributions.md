# 11 — Relationship Contributions

## Relationship semantics

The endpoint can contribute direct observations, configuration claims and
derived candidates. These must not be collapsed:

- `Direct observed`: the sensor observed both endpoints and the interaction.
- `Configuration`: a file/configuration declares the relationship.
- `Derived`: the platform may infer the edge from multiple current fields.
- `Suggested candidate`: names are insufficient for admission without entity
  resolution.

The machine catalog is
[relationships.csv](../../../matrices/sensor-intelligence/endpoint-sensor/relationships.csv).

## Strongest direct relationships

### Process executed on device

Process enumeration directly associates a PID/process snapshot with the local
device. The native data includes executable path, PPID, user and start time,
but the current discovery wire loses part of that identity. A proposed adapter
can emit:

```text
ProcessInstance RUNS_ON Device
ProcessInstance EXECUTED_BINARY BinaryCandidate
ProcessInstance CHILD_OF ProcessInstance
OSAccount RAN ProcessInstance
```

Only `RUNS_ON` and executable association are supportable after current mapping
without new fields. Parent/user/process-instance fidelity requires minor
instrumentation.

### Process connected to destination

The proxy/redirector can directly associate:

```text
Process → source socket → destination socket/domain → proxy request
```

macOS Network Extension metadata is the strongest source because it includes
process path and audit token. The current alert/request mapping reduces it to
PID/name, so a production adapter should extract before
`RequestContext::set_source_app` or extend that record.

### User/device observed application request

Proxy request context combines cached Persona, device, process and destination.
This supports a time-bounded observed-use edge when a request is actually
intercepted:

```text
Human/Account USED ApplicationSurface ON Device
```

It does not prove remote authentication, account ownership or action success.

### Sensor observed/detected/decided

Diagnostics, hook and proxy paths identify the local component implicitly or
by enum/service name. Canonical `observed_by`, `decided_by` and `enforced_by`
edges are useful, but current event envelopes lack a stable sensor-instance ID.

## Configuration relationships

Lua-derived entity records can express:

- Application configures MCP Server;
- Agent definition declares Model, Tool, Skill or MCP Server names;
- Hook belongs to/targets an application or IDE;
- Skill/plugin/repository/permission belongs to a local application, user or
  configuration scope.

The converter often flattens raw graph edges into strings/parent fields. These
are configuration claims, not runtime-use edges.

## Runtime relationships that are incomplete

### Hook tool activity

Activity has user/device/session/tool name, but no emitted tool input, command,
MCP server, agent, model, version or result. It can suggest:

```text
User INVOKED ToolName in IDESession
```

It cannot establish `Agent CALLS Tool`, `ToolCall TARGETS Resource` or
`ToolCall SUCCEEDED`.

### DLP decision and enforcement

Proxy payloads link a decision to request, user/device/process, application,
control and detections. The monitor links governance to an entity/PID action.
The hook path links a request to an Allow response.

Current records distinguish some selected action/result strings but do not
provide a uniform observed-effect edge. Use:

```text
Policy GOVERNED Request
Detector DETECTED SensitiveEntity IN Request
EnforcementPoint ATTEMPTED_ACTION Request/Process
```

Do not assert `BLOCKED` or `TERMINATED` as an effect unless the path’s native
return/response provides sufficient evidence and coverage.

## Relationship freshness

- Entity relationships inherit scan/rediscovery timestamps, not independent
  edge timestamps.
- Process/network/request relationships are time-bounded but current paths
  lack a common event sequence.
- Persona/group relationships reflect the last backend refresh visible to the
  local cache.
- Configuration absence after a scan is not a deletion because no
  source-complete boundary/tombstone exists.
- Source outage must mark relationships stale/coverage-degraded rather than
  delete them.

## Proposed canonical edge envelope

Each adapter edge should include:

- subject source alias and namespace;
- relationship type;
- object source alias and namespace;
- `observed`, `configured`, `derived`, or `candidate` assertion class;
- source record/event ID;
- observed time and valid interval where available;
- sensor/device/collector identity;
- confidence and completeness scope;
- evidence locator;
- tombstone only when a source-complete boundary proves removal.

