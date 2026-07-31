# Configuration reference

## Precedence and binding

### Backend

`quilr-query-builder/src/main/resources/application.yml` is Spring's checked-in baseline. `${ENV_NAME:default}` placeholders take operating-system/environment values when supplied, otherwise the literal default. Standard Spring command-line/system/property-source precedence can override YAML, but no repository-specific precedence layer was found.

Some values are also declared in `@Value` expressions. The effective default is then:

1. higher-precedence Spring property, if any;
2. YAML placeholder resolution, if YAML defines the property;
3. `@Value` default when the property is absent;
4. binding/startup failure if a required property has no value.

Private dependency configuration objects (`DWHConfig`, `GraphConfig`, `RedisConfig`) are populated from the corresponding namespaces; their implementations are not local.

### Frontend

Next.js reads environment values at build/start according to Next conventions. Values prefixed `NEXT_PUBLIC_` may be embedded in browser bundles and must not be treated as secrets. Kubernetes manifest `env` values override image/environment defaults. `next.config.js` injects `NEXT_PUBLIC_VERSION` from `package.json`.

## Backend environment variables

### HTTP security and CORS

| Environment variable | Spring property | Type / default | Consumer and effect | Required / sensitivity |
| --- | --- | --- | --- | --- |
| `SECURITY_HEADER_HSTS` | `security.headers[Strict-Transport-Security]` | string; `max-age=63072000; includeSubDomains; preload` | `RequestFilter`/security header property writes response header | optional, non-secret |
| `SECURITY_HEADER_XCTO` | `security.headers[X-Content-Type-Options]` | string; `nosniff` | response header | optional |
| `SECURITY_HEADER_XFO` | `security.headers[X-Frame-Options]` | string; `DENY` | response header | optional |
| `SECURITY_HEADER_XSS` | `security.headers[X-XSS-Protection]` | string; `1; mode=block` | response header | optional |
| `SECURITY_HEADER_REFERRER` | `security.headers[Referrer-Policy]` | string; `strict-origin-when-cross-origin` | response header | optional |
| `SECURITY_HEADER_COOP` | `security.headers[Cross-Origin-Opener-Policy]` | string; `same-origin` | response header | optional |
| `SECURITY_HEADER_COEP` | `security.headers[Cross-Origin-Embedder-Policy]` | string; `require-corp` | response header | optional |
| `SECURITY_HEADER_CORP` | `security.headers[Cross-Origin-Resource-Policy]` | string; `same-origin` | response header | optional |
| `SECURITY_HEADER_CACHE_CONTROL` | `security.headers[Cache-Control]` | string; `no-store` | response header | optional |
| `SECURITY_HEADER_PRAGMA` | `security.headers[Pragma]` | string; `no-cache` | response header | optional |
| `SECURITY_HEADER_EXPIRES` | `security.headers[Expires]` | string; `0` | response header | optional |
| `SECURITY_HEADER_CSP` | `security.headers[Content-Security-Policy]` | CSP string; restrictive checked-in policy | response header | optional |
| `CORS_ALLOWED_ORIGINS` | `security.cors.allowed-origins` | origin collection; **no default** | `SecurityConfig` CORS source | required: startup throws when null/empty |
| `CORS_ALLOWED_METHODS` | `security.cors.allowed-methods` | CSV/list; `GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH` | allowed methods | optional |
| `CORS_ALLOWED_HEADERS` | `security.cors.allowed-headers` | list; `*` | allowed request headers | optional |
| `CORS_EXPOSED_HEADERS` | `security.cors.exposed-headers` | list; `x-trace-id,tenant,subscriberid,x-client-id` | browser-readable headers | optional |
| `CORS_ALLOW_CREDENTIALS` | `security.cors.allow-credentials` | boolean; `true` | credentialed cross-origin requests | optional |
| `CORS_MAX_AGE` | `security.cors.max-age` | seconds; `3600` | browser preflight cache | optional |

### Servers and data stores

