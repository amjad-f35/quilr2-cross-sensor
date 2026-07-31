# Executive overview

## What this subtree implements

`Verified:` `mcpgateway/` contains a Python FastAPI gateway for registering and proxying MCP backends, an aggregate “OneMCP” endpoint, OAuth and upstream-auth mediation, tenant/user administration, policy and DLP checks, structured logging and analytics, an MCP catalog/store, native memory tools, and a workflow control plane. It also contains three separately started workflow processes, a standalone SQLite-to-ClickHouse synchronizer, a Google Workspace FastMCP server, demonstration MCP servers, and an incomplete Rust dashboard/API slice.

The primary process is `gateway.py:app`. It serves both browser HTML/static assets and JSON/JSON-RPC/SSE/WebSocket interfaces. Most service objects are constructed at module import, injected into route modules through explicit setter functions, and retained as process-wide state.

## Principal runtime surfaces

| Surface | Verified implementation | Status |
| --- | --- | --- |
| Main gateway | `gateway.py`, 20 included router objects, 275 HTTP/WebSocket operations | Primary implementation |
| Direct MCP | `routes/mcp.py` → `services/mcp_handler.py` at `/{backend_id}/mcp` | Active |
| OneMCP aggregate | `routes/quilrone*.py` → `services/onemcp*.py` at `/quilrone/...` | Active, distinct from direct MCP |
| Workflow control plane | `routes/workflow_agents.py`, `routes/workflow_run_admin.py`, workflow repositories/services | Active gateway surface |
| Workflow runner API | `workflow_runner/app.py`, 25 operations | Separate process |
| Workflow execution worker | `workflow_runner/worker.py` | Separate process |
| Retention worker | `workflow_runner/retention_worker.py` | Separate process |
| Schedule worker | `workflow_scheduler/worker.py` | Separate process |
| ClickHouse synchronizer | `tools/sync_sqlite_to_clickhouse.py` → `clickhouse_sync_utils.syncer.main` | Separate process |
| Google Workspace MCP | `google_workspace/server.py`, nine tools | Separate FastMCP process; scoped import dependency unresolved |
| Python examples | `example_backend.py`, `example_mcp_servers/math_mcp.py` | Development/examples |
| Rust gateway slice | `mcpgateway-rs/src/main.rs`, 45 Axum routes | Partial parallel implementation; no scoped deployment wiring |

## Actual architectural characteristics

- `Verified:` SQLite is the system of record for gateway configuration, identities, OAuth state/tokens, catalog, memories, workflows, logs, events, and delivery outboxes. The main process divides this across `gateway.db`, `mcp_logs.db`, and `mcpgateway_logs.db`. The runner defaults to `workflow_runner.db` plus a filesystem artifact directory.
- `Verified:` optional ClickHouse is an analytics/smart-group destination/source, not the gateway's primary transactional store.
- `Verified:` backend definitions are loaded from SQLite into `BackendRegistry.backends`, creating a process-local read/routing cache.
- `Verified:` OneMCP sessions, confirmations, event queues, OAuth refresh locks, logging queues, and several caches are process-local. Checked-in PaaS guidance consequently recommends one container/replica.
- `Verified:` workflow runs use database rows and leases to coordinate runner/scheduler processes. The scoped Dockerfile starts only `gateway:app`; deployment of the other processes is not supplied.
- `Verified:` direct MCP and OneMCP have different route stacks and handlers. A change to `services/mcp_handler.py` does not automatically change `services/onemcp_handler.py`.

## Important findings

1. `gateway.py` performs three synchronous database initializations at import time before ASGI lifespan startup. An initialization exception therefore prevents application import.
2. Startup treats registry loading as fatal but treats catalog cleanup/seed/backfills, expired-OAuth cleanup, smart-group warm-up, and optional Starliner start as best-effort.
3. The default CORS origin pattern is permissive and credentials are enabled. Origin validation uses the same configurable pattern.
4. Credential-like defaults and committed OAuth/client secrets exist in `constants.py`. This analysis does not reproduce them.
5. OAuth token columns named `*_encrypted` are written/read as plaintext by the OAuth repositories; static upstream credentials use Fernet encryption.
6. Logs can contain MCP arguments, response information, identity and authorization-header-derived context. Redaction is targeted, not a repository-wide guarantee.
7. The configured default tests do not include the twelve top-level `test_*.py` files. The scoped `Jenkinsfile` contains no test stage.
8. The default suite currently includes a failing size-limit assertion: `services/onemcp_client_apps.py` is 1,266 lines against a tested 1,100-line ceiling.
9. The Docker/Jenkins branch mapping references `Dockerfile.dev` and `Dockerfile.preprod`, neither of which exists in this subtree at the pinned commit.

## What remains unverified

`Unresolved:` effective production configuration, private Starliner packages, parent-repository scripts/CI, remote OAuth/MCP/ZIA/ClickHouse services, the Google secret helper, and Rust behavioral parity. These gaps do not reduce the tracked-file inventory, but they prevent a claim of complete operational verification.
