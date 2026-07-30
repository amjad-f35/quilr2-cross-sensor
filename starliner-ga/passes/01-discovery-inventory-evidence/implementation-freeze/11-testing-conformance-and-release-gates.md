# Testing, Conformance, and Release Gates

## Principle

The pass is releasable only when the complete path is proven:

```text
native sensor fixture
→ adapter/profile record
→ edge WAL and receipt
→ evidence
→ normalization
→ resolution/canonical ledgers
→ outbox/projections
→ authorization
→ API
→ Nuxt UI
```

Mock-only demonstrations do not satisfy a gate. Tests use production code, real schemas and real PostgreSQL/object/ClickHouse dependencies where the property depends on them.

## Test taxonomy

| Layer | Required evidence |
|---|---|
| pure unit | invariants, normalization, key construction, authority selection, authz decisions, cursor and serializer behavior |
| schema/contract | JSON Schema/OpenAPI validation, compatibility diff, generated bindings, unknown enum handling |
| golden profile corpus | sensor-native input to exact profile/envelope and normalized output |
| property/fuzz | parser bounds, determinism, idempotency, ordering, merge/split invariants, cursor/filter safety |
| component | one deployable role with real direct dependencies |
| integration | PostgreSQL + S3-compatible store + ClickHouse transaction/retry/rebuild behavior |
| end-to-end | certified producer through customer UI/API |
| fault/chaos | kill, delay, duplicate, reorder, corrupt, partition, failover and saturation |
| security | authn/authz/RLS/tenant/evidence/secret/supply-chain tests |
| performance | reference capacity profiles and SLO measurements |
| UI | component, contract, E2E, accessibility, visual and performance |
| restore/upgrade | backup restore, schema migration, mixed-version compatibility, rollback |

## Sensor/profile certification

Each Browser, Browser Backend, Endpoint, LLM Gateway and MCP Gateway profile has:

- valid minimal and maximal records;
- every record kind and lifecycle state;
- every capability/mode combination;
- missing/unknown/extension fields;
- Unicode, extreme lengths and boundary timestamps;
- privacy complete/minimized/redacted/metadata-only cases plus prohibited-fact non-admission;
- duplicate and conflicting record IDs/sequences/digests;
- offline queue, restart, epoch rotation, gap and retransmission;
- source-native correlation and negative-correlation cases;
- native decision and independently observed effect separation, including a decision with no observed effect;
- raw-secret/token/body leak canaries;
- exact expected normalized claims/candidates.

Certification binds:

```text
sensor artifact digest
+ Starliner runtime digest
+ profile/schema digest
+ golden corpus digest
+ test runner digest
+ result and expiry
```

“Same version string” is not sufficient.

## Contract gates

CI must:

1. parse and validate all JSON Schema Draft 2020-12 artifacts;
2. validate OpenAPI 3.1;
3. regenerate Go/Python/TypeScript bindings and require a clean diff;
4. compare schemas/OpenAPI to the previous release;
5. reject breaking v1 changes unless a declared major-version process is used;
6. validate all examples against exact schemas;
7. check producer schemas contain no canonical IDs;
8. check privacy-forbidden field names/patterns;
9. run old-client/new-server and new-client/old-server supported-window tests.

## Admission and evidence gates

- acknowledgement cannot occur before object and metadata/work commit;
- identical producer/epoch/sequence/record/digest is duplicate success;
- same sequence or record ID with different digest is rejected and audited;
- each record in a mixed batch has its own terminal/retry result;
- decompression byte/ratio limits resist bombs;
- canonical serialization/digest is stable across languages;
- tenant/producers/certification mismatch is terminal;
- signed producer manifests reject an unknown/inactive business scope, stale revision, expired signature, untrusted issuer/key, wrong tenant/producer, artifact mismatch and overlapping capability interval;
- applying the same producer manifest is an audited no-op while the same revision with different canonical bytes is rejected;
- tenant bootstrap atomically creates exactly one root scope/self-closure/authz revision/audit chain; identical replay is a no-op and a competing root is rejected;
- object-created/PG-failed retry converges to one evidence record;
- orphan scanner never deletes referenced or recently created objects;
- evidence rows and objects pass bidirectional inventory/digest verification;
- rejected input does not leak content into logs/metrics/error bodies.

