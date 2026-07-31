# Starliner Hook Map

Minimal, safe hook points for Starliner integration in each gateway surface.
Every hook is "decide then enforce with existing mechanics, then emit events".
Hooks are added only in the later adapter passes (Pass 2 LLM, Pass 3 MCP); this
document defines the contract those passes must follow.

Legend:
- DR = build + send `DecisionRequest`
- EV = emit `ActionEvent` (+ entity/relationship observations where known)
- ENF = enforce returned decision using existing gateway mechanics

## 1. macrodata LLM gateway (BlackSheep, async)

| Hook | Location anchor | Action type | Operations |
| --- | --- | --- | --- |
| Pre-provider chat | `handlers/llmgateway/openai_compatible.py` `openai_chat_completions` (after provider/model + request DLP, before upstream call) | `llm.chat_completion.invoke` / `.stream` | DR, ENF, EV |
| Response classified | same handler, after provider response / response DLP | `llm.response.return` | DR (where buffering already exists), EV |
| Embeddings | `blacksheep_app.py:557` `openai_embeddings` | `llm.embedding.invoke` | DR, ENF, EV |
| SDK guardrails | SDK guardrail route handler | `llm.sdk_guardrail.check` | DR (optional), EV |
| Admin key change | `blacksheep_app.py:505+` api-key routes | `llm.admin.api_key.*` | DR (only if actor/tenant known), EV |

Enforcement mapping (reuse existing mechanics):
- `deny` -> existing synthetic block response in `openai_compatible.py`.
- `redact` -> existing anonymization; else treat as deny this phase.
- `monitor`/`allow` -> continue; record via `PerformanceLoggerAsync`.

Streaming rule: pre-provider decision happens before the stream starts. Do not
add full-stream buffering. Response enforcement only where the gateway already
buffers enough content.

## 2. Standalone LLM router (Falcon/gevent, sync)

| Hook | Location anchor | Action type | Operations |
| --- | --- | --- | --- |
| Pre-provider chat | `handlers/unified_completions_handler.py` `UnifiedChatCompletionsHandler.on_post` (after `QuilrAPIKeyMiddleware`/`RiskDetectionMiddleware`) | `llm.chat_completion.invoke` | DR, ENF, EV |
| Response classified | same handler, after passthrough response | `llm.response.return` | DR/EV where buffered |

Concurrency rule: use `SyncDecisionClient` / `SyncEventClient`. Never call
`asyncio.run()` inside `on_post` (gevent worker).

## 3. MCP gateway (FastAPI, async)

| Hook | Location anchor | Action type | Operations |
| --- | --- | --- | --- |
| Pre-tool-call | `services/mcp_handler.py` `MCPHandler.handle_request` (after backend/tool/token resolved + `DLPService.process_input`, before upstream forward) | `mcp.tool.call` | DR, ENF, EV |
| Tool output | same, after `DLPService.process_output` | (output classification event) | EV |
| OneMCP call | `services/onemcp_handler.py` `OneMCPHandler.handle_request` | `mcp.onemcp.tool.call` | DR, ENF, EV |
| tools/list | `MCPHandler.handle_request` list branch | `mcp.tools.list` | EV (Phase 1); filter later |
| Backend register/update/delete | `routes/backends.py` | `mcp.backend.*` | DR (if authenticated actor), EV |
| OAuth/token | `routes/oauth.py`, `services/oauth_proxy.py` | `mcp.oauth.*`, `mcp.proxy_token.issue` | EV (+DR for token issue) |

Enforcement mapping (reuse existing mechanics):
- `deny` -> JSON-RPC error (`code -32003`, "Denied by policy").
- `redact` -> existing `DLPService` redaction only if tool schema stays valid; else deny.
- `require_approval` -> JSON-RPC error indicating approval required.
- `route_override` -> unsupported in Phase 1 unless OneMCP routing already maps it.

## 4. Off-mode invariants

When `STARLINER_ENABLED=false` or `STARLINER_MODE=off`:
- No `DecisionRequest` is built or sent.
- No event is emitted (except an optional startup `sensor.config.loaded` health
  event if explicitly enabled).
- All cited routes/handlers behave byte-for-byte as today.

## 5. Per-action fail behavior (defaults the adapters must request)

| Action | Default fail behavior |
| --- | --- |
| `llm.provider.models.list` / `mcp.tools.list` | fail open (allow) |
| `llm.chat_completion.*` low-risk | fail open monitor |
| `mcp.tool.call` high-risk / production write | fail closed (deny) |
| `mcp.oauth.*`, `llm.admin.api_key.*` | fail closed |
| event emission | fail open (never block the request) |

The SDK supports a global fail mode plus these per-action/per-sensor overrides.
