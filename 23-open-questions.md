# Open questions

## P0 decisions before implementation

1. Who owns global catalog curation, tenant overrides, and rebrand/split approvals?
2. What opaque canonical-ID format, generation service, and legacy alias SLA are required?
3. What are the entity-specific auto-link/auto-merge/review thresholds and acceptable precision targets?
4. What event bus, object store, PostgreSQL topology, encryption/key, and regional residency constraints are approved?
5. What retention/deletion/legal-hold rules apply to prompts, responses, files, clipboard, tool arguments/results, paths, identities, and diagnostics?
6. What are freshness/absence/retirement thresholds per source/object type?
7. Which policies require fail-closed behavior when sensors/materializers are stale?
8. What is the MCP Gateway native source/API/event schema, ID uniqueness, delivery, replay, and authorization model?
9. How will stable agent definition/version/deployment/runtime/session/run/step IDs be produced?
10. What lawful, privacy-preserving evidence distinguishes personal and enterprise browser accounts?

## Source semantics

- Browser/native deployed version compatibility and correction of mixed-batch file association.
- BES proprietary decoder/permission/graph/DWH/Kafka semantics, production routing, schema validation, and loss recovery.
- Endpoint deployed sync schema compatibility, raw Lua relationship preservation, app lifecycle, and strong identifiers.
- Endpoint proxy/IDE platform coverage, delivery spool, attribution, and actual enforcement.
- LLM gateway authoritative production topology, missing worker consumers, provider deployment/region/account fields, and producer acknowledgments.
- Live IdP/HR, connector, provider, billing, and data-catalog contracts.
- Quilr 1 deployed schema/profile/drift/grants/retention/volume/query plans.

## Relationship and authority

- Which current Neo4j labels/edges are authoritative, inferred, cache-like, or stale?
- What current system owns application/product catalog corrections and owner assignments?
- What relationship validity/delete signals exist in external IdP/connectors?
- How is effective authorization/delegation represented across policy, agent, MCP, connector, and resource systems?
- Which data assets have stable source IDs and event-time ownership/classification?

## Findings and metrics

- Approved severity rubric, business criticality, data-class impact, and confidence thresholds.
- Owner routing/escalation and suppression/risk-acceptance governance.
- Confirmation/reopen windows per finding type.
- Billing/rate-card source and reconciliation precedence.
- Definition and verification of task/business outcomes and savings.
- Coverage-aware metric disclosure requirements.

## Migration

- Tenant rollout cohorts and production acceptance thresholds.
- Required duration of dual-read/dual-write and compatibility APIs.
- Historical restatement policy after split/catalog/rule changes.
- Legacy findings/status/audit retention and legal expectations.
- Consumers outside `quilr-web` for the 141 query-builder routes and external services.

## Explicitly unresolved, not assumed

- Complete MCP object/event fields.
- Current production environment values and live data.
- Exact personal/enterprise account identity for browser sessions.
- Agent delegation/tool effect/outcome without new telemetry.
- Historical state reproducibility from current mutable graph/cache.
- Certification and production artifact equality.

These questions do not invalidate the architecture. They are implementation/admission gates, and the proposed model preserves unknown/conflicting evidence until answered.
