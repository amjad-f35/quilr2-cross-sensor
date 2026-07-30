# ADR-0004: Immutable evidence and bitemporal ledgers

Status: **accepted**

## Context

Sources correct data, records arrive late, snapshots are partial, and identity decisions change. Updating a current inventory row destroys what the platform knew and why.

## Decision

Accepted source records are immutable. Corrections, tombstones, source revisions, snapshot completion, and supersession append. Canonical claims, entities, and relationships record valid time and system time.

## Consequences

- Replay can reconstruct current or historical truth.
- “What was true” and “what Quilr knew” are separable.
- Storage and materialization are more sophisticated.
- Retention/deletion require tracked workflows rather than row deletion.

## Rejected

Mutable source rows, current-only graph edges, or treating event time as ingest time.

## Validation

Late correction, incomplete snapshot, source reset, historical query, identity split, retention, and deterministic replay.
