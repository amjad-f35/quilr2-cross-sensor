# Product API Contract

## Boundary

`starliner-api` is the only customer product-data API for this pass. The Nuxt application, exports and external customers do not query sensors, PostgreSQL, ClickHouse or legacy services directly.

The executable contract is [die-v1.openapi.yaml](openapi/die-v1.openapi.yaml). This document freezes behavior not conveniently expressed in OpenAPI.

## Resource surface

| Surface | Operations |
|---|---|
| Overview | scoped counts, freshness, coverage and recent changes |
| Generic inventory | canonical entity lists and entity detail/provenance for investigation and extension |
| Application inventory | product/surface/deployment rollup list and hydrated detail |
| Agent deployments | deployment-scoped list; hydrated agent/device/execution-identity/MCP detail; bounded exposure paths |
| Model inventory | strongest-supported model layer list and hydrated provider/version/deployment/route detail |
| MCP inventory | deployment-scoped server list and hydrated tools/resources/prompts/activity detail |
| Device context | sensor-observed device list/detail; explicitly not complete MDM inventory |
| Identity context | observed source-scoped/resolved identity list/detail; explicitly not a complete directory |
| Relationships | authorized direct neighbors and bounded two-hop expansion |
| Activity | canonical activity search and detail |
| Evidence | safe metadata, lineage and separately authorized content access |
| Coverage | intervals, source/capability state and gaps |
| Producers | installation, capability, certification, queue and health state |
| Identity | explanation, conflicts, correction preview and commit |
| Authorization | scopes, role bindings, curated relations and preview/commit administration |
| Export | authorized snapshot jobs and short-lived download access |
| Audit | authorized audit-event search |

There are no findings, risk scores, recommendations, policy objects, cost, business-value or enforcement configuration endpoints in this pass.

Authorization preview/commit routes are served only by the admin API surface. Commit is a synchronous, optimistic, idempotent PostgreSQL transaction that returns the new `authorization_revision`; it cannot mutate canonical inventory. Read API replicas have no authorization-writer credential.

## Authentication and tenancy

- bearer tokens must be issuer-, signature-, audience- and expiry-validated;
- tenant is resolved from a trusted identity mapping, never `tenant_id` supplied by the caller;
- service credentials and interactive user tokens use distinct audiences/scopes;
- every request gets a ULID request ID; a valid caller `X-Request-ID` is preserved as correlation metadata;
- the response exposes the resolved request ID, never credentials or internal database identifiers.

## Response metadata

Every successful product read includes:

- `request_id`;
- `generated_at`;
- `canonical_watermark`;
- `projection_watermark`;
- `projection_generation`;
- `authorization_revision`;
- `coverage_state`;
- `freshness` with source/canonical/projection lag;
- `partial` and machine-readable `warnings`.

This prevents a polished number from concealing incomplete coverage or a stale projection.

## Consistency

Default reads are projection-consistent:

- a request resolves one active synchronized product projection generation at its beginning; that generation covers every required PostgreSQL and ClickHouse destination partition rather than choosing unrelated store-local generations;
- all PostgreSQL and ClickHouse queries for that response use that generation/watermark;
- the API does not mix active generations;
- activity results cannot claim a canonical watermark newer than the entity/relationship context used to serialize them;
- a lagging optional section returns `partial=true` and a warning or `503`, never silently older data.

`consistency=canonical` is allowed only for entity/identity detail and authorized operator paths. It reads authoritative PostgreSQL state and is not a general list/search mode.

Read-after-write correction responses return the canonical version/watermark committed. A client may pass `min_canonical_watermark`; the API waits only for a short configured bound and then returns `202/409` guidance rather than tying up a request indefinitely.

## Pagination and sorting

- list endpoints use opaque signed cursors, never offset;
- cursor contents bind tenant, authorization revision, projection generation, normalized filter, sort and final stable ID;
- default/max page sizes are `50/200`;
- activity/evidence default/max page sizes are `100/500`;
- time ranges are bounded and required for activity/evidence queries;
- allowed sort fields are endpoint-specific and use stable ID as final tie-breaker;
- invalid, expired, cross-tenant or revision-stale cursors return `400 CURSOR_INVALID` or `409 CURSOR_STALE`;
- totals are optional authorized estimates or exact bounded counts; pages do not require a full count.

## Query rules

