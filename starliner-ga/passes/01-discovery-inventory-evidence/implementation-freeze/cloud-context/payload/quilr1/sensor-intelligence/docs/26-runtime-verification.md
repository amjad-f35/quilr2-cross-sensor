# Runtime Verification

**Evidence status:** complete reconciliation of the development-time dynamic
evidence available for the pinned Quilr 1 repositories. This is not a claim
that the unavailable production estate was exercised.

The command transcripts, versions, runtime fixtures, response excerpts, and
supporting-repository commit ledger are in
[`quilr-platform-analysis/22-dynamic-verification.md`](../../../quilr-platform-analysis/22-dynamic-verification.md).
This chapter interprets that evidence specifically for the proposed Quilr 1
adapter and platform migration.

## What was actually executed

| Area | Verified execution | Result | Integration consequence |
| --- | --- | --- | --- |
| query-builder build | Maven clean/package with Java 21 and Maven 3.9.11 after resolving pinned private sources into an isolated repository | passed; executable 117,763,412-byte JAR, 370 application classes, 158 nested JARs, `com.quilr.QBApp` start class | pinned backend source compiles; the target repository contains no discovered tests |
| query-builder startup | Redis absent; PostgreSQL absent; then Redis present plus H2 launch-time relational substitute while ClickHouse/Neo4j were absent | Redis and relational failures were startup-fatal; with H2 the process became HTTP-ready while ClickHouse/Neo4j work failed | process readiness and source-capability health must be separate adapter states |
| route registration | running Spring application mapping inventory | 141 custom operations, 141 handler registrations, 26 application controllers | static route inventory is runtime-confirmed |
| backend HTTP | selected health, Actuator, CORS, authorization-code, audit, and validation paths | exact outcomes recorded below | compatibility must preserve intentionally selected response behavior, not accidental status contradictions |
| shutdown | SIGINT | Spring hook ran; listener logged; Kafka producers closed; ClickHouse client close began; process exited | no observed drain/requeue/checkpoint repair exists for an adapter |
| decoder | seven-test isolated harness | signature, expiry-if-present, tenant, invalidation, exclusion, context cleanup, and internal-header behavior passed | current auth behavior is known locally; deployed issuer/gateway behavior remains external |
| authorization | seven-test isolated harness | aspect decisions and REST-client allow/deny/failure behavior passed | annotation coverage and fail mode must be inventoried for compatibility; canonical policy remains platform-owned |
| Redis work set | two live-Redis tests | duplicate claim reproduced: both consumers received the same 800 members | legacy queue is not an acceptable delivery WAL |
| web checks/build | locked install, typecheck, lint, format check, production build | all passed; lint produced 44 warnings; 114 static outputs; no test script | pinned web source builds, but has no repository-native automated test suite |
| web runtime | `next start`, HTTP probes, and browser hydration | ready; middleware and both App Router handlers exercised | cookie and download behavior are runtime-confirmed; real IdP flow is not |
| BFF/ingress | supporting source plus local echo upstream | service-prefix stripping, query/body forwarding, cookie removal, and Authorization preservation verified | compatibility routing has two repository-visible paths; live load-balancer selection remains unresolved |
| CI | exact GitHub Actions runs through the approved account | both green top-level runs skipped their application build jobs | green workflow state is not build evidence |
| load smoke | 100 requests at concurrency 10 to backend health and web login | zero failures; mean 5.068 ms and 11.765 ms respectively | only cheap-route smoke; no data-backed capacity conclusion |

## Backend failure and health semantics

**Verified:**

- no Redis caused decoder/Redis initialization failure before a usable Tomcat
  listener;
- unavailable configured PostgreSQL failed JPA `EntityManagerFactory`
  construction;
- after substituting H2 only at launch, unavailable ClickHouse and Neo4j did
  not prevent HTTP readiness;
- ClickHouse client creation failure was caught and left later work operating
  against a null/unavailable client;
- graph startup/scheduled work logged connection errors after HTTP readiness;
- `GET /qb/health` required identity processing despite Spring `permitAll`;
- an enabled `internal: true` path returned `200 RUNNING`;
- `GET /actuator/health` returned `503 {"status":"DOWN"}` in the same process.

**Integration rule:** the adapter health model needs at least distinct
`process_ready`, `source_reachable`, `schema_compatible`, `extracting`,
`delivery_healthy`, and `reconciliation_balanced` states. A TCP probe or
`/qb/health` response cannot be used as proof that ClickHouse, Neo4j, or any
particular extraction profile works.

## Backend interface observations

| Probe | Verified result | Disposition |
| --- | --- | --- |
| no identity to `/qb/health` | 401 | compatibility test case; do not infer public reachability from `permitAll` |
| malformed bearer | 400 | current decoder error behavior |
| configured-origin CORS | origin echoed; credentials allowed | preserve only if the compatibility facade remains browser-facing |
| unconfigured origin | 403 | verified allowlist enforcement |
| invalid ClickHouse operations code | HTTP 200, wrapper `SUCCESS`, nested unauthorized status | contradiction to normalize in canonical API; optionally reproduce in a legacy facade |
| audit route with unavailable ClickHouse | 500 | source failure propagates for this path |
| missing required red-team `tenant` | 400 | framework parameter validation works |

