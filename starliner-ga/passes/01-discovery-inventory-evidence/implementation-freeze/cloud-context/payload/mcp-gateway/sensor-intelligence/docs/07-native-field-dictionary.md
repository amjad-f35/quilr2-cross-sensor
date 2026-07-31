# Native field dictionary

This revision covers the complete current Starliner observe record/storage
surface and the immediate Direct MCP source fields. Other gateway subsystems
will be appended as they are dispositioned.

## Direct tool-call source fields

| Field | Type | Origin | Null/default handling | Observe use | Sensitivity/trust |
| --- | --- | --- | --- | --- | --- |
| `method` | string | JSON-RPC request | unmatched returns method-not-found | only exact `tools/call` enters hook | external client input |
| `params.name` | arbitrary, expected string | JSON-RPC request | mapper fallback `"unknown"` through result | normalized tool name | external identifier; token-shaped values opacity-hashed |
| `params.arguments` | mapping expected | JSON-RPC request | default `{}` | never forwarded to mapper | potentially sensitive raw payload |
| `request_id` | any JSON-compatible ID | JSON-RPC request | used as fallback if no observation ID | input to derived request/flow/span IDs | client-session-scoped, not globally unique |
| `observation_id` | UUID hex string | gateway handler | always generated for normal Direct call branch | preferred correlation seed | gateway-generated |
| `tenant_id` | optional string | authenticated route context | runtime substitutes `"unknown"` | tenant and derivation scope | trust-boundary identity |
| `user_email` | optional string | authenticated route context | missing yields empty actor | HMAC input only | direct identifier/PII; must not persist raw |
| `backend_id` | string | direct endpoint/backend binding | safe fallback rules | observation/resource/metric dimension | tenant-scoped source identifier |
| `ToolCallResult.response` | mapping | handler | non-mapping becomes `{}` for error classification | derives response error boolean only | may contain sensitive tool result; not forwarded |
| `dlp_input_predictions` | list of mappings or null | native DLP | invalid entries ignored | safe labels only | may contain sensitive entity values; raw object not persisted |
| `dlp_output_predictions` | list of mappings or null | native DLP | invalid entries ignored | safe labels only | same |
| `dlp_input_outcome` | optional string | native DLP | safe/allowed excluded from risk labels | safe-summary risk label and error class | bounded classification |
| `dlp_output_outcome` | optional string | native DLP | same | same | bounded classification |
| `dlp_input_blocked` | bool | native DLP/result | false when unset on dataclass | status/signal/reason | security decision outcome |
| `dlp_output_blocked` | bool | native DLP/result | false when unset | status/signal/reason | security decision outcome |
| `upstream_called` | optional/bool-like | handler result | reducer coerces with `bool()` | action boundary/execution | control-flow evidence |
| `latency_ms` | non-negative int | full branch elapsed time | always supplied by normal hook; mapper supports null | execution + latency metric | operational |
| `response_is_error` | bool | reducer | inferred | final action status/error summary | operational |

## `SourceObservation` fields

| Field | Type/constraint | Current value/source | Consumers/lifecycle |
| --- | --- | --- | --- |
| `schema` | literal `starliner.source_observation.v1` | contract default | wrapper derives record type |
| `schema_version` | literal integer `1` | contract default | schema validation |
| `tenant_id` | string | runtime tenant or `"unknown"` | envelope equality, identity scope, outbox scope |
| `observation_id` | string | deterministic `stable_id("observation", ...)` | body identity; stable across repeated discovery of same source object |
| `canonical_entity.type` | string | `mcp_backend` or `mcp_tool` | downstream canonical reference; contradicts target authority |
| `canonical_entity.id` | string | locally built backend/tool entity ID | downstream reference; contains normalized tenant/backend/tool |
| `sensor_id` | string | config | producer identity |
| `source_entity_type` | string | `mcp_backend` or `mcp_tool` | source typing |
| `source_external_id` | string | safe backend ID or `<backend>:<tool>` | source identity |
| `observed_name` | optional string | absent for backend; safe tool name for tool | display/source name |
| `confidence` | float 0–1 | `1.0` | downstream resolution signal |
| `observed_at` | ISO timestamp string | mapper `_utc_now()` | observation time |
| `attributes` | safe scalar map | optional `transport_type` or `observed_via=tool_call` | bounded context |

