# Delivery Increments and GA Gates

Status: **normative release plan**

## Gate rule

An increment can be deployed internally before its gate, but customer-facing GA claims require all gate evidence. Dates do not override gates.

## G0 — Architecture Freeze

Required:

- constitution and governing ADRs approved;
- protocol object/lifecycle/identity boundaries frozen;
- service/data authority map;
- launch deployment profile;
- source profiles and privacy classes;
- initial threat model;
- requirements, decisions, risks, and needs-input registers;
- release/migration strategy;
- accountable roles assigned.

No broad implementation begins with unresolved canonical identity or durability semantics.

## G1 — Production Foundation

Customer claim: none; this is the production substrate.

Required:

- certified Starliner runtime core;
- workload enrollment and tenant/regional routing;
- durable ingest/evidence/receipt/replay;
- normalizer and resolver framework;
- canonical ledgers and transactional outbox;
- rebuildable projection framework;
- product API authorization;
- tenant cell deployment;
- signed provenance/SBOM;
- SLO instrumentation, backup restore, incident runbooks;
- mixed-version/upgrade compatibility;
- no critical security/privacy findings.

## DIE-GA — Discovery, Inventory, and Evidence Pass

Customer promise:

> Continuously discover and inventory the AI applications, agents, models, MCP servers, and tools visible to covered Browser, Endpoint, LLM Gateway, and MCP Gateway sensors; show the important source-backed activity and evidence with provenance, coverage, and gaps; and transition tenant cohorts without breaking the existing Quilr 1 experience.

This is the first customer-facing release gate. Its complete authority is the [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md).

Required:

- Browser, Browser Backend, Endpoint, LLM Gateway, and MCP Gateway profile certification;
- durable edge and central evidence path;
- normalization, central identity, canonical inventory/relationships/activity/coverage;
- Overview, Inventory, Activity & Evidence, Sources & Coverage, unified APIs, export, and audit;
- explicit privacy capture state, freshness, gaps, ambiguity, and provenance;
- minimal PostgreSQL/object-storage/ClickHouse topology and rebuildable projections;
- exact production artifacts, workload identity, tenant isolation, capacity, backup, support, and accessibility;
- Quilr 1 production inventory, backfill, member-level semantic parity, pilot cohort, fallback, and rollback.

Findings, cases, policy, commands, cost, and Quilr 1 retirement are not required for this gate.

## G2 — Unified AI Estate GA

G2 follows DIE-GA and adds governed ownership/approval and actionable findings to the already-shipped evidence and inventory foundation.

Customer promise:

> See active enterprise AI applications and model usage across browser, endpoint, and routed gateway evidence, with one identity, ownership, governance, source coverage, and actionable unmanaged/new discovery.

Required product:

- DIE-GA inventory and evidence foundation;
- Overview and Applications inventory;
- application/model entity experience;
- ownership and approval;
- coverage/data health;
- unmanaged-active-application and ownership-gap insights;
- case or assignment workflow;
- API/export/audit;
- launch connectors and three launch sensor profiles.

Required proof:

- multi-source resolution quality approved;
- correction/merge/split/rebuild proven;
- insight precision and coverage admission approved;
- largest certified tenant load;
- tenant isolation and privacy assessment;
- accessibility;
- backup/DR and on-call;
- pilot success;
- Quilr 1 coexistence/parity for covered features.

## G3 — Agentic Estate GA

Customer promise:

> See agents, their model and MCP/tool dependencies, their operators/workload identities, and material unapproved or exposed behavior.

Required:

- agent definition/deployment identity;
- workload/service identity and delegation;
- MCP server/tool identity and lifecycle;
- MCP gateway profile certification;
- agent-model-tool execution correlation;
- agent/MCP inventory and entity pages;
- production-agent/unapproved-model finding;
- new/disallowed-tool and exposed-MCP findings where supported;
- cases and workflow;
- coverage and bypass caveats.

Proof includes collision, ambiguous identity, late correlation, privacy-safe argument/result handling, and source bypass behavior.

## G4 — Analytics and Cost GA

Customer promise:

> Measure adoption, risk, governance, activity, and cost using governed, coverage-aware metrics.

Required:

- GA metric catalog;
- analytical projection;
- cost/version/currency model;
- analytics product;
- attribution confidence and unattributed values;
- correction/restatement;
- large export/reporting;
- anomaly definitions separately quality-gated.

## G5 — Governed Control GA

Customer promise:

> Define policy, simulate and approve it, enforce through certified sensors, and verify the observed result.

Required:

- policy lifecycle/compiler/simulation;
- decision API and edge cache;
- approvals/exceptions/break-glass;
- typed command orchestrator;
- at least one certified enforcement capability per advertised source;
- effect verification;
- staged rollout/kill switches;
- control safety and blast-radius tests;
- operator/customer UX;
- policy/control SLO and incident plan.

No generic “autonomous remediation” claim is permitted.

## G6 — Quilr 1 Retirement

Required:

- every retained customer capability mapped or explicitly retired;
- historical backfill and lineage;
- tenant-by-tenant parity;
- legacy API/export consumers migrated;
- reversible cutover period completed;
- no active legacy authority;
- retention/legal-hold and deletion executed;
- customer and support communications complete;
- legacy infrastructure safely decommissioned.

## Optional profile gates

Dedicated cloud, on-prem, air-gapped, restricted-content, regulated region, and each additional connector/source have independent gates. Core SaaS GA does not imply those profiles are supported.

## Gate evidence package

Each gate package includes:

- requirements trace;
- exact artifacts and configuration;
- test/certification results;
- security/privacy/compliance;
- SLO/capacity/cost;
- operational readiness;
- migration and rollback;
- product/UX acceptance;
- pilot/customer evidence;
- open risks and approved exceptions;
- accountable approval.