The serialized `ServiceResponse` test verifies the referenced property names
and types. It does not make nested application status equivalent to HTTP
status.

## Authentication and authorization boundary

The decoder harness verified RSA/SHA-512 validation, tamper/expiry rejection,
tenant membership, Redis invalidation, method-specific exclusions, request
context cleanup, and the configured internal-header bypass. It also showed:

- verification uses configured RSA SHA-512 rather than deriving the algorithm
  from the JWT header;
- a validly signed fixture whose header said `alg: none` was accepted;
- `exp`, `iss`, and `aud` are not universally required by this library;
- a missing selected-tenant header is accepted;
- internal-header mode changes whether the bypass succeeds.

The authorization harness verified missing-context 401, missing-tenant 400,
PDP denial 403, configured fail-open/fail-closed behavior, request-context
absence skipping the aspect, SpEL tenant extraction, and REST-client
translation of 2xx/4xx/unreachable outcomes.

**Boundary:** these are verified library contracts in a development harness.
The real issuer claims, gateway stripping/injection, PDP policies, and
unannotated-route protection cannot be derived from the two target
repositories.

## Delivery and concurrency evidence

`RedisLockService.popFromSet` iterates an `RSet`, builds a local result, and
then calls `removeAll`. It does not atomically claim each member. In the
barrier test, two consumers each returned all 800 members. The set was later
drained, so the observed outcome was duplicate delivery rather than retained
work.

`AppSyncScheduler` normally uses a distributed scheduler lock, reducing
healthy overlap. That does not supply durable acknowledgement, replay,
dead-letter handling, or protection after lock expiry/failure. Items are
removed before downstream processing.

**Decision:** the proposed adapter must use the Starliner WAL/outbox and
durable acknowledgement path. Redis caches, locks, markers, and work sets are
operational legacy state, not migration truth.

## Frontend observations

The locked application compiled and ran on Node 20.20.2, Next 16.2.6, and the
reconstructed private component package 0.2.79. The source package identity
and build are verified; byte identity with the unavailable Nexus tarball is
**Unresolved**.

Runtime behavior:

- `/` redirected to `/en/`;
- `/en/login` rendered;
- a protected route without the cookie redirected;
- a parseable `{}` cookie admitted the protected route;
- a malformed cookie caused an uncaught `JSON.parse` 500;
- self-service access mode redirected to `/en/self-service`;
- `OPTIONS /en/login` returned 404 from `src/proxy.ts`;
- `/api/cookie` echoed a verified typed user fixture and set the configured
  cookie with `Path=/`; the application added no `HttpOnly`, `Secure`,
  `SameSite`, or expiry attributes;
- `/api/download-mdm-file` fetched and buffered a caller-provided local URL,
  preserved the content type, and set attachment disposition; upstream 404 or
  malformed JSON became a fixed 500 response;
- browser hydration reached the login shell, but the provider list reported
  an error because instance-manager was absent.

These results support compatibility and failure tests. They do not prove a
real authentication session or deployed outbound-network policy.

## CI and deployment contradiction

The exact query-builder run `30017726685` and web run `30077640570` concluded
success, but the reusable build job was skipped because neither repository was
listed in the relevant `ci-scripts` library list. Therefore:

> **Contradiction:** repository workflow commentary implies broad
> compile/publish gating, while the exact green runs did not compile either
> target.

Jenkins source describes application builds but no Jenkins execution log was
available. Local clean builds are the build proof for these commits.

Axis/ingress source verifies intended ports, one-replica HPAs, mutable
`latest`-family query-builder image usage, resources, config/secret sources,
and a query-builder TCP probe. It does not verify rendered live resources,
Vault values, image digests, pods, rollouts, or load-balancer selection.

## Evidence not available

The following are explicit external-evidence limits:

1. live ClickHouse, PostgreSQL, and Neo4j schema versions, data, grants, drift,
   row policies, counts, plans, and scale;
2. real IdP, PDP, instance-manager, LLM/MCP, compliance, extension, graph, and
   other service flows;
3. deployed Kubernetes, Vault, ingress, image digests, autoscaling, rollout,
   rollback, and Jenkins logs;
4. authenticated browser sessions from the production issuer;
5. data-backed load, soak, chaos, failover, upgrade, and recovery;
6. dynamic invocation of all 141 API operations and all UI branches.

These limits do not represent unprocessed target files. They are prerequisites
for production adapter certification and are tracked in
[`31-open-questions.md`](31-open-questions.md).

## Second-pass conclusion

No additional live estate was available during this specialized pass, so no
new endpoint sweep is claimed. The existing dynamic harness has been
reconciled into adapter requirements:

- capability-specific health rather than TCP readiness;
- durable WAL/outbox rather than the legacy Redis work-set operation;
- typed status/error normalization;
- explicit auth/policy authority boundaries;
- compatibility tests for verified frontend/backend behavior;
- parity, reconciliation, cohort, and rollback testing before cutover.

