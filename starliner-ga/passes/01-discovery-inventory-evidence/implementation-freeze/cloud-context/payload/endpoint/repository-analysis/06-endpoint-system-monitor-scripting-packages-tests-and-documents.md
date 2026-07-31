# Endpoint System Monitor v2: Lua discovery, package scanners, tests, build, and documentation audit

This chapter documents file-marker scanning, the active Lua sandbox path, conversion losses, all twelve Lua paths, npm/Cargo/Go package discovery, test and manual-E2E coverage, packaging behavior, and every design/documentation path under `system-monitor/`.

## Active scanner pipeline

**Locations:** `system-monitor/v2/src/discovery/scanner/{mod.rs,walker.rs,executor.rs,converter.rs}`

```mermaid
sequenceDiagram
    participant Loop as scanner::run
    participant Walker as resolve_matches
    participant Exec as execute_script
    participant Core as create_sandboxed_lua
    participant Lua as detector script
    participant Conv as convert_results
    participant Store as EntityStore

    Loop->>Walker: configured folder + file rules, home
    Walker-->>Loop: existing ScanMatch values
    loop first existing rule for each script name
        Loop->>Exec: script path + scan context
        Exec->>Core: hard-coded capabilities and 10 s limit
        Core->>Lua: load and execute
        Lua-->>Exec: ScriptResult typed vectors + raw graph
        Exec-->>Loop: ScriptResult
        Loop->>Conv: typed result + ContextManager
        Conv-->>Loop: Vec<Entity>
        Loop->>Store: find/touch or upsert
    end
    Loop->>Loop: wait scan_interval_secs
```

When `scan.enabled` is false, `run` waits only for cancellation. Otherwise it requires `HOME` or `USERPROFILE`; absence returns `Error::Scanner` and permanently ends the orchestrator's scanner task.

`walker::resolve_matches` selects existing configured paths and attaches match type/path/modification time/script. Paths starting with `/` are treated as absolute; other paths are joined to home. **Potential issue:** on Windows, a drive-qualified path such as `C:\custom` does not start with `/` and is joined to home, even though `Path::is_absolute` is used correctly in the separate hook probe.

The scanner deduplicates by script filename, not marker path: only the first existing rule for each script runs in a cycle. This prevents the two LM Studio markers from running the same detector twice, but also means later same-script rules cannot add a second independent scan context.

## Lua execution boundary

**Location:** `system-monitor/v2/src/discovery/scanner/executor.rs`; sandbox implementation under `core/src/scripting/`

`execute_script` reads the complete script, builds a fresh core sandbox with hard-coded `fs.read` and `platform.info` capabilities, sets a ten-second instruction limit, exposes a `scan_context` table (`path`, match `type`, and modification data), and executes the script.

The active path does not parse `scripts/manifest.json`, use `ScriptEngine`, verify script signatures, or call the updater/dispatcher. The manifest says five seconds and declares the same broad capability names, but it is packaging/design metadata only in this runtime.

The sandbox removes normal dangerous globals including `io`, but exposes selected table/string/math/package/coroutine behavior and repository-specific host APIs. `require` is limited to the script directory. `sentinel.workspace` is exposed regardless of the requested capability vector. `sentinel.fs.read` can read absolute paths and is not confined to home; the committed scripts are therefore trusted local code rather than untrusted tenant scripts.

The Lua instruction hook checks periodically and cannot preempt a blocking Rust host callback. File traversal/read calls are synchronous. Scanner execution occurs directly inside an async task, so large scans can block a Tokio worker.

## Conversion: what survives and what does not

**Location:** `system-monitor/v2/src/discovery/scanner/converter.rs`; source result types: `core/src/scripting/result_collector.rs`

`convert_results` reads the nine typed result vectors and produces corresponding `EntityKind` variants. It does not process `ScriptResult.raw_entities`, emitted relationships, emitted events, or errors. Lua `sentinel.result.set_risk` is registered as a no-op in the active host API.

| Script result | Preserved by converter | Discarded or overwritten |
| --- | --- | --- |
| Application | name, install path, parent/context inputs needed by `ApplicationData::from_discovery` | script version, vendor, and other richer application fields are not passed; current call supplies fixed/default values |
| MCP server | app/name/transport/command/args/env-var names/url/scope/risk represented by `McpServerData` | raw graph relationships and unmodeled script attributes |
| Hook | app/event/type/command/matcher/risk | raw relationships/attributes |
| Skill | app/name/path/scope/risk/description | content, reference docs, helpers, resources, external/license/tools/model metadata |
| Agent | app/name/path/type/scope/risk/description | content, external/tools/model/MCP/skill metadata |
| Model | app/name/provider/scope/description supported by artifact type | unmodeled raw metadata |
| ControlledRepo | app/path/trust/count/risk fields supported by artifact type | raw relationships |
| Permission | app/command/type/scope/risk | raw relationships |
| Plugin | app/name/type/version/risk | raw relationships |

