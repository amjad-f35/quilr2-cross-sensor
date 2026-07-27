# Current Quilr 1 state

## Verdict

**Verified:** Quilr 1 already presents a broad estate assembled from browser, endpoint, LLM Gateway, MCP Gateway, ClickHouse, Neo4j, Redis, PostgreSQL, and external services. It does not establish one repository-wide canonical entity/relationship/event contract. The web app often composes source-specific APIs; query-builder often enriches ClickHouse rows at request time using static mappings, Redis, Neo4j, or external data. [Q1-FEATURE](../../quilr-platform-analysis/05-feature-catalog.md) documents the implemented composite features; [Q1-TRACE](../../quilr-platform-analysis/cross-repository/frontend-to-query-builder.md) traces 120 frontend occurrences into 77 normalized route combinations; [Q1-STORE](../../quilr-platform-analysis/09-data-models-and-storage.md) records the store roles and consistency gaps.

**Contradiction:** an inventory row, a product, a surface, an account, a model, an agent, and an observation are frequently presented in adjacent or shared UI/data structures without a stable, explicit ontology. The `source` field selects source-specific interaction strategies but has no global canonical definition. Neo4j is used for enrichment and synchronization, while its complete relationship authority and warehouse drift remain unresolved.

## Current runtime path

```text
quilr-web page/component
→ feature-specific SWR/Axios/fetch wrapper
→ /bff/<service prefix>
→ ingress/BFF prefix stripping
→ query-builder or another service
→ controller
→ service / named processor / DAO
→ ClickHouse + optional Redis/Neo4j/PostgreSQL/external API
→ ServiceResponse/DTO/map
→ React composition and source-specific presentation
```

**Verified:** the query-builder exposes 141 operations across 26 controllers; the web app has 112 pages. ClickHouse is the dominant operational/analytical store. PostgreSQL holds the local whitelisting entity, Redis holds caches/sets/locks/markers, and Neo4j supplies graph/master data for selected features. [Q1-EXEC](../../quilr-platform-analysis/02-executive-overview.md) and [Q1-API](../../quilr-platform-analysis/api/quilr-query-builder-http.md) provide exact routes and symbols.

## Feature trace

