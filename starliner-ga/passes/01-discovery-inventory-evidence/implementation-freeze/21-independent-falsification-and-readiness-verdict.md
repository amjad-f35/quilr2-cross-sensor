# Independent Falsification and Readiness Verdict

> **Historical evidence record:** preserve every finding and closure assertion,
> but use documents 40 and 41 for current implementation authorization,
> blocking semantics and completion language.

**Review date:** 2026-07-30
**Review type:** fresh adversarial source-to-UI falsification
**Bounded scope:** Browser, Browser Backend, Endpoint, LLM Gateway and MCP Gateway through protocol, ingest, evidence, normalization, identity, canonical truth, relationships/activity/coverage, PostgreSQL/outbox, ClickHouse, authorization, API and the existing Nuxt seam
**Defect authority:** `registers/defect-closure-ledger.csv`

## Verdict

The prior claim that there were no remaining blockers was too strong.

The corrected corpus is now a coherent implementation authority for this bounded
pass, and an engineer does not need to invent the architectural boundaries or
domain semantics. The current baseline also executes on PostgreSQL `17.10`, and
the DDL/current-view smoke executes on ClickHouse `26.3.17.56` LTS. Production
engineering may therefore implement the complete bounded pass behind the frozen
contracts.

This is not a GA or runtime-certification claim. Expanded database behavior,
object-store lifecycle, native adapter output, cross-language cryptography,
live Nuxt/API behavior and complete erasure still require `LG-001..007`. A
failing gate reopens the affected contract and blocks its production
acceptance; it is not waived as an implementation detail.

## What this pass re-derived

The review walked these contracts in both directions:

1. native fact and trigger → typed source profile and envelope binding;
2. admitted record → immutable object and ordered receipt;
3. evidence → artifact-bound multi-output normalization bundle;
4. source-scoped identity → binding/conflict/decision → canonical version;
5. source candidate → exact ontology relationship/activity/coverage;
6. canonical or evidence disposition change → transactional pointer outbox;
7. pointer → generation/checkpoint → PostgreSQL or ClickHouse current view;
8. principal/revision/scope/relationship → row filter and field mask;
9. read model → OpenAPI DTO → actual Nuxt repository seam;
10. replay, reorder, lease loss, merge/split, retention, revocation and rebuild.

Executable artifacts were cross-checked against the five profiles, normalization
and relationship registries, JSON Schemas, OpenAPI, PostgreSQL DDL, grants/RLS,
ClickHouse DDL, UI matrix, actual Nuxt fixture repository and validators.

## New defects established by this review

The consolidated ledger contains the earlier `AR-*` defects plus the new
`FP-*` defects. The highest-impact new findings were:

- `FP-027`: projection activation claimed a lower bound across required
  partitions without storing that partition set, and the rollback procedure
  targeted a terminal `retired` generation. Required-partition manifests and
  rollback-ready `standby` are now physical state.
- `FP-028`: tenant RLS trusted any `app.tenant_id` selected by a workload login,
  while one assignment row could not bind all role-separated principals.
  Tenant context now requires an active session-principal/workload-role mapping
  in the tenant's assigned cell.
- `FP-029`: export jobs stored an unchecked generation integer and the API role
  could not read projection authority. Creation now locks a caught-up active
  `die_product_v1` row and persists a composite foreign key.
- `FP-030`: the ClickHouse activity materialized view passed
  `Map(LowCardinality(String), String)` into aggregate state declared as
  `Map(String, String)`. It now performs the exact type conversion before
  `argMaxState`, and the freeze validator protects the conversion.
- `FP-031`: historical principal rows foreign-keyed a tenant assignment to its
  original cell and the primary key prevented re-enrolling the same login, so
  the first enrollment made a controlled cell move impossible. Principal
  enrollment epochs now have stable binding IDs, only one active login binding,
  and an explicit revoke-old-cell → move → rebind protocol.
- `FP-032`: producer heartbeat time rejected backward non-null values but could
  still be cleared to null without an administrative revision, erasing the
  latest health observation. Once present, `last_seen_at` is now non-clearable
  and monotonic.
- `FP-033`: terminal evidence deletion required object deletion and current-view
  suppression but had no durable proof that ClickHouse history, activity
  evidence references, caches or exports were physically erased. Deletion now
  uses a placement-snapshot-bound sealed target manifest; `object_deleted`
  requires object receipts and `deleted` requires every target receipt.
- `FP-034`: six delivery/edge-configuration fields contained seven duplicate
  JSON `minimum`/`maximum` keywords, allowing parsers to reject the schema or
  select different bounds. The duplicate keywords are removed and every schema
  and OpenAPI load now rejects duplicate mapping keys.
