# Analysis coverage

## Snapshot metrics

| Measure | Result |
| --- | ---: |
| Tracked files discovered | 351 |
| Files with direct static-analysis records | 351 |
| Text-decodable files parsed or inspected | 346 |
| Binary/opaque files classified | 5 |
| Python files parsed | 259 |
| Python parse failures | 0 |
| Rust files indexed | 16 |
| JavaScript/shell/HTML executable-like files indexed | 13 |
| Indexed symbols and assignments | 6,584 |
| Active Python gateway HTTP/WebSocket operations | 275 |
| Workflow-runner HTTP operations | 25 |
| Rust Axum routes | 45 |
| FastMCP tool/resource declarations | 18 |
| Literal DDL fragments indexed | 255 |
| Executable or explicitly declared environment/build names indexed | 130 |
| Python test functions indexed | 663 |
| Test files containing Python tests | 72 |

`Verified static coverage:` Every tracked path has an inventory row and a direct file-reference entry. Every Python file parsed successfully. Every test function, route decorator, literal DDL fragment, environment access form covered by the semantic scanner, and indexed declaration is linked from an evidence ledger.

`Partial runtime coverage:` The default pytest suite ran locally under Python 3.12 with public requirements installed: 568 passed, 6 failed, and 1 xfailed. The twelve top-level test files are outside `pytest.ini`'s default `testpaths`; collecting them together stopped on two missing-`starliner_contracts` import errors. Re-running the ten collectable top-level files produced 112 passed, 10 failed, 1 skipped, and 33 passing subtests. See [test analysis](16-test-analysis.md).

## File status

| Status | Count | Meaning |
| --- | ---: | --- |
| Fully statically accounted for | 351 | Direct file record plus source/declaration/schema/asset classification |
| Partially runtime-verified | 72 test files and imported dependencies | At least one local test collection/execution attempt; failures recorded |
| Generated | 2 verified, 1 generated-looking/unresolved | Cargo lockfile; timestamped probe results; `backup_mcps.json` unresolved generator |
| Vendored | 6 | Three vendor JavaScript files and three Font Awesome fonts |
| Intentionally skipped | 0 tracked files | No tracked path was omitted from classification |

The five opaque files are the three WOFF2 fonts, `static/favicon.ico`, and `static/quilr.png`. Their contents were not symbol-analyzed; size/hash/provenance and consumers are recorded in the file reference.

## Subsystem checklist

- [x] Root instructions, manifests, configuration, and build/deployment files
- [x] `gateway.py` startup, middleware, dependency wiring, pages, diagnostics, and shutdown
- [x] All `routes/`, including direct MCP, OAuth, OneMCP, store, memories, workflow, audit, and Starliner
- [x] All `services/`, including registry, handlers, policy/DLP, auth, logging, discovery, token saving, workflows, and OneMCP helpers
- [x] All `db/` repositories and initialization/migration DDL
- [x] `models/`, `utils/`, Starliner integration, ClickHouse sync, workflow runner, and scheduler
- [x] Google Workspace and example FastMCP servers
- [x] Rust package
- [x] Static application assets and vendored assets
- [x] Test suite, fixtures/data, tools, reset/debug/diagnostic scripts
- [x] All scoped documentation and consistency comparison

## Remaining dynamic gaps

- `Unresolved:` a production deployment and its effective environment values;
- `Unresolved:` private `starliner_contracts`/Starliner packages and repository-root Starliner scripts outside the requested scope;
- `Unresolved:` parent-repository CI workflows or infrastructure not located under `mcpgateway/`;
- `Unresolved:` Google Workspace startup with the repository-root secret helper;
- `Unresolved:` live OAuth/OIDC, remote MCP, ZIA, embedding, ClickHouse, and workflow-runner integrations;
- `Unresolved:` Rust compilation and behavioral parity;
- `Unresolved:` runtime discovery results for dynamically selected remote MCP servers.

## Completion statement

The scoped repository analysis is **complete for tracked-file classification and static source archaeology** and **partial for runtime/integration verification**. It must not be described as 100% operationally verified because the private dependencies, out-of-scope root helpers, remote services, Rust build, and deployment environment were unavailable.