| Product feature | Frontend → API | Backend/store reality | Canonicality and verdict |
| --- | --- | --- | --- |
| AI applications | `/[lng]/apps` → apps tables/drawers → `/aiapps/query`, `/aiapps/table/data`, `/aiapps/app_settings/update` → `AIAppsController`/processors | `apps_db`, `apps_db_cache`, `app_tenant_settings`, `app_tenant_settings_cache`, Redis and graph enrichment | Sensor/master rows with no universal identity ledger. **Backfill into canonical model; keep settings behind adapter.** |
| AI asset inventory | `/[lng]/ai-assets/[tabs]` and source-specific components → `/ai-assets/v1/assets/list|widget|distribution|trend` plus endpoint/browser/LLM/MCP/compliance calls | `AIAssetController` → service → `AssetInventoryDao` → `quilr_asset_inventory`; UI also calls external source APIs | Composite feature but row identity is warehouse-specific and frontend remains multi-source. **Replace read path with canonical estate API.** |
| Users | `/[lng]/users` → `/aiusers/query`, `/aiusers/table/data`, `/aiusers/smartgroups` | `users`, summary tables, `smart_groups`, Redis/graph synchronization | User records and membership are not guaranteed IdP-canonical/bitemporal. **Backfill; add IdP subject registry.** |
| Accounts | `/accounts` → `/aiaccounts/query`, `/aiaccounts/table/data` | account/application interaction projections plus graph data | Product/account/user-account semantics can mix. **Refactor into Application Account and Connected Account.** |
| Agents | AI Axis agent pages → `/mcp/gateway/agents/data`, KPI/latency/table calls; other management APIs are external | MCP ClickHouse queries and external MCP management service | Analytical agent rows are not stable agent definitions/versions/deployments/runs. **Adapter now; replace identity model.** |
| Models | AI asset/gateway settings and LLM Gateway external APIs; gateway analytics via `/guardrails/v1/*` | External gateway configuration plus ClickHouse request logs | Provider/model/route/deployment concepts are not uniformly separated. **Normalize gateway observations and provider-qualified IDs.** |
| Endpoints/devices | endpoint settings/inventory → `/device/user/info`, `/endpoint/sync/*`, external endpoint/DLP APIs | `ep_user_devices`, Neo4j sync, endpoint service | Useful device/application evidence but not canonical device/install history. **Backfill behind endpoint adapter.** |
| Browser activity | browser extension pages and AI asset browser interaction tables → `/aiconversations/*`, `/interactions/*`, browser service APIs | `quilr_interaction_logs`, `visit_app_logs`, `enriched_events`, BES/Kafka/DWH | Strong activity evidence; application/account/model gaps remain. **Normalize to observations/events.** |
| LLM Gateway | gateway settings/logs/usage/red team → external `guardrails/*` plus query-builder `/guardrails/v1/*` | LLM gateway SQLite/NATS/ClickHouse and query-builder analytics | Model invocation/DLP/usage data are rich but not canonical across direct/browser/agent use. **Build LLM adapter and event materializer.** |
| MCP Gateway | settings/integrations UI → external MCP management APIs; query-builder `/mcp/gateway/*` for analytics | external MCP source plus ClickHouse projections | Native source contract absent. **Keep compatibility adapter; do not claim authoritative tool/server identity until contract is supplied.** |
| Interactions | user/app drawers and explorer → `/interactions/simple/query`, chat, fields, validation, stats; legacy `/aiconversations/*`, `/quilly/interactions/*` | source-specific strategies over `quilr_interaction_logs`, `quilly_interactions`, `quilly_summaries`, enriched rows | `source` is strategy-specific; request-time enrichment and duplicate event risk. **Move to canonical event API.** |
| Findings | `/[lng]/findings/[dataType]` → `/findings/*`, `/status-events/*`, device/app/browser lookups | `quilr_alert_events`, raw/action/status/outcome tables, static/graph name mappings, separate master/drilldown writes | Events/alerts/status are mixed; no root-cause cross-sensor dedup guarantee. **Migrate eligible rows as signals and rebuild findings.** |
| Status workflow | finding/status pages → summary/drilldown/filter/resolve APIs | `quilr_status_event_master`, `quilr_status_event_drilldown`; item-by-item writes can partially succeed | Useful workflow state but split consistency and unclear canonical state machine. **Compatibility projection over canonical finding workflow.** |
| Compliance | app drilldowns → `/compliance/*` and external compliance/guardrail services | `quilr_compliance_events`, `quilr_compliance`, `quilr_compliance_scores`, type tables, `rai_policy_details` | Mixes policy source and calculated scores. **Separate Policy/Control from compliance metrics.** |
| Audit | `/audit-log`, `/exports` → `/v1/audit/logs/*`, export services | `quilr_audit_logs`, `audit_logs_master_codes`, external audit/Kafka | Useful history but can depend on mutable current graph/state. **Backfill as audit events with immutable evidence/version links.** |
| Executive/adoption | home/insights → `/qb/query`, `/executive/dashboard/*`, AI asset trend/distribution | named processors and asynchronous ClickHouse queries; summary tables | Metrics can count source rows instead of canonical entities and lack coverage denominators. **Recompute from canonical IDs/events.** |
| Cost/usage | LLM gateway usage screens and assorted dashboard queries | gateway usage/token/provider records; exact billing integration incomplete | Available usage, partial cost; owner/outcome allocation incomplete. **Canonical cost records plus rate-card/billing version.** |

## Required table audit and target disposition

