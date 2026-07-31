# Build, Deployment, and Operations

## Local/CI verification contract

`scripts/verify.sh` performs npm CI, optional Chromium install, OpenAPI export, Orval generation, frontend checks, browser tests, generated drift checks, Rust fmt, Clippy, tests, and build. It stops at first failure.

## Container

Root `Dockerfile` uses Node 24, a Rust builder matching the Python runtime Debian codename, XMLSec/OpenSSL development libraries, BuildKit secrets, and a final non-root Python image. The SPA is built once and copied into the Rust build. The final image contains the Rust binary, pricing JSON, GeoLite database, Claude CLI/runtime, and two Python services.

## Deployment evidence

- Jenkins is the documented build/push path and creates ephemeral Nexus configs.
- Root GitHub workflow delegates to `ci-scripts`. Exact run 30564245241 at the pinned commit had detection success and build job skipped; **Contradiction:** a green workflow conclusion is not evidence that this target built.
- The subtree-local GitHub workflow runs `scripts/verify.sh` on `main`/PR in a standalone-root layout; its effective execution in this monorepo/branch is unresolved.

## Operations

`/health` checks main ClickHouse connectivity. Topic state is visible through structured logs/read models, not health. No metrics exporter/tracing backend configuration is implemented in Rust. Root deployment must monitor ports 8000, 8282, and 2002 independently.
