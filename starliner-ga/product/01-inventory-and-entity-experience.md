# Inventory and Entity Experience

Status: **normative product contract**

## Inventory model

Inventory is one continuously resolved estate with four top-level collections:

1. Applications
2. Agents
3. Models
4. MCP & Tools

Devices, users, accounts, providers, deployments, and surfaces remain canonical objects, but appear as context and relationships rather than an overwhelming primary navigation.

## List contract

Each list shows only fields useful for a decision:

- name and type;
- active/lifecycle state;
- owner;
- approved/managed state;
- environment and business scope;
- first/last observed;
- material source coverage;
- activity summary;
- open finding summary;
- key relationship count;
- confidence/conflict indicator only when actionable.

Users choose optional columns, but raw source fields are not indiscriminately exposed.

## Application entity page

- identity: vendor/product plus distinct web, desktop, account, or deployment surfaces;
- ownership and business purpose;
- approval and policy state;
- users/workloads and activity;
- models and tools used;
- providers/accounts;
- data and capability indicators supported by evidence;
- findings and cases;
- cost and trend;
- sources, coverage, and identity history;
- available governed actions.

## Agent entity page

- agent definition vs deployment instances;
- owner, environment, and lifecycle;
- workload/service identity;
- model dependencies;
- MCP servers and tools;
- permissions/delegation;
- execution and outcome trends;
- findings, policy state, and actions;
- release/artifact provenance where supported.

## Model entity page

- model product/family/version;
- provider and deployments/endpoints;
- regions/accounts;
- consuming applications and agents;
- approval and policy state;
- executions, errors, latency, tokens, and cost;
- discovery and last use;
- related findings;
- price and attribution confidence.

## MCP server and tool page

- server identity, publisher, deployment, transport, and reachability;
- authentication posture and operator;
- registered tools and capability classes;
- consuming agents/applications/users;
- invocations and outcomes;
- data/resource access indicators;
- approval, policy, findings, and remediation;
- source-native identifiers and resolution history.

## Identity transparency

The default page is simple; an “Identity and sources” panel explains:

- which source objects compose the entity;
- which fields came from which authority;
- unresolved conflicts;
- merge/split history;
- confidence;
- safe evidence.

Authorized operators can correct identity. Normal users are not forced to understand resolver internals.

## Lifecycle

States include discovered, active, inactive, retired, deleted-at-source, and unknown. An entity may remain in inventory after a source deletion when other evidence or retention requires it. The UI explains why.

## Governance actions

Depending on permission and capability:

- assign owner;
- classify business purpose or criticality;
- approve, deny, or request review;
- create exception;
- add to a policy;
- open/integrate a case;
- trigger certified remediation;
- correct identity;
- export the authorized view.

## Search and filtering

Search matches normalized names, aliases, approved source identifiers, owners, providers, and relationships. Filters are type-aware. Results show why they matched and never surface restricted content.

## Scale behavior

- cursor pagination;
- saved views and server-side filters;
- asynchronous exports;
- no browser-side join across sensor APIs;
- stable selection across projection updates;
- bulk action preview and per-item outcome;
- permission-aware counts.

## Acceptance scenario

From a newly discovered unapproved model finding, a user can identify the model deployment, see the three production agents that executed it, determine owners, inspect supporting coverage and executions, request approval or remediation, and later verify the effect—without touching raw sensor tables.
