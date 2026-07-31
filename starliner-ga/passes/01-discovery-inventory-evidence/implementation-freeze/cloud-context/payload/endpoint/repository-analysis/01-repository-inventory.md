# 01 — Repository Inventory

## Exact tracked-path totals

| Repository | Tracked paths | Notes |
| --- | ---: | --- |
| `sentinel-endpoint-agent` | 876 | Includes the `libs/lib-ipc-event-bus` Git submodule pointer; its pinned 108-path tree was initialized and inventoried separately. |
| `sentinel-dashboard` | 251 | No Git submodules were found. |
| `ipc-event-bus` | 30 | No Git submodules were found. |
| **Total** | **1,157** | Counts are from `git ls-files -s` at the pinned revisions. |

The endpoint submodule expands to 108 tracked paths at commit `9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b`. Counting the superproject Gitlink and the expanded dependency tree separately produces **1,265 analysis inventory records**. This is deliberate: the Gitlink is a superproject configuration datum, while the expanded paths are runtime/build dependency source.

## Complete appendices

Every tracked Git path is represented directly in the following inventory tables:

- [Endpoint agent](01-inventory-sentinel-endpoint-agent.md)
- [Endpoint-pinned IPC dependency tree](01-inventory-sentinel-endpoint-agent-pinned-ipc-submodule.md)
- [Dashboard/API server](01-inventory-sentinel-dashboard.md)
- [IPC library](01-inventory-ipc-event-bus.md)

The first-pass `Role` and `Importance` fields are structural classifications. They do not establish runtime reachability. The `Generated/Vendored` and `Analysis Status` fields will be revised only after provenance and substantive content are inspected.

## Preliminary top-level distribution

### Endpoint agent

The largest tracked groups are `core/` (314 paths), `system-monitor/` (141), `proxy/` (118), `infra/` (69), `docs/` (59), `scripts/` (34), and `template-service/` (29). The repository includes 562 Rust files and 143 Markdown files. Large committed archives include test decompression inputs and packaging-tool artifacts; each is now classified in the per-path appendix and relevant subsystem chapter.

**Final classification:** all 876 endpoint paths have final per-file analysis/provenance statuses. Seven endpoint paths are classified as generated artifacts: four exported alert-diagram PNGs, one Draw.io editor backup, one compiled macOS installer archive, and one committed runtime log. Two paths are classified as vendored: the SSL.com CodeSignTool JAR and its upstream release notes. Development certificate/key files remain individually analyzed committed credential artifacts rather than silently grouped as generated. Template-service icons are byte-identical to core icons but have no verified generator/upstream attribution. Diagnostics operational files, infra sources, proxy Rust/Swift/Objective-C, and the remaining configuration/tests/docs/scripts are classified as handwritten or curated inputs unless their rows state otherwise.

### Dashboard/API server

The principal tracked groups are `api_server/` (103 paths) and `frontend/` (101), followed by `docs/` (15), `.playwright-mcp/` (10), and `app-intel/` (5). The repository includes 72 Go, 32 TSX, 21 TypeScript, 30 CSS, and 20 SQL files.

### IPC library

The repository contains 30 tracked paths: 14 Rust files, five shell scripts, five Markdown files, two Cargo manifests, one PowerShell script, one CI workflow, one CODEOWNERS file, and one `.gitignore`.

### Endpoint-pinned IPC dependency versus current IPC `main`

**Verified:** the endpoint pins IPC commit `9ce5b25…` with 108 paths and three workspace crates (`ipc-light`, `ipc-light-broker`, and `ipc-light-macro`). The separately requested IPC repository is at `0cf45bc…` with 30 paths and only `ipc-light`. A Git ancestry check returned false for `9ce5b25…` as an ancestor of current `main`; the pinned commit is visible on another fetched history/branch. Direct tree comparison shows 106 changed paths, including removal from current `main` of the broker, macro, duplex implementation, many tests, benchmarks, examples, and detailed documents. The two revisions must therefore be analyzed as distinct interfaces rather than as interchangeable snapshots.
