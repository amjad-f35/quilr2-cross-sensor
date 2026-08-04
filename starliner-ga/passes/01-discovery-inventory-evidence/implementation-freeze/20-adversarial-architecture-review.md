# Adversarial Architecture Review

> **Historical evidence record:** this review's defects and invariants remain
> binding; its dated readiness statements are superseded for scheduling by
> documents 40 and 41.

**Review date:** 2026-07-30
**Scope:** Browser, Browser Backend, Endpoint, LLM Gateway and MCP Gateway through Starliner ingest, immutable evidence, normalization, identity, canonical materialization, PostgreSQL/ClickHouse projections, authorization, API and Nuxt UI
**Disposition:** the defects below are corrections to the freeze, not optional recommendations

## Honest assurance statement

No architect can prove that a nontrivial distributed system contains literally zero future design or implementation mistakes. This review therefore does not use that promise. It establishes a stronger engineering standard: every known invariant is explicit, every discovered contradiction is corrected in the normative artifacts, every dangerous ambiguity fails closed, and the implementation cannot ship until executable conformance, database, failure, security and sensor-certification gates demonstrate those invariants.

The prior freeze was **not implementation-safe** before this review. It contained several P0 contradictions that a coding agent could have faithfully implemented and still produced incorrect truth or a tenant-isolation failure. This document records those defects, their authoritative correction and the test that prevents regression.

## Review method

The review traced six planes in both directions:

1. native sensor fact → typed profile → admission;
2. evidence → normalization → claims/candidates;
3. source identity → binding → canonical version;
4. canonical mutation → outbox → PostgreSQL and ClickHouse read models;
5. API authorization → DTO → Nuxt presentation;
6. restart, retry, replay, reorder, correction, retention and tenant failure behavior.

It then attacked:

- one-to-many cardinality;
- ordering and dependency races;
- idempotency after a lost response;
- bitemporal overlap and correction;
- merge/split reversibility;
- raw-versus-projected privacy boundaries;
- direct partition access under PostgreSQL RLS;
- cross-language numeric precision;
- overbroad role grants;
- mismatches between what sensors actually carry and what profiles could express;
- unsupported identity and entitlement promotion;
- provenance completeness;
- projection duplicate and lifecycle behavior.

## Corrected defects

