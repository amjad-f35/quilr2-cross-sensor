# Physical Data and Storage Design

## Minimum topology

The pass uses exactly three state technologies:

1. PostgreSQL for admission metadata, work coordination, normalization, identity, canonical truth, authorization, audit and ordinary product read models;
2. S3-compatible object storage for immutable admitted evidence bytes and asynchronous export artifacts;
3. ClickHouse for rebuildable high-cardinality activity/evidence search.

Redis, Neo4j, Kafka and a search engine are not required. Adding one requires measured evidence and cannot change authority.

## PostgreSQL schemas

| Schema | Role | Writer |
|---|---|---|
| `die_control` | producer, installation, cell/workload-principal, scope/environment, capability, expected-population and certification registry | signed enrollment use case under `die_control_admin` |
| `die_evidence` | immutable evidence identity/admission metadata, exact ordered batch receipts, disposition history, safe rejection and quarantine | ingest plus dedicated retention writer |
| `die_pipeline` | durable stage work, leases, executions, mutation previews/idempotency, checkpoints and projection generations | stage/API coordinators |
| `die_normalized` | multi-output normalization runs, source objects, observations, cross-sensor assertion-use ledger, claims, relationship/activity/coverage candidates, dependency/evaluation state, and immutable reconciliation snapshot streams | normalizer; truth appends evaluation/dependency state |
| `die_identity` | bindings, resolution decisions, conflicts and corrections | truth/authorized correction only |
| `die_canonical` | entity, relationship, activity and coverage ledgers | truth only |
| `die_outbox` | atomic typed pointers for canonical entity/relationship/activity/coverage and evidence-disposition changes | truth, ingest and retention transactions for their owned aggregates |
| `die_read` | disposable product projections and export jobs | projector/API job coordinator |
| `die_authz` | roles, scopes, tuples and authorization revision | authorization administration only |
| `die_audit` | ordered shard heads, append-only security/product/operator events and signed checkpoints | controlled transactional append/checkpoint paths |

Database roles and grants enforce these writers. Application convention is not sufficient.

The numbered SQL files are immutable, checksum-recorded, one-shot migrations.
`IF NOT EXISTS` protects controlled bootstrap races; it does not make a partially
applied or edited migration safe to rerun. The migration runner takes a global
advisory lock, records file name and SHA-256, rejects checksum drift, applies each
file inside its declared transaction boundary, and requires a new forward
migration for every later change.

## Immutable evidence

The canonical bytes received after decompression and validation are serialized deterministically and stored under:

```text
tenants/{tenant_id}/evidence/sha256/{first_two_hex}/{remaining_hex}
```

Object creation uses conditional create. Existing same-hash content is success-equivalent. Object metadata contains only tenant, digest, size, media type, encryption context and creation time.

Admission algorithm:

1. authenticate and authorize producer;
2. stream-decompress with byte and ratio bounds;
3. validate batch/envelope/profile/privacy/integrity;
4. conditionally put immutable object;
5. in one PostgreSQL transaction insert sequence guard, admission-time scope/environment/sensitivity/trust metadata, initial disposition, its evidence pointer-outbox row, every ordered receipt item and normalize work;
6. commit;
7. return `accepted`.

If object put succeeds and the transaction fails, retry is safe. An object without a database reference is an orphan; a delayed scanner removes it only after a safety window and repeated reference checks. The platform never acknowledges a record whose object is missing.

Evidence bodies are not duplicated into PostgreSQL or ClickHouse. Small operational metadata remains queryable without object access.

## PostgreSQL physical rules

