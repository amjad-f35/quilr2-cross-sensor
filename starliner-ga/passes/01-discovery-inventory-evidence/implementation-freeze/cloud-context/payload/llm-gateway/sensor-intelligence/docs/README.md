# LLM Gateway sensor-intelligence analysis


This is the second-pass capability, telemetry, adapter and product analysis for
the production Quilr LLM Gateway at immutable commit `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d`.

## Reading order

1. [00-input-scope-and-commit](00-input-scope-and-commit.md)
2. [01-sensor-role-and-boundaries](01-sensor-role-and-boundaries.md)
3. [02-capability-and-feature-catalog](02-capability-and-feature-catalog.md)
4. [03-utility-and-subsystem-catalog](03-utility-and-subsystem-catalog.md)
5. [04-runtime-lifecycle](04-runtime-lifecycle.md)
6. [05-capture-surface-catalog](05-capture-surface-catalog.md)
7. [06-native-record-types](06-native-record-types.md)
8. [07-native-field-dictionary](07-native-field-dictionary.md)
9. [08-field-transformation-lineage](08-field-transformation-lineage.md)
10. [09-discovery-and-inventory-contributions](09-discovery-and-inventory-contributions.md)
11. [10-identity-and-attribution](10-identity-and-attribution.md)
12. [11-relationship-contributions](11-relationship-contributions.md)
13. [12-events-and-emissions](12-events-and-emissions.md)
14. [13-metrics-and-analytics](13-metrics-and-analytics.md)
15. [14-logs-traces-audit-and-evidence](14-logs-traces-audit-and-evidence.md)
16. [15-detection-and-classification](15-detection-and-classification.md)
17. [16-policy-control-and-enforcement](16-policy-control-and-enforcement.md)
18. [17-interfaces-and-extraction-points](17-interfaces-and-extraction-points.md)
19. [18-adapter-architecture](18-adapter-architecture.md)
20. [19-starliner-and-outbox-integration](19-starliner-and-outbox-integration.md)
21. [20-platform-contract-mapping](20-platform-contract-mapping.md)
22. [21-cross-sensor-correlation](21-cross-sensor-correlation.md)
23. [22-product-surface-recommendations](22-product-surface-recommendations.md)
24. [23-findings-and-insights](23-findings-and-insights.md)
25. [24-coverage-capabilities-and-health](24-coverage-capabilities-and-health.md)
26. [25-security-privacy-and-retention](25-security-privacy-and-retention.md)
27. [26-runtime-verification](26-runtime-verification.md)
28. [27-gap-and-sensor-change-plan](27-gap-and-sensor-change-plan.md)
29. [28-sensor-versus-platform-responsibilities](28-sensor-versus-platform-responsibilities.md)
30. [29-minimum-viable-integration](29-minimum-viable-integration.md)
31. [30-acceptance-scenarios](30-acceptance-scenarios.md)
32. [31-open-questions](31-open-questions.md)
33. [32-analysis-coverage](32-analysis-coverage.md)
34. [33-final-integration-decision](33-final-integration-decision.md)

## Evidence rules

`Verified in source` is static implementation evidence. `Verified by test`
requires a cited test. `Runtime verified` requires an executed runtime result.
`Proposed` is target behavior only. `Unresolved` records missing evidence.
Captured, parsed, stored, emitted, delivered, acknowledged, materialized and
displayed states are kept distinct.

## Machine-readable artifacts

- [adapter-components.csv](../../../matrices/sensor-intelligence/llm-gateway/adapter-components.csv)
- [capture-points.csv](../../../matrices/sensor-intelligence/llm-gateway/capture-points.csv)
- [contradictions.csv](../../../matrices/sensor-intelligence/llm-gateway/contradictions.csv)
- [control-capabilities.csv](../../../matrices/sensor-intelligence/llm-gateway/control-capabilities.csv)
- [coverage.csv](../../../matrices/sensor-intelligence/llm-gateway/coverage.csv)
- [cross-sensor-overlaps.csv](../../../matrices/sensor-intelligence/llm-gateway/cross-sensor-overlaps.csv)
- [detectors.csv](../../../matrices/sensor-intelligence/llm-gateway/detectors.csv)
- [environment-uses.csv](../../../matrices/sensor-intelligence/llm-gateway/environment-uses.csv)
- [event-mappings.csv](../../../matrices/sensor-intelligence/llm-gateway/event-mappings.csv)
- [extraction-points.csv](../../../matrices/sensor-intelligence/llm-gateway/extraction-points.csv)
- [features.csv](../../../matrices/sensor-intelligence/llm-gateway/features.csv)
- [field-lineage.csv](../../../matrices/sensor-intelligence/llm-gateway/field-lineage.csv)
- [findings.csv](../../../matrices/sensor-intelligence/llm-gateway/findings.csv)
- [gaps.csv](../../../matrices/sensor-intelligence/llm-gateway/gaps.csv)
- [health-metrics.csv](../../../matrices/sensor-intelligence/llm-gateway/health-metrics.csv)
- [identifiers.csv](../../../matrices/sensor-intelligence/llm-gateway/identifiers.csv)
- [identity-coverage.csv](../../../matrices/sensor-intelligence/llm-gateway/identity-coverage.csv)
- [input-ledger.csv](../../../matrices/sensor-intelligence/llm-gateway/input-ledger.csv)
- [interfaces.csv](../../../matrices/sensor-intelligence/llm-gateway/interfaces.csv)
- [inventory-entities.csv](../../../matrices/sensor-intelligence/llm-gateway/inventory-entities.csv)
- [logs-traces-audit.csv](../../../matrices/sensor-intelligence/llm-gateway/logs-traces-audit.csv)
- [metrics.csv](../../../matrices/sensor-intelligence/llm-gateway/metrics.csv)
- [mvs-scope.csv](../../../matrices/sensor-intelligence/llm-gateway/mvs-scope.csv)
- [native-events.csv](../../../matrices/sensor-intelligence/llm-gateway/native-events.csv)
- [native-fields.csv](../../../matrices/sensor-intelligence/llm-gateway/native-fields.csv)
- [native-record-types.csv](../../../matrices/sensor-intelligence/llm-gateway/native-record-types.csv)
- [platform-contract-mapping.csv](../../../matrices/sensor-intelligence/llm-gateway/platform-contract-mapping.csv)
- [privacy-disposition.csv](../../../matrices/sensor-intelligence/llm-gateway/privacy-disposition.csv)
- [product-disposition.csv](../../../matrices/sensor-intelligence/llm-gateway/product-disposition.csv)
- [relationships.csv](../../../matrices/sensor-intelligence/llm-gateway/relationships.csv)
- [runtime-entry-points.csv](../../../matrices/sensor-intelligence/llm-gateway/runtime-entry-points.csv)
- [runtime-verification.csv](../../../matrices/sensor-intelligence/llm-gateway/runtime-verification.csv)
- [sensor-vs-platform.csv](../../../matrices/sensor-intelligence/llm-gateway/sensor-vs-platform.csv)
- [source-files.csv](../../../matrices/sensor-intelligence/llm-gateway/source-files.csv)
- [symbols.csv](../../../matrices/sensor-intelligence/llm-gateway/symbols.csv)
- [test-cases.csv](../../../matrices/sensor-intelligence/llm-gateway/test-cases.csv)
- [utilities.csv](../../../matrices/sensor-intelligence/llm-gateway/utilities.csv)

Schemas are under `schemas/sensor-intelligence/llm-gateway/`; fixtures under
`fixtures/sensor-intelligence/llm-gateway/`.
