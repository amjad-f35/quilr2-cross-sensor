# Quilr 1 Platform Intelligence Analysis

This corpus is the second-pass capability, telemetry, migration-adapter, and
product-intelligence analysis for the combined Quilr 1 platform:

- `quilrbusiness/quilr-query-builder@c794c45a9c22b75f101c7c73da508d6e7870f97b`
- `quilrbusiness/quilr-web@e6f9d03ddedde756ec447e3fabccdb3a8c418ea9`

It consumes, but does not replace, the complete
[repository archaeology](../../../quilr-platform-analysis/README.md). It also
maps current behavior to the
[Quilr 2 / Starliner architecture](../../../../docs/quilr2-cross-sensor/README.md).

## Scope correction

**Verified in source:** Quilr 1 is not a native browser, endpoint, LLM, or MCP
sensor. It is a web application, query/aggregation service, workflow surface,
and collection of projections over ClickHouse, PostgreSQL, Redis, Neo4j,
Kafka, and external services.

Accordingly:

- a Quilr 1 table row is not automatically a raw sensor observation;
- a request-time query result is not an emitted event;
- a frontend type does not prove a source field is captured;
- a cached or graph-enriched value is not canonical authority;
- a legacy finding/status row is migration evidence until its condition,
  affected entity, provenance, deduplication, and lifecycle are validated.

The retained `sensor-intelligence` directory name follows the requested
cross-source analysis convention. Throughout this corpus, **platform**,
**legacy source**, and **upstream sensor** are kept distinct.

## Evidence language

- `Verified in source`
- `Verified by test`
- `Runtime verified`
- `Documentation claim`
- `Inference`
- `Proposed`
- `Unresolved`
- `Contradiction`

Implementation and platform-availability labels use the exact vocabulary in
the mission prompt.

## Documentation map

1. [Input scope and commits](00-input-scope-and-commit.md)
2. [Platform role and boundaries](01-sensor-role-and-boundaries.md)
3. [Capability and feature catalog](02-capability-and-feature-catalog.md)
4. [Utility and subsystem catalog](03-utility-and-subsystem-catalog.md)
5. [Runtime lifecycle](04-runtime-lifecycle.md)
6. [Capture and extraction surfaces](05-capture-surface-catalog.md)
7. [Native record types](06-native-record-types.md)
8. [Native field dictionary](07-native-field-dictionary.md)
9. [Field lineage](08-field-transformation-lineage.md)
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
20. [Starliner and outbox integration](19-starliner-and-outbox-integration.md)
21. [Platform contract mapping](20-platform-contract-mapping.md)
22. [Cross-sensor correlation](21-cross-sensor-correlation.md)
23. [Product surfaces](22-product-surface-recommendations.md)
24. [Findings and insights](23-findings-and-insights.md)
25. [Coverage and health](24-coverage-capabilities-and-health.md)
26. [Security, privacy, and retention](25-security-privacy-and-retention.md)
27. [Runtime verification](26-runtime-verification.md)
28. [Gap and change plan](27-gap-and-sensor-change-plan.md)
29. [Responsibility boundaries](28-sensor-versus-platform-responsibilities.md)
30. [Minimum viable integration](29-minimum-viable-integration.md)
31. [Acceptance scenarios](30-acceptance-scenarios.md)
32. [Open questions](31-open-questions.md)
33. [Coverage ledger](32-analysis-coverage.md)
34. [Final integration decision sheet](33-final-integration-decision-sheet.md)
35. [Durable analysis state](ANALYSIS_STATE.md)

Machine-readable artifacts are under:

- `matrices/sensor-intelligence/quilr1-platform/`
- `schemas/sensor-intelligence/quilr1-platform/`
- `fixtures/sensor-intelligence/quilr1-platform/`

## Current completion status

**Complete against the available pinned repository and development-harness
evidence.** The corpus contains 36 substantive Markdown documents, 30
populated/validated CSV ledgers, nine populated/parse-validated YAML
artifacts, and ten provenance-labeled JSON fixture families. Exact counts and
validation results are in the
[coverage ledger](32-analysis-coverage.md).

This completion statement has two deliberate limits:

- the 62-row native-field seed is fully reviewed, but it is not a claim of
  every physical column in every deployed ClickHouse/Neo4j profile; obtaining
  that closure requires the live schema metadata listed in
  [open questions](31-open-questions.md);
- production integration is designed, not implemented or certified. Live
  stores, external services, cluster state, production data, and owner
  decisions remain explicit external gates.

The final recommended integration and go/no-go conditions are in the
[decision sheet](33-final-integration-decision-sheet.md).
