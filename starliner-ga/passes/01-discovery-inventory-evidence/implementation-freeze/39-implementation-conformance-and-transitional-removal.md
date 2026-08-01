# Implementation Conformance and Transitional Removal

**Status:** FROZEN; 2026-08-01

**Purpose:** bind the current multi-repository implementation to the DIE
authority without confusing a working preview, a test oracle or a passing
local slice with a completed production contract. This is the normative debt
and conformance policy for the bounded Discovery / Inventory / Activity-
Observability / Evidence pass.

## Authority and implementation are different ledgers

The architecture, schemas, ontology, SQL, OpenAPI, authorization model and
UI lineage define required behavior. The implementation may be ahead in one
slice and behind in another. That difference is tracked only in
[`implementation-conformance.csv`](registers/implementation-conformance.csv),
using these closed classifications:

| Classification | Meaning |
|---|---|
| `specified_not_implemented` | the required behavior is frozen but no verified production path implements it |
| `transitional_must_remove` | a bounded development mechanism exists and is prohibited in customer production |
| `implemented_not_certified` | real code exists but exact release evidence or a required runtime gate is missing |
| `release_evidence_missing` | the implementation may exist, but the frozen exit evidence is absent |
| `implementation_contradiction` | the current code or advertised state disagrees with the frozen contract |
| `accepted_complete` | the exact commit/tree has all required retained evidence; absence of this state is not failure, and it must never be self-awarded from green unit tests |

Every row carries the exact inspected commit. Dirty uncommitted work is not
evidence and cannot change a row's classification. A coding agent updates a
row only in the same verified commit that adds the closure evidence.

## Transitional mechanisms that cannot ship

The following are explicit removal obligations, not architectural options:

1. HS256 user/workload authentication is local-test-only. Production uses
   the OIDC/JWKS contract in 37 and refuses symmetric/no-verifier startup.
2. Unsigned manifest application is local-test-only. Production uses the
   signer registry and audit contract in 38 and refuses `insecure_dev`.
3. Python normalizer/truth/conformance modules remain executable oracles and
   test tools only. Production images contain the compiled role artifacts;
   no production request, work lease or database mutation can route to a
   Python reference implementation.
4. SQL-seeded bootstrap, generation activation or identity state is allowed
   only inside explicitly named test harness setup. The deployed maintenance
   and control paths own those transitions and their audit.
5. Honest-empty typed inventory responses are temporary capability states.
   They are never marketed as supported until an LG-005-certified native
   path populates them.

Transitional code must be isolated behind build/runtime guards, visibly
labelled, absent from production artifact reachability, and paired with a
deletion condition. A release build fails if a forbidden mode is selected.

## Production code-quality constitution

All production modules obey these constraints:

- dependency direction is `transport/role -> application use case -> domain
  interface`; domain packages do not import HTTP, PostgreSQL, ClickHouse,
  object-provider or UI packages;
- PostgreSQL and ClickHouse adapters implement ports and contain no product
  authorization or identity decisions;
- authority decisions occur once, in the designated module; projections and
  API serializers never recreate canonicalization or precedence logic;
- all background execution uses durable work, bounded leases, fencing,
  idempotency and explicit terminal/error state; no goroutine/in-memory queue
  is correctness authority;
- errors retain stable safe codes, wrap causal detail for internal logs and
  never expose SQL/provider/raw evidence details to clients;
- configuration is typed, validated at startup and classified as secret or
  non-secret; insecure production combinations refuse to start;
- clock, UUID, randomness, signer, store and network dependencies are
  injectable at test boundaries; production wiring uses real implementations;
- public packages and interfaces stay minimal; an interface exists at a real
  substitution/trust boundary, not merely to make every struct mockable;
- no unbounded query, collection, JSON object, batch, retry, cache or
  concurrency fan-out is accepted;
- generated OpenAPI clients and schemas are regenerated deterministically and
  checked for clean-tree drift.

## Scaling and performance constraints

The modular core stays one semantic release authority while role processes
scale independently. The frozen lanes remain control, inventory truth,
activity and bulk replay. Implementations must prove:

- no tenant-global or platform-global lock on activity;
- source-object and canonical-aggregate locks use stable sorted keys and
  bounded critical sections;
- entity/relationship truth transactions do not perform ClickHouse/object
  network I/O; publication uses the transactional outbox;
- pagination is keyset/cursor based; authorization runs before query planning;
- cardinality-heavy labels/content cannot become metric labels, SQL indexes or
  ClickHouse ordering-key dimensions;
- backpressure propagates to durable queues and coverage/gap state, never to
  silent drop;
- partition counts, batch bounds, queue age, projection lag, resolver
  conflicts and cache hit/miss behavior have budgets and alerts;
- load plans include hot tenant, hot producer, skewed relationship degree,
  late arrival, replay storm and rebuild while serving.

Performance gates may tune physical indexes, partitions and replica counts;
they may not weaken evidence, tenancy, authorization, ordering or lineage
semantics.

## Required completion evidence

No work package exits from prose or a branch label. Exit requires:

1. exact commit and clean tree;
2. authority digest and generated-contract drift check;
3. unit, property, negative and race tests at the changed boundary;
4. compiled multi-process vertical for the affected path;
5. target-engine/provider/native/browser evidence when the gate requires it;
6. tenant isolation, field masking and authorization negatives;
7. restart, duplicate, stale lease, replay and partial-failure cases;
8. retained commands, versions, configuration digest and artifacts;
9. conformance ledger and work-state update in the same commit;
10. independent verification for any `accepted_complete` classification.

Green tests prove only their assertions. Stubs, skipped paths, test-only SQL
seeding, fixtures substituted for native output and honest-empty screens remain
explicit in evidence.

## Frozen current gap set

The conformance register is the machine list. Its mandatory themes are:

- production OIDC/JWKS and server-private sessions;
- signed manifest trust and key lifecycle;
- source temporal/retraction precedence fixtures through the compiled path;
- all 45 OpenAPI operations and generated client;
- typed inventory hydration only from certified source facts;
- full scope/ABAC/ReBAC/dynamic-map enforcement;
- generation activation, standby, rollback and rebuild automation;
- five native certification packs and cross-language crypto parity;
- object lifecycle/erasure qualification;
- production image removal of reference-only code;
- exact-SHA security, load, chaos, DR and operational evidence.

These are implementation and release obligations. They do not authorize
agents to redesign the spine or silently narrow the product.

## Change control

An implementation contradiction is resolved by changing code to the frozen
contract unless executable evidence proves the contract inconsistent or
unimplementable. Only then may an ADR change authority, and the ADR must
update schemas, SQL, OpenAPI, registers, fixtures, validators and UI lineage
atomically. “The current code already works differently” is not an ADR.
