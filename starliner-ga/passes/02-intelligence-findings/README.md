# Intelligence and Findings Pass

Status: **deferred pre-freeze checklist; not implementation authority**

Short name: **Intelligence Pass**

This directory preserves the mandatory scope of the future dedicated
intelligence implementation-freeze pass. It prevents the broader normative
architecture for findings and insights from being mistaken for executable
authorization to invent detectors, thresholds, lifecycle behavior, process
roles, schemas, APIs, permissions, or product claims during the Discovery,
Inventory, and Evidence Pass.

The Intelligence Pass begins only through an explicit product/architecture
authorization. Until its requirements, decisions, contracts, executable
schemas, evidence, and gates are frozen, coding agents MUST NOT create a
production intelligence role or advertise customer findings, risk, severity,
recommendations, or posture as implemented Quilr 2 behavior.

## Existing constitutional inputs

The pass must refine rather than contradict:

- [Findings, Insights, and Cases](../../platform/05-findings-insights-and-cases.md)
- [Finding Definition, Grouping, Severity, and Recompute](../../platform/12-finding-definition-governance.md)
- [Findings, Policy, Workflow, and Audit Data Model](../../data/03-findings-policy-workflow-and-audit-model.md)
- [Architecture Constitution](../../02-architecture-constitution.md)
- the versioned canonical entities, relationships, activity, coverage,
  evidence lineage, and canonical-change outbox produced by the
  [Discovery, Inventory, and Evidence Pass](../01-discovery-inventory-evidence/README.md)

## Mandatory implementation-freeze determinations

The dedicated pass MUST determine and freeze all of the following before broad
intelligence implementation begins:

1. Launch finding families and exact versioned definitions.
2. Required inputs and minimum coverage/freshness per finding family.
3. Time windows, temporal ordering, lateness, and correlation semantics.
4. Severity and confidence rubrics, kept separate from source assurance,
   coverage, and work priority.
5. Deduplication, grouping keys, member identity, and over/under-grouping
   protections.
6. Suppression, accepted-risk, exception, expiry, renewal, and audit behavior.
7. Finding opening, continuation, resolution, reopen, correction, and
   evaluation-degraded rules.
8. Detector and feature-runner ABI, isolation, resource limits, and failure
   behavior.
9. Detector/feature versioning, rollout, replay, recompute, restatement,
   rollback, and candidate-namespace promotion.
10. Risk and posture aggregation semantics, including behavior when coverage
    or authoritative context is insufficient.
11. Exact PostgreSQL/analytical schemas, constraints, indexes, partitions,
    lineage, retention, and transactional publication behavior.
12. Work stages, partitioning, leasing, fencing, retries, dependency wake-up,
    checkpoints, backpressure, and scheduling semantics.
13. OpenAPI operations, request/response/error contracts, pagination,
    idempotency, exports, and generated-client compatibility.
14. RBAC, ABAC, ReBAC, RLS, field/content masking, tenant isolation, workflow
    authority, and audit permissions.
15. UI information architecture, finding/case pages, explanations, evidence
    drill-down, degraded/unknown states, and field-level lineage.
16. Positive, negative, property, replay, correction, merge/split, late-data,
    coverage-loss, privacy, adversarial, and falsification fixtures.
17. Performance, scale, cost, accuracy/quality, analyst-workload, shadow-mode,
    rollout, rollback, support, and customer-acceptance gates.

## Required freeze package

The future pass is not complete with prose alone. It must produce, validate,
and bind at minimum:

- a scope/claims/non-goals charter;
- accepted ADRs and a closed decision register;
- versioned finding-definition and feature/detector contracts;
- machine-valid schemas and generated bindings;
- PostgreSQL and analytical DDL;
- durable work, replay, recompute, and projection specifications;
- OpenAPI plus generated-client conformance;
- authorization rules and negative tenant/content-access matrices;
- UI lineage and customer-claim registers;
- deterministic fixtures and an executable conformance suite;
- quality, load, failure, security, privacy, and GA gate catalogs;
- requirements-to-code-to-test-to-evidence traceability;
- an explicit unresolved-input register that never turns examples into
  production defaults.

## Known accountable inputs

At minimum, the pass must close or explicitly gate the broader corpus inputs:

- `NI-015`: finding severity rubric, precision bar, and customer SLA defaults;
- `NI-029`: finding-family grouping windows, thresholds, lifecycle defaults,
  suppression, accepted-risk, and reopen policy.

Additional inputs discovered during the pass must be registered rather than
silently inferred.

## Boundary with the current pass

The current DIE implementation may build only the source-backed prerequisites:

```text
canonical entities and versions
+ typed relationships and lifecycle
+ canonical activity
+ evidence and provenance references
+ coverage/freshness/gap state
+ canonical-change transactional outbox
+ generation-bound authorized projections
```

It must not add placeholder findings, fake risk scores, default thresholds, or
an unfrozen `intelligence` process role. Native sensor findings or policy
effects remain source evidence until a future approved definition admits a
central Quilr 2 finding.
