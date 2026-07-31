# API and interface reference

## Canonical exhaustive indexes

- [Query-builder HTTP operation matrix](api/quilr-query-builder-http.md): every verified Spring MVC operation, method/path, implementation symbol, input surface, permission annotation, and source line.
- [Frontend App Router matrix](routes/quilr-web-app-router.md): all 112 pages, 20 layouts, and two route-handler operations.
- [Frontend → query-builder trace](cross-repository/frontend-to-query-builder.md): every frontend syntax occurrence containing the query-builder base, normalized operation/path, matching backend implementation, or an explicit unresolved reason.
- [Frontend route-permission coverage](cross-repository/frontend-route-permission-coverage.md): every page evaluated against all 38 client route rules.

These generated matrices are the detailed endpoint-by-endpoint interface documentation. This chapter defines shared protocol behavior and explains the exceptional interfaces.

## Query-builder HTTP surface

**Verified:** 141 Spring MVC operations are mapped across 26 controllers at commit `c794c45a9c22b75f101c7c73da508d6e7870f97b`.

| Controller/domain family | Operations | Principal interface purpose |
| --- | ---: | --- |
| AI assets | 4 | asset list, adoption trend, distribution, metrics |
| audit log | 2 | search audit records and obtain correlation snapshots |
| audit master codes | 5 | reference-code CRUD |
| AI accounts | 3 | query, table, and user filter |
| AI applications | 8 | apps queries/tables/settings/visitors/categories/whitelist state |
| AI conversations | 7 | conversation/detection reads, filters, and unmask |
| prompt filters | 2 | app/user interaction filter data |
| AI users | 20 | analytics, tables, smart groups, manual sync, and Redis administration |
| ClickHouse operations | 2 | ad-hoc read and mutation SQL |
| compliance | 3 | summary/table/drilldown |
| DWH diagnostics | 9 | health, config, resource, database, Docker, CPU, and memory information |
| device | 1 | device/user information |
| endpoint sync | 3 | all/tenant/device graph-to-warehouse sync |
| executive dashboard | 4 | four dashboard rows |
| findings | 13 | KPIs, hero data, tables, filters, drilldowns, occurrences |
| graph sync | 1 | graph synchronization trigger |
| guardrails | 3 | KPI, timelines, and request table |
| interactions | 11 | simple/advanced/chat queries, filters, distinct values, stats |
| MCP gateway | 4 | KPI, trends, activity, agent data |
| non-AI applications | 1 | application table |
| Quilly interactions | 9 | interaction and summary views |
| status events | 6 | summary, drilldown/filter data, and resolution |
| user application approval | 7 | tenant/user app data, stats, update, cache |
| password whitelisting | 4 | weak/reuse/shared/compromised password whitelist operations |
| widgets | 3 | named dashboard query, policy query, tenant applications |
| red teaming | 6 | dashboard/run/category/results metrics |

### Authentication and authorization contract

1. `SecurityConfig` disables CSRF and Spring Security's default header writer.
2. The external `Decoder` filter is inserted before `BasicAuthenticationFilter`.
3. The local authorization rule is `.anyRequest().permitAll()`.
4. Seven operations carry `@RequiresPermission`: AI app settings update, conversation unmask, user-app approval update, and four password-whitelisting methods.
5. `RequestFilter` runs after basic authentication, derives tenant/subscriber/user context, creates a trace ID, sets response headers, and clears MDC in `finally`.

Decoder and authorization-library source plus 14 passing dynamic tests now resolve bearer verification, exclusions, request context, tenant selection, permission aspect, PDP client, and fail-open/fail-closed behavior. Gateway-enforced/deployed global policy remains external. “No method permission annotation” in the operation matrix does not prove anonymous deployed access.

### Shared headers and parameters

- Frontend Axios calls commonly send `Authorization`, tenant ID, `subscriberid`, and an ngrok bypass header.
- Controllers frequently accept `@RequestHeader Map<String,String>` and `@RequestParam Map<String,String>`, so the Java signature does not define a closed schema.
- Typed endpoints use DTOs; `@Valid` is shown in the canonical matrix. `AppVisitorsRequest` and status-event drilldown are examples with validation.
- `ServiceResponse<T>` is supplied by the common library. Its source and a passing serialization harness now verify the property names used in this reference.

