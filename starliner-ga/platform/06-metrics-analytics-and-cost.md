# Metrics, Analytics, and Cost

Status: **normative**

## Metric contract

Every metric is a versioned product contract, not an arbitrary query. It declares:

- metric ID, name, purpose, and owner;
- unit and semantic type;
- numerator and denominator;
- eligible population;
- source profiles and fields;
- canonical entity grain;
- event-time window and timezone behavior;
- deduplication and late-arrival policy;
- minimum coverage/freshness;
- dimensions and cardinality limits;
- privacy classification;
- retention;
- correction and backfill behavior;
- status: experimental, preview, GA, deprecated.

## Core enterprise metrics

### Estate

- active AI applications, agents, model deployments, MCP servers, and tools;
- newly discovered and retired entities;
- managed, approved, owned, and reviewed coverage;
- entities by business unit, provider, geography, and risk tier;
- identity conflicts and unresolved high-impact objects.

### Activity

- active users and workloads;
- executions by application, agent, model, tool, and provider;
- success, error, timeout, and policy-decision rates;
- new model/tool adoption;
- unique and repeated agent-tool paths;
- activity concentration and dormant inventory.

### Risk and governance

- open findings by severity and age;
- mean/median time to acknowledge and resolve;
- accepted-risk and exception exposure;
- unmanaged active estate;
- policy coverage and enforcement effectiveness;
- visibility gaps by population and duration.

### Cost

- estimated and provider-billed cost;
- tokens/units by model, application, agent, team, and provider;
- budget attainment and forecast;
- cost of failed or retried executions;
- unit cost and model mix;
- unattributed cost and attribution confidence.

## Coverage-aware denominators

A percentage is never computed from “things we happened to see” unless that is explicitly the metric. Examples:

```text
governed_active_apps =
  active apps with applicable approval state
  / active apps eligible under current source coverage

endpoint_visibility =
  devices reporting required endpoint capability
  / devices expected from authoritative device population
```

The UI exposes denominator, excluded population, coverage, and last complete period.

## Cost model

Cost inputs are versioned:

- provider price sheet and effective time;
- contract-specific discounts where authorized;
- currency and exchange rate source;
- input/output/cached/request pricing dimensions;
- provider bill reconciliation;
- allocation rules;
- estimation confidence.

Estimated cost and invoiced cost are distinct. Historical cost is recomputed only under an explicit restatement version.

## Anomaly detection

An anomaly definition includes:

- baseline population and minimum history;
- seasonality and change-point behavior;
- minimum materiality;
- missing-data handling;
- entity and dimension cardinality;
- explanation features;
- threshold/version;
- evaluation and false-positive metrics.

A raw z-score is not a customer insight without these controls.

## Analytical architecture

- ClickHouse or equivalent is a tenant-cell analytical projection.
- Canonical IDs and policy dimensions arrive through the transaction outbox.
- Raw restricted content is excluded.
- Aggregations are idempotent and event-time aware.
- Corrections and resolution changes produce restatement jobs.
- Query budgets and workload classes protect ingestion and product latency.
- Large exports use asynchronous jobs with access-controlled object storage.

## Product semantics

Every chart shows:

- metric definition and unit;
- time range and timezone;
- applied filters;
- data freshness;
- coverage or incompleteness;
- comparison period;
- whether values are estimates;
- drilldown to underlying canonical entities and safe activity.

## Validation

Metric releases require fixture math, boundary-time tests, late-data tests, identity merge/split tests, retention tests, query-cost budgets, cross-checks against source totals, and product analytics acceptance.
