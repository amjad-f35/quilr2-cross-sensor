# Documentation consistency audit

Comments and documents were treated as claims and checked against source. The generated [documentation statement ledger](evidence/documentation-statement-ledger.md) and [source-comment ledger](evidence/source-comment-ledger.md) preserve the full corpus.

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| Main entry point initializes three DBs, constructs services, and uses setter wiring | `for_coding_agents/mcpgateway/01-runtime-wiring.md` | `gateway.py` import-time calls/constructors/setters | Confirmed |
| Startup ends with smart-group background sync; shutdown list omits Starliner | same runtime document | `gateway.lifespan` also calls `starliner_runtime.start()` and `stop()` | Partially outdated |
| Router-order example lists auth/backends/QuilrOne/OAuth/MCP/…/store | same runtime document | `gateway.py` includes 20 routers and inserts `starliner_router` before OAuth plus memory/audit/workflow/IdP/v2 routers | Abbreviated/partially outdated, not a complete list |
| Direct and OneMCP paths must remain separate and ordered | `CLAUDE.md`, canonical direct/OneMCP docs | separate route/handler modules and source inclusion order | Confirmed |
| Full API details are at `docs/api-reference.md` | root `README.md` | no such tracked path in scoped branch | Contradicted/broken link |
| Direct Uvicorn command has “same port and host behavior” as `python gateway.py` | root `README.md` | direct command uses `127.0.0.1`; `gateway.py` default is `0.0.0.0` | Contradicted wording |
| Scoped-setting payload has only `tools` and `dlp` top-level keys | `group_level_settings_for_frontend.md` | `ScopedBackendSettingsPatch` also accepts validated `token_saving`; canonical settings doc includes it | Outdated |
| Scoped settings are partial merges, not full backend replacements | frontend notes/canonical settings doc | patch models and `merge_scoped_settings_patch` | Confirmed |
| Main DBs are `gateway.db`, `mcp_logs.db`, `mcpgateway_logs.db` | canonical runtime/data docs | DB path constants and initializers | Confirmed |
| One writable gateway process/replica is supported | canonical runtime and `paas.md` | SQLite plus process-local registry/sessions/confirmations/locks/queues | Confirmed |
| Starliner runtime is optional and private package is installed only when enabled | Docker/canonical Starliner notes | Docker conditional BuildKit-secret installation and optional runtime factory | Confirmed; dependency unavailable locally |
| Google service image copies shared `mcp_secrets.py` from repo root | Google README/Dockerfile | `COPY mcp_secrets.py` and `server.py` import | Confirmed external scoped dependency |
| Admin workflow monitoring has list/summary/per-agent/cancel | workflow frontend/control-plane docs | `routes/workflow_run_admin.py` additionally implements detail, steps, artifact list/detail/preview/download, and rerun | Partially outdated/incomplete list |
| Current workflow status says scheduling, run history, cancel, artifacts, retention, and chat are implemented | `for_coding_agents/workflow_runner/current-status-and-gaps.md` | route/repository/worker/engine implementations and tests | Confirmed |
| Workflow production orchestration is incomplete | same status doc | main Docker/Jenkins start only gateway; no runner/scheduler manifests | Confirmed |
| Delegation-token refresh for long runs is not implemented | same status doc | token mint/resolve exists; no refresh loop/endpoint was found | Confirmed limitation |
| Admin memory APIs are tenant-wide list/detail/delete only; user APIs are owned-memory CRUD | canonical admin/store and memory API docs | route declarations/services | Confirmed |
| “Admin memory management UI” is not implemented | `MEMORY_tools.md` non-goals | REST admin APIs exist, but no memory-specific admin UI is tracked | Confirmed when read as UI, not API |
| Memory-specific DLP, vector search, encryption, and shared delete are absent | `MEMORY_tools.md` | memory service/repository and native-tool path | Confirmed |
| Token-saving uses `tiktoken`/GPT-4o estimates and stores metadata | canonical settings/data docs | token-saving service/log metadata implementation | Confirmed; local cold-cache tests failed on tokenizer download |
| Jenkins selects branch-specific Dockerfiles | `Jenkinsfile` | mappings exist, but `Dockerfile.dev` and `Dockerfile.preprod` do not | Planned/configured but missing artifacts |
| Token-saving supplement pins four versions | `token_saving_requirements.txt` | main `requirements.txt` lists those packages without the same pins | Configuration inconsistency |
| Rust `/api` says MCP/OAuth hot paths remain in Python | Rust route response | Rust route registry contains no MCP/OAuth proxy route | Confirmed |
| Default test suite represents repository tests | no explicit claim; conventional expectation | `pytest.ini` restricts discovery to `e2e_test`, excluding twelve top-level `test_*.py` paths | Important undocumented limitation |
| Current module refactoring stays below 1,100 lines | `e2e_test/test_mcp_module_size_limits.py` invariant | `services/onemcp_client_apps.py` has 1,266 lines | Contradicted by source/test failure |

## Comments that should not be read literally

- “Encrypted” OAuth token column names do not prove encryption; repository methods store strings without `encrypt_secret`.
- “No admin memory management UI” does not mean admin memory REST APIs are absent.
- Exception classes with a `pass` body (`InvalidClientError`, `RunCancelled`, `GoogleAPIError`) are legitimate marker types, not unfinished stubs.
- Starliner manifests intentionally return `deferred` capability statuses when disabled/unconfigured; those strings describe runtime state, not implemented delivery.
- `backup_mcps.json` remote-server notes are probe/catalog observations, not claims about gateway implementation.

## Consistency conclusion

The canonical `for_coding_agents/mcpgateway` documents are generally close to current code and materially more accurate than isolated root/frontend handoffs. They are still not executable specifications: runtime wiring and workflow admin-route lists have drift. Source, router composition, schemas, and tests remain authoritative.
