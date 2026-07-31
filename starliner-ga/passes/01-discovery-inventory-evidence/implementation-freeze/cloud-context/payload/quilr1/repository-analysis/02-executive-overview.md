# Executive overview

## What the two repositories are

**Verified:** `quilr-web` is the user-facing QuilrAI platform application. It is a private Next.js 16.2.6 / React 19.2 application with 112 App Router pages, two Next route handlers, a request proxy, client-side permission routing, browser-held authentication state, and feature areas for insights, findings, applications, users, AI assets, LLM/MCP gateways, controls, integrations, policies, exports, detection models, endpoint/browser-extension configuration, and self-service access.

**Verified:** `quilr-query-builder` is a private Java 21 / Spring Boot 3.5.14 service. Its 26 Spring MVC controllers expose 141 mapped operations. Most operations read or mutate ClickHouse data through repository, service, processor, and SQL-constant layers. Smaller parts use PostgreSQL/JPA, Redis/Redisson, Neo4j through a private client library, Kafka through a private client library, and one Feign HTTP client.

**Verified:** the web app reaches the query-builder through BFF-style paths containing `quilr-query-builder`. AST extraction found 120 source occurrences and 77 distinct normalized path/verb combinations. Seventy-one combinations match an operation at the pinned backend commit. See [frontend-to-query-builder traceability](cross-repository/frontend-to-query-builder.md).

## Actual architectural shape

The checked-in system is not a self-contained two-process product:

- `quilr-web` expects an external `/bff` gateway and many services besides query-builder: identity/auth, instance manager, guardrails/LLM Gateway, MCP Gateway, data definitions/config manager, browser extension, endpoint/DLP, compliance, policy engine, playbook, export, notification, and others represented by URL prefixes.
- `quilr-query-builder` depends on private Maven artifacts for data-warehouse, graph, Redis, Kafka, authorization, response envelopes, JWT decoding, and user context.
- Gateway routing, decoder/authorization internals, migration DDL, and target Helm/Jenkins boundaries were later resolved from pinned supporting repositories and dynamic traces. Current rendered infrastructure, live data/schema drift, and most external service contracts remain **Unresolved**.

## Dominant runtime flows

1. A browser request enters `src/proxy.ts`, where locale redirect logic runs before cookie-presence authentication routing.
2. The localized root layout creates Jotai providers and `AppLayout`.
3. Public and self-service routes bypass admin chrome. Other routes render the sidebar, error boundary, notification overlay, and client-side `PermissionGuard`.
4. API calls normally use a module-scope Axios singleton whose base is `https://<browser-host>/bff`. Its request interceptor reads the auth cookie and attaches bearer token, first tenant ID, subscriber ID, and an ngrok bypass header.
5. Query-builder requests pass through Spring’s filter chain. Spring’s authorization rule permits all requests, but an external `Decoder` filter is inserted before `BasicAuthenticationFilter`; repository-local `RequestFilter` then establishes trace/tenant/subscriber logging context and response headers.
6. Controllers delegate to services/processors. Query paths resolve a named processor, build parameterized or partly dynamic ClickHouse SQL, map rows, enrich/mask results, and return a private `ServiceResponse` envelope or `ResponseEntity`.

## High-confidence findings

### Build and runtime verification

- **Verified:** the unmodified query-builder POM builds under Java 21/Maven 3.9.11 and produces an executable Spring Boot JAR.
- **Verified:** web exact-version install, typecheck, lint, format check, production build, `next start`, HTTP probes, and browser hydration pass with the documented reconstructed private-component substitution.
- **Verified:** the live backend mapping count is 141 custom operations across 26 controllers, matching static extraction.
- **Verified:** the 17-test decoder/authorization/response/Redis harness passes.
- **Verified:** two concurrent Redis queue consumers both returned all 800 loaded members because selection and removal are non-atomic.
- **Verified:** exact green GitHub Actions runs for both pinned commits skipped the application build jobs; clean-build proof comes from this analysis, not those runs.
- **Verified:** supporting ingress/BFF source and a live BFF echo trace resolve service-prefix stripping.

### Security and trust boundaries

