# Future Authoritative Connector Boundary

**Status:** recorded design boundary; implementation is outside this pass

The canonical ontology intentionally has room for enterprise identities, devices, roles, permissions, cloud resources, SaaS accounts, repositories and ACLs. The current four sensors must not synthesize those facts.

The machine-readable backlog is [future-connector-backlog.csv](registers/future-connector-backlog.csv).

## Required future connector and integration families

| Connector | Adds authoritative truth for |
|---|---|
| IdP/directory | people, accounts, groups, service principals, membership and deprovisioning |
| HRIS | employment, manager hierarchy, business units and effective dates |
| MDM/CMDB | stable device identity, ownership, management state, posture and installed software |
| Cloud/IAM | cloud accounts/projects/resources/agents, roles, policies and effective access |
| SaaS | SaaS tenants/accounts/apps/roles and application/object access |
| Source control/repository | organizations, repositories, teams, roles, deploy keys and app installations |
| Filesystem/ACL | volumes/shares/resources, inherited ACLs and effective read/write/execute |
| Data catalog/storage | datasets/buckets/databases/tables, classifications, grants and ownership |
| Agent and AI application platforms | agent definitions/deployments/runtimes, tools, prompts, models, owners, environments and lifecycle from Copilot Studio/Agent 365, Bedrock/AgentCore, Azure AI/Foundry, CrewAI and comparable platforms |
| CI/CD and ephemeral runtimes | pipelines, jobs, runners, workload identities, short-lived agents, artifacts, repositories, models/tools used and execution lineage |
| External AI observability | runs, traces, spans, sessions, prompts/content references, tools, models, evaluations, latency and cost from LangSmith and comparable systems, with declared sampling/retention |
| SIEM/SOAR/security data lake | imported security events and correlation context; authorized outbound Quilr evidence/activity/finding export and delivery receipts |
| CASB/SSE/DLP | discovered SaaS/AI use, identities, sessions, data movement, classifications, policy/control state and source-native outcomes |
| AI-SPM/CSPM/security posture | AI assets, configurations, attack paths, posture checks, vulnerabilities and source-native findings without making the external score canonical Quilr risk |
| Ticketing/ITSM/CRM/business applications | Jira/ServiceNow/Salesforce objects, actors, ownership and workflow state; response/control roles remain separate from discovery |

## Integration architecture

External systems use central adapters because Quilr does not own code inside those sources:

```text
poll/webhook/backfill adapter
→ connector checkpoint + durable source outbox
→ common ingest envelope + typed connector profile
→ immutable evidence
→ connector normalizer
→ continuous identity resolution
→ canonical claims and relationship versions
→ rebuildable product projections
```

The same package may also expose independently authorized control, response or
export roles:

```text
authorized policy/action/workflow
→ typed control or response command
→ role-scoped connector credential
→ native target operation
→ native receipt
→ independently observed effect/reconciliation
→ evidence path

authorized Quilr projection/export
→ field/security filter
→ export connector outbox
→ SIEM/SOAR/data-lake destination
→ delivery receipt and audit
```

Discovery, telemetry import, control, response and export roles never share
authority merely because one vendor package implements several of them.

Each connector must provide:

- stable source authority and native object IDs;
- tenant/account/subscription scope;
- full and delta reconciliation;
- deletion/deprovisioning/tombstone semantics;
- source revision and effective/valid time;
- direct versus inherited versus effective relationship semantics;
- permission/role scope;
- coverage and API-limit gaps;
- privacy classification and field authorization;
- replayable evidence and connector certification.

Agent-platform and ephemeral-runtime profiles additionally declare:

- definition versus deployment versus runtime/session identity;
- stable and ephemeral native keys and their exact lifetimes;
- owner/user/service-principal/workload identity authority;
- model/tool/MCP/prompt configuration versus observed execution;
- parent workspace/project/environment/account;
- repository, pipeline, job, runner and produced-artifact lineage;
- trace sampling, SDK coverage and traffic that bypasses the integration;
- source-native findings/policies/scores as versioned external claims, never
  automatic Quilr canonical risk or policy truth.

## Compatibility requirement on the current DIE build

The bounded sensor pass does not implement these connectors, but it must not
hard-code the five launch profiles as the permanent protocol universe.

- profile identifiers and versions are release-managed registry entries;
- enrollment admits only registered profile/version/schema digests;
- each accepted profile supplies typed schema, normalization, authority,
  privacy, coverage, lifecycle and certification artifacts;
- current launch ontologies and UI views remain explicit allowlists;
- adding a connector extends registries and generated contracts under change
  control; it does not create a second ingest, identity, graph, authorization
  or materialization platform;
- unsupported connector types cannot use a generic JSON escape hatch to write
  canonical truth.

## What remains unknown until then

Without these connectors, the product must not claim:

- complete enterprise user inventory;
- complete group or organization hierarchy;
- complete device inventory;
- every role, permission or credential held by a person/agent;
- every resource an identity or local agent can reach;
- full cloud, SaaS, source-control, filesystem or data inventory;
- cloud agents that do not traverse Quilr gateways.

The UI language is `not connected`, `unsupported`, or `unknown`, never zero access or no exposure.

## Relationship admission

Future connector relationships are already listed in [relationship-support.csv](registers/relationship-support.csv) with `future_connector_required`.

Those rows cannot materialize until:

1. a versioned typed source profile is accepted;
2. its identity authority and key precedence are defined;
3. its direct/inherited/effective permission semantics are explicit;
4. its reconciliation and deletion behavior is tested;
5. its product claims and UI fields are added to the disposition registers;
6. the exact connector artifact is certified.

This preserves an extensible graph without pretending the four sensors currently provide enterprise entitlement truth.
