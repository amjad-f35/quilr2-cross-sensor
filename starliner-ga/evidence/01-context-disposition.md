# Context Disposition and Supersession Ledger

Status: **normative disposition of non-normative inputs**

## Executive disposition

The 25 inputs are valuable architecture evidence, not a second build plan. The later current-sensor audit in [`02-current-sensor-repository-audit.md`](02-current-sensor-repository-audit.md) provides a fourth, revision-pinned source-evidence layer. Together they contain:

1. durable principles that are now incorporated into stricter Starliner contracts;
2. product/repository observations now statically verified at named revisions, with deployed-runtime verification still required;
3. proposed constants, interfaces, vendors, sequencing, and UI structures that are stale or incompatible with the frozen constitution.

The source files remain immutable evidence by digest. This corpus incorporates their useful material through explicit specifications and ADRs. Implementers MUST NOT use the source documents to override a higher-authority decision.

## Pack-level disposition

| Input set | Overall disposition | Incorporated into | Not adopted |
|---|---|---|---|
| RFC-0000–0010 | `incorporated_with_changes` | constitution, protocol, Edge Runtime, control, profiles, platform, quality | source-assigned canonical identity, central PDP on every event, one huge canonical schema, raw hashes/content, draft branches as truth |
| QFG-000–008 | `incorporated_with_changes` | finding doctrine, definition contract, lifecycle, recompute, UI, quality | arbitrary scores, universal windows, source-supplied confidence/quality, perpetual suppression, raw debug as ordinary RBAC |
| Quilr 1 vs 2 contrast | `incorporated_with_changes` | migration, integration roles, runtime topology, engineering control system | exact repo/tool topology, fixed tool vendors, all proposed connectors as launch scope |
| Architecture/workflow context | `incorporated_with_changes` | capability taxonomy, operating workflows, traceability, dependency and actor matrices | “single-tenant/on-prem first,” invented SLOs, 32 UI areas/services, every aspirational capability in first GA |
| Additional dirty conversation | `claim_by_claim_only` | local PEP/bundles/leases, approval, browser split, API/control separation, tenant boundary, repository restraint | MCP-first milestone, source-minted IDs, direct finding signals, unsafe hashes, fixture-first product, invented latency/TTL/polling defaults |

## RFC disposition

| Input | Retained | Changed or superseded |
|---|---|---|
| RFC pack README | Pack identity and historical organization. | Draft dates/status do not confer authority. |
| RFC-0000 | Evidence, intelligence, decision, control, experience separation; sensors do not own global truth. | “Only central decision is synchronous” becomes local deterministic PEP plus bounded central escalation. Materializers are named explicitly. First proof is cross-sensor estate, not an event UI. |
| RFC-0001 | Separate action, decision, entity observation, relationship, finding candidate, cost, and correlation semantics. | Small envelope plus typed profiles; source records use native IDs/claims, not canonical IDs. Ordinary evidence excludes raw payloads and unkeyed sensitive hashes. A source cannot emit an admitted finding. |
| RFC-0002 | Versioned policy, shadow/canary/enforce, bounded decision contract, signed bundles. | Local bundle/lease is the normal latency path. Central policy technology and all numeric targets remain implementation decisions or `NEEDS_INPUT`. |
| RFC-0003 | Thin product-owned adapters, outboxes, staged migration, native chokepoints. | Hook points are now statically mapped at the audited revisions. Deployed artifacts still require release verification. Adapters emit source records, not canonical truth. |
| RFC-0004 | Async enrichment, inventory, relationships, compact hot context, storage-role separation. | Identity, relationships, confidence, risk, and findings are centrally admitted/versioned rather than trusted from producers. |
| RFC-0005 | Evidence/activity/analytics/cost product needs and finding-linked investigation. | Minimal primary IA remains authoritative. Source event meters, raw-content access, and “events first” sequencing are not product contracts. |
| RFC-0006 | MCP local state externalization, durable shared state, replay-safe operational migration. | It is product-specific historical evidence pending live repository/deployment audit. MCP operational storage cannot become the Starliner canonical authority. |
| RFC-0007 | Stable Sensor ABI, thin adapters, manifest, certification, golden traces, exact artifacts, health/self-test, chokepoints. | Capability, certification, mode, health, coverage, and freshness are separate. Only central resolution assigns canonical identity or admitted assurance. |
| RFC-0008 | Endpoint is a compound sensor; component-specific chokepoints, degraded modes, and certification are required. | Repository/security facts are now statically verified at the audited revisions; deployment exposure and current effective configuration require incident/release proof. Full payload hashes are not default-safe. |
| RFC-0009 | Browser service is distinct from the extension client; route, heartbeat, and downstream side effects have distinct reliability semantics. | Browser client and browser backend have separate profiles and certification. A lossy heartbeat cannot become audit proof. Source DTOs/IDs do not become canonical contracts. |
| RFC-0010 | Stateful contract/conformance harness and golden-trace artifact are valid proof infrastructure. | Fakes alone never prove GA. The harness is not a product milestone and must be supplemented with supported dependencies, production-like evidence, and pilots. |

## QFG disposition

