# Customer Information Architecture

**Status:** normative UI/read-model contract for the Discovery, Inventory, Activity and Evidence pass

## Product principle

The UI is an asset and evidence product, not a telemetry viewer.

Customers should answer five questions without understanding sensors or schemas:

1. What AI applications, agents, models and MCP capabilities exist?
2. Where are they deployed or observed?
3. Who or what was associated with them, and with what identity assurance?
4. What configured or observed relationships exist?
5. How fresh, complete and provable is each answer?

Raw sensor fields are available only through curated evidence/provenance views and authorized exports. They are not default table columns.

## Navigation

```text
Overview
Inventory
  Applications
  Local agents
  Models
  MCP servers & tools
  Devices
  Identities
Activity
Evidence
Coverage
```

Devices and identities are context collections in this pass. They do not claim full MDM or directory inventory until those connectors exist.

## Overview

The overview is deliberately small.

### Estate

- application products, web surfaces and endpoint deployments;
- local agent deployments, with definition count disclosed separately;
- model products and gateway-observed deployments/routes;
- MCP server products/deployments and tool count;
- covered Endpoint devices and source-scoped identities.

Each count links to its filtered collection and carries `complete`, `partial`, `stale`, `unknown`, or `unsupported`.

### Changes

- newly observed products/deployments;
- materially changed versions/configuration;
- newly observed local agent definitions/deployments;
- added/removed MCP server configurations or capabilities;
- unresolved identity candidates and source conflicts.

“New” is computed from canonical eligible observation history, not copied from a source boolean.

### Activity

- application-use, upload and native-outcome volume;
- local agent prompt-turn/tool-name observations;
- LLM request outcomes and token/latency summaries;
- MCP tool calls/operations and outcomes;
- activity by source family and coverage.

No raw prompt, raw response, file path, tool argument or result is shown.

### Coverage

- sensor installations and health by component;
- last successful evidence and snapshot watermark;
- active gap count and oldest gap;
- supported versus unsupported capability surfaces;
- unresolved cross-sensor device/identity count.

Intelligence, findings, policy posture, risk scores, recommendations, cost and blast-radius claims are not part of this bounded pass.

## Local agents

This screen follows the useful information hierarchy in the Microsoft reference while retaining Quilr’s evidence and coverage semantics.

### List

Default columns:

| Column | Meaning | Source requirement |
|---|---|---|
| Agent | Resolved agent definition display name | Endpoint `AgentData`; source-scoped if unresolved |
| Version | Deployment/version claim when captured | Endpoint application/plugin/version field; otherwise `Unknown` |
| Kind | CLI, desktop, IDE, extension, service, or unknown | `AgentData.agent_type` and application installation context |
| Device | Canonical device when exactly bound; otherwise source-scoped Endpoint device | Endpoint `DeviceContext` |
| OS | Platform and version | Endpoint `DeviceContext` |
| Observed user | User/persona context attached to the discovery | Endpoint `UserContext` |
| Execution identity | Exact runtime owner when proved | `ProcessInfo.user` mapped to account; never copied from observation context |
| MCP servers | Count of configured server deployments linked to the parent application/agent | Endpoint `McpServerData`; separate local/remote counts |
| Last observed | Latest eligible support timestamp | canonical support ledger |
| Coverage | Fresh/partial/stale/gap/unsupported | coverage ledger |

The table never substitutes observed user for execution identity. When they are not the same proven source object, both are shown separately.

Filters:

- agent name/definition;
- kind and version;
- device, OS and device type;
- observed user and exact execution identity where authorized;
- local/remote MCP configuration;
- configured model;
- parent application;
- source, freshness, coverage, ambiguity and identity assurance.

### Right inspector

The first click opens a right inspector for quick triage:

1. **Agent details** — name, type, version, parent application, source agent ID, first/last observed, lifecycle.
2. **Device details** — canonical/source-scoped ID, hostname, OS/type, Endpoint installation, field assurance.
3. **Identity details** — observed user, exact execution identity if proved, optional authoritative person, assurance explanation.
4. **MCP servers** — configured local and remote server deployments with transport, scope, coverage and exact source.
5. **Models** — configured model products and observed gateway model calls only when exact attribution exists.
6. **Components** — hooks, skills, plugins and configured command-permission rules.
7. **Repositories** — privacy-safe repository labels/tokens and current scanner counts.
8. **Recent activity** — curated action/outcome/time/source rows.
9. **Evidence and coverage** — supporting observations, field provenance, gaps, conflicts and timeline.

The inspector offers:

- Open full agent page
- View on map
- View activity
- View evidence

“Go hunt” or raw query UX is deferred until a supported hunting/query product exists.

### Full agent page

The full page uses tabs:

```text
Overview
Configuration
Activity
Relationships
Evidence & coverage
```

The Relationships tab visually separates:

- Configured: declared local/application configuration.
- Observed: actual sensor-observed operations.
- Entitlement: only authoritative connector facts.

When connectors are absent, the page says `Entitlement visibility not connected`. It never renders an empty list as proof of no access.

## Applications

### List

Default columns:

- Application
- Technology class
- Surface/deployment counts
- Accounts or guest sessions
- Users observed
- Devices observed
- First/last observed
- Sources
- Coverage

Technology class values are `generative_ai`, `other_ai`, `non_ai`, and `unknown`; missing classification is always `unknown`.

### Detail

Sections:

- Product/catalog facts and classification provenance
- Browser surfaces/origins
- Endpoint application deployments
- Application-account and guest/credentialed context
- Related local agents and components
- Configured models and MCP servers
- Recent activity
- Sources/evidence/coverage

The UI does not call Browser, Endpoint, LLM or MCP APIs separately and does not join them in Vue.