- `FP-035`: the public evidence API allowed JavaScript-safe object sizes while
  PostgreSQL used a signed 32-bit `integer`. The authority now uses a positive
  JavaScript-safe bounded `bigint`.
- `FP-036`: source profiles/API schemas allowed JavaScript-safe snapshot and
  inventory counts while reconciliation and most read models used 32-bit
  integers. Enterprise/product counts are now bounded `bigint`; only
  deliberately small batch/ordinal fields retain exact capped integers.
- `FP-037`: internally consistent capability/field registers were described too
  broadly even though no mechanically closed native-source inventory proved
  that every relevant sensor item had entered a register. The overclaim is
  removed and `LG-008` now supplies the selected-source inventory; every later
  source/runtime fact reopens the affected end-to-end contracts under the
  source-completeness protocol.
- `FP-038`: a final-attempt worker crash left an expired lease that could not
  be reacquired and could not produce the live-lease execution required for
  quarantine. Attempt bounds, claim filtering and an exact maintenance-only
  lease-recovery execution now make retry or evidenced quarantine exhaustive.
- `FP-039`: tenant RLS and shared work-table grants did not prevent a
  normalizer, truth worker or projector from handling another stage in the same
  tenant. Enqueue, handle and recovery operations now have independent
  session-workload-role-to-stage guards on work and execution transitions.
- `FP-040`: principal enrollment counted direct role grants and could accept a
  login that inherited a second DIE workload role through an intermediate
  group. Enrollment now counts effective transitive membership across all
  runtime roles and requires exactly the declared one.
- `FP-041`: stage executions included implementation version but durable work
  identity did not, so terminal/quarantined input could not be replayed after a
  corrected implementation. Work uniqueness and execution fencing now include
  the exact immutable implementation version; same-version replay is
  idempotent and new-version replay is explicit.
- `FP-042`: PostgreSQL negative tests accepted any thrown error, so an
  unrelated permission, missing-row or wrong-constraint failure could falsely
  prove an invariant. Every negative case now requires its intended error
  fragment or SQLSTATE and rethrows all unrelated failures.
- `FP-025`: work completion and fenced execution were independently writable,
  so either side could commit alone after a crash or implementation bug.
- `FP-023`/`FP-024`: canonical heads could start above one, orphan/mismatched
  versions could commit, activity could have multiple current system versions,
  and coverage revisions were not serialized or monotonic.
- `FP-022`: expected-population versions were protected by an immutable trigger
  that also rejected the interval closure needed to advance the revision.
- `FP-026`: the outbox exposed identity/producer aggregate types without a
  coherent version/publication transaction, allowed aggregate-incompatible
  changes, and did not physically enforce the bounded scalar hint shape.
- `FP-016`: the PostgreSQL baseline referenced an evidence table and
  authorization table before either existed. It parsed but could not execute in
  order. The FK was moved and a forward-reference gate was added.
- `FP-008`: role grants, closes, scope changes and closure rows carried revision
  numbers but were not bound to the tenant's locked authorization revision.
- `FP-019`: evidence retention transitions emitted no authoritative projection
  change, so ClickHouse could retain deleted evidence indefinitely.
- `FP-018`: signed cross-sensor attribution had no central nonce-use ledger; the
  normalizer also lacked producer/certification read grants needed to validate
  the issuer.
- `FP-017`: producer trust, identity, capabilities, cell assignment and expected
  population heads were ordinary mutable rows rather than controlled histories.
- `FP-013`: `ReplacingMergeTree` could discard one of two equal-watermark rows
  before the deterministic digest tie-break view observed both.
- `FP-005`: canonical outbox uniqueness included change type, permitting more
  than one event for the same aggregate version.
- `FP-003`: a stage execution was not originally tied to the exact live
  work-item lease and fence token.
- `FP-010`: legal hold and object deletion did not have a complete ordered
  disposition protocol.
- `FP-014`: the Nuxt repository is a reusable shell, but its current data source
  is explicitly fixture-only, creates incompatible colon-delimited IDs and
  derives out-of-scope risk/finding/policy/spend fields.
- `FP-043` through `FP-046`: historical source drift, Endpoint collection
  overclaim, LLM lexical-field inflation and Browser privacy/collection
  contradictions were corrected by the five-profile authority.
- `FP-047`/`FP-048`: current MCP capability discovery is authorization-context
  and endpoint-configuration scoped, but the target profile and relationship
  identity could flatten those scopes. Scope tokens and semantics now survive
  profile, normalization, canonical/read SQL, ontology, API coverage and UI.
