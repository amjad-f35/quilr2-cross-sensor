# Runtime entry points

The exhaustive structural candidate list is [evidence/entrypoint-candidates.md](evidence/entrypoint-candidates.md). This chapter classifies actual and development entry points.

| Entry point | Invocation evidence | Initialization and loop | Shutdown/failure |
| --- | --- | --- | --- |
| `gateway.py:app` | Docker `CMD uvicorn gateway:app --host 0.0.0.0 --port 8005 --proxy-headers`; can also import from ASGI | Import-time DB/service wiring; ASGI lifespan; request loop owned by Uvicorn | Lifespan stops background tasks and closes connections; import/start failures propagate |
| `gateway.py::__main__` | `python gateway.py` | Calls `uvicorn.run(app, host=GATEWAY_HOST, port=GATEWAY_PORT, proxy_headers=True)` | Uvicorn owns signal handling |
| `workflow_runner.app:app` | Documented Uvicorn module target; no scoped container command | FastAPI startup initializes runner DB; 25 internal/control operations | App shutdown; HTTP failures returned by handlers |
| `workflow_runner.worker:main` | `python -m workflow_runner.worker` | Initializes DB, repeatedly leases/executes runs; configurable poll/backoff | `KeyboardInterrupt` returns; per-loop errors logged then backed off |
| `workflow_runner.retention_worker:main` | `python -m workflow_runner.retention_worker` | Periodically deletes expired runner records/artifacts in batches | Same loop/backoff model |
| `workflow_scheduler.worker:main` | `python -m workflow_scheduler.worker` | Polls/claims due schedules, bounds concurrent dispatches, calls runner/gateway | Logs loop failures and backs off; process interruption exits |
| `clickhouse_sync_utils.syncer:main` | `tools/sync_sqlite_to_clickhouse.py` delegates to it | Parses CLI, initializes schemas, one-shot or continuous SQLite→ClickHouse sync | CLI exit codes; continuous modes sleep/retry |
| `google_workspace.server:mcp` | `google_workspace/Dockerfile` runs the FastMCP server | Eager secret lookup, Google auth provider, nine registered tools | Missing `mcp_secrets` or secrets is startup-fatal |
| `example_backend.py:mcp_app` | `python example_backend.py` | FastMCP ASGI app, three tools and two resources, port 8001 | Development-only Uvicorn |
| `example_mcp_servers/math_mcp.py:mcp` | module execution/FastMCP convention | Four arithmetic tools | Example only |
| `mcpgateway-rs/src/main.rs::main` | `cargo run`/built binary; no scoped deployment wiring | Loads `Config`, initializes `AppState`, composes 45 Axum routes/static service, binds TCP | `?` propagates configuration, DB, bind, and server errors |
| `tools/probe_remote_mcp_servers.py:main` | direct Python CLI | Loads test target catalog, concurrently probes remote MCP servers, writes result JSON | Per-target errors recorded; CLI status |
| `tools/probe_lazy_auth.py:main` | direct Python CLI | Exercises lazy-auth behavior and emits structured results | Probe failures become result records |
| `tools/summarize_lazy_auth_probe.py:main` | direct Python CLI | Reads probe output and summarizes | Input/parse errors propagate |
| `debug_repro_mcp_loop.py:main` | direct Python | Reproduces MCP reconnect behavior | Diagnostic; network errors reported |
| `diagnose_mcp_reconnect_loop.py:main` | direct Python | Inspects data/log evidence for reconnect loops | Diagnostic |
| `decode_token.py:main` | direct Python with argv | Decodes JWT components for inspection | Nonzero return for invalid input |
| `reset_dcr_credentials.py:main` | direct Python | Mutates stored DCR credentials after confirmation/arguments | Administrative/destructive; DB/network errors propagate |
| `reset_office365.py:main` | direct Python | Resets Office 365 integration state | Administrative/destructive |
| `run_dev.sh` | shell launcher | Loads env files, validates optional Starliner mode, runs Uvicorn with optional reload | `set -euo pipefail`; locally fails on empty `reload_args` under the tested shell when reload disabled |
| `Jenkinsfile` | Jenkins shared-library pipeline | Selects Dockerfile name, builds/pushes image through `codexBuild` | No scoped test stage; behavior of shared library is unresolved |

## Main gateway inputs and outputs

Inputs include environment variables from `constants.py`, ASGI requests, SQLite state, remote IdP/MCP/ZIA/embedding/ClickHouse responses, and static files. Outputs include HTTP/JSON-RPC/SSE/WebSocket responses, SQLite/ClickHouse writes, outbound HTTP/MCP calls, logs, and background queue/outbox records.

The application does not expose a single graceful “stop” API. Shutdown is initiated by the hosting ASGI server and handled by the lifespan context.

## Test and build entry points

- `pytest.ini` sets `testpaths = e2e_test`; therefore `pytest` searches that directory and excludes the twelve top-level `test_*.py` paths by default. Eleven contain pytest test functions; `test_cloud_app_control.py` is a diagnostic `main` script despite its name.
- `requirements.txt`, `token_saving_requirements.txt`, `google_workspace/requirements.txt`, `mcpgateway-rs/Cargo.toml`, the two Dockerfiles, and `Jenkinsfile` are build/dependency entry points.
- `mcpgateway-rs/Cargo.lock` is committed generated dependency resolution, not an executable entry point.

`Unresolved:` no scoped Compose, Kubernetes, Helm, Terraform, systemd, supervisor, or release manifest starts the runner, scheduler, retention worker, syncer, Google server, or Rust process.
