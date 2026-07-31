# Browser Backend sensor-intelligence dossier

**Profile:** Browser Backend / Browser Extension Service  
**Producer:** `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
**Status:** complete source-truth dossier for the pinned profile; not a declaration of global LG-008 closure.

This dossier separates Browser Extension Service from the Browser profile's Vanguard extension and Sentinel native host. It contains the complete pinned source inventory and declaration atlas plus profile-specific records, fields, lineage, events, interfaces, storage, health, privacy, gaps, and adapter mapping.

## Measured coverage

- **tracked source files:** 293
- **parsed declarations:** 2,982
- **routes:** 220
- **registrations:** 1
- **configuration references:** 274
- **imports:** 2,444
- **parse errors:** 0
- **native records:** 11
- **native fields:** 191
- **lineage rows:** 191
- **native events:** 2
- **interfaces:** 14
- **features:** 5
- **matrix files:** 30
- **schemas:** 9
- **fixtures:** 14

## Documentation

- [Input scope and pinned revision](00-input-scope-and-commit.md)
- [Sensor role and boundaries](01-sensor-role-and-boundaries.md)
- [Capability and feature catalog](02-capability-and-feature-catalog.md)
- [Utility and subsystem catalog](03-utility-and-subsystem-catalog.md)
- [Runtime lifecycle and entry points](04-runtime-lifecycle.md)
- [Capture and ingress surfaces](05-capture-surface-catalog.md)
- [Native record types](06-native-record-types.md)
- [Native field dictionary](07-native-field-dictionary.md)
- [Field transformation and lineage](08-field-transformation-lineage.md)
- [Discovery and inventory contributions](09-discovery-and-inventory-contributions.md)
- [Identity and attribution](10-identity-and-attribution.md)
- [Relationship contributions](11-relationship-contributions.md)
- [Events, messages, and emissions](12-events-and-emissions.md)
- [Metrics and analytics](13-metrics-and-analytics.md)
- [Logs, traces, audit, and evidence](14-logs-traces-audit-and-evidence.md)
- [Detection and classification](15-detection-and-classification.md)
- [Policy, control, and enforcement](16-policy-control-and-enforcement.md)
- [Interfaces and extraction points](17-interfaces-and-extraction-points.md)
- [Browser Backend adapter architecture](18-adapter-architecture.md)
- [Starliner and durable outbox integration](19-starliner-and-outbox-integration.md)
- [Platform contract mapping](20-platform-contract-mapping.md)
- [Cross-sensor correlation](21-cross-sensor-correlation.md)
- [Product-surface recommendations](22-product-surface-recommendations.md)
- [Findings and insights](23-findings-and-insights.md)
- [Coverage, capabilities, and health](24-coverage-capabilities-and-health.md)
- [Security, privacy, and retention](25-security-privacy-and-retention.md)
- [Runtime and dynamic verification](26-runtime-verification.md)
- [Gap and source-change plan](27-gap-and-sensor-change-plan.md)
- [Backend versus central-platform responsibilities](28-sensor-versus-platform-responsibilities.md)
- [Minimum viable Browser Backend integration](29-minimum-viable-integration.md)
- [Acceptance scenarios](30-acceptance-scenarios.md)
- [Open questions](31-open-questions.md)
- [Analysis coverage](32-analysis-coverage.md)
- [Final Browser Backend integration decision](33-final-integration-decision-sheet.md)

## Machine-readable evidence

- [Matrices](../../../matrices/sensor-intelligence/browser-backend/)
- [Schemas](../../../schemas/sensor-intelligence/browser-backend/)
- [Fixtures](../../../fixtures/sensor-intelligence/browser-backend/)
- [Pinned source and complete atlas](../../../evidence/)
- [Validation report](../../../reports/browser-backend-validation.json)

## Evidence markers

- `Verified in source` / `SOURCE_PROVEN`: directly supported by pinned source or generated source atlas.
- `Inference`: bounded conclusion from source; not direct runtime proof.
- `Unresolved`: evidence is absent.
- `Proposed`: target design, not implemented source behavior.
- `Dead-code candidate`: repository-wide call/registration analysis did not prove a reachable caller; this is not an unconditional dead-code claim.
