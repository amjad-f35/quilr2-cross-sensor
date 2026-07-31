# MCP Gateway Integration (Pass 3)

This is the guide the MCP adapter PR follows. It does not modify the gateway in
Pass 1. Hook points and must-not-change paths are cited in
[`repo-discovery.md`](repo-discovery.md) and [`hook-map.md`](hook-map.md).

## Surface

- FastAPI MCP gateway (async). Entry: `@router.post("/{backend_id}/mcp")` in
  `mcpgateway/routes/mcp.py`; dispatch `MCPHandler.handle_request` in
  `mcpgateway/services/mcp_handler.py`; OneMCP `OneMCPHandler.handle_request`.
  Use `SensorRuntime` (async).

## Pre-tool-call hook

After tenant/backend/tool/token are resolved and `DLPService.process_input` has
run, before forwarding to the upstream backend:

```python
from starliner.adapters import SensorRuntime, build_mcp_tool_decision_request

req = build_mcp_tool_decision_request(
    cfg, ctx,
    backend_id=backend_id, tool_name=tool_name, app_id=app_id,
    agent_id=agent_id, human_user_id=user_id,
    data_labels=input_dlp_labels,
    environment=tool_env, mutability=tool_mutability,
    onemcp=is_onemcp,
)
result = await runtime.evaluate(req)
if not result.proceed:
    return jsonrpc_error(code=-32003, message="Denied by policy", id=req_id)
```

Enforcement mapping reuses existing mechanics:
- `deny` -> JSON-RPC error (`-32003`).
- `redact` -> existing `DLPService` redaction only if the tool schema stays valid;
  otherwise deny this phase.
- `require_approval` -> JSON-RPC error indicating approval required.
- `route_override` -> unsupported in Phase 1 unless OneMCP already maps it.

## Output hook

After `DLPService.process_output`, emit `mcp.tool.output_classified` and apply an
output decision where the gateway can already block/sanitize a result.

## Management + OAuth hooks

For backend register/update/delete and OAuth/token issuance, primarily emit
events and entity/relationship observations. Enforce only when the route is
authenticated and the actor/tenant is known. Token-like values must be hashed or
referenced via `starliner.sdk.redaction`.

## Events + observations

Emit `mcp.request.received`, `mcp.backend.resolved`,
`mcp.tool.input_classified`, `mcp.decision.applied`, `mcp.backend.requested`,
`mcp.tool.output_classified`, `mcp.request.completed`, `mcp.oauth.event`, and
`sensor.error`. Use `starliner.adapters.mcp.mcp_tool_observations` for
backend/tool entities and `agent called tool` / `tool belongs_to backend`
relationships.

## Field mapping

| Gateway value | Contract |
| --- | --- |
| backend id + tool | `resource.id` (`backend_id:tool_name`) |
| app/provider | `resource.app_id` |
| auth mode/token | `actor` (hashed/ref; never raw token) |
| input/output DLP | `data.labels`, decision evidence |
| tool environment/mutability | `resource.attributes` |

## Off-mode guarantee

With `STARLINER_ENABLED=false` or `STARLINER_MODE=off`, JSON-RPC semantics and
error shapes in `MCPHandler.handle_request` are unchanged, and no Decision API
call or event emission occurs.

## Note on MCP state externalization

RFC-0006 (SQLite/in-memory -> Postgres/Redis/stream) is out of scope for the
adapter PR. The adapter must not make local SQLite the source of platform truth;
it only emits observations the platform consumes asynchronously.
