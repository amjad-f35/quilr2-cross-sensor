# Open questions and resolved evidence gaps

This ledger distinguishes questions that remain open from gaps resolved by supporting source, clean builds, CI logs, live processes, HTTP/browser probes, and the dynamic harness. The full evidence is in [dynamic verification](22-dynamic-verification.md).

No item below represents an unprocessed target-repository file.

## Remaining open or partially resolved questions

### SEC-03 — deployed tenant-header trust boundary

**Partially resolved:** decoder source and tests show that:

- selected tenant is validated when the `tenant` header is present;
- a missing tenant header is accepted by the decoder;
- `RequestFilter` can fall back to raw `tenant`/`subscriberid` headers when no external context supplies values;
- known BFF and ingress sources forward identity headers to query-builder, with BFF removing cookies but preserving `Authorization`.

**Unresolved:** which callers can reach the currently deployed service directly, whether the internal-header bypass is enabled there, and whether a gateway always provides validated tenant/subscriber context.

Needed evidence: rendered ingress/network policy/API-gateway policy plus black-box requests from each reachable network zone.

### SEC-04 — production cookie rewriting

**Verified application behavior:** `POST /api/cookie` sets the JSON auth value with `Path=/` and no `HttpOnly`, `Secure`, `SameSite`, or expiry attribute. The cookie is intentionally read by client code.

**Unresolved:** whether any deployed proxy supplements or rewrites attributes and what the real identity-provider/OAuth cookie capture contains.

### BUILD-02 — published private artifact equality

**Partially resolved:** source and builds were obtained for decoder, authorization, Kafka, common/DWH/graph/cache/response, and component libraries. The target Maven build passed.

**Unresolved:** the locally packed `@quilrbusiness/quilr-components@0.2.79` tarball has a different integrity from the private Nexus artifact in the target lockfile. Source name/version and consumer build are verified; byte-for-byte published-artifact equality is not.

### OPS-01 — current live deployment state

**Partially resolved:** Axis/SaaS Helm, ingress, BFF, Vault references, resources, probes, service ports, replicas, and image tags were found in pinned supporting repositories.

**Unresolved:** current rendered objects, image digests, applied overlays, pod health, DNS/load-balancer selection, Vault values, network policies, and cloud control-plane state.

### OPS-04 — rollback guarantees

**Partially resolved:** Jenkins shared-library source shows mutable `latest`-family handling for query-builder and registry-specific web tagging. Charts reference mutable tags with pull-always.

**Unresolved:** registry immutability, revision retention, operational runbook, migration compatibility, and a tested rollback result.

### DATA-01 — live ClickHouse schema and grants

**Partially resolved:** cluster/SaaS/PaaS migration trees define source-controlled tables, engines, columns, ordering/partition clauses, and later changes for many target queries.

**Unresolved:** deployed migration profile/version, schema drift, grants, row policies, distributed/local mappings, projections, row counts, retention state, and query plans.

### DATA-03 — live Neo4j schema and ownership

**Partially resolved:** supporting graph/common sources show labels, queries, adapters, and graph-to-warehouse consumers.

**Unresolved:** deployed constraints/indexes, complete relationship cardinalities, authoritative ownership, live drift, and cross-store reconciliation guarantees.

### DATA-05 — cross-store idempotency

**Unresolved:** whether every repeated status resolution, sync, whitelist, and backfill operation is idempotent against the actual deployed ClickHouse engine/order/version design and external-service behavior.

Needed evidence: migrated live DDL plus repeated-operation/fault-injection integration tests.

### API-05 — external service contracts

**Partially resolved:** BFF configuration enumerates service destinations and forwarding behavior. Frontend call sites and local request types are documented.

**Unresolved:** real LLM/MCP/compliance/config-manager/identity/instance-manager/browser-extension/other-service request and response contracts, authentication, versioning, and failure semantics where their service repositories/specifications were not inspected.

### REL-02 — bootstrap repair

**Unresolved:** operational reset or repair after master bootstrap moves Redis state before async work finishes and the downstream work fails.

Needed evidence: runbook, administrator endpoint, orchestration job, or a source change implementing retry/reset.

### REL-04 — complete outbound timeout coverage

**Partially resolved:** BFF defaults connection/proxy timeout to 120 seconds; browser-extension client uses explicit 1-second connect/5-second read timeouts.

**Unresolved:** actual constructed timeout/pool/retry settings for every generic `RestTemplate`, graph, Feign, and external client path.

### VAL-01 — runtime asset identifier boundary

**Potential issue requiring validation:** DAO/source analysis shows dynamic search/filter/sort identifier handling without a repository-global allowlist.

**Unresolved:** the complete reachable controller DTO validation and gateway schema policy under real requests, plus adversarial integration results.

### VAL-02 — ClickHouse operations effective scope

**Potential issue requiring validation:** local statement guards and wrapper behavior are documented; an invalid access code was dynamically rejected inside HTTP 200.

**Unresolved:** live database role grants, network reachability, upstream authorization, and effective data scope for a valid operator request.

### VAL-05 — live status of committed development values

**Unresolved:** whether any committed ClickHouse/Neo4j/Redis/PostgreSQL/ops/encryption development fallback remains active in any environment.

Needed action: live secret/config inventory and rotation audit outside source archaeology.

### UI-01 — intended route-permission product matrix

**Unresolved:** whether the 53 pages with no local permission rule are intentionally visible to all authenticated platform users or omitted from the UI policy map.

### UI-02 — deployed feature flags

**Unresolved:** which environments enable adversarial/insider, data insights, executive dashboard, decision sidebar, lens, events, prompts, and other documented flags.

### UI-03 — incomplete-action delivery plan

