# Analysis Coverage

| Subject | Count/coverage | Status | Evidence |
| --- | --- | --- | --- |
| tracked files | 1707/1707 | complete | git tree inventory with blobs and classifications |
| supporting root deployment files | 8/8 | complete | hashed and reviewed |
| Rust files | 469/469 | complete | lexically indexed; zero read/scan failures |
| Rust declarations | 7583 | complete index | generated symbol reference; lexical limits documented |
| TS/JS family files | 1128/1128 | complete | TypeScript compiler parse; zero diagnostics |
| TS/JS declarations | 27725 | complete index | generated symbol reference |
| generated files | 689 | classified | Orval client/model output plus lockfile |
| vendored files | 0 | complete | none identified |
| OpenAPI v2 operations | 214 | complete | checked-in specification |
| canonical route rows | 209 | complete at documented path-family row level | source wiring cross-checked |
| OpenAPI schema fields | 2748 | complete for checked-in v2 contract | recursive property expansion |
| environment variables | 130 | complete for .env.example | consumer/default behavior traced in config.rs symbol index |
| Rust tests | 927 discovered; 897 passed; 30 ignored live | complete available environment | real embedded SPA assets |
| frontend tests | 76 files; 537 passed | complete | Node 24.18.1 |
| frontend E2E | not run | unresolved | Playwright browser/install not provisioned; repository has fixtures |
| live stores | 0 connected | unresolved external | .env absent; no credentials |
| container image | not built | unresolved external | Docker unavailable |

## File closure

- Total target files discovered: **1,707**
- Fully classified/accounted: **1,707**
- Partially analyzed: **0** at file-classification level; large generated families are grouped, not skipped
- Generated: **689**
- Vendored: **0**
- Skipped target files: **0**
- Supporting root deployment files: **8/8**

## Symbol closure

- Rust declarations indexed: **7583** across all 469 files; lexical scanner limitations are explicit.
- TS/JS declarations indexed: **27725** across 1,128 files; zero compiler parse diagnostics.
- Symbol references: **56 Markdown files** plus the source CSVs.

## Completion classification

**Repository/source analysis:** complete against the pinned target and supporting deployment files.  
**Development-time dynamic analysis:** complete for all locally executable locked gates, including real SPA embedding.  
**Live integration/deployment analysis:** partial by evidence availability; 30 live tests, Playwright, Docker, stores, and external services remain explicitly unresolved.  
**Production certification:** not performed.