## `ActionEvent` shared/correlation fields

| Field | Current value | Rule |
| --- | --- | --- |
| `schema` | `starliner.action_event.v1` | contract default |
| `schema_version` | `1` | contract default |
| `tenant_id` | runtime tenant or `"unknown"` | copied into envelope |
| `request_id` | `stable_id("request", tenant, observation_id-or-request_id)` | per-dispatch stable hash |
| `flow_id` | `stable_id("flow", tenant, observation_id-or-request_id)` | same seed, distinct prefix |
| `span_id` | `stable_id("span", tenant, observation_id-or-request_id)` | same seed, distinct prefix |
| `parent_span_id` | absent | not populated |
| `occurred_at` | mapper timestamp | shared across records in one map call |
| `sensor.type` | `mcp_gateway` | hard-coded |
| `sensor.id` | config sensor ID | required deployment identity |
| `sensor.version` | config adapter version | producer version |
| `region`, `environment` | absent | not populated |

## `ActionEvent` actor/action/resource/data fields

| Field | Current value | Null/validation behavior |
| --- | --- | --- |
| `actor.type` | `human_user` when actor HMAC exists; absent otherwise | empty actor object permitted |
| `actor.human_user_id` | tenant-scoped HMAC pseudonym | absent without email |
| other actor IDs/email/IP | absent | never populated |
| `delegation_chain` | empty list | no agent/workload delegation captured |
| `action.type` | `mcp.tool.call` | hard-coded |
| `action.operation` | `tools/call` | hard-coded protocol operation |
| `action.boundary` | `post_execution` or `pre_upstream` | derived from upstream flag |
| other action fields | absent | method/intent not populated |
| `resource.type` | `mcp_tool` | hard-coded |
| `resource.id` | locally generated tool entity ID | deterministic normalized composite |
| `resource.backend_id` | safe backend ID | source context |
| `resource.tool_name` | safe tool name | source context |
| other resource fields/attributes | absent/empty | app/provider/owner/classification not populated |
| `data.input_labels` | sorted safe label list | deduplicated and secret-screened |
| `data.output_labels` | sorted safe label list | same |
| refs/hashes/sensitivity | absent | raw payload references/hashes not captured |

## `ActionEvent` outcome fields

| Field | Current value | Derivation |
| --- | --- | --- |
| `decision` | empty contract default | current observe mapper does not ingest legacy decision |
| `execution.status` | `blocked`, `error`, or `success` | block wins; otherwise response error; otherwise success |
| `execution.upstream_called` | bool | source coerced to bool |
| `execution.latency_ms` | optional integer | complete handler elapsed time |
| `execution.upstream_status_code` | absent | not captured |
| `execution.error_code` | absent | not captured |
| `usage` | empty contract default | tokens/cost not captured |
| `evidence` | empty contract default | no external evidence refs |

## `MetricEvent` fields

| Field | Call-count record | Latency record |
| --- | --- | --- |
| `schema` | `starliner.metric_event.v1` | same |
| `schema_version` | `1` | same |
| `tenant_id` | current tenant | same |
| `metric_name` | `mcp.tool.calls` | `mcp.tool.latency_ms` |
| `metric_type` | `counter` | `histogram_sample` |
| `value` | `1` | `max(0, int(latency_ms))` |
| `unit` | absent | `ms` |
| `dimensions.backend_id` | safe backend ID | same |
| `dimensions.tool_name` | safe tool name | same |
| `dimensions.status` | final status | same |
| `occurred_at` | shared mapper timestamp | same |

## Current `FindingSignal` fields

| Field | Current value |
| --- | --- |
| `schema` | `starliner.finding_signal.v1` |
| `schema_version` | `1` |
| `tenant_id` | current tenant |
| `signal_id` | deterministic hash of tenant, derived request, backend, tool |
| `signal_type` | `mcp_tool_blocked` |
| `primary_entity` | current tool entity reference |
| `actor_entity` | absent |
| `source_event_id` | derived action request ID |
| `confidence` | `1.0` |
| `severity_hint` | `medium` |
| `reason_codes` | input and/or output native DLP block code |
| `attributes.input_blocked` | source boolean |
| `attributes.output_blocked` | source boolean |
| `occurred_at` | shared mapper timestamp |

