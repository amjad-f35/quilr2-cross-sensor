# Findings and Insights

The specialized finding ledger is
[`findings.csv`](../../../matrices/sensor-intelligence/quilr1-platform/findings.csv).
It evaluates 16 Quilr 1 migration, identity, activity, control, coverage and
assurance conditions.

## Current versus target

Current Quilr 1 reads alert/action/status/outcome rows, enriches labels, and
renders findings/status workflows. Target behavior:

```text
legacy row
→ immutable source observation
→ FindingSignal
→ entity/event/coverage correlation
→ versioned condition evaluation
→ admitted root-cause finding or non-finding disposition
```

No legacy row becomes a finding just because a processor/UI calls it one.

## Admission

A customer finding requires:

1. material condition;
2. source/version/integrity-bound evidence;
3. affected canonical entity;
4. owner;
5. action;
6. root-cause dedup key;
7. close and reopen logic;
8. confidence/severity logic;
9. accurate current support;
10. justified product placement.

Otherwise classify it as signal, event, metric, badge, recommendation,
evidence, coverage gap or operator telemetry.

## Existing alert migration

Import:

- raw alert/detection/status/action/outcome records;
- native IDs and mapping codes;
- exact timestamps and affected aliases;
- available evidence references;
- legacy workflow/audit history.

Do not import as canonical finding unless root entity, evidence, owner/state,
dedup, close/reopen and condition are mapped. Unmappable records remain in a
read-only legacy view.

## High-value cross-sensor findings

Candidates supported partly by Quilr 1 workflows/data:

- unresolved/conflicting/duplicate application identity;
- unmanaged/unowned application;
- unapproved app with material adoption;
- sensitive activity to an unapproved app;
- password weak/reuse/shared/compromised signals;
- unattributed activity;
- stale/partial source coverage;
- schema/mapping/evidence gaps;
- control effect unknown;
- legacy status inconsistency;
- unexplained parity delta;
- unverifiable MCP coverage claim.

Each row in the ledger declares exact proposed logic and `not_evaluable`
coverage behavior.

## Deduplication

Source exact duplicates collapse under source-native idempotency. Finding
dedup groups:

```text
tenant
+ finding definition/version
+ root-cause canonical entity
+ affected scope/action/data class/policy
+ generation/window
```

Several Quilr rows derived from the same upstream event contribute one lineage,
not independent confidence.

## Severity and confidence

Legacy criticality/risk is a source hint. Target severity is a versioned
function of impact, exposure, confidence, controls/coverage and business
context. Missing required coverage reduces evaluability/confidence; it does
not silently close the condition.

## Workflow migration

Current status master/drilldown can partially diverge. Target workflow appends
assignment, acknowledgement, suppression, resolution and reopening records.
Resolution preserves actor, action, evidence and exact condition version.
Source loss moves verification to impaired/unknown and may open coverage
finding; it does not resolve business risk.

## Product placement

- Findings: actionable admitted conditions.
- Inventory badge: new/stale/unmanaged/low confidence when no workflow needed.
- Overview metric: aggregate trend/posture.
- Activity: isolated event or detection.
- Recommendation: optimization below finding threshold.
- Evidence: raw/protected support.
- Operator: adapter/schema/parity/DLQ details unless customer coverage is
  materially affected.

## Availability

Legacy signals are available for backfill after physical schema validation.
Canonical identity/activity/coverage findings require adapter/resolver/
materializer implementation. Effect findings require command/effect telemetry.
Native MCP call/effect findings are blocked.
