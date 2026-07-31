# Whimsical visual architecture system

## Scope and authorization

This linked board system visualizes the pinned `mcpgateway/` source at commit
`1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a` together with the repository
archaeology and sensor-intelligence artifacts in this dossier.

`Verified:` the user explicitly authorized uploading the repository-derived
architectural information needed for these diagrams to Whimsical.

The boards distinguish source/test evidence from proposals and unresolved
runtime state. They do not contain credential or secret values.

## Architecture boards

| Board | Direct link | Primary subjects |
| --- | --- | --- |
| 00 — Architecture index and evidence legend | [Open board](https://whimsical.com/mcp-gateway-00-architecture-index-and-evidence-legend-GaQdJN7yuRHmvzzFNLDxSo?ref=mcp) | Navigation, scope, artifact basis, dynamic-evidence limits, requested-view coverage, visual semantics, omissions, and recommended reading order |
| 01 — System context and runtime topology | [Open board](https://whimsical.com/mcp-gateway-01-system-context-and-runtime-topology-97kjQaZ8WAXQ4QFzWEDoS8?ref=mcp) | External actors and systems, process boundaries, runtime/container topology, module dependencies, network/trust boundaries, and non-applicable browser/frontend subjects |
| 02 — Request, identity, authorization and control | [Open board](https://whimsical.com/mcp-gateway-02-request-identity-authorization-and-control-KNzmqZrreo4Vmpq8555TDq?ref=mcp) | Direct MCP request flow, authentication and identity propagation, authorization/policy enforcement, confirmation control, OneMCP separation, error conversion, and proposed command/effect boundary |
| 03 — Telemetry, data, Starliner and privacy | [Open board](https://whimsical.com/mcp-gateway-03-telemetry-data-starliner-and-privacy-RTfYFVAg2YyHerk7mxzuaM?ref=mcp) | Capture-to-delivery pipeline, DeliveryRecord graph, field lineage, identity/privacy transforms, outbox state, stores and process-local state, health/loss accounting, and target adapter ownership |
| 04 — Lifecycle, configuration, build and operations | [Open board](https://whimsical.com/mcp-gateway-04-lifecycle-configuration-build-and-operations-KMZpKm8oR9pEqrFAwkT6jx?ref=mcp) | Startup and shutdown sequences, configuration/secret propagation, build/test/container/deployment paths, observability surfaces, and an operational debugging decision map |
| 05 — Feature coverage, product intelligence and gaps | [Open board](https://whimsical.com/mcp-gateway-05-feature-coverage-product-intelligence-and-gaps-DEwBTY5HRzKxfaujfsxZT5?ref=mcp) | Feature-to-component traceability, capture/coverage map, product-surface dispositions, findings, contradictions, incomplete and unresolved behavior, dead-code candidates, and P0–P3/MVS priorities |
| 06 — Event flows and state machines | [Open board](https://whimsical.com/mcp-gateway-06-event-flows-and-state-machines-72h5hL9W8bhUwiWBCMke3k?ref=mcp) | Backend registration, outbox delivery states, confirmation handshake, observe-runtime degraded states, and workflow event flow |

Every detailed board has a link back to the architecture index. The index links
to all six detailed boards.

## Visual semantics

The index contains the authoritative legend:

- blue: verified source/runtime component or active request path;
- green: tested behavior, successful delivery, or current telemetry;
- orange: partial, degraded, or potential-issue behavior;
- red: contradiction, failure, missing coverage, or security/operations concern;
- gray outline or dashed edge: proposed, inferred, or unresolved behavior;
- cylinder: persistent store;
- cloud or outlined external boundary: external system;
- dashed connector labelled `Inference`: an inferred or target-state edge rather
  than an implemented call.

`Verified:` successful current flows and incomplete/target flows are visually
separated. Proposed platform responsibilities are not drawn as current gateway
behavior.

## View coverage

The requested architectural subjects are represented as follows.

| Requested view | Board/region | Status |
| --- | --- | --- |
| Architecture index and navigation | 00 | `Verified` |
| System context and external actors | 01 | `Verified` |
| Runtime/container topology | 01 | `Verified`; production multi-process orchestration remains unresolved |
| Frontend architecture | 01 omissions region | `Not applicable:` no frontend/browser application exists in the scoped subtree |
| Backend/service architecture | 01 | `Verified` |
| Module/package dependencies | 01 | `Verified` at subsystem/module level |
| Synchronous request flows | 02 | `Verified` for Direct MCP and materially contrasted with OneMCP |
| Async jobs, events, queues, scheduled work | 04 and 06 | `Verified` |
| Authentication/identity propagation | 02 | `Verified` |
| Authorization/policy enforcement | 02 | `Verified` with bypass/gap annotations |
| Data ownership and persistence | 03 | `Verified` |
| Database/cache/file/process-local state | 03 | `Verified`; browser storage is explicitly not applicable |
| Schemas and data lifecycles | 03 and 06 | `Verified` for material telemetry/outbox/control lifecycles |
| API/integration boundaries | 01–03 | `Verified` |
| Startup sequence | 04 | `Verified` |
| Shutdown/cleanup sequence | 04 | `Verified`; absent cleanup is marked |
| Error/degradation/retry/recovery | 02, 03, 04 and 06 | `Verified` |
| Build, CI/CD, packaging, deployment | 04 | `Verified` for scoped artifacts; release/production orchestration unresolved |
| Configuration and secrets | 04 | `Verified` |
| Observability and health | 03 and 04 | `Verified`; no implemented distributed tracing subsystem found |
| Feature-to-component mapping | 05 | `Verified` |
| Legacy/incomplete/contradictory/unresolved | 05 | `Verified` |
| Important state machines | 06 | `Verified` |
| Operational debugging map | 04 | `Verified` |

## Important inferred and unresolved relationships

- `Inference:` the proposed normalized command/effect adapter in board 02 is a
  target integration boundary derived from the analysis; the current gateway
  does not implement that complete boundary.
- `Inference:` central entity resolution, cross-sensor correlation, finding
  synthesis, and long-term analytics shown in board 03 are target platform
  responsibilities, not implemented gateway-owned processing.
- `Unresolved:` production process supervision for the workflow runner,
  scheduler, retention worker, and ClickHouse synchronizer is absent from the
  scoped deployment artifacts.
- `Unresolved:` production multi-replica state sharing and recovery for
  process-local queues, caches, sessions, locks, and confirmations cannot be
  established from the repository.
- `Unresolved:` live OAuth/IdP, remote MCP, DLP, ZIA, ClickHouse, Google,
  embedding, runner, and central-ingest behavior was not exercised.
- `Unresolved:` the exact pinned private Starliner implementation could not be
  executed because two promised partial-clone blobs were unavailable.
- `Contradiction:` current observation mapping creates a local
  `canonical_entity`, while the target central architecture reserves canonical
  identity resolution for the central resolver.
- `Potential issue:` Direct MCP exceptions converted to error results bypass
  observation scheduling, so failed upstream calls are not uniformly emitted.

## Intentionally omitted or explicitly non-applicable subjects

- Frontend routes/components, browser cookies, `localStorage`,
  `sessionStorage`, browser caches, mobile roots, and browser state:
  `Not applicable` to the scoped backend-only subtree.
- Graph database, Redis, Kafka, and generic message-broker topology:
  `Not implemented` in the scoped source. They are not invented as hidden
  dependencies.
- A complete distributed-tracing topology:
  `Not implemented` in the scoped source; log/health/evidence surfaces are
  shown instead.
- A production ingress, service mesh, Helm, Kubernetes, Terraform, or rollback
  topology:
  `Unresolved` because these artifacts are not present in the scoped subtree.
- Exact live database contents, tenant volumes, latency distributions, error
  rates, and external-service versions:
  `Unresolved` because no production environment was supplied.

## Mandatory visual QA

### Spatial inspection

`Verified:` every board was fetched with detailed object and spatial
information after construction and after the final repairs. A pairwise
bounding-box check was run over every top-level object on every board.

| Board | Final top-level objects | Final board bounds | Accidental bounding-box overlaps |
| --- | ---: | --- | ---: |
| 00 | 36 | `(0,-500)` to `(6010,9028)` | 0 |
| 01 | 38 | `(0,-500)` to `(8000,5628)` | 0 |
| 02 | 43 | `(0,-500)` to `(8290,7628)` | 0 |
| 03 | 42 | `(0,-500)` to `(8400,7628)` | 0 |
| 04 | 51 | `(0,-500)` to `(7500,11978)` | 0 |
| 05 | 52 | `(0,-500)` to `(7650,12278)` | 0 |
| 06 | 51 | `(0,-500)` to `(6400,12828)` | 0 |

`Verified:` final total accidental top-level bounding-box overlaps: **0**.
Intentional containment is limited to board-owned diagram grouping; no
unrelated top-level elements overlap.

### Render inspection

- Seven whole-board renders were generated and inspected.
- Thirty-one cropped major-zone renders were generated and inspected:
  four index zones, four context/topology zones, four request/auth zones, four
  telemetry/data zones, five lifecycle/operations zones, five feature/gap
  zones, and five event/state-machine zones.
- Headings were checked above their sections.
- Node text was checked for clipping and extreme-density problems.
- Flow direction and connector routing were checked in every major region.
- Navigation links and legend placement were kept outside implementation
  flows.
- No diagram objects were deleted or replaced, so no orphaned remnants were
  left behind.

### Defects found and repaired

1. Board 01's first section heading overlapped the remote MCP external-system
   cloud. The heading width was reduced while preserving its readable text.
2. Board 03's `Logs / audit / health` state node overlapped the
   `Current health surfaces` node. The state node was moved left and the zone
   was re-rendered.

The final spatial pass after both repairs and after adding navigation links
reported zero accidental overlaps on all boards.

## Evidence and readability limitations

The whole-board renders are navigation-scale views; symbol-level text is
intended to be read by opening a board and zooming into its deliberately
separated zones. Cropped QA renders confirmed readable text at zone scale.
Connectors are intentionally subordinate to nodes and notes; dense flows were
split into separate boards rather than compressed into a single mega-diagram.

`Static completion:` complete for the pinned repository-derived architecture
and this dossier's analysis.

`Dynamic completion:` partial. The boards faithfully mark unavailable live
systems, exact private-contract behavior, and production deployment state as
`Unresolved`.

`Snapshot limitation:` the boards represent `1b2f2b3...`. The branch later
fast-forwarded to `99f759d...` with 32 changed scoped paths; those later changes
are not drawn or presented as analyzed behavior.