| ID | Severity | Defect | Failure if implemented | Frozen correction | Regression gate |
|---|---|---|---|---|---|
| AR-001 | P0 | one evidence record was unique to one normalized observation | Endpoint or gateway records producing device, user, process, application and relationships could not be represented without dropping or overwriting outputs | one immutable `normalization_run` owns many deterministic `output_key` observations and one atomic truth bundle | schema requires run/key; SQL uniqueness is run/key; multi-output replay test |
| AR-002 | P0 | one claim per observation/path | multiple emails, identifiers, groups or labels at one path collided | deterministic `claim_key`; append-only claim supersession link | two-value same-path fixture and SQL uniqueness test |
| AR-003 | P0 | relationships/activity could run before referenced bindings existed | legitimate reorder became quarantine, loss or guessed identity | persistent candidate dependencies and evaluations; reverse-indexed re-enqueue | shuffled-order and late-binding tests |
| AR-004 | P0 | activity and coverage lacked candidate provenance | evidence-to-canonical lineage was incomplete despite product claims | `activity_version_candidate` and `coverage_interval_candidate` immutable links | lineage completeness invariant |
| AR-005 | P0 | coverage candidate did not identify an expected population | truth could not distinguish multiple enrollment populations | exact population type, namespace and source population ID are required | zero/multiple/exact population tests |
| AR-006 | P0 | relationship profiles admitted arbitrary type/predicate combinations | semantically impossible graph edges could pass syntax validation | exact source relationship rule registry maps a profile/type/predicate/type/semantic tuple to one valid canonical ontology pair | registry/ontology cross-validator and negative pair corpus |
| AR-007 | P0 | browser persona fields could imply a canonical person | email or display name could become a false enterprise identity | stable observed identity creates only a source-scoped directory account; email/name are sensitive claims; person requires trusted issuer/subject | alias-only must-not-create-person tests |
| AR-008 | P0 | important current gateway and endpoint fields had no typed route | safe tokens, latency stages, guardrail state, correlation hierarchy, rejections and user claims could be silently dropped | profiles now carry safe structured metrics/correlation/control metadata and a distinct MCP rejection; prohibited content stays prohibited | native fixture → profile field-disposition certification |
| AR-009 | P0 | unsigned 64-bit JSON integers crossed TypeScript | sequence or watermark values could silently round and break ordering/idempotency | cross-language exposed integers are bounded to `2^53-1`; epoch rotates before exhaustion | max/max+1 contract vectors |
| AR-010 | P0 | batch receipt persisted only counts | a lost HTTP response could not be reproduced exactly | request-key hash, RFC-8785 digest and ordered immutable receipt items are persisted | lost-response replay and same-key/different-digest `409` |
| AR-011 | P0 | sequence conflict could be interpreted as batch `409` | one bad record could reject valid siblings | sequence conflict is a per-record rejection in HTTP `200`; batch `409` is only request-idempotency or batch-wide identity conflict | mixed batch test |
| AR-012 | P0 | RLS-protected workers had no safe tenant discovery path | workers either could not lease work or needed an unsafe cross-tenant query | payload-free cell-assignment registry; fair per-tenant loop; `SET LOCAL` per transaction | assigned/unassigned tenant worker tests |
| AR-013 | P0 | direct activity partition access was not RLS protected | roles granted all canonical tables could bypass parent RLS through a child partition | every partition receives FORCE RLS, policy and tested grants atomically; default partition is explicit | direct-child isolation test and partition-creation gate |
| AR-014 | P0 | role grants allowed unrelated mutation and worker deletion | projector could mutate exports; maintenance could mutate identity commands; workers could erase work history | explicit read-model grant allowlist and no ordinary worker delete | catalog grant snapshot |
| AR-015 | P0 | current binding uniqueness disallowed disjoint valid intervals | valid-time history could not be faithfully represented | non-overlap exclusion for system-current valid intervals; multiple disjoint intervals are legal | overlap and disjoint interval tests |
| AR-016 | P0 | merge/split/correction persistence was incomplete | old IDs could break, participant history vanish and corrections masquerade as sensor claims | entity aliases, decision participants, correction claims and version support links, with alias-cycle prevention | merge/split round trip, alias resolution and cycle tests |
| AR-017 | P0 | evidence API fields were not fixed at admission | later producer moves or trust changes could rewrite historical interpretation | admission-time scope, environment, sensitivity and trust; append-only disposition ledger | producer-move historical query test |
| AR-018 | P0 | ClickHouse stored raw source and correlation IDs and exposed raw replacing rows | metadata leaked and duplicate current results were possible | tenant-keyed search tokens and deterministic current views; raw values stay in PostgreSQL/evidence | privacy canary and duplicate projection tests |
| AR-019 | P0 | activity had no deletion/tombstone visibility state | retained projections could continue showing deleted activity | activity versions carry lifecycle/visibility; current view filters to visible active rows | retention/tombstone projection test |
| AR-020 | P1 | export response could expose an object URL while claiming redemption reauthorization | issued URL remained usable after revocation | authenticated `/exports/{id}/content` rechecks authorization revision, job state and expiry | revoke-between-metadata-and-download test |
| AR-021 | P1 | JSON digest canonicalization was underspecified | Go, Java, Python, TypeScript and Rust could hash equivalent payloads differently | RFC 8785 JCS over I-JSON-compatible input and cross-language vectors | digest/signature conformance pack |
| AR-022 | P1 | signed edge configuration had no rollback rule | replay of an older valid bundle could downgrade a producer | durably persist highest generation; reject lower and equal/different digest; rollback uses a new higher generation | restart and rollback replay tests |
| AR-023 | P0 | mutable workflow rows had enum checks but no transition or immutable-request enforcement | API or worker defects could forge succeeded commands, completed exports, consumed grants, mutate leased work identity, or activate an unverified projection | database triggers enforce initial states, legal transitions, terminal immutability, unexpired lease ownership/attempt rules, monotonic checkpoints, verified projection activation and immutable request/authorization context; grants expose only role-required transition columns | state-machine transition matrix, expired/concurrent lease, projection activation and catalog-grant tests |
| AR-024 | P0 | audit shard heads were broadly mutable without a database-enforced link to the immutable event | a service defect could rewind, skip or detach the apparent head of the evidence audit chain | head starts at zero and advances exactly one only when the matching immutable event has the expected previous and current hashes; signed checkpoints remain the privileged-tamper boundary | rewind/skip/missing-event/concurrent-append and checkpoint verification tests |
| AR-025 | P0 | relationship schemas admitted configured or entitlement-like edges that runtime observations did not prove, and semantic rules were not mechanically bound to the audited support register | observed calls or user labels could become false `configured_to_use`, `can_invoke`, `runs_as` or account relationships | unsupported predicates were removed from current profiles; every exact source rule must map to one adapter-derivable evidence rule; activity-derived edges remain observed and configuration or entitlement requires its actual authority | source-schema/rule/support cross-validator and observed-must-not-become-configured negative corpus |
| AR-026 | P0 | canonical entity/relationship system histories allowed overlapping rows while activity source bindings allowed only one current row even for disjoint valid intervals | parallel writers could create two system truths and valid history could not represent stop/restart intervals | deferrable GiST exclusions prohibit system-time overlap for canonical versions and valid-time overlap for system-current source/activity bindings while allowing disjoint history | concurrent version, deferred close/insert, overlap rejection and disjoint interval tests |

