# Scope, Claims, and Non-Goals

Status: **normative claim boundary**

## Customer-visible capabilities

### Discovery

- continuous observations and bounded reconciliations from all certified sensor profiles;
- first-seen, last-seen, changed, removed-at-source, unavailable, and reappeared lifecycle;
- source installation, runtime, capability, version, health, and gap state;
- browser web surfaces and supported interactions;
- endpoint applications, artifacts, processes, destinations, local runtimes, and supported MCP observations;
- LLM gateway routes, provider/model candidates, callers, requests, outcomes, and usage measures;
- MCP registry servers/tools/resources/prompts, sessions, calls, outcomes, and negotiated capabilities;
- Browser Backend receipt/configuration/handoff evidence as a distinct producer;
- legacy Quilr 1 records imported with explicit legacy provenance.

### Inventory

Primary collections:

- Applications
- Agents
- Models
- MCP Servers
- Tools

Contextual canonical resources:

- surfaces and deployments;
- provider/application accounts;
- devices;
- people, workloads, and teams where a reliable bridge exists;
- browser, endpoint, LLM gateway, MCP gateway, and backend producer installations;
- source objects, aliases, claims, relationships, coverage, and identity history.

### Activity and evidence

- discovery/lifecycle events;
- supported execution and invocation activity;
- native decision, DLP, block/warn, and effect evidence;
- request/session/outcome metadata;
- safe usage counts and latency/status measures;
- chain of custody, admission receipt, producer artifact, normalizer/resolver version, and field provenance;
- source and canonical timelines;
- explicit gap, loss, sampling, privacy omission, unsupported, and stale state;
- asynchronous authorized export.

### Product and operations

- Overview;
- Inventory lists and entity pages;
- Activity & Evidence;
- Sources & Coverage;
- Identity & Sources panel;
- producer/integration health;
- migration comparison and operator surfaces;
- audit;
- accessibility, empty/partial/error states, documentation, support, and onboarding.

## Exact non-goals

The pass does not ship:

- findings or inferred risk;
- incident/case management;
- recommendation engines;
- severity/confidence models for findings;
- policy authoring, simulation, approval, exceptions, or new enforcement;
- typed remediation commands;
- automated or autonomous response;
- cost analytics or billing;
- prompt/response or other restricted-content product features;
- universal enterprise completeness;
- a graph database merely because relationships exist;
- a search cluster when PostgreSQL search meets the certified profile;
- Quilr 1 retirement;
- support for every deployment profile;
- enterprise connectors not required for selected launch identity/population bridges.

The UI does not display disabled placeholders for excluded capabilities.

## Allowed evidence from existing controls

Current sensors already perform native DLP, policy, warning, block, confirmation, or routing actions. The pass may show:

- native decision type;
- applicable native policy/configuration reference;
- input/output data classification outcome;
- allow/block/warn/confirm result;
- whether upstream execution occurred;
- observed native effect;
- failure or unavailable posture.

The UI labels these as `Observed native decision` or `Observed native effect`. It does not claim they were governed by Quilr 2 policy.

## Claim language

Allowed:

- “Discovered by Browser and Endpoint.”
- “Observed on 12 covered devices.”
- “The routed LLM Gateway observed 318 executions.”
- “The MCP Gateway registered 27 tools.”
- “Evidence is current through 10:32 UTC.”
- “Endpoint visibility is degraded for 14 devices.”
- “Model deployment identity is unresolved.”

Prohibited without later capabilities:

- “Unsafe application.”
- “Critical exposure.”
- “Compliant.”
- “No AI usage.”
- “All enterprise agents.”
- “Blocked by Quilr 2 policy.”
- “The business owner is the last observed user.”
- “Model spend is $X” without the later governed cost model.

## Completeness contract

Evidence completeness is evaluated across:

1. eligible supported event types;
2. expected reporting producers;
3. healthy capability intervals;
4. durable sequence/gap state;
5. snapshot completion;
6. privacy capture state;
7. normalizer/materializer watermark;
8. query projection watermark.

A pass release cannot use an overall “100%” label that hides an unknown dimension.

## Forward compatibility

The pass stores the facts required for later:

- findings and insight evaluation;
- coverage-aware metrics;
- policy simulation;
- commands and effect verification;
- cost attribution;
- cases and workflows.

It does not implement those consumers. Later modules consume versioned canonical events and ledgers, never re-read raw sensor APIs.
