# Unified inventory

## Inventory rule

One row represents one canonical entity at the selected lifecycle layer. Source observations appear as coverage badges and drill-down evidence—not duplicate rows.

### AI application row

```text
Name / vendor / object type
management, governance, lifecycle, health, ownership, confidence
users and accounts by type
surfaces and installations
first seen / last seen
healthy observed sources and stale/missing expected sources
related agents, models, MCP servers/tools, connectors, data
policies, findings, spend/outcomes
```

Counts use distinct canonical IDs. Account, model, agent, tool, and source-observation counts never inflate application-row count.

## Recommended top-level estate views

| View | Top-level? | Reason |
| --- | --- | --- |
| AI Applications | Yes | Primary management/approval/ownership unit |
| Agents | Yes | Distinct risk, dependency, run, owner, and outcome lifecycle |
| Models | Yes | Provider/deployment/route governance and impact |
| MCP Servers & Tools | One combined area with separate facets | Server/tool topology is tightly coupled; tools need independent actionability |
| Connectors | Yes | Tenant integration/account/credential lifecycle |
| Accounts & Credentials | Contextual plus dedicated privileged view | High actionability but sensitive |
| Data Assets | Yes only when data identity/catalog is available | Avoid showing classifications as fake assets |
| Knowledge & Memory | Combined view/facets | Agent dependencies, retention, sensitive memory |
| Gateways, Sensors & Enforcement | One Coverage area | Operational/enforceability context |

Devices remain a contextual/support view unless endpoint operations require a separate page.

## Shared entity-detail pattern

Show only applicable facets:

- Overview
- Sources & Observations
- Aliases & Identity
- Users & Accounts
- Relationships & Dependencies
- Data Access
- Capabilities & Actions
- Policies & Controls
- Activity
- Findings
- Cost & Outcomes
- Versions & Changes
- Evidence

Examples:

- AI Product/tenant application: Overview, Sources, Users/Accounts, Surfaces, Dependencies, Policies, Activity, Findings, Cost.
- Model Deployment: Overview, Identity, Routes, Agents/Applications, Activity, Findings, Cost, Versions.
- Tool: Overview, Server/Clients/Agents, Capabilities/Actions, Policies, Activity, Findings, Versions.
- Sensor: Overview, Coverage/Capabilities, Versions, Activity, Findings.

## State and actions

| Dimension | Values | Primary actions |
| --- | --- | --- |
| Lifecycle | discovered, active, inactive, stale, retiring, retired, merged, superseded | retire, reactivate, split/view redirect |
| Governance | unknown, unmanaged, under review, approved, restricted, blocked | review, approve, restrict, block |
| Health | unknown, healthy, degraded, failed, stale | repair, disable, investigate |
| Ownership | owned, unowned, disputed | assign/change owner |
| Confidence | high, medium, low + score/evidence | merge/split/resolve alias |
| Coverage | observed, not observed, sensor unhealthy, out of scope, unknown | deploy/repair sensor |

“New” is a time-bound badge; “unowned,” “sensor-only,” and “low confidence” may be badges/findings. Do not overload `status`.

## Sources & Observations

For each source:

```text
source type/installation/version/health
native ID and object type
first/last observed
collection method/scope
identifiers and aliases contributed
fields contributed and whether selected
confidence/known defects
raw/evidence access
resolver decisions that used it
```

## Query API

```text
GET /v2/estate/{entityType}
GET /v2/entities/{canonicalId}
GET /v2/entities/{canonicalId}/observations
GET /v2/entities/{canonicalId}/relationships
GET /v2/entities/{canonicalId}/activity
GET /v2/entities/{canonicalId}/findings
POST /v2/resolution/candidates/query
POST /v2/resolution/merge
POST /v2/resolution/split
```

List APIs support canonical filters, typed state dimensions, owner, source coverage/health, time, confidence, relationship facets, finding severity, spend, stable cursor, and snapshot version. They never require React to join sensor APIs.

## Minimal default columns

- AI Applications: name/vendor, management, owner, users, account-type signal, surfaces, last seen, source coverage, findings, spend.
- Agents: name/owner, deployment/version, active runs/users, model/tool dependencies, privilege, last activity, findings, cost/success.
- Models: provider/exact ID, deployments/routes, agents/apps, lifecycle, usage, findings, spend.
- MCP/Tools: server/tool, transport/host, clients/agents, capabilities, approval, last activity, findings.
- Connectors: product/instance/account, owner, scopes/credential age, health, dependencies, findings.
- Coverage: sensor/enforcement point, version/certification, capabilities, scope, last report, lag, blind spots.

Do not show prompt text, file paths/content, raw tool arguments/results, credentials, queue/debug state, or every native identifier by default.

## Empty/unknown semantics

Every field/API distinguishes:

- `known value`;
- `known absent` from an authoritative healthy source;
- `not observed`;
- `out of source scope`;
- `source stale/degraded`;
- `conflicting`;
- `not collected for privacy`;
- `unresolved`.

This prevents “no model/account/data” from being inferred when the current sensor cannot observe it.
