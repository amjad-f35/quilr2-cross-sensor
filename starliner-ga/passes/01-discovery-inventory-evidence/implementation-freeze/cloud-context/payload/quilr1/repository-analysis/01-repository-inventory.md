# Repository inventory

## Inventory basis

Verified: both repositories were inventoried from their tracked default-branch contents using `git ls-files`. Untracked build output and `.git/` internals are excluded from tracked-file coverage. Git history is evidence used elsewhere but is not counted as a repository file.

| Repository | Inventory commit | Tracked files | Accounted for | Pending classification | Complete inventory |
| --- | --- | ---: | ---: | ---: | --- |
| `quilr-query-builder` | `c794c45a9c22b75f101c7c73da508d6e7870f97b` | 328 | 328 | 0 | [Full inventory](inventory/quilr-query-builder-files.md) |
| `quilr-web` | `e6f9d03ddedde756ec447e3fabccdb3a8c418ea9` | 2575 | 2575 | 0 | [Full inventory](inventory/quilr-web-files.md) |
| **Total** | — | **2903** | **2903** | **0** | — |

## Classification rules

- Generated status is asserted only where a standard generator is directly evidenced: `package-lock.json` (npm) and `next-env.d.ts` (Next.js). No source tree is classified as vendored.
- Media assets are grouped as static assets for behavioral analysis but remain listed individually.
- Backup/old filename patterns are only classified as legacy candidates. They are not called unused until import/reference searches have been completed.
- Executable-source status means the complete file was parser-indexed; the generated symbol references preserve exact declarations and bodies, while the narrative chapters explain subsystem behavior and cross-file relationships.
- Static assets and styles are accounted for individually but grouped because they do not expose runtime symbols.

## Top-level repository classification

| Repository | Path/class | Files | Classification |
| --- | --- | ---: | --- |
| `quilr-query-builder` | `src/` | 317 | Java source plus Spring runtime resources |
| `quilr-query-builder` | `.github/` | 5 | CI/security workflows, scripts, ownership |
| `quilr-query-builder` | root | 5 | Maven, Docker, Jenkins, Git ignore, Nexus settings |
| `quilr-query-builder` | `db/` | 1 | SQL reference/query artifact |
| `quilr-web` | `src/` | 2,506 | Next.js App Router pages, React components, state, hooks, types, configuration, assets |
| `quilr-web` | root | 30 | npm/Next/TypeScript/build/runtime configuration, scripts, plans, templates |
| `quilr-web` | `.github/` | 15 | CI/CD/security workflows and repository metadata |
| `quilr-web` | `for_coding_agents/` | 11 | implementation notes/specification evidence requiring code consistency checks |
| `quilr-web` | `deployment/` | 6 | development and preproduction Kubernetes manifests |
| `quilr-web` | editor/session/tooling directories | 5 | `.vscode/`, `.cate/`, `.husky/` |

## Inventory limitations

Verified: neither repository has a configured submodule or tracked Git LFS pointer at the pinned commit.  
Verified: only `quilr-web/package-lock.json` and `quilr-web/next-env.d.ts` are classified as generated; no tracked source subtree is classified as vendored.  
Unresolved: files generated only at build time are absent by design and are documented from build configuration where visible.  
Verified: pinned supporting CI, BFF, ingress, migration, Helm, Jenkins, graph, and common-library repositories were inspected where they resolve target behavior, but they are not added to the two-target inventory denominator.  
Unresolved: current rendered cluster/secret-store/registry state and environment-only overrides are not recoverable from the pinned source repositories.
