# Feature catalog and traceability matrix

## Interpretation

“Implemented” means executable code and an entry point exist at the pinned commit. It does not mean the feature was deployed or tested. “Partial” means visible branches, stubs, disabled flags, unresolved external dependencies, or client/server mismatches prevent a complete implementation claim.

## Cross-repository feature matrix

| Feature | Frontend entry point | Query-builder entry/API | Primary state | External systems | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Authentication and onboarding | `/[lng]/login`, `/oauth-landing/[token]`, `/auth`, `/onboard` | none in this repo | auth/roles cookies, Jotai | identity/auth, instance manager | none | Implemented frontend; downstream unresolved |
| Insights dashboards | `/[lng]/insights/[tabId]`, home components | `/qb/query`, `/executive/dashboard/*` | ClickHouse | BFF, query-builder | none | Implemented; some screens flag-disabled |
| Findings and finding insights | `/[lng]/findings/[dataType]` | `/findings/*`, `/status-events/*` | ClickHouse, static/graph mappings | browser-extension service | none | Implemented; `/findings/kpi` mismatch |
| Applications | `/[lng]/apps` | `/aiapps/*`, `/nonaiapps/*` | ClickHouse, Redis, graph | query-builder | none | Implemented; non-AI folder not main screen |
| AI users and accounts | `/[lng]/users`, `/accounts` | `/aiusers/*`, `/aiaccounts/*` | ClickHouse, Redis, graph | query-builder | none | Implemented |
| Conversations/interactions | user/app drawers, AI assets inventory | `/aiconversations/*`, `/interactions/*`, `/quilly/interactions/*` | ClickHouse; masking key | query-builder | none | Implemented; one filter URL mismatch |
| User/app approvals | users/apps drawers | `/userappapproval/*` | ClickHouse, Redis | Kafka audit | none | Implemented |
| AI assets inventory | `/[lng]/ai-assets/[tabs]` | `/ai-assets/v1/*` plus many external APIs | ClickHouse | endpoint, browser extension, LLM/MCP, compliance services | none | Implemented composite feature |
| Compliance/red teaming | app drilldowns; LLM settings red-team pages | `/compliance/*`, `/redteaming/v1/*` | ClickHouse | guardrails/config manager also used | none | Implemented; legacy and v2 paths coexist |
| LLM Gateway administration | `/settings/ai-gateway/gateways`, logs, usage, red-team | some dashboard calls only; most APIs are `guardrails/*` | external service + browser cache | LLM Gateway/guardrails | manual smoke script | Implemented frontend against other service |
| MCP Gateway administration | `/settings/ai-gateway/mcp-gateway` | `/mcp/gateway/*` analytics; management uses other service | ClickHouse + MCP service | MCP Gateway | none | Implemented composite |
| Detection models | `/detection-models/[tabName]` | none | external config | data-definitions/config manager | none | Data risks implemented; adversarial/insider tabs flag-disabled |
| Controls | `/control-management/[tab]`, settings browser-extension controls | findings/whitelisting dependencies | external playbook/control data | playbook service | none | Implemented |
| Password finding whitelisting | finding modals/hooks | `/whitelisting/*/{approve}` | ClickHouse status tables; JPA whitelist table used elsewhere | Kafka audit | none | Implemented |
| Endpoint agent settings/inventory | `/settings/endpoint/*`, AI assets inventory | `/endpoint/sync/*`, `/device/user/info` | ClickHouse | endpoint/DLP APIs | none | Implemented composite |
| Browser extension | `/browser-extension`, `/browser-ext/[id]`, settings | findings and interaction data | browser cookie/storage | browser-extension service | none | Implemented |
| Integrations | `/integration/*` | none | external | instance manager/integration APIs | none | Implemented frontend against other service |
| Audit log and exports | `/audit-log`, `/exports` | `/v1/audit/logs/*` | ClickHouse | export services | none | Implemented |
| Audit master-code administration | no confirmed first-class page | `/v1/audit/master-codes/*` | ClickHouse | none | none | Backend implemented; frontend consumer unresolved |
| Smart groups | `/smart-groups`, settings smart groups | `/aiusers/smartgroups` and sync/backfill APIs | ClickHouse, graph, Redis | Kafka audit | none | Implemented; operation validation issue |
| Self-service LLM dashboard | `/self-service` | none in query-builder | auth cookie, session storage | guardrails self-service APIs | none | Implemented frontend; MCP shown coming soon |
| Decision engine | `/decision-engine/[tabId]` | none | external | guardrail/policy services | none | Routable; sidebar flag off |
| Lens | `/lens` | conversation unmask/query endpoints among others | browser state, external APIs | query-builder/BFF | none | Routable; sidebar flag off |
| Policies | `/policies` | none | external | policy engine | none | Routable; no route-permission rule |
| Engagement center/things to review/playground/data models | corresponding pages | none | external or UI-local | multiple services | none | Routable, secondary/partially documented |
| Runtime diagnostics | none confirmed | `/dwh/*`, `/qb/health` | process/JVM/config | Docker/OS, stores | none | Backend implemented |
| Direct ClickHouse operations | none confirmed | hidden `/clickhouse/ops/query|update` | ClickHouse | none | none | Backend implemented, high-risk administrative surface |

