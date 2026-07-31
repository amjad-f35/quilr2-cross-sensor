# Capability and Feature Catalog

## Interpretation

The exhaustive machine-readable catalog is
[`features.csv`](../../../matrices/sensor-intelligence/quilr1-platform/features.csv).
It currently contains 30 feature rows across identity, inventory, activity,
findings, analytics, governance, controls, gateway administration,
integrations, audit, product shell, secondary product, and operations.

`Implemented` means executable code plus an entry point at the pinned commit.
It does not mean deployed, fully authorized, data-backed, or covered by a
target-owned test.

## Capability hierarchy

```text
Identity and access
├─ Password login and OAuth landing
├─ Browser-held authentication state
└─ Client route permissions

Inventory and relationships
├─ Applications
├─ Users and accounts
├─ AI assets
├─ Smart groups
├─ Endpoint devices
├─ Browser extension
├─ LLM Gateway
├─ MCP Gateway
└─ Integrations

Activity, evidence, and findings
├─ Conversations and masking
├─ Interactions
├─ Findings
├─ Status workflow
├─ Audit and exports
├─ Compliance
└─ Red teaming

Governance and control
├─ Application approvals
├─ Password whitelisting
├─ Control management
├─ Detection models
└─ Policies

Analytics and product presentation
├─ Named widgets and insights
├─ Executive dashboard
├─ Self-service
├─ Decision engine
├─ Lens
└─ Secondary platform pages

Operations
├─ Scheduled synchronization
├─ Runtime diagnostics and Actuator
└─ Direct ClickHouse operations
```

## Cross-cutting capability summary

| Capability | Current implementation | What it proves | Quilr 2 disposition |
| --- | --- | --- | --- |
| Cross-source product UI | web composes query-builder and external APIs | broad product workflows exist | reuse workflows; replace frontend identity joins |
| Query/aggregation | named processors and domain services query ClickHouse | legacy rows can be read and transformed | compatibility APIs and backfill adapters |
| Inventory | app/user/asset/device/account tables and external calls | source-specific inventory evidence | import as source observations and aliases |
| Activity | interaction/conversation/visit/enriched tables | legacy activity rows exist | normalize to canonical events with provenance |
| Findings/status | alert/action/status/outcome and master/drilldown rows | current alert/workflow state exists | migrate as signals; admit findings selectively |
| Governance | settings, approvals, whitelist, controls, policies | selected configuration/mutation paths exist | canonical commands with dual-write during migration |
| Analytics | request-time and summary-table metrics | current dashboards can calculate values | re-materialize on canonical grain plus coverage |
| Health/operations | health, diagnostics, logs, schedulers, Actuator | runtime/process/store states can be inspected | source/adapter/platform health separated by dimension |

## Feature family details

### Authentication, onboarding, and route permissions

**Status:** Implemented frontend; external identity dependencies unresolved.  
**Evidence:** Runtime verified for login-page hydration, cookie routing, and
protected-route redirects.

Execution:

1. `src/proxy.ts` performs locale handling and cookie-presence routing.
2. `useLogin.login` or OAuth landing calls the external identity service.
3. Browser code stores serialized authentication and role state in cookies.
4. Permission retrieval writes a map to `sessionStorage`.
5. `HydrateAuth`/Jotai holds the user in memory.
6. `PermissionGuard` retrieves permissions and evaluates one of 38 route
   rules.

Outputs are browser session/UI state, not source observations. Fifty-three of
112 pages have no matching local rule. Product migration must not convert the
frontend permission map into authoritative authorization evidence.

### Insights and executive analytics

**Status:** Implemented; selected screens are flag-disabled.

The central dispatch is:

```text
GET /qb/query
→ WidgetsController.getDashboardResults
→ WidgetsServiceImpl
→ QueryProcessorFactory
→ named QueryProcessor
→ ClickHouse/JDBC
→ ServiceResponse
```

The request carries a processor name, time range, tenancy, and
processor-specific parameters. Unknown names throw; duplicate registered
names overwrite without diagnostics. Outputs are request-time projections,
not durable metric records. Quilr 2 should preserve verified formulas but
materialize metrics on canonical entity/event grain with a coverage
denominator.

### Applications, users, accounts, assets, and smart groups

**Status:** Implemented; smart-group operation validation and asset SQL
identifier handling have documented limitations.

Primary current stores are `apps_db`, app/settings cache tables, `users`,
`smart_groups`, `user_app_approvals`, `quilr_asset_inventory`, Redis, and
Neo4j enrichment. These rows provide strong backfill evidence but not one
canonical ontology. Product, surface, tenant application, installation,
account, user, and observation must remain separate in the target.

