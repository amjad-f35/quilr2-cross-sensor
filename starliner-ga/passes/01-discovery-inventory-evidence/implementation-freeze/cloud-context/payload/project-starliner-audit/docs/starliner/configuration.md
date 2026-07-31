# Starliner Configuration

Config is read from environment variables via
`starliner.sdk.config.StarlinerConfig.from_env()` and is dependency-light
(stdlib + dataclass) so it is cheap to import on a hot path.

## Environment variables

| Variable | Default | Meaning |
| --- | --- | --- |
| `STARLINER_ENABLED` | `false` | Master switch. When false, behaves like `off`. |
| `STARLINER_MODE` | `off` | `off` \| `observe` \| `shadow` \| `enforce`. |
| `STARLINER_DECISION_URL` | unset | Decision API `POST /v1/decide` endpoint. |
| `STARLINER_EVENTS_URL` | unset | Event ingest `POST /v1/events/batch` endpoint. |
| `STARLINER_API_TOKEN` | unset | Sensor auth bearer token. |
| `STARLINER_SENSOR_ID` | unset | Stable sensor instance id. |
| `STARLINER_SENSOR_TYPE` | `llm_gateway` | `llm_gateway` \| `mcp_gateway` \| ... |
| `STARLINER_ENVIRONMENT` | `local` | `local` \| `dev` \| `staging` \| `prod`. |
| `STARLINER_DECISION_TIMEOUT_MS` | `150` | Hot-path decision timeout. |
| `STARLINER_EVENT_TIMEOUT_MS` | `500` | Event flush timeout. |
| `STARLINER_EVENT_BATCH_SIZE` | `50` | Max events per flush batch. |
| `STARLINER_EVENT_FLUSH_INTERVAL_MS` | `1000` | Suggested flush cadence. |
| `STARLINER_FAIL_MODE` | `use_existing_gateway_behavior` | Global fail behavior. |
| `STARLINER_FAIL_MODE_OVERRIDES` | unset | `action=fail_mode,...` per-action/per-sensor overrides. |
| `STARLINER_CAPTURE_PAYLOADS` | `false` | Whether payloads may be captured. |
| `STARLINER_CAPTURE_PAYLOAD_MAX_BYTES` | `4096` | Max captured payload bytes. |
| `STARLINER_HASH_PAYLOADS` | `true` | Hash instead of storing secrets. |
| `STARLINER_DEBUG` | `false` | Verbose SDK logging. |

## Modes

| Mode | Decision API | Enforced | Events |
| --- | --- | --- | --- |
| `off` | no | no | no (except optional `sensor.config.loaded`) |
| `observe` | no | no | yes |
| `shadow` | yes | no | yes |
| `enforce` | yes | yes | yes |

Helpers: `config.is_active`, `config.calls_decision_api`,
`config.enforces_decision`, `config.emits_events`.

## Fail behavior

`FailMode` values:
- `allow` — proceed on decision failure.
- `deny` — block on decision failure.
- `use_existing_gateway_behavior` — proceed; the gateway's own guardrails still run.

Resolve the effective fail mode with
`config.fail_mode_for(action_type=..., sensor_type=...)`. Priority is
action override, then sensor override, then global. Recommended defaults are in
[`hook-map.md`](hook-map.md): model/tool listing fail open, high-risk tool calls
and OAuth/admin fail closed, event emission always fails open.

Shadow mode never enforces, so a decision failure in shadow never changes
behavior regardless of fail mode.