## `SafePayloadSummary` fields

| Field | Current population |
| --- | --- |
| `argument_keys` | empty default |
| `argument_size_bytes` | absent |
| `argument_hash` | absent |
| `result_size_bytes` | absent |
| `result_hash` | absent |
| `data_labels` | union of safe input/output labels |
| `risk_labels` | non-safe/non-allowed DLP outcome values after safe-label filtering |
| `error_class` | `native_dlp_block`, `upstream_error`, or absent |

## `DeliveryEnvelope` fields

| Field | Type/allowed values | Current origin |
| --- | --- | --- |
| `tenant_id` | non-empty string | canonical body |
| `record_type` | contract registry name | derived from body `schema` |
| `schema_version` | string matching `starliner.*.vN` | body `schema`; despite name, not integer |
| `sensor_id` | non-empty string | config |
| `adapter_version` | non-empty string | config |
| `contract_version` | literal `starliner.sensor.v1` | config/default; incompatible override fails model validation |
| `certification_id` | non-empty string | config |
| `runtime_instance_id` | non-empty string | config |
| `record_origin` | `live_sensor`, `selftest`, `synthetic`, `fixture`, `legacy_backfill`, `manual_import` | config; default `live_sensor` |
| `evidence_quality` | `audit_grade`, `operational`, `best_effort`, `debug_only`, `fixture` | config; default `operational` |
| `occurred_at` | non-empty string | mapper timestamp |
| `request_id`, `flow_id`, `span_id` | optional strings | copied only when body has them |
| `idempotency_key` | non-empty string | mapper stable ID scoped by tenant, sensor, lifecycle parts |
| `body_hash` | `sha256:<64 hex>` | canonical JSON of body |
| `record_hash` | `sha256:<64 hex>` | envelope without record hash plus canonical body |
| `safe_summary` | strict bounded object | mapper summary or empty defaults |

## `starliner_outbox` fields

| Column | Meaning | Lifecycle |
| --- | --- | --- |
| `outbox_id` | local auto-increment key | created on enqueue; deleted at terminalization |
| `tenant_id` | delivery tenant | copied from envelope |
| `sensor_id` | producer sensor | copied from envelope |
| `record_type` | canonical record family | copied from envelope |
| `idempotency_key` | replay identity | unique with tenant/sensor/type |
| `body_hash` | canonical body digest | copied |
| `record_hash` | envelope+body digest | copied |
| `status` | pending/retry/in-flight during active lifecycle | mutated by claim/retry |
| `attempt_count` | delivery attempts already recorded | incremented on retry/claim behavior per repository methods |
| `next_attempt_at` | due time | set for pending/retry |
| `lease_until` | in-flight lease expiration | set at claim; cleared on release/retry |
| `last_error_code` | safe normalized failure code | set on retry/release |
| `last_safe_error` | generic safe text | no raw remote response retained |
| `payload_json` | complete validated delivery record | retained only in active table |
| `created_at` | first enqueue time | immutable |
| `updated_at` | latest local transition | mutable |

## `starliner_terminal_delivery` fields

| Column | Meaning |
| --- | --- |
| `terminal_id` | local auto-increment key |
| tenant/sensor/type/idempotency/hashes | retained delivery identity/integrity |
| `status` | accepted, duplicate, rejected, or failed terminal |
| `evidence_id` | safe bounded remote ID when accepted/duplicate |
| `last_error_code`, `last_safe_error` | bounded terminal error metadata |
| `attempt_count` | total attempt count retained by repository |
| `retry_count` | derived retry count |
| `created_at` | original enqueue time |
| `terminal_at` | terminal transition time |

No payload JSON column exists in the terminal table.

## Configuration data points

The complete current `STARLINER_*` field list and validation semantics will be
cross-linked from `11-configuration-reference.md`. Defaults verified in
`ObserveConfig` include batch `100`, max active rows `10,000`, retry base `1s`,
retry cap `60s`, max attempts `8`, poll `2s`, pending tasks `1,000`, and
shutdown drain `5s`.

