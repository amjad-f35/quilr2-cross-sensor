# MCP Gateway sensor-intelligence analysis

This dossier is the second-pass sensor analysis for `mcpgateway/` from
`quilrbusiness/quilr-llm-gateway`, pinned to commit
`1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`.

It is intentionally separate from the completed repository-archeology dossier.
The first pass answers what code, interfaces, state, tests, and runtime paths
exist. This pass determines what the gateway can truthfully observe, identify,
measure, emit, enforce, and contribute to Quilr 2.0.

## Current status

`Repository-derived work complete; dynamic boundaries partial:` all 33
required narrative chapters, machine-readable artifacts, fixtures, cross-file
validation, and the seven-board Whimsical architecture system are complete.
Live external systems and the exact complete private contract worktree remain
unavailable. The branch later advanced beyond the pinned snapshot; that
32-path delta is quantified but not mixed into these results. No proposal in
this dossier is an approved production contract.

## Authority order

1. Pinned `mcpgateway/` source and checked-in tests.
2. Runtime evidence recorded against that pinned source.
3. The completed first-pass repository analysis and generated evidence ledgers.
4. The Quilr 2.0 / Starliner GA corpus for **proposed** platform boundaries and
   contracts.
5. Documentation and comments, only when verified against implementation.

The Starliner GA corpus is target authority; it is not evidence that the pinned
sensor already implements the target.

## Evidence language

- `Verified in source`
- `Verified by test`
- `Runtime verified`
- `Documentation claim`
- `Inference`
- `Proposed`
- `Unresolved`
- `Contradiction`

Implementation status and platform availability use the exact vocabularies in
the sensor-intelligence mission. A `Proposed` mapping or product surface is
never presented as current sensor behavior.

## Working documents

- [Input scope and commit](00-input-scope-and-commit.md)
- [Sensor role and boundaries](01-sensor-role-and-boundaries.md)
- [Capability and feature catalog](02-capability-and-feature-catalog.md)
- [Utility and subsystem catalog](03-utility-and-subsystem-catalog.md)
- [Runtime lifecycle](04-runtime-lifecycle.md)
- [Capture surfaces](05-capture-surface-catalog.md)
- [Native record types](06-native-record-types.md)
- [Native field dictionary](07-native-field-dictionary.md)
- [Field transformation lineage](08-field-transformation-lineage.md)
- [Discovery and inventory](09-discovery-and-inventory-contributions.md)
- [Identity and attribution](10-identity-and-attribution.md)
- [Relationships](11-relationship-contributions.md)
- [Events and emissions](12-events-and-emissions.md)
- [Metrics and analytics](13-metrics-and-analytics.md)
- [Logs, traces, audit, evidence](14-logs-traces-audit-and-evidence.md)
- [Detection and classification](15-detection-and-classification.md)
- [Policy, control, enforcement](16-policy-control-and-enforcement.md)
- [Interfaces and extraction points](17-interfaces-and-extraction-points.md)
- [Adapter architecture](18-adapter-architecture.md)
- [Starliner and outbox](19-starliner-and-outbox-integration.md)
- [Platform contract mapping](20-platform-contract-mapping.md)
- [Cross-sensor correlation](21-cross-sensor-correlation.md)
- [Product recommendations](22-product-surface-recommendations.md)
- [Findings and insights](23-findings-and-insights.md)
- [Coverage, capabilities, health](24-coverage-capabilities-and-health.md)
- [Security, privacy, retention](25-security-privacy-and-retention.md)
- [Runtime verification](26-runtime-verification.md)
- [Gap and sensor-change plan](27-gap-and-sensor-change-plan.md)
- [Responsibility matrix](28-sensor-versus-platform-responsibilities.md)
- [Minimum viable integration](29-minimum-viable-integration.md)
- [Acceptance scenarios](30-acceptance-scenarios.md)
- [Open questions](31-open-questions.md)
- [Analysis coverage](32-analysis-coverage.md)
- [Whimsical visual architecture](33-whimsical-visual-architecture.md)
- [Continuation state](ANALYSIS_STATE.md)

The schemas, matrices, fixtures, and visual boards are derived only from the
traced evidence in these chapters.

## Related evidence

- First-pass index:
  `../../../../mcpgateway-repository-analysis/README.md`
- First-pass coverage:
  `../../../../mcpgateway-repository-analysis/21-analysis-coverage.md`
- Quilr 2.0 cross-sensor corpus:
  `../../../../../../../../docs/quilr2-cross-sensor/README.md`
- Normative MCP target profile:
  `../../../../../../../../docs/quilr2-cross-sensor/starliner-ga/profiles/03-mcp-gateway-source-profile.md`
- Current-code target binding:
  `../../../../../../../../docs/quilr2-cross-sensor/starliner-ga/implementation/15-mcp-gateway-sensor-binding.md`

## Confidentiality

Credential and secret values are never copied into this dossier or its
fixtures. Sensitive native fields are documented by name, lifecycle, and
privacy disposition only.