| Environment variable | Property | Default | Consumer / failure behavior | Sensitivity |
| --- | --- | --- | --- | --- |
| `AI_AXIS_PORT` | `server.port` | `8052` | embedded Tomcat listen port | non-secret |
| `DB_URL` | `spring.datasource.url` | local Docker-host PostgreSQL URL for database `quilr` | JPA datasource; connection failure can surface lazily because `spring.main.lazy-initialization=true` | infrastructure |
| `PG_USER` | `spring.datasource.username` | `postgres` | PostgreSQL | credential identifier |
| `PG_PASSWORD` | `spring.datasource.password` | `postgres` | PostgreSQL | secret; weak committed fallback |
| `DW_NAME` | `dwhconfig.name` | `clickhouse` | private `DWHConfig` | non-secret |
| `DW_USER` | `dwhconfig.user` | `default` | ClickHouse JDBC | credential identifier |
| `DW_PASSWORD` | `dwhconfig.password` | committed nonempty credential value | ClickHouse JDBC | **secret; value intentionally not duplicated here; see source** |
| `DW_URL` | `dwhconfig.url` | committed ClickHouse Cloud JDBC URL | JDBC adapters | infrastructure/sensitive endpoint |
| `GRAPH_NAME` | `graph.name` | `neo4j` | private graph config | non-secret |
| `DEFAULT_KNOWLEDGE_USERNAME` | `graph.user` | `neo4j` | Neo4j client | credential identifier |
| `DEFAULT_KNOWLEDGE_PSWD` | `graph.password` | committed nonempty credential value | Neo4j client | **secret; not duplicated** |
| `DEFAULT_KNOWLEDGE_HOST` | interpolated into `graph.url` | committed private-network address | Neo4j client | infrastructure |
| `DEFAULT_KNOWLEDGE_PORT` | interpolated into `graph.url` | `7687` | Neo4j Bolt URL | non-secret |
| `CACHE_NAME` | `redis.name` | `redis` | private Redis config | non-secret |
| `REDIS_PASSWORD` | `redis.password` | `superadmin` | Redisson/private Redis client | secret; committed fallback |
| `REDIS_HOST` | `redis.host` | `localhost` in YAML; `RedissonConfig` fallback is `host.docker.internal` only if property absent | Redis clients | infrastructure; YAML normally wins |
| `REDIS_PORT` | `redis.port` | `6379` | Redis clients | non-secret |

### Jobs, caches, services, and cryptography

| Environment variable | Property | Type / default | Consumer / effect | Notes |
| --- | --- | --- | --- | --- |
| `CLICKHOUSE_OPS_ACCESS_CODE` | `clickhouse.ops.access-code` | string; committed nonempty code | `ClickhouseOpsProcessor` compares caller code before ad-hoc SQL | secret-like shared code; fallback is committed |
| `ENDPOINT_SYNC_BATCH_SIZE` | `endpoint.sync.batch-size` | integer; `300` | graph-to-ClickHouse device batching | malformed binding fails bean creation |
| `CACHE_TENANT_APP_SETTINGS_TTL` | `redis.tenant-app-settings-ttl` | seconds; `86400` | no matching local `@Value` consumer | **Contradiction:** `TenantAppCacheService` reads `cache.tenant-app-settings-ttl` |
| `CACHE_GLOBAL_APP_DETAILS_TTL` | `redis.global-app-details-ttl` | seconds; `86400` | no matching local `@Value` consumer | **Contradiction:** `GlobalAppCacheService` reads `cache.global-app-details-ttl` |
| `APP_SYNC_QUEUE_BATCH_SIZE` | `app.sync.queue.batch-size` | integer; `50` | scheduler pop batch | optional |
| `APP_SYNC_SCHEDULER_POLL_INTERVAL` | `app.sync.scheduler.poll-interval-ms` | milliseconds; `5000` | scheduling property | optional |
| `APP_SYNC_SCHEDULER_LOCK_TIMEOUT` | `app.sync.scheduler.lock-timeout-seconds` | seconds; `600` | Redis lock expiry | optional |
| `QUILR_BROWSER_EXTENSION_SERVICE` | `browser.extension.service.url` | `http://localhost:8085` | whitelist service HTTP client | infrastructure |
| `JWT_PUBLIC_KEY` | `jwt.public.key` | committed PEM public key | external/local JWT-related config | public cryptographic material, not a private secret |
| `AUTH_SERVICE_HOST` | part of `quilr.authz.pdp-url` | `localhost` | external authorization PDP | infrastructure |
| `AUTH_SERVICE_PORT` | part of `quilr.authz.pdp-url` | `9966` | external authorization PDP | non-secret |
| `INTERNAL_API_SECRET` | `internal.api.secret` | empty string | `TenantFeatureService` outbound internal request | secret; empty is allowed locally |
| `MASTER_ENCRYPTION_KEY` | `master.encryption.key` | committed Base64 32-byte key | `EncryptMaskingKeyBootstrap` / encryption utilities | **secret; comment claims no default but source supplies one** |

