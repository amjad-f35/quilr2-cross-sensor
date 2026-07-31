# Module and File Reference

## Rust module roots

`src/lib.rs` publicly declares 29 module families: activity topics, analytics, API logging, app scope, app management, auth/authz, browser extension, config, console, Console Assist, conversation cache, custom dashboards, detection models, Endpoint, errors, gateway management, internal admin, inventory icons, LLM insights, local store, MCP, pricing, v2 contracts, policy, query language, routes, saved views, SPA, and state.

## Major source groups

| Group | Role | Evidence |
| --- | --- | --- |
| src/routes | HTTP registration/adapters and legacy/v2 transport | route inventory + Rust symbols |
| src/console | cross-source read models and analytics | Rust symbols/tests |
| src/platform_admin_v2 | typed DTOs, mapping, OpenAPI | OpenAPI + Rust symbols |
| src/auth + auth.rs | identity/session/repository/service | Rust symbols/tests |
| src/local_store + local_store.rs | SQLite schema, refresh, reads | Rust symbols/tests |
| src/activity_topics | classification pipeline, sources, leases, persistence | Rust symbols/tests |
| src/browser_extension | browser analytics/admin/personas/deployment | Rust symbols/tests |
| src/custom_dashboards | AI dashboard lifecycle/execution | Rust symbols/tests |
| frontend/src/pages | lazy and routed product pages | TS symbol index/tests |
| frontend/src/components | feature presentation/composition | TS symbol index/tests |
| frontend/src/api/generated | Orval contract client/models | generated classification |
| docs/for_* | engineering and embedded prompt/help corpora | inventory and include_str/include_dir consumers |

## Exhaustive accounting

Use `generated-analysis/file-inventory.csv` for all 1,707 files and `07-symbol-reference/` for every indexed declaration. Generated Orval files are classified and indexed but grouped to avoid repeating boilerplate prose for hundreds of structurally identical files.
