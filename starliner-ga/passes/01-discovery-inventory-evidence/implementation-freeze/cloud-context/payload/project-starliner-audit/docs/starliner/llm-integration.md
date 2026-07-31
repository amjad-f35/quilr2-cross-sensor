# LLM Gateway Integration (Pass 2)

This is the guide the LLM adapter PR follows. It does not modify the gateway in
Pass 1. Hook points and the must-not-change paths are cited in
[`repo-discovery.md`](repo-discovery.md) and [`hook-map.md`](hook-map.md).

## Surfaces

- macrodata BlackSheep gateway (async): `openai_chat_completions` in
  `DataClassifier/handlers/llmgateway/openai_compatible.py` -> use
  `SensorRuntime` (async).
- Standalone Falcon router (sync/gevent):
  `UnifiedChatCompletionsHandler.on_post` in
  `handlers/unified_completions_handler.py` -> use `SyncSensorRuntime`.

## Pre-provider hook (chat completion)

After the gateway has resolved api key/user/tenant, model/provider, and run any
request-side DLP, before the upstream provider call:

```python
from starliner.adapters import SensorRuntime, build_llm_chat_decision_request
from starliner.sdk.context import RequestContext

ctx = RequestContext.from_headers(tenant_id, request.headers, sensor_id=cfg.sensor_id)
req = build_llm_chat_decision_request(
    cfg, ctx,
    model=model, provider=provider, api_key_id=api_key_id,
    human_user_id=user_id, agent_id=agent_id,
    data_labels=dlp_labels, risk_signals=dlp_signals, streaming=is_stream,
)
result = await runtime.evaluate(req)  # SyncSensorRuntime.evaluate(...) for Falcon
if not result.proceed:
    return existing_synthetic_block_response(result.outcome.reason)
```

Enforcement mapping reuses existing mechanics:
- `deny` -> existing synthetic block response.
- `redact` -> existing anonymization, else deny this phase.
- `monitor`/`warn`/`allow` -> continue; record via existing performance logger.

## Response hook

After the provider response and response-side DLP, before returning to the
client (only where the gateway already buffers enough content). Build an
`llm.response.return` DecisionRequest. For streaming, do not add full-stream
buffering; emit events and enforce only where safe.

## Events

Emit `llm.request.received`, `llm.request.classified`, `llm.decision.applied`,
`llm.provider.requested`, `llm.provider.responded`, `llm.response.classified`,
`llm.request.completed`, and `sensor.error`. Use
`starliner.adapters.llm.llm_request_observations` for provider/model/api-key
entities and relationships.

## Field mapping

| Gateway value | Contract |
| --- | --- |
| `request_id` | envelope `request_id` |
| `conversation_id` | `flow_id` when available |
| `api_key_hash`/id | `actor.api_key_id` |
| `user_email`/jwt | `actor.human_user_id` |
| model/provider | `resource.id` (`provider:model`), `resource.provider` |
| request/response tokens | `cost.request_tokens`/`response_tokens` |
| latency fields | `performance.*` |
| guardrails outcome | `data.labels` + `risk.signals` + decision evidence |

## Off-mode guarantee

With `STARLINER_ENABLED=false` or `STARLINER_MODE=off`, the adapter must not call
the Decision API or emit events, and the cited handlers behave exactly as today.
