# Runtime entry points

## Query-builder executable and lifecycle

| Entry point | Invocation | Inputs/configuration | Downstream behavior | Shutdown/failure |
| --- | --- | --- | --- | --- |
| `com.quilr.QBApp.main` | Spring Boot Maven main class; verified `java -jar` start | all Spring properties; component/entity/repository scan declarations | enables async and scheduling; registers resolved dependency `Decoder` bean | uncaught startup exception is fatal; missing Redis/relational dependencies produced verified startup failures |
| `QBApp.decoder` | `@Bean` | decoder properties from Spring `Environment` | constructs `ai.quilr.jwtdecoder.filter.Decoder`; supporting source/harness verify exclusion, token, revocation, tenant, internal-header, and context-cleanup behavior | invalid configuration/key construction or runtime token failures follow the resolved library behavior |
| `SecurityConfig.filterChain` | Spring bean creation | bound CORS/security-header properties | disables CSRF/default headers, permits Spring requests, inserts decoder then `RequestFilter` | throws `IllegalStateException` when origins absent/empty |
| `RequestFilter.doFilterInternal` | every accepted HTTP request | user context or request headers, trace header | MDC, request context, response security/context headers | `finally` clears MDC |
| `QBAppListener.onApplicationEvent` | `ApplicationReadyEvent` | none | logs only | comments claim work not present in code |
| `QBAppListener.onExit` | `@PreDestroy` | none | logs only | no resource shutdown |
| `CHLatestTest.main` | manual Java main, not Spring main | hard-coded ClickHouse endpoint/user/password/query | executes a demo query and prints every column | catches and prints exception; closes client after call |

The complete annotation-extracted list is [query-builder lifecycle hooks](routes/quilr-query-builder-lifecycle.md).

## Query-builder HTTP entry points

**Verified:** 141 operations on 26 controllers. The full per-operation reference includes signatures, request annotations, direct calls, compact bodies, permission annotations, and local failure handling:

- [Query-builder HTTP API](api/quilr-query-builder-http.md)

Controller families:

| Controller family | Operations | Primary capability |
| --- | ---: | --- |
| AI assets | 4 | paginated inventory, widget totals, adoption trend, type distribution |
| Audit | 7 | audit log search/snapshots and audit master-code CRUD |
| AI accounts/apps/conversations/users | 38 | dashboards, tables, filters, settings, unmasking, synchronization and smart groups |
| ClickHouse ops/DWH diagnostics | 11 | arbitrary query/update gateway and runtime/config diagnostics |
| Compliance/red-team/guardrails/MCP/executive | 20 | compliance dashboards, red-team results, gateway metrics/logs, executive rows |
| Findings/status events/whitelisting | 23 | findings widgets/tables/drilldowns, status resolution, password whitelist changes |
| Interactions/Quilly | 20 | simple/advanced/chat interaction queries, filters, summaries and drilldowns |
| User app approval/device/endpoint/non-AI apps | 15 | approvals, devices, sync, inventory |
| Widget processor gateway | 3 | health, named dashboard query, scheduled aggregation |

### HTTP processing model

- Embedded servlet/Tomcat request-per-thread model from `spring-boot-starter-web`.
- Controllers use constructor or field injection.
- Inputs mix typed DTOs and untyped `Map<String,String>`/`Map<String,Object>`.
- Many operations return dependency type `com.quilr.response.ServiceResponse`; supporting source plus a passing serialization harness verify its property names and wrapper shape.
- No global `@ControllerAdvice` is committed. `InteractionsController` and `QuillyInteractionsController` each contain local exception handlers.

## Scheduled, ready, async, and startup entry points

| Symbol | Trigger | Verified behavior | Failure/retry |
| --- | --- | --- | --- |
| `FindingsCacheInitializer.run` | `ApplicationRunner` | loads behavior/use-case mappings from graph into mutable static maps | outer catch logs; a null graph result can abort later population |
| `TenantAppSettingsService.onApplicationReady` | `ApplicationReadyEvent` + `@Async` | starts tenant settings initialization | async executor is Spring default unless external config supplies one |
| `HuntingScheduler.startScheduler` | one active `@Scheduled` cron, daily 00:10; a one-minute test cron is commented out | iterates `aiusers_page_schedulers`, which is initialized empty | per-task catch; currently effective no-op |
| `HuntingScheduler.scheduleAppSyncScheduler` | every minute | sync application and tenant-setting data in separate guarded blocks | failures logged; next minute retries |
| `HuntingScheduler.scheduleLatestUsersSyncScheduler` | every minute | sync users | failure logged; next minute retries |
| `HuntingScheduler.scheduleAppsDbToAppTenantSettingsSync` | hourly | backfills settings from app database | failure logged; next hour retries |
| `AppSyncScheduler.processQueue` | fixed delay, default 5 s | Redisson lock, pop up to batch size from Redis set, sync IDs | popped IDs are not requeued on processing failure |
| `AppAdminUsersBackfillScheduler.backfillAppAdminUsers` | fixed rate hourly after 60 s | distributed lock; if marker absent, backfills all rows then sets marker | row failures logged but marker still set; marker has no TTL |
| `MasterDataBootstrap.scheduledRunOnce` | initial 20 ms, fixed delay `Long.MAX_VALUE` | CAS one-shot then daemon executor writes master CSVs and tenant relations | CAS occurs before async work; failure is not retried in same JVM |
| `AuditService.audit*` | four `@Async` methods called by mutation paths | publishes audit messages through private Kafka client | local catch/log behavior varies by method; broker semantics external |

