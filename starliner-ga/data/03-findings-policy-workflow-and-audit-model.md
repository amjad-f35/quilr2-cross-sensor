# Findings, Policy, Workflow, and Audit Data Model

Status: **normative logical model**

## Finding instance

```text
finding_id / finding_version
definition_id / definition_version
tenant/environment
primary entity and affected entity set
dedupe key
severity and reason dimensions
state and evaluation state
first/last observed
opened/acknowledged/resolved/reopened
owner and SLA
evidence/claim/execution references
identity and coverage snapshot
policy/exception references
explanation projection
materializer version
```

Evaluation state is `evaluable`, `evaluation_degraded`, or `not_evaluable`, independent of workflow state.

## Finding transition

Each transition records previous/new state, actor or definition evaluation, reason, evidence, time, and idempotency. User acceptance of risk does not rewrite system evidence.

## Case and task

```text
case_id / version
title/objective/status/priority
owner/collaborators
finding/entity references
tasks and dependencies
SLA/due state
approval/exception/command references
external ticket references
resolution and residual risk
audit trail
```

External tickets mirror or participate in workflow but do not own canonical finding state.

## Policy and version

```text
policy_id / immutable version
purpose/category
source policy and compiled digest
subject/resource selectors
conditions/outcomes/obligations
precedence/default behavior
coverage/context requirements
owner/author/reviewer/publisher
effective/expiry
rollout/rollback
status
```

## Decision

```text
decision_id
policy/version
subject/action/resource
canonical entity versions
context/coverage/exception versions
evaluator/version
verdict/reasons/obligations
origin/local-central-failmode
latency and decision time
```

## Approval and exception

Approvals bind actor, authority, immutable target/action/policy version, decision, reason, time, and expiry. Exceptions add compensating controls and renewal history.

## Command and effect

Command state includes immutable authorization, resolved source target, preconditions, idempotency, validity, delivery attempts, local outcomes, cancellation, compensation, and independent effect evaluations.

## Audit event

```text
audit_event_id
tenant/environment/region
actor principal and authentication context
action and target
request/correlation ID
before/after version references
result and reason
source service/version
occurred/recorded time
purpose/elevation/approval
integrity and retention
```

Audit logs contain safe references, not copied restricted payloads.

## Invariants

- Finding state is not overwritten without a transition.
- A definition version is immutable after use.
- Policy decision inputs are reproducible.
- Approval cannot outlive its target/policy validity.
- Command authorization cannot be changed after issue.
- Effect evidence remains distinct from execution outcome.
- Audit is append-only and tenant-bound.
- Workflow comments cannot authorize a command unless represented as a typed approval.
