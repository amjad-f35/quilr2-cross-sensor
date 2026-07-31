# LG-007 — Physical Erasure Completeness

## Authority model

An evidence record can have copies or references in:

- primary object storage and version history;
- ClickHouse evidence search history;
- ClickHouse activity evidence references;
- PostgreSQL read/export state;
- caches and search acceleration;
- completed or staged exports;
- backups where contractually erasable;
- historical tenant cells/regions after placement changes;
- provider replication or restore locations represented by deployment policy.

The deployment placement ledger is authoritative for where a class may exist.
The erasure planner snapshots that ledger, enumerates exact typed targets,
orders them, hashes the manifest and seals it before execution.

## State machine

```text
building → sealed → executing → object_deleted → deleted
              │
              └─ legal hold may win only before executing linearizes
```

- target append/remove is forbidden after seal;
- at least one object target is mandatory;
- `object_deleted` requires every object target receipt;
- `deleted` requires every target receipt;
- receipts are append-only and bind plan, target, locator, provider operation,
  result, verifier and time;
- retry uses the same plan/target identity;
- terminal state does not rely on UI suppression.

## Required proof families

- authoritative enumeration covers current and historical placements;
- deliberately omitted placement prevents sealing/certification;
- stale placement snapshot is rejected;
- pre-execution legal hold wins and makes no provider delete call;
- post-execution hold returns the explicit too-late result;
- object exact-version deletion and negative read/list/version scan;
- ClickHouse mutation completion and negative search/history/reference scan;
- cache/search invalidation plus direct negative read;
- export revocation/deletion and download-token invalidation;
- tenant cell move followed by erasure covers old and new cells;
- crash after external deletion but before receipt resumes idempotently;
- partial target failure cannot advance terminal disposition;
- restored backup cannot silently resurrect terminally erased data; the
  documented backup-erasure policy is exercised;
- independent verifier recomputes manifest and scans every locator.

## Closure

The deployment/storage placement inventory must exist before this gate can
close; static architecture cannot invent live locations. Every `LG007-*` row
passes with seeded copies in every supported location class. The final package
contains the placement snapshot, sealed manifest, receipts and independent
negative scan.
