# Target-engine local conformance — 2026-07-30

## Classification

`RUNTIME_OBSERVED`, exact-version local smoke evidence. It narrows but does not
close `LG-001` or `LG-002`.

## PostgreSQL

- engine: Homebrew PostgreSQL `17.10`;
- host: macOS ARM64;
- runner: `tools/run-local-postgres-conformance.sh`;
- cluster: disposable `/private/tmp` data/socket path;
- initialization: `--no-locale --encoding=UTF8 --data-checksums`;
- inputs: core DDL, roles/grants and the full current live PostgreSQL
  conformance transaction.

Observed terminal result:

```text
postgres (PostgreSQL) 17.10 (Homebrew)
...
ROLLBACK
Local PostgreSQL conformance passed
```

This proves that the corrected baseline and current smoke assertions execute on
the selected PostgreSQL patch. It does not supply an immutable container digest
or the complete multi-session contention/crash/failover matrix.

The suite was rerun after the connector-extensibility correction. It also
proved that:

- the five launch source-profile/version rows load with exact schema digests;
- a release-registered `connector.copilot_studio` profile can enroll a pending
  producer through the same producer registry;
- an unregistered connector profile fails closed;
- runtime roles cannot mutate the global release-managed profile registry; and
- producer capabilities and trusted producer transitions require registered,
  admissible profile versions.

## ClickHouse

- engine: official ClickHouse `26.3.17.56` LTS macOS ARM64 binary;
- release: `v26.3.17.56-lts`;
- release asset: `clickhouse-macos-aarch64`;
- verified SHA-256:
  `35f2c5a99e224a4c61d03aebaba7f3ec72c87ae7009c8417ce4e5cc9231446bc`;
- runner equivalent: `tools/run-local-clickhouse-conformance.sh`;
- state: disposable `clickhouse local --path` directory under `/private/tmp`;
- inputs: ClickHouse DDL and deterministic-winner/deleted-evidence smoke
  queries with `async_insert=0`.

The first DDL execution failed with:

```text
Aggregate function max(canonical_watermark) AS canonical_watermark is found
inside another aggregate function in query. (ILLEGAL_AGGREGATION)
```

The evidence-current view used an output alias that ClickHouse substituted
inside earlier `argMax` expressions. `FP-069` records the correction to a
source-qualified inner aggregate and outer disposition filter.

After correction:

```text
ClickHouse local version 26.3.17.56 (official build).
DDL exit: 0
conformance exit: 0
```

The two printed `0` values were the successful `throwIf` expressions. This
proves DDL/materialized-view creation, deterministic activity tie-breaking and
deleted-evidence suppression on the exact selected engine. It does not prove
server cluster settings, physical mutations/negative scans, generation
activation under load, query plans, capacity, crash recovery or immutable
container-image provenance, so `LG-002` remains open.
