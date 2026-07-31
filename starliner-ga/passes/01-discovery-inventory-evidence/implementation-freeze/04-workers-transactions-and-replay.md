# Workers, Transactions, Replay, and Rebuild

## Delivery semantics

Execution is at least once. Durable effects are exactly once per declared idempotency scope.

“Exactly once processing” is not claimed across networks. Instead:

- every input has a stable identity;
- each stage has a unique `(tenant, stage, subject, input_version, implementation_version)` execution;
- every write is idempotent;
- a stage commits output and downstream work atomically;
- replay produces either identical output or a new explicitly versioned candidate generation.

`work_item.implementation_version` is the immutable `sha256:` artifact digest,
not a mutable release label. It participates in durable work identity as well
as the composite execution foreign key. Re-enqueuing the same subject/input for
the same implementation is an idempotent conflict; a repair or algorithm
upgrade names a new certified artifact digest and receives a new work row.
Changing `input_version` to evade work uniqueness is prohibited, because input
version remains the actual evidence, bundle, candidate, pointer or generation
version consumed by the stage.

## Work leasing

PostgreSQL work rows are claimed with one transaction:

```sql
WITH due AS (
  SELECT tenant_id, work_id
  FROM die_pipeline.work_item
  WHERE stage = $1
    AND status IN ('pending', 'retry')
    AND attempt_count < max_attempts
    AND available_at <= now()
    AND partition_key = ANY($2)
  ORDER BY priority, available_at, work_id
  FOR UPDATE SKIP LOCKED
  LIMIT $3
)
UPDATE die_pipeline.work_item w
SET status = 'leased',
    lease_owner = $4,
    lease_token = $5,
    lease_expires_at = now() + $6::interval,
    attempt_count = attempt_count + 1,
    updated_at = now()
FROM due
WHERE w.tenant_id = due.tenant_id AND w.work_id = due.work_id
RETURNING w.*;
```

All completion/retry updates include `lease_token`. `stage_execution` stores the
exact work ID and token; its insert locks and verifies the matching live lease.
A stale worker cannot publish execution or commit after its lease is lost.
Reciprocal deferred constraints require a leased work row and its matching
immutable execution to reach compatible `completed`/`quarantined` terminal
states in the same transaction. A terminal work row without execution, or an
execution that leaves work leased/retryable, aborts. Long work renews before
one-third of the lease remains. Work units are bounded so ordinary records
finish inside one lease.

`partition_key` begins with the centrally assigned
`lane:<control|inventory|activity|bulk>:` prefix. A deployment receives only
the exact lane/partition keys in its signed runtime configuration, and its
startup self-test refuses an unrecognized or overlapping assignment. This is a
resource-isolation boundary, not a new truth authority: every lane retains the
same fenced work, execution and idempotency contract.

Worker discovery is cell-scoped. A tenant has one cell assignment and each
independent workload login has its own `tenant_cell_principal` row declaring
the one group role it actually holds. The login can list only tenants assigned
to its `session_user`; `current_tenant_id()` also refuses a GUC tenant not in
that active mapping. The scheduler rotates fairly across those tenants. It
opens one tenant transaction, executes `SET LOCAL app.tenant_id` from the
registry rather than work payload, leases/processes work, commits, and clears
transaction state before another tenant. The cell credential, workload
boundary, grants and RLS jointly enforce the boundary.

The shared work table does not imply shared stage authority. Database transition
guards map `normalize` to the normalizer role, `truth` and `identity_command` to
truth, both project stages to projector, and `export`/`maintenance` to
maintenance. Enqueue permissions are separately mapped to the upstream role.
A runtime login cannot lease, retry, cancel, quarantine or publish an execution
for another stage even if it can see a same-tenant work row.

An expired lease is never reclaimed by simply replacing its token. The
maintenance reaper locks expired rows and:

- moves a row with attempts remaining to `retry`, clears its lease fields and
  records `lease_expired` plus a safe timestamp; or
