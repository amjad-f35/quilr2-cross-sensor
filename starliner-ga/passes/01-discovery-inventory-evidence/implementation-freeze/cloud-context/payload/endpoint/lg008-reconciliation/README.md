# Endpoint-only LG-008 Central Reconciliation

**Final state: `LG008_OPEN`.**

This directory applies the supplied central LG-008 merger mission to the
Endpoint Sensor only, following the user's explicit exclusion of the Browser,
Browser Backend, LLM Gateway and MCP Gateway profiles. It does not pretend that
one profile is a global five-profile reconciliation.

`Verified:` the admitted endpoint source dossier accounts for all 1,265
repository-analysis paths and provides 63 features, 37 entry points, 66 native
record families, 47 events, 639 native fields and 40 relationship claims.

`Verified:` the frozen platform package contains 74 files and its static
cross-reference, JSON Schema, PostgreSQL grammar and OpenAPI validators pass.

`Contradiction:` the freeze directory is untracked in its containing
repository. This pass records SHA-256 for every file and an aggregate bundle
digest, but that does not substitute for an accepted immutable revision.

`Unresolved:` live PostgreSQL/ClickHouse/object-store conformance, deployed
endpoint reachability, production ACL/configuration, and target UI source were
not available. No such behavior is claimed.

## Outputs

- Human analysis: this directory.
- Machine registries/catalogs/reconciliation:
  [`../../lg008-endpoint/`](../../lg008-endpoint/).
- One validation command:
  `cd ENDPOINT-AGENT-ANALYSIS-COMPLETE && ./lg008-endpoint/validate-lg008`.
- Existing source dossier:
  [`../sensor-intelligence/endpoint-sensor/`](../sensor-intelligence/endpoint-sensor/).

## Documentation map

| Document | Subject |
| --- | --- |
| [00](00-mission-authority-and-scope.md) | Mission, endpoint-only scope override, authority |
| [01](01-input-admission-report.md) | Endpoint admission and four excluded profiles |
| [02](02-frozen-authority-manifest.md) | 74-file content-addressed freeze candidate |
| [03](03-global-stable-id-registry.md) | Deterministic UUIDv5 ID system |
| [04](04-global-evidence-manifest.md) | Pinned source, analysis, freeze, target and runtime evidence |
| [05](05-component-and-entry-point-merger.md) | Components and 37 runtime/build/operations entry points |
| [06](06-feature-and-capability-merger.md) | 63 features and logical capabilities |
| [07](07-event-message-and-record-merger.md) | 66 records, 47 events and transport messages |
| [08](08-global-field-register.md) | 639-field source register and dispositions |
| [09](09-relationship-claim-merger.md) | 40 source-scoped relationship claims |
| [10](10-authorized-access-cookbook.md) | Explicit access or NO_CURRENT_ACCESS_PATH |
| [11](11-negative-observability-matrix.md) | Endpoint-only negative observability |
| [12](12-runtime-evidence-merger.md) | Six retained static/runtime experiments |
| [13](13-source-to-adapter-reconciliation.md) | Per-field adapter boundary |
| [14](14-end-to-end-lineage.md) | Source-to-contract/storage/API/UI lineage |
| [15](15-source-to-target-coverage.md) | Frozen target item coverage |
| [16](16-freeze-reconciliation.md) | Reconciliation status and non-applied authority |
| [17](17-proposed-reconciliation-diffs.md) | Proposed changes only |
| [18](18-contradictions-and-change-control.md) | Contradictions and proposed change control |
| [19](19-validator-design-and-results.md) | 16 validators and one command |
| [20](20-unresolved-evidence-register.md) | 75 questions/procedures |
| [21](21-final-saturation-pass.md) | Endpoint-only saturation and limits |
| [22](22-closure-report.md) | Authoritative `LG008_OPEN` decision |
| [23](23-global-coverage.md) | Measured endpoint-central coverage |

## Measured catalog

| Class | Rows |
| --- | --- |
| access-recipes | 182 |
| capabilities | 31 |
| components | 37 |
| contradictions | 16 |
| diagnostic-signals | 16 |
| diffs | 16 |
| entry-points | 37 |
| events | 47 |
| evidence | 1780 |
| features | 63 |
| fields | 639 |
| health-signals | 40 |
| ids | 12181 |
| lineage | 3803 |
| messages | 47 |
| persisted-artifacts | 13 |
| records | 66 |
| relationships | 40 |
| runtime | 6 |
| target-contracts | 74 |
| target-items | 2485 |
| unresolved | 75 |

## Interpretation rules

- `SOURCE_PROVEN` proves pinned implementation/declaration, not deployment.
- `RUNTIME_OBSERVED` is retained only for commands actually run here.
- Dashed or inferred architecture from the earlier visual work is not upgraded
  into source fact by this reconciliation.
- Every proposed diff is `PROPOSED_NOT_APPLIED`.
- Every customer/product claim still depends on the frozen adapter, identity,
  storage, authorization and read-model implementation being accepted and
  certified.