For an Application, the scanner first searches `EntityStore::find_by_name`; a match is merely touched. This is broader than the deterministic ID and can collapse same-name applications at different install paths. For all existing IDs, store upsert preserves the original payload, so changed typed details are not refreshed.

**Contradiction:** the Lua scripts extensively build raw entities, attributes, and relationships, and many call `set_risk`. Those outputs are accepted by the core collector but do not influence v2 entities or enforcement.

**Potential issue:** Skill, Agent, Model, and Plugin use the same user-scoped UUID input formula without a type discriminator. Same-name cross-type results can collide, after which store upsert retains the first kind.

## Workspace discovery host behavior

The core `sentinel.workspace.repos` host callback searches default lower-case roots below home (`code`, `workspace`, `projects`, `dev`, `src`, `repos`) plus roots from `SENTINEL_WORKSPACE_DIRS`. Traversal is bounded to depth three, stops at a directory containing `.git`, and does not follow directory symlinks.

Six committed detector scripts call workspace discovery independently. If multiple marker directories exist, one scanner cycle can repeat the same workspace traversal several times. Some scripts additionally inspect one level under conventional roots such as `Documents/GitHub`.

**Performance concern requiring measurement:** repeated synchronous walks and file reads execute in one async scanner task. No shared workspace result cache, I/O budget, batching, or backpressure is present.

## Detector script catalog

### `scripts/claude_code.lua`

The largest detector handles `~/.claude` and related project/workspace configuration. Verified discoveries include:

- Claude application entity;
- global and project settings;
- MCP definitions from settings/config paths;
- lifecycle hooks;
- models, skills, agents, commands represented through typed collectors;
- permissions;
- encoded project directories decoded back toward source paths;
- controlled repositories;
- installed plugin manifests;
- workspace repository inspection.

The script extracts environment names and effort/model settings in places, but several locals do not reach a typed result. Blocklist/raw-graph calls are lost at conversion. Skill/agent enrichment parses far more metadata than their v2 payload keeps.

### `scripts/cursor.lua`

The Cursor detector handles application state, Cursor MCP/hook configuration, a macOS Kilo MCP location, `.cursor` skills/commands, CLI permissions, encoded project directories, workspace project MCP/model/document references, and controlled repositories. Commands are represented as Agents.

It computes a composite risk value but does not call `set_risk`; even a call would currently be a no-op. Many relationships are raw-only and disappear.

### `scripts/codex.lua`

The Codex detector handles application identity, model/provider values, MCP servers, approval/sandbox permissions, instruction and `AGENTS.md` files, recursive skills, workspace `.codex` configuration, and controlled repositories.

**Potential issue:** it reads `config.json` and a path named `config.toml.json`; it does not parse a normal `config.toml`. Controlled repositories are emitted only when an MCP count condition is met. Locals including OS/seen-in state are unused.

### `scripts/openclaw.lua`

The OpenClaw detector handles application/version, model configs, auth-profile presence represented as Agents, channels represented as Skills, MCP servers, sandbox/gateway permissions, session skills/tools, workspace skills, agent directories, cron/webhook/Gmail hooks, plugins, workspace config, and repositories. It does not emit credential values from auth profiles.

Trust level is assigned in script data. Raw graph structure and composite risk do not survive. The script calls `set_risk`, which is a no-op.

### `scripts/nemoclaw.lua`

The NemoClaw detector handles application/version, configured models, auth-profile presence as Agents, session skills/tools, recursive source skills, agent directories, and agent models. It does not implement MCP, hook, or workspace discovery.

Its composite risk call passes arguments beyond the four accepted by `risk.composite`; Lua ignores the extras. The arrays used by the accepted positions are empty, so the score is zero. It emits agents but the local reported agent count remains zero. `set_risk` is a no-op.

### `scripts/ollama.lua`

The Ollama detector checks cross-platform candidate directories and discovers on-disk model manifests, Modelfiles represented as Skills, permissions/configuration, MCP servers, startup hooks, hook/plugin directories, alternative application directories, Open WebUI plugin state, and workspace repositories/Modelfiles/MCP definitions.

