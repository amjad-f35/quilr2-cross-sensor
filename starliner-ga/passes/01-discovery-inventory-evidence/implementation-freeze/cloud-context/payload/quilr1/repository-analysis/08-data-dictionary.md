# Repository-wide data dictionary

This dictionary records the data points that cross modules, persistence systems, or trust boundaries. Exact Java and TypeScript field declarations remain searchable in the generated [backend](07-symbol-reference/backend/README.md) and [frontend](07-symbol-reference/frontend/README.md) references. The descriptions below add origin, consumer, lifecycle, validation, and sensitivity.

## Request identity and tenancy

| Data point | Type / representation | Origin and consumers | Validation, default, and lifecycle | Trust / sensitivity |
| --- | --- | --- | --- | --- |
| `Authorization` | HTTP header, normally `Bearer …` | Frontend `AxiosService` reads the auth cookie and attaches its `token`; backend resolved `ai.quilr.jwtdecoder.filter.Decoder` receives the request before Spring basic authentication | The frontend does not validate JWT structure. Supporting source/harness verify RSA/SHA-512 signature validation, optional `exp` enforcement when present, Redis revocation, selected-tenant validation, internal-header bypass configuration, and context cleanup. `iss`/`aud` are not required by this library. Missing server-side frontend cookie access can throw. | Credential crossing browser → Next.js/backend. Real issuer claim population remains external. |
| `subscriberid` / subscriber ID | HTTP header and string | Frontend API clients derive it from the user/cookie; backend `RequestFilter` first prefers `UserContext.getSubscriberId()` and otherwise reads a raw request header | No local canonical syntax validation was found. It is placed in request context/MDC and used in cache keys and SQL parameters. | Tenant partition key; crosses an untrusted HTTP boundary when decoder context is absent. |
| tenant ID | Commonly `tenant-id`/`tenantid`, string | Frontend selects the first tenant from the authenticated user for many calls; backend `RequestFilter` prefers the selected tenant from external `UserContext` and otherwise accepts a header | No local UUID/format validation is applied globally. Individual DTOs may require a nonblank value. Cleared from MDC after the request. | Primary tenant-isolation key. **Potential issue requiring validation:** fallback raw headers can influence tenant context; actual gateway/decoder guarantees are external. |
| user ID / user email | String fields and headers/context | Authentication response, `UserContext`, URL/query parameters, filters, ClickHouse rows, audit metadata | Validation varies by endpoint. Many query processors pass the value as a bound SQL parameter; several frontend components only test presence. | Personal/identity data; sometimes used as an audit actor or filter. |
| `traceId` | HTTP response/request-context value | `RequestFilter` uses an incoming trace header when present or generates a UUID, writes MDC and a response header | No format validation; request-scoped; removed in `finally` | Correlation identifier, not an authorization decision input in local code. |
| `requestId` | DTO/cache-key string | Query requests, interaction requests, logging/caching | Endpoint-specific; interaction cache keys include subscriber, tenant, and request identity | Correlation/cache identity. Collision behavior depends on caller-supplied values where not generated. |

## Browser authentication and client state