## Frontend build/runtime entry points

| Entry point | Invocation | Behavior |
| --- | --- | --- |
| `npm run dev` | `next dev --webpack` | development server |
| `npm run build` | `next build --webpack` | production build |
| `npm start` | `next start` | production HTTP server on `PORT=3000` in Docker |
| `src/proxy.ts#proxy` | Next proxy matcher excluding API/static/image/assets/favicon/service worker | headers, OPTIONS 404, locale redirect, auth redirect, pass-through |
| `instrumentation-client.ts` | Next client instrumentation convention | conditionally initializes PostHog, sanitizes analytics/replay |
| `src/app/[lng]/layout.tsx#Layout` | localized App Router root | metadata/fonts/styles/providers/AppLayout |
| `src/components/app-layout/AppLayout` | client root shell | public/self-service shell or admin chrome + permission guard |
| `src/components/PermissionGuard` | admin page wrapper | permissions fetch, route access evaluation, timezone fetch, role validation |

## Next.js route entry points

**Verified:** 112 `page.*` files, 20 `layout.*` files, and two route-handler operations. The route-to-file listing is [App Router entry points](routes/quilr-web-app-router.md).

The route handlers are:

| Method/path | Symbol | Inputs | Effects/failure |
| --- | --- | --- | --- |
| `POST /api/cookie` | `src/app/api/cookie/route.ts#POST` | arbitrary JSON with `user` | sets configured auth cookie with path `/`; otherwise redirects `/login`; no active caller found |
| `POST /api/download-mdm-file` | `src/app/api/download-mdm-file/route.ts#POST` | JSON `url`, `fileName` | server-fetches URL, buffers full response, returns attachment; any error becomes JSON 500 |

## Frontend authentication entry points

| Flow | Entry symbols | Execution |
| --- | --- | --- |
| Password login | `useLogin.login` | POST `/auth/auth/login`; set auth cookie; fetch roles and permissions; fetch current role; identify PostHog; hydrate `AuthAtom` |
| OAuth landing | `/[lng]/oauth-landing/[token]`, `OAuthLandingPageBase`, `OAuthSuccess`, `OauthLogin.setCookieAndUser` | token is URL segment and bearer for `/auth/get-user`; pause replay; set 12-hour auth cookie; fetch permissions unless self-service; redirect |
| Logout | `useLogout.logout` | removes auth cookie and permissions/notice session state; does not set `AuthAtom` to null despite obtaining its setter |
| Interceptor logout | `AxiosService.deleteToken` | removes auth and `permissions` cookies; does not clear `permissions` session storage |
| Refresh | Axios response interceptor and `FetchService` | on 401, call configured refresh endpoint and retry |

## Manual/administrative script

`scripts/llm-gateway-guardrails-smoke-test.mjs` is executable with Node. Default invocation reads a configured remote guardrails app and performs validation/dry-run planning. `--apply` writes a mutation, verifies it, and restores unless `--no-restore`; recovery attempts restoration when verification fails. It is not referenced by `package.json` or checked-in CI, contains operational default host/tenant/subscriber/app identifiers, and defaults the token to `dummy`.

## Build/deployment entry points

- Backend Jenkins: Maven package with tests skipped, Docker build, registry push.
- Web Jenkins: BuildKit-secret Nexus npm install, Next Docker build, registry push.
- Web dev Jenkins: Dockerfile.dev, Azure ACR, `kubectl apply` dev manifests, rollout restart.
- GitHub Actions build/security: calls reusable workflows from `quilrbusiness/ci-scripts`; exact build-workflow source and target runs show both application build jobs were skipped by the library allowlist.
- Web branch-sync workflows: delete/recreate target branches with selected file preservation.
- Web release-notes workflow: checks out a separate platform-docs repository, invokes Claude Code, builds/branches/opens a PR.

## Dynamically verified entry-point behavior

- `com.quilr.QBApp` was packaged and started from the executable JAR. Redis/JPA failures were startup-fatal; ClickHouse/Neo4j failures could leave HTTP ready while background/data work failed.
- The running Spring context registered all 141 extracted custom operations across 26 controllers.
- SIGINT invoked `QBAppListener`, Kafka producer-factory cleanup, and ClickHouse-client cleanup.
- `next build --webpack` completed and `next start` became ready. `src/proxy.ts`, both route handlers, redirects, response headers, and browser hydration were exercised.
- Next has no target-specific shutdown hook; SIGINT terminated the process directly.
- Supporting BFF `src/app.ts` was built/started in a detached verification worktree and proved Express mount-prefix stripping.

See [dynamic verification](22-dynamic-verification.md) for commands, inputs, and limits.
