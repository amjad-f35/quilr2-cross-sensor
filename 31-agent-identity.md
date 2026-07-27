# 31. Agent identity

## Required layers

An agent is not one identity:

```text
Agent Definition
→ Agent Version
→ Agent Deployment
→ Workload
→ Runtime Instance
→ Agent Session
→ Agent Run
→ Agent Step
→ optional Child Agent Run
```

Agent account, credential, owner, user, model, tools, memory, and knowledge sources are separate related identities.

## Current state

**Verified:** endpoint discovery can report agents/MCP servers/tools and local governance IDs; the LLM gateway can carry application/user/model/tool metadata; Quilr exposes MCP/agent analytics through source-specific paths; an external MCP Gateway is referenced.

**Unresolved or absent:** a repository-wide stable agent-definition ID, immutable behavior version, signed agent manifest, deployment identity, workload identity, exact runtime/run binding, child-agent delegation chain, and separately inventoried agent credentials.

Therefore, current records are candidates/observations, not proof of an exact executing agent version.

## Agent definition

The enduring logical agent records:

```text
canonical agent ID
name and purpose
business and technical owners
intended users/systems/data
approved and prohibited capabilities
lifecycle and certification state
```

Names are aliases. Missing accountable ownership creates an identity finding.

## Agent version

An immutable version covers all behaviorally relevant inputs:

- agent source and full source revision;
- agent manifest;
- system instructions and prompt templates;
- model-routing configuration;
- tool/MCP manifests;
- memory and knowledge-source configuration;
- evaluation suite;
- runtime image and dependency locks;
- policy/configuration references.

Recommended identity:

```text
agent_definition_id
semantic_version
canonical agent-manifest digest
source revision
runtime artifact digest
prompt/tool/model/config/evaluation digests
```

A semantic version is display/coordination metadata; the manifest digest is the immutable identity.

## Agent deployment

Deployment records:

```text
agent_version
tenant
environment
region
deployment revision
runtime configuration digest
artifact digest
deployment platform
deployed_by
deployed_at
rollout/current status
```

The same version in test and production is two deployments.

## Runtime and run

Every execution must bind:

```text
session_id
run_id
parent_run_id
step_id
human initiator or scheduled/workflow initiator
agent definition/version/deployment
workload identity and runtime instance
effective principal
credential grant
intent
model route resolution
tool/MCP dependencies
```

The [agent identity schema](schemas/agent-identity.schema.json) defines the stable bundle; the [actor-chain schema](schemas/actor-chain.schema.json) defines event-time attribution.

## Shared worker pools

Worker-pool identity is insufficient when several agents execute in one runtime. Each run binds:

```text
shared workload
+ exact agent version
+ tenant deployment
+ runtime instance
+ run/step
+ human, workflow, or parent agent
+ effective grant and credential
```

Runtime logs that only expose the pool identity are marked attribution-incomplete.

## Child agents

Each child invocation records:

- child definition/version/deployment;
- parent run/step;
- delegating and effective principals;
- received actions/resources/data/audience/spend/duration;
- maximum and current delegation depth;
- issued credential and parent grant;
- returned outcome/evidence.

Child authority must be a subset of the parent. A failed subset test blocks issuance and emits a finding/event.

## Lifecycle

```text
defined
→ versioned
→ evaluated
→ approved
→ deployed
→ running
→ suspended
→ retired
```

Retiring a definition/deployment:

- prevents new runs;
- revokes or expires dependent grants/credentials;
- stops or quarantines active runtimes under policy;
- preserves evidence and historical actor chains;
- produces a finding if activity continues.

## Minimum telemetry contract

At gateway/runtime/tool boundaries add:

```text
agent_definition_id
agent_version_id
agent_deployment_id
manifest_digest
workload_identity
runtime_instance_id
run_id / parent_run_id / step_id
initiator and effective principal
grant/credential/intent IDs
```

Without these fields, Quilr can discover probable agents and activity but cannot make cryptographically defensible attribution claims.

