# Source-Revision and Retraction Precedence

**Status:** FROZEN addendum; frozen 2026-08-01; closes the stale-revision and
retraction contracts the implementation ledger marked
`OPEN — no frozen source-revision contract in authority; do not invent`

**Scope:** exact, executable source-revision carrier, comparison, precedence
and retraction semantics per source profile and per record kind. This addendum
extends the frozen ordering rule in
[workers, transactions and replay](04-workers-transactions-and-replay.md)
(§Partitioning and ordering: *source revision where provided, then observed
time, then deterministic record ID tie-breaker*), the reconciliation and
absence rules in
[relationships, activity and coverage](06-relationships-activity-and-coverage.md),
the claim/supersession and canonical-versioning rules in
[physical data and storage](03-physical-data-and-storage.md), and the
lifecycle rules in
[identity and canonicalization](05-identity-and-canonicalization.md). It does
not reopen any of them. Where this addendum names landed implementation
behavior — idempotent replay, correction succession, one system-current
head — that behavior was already accepted and is restated, not changed.

## Revision carriers

A source revision participates in precedence only where the wire contract
actually carries one. In the frozen v1 profile schemas the carriers are
exactly:

| Profile | Record kind | Revision token | Presence | Producer monotonicity guarantee |
|---|---|---|---|---|
| all five profiles | bounded reconciliation snapshot (`started`/`page`/`completed`/`failed`) | `source_revision` (string ≤ 256) | optional | none guaranteed; treated as a claim |
| browser | application/surface observation | `catalog_revision` (string ≤ 256) | optional | none guaranteed; treated as a claim |
| browser_backend | `application_catalog` observation (`observed`/`changed`/`tombstoned`) | `catalog_revision` (string ≤ 256) | required | none guaranteed; treated as a claim |
| endpoint | — (no non-snapshot carrier in v1) | — | — | — |
| llm_gateway | — (no non-snapshot carrier in v1) | — | — | — |
| mcp_gateway | — (no non-snapshot carrier in v1) | — | — | — |

Consequences, frozen:

- Entity observations other than the two catalog carriers above, all
  relationship upserts/ends, all activity events and all coverage records
  carry **no** source revision in v1. For those records the frozen ordering
  rule collapses to observed time, then deterministic record ID.
- A producer sequence number is a delivery-gap detector and is **never** a
  source revision (already frozen in 02/04).
- Adding a revision token to any other record kind is a profile schema
  revision plus a row in the table above; adapters and workers must not infer
  a revision from timestamps, sequence, file mtimes or payload heuristics.
- The platform never assumes producer-side monotonicity. Revision regressions
  are legal producer behavior handled by the precedence rule below and are
  surfaced through lineage, not corruption errors.

## Revision comparability

Revision tokens are strings. Two revision values are **comparable** if and
only if both match the canonical unsigned base-10 integer pattern
`^(0|[1-9][0-9]*)$` and both parse within the JavaScript-safe integer bound
`9007199254740991`. Comparable revisions order numerically. Any other pair —
either value non-numeric, non-canonical (leading zero, sign, whitespace),
overflowing, or absent — is **incomparable** and precedence falls through to
observed time. Equality of incomparable tokens is still meaningful: byte-equal
tokens are the *same* revision for idempotency and conflict detection.

There is no lexicographic revision ordering in v1. A source whose revisions
are not canonical integers receives observed-time ordering until its profile
registers a certified comparator through a profile schema revision.

## The precedence tuple

For head succession within one source stream — one
`(tenant, producer, source_profile, source_namespace, source_object_type,
source_object_id)` for observations, one normalized relationship identity for
edges, one deterministic activity identity for activity — every record has the
frozen precedence tuple:

```text
precedence = (source_revision (where carried and comparable),
              observed time,
              deterministic record ID)
```

Arriving record `Y` supersedes head state `X` exactly when:

1. `rev(Y)` and `rev(X)` are comparable and `rev(Y) > rev(X)`; or
2. revisions are equal, absent or incomparable, and
   `observed(Y) > observed(X)`; or
3. revisions are equal, absent or incomparable, `observed(Y) = observed(X)`,
   and `record_id(Y) < record_id(X)`.

