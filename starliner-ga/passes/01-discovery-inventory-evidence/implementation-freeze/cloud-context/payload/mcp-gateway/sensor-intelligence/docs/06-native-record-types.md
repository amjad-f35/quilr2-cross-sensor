# Native record types

“Native” here includes records created by the gateway and the exact pinned
contract objects the gateway instantiates. It does not imply that every type is
owned by this repository.

## `ToolCallResult`

**Location:** `mcpgateway/models.py`  
**Producer:** `MCPHandler._handle_tools_call`,
`MCPHandler.handle_request` exception conversion  
**Consumers:** MCP route/logging paths and
`MCPHandler._observe_completed_tool_call`

This is the source-native result carrier for Direct tool calls. The observe
reducer consumes the response, tool name, DLP outcomes/predictions/block flags,
and upstream-called flag. It deliberately does not forward `tool_arguments` or
metadata.

`Verified in source:` the observe mapper’s status is derived from
`ToolCallResult.response`; it is not a field stored directly on
`ToolCallResult`.

## `SourceObservation`

**Contract location:** pinned
`starliner_contracts/observations.py::SourceObservation`  
**Producer:** `MCPObserveMapper.backend_discovery_records`,
`.tool_discovery_records`, `.tool_call_records`

Current variants:

1. backend registration observation;
2. tool discovery observation; and
3. tool sighting through a completed call.

All have confidence `1.0`. Tool-call observations add
`attributes.observed_via="tool_call"`. Backend observations may add
`attributes.transport_type`.

`Contradiction:` the current mapper populates required `canonical_entity`.
The proposed cross-sensor contract says central resolution, not source code,
should assign canonical identity.

## `ActionEvent`

**Contract location:** pinned
`starliner_contracts/events.py::ActionEvent`  
**Producer:** `MCPObserveMapper.tool_call_records`

One record represents a Direct tool-call outcome:

- action type `mcp.tool.call`;
- operation `tools/call`;
- boundary `post_execution` when upstream was called, otherwise `pre_upstream`;
- resource type `mcp_tool`;
- human actor pseudonym when an email exists;
- input/output safe labels;
- execution status `blocked`, `error`, or `success`;
- upstream-called flag and optional handler latency.

Decision, usage, evidence, delegation, upstream status, and error-code objects
remain at contract defaults/empty values.

## `MetricEvent`

**Contract location:** pinned
`starliner_contracts/metrics.py::MetricEvent`  
**Producer:** `MCPObserveMapper.tool_call_records`

Two native measurements:

- `mcp.tool.calls`, counter, value `1`;
- `mcp.tool.latency_ms`, histogram sample, non-negative integer value, unit
  `ms`, only when latency is supplied.

Both use dimensions `backend_id`, `tool_name`, and final action `status`.

## `FindingSignal`

**Contract location:** pinned package
`starliner_contracts/signals.py::FindingSignal`  
**Producer:** `MCPObserveMapper.tool_call_records`

The current sensor creates only signal type `mcp_tool_blocked`, with:

- deterministic `signal_id`;
- primary entity reference to the MCP tool;
- `source_event_id` set to the derived request ID;
- confidence `1.0`;
- severity hint `medium`;
- reason codes for native input/output DLP block;
- boolean attributes showing which side blocked.

`Unresolved:` the exact pinned `signals.py` blob could not be materialized from
the partial clone. Current source construction and sensor tests verify the MCP
field shape; the newer local contract source has the same visible field shape
but an expanded post-pin signal-type enumeration.

A signal is a downstream grouping input, not a current customer-visible finding.

## `DeliveryRecord`

**Contract location:** pinned
`starliner_contracts/delivery_envelope.py::DeliveryRecord`  
**Producer:** contract `build_delivery_record`, called by
`MCPObserveMapper._wrap`

Strict outer shape:

```text
DeliveryRecord
├── envelope: DeliveryEnvelope
└── body: canonical record JSON object
```

The envelope contains tenant/schema/producer/version/time/correlation,
idempotency, hashes, and a bounded safe summary. Unknown outer fields are
forbidden. The canonical body models allow additive fields at the pinned ABI
because `CanonicalModel` uses `extra="allow"`.

## `StarlinerOutboxRecord`

**Location:** `mcpgateway/db/starliner_outbox_repository.py`  
**Fields:** `outbox_id`, parsed delivery `payload`, `attempt_count`  
**Producer:** `claim_due`  
**Consumer:** delivery worker

This dataclass is an in-memory claim projection, not the full database row.

## `starliner_outbox` row

**Location:** `mcpgateway/db/starliner_outbox_schema.py`  
**Role:** active pending/retry/in-flight delivery state

It retains the complete validated delivery wrapper in `payload_json`.
Uniqueness is scoped by tenant, sensor, record type, and idempotency key.

## `starliner_terminal_delivery` row

**Location:** same schema module  
**Role:** terminal delivery ledger

Accepted, duplicate, rejected, and terminal-failure outcomes retain hashes,
status, optional evidence/error metadata, attempts/retries, and timestamps.
The payload is deleted.

## `SensorManifest`

**Contract location:** pinned
`starliner_contracts/manifest.py::SensorManifest`  
**Producer:** `starliner/manifest.py::build_sensor_manifest`

Declares sensor/product/adapter/contract identity, capability modes, degraded
modes, and certification summary. Runtime route output extends the contract
manifest with safe config, local runtime status, delivery capability, counters,
and delivery health.

## Runtime counter snapshot

**Producer:** `ObserveMetrics.snapshot`,
`StarlinerDeliveryWorker.metrics_snapshot`,
`MCPObserveRuntime.metrics_snapshot`

Process-local string-to-integer counters. These are not persisted and are not
`MetricEvent` records. Runtime counters and delivery-worker counters are merged
at read time.

## Delivery-health snapshot

**Producer:** repository `delivery_health`, filtered by
`runtime._safe_delivery_health`

Allowed fields:

- counts: `outbox_depth`, `accepted_total`, `duplicate_total`,
  `rejected_total`, `retry_total`, `dead_letter_total`;
- ages: `oldest_record_age_seconds`, `delivery_lag_seconds`;
- timestamps: `last_success_at`, `last_error_at`.

Invalid types, negative numeric values, long/control-character timestamps, or
repository errors collapse to bounded safe defaults.

## Self-test result

Gateway-owned JSON, not a pinned contract record:

- active result: `status` and a list of
  `{name:"delivery_record_valid", passed:<bool>}`;
- disabled result: `status:"disabled"`, `reason`, empty `checks`;
- failure result: `status:"failed"`, safe exception class reason, one failed
  `mapping_selftest` check.

## Legacy `StarlinerMCPPreToolResult`

**Location:** `services/starliner_adapter.py`

Fields: `active`, `proceed`, optional `block_response`, `reason`, and
`decision_id`. It is an internal compatibility result, not a current observe
record.

## Declared but not emitted record types

| Record type | Manifest status | Current producer |
| --- | --- | --- |
| `EntitySnapshot` | deferred | none found |
| `RelationshipEvent` | deferred | none found |
| `DecisionResult` | deferred in observe runtime | none in current observe path |
| `TraceSpan` | deferred | none found |
| `SensorHealthEvent` | deferred | none found; route-only health exists |
| `CanonicalActivity` | not declared as emitted capability | none found |