| Current object | Actual current role | Main defect | Target |
| --- | --- | --- | --- |
| `quilr_asset_inventory` | AI asset inventory warehouse rows | No observation/merge ledger; DTO/DAO identity is table-specific | Backfill source observations; replace as authority |
| `apps_db` | Application master/detail data | Global product and tenant state can be conflated | Seed catalog and tenant observations |
| `apps_db_cache` | Cached application data | Cache can appear source-like | Cache only; rebuild |
| `app_tenant_settings` | Per-tenant application settings | App ID depends on current app model; limited history | Tenant Application governance evidence |
| `app_tenant_settings_cache` | Settings cache | Not authority | Replace with projection cache |
| `app_process_info` | Process/application mapping | Path/name may be weak identity | Surface/install/process identifier evidence |
| `quilr_idp_apps` | IdP application records | External authority/schema not complete | IdP observation adapter |
| `users` | Warehouse user data | Stable IdP subject not guaranteed | Human User backfill |
| `smart_groups` | Smart-group state | Platform-derived and IdP groups not separated | Group subtype + membership relationships |
| `user_app_approvals` | Approval/status records | Decision/policy/evidence version not universal | Approval/Decision event backfill |
| `quilr_tenant_action_rel` | Tenant/action relationship data | Semantics/authority require confirmation | Observation until resolved |
| `quilr_interaction_logs` | Interaction events | Source-specific schema and identity | Canonical events |
| `quilly_interactions` | Quill-y interaction records | Product-specific fields | Canonical event + raw evidence |
| `quilly_summaries` | Summaries | Projection, not primary evidence | Analytical projection only |
| `visit_app_logs` | Application visit/usage | App/user aliases unresolved | `ai.application.used` events |
| `enriched_events` | Enriched event records | Enrichment version/provenance not universal | Observation/canonical event with lineage |
| `ep_user_devices` | Endpoint user/device data | Current row, incomplete history/authority | Device/user relationship backfill |
| Alert/finding tables | Alerts, outcomes, actions, status | Sensor detections can become product findings; duplicate root causes | Finding signals; selectively migrate findings |
| Status-event tables | Open/resolved master/drilldown | Non-transactional split writes | Compatibility projection |
| Audit tables | Audit rows/master codes | Historical context may use mutable state | Canonical audit/evidence events |
| Compliance tables | Scores/events/details | Policy/config/calculation mixed | Policy entities + metrics/events |
| Red-team tables | Test result rows | Campaign/result/finding boundaries incomplete | Security-test events and evidence |
| Summary/materialized tables | User/group/department metrics | Potential source-level double counting | Recompute on canonical grain |
| Neo4j | Graph/master enrichment and sync source | Authority, constraints, bitemporal history, and drift unresolved | Rebuildable typed projection from relationship ledger |
| Redis | Caches, queues, locks, markers | TTL/config mismatch; non-atomic queue; markers can suppress repair | Cache/coordination only; durable outbox/work ledger elsewhere |

The row-level migration decisions are in [current-to-target.csv](matrices/current-to-target.csv).

## Current integrity properties

| Property | Current evidence | Verdict |
| --- | --- | --- |
| Stable canonical ID | Table/API specific; endpoint has partial backend `canonical_id` | **Incomplete** |
| Source observations preserved | Some raw/enriched/log tables exist; no universal contract | **Incomplete** |
| Duplicate resolution | Endpoint app-name resolution and catalog/cache mappings exist; no repository-wide reversible resolver | **Replace** |
| Aliases | Scattered in app/domain/process/static mappings | **Backfill into alias registry** |
| Relationship authority/history | Neo4j and warehouse relations exist; authority/history unresolved | **Refactor** |
| Event replay | Table-specific; raw evidence and schema versions not universal | **Introduce observation/event contracts** |
| Historical state | Status/audit/events partly preserve state; entity/relationship field history incomplete | **Introduce bitemporal ledger** |
| Explainability | Selected policy/finding fields exist; mutable/static enrichment remains | **Refactor** |
| Staleness/expiry | Source-specific TTLs, heartbeats, caches, or none | **Centralize coverage/freshness** |
| Unknown vs absent | Usually not modeled explicitly | **Introduce coverage-aware tri-state** |
| Tenant isolation | Tenant/subscriber keys are widespread but source/header/cache semantics vary | **Require on every key/index/event** |

## Reuse verdict

- **Reuse unchanged:** validated provider-specific DLP/model adapters; ClickHouse analytical query capabilities; existing app/process/domain catalog facts as non-authoritative seeds.
- **Reuse behind a new adapter:** browser/native/BES ingestion; endpoint sync; LLM gateway events; MCP analytics; IdP/connector records; legacy interactions/audit/red-team tables.
- **Refactor:** findings/status workflow, graph synchronization, app settings/approvals, policy/compliance, caches/queues.
- **Backfill:** inventory, apps, users, devices, interactions, enriched events, alerts, status, audit, compliance, red-team, and summaries.
- **Deprecate:** frontend multi-source identity joins, direct source tabs as separate inventories, source-row metrics, cache-as-authority paths.
- **Replace:** `quilr_asset_inventory` as identity authority, untyped/current-only graph authority, source-specific finding materialization, and request-time executive aggregation where canonical materialization is required.
