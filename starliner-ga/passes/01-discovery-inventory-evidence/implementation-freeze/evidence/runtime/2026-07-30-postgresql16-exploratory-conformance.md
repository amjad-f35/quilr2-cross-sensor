# PostgreSQL 16.14 exploratory conformance — 2026-07-30

## Classification

`RUNTIME_OBSERVED`, compatibility evidence only. This is not `LG-001`.

## Environment

- host: macOS ARM64;
- engine: Homebrew PostgreSQL `16.14`;
- database: disposable cluster under `/private/tmp`;
- initialization: `--no-locale --encoding=UTF8`;
- repository state: working tree under active revalidation, before the final
  commit recorded by the parent handoff.

## Executed inputs

1. `sql/001-die-core.sql`;
2. `sql/003-die-roles-and-grants.sql`;
3. `tools/live/postgres-conformance.sql`.

The runner stopped on the first SQL error. During the first executions it
exposed invalid PostgreSQL functions/expressions, trigger row-shape defects,
expected-population deferred-head behavior, timezone-sensitive audit hashing,
and an erasure worker privilege failure. Those are retained as
`FP-055..FP-066` in the defect ledger. After correction, the full current
transaction completed and rolled back as designed.

## Final observed result

```text
postgres (PostgreSQL) 16.14 (Homebrew)
...
ROLLBACK
PG16 exploratory conformance passed
```

The passing run covered current DDL creation, extensions, roles/grants,
FORCE-RLS catalog assertions, cell/principal isolation, authorization revision
history, audit-chain hashing under UTC and America/Los_Angeles,
expected-population/canonical/coverage revision checks, stage-role and lease
fencing, projection activation/standby/export checks, and the erasure
hold/execution/receipt smoke sequence.

## Explicit limitations

- PostgreSQL 16.14 is not the selected PostgreSQL 17.10 production target.
- The complete stdout was observed in the controlled run but was not retained
  as an immutable CI artifact.
- The required multi-session contention and crash/failover expansion was not
  executed.
- Therefore this result narrows compatibility uncertainty but does not close
  `LG-001`.
