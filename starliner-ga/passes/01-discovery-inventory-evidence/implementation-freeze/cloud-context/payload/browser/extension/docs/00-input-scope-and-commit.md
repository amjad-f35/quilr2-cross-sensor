# Input Scope and Commit

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Fix the immutable source boundary and identify every evidence input.


## Pinned repository scope

| Input | Type | Version/commit | Purpose | Sensor relevance | Status |
| --- | --- | --- | --- | --- | --- |
| quilrbusiness/Project-Vanguard | Browser extension repository | fc09f3a20e3e129b02f69f5045965e8fa694c022 | Browser/page capture, policy and enforcement, native bridge, UI and telemetry | Primary browser component | Verified in source |
| quilrbusiness/project-sentinel | Native host/endpoint utility repository | 88ae4e3b2d531e3b285bb5a42f6ccb76568414f9 | Native messaging, clipboard, file lookup/scan, device/persona and local state | Primary native component | Verified in source |
| quilrbusiness/browser-extension-service | Spring backend repository | 99e9599e1582184f5061492b430cd0b2af38d753 | Browser event ingress, heartbeat aggregation, Kafka and graph projections | Primary server component | Verified in source |
| Browser-extension-sensor-analysis/outputs/repository-analysis | Existing complete repository archaeology | Pinned to the three commits above | 1,226-file inventory, source atlas, symbol references, interfaces, config, tests and coverage | Complete file-accounting evidence base | Verified in source |
| project-starliner-audit/starliner_contracts | Target Python contracts | Workspace version inspected 2026-07-30 | DeliveryEnvelope, SourceObservation, canonical events, metrics, findings, manifest and health | Target adapter contract | Verified in source |
| project-starliner-audit/starliner_delivery | Reference delivery/outbox implementation | Workspace version inspected 2026-07-30 | SQLite/WAL outbox statuses, idempotency, sequence and retry semantics | Target durable delivery model | Verified in source |
| docs/quilr2-cross-sensor | Cross-sensor architecture and identity guidance | Workspace version inspected 2026-07-30 | Canonical model, source observations, identity, browser/device and MCP boundaries | Platform responsibility/correlation rules | Verified in source |
| Project-Vanguard/VTest | Developer browser test/MCP utility | fc09f3a20e3e129b02f69f5045965e8fa694c022 | Test automation, not production telemetry/discovery | Test/runtime evidence and explicit scope exclusion | Verified in source |
| extension-log-service | External related service referenced by URL only | Not provided | Receives third-party extension inventory/lifecycle records | Missing central inventory contract/implementation evidence | Unresolved |

The prior archaeology accounts for **1,226/1,226 tracked files**:
Project-Vanguard 707, project-sentinel 226, and browser-extension-service 293.
It reports zero partially analyzed and zero skipped tracked files. This pass
reopened the runtime/capture/telemetry/identity/control paths and used the prior
source atlas and symbol references for repository-wide negative searches and
caller checks.

## Direct revalidation scope

Direct source revalidation covered browser manifests and Plasmo entry points;
all LogDrop implementations; event/context/control/upload/download/diagnostic
types; content, main-world and upload bridges; Chrome management/navigation/
native messaging; heartbeat construction; all 44 InterceptorConfig files and
their active registry; the knowledge database; Sentinel main, native messaging,
event/action types, 18 chain registrations, clipboard/file/system-identifier
subsystems; BES event/heartbeat controllers, services, DTOs, producer/consumer,
graph ingestion and 137 transformer mappings; and the Starliner contracts and
reference outbox.

## Repository-wide negative searches

**Verified in source:** searches across the three pinned repositories found no
production `grpc`, `.proto`, protobuf generator, `tonic`, `prost`, `io.grpc`, or
`protoc` implementation. They also found no production MCP environment
discovery. VTest's stdio MCP server is developer test tooling only.

## Scope exclusions

- Dependency caches/build outputs remain classified by the complete first-pass
  inventory; they are not reinterpreted as sensor behavior.
- The external `extension-log-service` repository was not supplied. Its
  receiving/storage contract is `Unresolved`.
- Cloud/IdP/MDM/DLP/Kafka/Neo4j implementations outside these repositories are
  external systems; only the client/adapter behavior in scope is claimed.
- No production source was modified.
