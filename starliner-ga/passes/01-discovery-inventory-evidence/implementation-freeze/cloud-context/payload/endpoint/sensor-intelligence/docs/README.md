# Endpoint Sensor Intelligence Analysis

This is the specialized second-pass analysis of the Sentinel endpoint system
as a capability, evidence, discovery, identity, activity, metrics, detection,
control, health/coverage and Quilr/Starliner integration source. It builds on
the completed 1,265-path repository archaeology and re-traces source around
every sensor-relevant catalog.

## Scope

| Item | Value |
| --- | --- |
| Sensor | Sentinel endpoint sensor |
| Sensor type | Endpoint compound sensor/enforcement point |
| Primary repository | `sentinel-endpoint-agent` |
| Current consumer/API | `sentinel-dashboard` |
| Runtime IPC dependency | endpoint-pinned `ipc-event-bus` |
| Additional IPC comparison | current `ipc-event-bus` `main` |
| Existing analysis | [Sentinel Repository Archaeology](../../../repository-analysis/README.md) |
| Cross-sensor target authority | [Quilr 2.0 cross-sensor information architecture](../../../../docs/quilr2-cross-sensor/README.md) |

## Pinned revisions

| Input | Commit |
| --- | --- |
| `sentinel-endpoint-agent` | `a022e52bf2fff6a9445ebad96c3afeaf277e259f` |
| `sentinel-dashboard` | `cd755d37c14b8b86623a15a4dbae41d33b226b2b` |
| current `ipc-event-bus` | `0cf45bc50e4121d6a4521c58f1fa52a97c125e19` |
| endpoint-pinned `ipc-event-bus` | `9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b` |

## Principal conclusion

The endpoint provides valuable, privileged macOS/Windows process,
configuration/package, selected identity, Cursor/Claude hook, proxy/TLS/DLP/
policy and process-control evidence. It is not exhaustive across Linux, cloud,
containers, serverless, CI/CD, remote SCM, generic agent runtimes, MCP gateways
or provider accounts.

**Integration readiness: `Requires a new stable sensor integration boundary`.**
The recommended boundary is small typed component bridges plus one host-local
adapter with enrollment, privacy filtering, compound capability/coverage,
partitioned durable outbox and record-level admission.

The current endpoint has no active default gRPC runtime. Its dormant
feature-gated `DbService` is schema/code-incompatible and is not an MVS
dependency.

## Evidence vocabulary

- `Verified in source`
- `Verified by test`
- `Runtime verified`
- `Documentation claim`
- `Inference`
- `Proposed`
- `Unresolved`
- `Contradiction`

Generated fixtures are not runtime evidence. Proposed platform contracts are
never described as current endpoint emissions.

## Documentation map

| Document | Subject/status |
| --- | --- |
| [ANALYSIS_STATE.md](ANALYSIS_STATE.md) | Durable final/continuation state |
| [00 — Input scope and commit](00-input-scope-and-commit.md) | Inputs, commits, evidence rules |
| [01 — Sensor role and boundaries](01-sensor-role-and-boundaries.md) | Role, environments, modes, definitive limits |
| [02 — Capability and feature catalog](02-capability-and-feature-catalog.md) | 63 features |
| [03 — Utility and subsystem catalog](03-utility-and-subsystem-catalog.md) | 58 utilities/subsystems |
| [04 — Runtime lifecycle](04-runtime-lifecycle.md) | Install/start/capture/degrade/shutdown/update |
| [05 — Capture surface catalog](05-capture-surface-catalog.md) | 58 capture/context/control surfaces |
| [06 — Native record types](06-native-record-types.md) | 66 native record families |
| [07 — Native field dictionary](07-native-field-dictionary.md) | 639 fields/variant payloads |
| [08 — Field transformation lineage](08-field-transformation-lineage.md) | 60 high-value lineages and loss boundaries |
| [09 — Discovery and inventory](09-discovery-and-inventory-contributions.md) | 51 entity contributions and unsupported estate claims |
| [10 — Identity and attribution](10-identity-and-attribution.md) | 30 identifiers and 15 coverage cases |
| [11 — Relationships](11-relationship-contributions.md) | 40 direct/inferred relationship contributions |
| [12 — Events and emissions](12-events-and-emissions.md) | 47 native events and 20 mappings |
| [13 — Metrics and analytics](13-metrics-and-analytics.md) | 50 current/derived/unavailable metrics |
| [14 — Logs, traces, audit and evidence](14-logs-traces-audit-and-evidence.md) | Evidence strength, provenance and current stores |
| [15 — Detection and classification](15-detection-and-classification.md) | 24 detectors/classifiers |
| [16 — Policy, control and enforcement](16-policy-control-and-enforcement.md) | 28 control capabilities and effect limits |
| [17 — Interfaces and extraction points](17-interfaces-and-extraction-points.md) | 52 interfaces and 22 adapter seams |
| [18 — Adapter architecture](18-adapter-architecture.md) | Host-local adapter component design |
| [19 — Starliner and outbox integration](19-starliner-and-outbox-integration.md) | ABI blockers, durability, replay/admission |
| [20 — Platform contract mapping](20-platform-contract-mapping.md) | 639 per-field mappings |
| [21 — Cross-sensor correlation](21-cross-sensor-correlation.md) | 30 overlaps and correlation rules |
| [22 — Product surface recommendations](22-product-surface-recommendations.md) | 799 field/feature/event/metric dispositions |
| [23 — Findings and insights](23-findings-and-insights.md) | 32 finding candidates and admission rules |
| [24 — Coverage, capabilities and health](24-coverage-capabilities-and-health.md) | 28 coverage rows and 40 health metrics |
| [25 — Security, privacy and retention](25-security-privacy-and-retention.md) | 639 per-field privacy dispositions |
| [26 — Runtime verification](26-runtime-verification.md) | Static/dynamic boundary and target test plan |
| [27 — Gap and sensor change plan](27-gap-and-sensor-change-plan.md) | 50 endpoint/adapter/platform gaps |
| [28 — Sensor versus platform responsibilities](28-sensor-versus-platform-responsibilities.md) | Ownership boundaries |
| [29 — Minimum viable integration](29-minimum-viable-integration.md) | 30-item MVS |
| [30 — Acceptance scenarios](30-acceptance-scenarios.md) | 34 executable scenario specifications |
| [31 — Open questions](31-open-questions.md) | 72 unresolved external/runtime decisions |
| [32 — Analysis coverage](32-analysis-coverage.md) | Final measurable coverage ledger |
| [33 — Final integration decision sheet](33-final-integration-decision-sheet.md) | Concise engineering/product decision |

## Machine-readable outputs

- [Schemas](../../../schemas/sensor-intelligence/endpoint-sensor/) — nine
  required YAML contracts.
- [Matrices](../../../matrices/sensor-intelligence/endpoint-sensor/) — 29
  required CSVs plus `input-ledger.csv`.
- [Fixtures](../../../fixtures/sensor-intelligence/endpoint-sensor/) — ten
  required categories and 18 sanitized JSON cases.

## Completion qualification

The pinned-source sensor-intelligence analysis and required artifacts are
complete. Runtime certification is partial: Rust/Go/Docker/Windows and live
backend environments were unavailable, and no production capture was
performed. Those limitations are explicitly recorded as unresolved evidence,
not silently converted into implemented behavior.