| Data point | Representation | Writers | Readers / lifecycle | Handling when absent or invalid |
| --- | --- | --- | --- | --- |
| auth cookie name | `NEXT_PUBLIC_AUTH_COOKIE` / `AUTH_COOKIE` configuration | `useLogin`, OAuth success utilities, and `/api/cookie` | `authMiddleware`, `HydrateAuth`, Axios utilities, logout; OAuth flow applies a 12-hour `maxAge` | Middleware redirects unauthenticated protected routes. JSON parsing in `authMiddleware` is not caught, so malformed JSON can fail the proxy path. |
| auth cookie value | JSON object containing at least access `token`, refresh token/user data as returned by auth flows | Browser-side cookie library and the Next route handler | Parsed by browser code and server request utilities | Local writers do not set `HttpOnly`, `Secure`, or `SameSite`. Because ordinary JavaScript reads it, an XSS would be able to access it. |
| external-auth cookie | `NEXT_PUBLIC_EXT_AUTH_COOKIE` | External authentication/integration paths | Route and auth utilities | Both Kubernetes ConfigMaps define this key twice; YAML duplicate-key resolution depends on the parser, normally leaving the later value. |
| roles cookie | JSON/string browser cookie | `useLogin` | UI authorization/routing consumers | Client-controlled presentation state; no evidence it is accepted as backend authorization proof. |
| permission map | Serialized permission object in `sessionStorage` | `fetchPermissionsCookie`, login/OAuth flows | `PermissionGuard`, route evaluation, hooks; cleared on explicit logout | Missing/loading state is fail-open in `hasResource` and any-of helpers, while exact `hasPermission` is fail-closed. It is UI state, not a server security boundary. |
| authenticated user | React/Zustand-like client store state and cookie content | login, OAuth, `HydrateAuth`, current-user hook | page components, API header derivation, PostHog identity | Some API utilities use the first tenant entry. `useLogout` obtains a setter but does not call it, so in-memory clearing relies on navigation/reload behavior. |
| PostHog identity/properties | Browser analytics state | `instrumentation-client.ts`, login/OAuth flows | PostHog client on selected Quilr hostnames | Header/JWT/query-like properties are sanitized and nested objects are bounded to four levels. OAuth replay/pageview is deliberately suppressed. |

## Common query-builder transport fields

| Field / family | Type and allowed form | Meaning and consumers | Validation / invalid behavior |
| --- | --- | --- | --- |
| `queryName` / processor name | String | `QueryProcessorFactory` key selecting a Spring processor bean by `getName()` | Unknown names throw. Duplicate processor names overwrite earlier entries when the factory builds its `HashMap`; no duplicate detector exists. |
| time range | Date/time strings or request range object | Widget, findings, interactions, executive, and query processors build ClickHouse predicates | `WidgetsController` normalizes the request range before dispatch. Validation varies elsewhere and some SQL helpers accept raw strings. |
| `page` | Integer, commonly default `0` | Status-event and table pagination | Status-event code defaults it but does not clamp a negative value. |
| `pageSize` | Integer, status-event default `50`, nominal maximum `100` | Query `LIMIT` and offset calculation | Upper bound is applied in status events; a negative value is not clamped and can reach SQL construction. Other table APIs have their own limits. |
| `sortBy`, `orderBy`, `sortOrder` | String / enum-like string | Table processors and asset inventory | Interaction advanced search uses a whitelist. `AssetInventoryDao` concatenates requested sort/search field identifiers without a visible whitelist. Values are parameterized. |
| `filters` | Map/list of filter objects | Query processor-specific filtering | Advanced interactions validate supported fields/operators. Other processors interpret fields independently. Unknown asset-inventory filter keys can become SQL identifiers. |
| `search` / `searchFields` | String plus list of field identifiers | Asset inventory and table search | Search values are parameters; asset-inventory field names are concatenated into SQL. Empty lists alter whether a predicate is added. |
| `source` | Enum-like string | Interaction strategy selection (`browser extension`, endpoint agent, LLM gateway, MCP gateway) | Strategy selection applies source-specific predicates/enrichment. Accepted serialized forms are defined in the involved DTO/strategy code; no repository-global enum is enforced. |
| response `status`, `message`, `data` | `ServiceResponse`-style wrapper | Most controllers/processors | Several abstract processor defaults return empty `ServiceResponse` instances rather than an unsupported-operation error. HTTP status mapping is controller-specific. |

## Status-event domain

| Data point | Meaning | Source → consumers | Validation and lifecycle |
| --- | --- | --- | --- |
| event status | State stored in `quilr_status_event_master`; default query status is `open` | Summary/list filters and bulk resolution | Bulk resolution changes master and drilldown state item by item. There is no cross-table transaction in the repository. |
| event ID / behavior ID | Master/drilldown correlation identifier | Status request DTOs, query predicates, bulk resolve results | Drilldown identifiers use regex families `BID_XX` and `UCXXX` in the relevant DTO validation. |
| resolution items | `BulkResolveRequest` list | `StatusEventServiceImpl` loops through items | Partial success is returned when individual items fail; prior writes are not rolled back. |
| summary filters | `StatusEventSummaryRequest` | Controller → service → repository | This summary DTO lacks the Bean Validation annotations applied to the drilldown request, so structurally invalid values can travel farther. |
| filter values | `StatusEventFilterValues` response | ClickHouse distinct-value queries → frontend controls | Values are derived from warehouse contents; no separate canonical registry exists in these repositories. |

