# Finding Definition, Grouping, Severity, and Recompute

Status: **normative**

## Doctrine

```text
source record ≠ normalized observation ≠ admitted signal
admitted signal ≠ candidate finding ≠ customer finding
finding ≠ case ≠ incident ≠ estate posture
```

An event states something observed. A signal is a governed detector input or output. A finding is a material tenant condition admitted by a versioned definition. A case coordinates work. An incident is a separately governed response object.

## Definition contract

Each finding definition is an immutable versioned artifact containing:

- definition ID, version, owner, status, release channel, and artifact digest;
- customer problem, title template, explanation grammar, and supported entities;
- input observation/signal types and required normalizer/resolver versions;
- source profiles, capability, scope, coverage, freshness, and completeness requirements;
- eligibility, correlation, temporal, identity-confidence, and exclusion predicates;
- grouping key and member identity;
- lookback, update, quiet, evaluation, and reopen semantics;
- opening, continuation, resolution, accepted-risk, suppression, and false-positive behavior;
- severity rubric, confidence computation, and source-assurance use;
- evidence-link policy and bounded display-summary policy;
- ownership/routing, recommendation, remediation, and case behavior;
- privacy and regional availability;
- test/evaluation corpus, measured quality, analyst-load limit, and known failure modes;
- rollout, backfill, rollback, migration, and customer-version semantics.

No number in an example becomes a default. Windows, thresholds, weights, TTLs, evidence limits, and quality bars are definition data approved by the accountable owner.

## Candidate pipeline

```text
accepted evidence
  -> deterministic normalization
  -> central identity and relationship resolution
  -> eligible signal derivation
  -> candidate namespace
  -> grouping and lifecycle evaluation
  -> impact/quality diff
  -> approved definition-version promotion
  -> finding ledger + central outbox
```

A producer may report a native product decision or condition as source evidence. It cannot request `open finding`, supply the final severity/confidence, or bypass central admission.

## Grouping and deduplication

Grouping is defined per finding family. A grouping key may include:

- tenant and environment;
- definition/version;
- resolved affected entity or bounded unresolved candidate;
- policy/control/data class;
- source scope or surface where materially distinct;
- time bucket only when required by the customer workflow.

The design MUST prevent both:

- fragmentation: thousands of cards for one material condition;
- over-grouping: unrelated actors, targets, environments, or root causes hidden in one card.

Every member retains evidence, time, source, identity, and detector lineage. The UI may sample summaries, but storage/replay lineage is not truncated by an arbitrary display limit.

## Severity, confidence, assurance, and coverage

These are separate:

| Dimension | Question |
|---|---|
| Severity | How harmful/material is the supported condition? |
| Confidence | How strongly do admitted evidence and resolution support this instance? |
| Source assurance | How trustworthy/certified was the producing path for the claimed fact? |
| Coverage | What eligible population/time/surface was observable? |
| Priority | Given severity, exposure, owner, SLA, policy, and business context, what should be worked first? |

Severity may consider impact, exposure, data/control class, breadth, duration, policy criticality, and actual outcome. It MUST NOT be silently reduced merely because a sensor is degraded; degraded assurance/coverage is displayed and may make evaluation not possible. Confidence is centrally computed from evidence/resolution and cannot be copied from a producer field.

Severity is recomputed from the current applicable member set and definition version. It is not permanently `max(previous, new)`, because corrections, splits, expiry, or invalidated evidence can legitimately reduce it. Historical severity remains in the ledger.

## Lifecycle

The canonical lifecycle is:

```text
candidate
  -> open
  -> acknowledged
  -> in_progress
  -> resolved | accepted_risk | false_positive | suppressed
  -> reopened
```

Additional evaluation substates such as `evaluation_degraded` do not erase workflow state. Coverage loss pauses unsupported auto-resolution and informs the customer.

Rules:

- acknowledgement/assignment does not change detector truth;
- accepted risk records authority, scope, reason, compensating controls, review/expiry, and evidence;
- suppression records scope, authority, reason, expiry, and audit;
- perpetual suppression is unsupported unless a separate approved high-risk exception design is adopted;
- manual workflow state is preserved across recompute unless a governed migration explicitly changes it;
- reopening follows the definition and applicable exception state.

## Recompute and release

Recompute writes a candidate namespace and never clears active findings in place.

Required sequence:

1. pin evidence watermark, catalogs, resolver, definition, and policy versions;
2. compute candidate findings deterministically;
3. compare membership, lifecycle, severity, confidence, ownership, links, counts, and workload;
4. review impact and quality thresholds;
5. atomically promote or reject;
6. retain prior namespace and rollback pointer;
7. emit correction/restatement events and invalidate projections.

Backfill is rate-limited and isolated from live admission. A definition rollback restores the last approved version without rewriting evidence.

## Display and evidence

Default cards show the condition, why it matters, affected scope, severity reasons, confidence, coverage, owner, action, lifecycle, and first/last seen. Evidence drill-down uses safe metadata and field provenance.

Raw prompt, file, response, tool arguments/results, headers, tokens, or sensitive values require the separate restricted-content grant protocol. A broad debug/auditor role alone does not authorize content.

## GA admission

A finding family reaches GA only with:

- deterministic positive/negative/property/replay/version fixtures;
- privacy-approved production-like replay;
- adversarial, late, missing, duplicate, correction, merge/split, and coverage-loss cases;
- shadow operation on representative tenants;
- approved precision/recall or alternative quality evidence and analyst workload;
- performance/cost bounds;
- UX comprehension and remediation completion testing;
- production monitoring, rollback, support, and customer acceptance.
