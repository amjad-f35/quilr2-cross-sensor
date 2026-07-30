# SLOs, Capacity, and Performance

Status: **normative framework**

## Rule

Production SLO values are contractual and workload-specific. This document freezes indicators, budgeting method, overload behavior, and gates; numeric targets remain `NEEDS_INPUT` until measured and approved.

## Service indicators

### Edge

- admitted-record durability;
- capture availability;
- resource overhead;
- policy-decision latency;
- WAL backlog age and offline endurance;
- update success/rollback;
- command acceptance and outcome latency.

### Ingest and evidence

- authenticated ingest availability;
- durable acceptance latency;
- durable record loss;
- duplicate/conflicting acceptance;
- rejection correctness;
- backlog recovery time.

### Truth building

- normalization, resolution, and materialization lag;
- identity decision correctness;
- projection watermark lag;
- rebuild duration and correctness;
- reconciliation completeness.

### Product

- API availability and latency by workload class;
- overview/inventory/insight render readiness;
- search freshness;
- workflow mutation availability;
- analytics query completion;
- export completion.

### Control

- decision API availability/latency;
- command delivery latency;
- terminal outcome latency;
- verified-effect rate;
- erroneous control action rate.

## Error budgets

Each customer-facing capability has an error budget and owner. Budget policy defines:

- measurement window;
- exclusions;
- burn-rate alerts;
- release freeze threshold;
- mitigation authority;
- customer communication;
- recovery criteria.

Security incidents and durable customer data loss are not normalized as ordinary error-budget consumption.

## Capacity dimensions

Capacity models include:

- enrolled producers and connectors;
- records/bytes per second and burst;
- WAL offline volume;
- evidence retention volume;
- canonical entities/claims/relationships;
- activity cardinality;
- materializer and replay throughput;
- analytical rows and query concurrency;
- search/graph size;
- API users and integrations;
- policy evaluations and commands;
- export and reconciliation jobs.

Every dimension has current usage, forecast, safe limit, hard limit, and expansion lead time.

## Workload classes

1. ingest and acknowledgement;
2. control and policy decisions;
3. canonical mutations;
4. interactive product reads;
5. reconciliation and projection;
6. analytics;
7. replay/backfill/export;
8. operator/support.

Lower-priority batch work cannot exhaust resources required for ingest or control.

## Overload behavior

- apply tenant quotas and fair scheduling;
- return explicit throttling with retry guidance;
- preserve durable evidence;
- pause/backoff projectors and batch jobs;
- degrade optional enrichment before core truth;
- prevent unbounded queues;
- surface coverage/freshness impact;
- shed only according to the documented class ladder;
- avoid retry synchronization.

## Performance testing

GA evidence includes:

- representative steady-state and burst;
- largest supported tenant and noisy neighbor;
- source reconciliation surge;
- backlog catch-up after regional outage;
- replay during live traffic;
- identity merge/split cascade;
- high-cardinality search and analytics;
- bulk workflow/command with blast-radius limits;
- export and retention deletion;
- failover and recovery.

## Capacity gate

Release is blocked until:

- the certified load profile is declared;
- production-like tests meet SLO with required reserve;
- bottlenecks and expansion runbooks are known;
- costs are modeled;
- per-tenant protection is proven;
- observability detects approaching limits;
- failure does not violate durability or isolation.
