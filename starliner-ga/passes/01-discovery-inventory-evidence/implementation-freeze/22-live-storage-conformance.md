# Live Storage Conformance

This document is the exact evidence-producing gate for facts static inspection
cannot establish. It does not record a pass until the commands run successfully
and their complete output and image digests are retained.

## Frozen engines

The initial conformance matrix uses:

- PostgreSQL `17.10` Alpine image
  `postgres:17.10-alpine3.24`;
- ClickHouse `26.3.17.56` LTS image
  `clickhouse/clickhouse-server:26.3.17.56`.

Before CI adoption, resolve and commit each pulled image's immutable repository
digest. A tag-only successful run is useful evidence but is not the final
supply-chain pin.

The version policy is major/LTS-line plus current supported patch, not a
permanent stale patch. PostgreSQL remains on major 17 and must advance to the
current 17.x security/bug-fix release after the same suite passes. ClickHouse
remains on the current 26.3 LTS patch line until a later LTS upgrade is
qualified. The initial projector uses synchronous batched inserts
(`async_insert=0`) so the 26.3 default change cannot alter acknowledgement,
deduplication or materialized-view behavior implicitly.

## One-command execution

From this implementation-freeze directory:

```bash
./tools/run-live-storage-conformance.sh
```

The runner:

1. pulls both exact version tags;
2. prints repository digests for retention with the log;
3. starts disposable, explicitly named containers;
4. applies `001-die-core.sql` and `003-die-roles-and-grants.sql`;
5. runs `tools/live/postgres-conformance.sql`;
6. applies `002-die-clickhouse.sql`;
7. runs `tools/live/clickhouse-conformance.sql`;
8. stops the disposable containers on exit.

The runner accepts only these scoped overrides:

```bash
DIE_POSTGRES_IMAGE='postgres@sha256:<approved-digest>' \
DIE_CLICKHOUSE_IMAGE='clickhouse/clickhouse-server@sha256:<approved-digest>' \
./tools/run-live-storage-conformance.sh
```

## Current executable assertions

### PostgreSQL

- the baseline executes in declared file order on an empty database;
- required extensions and all constraints/triggers/grants are accepted;
- a runtime API role with tenant A context cannot see tenant B producer data;
- the same API login receives no tenant context and no rows after setting the
  GUC to an existing tenant assigned to a different session principal;
- the ingest role may advance only monotonic producer heartbeat state;
- authorization grants cannot carry a fabricated future revision;
- a grant closes only at the locked current authorization revision;
- the database replaces an application-supplied audit hash, links it to the
  prior head and advances the head exactly once;
- expected-population version one closes and advances to exact version two
  while payload mutation fails;
- canonical heads reject non-one initialization and commit only with the exact
  current version and typed pointer;
- coverage advances exact identity-preserving revisions and rejects a skip;
- aggregate-incompatible outbox change types fail;
- terminal work without its fenced execution fails, while the matching
  same-transaction pair commits;
- a complete required-partition manifest/checkpoint barrier can verify,
  activate, enter standby, reactivate and finally retire;
- an export binds the active product generation and a new export against that
  generation while it is standby fails.

### ClickHouse

- the DDL and current views execute on the frozen engine;
- two equal canonical versions resolve by digest deterministically;
- immutable `MergeTree` history is retained rather than nondeterministically
  collapsed before selection;
- a later `deleted` evidence disposition removes the record from the current
  search view.
- an erasure plan cannot seal with a wrong count/digest or without an object
  target, targets cannot be appended after seal, execution cannot start after a
  winning legal hold, a hold cannot be reported after execution commits,
  `object_deleted` requires all object receipts, and terminal `deleted` requires
  every target receipt;
- ClickHouse physical deletion and activity evidence-reference scrubbing wait
  for completed mutations and negative scans before their receipt is inserted.

## Required expansion before domain implementation broadens