- IDs are application-generated UUIDv7 and stored as `uuid`; public APIs format opaque prefixed strings.
- All timestamps use `timestamptz`; source event time and platform system time are separate.
- All tenant tables have `tenant_id NOT NULL`.
- Enumerations that must evolve use checked text values through versioned lookup tables or generated constraints, not PostgreSQL enum types.
- Mutable current pointers and immutable version rows are separate.
- JSONB is allowed for versioned typed value envelopes and safe extensibility, not as an ungoverned replacement for columns.
- Every admitted JSONB value is type checked and byte bounded; large/repeated membership is normalized into child rows instead of an unbounded document.
- Source-declared snapshot counts and every product/read-model count use zero-or-positive JavaScript-safe `bigint` bounds matching the wire contracts. Deliberately small protocol-local counters remain `integer` only with exact caps: ingest batches have at most 500 results, normalization bundles 4,096 outputs, erasure/projection manifests 4,096 targets/partitions and reconciliation pages 512 members.
- Authoritative many-to-many provenance is stored in immutable tenant-scoped link ledgers with foreign keys. UUID arrays may appear in API DTOs or disposable projections, but are not the sole authority for selected claims, candidates, evidence, activity resources/relationships, reconciliation effects or audit evidence.
- High-cardinality activity versions and evidence metadata are time partitionable; a default partition prevents outage, and maintenance creates future partitions. Parent RLS does not protect a directly queried child: every partition is created with FORCE RLS, tenant policy and exact grants before it is made available, and direct-child isolation is tested.
- Foreign keys protect operationally bounded tables. High-volume historical partitions use validated references and integrity jobs where cross-partition FKs would block lifecycle operations.
- `statement_timeout`, `lock_timeout` and transaction isolation are explicitly configured per role.
- API transactions are read-only and bounded.

Reconciliation membership is stored as normalized source references, not one unbounded JSON document. `reconciliation_run` is the producer/profile/snapshot-scoped state machine; `reconciliation_candidate` records each immutable stage and centrally computed page digest; `reconciliation_member` records bounded page membership; and `reconciliation_evaluation` records the truth worker's immutable absence decision and effects. Page sequence and terminal-stage uniqueness are enforced physically. This supports deterministic absence evaluation without loading an estate-sized payload into memory or allowing concurrent duplicate pages to race.

`die_control.expected_population` is the coverage denominator authority. It binds one typed population and expected count to producer, scope, environment and capability with an enrollment/deployment/connector authority reference. Its head starts at revision one; each payload version is immutable except for one-time valid/system interval closure, and the deferred head/version constraints require an exact next matching lifecycle revision. Coverage intervals require a foreign key to this registry. If no approved population exists, the platform reports coverage `unknown`; it does not use the number of observed rows as its own denominator.

One evidence record may produce several typed source objects. `normalization_run`
is the immutable evidence + profile + normalizer name/version/artifact bundle;
it records output count and the SHA-256 of sorted, length-prefixed
`(output_key, observation_id, output_digest)` tuples. Every child observation
has a deterministic `output_key` unique within the run. Truth work cannot be
inserted until PostgreSQL recomputes the count and digest. Claims use a
deterministic `claim_key`, allowing multiple independent values at the same
field path. Supersession is an append-only claim-to-claim link; an immutable
claim is never updated to point at its successor.

An exact signed cross-sensor reference may create a `referenced_only` source
object under the referenced enrolled producer before that producer's native
observation arrives. Such a row is lineage scaffolding, not discovered
inventory. It has no observation pointer and unknown lifecycle, and can only
promote to `observed`. Accepted Browser local bindings and LLM/MCP Endpoint
attributions append issuer-scoped assertion ID and nonce hashes to
`cross_sensor_assertion_use`; replay, expiry, audience, request-binding or
producer-profile mismatch fails closed.

Relationship, activity and coverage candidates persist their evaluation result and every unresolved source-object dependency. A binding change uses the reverse dependency index to enqueue a new append-only evaluation revision. Missing dependency order is normal pipeline state, not evidence corruption.

## Canonical versioning

An entity has a stable row and immutable versions. Updating a field:

