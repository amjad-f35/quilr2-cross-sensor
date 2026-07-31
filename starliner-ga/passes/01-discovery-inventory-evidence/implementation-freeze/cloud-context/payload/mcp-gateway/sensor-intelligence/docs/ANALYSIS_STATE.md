# Analysis state

## Sensor and pinned source

- Sensor: MCP Gateway
- Sensor type: MCP gateway
- Repository: `github.com/quilrbusiness/quilr-llm-gateway`
- Branch: `add_gateway`
- Scoped path: `mcpgateway/`
- Commit: `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`
- Subject worktree at start and after artifact validation: clean at the pin
- Subject worktree at final handoff: clean at
  `99f759d75aa8260f97db6904433c941647a755e5`

## Completed areas

- Read and reconciled the complete second-pass sensor-intelligence mission,
  first-pass repository archaeology, repository instructions, and selected
  Quilr 2.0/Starliner target contracts.
- Accounted for all 351 scoped tracked files through the first-pass inventory
  and used those records to close the second-pass subsystem classification.
- Traced the Python gateway, Direct MCP, OneMCP, workflow controller/runner,
  scheduler, retention worker, ClickHouse synchronizer, Google FastMCP server,
  scripts, examples, tests, and partial Rust implementation.
- Traced current Starliner observe capture, mapping, validation, SQLite outbox,
  delivery, retry, self-test, metrics, manifest, privacy transformations, and
  Direct-handler/registry hooks.
- Separately traced the legacy pre-tool Starliner decision adapter.
- Closed the feature, utility, runtime, capture, native record/field, lineage,
  inventory, identifier, identity, relationship, event, metric, evidence,
  detector, control, interface, extraction, adapter, platform-mapping,
  cross-sensor, product, finding, coverage, health, privacy, gap, MVS, and
  acceptance ledgers.
- Created 36 Markdown documents, 9 YAML schemas/manifests, 29 CSV matrices with
  400 data rows, and 21 JSON fixtures across all 10 required fixture classes.
- Executed the targeted top-level Starliner suite: 78 passed, 6 failed, 1
  warning. Classified all six failures.
- Parsed every YAML, CSV, and JSON artifact; checked Markdown fences and local
  links; validated three current DeliveryRecords and one intentionally invalid
  DeliveryRecord against the available compatible contract descendant.
- Created a seven-board linked Whimsical architecture system covering the
  architecture index, context/topology, request/identity/authorization,
  telemetry/data/privacy, lifecycle/configuration/build/operations,
  feature/product/gaps, and event/state-machine views.
- Fetched all boards with detailed spatial data, inspected seven whole-board
  renders and 31 cropped major-zone renders, repaired two layout collisions,
  and confirmed zero accidental top-level overlaps in the final audit.
- Detected and quantified a post-snapshot fast-forward of `add_gateway`:
  27 modified and 5 added scoped paths between the analyzed `1b2f2b3...` pin
  and final checkout `99f759d...`. Preserved the original evidence pin instead
  of silently mixing revisions.

## Current area

Final handoff. Repository-derived documentation, machine artifacts, dynamic
test classification, and Whimsical visual QA are complete.

## Next exact task

For the analyzed pin, no repository-derived task remains. A new versioned pass
is required if the post-snapshot `99f759d...` branch state must become the
authority. Other future work requires a live integration environment and/or
restoration of the exact complete private Starliner contract worktree.

## Important verified facts

- Direct MCP and OneMCP are separate handler stacks. Current observe
  instrumentation covers Direct `tools/call`, backend registration, and tool
  discovery/refresh; it does not cover the complete OneMCP/resource/prompt/
  session/progress/cancellation surface.
- Observe mapping is optional, post-result, and fail-open. Legacy Starliner
  enforcement is pre-tool and separately configured.
- Current mapping emits `SourceObservation`, `ActionEvent`, one or more
  `MetricEvent` records, and an optional `FindingSignal`, each inside a
  `DeliveryRecord`.
- The current mapping supplies a local `canonical_entity`; this contradicts the
  central-resolution target boundary and is explicitly marked.
- SQLite outbox delivery provides bounded capacity, WAL, idempotent enqueue,
  leases, retries/backoff, partial acknowledgements, and terminal metadata.
- Actor identifiers are HMAC-pseudonymized and token-shaped identifiers are
  opacity-hashed. Raw tool arguments are not placed in current observe records.
- The main process owns three SQLite databases; the workflow runner owns a
  separate SQLite database and artifact directory. Several queues, locks,
  caches, confirmation records, and sessions are process-local.
- The scoped Dockerfile starts only the main gateway; workflow, scheduler,
  retention, and ClickHouse synchronization require separate process handling
  that is not defined in the scoped deployment material.

## Contradictions and material issues

- Current source mapping creates `canonical_entity`; the target architecture
  reserves canonical identity for the central resolver.
- Default pytest discovery excludes top-level Starliner tests.
- Five scoped tests reference parent `scripts/` paths absent from this scoped
  checkout.
- `run_dev.sh` fails when reload is disabled because `reload_args[@]` is
  unbound under `set -u`.
- OAuth columns named `*_encrypted` are handled as plaintext by the current
  repositories.
- The current Direct exception-to-error-response branch bypasses observe
  scheduling, so failed upstream calls are not uniformly represented.

## Remaining unresolved areas

- Exact byte-for-byte behavior at the contract pin: two promised blobs are
  absent from the partial clone, the available local contract HEAD is a
  descendant, and the promisor remote was unreachable.
- Effective production configuration, secrets, workload identity, deployment
  topology, live service versions, and multi-replica behavior.
- Live remote MCP, OAuth/IdP, DLP, ZIA, ClickHouse, Google, embedding, runner,
  and central-ingest behavior.
- Production retention, backup, disaster recovery, clock-skew, corrupt-state,
  disk-full, and crash-window behavior.
- Whether the uncommitted local cross-sensor Starliner GA corpus is the
  release-frozen central target. Per-file hashes are recorded in the scope
  document.
- The 32-path post-pin delta ending at `99f759d...`; it is quantified but not
  analyzed or drawn because this dossier remains pinned to `1b2f2b3...`.

## Artifact locations

- Narrative index: `README.md`
- Coverage ledger: `32-analysis-coverage.md`
- Schemas: `../../../schemas/sensor-intelligence/mcpgateway/`
- Matrices: `../../../matrices/sensor-intelligence/mcpgateway/`
- Fixtures: `../../../fixtures/sensor-intelligence/mcpgateway/`
- Whimsical board ledger: `33-whimsical-visual-architecture.md`
