# Enterprise Connector and Integration Platform Direction

## Status and scope

This document freezes the expansion direction that the bounded sensor build
must preserve. Connector implementation is not part of the current
Discovery/Inventory/Activity/Evidence delivery, but the current spine may not
create a five-sensor ceiling or require a second platform later.

The enterprise product converges owned sensors and external integrations into
one evidence, identity, graph, authorization and product plane:

```text
owned runtime sensors
external authoritative discovery
external activity/trace telemetry
external security/posture systems
external workflow/control systems
outbound security/data destinations
                  │
                  ▼
registered typed source/integration profiles
                  ▼
immutable evidence + source-scoped observations
                  ▼
profile normalizers + continuous identity resolution
                  ▼
canonical entities/relationships/activity/coverage
                  ▼
materializers + authorized APIs + unified UI
                  ▼
policy/findings/orchestration in later governed passes
```

No connector gets its own canonical inventory, graph, identity service,
authorization model or frontend truth.

## Source acquisition framework

There are two producer paths, not one generic collector:

| Path | Durability boundary | Ordering/checkpoint | Admission identity |
|---|---|---|---|
| Owned runtime sensor | profile privacy filter followed by a local Starliner WAL/outbox | producer epoch, sequence and partial receipt state | enrolled sensor installation/runtime |
| Remote system connector | durable webhook inbox or poll/CDC page ledger followed by a connector outbox | webhook delivery ID or source cursor/watermark plus reconciliation snapshot | enrolled connector instance and role-scoped workload identity |

Both paths produce the same small envelope and exact registered typed profile.
Both receive per-record admission receipts. Both converge at immutable evidence,
normalization and central identity resolution. A connector inbox is not an edge
device WAL, and a successful API poll or webhook receipt is not yet central
evidence admission.

## Role taxonomy

An integration is classified by behavior and authority, not vendor.

| Role | Input/output | Examples | Authority boundary |
|---|---|---|---|
| Discovery connector | external source → Quilr | IdP, HRIS, MDM, cloud/IAM, SaaS admin, Copilot Studio, Agent 365, Bedrock/AgentCore, Azure AI/Foundry, CI/CD inventory | authoritative/configured objects only within declared source scope and completed reconciliation |
| Telemetry importer | external events/traces → Quilr | SIEM, CASB, AI-SPM event APIs, LangSmith, cloud audit, agent-platform runtime logs | observed historical/live activity with explicit sampling, loss, latency and retention |
| Control/PEP connector | Quilr command → target; result → Quilr | disable agent, revoke credential, update platform policy, quarantine resource | native command result only; verified effect requires observation/reconciliation |
| Response connector | Quilr workflow ↔ external workflow | Jira, ServiceNow, Salesforce, approval/notification systems | external ticket/case state; never automatic canonical finding resolution |
| Export connector | authorized Quilr projection → destination | SIEM/SOAR, security data lake, customer webhook/stream | delivery receipt only; destination does not become canonical Quilr authority |

One vendor package may implement several roles only through separate manifest
sections, credentials, scopes, queues, health, rate limits, kill switches and
certification evidence.

## Required connector families

### Enterprise identity and ownership

- IdP/directory and workload identity;
- HRIS and organization hierarchy;
- MDM/UEM/CMDB and device ownership/posture;
- service principals, credentials and deprovisioning.

### Cloud, SaaS and data estate

- AWS, Azure and GCP accounts/projects/resources/IAM;
- Kubernetes and workload platforms;
- SaaS tenant/admin APIs;
- source control, repositories and app installations;
- filesystems, shares and ACLs;
- data catalogs, storage, datasets and classifications.

### Agent and AI application platforms

- Microsoft Copilot Studio and Agent 365;
- Azure AI/Foundry and comparable managed agent platforms;
- AWS Bedrock/AgentCore and comparable cloud-agent systems;
- CrewAI and other orchestration frameworks where a durable management API or
  deployment registry exists;
- model/provider organization, deployment, usage and configuration APIs;
- agent definition, deployment, runtime/session, workspace, tool, MCP,
  prompt/template, model, owner and lifecycle records.

### CI/CD and ephemeral agents

- pipelines, jobs and runners;
- short-lived coding/build/release agents;
- workload identity and federation subjects;
- repository/commit/ref and triggering actor;
- model/tool/MCP use;
- produced artifact and deployment lineage;
- explicit start/end lifetime and expected-population semantics.

An ephemeral runtime remains a runtime/session. It does not create a new
long-lived agent definition merely because a new job ID exists.

### External observability and evaluation

- LangSmith and comparable LLM/agent trace systems;
- run, trace, span, session and step hierarchy;
- model/tool/MCP calls and evaluations;
- latency, tokens, cost and outcome;
- declared SDK coverage, sampling, clock/order, backfill and retention;
- restricted content references rather than automatic raw-content admission.

### Cybersecurity and posture ecosystem

- SIEM/SOAR/security data lakes;
- CASB/SSE/DLP;
- AI-SPM and CSPM;
- external detection/posture/vulnerability/finding systems;
- imported alerts/events/findings and outbound Quilr data.

External findings, severity, risk scores, policy state and attack paths are
source-native versioned claims. They do not become Quilr canonical risk,
finding or policy truth without the later intelligence/policy authority and
its explicit dedupe/precedence rules.

### Workflow, ITSM, CRM and business applications

