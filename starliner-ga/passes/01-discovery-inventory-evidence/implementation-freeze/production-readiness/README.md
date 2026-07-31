# DIE Production-Readiness Gate Authority

This package turns `LG-001..007` from high-level blockers into executable
engineering contracts. It is subordinate to the implementation freeze and
does not change its domain semantics.

## What “ready” means

| State | Current verdict | Meaning |
|---|---|---|
| architecture and semantic freeze | YES | no known in-scope authority, identity, graph, evidence, API or UI semantic remains for an implementer to invent |
| production-code implementation | YES | teams may implement every bounded-pass module behind the frozen contracts |
| internal end-to-end integration | NO | implemented services, adapters, stores, generated client and UI have not yet passed together |
| controlled pilot | NO | security, native certification, lifecycle, operations and release evidence remain open |
| production GA | NO | every applicable gate in this package must pass on immutable release artifacts |

“Production-code implementation” means writing real production software. It
does not mean deploying unfinished software to customers or advertising
uncertified capability.

## Gate documents

| Gate | Specification | Production claim blocked until closure |
|---|---|---|
| `LG-001` | [PostgreSQL](01-lg001-postgresql.md) | canonical authority, tenant isolation and worker-state runtime correctness |
| `LG-002` | [ClickHouse](02-lg002-clickhouse.md) | projection correctness, performance and physical lifecycle |
| `LG-003` | [Object storage](03-lg003-object-storage.md) | immutable evidence, retention, legal hold and provider deletion |
| `LG-004` | [API and Nuxt](04-lg004-api-nuxt.md) | production customer UI and exports |
| `LG-005` | [Native adapters](05-lg005-native-adapters.md) | shipping or advertising each sensor profile |
| `LG-006` | [Cross-language cryptography](06-lg006-cross-language-crypto.md) | producer/platform trust interoperability |
| `LG-007` | [Erasure completeness](07-lg007-erasure-completeness.md) | complete production deletion claims |

Cross-gate authority:

- [assurance and evidence model](00-assurance-model.md);
- [environment, CI and release evidence](08-environments-ci-and-release-evidence.md);
- [implementation work packages](09-implementation-work-packages.md);
- [machine test catalog](registers/gate-test-catalog.csv);
- [readiness levels](registers/readiness-levels.csv); and
- [gate evidence schema](../schemas/gate-evidence-package.schema.json).

## Non-negotiable rule

A gate closes only when every required catalog row is `PASS`, its evidence
package validates, the exact candidate commit/artifact digests are bound, and
an independent reviewer finds no unregistered P0/P1 failure in that gate's
scope. Prose, fixtures, mocks and local smoke are inputs; none independently
close a live gate.
