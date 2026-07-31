# 22 — Product Surface Recommendations

## Scope

The product disposition ledger covers:

- all 639 native fields;
- all 63 cataloged capabilities;
- all 47 native events;
- all 50 current/derived/not-observable metrics.

[product-disposition.csv](../../../matrices/sensor-intelligence/endpoint-sensor/product-disposition.csv)
contains 799 item rows and assigns one or more of the mission's exact product
dispositions to each.

These are target recommendations. The pinned dashboard currently exposes
tenant-scoped assets, related entities, activity, tool calls, conversations,
alerts, relationships, policy, KPIs, search, and configuration. It does not
implement the complete source/coverage/evidence model described here.

## Product decision rule

A datum belongs on a default customer surface only if it helps answer:

1. What exists?
2. Who or what used it?
3. What happened?
4. Is it governed?
5. Did a control take effect?
6. What risk or gap needs action?
7. How complete and fresh is the evidence?

If it only helps debug serialization, transport, queue internals, or a detector
implementation, it belongs in operator/evidence views, not the default product.

## Overview

### Show

- endpoint sensor fleet/capability coverage by tenant, device, OS, version, and
  last healthy observation;
- counts of newly observed AI applications and agentic artifacts;
- active findings grouped by actionable root cause;
- governed versus ungoverned observed applications;
- blocked/allowed/justified action outcomes with coverage denominator;
- stale/degraded sensors and missing expected capabilities;
- high-level cross-sensor corroboration.

### Do not show by default

- raw prompt/command/header/body/file content;
- PIDs, socket paths, queue row IDs, IPC service IDs;
- current-wire batch/mapping internals;
- raw detector pattern names without an actionable finding;
- hard-coded or unreliable version values;
- raw logs and stack traces.

### Required drill-down

Every count/card must link to the exact entities/events/findings and display:

- source sensors;
- observed/event time range;
- coverage and excluded scope;
- confidence;
- formula;
- source/adapter/schema version;
- evidence access under authorization.

## Inventory

### Recommended entity groups

| Product entity | Endpoint contribution | Default status language |
| --- | --- | --- |
| AI application/product surface | installed process/bundle/path/version, observed process and traffic | `Installed`, `Observed running`, `Recently used`, or `Stale observation` |
| Endpoint device/workstation | device/OS/agent/component context | `Reporting`, `Degraded`, `Offline`, `Unsupported` |
| Agent | local configured artifact | `Configured locally`; only runtime source can mark `Observed running` |
| MCP server/backend candidate | local command/URL/transport/config scope | `Configured`; gateway/runtime required for `Available` or `Called` |
| IDE hook | installed configuration/integrity and hook activity | `Installed`, `Integrity degraded`, `Activity observed` |
| Skill/plugin/permission | detector-parsed local artifact | `Configured`; not automatically `Authorized` |
| Model | local model/config name/path/provider hint | `Configured/installed`; gateway/runtime required for invocation |
| Repository | local path/remote hint | `Local checkout`; connector required for authoritative repository |
| Process | PID/start/path/user observation | activity/evidence object, normally not top-level long-lived inventory |
| Human/account | Persona/email/OS aliases | source identity facet, not canonical without IdP |

### Mandatory status distinctions

The UI must not collapse:

```text
configured
installed
process observed
network activity observed
hook activity observed
recently used
centrally governed
control applied
effect verified
```

An Application remaining in `EntityStore` after process exit is not “currently
running.” A configured MCP server is not “active.” A backend app ID is not a
Quilr 2 canonical identity by default.

### Inventory list columns

Recommended defaults:

- name and canonical product/surface when resolved centrally;
- type;
- endpoint device count;
- last observed;
- observation mode (`process`, `config`, `package`, `hook`, `proxy`);
- governance status;
- risk/finding count;
- source coverage/confidence.

Path, command, arguments, environment-variable names, local user, and source
UUID belong in detail/evidence, not the default list.

## Entity detail

### Application

Facets:

- canonical product and source aliases;
- install/bundle/version/path/process names;
- devices and users where observed;
- configured child artifacts;
- process/network/hook activity;
- governance and policy versions;
- decisions, action attempts, and effects;
- DLP/data-class evidence;
- first/last observed with collection method;
- coverage gaps and stale state;
- raw evidence references.

### Agent/MCP/model/skill/plugin/repository

Facets:

- exact source-native type and detector/parser;
- configuration origin/path/scope;
- native identifier candidates;
- parent application and explicit source relationships;
- runtime corroboration from other sensors;
- capability/permission/risk labels;
- changes over time;
- why the entity was resolved/merged;
- unresolved identity conflicts.

### Device and identity

Show all source identifiers and their namespaces with the canonical resolution
decision. Do not display raw access or refresh tokens. Email/group/OS-user
claims require source and freshness.

## Relationship view

Default graph edges should be canonical, evidence-linked, and confidence
qualified. Endpoint source assertions can contribute:

- device observed application/process;
- application declares/configures MCP server/hook/skill/agent/model/repo/
  permission/plugin;
- user observed on device/session;
- process contacted destination;
- action referenced file/tool/repository;
- policy governed application/action.

**Potential issue:** current UUID and parent-association defects can collide or
mis-associate entities. The graph must retain the source assertion and allow
resolution repair rather than rendering it as unquestioned fact.

