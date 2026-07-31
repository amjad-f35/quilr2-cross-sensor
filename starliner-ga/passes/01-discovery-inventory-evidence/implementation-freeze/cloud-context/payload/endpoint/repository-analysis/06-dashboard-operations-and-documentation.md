# Dashboard operations, CI, root artifacts, and documentation audit

This reference accounts for the 44 dashboard paths outside `api_server/v2/`, `frontend/`, and `app-intel/` that are not covered by those subsystem references. It includes the two `api_server/` wrapper paths. Evidence is from dashboard commit `cd755d37c14b8b86623a15a4dbae41d33b226b2b`.

## Complete inventory

| Path or exact group | Count | Type and role | Final classification |
|---|---:|---|---|
| `.DS_Store`, `api_server/.DS_Store` | 2 | Finder metadata | Generated binary host artifacts; tracked but ignored by current `.gitignore`; no runtime role |
| `.dockerignore` | 1 | Root Docker-context exclusions | Active for the frontend root-context build; not active for the API subdirectory context |
| `.gitignore` | 1 | Local Git exclusions | Active development configuration |
| `.env` | 1 | Root environment file | Tracked configuration with concrete database values; not the production Compose env file; used as a possible integration-test dotenv source |
| `.env.dev` | 1 | Development Compose environment | Active for `migrate`, `seed`, and `api_server` in `docker-compose.dev.yml` |
| `version` | 1 | Plain version string (`1.33.96`) | Tracked metadata; no in-repository consumer found |
| `.github/CODEOWNERS` | 1 | Ownership rule | Active only for `.github/workflows/security-ci.yml` |
| `.github/workflows/security-ci.yml` | 1 | Pull-request CI dispatcher | Active GitHub Actions entry point; delegates to an external reusable workflow |
| `.github/scripts/devsecops-precheck.sh` | 1 | Bash local security/lint runner | Active manual script; syntax-checked and analyzed |
| `.github/scripts/devsecops-precheck.ps1` | 1 | Windows PowerShell local security/lint runner | Active manual script; statically analyzed; runtime parse not verified because PowerShell is unavailable |
| `.playwright-mcp/console-2026-03-23T08-42-19-031Z.log`, `...08-49-12-304Z.log`, `...08-52-43-618Z.log`, `...08-53-04-754Z.log`, `...08-53-17-414Z.log`, `...08-53-58-044Z.log`, `...09-15-25-153Z.log`, `...09-15-38-334Z.log`, `...19-35-29-456Z.log`, `...19-35-58-478Z.log` | 10 | Browser console captures | Generated historical diagnostic artifacts; tracked despite current ignore rule; not an executable test suite |
| `CLAUDE.md`, `.claude/CLAUDE.md`, `api_server/CLAUDE.md` | 3 | AI-development guidance | Documentation/configuration; partly obsolete or irrelevant to the current tree |
| `FOR_FRONTEND.md` | 1 | Two API integration notes | Current, implementation-backed reference for inventory-overview and tool-call endpoints |
| `Jenkinsfile` | 1 | Image build/push pipeline | Active Jenkins entry point; behavior also depends on an external shared library |
| `assets/QuilrLogo.svg` | 1 | Brand asset | Exact duplicate of the active frontend source/dist SVG; root copy has no in-repository consumer |
| `docker-compose.yml`, `docker-compose.dev.yml` | 2 | Production-like and local-development orchestration | Active operational entry points with different migration/seed behavior |
| `docs/adr/adr-activity-log-endpoint.md` | 1 | Accepted activity endpoint ADR | Partially current; names/auth claims drifted |
| `docs/adr/adr-canonical-id-consumption.md` | 1 | Agent-supplied canonical-ID ADR | Decision is implemented, but document status remains `Proposed` |
| `docs/adr/adr-entity-properties-and-relationships.md` | 1 | Properties/edge design ADR | Backend mostly implemented; paths/table counts and proposed dynamic UI drifted |
| `docs/adr/v2-architecture-decision-record.md` | 1 | Original v2 proposal | Historical and substantially superseded |
| `docs/architecture/backend-architecture-spec.md` | 1 | Backend architecture narrative | Partially current, with significant authentication, storage, route, writer, and deployment drift |
| `docs/architecture/frontend-architecture-spec.md` | 1 | Frontend architecture narrative | Partially current, but its entire login lifecycle and several runtime claims are obsolete |
| `docs/context/ai-context.md` | 1 | AI-assistant quick reference | High drift; should not be treated as source of truth |
| `docs/contracts/entity-sync-contract.md` | 1 | Older multi-entity ingest contract | Contradicted by the now-required distinct `canonical_id` field |
| `docs/contracts/tenant-policy-sync-contract.md` | 1 | Server/agent policy contract | Server half mostly implemented; several exact wire claims drifted; agent requirements require cross-repository validation |
| `docs/product/backend-product-spec.md` | 1 | Backend requirements/specification | Mixed implemented, outdated, and unverified target behavior |
| `docs/product/frontend-product-spec.md` | 1 | Frontend requirements/specification | Mixed implemented and obsolete; authentication and OTel claims are not implemented in the active UI |
| `docs/style_guide/quilr-app-discovery-style-guide.md` | 1 | Normative visual/component style guide | Partially followed; many specified components/accessibility rules are absent |
| `docs/tasks/prompt` | 1 | Raw Jira-ticket source text | Historical task input, not implementation documentation |
| `docs/tasks/task-001-system-process-governance.md` | 1 | Cross-repository system-process task design | Dashboard portions implemented; endpoint claims are audited with the endpoint repository |
| `docs/tasks/task-002-ui-bugs-pmm-5209-5221.md` | 1 | UI defect audit and implementation plan | Many proposed changes now exist; `Design Review` status is stale and some data-quality concerns remain |