It parses a model-manifest JSON value into a local that is not then used. Raw graph edges and composite risk are discarded/no-op.

### `scripts/lmstudio.lua`

The LM Studio detector checks platform-specific data paths and discovers disk models, server/CORS permissions, MCP configuration, presets as Skills, plugins, hooks/startup behavior, workspace MCP/config/repositories, and other local metadata.

It attempts `sentinel.platform.exec_curl` inside `pcall` for live API enrichment. The exposed platform table supplies OS/home/arch but no `exec_curl`, so the pcall fails and live API discovery never contributes. This is a directly verified interface mismatch.

## Lua libraries

### `scripts/lib/mcp.lua`

Parses MCP configuration tables and normalizes stdio versus URL transports. Environment variables are emitted as key names, not values. When both command and URL are present, URL transport wins. A URL containing `sse` is classified SSE; otherwise URL transport is HTTP-like.

The library attempts `io.popen` for npm-registry enrichment. The sandbox removes `io`, so that path is unreachable in the active execution environment.

### `scripts/lib/frontmatter.lua`

Implements a small frontmatter parser, not a YAML implementation. It supports one-level key/value parsing and simple block folding. Both `|` and `>` blocks are folded with spaces. List parsing splits commas only despite comments claiming comma/space forms. Nested maps/arrays and general YAML syntax are unsupported. The start matcher does not demonstrably strip a UTF-8 BOM before matching despite a comment implying BOM support.

### `scripts/lib/path.lua`

Provides joining/basename/existence utilities and encoded-project-path decoding. The decoder uses filesystem existence to choose among greedy hyphen interpretations; ambiguous/nonexistent paths remain heuristic. Windows drive encodings are specially handled but depend on host filesystem checks.

### `scripts/lib/risk.lua`

Uses case-sensitive/case-normalized substring heuristics for MCP, hooks, skills, permissions, and a four-argument composite. Scores are script-produced metadata only; the active converter does not preserve the composite result into governance.

### `tests/fixtures/scripts/test_scanner.lua`

This test fixture emits one Application, MCP server, Skill, and Permission with fixed values. It is the only Lua detector directly exercised by deterministic scanner integration assertions.

### `scripts/manifest.json`

Lists seven enabled scripts, `on_scan` triggers, `fs.read`/`platform.info` capabilities, and five-second limits. The active scanner chooses scripts from `sysmon-config.json`, grants hard-coded capabilities, and enforces ten seconds. **Documentation/configuration-only:** no production reference parses this manifest.

## Package-manager discovery

**Locations:** `system-monitor/v2/src/discovery/pkg_scanner/{mod.rs,npm.rs,cargo.rs,go.rs}`

`pkg_scanner::run` performs enabled discovery synchronously, upserts returned Application entities, and sleeps the configured interval. When disabled it waits for cancellation.

All package results are Applications marked inactive and as development tools with `DiscoverySource::PackageManager`.

### npm

Candidate global roots include:

1. `NPM_CONFIG_PREFIX/bin`;
2. output of `npm root -g` and related bin derivation;
3. the lexicographically latest discovered nvm version;
4. Volta paths;
5. platform-specific locations, including broad `/usr/local/bin` and `/opt/homebrew/bin` scanning on macOS;
6. Windows `%APPDATA%` npm paths.

Local npm discovery iterates `ControlledRepo` entities and their local `.bin` directories. Exclusion filters remove known wrappers/tooling names. Windows suffix normalization can turn `.cmd`/`.ps1` wrappers into the same logical name; dedup behavior depends on path/name keys.

**Potential issue:** `/usr/local/bin` and `/opt/homebrew/bin` contain software installed by many mechanisms. The detector labels discovered binaries PackageManager/npm-style without proving npm provenance.

### Cargo

Scans `$CARGO_HOME/bin` or user `.cargo/bin`, reads `.crates2.json`, and associates binaries with installed crate metadata. Metadata/filesystem failures are skipped. Toolchain-name exclusion is applied in metadata-dependent logic; a binary represented in the crate index can take a different path than an unrecognized toolchain executable.

### Go

Scans `$GOBIN`, `$GOPATH/bin`, and `~/go/bin`. It invokes Go build-info tooling for metadata and waits for the child without a timeout despite comments referring to timeout behavior. A stalled external command can stall the scanner task and orchestrator shutdown.

## Build and packaging