## Worker and distributed-systems gates

For every stage:

- kill before transaction, during work and after commit/before acknowledgement;
- lease expiry and stale-token commit rejection;
- nonfinal expired-lease requeue and final-attempt lease-recovery quarantine;
- wrong-stage lease/update/execution rejection for every runtime workload role;
- terminal work without a matching execution and execution without a matching terminal work row both abort at deferred-constraint time;
- duplicate concurrent delivery;
- out-of-order and late input;
- reconciliation page-before-start, missing start, missing page, conflicting page digest and conflicting terminal record;
- retry exhaustion/quarantine/replay;
- noisy tenant fairness;
- partition pause/resume;
- graceful and forced shutdown.

Verify the durable invariant:

```text
committed stage output XOR no output
and, when output commits, its downstream handoff commits with it
```

No test may accept “probably exactly once”; assertions inspect durable rows/digests.

## Normalization gates

- deterministic output for the same evidence/profile/normalizer version;
- normalizer performs no network request or canonical lookup;
- profile-specific native semantics are preserved;
- unknown extension fields are isolated and retained according to contract;
- lifecycle/tombstone behavior closes source facts correctly;
- no normalizer assigns a canonical entity ID;
- claims have authority, sensitivity, valid/system time and evidence lineage;
- configured, entitlement and observed relationships remain distinct;
- unsupported data produces explicit capture/coverage state.

## Identity/canonicalization corpus

Maintain a versioned scenario corpus including:

- exact strong-key binding for every primary entity class;
- same display name/domain/tool name but distinct authority;
- model product versus deployment versus route;
- application product versus surface versus deployment versus account;
- agent definition versus deployment versus workload/process/session;
- one local agent deployment across version updates and fifteen project/workspace paths;
- separate local agent deployments on another device or under a distinct source-authority installation/configuration scope; for explicitly user-bound sources, a second exact execution identity remains separate;
- guest/flyby and credentialed/authenticated-unknown contexts from the current extension, plus personal/organization only when the exact backend writer and classification authority are proved;
- MCP server product versus local/remote deployment and same tool name under different deployments;
- device/account/workload namespace collisions;
- negative constraints outranking weak similarity;
- one source tombstone while another remains;
- late authoritative correction;
- manual bind/unbind/merge/split/field correction;
- correction conflict with later source data;
- replay after resolver/materializer upgrade.

Properties:

- one active binding per source object;
- no cross-tenant binding;
- canonical type compatibility;
- automatic binding only from frozen strong rules;
- decisions fully explain output;
- field authority independent from entity membership;
- same input/rule/start watermark produces the same digests/recorded IDs;
- merge aliases remain resolvable;
- split restores explicit binding partitions;
- every canonical field/edge/activity links to evidence/claims.

The resolver golden corpus is a release artifact. A rule change must show intentional scenario diffs.

## Relationship/activity/coverage gates

- predicate subject/object registry validation;
- direction and inverse presentation;
- multi-source support and correct source withdrawal;
- configured relationship, authoritative entitlement and observed execution never become one another;
- user-level `runs_as` never synthesizes resource entitlement;
- entitlement paths are persisted, allowlisted, source-backed and coverage-disclosed;
- missing entitlement connector produces unsupported/unknown rather than an empty authoritative exposure result;
- browser-to-endpoint signed binding rejects cross-tenant, unknown/revoked issuer, artifact mismatch, audience mismatch, nonce replay, expiry and invalid signature;
- endpoint-to-LLM/MCP context attribution rejects cross-tenant,
  unknown/revoked issuer, nonce replay, audience/request-digest mismatch, expiry
  and invalid signature;