### Backend properties without an environment placeholder

| Property | Default/source | Consumer / effect |
| --- | --- | --- |
| `spring.application.name` | `axis-query-builder` | logging/audit service identity |
| `spring.main.lazy-initialization` | `true` | delays creation/failure of many beans until requested |
| `spring.jackson.default-property-inclusion` | `NON_ABSENT` | omits absent values |
| `spring.jackson.serialization.FAIL_ON_EMPTY_BEANS` | `false` | permits empty-bean serialization |
| `server.error.include-*` | exception false, stack/message/binding never | suppresses detail in standard error responses |
| `server.forward-headers-strategy` | `framework` | accepts framework forwarding-header processing |
| `server.compression.enabled` | `true` | HTTP response compression |
| `springdoc.swagger-ui.defaultModelsExpandDepth` | `-1` | hides schema expansion |
| `springdoc.swagger-ui.config-url` / `url` | `/bff/quilr-query-builder/v3/api-docs/...` | UI endpoints assume external BFF prefix rewriting |
| logging patterns/levels | JSON-like console/file patterns; root `error`, `com.quilr` `info` | application logging |
| `logging.file.path/name` | `logs`, `logs/axis-query-builder.log` | file log target |
| management exposure | `"*"`; metrics/prometheus/shutdown enabled | Actuator is supplied transitively in the resolved build; live `/actuator/health`, `/actuator/mappings`, and `/actuator/env` registrations were verified |
| Redisson connection values | code defaults plus pool/timeout/retry constants in `RedissonConfig` | Redis connection behavior |
| `browser.extension.service.connect-timeout` | `1000` ms | HTTP client connection timeout |
| `browser.extension.service.read-timeout` | `5000` ms | HTTP client read timeout |
| `audit.kafka.enabled` | YAML `true`; code default `true` | `AuditService` publishing path |
| `audit.kafka.pipeline-id` | YAML `4`; code fallback `1` | audit pipeline metadata; YAML wins |
| `findings.populate.enabled` | code default `true` | `FindingsCacheInitializer` startup work |
| `app.mount.storage.folder` | `/quilr-data-upload` | `SnippetFileService` file path |
| `quilr.authz.enabled` | `true` | external authorization library |
| `quilr.authz.pdp-url` | host/port above | PDP endpoint |
| `quilr.authz.fail-open` | `false` | resolved authorization aspect/PDP client denies on connection failure when false and permits when true; both branches dynamically tested |
| `jwt-decoder.filter.excluded-paths` | comma-separated Swagger, docs, DWH prefix, actuator paths | external decoder exclusions |
| `jwt-decoder.header.internal-enabled` | `true` | external decoder behavior |

**Potential misconfiguration:** `spring.datasource.jpa.properties.hibernate.dialect` is nested under `spring.datasource`, while standard Spring Boot JPA configuration is `spring.jpa.*`. The commented alternative shows the standard shape. Runtime metadata is needed to prove whether the nested value is ignored.

**Potential path contradiction:** decoder exclusion `/quilr-query-builder/dwh` does not syntactically match local mapped `/dwh/**` routes unless an upstream prefix is retained/passed in a particular way.

## Frontend environment variables

### Documented in `.env.example`

