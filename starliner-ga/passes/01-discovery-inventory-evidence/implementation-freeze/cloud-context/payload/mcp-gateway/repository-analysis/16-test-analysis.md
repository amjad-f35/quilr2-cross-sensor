# Test analysis

## Inventory and discovery

`Verified:` 663 Python `test_*` functions occur in 72 tracked test files:

- 487 functions in 61 files under `e2e_test/`;
- 176 functions in eleven top-level `test_*.py` files.

There are 65 total tracked files under `e2e_test/`; four are configuration/helper/package files without test functions. The scoped root has twelve paths named `test_*.py`; `test_cloud_app_control.py` is a direct diagnostic script with `main`, not a pytest test-function module. The complete case-by-case list, decorators, and docstrings is [evidence/test-case-index.md](evidence/test-case-index.md).

`pytest.ini` sets `testpaths = e2e_test` and `asyncio_mode = auto`. A plain `pytest` does not discover the twelve top-level modules. No scoped Jenkins stage invokes pytest.

## Local default-suite result

Command environment: isolated Python 3.12, installed `requirements.txt`, `pytest`, and `pytest-asyncio`; bytecode and pytest cache disabled.

Result: **568 passed, 6 failed, 1 xfailed, 169 warnings** in 6.39 seconds.

| Failure | Verified cause | Classification |
| --- | --- | --- |
| three cases in `e2e_test/test_direct_tool_metadata.py` | `tiktoken` attempted to download `o200k_base.tiktoken`; restricted DNS/network caused `ConnectionError`, so expected result/metadata was absent | Environment/cold-cache dependency exposes an unhandled runtime path |
| `test_refactored_mcp_modules_stay_within_line_limit[services/onemcp_client_apps.py]` | module is 1,266 lines; test ceiling is 1,100 | Source assertion failure/technical debt |
| two cases in `e2e_test/test_starliner_mcp_policy.py` | importing `starliner.mapping` required missing private `starliner_contracts` | Optional dependency unavailable; default public requirements do not make these tests self-contained |

The strict expected failure is `test_unauth_system_slug_should_not_pick_arbitrary_tenant` in `e2e_test/test_documented_issues.py`. It documents that an unauthenticated system slug shared by multiple tenants selects an arbitrary tenant backend for challenge logging instead of returning no ambiguous match.

Warnings included `AuthlibDeprecationWarning` from FastMCP auth and repeated PyJWT `InsecureKeyLengthWarning` for the checked-in test/default HMAC key.

## Top-level test result

Collecting all twelve modules together stopped with two import errors:

- `test_starliner_observe_runtime.py`;
- `test_starliner_outbox_repository.py`;

both import `starliner_contracts` at module load. One additional test was skipped during that collection.

Re-running the ten collectable modules produced **112 passed, 10 failed, 1 skipped, and 33 passing subtests**.

Failure groups:

| Group | Cases | Cause |
| --- | ---: | --- |
| Legacy/observe Starliner adapter/handler | 6 | missing `starliner.adapters` and/or `starliner_contracts`; handler returned generic internal error instead of tested shadow/enforce result |
| Repository-root Starliner scripts | 3 | tests expect `scripts/install_starliner_runtime.sh` and `scripts/validate_starliner_runtime_env.sh`, outside the requested `mcpgateway/` checkout |
| Development launcher | 1 | `run_dev.sh` empty `reload_args` expansion fails with `set -u` when reload disabled |

These results demonstrate why top-level tests must not be reported as passing or CI-covered.

## Test categories and mapped behavior

| Category | Representative files | Verified behavior |
| --- | --- | --- |
| Authentication/tenant isolation | external admin, user claims, domain policy, cross-tenant, provider login tests | JWT/user/admin resolution, provisioning restrictions, provider flows, negative tenant access |
| Direct MCP transport/auth | MCP protocol HTTP, auth errors, OAuth passthrough, cookie shortcut, refresh/self-heal, tool metadata | JSON-RPC/SSE behavior, auth challenges, token branches, metadata/logging |
| OneMCP | capabilities, metadata, rich clients, connections, diagnostics, memories, concurrency, inflight | aggregate/native tools, event/session behavior, client metadata, permissions |
| Backend/store/settings | capabilities, store v2/custom OAuth, scoped settings, upstream API key | registration/discovery, catalog install, scope merge, static credential modes |
| Logging/security signals | tool failure logging, rejected requests, detailed OAuth signals, log export/analytics | persistence, filters, export authorization, failure classification |
| Memories | admin/user APIs, review/permissions/wiring | CRUD, tenant/user boundaries, native tool behavior |
| Workflow | workflow agents, runner, scheduler | drafts/publish/access/quotas/runs/chat/artifacts/leases/schedules |
| Starliner | e2e policy and top-level adapter/observe/outbox/certification tests | optional-dependency modes, payload safety, delivery/outbox/contracts |
| Tools/infrastructure | ClickHouse sync, lazy auth, smart groups, transport validation | schema/transforms/probes/snapshot/fallback/transport helpers |
| Structural constraints | route split and module-size tests | OneMCP route ownership and file size ceiling |

## Fixtures and isolation

`e2e_test/conftest.py` configures temporary database/data paths, imports/reloads gateway modules, supplies ASGI HTTP clients, and creates tenant/auth/backend fixtures. Helper factories create identities, backends, tokens, and OAuth state directly. Tests use monkeypatch/mocks for remote HTTP/MCP/ClickHouse/Starliner behavior.

`Potential issue:` direct repository/factory setup can validate service behavior without validating the corresponding public creation route. Both forms are useful but are not equivalent end-to-end coverage.

## What tests do not establish

- No tracked browser E2E harness drives the static UI.
- No live IdP, remote MCP, DLP, ZIA, embedding, ClickHouse, Google Workspace, or private Starliner service is exercised by the local suite.
- No Docker-image test, multi-process deployment test, multi-replica test, migration-from-production-snapshot test, load/performance test, fuzz/property test, or dependency vulnerability scan is present.
- No Rust tests are present.
- CI execution is not established; the scoped Jenkinsfile has no test stage.

## Contradictions revealed by tests

- The source's “refactored module size” invariant is currently false for `onemcp_client_apps.py`.
- Public requirements are insufficient for all default-discovered Starliner tests when the optional private dependency is absent.
- Top-level optional-dependency tests assume parent-repository scripts not contained in the documented service subtree.
- `run_dev.sh`'s reload-disable path is intended and tested but fails in the observed shell environment.

## Coverage conclusion

Static test archaeology is complete for all 663 functions. Dynamic execution is partial but measured. A high pass count should not be converted into line/branch coverage: no coverage report was generated or tracked, and important operational integrations remain mocked/unavailable.