### Status and errors

- Methods returning ordinary objects/wrappers normally receive Spring's default 2xx status when they complete.
- Controllers returning `ResponseEntity` choose status explicitly.
- Domain code variously throws runtime exceptions, returns an error-bearing wrapper, or catches and returns partial results.
- No complete local `@ControllerAdvice` was found. Dependency-provided error advice remains **Unresolved**.

### OpenAPI

Springdoc configuration supplies an API-docs path and package scanning through `application.yml`. Method `@Operation`/`@Tag` annotations decorate many controllers. The checked-in code does not include a generated OpenAPI document, so annotation descriptions are supporting evidence rather than a versioned contract.

## Query-dispatch public API

`GET /qb/query` is a multiplexed interface:

`WidgetsController.getDashboardResults` → `WidgetsServiceImpl` → `QueryProcessorFactory.getQueryProcessor(queryName)` → processor-specific `processQuery`

The processor registry is constructed from all injected `QueryProcessor` beans and keyed by `getName()`. Therefore the effective API operation vocabulary is the set of active processor names, not an enum in the controller. Exact processor declarations/bodies are in [processors.md](07-symbol-reference/backend/processors.md).

Failure behavior:

- unknown name: factory throws;
- duplicate names: later insertion into `HashMap` replaces an earlier bean without a startup error;
- several inherited defaults: empty `ServiceResponse`, not a standardized “unsupported” error.

## Next.js route handlers

### `POST /api/cookie`

**Implementation:** `quilr-web/src/app/api/cookie/route.ts::POST`

Verified request schema from the implementation:

```json
{
  "user": "AuthApiResponse object"
}
```

The string above denotes the verified TypeScript type name; it is not a literal valid request example.

Behavior:

1. Parses `request.json()` without a local catch.
2. If `data.user` is truthy, casts it to `AuthApiResponse`.
3. Returns status 200 with `{ user }`.
4. Sets the cookie named by `NEXT_PUBLIC_AUTH_COOKIE` to `JSON.stringify(user)` with only `path: "/"`.
5. If `user` is absent, returns a redirect to `/login`.

No authentication, authorization, runtime type validation, `HttpOnly`, `Secure`, or `SameSite` setting is present. A repository-wide active caller search found only commented references. **Dead-code candidate:** route currently has no confirmed in-repository active consumer. It remains reachable through HTTP.

Dynamic results:

- a body whose `user` matched the verified `AuthApiResponse` shape returned 200, echoed the object, and set the configured cookie with `Path=/`;
- `{}` returned 307 to `/login`;
- malformed JSON returned 500.

### `POST /api/download-mdm-file`

**Implementation:** `quilr-web/src/app/api/download-mdm-file/route.ts::POST`  
**Active caller:** the Intune/MDM form component identified in the generated frontend reference.

Verified body fields:

| Field | Type assumed by code | Use | Validation |
| --- | --- | --- | --- |
| `url` | fetch-compatible value, intended string | server-side `fetch(url)` | no scheme, host, IP, redirect, or allowlist validation |
| `fileName` | interpolated value, intended string | `Content-Disposition` filename | no CR/LF/quote sanitization |

It fetches the URL server-side, rejects non-2xx responses, buffers the entire body with `arrayBuffer()`, copies the upstream content type or uses `application/octet-stream`, and responds with an attachment. All caught failures become JSON `{ "error": "Failed to download file" }` with 500.

Dynamic results:

- a local HTTP fixture returned 200 with exact body, upstream `text/plain`, and `attachment; filename="fixture.txt"`;
- upstream 404 and malformed JSON both returned the fixed 500 JSON error.

**Potential issue requiring validation:** the application accepts a caller-selected URL and filename without local allowlisting/size controls. Actual deployed reachability and egress policy remain external.

## Frontend API clients

