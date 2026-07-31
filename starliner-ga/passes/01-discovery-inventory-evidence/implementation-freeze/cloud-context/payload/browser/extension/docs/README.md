# Browser Extension Sensor Intelligence Analysis

This is the completed second-pass sensor-intelligence analysis for the compound
browser-extension sensor formed by:

- `quilrbusiness/Project-Vanguard@fc09f3a20e3e129b02f69f5045965e8fa694c022`
- `quilrbusiness/project-sentinel@88ae4e3b2d531e3b285bb5a42f6ccb76568414f9`
- `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`

It consumes the completed 1,226-file repository archaeology under
`Browser-extension-sensor-analysis/outputs/repository-analysis/` and revalidates
the source paths that create, transform, discard, emit, store, or control
sensor-relevant data.

## Final answer

**Analysis completeness:** Complete for all sensor-relevant behavior in the
three pinned repositories and all requested artifact categories. There are no
partially analyzed in-scope files, ledgers, records, or requested deliverables.
`Partially implemented` in the matrices describes source implementation state,
not analysis coverage.

**Adapter readiness:** **Requires a new stable sensor integration boundary.**
Existing browser-event and heartbeat boundaries are usable for a limited server
adapter, but the compound sensor lacks stable per-installation identity,
versioned native records, durable source delivery, end-to-end delivery results,
and consistent browser/native/backend correlation. The full rationale and
minimum viable route are in the [decision sheet](33-final-integration-decision-sheet.md).

**Discovery truth:** This sensor directly observes browser pages/actions,
third-party Chrome extensions, selected AI web-app activity, browser downloads,
OS clipboard activity on Windows/macOS, and local files involved in transfers.
It does **not** exhaustively discover machines, cloud/serverless/CI workloads,
ephemeral agents, MCP servers/tools/backends, repositories, agent definitions,
prompt files, or Markdown skills.

**Transport truth:** No gRPC or protobuf implementation exists in the pinned
repositories. This is not the principal integration gap: stable identity,
versioned contracts, privacy projection, and a durable outbox must come first.
Authenticated HTTPS batch delivery is sufficient for the MVS; gRPC should be
added only after measured streaming/throughput/SLO requirements justify it.

## Corpus measurements

- 45 capabilities/features
- 57 utilities/subsystems
- 34 runtime/build/test entry points
- 44 capture surfaces
- 59 current/target record types
- 776 native field/data-point rows
- 776 field-lineage rows
- 20 inventory entity classes
- 32 identifiers
- 30 relationship assertions
- 50 native/target event types
- 40 current/derived/proposed metrics
- 26 detectors/classifiers
- 24 control capabilities
- 35 interfaces
- 22 finding definitions/gaps
- 29 required CSV matrices
- 9 YAML schemas/manifests
- 32 fixtures/expected artifacts

## Documentation map

1. [Input scope and commits](00-input-scope-and-commit.md)
2. [Sensor role and boundaries](01-sensor-role-and-boundaries.md)
3. [Capability and feature catalog](02-capability-and-feature-catalog.md)
4. [Utility and subsystem catalog](03-utility-and-subsystem-catalog.md)
5. [Runtime lifecycle](04-runtime-lifecycle.md)
6. [Capture surfaces](05-capture-surface-catalog.md)
7. [Native record types](06-native-record-types.md)
8. [Native field dictionary](07-native-field-dictionary.md)
9. [Field transformation lineage](08-field-transformation-lineage.md)
10. [Discovery and inventory](09-discovery-and-inventory-contributions.md)
11. [Identity and attribution](10-identity-and-attribution.md)
12. [Relationships](11-relationship-contributions.md)
13. [Events and emissions](12-events-and-emissions.md)
14. [Metrics and analytics](13-metrics-and-analytics.md)
15. [Logs, traces, audit, and evidence](14-logs-traces-audit-and-evidence.md)
16. [Detection and classification](15-detection-and-classification.md)
17. [Policy, control, and enforcement](16-policy-control-and-enforcement.md)
18. [Interfaces and extraction points](17-interfaces-and-extraction-points.md)
19. [Adapter architecture](18-adapter-architecture.md)
20. [Starliner and outbox](19-starliner-and-outbox-integration.md)
21. [Platform contract mapping](20-platform-contract-mapping.md)
22. [Cross-sensor correlation](21-cross-sensor-correlation.md)
23. [Product surfaces](22-product-surface-recommendations.md)
24. [Findings and insights](23-findings-and-insights.md)
25. [Coverage, capabilities, and health](24-coverage-capabilities-and-health.md)
26. [Security, privacy, and retention](25-security-privacy-and-retention.md)
27. [Runtime verification](26-runtime-verification.md)
28. [Gap and sensor change plan](27-gap-and-sensor-change-plan.md)
29. [Responsibility boundaries](28-sensor-versus-platform-responsibilities.md)
30. [Minimum viable integration](29-minimum-viable-integration.md)
31. [Acceptance scenarios](30-acceptance-scenarios.md)
32. [Open questions](31-open-questions.md)
33. [Analysis coverage](32-analysis-coverage.md)
34. [Final integration decision sheet](33-final-integration-decision-sheet.md)
35. [Durable analysis state](ANALYSIS_STATE.md)

## Machine-readable artifacts

- `../../../matrices/sensor-intelligence/browser-extension/`
- `../../../schemas/sensor-intelligence/browser-extension/`
- `../../../fixtures/sensor-intelligence/browser-extension/`

## Evidence vocabulary

`Verified in source`, `Verified by test`, `Runtime verified`,
`Documentation claim`, `Inference`, `Proposed`, `Unresolved`, and
`Contradiction` are used exactly as defined by the mission. A native record,
source observation, canonical entity, relationship, event, metric, detector
result, policy decision, enforcement result, finding, and evidence object are
never treated as interchangeable.