- on the final attempt, inserts a `lease_recovery` execution with result
  `quarantined` and moves the work row to `quarantined` in the same transaction,
  recording `lease_expired_attempts_exhausted`.

Only maintenance may take either recovery path. `attempt_count` and
`max_attempts` are bounded to `0..4096` and `1..4096`; a retry row must always
have another attempt available. A pending/retry row cannot jump directly to
quarantine, so every quarantined result has the same-transaction fenced
execution required by the terminal-state invariant.

## Partitioning and ordering

- ingestion scales by producer;
- normalization partitions by
  `(lane, tenant_id, source_profile, source_object_hash)`;
- truth partitions by
  `(lane, tenant_id, canonical_or_source_aggregate_hash)`;
- projection partitions by `(tenant_id, aggregate_id_hash)`;
- exports partition by tenant and job.

An activity-only normalization run uses the `activity` lane. Any run also
containing entity claims, relationships, coverage or reconciliation uses
`inventory` and remains one atomic transaction. Replay/backfill uses `bulk`;
health/gap and identity-command work use `control`. Lane choice is recomputed
from admitted evidence and normalized outputs and is never copied from a
producer field.

Within an aggregate, the truth worker takes a transaction-scoped advisory lock derived from tenant plus aggregate UUID and rechecks current version. This protects concurrent claims that resolve to the same entity.

Ordering rules:

- producer sequence detects delivery gaps but does not define business event order;
- lifecycle uses source revision where provided, then observed time, then deterministic record ID tie-breaker;
- activity is event-time ordered for display;
- system-time versions record late arrival and correction;
- unrelated aggregates process concurrently.

## Stage contracts

### Normalizer

Input: immutable evidence ID plus exact profile/schema and normalizer
name/version/artifact digest.

Output in one transaction:

- immutable normalization run with output count and bundle digest;
- accepted cross-sensor assertion-use rows, if any, after issuer,
  certification, signature, nonce, audience and request-binding validation;
- source object upsert/current observation pointer;
- one or more immutable observations keyed by deterministic `output_key`;
- claims keyed by deterministic `claim_key`;
- relationship/activity/coverage/reconciliation candidates, activity-resource links and snapshot members;
- stage execution;
- truth work item.

Before inserting truth work, PostgreSQL recomputes the sorted length-prefixed
bundle digest and requires `work_item.input_version` to equal it. It is
deterministic, has no network access, reads no current canonical entity and
assigns no canonical ID.

Permanent schema/semantic errors become quarantine records with safe
diagnostics. A normalizer bug is retryable until attempt policy sends it to
quarantine. Quarantine is visible and replayable under an explicit new
implementation version; it cannot mutate or reuse the terminal work identity.

### Truth

Input: complete normalization run ID plus exact resolver/materializer versions.

Algorithm:

1. lock the complete run, its source objects and affected canonical aggregates in deterministic order;
2. resolve every primary output source object and append binding/conflict decisions first;
3. load active claims, corrections, bindings and negative constraints;
4. select authoritative fields and append entity versions plus claim/correction support;
5. evaluate relationship/activity/coverage candidates against the exact relationship registry and current bindings;
6. materialize resolved candidates with candidate/evidence/resource/relationship links;
7. append `pending_dependency`, `held_ambiguous`, `rejected` or `no_change` evaluations for all others;
8. map coverage to exactly one declared expected population;
9. update stable current pointers;
10. append audit when a decision is material;
11. append canonical outbox changes;
12. commit.

When a binding changes, reverse dependency rows enqueue affected candidates. The next evaluation has a new revision and input-binding digest; prior evaluations remain immutable.

No external call occurs inside the transaction. Expensive candidate generation happens before locking and is revalidated after lock acquisition.

