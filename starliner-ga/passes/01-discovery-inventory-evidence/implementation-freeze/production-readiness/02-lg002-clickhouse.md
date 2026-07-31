# LG-002 — ClickHouse Production Conformance

## Frozen runtime design

ClickHouse is an immutable analytical/search projection, never canonical
authority. Projectors consume typed outbox pointers, insert explicit
projection generations, acknowledge destinations, and advance PostgreSQL
checkpoints only after verified insertion. Current views select deterministic
`(canonical_watermark, row_digest)` winners.

Initial correctness uses synchronous acknowledged inserts
(`async_insert=0`, `wait_for_async_insert=1`). Any later async mode requires a
new acknowledgement/idempotency qualification.

## Harness topology

- exact ClickHouse 26.3 LTS patch in server mode;
- production-equivalent single-node or replicated topology, both tested if
  both are supported;
- representative partitioning, storage policy and resource limits;
- immutable projection history, two simultaneous build generations and a
  rollback-ready standby;
- target cardinality datasets with skewed tenants, high-cardinality MCP/tool
  activity and evidence references;
- projector duplicate/reorder/crash injector;
- mutation completion polling and negative-scan verifier;
- query log, part log, mutation log, system tables and plans retained.

## Required proof families

- clean DDL apply and supported migration;
- same-version same-digest idempotency and same-version different-digest
  quarantine;
- deterministic equal-watermark tie behavior before and after merges;
- reorder and duplicate delivery convergence;
- complete build/reconcile/activate/standby/rollback/retire lifecycle;
- no query reads a building, partial or mixed-watermark generation;
- evidence disposition suppresses current search immediately;
- physical evidence purge and activity-reference scrubbing wait for mutation
  completion and pass negative scans before receipts;
- crash/restart between insert, acknowledgement and checkpoint converges;
- content, secrets, raw source identifiers and unapproved correlation values
  never enter projection columns;
- partition pruning and bounded plans for every list/activity/evidence API;
- sustained ingest, query concurrency, merge pressure and disk pressure meet
  capacity/SLO envelopes without silent loss;
- backup/restore or deterministic rebuild from canonical/evidence authority
  reaches the same verified generation digest.

## Closure

Every `LG002-*` required row passes against the digest-pinned server image and
candidate projector. Mutation receipts are tied to completed mutations plus
negative scans. Capacity results include the data generator and exact profile.
No ClickHouse table/view becomes a mutation or identity authority.

The exact 26.3.17.56 local DDL/current-view run is `PASS_LOCAL_SMOKE`, not
server, merge-pressure, mutation, recovery or capacity proof.
