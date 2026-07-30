# Insights, Cases, and Actions Experience

Status: **normative product contract**

## Insights inbox

The default insight view is an action queue, not a detector dump. It supports:

- severity;
- status;
- affected entity and business scope;
- owner;
- first/last observed;
- age and SLA;
- insight family;
- policy;
- coverage/confidence caveat;
- recommended next action.

Default grouping suppresses duplicate symptom noise while preserving affected scope.

## Insight detail

The top of the page states:

1. **What happened**
2. **Why it matters**
3. **What is affected**
4. **What Quilr recommends**
5. **What evidence and coverage support it**

Below that:

- timeline and changes;
- affected entities and relationships;
- policy and approval context;
- safe activity examples;
- evidence provenance;
- identity confidence and conflicts;
- related insights/cases;
- workflow, comments, and audit;
- available actions and expected blast radius.

## Explainability language

The product distinguishes:

- observed directly;
- resolved from multiple sources;
- inferred with confidence;
- not evaluable because coverage is missing;
- verified by an independent effect observation.

It never represents an inference as direct observation.

## Action model

Every action shows:

- intended outcome;
- affected targets;
- capability and sensor that will execute;
- approval requirement;
- current preconditions;
- whether dry-run is available;
- rollback/compensation;
- validity window;
- expected verification method.

The user sees execution and effect separately.

## Case workspace

A case provides:

- objective and status;
- accountable owner;
- findings and affected entities;
- evidence and decisions;
- tasks and due dates;
- approvals/exceptions;
- commands and effects;
- external ticket links;
- resolution reason and residual risk.

Cases support collaboration without copying sensitive evidence into comments.

## Noise controls

- semantic deduplication;
- entity/finding-specific reopen rules;
- bounded grouping;
- approved suppressions with expiry;
- environment-specific severity;
- rule-quality monitoring;
- coverage-aware evaluation;
- per-definition rollback.

Customers can see why an item was grouped or suppressed.

## Notifications

Notifications are purpose-specific and safe:

- critical finding opened;
- owner/approval required;
- SLA escalation;
- command failed or effect not observed;
- visibility materially degraded;
- case updated.

They link to the platform. They do not include restricted evidence.

## Acceptance criteria

- A user understands the condition without sensor-specific knowledge.
- The finding links to reproducible evidence and definition version.
- No unsupported “new,” “all,” or “stopped” claim occurs under insufficient coverage.
- One workflow owns action status; tickets do not create split authority.
- A remediation is not closed until its configured effect is verified or explicitly accepted as unknown.
- Suppression and accepted risk require reason, actor, scope, and expiry.
