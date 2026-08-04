# ADR-0020: DIE migration is a separate parallel track

Status: **accepted; supersedes only ADR-0019 migration sequencing**

## Context

ADR-0019 correctly made Discovery, Inventory, and Evidence the first customer
product and correctly expanded the permanent path to every owned launch sensor
family. It also made Quilr 1 legacy acquisition, coexistence, parity, cohort
cutover, fallback, and rollback prerequisites of the bounded implementation and
`DIE-GA`.

The product directive now separates those concerns. The new product must be
built directly from the five launch producer profiles without importing or
depending on Quilr 1. Customer migration and coexistence remain necessary for a
future rollout to existing customers, but they require their own inventory,
staffing, runtime, inputs, security review, parity proof, and release authority.
Making those unavailable migration decisions a prerequisite would prevent the
new product from being completed and would mix two independently governable
programs.

## Decision

The bounded first DIE product and `DIE-GA` use exactly these launch producer
profiles:

1. Browser;
2. Browser Backend as a distinct producer;
3. Endpoint;
4. LLM Gateway; and
5. MCP Gateway.

No Quilr 1 extractor, backfill worker, legacy source profile, migration state,
parity service, compatibility API/UI, cohort controller, fallback path, or
migration-only input is required to implement, integrate, or release that
bounded product.

Quilr 1 migration and coexistence are a separately authorized parallel track.
That track:

- preserves ADR-0014: legacy state enters as lineage-preserving evidence and
  legacy identifiers remain aliases rather than canonical identity;
- consumes the bounded product's versioned evidence admission, identity-alias,
  tenant-routing, API, and export extension seams;
- owns its extractor/backfill runtime, watermarks, mappings, parity state,
  cohort state, compatibility surfaces, credentials, operations, and evidence;
- proves member-level semantic parity, reversible cohort cutover, fallback,
  rollback, and stabilization under the independent `MIGRATION` track gate; and
- may proceed before, during, or after other product increments when separately
  staffed and authorized, but does not block `DIE-GA` or gates G2 through G5.

G6 continues to govern final Quilr 1 retirement and cannot close until the
migration track, fallback window, consumer disposition, retention, legal hold,
and decommission requirements are complete.

## Preserved architecture and end goal

This ADR changes release sequencing only. It does not change:

- the constitutional evidence, identity, canonical, tenancy, authorization, or
  storage architecture;
- the five-profile DIE product scope;
- ADR-0014 or the legacy evidence and compatibility model;
- the no-big-bang, tenant/domain-cohort, reversible migration strategy;
- any future migration, consumer, retention, rollback, or retirement
  requirement; or
- the rule that no customer data or workflow is discarded during an authorized
  migration.

## Consequences

- Coding agents can finish the bounded product without inventing migration
  inputs, legacy runtime behavior, or customer cutover policy.
- Migration artifacts cannot silently enter the bounded DIE runtime, role map,
  launch profile count, or release evidence.
- Stable extension seams must remain versioned and compatible so the migration
  track can attach later without redesigning canonical authority.
- The migration program remains fully specified and gated rather than deleted,
  deferred into folklore, or mistaken for product implementation debt.

## Rejected

- requiring legacy backfill or cohort cutover before the new five-profile
  product can ship;
- deleting migration requirements because they are outside bounded DIE;
- treating the Quilr 1 tenant identifier or legacy rows as new canonical
  authority;
- silently mixing Quilr 1 and Quilr 2 reads at request time; and
- making customer migration a best-effort cleanup after legacy retirement.

## Validation

- `DIE-GA` names exactly the five launch producer profiles and contains no
  migration/coexistence proof;
- `MIGRATION` owns legacy acquisition, parity, cutover, fallback, rollback,
  and stabilization evidence;
- first-product requirements and implementation plans contain no migration
  prerequisite;
- legacy migration requirements remain normative and map to `MIGRATION` or
  G6; and
- the corpus validator rejects any future reintroduction of a sixth legacy
  launch profile or migration proof into `DIE-GA`.