## MCP servers and tools

### List

- Server
- Product/deployment
- Local, remote, or gateway
- Transport
- Parent application/agent when exact
- Tools/resources/prompts
- Calls and last observed
- Coverage/fetch state

Endpoint configurations and MCP Gateway deployments are separate rows until an exact mapping exists. The UI may display “possible match” only as an identity-review state; it may not silently merge them.

### Detail

- Registry/configuration
- Deployment/locality/transport
- Parent application or agent
- Tools
- Resources
- Prompts
- Observed operations
- Authentication mode without secrets
- Sources, capability-fetch errors, coverage and evidence

## Models

The collection separates:

- model product;
- family/version when the provider identity supports them;
- deployment/account/region when actually captured;
- gateway route;
- endpoint-configured model claim.

Endpoint `ModelData` never fabricates a model version or provider deployment.

## Devices and identities

### Devices

Show:

- source-scoped or resolved ID;
- hostname/OS/type;
- Browser and Endpoint installations;
- installed applications/local agents;
- observed identities;
- source coverage and identity assurance.

Browser and Endpoint device objects remain separate when exact binding is absent.

### Identities

Show:

- source authority and native subject/account ID;
- display/account name and email only under field authorization;
- observed-on devices/applications;
- exact execution relationships separately;
- identity assurance/conflicts.

This is not an enterprise directory. The empty state says `Directory connector not connected` where appropriate.

## Activity

One canonical activity timeline supports:

- application/browser;
- endpoint/local agent;
- model/LLM;
- MCP/tool;
- native decision/effect;
- source health/gap lineage.

Default columns:

- Time
- Activity
- Actor or source-scoped caller
- Primary asset
- Outcome
- Device/deployment context
- Source
- Evidence/coverage

The drawer shows stage history, correlation level, safe metrics, related assets, native decision versus observed effect, source observations and evidence references.

## Evidence

Evidence is progressive disclosure:

1. human-readable proof summary;
2. source, producer/artifact, observation time and support state;
3. field provenance and relationship support;
4. lineage stages;
5. authorized metadata;
6. separately approved retained content, if a future content policy permits it.

The default pass does not promise retained raw prompts, responses, tool arguments/results, file contents, headers, credentials or tokens.

## Coverage language

| State | Customer copy |
|---|---|
| `fresh` | Observed recently within the expected source window |
| `stale` | Last evidence is older than the expected source window |
| `partial` | Some capability surfaces or snapshot pages are missing |
| `gap` | The source reports a known evidence-loss interval |
| `unsupported` | This sensor/artifact does not provide this capability |
| `unknown` | The platform has insufficient evidence to decide |
| `unresolved` | Source facts exist but identity binding is not safe |

Do not use green/healthy to imply complete estate coverage.

## Nuxt implementation boundary

The current Nuxt shell is fixture-backed. `app/lib/api/readModels.js` synthesizes IDs, risk, approval and relationships and cannot be connected to production unchanged.

Reusable presentation components include:

- `DataTable`
- `RightInspector`
- `Timeline`
- `RelationshipMiniGraph`
- `EvidenceSummaryCard`
- `CoverageBadge`
- `SensorHealthCard`

Production integration rules:

1. generated TypeScript client only;
2. server-authenticated API requests through the Nuxt server boundary;
3. no direct source database/service calls;
4. no frontend canonical ID construction;
5. no frontend cross-sensor joining;
6. no fixture risk, approval, finding, cost, policy or recommendation fields in this pass;
7. list/detail endpoints are hydrated to avoid per-row requests;
8. field authorization and redaction are server decisions;
9. every view renders partial/stale/unsupported/unresolved states;
10. accessibility and keyboard navigation apply to tables, drawers, timelines and graphs.

## Purpose-built read models

The canonical ledger remains normalized and source-independent. The UI consumes disposable read models:

- estate overview through `getOverview`;
- application list/detail through `listApplications` and `getApplication`;
- local-agent list/detail through `listAgentDeployments` and `getAgentDeployment`;
- MCP list/detail through `listMcpServers` and `getMcpServer`;
- model list/detail through `listModels` and `getModel`;
- device context through `listDevices` and `getDevice`;
- identity context through `listIdentities` and `getIdentity`;
- activity list/detail;
- evidence/lineage;
- coverage/producer health.

These projections are not Quilr 1-style backend mashups. They are asynchronously rebuilt from committed canonical changes and can be dropped/rebuilt without losing source or canonical truth.

The exact native-to-screen contract for primary fields is [UI field lineage](registers/ui-field-lineage.csv). A coding agent may not add a production field to these screens until that row identifies its native source or derivation, support state, profile payload, canonical/projection rule, API property, unknown behavior and evidence.

Typed detail responses place the corresponding list-row DTO under `data.summary`; detail-only collections remain at the `data` root. The UI uses the generated TypeScript client and does not flatten, duplicate or reinterpret that boundary.

## UI acceptance scenarios

- A local Agent record and its Endpoint device appear in one row without a frontend join.
- Observation user and exact execution identity render as distinct fields.
- A Browser device and Endpoint device with matching hostname/email remain separate without exact binding.
- A Browser application appears without requiring a browser-profile object.
- Guest browser use creates activity/session context but no durable application account.
- Endpoint MCP configuration appears without fabricated tools.
- MCP Gateway tools appear under their exact gateway server deployment.
- Same-name Endpoint and MCP Gateway servers remain separate without an exact mapping.
- Agent/model or agent/tool runtime attribution appears only with verified correlation.
- Missing directory/IAM connectors show unsupported entitlement coverage.
- Raw prompts, file paths, arguments, results, headers and tokens never appear in default UI payloads.
- Every displayed value can open its source/evidence/provenance explanation.
