# Analysis state

## Completed

- Pinned `add_gateway` at `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a` and inventoried all 351 scoped tracked paths.
- Read manifests, build/configuration files, repository instructions, root documents, and canonical `for_coding_agents` documents.
- Generated direct file records, full symbol indexes, name/call/path reference ledgers, route/API registries, DDL, configuration, test, documentation, and source-comment evidence.
- Parsed all 259 Python files without errors and indexed all 16 Rust files.
- Ran the default and top-level Python tests; results are recorded in `16-test-analysis.md`.
- Created linked narrative chapters `00` through `21`.

## Important verified facts

- `gateway.py` performs import-time database initialization and constructs/wires most process-wide services; its lifespan loads the registry, performs best-effort maintenance, starts smart-group sync and optional Starliner observation, then drains/closes resources at shutdown.
- Direct `/{backend_id}/mcp` and aggregate `/quilrone[/...]/mcp` flows are separate handler stacks.
- The workflow control plane, workflow runner, and scheduler are separate process entry points, but the scoped Dockerfile starts only the gateway.
- Three main SQLite databases, a workflow-runner database/artifact store, optional ClickHouse analytics, and multiple process-local caches/locks/session stores carry state.
- The Python gateway exposes 275 statically composed HTTP/WebSocket operations; the workflow runner exposes 25; Rust exposes 45; FastMCP examples/Google expose 18 tool/resource declarations.

## Pending dynamic questions

See `20-open-questions.md`: private Starliner ABI/package, out-of-scope scripts and secret helper, deployment topology, effective secrets/configuration, remote services, and Rust parity remain unverified.

## Terminology

- **Direct MCP:** `routes/mcp.py` plus `services/mcp_handler.py`.
- **OneMCP/QuilrOne:** aggregate MCP surface under `routes/quilrone*.py` plus `services/onemcp*.py`.
- **Control plane:** workflow agent/draft/publish/schedule APIs and repositories in the gateway process.
- **Runner:** separate `workflow_runner` HTTP process and worker loops.
- **Scheduler:** separate `workflow_scheduler` process.
- **Starliner observe:** optional outbox/export path in `starliner/`; distinct from the older `services/starliner_adapter.py` enforcement adapter.