Reconciliation is processed as an ordered source snapshot stream without assuming network arrival order. Any stage may create the `reconciliation_run` shell under its unique producer/profile/snapshot key; `started` records or verifies the start, and a page that arrives first remains `receiving` rather than being discarded. Each `page` computes a digest from its sorted length-prefixed source-reference tuples and appends one unique page candidate plus bounded members. `completed` moves the run to `ready` only after exactly one compatible start, scope consistency, page uniqueness/continuity, declared counts and whole-snapshot digest verify; a missing start, conflicting duplicate page or conflicting terminal record quarantines the run or leaves it degraded until timeout. The truth transaction locks the ready run, evaluates absence once per materializer version, appends `reconciliation_evaluation`, closes eligible source support and emits canonical/coverage outbox changes atomically. Only a completed snapshot declaring `full` completeness for the exact producer/profile/scope may close prior source support that is absent from the membership set. `partial`, `unknown`, `failed`, missing-page and digest-mismatch runs create coverage degradation and never retire inventory. A later explicit source tombstone remains independently authoritative under its source profile.

### Identity command

The API never writes identity or canonical ledgers. Preview persists a short-lived tenant/principal-bound `mutation_preview` containing the normalized request, revisions, scope digest, invariant results and digest. An authorized commit locks that preview, verifies it is active/current, acquires the durable API idempotency record, marks the preview consumed, and inserts one immutable `identity_command`, its `identity_command` work item and request audit atomically. A retry with the same key and request digest returns the original command; the same key with different bytes is rejected. The truth role:

1. fences the command and verifies it is still queued;
2. verifies the stored preview ID/digest, normalized request, expected canonical watermark and current authorization revision;
3. rejects stale/revoked commands without domain mutation;
4. runs the correction transaction described below;
5. records the command result and terminal audit atomically with the canonical changes.

The API polls/streams command status by command ID. This preserves one canonical writer without a synchronous API-to-truth service call.

### PostgreSQL projector

Consumes typed pointer outbox rows in order per aggregate and generation. Each
transaction:

- re-reads the exact authoritative aggregate version instead of trusting an
  outbox payload snapshot;
- verifies the expected prior projection version;
- upserts/deletes the generation row;
- records applied aggregate version;
- advances checkpoint;
- marks projection work completed.

Every `(tenant, projection, generation, partition)` has a durable PostgreSQL `projection_checkpoint` containing the last outbox ID and destination acknowledgement/digest. A generation freezes a required-partition count and sorted length-prefixed manifest digest while building; checkpoints foreign-key to that manifest. PostgreSQL refuses verification, activation or rollback-ready standby unless every required partition acknowledges exactly the applied/source watermark. The generation watermark is the verified lower bound across required partitions, not the maximum reported by the fastest worker.

A newer version makes an older duplicate a no-op. A missing predecessor triggers targeted reconciliation, not blind application.

The producer projection is deterministic, not a polling mashup. A signed enrollment/revocation/certification transaction enqueues `project_postgres` work keyed by producer revision. It also creates or revisions the producer/capability expected-population bindings; overlapping active bindings or a missing/inactive business scope reject the entire transaction. Health and sequence-gap normalization plus canonical coverage changes enqueue a producer read-model refresh keyed by their own durable input version; they do not invent a producer aggregate revision or publish a colliding producer pointer. The projector joins the producer registry, active capability/certification/population rows and latest authoritative health/coverage facts at the stated synchronized product-generation watermark, writes one `producer_current` generation row and advances its checkpoint atomically. A direct request-time join across sensor services is prohibited.

### ClickHouse projector

- batches by tenant, partition month and projection generation;
- uses deterministic `activity_id + canonical_version`;
- writes immutable version rows to `MergeTree`/`AggregatingMergeTree` targets;
- rejects the same aggregate/version arriving with a different row digest;
- consumes evidence-disposition pointers as well as canonical activity changes;
- on `object_deleted`, physically removes evidence-search rows and scrubs that
  evidence ID from projected activity references for each sealed erasure
  target; it waits for engine completion, performs negative scans, and only
  then writes the immutable target receipt;