Rule 3 is deliberate: at an exact tie the **lowest** canonical lowercase
record identifier wins. This matches the landed field-selection comparator
(lowest claim ID at equal authority rank), makes the winner a pure function of
the record set rather than arrival order, and — because record IDs are
UUIDv7 — prefers the earliest-created assertion on a perfect tie so the head
never flaps.

Frozen outcomes for the non-superseding cases:

- `Y` byte-identical to an already-applied record (same record identity, same
  content digest): idempotent duplicate. No new canonical version, no new
  normalized output, receipts replay (landed: double replay leaves
  `evidence_id` and counts unchanged).
- `Y` carries the same revision as head `X` with different content and a
  different record identity: rule 2/3 decides; the loser is recorded with
  `conflicting` lineage. Same delivery identity with different bytes remains
  the terminal, security-audited `conflict` from 02 — it never reaches
  precedence.
- `Y` has lower precedence than `X` (stale revision or late arrival): `Y` is
  admitted as evidence, normalized, and recorded — claims persist with their
  source-domain validity, candidates receive an append-only
  `superseded_stale` evaluation — but the head, its lifecycle, and
  `last_observed_at` never move backward. Landed behavior
  `last_observed_at = GREATEST(last_observed_at, observed)` is the accepted
  implementation of this rule.

Precedence orders records **within one source stream only**. Across sources,
field authority (05) and multi-source support rules (06) apply unchanged;
precedence never lets one producer's stale record affect another producer's
support.

## Per-record-kind precedence semantics

### Entity observations

Head state is `die_normalized.source_object.current_observation_id` plus
`source_lifecycle`. Frozen:

- the current observation pointer advances only for a superseding record;
- `source_lifecycle` transitions only with a superseding record; a stale
  record can never move `tombstoned` or `stale` back to `active`
  (**no resurrection with an older revision or older observed time**);
- a superseding `active` observation after a tombstone legitimately re-opens
  that source's support — re-observation is not resurrection;
- claims from stale observations are appended with their own
  `valid_from`/`valid_to`; the materializer's per-field selection follows
  field authority, and within one source stream a claim from a
  non-superseding observation never displaces the currently selected claim of
  the same field;
- for browser_backend `application_catalog`, `catalog_revision` is required
  and rule 1 applies first; a `tombstoned` catalog operation carrying a lower
  comparable revision than the head is stale and closes nothing.

### Relationship upserts and ends

Head state is the canonical relationship's current version (one
system-current head, exclusion-constrained). Frozen:

- an `active` candidate superseding the head appends the next version
  (landed succession `v1 → v2 → ended v3`, exactly one head);
- an `ended` candidate superseding the head appends a version with lifecycle
  `ended` and `valid_to` set from the candidate; `valid_to` is never silently
  dropped and must exceed `valid_from` (landed, DDL-checked);
- an `ended` or `retracted` candidate with lower precedence than the head
  receives `superseded_stale` evaluation and changes nothing — a stale record
  can neither end nor retract a newer head;
- an `active` candidate with lower precedence than an `ended` head receives
  `superseded_stale` evaluation — a stale record never resurrects an ended
  edge; re-activation requires a superseding record;
- multi-source edges close per-source support only (06); the head lifecycle
  derives from remaining support, so one producer's end/retraction never
  closes another producer's support.

### Activity events

Activity carries no v1 revision token; precedence is observed time then record
ID. Frozen, restating accepted implementation behavior:

- activity identity is deterministic per source activity identity and stable
  across artifact upgrades;
- a byte-identical replay of an already-materialized candidate is an
  idempotent no-op (no new version);
- a differing candidate for the same activity identity appends the next
  version through serialized succession with exactly one system-current
  version (landed unique index on `system_to IS NULL`);
- deterministic lifecycle stages (06) append versions in precedence order;
  event-time ordering governs display, system time records late arrival and
  correction (04);
- a late-arriving earlier stage appends lineage and versions; it never
  rewrites `occurred_at` of the locator backward past admitted evidence.

### Coverage

Coverage revisions are serialized per tenant/coverage ID and preserve
producer/scope/capability/population identity (03). Frozen: coverage
candidates from one producer/capability apply in precedence order; a stale
candidate may contribute historical valid-time intervals but can neither
reopen a closed interval nor regress the current interval's state; interval
succession always closes the immediately prior system interval in the same
transaction (03).

### Reconciliation snapshots

`source_revision` on a snapshot scopes the whole run. Frozen ratchet:

