# Findings catalog

The full catalog is [findings.csv](matrices/findings.csv) and [finding-types.yaml](schemas/finding-types.yaml). It evaluates 119 finding types across discovery, identity, models, MCP/actions, data/privacy, policy/coverage, threat, reliability, cost/value, and assurance.

## Admission test

A product finding must have:

1. a material condition—not merely a nonzero metric;
2. evidence with source/version/integrity;
3. affected canonical entities;
4. an identifiable or assignable owner;
5. a concrete response;
6. a root-cause dedup key;
7. a deterministic close condition and reopen rule;
8. confidence and severity logic;
9. current support marked accurately;
10. a product location justified by actionability.

If any of 2–8 is absent, classify the item as an inventory badge, overview metric, recommendation, event explorer record, evidence-only record, or operator telemetry.

## Canonical finding contract

```text
finding_id / finding_type / schema_version / tenant_id
title / business_question / category
root_cause_entity_id
affected_entity_ids
condition state and derivation version
required/observed sensors and coverage
supporting event/relationship/evidence IDs
confidence score + contributors/contradictions
severity + impact/exposure/exploitability/coverage inputs
dedup key + generation
owner/assignee
status: open | acknowledged | investigating | suppressed | resolved
first_seen / last_seen / opened_at / resolved_at
recommended and executed actions
resolution rule/result/evidence
reopen rule/count
legacy source aliases
```

## Correlation

Finding materialization groups signals by root cause and affected scope:

```text
tenant
+ finding type
+ root cause canonical entity
+ policy/data class/action family/affected scope
+ generation/window
```

Independent sensor evidence raises confidence only if it is truly independent. Two transformations of the same BES record do not count as two observers. A stale/unhealthy source can lower completeness, not necessarily falsify the condition. A direct contradiction is retained and can lower confidence or open an assurance finding.

## Severity

Severity is a versioned function, not a source label:

```text
impact:
  data class, target criticality, action effect, affected users/assets, spend
likelihood/exposure:
  recurrence, reachability, credential/privilege, active relationship
confidence:
  identifier/correlation strength, source independence/integrity, contradictions
control/coverage:
  allowed/blocked/completed, enforceability, sensor health
business context:
  owner, production environment, regulated region, exception
```

An incompletely evidenced high-impact condition may be high potential impact but lower finding severity/confidence, with an explicit evidence-gap action.

## Resolution and reopening

- A symptom disappearing does not close a root-cause finding if another supporting condition remains.
- Close only after the exact condition is false for its confirmation window or an authorized, non-expired risk acceptance applies.
- Preserve resolution actor/action/evidence and the state versions checked.
- Reopen when the same dedup key recurs after close; create a new generation if ownership/policy/root cause materially changed.
- Sensor loss can move a finding to “verification impaired,” lower confidence, and open a coverage finding; it must not silently resolve the business condition.

## Launch set

The structurally useful MVS/launch set in the catalog includes:

- unmanaged/new/unknown/duplicate/conflicting application identity;
- unowned application and low-confidence merge;
- stale/reactivated asset and retired-but-active asset;
- unapproved application widely adopted;
- unapproved model and unattributed invocation;
- unmanaged MCP server from endpoint discovery, with source limitations visible;
- sensitive data to unapproved application;
- secret/credential in prompt;
- file upload without required approval where evidence is sufficient;
- policy conflict/no enforcement point/coverage claim gap;
- stale sensor and partial source sync;
- unexplained policy decision;
- inventory/relationship/finding materializer lag/duplicates/evidence gaps;
- orphaned LLM gateway API key;
- assurance gaps: unknown sensor version, event-time relationship unavailable, mutable-current-state audit.

Launch favors correctness, ownership, coverage, identity, and evidence over many speculative behavior findings.

## Next/later gates

| Required capability | Unlocks |
| --- | --- |
| Browser/provider account identity | Personal-account and account-conflation findings |
| Stable agent/version/deployment/run/step IDs | Agent ownership, delegation, model-change, behavior, reliability, and cost findings |
| MCP server/tool/call/result/effect contract | Tool manifest, destructive tool, tool bypass, sensitive result, action-effect findings |
| Authorization/delegation graph | Excessive access, acting outside delegation, role-change findings |
| Data asset/catalog identity | Asset-owner, region, repository, retention, memory findings |
| Billing/rate-card integration | Paid-unused, anomaly, commitments, duplicate spend |
| Outcome verification | Cost per successful task, low-value/high-cost agent, verified savings |
| Certification/artifact attestation | Certified action/artifact findings |

## Existing Quilr 1 findings

**Verified:** current findings draw from ClickHouse alert/action/status/outcome tables plus static/graph enrichment; status resolution writes master/drilldown separately and can partially succeed. [Q1-FEATURE](../../quilr-platform-analysis/05-feature-catalog.md), [Q1-STORE](../../quilr-platform-analysis/09-data-models-and-storage.md).

Migration rules:

- import raw alerts/detections as finding signals;
- migrate an existing open finding only if root entity, evidence, owner/state, dedup, and close rule can be mapped;
- retain unmappable legacy rows in a read-only legacy view;
- do not turn every status/alert row into a canonical finding;
- recompute source-specific duplicates into one root-cause finding;
- preserve legacy ID aliases and resolution/audit history.

## Product placement

- Findings: actionable correlated conditions.
- Inventory badge: new, stale, unmanaged, low confidence, unowned when no workflow is needed.
- Overview metric: aggregate posture/trend.
- Recommendation: optimization opportunity below finding threshold.
- Event explorer: isolated action/detection.
- Evidence: raw content and support.
- Operator only: materializer/DLQ/debug details unless they affect customer coverage.