| Client | Base construction | Identity behavior | Error/retry behavior |
| --- | --- | --- | --- |
| Axios interceptor instance | `getAppConfig()` base plus `/bff`/domain paths | bearer token and first tenant/subscriber headers | 401 refresh path checks `_retry` but does not set it; 403 role handling; 406 cookie deletion/logout/reload |
| `FetchService` / `fetchAPI` | base URL plus requested path | manually attaches cookie-derived identity | method-specific; `put` omits JSON content type; error behavior differs from Axios |
| `ServerApiService` | server cookie and configured base URL | request-cookie token | no active consumer found; missing cookie can throw |
| SWR fetchers | wrappers around Axios/fetcher utilities | inherit wrapper headers | SWR cache/revalidation behavior is call-specific |

`getAppConfig()` returns `{ baseUrl: false }` in a server context. **Potential issue requiring validation:** module-scope clients initialized server-side can derive a string such as `https://false/bff`. Whether each such module executes server-side depends on the Next.js client/server boundary.

## Frontend-to-backend compatibility

The static cross-repository matcher found 120 syntax occurrences containing `quilr-query-builder`, collapsing to 77 normalized verb/path candidates. Seventy-one match a backend route.

The six unmatched items are not equally severe:

| Candidate | Classification |
| --- | --- |
| `/` in `aiGatewayConfig` | prefix/config value, not a concrete operation |
| `GET /aiconversations/filters/app/users` | **Contradiction:** no route at this backend commit; closest implemented user filter is `/aiconversations/filters/users` with POST |
| `/executive/dashboard` | type/base prefix, not a concrete call |
| `/findings/kpi` | **Contradiction / likely stale call:** no mapped route; a KPI mapping in findings code is commented while other KPI endpoints exist |
| `/status-events` | base constant used to construct concrete status paths |
| `POST /whitelisting/{url}` | dynamically appended path; concrete whitelist methods exist but the static suffix cannot be resolved from this expression alone |

Verb values marked `Unresolved` in the detailed trace arise when the string occurs as a component property/constant and the HTTP helper is not syntactically adjacent. They are not automatically mismatches.

Supporting routing source removes an earlier ambiguity: NGINX/BFF remove only the optional `/bff` and service-name prefixes. They do not rewrite `/aiconversations/filters/app/users` to `/aiconversations/filters/users` or synthesize `/findings/kpi`. The first two concrete candidates above are therefore verified target-commit contradictions.

## Browser navigation interface

Next.js App Router exposes 112 page entry points beneath `src/app/[lng]`, plus authentication, onboarding, integration OAuth, browser-extension, configuration, data-explorer, home, findings, settings, policy, and self-service hierarchies. The canonical route matrix preserves dynamic segments and route groups.

The request proxy order is:

`additional headers → OPTIONS special handling / path checks → internationalization → auth middleware`

The imported refresh-token middleware is not invoked. Auth middleware uses cookie presence and route classification for navigation. `PermissionGuard` then evaluates the 38 client permission rules for rendered application pages. Fifty-three pages have no matching rule and are admitted once a nonempty permission map exists.

## Other interfaces

| Interface | Evidence | Contract |
| --- | --- | --- |
| scheduler | nine active `@Scheduled` hooks within the 59 lifecycle hooks | cron/fixed-delay values documented in [entry points](04-runtime-entry-points.md) and [configuration](11-configuration-reference.md) |
| application lifecycle | `main`, `ApplicationReadyEvent`, `ContextClosedEvent`, `ApplicationRunner`, `@PostConstruct`, async methods | complete hook index in [quilr-query-builder-lifecycle.md](routes/quilr-query-builder-lifecycle.md) |
| SQL/file | `db/dashboard-qry.sql`, classpath JSON/CSV, static assets | no general file-upload filesystem; uploads/downloads mostly cross HTTP/service boundaries |
| environment | backend property placeholders and frontend `process.env` | complete normalized reference in [configuration](11-configuration-reference.md) |
| CLI/scripts | Maven, npm/Make, guardrail smoke script, Husky hooks | exact invocation and mutating behavior in [operations](15-build-deployment-and-operations.md) |
| WebSocket/gRPC/GraphQL/MCP protocol server | no local server implementation found | “MCP gateway” here is an HTTP/domain feature, not a locally implemented Model Context Protocol server |
| webhook/message consumer | no local mapped webhook or broker listener found | private Kafka dependencies alone are insufficient evidence of an active consumer |