## Activity explorer

### Recommended event stages

```text
observed/requested
→ classified
→ policy evaluated
→ decision returned
→ action attempted
→ local transport outcome
→ external/provider outcome
→ observed effect
```

For hooks, show `IDE requested` and `Endpoint returned Allow`; do not show
`Executed successfully`. For enforcement, distinguish signal sent/process
command returned from a later verified process absence. For proxy, show local
blocked response separately from upstream/provider outcome.

Filters:

- time and ingestion time;
- user/device/application/process;
- agent/model/MCP/tool;
- destination/domain;
- event stage/outcome;
- policy/decision;
- data class;
- sensor/component;
- evidence quality and coverage.

Raw content is hidden and separately authorized.

## Findings

The endpoint should supply finding signals, not create one customer finding per
alert/detector event. Default customer findings must have:

- actionable root condition;
- sufficient positive evidence;
- coverage requirement;
- severity and confidence;
- deduplication/group key;
- owner/recommended action;
- resolution and reopen logic;
- linked source evidence;
- explanation of absent/uncertain evidence.

Examples suitable after instrumentation/contract work:

- newly observed ungoverned AI application;
- blocked/quarantined application repeatedly rediscovered;
- endpoint DLP block or monitor with sensitive data classification;
- agentic configuration with risky permission/command;
- MCP server configured outside approved gateway;
- endpoint/gateway policy conflict;
- sensor capability degraded or stale;
- possible gateway bypass.

The exact admission criteria are in chapter 23.

## Analytics

Recommended, once coverage/denominators exist:

- distinct active AI applications by device/user/team;
- new application/artifact observations over time;
- governed versus ungoverned observed activity;
- hook/proxy activity by application and action;
- DLP decisions and observed effects;
- enforcement attempt/effect rate;
- destination/provider activity by source;
- sensor coverage, stale rate, and unsupported-version rate;
- outbox acceptance/retry/rejection/oldest-age;
- cross-sensor corroboration rate.

Do not present:

- “all agent activity” from current hooks;
- model tokens/cost from endpoint;
- MCP success rate without call/result/effect telemetry;
- failure-window rate from current cumulative proxy counters;
- absence-based “unused” counts without healthy expected coverage.

## Coverage and health

This is a first-class customer/admin surface, not only an operator dashboard.

Per sensor/device/component show:

- installed/running/ready state;
- version/build/certification;
- declared capability mode;
- OS/platform support;
- last observation and last successful complete scan;
- process/filesystem/hook/proxy/extension coverage;
- configuration/policy freshness;
- privacy-filter rejects;
- outbox depth/oldest age/quota;
- delivery accepted/duplicate/rejected/retry;
- known degraded modes;
- clock status;
- unsupported schema/version.

Coverage must say `unknown` when the source cannot prove absence.

## Configuration

Customer/admin surfaces may expose:

- enabled endpoint sub-sensors;
- scan roots/cadence and exclusions at a safe abstraction;
- hook installation/integrity;
- proxy interception scope and DLP mode;
- policy/config version and freshness;
- fail-open/fail-closed mode;
- retention/privacy policy;
- outbox quota and offline policy;
- adapter/Starliner enrollment/certification.

Full regexes, paths, commands, headers, content patterns, secret values, and
low-level IPC ACLs belong in authorized operator/evidence views.

## Evidence drill-down

Evidence view should provide:

- immutable evidence ID/hash;
- source/native record type and ID;
- tenant/sensor/component/runtime identity;
- native/adapter/contract versions;
- occurred/observed/captured/ingested/acknowledged times;
- collection method/scope;
- transformations and discarded/redacted fields;
- detector/policy/config version;
- delivery history;
- resolution/correlation links;
- protected-content access/deletion status.

The default product never returns raw prompt/file/header/credential content.

## Operator-only

- service logs and stack traces;
- IPC registration/connection state;
- queue row IDs and storage internals;
- config parser errors;
- packet redirector rule/driver detail;
- extension socket/backpressure detail;
- snapshot migration/version;
- current backend wire responses;
- exact delivery safe errors;
- detector performance diagnostics;
- unsupported/rejected record quarantine.

Operator-only data can support health/findings but should not become a
customer-visible entity or event by itself.

## Customer terminology

Use:

- `Observed`, not `known`, for source facts;
- `Configured`, not `active`, for config artifacts;
- `Endpoint decision`, not `enforced`, without effect;
- `Possible bypass`, not `bypass`, without complete dual-source coverage;
- `Source identity`, not `canonical identity`;
- `Last observed`, not `last used`, unless action evidence supports use;
- `Unsupported/unknown`, not `zero`, for absent coverage;
- `Finding signal`, not `finding`, before central admission.

## Action recommendations

Every customer finding/card should offer a relevant next action:

- review/assign owner;
- approve/block/quarantine application through supported control;
- install/repair hook;
- route through approved gateway;
- remove or restrict risky MCP/permission configuration;
- validate identity/account ownership;
- update unsupported endpoint/adapter;
- restore degraded component/coverage;
- inspect authorized evidence;
- mark false positive with reason;
- resolve/reopen under explicit criteria.

No UI action should be exposed merely because a protocol enum exists. Hook
`Deny`/`Ask`/`Justify`, redacted-forward behavior, and some endpoint control
effects are not implemented to the level required for a production claim.