| Variable | Exposure | Default in template | Consumers / effect |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | browser-visible | empty | API/base URL construction |
| `NEXT_PUBLIC_REFRESH_URL` | browser-visible | empty | refresh-token request |
| `NEXT_PUBLIC_AUTH_COOKIE` | browser-visible | empty | client and route-handler cookie name |
| `AUTH_COOKIE` | server/private namespace | empty | server utility cookie name |
| `NEXT_PUBLIC_EXT_AUTH_COOKIE` | browser-visible | empty | external-auth cookie name |
| `NEXT_PUBLIC_IMAGE_URL` | browser-visible | empty | image/static base consumers |
| `ARE_DATA_MODEL_ENABLED` | server/build | empty | feature behavior |
| `GUARDRAILS` | server/build | empty | guardrail feature behavior |
| `LHCI` | server/build | empty | Lighthouse/CI behavior |
| `NEXT_PUBLIC_USER_CREATION_DAYS_REQUIRED` | browser-visible | template text contains leading whitespace before `30` | user-creation/trial UI threshold |
| `ENV` | server/build | template text contains quoted/spaced `"dev"` | deployment/tooling convention; direct code consumer not found |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | browser-visible | empty | analytics initialization |
| `NEXT_PUBLIC_POSTHOG_HOST` | browser-visible | empty | analytics endpoint |

### Used in code but missing from `.env.example`

| Variable | Consumer / allowed behavior visible in code | Classification |
| --- | --- | --- |
| `ANALYZE` | Next bundle analyzer toggle | build-only boolean-like |
| `AUTH_TOKEN`, `SUBSCRIBER_ID`, `TENANT` | guardrail smoke script credentials/context | secret/identity; CLI environment |
| `GUARDRAILS_BASE_URL` | smoke script target | URL |
| `LLM_GATEWAY_APP_NAME` | smoke-test/request metadata | string |
| `NEXT_GOOGLE_CLIENT_ID`, `NEXT_GOOGLE_DEVELOPER_KEY` | Google/integration UI | browser-exposed integration values |
| `NEXT_PUBLIC_BROWSER_EXTENSION_CHROME_MANAGEMENT_URL` | browser-extension management link | URL |
| `NEXT_PUBLIC_CONFIG_MANAGER_LOCAL_BASE_URL` | local config-manager selection | URL |
| `NEXT_PUBLIC_DEFAULT_BASE_URL` | fallback base URL in API/config code | URL |
| `NEXT_PUBLIC_DETECTION_MODELS_MODE` | local/remote detection-model selection | enum-like string; exact comparisons in code |
| `NEXT_PUBLIC_LLM_GATEWAY_MODE` | gateway local/remote mode | enum-like string |
| `NEXT_PUBLIC_LLM_GATEWAY_LOCAL_BASE_URL` | local gateway URL | URL |
| `NEXT_PUBLIC_MCP_SERVER_MODE` | MCP service local/remote mode | enum-like string |
| `NEXT_PUBLIC_MCP_SERVER_LOCAL_BASE_URL` | local MCP service URL | URL |
| `NEXT_PUBLIC_VERSION` | injected by `next.config.js` from `package.json` | build-generated public string |
| `NODE_ENV` | Next/React and local branching | conventional `development`/`production`/`test` |

`NEXT_PUBLIC_POSTHOG_HOST` is referenced in code but the simple extraction also sees the project token. Kubernetes manifests provide deployment-specific values beyond the template; their exact checked-in rows remain in the full inventories and are discussed in [operations](15-build-deployment-and-operations.md).

### Frontend configuration objects and flags

| Setting | Location | Verified default / behavior |
| --- | --- | --- |
| `getAppConfig().baseUrl` server branch | `src/config` / API utilities | returns `false` in server context |
| adversarial/insider flags | frontend feature config | false |
| data-insights flag | frontend feature config | false |
| executive-dashboard flag | frontend feature config | false |
| decision-sidebar flag | frontend feature config | false |
| new-user-drawer flag | frontend feature config | true |
| lens flag | frontend feature config | false |
| events/prompts flags | frontend feature config | false |
| Next image hosts | `next.config.js` | HTTPS blob-storage pattern only |
| Next security headers | `next.config.js` | `nosniff`, `DENY`, CSP with frame-ancestors restriction |
| PostHog rewrite | `next.config.js` | locale-prefixed `/:lng/ingest/*` rewrite |
| PostHog capture host gate | `instrumentation-client.ts` | initializes only on selected Quilr domains |