1. appends a new `entity_version`;
2. updates `entity.current_version`;
3. records selected claims in `entity_version_claim` and the materializer version;
4. writes exactly one typed pointer-outbox row for that aggregate version;
5. commits atomically.

Relationships, activity and coverage use the same pattern. Entity, relationship and activity heads start at version one, advance exactly one and must select the exact inserted type/lifecycle version at commit; no orphan canonical version can commit. Closing a current system interval requires its exact next version and head in the same transaction. Activity permits at most one system-current version. Coverage revisions are serialized per tenant/coverage ID, preserve the producer/scope/capability/population identity, advance exactly one and require the immediately prior system interval to be closed; a close cannot commit without its exact successor. Their canonical versions link to exact normalized candidates and evidence; activity and coverage are not provenance exceptions. Bi-temporal fields distinguish:

- `valid_from` / `valid_to`: when the fact is true in the source domain;
- `system_from` / `system_to`: when Quilr believed that version.

Closing a version never rewrites the historical payload.

Reverse provenance is a first-class indexed path:

```text
evidence
→ observation/claim or source candidate
→ version-support link
→ canonical entity/relationship/activity/coverage
→ projection generation
```

The physical link ledgers prevent a materializer from committing a dangling claim, candidate, evidence, entity, relationship or audit reference. Link rows are append-only and share the parent version transaction.

The central outbox is deliberately not a general event bus. Its aggregate types are exactly `entity`, `relationship`, `activity`, `coverage` and `evidence` disposition. SQL and JSON Schema both reject an aggregate-incompatible change type, an unbounded/non-scalar hint payload or a pointer to a nonexistent authoritative version. Identity command status and producer enrollment are projected from their durable work paths; coverage/evidence/canonical changes may cause the producer read model to refresh, but there is no fabricated producer aggregate version.

## Projection generation authority

The bounded product has one synchronized `die_product_v1` generation namespace spanning its PostgreSQL and ClickHouse read destinations. `projection_required_partition` freezes the exact destination partition set, kind, count and sorted length-prefixed manifest digest while the generation is `building`; checkpoints can exist only for those required partitions. Entering `verifying`, `active` or rollback-ready `standby` requires every manifest partition to carry a destination acknowledgement and digest at exactly the generation applied watermark. The generation watermark is therefore a database-checked lower bound, not a worker-reported maximum.

`active → standby → active` is the reversible rollback path. `retired` is final and is used only after the rollback window. One active generation is selected per tenant/product projection; API metadata, cursors, caches and export snapshots bind that synchronized generation across both storage destinations.

## Purpose-built PostgreSQL read models

The canonical ledger stays normalized. Customer list screens read disposable, generation-scoped projections:

- `die_read.application_current`;
- `die_read.agent_deployment_current`;
- `die_read.model_current`;
- `die_read.mcp_server_current`;
- `die_read.device_current`;
- `die_read.identity_current`;
- `die_read.relationship_current`;
- `die_read.entity_current` for generic investigation/extension.

These tables contain list/sort/filter fields and bounded aggregate counts only. Hydrated detail repositories read the selected generation plus canonical relationship/activity/source support in bounded server-side queries. They never call a sensor, legacy API, or frontend join. Each table has tenant RLS, a stable identity tie-breaker, projection watermark, coverage, ambiguity, lifecycle and source count. A projector may truncate and rebuild a non-active generation; canonical truth and immutable evidence remain untouched.

## ClickHouse

ClickHouse stores only safe, authorized search fields:

- tenant and activity/evidence ID;
- event time/family/subtype/outcome;
- canonical actor/resource IDs and types;
- producer/profile;
- native decision/effect;
- safe numeric metrics;
- capture/coverage state;
- canonical/evidence/projection versions;
- tenant-keyed source-object and correlation search tokens;
- activity lifecycle/visibility and evidence disposition for deletion/tombstone filtering.

No raw source-object ID, raw correlation ID, content, credential, prompt/response, file body or unrestricted tool argument/result is projected. Raw metadata remains in authorized PostgreSQL/evidence paths.

