# Product surface recommendations

All recommendations are `Proposed`; they do not assert current product UI.

## Action and decision-support tests

A datum belongs in a customer surface only when it helps answer a concrete
question, drives a supported action, or explains evidence/coverage. Raw
implementation counters and secret-bearing native fields remain operator-only
or discarded.

## Product-disposition matrix

| Datum/capability | Customer question | Availability | Product disposition | Caveat |
| --- | --- | --- | --- | --- |
| MCP server/backend source candidate | What MCP servers are registered/seen? | `Available now without sensor changes` | `Inventory list`, `Entity detail` | current create/sighting only; no deletion completeness |
| MCP tool source candidate | Which tools does a server provide/use? | same | `Inventory list`, `Entity detail`, `Relationship view` | relationship derived; schema omitted |
| source first/last seen | When was it observed? | `Derivable centrally from current output` | `Entity detail`, inventory badge | no explicit lifecycle/expected cadence |
| Direct tool-call activity | Who called which tool and what happened? | `Available now without sensor changes` | `Activity explorer`, `Entity detail`, `Evidence drill-down` | actor partial; Direct only |
| DLP labels/block | Was risky data detected or blocked? | same | `Activity explorer`, `Finding signal`, `Analytics` | no raw entity value; block signal not itself a finding |
| tool call volume/status | How much routed Direct MCP activity occurred? | same | `Overview`, `Analytics`, entity detail | coverage/loss denominator required |
| tool latency | Which tools/backends are slow? | same | `Analytics`, entity detail | full gateway latency, not upstream-only |
| outbox/ingest health | Is this source delivering evidence? | `Available through adapter mapping only` | `Coverage and health`, `Operator-only` | aggregate local instance, not tenant-scoped |
| runtime/certification manifest | What is supported and deployed? | `Available now without sensor changes` | `Coverage and health`, `Evidence drill-down` | configured capability is not live proof |
| structured rejections | Why was access/auth/tool use denied? | `Available through adapter mapping only` | `Activity explorer`, `Analytics`, `Evidence drill-down` | privacy allowlist |
| OAuth/admin/config events | What changed or failed? | same | `Activity explorer`, `Configuration`, audit | identity and free-form data safety |
| backend/tool settings | What controls apply? | same | `Configuration`, entity detail | current state versus event-time state |
| OneMCP activity/session | What aggregate/native activity occurred? | `Requires minor sensor instrumentation` | activity/coverage | current observe coverage insufficient |
| workflow lineage | Which agent/run/step invoked the tool? | `Requires minor sensor instrumentation` plus adapter mapping | relationship/activity | cross-process correlation |
| human/account canonical identity | Who is the authoritative person/account? | `Requires an external authoritative source` | inventory/relationships | actor HMAC is not account authority |
| model/provider/cost | Which model and cost were involved? | `Not observable by this sensor` | cross-sensor analytics | use LLM gateway/billing |
| device/process/client deployment | Where did traffic originate? | `Requires an external authoritative source` | inventory/relationships/coverage | use endpoint/browser/workload sources |
| arguments/results/headers/tokens | What exact content moved? | intentionally not ordinary output | `Raw-only retention` or `Discard with reason` | explicit protected evidence authorization only |

## Architecture index for product navigation

```text
MCP Overview
├── Estate: servers and tools
├── Activity: calls, outcomes, DLP, latency
├── Controls: effective settings and decisions
├── Findings: admitted root-cause conditions only
├── Coverage: source/runtime/capability/delivery health
└── Evidence: safe source records and receipts
```

## Overview

Recommended cards:

- observed MCP server/tool candidates;
- Direct tool calls by success/error/blocked;
- blocked-call rate with DLP direction;
- median/p95 gateway-observed latency, sample count;
- active sensor instances by capability/certification;
- delivery backlog/age/failure;
- coverage gaps: OneMCP/resources/prompts/sessions/deletes not observed.

Every card shows time window, sensor/profile version, Direct-only scope, health,
and missing/dropped evidence.

## Inventory list

MCP server columns:

- resolved display name and canonical ID from central resolver;
- source backend ID and source sensor;
- transport type;
- first/last observed;
- tool count only when snapshot completeness is known;
- source/identity confidence;
- management/approval/owner from external/config sources;
- health/authentication/reachability only when separately observed;
- coverage and stale badges.

MCP tool columns:

- resolved tool name and server;
- first/last observed/called;
- safe risk labels;
- call/block/error counts;
- schema/description only from a privacy-approved capability mapper;
- source and coverage.

Do not expose current locally minted canonical IDs as authoritative.

## Entity detail

```text
Identity and provenance
Source observations and aliases
Server→tool relationship with authority/lifecycle
Recent activity/outcomes
Effective controls
Metrics/trends
Findings
Coverage/health
Evidence and version history
```

Raw arguments/results are not default entity-detail fields.

## Activity explorer

Primary grain is one canonical action, not one delivery record. Source
observation, action, metrics, and signal generated for the same call must not
appear as four unrelated activities.

Filters:

- time, tenant, source/runtime;
- Direct versus OneMCP/workflow surface;
- backend/tool;
- actor/account/agent after resolution;
- success/error/blocked and upstream called;
- input/output labels and control;
- latency;
- evidence/coverage quality.

## Analytics

Recommended:

- calls/status/latency by resolved backend/tool/actor/source;
- DLP labels and block direction;
- adoption and active/repeat actors after identity resolution;
- source coverage and observation loss;
- control effectiveness: pre-upstream blocked versus post-upstream output block;
- error/rejection/auth/OAuth rates from safe log adapter;
- token-saving/workflow metrics only after separate mapping.

Avoid monetary “savings” without verified cost/rate/outcome data.

## Configuration

Expose effective scoped tool/DLP/confirmation/token-saving settings and source
of precedence. Secret values never appear. Current state must be labeled
current, not claimed as event-time policy unless a version/reference was
captured on the action.

## Customer terminology

Use:

- “MCP server” or “registered MCP connection,” not internal `backend`;
- “MCP tool,” not unqualified resource ID;
- “routed through this gateway,” not “all MCP activity”;
- “blocked before tool execution” versus “result blocked after execution”;
- “observed actor” versus “verified account”;
- “source candidate”/“unresolved identity” where resolution is incomplete;
- “sensor delivery degraded” versus “asset absent.”

## Views intentionally deferred

- model/cost view from MCP alone;
- device/process topology from MCP alone;
- universal client/agent attribution;
- full content explorer;
- action-effect claims for side-effecting tools;
- relationship completeness without registry snapshots/deletes;
- multi-replica health before topology certification.

