# Product Surface Recommendations

The disposition ledger is
[`product-disposition.csv`](../../../matrices/sensor-intelligence/quilr1-platform/product-disposition.csv).
All 30 specialized Quilr 1 capability rows have a target location, default or
drill-down rule, calculation/source treatment, filters, click-through and
action/hide decision.

## Recommended top-level product

```text
Overview
AI Estate
  Applications
  Agents
  Models and Providers
  MCP Servers and Tools
  Connectors
People and Accounts
Activity
Findings
Policies and Controls
Coverage
Resolution Center
Administration / Operations
```

Quilr 1’s broad workflows are reusable. Its request-time source joins and
source-row metrics are not.

## Surface migration

### Retain and rebuild

- application, user/account, asset and device inventory;
- activity/conversation exploration;
- findings list/detail/status workflows;
- settings, approvals, whitelist/exceptions, groups and controls;
- gateway/model/MCP/connector management;
- audit/evidence views;
- executive/adoption/usage analytics;
- coverage and diagnostics;
- self-service role-based view.

Each rebuild consumes canonical APIs/materializations rather than joining
source APIs in React.

### Compatibility only

- source-specific legacy route shapes;
- legacy KPI formulas during parity;
- Decision Engine/Lens/secondary routable pages until ownership/contracts are
  approved;
- read-only legacy findings/status history;
- source tabs as filters, not separate duplicate inventories.

### Operator-only

- DWH/config/database/host diagnostics;
- raw Redis/scheduler/marker state;
- audit master-code administration;
- schema drift/quarantine/DLQ/materializer details;
- bounded read-only legacy evidence query;
- ClickHouse mutation console (recommended removal from product).

## Shared entity detail

Show applicable facets:

```text
Overview
Sources and Observations
Aliases and Identity
Relationships
Users and Accounts
Activity
Policies and Controls
Findings
Metrics / Cost / Outcomes
Coverage and Health
Versions and Changes
Evidence
```

Native Quilr IDs/rows appear in Sources/Evidence, not as duplicate top-level
entities.

## Default versus drill-down

Default:

- canonical IDs/names and typed state;
- owner, lifecycle, governance and confidence;
- current source coverage/freshness;
- canonical distinct counts;
- material findings and latest activity;
- relevant actions.

Drill-down:

- native aliases and exact source records;
- legacy formulas and parity deltas;
- mapping/conflict history;
- protected evidence subject to privilege;
- operational source/adapter health.

Hidden by default:

- tokens/cookies/credentials;
- prompt/file/tool content;
- raw SQL/stack traces/host configuration;
- cache/queue keys;
- unbounded native metadata;
- experimental/placeholder routes.

## Metric/card behavior

Every card shows:

- definition/version;
- canonical grain;
- time semantics;
- coverage state;
- unknown/rejected/unresolved count;
- comparison period logic;
- click-through to contributing canonical records and source observations.

Legacy source-row count can appear during migration as a labeled parity value,
not the customer truth.

## Finding behavior

Quilr alert/status rows appear as evidence/signals. The Findings default list
contains only admitted root-cause conditions with owner, action, evidence,
coverage, dedup and close/reopen logic. Unmappable rows remain in read-only
legacy history.

## Actions

Actions use typed command workflows:

```text
review/simulate
→ authorize/approve
→ deliver/accept
→ execute
→ observe/verify effect
```

The UI separately displays request, native result and verified effect.

## Empty/unknown semantics

Every product field differentiates known, known absent from authoritative
healthy scope, not observed, out of scope, stale/degraded, conflicting,
privacy-not-collected and unresolved. Current empty arrays/zeros cannot be
shown as known absence without coverage proof.

## Quilr 1-specific route decisions

- Do not carry the stale frontend conversation-filter route or absent
  `/findings/kpi` into canonical API design.
- Preserve `/qb/query` behavior only as compatibility; target analytics use
  registered typed metric queries.
- Convert `/aiapps`, `/ai-assets`, `/aiusers`, `/aiaccounts`, `/interactions`,
  `/findings`, `/status-events`, `/guardrails`, and `/mcp/gateway` reads in
  cohorts.
- Move supported writes behind command/outbox dual-write.
- Restrict or remove ad-hoc ClickHouse mutation.

## Product availability caveats

MCP call/effect, stable agents/runs, authoritative person/account, workload
attestation, provider-side activity, and complete cost/outcome surfaces remain
limited until their native sources provide required identity/telemetry.