**Verified implementation status:** asset add, MCP client delete, AI agent mutations, guardrail save, integration save/key generation, and real activity IDs contain TODO/placeholder behavior.

**Unresolved:** planned completion scope and schedule, which require issue-tracker/product evidence.

### TEST-01 — live pipeline and end-to-end verification

**Partially resolved:** exact GitHub Actions runs were inspected and skipped the application build jobs. Local clean builds and dynamic tests passed as documented. Jenkins source skips backend tests; no Jenkins execution log was available.

**Unresolved:** whether a separate pipeline/repository executes behavioral tests against deployed artifacts, and the result of full authenticated, data-backed end-to-end/soak/chaos testing.

## Resolved questions

### SEC-01 — decoder semantics

**Resolved:** supporting source plus seven passing dynamic tests document signature, expiry, revocation, excluded path, internal header, tenant-selection, malformed-token, response, and context-cleanup behavior.

See [dynamic verification: Decoder](22-dynamic-verification.md#decoder-dynamic-harness).

### SEC-02 — authorization aspect and PDP client

**Resolved for library behavior:** supporting source plus seven passing tests document annotation interception, SpEL inputs, missing-context responses, allow/deny, fail-open/fail-closed, header/body forwarding, and unreachable-PDP conversion.

Deployed global/gateway policy remains part of SEC-03/OPS-01.

### BUILD-01 — Maven compilation

**Resolved:** the unmodified target POM built successfully under Java 21/Maven 3.9.11. The executable JAR contains 370 application-class entries and 158 nested JARs. Compiler plugin `<skip>true>` did not suppress main compilation.

### BUILD-03 — reusable workflow and exact target runs

**Resolved:** both target workflows used `ci-scripts@cf687f6a1713498d2843f0f60a8ddf30d672775d`. The exact target-commit runs had successful detector jobs and skipped build jobs because neither target is present in the reusable library allowlist.

### OPS-02 — `/bff` and service-prefix rewriting

**Resolved for known source paths:**

- NGINX matches optional `/bff/`, matches `quilr-query-builder`, and rewrites to `/$2` before direct service forwarding;
- BFF's Express mount independently strips `/quilr-query-builder`;
- live BFF echo tests preserved query/body/authorization and removed cookies.

Which live route is selected remains an OPS-01 deployment-state question.

### OPS-03 — Actuator availability

**Resolved in the built dependency graph:** the running JAR exposed Actuator health, mappings, environment, metrics, and other configured endpoints. `/actuator/health` reported DOWN/503 when external stores were unavailable.

### DATA-02 — PostgreSQL whitelist schema

**Resolved in migration source:** `public.tenant_app_whitelisted_behaviours` has the documented composite primary key and three indexes. Live drift is covered by OPS-01 rather than a missing schema definition.

### DATA-04 — conversation-filter entity

**Resolved in migration/common source:** `public.ai_conv_filters` schema, required tenancy/user fields, filter fields, timestamps, primary key, and unique tenancy/user tuple are defined.

### API-01 — `ServiceResponse` wire model

**Resolved:** common-library source and a passing serialization test verify its JSON property shape and target wrapper use.

### API-02 — conversation-filter endpoint mismatch

**Resolved as a contradiction at inspected commits:** frontend uses `GET /aiconversations/filters/app/users`; target backend implements POST `/aiconversations/filters/users` and GET account-related behavior. Known NGINX/BFF rewrites remove only service prefixes and do not transform this suffix/method.

### API-03 — `/findings/kpi`

**Resolved as an unimplemented target pairing:** the target backend mapping is commented out, the frontend still calls the path, and known NGINX/BFF routes do not synthesize an endpoint-specific replacement. A different deployed service could still own a differently based URL, but no such ownership is evidenced for the target call.

### API-04 — dynamic whitelist suffix

**Resolved to source-bounded behavior:** the frontend interpolation sources and matching backend concrete whitelist operations are documented in the cross-repository matrices. No additional gateway transformation was found.

### REL-01 — Redis queue semantics

**Resolved:** source shows iterate-then-`removeAll`, and a two-consumer live Redis test returned 800 duplicate members from an 800-member set. The target has no requeue/dead-letter call after removal.

### REL-03 — known replica and overlap topology

**Resolved for the Axis chart:** query-builder HPA min/max are both one. The scheduler distributed lock remains relevant for other charts/manual paths/lock expiry. Current live replica state remains OPS-01.

### VAL-03 — Next download route behavior

**Resolved at application level:** live requests verified caller-selected URL fetch, in-memory response return, filename disposition, upstream content type, and fixed 500 behavior for upstream/non-JSON failures. Deployed egress policy remains OPS-01.

### VAL-04 — auth cookie route behavior

**Resolved at application level:** live requests verified arbitrary schema-compatible user JSON is echoed and written to the auth cookie. Middleware treats a parseable cookie as authenticated UI state. Actual downstream API authorization still requires bearer/context enforcement.

### TEST-02 — pinned build baseline

**Resolved under the documented environment:**

- query-builder clean package passed;
- web exact-version install, typecheck, lint, format check, production build, and start passed;
- no target automated tests exist;
- supporting component tests are not green at its inspected commit.

## Other facts already resolved by static analysis

- GitHub access used the requested `amjad-f35` account.
- Exact commits and all 2,903 tracked files are recorded.
- Neither target uses tracked submodules or Git LFS pointers.
- 141 backend operations and 134 frontend route artifacts were enumerated and the live backend mapping count matched.
- Refresh middleware is not invoked by `src/proxy.ts`.
- Only one target-local JPA entity family exists.
- Seven backend operations have local method permission annotations.
- Both web Dockerfiles ultimately start as root.
