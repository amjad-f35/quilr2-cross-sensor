# Quilr 2.0 cross-sensor information architecture

## Build authority

The implementation source of truth is the [Starliner / Quilr 2 GA build corpus](starliner-ga/README.md). The first customer release is now the [Discovery, Inventory, and Evidence Pass](starliner-ga/passes/01-discovery-inventory-evidence/README.md): all four current sensor families plus Browser Backend, canonical inventory, important evidence/activity, coverage, provenance, UI, and reversible Quilr 1 coexistence before findings and policy. Its coding authority is the [evidence-gated implementation freeze](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/README.md), including exact [sensor/field traceability](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/16-sensor-capability-and-field-traceability.md), the closed [five-profile static source authority](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/lg008/README.md), [customer UI contract](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/17-customer-information-architecture.md), [independent readiness verdict](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/21-independent-falsification-and-readiness-verdict.md), [live storage gate](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/22-live-storage-conformance.md), and [production coding handoff](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/23-production-implementation-handoff.md). The broader corpus audits the earlier MCP-first TDD, freezes protocol/identity/data boundaries, binds sensor capabilities to source seams, and defines later production workstreams and gates. `LG-008` is closed for the immutable selected-source cutoff; native artifact/runtime certification remains `LG-005`. See the [current sensor audit](starliner-ga/evidence/02-current-sensor-repository-audit.md), [bidirectional integration flow](starliner-ga/platform/13-bidirectional-sensor-flow.md), and [freeze status](starliner-ga/implementation/16-sensor-architecture-freeze-status.md).

## Outcome

This dossier defines one evidence-preserving information architecture for the supplied browser, endpoint, LLM/DLP gateway, MCP-facing, and current Quilr 1 systems:

```text
raw sensor record
→ source observation
→ canonical identity and aliases
→ current inventory and bitemporal relationships
→ canonical events
→ correlated findings
→ decision-grade metrics
→ minimal AI Estate, Findings, Activity, Coverage, and Resolution views
```

**Proposed:** the architectural unit of ingestion is a tenant-scoped source observation, not an inventory row. A source observation is immutable, replayable, versioned, linked to raw evidence, and may mention several candidate entities. Canonical entities, relationships, events, findings, and metrics are projections that can be rebuilt.

**Verified:** current Quilr 1 does not provide this boundary. It combines ClickHouse tables, Neo4j reads, Redis caches, external APIs, and frontend source-specific calls. `quilr_asset_inventory` is a warehouse row model; the interaction `source` is strategy-specific rather than repository-wide; graph authority and graph-to-warehouse consistency are unresolved. See [current state](01-current-quilr1-state.md) and the current platform [feature catalog](../../quilr-platform-analysis/05-feature-catalog.md), [data dictionary](../../quilr-platform-analysis/08-data-dictionary.md), and [storage analysis](../../quilr-platform-analysis/09-data-models-and-storage.md).

## Key decisions

1. **One product is not one row from each sensor.** `claude.ai`, `Claude.app`, `provider=anthropic/model=claude-*`, and a Claude Desktop MCP client resolve to a shared global product only where catalog-backed identifiers support that conclusion. Their web surface, desktop surface, accounts, model versions/deployments, MCP client, agent dependencies, and activities remain distinct objects.
2. **Identity decisions are evidence, not destructive cleanup.** Every merge is tenant-scoped, confidence-scored, rule/version stamped, explainable, reversible, and preserves every native ID and observation.
3. **Authority is selected per field and relationship.** A catalog may own product vendor/name, an IdP may own department, an endpoint may own installed version, a gateway may own invoked model, and an explicit assignment may own business ownership.
4. **Relationships are typed and bitemporal.** Authorization, dependency, and activity/evidence use separate logical projections over a shared relationship ledger.
5. **Events are not findings.** Events state what happened; finding materializers correlate evidence into an actionable condition with an owner, dedup key, close condition, and reopen rule.
6. **PostgreSQL is the operational canonical and typed-relationship ledger; ClickHouse is the activity/analytic projection; Redis and Neo4j are never authoritative and are not required for this pass; object storage retains immutable evidence payloads.**
7. **Product simplicity is enforced at the API/materialization layer.** The UI never reconstructs identity by calling many sensor APIs.

## Evidence and availability language

Every material conclusion uses one of:

- `Verified` — demonstrated by a supplied analysis document, its pinned source evidence, or a generated ledger.
- `Inference` — strongly supported but not directly demonstrated.
- `Proposed` — target architecture or product behavior.
- `Unresolved` — the supplied evidence cannot settle it.
- `Contradiction` — supplied sources disagree.

Target capabilities use:

- `Available now`
- `Derivable now`
- `Requires new telemetry`
- `Requires external integration`
- `Future capability`

The detailed evidence anchors are maintained in [input scope and coverage](00-input-scope-and-coverage.md). The per-file ledger is [machine-readable](matrices/input-coverage.csv).

## Documentation map