The counts above total 44. Every path is either individually named or included in the exact ten-log/two-metadata groups.

## Operational entry points

### GitHub Actions security dispatcher

`.github/workflows/security-ci.yml` runs only for pull requests targeting `main` or `quilr-preprod`. Its single job calls:

`quilrbusiness/ci-scripts/.github/workflows/ci.yml@ci-security-tools-integration`

It grants the reusable workflow read access to actions, contents, and packages plus pull-request write access, and passes inherited secrets. No checkout, build, test, lint, or scanner command is defined locally in this workflow.

**Unresolved:** the external workflow contents at the referenced moving branch were not requested repositories, so the exact checks, failure thresholds, secret usage, and whether Go/frontend tests run cannot be proven here.

`.github/CODEOWNERS` assigns only this workflow file to `@quilrbusiness/devops-codeowners`; it does not establish ownership for application code, Compose, Jenkins, or the local precheck scripts.

### Local DevSecOps runners

The Bash and PowerShell scripts are platform variants of a manual runner. Neither is referenced by the checked-in GitHub workflow or Jenkins pipeline. Both:

1. Accept a stage list, project directory, optional local `ci-scripts` checkout, logging/language/output configuration, and organization.
2. Default to `secret-scan`, `sca`, `iac`, and `linter` when no stage is selected.
3. Clone `quilrbusiness/ci-scripts` from the floating `ci-security-tools-integration` branch, trying SSH then HTTPS, unless a local path is supplied.
4. Build a synthetic GitHub context from the local Git repository.
5. Bind-mount the project, external scripts, and stage output into externally supplied Docker images.
6. Run Gitleaks, Trivy filesystem, Trivy configuration, and language-aware linter shell scripts selected from that external checkout.
7. Print a table of pass/finding exit codes and clean temporary/stray files.

The project and external scripts are mounted read/write. The actual scanner/linter behavior is therefore controlled by the external branch and image tags, not by the two wrappers alone.

#### Bash symbols and behavior