## Findings, masking, and approval data

| Data point | Representation | Lifecycle | Sensitivity / boundary |
| --- | --- | --- | --- |
| masked conversation attributes | JSON/object fields including `masked_attributes` | Read from conversation data; unmask request invokes the mask/decryption service; unmasked result is returned and an audit record is created | Sensitive AI conversation content. A null `masked_attributes` value can cause an exception in the unmask flow. |
| encrypted token | Text beginning `v2:` for the current format; legacy ciphertext has no prefix | `EncryptionService` encrypts with AES-256-GCM, random 12-byte IV, 128-bit tag, then Base64; decrypt accepts the current and a legacy AES/ECB form | Cryptographic secret depends on `MASTER_ENCRYPTION_KEY`. Individual inline token failures leave the original token unchanged; attribute-level decryption can throw. |
| whitelisted behavior | PostgreSQL JPA entity `TenantAppWhitelistedBehaviour` with embedded tenant/app/behavior identity | Created/deleted/read by password-whitelisting service/controller operations | Migration source defines `public.tenant_app_whitelisted_behaviours`, composite primary key `(tenant, app_id, behaviour_id)`, and app/tenant/update-time indexes. Four operations carry `@RequiresPermission`. |
| user-app approval | ClickHouse-backed approval/status data | Controller/service/processors update and read approval state | Update controller carries `@RequiresPermission(APP_MANAGEMENT, USER, UPDATE)`; the supporting aspect/PDP client contract is dynamically verified, while the live PDP decision data remains external. |
| smart-group membership/operation | Operation string and member sets | AI user smart-group update computes additions/removals and writes warehouse records | Unknown operation strings are not rejected: the code can insert an active record, compute removals, and omit audit behavior expected for known branches. JVM `synchronized` does not coordinate multiple service replicas. |
| master audit code | code, description/type fields in `audit_logs_master_codes` | `MasterCodeController` CRUD → audit repository/ClickHouse | Event-code validation exists, but the controller has no local method permission annotation. |

## AI asset inventory

| Field family | Meaning and storage | Validation / transformation |
| --- | --- | --- |
| asset identity | Rows in `quilr_asset_inventory`; represented by `AssetInventory`/DTO classes | DAO maps JDBC columns manually. The POJO is not a JPA entity. |
| metadata JSON | JSON-like text/objects on an asset row | `putJson` attempts parsing and silently omits malformed JSON rather than failing the row. |
| search/filter/sort field names | Client-supplied lists/maps | Concatenated into query syntax without a local allowlist. **Potential issue requiring validation:** SQL identifier injection is possible if an upstream layer does not constrain names. |
| page/count | Query pagination and total | DAO issues query/count operations; consistency is that of separate warehouse reads, not a transaction snapshot. |

## Cache keys, locks, and schedulers

| Name / pattern | Store | Writers and readers | Expiration / failure behavior |
| --- | --- | --- | --- |
| interaction caches | Redisson caches; four cache names in `InteractionsCacheConfig` | Interaction service/processors | Three-minute TTL; key includes subscriber, tenant, and request. Cache serialization/configuration comes from Redisson. |
| application/settings caches | ClickHouse cache tables and/or Redis paths depending on subsystem | app/settings sync services and processors | `application.yml` declares `redis.tenant-app-settings-ttl` and `redis.global-app-details-ttl`, but local consumers read `cache.*`; environment overrides using the YAML names do not bind those consumers. |
| sync queue | Redis set/list abstractions in app sync | Scheduler enqueues; worker pops a batch before processing | Failed popped items are not requeued locally. |
| distributed lock key | `<operation>:lock` | scheduler/bootstrap lock helpers | Acquisition failure skips work; timeout from configuration. |
| last-run key | `<operation>:last_run` | scheduler lock helpers | Timestamp used to decide eligibility; behavior is independent of a transaction with the actual job. |
| app-admin processed marker | Redis marker | app-admin synchronization | No TTL is applied. Per-row errors are caught, but the marker is still written after processing. |
| master bootstrap CAS state | Redis compare-and-set/marker | `MasterDataScheduler` startup bootstrap | Marker changes before asynchronous work completes. A failed async bootstrap is not automatically retried in that process. |