- **Verified:** the main web auth cookie contains access and refresh tokens and user/tenant identity and is set from browser JavaScript with `path` only (OAuth adds `maxAge`). The code does not set `HttpOnly`, `Secure`, or `SameSite`.
- **Verified:** Next middleware treats any parseable auth-cookie value as a logged-in session; it does not validate token integrity. Actual API enforcement belongs to downstream services.
- **Verified:** malformed auth-cookie JSON can throw in `authMiddleware`; no local catch is present.
- **Verified:** client route permissions are a presentation/navigation control. Fifty-three of 112 pages have no matching rule and are granted by `evaluatePageAccess` when a nonempty permissions map exists. This is not proof of backend access. See [route-permission coverage](cross-repository/frontend-route-permission-coverage.md).
- **Verified:** query-builder method-level `@RequiresPermission` appears on only seven mapped operations: one AI app settings update, one conversation unmask, one user-app approval update, and four password-whitelisting operations. Decoder/PDP library behavior is now verified; deployed gateway-global policy remains external.
- **Potential issue requiring validation:** `POST /api/download-mdm-file` performs a server-side fetch of a caller-provided URL and reflects a caller-provided filename into `Content-Disposition` without a repository-local URL allowlist or filename normalization.
- **Potential issue requiring validation:** `AssetInventoryDao` parameterizes values but concatenates caller-provided field names, filter-map keys, and ordering expressions despite a DTO comment saying the server should whitelist fields.
- **Potential issue requiring validation:** ClickHouse operations endpoints accept caller SQL protected by a request access code whose fallback is committed. The update endpoint’s blocklist still permits many mutations, and the select endpoint’s 10,000-row constant warns after execution rather than enforcing a limit.

### State and data

- **Verified:** ClickHouse is the primary operational/analytics store. Supporting migration trees define source-controlled engines, columns, and ordering/partition clauses for many referenced tables; deployed version, drift, grants, data, and plans remain unresolved.
- **Verified:** the only target-local JPA mapping is `tenant_app_whitelisted_behaviours` with embedded tenant/app/behaviour key. Supporting PostgreSQL migration source creates it with a composite primary key and three indexes.
- **Verified:** Redis holds cache entries, sync queues/sets, distributed locks, last-run timestamps, user/app approval material, and application settings. Cache key construction normally includes subscriber and tenant.
- **Verified:** query-builder commits master-data CSVs and writes them to three ClickHouse tables once per JVM using an asynchronous single daemon thread.

### Reliability and maintainability

- **Verified:** neither repository contains a tracked unit/integration/E2E test file or an npm `test` script. The only test-like artifact is a manually invoked guardrails smoke script that can mutate a remote system with `--apply`.
- **Verified:** both pinned targets build locally under their intended major toolchains. Neither target owns an automated test suite; Jenkins explicitly skips backend tests.
- **Verified:** `AppSyncScheduler` removes IDs from its Redis set before processing; processing failure does not requeue them.
- **Verified:** app-admin backfill logs row failures but still writes a no-expiry completion marker, preventing automatic retry of those rows.
- **Verified:** status-event bulk resolution is item-by-item and performs separate ClickHouse writes for drilldown and master state without a repository-visible transaction.
- **Verified:** several ClickHouse access paths construct a new unpooled `DriverManagerDataSource`/JDBC template per operation; `ClickHouseClient` is the notable singleton-template alternative.

## Material inconsistencies

- Backend master-key comments say there is no committed default; both YAML and Java supply one.
- Backend cache TTL environment values bind under `redis.*`, while the two consumers read `cache.*`; the configured environment overrides do not reach those consumers.
- Backend decoder exclusion lists `/quilr-query-builder/dwh`, while the controller maps `/dwh`; both inspected gateway paths strip the service prefix before backend dispatch, so this exclusion does not match the known `/dwh` servlet path.
- Frontend comments say PostHog uses an unlocalized `/ingest` path, while both instrumentation and rewrites use `/:lng/ingest`.
- Frontend Dockerfiles select `nextjs` and then switch back to root immediately before startup.
- `ServerApiService` comments advertise several environment names that its implementation never reads; it also derives token, tenant, and refresh cookie names from the same two settings.
- The frontend calls `/aiconversations/filters/app/users`, but this backend exposes `/aiconversations/filters/users`.
- The frontend references `/findings/kpi`; the backend mapping is commented out and absent from the 141 operations.
- Both exact green target GitHub workflow runs have skipped application build jobs.
- The private component library builds, but its own peer-provisioned Jest run has 6/18 failing suites and 23/113 failing tests.

## How to use this documentation

- Start with [architecture](03-architecture.md) and [runtime entry points](04-runtime-entry-points.md).
- Use [feature catalog](05-feature-catalog.md) and the [HTTP operation reference](api/quilr-query-builder-http.md) for behavior.
- Use the [backend](07-symbol-reference/backend/README.md) and [frontend](07-symbol-reference/frontend/README.md) symbol trees for declaration-level evidence, exact signatures, compact implementation bodies, calls, and control-flow counts.
- Consult [coverage](21-analysis-coverage.md) for what “complete” means and for the remaining external evidence gaps.
- Consult [dynamic verification](22-dynamic-verification.md) for executed evidence, substitutions, and runtime limits.
