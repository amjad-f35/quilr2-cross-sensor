# Dynamic verification and external-evidence addendum

## Purpose and evidence boundary

This chapter records the runtime, build, dependency-source, CI, routing, migration, and deployment evidence gathered after the complete static inventory of the two target repositories.

- **Target repositories:** the source under analysis remains pinned to `quilr-query-builder@c794c45a9c22b75f101c7c73da508d6e7870f97b` and `quilr-web@e6f9d03ddedde756ec447e3fabccdb3a8c418ea9`.
- **Supporting repositories:** additional private repositories were inspected only to resolve dependencies and boundaries used by the targets. Their files are not added to the 2,903-file target-repository denominator.
- **Verified:** a result observed from source, a clean build, a running process, a black-box request, an exact CI log, or a purpose-built dynamic harness.
- **Inference:** an interpretation that follows from the evidence but was not directly observed.
- **Unresolved:** evidence still requires a real ClickHouse/PostgreSQL/Neo4j deployment, complete external-service estate, or live Kubernetes/Jenkins environment.
- The runtime was an isolated development verification environment. It was not a production certification, production load test, or claim about current live infrastructure.

## Runtime environment

| Component | Version / configuration | Use |
| --- | --- | --- |
| macOS host | Darwin arm64 | isolated local runtime |
| Java | Eclipse Temurin 21.0.11 | backend build and runtime |
| Maven | 3.9.11 | backend and supporting-library builds |
| Node.js | 20.20.2 | exact major used by target Docker/Jenkins definitions |
| npm | 10.8.2 | frontend/component/BFF dependency installation |
| Redis | 7.2.5, local port 16379 | decoder revocation checks, Redisson, queue concurrency |
| relational substitute | H2 injected only at launch | allowed Spring/JPA bootstrap without changing target source |
| frontend port | 13000 | production `next start` probe |
| backend port | 18052 | Spring Boot probe |
| BFF/stub ports | 6666 / 8052 | mount-path and forwarded-request trace |

**Unresolved:** macOS sandboxing prevented an embedded PostgreSQL process from acquiring System V shared memory. H2 therefore verifies Spring wiring and HTTP behavior only; it does not verify PostgreSQL dialect, constraints, indexes, migrations, transactions, or query behavior.

## Supporting-source provenance

The following supporting commits supplied evidence used in this addendum:

| Repository | Commit | Evidence used |
| --- | --- | --- |
| `quilrbusiness/jwt-decoder-library` | `5dfc35a8da27183f66e1d89206e9829a8c03a6f9` | decoder/filter/context source and build |
| `quilrbusiness/quilr-authz-lib` | `ce03e70b41736f9bf240e2f53f3fe8a6e555d56f` | annotation/aspect/PDP client source and build |
| `quilrbusiness/quilr-kafka-client` | `c484b3645f8747ec2a52a942d23a179a4341c002` | Kafka client/factory source and build |
| `quilrbusiness/quilr-common-lib` | `40e8bce63d505e6b50e85d1902bfc776f761f82c` | response, Redis cache, data-warehouse, graph, and entity source |
| `quilrbusiness/quilr-components` | `2d66c4a1dafd7cba10c2979b58b2a83d34d24721` | private npm package version 0.2.79 source/build/tests |
| `quilrbusiness/ci-scripts` reusable branch | `cf687f6a1713498d2843f0f60a8ddf30d672775d` | exact reusable build workflow and detector used by both pinned CI runs |
| `quilrbusiness/quilr-bff` | `929ea208f36ef2db4446064e76643e292507b715` | proxy routing and dynamic path trace |
| `quilrbusiness/nginx-ingress-controller` | `412ed6f4fcea07c687f3164ec4f6bef68d7541ff` | direct ingress routes and rewrite rule |
| `quilrbusiness/quilr-migration-service` | `e4a8ac44844b8c3991881cf7fe873d973fcdb7a7` | PostgreSQL and ClickHouse migration DDL |
| `quilrbusiness/quilr-helm-charts-axis-bank` | `b1adf162383166770bb4acc74ec9b409da08c8c5` | target service deployments, resources, probes, and image tags |
| `quilrbusiness/quilr-helm-charts` | `a72753199c90b14a8f8b16d599ebc14a11affac3` | SaaS web chart/config evidence |
| `quilrbusiness/quilr-jenkins-shared-library` | `d16ec670f1a5e9d6f641b099c52e6ecab9f854c3` | image-tag/push behavior |
| `quilrbusiness/quilr-graph-service` | `a4a80bb8c43fccc82153f825d987419860cd816a` | graph boundary/source model evidence |

