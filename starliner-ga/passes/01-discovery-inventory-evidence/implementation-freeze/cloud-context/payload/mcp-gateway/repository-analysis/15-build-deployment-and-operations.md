# Build, deployment, and operations

## Python installation

The primary `requirements.txt` has 22 direct requirement lines. Core packages are exactly pinned for FastAPI, FastMCP, Uvicorn, Pydantic, email/form handling, HTTP/MCP/SSE, JWT/crypto, embeddings/arrays, SQLite/cache, and several token-saving libraries; ClickHouse, dotenv, BeautifulSoup, Markdown, tokenizer, and JSON-TOON use minimum or unpinned versions in places.

`token_saving_requirements.txt` separately pins four transform dependencies, but the main requirements also list them without matching pins. `Contradiction/operations risk:` installation from the main file can resolve newer versions than the token-saving supplement documents.

No Python package metadata (`pyproject.toml`, `setup.py`, wheel configuration) is present. The project is installed as an application directory with requirements on `PYTHONPATH`.

## Main Docker image

`Dockerfile`:

1. starts from `python:3.12-slim`;
2. installs CA certificates and Git;
3. installs `requirements.txt`;
4. optionally installs a pinned private Starliner repository commit when build argument `STARLINER_RUNTIME_ENABLED=true`, using a BuildKit secret header;
5. copies the scoped build context;
6. creates `/app/mcpgateway/data`;
7. exposes 8005;
8. starts `uvicorn gateway:app` with proxy headers.

The BuildKit token is read from a secret mount and not copied into a layer by the Dockerfile. `Unresolved:` the referenced private commit/package ABI could not be inspected.

`.dockerignore` excludes local databases/data, environment files, caches, all `test_*.py`, and `e2e_test/`. The production image therefore cannot execute the tracked tests without a different build context.

The image has no `HEALTHCHECK`, non-root `USER`, read-only filesystem configuration, resource limits, or explicit signal wrapper. Uvicorn is PID 1 through `sh -c`; ASGI lifespan supplies application cleanup.

## Google Workspace image

`google_workspace/Dockerfile` is a separate Python 3.12 image, installs five requirement lines, copies the Google modules and repository-root `mcp_secrets.py`, exposes 3004, and runs `server.py`.

`Verified scoped dependency:` this Dockerfile must be built from the parent repository context, not `mcpgateway/` alone, because `mcp_secrets.py` is outside the requested subtree. Its comments/README also require an encrypted secret file and password, whose helper implementation is out of scope.

## Jenkins

The scoped `Jenkinsfile` loads `quilr-jenkins-shared-library`, sets build context `mcpgateway`, derives image name/tag, selects a Dockerfile by branch, builds, then calls `pushToCR`.

It contains no checkout customization, dependency audit, lint, unit/integration test, vulnerability scan, deployment, rollback, or promotion stage. Those behaviors could exist in the external shared library, which is `Unresolved`.

`Contradiction:` branch mappings select `Dockerfile.dev` for `dev-onprem` and `Dockerfile.preprod` for `quilr-preprod`, but neither file exists in the scoped pinned tree. Other branches, including `add_gateway`, fall back to `Dockerfile`.

## Local development

`run_dev.sh` requires `env_file` by default, optionally layers `env_file.starliner`, selects `.venv`, `GATEWAY_PYTHON`, active virtualenv, or `python3`, sets `PYTHONPATH`, and enables reload unless disabled.

`Verified failure:` under the local macOS Bash used for analysis, `GATEWAY_RELOAD=false` empties `reload_args`, and expansion of `"${reload_args[@]}"` with `set -u` fails as an unbound variable. The top-level test reproduces this.

The root README also shows `python gateway.py` and direct Uvicorn launch. `python gateway.py` binds the configured host default (`0.0.0.0`); one README command uses `127.0.0.1`.

## Rust build

`mcpgateway-rs` is a Rust 2021 package with 16 direct dependencies: Anyhow, Axum, Chrono, Hex, jsonwebtoken, Regex, Serde/JSON, SHA-2, SQLx/SQLite, Thiserror, Tokio, Tower HTTP, Tracing/subscriber, and UUID. `Cargo.lock` is committed generated output.

No Rust Docker stage, Jenkins step, test module, migration command, release profile, or parity test is present in scope. The binary reads existing SQLite/static paths and starts its own server. It is a partial dashboard/API slice, not the deployed Python MCP proxy.

## Database initialization and upgrades

All schema initialization/migration is performed automatically at process import/start by imperative functions. There is no standalone migration CLI/version table. Upgrades rely on idempotent `CREATE IF NOT EXISTS`, column checks/`ALTER`, table rebuilds, and data backfills.

Rollback is not defined. The operational recovery mechanism visible in scope is restoring SQLite files/container volume from external backup; no backup script or tested rollback procedure is included.

## Separate process deployment gap

The architecture requires or supports:

- gateway API;
- workflow runner API;
- workflow execution worker;
- retention worker;
- scheduler;
- ClickHouse synchronizer;
- Google Workspace MCP;
- optional Rust server/examples.

The main Dockerfile starts only the gateway. No Compose/Kubernetes/Helm/Terraform/supervisor/service manifests start the remaining processes. Canonical workflow documents acknowledge that production orchestration is incomplete.

## Health, readiness, monitoring, and debugging

- `/health` reports basic gateway/backend state.
- `/healthx` reports build/runtime diagnostics and conditionally filtered environment detail.
- Rust `/health` queries backend count and time.
- Starliner exposes manifest/metrics/self-test routes.
- Detailed log, analytics, OAuth health/stuck/refresh/challenge/connection routes support operator diagnosis.
- Diagnostic CLIs inspect reconnect loops, tokens, OAuth credentials, and remote MCP behavior.
- Python logs use standard logging; Rust uses tracing and an HTTP trace layer.

There is no distinct readiness versus liveness endpoint, metrics exporter for the whole gateway, distributed tracing setup, alert definition, SLO, log shipper, or dashboard provisioning in scope. PaaS notes describe probes and single-replica operation, but no executable manifest enforces them.

## Release and rollback status

Image tagging and registry push are delegated to the Jenkins shared library. No changelog, semantic release configuration, signed artifact/provenance step, deployment promotion, database backup gate, or rollback automation is scoped. `Unresolved:` parent-repository and platform automation may supply these functions.

## Local verification performed

The analysis installed `requirements.txt`, `pytest`, and `pytest-asyncio` in a temporary Python 3.12 virtual environment. It did not modify the subject tree, build Docker images, compile Rust, or contact production services. Results are in [test analysis](16-test-analysis.md).
