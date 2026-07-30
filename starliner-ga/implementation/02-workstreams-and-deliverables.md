# Workstreams and Deliverables

Status: **normative program decomposition**

## Workstream map

### W01 Product and design

Owns customer jobs, information architecture, terminology, workflows, accessibility, research, packaging, and product acceptance.

Deliverables:

- product requirements and golden scenarios;
- overview/inventory/insight/analytics/policy contracts;
- design system and accessibility criteria;
- launch documentation and customer onboarding;
- outcome telemetry and quality feedback.

### W02 Protocol and developer platform

Owns envelope, record families, schemas, source profiles, SDK generation, compatibility, registries, and conformance.

Deliverables:

- protocol v1 schemas and examples;
- source profile manifest format;
- code generators and SDKs;
- version/compatibility policy;
- conformance service and release catalog.

### W03 Starliner Edge Runtime

Owns safe-fact API, privacy engine, WAL, delivery, policy cache, command verifier, health, update, and deployment forms.

Deliverables:

- embedded and/or sidecar runtime for launch profiles;
- durability and offline proof;
- resource budgets;
- enrollment/update/support tooling;
- signed production artifacts.

### W04 Sensor adapters

Separate owners for browser, endpoint, LLM gateway, and MCP gateway.

Deliverables per adapter:

- source semantics and profile;
- capture/reconciliation;
- privacy mapping;
- safe identifiers;
- health/coverage;
- supported enforcement;
- certification matrix and runbook.

### W05 Ingest, evidence, and trust

Owns workload identity, tenant routing, protocol admission, evidence ledger, receipt, quarantine, replay, and retention hooks.

### W06 Normalization and source catalog

Owns field authority, source-native interpretation, deterministic normalizers, catalog release, reprocessing, and drift.

### W07 Identity and canonical graph

Owns claims, resolver, merge/split/review, entity/relationship ledgers, catalog identity, ownership bridges, and evaluation.

### W08 Activity and correlation

Owns candidate activities, execution graph, causal correlation, principal/delegation, outcome, privacy-safe activity APIs.

### W09 Findings, cases, and workflows

Owns insight definitions, admission/coverage, severity, lifecycle, case workflow, notifications, quality, and remediation recommendations.

### W10 Metrics, analytics, and cost

Owns metric contracts, analytical projection, cost model, anomaly definitions, reporting, and exports.

### W11 Policy, decision, and control

Owns policy lifecycle, compiler, simulation, decisions, approvals, exceptions, commands, effect verification, and safety controls.

### W12 Enterprise connectors

Owns role-separated discovery, telemetry import, control, and response runtimes plus IdP, HRIS, MDM, CMDB, provider, cloud, SaaS, ticketing, and data-class integrations. Role authority, credentials, queues, certification, and failure state remain separate.

### W13 Product APIs and search

Owns unified APIs, authorization enforcement, SDKs, search, bulk jobs, webhooks, and compatibility.

### W14 Customer frontend

Owns overview, inventory, insights, analytics, policies, operator surfaces, state/error handling, performance, and accessibility.

### W15 Security, privacy, IAM, and compliance

Owns threat model, identity/access, cryptography, privacy, data governance, assurance, evidence, and incident requirements.

### W16 Cell platform and SRE

Owns deployment, tenancy, networking, stores, observability, SLO/capacity, backups, DR, on-call, and support tooling.

### W17 Quality, certification, and release

Owns test strategy, conformance, E2E, performance/resilience, release provenance, gates, artifact promotion, and defect policy.

### W18 Quilr 1 migration and customer rollout

Owns extraction/backfill, legacy mapping, dual-read/write constraints, parity, tenant cohorts, cutover, rollback, deprecation, and success.

## Cross-workstream contracts

| Producer | Consumer | Contract |
|---|---|---|
| W02 | W03/W04/W05/W12 | protocol schemas, SDK, profile manifest |
| W04/W12 | W06/W07 | source semantics and fixtures |
| W05 | W06 | accepted evidence and replay |
| W06 | W07/W08 | normalized observations |
| W07 | W08/W09/W10/W11/W13 | canonical IDs, claims, relationships, versions |
| W08 | W09/W10 | executions and outcomes |
| W09/W10/W11 | W13/W14 | product contracts |
| W13 | W14 | versioned APIs and authorization behavior |
| W15/W16/W17 | all | platform controls and release gates |
| W18 | W05-W14 | legacy evidence, parity, cutover requirements |

## Definition of ready

A work item is ready when it has:

- requirement ID and customer outcome;
- authority/source and data classification;
- affected contracts and dependencies;
- acceptance and failure scenarios;
- authorization and tenant scope;
- observability and rollout;
- migration/compatibility impact;
- named accountable role.

## Definition of complete

Code merge is not completion. A deliverable is complete when production artifacts, tests, security/privacy evidence, operations, documentation, migration, and product acceptance meet the relevant gate.

## Program control

Actual names, team capacity, and on-call assignments are `NEEDS_INPUT`. No critical workstream may be an informal shared responsibility at a GA gate.

The [engineering control system](10-engineering-control-system.md) and [feature-to-evidence trace](11-feature-evidence-traceability.md) define how requirements, components, dependencies, actors, artifacts, runtime proof, and gates stay connected.