## Query-builder subsystem behavior

### Named dashboards

`WidgetsController.getDashboardResults` resolves missing/invalid time bounds, writes normalized bounds back into the request map, and delegates to `WidgetsServiceImpl`. The service selects a `QueryProcessor` by `dashboard_name`; the processor builds and executes a query and returns its private response envelope. Missing or unknown names become `IllegalArgumentException`.

### AI applications

The AI app controllers expose KPI/query, table, category metadata, whitelist lookup, settings update, category discovery, app detail, and visitor views. Services/processors combine ClickHouse query results with graph and Redis-cached app metadata. `app_settings/update` is method-authorized and queues application IDs for synchronization.

### AI users and smart groups

Twenty endpoints cover dashboard data, table filters, Redis inspection/deletion, manual synchronization, smart-group updates, and app-admin backfill. `syncSmartGroups` mutates ClickHouse and publishes an audit event. **Verified limitation:** operation values other than `DELETE`, `ADD`, or `REMOVE` are not rejected; they follow the insert path, use active state except for `REMOVE`, and do not produce the expected audit event.

### Conversations and PII masking

Conversation endpoints query IDs/content/detections, unmask selected encrypted attributes, and manage conversation filters. Masked text uses AES-256-GCM `v2:` payloads with random IVs; legacy AES decrypt remains. The unmask method has `AI_USAGE/CONVERSATION/READ`. Audit messages record metadata and encrypted-attribute lists, not the recovered plaintext.

**Verified failure cases:** a null `masked_attributes` list causes `.isEmpty()` to throw. Filter update catches failures but still sets a successful boolean response.

### Interactions

The newer interaction APIs support:

- a typed simple-query model selected by subproduct strategy;
- an advanced Splunk-like DSL parsed into whitelisted fields/operators and named parameters;
- field discovery and validation;
- distinct application/user options;
- chat queries;
- source-specific filters; and
- a paginated legacy query.

Rows are enriched with detection maps and sensitive-data counts, raw category columns are removed, and prompts are encrypted/masked when plaintext attributes are available. Browser detail strings are parsed into browser/version fields.

### Findings and status events

Findings has separate carousel, KPI, table, drilldown, pivot, occurrence, related-event, and interaction processors. Startup loads behavior/use-case labels from graph into `FindingsConstants`; hard-coded mappings remain as fallback/current content.

Status-event summary defaults to open, page 0, page size 50, caps size at 100, and enriches use-case names. Drilldown validates required typed fields. Filter endpoints whitelist filter types. Resolve handles each item independently and inserts resolved drilldown/master states; results can be partially successful.

### AI assets

`AIAssetController` accepts an optional `SearchAndFilterDto`. DAO code constructs a ClickHouse inventory query, total count, filter options, and metrics. Returned DTOs use snake_case naming. The service maps inventory rows to `AssetDto` and constructs trend/distribution/summary responses.

### Audit

Audit log search builds only known filter clauses and named values, returns row results plus filter metadata and pagination/count information, and parses stored before/after JSON. Master-code CRUD writes replacement rows into ClickHouse; create rejects blank event codes, while other field validation is absent.

### Gateways, executive dashboard, compliance, and red team

These use dedicated SQL constants and services:

- guardrail requests/KPI/latency use `quilr_alert_events` and related data;
- MCP metrics/table/agent/latency use `MCPGatewayTableProcessor`;
- executive dashboard runs multiple independent row queries, including asynchronous fan-out via the configured executor;
- compliance returns table/widget/drilldown data;
- red team returns summaries, results, category/technique heatmaps, and totals.

### Cache and synchronization