The projector writes immutable deterministic version rows and rejects one
aggregate version arriving with a different row digest. Activity
`AggregatingMergeTree` state uses `argMaxState` weighted by
`(canonical_version, row_digest)`. Materialized-view inputs are converted where
necessary to the exact value type declared by the destination aggregate-state
column; in particular, low-cardinality map keys become
`Map(String, String)` before `argMaxState`. Aggregate-state binary types are not
assumed compatible merely because the logical values compare the same way.
Evidence uses immutable `MergeTree` history
and `argMax(canonical_watermark, row_digest)` current selection; it does not use
`ReplacingMergeTree`, because replacement could discard a deterministic
tie-break candidate before the view sees it. The current evidence view
suppresses `object_deleted` and `deleted`. The API never queries raw history and
never uses `FINAL` as a correctness mechanism. API queries always specify
tenant and bounded time. Projection lag/checkpoint is returned to callers.

## Index principles

- lead every multi-tenant operational index with `tenant_id`;
- index work by `(stage, status, available_at, partition_key)`;
- key and index source objects by exact producer/profile/namespace/type/ID;
- relationship candidates store observing, subject and object producer identities independently; activity candidates store observing and actor/resource producer identities independently, so cross-sensor proof does not collapse namespaces;
- an exclusion constraint permits disjoint system-current valid-time binding segments but forbids overlapping segments for one source object;
- index entity lists by tenant/type/lifecycle/last-seen and stable tie-breaker;
- index relationships in both directions;
- index activity by tenant/time and common actor/resource filters;
- never add a low-selectivity index without an observed query plan;
- use covering `INCLUDE` only for measured hot queries;
- monitor index write amplification and unused indexes.

## Retention and deletion

Retention values remain configured policy, but mechanisms are frozen:

- evidence and canonical data carry a retention class;
- every disposition revision emits one evidence pointer in the same transaction;
- `deletion_pending` is followed by an immutable erasure plan bound to the
  placement-snapshot digest. The plan enumerates only hashed target locators,
  including object bytes, ClickHouse evidence rows, ClickHouse activity
  evidence references and any cache/export copies known to placement history;
- the target list is length-prefixed, ordered, digested and sealed before any
  receipt. No target can be appended after sealing;
- provider deletion receipts are required before `object_deleted`; receipts
  for every sealed target are required before terminal `deleted`;
- an object receipt is accepted only while the exact source revision remains
  unheld `deletion_pending`; non-object receipts are accepted only at the
  immediately following unheld `object_deleted` revision. Receipt insertion
  row-locks the latest disposition so a concurrent hold wins or is ordered
  after the receipted action rather than being silently bypassed;
- retention writes immutable tombstones and audit;
- ClickHouse first suppresses `object_deleted`/`deleted` from current search,
  then performs physical evidence-row deletion and activity-reference scrubbing
  across every target in the sealed plan. A receipt is written only after the
  pinned engine reports completion and negative scans succeed;
- legal hold overrides ordinary expiry;
- deleted evidence returns a safe tombstone state, not a dangling object error;
- canonical identity history survives source evidence expiry to the degree allowed by approved policy;
- rebuilds respect tombstones and never recreate a receipted target.

## Backup and rebuild

PostgreSQL and object storage are authorities and require coordinated backup manifests. ClickHouse is rebuilt, not treated as the sole recovery source. Projection recovery is:

```text
create generation
→ snapshot canonical ledgers at watermark
→ bulk project
→ consume outbox tail
→ compare invariants
→ atomically activate generation
→ retain old generation for rollback window
```

No in-place truncate-and-rebuild serves customer traffic.

Content addressing deduplicates immutable object bytes but not evidence identities: multiple distinct records may reference the same `(tenant, object_key)`. Evidence metadata therefore indexes object key without making it unique.