1. [Input scope and coverage](00-input-scope-and-coverage.md)
2. [Current Quilr 1 state](01-current-quilr1-state.md)
3. [Sensor capability catalog](02-sensor-capability-catalog.md)
4. [Field disposition ledger](03-field-disposition-ledger.md)
5. [Canonical object model](04-canonical-object-model.md)
6. [Product catalog and tenant inventory](05-product-catalog-and-tenant-inventory.md)
7. [Source observation contract](06-source-observation-contract.md)
8. [Entity resolution and aliasing](07-entity-resolution-and-aliasing.md)
9. [Relationship graph](08-relationship-graph.md)
10. [Canonical event model](09-canonical-event-model.md)
11. [Event correlation and deduplication](10-event-correlation-and-deduplication.md)
12. [Materialization architecture](11-materialization-architecture.md)
13. [Source extraction and lineage](12-source-extraction-and-lineage.md)
14. [Unified inventory](13-unified-inventory.md)
15. [Findings catalog](14-findings-catalog.md)
16. [Actionable metrics and insights](15-actionable-metrics-and-insights.md)
17. [Enterprise question catalog](16-enterprise-question-catalog.md)
18. [Product surfaces](17-product-surfaces.md)
19. [Current-to-target traceability](18-current-to-target-traceability.md)
20. [Gap and new telemetry plan](19-gap-and-new-telemetry-plan.md)
21. [Migration and backfill plan](20-migration-and-backfill-plan.md)
22. [Minimum viable system](21-minimum-viable-system.md)
23. [Golden scenarios](22-golden-scenarios.md)
24. [Open questions](23-open-questions.md)
25. [Analysis coverage](24-analysis-coverage.md)
26. [Identity foundations](25-identity-foundations.md)
27. [Continuous identity lifecycle](26-continuous-identity-lifecycle.md)
28. [Identity taxonomy](27-identity-taxonomy.md)
29. [Canonical identifier strategy](28-canonical-identifier-strategy.md)
30. [Human identity and IAM](29-human-identity-and-iam.md)
31. [Account linking and federation](30-account-linking-and-federation.md)
32. [Agent identity](31-agent-identity.md)
33. [Model identity](32-model-identity.md)
34. [Workload and service identity](33-workload-and-service-identity.md)
35. [MCP, tool, and connector identity](34-mcp-tool-and-connector-identity.md)
36. [Device, browser, and process identity](35-device-browser-and-process-identity.md)
37. [Secrets, credentials, and keys](36-secrets-credentials-and-keys.md)
38. [Delegation, attenuation, and attribution](37-delegation-attenuation-and-attribution.md)
39. [Source, artifact, and release identity](38-source-artifact-and-release-identity.md)
40. [Provenance, signing, and attestation](39-provenance-signing-and-attestation.md)
41. [Identity resolution and reconciliation](40-identity-resolution-and-reconciliation.md)
42. [Identity events, findings, and metrics](41-identity-events-findings-and-metrics.md)
43. [Current Quilr 1 identity audit](42-current-quilr1-identity-audit.md)
44. [Current-to-target identity migration](43-current-to-target-identity-migration.md)
45. [Identity golden scenarios](44-identity-golden-scenarios.md)

Examples:

- [Claude resolution](examples/claude-resolution.md)
- [ChatGPT resolution](examples/chatgpt-resolution.md)
- [Agent/model/tool resolution](examples/agent-model-tool-resolution.md)
- [Cross-sensor file upload](examples/cross-sensor-file-upload.md)
- [Finding correlation](examples/finding-correlation.md)

Machine-readable artifacts:

- [Canonical entities](schemas/canonical-entities.yaml)
- [Source observation schema](schemas/source-observation.schema.json)
- [Canonical event schema](schemas/canonical-event.schema.json)
- [Relationships](schemas/canonical-relationships.yaml)
- [Finding types](schemas/finding-types.yaml)
- [Materializers](schemas/materializers.yaml)
- [Matrices](matrices/)

Continuous identity addendum:

- [Canonical identity](schemas/canonical-identity.schema.json)
- [Identifier record](schemas/identifier-record.schema.json)
- [Identity observation](schemas/identity-observation.schema.json)
- [Actor chain](schemas/actor-chain.schema.json)
- [Workload identity](schemas/workload-identity.schema.json)
- [Agent identity](schemas/agent-identity.schema.json)
- [Model identity](schemas/model-identity.schema.json)
- [Credential grant](schemas/credential-grant.schema.json)
- [Artifact identity](schemas/artifact-identity.schema.json)
- [Provenance record](schemas/provenance-record.schema.json)
- [Federation](schemas/federation.schema.json)
- [Identity artifact counts](identity-artifact-counts.json)

## Scope result

The dossier accounts for all **419 supplied analysis/evidence documents** outside generated work/toolchain/cache trees and uses the supplied repository analyses’ file ledgers, covering **6,424 source-analysis records** across the pinned browser, endpoint, gateway, and Quilr 1 snapshots. It catalogs **578 meaningful field rows**, **54 canonical entity types**, **64 relationship types**, **75 event types**, **119 evaluated actionable finding types**, and **33 metrics**. These are evidence-corpus coverage counts; the selected-source native field authority is separately closed and content-addressed under `LG-008`. Exact counts are generated in [artifact-counts.json](artifact-counts.json).

The continuous identity addendum evaluates all **54 base entity types**, adds **64 required identity-layer types** for a total of **118 evaluated identity types**, and evaluates all **17 sources** against identity, proof, freshness, authority, lifecycle, and migration requirements. It adds **82 identity event types**, **80 identity finding types**, **29 identity metrics**, **71 golden scenarios**, **40 validation checks**, **11 JSON schemas**, and **28 identity matrices**. Exact addendum counts are generated in [identity-artifact-counts.json](identity-artifact-counts.json).

Completion here means the supplied evidence has been consolidated and the target information and continuous-identity architecture is specified. The selected immutable source revisions for Browser, Browser Backend, Endpoint, LLM Gateway and MCP Gateway have passed the mechanically closed component/record/field/artifact/access-path reconciliation required by `LG-008`. This does not mean deployed artifacts/effective configuration, live IdP/HR/connector/provider/cloud estates, production schemas, cryptographic trust systems, customer exposure, or native runtime behavior were inspected; those remain release evidence and explicit live gates in the [readiness verdict](starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/21-independent-falsification-and-readiness-verdict.md), [freeze status](starliner-ga/implementation/16-sensor-architecture-freeze-status.md), [open questions](23-open-questions.md), and [identity audit](42-current-quilr1-identity-audit.md).