- `FP-049`: two legacy Browser Backend control mutations require a separate
  authorization/migration review and are explicitly excluded from this
  data-plane authority.
- `FP-050`: the selected MCP suite is not clean (595 passed, six failed, one
  xfailed); MCP production advertisement remains blocked by `LG-005`.
- `FP-051`: the saturation runner validated stale digests before it could
  regenerate them. It now validates semantics twice, writes the new report and
  then performs full digest-bound validation.
- `FP-052`: eight generated Endpoint search recipes returned no source match.
  Generation now selects a verified exact token and fails if neither a pinned
  file nor pinned-revision match exists; all 422 recipes were exercised.
- `FP-053`: the new MCP capability-coverage response lacked a field-policy
  default. It is now fail-closed as internal response metadata.

Every new item, severity, violated invariant, failure scenario, affected
artifact, correction and verification state is in the closure ledger.

## Corrections now frozen

- JavaScript-safe integer/finite-number bounds across schemas, OpenAPI, SQL and
  ClickHouse.
- Artifact-bound normalization runs with a deterministic, length-prefixed,
  sorted bundle digest verified again when truth work is inserted.
- Separate native and normalized claim value types.
- Exact work subject kinds, immutable executions, database lease fencing and
  reciprocal deferred execution/terminal-work commit coupling.
- Exact cross-producer referenced-only source shells that never count as
  observed inventory and can only promote once on native evidence.
- Issuer-scoped assertion/nonce replay ledger for Browser local bindings and
  LLM/MCP Endpoint attribution.
- Revision-one canonical heads, deferred exact head/version/type/lifecycle
  equality, one current activity version and serialized monotonic coverage
  revisions.
- Close-only expected-population bitemporal versions with exact head equality.
- A deliberately narrow outbox for canonical/evidence authorities with
  aggregate-compatible change types and bounded scalar hint payloads.
- Evidence disposition as a first-class outbox aggregate.
- Deterministic immutable ClickHouse histories plus current views; no raw
  replacing table is a query authority.
- Database-enforced producer, capability, expected-population, authorization,
  audit and evidence-retention transitions, plus immutable required projection
  partitions, all-partition acknowledgement barriers and reversible
  active/standby activation.
- One tenant-to-cell assignment plus independent API/ingest/normalizer/truth/
  projector/maintenance principal bindings; arbitrary tenant GUC selection
  resolves fail closed.
- `export.download` separate from create/read; immutable export field and
  authorization/read-model snapshot bound to a locked active/caught-up product
  generation.
- Fail-closed response-field classification for every structured OpenAPI schema
  and dynamic attribute map.
- Explicit, inspected Nuxt transition gates bound to the actual repository
  revision and dirty state.

## Validation actually performed

The final static suite passed and was then repeated without source changes:

| Check | Result |
|---|---|
| implementation freeze | PASS — 141 decisions, 45 OpenAPI operations, 5 profiles, 47 profile-kind, 44 profile-entity, 75 product-field, 54 relationship, 42 UI-lineage and 80 production-gate rules; 109 ledger rows; 135 package files; embedded five-profile intrinsic authority validation |
| LG-008 saturation | PASS — two complete deterministic regenerations; 5 admissions, 148 records, 1,837 native fields, 422 access recipes, 931 target traces and 140 classified delta files; zero drift |
| Draft 2020-12 schemas | PASS — 14 meta-schemas, 64 accepted and 40 rejected fixtures |
| OpenAPI/YAML | PASS — duplicate-key rejection across 14 normative YAML documents and validation of both OpenAPI 3.1 specifications |
| PostgreSQL grammar/dependency checks | PASS — 660 core, 115 role/grant and 144 live-conformance statements; 919 total |
| exact target-engine local execution | PASS — PostgreSQL 17.10 complete current baseline/roles/conformance transaction; ClickHouse 26.3.17.56 LTS DDL/materialized-view/tie/deletion smoke |
| outer DIE pass | PASS — 90 normative requirements, 9 migration requirements, 16 pass decisions, 3 migration decisions, 25 inputs, 24 risks, 66 Markdown documents, 29 CSV and 17 YAML registers |
| whole Starliner corpus | PASS — incomplete migration work is truthfully non-normative; no broken links remain |
| validator mutations | PASS — seven injected authority, SQL, API, gate, evidence and link defects were rejected |
| live runner shell syntax | PASS |

The OpenAPI environment emitted an `urllib3` LibreSSL compatibility warning;
the local validation performed no HTTP request and both specifications passed.