- normalized cross-sensor relationships and activity preserve different observing, subject, object, actor and resource producer identities;
- inventory relationship never becomes authz grant;
- deterministic activity dedupe/correlation only;
- uncertain correlation stays separate;
- multi-stage lifecycle appends versions;
- expected-population revision one closes and advances to exact revision two; skipped, overlapping or payload-mutating updates fail;
- canonical heads reject non-one initialization, skipped/orphan/type/lifecycle-mismatched versions and multiple system-current activity versions;
- coverage rejects skipped/concurrent revisions, cross-revision identity mutation and a new revision before prior system closure;
- actor/resource authorization filtering;
- coverage expected-population/heartbeat/sequence/gap transitions;
- absence is not treated as absence-of-use under unknown/gap coverage;
- overview counts reconcile with authorized current projections.

## Storage and migration gates

Run SQL against every supported PostgreSQL/ClickHouse version:

- parse every PostgreSQL migration with the pinned PostgreSQL grammar before runtime tests;
- treat grammar parsing only as a fast syntax gate, never as evidence that grants, RLS,
  triggers, exclusion constraints, partition routing, upgrades, or rollback behavior work;
- prove the migration ledger rejects checksum drift and concurrent or partial
  reapplication, and prove upgrades use a new forward migration instead of editing
  the frozen baseline;
- empty install, forward migration and rollback/roll-forward procedure;
- constraints, RLS, writer grants and immutable/version-close triggers;
- outbox aggregate/change compatibility, bounded scalar hints and exact authoritative pointer checks;
- concurrent indexes and migration lock budget;
- representative query plans/cardinality;
- partition creation/default-partition evacuation/retention;
- restore from backup and digest/reference checks;
- no destructive migration without backup/compatibility phase;
- expand/migrate/contract compatibility with old/new application versions.

DDL lint alone is insufficient.

The first executable engine gate is frozen in
[live storage conformance](22-live-storage-conformance.md) and
`tools/run-live-storage-conformance.sh`. Static grammar and dependency-order
checks run in this package; they are not recorded as PostgreSQL or ClickHouse
runtime success. A complete CI expansion must satisfy every assertion listed in
that document before domain implementation broadens.

## Projection/replay gates

- apply duplicate, older, next and missing predecessor versions;
- uncertain ClickHouse acknowledgement and identical retry;
- targeted repair;
- full rebuild into generation `N+1`;
- snapshot + outbox tail catch-up;
- missing/duplicate/late required partitions and any checkpoint below/above the common activation watermark fail the barrier;
- membership/version/cardinality/digest reconciliation;
- atomic `active → standby` activation and `standby → active` rollback to `N`, followed only later by terminal retirement;
- active traffic never reads partial generation;
- tombstones/retention honored;
- current/read models reconstruct from authorities with no legacy API.

## Authorization/security gates

Test the complete matrix from [authorization](07-authorization-and-audit.md), plus:

- issuer/audience/algorithm/key rotation and token expiry;
- group/role/scope provisioning revision;
- cross-tenant IDs, cursors, caches, aggregates and timing;
- sibling/ancestor/descendant scope behavior;
- root-scope bootstrap uniqueness, immutability and inability to create/reparent/delete a second root through the public admin API;
- field mask completeness against every DTO field;
- raw evidence purpose, single-use and expiry;
- support-session approval/expiry;
- export authorization at creation and download;
- correction preview/commit revision race;
- SQL injection, query-cost abuse and graph expansion bounds;
- object key/URL guessing;
- SSRF, XSS, CSRF and unsafe file download;
- secret/log/trace/metric leak canaries;
- database role cannot write another module's authority;
- every activity child partition denies direct cross-tenant reads/writes for every runtime role; partition creation atomically installs FORCE RLS, policy, grants and indexes;
- cell database `session_user` can enumerate only its assigned tenant IDs;
- setting `app.tenant_id` to an unassigned but existing tenant resolves to no
  tenant and exposes no rows for every workload role;
- one tenant can bind distinct API/ingest/normalizer/truth/projector/
  maintenance principals while a principal declaring a role it does not hold
  is rejected;
- same logical role/relation grant cannot have overlapping bounded validity intervals;
- dependency/container/IaC scanning, SBOM, signing and provenance.

