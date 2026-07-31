# Analysis State

## Completed areas

- Verified GitHub access as `amjad-f35`; cloned and pinned all three requested repositories.
- Recorded revisions: endpoint `a022e52bf2fff6a9445ebad96c3afeaf277e259f`, dashboard `cd755d37c14b8b86623a15a4dbae41d33b226b2b`, current IPC `0cf45bc50e4121d6a4521c58f1fa52a97c125e19`, and endpoint-pinned IPC `9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b`.
- Inventoried all 1,157 requested-repository tracked paths and separately expanded the endpoint's 108-path pinned IPC dependency tree, producing 1,265 final per-path records.
- Completed semantic analysis of all endpoint packages and repository-shell paths: agent, bootstrap, core, system monitor, proxy, template service, email discovery, diagnostics, infra, root workspace/configuration, CI, build/signing, deployment, distribution/install/update/uninstall, tools, root tests, and documentation.
- Completed all 251 dashboard paths: Go API/server, ClickHouse schemas/migrations/data access, background batch writers, frontend, app-intel, containers, CI/release definitions, local tools, tests, and documentation.
- Completed all 30 current IPC paths and all 108 endpoint-pinned IPC paths, including public APIs, wire formats, broker/macro/duplex differences, scripts, tests, benchmarks, CI, and documentation.
- Generated 11,180 AST-backed declaration entries and added subsystem semantic references for runtime-significant symbols, callers, configuration, failures, tests, and reachability.
- Completed repository-wide feature, interface, configuration, data/state, security, error/recovery, concurrency/performance, operations, test, dependency/call-graph, documentation-consistency, and dead/legacy/incomplete-code syntheses.
- Reconciled generated/vendored provenance: 29 generated paths, 2 vendored paths, 0 skipped paths.

## Current area

Complete. Final link, status, count, cleanliness, JSON-integrity, and credential-output checks passed.

## Next exact task

No repository-analysis work remains at the pinned revisions. Future work requires new repository commits or external deployment/runtime evidence.

## Important verified facts

### Repository relationships

- The endpoint uses a detached 108-path IPC commit that is not an ancestor of the separately requested 30-path current IPC `main`; the two APIs and protocol surfaces are materially different.
- The dashboard Go API and browser frontend are one repository but separate runtime/build boundaries. The endpoint communicates with dashboard endpoints and a pinned local IPC broker; not all documented routes/services have matching implementations.

### Endpoint runtime

- Root Cargo is a virtual Rust 2024 workspace with 13 members and 11 default members. Lockfiles are ignored; exact deployed transitive versions are unreconstructable from the tracked tree.
- The endpoint default service graph contains eight definitions. Several exported legacy wrappers/placeholders are not default-registered; diagnostics receiver launch remains unresolved because its default registration is commented out.
- System monitor startup gates for six seconds on kill-switch state and then blocks for Persona. Its active hooks emit prompt activity but return Allow; proposed hook DLP enforcement is not implemented.
- Core Lua scanning uses direct sandbox/collector APIs and bypasses the manifest/signature/updater engine. Several richer result fields are discarded during typed-entity conversion.
- Template-service FIFOs lose original response targets, dedup retains only the first request identity, and several dismissal/status operations omit queued or notification state.
- Email discovery uses fixed unauthenticated local endpoints; Windows applies a null DACL. Parent identity binding to the spawned child is absent.
- Diagnostics producers can drop queued events on connection failure. Receiver storage/export has nontransactional buffering, append-only histories, and OpenSearch Bulk item-result blindness.
- Infra selects Linux but all four Linux service getters are `todo!`; Windows named-pipe IPC is a stub. Windows user-session process creation ignores the configured environment map.
- Proxy startup/policy paths mix fail-open traffic decisions with default-action UI failure handling. Windows and macOS redirectors contain verified shutdown, startup-order, UDP-policy, attribution, and legacy-protocol inconsistencies documented in the proxy chapters.

### Endpoint delivery and repository shell

- Current Actions workflows build/upload artifacts but run no tests, Clippy, production publication, rollout, or rollback. External reusable precheck behavior remains outside the tree.
- Local precheck wrappers collect/display failures but never exit with an aggregate failure result.
- Current, old, manual, and alternate Python delivery trees coexist and disagree on flags, component lists, filenames, signing paths, and validation behavior.
- Several packaging paths copy original build outputs rather than their produced signed outputs; successful signing does not prove every packaged byte is signed.
- A development EC private key, certificate, PKCS#12 bundle, and signing configuration are committed in the old build tree. Windows packaging can include a CA private key in one selected mode.
- `deployment/deploy.py` reads an undefined `args.workspace_root` and creates a double `.exe` Windows preflight name; ordinary deployment is broken as committed.
- Root `tests/` declares 60 Rust test attributes but belongs to no root package/explicit test target. The E2E implementation plan is documentation-only.
- The Intune generator ignores `--config`, reads but does not use the private key, and emits Windows deployment that depends on an externally supplied PFX.
- Generated/vendored endpoint artifacts include a runtime log, four exported diagrams, a Draw.io backup, a compiled arm64 installer ZIP, and the SSL.com signing JAR/release notes.