The broader `starliner-ga/tools/validate-corpus.mjs` check was also run and
failed on 17 broken local links inside the separate `migration-audit` package.
That package is outside this bounded review and was not changed. Its link
failure is recorded rather than represented as a pass; the implementation
freeze and outer DIE pass link checks themselves passed.

## Open evidence gates

| Gate | Severity | What remains | Development effect |
|---|---:|---|---|
| `FP-014` | P1 | replace the fixture-only Nuxt repository, colon-delimited IDs and invented risk/finding/policy/spend fields through the frozen `DieRepository` seam | required UI implementation work; blocks production UI acceptance and is verified by `LG-004` |
| `LG-001` | P0 | extend the passing PostgreSQL 17.10 smoke into digest-pinned, multi-session contention, crash/failover and full negative conformance | blocks production acceptance of authoritative PostgreSQL behavior; does not block contract-conformant implementation |
| `LG-002` | P0 | extend the passing ClickHouse 26.3.17.56 LTS DDL/current-view smoke into server-mode mutation, lifecycle, load, query-plan and crash/recovery conformance | blocks production acceptance of projections and physical lifecycle; does not block contract-conformant implementation |
| `LG-003` | P0 | provider-specific object versioning, lock, legal-hold, delete and restore races | blocks evidence-retention/erasure GA |
| `LG-004` | P1 | generated TypeScript client and `UI-GATE-001..010` against the live Nuxt repository/API | blocks live customer UI readiness |
| `LG-005` | P0 | native capture-to-profile golden certification for all five profiles | blocks advertising or shipping registered sensor claims |
| `LG-006` | P0 | shared JCS/JWS/digest/nonce vectors in Go, Java, Python, TypeScript and Rust | blocks cross-language trust and GA |
| `LG-007` | P0 | compare sealed erasure targets with authoritative current/historical physical placements | blocks complete deletion claims |

`LG-008` is no longer open. Its five admissions, 1,837 field dispositions, 422
access recipes, 931 target traces, delta reconciliation and two zero-drift
passes are retained in [the generated authority](lg008/README.md).

## Evidence that was and was not available

PostgreSQL `16.14` and then the current target `17.10` became available after
the original review. The complete current baseline, roles/grants and
conformance transaction executed successfully in disposable local clusters
after the revalidation corrections,
including catalog RLS/grant checks, role isolation, temporal heads, worker
fencing, projection generation, timezone-stable audit hashing and the
erasure/legal-hold ordering smoke cases. The target run used data checksums.
This is direct target-version smoke evidence, but it is not the remaining
multi-session/crash/failover gate and no immutable container image digest was
involved.

The SHA-256-verified official ClickHouse `26.3.17.56` macOS ARM64 binary was
also executed. DDL/materialized-view creation, deterministic activity
tie-breaking and deleted-evidence suppression pass after correcting `FP-069`.
No container runtime or server cluster was available. Therefore this review
still did **not** execute:

- the full PostgreSQL multi-session contention/crash/failover expansion;
- ClickHouse server-mode physical mutations, negative scans, generation/load
  tests, capacity/query plans or crash recovery;
- object-store versioning/legal-hold/delete races;
- native sensor capture-to-profile golden packs;
- a generated TypeScript client against a live DIE API;
- shared JCS/JWS vectors across Go, Java, Python, TypeScript and Rust.
- authoritative erasure-plan target enumeration across current and historical
  object, ClickHouse, cache, export and prior-cell placements.

The newly supplied source-analysis packages and their exact admission state are
recorded in
[the source-analysis intake and LG gate plan](24-source-analysis-intake-and-lg-gate-plan.md).
They supplied the static reconciliation inputs; they do not convert the
missing executions above into runtime evidence.

Those are `LG-001` through `LG-007`, not assumptions. The target-engine local
results narrow but do not close `LG-001`/`LG-002`. Exact storage commands
and assertions are frozen in `22-live-storage-conformance.md`; the native
source-closure protocol is frozen in
`16-sensor-capability-and-field-traceability.md`.

## Readiness rule

The bounded architecture and semantics are frozen enough to prevent a coding
agent from inventing the spine, identity authority, relationship meaning,
storage authority, authorization order or UI data model.

The implementation authorization is:

```text
static suite passes
AND five-profile authority regenerates with zero drift
AND exact target-engine DDL/current smoke passes
AND implementation follows the frozen handoff dependency order
```

Production acceptance requires expanded PostgreSQL and ClickHouse conformance.
GA additionally requires the object-store, erasure-placement, sensor, crypto
and Nuxt live gates. Until those results exist, the bounded assurance is
**implementation-ready architecture and semantic authority with explicit
runtime/provider release blockers**.
