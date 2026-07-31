# API and interface reference

## Complete operation indexes

The following generated tables are part of this interface reference:

- [275 active Python gateway HTTP/WebSocket operations](evidence/active-interface-registry.md), each with method, fully composed path, file/line/symbol, response model when declared, and route-local authentication evidence;
- [25 workflow-runner HTTP operations](evidence/active-interface-registry.md#secondary-decorated-interfaces-25);
- [45 Rust Axum operations](evidence/rust-interface-registry.md);
- [18 FastMCP tools/resources](evidence/mcp-tool-resource-registry.md);
- [every route handler's request parameters, execution logic, calls, errors, and candidate tests](07-symbol-reference/python-symbol-index.md).

The operation table and corresponding symbol entry together are the endpoint-level record. This avoids replacing exact signatures with a lossy hand-written schema.

## Python gateway route families

| Implementation | Operations | Interface and authorization model |
| --- | ---: | --- |
| `gateway.py` | 30 | Pages, health/API metadata, detailed diagnostics, smart groups/ZIA; authorization is handler-specific |
| `routes/auth.py` | 19 | Login, user/company/admin/domain/catalog administration; admin/user dependencies and explicit token checks |
| `routes/backends.py` | 27 | Backend CRUD/probe/capability/settings/scoped-policy/API-token/upstream-auth plus user views |
| `routes/mcp.py` | 3 | Direct MCP GET/SSE, POST JSON-RPC, DELETE termination; custom multi-branch MCP authentication |
| `routes/quilrone_mcp_routes.py` | 6 | Tenantless and tenant OneMCP GET/POST/DELETE |
| `routes/quilrone_oauth_routes.py` | 28 | OneMCP OAuth/OIDC discovery, registration, authorize/token, and platform callbacks |
| `routes/quilrone_connect_routes.py` | 2 | Tenant OneMCP connect UI callback |
| `routes/oauth.py` | 29 | Direct-backend OAuth discovery/DCR/proxy/callback/token/revoke and user preference/static-auth |
| `routes/entra_auth.py` | 15 | Entra, Google, and Auth0 admin/user SSO initiate/complete/logout |
| `routes/store.py` | 10 | MCP store/catalog/request/install/uninstall, including v2 reads |
| `routes/logs.py`, `log_export.py` | 10 | Admin/user analytics and key-authorized export |
| `routes/admin_dashboard.py`, `admin_audit.py` | 10 | platform status, rejected requests, smart/memory settings, audit/rollback |
| `routes/admin_memories.py`, `user_memories.py` | 9 | tenant-admin and current-user memory CRUD/status |
| `routes/clients.py` | 6 | agent/client access and custom agents |
| `routes/workflow_agents.py` | 57 | agent/version/binding/tool/readiness/run/chat/schedule/quota/internal-resolution APIs |
| `routes/workflow_run_admin.py` | 11 | tenant-admin run list/detail/summary/steps/artifacts/preview/download/cancel/rerun |
| `routes/starliner.py` | 3 | public manifest and admin metrics/self-test |

## FastAPI transport behavior

- Pydantic request models validate JSON bodies and produce FastAPI's standard 422 response when validation fails before handler entry.
- `HTTPException` status/detail values in each handler are indexed under “Failure behavior” in the Python symbol reference.
- Route dependencies such as `get_current_admin`, `get_current_user`, internal-token dependencies, and explicit header comparisons determine 401 versus 403 behavior.
- Browser/download/preview/SSE operations return `Response`, `FileResponse`, `StreamingResponse`, or framework-specific bodies rather than a declared Pydantic response model.
- CORS applies to the whole Python app. The configured origin regex defaults to match all origins and credentials are enabled.

`Unresolved:` generated OpenAPI output was not used as authority because many JSON-RPC/SSE/custom response handlers do not fully declare response schemas. The implementation signatures and tests are authoritative here.

## Direct MCP interface

`routes/mcp.py` exposes `GET`, `POST`, and `DELETE` on `/{backend_id}/mcp`.

The POST handler resolves the backend and identity through workflow delegation, OAuth passthrough, API-token/MCP-user, proxy-token, or legacy raw-token branches before calling `MCPHandler.handle_request`. It accepts MCP JSON-RPC, applies policy/DLP/optional Starliner/logging around remote dispatch, and returns JSON-RPC or transport-specific responses.

GET establishes the supported streaming behavior. DELETE performs client-side session termination; direct and upstream sessions are not treated as one shared session. MCP transport headers such as `Mcp-Session-Id`, `Last-Event-ID`, and protocol version are explicitly excluded from ordinary upstream header forwarding so the gateway/upstream SDK negotiates its own session.

**Generated example from verified MCP fields and tests:**

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

This example demonstrates framing only. It does not imply that a particular backend accepts unauthenticated `tools/list`.

## OneMCP interface

Tenantless paths use `/quilrone/mcp`; tenant paths use `/quilrone/{tenant_id}/mcp`. Matching OAuth metadata and proxy endpoints are registered in both path forms.

OneMCP aggregates tools/resources/prompts from allowed backends, rewrites/namespaces remote capabilities, supplies native memory/helper/connection tools, manages process-local sessions and event replay, and can request user confirmation. Its handler is `services.onemcp_handler.OneMCPHandler`, not `MCPHandler`.

The exact OAuth route duplication is intentional in source: well-known metadata is served both before and below the `/quilrone` prefix to accommodate clients.

## OAuth/OIDC interfaces

The gateway implements:

- OAuth authorization-server and protected-resource metadata;
- OpenID configuration forwarding/synthesis;
- dynamic client registration;
- authorize/login/callback/connect-complete;
- token, revoke, status, and disconnect;
- platform Entra/Google/Auth0 initiation/callback;
- static user-required upstream authentication.

Authentication and authorization vary by operation: discovery endpoints are public; admin/user management operations require gateway identity; token/authorize endpoints validate OAuth client, redirect, code, state, PKCE, or provider data in service/repository code. Exact inputs are the Pydantic models and handler signatures in `routes/oauth.py`, `routes/quilrone_oauth_routes.py`, and `routes/entra_auth.py`.

## Workflow runner HTTP interface

`workflow_runner/app.py` declares 25 operations for runs, steps, artifacts, chat sessions/messages/turns/steps/artifacts, cancellation, and internal control. It is a separate ASGI application. The internal runner token is validated on protected operations. Gateway workflow routes proxy/translate user and admin operations to this service through `GatewayControlClient`/runner HTTP helpers.

## FastMCP tools and resources

The Google server registers:

- Gmail: `search_gmail_messages`, `get_gmail_message`, `create_gmail_draft`, `send_gmail_message`;
- Calendar: `list_google_calendars`, `list_google_calendar_events`, `get_google_calendar_event`, `create_google_calendar_event`, `update_google_calendar_event`.

Tool annotations explicitly distinguish read-only, write, modify, and destructive intent. Pydantic `Annotated`/`Field` declarations in `google_workspace/server.py` are the input schema. Authentication is provided by `GoogleWorkspaceAuthProvider`.

The example backend registers three tools and two resources; the math example registers four tools. Exact names and implementation locations are in the FastMCP registry.

## Rust interface

`mcpgateway-rs` serves pages and a dashboard/user/log/backend/client API subset. Its own `/api` response explicitly states that MCP/OAuth proxy hot paths remain in Python. It uses its own JWT/admin-token helpers and does not inherit Python middleware. No route for direct MCP proxying appears in the 45-route Rust registry.

## CLI interfaces

| Command/module | Inputs | Outputs/side effects |
| --- | --- | --- |
| `clickhouse_sync_utils.syncer.main` | argparse mode, interval/batch/env-file/config options | creates ClickHouse schema, reads SQLite, writes ClickHouse/snapshot, continuous loop or one-shot status |
| `tools.probe_remote_mcp_servers` | target JSON, concurrency/timeouts/output args | remote probes and JSON result file |
| `tools.probe_lazy_auth` | target and auth/probe options | structured lazy-auth result |
| `tools.summarize_lazy_auth_probe` | probe result input | terminal/structured summary |
| `decode_token.py` | token argv | decoded header/payload diagnostic; no signature guarantee implied |
| reset scripts | backend/integration IDs and confirmation/config | mutate OAuth/DCR/integration state |
| debug/diagnostic scripts | URLs, IDs, database/log context | network or diagnostic output |

Exact argparse declarations/defaults and `main` return behavior are in their symbol entries.

## File/environment/framework interfaces

- SQLite schemas and runtime artifact files: [data/storage reference](09-data-models-and-storage.md).
- Environment/build settings: [configuration reference](11-configuration-reference.md).
- Browser UI consumes gateway JSON routes from `static/*.js`.
- ASGI extension points are FastAPI middleware, exception handler, lifespan, mounted static files, and router decorators.
- FastMCP decorators are the Google/example plugin interface.
- Axum `.route`/`.merge` and Tower layers are the Rust extension points.

No GraphQL, gRPC, Kafka/message-queue, webhook receiver registry, or separately defined SDK package is present in the scoped tree.