The first storage conformance pull request must extend the PostgreSQL suite with:

- direct parent and default-child RLS reads/writes for every runtime role;
- catalog assertions for `NOBYPASSRLS`, table ownership, grants, policies and
  default privileges;
- producer pending → certified → trusted → degraded/revoked and forbidden
  transitions;
- capability overlap rejection and close-only history;
- expected-population concurrent writers, skipped heads and overlapping
  interval negatives beyond the executable two-revision smoke case;
- admission receipt lost-response replay and mixed accepted/rejected records;
- referenced-only source shell promotion and cross-producer reference order;
- assertion nonce replay, expired certification and profile mismatch rejection;
- normalization bundle count/digest drift rejection;
- lease expiry, renewal, stolen-token, execution-without-terminal-work and stale
  execution races beyond the executable missing-execution smoke case;
- canonical version + support links + exactly one outbox pointer in one
  transaction, including orphan/type/lifecycle mismatch and multiple-current
  activity negatives;
- missing pointer, duplicate same-version pointer and invalid pointer target;
- merge/split/alias cycle and binding overlap/disjoint history;
- evidence legal-hold/deletion transition matrix;
- projection required-manifest mismatch, missing partition, unequal watermark,
  duplicate destination acknowledgement, dual-active, standby rollback and
  terminal retirement concurrency matrix;
- expired API idempotency terminalization and maintenance-only purge;
- concurrent audit append, rewind, skip and wrong-previous-hash rejection.

The ClickHouse suite must add:

- invalid hex digest, unsafe integer, non-finite metric and oversize collection
  rejection;
- duplicate delivery and same-version/different-digest detection at the
  projector boundary;
- generation build/reconcile/activate/rollback;
- activity tombstone/suppression and evidence disposition filtering;
- sealed erasure-manifest digest verification, missing-receipt rejection,
  physical evidence-row purge and activity evidence-reference scrubbing across
  all target locators from the placement snapshot;
- privacy canaries proving raw source/correlation identifiers and content never
  enter projection columns;
- partition pruning and representative list/activity/evidence query plans at
  target cardinality.

## Object storage gate

The deployment-selected `EvidenceObjectStoreV1` adapter must run a separate
test pack. AWS S3 Object Versioning + Object Lock is the reference profile; a
different provider must satisfy the same assertions rather than merely expose
an S3-shaped API.

1. conditionally put evidence-scoped content-addressed immutable bytes;
2. retry the same digest and reject different bytes at the same key;
3. fail the PostgreSQL transaction after put and prove delayed orphan cleanup;
4. commit metadata and simulate temporary object unavailability without
   acknowledging missing evidence;
5. prove the evidence prefix has no autonomous lifecycle deletion;
6. race legal-hold append against the shared lifecycle lock and
   `sealed → executing` transition in both orders;
7. prove no provider call starts before the committed `executing` state and an
   attempted hold after that point returns the explicit too-late result;
8. persist exact provider version/delete evidence before `object_deleted`;
9. prove restore/retention behavior and signed backup-manifest consistency;
10. seed object, ClickHouse, cache, export and historical pre-cell-move
   placements; prove the planner's ordered target manifest matches the
   authoritative placement inventory exactly before sealing.
11. show that omission of any placement target fails certification even when
    every declared target has a receipt.

Deployment provider, account, exact version/feature set, retention mode, keys
and credentials remain unresolved live inputs. The provider-neutral port and
reference profile are frozen; no provider behavior is claimed from the SQL
state machine alone.

## Evidence record

A passing CI job must retain:

- command and UTC start/end time;
- host architecture;
- repository commit;
- image tags and immutable digests;
- full stdout/stderr;
- PostgreSQL and ClickHouse reported versions;
- applied migration checksums;
- assertion counts;
- any retry or quarantine output.

The corresponding `LG-*` ledger item changes from
`blocked_by_live_evidence` to `verified` only after that artifact is linked.