`system-monitor/v2/Cargo.toml` has no package-specific feature flags and no lockfile in this subtree; the endpoint workspace lockfile policy applies. `mlua` vendors Lua 5.4, while OS-specific dependencies include `plist`/`libc` on macOS and Windows API/WMI/registry crates on Windows.

Endpoint production build scripts reviewed elsewhere stage all three binaries and the Lua scripts/config needed by this subsystem. The system-monitor-specific CI reference found in the checked repository builds/packages on an `app-discovery-integration` branch path; no checked workflow invokes this crate's tests, Clippy, or `--all-targets` at the pinned revision.

**Unresolved:** the private/external CI reusable workflow may add checks not visible in this repository.

## Test inventory and trustworthiness

There are 283 `#[test]`/`#[tokio::test]` declarations in the 74 Rust source/test paths. No `#[ignore]` or `#[should_panic]` marker was found. This count describes declarations, not CI execution.

### Unit tests

Unit tests are concentrated in config, Windows enumeration/parsing, correlator, package scanners, hook installers/integrity/templates/protocols, store, app-ID/ingest types, DLP parser/cache, and thin-client parsers/responses.

Strengths directly evidenced:

- many pure mappings and serialization formats have assertions;
- process-map exclusion/correlation behavior has substantial cases;
- hook JSON merge/repair and response mappings are exercised;
- frame/protocol and session FIFO/idle logic have focused tests;
- canonical-ID, name truncation, parent-linking, and store operations have tests.

Limitations:

- 27 tests in `platform/windows.rs` include real OS/environment observations rather than only pure fixtures;
- environment-mutating config tests share process-global variables and can race under parallel test execution;
- no test proves complete orchestrator startup/shutdown;
- no compile/CI evidence establishes Linux viability;
- no test wires DLP to the production hook evaluator because no such wiring exists;
- no test verifies local socket caller authentication because there is none.

### `tests/scanner_integration.rs`

Six integration tests cover:

- deterministic fixture conversion for Application/MCP/Skill/Permission;
- disabled scanner behavior;
- missing script behavior;
- a real Claude home scan;
- project path decoding;
- a Cursor home scan.

The last three depend on the executing developer's HOME/content and use conditional early returns labeled as “SKIPPED” in output, not Rust ignored-test metadata. They are not deterministic fixtures. There are no integration tests for Codex, OpenClaw, NemoClaw, Ollama, or LM Studio.

### Manual E2E assets

| Path | Verified role / issue |
| --- | --- |
| `tests/e2e/block-openclaw.md` | manual policy/block scenario; explicitly not an automated Rust test |
| `tests/e2e/scripts/build.sh` | builds from the v2 directory |
| `env-check.sh` | checks Docker and localhost backend/dashboard endpoints; macOS/POSIX assumptions |
| `start-sentinel.sh` | starts repository `target/debug/sentinel`, the main agent binary, not `sentinel-monitor-v2`; likely stale for this subsystem |
| `stop-sentinel.sh` | PID-file termination helper |
| `cleanup.sh` | uses `sudo` and removes snapshot/test state |

The scripts use `/tmp/sentinel-e2e.pid`, `sudo`, Docker, and hard-coded local ports. There is no Windows equivalent and no CI registration found.

**Contradiction:** `docs/superpowers/specs/2026-04-17-e2e-test-harness-design.md` specifies a mock-backend/fake-app/test-trait framework and CI phases. No corresponding Rust harness, mock server, fake app, macros, or workflow exists. It is a design proposal.

## Documentation classification and consistency audit

The subtree contains 43 Markdown paths. They are not treated as equal evidence.

### Root/historical documents

| Path | Classification | Code comparison |
| --- | --- | --- |
| `system-monitor/readme.md` | empty | no claims |
| `system-monitor/CLAUDE.md` | minimal contributor note | confirms config/constants preference only |
| `docs/scripts/claude.md` | empty | no claims |
| `docs/features.md` | requirements list | partially implemented; DB, full-drive scanning, pip/gem/brew/chocolatey, priority policy selection, quarantine/restore, broad hook enforcement, and OTEL are not present here |
| `docs/agentic-discovery.md` | broad design/specification | current scanner covers selected user markers/workspaces, not full-drive/Python/all proposed sources |
| `docs/agentic-discovery-ard.md` | draft architecture requirements | proposes Rhai/manifests and richer host framework; active v2 directly executes Lua from JSON config |
| `docs/architecture-review-report.md` | historical peer review | reviews absent `poc`, `v0`, and `v1` trees; not current v2 behavior |
| `docs/backend-api-contract.md` | historical v1/backend proposal | references absent system-monitor-v1, SQLite/bootstrap/SSE/unknown-process flows and different defaults |
| `docs/consolidation-plan.md` | approved historical implementation plan | actual v2 diverges: no process chain/Rhai/SQLite |
| `docs/manual-testing.md` | historical manual guide | names v1 paths/binaries absent from this revision |
| `docs/process-chain-architecture.md` | TypeScript/general architecture pattern | no active v2 process-chain implementation |
| `docs/storage-optimization.md` | file-index scale proposal | no file-index database/pipeline in v2 |
| `docs/system-monitor-v1-architecture.md` | draft for absent v1 | historical/planned only |

