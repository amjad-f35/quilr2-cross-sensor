# Runtime and Dynamic Verification

# Test Analysis

## Executed results

| Gate | Result | Notes |
| --- | --- | --- |
| cargo fmt --all -- --check | pass | pinned source |
| cargo clippy --locked --all-targets -- -D warnings | pass | placeholder SPA compile path; source code identical |
| cargo test --locked --all-targets | 897 pass, 0 fail, 30 ignored | fresh target with real reconstructed SPA assets; localhost permission granted for mock servers |
| frontend lint | pass with 30 warnings | Fast Refresh only-export-components |
| frontend typecheck | pass | TypeScript 5.9.3 |
| frontend unit | 76 files, 537 pass | Node 24.18.1; Node 26 produced 3 environment failures due localStorage behavior |
| frontend format | pass | Prettier |
| running-server self-test | pass | no live server required |
| frontend production build | pass | 6,920 modules; three chunk-size warnings |
| Playwright SPA E2E | not run | browser binary/dependency path not provisioned |

## Ignored Rust tests

Thirty tests self-declare live dependencies: configured Redis, read-only ClickHouse, PostgreSQL, Neo4j, or authorized tenant data. They are not silently counted as passes.

## Coverage gaps

No live database/service integration, production-like load, container, upgrade, rollback, or chaos test ran. The checked-in E2E fixtures demonstrate intended UI/API behavior but do not prove deployment execution.


## Toolchain

- Rust 1.97.1 / Cargo 1.97.1
- Node 24.18.1 for authoritative frontend run
- Node 26.5.0 demonstrated an incompatible localStorage test environment and is not the CI-pinned runtime
- npm 11.17.0
- native XMLSec installed to compile the pinned SAML crate

## Dependency reconstruction

Original Nexus install returned 401. GitHub Packages did not expose `@quilrbusiness/kit` to the approved token. The private design-system repository at commit `2fc373cadd43322c47d50750a946e7eb70664374` declares version 3.0.2; it was built and packed, then used only in an isolated frontend copy. The checked-in target source was not modified.