- persists destination acknowledgement and checkpoint in PostgreSQL;
- on uncertain acknowledgement, retries the identical block;
- reconciles ClickHouse counts/digests against PostgreSQL watermark;
- serves activity and evidence search only through lifecycle-filtered current views;
- never acknowledges its checkpoint merely because a client write returned without verification.

### Maintenance

Runs:

- future partition creation;
- expired lease recovery;
- object orphan detection;
- evidence-object referential checks;
- sequence-gap detection/closure;
- projection verification;
- targeted repair/replay;
- retention tombstones;
- placement-snapshot erasure plans, object/cache/export deletion and immutable
  deletion receipts; terminal `deleted` is rejected until the sealed manifest
  is fully receipted;
- export generation and expiration;
- integrity and audit-chain sampling.

## Retry taxonomy

| Class | Examples | Action |
|---|---|---|
| transient dependency | database failover, object timeout, ClickHouse unavailable | exponential backoff with full jitter |
| contention | serialization failure, lock timeout, version changed | short bounded retry from fresh state |
| capacity | queue limit, tenant quota, destination saturation | backpressure and delayed retry |
| permanent input | schema/profile/privacy violation | quarantine/reject exact bytes |
| implementation defect | invariant violation, impossible state | quarantine, page owner, stop affected partition |
| authorization/trust | revoked producer, tenant mismatch | terminal reject and security audit |

Backoff is capped. Attempt exhaustion does not delete work; it moves to `quarantined` with operator-visible reason.

## Poison and blast-radius isolation

- one bad record cannot fail a batch;
- one aggregate cannot block a tenant partition indefinitely;
- one tenant cannot consume every worker lease;
- per-tenant concurrency and work quotas are enforced;
- a failing profile can be paused without stopping other profiles;
- a projection can be disabled while canonical truth continues;
- an identity invariant failure pauses the affected source object/aggregate, not global truth.

## Backpressure

Signals propagate:

```text
projection lag
→ truth concurrency reduction if outbox budget exceeded
→ normalizer concurrency reduction if truth work budget exceeded
→ ingest 429/retry for the affected tenant/profile
→ edge WAL retention and health/gap reporting
```

Admission protects a reserved control/health lane so producers can report gaps while data lanes are throttled.

## Replay modes

| Mode | Writes | Use |
|---|---|---|
| deterministic verify | no domain writes | prove current implementation reproduces stored digest |
| candidate generation | isolated version namespace | evaluate new normalizer/resolver/materializer |
| targeted repair | active generation with idempotency | recover missing/corrupt derived rows |
| full projection rebuild | new projection generation | schema/query change |
| historical backfill | new evidence origin and watermark | source import |

Reprocessing never overwrites old normalized/canonical versions. Promotion is explicit, audited and reversible.

## Projection activation

1. Create synchronized product generation `N+1` in `building` with the required PostgreSQL/ClickHouse partition count and manifest digest.
2. Insert the immutable required-partition rows, then snapshot the canonical outbox high watermark.
3. Bulk materialize every required partition through that watermark.
4. Consume the tail and persist a destination acknowledgement/digest for every required partition at the same lower-bound watermark.
5. Enter `verifying`; PostgreSQL recomputes the manifest/count/barrier and the verifier compares membership, versions, edge cardinality, activity counts and sampled digests.
6. In one PostgreSQL transaction move `N` from `active` to `standby`, then activate `N+1`; the nondeferrable single-active index is never transiently violated.
7. API resolves the one active synchronized product generation per tenant/request.
8. Rollback atomically moves `N+1` to `standby` and `N` back to `active`; after the rollback window, move obsolete standby generations to terminal `retired`.

No customer sees a partially rebuilt table.

## Shutdown

Workers stop leasing, finish bounded in-flight transactions, release/expire leases and emit final readiness/lag metrics. Forced termination is safe because uncommitted work remains available and committed output is idempotent.
