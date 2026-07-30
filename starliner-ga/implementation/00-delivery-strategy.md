# Delivery Strategy

Status: **normative program plan**

## Outcome

Build one production platform through complete vertical customer outcomes. Do not build a disposable MCP test platform and later “enterprise-ize” it.

The first code may be narrow, but it travels through the final security, durability, evidence, identity, canonical, API, UI, and operational boundaries.

## Delivery principles

1. **Freeze semantics before parallel implementation.** Protocol, authority, identity, lifecycle, and product language are shared dependencies.
2. **Build one path, not two architectures.** Development and certification tooling exercises the production path.
3. **Prove cross-sensor value early.** A one-sensor pass-through cannot validate the central resolver or unified estate.
4. **Treat replay and correction as day-one requirements.** They are not migration polish.
5. **Separate authority from projections.** Product performance never creates a second truth.
6. **Ship customer outcomes behind capability gates.** Internal infrastructure completion is not a product release.
7. **Resolve real external inputs before their gates.** Never fill production identity, region, SLO, or ownership fields with fixtures.
8. **Automate evidence.** Requirements, decisions, gates, artifacts, tests, and release approvals are traceable.

## Program stages

### Stage A — Freeze and mobilize

Outputs:

- approved architecture constitution and ADRs;
- protocol v1 release candidate;
- source profiles and authority map;
- service boundaries and ownership;
- requirements and needs-input registers;
- initial threat/privacy model;
- launch deployment profile decision;
- release and migration plan.

Exit: Gate G0 Architecture Freeze.

### Stage B — Production foundation

Build:

- Starliner Edge Runtime core;
- regional ingest and immutable evidence;
- schema/profile registry;
- producer enrollment and workload identity;
- normalization framework;
- claim/entity/relationship ledgers;
- transactional outbox and projector framework;
- product API shell with real authorization;
- cell deployment, observability, release provenance, backup;
- browser, Browser Backend, endpoint, LLM gateway, and MCP gateway thin adapters for the first customer pass;
- one authoritative identity/population connector.

This is not separately marketed. Every component is production code used by later releases.

Exit: Gate G1 Production Foundation.

### Stage C — Discovery, Inventory, and Evidence GA

Deliver the [DIE Pass](../passes/01-discovery-inventory-evidence/README.md):

- all four sensor families plus Browser Backend and Quilr 1 legacy evidence;
- applications, agents, models, MCP servers and tools resolved across sources;
- important source-backed activity and evidence;
- provenance, coverage, gaps and identity transparency;
- Overview, Inventory, Activity & Evidence, Sources & Coverage;
- production APIs, exports, audit, support, SLO, backup/restore;
- Quilr 1 backfill, semantic parity, cohort pilot, fallback and rollback.

Exit: Gate DIE-GA.

### Stage D — Governed estate and decision-grade findings

Deliver:

- governed ownership and approval;
- deeper workload/delegation identity and canonical execution graph;
- unmanaged/new/ownership-gap findings;
- the supported “production agents began using an unapproved model” insight;
- case workflows;
- MCP policies in observe/warn where supported;
- extended enterprise connectors.

Exit: Gates G2 Unified AI Estate GA and G3 Agentic Estate GA.

### Stage E — Analytics and governed control

Deliver:

- governed metrics/cost/anomaly;
- policy simulation and staged enforcement;
- approvals, typed commands, effect verification;
- certified enforcement by source profile;
- control effectiveness analytics.

Analytics and control can have separate GA gates even if developed concurrently.

Exit: Gates G4 Analytics GA and G5 Governed Control GA.

### Stage F — Quilr 1 retirement and expansion

Complete:

- historical backfill;
- customer cohort cutover;
- parity and rollback closure;
- legacy API/export migration;
- source retirement;
- data retention/deletion;
- dedicated/on-prem profiles and further connectors as separately gated.

Exit: Gate G6 Quilr 1 Retirement.

## Vertical slice rule

Every feature slice includes:

- customer problem and product acceptance;
- sensor/connector source authority;
- protocol and privacy contract;
- evidence and replay;
- normalization and identity;
- canonical mutation and projection;
- coverage and limitations;
- API/UI and authorization;
- operational SLO/alerts/runbook;
- security/privacy testing;
- migration/compatibility;
- release and rollback evidence.

Missing layers remain explicit and block GA for that capability.

## Branch and integration strategy

- Short-lived reviewed changes.
- Contracts and generated clients versioned together.
- Backward-compatible mixed-version operation.
- Trunk remains deployable.
- Incomplete product capability is disabled by server-side entitlement/capability, not hidden only in the UI.
- Schema/database changes use expand/migrate/contract.
- All production promotion uses immutable digests.

## Decision cadence

- Architecture changes: ADR and constitution check.
- Protocol changes: compatibility and conformance review.
- Product findings/metrics: definition review and measured quality.
- Security/privacy: threat and data-flow review.
- Release readiness: independent gate review using recorded evidence.

## Measures of program progress

Progress is not lines of code or number of events. It is:

- golden customer scenarios passing on the production path;
- percentage of GA requirements with evidence;
- source/profile certification;
- identity and finding quality;
- projection/replay correctness;
- SLO and recovery proof;
- migration parity;
- real customer outcome and workflow completion.