Smart-group mutations write state and audit known operations. Unknown
operation strings are not rejected and follow an inconsistent branch.

### Conversations and interactions

**Status:** Implemented with a concrete frontend/backend filter-route
contradiction.

Conversation endpoints query content/detections, manage filters, and decrypt
selected masked attributes. Current encryption uses AES-256-GCM; legacy
decrypt accepts AES/ECB data. An unmask call resolves actor/client metadata
before asynchronous audit publication.

Interaction endpoints provide simple, advanced, chat, and legacy query forms.
The advanced path validates a supported field/operator vocabulary and binds
values. Source strategies select browser-extension, endpoint, LLM Gateway, or
MCP Gateway predicates and enrichment. Returned rows may be masked/enriched
and cached for three minutes.

These are read/query transformations over legacy source rows. They are not a
universal native event contract, and absence from the result cannot establish
absence of activity.

### Findings and status workflow

**Status:** Implemented legacy findings/status; `/findings/kpi` is absent at
the backend commit.

Findings processors read alert, action, outcome, status, occurrence, and
interaction data and enrich labels from graph/static mappings. Status
resolution writes drilldown and master rows item by item with no
repository-visible transaction. Partial success is an explicit current
outcome.

Target rule:

```text
legacy alert/detection row
→ source observation / finding signal
→ canonical affected entity and coverage check
→ versioned finding definition
→ deduplicated customer finding
```

No legacy row is admitted directly as a unique customer finding merely
because a current processor renders it.

### Approval, whitelist, compliance, red-team, and controls

**Status:** Mixed implemented and partial.

- User/app approval reads and updates ClickHouse/Redis state and can publish
  audit.
- Four password-whitelisting operations are locally method-authorized and use
  JPA, ClickHouse, graph, and browser-extension paths depending on behavior.
- `FindingsWhitelistService` contains TODO-only graph/ClickHouse effects.
- Compliance reads events/scores/details; policy source and calculated score
  are not one concept.
- Red-team endpoints return run/category/technique/result metrics.
- Control, policy, and detection-model screens depend heavily on external
  services; adversarial/insider detection-model tabs are disabled by default.

The current system distinguishes neither command acceptance, execution,
success, nor observed effect consistently. Target control mapping must keep
those event families separate.

### LLM and MCP Gateway administration

**Status:** Implemented composite UI/analytics; authoritative external
contracts unresolved, especially MCP.

The web uses external management services while query-builder reads gateway
analytics from ClickHouse. Model/provider/route/deployment, MCP
client/server/tool, and agent concepts are not uniformly identified.
Query-builder analytics cannot prove a complete tool-call side effect or a
stable agent definition/version/deployment/run chain.

### Endpoint and browser-extension integration

**Status:** Implemented platform integration; native capture belongs to the
upstream sensors.

Query-builder can synchronize endpoint graph data into `ep_user_devices`,
serve device/user information, and expose browser-derived findings and
interactions. The web provides configuration/inventory/detail pages.

**Important boundary:** these paths consume or project upstream evidence.
They do not make Quilr 1 the native endpoint or browser capture source.

### Audit and exports

**Status:** Audit reads/master-code CRUD implemented; exports involve external
services.

Audit search returns rows, filter metadata, pagination/count information, and
parsed before/after JSON. Domain mutation paths publish selected audit
messages asynchronously through the private Kafka client. There is no
universal audit interceptor, delivery acknowledgement, or target-local
dead-letter configuration.

### Self-service and secondary product surfaces

Self-service access is implemented and runtime-verified at the routing level.
Decision Engine and Lens routes exist but sidebar flags are off. Policies,
engagement, review, playground, and data-model pages are routable but depend
on external or UI-local behavior. Route existence does not prove downstream
feature completeness.

### Diagnostics and ClickHouse operations

Runtime diagnostics expose DWH health/config/resource/database/container/host
information plus Actuator registrations. The prior runtime verified that a
TCP-ready process can have `DOWN` dependency health.

Direct ClickHouse operations accept a shared access code, SQL, and optional
parameters. Select limits are advisory after materialization; update uses a
finite blocklist. The invalid-code path was runtime-verified to return HTTP
200 with an application-level unauthorized value inside a success wrapper.

These are operator-only capabilities and are not sensor telemetry.

## Coverage and tests

Neither target owns an automated test suite. The first-pass development
harness supplies build/start/HTTP/browser and selected library/Redis evidence.
Each row in the CSV therefore separates source implementation from runtime
verification and from external/deployed behavior.