Application/tenant/global app details are loaded from graph and ClickHouse into Redis-backed caches. Spring schedulers refresh them and process queued app IDs with a distributed lock. Tenant feature checks call identity’s tenant API using an internal secret and are configured fail-closed in YAML.

## Frontend feature implementation notes

### Route and shell behavior

- Next permanently redirects section roots to default tabs.
- `AppLayout` bypasses sidebar/permissions for public and self-service pages.
- All other pages receive the admin sidebar, a global error boundary, control-moved notice, notification bell, and permission guard.
- Many routes are dynamic dispatch pages whose tab/data-type component selects the concrete feature.

### Query clients

The app has three overlapping request abstractions:

1. `AxiosService` singleton with auth/tenant/subscriber interceptors.
2. `FetchService`/`fetchAPI` with similar refresh behavior.
3. `ServerApiService`, which has no external consumer found and is a dead-code candidate.

Feature-specific fetchers wrap these for SWR. Local development can route LLM Gateway, MCP Gateway, and detection-model traffic directly to configured localhost services.

### Feature flags

| Flag | Value | Effect visible in consumers |
| --- | --- | --- |
| `ENABLE_DETECTION_MODELS_ADVERSARIAL_AND_INSIDER_TABS` | `false` | hides two detection tabs |
| `ENABLE_DATA_INSIGHTS_TAB` | `false` | hides data insights |
| `ENABLE_EXECUTIVE_DASHBOARD_IN_INSIGHTS` | `false` | hides executive dashboard selection |
| `ENABLE_DECISION_ENGINE_IN_SIDEBAR` | `false` | route remains, sidebar entry hidden |
| `ENABLE_NEW_USER_DRAWER_IN_USERS` | `true` | enables new user drawer |
| `ENABLE_LENS_IN_SIDEBAR` | `false` | route remains, sidebar entry hidden |
| `ENABLE_EVENTS_PROMPTS_IN_USER_DRAWER` | `false` | hides two drawer sections |

## Detailed traceability

- Every query-builder operation: [HTTP reference](api/quilr-query-builder-http.md)
- Every frontend route: [App Router reference](routes/quilr-web-app-router.md)
- Frontend/query-builder matching: [cross-repository matrix](cross-repository/frontend-to-query-builder.md)
- Every backend declaration: [backend symbol reference](07-symbol-reference/backend/README.md)
- Every frontend declaration/module: [frontend symbol reference](07-symbol-reference/frontend/README.md)

## Runtime verification status by feature boundary

| Feature/boundary | Executed evidence | Result | Remaining boundary |
| --- | --- | --- | --- |
| web shell/login | production build/start plus real-browser `/en/login` navigation | page rendered and hydrated; title/heading verified | identity-provider login was unavailable |
| web protected routing | HTTP/browser navigation with absent, parseable, malformed, and self-service cookie fixtures | redirect/admission/failure behavior matched `src/proxy.ts`; malformed JSON produced 500 | real issued session and permission retrieval |
| web route handlers | live `POST /api/cookie` and `POST /api/download-mdm-file` fixtures | success and malformed/upstream-failure paths verified | deployment network policy/proxy header changes |
| query-builder registration | executable JAR start plus Actuator mappings | all 141 target mappings and 26 controllers registered | none for target controller registration |
| query-builder request filter/decoder | `/qb/health`, malformed bearer, internal-header, CORS, and Java harness cases | filter order and primary accept/reject paths verified | real issuer token and deployed gateway policy |
| authorization library | aspect and REST PDP harness | allow/deny/missing-context/fail-open/fail-closed behavior verified | real deployed PDP decisions |
| ClickHouse-backed features | selected endpoints reached with ClickHouse unavailable | failure propagation/wrapper behavior verified | successful data-backed results require a live schema and fixtures |
| Redis queue/synchronization | live Redis sequential and barrier-synchronized concurrent tests | normal drain plus duplicate delivery under two consumers verified | long-running scheduler/lock-expiry behavior |
| BFF/ingress query-builder routing | pinned source plus live BFF echo upstream | prefix, query, body, and header behavior verified | which routing implementation a live environment selects |
| component system | source build/package and peer-provisioned Jest run | package built; 12/18 suites and 90/113 tests passed | six failing suites require component-repository remediation |

The runtime matrix intentionally distinguishes a feature's executed development path from an end-to-end production claim. A successful target build or HTTP route registration does not imply that external identity, data, and service contracts were exercised.
