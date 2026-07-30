# Canonical Ontology and Aggregate Model

Status: **normative**

## Modeling rules

- Canonical entities represent durable enterprise things, not source rows.
- Products, surfaces, accounts, deployments, instances, sessions, and events remain separate.
- Aggregates enforce mutation invariants; projections optimize reads.
- All material state is tenant- and environment-scoped.
- Canonical IDs are opaque and do not encode mutable business values.
- Every field and relationship resolves to claims and evidence.

## Aggregate families

### Estate aggregate

| Entity | Identity boundary | Examples of children/context |
|---|---|---|
| AI application product | vendor/product identity | web and desktop surfaces |
| Tenant application | customer-specific governed use | account, owner, approval, environment |
| Application surface | distinct interaction/deployment surface | web origin, desktop artifact, API route |
| Agent definition | logical authored agent | versions, repository/artifact |
| Agent deployment | running/configured instance | workload identity, environment, routes |
| Model product | provider family/version identity | capabilities and catalog metadata |
| Model deployment | callable provider/account/region endpoint | route alias, account, effective model |
| MCP server product | publisher/server identity | versions |
| MCP server deployment | reachable running/configured server | transport, endpoint, operator |
| Tool | server-qualified capability definition | version/schema/capability class |

### Identity and organization aggregate

- person;
- directory account;
- service principal;
- workload identity;
- device;
- team;
- business unit;
- provider account/project;
- application account;
- session and delegated actor chain.

### Governance aggregate

- owner assignment;
- classification and business purpose;
- approval/review state;
- policy and version;
- exception;
- decision;
- approval;
- command and effect.

### Detection and workflow aggregate

- insight definition;
- finding;
- case;
- task;
- comment/reference;
- notification;
- SLA state.

### Operations aggregate

- producer/workload;
- source installation;
- capability certification;
- connector;
- reconciliation run;
- coverage interval;
- projection and release version.

## Entity lifecycle

Common lifecycle states:

```text
candidate -> discovered -> active -> inactive -> retired
                          \-> disputed
source_deleted is a source state, not automatically canonical retired
```

Entity-class policies define activation, staleness, retirement, reappearance, and purge eligibility. History remains effective-dated until retention permits removal.

## Product versus deployment

Example:

```text
Claude (application product)
  ├─ claude.ai web surface
  ├─ Claude desktop application surface
  └─ customer tenant application/account

Claude model family
  ├─ provider model version
  ├─ customer provider-account deployment
  └─ gateway route alias
```

The product UI can group these without making them the same entity.

## Aggregate invariants

- A canonical entity version is immutable after transaction commit.
- One source object has at most one active binding in a resolution context.
- Entity retirement cannot be caused solely by source silence.
- Ownership roles are typed; observed user is not business owner.
- Approval is effective-dated and targets an exact governed entity/scope.
- A tool is scoped at least to an MCP server product/deployment namespace.
- A model alias does not establish exact model version without a resolving source.
- Commands target a valid current source binding and retain the canonical version used.

## Extension

New entity classes require ontology review, source authority, identity keys, lifecycle, relationships, privacy, product need, migration, and compatibility. Adding a table is not sufficient.
