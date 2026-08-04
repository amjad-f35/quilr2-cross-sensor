# DIE Production-Readiness Gate Authority

This package turns `LG-001..007` into executable release-qualification
contracts. It is subordinate to the implementation freeze and does not change
domain semantics or authorize a gate-first implementation schedule.

**Every LG has `blocks_implementation = NO`.** Open and failed gates are
active engineering work and prevent only the applicable reliance, promotion,
advertisement or release claim. Product implementation and independent lanes
continue under document 41.

## Freeze-publication authorization

This table records what the frozen authority permits or requires. It is not a
runtime status report for a later implementation commit.

| State | Freeze-publication disposition | Meaning |
|---|---|---|
| architecture and semantic freeze | YES | no known in-scope authority, identity, graph, evidence, API or UI semantic remains for an implementer to invent |
| production-code implementation | YES | teams may implement every bounded-pass module behind the frozen contracts |
| internal end-to-end integration | NOT ENCODED HERE | derive only from current implementation-repository capability state and its bound runtime manifest |
| controlled pilot | GATE-BOUND | requires current exact-artifact security, native, lifecycle and operational evidence; this package defines but does not report that state |
| production GA | GATE-BOUND | every applicable gate must pass on the current immutable release artifacts |

“Production-code implementation” means writing real production software. It
does not mean deploying unfinished software to customers or advertising
uncertified capability.

The current product state is not encoded in this frozen package. It is recorded
in implementation-repository `PROGRAM_STATE.md`, `PRODUCT_DELIVERY_STATE.csv`
and exact runtime manifests. A dated branch report cannot become scheduling
authority.

## Gate documents

| Gate | Specification | Claim prevented until closure | Blocks implementation |
|---|---|---|---|
| `LG-001` | [PostgreSQL](01-lg001-postgresql.md) | canonical authority, tenant isolation and worker-state runtime correctness | NO |
| `LG-002` | [ClickHouse](02-lg002-clickhouse.md) | projection correctness, performance and physical lifecycle | NO |
| `LG-003` | [Object storage](03-lg003-object-storage.md) | immutable evidence, retention, legal hold and provider deletion | NO |
| `LG-004` | [API and Nuxt](04-lg004-api-nuxt.md) | production customer UI and exports | NO |
| `LG-005` | [Native adapters](05-lg005-native-adapters.md) | shipping or advertising each sensor profile | NO |
| `LG-006` | [Cross-language cryptography](06-lg006-cross-language-crypto.md) | producer/platform trust interoperability | NO |
| `LG-007` | [Erasure completeness](07-lg007-erasure-completeness.md) | complete production deletion claims | NO |

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

This closure rule is intentionally stronger than implementation completion.
Production-path code can be implemented, integrated and corrected before a
release gate closes; it simply cannot inherit the stronger claim.
