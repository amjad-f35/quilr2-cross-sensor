# Actionable metrics and insights

The 33-metric catalog is [metrics.csv](matrices/metrics.csv).

## Metric contract

Every metric version defines:

```text
metric name/version
business decision/action
canonical grain
numerator and denominator
event/entity/relationship versions
event-time and restatement semantics
filters and cohort rules
source coverage denominator
freshness/watermark
blind spots
drill-down query
owner/materializer
```

## Canonical counting rules

- Inventory counts distinct canonical IDs at a specified lifecycle layer.
- Activity counts canonical events after exact dedup and correlation; it can also expose raw-observation counts separately.
- User counts use Human User IDs, not emails/source rows.
- Product counts do not add surfaces, accounts, models, or observations.
- Spend is attributed once from a source cost record; a provider record and derived gateway estimate are alternatives, not additive duplicates.
- Department/owner uses event-time relationship state, not today’s org chart.
- Metrics include coverage and unknown proportions; “zero” is never returned for an unobserved domain without qualification.

## Inventory and adoption

| Metric | Decision | Current support |
| --- | --- | --- |
| Canonical products / tenant application instances | Estate scope | Derivable from current rows after resolver |
| Unmanaged/unowned/stale assets | Review/assign/retire/repair | Derivable partly/current |
| Duplicate candidates | Operate resolution | MVS |
| Assets by healthy source coverage | Close blind spots | MVS |
| Active/repeat users | Adoption | Derivable now |
| Active agents/successful tasks | Agent adoption/value | Requires stable agent/outcome telemetry |
| Browser vs API usage | Channel strategy/coverage | Derivable now after canonical event normalization |
| Managed vs unmanaged usage | Prioritize governance | MVS |

## Governance and operations

| Metric | Decision | Current support |
| --- | --- | --- |
| Policy coverage | Fix ungoverned estate | Requires unified policy model |
| Enforcement coverage | Deploy/repair controls | MVS coverage registry |
| Identity-bound/unattributed actions | Improve attribution | Requires action telemetry |
| Sensitive-data actions | Privacy governance | Derivable partly |
| Model-call success | Provider/model reliability | Available in gateway |
| Tool-call and agent-run success | Tool/agent reliability | Requires MCP/run telemetry |
| Sensor freshness | Repair sensor | Available now |
| Materializer lag/DLQ/reconciliation | Operate platform | Requires target telemetry |
| Unresolved identity matches | Operate resolver | MVS |

## Cost and value

| Metric | Decision | Current support |
| --- | --- | --- |
| Spend by canonical product/model | Portfolio/routing | Derivable partly from gateway cost/usage |
| Spend by agent/department | Ownership/optimization | Requires agent/org identity |
| Cost per successful task | Optimize value | Requires outcome telemetry |
| Failed-work cost | Fix retries/failures | Requires run outcome |
| Duplicate-product spend | Consolidate licenses | Billing/catalog integration |
| Unallocated spend | Assign owner/cost center | Derivable partly after ownership |
| Verified savings | Validate policy/routing action | Future outcome/baseline capability |

## Existing summary tables

`aiuser_user_insights_summary`, `aiuser_smartgroup_insights_summary`, and `aiuser_department_insights_summary` are candidate backfill/validation inputs only. Canonical aggregates must be recomputed from canonical IDs and event-time memberships to prevent duplicate source rows and current-org misattribution.

## Product display

Default overviews show few metrics with:

- value/trend;
- coverage/freshness;
- material change driver;
- drill-down to canonical entities/events/findings;
- available action.

Raw source counts, queue counters, and vanity totals remain in operator telemetry.
