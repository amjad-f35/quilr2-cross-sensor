# Canonical Inventory and Relationships

Status: **normative pass ontology and product inventory contract**

## Primary inventory

The customer sees five primary collections:

| Collection | Canonical distinction |
|---|---|
| Applications | product versus web/desktop/API surface versus customer deployment/account |
| Agents | agent definition versus configured/running deployment versus workload identity |
| Models | provider product/family/version versus customer endpoint/deployment/route alias |
| MCP Servers | server product/definition versus reachable configured deployment |
| Tools | server-scoped tool definition and version; never a global name alone |

Devices, people, workloads, accounts, producers, sessions, routes, artifacts, resources, prompts, and source objects are contextual inventory and relationships rather than additional primary navigation.

## Required entity classes

### Application

- `application_product`
- `application_surface`
- `application_deployment`
- `application_account`

### Agent

- `agent_definition`
- `agent_deployment`
- `workload_identity`

### Model

- `model_product`
- `model_family`
- `model_version`
- `model_deployment`
- `model_route`
- `provider_account`

### MCP

- `mcp_server_product`
- `mcp_server_deployment`
- `mcp_tool`
- `mcp_resource_definition`
- `mcp_prompt_definition`

### Context

- `person`
- `directory_account`
- `service_principal`
- `team`
- `business_unit`
- `device`
- `browser_installation`
- `browser_profile`
- `endpoint_installation`
- `llm_gateway_deployment`
- `mcp_gateway_deployment`
- `browser_backend_deployment`
- `artifact_or_package`
- `source_object`
- `source_producer`

Entity classes with no reliable source evidence remain absent, not empty fabricated rows.

## Required relationship classes

### Structure

- surface `INSTANCE_OF` application product;
- deployment `DEPLOYED_AS` product/definition;
- model version `VERSION_OF` family/product;
- tool/resource/prompt `EXPOSED_BY` MCP server deployment;
- MCP server deployment `INSTANCE_OF` server product;
- route `ROUTES_TO` provider/model deployment.

### Dependency and configuration

- application/agent `CONFIGURED_TO_USE` model;
- agent/application `CONFIGURED_TO_INVOKE` MCP tool;
- agent/application `CONNECTS_TO` MCP server;
- deployment `RUNS_ON` device;
- workload `OPERATES` agent deployment;
- deployment `AUTHENTICATES_AS` workload/service principal.

### Observed activity

- principal/workload `USED` application surface;
- application/agent `EXECUTED` model deployment;
- principal/application/agent `INVOKED` MCP tool;
- source producer `OBSERVED` activity/entity;
- entity `OBSERVED_ON` device/environment.

Configured relationships never appear as observed execution.

### Organization and coverage

- team/person `OWNS` entity only from approved authority;
- account/principal `MEMBER_OF` organization;
- source installation `COVERS` population/capability;
- source object `RESOLVES_TO` canonical entity as a versioned binding.

## Identity rules

- only the central resolver assigns canonical IDs;
- all source-native IDs are retained with namespace, scope, time, producer, and provenance;
- display name, executable name, model string, hostname, URL, or tool name alone is not a global identifier;
- source bindings are tenant-scoped, versioned, reversible, and never destructively replace source evidence;
- ambiguous candidates remain separate or unresolved;
- automatic merge requires approved high-precision rules;
- high-impact merges and splits support review and impact preview;
- source deletion closes a claim but does not automatically delete a canonical entity;
- observed use never creates business ownership;
- if the separately governed migration track later submits legacy Quilr 1
  evidence, its IDs are source aliases/compatibility references, never canonical
  IDs; bounded DIE does not import or resolve legacy records itself.

## Material inventory fields

Each inventory record may expose, when supported:

- canonical ID, class, display name, normalized vendor/provider;
- lifecycle and active interval;
- distinct surfaces/deployments/accounts;
- first and last observed;
- source count and current source freshness;
- owner/team with authority provenance;
- environment/business scope;
- model, agent, MCP, tool, device, and principal relationships;
- activity summary and last important activity;
- identity confidence/conflict state;
- coverage applicability;
- source-native aliases safe for display;
- canonical and projection versions.

Every field links to selected claims and evidence. Arbitrary last-write-wins JSON merge is prohibited.

## Lifecycle

```text
candidate
→ discovered
→ active
→ inactive
→ retired

candidate/discovered/active
→ disputed

source_deleted and source_unreachable remain source states
```

Activation, inactivity, retirement, and reappearance rules are entity-class/version specific. Silence under degraded coverage cannot retire an entity.

## Inventory product constraints

- counts use canonical entities, never raw source rows;
- count drilldown returns the exact member set and watermark;
- one product may have several surfaces/deployments without count inflation;
- agent, model, MCP server, and tool remain separate types;
- list and entity pages disclose source coverage and ambiguity;
- customers can inspect identity composition without reading raw database rows;
- identity correction may be operator-only during the pass and must be audited/reversible;
- no risk, finding, policy, cost, or compliance field appears in the pass inventory.

## Required resolution evaluations

- web and desktop surfaces of the same product;
- same-named unrelated products remain separate;
- provider model alias versus exact version/deployment;
- tool name collision across MCP servers;
- device/process reinstallation and boot epochs;
- source ID deletion/reuse;
- tenant boundary;
- conflicting catalog/source claims;
- false merge and split;
- late evidence and source correction;
- multi-output splitting of supported native-source composite records.

Quilr 1 composite-row splitting and legacy alias evaluation belong to the
separate migration qualification corpus in document 10.
