# Starliner Repository Discovery

This note records the actual current-checkout state of the LLM and MCP gateway
repositories so Starliner integration is designed against real code, not against
stale assumptions. The architecture overview in
[`docs/production-gateways-architecture.md`](../../../docs/production-gateways-architecture.md)
was used only as a starting map; every hook point below cites a file, function,
or class verified in the live checkout.

> Status: Pass 1 (foundation) discovery. No gateway code is modified in this
> pass. Citations are line-referenced at time of writing and may drift; treat
> the symbol names as the stable anchor.

## 1. Surfaces present in the workspace

| Surface | Repo path | Framework | Entry |
| --- | --- | --- | --- |
| macrodata LLM/DLP gateway | `macrodata-refinement/DataClassifier` | BlackSheep (ASGI, async) | `blacksheep_app.py` |
| Standalone LLM router | `quilr-llm-gateway` | Falcon + gevent WSGI (sync) | `router_app.py` |
| MCP gateway | `quilr-llm-gateway/mcpgateway` | FastAPI (async) | `gateway.py` |

There are therefore **three** sensor surfaces with **two** concurrency models
(async for BlackSheep/FastAPI, sync/gevent for Falcon). This is the core reason
the SDK must ship both async and sync-compatible clients.

## 2. macrodata LLM/DLP gateway (BlackSheep, async)

### 2.1 Chat/completion entrypoint
- Route registration: `DataClassifier/blacksheep_app.py:551`
  `app.router.add_post("/openai_compatible/chat/completions", openai_chat_completions)`
  (also `/openai_compatible/v1/chat/completions` at line 552 and Azure deployment
  variants at 577-578).
- Handler: `DataClassifier/handlers/llmgateway/openai_compatible.py:1459`
  `async def openai_chat_completions(request: Request, deployment: str = None) -> Response`.

### 2.2 Provider/model resolution
- `DataClassifier/handlers/llmgateway/openai_compatible.py:1434`
  `def get_label_to_provider_map(quilr_settings, provider_settings, api_key_settings)`
  plus the routing helpers imported from
  `handlers/llmgateway/api_key_utils/app_config.py` (`resolve_routing_model_credentials`,
  `find_routing_group`, `ROUTING_MODE_REQUEST_COUNT`, `ROUTING_MODE_TOKEN`).

### 2.3 Request-side guardrails / DLP
- `DataClassifier/handlers/llmgateway/guardrails_utils_async.py:178`
  `async def process_risk_detection_async(...)` is the request/response DLP entry.
- DLP fan-out over NATS uses `DataClassifier/nats_client.py`
  (`subscribe_and_publish_detection_requests`, stream `DLP_REQUESTS` subjects
  `dlp.req.*`, replies on `dlp.res.*`).

### 2.4 Enforcement mechanics (block/redact/monitor)
- Outcome bookkeeping in
  `DataClassifier/handlers/llmgateway/performance_logger_async.py:21`
  `class PerformanceLoggerAsync` (`start_request` at line 37, `end_quilr_processing`
  builds `actions_and_categories` with `blocked/monitored/anonymized`).
- Synthetic block responses are produced inside the chat handler in
  `openai_compatible.py` (the same module owns streaming chunk shaping such as
  `_stream_openai_chat_response_dict`).

### 2.5 Response-side / hallucination
- `DataClassifier/handlers/llmgateway/hallucination_check_async.py:265`
  `async def request_hallucination_check_async(...)` (NATS `dlp.req.hallucination`).

### 2.6 Logging / state writes
- ClickHouse-first config + SQLite local copy: `DataClassifier/llmgateway_database.py`
  (`class DatabaseManager`, encrypted provider settings, `quilr_gateway.db`).
- Async log queue: `DataClassifier/db_write_queue.py` publishing `db.writes`.
- Storage ownership contract: `DataClassifier/llmgateway_databases.md`.

### 2.7 Request IDs / correlation
- `PerformanceLoggerAsync.generate_request_id` (`performance_logger_async.py`) creates
  `request_id`; `conversation_id` is read from request metadata
  (`handlers/llmgateway/request_metadata.py`). No `flow_id` concept exists yet.

### 2.8 Paths that must stay unchanged when Starliner is off
- All `app.router.add_*` routes in `blacksheep_app.py` (health/liveness/readiness
  at 435-437, DLP `/v2/stream/detect` at 452, gateway proxy routes at 551+).
- The streaming generator path in `openai_compatible.py`.

