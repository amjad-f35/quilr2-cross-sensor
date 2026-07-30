# Lifecycle, Reconciliation, and Time

## Continuous identity inputs

Every authoritative integration uses:

1. events/webhooks for low latency;
2. incremental cursors for efficient change capture;
3. periodic scoped/full reconciliation to repair gaps;
4. runtime verification for consequential actions.

## Time fields

```text
occurred_at       source event time
observed_at       when source observed the fact
enqueued_at       edge durable enqueue time
ingested_at       central admission time
valid_from/until  source claim business validity
system_from/until canonical ledger system validity
last_confirmed    most recent accepted confirmation
stale_after       source/entity freshness boundary
deleted_at        source authoritative deletion time
retired_at        canonical lifecycle retirement time
revoked_at        authority/credential revocation time
```

All timestamps are UTC RFC 3339 strings with bounded precision. Clock offset/uncertainty is recorded when known. Processing never silently rewrites source time.

## Sequence

- Sequence is monotonic only within declared stream.
- Stream identity and reset/generation semantics are profile-defined.
- Gaps are persisted and lower coverage.
- The platform accepts bounded reordering and does not wait indefinitely.
- Hash chains are required for high-assurance profiles where feasible.
- Sequence is not cross-source correlation identity.

## Reconciliation protocol

```text
start run with tenant/source/scope/cursor
→ page source
→ validate/authenticate
→ append records and source tombstones
→ durably commit page and next cursor atomically/recoverably
→ complete manifest with counts/hashes/scope
→ generate authoritative absence candidates if profile permits
→ recompute lifecycle/coverage/findings
```

Required run fields:

```text
reconciliation_run_id
tenant_id
connector/source instance
scope and filters
started/finished
starting/ending cursor
page count
record/upsert/delete/error counts
scope completeness
manifest hash
source health
adapter/profile versions
status
```

## Deletion rules

1. A source delete tombstones that source assertion.
2. An authoritative complete reconciliation may prove native absence only for its declared scope.
3. Connector failure, expired credentials, partial pages, rate-limit interruption, or stale coverage cannot prove absence.
4. Canonical retirement requires explicit lifecycle policy, source authority, required-coverage satisfaction, and retention.
5. Provenance records are retained even if the source artifact is later deleted.

## Corrections

Corrections include the superseded record and source revision. Ingest preserves both. Normalizers and materializers apply source-specific precedence while historical queries reconstruct previous state.

## Reappearance

- Restore the prior canonical ID only when strong identity remains valid.
- Re-run governance, ownership, credential, certification, and authorization checks.
- Never restore revoked authority automatically.
- Emit a reappearance lifecycle event.

## Late data

Late evidence may:

- restate event-time projections;
- change correlation confidence;
- add/remove relationship validity;
- reopen or close findings;
- change historical metrics;
- never mutate raw evidence.

Affected APIs expose the data/materializer version and update time.