The ordinary `ci-scripts` default branch was also inspected at `72a5d503989713ba0ac7191cf58e40c2938d0e75`; the pinned target runs used the reusable branch commit shown in the table.

## Query-builder clean build

### Dependency resolution

The required private Java libraries were built from the supporting sources and installed into an isolated Maven repository. The target POM was then built without source or POM modification.

### Result

| Check | Result |
| --- | --- |
| command family | Maven clean/package using Java 21 and Maven 3.9.11 |
| target build | **passed** |
| target tests discovered | 0 |
| test execution | Maven reported no target test sources |
| executable JAR | `quilr-query-builder-1.0.0.jar` |
| JAR size | 117,763,412 bytes |
| `BOOT-INF/classes` class entries | 370 |
| nested `BOOT-INF/lib` JARs | 158 |
| start class | `com.quilr.QBApp` |

**Verified:** Maven compiler plugin 2.4 with `<skip>true>` did not suppress main-source compilation. It emitted an old-plugin warning about the `parameters` option; the current Java 21 source still compiled. The skip affects test compilation in this configuration, and there are no target tests.

## Query-builder startup and dependency-failure matrix

| Runtime condition | Observed result | Classification |
| --- | --- | --- |
| default target configuration, Redis unreachable | startup failed before a usable Tomcat listener while decoder/Redis initialization failed | Verified |
| Redis available, configured PostgreSQL unreachable | startup failed during JPA `EntityManagerFactory` construction | Verified |
| Redis available, H2 launch-time datasource substitute, ClickHouse and Neo4j unreachable | application reached ready state and served HTTP | Verified |
| ClickHouse client creation failure | error was caught; a null client remained and later async/scheduled work repeatedly failed | Verified |
| Neo4j unavailable after HTTP readiness | graph-backed startup/scheduler work logged connection failures while the HTTP server stayed up | Verified |

This demonstrates a mixed failure model:

1. decoder/Redis and relational/JPA failures can be startup-fatal;
2. ClickHouse/Neo4j failures can be startup-nonfatal because of catches and lazy/background initialization;
3. TCP readiness therefore does not prove that data-backed features work.

## Live query-builder registration

The running application exposed:

- 141 custom Spring MVC operations;
- 141 corresponding handler registrations;
- 26 application controllers;
- Actuator MVC registrations supplied transitively by the resolved dependency graph.

The live custom mapping count agrees with the static route inventory. This resolves the earlier uncertainty that framework scanning or private auto-configuration might materially change the target controller surface.

## Query-builder HTTP probes

These requests were made against the running unmodified application JAR, with H2 only substituting for PostgreSQL connectivity.

| Request | Observed response | Meaning |
| --- | --- | --- |
| `GET /qb/health`, no identity input | 401 | decoder filter runs despite Spring `permitAll` |
| `GET /qb/health`, `internal: true` with internal-header mode enabled | 200, body `RUNNING` | internal bypass path reaches the controller |
| `GET /qb/health`, malformed bearer | 400 | decoder converts token parsing failure to a client response |
| `GET /actuator/health` | 503, `{"status":"DOWN"}` | Actuator is present; dependency health is down in the isolated runtime |
| `GET /actuator/mappings` | 200 | runtime mapping inventory is reachable in this configuration |
| `GET /actuator/env` | 200 | values are masked by Actuator sanitization |
| configured-origin CORS preflight/request | origin echoed and credentials allowed | target CORS binding is active |
| unconfigured-origin request | 403 | origin allowlist is enforced |
| ClickHouse-operations request with invalid access code | HTTP 200 with wrapper status `SUCCESS` and `extraInfo.status = unauthorized` | transport status and body status semantics disagree |
| audit master-code route with internal identity and unavailable ClickHouse | 500 | request reaches the controller/repository and propagates store failure |
| red-team stats request missing required `tenant` | 400 | Spring parameter validation rejects the request |