| Symbol | Verified behavior |
|---|---|
| `_log`, `debug`, `info`, `warn`, `error`, `ok`, `fail` | Timestamped ANSI logging; `fail` exits immediately |
| `parse_args` | Parses stages/paths/log/language/output/help, expands any `all` to the four-stage list; does not implement the documented `-o/--org` option |
| `_resolve_paths` | Canonicalizes project/CI/output paths; default output is `<project>/devsecops-precheck-reports` |
| `_clone_ci_scripts` | Shallow-clones the external branch into `mktemp -d`; SSH first, then HTTPS |
| `_check_os_compat`, `preflight_check` | Requires Bash 4+, Docker, Git, jq, yq, realpath (including GNU coreutils on macOS), a running daemon, and expected external script layout |
| `build_github_context` | Emits JSON with workspace, commit/branch, org/repo, run ID, event `push`, and GitHub server URL |
| `run_in_docker` | Runs the stage image as host UID/GID on `linux/amd64`, hides output outside DEBUG, records elapsed time, and returns the container status |
| `run_secret_scan`, `run_sca`, `run_iac` | Select fixed private-registry image tags and external script paths; SCA/IaC set `TRIVY_CACHE_DIR` |
| `_image_for_language`, `_get_linter_matrix` | Read external `linter.yaml` with yq; detect languages by configured filename patterns while pruning configured directories |
| `run_linter` | Runs one Docker linter per detected/forced language; Rust requires `CLONE_TOKEN`; macOS Rust switches to an arm64-tagged image/platform |
| `print_summary`, `main` | Store stage codes and print findings; `main` does not propagate an aggregate failure code |
| `_cleanup` | Runs on every exit via `trap`, deleting the temporary clone and every listed “stray” path under the project |

`bash -n` succeeds. The scanners were not run because they require Docker, private images, an external repository, and may mutate the working tree.

**Contradictions and potential issues:**

- Usage advertises `-o/--org`, but `parse_args` rejects it. The organization can only be changed through `GITHUB_ORG` in this variant.
- Usage says the log-level default is `INFO`; code initializes `ERROR`.
- A stage with findings is stored and printed, but the script's final command returns from `print_summary`; there is no final nonzero `exit`. It is unsuitable as a fail-closed gate without a caller inspecting text/reports.
- The cleanup list includes generic project paths such as `target`, `artifacts`, `ci-scripts`, `eslint.config.js`, `checkstyle.xml`, and `.gitleaks.toml`. It does not record whether they predated the run. Because the exit trap is installed before argument parsing, even `--help` can remove matching pre-existing paths from the current project. **Potential issue requiring validation:** unintended deletion of legitimate project data.
- In DEBUG mode, the constructed Rust linter command includes `CLONE_TOKEN=<value>` in logged text. **Potential issue requiring validation:** credential exposure in console logs.
- Pinning a branch and mutable image tags rather than immutable commits/digests prevents this repository alone from reproducing a historical scan.

#### PowerShell symbols and differences

The PowerShell variant uses an advanced-script parameter block, UTF-8/mojibake helpers, Windows-to-Docker path conversion, `Start-Process`/temporary files to preserve native exit codes, and `Resolve-Image` to prefer a matching local image. Its `run_in_docker` also rewrites CRLF endings with `sed -i` inside the read/write mounted external `ci-scripts` checkout. It can reinterpret GNU-style `--stage` tokens that PowerShell binds positionally.

For nonzero SCA/IaC exits, it attempts to parse a project-root `trivy-report.json` with jq or PowerShell JSON parsing and changes the result to success if the parsed finding count is zero. This override does not exist in the Bash variant.

Like the Bash version, `main` prints the result table and never explicitly exits with an aggregate findings status. Its `finally` cleanup uses the same provenance-blind removal pattern, including on help/early exit. The help text says “all five stages” although only four exist. PowerShell was unavailable in the analysis environment, so syntax and Windows/Docker runtime behavior remain **Unresolved** rather than verified by execution.

## Jenkins build and release boundary

`Jenkinsfile` imports the external `quilr-jenkins-shared-library`, polls SCM every minute, and runs on `AGENT_LABEL` or `default-agent`.

1. It derives a raw branch from `BRANCH_NAME`, the final slash-delimited `GIT_BRANCH` component, or `git rev-parse`.
2. External `generateImageTag(rawBranch)` supplies `IMAGE_TAG`.
3. Parallel branches build the API image from `./api_server/v2` and the frontend image from the repository root. Both use `--no-cache`; the frontend sets `VITE_BASE_PATH=/sentinel-dashboard/`.
4. Parallel branches call external `pushToCR` for each image.