## Warehouse table and resource names

These names are **Verified** string identifiers in target query code or runtime resources. Pinned supporting migration trees provide cluster, SaaS, and PaaS ClickHouse DDL for many of them, but not every target string maps unambiguously to one deployed profile/version. Source DDL is not proof that every table exists in every live environment.

| Domain | Referenced tables/resources |
| --- | --- |
| alerts/findings/status | `quilr_alert_events`, `raw_alert_responses`, `quilr_alert_action`, `quilr_alert_status`, `quilr_status_event_master`, `quilr_status_event_drilldown`, `quilr_action_master`, `quilr_alert_outcomes`, `alert_insights` |
| applications/settings | `apps_db`, `apps_db_cache`, `app_tenant_settings`, `app_tenant_settings_cache`, `app_process_info`, `quilr_idp_apps`, `app_admin_users` |
| users/groups/approvals | `users`, `smart_groups`, `user_app_approvals`, `quilr_tenant_action_rel` |
| interactions/visits | `quilr_interaction_logs`, `quilly_interactions`, `quilly_summaries`, `visit_app_logs`, `enriched_events` |
| assets/devices | `quilr_asset_inventory`, `ep_user_devices` |
| compliance/policy | `quilr_compliance_events`, `quilr_compliance`, `quilr_compliance_scores`, compliance type-specific tables, `rai_policy_details` |
| password findings | `cred_shared_status_tracker`, `week_password_status_tracker`, `password_reuse_status_tracker`, `compromised_password_status_tracker` |
| audit/reference | `quilr_audit_logs`, `audit_logs_master_codes`, `quilr_action_type_master` |
| red teaming | `redteaming_results` |
| summary materializations | `aiuser_user_insights_summary`, `aiuser_smartgroup_insights_summary`, `aiuser_department_insights_summary` |

`db/dashboard-qry.sql` additionally references `alerts_processed_events`. `CHLatestTest.main` references a demonstration table named `users_with_json`; it is a manual/example executable, not a deployed migration.

## URLs, ports, limits, and time values

| Data point | Verified behavior |
| --- | --- |
| backend application port | `AI_AXIS_PORT`, default `8052`; backend Docker image exposes `8052` |
| frontend application port | Next.js `3000`; Docker and Kubernetes service/deployment use `3000` |
| ClickHouse operations row limit | `MAX_RESULT_ROWS = 10000`; select execution warns/checks after the query has already produced results rather than enforcing SQL `LIMIT` |
| dashboard executor | core 8, maximum 32, queue 200, caller-runs rejection; graceful wait 30 seconds |
| interaction cache TTL | three minutes |
| OAuth cookie age | 12 hours in the OAuth success path |
| PostHog sanitizer depth | four nested levels |
| status page defaults | page `0`, page size `50`, maximum `100`, status `open` |

## Data resolved from supporting sources

- `public.ai_conv_filters`: bigint identity; required subscriber, tenant, and user email; nullable app/account/prompt/model filter strings; created/updated timestamps; unique `(subscriber_id, tenant_id, user_email)`.
- `public.tenant_app_whitelisted_behaviours`: tenant/app/behavior identity, updater, update time, composite primary key, and three lookup/time indexes.
- Decoder claims/context and authorization decision inputs are documented from pinned dependency source and dynamic tests in [dynamic verification](22-dynamic-verification.md).
- ClickHouse migration trees now provide source-controlled schemas/engines/order/partition clauses for many referenced tables.

## Data still not defined by available evidence

- **Unresolved:** live ClickHouse migration profile/version, drift, grants, row policies, data volume, and query plans.
- **Unresolved:** live Neo4j constraints/indexes and authoritative relationship model.
- **Unresolved:** production cookie attributes may be imposed by an external proxy, but the application writers in this repository do not set them.
- **Unresolved:** current production secrets and per-environment values come from live systems outside source control.