The invalid-access-code response is a response-model inconsistency, not evidence that the protected operation executed.

## Query-builder shutdown

SIGINT triggered the Spring shutdown hook. Observed events, in order:

1. `QBAppListener` logged “Stopping Services” and “Shutdown complete and Happy Exit”;
2. `QuilrKafkaProducerFactory` closed all tracked producers;
3. `ClickHouseServiceImpl` began closing its ClickHouse client;
4. the Java process exited with the interrupt status.

No unfinished-request drain, queue requeue, or bootstrap-state repair was observed or implemented by `QBAppListener`.

## Decoder dynamic harness

Seven decoder/filter/context tests passed.

| Behavior | Result |
| --- | --- |
| valid RSA/SHA-512 signature | accepted |
| expired token | rejected |
| payload/signature tamper | rejected |
| claim context population and request-finally clearing | verified |
| selected tenant present in token tenants | accepted |
| selected tenant absent from token tenants | 401 |
| missing selected-tenant header | accepted by the decoder |
| internal header when enabled | bypassed JWT |
| internal header when disabled | 400 |
| token present in Redis invalidation set | 401 |
| malformed token | 400 |
| method-specific excluded route | bypassed after exact servlet-path/method match |

**Verified implementation detail:** the validator verifies with the configured RSA `SHA512withRSA` signature path and does not derive the algorithm from the JWT header. A test token whose header claimed `"alg":"none"` but whose bytes carried a valid RSA/SHA-512 signature was accepted. It also accepted a validly signed fixture without `exp`, `iss`, or `aud`; expiry is checked only when the claim is present.

This is documentation of the library's current contract, not a claim about how production token issuers populate claims.

## Authorization-library dynamic harness

Seven authorization tests passed: five aspect decisions and two REST-client decisions.

- missing authorization context produced 401;
- missing tenant input produced 400;
- PDP denial produced 403;
- PDP connection failure followed configured fail-open/fail-closed behavior;
- absence of an HTTP request context skipped the aspect;
- SpEL parameter extraction resolved the annotated tenant input;
- the REST client treated 2xx as allow, forwarded headers/body, treated 4xx as deny, and converted an unreachable PDP into 503.

Unannotated target controller methods remain outside this aspect. Whether another deployed gateway applies policy is still an external boundary question.

## `ServiceResponse` wire verification

The resolved `com.quilr.response.ServiceResponse` implementation was serialized in the harness. The test passed and confirms the property names/types used in the API chapter. It also confirms that the ClickHouse-operations invalid-code response can carry an application-level unauthorized value inside a successful wrapper and HTTP 200.

## Redis queue concurrency verification

Two live-Redis tests passed.

`com.quilr.cache.RedisLockService.popFromSet`:

1. obtains an `RSet`;
2. iterates members into a local result set up to the requested limit;
3. calls `removeAll(result)` afterward.

It is not an atomic claim/pop operation.

A barrier-synchronized two-consumer test loaded 800 unique members. Both consumers returned the same 800 members before either removal became exclusive:

`DYNAMIC_REDIS_QUEUE_DUPLICATE_RETURNS=800`

The set was drained after removal, so the observed failure mode was duplicate delivery, not retained items. `AppSyncScheduler` normally wraps its drain in a distributed scheduler lock, which reduces overlap between healthy scheduled invocations. Duplicate delivery remains possible for concurrent direct consumers, overlapping calls not sharing that lock, or lock-expiry/failure scenarios. Items are removed before downstream processing and the target has no local requeue/dead-letter path.

## Frontend private dependency reconstruction

`@quilrbusiness/quilr-components` 0.2.79 was built and packed from its source commit. The reconstructed tarball:

- contains 1,833 files;
- is approximately 1.3 MiB;
- has integrity `sha512-qInxox+LGylx/X1N7+AwFkPiCIaBvWeh432ce1W7/MczTc3XAkoof35qxszONbPNL0ymTajWuq3hpfCMZrldIw==`.

For target verification, the target lockfile's private component URL/integrity entry was replaced with this local tarball. Nexus-hosted URLs for public packages were mechanically changed to `registry.npmjs.org`; their locked versions and integrity values were preserved.

**Unresolved:** the locally packed source tarball cannot be proven byte-identical to the private Nexus tarball whose original lock integrity is different. The package name/version and source build are verified; published-artifact equivalence is not.

## Frontend clean install and repository checks

Using Node 20.20.2:

| Check | Result |
| --- | --- |
| `npm ci --legacy-peer-deps` | passed; 980 packages installed |
| resolved Next | 16.2.6 |
| resolved React Icons | 5.3.0 |
| resolved private component | 0.2.79 |
| `npm run typecheck` | passed with zero TypeScript errors |
| `npm run lint` | passed; 0 errors, 44 warnings |
| warning classes | import/export sort, `console`, and unused ESLint-disable directives |
| `npm run format:check` | passed |
| `npm run build` | passed |
| static generation | 114 static-page outputs reported by Next |
| test script | absent |

An earlier non-baseline install that did not honor the lock selected React Icons 5.7 and produced icon-export type errors. That result is not attributed to the pinned repository. Restoring the locked 5.3.0 version made typecheck and build pass.

## Frontend production runtime

`next start` reached ready state in approximately 59 ms after the completed production build. Two App Router handlers and the proxy middleware were exercised.

### Middleware and page probes

| Request | Observed response |
| --- | --- |
| `GET /` | 307 to `/en/` |
| `GET /en/login` | 200 with the built login page |
| `GET /en/ai-assets`, no auth cookie | 307 to `/login` |
| `GET /en/ai-assets`, cookie value `{}` | 200; presence/parseability is sufficient for middleware admission |
| `GET /en/login`, cookie value `{}` | 307 to `/en/insights/ai-insights` |
| `GET /en/ai-assets`, malformed cookie `not-json` | 500 due to uncaught `JSON.parse` |
| platform route with `{"accessMode":"self_service"}` | 307 to `/en/self-service` |
| `OPTIONS /en/login` | 404 from `src/proxy.ts` |

The configured response headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Content-Security-Policy: frame-ancestors 'none';` were present on normal/redirect responses.

### `POST /api/cookie`

The success fixture was generated from `AuthApiResponse`/`UserData` fields in `src/app/Types/Login.ts`.

| Input | Result |
| --- | --- |
| verified `user` object | 200 JSON echo plus `Set-Cookie: quilr_auth=<encoded JSON>; Path=/` |
| `{}` | 307 to absolute `/login` URL |
| malformed JSON | 500 |

The route's cookie had `Path=/`; it did not add `HttpOnly`, `Secure`, `SameSite`, or an expiry. This is the isolated application's exact response, not a statement about an external proxy modifying headers.

### `POST /api/download-mdm-file`

| Input | Result |
| --- | --- |
| local HTTP text fixture and `fileName: "fixture.txt"` | 200, upstream body preserved, upstream `text/plain` preserved, attachment disposition set |
| upstream 404 | 500 JSON `{"error":"Failed to download file"}` |
| malformed JSON | same fixed 500 JSON |

The success probe confirms that the handler accepts a caller-supplied URL and buffers/returns its response. Target reachability and network restrictions in deployed environments remain external.

### Browser render/hydration

A real browser loaded `/en/login`.

- title: `QuilrAI Web`;
- visible heading: `Sign in to QuilrAI`;
- the client hydrated and rendered the login shell;
- navigation to `/en/ai-assets` without a cookie ended at `/en/login`;
- the login provider list displayed `Unexpected Error Occured` because the isolated run did not configure/reach `instance-manager/integrations/list`;
- no browser-console warning/error was captured for the tab.

The browser step verifies client rendering and redirect behavior. It does not verify external identity-provider login.

### Frontend shutdown

SIGINT stopped `next start`. There is no target application-specific shutdown hook or cleanup log. The process output retained stack traces from the intentionally malformed-cookie and malformed-JSON probes.

## BFF and ingress path verification

### Ingress source

`nginx-ingress-prod/ingress-services.yaml` and its preproduction counterpart declare:

- regex path `/(?:bff/)?quilr-query-builder(/|$)(.*)`;
- rewrite target `/$2`;
- direct service destination `quilr-query-builder:8052`.

Thus `/bff/quilr-query-builder/qb/health` is intended to reach the target as `/qb/health` without traversing the Node BFF.

### BFF source and dynamic trace

The BFF independently maps `/quilr-query-builder` to `http://quilr-query-builder:8052` through `express-http-proxy`. A local echo upstream verified:

