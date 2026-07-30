# Integrity, Idempotency, and Delivery

## Canonicalization

JSON hashing uses RFC 8785 JCS with project test vectors and verified errata:

- duplicate keys rejected;
- invalid Unicode/lone surrogates rejected;
- NaN/infinity forbidden;
- negative zero rejected;
- high-precision integers/decimals represented as canonical strings;
- UTF-8 bytes;
- envelope hash field exclusions defined exactly.

## Hashes

```text
body_hash   = SHA-256(JCS(body))
record_hash = SHA-256(JCS(envelope_without body_hash, record_hash, signature) || body_hash)
```

If the signature is present, it signs a versioned signing input containing protocol/profile/schema IDs, authenticated installation binding where supported, record hash, and signing-key ID.

## Idempotency

Minimum admission scope:

```text
authenticated_tenant_id
+ verified_source_installation_id
+ record_type
+ idempotency_key
```

Same key/hash returns duplicate and original evidence ID. Same key/different hash returns conflict and preserves both payload hashes in safe security metadata without overwriting evidence.

Profiles define deterministic idempotency derivation. Timestamp/name-only keys are forbidden.

## Accepted guarantee

`accepted` means:

1. authenticated/admitted metadata is committed;
2. immutable safe record bytes are durable;
3. idempotency reservation is durable;
4. required content references are committed or explicitly absent;
5. durable central handoff/outbox exists;
6. evidence ID is stable.

If any required component fails, the record is not acknowledged as accepted.

## Batch API

```text
POST /v1/evidence/ingest
```

Per record:

```text
accepted
duplicate
rejected
```

Rejection contains bounded code and retryability. Batch HTTP success does not imply every record succeeded.

## Edge WAL/outbox

States:

```text
queued
in_flight
retry_wait
accepted
duplicate
dead_letter
expired_by_declared_policy
lost_due_to_storage_failure
```

Required:

- atomic enqueue;
- unique idempotency;
- `SKIP LOCKED`/equivalent safe claim;
- visibility timeout and stale recovery;
- bounded batches;
- exponential backoff with jitter;
- credential rotation;
- graceful shutdown;
- priority lanes;
- storage encryption/permissions;
- corruption detection;
- compaction only for terminal rows.

## Sampling and loss

Sampling happens before durable acceptance according to a profile/tenant policy. It emits `SamplingSummary` with population, sampled count, period, rule, and affected capability.

A post-enqueue loss emits `SourceGapNotice`, critical health, and coverage degradation. Decision, command, approval, audit, and effect evidence cannot be selected for routine sampling.

## Central transactional outbox

Every canonical transaction inserts projection events in the same PostgreSQL transaction. Consumers:

- process at least once;
- use event ID and target projection version;
- publish watermarks;
- dead-letter safely;
- support replay/reconciliation.

## Replay

Replay is tenant/source/profile/schema/time/version bounded. It writes versioned checkpoints and targets. Original evidence is never changed. Manual resolver constraints and active governance decisions are honored.
