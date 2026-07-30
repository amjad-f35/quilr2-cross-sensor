# Feature-to-Evidence and Dependency Traceability

Status: **normative**

## Purpose

Product intent is designed top-down; sensor and connector reality is established bottom-up. They meet in one trace that prevents both UI fantasy and telemetry-driven spreadsheets.

```text
customer job
  -> supported product claim
  -> workflow and UI/API contract
  -> canonical objects/relationships/findings/metrics
  -> source evidence and coverage
  -> normalization/resolution/materialization
  -> authorization/privacy/operations
  -> acceptance and release gate
```

## Required feature record

Every customer-facing feature declares:

- feature and supported customer claim;
- persona, workflow, decision/action, and canonical product home;
- gate, entitlement, region/deployment/source-profile availability;
- required entities, relationships, activity, findings, policies, metrics, and evidence;
- source roles, native facts, limitations, coverage denominator, freshness;
- normalizer, resolver, materializer, projection, and API dependencies;
- actor permissions and data classifications;
- empty, partial, stale, conflicting, correction, deletion, and not-evaluable behavior;
- SLO, capacity, support, migration, rollout, rollback;
- acceptance scenarios and immutable release proof.

## Baseline feature matrix

| Feature | Supported claim | Required source roles | Central dependencies | Gate |
|---|---|---|---|---|
| AI application inventory | covered active applications resolve across supported surfaces | browser client, endpoint, LLM gateway, identity/population connector | normalization, application resolution, coverage, estate projection, API/UI | G2 |
| Model usage inventory | routed/observed model executions are attributed with stated bypass limits | LLM gateway plus provider discovery where launched | model resolution, activity, coverage, API/UI | G2 |
| Unmanaged active application | active resolved application lacks applicable approval/management state | runtime observations + approval/ownership authority | identity, coverage, definition, workflow | G2 |
| Ownership gap | active canonical object lacks an authoritative accountable owner | runtime/discovery + HRIS/CMDB/directory as launched | authority catalog, resolution, finding | G2 |
| Source coverage | expected and reporting populations/capabilities are current and explainable | all launch source roles | registry, reconciliation, coverage materializer | G2 |
| Agent inventory | definitions/deployments/runtimes and workload principals are distinguished | agent runtime/MCP/gateway/CI-cloud discovery | identity, provenance, relationship graph | G3 |
| MCP/tool inventory | server-scoped tools and executions remain collision-safe | MCP runtime sensor + optional registry discovery | MCP resolution, relationships, activity | G3 |
| Production agents on unapproved model | resolved production agents began executing a newly observed disallowed model under sufficient coverage | agent/MCP/LLM/runtime + policy authority | correlation, coverage, finding definition | G3 |
| Governed analytics | metric result is reproducible, corrected, coverage-aware, and drillable | eligible source roles per metric | metric registry, analytical projection, API/UI | G4 |
| Cost attribution | billed/estimated cost is distinguished and attribution confidence visible | LLM/provider/billing telemetry or discovery | price/currency/version model, metrics | G4 |
| Policy enforcement | a staged policy produced a decision and certified native effect | control/PEP connector or runtime sensor capability | policy, decision, approval, command, verification | G5 |
| Evidence export | authorized watermarked evidence/provenance is exported reproducibly | evidence ledger | export job, authorization, audit, retention | G2 |

The table is a baseline, not a substitute for individual feature records.

## Source-to-feature coverage matrix

For every source profile and role, maintain:

| Dimension | Values |
|---|---|
| Facts | direct, derived, unsupported |
| Mode | discover, observe, decide, enforce, verify |
| Scope | tenant/environment/population/surface |
| Assurance | enrolled, certified artifact/profile, runtime identity |
| Runtime | current mode/version/health |
| Data health | freshness, completeness, gaps, rejects, backlog |
| Product use | enabled features/findings/metrics and degraded claims |

The matrix is computed or reconciled from registry/runtime/evidence state where possible; it is not a manually asserted marketing table.

## Service dependency matrix

Every tier-0/tier-1 service records:

- synchronous dependencies and deadlines;
- asynchronous inputs/outputs, queues, partitions, and backpressure;
- store authority/projection ownership;
- failure isolation and fallback;
- retry/idempotency/circuit-breaker behavior;
- data freshness/lag effect on product claims;
- SLO and capacity coupling;
- recovery order and replay behavior.

A dependency failure cannot silently convert `unknown/not-evaluable` into `healthy/none`.

## Data authority matrix

For each canonical field/object:

```text
source claims
normalizer version
authority/precedence rule
resolver decision
canonical ledger owner
central outbox event
projections
API/UI field authorization
retention/deletion/legal hold
```

Direct cross-service writes and frontend-derived truth are prohibited.

## Version-skew matrix

Compatibility is tested for:

- edge runtime ↔ adapter;
- adapter/profile/schema ↔ ingest;
- ingest/evidence ↔ normalizer;
- normalizer ↔ resolver/materializer;
- canonical/event ↔ projector/API;
- API ↔ UI/SDK;
- policy/compiler ↔ local evaluator;
- command schema ↔ control adapter;
- connector ↔ source API;
- Quilr 1 compatibility ↔ migration normalizer.

The matrix names supported version windows, unknown-field behavior, downgrade/rollback, and deprecation telemetry. Exact windows are release decisions, not invented defaults.

## Gate enforcement

A feature cannot enter customer GA when:

- any required evidence/source role is mock-only;
- its coverage denominator is absent;
- a source/native fact exceeds the profile authority;
- identity/correlation quality is unmeasured;
- the API/UI claim is stronger than the materialized state;
- tenant/field/content authorization is incomplete;
- failure/replay/correction behavior is undefined;
- no named owner, SLO, runbook, rollback, or pilot evidence exists.