| BFF input | Upstream observation |
| --- | --- |
| `GET /quilr-query-builder/widgets/health?x=1` | `GET /widgets/health?x=1` |
| `POST /quilr-query-builder/query/path?x=2` with JSON | `POST /query/path?x=2`, JSON preserved |
| browser `Cookie` header | removed before upstream |
| `Authorization: Bearer fixture` | preserved |

This resolves the service-prefix rewrite behavior for both known routes. It does not prove which route a particular deployed DNS/load-balancer currently selects.

## CI run verification

The exact target-commit GitHub Actions runs were inspected through the authenticated `amjad-f35` account.

| Target | Run | Top-level conclusion | Detect job | Build job |
| --- | --- | --- | --- | --- |
| query-builder | `30017726685` | success | success | skipped |
| web | `30077640570` | success | success | skipped |

Both runs checked out `ci-scripts@cf687f6a1713498d2843f0f60a8ddf30d672775d`. Its `scripts/ci.sh detect` only enables the reusable Nexus build for repositories explicitly listed in `config/<type>-libraries.txt`.

- query-builder log: Java repository, `scripts/java/ci-java.sh`, not present in `java-libraries.txt`, `Build skipped: true`;
- web log: Node repository, `scripts/node/ci-node.sh`, not present in `node-libraries.txt`, `Build skipped: true`.

**Contradiction:** the target workflow comments describe compile/publish gating broadly, but at these exact commits a green workflow conclusion did not compile either target.

The web's separate Platformdocs run `30077640178` did execute and built the documentation repository; it did not build/test the web application.

Jenkins remains the repository-visible application build path:

- query-builder runs `mvn clean package -DskipTests`;
- web builds its Dockerfile/npm graph;
- shared `pushToCR.groovy` uses mutable `latest`-family tags for query-builder and commit/branch-derived handling for web in selected registries.

No Jenkins execution log was available, so the local clean builds—not a Jenkins run—prove the pinned source compiles.

## Deployment-source verification

The Axis chart provides concrete target manifests absent from the target repositories:

| Property | query-builder | web |
| --- | --- | --- |
| service port | 8052 | 3000 |
| replicas/HPA | min 1, max 1 | min 1, max 1 |
| image | ECR `main/...:latest`, pull always | ECR `main/...:latest`, pull always |
| requests | 125m CPU / 512 MiB | 125m CPU / 512 MiB |
| limits | 1000m CPU / 2048 MiB | 1000m CPU / 1024 MiB |
| readiness/liveness | TCP 8052, 40 s delay | probe blocks commented out |
| configuration | Vault + ConfigMaps + secret ref + shared volume | inline public env + ConfigMaps + secret ref |

**Important runtime implication:** a TCP query-builder probe can succeed in the observed state where ClickHouse/Neo4j features are failing.

**Unresolved:** these commits prove intended manifests, not the currently rendered live objects, image digests, pod state, or cloud load-balancer path.

## Migration and schema evidence

The migration repository resolves several earlier source gaps.

### PostgreSQL

`quilr/V20260223120001__create_tenant_app_whitelisted_behaviours.sql` and the consolidated initial migration define the target entity table:

