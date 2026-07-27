# Current-to-target traceability

The legacy-object mapping is [current-to-target.csv](matrices/current-to-target.csv). The exhaustive target mapping is [target-traceability.csv](matrices/target-traceability.csv): one row for every canonical entity, relationship, event, finding, and metric.

## Capability mapping

| Target capability | Current source | Current quality | Reuse plan | Migration work |
| --- | --- | --- | --- | --- |
| Source observations | Browser/BES events; endpoint sync; LLM NATS/logs; legacy tables | Rich but source-specific; no common raw/evidence contract | Adapters | Raw capture, schema registry, IDs, provenance, replay |
| Product catalog | `apps_db`, static mappings, domains/process info | Useful seeds; authority/versioning unclear | Catalog seed | Stewardship, aliases, validity, catalog release |
| Canonical applications | `quilr_asset_inventory`, apps/settings/IdP/visits | Fragmented row identity | Backfill | Resolve sources; separate product/surface/tenant/account |
| Canonical users/accounts | `users`, Persona, gateway users/API keys, graph, connectors | Email/account semantics vary | Backfill/adapters | IdP subject/account provider IDs; temporal type |
| Agents/models | endpoint typed artifacts, LLM gateway, MCP analytics/UI | Config/activity layers mixed; agent runs weak | Adapters | Definition/version/deployment/run and route/deployment IDs |
| MCP/tools | endpoint discovery; external MCP UI/APIs; QB analytics | Endpoint fields partial; source repo absent | Compatibility only | Native contract, server/tool schema identity, call/effect events |
| Devices/runtime | BES heartbeats, endpoint context, `ep_user_devices` | Useful IDs/versions; current rows/history vary | Backfill/adapter | Device authority, installation/process lifecycle |
| Relationships | Endpoint raw/typed config, Neo4j, warehouse relations, activity | Endpoint discards raw edges; graph authority/history unresolved | Observation import | Typed bitemporal ledger and rebuildable projections |
| Canonical events | interaction/visit/enriched/gateway/endpoint tables/messages | Source schemas and duplicates | Backfill/adapters | Event envelope, correlation, event/source registry |
| Findings | alert/action/status/outcome tables and processors | Sensor/status-oriented; request-time enrichment | Signals + selective migration | Root-cause dedup, owner, close/reopen, evidence |
| Metrics | `/qb/query`, executive processors, summary tables, gateway analytics | Request-time/source-row risks | Validation baseline | Canonical grain/materializers/coverage |
| Evidence | Raw logs/content/rows/files exist in source-specific locations | Retention/integrity/access inconsistent | Conditional import | Immutable store, hashes, references, access/retention |
| Query/product | Current pages and 141 QB routes plus external APIs | Broad UX but source API mashups | Compatibility APIs | Unified estate/findings/events/coverage/resolution APIs |

## Frontend/API mashups to remove

- AI Assets source tabs and components that call endpoint/browser/LLM/MCP/compliance APIs and present a composite row without a canonical source record.
- Application/finding drawers that call several routes to reconstruct source, device, visitors, interactions, findings, and settings.
- Separate source findings pages whose rows represent sensor detections rather than correlated root causes.
- Executive/adoption widgets that issue named request-time queries over source-grain rows.
- MCP management/analytics UI joins that assume external IDs align with query-builder rows.

They are replaced with canonical list/detail/activity/finding/coverage APIs. Source filters remain.

## Request-time work to materialize

- application/user/account alias resolution;
- source coverage and last-seen;
- product/surface/account/model/agent/tool relationship summaries;
- finding evidence/name/severity/root-cause correlation;
- ownership and organization attribution at event time;
- canonical counts/trends;
- dependency impact;
- policy/enforcement coverage;
- cost attribution.

Request-time permission checks, user-selected filters, evidence authorization, and bounded ad hoc exploration remain appropriate.

## Tables that remain raw/backfill sources

`quilr_interaction_logs`, `quilly_interactions`, `visit_app_logs`, `enriched_events`, alert/action/outcome rows, compliance/red-team/audit events, gateway logs, endpoint activities, and source-specific configuration rows should remain source records or compatibility inputs. They are not deleted when canonical projections launch.

## IDs and aliases

- `quilr_asset_inventory` IDs, app IDs, user IDs, endpoint local UUIDs/canonical IDs, gateway request/context/API-key hashes, MCP external IDs, status/finding IDs, graph IDs, and connector/IdP IDs become source aliases.
- An alias record includes source, native type, tenant, validity, uniqueness scope, confidence, and evidence.
- Legacy API consumers can resolve aliases to canonical IDs; no legacy ID is assumed globally unique.

## Findings migration

Migrate:

- records with clear canonical root/affected entity;
- evidence references;
- deterministic dedup and condition;
- valid owner/status/history;
- explicit close/reopen interpretation.

Redesign:

- one row per sensor detection;
- static name/posture mapping without event-time version;
- non-actionable anomalies/metrics;
- status rows with no condition/evidence/owner/action;
- duplicates that represent one root cause.

## API compatibility

- Existing `/aiapps`, `/ai-assets`, `/findings`, `/status-events`, `/interactions`, `/guardrails`, and `/mcp/gateway` reads become compatibility façades over canonical projections in stages.
- Writes for app settings/approvals/status resolution are dual-written through a canonical command/outbox; legacy writes continue until parity.
- Mismatched routes such as frontend `/aiconversations/filters/app/users` and absent `/findings/kpi` are not carried forward as canonical contracts.
- Deprecation responses include replacement links and alias/canonical IDs.

## Store-role correction

| Current misuse/risk | Correction |
| --- | --- |
| ClickHouse rows as operational identity/current state | PostgreSQL canonical ledger; ClickHouse projection |
| Neo4j data as implicit master without authority/history | Typed projection from authoritative relationship ledger |
| Redis cache/marker/queue affecting lifecycle/completion truth | Cache/coordination only; durable work/outbox |
| Frontend as identity join layer | Unified backend materializations |
| Mutable current graph/cache used for historical audit | Event-time state/evidence versions |
