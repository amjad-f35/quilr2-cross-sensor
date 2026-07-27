# Analysis coverage

## Completion boundary

| Area | Count/status | Completion |
| --- | ---: | --- |
| Supplied analysis/evidence documents | 419/419 | Complete |
| Inherited pinned source-analysis records | 6,424/6,424 | Complete within source analyses |
| Source/system capability profiles | 17/17 | Complete; four are external/aggregation boundaries |
| Meaningful source-field rows | 578/578 | Disposition assigned |
| Canonical entity types | 54 | Defined with identity rule and role |
| Entity resolution rules | 54/54 | Defined |
| Relationship types | 64 | Source, authority, lifecycle, availability defined |
| Event types | 75 | Source, required fields, dedup, use, availability defined |
| Finding types | 119 | Condition, evidence, dedup, resolution, action, availability defined |
| Metrics | 33 | Definition, canonical grain, materializer, action, availability defined |
| Source extraction paths | 17 | Mode, cursor, backfill, failure recovery defined |
| Current-to-target mappings | 31 | Reuse/migration verdict defined |
| Exhaustive target traceability | 345 | Every entity, relationship, event, finding, and metric |
| High-level telemetry/integration gaps | 19 | Priority and consequence defined |

Exact generated counts are in [artifact-counts.json](artifact-counts.json).

## Continuous identity addendum coverage

| Area | Count/status | Completion |
| --- | ---: | --- |
| Existing canonical entity types evaluated for identity | 54/54 | Complete |
| Continuous-identity extension types | 64/64 | First-class person/account/runtime/grant/artifact/trust layers defined |
| Total identity types evaluated | 118 | Current identifiers, proof, authority, lifecycle, and migration defined |
| Existing source/sensor profiles evaluated | 17/17 | Complete |
| Identifier namespaces | 34 | Scope, construction, assurance/caveat defined |
| Identifier-strength rules | 30 | Strong/secondary/weak and prohibited inference defined |
| Field-authority rules | 30 | Primary/fallback/conflict/refresh defined |
| Identity lifecycle states | 20 | Independent dimension, entry, transition, authority defined |
| Non-human principal types | 23 | Owner, purpose, credentials, permission, review, revoke defined |
| Identity event types | 82 | Context, evidence, correlation, replay, availability defined |
| Identity finding types | 80 | Condition, inputs, action, close/reopen, producibility defined |
| Identity metrics | 29 | Definition, unknown handling, drill-down, decision defined |
| Identity APIs | 34 | Tenant, authz, idempotency, evidence, failure semantics defined |
| Identity logical services | 16 | Responsibility, inputs, outputs, priority defined |
| Golden scenarios | 71/71 | Invariant, events, evidence, acceptance defined |
| Final identity validations | 40/40 | Target-design traceability defined |
| Identity JSON schemas | 11 | Parse validated |
| Identity matrices | 28 | CSV parse and count validated |

Exact identity counts are in [identity-artifact-counts.json](identity-artifact-counts.json). Current implementation status remains distinct from target-design completeness in [identity mechanism status](matrices/identity-mechanism-status.csv).

## Documents discovered and analyzed

The complete row-level status is [input-coverage.csv](matrices/input-coverage.csv). No supplied analysis document is marked partial or skipped. Toolchains, caches, build output, and third-party dependencies under analysis `work/` trees are intentionally excluded as described in [input scope](00-input-scope-and-coverage.md).

## Sensors and source APIs

The following are fully analyzed to the supplied evidence boundary:

- browser page/content/background message paths;
- native messaging host/file/clipboard/config/heartbeat paths;
- Browser Extension Service HTTP/Kafka/store mappings;
- endpoint process/package/Lua AI-artifact discovery;
- endpoint sync/delta/governance/enforcement;
- endpoint proxy/DLP and IDE hook activity;
- Persona/email identity discovery and diagnostics;
- endpoint dashboard/API aggregation;
- LLM/DLP gateway HTTP, provider, SQLite, NATS, ClickHouse, and worker paths;
- Endpoint Config Manager and gateway-health paths;
- Quilr 1 frontend/query-builder/table/cache/graph behavior.

The external MCP Gateway, live IdP/HR, and connector/provider/billing systems are partially analyzed through consumers only. They are not counted as fully production-verified.

## Fields and dispositions

- [source-fields.csv](matrices/source-fields.csv): full analysis columns including source line, scope, sensitivity, confidence, destination, visibility, and gaps.
- [field-disposition.csv](matrices/field-disposition.csv): destination ledger.
- [data-disposition.csv](matrices/data-disposition.csv): inventory/relationship/event/finding/metric/evidence/raw-only projection.
- [canonical-field-lineage.csv](matrices/canonical-field-lineage.csv): key canonical field authority and merge rules.

No source datum is silently dropped. Operational/configuration fields are retained as raw/operator telemetry; sensitive content is protected evidence; ambiguous fields remain observations.

## Current Quilr 1 mapping

Mapped:

- current AI application, asset, user, account, agent/model/MCP, endpoint/browser/gateway, interaction, finding, status, compliance, audit, executive, adoption, and cost/usage views;
- all named tables required by the mission;
- frontend source tabs and query-builder routes;
- ClickHouse, Neo4j, PostgreSQL, Redis, and external service roles;
- backfill, compatibility, refactor, deprecation, and replacement decisions.

Detailed mappings are in [current state](01-current-quilr1-state.md) and [current-to-target.csv](matrices/current-to-target.csv).

## Validation checklist

- [x] Every sensor/source has a capability and blind-spot profile.
- [x] Every cataloged field has a disposition.
- [x] Every entity type has identity/non-merge guidance.
- [x] Source observations survive merge and split.
- [x] Every relationship has source, authority, and lifecycle.
- [x] Every event has source, required fields, and dedup rule.
- [x] Every finding has evidence, action, dedup, close, and reopen behavior.
- [x] Every metric uses canonical grain and avoids source-row double counting.
- [x] Product views read canonical APIs/materializations.
- [x] Claude and six equivalent identity scenarios are worked.
- [x] Quilr 1 inventory, event, finding, graph, cache, and frontend-mashup behavior is mapped.
- [x] Backfill, replay, dual-read, rollback, and tenant sequencing are explicit.
- [x] Manual merge/split and tenant isolation are explicit.
- [x] Unknown and contradictory evidence remains visible.
- [x] Machine-readable artifacts parse and agree with generated counts.
- [x] Discovery is modeled as observations plus event, incremental, reconciliation, and runtime-verification paths.
- [x] Every existing canonical entity and source has an identity evaluation.
- [x] Human/account/agent/workload/credential/session and every agent/model/application layer remain distinct.
- [x] Git/SWHID/artifact/workload identifiers are scoped to their correct identity layer.
- [x] Claim assurance is separate from resolver confidence.
- [x] Actor chains, delegation attenuation, revocation propagation, and historical decision snapshots are explicit.
- [x] Secret values remain outside inventory; artifact/provenance/trust evidence uses references.
- [x] All 71 mandatory identity scenarios and 40 validations have machine-readable coverage.

## Exact completion status

**Complete:** consolidation and target architecture for all supplied evidence.  
**Complete:** required base and continuous-identity documentation trees, schemas, matrices, and examples.  
**Not production-verified:** runtime estates and repositories absent from the supplied material.  
**Blocked before implementation only by design/integration decisions, not by missing analysis work:** identity ownership/authority, MCP source contract, IdP/HRIS/MDM/cloud/provider/secret-manager contracts, trust-domain and credential-broker choices, signing/provenance policy, retention/privacy policy, and rollout SLOs.