### Dashboard/API/frontend

- API v2 exposes 26 routed operations behind middleware; authentication identifies a tenant through a user-details dependency. Authorization is primarily tenant scoping, with documented gaps at specific resource relationships.
- ClickHouse migration is lexically sorted semicolon-split DDL with no migration ledger or rollback. Startup validates ten tables before serving.
- Six bounded batch-writer queues buffer writes; shutdown can wait indefinitely after the HTTP drain because queue draining has no final deadline.
- Browser auth state and tenant selection use localStorage; the API base path, Nginx routing, and several documentation examples disagree across environments.
- Frontend policy editing uses a module-global save scheduler; DLP revision protection is incomplete. The production bundle is a single large chunk and the committed `dist` fragment is not the Docker build input.
- App-intel enrichment is manual/Claude-assisted; the legacy loader destructively recreates a ClickHouse table whose name does not match the API repository query.

### IPC

- Current IPC is the simplified `ipc-light` tree; the endpoint-pinned tree adds broker, proc-macro, duplex, typed messaging, extra tests/benchmarks/examples, and substantially different lifecycle behavior.
- Broker participant identity is claimed at the application protocol layer; deployed OS ACLs and peer authentication outside the checked code remain unresolved.

## Pending questions

- External production deployment topology, artifact publication, rollout/rollback controller, CI shared workflows/Jenkins library, private scanner images/scripts, and signing/notary infrastructure.
- Deployed feature sets, environment values, ACLs, service accounts, certificate/key handling, broker/socket/pipe permissions, and log retention/redaction.
- Private DLP SDK behavior/version and external backend/identity service semantics.
- Actual Apple Network Extension, WinDivert, Windows service, launchd, and OS credential-store behavior on supported production versions.
- Whether committed development credentials or compiled installer artifacts have been distributed and whether external rotation/revocation occurred.
- External users of public dead-code candidates, manual scripts, dormant test surfaces, or alternate manifests/configuration.

The exhaustive question ledger is [20-open-questions.md](20-open-questions.md).

## Files not yet inspected

None. Every one of the 1,265 analysis records has a final status. No path was skipped. Static inspection does not resolve external or runtime-only behavior; those gaps are explicitly labeled.

## Contradictions discovered

The complete tables are in [18-documentation-consistency-audit.md](18-documentation-consistency-audit.md). High-impact examples:

- Endpoint manifests, builders, installers, service defaults, and documentation disagree on component names and active process topology.
- Proxy documentation describes older pf/SCM_RIGHTS/UDP behavior while active macOS code uses Network Extension TCP relay and rejects monitored UDP.
- Diagnostics documentation promises crash-safe persistence and macro forms that code does not implement.
- Template guides overstate per-window concurrency, backend template loading, timeout defaults, and response lifecycle.
- Infra documentation promises Linux/Windows IPC/process parity absent from current implementations.
- Dashboard docs/examples include routes, migration behavior, local commands, and data-store claims that do not match current Go/ClickHouse code.
- IPC current `main` cannot be substituted for the endpoint-pinned revision despite the shared repository name.
- Endpoint E2E, hook DLP, proxy-v2 plugin architecture, and SCEP deployment documents describe planned rather than implemented behavior.

## Terminology and symbol map

- **Endpoint / agent repository:** `sentinel-endpoint-agent`.
- **Dashboard repository:** `sentinel-dashboard`, containing Go API, React frontend, app-intel, and operational files.
- **Current IPC:** requested `ipc-event-bus` `main` at `0cf45bc…`.
- **Pinned IPC:** endpoint Git submodule at `9ce5b25…`; analyzed as a separate tree.
- **Core:** `sentinel-core`, shared endpoint runtime/service/security/data utilities.
- **System monitor:** `sentinel-monitor-v2`, endpoint discovery/enforcement/hook orchestration.
- **Proxy:** `sentinel-proxy`, explicit/transparent proxy plus Windows/macOS packet interception.
- **Template service:** standalone `template-engine`; distinct from core's integrated templating module and from the two similarly named service definitions.
- **Verified / Inference / Unresolved / Contradiction / Potential issue / Dead-code candidate:** evidence markers defined in the documentation index.

## Documentation files created

- Index, scope, four path inventories, executive overview, architecture, entry points, feature catalog, module/file reference.
- Thirty-plus subsystem deep-reference chapters under the `06-` prefix.
- Structural and semantic symbol references under `07-symbol-reference/`.
- Data dictionary, storage/model reference, interfaces, configuration, security, errors/recovery, concurrency/performance, operations, tests, dependency/call graph, consistency audit, dead/legacy/incomplete code, open questions, and coverage ledger.

The canonical index is [README.md](README.md); measured coverage is [21-analysis-coverage.md](21-analysis-coverage.md).