- absence evaluation admits a `ready` run declaring `full` completeness only
  if its precedence — `(source_revision where comparable, snapshot
  completion observed time, run record ID)` — is strictly greater than the
  last **evaluated** full run for the same
  `(tenant, producer, profile, scope)`;
- a full run failing that ratchet is evaluated as `stale_snapshot`: an
  append-only evaluation and a coverage note are recorded; it closes no
  source support and retires nothing;
- byte-identical duplicate of an evaluated run (same snapshot identity, same
  digest): idempotent — absence effects are not applied twice;
- same snapshot identity with conflicting page or terminal content:
  quarantined per 04; conflict is never resolved by precedence;
- `partial`, `unknown`, `failed`, missing-page and digest-mismatch runs
  produce degraded coverage and never participate in the ratchet (06).

## Retraction is not `ended`

Frozen definitions, distinct per the normalized relationship candidate state
enum (`active` | `ended` | `retracted`):

- **`ended`** asserts the fact was true and ceased to hold in the source
  domain at a stated time. It is a valid-time closure: `valid_to` records
  when the fact stopped being true.
- **`retracted`** withdraws the source's own earlier assertion: the source no
  longer stands behind it. It is a belief correction recorded in system time;
  the platform stops relying on the assertion without claiming knowledge of
  when — or whether — the fact was ever false in the domain.

Per record kind:

| Record kind | Retraction carrier in v1 | Canonical handling |
|---|---|---|
| relationship | candidate `state = "retracted"` | new version through ordinary succession: lifecycle `ended` (the frozen canonical lifecycle enum has no `retracted` value), `valid_to` = the retracting record's effective time, version-candidate link `support_role = 'retracted'`, and frozen version attribute `"end_reason": "retracted"` |
| entity observation | none — no wire retraction record | correction by supersession: a superseding observation closes/supersedes prior claims through append-only `claim_supersession`; operator identity corrections (05) handle source-independent error |
| activity | none — no wire retraction record | correction succession replaces content; suppression of an erroneous event appends a new version with `visibility = 'suppressed'` (frozen enum) via the authorized correction path; `tombstoned`/`deleted` remain retention-only states |
| coverage | none | corrections append new serialized revisions; no retraction state exists |
| reconciliation | none — pages and completed runs cannot be retracted | conflicting duplicates quarantine (04); an evaluated run is superseded only by a later full run passing the ratchet |

Frozen retraction rules for relationships (the one v1 wire carrier):

1. Retraction closes the retracting source's support only. Another source's
   surviving support keeps the canonical edge active; the retracting
   candidate then records `support_role = 'retracted'` against the version
   that re-selects the surviving support.
2. System-time succession is ordinary: the prior version's `system_to`
   closes, the retraction version becomes the single system-current head in
   the same transaction. Prior versions are never rewritten, unlinked or
   deleted — retraction is not erasure and never touches evidence
   disposition.
3. `end_reason` distinguishes read behavior: APIs and read models expose
   `end_reason = retracted` as a safe attribute so a withdrawn assertion is
   never displayed as an ordinary domain end; both count as not-current.
4. Prohibited, fail-closed:
   - resurrecting a newer head with an older revision or older observed time,
     including "un-retracting" by replaying the original assert record;
   - a stale retraction (lower precedence than head) retracting a newer head;
   - synthesizing a retraction from absence — absence handling belongs
     exclusively to verified full reconciliation snapshots;
   - mapping retraction to lifecycle `stale` or to retention
     tombstone/deletion;
   - deleting or mutating the retracted versions' claim, candidate, evidence
     or audit lineage.
5. Re-assertion after retraction is legal only through a superseding `active`
   record; it appends a new `active` version and does not reuse or rewrite
   the retracted history.

The landed implementation maps `retracted` candidates to lifecycle `ended`
without distinct lineage. That mapping is the correct lifecycle half of this
contract; the `support_role = 'retracted'` link (already present in the frozen
DDL) and the `end_reason` attribute complete it. No landed accepted semantics
change.

## Executable precedence fixtures

These fixtures are conformance authority. `head X` is committed state;
`arriving Y` is the next admitted record in the same source stream unless
stated. `rev` values are canonical integers; `t1 < t2 < t3`; `idA < idB`
lexicographically. Each fixture must exist as an executable test before the
affected surface claims the corresponding gate in
[verification](11-testing-conformance-and-release-gates.md).