## Build arguments, Kubernetes, and secrets

- Production Docker build consumes npm credentials via a BuildKit secret mount. The secret is not declared as a runtime variable.
- `Dockerfile.dev` accepts `NPM_TOKEN` as an `ARG` and writes `.npmrc` during a layer. **Potential issue:** build arguments/layers can retain the token depending on builder/history handling.
- Dev and preprod Kubernetes deployments duplicate environment values inline. Checked-in ConfigMaps are not loaded because `envFrom` is commented.
- Each ConfigMap repeats `NEXT_PUBLIC_EXT_AUTH_COOKIE`. Duplicate YAML keys are a configuration defect; which value survives is parser-dependent.
- No production Kubernetes manifest, Secret object, Helm values, Terraform variable set, or sealed-secret reference is present.

## Configuration contradictions

| Claim/configuration | Code evidence | Result |
| --- | --- | --- |
| master-key comment says no committed default | YAML and `@Value` both contain the same nonempty fallback | **Contradicted** |
| Redis TTL env vars imply they control caches | consumers use `cache.*`, YAML defines `redis.*` | **Contradicted / ineffective override** |
| ConfigMap defines deployment config | Deployment `envFrom` is commented and values are inline | **Not active** |
| refresh middleware is part of proxy auth flow | imported but never invoked | **Implementation does not match implied configuration path** |
| Springdoc URLs contain `/bff/quilr-query-builder` | local controllers have no such servlet context; pinned NGINX and BFF implementations strip the optional BFF/service prefixes | **Verified:** the documented external path depends on prefix stripping before controller dispatch |

## Supporting deployment and gateway configuration

These values are not checked into either target repository. They are verified at the exact supporting commits listed in [dynamic verification](22-dynamic-verification.md) and are separated from target-local defaults accordingly.

| Setting | Query-builder | Web | Runtime effect |
| --- | --- | --- | --- |
| service port | `8052` | `3000` | chart Service/container routing |
| HPA bounds | min `1`, max `1` | min `1`, max `1` | autoscaling objects are effectively fixed at one replica |
| CPU request/limit | `125m` / `1000m` | `125m` / `1000m` | scheduler/resource boundary |
| memory request/limit | `512Mi` / `2048Mi` | `512Mi` / `1024Mi` | pod resource boundary |
| image policy | ECR `main/...:latest`, `Always` | ECR `main/...:latest`, `Always` | mutable-tag deployment intent |
| readiness/liveness | TCP `8052`, initial delay `40s` | probe blocks commented | query-builder probe checks port acceptance, not dependency health |
| configuration sources | Vault, ConfigMaps, Secret reference, shared volume | inline public values, ConfigMaps, Secret reference | chart-level injection beyond target-local YAML/env examples |

The pinned ingress regex is `/(?:bff/)?quilr-query-builder(/|$)(.*)` with rewrite target `/$2` and service destination `quilr-query-builder:8052`. The alternate Node BFF mounts the same service at `/quilr-query-builder`; a live echo trace verified suffix/query/body forwarding, `Cookie` removal, and `Authorization` preservation.

The BFF configuration also declares request timeout `120000` ms, body-parser limit `2gb`, and proxy upload limit `10gb`. These are gateway-wide supporting defaults, not controller-local limits.

**Analysis-only configuration:** the H2 datasource used for local HTTP verification was injected at launch and is not a target-repository default or proposed deployment setting. It verifies Spring/HTTP wiring only; it does not verify PostgreSQL behavior.

## CI selection configuration

The exact target workflows loaded `ci-scripts@cf687f6a1713498d2843f0f60a8ddf30d672775d`. That workflow selects build jobs through `config/java-libraries.txt` and `config/node-libraries.txt`. Neither target repository was listed, so the exact green runs skipped the build jobs. Jenkinsfiles remain the repository-visible application-image build configuration; query-builder uses `mvn clean package -DskipTests`, while web builds its Dockerfile/npm dependency graph.
