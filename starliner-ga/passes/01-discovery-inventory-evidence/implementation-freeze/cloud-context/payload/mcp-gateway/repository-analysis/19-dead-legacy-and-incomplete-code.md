# Dead, legacy, and incomplete code

## Verified incomplete or explicitly deferred

| Area | Evidence | Status |
| --- | --- | --- |
| Rust external-token authentication | `mcpgateway-rs/src/auth.rs` returns an error stating it is not implemented | Explicitly incomplete |
| Rust MCP/OAuth proxy hot paths | Rust `/api` response and absence from 45-route registry | Explicit partial port |
| Starliner disabled manifest capabilities | `starliner.runtime.DisabledObserveRuntime` marks discovery/call/delivery/record capabilities `deferred` | Intentional disabled-state placeholder |
| Starliner certification coverage | certification module marks native memory, resources read, prompts get, and production ingest delivery deferred | Explicit test/certification gap |
| Starliner delivery authentication | runtime can report `deferred_authentication` when ingest URL exists without bearer configuration | Runtime incomplete configuration state |
| Workflow delegation refresh | current-status document and no refresh implementation found | Not implemented |
| Workflow production orchestration | no scoped runner/scheduler/retention manifests; status doc acknowledges gap | Not implemented in scope |
| Workflow admin frontend | no React/admin workflow implementation; status/frontend docs say external dashboard required | Not implemented in scope |
| Runner LLM API families | `LLMGatewayChatClient` raises `NotImplementedError` for non-`openai_compatible` | Explicit limitation |
| Memory semantic/vector search, memory DLP/encryption, admin/audit UI | memory non-goals plus implementation search | Not implemented |
| Multi-replica coordination | process-local sessions/locks/queues and single-replica docs | Not implemented |

## Legacy compatibility paths

- tenant/subscriber header authentication;
- legacy raw MCP/OneMCP token acceptance;
- legacy `settings.auth_token` plaintext static credential fallback;
- per-slug OAuth callback mode and old DCR/token rows;
- older MCP protocol negotiation constant;
- legacy OneMCP resource URI/tool-group/result forms;
- Starliner pre-tool enforcement adapter distinct from the new observe runtime;
- database column/table migrations and historical company-domain seeds;
- store v1 alongside v2 read APIs.

These paths have callers/registrations and are not dead. Removal would require data/client migration.

## Dead-code candidates after repository-wide search

| Candidate | Search evidence | Caveat |
| --- | --- | --- |
| `constants.DATABASE_URL` | only its declaration; core DB uses `DATA_DIR/gateway.db` | External code importing this module could read it |
| `constants.CORS_ORIGINS` | no scoped consumer; middleware uses `CORS_ALLOW_ORIGIN_REGEX` | Could be retained for backward compatibility |
| `constants.API_V1_PREFIX` | no scoped consumer | Public import by out-of-scope code unresolved |
| `constants.PROJECT_NAME` | no scoped consumer | same |
| `backup_mcps.json` | no scoped path reference or loader; probe tools use `testdata/remote_mcp_servers.json` | Generator/parent-repository consumer unresolved |
| direct `bcrypt` requirement | no scoped Python import | Could be an intentional framework/future dependency |

These are labeled candidates, not proven unreachable, because the parent repository and external imports are outside scope.

## Generated/vendored/opaque artifacts

- `mcpgateway-rs/Cargo.lock`: verified Cargo-generated and runtime/build important.
- `testdata/remote_mcp_probe_results.json`: verified generator metadata points to the remote probe tool.
- `backup_mcps.json`: generated-looking timestamp/catalog snapshot; generator unresolved.
- Font Awesome 6.5.1 and Chart.js 4.4.1 bundles/fonts: vendored with upstream/version headers.
- Tailwind minified browser bundle: vendored by path/content; exact version unresolved.
- `favicon.ico` and `quilr.png`: project assets; original source/generator unresolved.

## Apparent stubs that are not dead

- exception classes whose body is `pass` are used for typed error handling;
- abstracted compatibility re-export modules are imported by tests/current callers;
- route-module `EXPORTED_ENDPOINTS` and dynamic `import_module`/`globals()` wiring are active registration mechanisms;
- `__main__` blocks in tools/examples are CLI entry points even when not imported;
- FastMCP and FastAPI-decorated functions are registered indirectly;
- reset/diagnostic scripts are administrative entry points, not normal service calls.

## Technical debt with active callers

- `services/onemcp_client_apps.py` exceeds its enforced size ceiling.
- `gateway.py` combines composition with many page/analytics/ZIA handlers.
- `clickhouse_sync_utils/syncer.py` combines schema, transformation, CLI, and continuous loop.
- schema evolution is monolithic imperative SQL without versioned migrations.
- default credentials and plaintext OAuth tokens remain active compatibility behavior.
- multiple duplicate tenantless/tenant OAuth route wrappers increase drift risk.
- Python and Rust duplicate dashboard API logic without parity tests.

## Unreachable-code claim policy

No other meaningful symbol is declared dead in this analysis. Generated caller/reference candidates, decorators, dynamic route exports, config strings, tests, scripts, and framework conventions are recorded in the symbol and call ledgers so a future reviewer can make a narrower removal decision.
