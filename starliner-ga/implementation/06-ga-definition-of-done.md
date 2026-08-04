# GA Definition of Done

Status: **normative**

A capability is GA only when every applicable section below is satisfied with evidence for the exact production artifacts and deployment profile.

## Product

- Customer problem, target user, promise, and limitation are documented.
- End-to-end user workflows are complete.
- UI language matches evidence authority and coverage.
- Empty, partial, stale, error, and permission states are designed.
- Accessibility acceptance passes.
- Documentation, onboarding, in-product help, and support material ship.
- Entitlement, packaging, regional availability, and deprecation are defined.
- Product telemetry measures the intended outcome without collecting prohibited data.

## Source and protocol

- Source profile and capability manifest are versioned.
- Safe-fact, privacy, lifecycle, reconciliation, time, and deletion semantics are complete.
- Schemas and examples are published.
- Compatibility and mixed-version behavior pass.
- Unknown/unsupported values degrade safely.
- Producer cannot mint canonical truth.
- Exact sensor/runtime/connector artifact is production certified.

## Durability and evidence

- Edge admission and central acceptance promises are proven.
- Idempotency, replay, partial acknowledgement, and corruption recovery pass.
- Immutable evidence, provenance, quarantine, retention, and legal hold work.
- No accepted evidence is silently lost.
- Evidence access and export are authorized and audited.

## Identity and canonical truth

- Source claims and field authority are registered.
- Entity classes and relationships are defined.
- Resolver precision/false-merge risk meets approved criteria.
- Ambiguity remains visible.
- Merge, split, correction, deletion, and late data are reversible/replayable.
- All material fields have provenance.
- Canonical mutation and outbox are atomic.
- Projections rebuild, compare, promote, and roll back safely.

## Activity, insights, and analytics

- Correlation is explainable and confidence-gated.
- Finding definition declares evidence, coverage, severity, lifecycle, and action.
- Finding definition declares grouping, confidence, exception, recompute, promotion, and rollback semantics without unapproved numeric defaults.
- Finding quality is measured on representative data.
- Metrics declare numerator, denominator, coverage, correction, and version.
- Costs distinguish estimate/bill and include price/currency provenance.
- Late data and identity changes restate correctly.
- No raw signal is mislabeled as a finding.

## Policy and control

- Policy lifecycle, authority, precedence, simulation, and exceptions work.
- Decisions reference immutable inputs and explain reasons.
- Commands are typed, signed, targeted, idempotent, time-bounded, and capability-bound.
- Approval and separation of duties are enforced.
- Blast radius, staged rollout, pause, and kill switches pass.
- Execution outcome and effect observation are distinct.
- Offline and failure behavior are explicit.
- Control safety testing and incident exercises pass.

## Security and privacy

- Threat model and privacy assessment are current.
- Actor security records cover every launch human, workload, edge, connector, control, signing, CI/CD, and operations actor.
- Strong customer and workload identity.
- Tenant and regional isolation tested.
- Least privilege and field/evidence controls enforced.
- Secrets excluded; restricted content uses separate grant path.
- Cryptography/key lifecycle approved.
- Critical/high findings resolved or accepted by authorized risk owner under policy.
- Penetration and abuse testing completed.
- Audit and support access verified.

## Reliability and operations

- SLOs and error budgets approved and measured.
- Certified capacity and cost envelope has reserve.
- Backpressure/overload behavior is safe.
- Dashboards, alerts, runbooks, on-call, and escalation exist.
- Backup restore and applicable DR scenario pass.
- Dependency, regional, and backlog recovery pass.
- Incident response and customer communication are exercised.
- No critical unowned operational dependency.

## Secure release

- Immutable artifact digest, SBOM, provenance, and signature.
- All required tests and certification bind to the artifact.
- Database/data migration is backward compatible.
- Canary/cohort rollout and automatic/manual halt criteria defined.
- Rollback tested.
- Vulnerability and license policy pass.
- Release notes and known limitations approved.

## APIs and integrations

- OpenAPI/schema contract and SDK behavior are versioned.
- Authorization, idempotency, pagination, rate limits, and errors pass.
- Webhooks/exports are signed, retryable, expiring, and audited.
- Connector authentication, reconciliation, rate limiting, and deletion pass.
- Integration roles isolate discovery, telemetry, control, and response authority, credentials, queues, health, and kill switches.
- Performance meets the declared workload class.
- Compatibility/deprecation plan exists.

## Migration and customer readiness

Under [ADR-0020](../adrs/0020-die-migration-is-a-separate-parallel-track.md),
this section applies to the independent `MIGRATION` track gate and G6, or to a
release that changes an accepted migration/compatibility seam. It is not a
blanket prerequisite for `DIE-GA` or G2 through G5.

- Current-to-target mapping complete.
- Backfill and semantic parity approved.
- Mutation authority is unambiguous during coexistence.
- Pilot/cohort acceptance succeeds.
- Cutover and rollback are rehearsed.
- Customer users/roles/integrations migrate.
- Support, success, and sales understand exact capability and limitations.

## Governance

- Requirements have implementation and test evidence.
- Every customer claim has a complete feature-to-evidence trace and every tier-0/tier-1 dependency is cataloged with current ownership and runtime proof.
- ADRs and registers reflect reality.
- `NEEDS_INPUT` items required for this gate are resolved.
- Risks have owners and disposition.
- Accountable gate approvers sign the immutable evidence package.
- No waiver hides an unsupported customer claim, cross-tenant risk, durable-loss path, or unsafe control behavior.

## Final rule

“Works in a demo,” “tests pass,” “code is merged,” “deployed to production,” and “one customer enabled it” are not independently equivalent to GA.