| ID | Kind | Head state X | Arriving Y | Frozen outcome |
|---|---|---|---|---|
| PRC-001 | entity obs | rev 5, observed t2, active | rev 6, observed t1 | Y supersedes: revision outranks observed time; head/pointer advance |
| PRC-002 | entity obs | rev 5, observed t2, active | rev 4, observed t3 | stale: claims append, `superseded_stale`; head, lifecycle, `last_observed_at` unchanged |
| PRC-003 | entity obs | rev 5, observed t2 | rev 5, observed t2, identical bytes (replay) | idempotent duplicate; no new version, no new decisions, replayed receipt |
| PRC-004 | entity obs | rev 5, observed t2, record idB | rev 5, observed t2, different content, record idA | Y supersedes by lowest-record-ID tie-break; X recorded `conflicting` |
| PRC-005 | entity obs | no revision, observed t2 | no revision, observed t1 | late arrival: claims append with own validity; head unchanged |
| PRC-006 | entity obs (bb catalog) | rev 9 `tombstoned` | rev 8 `observed` (active) | stale: no resurrection; source support stays closed |
| PRC-007 | entity obs (bb catalog) | rev 9 `tombstoned` | rev 10 `observed` (active) | supersedes: legitimate re-observation re-opens this source's support |
| PRC-008 | entity obs | tombstoned, observed t2, no revision | active, observed t3 | supersedes: newer observation re-opens support; entity lifecycle recomputed |
| PRC-009 | relationship | active v2, observed t2 | `ended`, observed t3 | v3 lifecycle `ended`, `valid_to` set (landed succession; one head) |
| PRC-010 | relationship | ended v3, observed t3 | `active`, observed t2 | stale: `superseded_stale`; no resurrection of ended edge |
| PRC-011 | relationship | ended v3, observed t3 | `active`, observed t4 | v4 `active`: superseding re-assertion after end |
| PRC-012 | relationship | active v2, observed t2 | `ended`, observed t1 | stale end: `superseded_stale`; head remains active |
| PRC-013 | relationship | active v2, observed t2 | `retracted`, observed t3 | v3 lifecycle `ended`, `support_role='retracted'`, `end_reason=retracted` |
| PRC-014 | relationship | retraction-ended v3 | replay of original v1 assert bytes | idempotent duplicate of consumed input; no version, no resurrection |
| PRC-015 | relationship | active, two sources A+B | source A `retracted`, observed t3 | A's support closes with retracted lineage; edge stays active on B's support |
| PRC-016 | relationship | active v2 | `retracted`, observed t1 (stale) | stale retraction: `superseded_stale`; head unchanged |
| PRC-017 | activity | version 1 (candidate c1) | byte-identical c1 replay | idempotent: no new version (landed duplicate/restart behavior) |
| PRC-018 | activity | version 1 | differing candidate, same activity identity | version 2 by serialized succession; exactly one system-current version |
| PRC-019 | activity | version 2 current | authorized suppression correction | version 3 `visibility='suppressed'`; lifecycle stays `active`; history retained |
| PRC-020 | reconciliation | evaluated full run rev 7 | ready full run rev 6 | `stale_snapshot` evaluation; closes no support |
| PRC-021 | reconciliation | evaluated full run rev 7 | identical rev-7 run replay (same digest) | idempotent: absence effects not applied twice |
| PRC-022 | reconciliation | evaluated full run rev 7 | rev 7 run, different snapshot digest | quarantined conflict (04); precedence does not resolve conflicting content |
| PRC-023 | reconciliation | evaluated full run, no revision, completed t2 | ready full run, no revision, completed t3 | supersedes by observed time; absence evaluation proceeds |
| PRC-024 | coverage | current interval `covered` from t2 | stale candidate `covered` ending t1 | historical interval only; current interval state unchanged |
| PRC-025 | any | head X | Y with non-numeric revision, head numeric | incomparable: observed time decides; equality of byte-equal tokens still detects duplicates |

## Change control

Registering a new revision carrier or comparator, adding a wire retraction
record to any profile, changing the tie-break direction, or exposing a new
`end_reason` value requires an implementation ADR, a profile/schema revision
where wire-visible, an update to this addendum's tables, and new PRC fixtures
— per the change-control rules in
[closure and non-blockers](13-closure-and-non-blockers.md).