## End-to-end frozen execution

### Admission transaction

For one authenticated batch:

1. resolve the credential to exactly one enrolled tenant and producer;
2. parse with compressed, decompressed, batch and record bounds;
3. canonicalize the request with RFC 8785 and compute the batch digest;
4. lock or create the batch idempotency receipt by tenant, producer and key hash;
5. return the stored ordered receipt if key and digest match;
6. return batch `409` if the key exists with a different digest;
7. validate each record independently against envelope binding, exact profile schema, privacy contract, certification, epoch and sequence;
8. append accepted record sequence, evidence metadata/object reference, initial evidence disposition and normalize work;
9. append every accepted/duplicate/rejected/retry receipt item in input order;
10. commit the receipt and accepted evidence together;
11. return only after durable commit.

A record conflict cannot roll back valid siblings. A retry response is not durable evidence and must be retried in a new batch request while preserving the record ID, producer epoch, sequence and content digest.

### Normalization transaction

For one evidence record and one pinned normalizer artifact:

1. claim the work item with `FOR UPDATE SKIP LOCKED` and a lease token;
2. read immutable evidence and exact schema/profile versions;
3. deterministically produce the complete output bundle without network or canonical lookup;
4. assign one run ID, bundle digest, deterministic output keys, deterministic claim keys and candidate IDs;
5. in one transaction insert the normalization run, every source object update, observation, claim, candidate, reconciliation member and one truth work item;
6. record stage execution and complete the leased work using its fence token;
7. on uniqueness conflict, compare digests: equal means idempotent replay; different means deterministic-drift quarantine.

No partial output bundle is visible. A normalizer version is immutable; changed behavior requires a new version/artifact and an explicit replay generation.

### Truth transaction

For one normalization run:

1. lock the truth work item and all affected current source bindings in deterministic source-key order;
2. resolve or create canonical bindings for every primary output object first;
3. evaluate fields with the authority registry, negative constraints, valid time and correction claims;
4. evaluate relationship and activity dependencies only after primary resolution;
5. materialize exact resolved candidates;
6. persist unresolved dependencies as `pending_dependency`, ambiguous dependencies as `held_ambiguous`, and semantic violations as `rejected`;
7. map coverage only to one exact expected population;
8. close affected prior intervals and append new canonical versions and immutable support/evidence links;
9. append identity decision participants/aliases where required;
10. append one ordered outbox row per changed aggregate;
11. record stage execution and complete the fenced work atomically.

When a source binding changes, the reverse dependency index enqueues affected candidates. Re-evaluation is deterministic and never mutates prior evaluation/provenance rows.

### Projection

PostgreSQL and ClickHouse projectors:

- consume only committed canonical outbox rows;
- are idempotent by tenant, generation, aggregate, version and row digest;
- reject same-version/different-digest input;
- update only their explicit projection tables;
- write partition checkpoints after destination acknowledgment;
- never write canonical truth;
- build a new generation in parallel, reconcile count/digest/watermark, then switch the active generation atomically;
- retain the prior generation through the rollback window.

APIs never query raw ClickHouse replacing tables and never use `FINAL` as a correctness strategy. They query the defined current view for the active generation.

## Identity invariants

- Tenant is always part of identity scope.
- Source IDs identify aliases, not canonical IDs.
- Product, surface, deployment, agent definition, agent deployment, workload, session and activity are different layers.
- A local agent deployment key is definition + device + installation/configuration scope. Project, repository, version, process, session and observation user do not split it.
- Execution identity is optional unless the native source explicitly defines a user-bound deployment.
- Browser device and application surface can exist as source-scoped canonical assets; they do not cross-producer merge by hostname, origin label, email or time.
- Browser ↔ Endpoint device binding requires the signed local assertion defined in the profile.
- Endpoint ↔ gateway agent attribution requires signed request-bound context or an exact authoritative client binding.
- Names, email, hostname, origin, model label, user-agent and timing are never automatic cross-source keys.
- Endpoint group labels are source claims, never enterprise membership or authorization tuples.
- Merge redirects old IDs to a survivor; split restores explicit entities/bindings; neither rewrites historical evidence.