## 3. Standalone LLM router (Falcon + gevent, sync)

### 3.1 Entry + middleware stack
- `quilr-llm-gateway/router_app.py` builds the Falcon app with middleware order:
  `CORSMiddleware` (`router_app.py:30`), then from `quilr-llm-gateway/middleware.py`:
  `QuilrAPIKeyMiddleware` (`middleware.py:7`, `process_request` at 28),
  `RiskDetectionMiddleware` (`middleware.py:177`),
  `LoggingMiddleware` (`middleware.py:200`).

### 3.2 Chat/completion entrypoint
- `quilr-llm-gateway/handlers/unified_completions_handler.py:168`
  `class UnifiedChatCompletionsHandler` with `def on_post(self, req, resp, **kwargs)`
  at line 174 (synchronous Falcon resource).

### 3.3 Guardrails / provider / logging
- Guardrails: `quilr-llm-gateway/prediction_integration.py`
  (`check_content_for_risks_with_disabled`, local `v2_prediction_utils`).
- Provider passthrough: `quilr-llm-gateway/openai_passthrough.py`.
- Metrics: `quilr-llm-gateway/performance_logger.py` (`class PerformanceLogger`).
- State: `quilr-llm-gateway/database.py` (`class DatabaseManager`, SQLite).
- Axis queue: `quilr-llm-gateway/axis_log_queue.py` + `axis_logger_loop.py`.

### 3.4 Concurrency constraint
- This surface runs under gevent WSGI (`run.sh` Gunicorn `--worker-class gevent`).
  Any Starliner call here must be sync-safe and must not call `asyncio.run()`
  inside a request handler.

## 4. MCP gateway (FastAPI, async)

### 4.1 Tool-call entrypoint
- `quilr-llm-gateway/mcpgateway/routes/mcp.py:998` `@router.post("/{backend_id}/mcp")`
  (and `@router.get("/{backend_id}/mcp")` at line 940).
- Dispatch: `quilr-llm-gateway/mcpgateway/services/mcp_handler.py:404`
  `async def handle_request(...)` on `class MCPHandler`.
- OneMCP aggregation: `quilr-llm-gateway/mcpgateway/services/onemcp_handler.py:729`
  `async def handle_request(...)` on `class OneMCPHandler`.

### 4.2 Backend / tenant / token resolution
- `routes/mcp.py` helpers `_get_backend_or_slug`, `_resolve_tenant_from_token`,
  `_extract_bearer_token`; registry in `services/registry.py` (`class BackendRegistry`).
- OAuth/proxy/API tokens: `services/oauth_proxy.py` (`class OAuthProxyService`),
  `db/oauth_repository.py` (`ApiTokenRepository`).

### 4.3 Input/output DLP
- `quilr-llm-gateway/mcpgateway/services/dlp_service.py:40` `def process_input(...)`
  and `:145` `def process_output(...)` on `class DLPService` (returns
  `DLPResult` with outcome `allowed|blocked|redacted|monitored`).

### 4.4 Logs / events / state
- Tool-call logs: `db/log_database.py` (`tool_call_logs`, `mcp_logs.db`).
- Event logs: `db/event_log_database.py` (`events`, `mcpgateway_logs.db`) via
  `services/event_logging_service.py` (`EventLoggingService.log_event`,
  fire-and-forget `asyncio.create_task`).
- Main state: `db/connection.py` (`gateway.db`, in-memory `BackendRegistry`).

### 4.5 Paths that must stay unchanged when Starliner is off
- `@router.post("/{backend_id}/mcp")` JSON-RPC semantics and error shapes.
- `MCPHandler.handle_request` tool serialization (preserves `_meta`,
  `structuredContent`, `inputSchema`).
- OAuth flows in `routes/oauth.py`.

## 5. Concurrency + dependency implications for the SDK

1. Async clients are required for BlackSheep (`openai_chat_completions`) and
   FastAPI (`MCPHandler.handle_request`).
2. Sync-compatible clients are required for the Falcon/gevent router
   (`UnifiedChatCompletionsHandler.on_post`).
3. No SDK call may invoke `asyncio.run()` inside an existing event loop; the sync
   client must use its own transport (e.g. a blocking HTTP call), not a wrapped
   coroutine driven by `asyncio.run`.
4. Existing local enforcement (`PerformanceLoggerAsync`, `DLPService`,
   guardrails) is reused as the obligation executor; Starliner does not add new
   enforcement mechanics in the gateways.