- filtering happens before aggregation and pagination;
- full-text-like query applies only to explicitly indexed safe fields;
- exact source/native IDs require `sensitive_metadata` visibility;
- arbitrary SQL/graph/path expressions are not accepted;
- generic relationship expansion is direct by default and at most two hops;
- agent exposure paths use a separate allowlisted endpoint capped at four hops; callers cannot submit predicates or a graph query language outside its fixed registry;
- a response omits inaccessible endpoints/edges and reports `authorization_filtered=true`;
- list projections cannot be used to infer raw evidence availability.

## Entity detail

Entity detail includes:

- canonical type, lifecycle, selected fields and version;
- first/last observation;
- coverage and ambiguity;
- permitted direct relationships;
- recent canonical activity summary;
- source observation summary;
- per-field provenance and selected claim IDs where authorized;
- identity explanation link.

The response clearly labels `structural`, `configured`, `entitlement`, `observed`, `ownership` and `coverage` relationships. It never returns source-emitted “canonical” IDs.

## Agent deployment read model

`GET /inventory/agent-deployments` lists deployments, not agent definitions or process instances. A local row is one resolved agent definition, exact device and source-authority installation/configuration scope. Version, project, workspace, repository, process and session are attributes, relationships or activity; they do not multiply the inventory. Observation user and exact execution identity are separate nullable fields with independent evidence and assurance. An execution identity participates in identity only when the owning source explicitly defines the deployment as user-bound.

`GET /inventory/agent-deployments/{id}` returns one bounded hydrated DTO containing the definition, version/kind/locality, device context, observation identity context, independently proved execution identity/person context where resolved, related workload, configured MCP server deployments, configured models, hooks/skills/plugins/configured permission rules, repositories, recent activity, sources, coverage and identity assurance. The browser performs no per-row sensor calls or client-side joins.

`GET /inventory/agent-deployments/{id}/exposure-paths` returns only persisted registered paths of at most four edges. Every path identifies whether its support is `configured`, `entitlement` or `observed`, includes coverage and source support, applies the caller's authorization filter, and never treats `runs_as` as proof that the agent can reach everything its user could reach. Without authoritative entitlement connectors, the endpoint can still return configured and observed paths, while `entitlement_coverage` is `unsupported` or `unknown`.

## Other inventory read models

The customer UI uses typed list/detail operations rather than interpreting `safe_summary`:

- `listApplications` / `getApplication`;
- `listModels` / `getModel`;
- `listMcpServers` / `getMcpServer`;
- `listDevices` / `getDevice`;
- `listIdentities` / `getIdentity`.

An application list row is rooted at a resolved product when possible; an unresolved surface or deployment remains a source-scoped rollup with `aggregation_level=surface|deployment`. It is never hidden merely because a product join is unavailable. Model rows identify their actual supported layer, so Endpoint `ModelData` remains `asset_level=product` and cannot populate provider version/deployment fields. MCP rows are deployment-scoped; Endpoint and Gateway deployments stay separate until exact identity resolution. MCP capability counts resolve one authorization-scoped or explicitly shared-legacy capability view and return `capability_scope_state`; they never union different authorization contexts. MCP detail returns safe scope/freshness state, protocol version and warnings, never source authorization-context or endpoint-fingerprint tokens. Device and identity collections state their sensor coverage boundary in response metadata.

Each hydrated detail returns bounded related collections, recent activity, source summaries and field provenance in one response. Implementations may execute several bounded SQL statements inside the central read repository at one projection generation; they may not fan out to sensors/legacy services or make the frontend reconstruct cross-sensor identity.

Detail DTOs use explicit composition: the corresponding list-row DTO is returned under `data.summary`, while hydrated collections and detail-only attributes remain named fields under `data`. This avoids JSON Schema's closed-object inheritance trap and gives generated clients one stable list/detail boundary. A client must not assume summary fields are duplicated at the detail root.

## Evidence

Metadata endpoints return the admitted record identity, admission-time producer/profile/scope/environment/sensitivity/trust state, times, content digest/size, capture/evidence-quality state, authorized safe correlation, canonical links, normalizer/materializer versions and current disposition/retention state. Historical admission metadata never changes when a producer later moves scope or loses trust.