The pipeline contains no explicit source checkout, Go test, frontend build/test outside Docker, security scan, deployment, rollback, signing, SBOM, or post-cleanup stage. Some may be provided by the Jenkins environment/shared library, but that is **Unresolved**. The checked-in `version` file is not read. `pollSCM('* * * * *')` can schedule frequently, but actual Jenkins coalescing/concurrency configuration is external.

## Compose and container behavior

### `docker-compose.dev.yml`

- Starts `clickhouse/clickhouse-server:24.8-alpine`, publishes native `9000` and HTTP `8123`, persists `clickhouse_data`, and uses a checked-in local-development credential.
- Runs `/app/migrate` after ClickHouse becomes healthy.
- Runs `/app/seed` after migration completes.
- Starts `/app/server` only after seed completes, publishes `33333`, and probes `/v1/health`.
- Starts the Nginx frontend only after API health, publishes `8080`, and supplies the backend service host/port.
- `migrate`, `seed`, and API all load root `.env.dev`.

**Operational inconsistency:** production server bootstrap does not register login/auth routes, so the dev seed user is not usable through the production router even though the seed step must succeed before that router starts.

### `docker-compose.yml`

- Builds/publishes API `33333` and frontend `8080` with restart policies and health gating.
- Loads `api_server/v2/.env`, not root `.env`.
- Does not provision ClickHouse, run migrations, or seed users. A compatible database/schema must exist before API startup; `ValidateClickHouseTables` fails startup otherwise.
- Publishes the API port directly in addition to the Nginx path, which is security-relevant because portal tokens are decoded but not signature-verified by `PortalAuth`.

The frontend Nginx template proxies `/api/` and `/ea/`, rewrites `/sentinel-dashboard/*` to root files, and redirects `/` to that prefix. Its comment/config preserves long-lived unbuffered `/ea/` traffic for an SSE `/ea/v1/sync/stream`, but no such route exists in the server at this commit: this is documentation/configuration-only behavior.

### Docker-context secret boundary

The root `.dockerignore` excludes `api_server/v2/.env` only for builds whose context is the repository root. All checked-in API builds use `./api_server/v2` as their context, where there is no `.dockerignore`; the API Dockerfile executes `COPY . .`. Thus the tracked API `.env` enters the builder context/layer, though it is not copied into the final runtime stage.

The root-context frontend build excludes `api_server/v2/.env` but does not exclude root `.env` or `app-intel/.env`; those files enter the sent build context even though the Dockerfile does not copy them. **Potential issue requiring validation:** exposure of tracked credentials to Docker daemon/build cache operators. The current `.gitignore` also has no `.env` rule, and concrete credential-bearing env files are committed.

## Root configuration and artifacts

### Root `.env`

The file declares `DATABASE_URL`, `DB_MAX_CONNS`, and `DB_MIN_CONNS`, which current v2 code does not consume, plus ClickHouse/auth/identity/server settings. Production Compose does not load this file. Integration `TestMain` searches relative `.env` paths and can load it depending on working directory. It contains concrete connection values; they are intentionally not reproduced.

### `.env.dev`

This file supplies local Compose with ClickHouse, auth, identity, limit, timeout, port, and CORS settings. It omits batch-writer tuning, data-file paths, and hook paths, so `config.Load` defaults apply. `TENANT_AUTH_SECRET` is empty, enabling direct tenant/subscriber header mode.

Both root env files use the implemented names `CLICKHOUSE_TLS`, `CLICKHOUSE_HTTP`, `CLICKHOUSE_MAX_OPEN_CONNS`, `MAX_REQUEST_BODY_BYTES`, and `REQUEST_TIMEOUT_SECONDS`. Older docs use several non-existent alternatives.

### Version and image files