## Sensor truth boundary

The platform uses all important safe facts that the audited sensors can expose, but it does not fabricate unsupported enterprise reachability:

- Browser: installations, browser-native devices, application surfaces/classification, stable application accounts, source-scoped observed identities, sessions, application use, uploads, native outcomes, health/gaps and complete snapshots when implemented.
- Endpoint: device/user/process/application/agent/model/MCP/configuration/component/repository observations, exact local deployment relationships, process/activity/control evidence, health/gaps and reconciliation.
- LLM Gateway: provider/account/model/route/client/workload/agent source objects, invocation lifecycle, safe token and latency dimensions, route/guardrail/control state, correlation hierarchy, health/gaps and configuration reconciliation.
- MCP Gateway: server/tool/resource/prompt registry, gateway-native agents/workflows/runs, calls, initialize/list/read/prompt/session/progress/cancel operations, distinct rejections, control effects, health/gaps and registry reconciliation.
- Browser Backend: catalog/configuration/relay/installation/heartbeat/publication evidence as a distinct producer, never as an invisible second truth authority.

IdP/HRIS, MDM/CMDB, cloud/IAM, SaaS, repository and ACL connectors remain the only path to complete enterprise person, group, role, credential, cloud resource and potential-reachability truth. Their absence is shown as unsupported or unknown coverage.

## Tenant isolation and authorization

`SET LOCAL app.tenant_id` is defense against accidental cross-tenant queries, not the sole defense against a compromised shared database credential: a role able to execute arbitrary SQL can set a custom GUC. Primary isolation is authenticated tenant derivation, cell assignment, distinct workload credentials, least-privilege grants, transaction-scoped data access and database/network boundaries. RLS, API authorization, scope predicates and audit are cumulative controls.

Every worker:

1. reads only payload-free tenant assignments for its cell;
2. schedules fairly across assigned tenants;
3. begins a transaction;
4. sets tenant context from the assignment, never from work payload;
5. leases and processes rows for that tenant;
6. commits and discards the connection transaction state before another tenant.

Every new partition is created by a maintenance transaction that applies FORCE RLS, the tenant policy, exact grants, indexes and direct-child isolation tests before attachment/availability.

## Required implementation gates

Architecture validation passing is necessary but not sufficient. A production coding agent may implement against the freeze, but no stage may be called complete until these gates exist in CI:

1. Draft 2020-12 positive/negative schemas and exact relationship semantic validator;
2. Go/Java/Python/TypeScript RFC-8785, signature and safe-integer vectors;
3. real PostgreSQL migration from empty database and supported previous migration, including FK/catalog/grant/RLS checks;
4. direct parent and child partition tenant-isolation tests under every runtime role;
5. real ClickHouse DDL, duplicate delivery, lifecycle filtering, generation switch and privacy-canary tests;
6. multi-output normalize/replay/deterministic-drift tests;
7. shuffled candidate/binding order, dependency wake-up and ambiguous-hold tests;
8. bitemporal overlap, late event, correction, merge, split, alias-cycle and old-ID resolution tests;
9. batch lost-response, mixed conflict, backpressure, crash-before/after-commit and receipt replay tests;
10. sensor-native golden fixtures proving every advertised profile field and explicitly marking every `new_capture_required` seam unavailable until implemented/certified;
11. end-to-end API authorization, export revocation, raw-evidence grant and audit-chain tests;
12. Nuxt contract, accessibility, unknown/partial/unsupported-state and no-telemetry-dump presentation tests;
13. load, soak, restore, replay, projection rebuild, object-store outage and regional dependency failure tests;
14. SBOM, signing, provenance, dependency, secret, image and penetration gates.

## Review verdict

The corrected architecture is coherent for this bounded pass and no known semantic decision is delegated to a coding agent. The package is an implementation authority, not proof of working software. Structural validators must pass on every candidate. The implementation program must build the expanded PostgreSQL and ClickHouse CI harnesses as first-class workstreams and must not accept the affected storage modules before those gates pass. Domain and storage implementation may proceed in the frozen dependency order; the gates evaluate that implementation rather than postpone it.

If an implementation discovers that a native sensor cannot produce a field marked `adapter_derivable`, the correct action is to change that support state and product coverage—not to synthesize the field. If a required invariant cannot be implemented as frozen, engineering stops and raises an ADR; it does not improvise around the invariant.