- Jira and ServiceNow tickets, cases and approvals;
- Salesforce users/accounts/business objects and governed workflows;
- notification/collaboration destinations;
- external owner/business context where the source is authoritative.

Discovery of an object, response workflow and native control are separate
roles even when the same vendor API supports all three.

## Connector runtime

Connectors run as managed tenant-cell workers, not customer-device edge
runtimes:

```text
connector instance
├── credential reference and workload identity
├── role-scoped capability manifest
├── webhook inbox
├── poll/backfill scheduler
├── durable cursor and source watermark
├── full/delta snapshot state
├── rate-limit and retry state
├── typed profile adapter
├── connector outbox
└── health/coverage/certification state
```

Webhook receipt is durable and replay-protected. Polling is cursor-based where
reliable. Periodic full reconciliation detects missed events and source resets.
No absence, deletion or completeness claim is permitted until a declared
authoritative snapshot completes.

## Profile and admission model

The five owned profiles are launch registry entries, not a protocol enum.
Every future connector profile provides:

- unique profile ID and semantic version;
- source family and one or more integration roles;
- schema reference and digest;
- native identifier, scope and lifetime rules;
- per-field authority and privacy rules;
- lifecycle, snapshot, delta, tombstone and disconnect semantics;
- normalizer name/version/artifact;
- supported entity, relationship, activity and coverage outputs;
- permission/credential scope;
- rate/cardinality/resource limits;
- positive, negative, replay, scale and source-version certification packs.

Every connector instance additionally declares:

- acquisition mode: webhook, full poll, incremental cursor, CDC or supported
  combinations;
- source tenant/account/region and native identity namespaces;
- object, event and relationship types plus field-level authority;
- snapshot completeness, delta, deletion, tombstone and disconnect behavior;
- OAuth/workload identity, secret reference, scopes and credential rotation;
- rate limits, pagination, retry, cursor reset and source-version behavior;
- health, freshness, sampling, loss, retention and expected-population
  coverage;
- inbound evidence, outbound control/response/export roles and their separate
  credentials;
- exact certification fixtures, sandbox requirements and support matrix.

Wire schemas validate profile identifier shape. Enrollment and admission then
require the exact profile/version/schema digest in the release-managed
`die_control.source_profile` registry. Arbitrary connector JSON cannot pass
through a generic profile or write canonical truth.

## Canonicalization and graph

External objects enter as source-scoped objects and claims. They use the same
resolver and canonical ledgers as sensors:

```text
source authority + source instance + native type + native ID
→ source object
→ typed claims and relationship candidates
→ field/identity authority rules
→ canonical binding or unresolved candidate
→ versioned canonical entity/relationship/activity/coverage
```

The graph distinguishes:

- definition, deployment, runtime/session and activity;
- direct, inherited and effective permission;
- configured, entitled and observed access;
- owns, manages, created, deployed, triggered and executed-as;
- called model, invoked tool, exposed capability and accessed resource;
- data movement, lineage and produced artifact;
- source-native finding-affects and policy/control relationships;
- cross-source support, confidence, valid time and system time.

Names, labels, emails, URLs, trace timing and vendor similarity never
automatically merge canonical entities. Exact native IDs, trusted
issuer/subject, authoritative mappings, signed attribution or reviewed
correction are required.

## Authorization and product behavior

- Connector credentials are secret references, never evidence payloads.
- Discovery/read credentials are separate from control/write credentials.
- RBAC/ABAC/ReBAC and field masking apply before connector-derived queries,
  graphs, counts and exports.
- Customer product rows remain canonical read models; Connections is an
  administrative/operator surface.
- UI detail pages combine all proven sensor and connector sources behind one
  canonical entity with provenance and coverage.
- Unsupported/not-connected sources remain explicit; missing connector data
  never becomes zero exposure.

## Current-build compatibility invariants

The bounded DIE implementation must:

1. use the release-managed source-profile registry rather than compile-time
   five-profile database constraints;
2. route every profile through registered typed normalizers;
3. preserve generic source-qualified references in evidence, claims and
   relationship candidates;
4. keep canonical entity/predicate/activity registries versioned and
   generated;
5. keep materializers deterministic and projectors rebuildable as new types
   are admitted;
6. keep product filters and export contracts profile-extensible;
7. expose integration health, freshness, completeness and coverage through
   the same producer/coverage foundations;
8. prohibit connector-specific services from bypassing evidence,
   canonicalization, authorization or audit;
9. allow later policy, findings and orchestration modules to consume the same
   canonical IDs and evidence lineage;
10. require formal profile/ontology/API change control for every admitted
    connector capability.

These invariants do not require implementing connectors in the current pass.
They prevent the current implementation from creating expensive structural
debt immediately before connector expansion.

## Expansion sequence

1. Complete the five owned sensor profiles and core DIE platform.
2. Ship connection administration and generic managed-connector runtime.
3. Add IdP/MDM/CMDB for identity/device convergence and expected populations.
4. Add cloud/IAM/SaaS/repository/ACL for entitlement and resource reachability.
5. Add agent-platform and CI/CD/ephemeral-agent discovery.
6. Add external observability and security telemetry imports.
7. Add SIEM/data-lake export and ITSM/CRM response integrations.
8. Add role-separated control connectors only after policy, approval,
   command and effect-verification authority is accepted.

Each family ships independently only after its source profile, security,
privacy, reconciliation, scale, certification, support and product-claim
gates pass.
