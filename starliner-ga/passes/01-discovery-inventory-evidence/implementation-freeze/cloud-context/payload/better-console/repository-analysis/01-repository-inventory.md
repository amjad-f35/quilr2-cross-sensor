# Repository Inventory

Every target file appears directly in `generated-analysis/file-inventory.csv` with file type, role, importance, generated/vendored status, byte count, blob SHA, mode, and analysis status.

## By top-level directory

| Path group | Tracked files |
| --- | --- |
| frontend | 1156 |
| src | 468 |
| docs | 22 |
| for_console_assist | 16 |
| scripts | 12 |
| (root) | 11 |
| for_coding_agents | 7 |
| for_user_facing_frontend_agent | 6 |
| migrations | 5 |
| .cargo | 1 |
| .github | 1 |
| helper_scripts | 1 |
| openapi | 1 |

## By file type

| File type | Count |
| --- | --- |
| .ts | 821 |
| .rs | 469 |
| .tsx | 304 |
| .md | 56 |
| .png | 14 |
| .json | 8 |
| .sh | 6 |
| .py | 5 |
| .sql | 5 |
| .toml | 2 |
| .gitignore | 2 |
| .html | 2 |
| .encryption_key | 1 |
| .example | 1 |
| .yml | 1 |
| symbolic link | 1 |
| .lock | 1 |
| [none] | 1 |
| .nvmrc | 1 |
| .prettierignore | 1 |
| .js | 1 |
| .cjs | 1 |
| .mjs | 1 |
| .svg | 1 |
| .css | 1 |

## Classification results

- 689 files are generated. The dominant family is `frontend/src/api/generated/`, derived from `openapi/platform-admin-v2.json` through Orval. `Cargo.lock` and `package-lock.json` are generated dependency resolution artifacts.
- No vendored tree was found.
- `AGENTS.md` is the sole symlink and resolves to `CLAUDE.md`.
- 218 paths are test-like by deterministic path/name classification.
- `frontend/dist/`, `target/`, and `node_modules/` are generated and ignored; they are not in the 1,707 tracked-file denominator.

## Supporting deployment files

`generated-analysis/supporting-file-inventory.csv` contains eight root files with SHA-256 digests. These files are required to understand production packaging but do not expand the target symbol denominator.

## Inventory table

The requested columns are present exactly in the CSV. Grouping in this narrative does not replace the direct per-file rows.