- `version` contains `1.33.96`, but no local code, Dockerfile, Compose, Jenkins, or workflow reads it. **Unresolved:** whether the external shared library consumes it implicitly.
- `assets/QuilrLogo.svg`, `frontend/src/assets/QuilrLogo.svg`, and committed `frontend/dist/assets/QuilrLogo-C6sTColq.svg` are byte-identical. Only the frontend source import is active; the root copy is an apparently unused duplicate.
- The two `.DS_Store` files are Apple metadata, not source or application data.
- The ten root Playwright logs and five frontend Playwright logs are historical console captures, not tests or fixtures. The frontend deep reference profiles their observed errors and stale-auth behavior.

## Documentation consistency audit

### Guidance files

| Source | Claim/effect | Code evidence | Result |
|---|---|---|---|
| `CLAUDE.md` | Backend is `api_server/v1`, server supports `--migrate-clickhouse`, integration needs PostgreSQL | Only `v2` is tracked; migration is a separate `cmd/migrate`; v2 is ClickHouse-only | Contradicted/outdated |
| `CLAUDE.md` | UI/API at Compose ports 8080/33333 | Both Compose files publish those ports | Confirmed |
| `.claude/CLAUDE.md` | Use Rust best practices | Dashboard contains Go, TypeScript, Python, shell and PowerShell but no Rust source | Irrelevant/stale guidance |
| `api_server/CLAUDE.md` | Product document is the frontend product spec | A backend product spec exists; the listed file specifies the UI | Contradicted reference |
| `api_server/CLAUDE.md` | Dangerous-permission catalog serves hook regexes to agents | `dangerous_permissions.json` is served at `/ea/v1/sync/dangerous-permissions` and tested | Confirmed at a broad level |

### ADRs and contracts

| Source | Documentation claim | Actual code evidence | Result |
|---|---|---|---|
| `adr-activity-log-endpoint.md` | Activity ingest/query, validation, batching, response shape | Production routes, activity handler/service/repository and tests implement the flow | Largely confirmed |
| same | Tables/migrations are `activity_log` and `clickhouse_migrations/003...`/`005...`; query auth verifies JWT | Actual table is `endpoint_activity_log` in schema `005`; `PortalAuth` does not verify signatures | Outdated/contradicted |
| `adr-canonical-id-consumption.md` | Add required `canonical_id`, consume it for all types, remove derivation, use `app_canonical_id` for parent edges | `SyncRequest.CanonicalID`, handler validation, `IngestService.Process`, and `ExtractAppCanonicalID` implement exactly this target | Implemented, but ADR status incorrectly remains `Proposed` |
| `adr-entity-properties-and-relationships.md` | Extract/merge `properties`, store explicit/derived edges, query edge table | Model, ingest service, batch writers, schemas, and repository implement these backend mechanics | Confirmed with renamed `endpoint_*` tables |
| same | Migration is `003_properties_and_edges.sql`, final system has five tables, modal becomes dynamic property renderer | Current schema has ten numbered tables; modal retains type-specific hardcoded renderers | Outdated/partly unimplemented |
| `v2-architecture-decision-record.md` | Applications-only, four unprefixed tables, backend-computed UUIDv5 IDs, production auth routes, port 8443 | Current system supports nine entity types, ten `endpoint_*` tables, requires agent `canonical_id`, omits production auth routes, and listens on 33333 by default | Substantially superseded |
| `entity-sync-contract.md` | Request `id` is itself the canonical ID and no distinct canonical field is needed | Handler requires nonempty `canonical_id`; `id` is stored separately as mapping `agent_id` | Contradicted by implemented hard-cutover ADR |
| `tenant-policy-sync-contract.md` | Server endpoint/catalog/validation/migration/default document exist | Handler, model, repository, embedded catalog, CLI migration, and frontend editor exist | Server portion largely confirmed |
| same | `since` is required; versions serialize as JSON numbers | Handler permits absent `since` as zero; `PolicyVersion.MarshalJSON` emits strings | Contradicted exact wire details |
| same | Agent polling/cache/backoff/enforcement requirements are implemented behavior | The document itself presents an unchecked agent implementation checklist | Planned agent behavior, not proven by dashboard code; cross-repository audit required |

### Architecture/product/context documents