The two root process-map JSON documents are reference data, not Markdown and not runtime inputs; the active embedded map is under `v2/src/defaults`.

### Current/general v2 documents

| Path | Classification | Principal result |
| --- | --- | --- |
| `v2/docs/architecture.md` | mixed current and stale architecture | component names mostly correspond, but task set, Linux/platform scope, PID removal, cache population, sync streaming, error model, schemas, enforcement, and snapshot claims diverge |
| `v2/docs/entity-sync-contract.md` | intended live contract | canonical-ID formulas broadly match, but request/response and current fields have drifted; backend compatibility requires dashboard-side verification |
| `v2/docs/adr-activity-log-endpoint.md` | cross-repository server ADR | endpoint request has extra device/user contexts; ClickHouse/auth/query claims are not endpoint evidence |
| `v2/plans/phase1-plan.md` | implementation plan | historical; much superseded and some proposed behavior absent |
| `v2/tasks/todo.md` | tiny task ledger | says path-decoding implementation plan not executed, while code contains path decoding; task file is stale/incomplete |

### ADR-by-ADR audit

| ADR | Recorded status | Actual implementation result |
| --- | --- | --- |
| 001 Entity model | Accepted | nine enum variants exist; example `BrowserExtension` does not; names/examples are stale |
| 002 Process monitoring | Accepted | polling exists, but custom macOS/Windows enumerators replace claimed single sysinfo path; removal does not mark entity inactive |
| 003 Correlation/cache | Accepted | caches exist, but production alias/app population is absent and hits do not refresh TTL |
| 004 Persistence | Accepted | JSON snapshots exist; documented cache metadata/eviction/version handling do not |
| 005 Enforcement | Accepted | event/sweep enforcement exists; no distinct quarantine file operation; removal semantics differ; `Rediscovered` is implementation-only |
| 006 Backend sync | Accepted | endpoints/cursor exist; delta is whole-response collection, not chunked trait-driven streaming |
| 007 Error handling | Accepted | `Error` exists but code also uses `anyhow`, `String`, unwrap/expect/panic paths, and many best-effort suppressions |
| 008 Block notification | Accepted | notification exists through template service, but wire payload differs |
| 009 Audit trail | Accepted | best-effort awaited direct POST exists; no durable mpsc audit service and schema differs |
| 010 Context manager | Accepted | context exists; user became mutable behind `RwLock`, contradicting immutable description |
| 011 File scanner/scripting | Accepted | active, but manifest/signing bypassed, capabilities hard-coded, UUID/schema/error claims incomplete |
| 012 Script port | Accepted | current set has seven main scripts, not the described three copied-as-is |
| 013 Detection engine | Accepted | client exists but has no production caller; env name/cache behavior differ |
| 014 Persona IPC | Accepted | hard dependency retries indefinitely, not three retries/default context; broadcast trust and snapshot claims differ |
| 015 Hook integration | Proposed | installation, IPC, queue, and telemetry exist; policy/DLP evaluator remains allow-only |
| 016 | absent | no file exists; reason unresolved |
| 017 Hook reliability | Proposed | interval zero/default reliability work partly implemented; several proposed store/path changes absent |
| 018 Process map | Proposed | embedded/backend map and refresh largely implemented; platform fallback and replacement nuances differ |
| 019 Sleep/wake/popup | Accepted | process/enforcer gating and cooldown exist; sync is not sleep-gated |
| 020 Respawn resilience | Accepted | rediscovery/sweep/backoff exist; maximum attempts do not gate Rediscovered; config name/examples drifted |
| 021 User-level hook config | Accepted | ownership/merge path exists; replacing whole hooks object can delete user hooks; malformed JSON repair fails |

### Superpowers plan/spec audit

