# Findings, Insights, and Cases

Status: **normative**

## Product model

An **insight definition** is versioned detection logic. A **finding** is a tenant-specific materialized instance. A **case** is a customer workflow grouping one or more findings, evidence, decisions, and actions.

Signals and source events never become findings merely because they exist.

The detailed definition, grouping, severity, lifecycle, candidate-namespace, recompute, and release rules are normative in [Finding Definition, Grouping, Severity, and Recompute](12-finding-definition-governance.md).

## Finding admission contract

Every GA insight definition declares:

- stable definition ID and version;
- customer problem and plain-language title;
- applicable entity classes;
- required source profiles and capabilities;
- minimum coverage and freshness;
- evidence predicates;
- correlation and identity-confidence requirements;
- severity rubric and rationale;
- suppression and exception semantics;
- opening, update, resolution, and reopen conditions;
- remediation options;
- owner-routing rules;
- test corpus and measured quality;
- known false-positive and false-negative modes;
- product tier and regional availability;
- rollback behavior.

## Severity

Severity is not an invented numeric constant. It is derived from documented dimensions:

- potential impact;
- exposure or reachability;
- affected data/control class;
- likelihood or observed exploitation;
- breadth and duration;
- policy criticality;
- confidence and coverage.

The UI shows the categorical result and the material reasons. Customer severity overrides are versioned policy, not UI-only decoration.

Severity, confidence, source assurance, coverage, and work priority are separate outputs. Corrections and recompute can reduce current severity while preserving history.

## Finding lifecycle

```text
candidate
  -> open
  -> acknowledged
  -> in_progress
  -> resolved | accepted_risk | false_positive | suppressed
  -> reopened
```

System evaluation controls candidate/open/update/auto-resolution. Authorized users control workflow states where allowed. Evidence history is retained.

## Supported initial insight families

1. Newly discovered unmanaged AI application.
2. New or unapproved model use.
3. Agent or workload using an unapproved model.
4. Agent invoking a newly discovered or disallowed tool.
5. Public or weakly authenticated MCP server exposure.
6. Sensitive data class used through an unapproved AI surface, where the source can support it.
7. Ownership or governance gap for active AI.
8. Visibility or enforcement coverage gap.
9. Material activity or cost anomaly with a valid baseline.
10. Policy bypass or failed enforcement effect.

Each family is independently gated; the list is not a claim that all are available on day one.

## Example: newly discovered model

The sentence “Three production agents began using a newly discovered model that is not on the approved model list” requires:

- three resolved production agent deployments;
- model deployment resolution;
- execution relationships within the finding window;
- an authoritative approval policy at evaluation time;
- coverage sufficient to support “began using”;
- evidence links from at least one execution source;
- no applicable exception;
- finding logic version and identity confidence.

Without these, the platform may say “model string observed” but cannot make the stronger claim.

## Coverage admission

Findings that depend on absence, “all,” “new,” “began,” “stopped,” or a rate require a coverage denominator. If coverage drops:

- the finding can become `evaluation_degraded`;
- auto-resolution pauses;
- the UI explains which source or population is missing;
- no unsupported reassurance is generated.

## Cases and remediation

Cases add:

- owner and collaborators;
- SLA and status;
- related findings and entities;
- comments and decisions;
- approval and exception requests;
- remediation plan;
- commands and outcomes;
- external ticket references;
- immutable audit trail.

External ticket integrations are projections/workflow integrations; they do not become canonical finding authority.

## Explanation

Every finding answer includes:

- what changed;
- why it matters;
- affected entities;
- first/last observed and current state;
- evidence and provenance;
- required coverage;
- recommended action;
- confidence and limitations;
- policy or definition version.

## Quality gates

An insight reaches GA only after:

- deterministic fixture tests;
- replay across representative production-like evidence;
- adversarial and edge-case review;
- tenant-safe shadow operation;
- measured precision and analyst workload;
- bounded performance/cost;
- documented suppression and rollback;
- UX comprehension testing;
- customer acceptance criteria.