| Input | Retained | Changed or superseded |
|---|---|---|
| QFG README | Finding pack organization. | Draft pack is not independent authority. |
| QFG-000 | Event ≠ signal ≠ finding ≠ incident; group and manage findings; link evidence and entities. | Terminology now follows the normative vocabulary and candidate-admission pipeline. |
| QFG-001 | Deterministic extraction and governed signal taxonomy. | Source records do not carry primary canonical IDs or admitted source trust. “New” and absence predicates require coverage. |
| QFG-002 | Definition-specific grouping keys, windows, lifecycle, and accepted-risk behavior. | No universal dedupe windows or evidence-sample size. Severity is recomputed, not monotonically maxed. |
| QFG-003 | Multi-dimensional, explainable severity. | All example weights, bands, bases, and multipliers are rejected as production defaults. Severity, confidence, source assurance, and coverage are separate dimensions. |
| QFG-004 | Explicit lifecycle and reopen behavior. | `triaged` maps to acknowledged/workflow state. Accepted-risk duration requires policy. Suppression expires unless separately authorized by a higher-risk exception design. |
| QFG-005 | Evidence/entity/relationship linkage and safe default display. | Relationship claims are bitemporal/provenanced. Raw evidence requires a purpose-bound content grant; a debug role alone is insufficient. |
| QFG-006 | Versioned replay, backfill, manual-workflow preservation, deterministic recompute. | Candidate namespace, impact diff, atomic promotion, and rollback are required. |
| QFG-007 | Tiered product/operator/debug presentation. | Roles are illustrative. Field authorization, purpose, tenant, and content grant control actual access. |
| QFG-008 | Positive, negative, replay, version, and regression fixtures in CI. | Fixtures are necessary but insufficient for GA quality; representative privacy-approved data and pilots are also required. |

## Conversation-context disposition by decision area

### Incorporated

- Native products retain execution and native enforcement; adapters preserve safe source-native facts.
- Edge WAL and central transactional outbox solve different failure boundaries.
- Policy distribution is asynchronous; common enforcement is synchronous/local; central decision is bounded escalation; evidence/materialization is asynchronous.
- Signed local bundles and scoped leases avoid a central call per action.
- Human approval is an exceptional, centrally governed workflow; an approved exception may issue a short-lived scoped lease.
- UI reads unified canonical APIs. Sensor-native APIs remain for native runtime and certified control/health duties.
- Runtime processes may be multi-tenant, but every record, policy, decision, lease, cursor, command, and evidence mutation is single-tenant.
- Inventory graph and authorization/ReBAC graph are distinct models.
- External integrations have distinct discovery, telemetry, control, and response roles.
- Repository count does not follow architecture-domain count; deployment and repo splits follow ownership, failure, release, and operational needs.
- Top-down customer workflows and bottom-up sensor facts meet in a feature-to-evidence trace.

### Superseded

- MCP-first as the authoritative first milestone. The first production proof is cross-sensor and uses permanent boundaries.
- Producer-minted deterministic canonical IDs.
- `EntitySnapshot` or direct sensor `FindingSignal` as customer finding authority.
- `evidence_quality`, certification, risk, or confidence accepted from an unauthenticated producer field.
- A platform hot path that calls central OPA/context storage for every action.
- A fixture-only frontend as evidence that the platform capability exists.
- One BFF/read API per sensor for normal Quilr 2 pages.
- A 20-plane, 32-domain, or 12-bucket map interpreted as the service/repository/UI topology.

### Rejected as production defaults

- Any unkeyed hash of prompt, response, tool arguments, file contents, headers, cookies, credentials, or other sensitive material in ordinary evidence.
- Hard-coded customer policy in adapters.
- Universal `1–5 ms`, `25–100 ms`, polling interval, lease TTL, evidence sample size, accepted-risk period, risk score, severity band, or suppression duration.
- “Forever” suppression without an explicitly designed, approved, auditable exception authority.
- Raw evidence access based only on a broad debug role.
- Product claims based on mock routes, fake dependencies, a self-test, or a static dashboard.
- Exact repo names, branch names, file paths, technology choices, and deploy topology copied from a conversation without current inspection and accountable approval.

### `NEEDS_INPUT`, deployed-runtime evidence, or accountable approval

- Target implementation repositories, named owners, module destinations, deploy paths, and release-selected source revisions.
- Endpoint signing/private-key material is verified in the audited source. Incident scope, artifact/customer distribution, revocation, rotation, clean artifacts, and customer update are unresolved and stop promotion.
- MCP operational state and configuration authority are statically mapped; effective production topology, optional/private dependencies, credentials, and multi-replica behavior remain deployment evidence.
- Browser extension and backend repositories, route semantics, heartbeat implementation, and source-side handoffs are statically mapped; deployed topology, effective authentication, downstream guarantees, and current artifacts remain release evidence.
- Central policy evaluator, relationship authorization engine, streaming engine, graph projection, and engineering-tool vendors.
- Launch deployment profile, connectors, regions, support matrix, SLOs, capacity, latency, polling, TTL, severity, finding grouping, and risk-acceptance defaults.
- Named owners and the company systems of record for code, decisions, requirements, operations, work, and customer narrative.

## Resulting normative amendments

This review added or strengthened:

- [Capability taxonomy and operating workflows](../09-capability-and-workflow-taxonomy.md)
- [Integration role taxonomy](../platform/11-integration-role-taxonomy.md)
- [Finding definition, grouping, severity, and recompute](../platform/12-finding-definition-governance.md)
- [Browser backend source profile](../profiles/05-browser-backend-source-profile.md)
- [Actor security and authority model](../operations/07-actor-security-and-authority-model.md)
- [Engineering control system](../implementation/10-engineering-control-system.md)
- [Feature-to-evidence traceability](../implementation/11-feature-evidence-traceability.md)
- [Browser sensor binding](../implementation/12-browser-sensor-binding.md)
- [Endpoint sensor binding](../implementation/13-endpoint-sensor-binding.md)
- [LLM Gateway sensor binding](../implementation/14-llm-gateway-sensor-binding.md)
- [MCP Gateway sensor binding](../implementation/15-mcp-gateway-sensor-binding.md)
- [Bidirectional sensor/platform flow](../platform/13-bidirectional-sensor-flow.md)
- [Architecture freeze status](../implementation/16-sensor-architecture-freeze-status.md)
- ADR-0016 through ADR-0018 and corresponding machine-readable registers.
