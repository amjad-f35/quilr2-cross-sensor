# ADR-0014: Quilr 1 migrates as evidence

Status: **accepted**

## Context

Quilr 1 inventory is assembled from heterogeneous stores with inconsistent source semantics. Copying its rows and graph IDs would preserve ambiguity as Quilr 2 truth.

## Decision

Extract Quilr 1 state as immutable legacy source records with store, ID, watermark, transformation version, and limitations. Normalize and resolve it centrally under imported-legacy authority. Preserve compatibility aliases.

## Consequences

- Migration needs re-resolution and semantic parity, not an ETL row copy.
- Some legacy identities may split or remain unresolved.
- Customer-visible changes require explanation.
- Cutover is tenant/domain phased and reversible.

## Rejected

Legacy primary key as canonical ID, equal row counts as parity, or untracked bidirectional dual-write.

## Validation

Historical sampling, mapping completeness, member-level parity, backfill replay, cohort rollback, and retention/decommission.
