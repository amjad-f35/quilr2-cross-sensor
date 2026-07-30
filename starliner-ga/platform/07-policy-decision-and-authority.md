# Policy, Decision, and Authority Plane

Status: **normative**

## Scope

The policy plane defines desired enterprise behavior, evaluates governed facts, records explainable decisions, obtains approvals, and authorizes typed commands. It is not merely a collection of detector thresholds.

## Policy object

Each policy contains:

- stable policy ID and immutable version;
- tenant environment and lifecycle;
- owner and approvers;
- purpose and plain-language statement;
- subject and resource selectors;
- typed conditions;
- decision outcomes;
- enforcement mode;
- source/coverage prerequisites;
- exceptions and precedence;
- effective and expiry times;
- compiled artifact digest;
- rollout and rollback configuration;
- audit and change reason.

## Policy categories

- inventory governance;
- model/provider allow, deny, and review;
- agent/tool permissions;
- MCP server and tool exposure;
- data-use constraints;
- identity and ownership requirements;
- browser/endpoint/gateway enforcement;
- cost and budget governance;
- retention and privacy;
- workflow routing and SLA;
- coverage requirements.

## Authority model

Authority is explicit:

- who may author;
- who may review;
- who may publish;
- who may approve an exception;
- who may issue or cancel a command;
- who may use break-glass;
- which service identity may evaluate or compile.

Enterprise RBAC is augmented with tenant-scoped attributes such as environment, business unit, policy category, entity risk tier, and geographic scope.

## Evaluation

Decision inputs reference immutable:

- policy version;
- canonical entity version;
- claims and relationships;
- activity or execution;
- coverage state;
- exception version;
- evaluator version.

Decision outputs state allow, deny, warn, require approval, require justification, quarantine, or not evaluable, with structured reasons.

## Precedence

Precedence is deterministic and visible. A baseline order is:

1. legal or emergency global prohibition, where contractually authorized;
2. tenant emergency policy;
3. explicit deny;
4. scoped approved exception;
5. explicit allow;
6. default review or deny/allow posture.

The actual tenant policy declares its default posture. Conflicts are validation errors or produce `not_evaluable`; they do not rely on list order.

## Simulation and promotion

Policy authors can:

- validate syntax and references;
- preview matched entities;
- simulate against authorized historical activity;
- compare proposed and current decisions;
- estimate affected users/workloads;
- run observe-only;
- stage by cohort;
- pause and roll back.

Simulation results carry coverage caveats and cannot expose data outside the author’s scope.

## Exceptions

Exceptions are first-class, time-bounded objects with:

- target and scope;
- policy/version;
- reason and business owner;
- approver;
- effective and expiry time;
- compensating controls;
- renewal limit;
- evidence and ticket references.

Expired exceptions stop applying automatically and create appropriate workflow.

## Audit and non-repudiation

Policy source, compiled form, publication, approvals, simulations, decisions, commands, and overrides are linked. Material actions use strong user authentication and tamper-evident audit.

## Safety

- Policies cannot expand a sensor’s certified capabilities.
- High-impact commands require stronger approvals and staged rollout.
- Policy evaluation failure has declared behavior.
- A stale or incomplete canonical state cannot silently produce a definitive decision.
- Control plane unavailability does not corrupt evidence collection.
- Global support operators cannot author tenant policy by default.