| Path | Status against code |
| --- | --- |
| `docs/superpowers/plans/2026-04-04-fix-project-path-decoding.md` | much decoder work exists; referenced hermetic fixture/test shape is absent and task ledger still says unexecuted |
| `docs/superpowers/plans/2026-04-11-process-monitor-fixes.md` | many process/enforcement fixes landed; remaining differences include unused start-time identity and current store lifecycle |
| `docs/superpowers/specs/2026-04-11-process-monitor-fixes-design.md` | partially implemented design, not authoritative current behavior |
| `docs/superpowers/specs/2026-04-17-e2e-test-harness-design.md` | Documentation-only: proposed harness not present |

## High-value contradiction table

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| all configured/package applications stored in DB | `docs/features.md` | only `DashMap` plus JSON snapshot in v2 | Contradicted |
| entire drives and pip/gem/brew/chocolatey scanned | `docs/features.md` | selected markers/workspaces plus npm/Cargo/Go | Planned but not implemented |
| process exits emit removal/inactive state | architecture/ADR 002 | `process_monitor::run` only untracks PID | Contradicted |
| cache hits refresh TTL and aliases are backend-populated | ADR 003 | cache timestamp unchanged; production update calls absent | Contradicted |
| snapshot contains cache metadata | ADR 004 | `Snapshot {version, entities, delta_cursor}` | Contradicted |
| delta response is incrementally streamed | architecture/ADR 006 | `.collect().await`, first response only | Contradicted |
| unified error enum/no panics | architecture/ADR 007 | anyhow/String plus `expect`, `unwrap`, zero-interval/chunks panic paths | Contradicted |
| audit is asynchronous/durable | ADR 009 | enforcement awaits direct reqwest; no disk queue | Contradicted |
| scripts use manifest limits/capabilities | ADR 011/manifest | executor hard-codes capabilities and 10 s | Contradicted |
| DLP is invoked by hooks | ADR 013/015 | no production `DetectionClient` caller; evaluator always Allow | Planned but not implemented |
| Persona startup retries three times then defaults | ADR 014 | retries indefinitely until tenant or cancel | Contradicted |
| sync pauses during sleep | ADR 019 | only process/enforcer read power watch | Contradicted |
| max kills stops enforcement | ADR 020 | Rediscovered bypasses sweep eligibility | Partially contradicted |
| merge preserves user hook entries | ADR 021 | entire hooks object is replaced | Partially contradicted |
| E2E harness runs mock backend/fake app | E2E design | only manual Markdown/shell helpers; stale binary target | Planned but not implemented |

## Dead, incomplete, and implementation-only code

| Classification | Evidence |
| --- | --- |
| `Dead-code candidate`: `DetectionClient` production path | only module tests construct/call it |
| `Dead-code candidate`: correlator `update_alias`/`update_app` production use | only tests call them in checked repository |
| `Dead configuration candidate`: `PersonaConfig.ipc_timeout_secs` | no runtime read found outside construction/tests/docs |
| `Dead state candidate`: kill-switch `IPC_CONNECTED`, `SHUTDOWN_TX` | written but no behavior reads them |
| Placeholder: hook decisions | `ActivityEvaluator` returns Allow for every request |
| Incomplete: Linux runtime | config/scripts include Linux but orchestrator has no Linux enumerator/actions declaration |
| Incomplete: manifest/signing | committed manifest is not read by active scanner |
| Incomplete: rich Lua graph | raw entities/relationships/risk discarded by converter |
| Implementation-only: seven detector set | current scripts exceed ADR 012 and are not coherently documented |
| Implementation-only: `Rediscovered` enforcement event | absent from older entity/event documents |
| Documentation-only: full E2E framework | design has no implementation |

## File classification for this chapter

| Path group | Role | Analysis status |
| --- | --- | --- |
| `system-monitor/v2/src/discovery/scanner/**/*.rs` | active marker/Lua discovery | fully analyzed |
| `system-monitor/v2/src/discovery/pkg_scanner/**/*.rs` | active npm/Cargo/Go discovery | fully analyzed |
| `system-monitor/v2/scripts/*.lua` | seven active detectors | fully analyzed; handwritten |
| `system-monitor/v2/scripts/lib/*.lua` | four active helper libraries | fully analyzed; handwritten |
| `system-monitor/v2/scripts/manifest.json` | unused manifest metadata | fully analyzed; handwritten |
| `system-monitor/v2/tests/**/*` | integration fixture and manual E2E assets | fully analyzed |
| all 43 Markdown paths enumerated above | current/historical/design/test documentation | fully analyzed and consistency-classified |

No system-monitor path was classified as generated or vendored. Empty documents were retained and explicitly accounted for rather than skipped.
