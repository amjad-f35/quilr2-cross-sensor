# Module and file reference

Every tracked file has a direct entry under [06-file-reference](06-file-reference/README.md). The following map explains directory responsibility and dependency direction.

| Area | Files | Responsibility | Direct reference |
| --- | ---: | --- | --- |
| Root application/config/docs/scripts | 42 | Main app, constants, DLP, examples, diagnostics, build and handoff docs | [root](06-file-reference/root.md) |
| `routes/` | 22 | FastAPI transport/controller layer | [routes](06-file-reference/routes.md) |
| `services/` | 58 | MCP handlers, registries, auth/OAuth, policy, discovery, logging, memories, workflows, OneMCP | [services](06-file-reference/services.md) |
| `db/` | 34 | SQLite connections, schemas, repositories, settings/outboxes/snapshots | [database](06-file-reference/db.md) |
| `models/` | 6 | Pydantic and enum transport/domain structures | [models](06-file-reference/models.md) |
| `utils/` | 14 | Domain, transport, HTTP, ID, display, claims, and serialization helpers | [utilities](06-file-reference/utils.md) |
| `starliner/` | 10 | Observe mapper, payload safety, outbox/export/runtime | [Starliner](06-file-reference/starliner.md) |
| `workflow_runner/` | 12 | Runner API, engine, repositories, worker, retention, artifacts | [runner](06-file-reference/workflow-runner.md) |
| `workflow_scheduler/` | 3 | Due-schedule claim and dispatch worker | [scheduler](06-file-reference/workflow-scheduler.md) |
| `clickhouse_sync_utils/` | 2 | ClickHouse schema/synchronization implementation | [ClickHouse](06-file-reference/clickhouse-sync-utils.md) |
| `google_workspace/` | 10 | Standalone Google Workspace FastMCP service | [Google Workspace](06-file-reference/google-workspace.md) |
| `mcpgateway-rs/` | 18 | Partial Axum/SQLx dashboard API port | [Rust](06-file-reference/mcpgateway-rs.md) |
| `e2e_test/` | 65 | Default pytest-discovered tests and fixtures | [e2e tests](06-file-reference/e2e-test.md) |
| Top-level tests | 12 (included in root group) | Starliner, smart group, transport, sync, probe tests excluded by default `testpaths` | [root](06-file-reference/root.md) |
| `static/` | 20 | HTML/JS/CSS UI, images, vendored browser bundles/fonts | [static](06-file-reference/static.md) |
| `tools/` | 4 | Probe, summarize, and sync CLIs | [tools](06-file-reference/tools.md) |
| `testdata/` | 2 | Remote probe input/output | [test data](06-file-reference/testdata.md) |
| `for_coding_agents/` | 26 | Canonical implementation notes and workflow boundary docs | [documentation](06-file-reference/for-coding-agents.md) |
| `dependencies/` | 2 | Dependency helper/package material | [dependencies](06-file-reference/dependencies.md) |
| `example_mcp_servers/` | 1 | Minimal math FastMCP | [example](06-file-reference/example-mcp-servers.md) |

## Dependency direction

The prevalent Python direction is:

`gateway/route transport → service/handler → repository/utility → SQLite or external client`.

There are intentional exceptions:

- route modules receive service instances through setters, creating module-global back-references;
- `services.mcp_handler` and OneMCP helpers call logging, policy, DLP, Starliner, registry, repository, and remote-transport helpers;
- workflow runner modules call back to gateway HTTP/MCP surfaces;
- `google_workspace/server.py` mutates `sys.path` and imports the out-of-scope repository-root `mcp_secrets`;
- static JavaScript directly knows REST paths and browser storage/cookie conventions.

The complete static import list is [evidence/static-imports.md](evidence/static-imports.md); tracked-path references are recorded in each direct file entry.

## High-complexity files

- `gateway.py` (2,402 lines): main composition root plus UI and detailed-log/ZIA endpoints.
- `services/onemcp_client_apps.py` (1,266 lines): client-app conversion/metadata behavior; violates the checked-in 1,100-line test ceiling.
- `clickhouse_sync_utils/syncer.py` (1,951 lines): schema, migration, read, transform, sync, and CLI loop.
- `workflow_runner/engine.py` (large stateful execution loop): node execution, chat/tool work, cancellation, artifacts.
- `db/connection.py`: monolithic core schema creation and additive migrations.

Line counts and exact declarations for all other files are in the linked direct references.
