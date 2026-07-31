# 21 — Analysis Coverage

## Revisions

| Repository | Branch | Commit |
| --- | --- | --- |
| Endpoint agent | `main` | `a022e52bf2fff6a9445ebad96c3afeaf277e259f` |
| API server/dashboard | `main` | `cd755d37c14b8b86623a15a4dbae41d33b226b2b` |
| IPC library | `main` | `0cf45bc50e4121d6a4521c58f1fa52a97c125e19` |

## Current totals

| Metric | Count / Status |
| --- | --- |
| Files discovered | 1,157 requested-repository tracked paths; 1,265 analysis records after separately expanding the endpoint's 108-path pinned IPC dependency tree |
| Files fully analyzed | 1,265 analysis records (100% file-inventory coverage): current IPC 30; endpoint-pinned IPC 108; dashboard 251; endpoint 876, including its Gitlink and every root/CI/build/deployment/script/tool/test/documentation path |
| Files partially analyzed | 0 |
| Generated files | 29 classified paths: 1 endpoint-pinned IPC `.DS_Store`; 21 dashboard artifacts (2 `.DS_Store`, 15 browser console logs, frontend lockfile, 2 committed `dist` fragments, 1 enrichment output); 7 endpoint artifacts (4 exported alert PNGs, Draw.io editor backup, compiled macOS installer ZIP, runtime log) |
| Vendored files | 2: SSL.com CodeSignTool v1.3.2 JAR and its upstream release notes |
| Skipped files | 0 |
| Packages completed | Current IPC `main`; endpoint-pinned IPC three crates and Gitlink relationship; all dashboard packages/operations; every endpoint workspace package plus the root, CI, build, deployment, distribution, installer, updater, support-tool, root-test, and documentation surfaces |
| Packages remaining | None in the four inventoried trees (three requested revisions plus the separately expanded pinned IPC tree) |
| Symbols documented | 11,180 AST-backed declaration entries plus semantic subsystem references. Eleven entries retain parser-error markers for exact AST shape, but their containing functions/files were manually reviewed; semantic references are not double-counted as additional declarations |
| Entry points verified | Every repository-defined executable, HTTP/UI server root, worker/service bootstrap, framework callback, script/CLI, build workflow, migration/seed path, installer/uninstaller/updater, and test/support server was inventoried and traced to the level supported by repository evidence |
| Features mapped | All implemented, partial, legacy, placeholder, and documentation-only feature groups found across the endpoint, dashboard/API/frontend, current IPC, and pinned IPC trees have code/status/test traceability entries |
| APIs documented | REST routes, broker/IPC protocols, local sockets/pipes, Tauri commands, exported Rust/Go/TypeScript surfaces, CLI/script operations, environment/file interfaces, update/install formats, and test-server controls are documented |
| Configurations documented | Repository-defined environment variables, CLI flags, Cargo features, TOML/JSON/YAML/plist/Compose settings, workflow secrets/build inputs, limits/timeouts, and identified inert or contradictory controls are cataloged |
| Tests inspected | Every tracked test, fixture, benchmark, mock, test script, and checked CI invocation path was inspected. Tests were not executed where required runtimes/targets/credentials were absent; that limitation is recorded per subsystem |
| Unresolved references | External production feature/argument sets, private SDK/services, reusable CI/Jenkins implementations, deployed ACLs/credentials, Apple/Windows runtime semantics, actual artifact publication/rollout, and other evidence outside the checked trees remain explicit in `20-open-questions.md` |
| Untraceable dynamic behavior | Registration/reflection/framework and broker relationships were searched and documented; behavior dependent on external infrastructure, private images/scripts, OS frameworks, live network services, or uncommitted deployment configuration remains labeled `Unresolved` |

## Live checklist

- [x] Required GitHub identity verified as `amjad-f35`.
- [x] All three repositories cloned.
- [x] Exact commits recorded.
- [x] Complete committed-file inventory generated with preliminary structural classification.
- [x] Documentation skeleton completed with substantive analysis.
- [x] Every relevant file assigned a final analysis status.
- [x] Every major feature mapped to code or explicitly labeled documentation-only/unresolved.
- [x] Every repository-defined public interface documented.
- [x] Every discovered configuration name verified against source and indexed.
- [x] Diagrams checked against implementation; non-solid edges labeled.
- [x] Inferences, unresolved behavior, and contradictions audited.
- [x] Dead-code claims checked repository-wide and retained as candidates where external use is possible.
- [x] Documentation links validated: 478 relative file links and 86 heading-anchor links checked with zero broken targets.

`100%` above is path-accounting coverage, not a claim that external runtime behavior is knowable from source alone. Dynamic and external gaps remain listed explicitly rather than treated as verified implementation.