| Source | Key consistency result |
|---|---|
| `backend-architecture-spec.md` | Layering, ClickHouse-only storage, gzip, async writers, overlays, request IDs, and graceful stop broadly exist. It documents five writers rather than six (omits hook events), unprefixed tables, signature-validating JWT dashboard auth, production AuthService, a five-minute/self-healing process-map cache, per-role 403 checks, and a Compose topology that the code does not implement. It also says overview cache keys only tenant ID; code keys tenant plus subscriber. |
| `frontend-architecture-spec.md` | React/Vite/Router/React Query/CSS-module layering, protected routing, localStorage token/identity, current inventory pages, and concentric graph positioning broadly exist. Email/password login, SHA-256, `/auth/login`, `/auth/me`, logout/user menu, 401 auto-logout, verified JWT lifecycle, ELK engine use, request cancellation, React Query DevTools, and `requestAnimationFrame` graph layout do not. Settings and newer activity/conversation behavior are omitted. |
| `ai-context.md` | Many package names and routes are recognizable, but it repeats the obsolete login/JWT model, wrong table prefixes/columns/config names, old identity derivation, five-writer count, nonexistent UserMenu, reachable OTel hooks, and outdated route/config inventory. High-risk as AI guidance. |
| `backend-product-spec.md` | Ingestion, gzip, properties/edges, ClickHouse, settings overlays, dashboard/activity/alert routes, and queue semantics are broadly implemented. Authentication requirements are test-only/dead in production; there are six writers; metric counters are not exposed; delta returns normal JSON rather than an incremental `http.Flusher` stream; process-map caching/self-healing is absent; not every table is monthly partitioned; p95/scale targets have no benchmark evidence. |
| `frontend-product-spec.md` | Most inventory, details, graph, activity, alert, pagination, risk, and policy-mutation UI exists. Email/password/login/logout/user-menu requirements and all reachable OTel user flows are absent. The built JS gzip size is 179.27 kB (below its 500 kB target), but no performance/browser compatibility measurements prove the other NFRs. The Settings page is implementation-only relative to this April specification. |

### Design/tasks/API notes

| Source | Code evidence | Result |
|---|---|---|
| `quilr-app-discovery-style-guide.md` | Figtree, major colors, layout, KpiBar, DiscoveryTable, Sidebar, RiskBadge, and AppIconAvatar are reflected in source | Partially confirmed |
| same | `TrendingCarousel`, `ColumnConfigurator`, `FiltersPanel`, `InlineCellDropdown`, `RowContextMenu`, standalone `TablePagination`, `StatusBadge`, `Checkbox`, `ToggleSwitch`, `Button`, `SearchBar`, and several layout components are specified but absent; 252 raw hex occurrences contradict “tokens exclusively”; many table headers lack the prescribed `scope`/`aria-sort` | Documentation-only or incomplete accessibility conformance |
| `docs/tasks/prompt` | Contains only Jira defect text and no status/code mapping | Historical input, not evidence of resolution |
| `task-001-system-process-governance.md` | Dashboard has `hide_system` parsing/querying, system/privilege fields, default-on toggle, privilege column, and disabled system block action; process map contains system entries | Dashboard portion confirmed; endpoint refresh/detection claims require endpoint evidence |
| `task-002-ui-bugs-pmm-5209-5221.md` | Current code includes width constraints, related-entity de-duplication, unknown-risk fallback, entity-specific columns/KPIs, activity/alert debouncing and page-size controls, and alert action select | Many proposed fixes are implemented; document status remains stale. Backend data quality and exact duplicate semantics still depend on live data/query behavior. |
| `FOR_FRONTEND.md` | Models, handlers, repository queries, service, and routes implement inventory overview and tool-call list with the documented capped previews/counts/filter family | Confirmed API note. Frontend helper exists, although its hook has no current UI consumer. |

## Root-level unresolved items

- Exact behavior of the external GitHub reusable workflow and Jenkins shared-library functions.
- Whether external release/deployment tooling consumes `version`.
- Whether PowerShell runner parses and behaves as intended on Windows/PowerShell 5.1.
- Whether credential-bearing `.env` history has been rotated; repository evidence cannot establish external rotation.
- Whether any operator intentionally depends on the root duplicate logo or committed Finder/console artifacts.
