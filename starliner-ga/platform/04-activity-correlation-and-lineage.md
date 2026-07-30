# Activity, Correlation, and Lineage

Status: **normative**

## Objective

Produce a privacy-safe, explainable activity model that can answer who or what used which model, tool, agent, or application; through what path; when; with what outcome and cost; and with what coverage limitations.

## Activity layers

| Layer | Purpose |
|---|---|
| Source event | Lossless safe fact from one sensor |
| Activity candidate | Normalized semantic action from that source |
| Correlated execution | One logical execution assembled from candidates |
| Activity summary | Product-facing, privacy-safe projection |
| Analytical aggregate | Time-windowed metric with denominator and coverage |

## Execution graph

A correlated execution may contain:

```text
principal
  -> application or agent deployment
  -> gateway/provider account
  -> model deployment
  -> MCP server
  -> tool
  -> downstream resource
  -> outcome
```

Not every source sees every hop. Missing hops remain unknown rather than fabricated.

## Correlation keys

In descending strength:

1. propagated W3C trace context across a real causal transaction;
2. source-issued request, session, execution, or tool-call ID;
3. gateway-generated correlation ID preserved downstream;
4. deterministic within-source parent/child relationship;
5. bounded probabilistic correlation using time, identity, and topology.

Independent scans use observation or reconciliation IDs, not fake traces.

## Correlation decision

Each correlation records:

- member candidate IDs;
- rule/model version;
- correlation strength;
- supporting and conflicting signals;
- resulting execution ID;
- decision time;
- whether customer-facing conclusions may rely on it.

Low-confidence correlations do not create high-severity findings.

## Principal semantics

The model distinguishes:

- authenticated human principal;
- service principal;
- device-local user;
- browser profile;
- agent/workload identity;
- delegated user;
- unknown or pseudonymous principal.

Delegation chains and impersonation are preserved where the source can prove them.

## Content boundary

Normal activity does not require prompts or responses. Default activity uses:

- operation type;
- provider/model/tool identifiers;
- token/count/latency/status metadata;
- policy result;
- privacy-safe data-class indicators;
- error class;
- cost inputs;
- source/evidence references.

Restricted content is separately authorized and is never copied into general analytical projections.

## Late and duplicate events

Activity materialization is event-time aware and accepts late arrivals within configured correction windows. Later evidence may enrich an execution or correct its status. Material changes are versioned. Duplicates are suppressed by source and correlation identity.

## Outcome and effect

Execution outcome distinguishes success, failure, cancellation, timeout, unknown, and partial. A control effect is represented separately and may be linked to subsequent executions that confirm or refute it.

## Retention

Raw activity, detailed correlated executions, and aggregates have separate retention classes. Aggregates must not retain identifiers longer than required. Deletion and legal-hold workflows preserve referential and audit correctness.

## Product guardrails

- UI labels correlation confidence when it affects interpretation.
- Counts never imply complete coverage without an eligible denominator.
- The platform avoids “user did X” when only a device or browser profile is known.
- Activity examples link to safe evidence, not unrestricted raw content.
- Cost is shown only with declared price/version/currency assumptions.
