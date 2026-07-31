# Analysis scope and method

## Pinned source

`Verified:` The analyzed source is the Git sparse checkout:

- Repository: `github.com/quilrbusiness/quilr-llm-gateway`
- Branch: `add_gateway`
- Commit: `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`
- Scoped path: `mcpgateway/`
- Tracked paths in scope: 351

The analysis does not silently use files elsewhere in the parent repository. A scoped file that imports or tests an out-of-scope path is documented as an external scoped dependency. This matters for `google_workspace/server.py` (`mcp_secrets.py` at repository root) and several top-level Starliner tests (`scripts/*.sh` at repository root).

## Procedure

1. Enumerated the pinned tree with `git ls-files`; hashed, classified, and line-counted every tracked path.
2. Read the repository instructions, manifests, configuration, build files, root documents, and all canonical documents under `for_coding_agents/mcpgateway/` and `for_coding_agents/workflow_runner/`.
3. Parsed all 259 Python files with Python's AST. No syntax parse errors occurred.
4. Indexed Rust and browser/shell declarations, imports, call sites, routes, DDL literals, environment access, and test declarations.
5. Reconstructed router composition from `gateway.py`, including the nested OneMCP routers, rather than counting every decorator as an active gateway route.
6. Searched exact symbol names, imports, string names, route registration, configuration keys, schema fields, and test references across the complete scoped tree.
7. Installed `requirements.txt` and test-only PyPI dependencies in an isolated temporary Python 3.12 virtual environment, then ran the configured default suite and the otherwise-excluded top-level tests. The private optional Starliner package was not installed.
8. Compared source behavior with README, canonical coding-agent notes, frontend handoff documents, deployment notes, and tests.

## Static evidence and limitations

`Verified:` There are 6,584 indexed Python/Rust/JavaScript/shell declarations or module-level assignments, 5,410 Python-name reference groups, 2,813 Python/Rust call-terminal groups, 468 tracked-path reference edges, 5,908 documentation statements, and 2,189 source comments. These indexes are navigation aids; they do not prove reachability.

`Unresolved:` Static inspection cannot fully expand third-party framework internals, dynamically computed imports, a live identity provider, remote MCP behavior, the optional private Starliner runtime, or production infrastructure outside `mcpgateway/`. No external database, OAuth provider, Zscaler service, MCP backend, ClickHouse server, or Kubernetes/PaaS deployment was exercised.

`Unresolved:` The Rust package was inspected structurally but not compiled in this analysis. The Google Workspace server cannot import from the scoped checkout alone because `mcp_secrets.py` is intentionally outside scope.

## Classification rules

The inventory separates:

- handwritten runtime source;
- test code and fixtures;
- documentation and operational scripts;
- committed generated artifacts (`mcpgateway-rs/Cargo.lock`, and probe output with embedded generator metadata);
- vendored browser assets whose headers or bundled content establish upstream provenance;
- project-owned opaque assets whose generator/provenance is unresolved.

Generated-looking repetition alone was not used as proof. `backup_mcps.json`, for example, is classified as a generated-looking catalog snapshot with an unresolved generator because no scoped caller or generator was found.

## Reproducible evidence

The analysis helpers are outside the subject tree at:

- `work/analyze_repository.py`
- `work/deep_analyze_repository.py`
- `work/run_deep_mcpgateway.py`
- `work/analyze_mcpgateway_semantics.py`

They generate the inventory and evidence ledgers in this directory. Narrative chapters contain the interpretation and the explicit confidence markers.