They do not return the immutable body. `POST .../content-access` performs the separately authorized, purpose-bound flow from the authorization specification and persists a short-lived grant before returning a URL under the DIE API. Redemption locks the active grant, rechecks tenant/principal/purpose/authorization revision/expiry, marks it consumed and appends access audit in one transaction, then `GET /evidence-content-access/{access_id}` streams bytes with `no-store`; retry after consumption returns `410`. If object streaming subsequently fails, failure is audited and the user must request a new grant—the server never makes a consumed grant reusable. Direct object-store signed URLs are not part of v1 because ordinary object stores cannot guarantee one-time redemption. The permanent object key is never exposed.

## Identity mutation protocol

`POST /identity/actions:preview` accepts one of:

- bind/unbind source object;
- merge entities;
- split bindings;
- field correction.

It persists and returns a short-lived preview ID, affected rows, invariant failures, current versions and a preview digest. `POST /identity/actions` requires:

- `preview_id`;
- `Idempotency-Key`;
- `If-Match` authorization/canonical revision token;
- exact preview digest;
- actor reason and ticket/reference where configured;
- step-up-authenticated principal.

The request atomically creates an identity command, work handoff and request audit and returns `202`. The truth role later commits all canonical/identity/outbox/result/audit changes or records a terminal rejection. `GET /identity/actions/{command_id}` exposes status without making the API a canonical writer.

Every POST uses `die_pipeline.api_idempotency`, including previews and
content-access requests. The idempotency scope is tenant, principal, operation
and key hash. The ledger binds the normalized request digest and stores the
committed response; a same-key/different-request retry returns
`IDEMPOTENCY_CONFLICT`. Expired in-progress rows are terminalized by maintenance.
Only the maintenance role may delete an expired terminal idempotency row; API
and ordinary workers cannot erase replay history.

## Exports

Exports reuse the same filters and authorization field mask as interactive
queries. The job and normalized child-field rows store:

- requester and authorization revision;
- normalized filter plus its digest;
- exact ordered field set and classification;
- authorization decision, scope/filter and field-mask digests;
- fixed `die_product_v1` generation, canonical watermark and activity
  watermark;
- artifact digest, expiry and audit.

The export worker receives that immutable snapshot and may only narrow it. It
does not re-plan a wider query. Authorization is checked again under the
separate `export.download` capability at download time. Revocation can deny a
previously completed download.

Job creation locks and verifies that the referenced product generation is
currently active and has applied at least the captured canonical watermark; a
nonexistent, standby, retired, behind or independently named projection cannot
be persisted as the export source.

`GET /exports/{export_id}` returns state and the authenticated relative `download_path`; it never returns a durable object-store URL. `GET /exports/{export_id}/content` rechecks tenant, principal, authorization revision, job state and expiry before streaming with `no-store`.

## Errors

Errors use `application/problem+json` with:

- stable `code`;
- safe title/detail;
- request ID;
- retryability;
- optional retry-after;
- field violations;
- current watermark/revision where relevant.

Frozen codes include:

`AUTHENTICATION_REQUIRED`, `AUTHORIZATION_DENIED`, `RESOURCE_NOT_FOUND`,
`VALIDATION_FAILED`, `CURSOR_INVALID`, `CURSOR_STALE`, `REVISION_CONFLICT`,
`IDEMPOTENCY_CONFLICT`, `PROJECTION_LAG`, `SOURCE_DATA_PARTIAL`,
`RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`, `INVARIANT_VIOLATION`.

Customer input errors do not expose SQL, object keys, stack traces, source payloads, tokens or candidate data outside authorization.

## Rate and resource protection

Budgets apply per tenant, principal, client and query class. The API limits:

- page size and time range;
- graph expansion nodes/edges;
- search clauses;
- concurrent exports;
- raw evidence bytes/access frequency;
- response size and execution time.

Cancellation propagates to PostgreSQL/ClickHouse. Timeouts are shorter than gateway timeouts. A timed-out query is cancelled, not allowed to continue consuming capacity.

## Compatibility

- the major version is in the path;
- additive optional fields and enum values may be added in v1;
- clients must tolerate unknown enum values through generated `unknown` handling;
- removing/renaming fields or changing meaning requires v2;
- field deprecation includes telemetry, published date and minimum support window;
- OpenAPI and generated Go/TypeScript clients are built and diff-gated in CI.

## API implementation pipeline

```text
HTTP
→ request limits
→ authentication
→ trusted tenant/principal
→ authorization decision/filter
→ validated application query
→ authorized repository
→ PostgreSQL/ClickHouse adapters
→ field-mask serializer
→ response metadata
→ access audit
```

Transport handlers contain no identity resolution, canonicalization or projection logic.