Any tenant-isolation or prohibited-data leak is a release blocker regardless of test pass percentage.

## API gates

- OpenAPI request/response conformance for every status path;
- stable error codes and no internal details;
- authz before filtering/count/pagination;
- cursor filter/generation/revision binding;
- cancellation and timeouts reach storage;
- page boundaries under concurrent inserts;
- partial/stale/watermark metadata accuracy;
- compatibility tests against supported generated clients;
- rate limit/fairness and response-size limits;
- no N+1 query per result row.
- export authorization is revoked between metadata read and authenticated content redemption;
- export creation rejects nonexistent, non-product, standby/retired and
  watermark-behind generations, including a concurrent active-generation swap;
- local-agent list row collapse follows definition + device + execution identity + installation scope;
- agent detail is hydrated without browser-side source joins;
- agent exposure path input cannot exceed four hops or select arbitrary predicates;
- configured/entitlement/observed paths retain evidence class, authorization filtering and coverage.

## UI gates

- pass routes use `DieRepository`, not fixture/derive modules;
- production build contains no fixture provider/data;
- loading/empty/filtered/partial/stale/gap/error/unauthorized states;
- server capabilities control visible actions; direct API denial remains authoritative;
- no deferred risk/finding/policy/cost presentation;
- URL filter/deep-link/back-forward behavior;
- large table virtualization and bounded graph;
- agent table/detail show device, execution identity, MCP configuration, provenance and coverage without per-row request waterfalls;
- unsupported/unknown entitlement coverage is explicit and is never rendered as “no exposure”;
- keyboard/screen-reader/contrast/zoom/reduced-motion tests;
- automated axe plus manual WCAG 2.2 AA review;
- DOM/client logs/analytics/local storage contain no restricted data;
- generated client DTO contract tests;
- Core Web Vitals/performance budgets on reference routes.

## Performance methodology

Performance tests use:

- production compiler settings and release container;
- production-like network latency and data distributions;
- high-cardinality and hot-key scenarios;
- steady state after cache warmup plus cold-start measurements;
- dependency failover, background rebuild and noisy-tenant scenarios;
- at least 30 minutes sustained and specified burst period;
- raw histograms, resource saturation and database/query evidence.

Passing average throughput while p99 lag grows without bound is failure. The run must end with queues returning to baseline and no integrity mismatch.

## GA release gates

All are mandatory:

- `G1` architecture/package validation passes;
- `G2` all profile certification packs pass for advertised support;
- `G3` schema/OpenAPI/generated-code compatibility passes;
- `G4` database migrations and restore exercise pass;
- `G5` end-to-end evidence-to-UI scenarios pass;
- `G6` identity golden corpus has approved zero unexpected diff;
- `G7` authorization/tenant/field isolation passes;
- `G8` replay/new-generation activation/rollback passes;
- `G9` reference performance profile meets objectives without unbounded queues;
- `G10` chaos/failover leaves no accepted evidence loss or divergent truth;
- `G11` UI accessibility/security/performance passes;
- `G12` SBOM, vulnerability policy, artifact signatures and provenance pass;
- `G13` runbooks, alerts, dashboards, ownership and support diagnostics exist;
- `G14` environment bindings/certifications are approved;
- `G15` no P0/P1 defect or unresolved pass-semantic decision remains.
- `G16` multi-output normalization, same-path multi-claim, late candidate dependency wake-up and same-version/different-digest drift corpora pass.
- `G17` real ClickHouse current-view duplicate/lifecycle/privacy-canary tests and real PostgreSQL direct-partition RLS tests pass.

Waivers cannot permit cross-tenant exposure, acknowledged evidence loss, non-rebuildable authority, prohibited-data capture or incompatible v1 contract.

## Traceability

Each normative requirement receives:

- stable requirement ID;
- owning module/team;
- implementation symbol/package;
- tests and certification evidence;
- operational metric/alert where applicable;
- release gate.

The machine-readable registers in this package seed that ledger. A coding agent does not mark a requirement complete merely because a class/file exists.
