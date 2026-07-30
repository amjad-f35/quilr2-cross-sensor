# Commands, Workflows, and Effect Verification

Status: **normative**

## Command architecture

A command is a signed, typed, bounded request to a certified enforcement capability. Commands are produced from an authorized policy decision or explicit operator workflow.

## Command object

- command ID and idempotency key;
- tenant, environment, and region;
- policy, decision, and approval references;
- target canonical entity and resolved source target;
- producer/workload destination;
- registered command type and parameters;
- preconditions;
- issue, not-before, and expiry time;
- requested actor and authorizing actor;
- priority and rollout cohort;
- signature and issuer;
- cancellation and compensation semantics.

## Orchestration states

```text
draft
  -> awaiting_approval
  -> authorized
  -> queued
  -> delivered
  -> accepted
  -> executing
  -> terminal
  -> effect_evaluated
```

Terminal states include succeeded, failed, rejected, cancelled, expired, and indeterminate.

## Target resolution

The orchestrator freezes the exact source target and canonical entity version at authorization. If identity changes before execution, a precondition can reject the command. Broad selectors expand to auditable individual command targets or bounded batches.

## Delivery

Command transport is separate from telemetry and supports:

- workload-authenticated streaming or polling;
- at-least-once delivery with idempotent execution;
- cancellation where supported;
- backpressure and rate limits;
- regional routing;
- acknowledgement and outcome delivery;
- emergency stop.

The telemetry outbox carries outcome and effect evidence back to the platform.

## Effect verification

Effect verification can use:

1. direct local postcondition observed by the enforcing adapter;
2. independent sensor observation;
3. authoritative source reconciliation;
4. subsequent policy evaluation;
5. customer confirmation where automation cannot prove the result.

The result is `observed`, `not_observed`, `partially_observed`, `unknown`, or `reverted`, with evidence and time.

## Workflow engine

Customer workflows support:

- assign owner;
- request application/model/tool approval;
- request and approve exception;
- investigate finding;
- trigger certified remediation;
- verify effect;
- notify or create external ticket;
- escalate by SLA;
- close with reason.

Workflow definitions are versioned. Running instances retain their version and migration history.

## Human tasks

Human tasks include due time, assignee/queue, required role, context, allowable decisions, evidence, and audit. Email/chat notifications contain safe summaries and deep links; sensitive decision input remains in the platform.

## Failure and compensation

- Timeouts do not imply failure or success.
- Indeterminate outcomes require reconciliation.
- Repeated execution is guarded by idempotency and current preconditions.
- Reversible actions define compensation.
- Irreversible actions require a dedicated risk and approval class.
- Partial batch success is represented per target.

## Customer protection

- Maximum blast radius per rollout is configurable.
- Rate, concurrency, and target-count limits are enforced centrally and locally.
- High-impact changes support dry-run or observe-only where technically possible.
- Command and workflow activity is visible in audit and entity timelines.
- Customers can stop future automation without losing detection.