- table `public.tenant_app_whitelisted_behaviours`;
- columns `tenant`, `app_id`, `behaviour_id`, `updated_by`, `update_time`;
- composite primary key `(tenant, app_id, behaviour_id)`;
- separate indexes on `app_id`, `tenant`, and descending `update_time`.

The initial Quilr migration also defines `public.ai_conv_filters` with:

- `subscriber_id`, `tenant_id`, and `user_email` required;
- app/account/prompt/model filter strings;
- timestamps;
- primary key `id`;
- duplicate-named-in-purpose unique constraints on `(subscriber_id, tenant_id, user_email)`.

This resolves the physical source schema for the two target JPA/external entity families. Live schema drift is still unresolved.

### ClickHouse

Cluster, SaaS, and PaaS migration trees define engines, columns, order/partition clauses, and later changes for many target-referenced tables, including asset, interaction, status, audit, app-setting, user, and endpoint tables.

**Partially resolved:** migration DDL is now available and is the best source-controlled physical model. It does not prove:

- which migration profile/environment is deployed;
- the current migration version;
- manual post-migration changes;
- live grants, row policies, projections, or distributed/local table mappings;
- row counts and query plans.

### Neo4j

Supporting graph source clarifies labels/queries used by adjacent services, but no live `SHOW CONSTRAINTS`/`SHOW INDEXES` output or authoritative deployed schema snapshot was available. The live model remains partially unresolved.

## Supporting component test results

These are tests of the directly required private frontend dependency, not tests tracked by `quilr-web`.

### Repository-default attempt

The component package declares React/React DOM only as peers. The isolated install used `--legacy-peer-deps` to resolve the package graph and therefore did not install those peers. All 18 Jest suites failed before executing a test because `react/jsx-runtime` was absent. Jest also warned that the root and `src/themes/package.json` share the same package name.

### With declared peers explicitly installed

After installing React and React DOM 19.2.1:

- 18 suites discovered;
- 12 suites passed;
- 6 suites failed;
- 113 tests executed;
- 90 passed;
- 23 failed.

Failure distribution:

- ToggleSwitch: 5;
- TextToPDF/generatePDF: 11;
- Tabs: 1;
- Select: 1;
- Dropdown: 1;
- Drawer: 4.

Several failures show stale test selectors/expectations versus current component test IDs; TextToPDF failures also exercise DOM/PDF assumptions. This result proves the component suite currently runs only with peer provisioning and is not green at the inspected commit.

The target web build still passed because its consumer graph supplies React and it does not run the component repository's Jest suite.

## Lightweight local load probes

These are smoke measurements on one development machine, not capacity results.

| Target | Request | Requests / concurrency | Failures | Mean request time | Longest |
| --- | --- | ---: | ---: | ---: | ---: |
| query-builder | internal `GET /qb/health` | 100 / 10 | 0 | 5.068 ms | 26 ms |
| web | `GET /en/login` | 100 / 10 | 0 | 11.765 ms | 16 ms |

The routes are cheap health/static-cache paths and do not touch real ClickHouse/PostgreSQL/Neo4j workloads. No broader performance conclusion is warranted.

## What dynamic verification did not cover

The following remain outside the evidence:

1. live ClickHouse, PostgreSQL, and Neo4j data, grants, drift, scale, and query plans;
2. real identity provider, PDP, instance-manager, LLM/MCP, compliance, browser-extension, graph, and other service contracts end to end;
3. a deployed Kubernetes cluster, live ingress selection, Vault injection, image digests, autoscaling, rollout, and rollback;
4. Jenkins execution logs and artifact-registry immutability;
5. browser sessions authenticated through a real issuer;
6. long-duration, data-backed, soak, chaos, and production-load testing;
7. dynamic execution of every one of the 141 endpoints and every one of thousands of UI branches, which would require the missing service/data estate and valid domain fixtures.

These are environment-evidence limits, not unprocessed target files. The two pinned target repositories still have complete file and parser-recognized symbol accounting.
