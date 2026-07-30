# Engineering Backlog by Production Epic

Status: **normative epic baseline**

Every epic produces production artifacts and gate evidence. Sequencing follows dependencies; parallel work is allowed behind frozen contracts.

## Foundation epics

### E-001 Contract registry and code generation

- publish envelope and record-family schemas;
- source-profile registry and signatures;
- compatibility classifier;
- SDK generation;
- fixtures/conformance runner;
- release/deprecation telemetry.

Exit: mixed-version producer/ingest contract passes.

### E-002 Edge durability core

- typed adapter SPI;
- privacy admission;
- encrypted WAL;
- batch/partial ack/retry;
- pressure ladder and gaps;
- recovery/compaction;
- resource telemetry.

Exit: no admitted record loss under certified fault matrix.

### E-003 Producer trust and fleet management

- bootstrap/enrollment;
- workload identity and rotation;
- capability/certification registry;
- health dimensions;
- update/canary/rollback/revocation;
- safe support diagnostics.

### E-004 Tenant cell substrate

- routing and cell provisioning;
- network/service identity;
- PostgreSQL/object/log/search/analytics dependencies;
- KMS/secrets;
- quotas/workload classes;
- observability/audit;
- backup/restore.

### E-005 Durable ingest and evidence

- auth/route/admission;
- schema/profile/privacy validation;
- idempotency/integrity;
- durable receipt;
- quarantine;
- replay;
- retention/legal hold.

### E-006 Central outbox and projector runtime

- atomic outbox;
- idempotent consumers/checkpoints;
- poison handling;
- candidate projection rebuild;
- parity and atomic promotion;
- lag/SLO tooling.

### E-007 Engineering control and feature trace

- systems-of-record authority map;
- component/service/actor catalog;
- dependency, data-authority, failure, and version-skew matrices;
- requirement/ADR/risk/gate links;
- artifact/deployment/runtime/SLO evidence links;
- freshness, ownership, broken-link, and release-gate checks.

Exit: a reviewer can trace a customer claim to current source authority, exact artifact/configuration, production proof, risks, and approval without a conflicting hidden source of truth.

## Unified Estate epics

### E-101 Launch source profiles

One production-safe observation plus lifecycle/coverage for browser client, browser backend, endpoint, LLM gateway, and enterprise connector; preserve client/backend relay lineage and then expand fields only with product use.

### E-102 Normalization and authority catalog

Typed normalized observations, field authority, source IDs, privacy, drift, reprocessing, impact diff.

### E-103 Identity claim and resolution ledger

Claims, candidates, exact rules, constraints, canonical ID assignment, confidence, decision history, review API.

### E-104 Merge/split and lifecycle

Reappearance, correction, source delete, canonical retirement, merge/split impact, reversible rematerialization.

### E-105 Estate and relationship projections

Application/model aggregate, ownership/governance, aliases/surfaces, activity summary, source/coverage panels, search.

### E-106 Coverage engine

Expected populations, capability health, gaps, freshness, materialized denominators, product data-health surface.

### E-107 First insight and workflow

Unmanaged active application, ownership gap, lifecycle, explanation, assignment/approval workflow, notification, quality.

### E-108 Unified Estate product

Overview, Applications/Models inventory, entity page, Insights, API, export, audit, accessibility, onboarding.

### E-109 Integration role foundation

- runtime/discovery/telemetry/control/response role manifests;
- separate credentials, scopes, queues/cursors, health, certification, and kill switches;
- discovery snapshot/reconciliation and telemetry-import semantics;
- control/effect and response/workflow authority boundaries;
- Connections administration and affected-feature coverage.

Exit: launch integrations cannot inherit authority across roles and normal product reads remain canonical.

## Agentic Estate epics

### E-201 Agent/workload/release identity

Agent definition/version/deployment/runtime, workload principal, artifact/provenance, delegation.

### E-202 MCP source and identity

Server product/deployment, scoped tool/resource/prompt identity, registry reconciliation, collisions, capability/auth posture.

### E-203 Execution correlation

Application/agent/model/MCP/tool chain, principals, trace/source correlation, outcomes, late enrichment, privacy-safe measures.

### E-204 Agentic findings

Production agent on newly discovered unapproved model, new/disallowed tool, exposed MCP server, policy/coverage admission, cases.

### E-205 Agentic product

Agents and MCP & Tools inventory, dependency/execution graph, activity and investigation workflow.

## Analytics epics

### E-301 Metric registry and engine

Metric contract, event-time aggregation, coverage, restatement, quality, analytical projection.

### E-302 Usage and cost

Provider usage/billing connectors, price versions, currency, attribution, estimate vs bill, budget/forecast.

### E-303 Analytics product

Estate/adoption/risk/cost/control views, filters, drilldown, exports, reports, query budgets.

### E-304 Qualified anomalies

Baselines, missing data, seasonality, materiality, quality, explanation, rollout.

## Control epics

### E-401 Policy lifecycle and compiler

Authoring, validation, version, precedence, simulation, bundle, rollout, rollback.

### E-402 Decision and hot context

Bounded Decision API, context versions, edge cache/leases, failure behavior, SLO.

### E-403 Approval and exception

Role/attribute authority, separation of duties, tasks, expiry, break-glass, audit.

### E-404 Command orchestration

Typed registry, authorization, target resolution, transport, state, cancellation, rate/blast-radius.

### E-405 Certified enforcement adapters

Source-specific warn/block/quarantine/configuration actions, offline behavior, idempotency, safety certification.

### E-406 Effect verification

Direct and independent postconditions, reconciliation, unknown/reverted state, workflow closure, analytics.

## Migration and GA epics

### E-501 Quilr 1 production discovery and extraction

Live store/consumer inventory, immutable exports, watermarks, regional handling, compatibility mapping.

### E-502 Backfill and semantic parity

Legacy normalizer, re-resolution, entity/member/relationship/finding/metric parity, discrepancy workflow.

### E-503 Cohort cutover and decommission

Dual read, mutation authority, tenant cohorts, rollback, stabilization, consumer migration, retention, removal.

### E-504 GA assurance

Threat/privacy, penetration, accessibility, capacity, DR, incident exercise, on-call, support, docs, pilots, immutable gate package.
