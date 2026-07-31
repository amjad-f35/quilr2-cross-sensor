# Analysis Scope

## Pinned authority

| Item | Value |
| --- | --- |
| Repository | `quilrbusiness/quilr-ai-config-manager` |
| Branch | `quilr-preprod` |
| Commit | `68132e67d0b494d52aac01a1ad811c03faf21550` |
| Primary target | `better-console-backend/` |
| Supporting deployment scope | root `Dockerfile`, `Jenkinsfile`, README and GitHub workflow/precheck files |
| Explicitly out of primary symbol scope | `compliance-dlp/`, `config-manager-server/`, generic root tests; these are sibling processes packaged by the root image |

**Verified:** the target git tree contains 1707 tracked files. The full path/blob ledger is `generated-analysis/file-inventory.csv`.

**Secret handling:** the tracked `.encryption_key` was classified and hashed by git blob identity; its contents were not reproduced. Environment examples marked secret-like are redacted in generated tables.

## Methods

1. Git-tree inventory and blob classification.
2. Lexical Rust declaration indexing across all 469 Rust files. This is not a full Rust type-checker; compilation supplies the semantic gate.
3. TypeScript compiler parsing across all 1,128 TS/JS-family files, with zero parse diagnostics.
4. OpenAPI traversal, route-table extraction, environment inventory, migrations/config/docs review.
5. Locked builds, lint/typecheck/tests, real SPA build, and exact GitHub run/job inspection.
6. Repository-wide reference searches for registrations, imports, routes, storage, environment reads, background tasks, and unfinished work.

## Scope limits

- **Unresolved:** no local `.env`; therefore live ClickHouse, PostgreSQL, Redis, Neo4j, Azure, provider, or service calls were not authorized/possible.
- **Unresolved:** Docker was unavailable, so the multi-process image was source-reviewed but not built or started.
- **Unresolved:** the private Nexus tarball graph was not accessible. A source-identical Kit 3.0.2 checkout was built for isolated frontend verification; this is not a byte-for-byte validation of the published tarball.
