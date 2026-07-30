# Analytics, Coverage, and Operator Surfaces

Status: **normative product contract**

## Analytics

Analytics answers a small set of governed questions:

- How is the estate growing and changing?
- Which teams, applications, agents, models, and tools drive adoption?
- Where are governance and risk improving or worsening?
- What does AI usage cost and where is it attributable?
- Which policies and remediations are effective?

Charts are built from metric contracts, not ad hoc frontend aggregation.

## Standard analytical views

### Estate

Active and new entities, lifecycle, managed/approved/owned posture, providers, environments, and business distribution.

### Adoption and activity

Active users/workloads, executions, model/tool mix, application and agent trends, outcomes, and new adoption.

### Governance and risk

Findings, aging, resolution, exception exposure, unmanaged active estate, policy decisions, and residual risk.

### Cost and efficiency

Estimated/billed spend, tokens/units, model mix, forecasts, budgets, failure/retry cost, and attribution gaps.

### Control effectiveness

Decisions, blocks/warnings, overrides, command results, independently observed effects, and repeated bypass.

## Drilldown

Every aggregate drills to the exact eligible entity/activity set under the same filters, permissions, metric version, and projection watermark. A download is not the only way to understand a chart.

## Coverage surface

Coverage is an operator-grade but customer-accessible surface. It shows:

- expected population;
- reporting population;
- supported capability;
- current/last complete interval;
- sensor and connector freshness;
- known collection gaps;
- degraded insights/metrics;
- planned remediation.

Coverage is shown by environment, business unit, geography, and source profile where authorized.

## Resolution surface

Identity operators see:

- high-impact unresolved candidates;
- conflicting authoritative claims;
- proposed merges/splits;
- downstream impact;
- bulk review with preview;
- rule performance;
- decision history and rollback.

Normal business users see only actionable identity caveats on entity pages.

## Evidence surface

Evidence access is permissioned and purpose-bound. It supports:

- safe source-record metadata;
- chain of custody and acceptance receipt;
- normalizer/resolver/materializer versions;
- field provenance;
- time-bounded restricted-content grant where separately authorized;
- export with watermark and audit.

It is not a database console.

## Integration and producer operations

Administrators see:

- enrollment and version;
- capabilities and certification;
- data health dimensions;
- backlog and freshness;
- permissions and connector scope;
- last successful reconciliation;
- regional routing;
- upgrade state;
- actionable errors and runbook links.

## Audit

Audit covers user, service, policy, identity, evidence-access, workflow, export, and command actions. Filters are structured; entries identify actor, action, target, result, time, source, and request/correlation ID.

## Export and reporting

Exports are asynchronous, watermarked, access-controlled, encrypted, expiring, and versioned. Scheduled reports use the same metric contracts as the UI and disclose coverage/freshness.
