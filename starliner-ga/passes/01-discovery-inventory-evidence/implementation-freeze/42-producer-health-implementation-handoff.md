# Producer Health Implementation Handoff

This handoff implements exactly one frozen amendment:
[ADR-0021](../../../adrs/0021-producer-health-is-a-closed-derived-vocabulary.md),
recorded as authority defect `FP-095`, conformance item `IC-015` and frozen
decisions `DIE-HEALTH-001` and `DIE-HEALTH-002`.

It is scoped to producer health. It does not authorize any other contract
change, and it does not widen `ProducerHealthState` for any sensor.

> **Remediation state.** `FP-095` and `IC-015` are `remediation_required`, not
> closed. Independent review accepted the five-state vocabulary, the independent
> axes and `health_evaluated_at` on the producer summary, but found the
> execution semantics incomplete. This document now carries the corrected
> semantics: maintenance schedules and the projector executes against one exact
> generation, component health is a typed normalized observation, component
> health has its own generation-bound projection authority, component and
> aggregate rows are written atomically, and only the exact state/reason pairs
> are legal. Implementation may not begin until these sections are satisfied,
> and satisfying them is remediation, not a release claim.

## What is already frozen upstream

| Artifact | Change |
|---|---|
| [`openapi/die-v1.openapi.yaml`](openapi/die-v1.openapi.yaml) | `ProducerHealthState`; `Producer.health_state` references it; required `Producer.health_evaluated_at`; required `ProducerDetail.health` with `ProducerHealth` (including its required `projection_generation`), `ProducerHealthReason`, `ProducerHealthComponent` and the closed `ProducerHealthComponentName` |
| [`sql/001-die-core.sql`](sql/001-die-core.sql) | `die_read.producer_current` health columns, component counts, the exact state/reason matrix and the remaining health `CHECK`s; `die_read.producer_health_component_current`; `die_control.producer_health_policy`; the `producer_health_schedule` and `producer_health_evaluation` work subjects with their stage binding and subject-id formats |
| [`sql/003-die-roles-and-grants.sql`](sql/003-die-roles-and-grants.sql) | projector reads the effective policy and writes both health read models; only the control admin authors a policy; maintenance is explicitly revoked from writing either health read model |
| [`schemas/normalized-observation.schema.json`](schemas/normalized-observation.schema.json) | required typed `health_observations` with a closed component and state vocabulary and mandatory native-token provenance |
| [`schemas/producer-enrollment-manifest.schema.json`](schemas/producer-enrollment-manifest.schema.json) | signed `health_policy`, required on `apply` |
| [`schemas/edge-configuration.schema.json`](schemas/edge-configuration.schema.json) | required signed `health_policy` |
| [`authz/api-field-policy.yaml`](authz/api-field-policy.yaml) | `ProducerHealth` and `ProducerHealthComponent` default to `sensitive_metadata` |
| [`ontology/source-normalization.yaml`](ontology/source-normalization.yaml) | exact per-profile `health_mapping` for all five profiles, the typed component rule and the scheduling/execution ownership rule |

## Forward migration requirement

`db/postgres/migrations/001-die-core.sql` in the implementation repository is an
**already-applied deployment migration**. Do not rewrite it, and do not rewrite
`003-die-roles-and-grants.sql`. Deployed databases have executed both; editing
them silently diverges applied state from declared state.

Add one new forward migration as the next number in sequence (currently
`008-producer-health-vocabulary.sql`, after `007-llm-gateway-authority-schema-ref.sql`)
that:

1. adds the `die_read.producer_current` columns `health_reason_code`,
   `health_queue_state`, `health_evaluated_at`, `health_policy_version`,
   `health_component_count`, `health_required_component_count`,
   `next_evaluation_at` and `last_accepted_ingest_at`;
2. backfills existing rows to the only honest starting value — `health_state`
   `unknown`, `health_reason_code` `no_health_policy`, `health_queue_state`
   `unknown`, both component counts `0`, and NULL policy/evaluation timestamps
   — before the constraints are validated;
3. adds the `health_state`, `health_reason_code` and `health_queue_state`
   `CHECK`s, the exact state/reason matrix, the queue-reason coherence `CHECK`s
   and the component-count invariants exactly as they read in the frozen
   `sql/001-die-core.sql`;
4. creates `die_read.producer_health_component_current` with its per-profile
   component `CHECK`, evidence/provenance invariants, per-profile queue-metric
   `CHECK`s, the composite foreign key to
   `die_read.producer_current (tenant_id, projection_generation, producer_id)`,
   `idx_read_producer_health_component_required`, `ENABLE`/`FORCE ROW LEVEL
   SECURITY` and the `tenant_isolation_read_producer_health_component` policy;
5. creates `die_control.producer_health_policy` with its ordering `CHECK`s, the
   `EXCLUDE USING gist` non-overlap constraint, `ENABLE`/`FORCE ROW LEVEL
   SECURITY` and the `tenant_isolation_producer_health_policy` policy;
6. extends the `die_pipeline.work_item` and `die_pipeline.stage_execution`
   `subject_kind` vocabularies with `producer_health_schedule` and
   `producer_health_evaluation`, binds `producer_health_schedule` to the
   `maintenance` stage and `producer_health_evaluation` to the
   `project_postgres` stage only, and adds both `subject_id` format `CHECK`s;
   and
7. grants `SELECT` on `die_control.producer_health_policy` to `die_projector`
   and `die_maintenance` and `SELECT, INSERT, UPDATE` to `die_control_admin`;
   grants `SELECT, INSERT, UPDATE, DELETE` on
   `die_read.producer_health_component_current` to `die_projector`; and applies
   the explicit `REVOKE` of `INSERT, UPDATE, DELETE, TRUNCATE` on both health
   read models from `die_maintenance`, `die_api`, `die_ingest`,
   `die_normalizer`, `die_truth` and `die_bff`.

The frozen `sql/001-die-core.sql` in this package remains the declared
green-field schema. A fresh database built from it and an existing database
migrated with `008` must be structurally identical; prove that rather than
assume it. The structural comparison must include constraint and policy names,
the composite foreign key and the exact grant/revoke set, not only columns.

## Contract regeneration

`tools/contractgen/generate.py` pins the authority it vendors:

- `AUTHORITY_COMMIT` and `AUTHORITY_TREE` must be bumped to the SHA this
  amendment is pushed at;
- `EXPECTED_SCHEMA_BUNDLE` must be recomputed, because
  `producer-enrollment-manifest.schema.json`, `edge-configuration.schema.json`
  and `normalized-observation.schema.json` all changed; and
- `contracts/openapi/die-v1.openapi.yaml` must be re-vendored from this package.

Then regenerate:

- JSON Schema bindings through `tools/contractgen/generate.py`, refreshing
  `gen/typescript/producer_enrollment_manifest.generated.ts` and
  `gen/typescript/edge_configuration.generated.ts`;
- the TypeScript client with `npm run generate` in `sdk/typescript/die-v1`
  (`openapi-typescript` into `src/schema.ts`), then `npm run typecheck`.

`src/schema.ts` is generated. Do not hand-edit it, and do not hand-write the
health enum into the Nuxt UI — consume the generated union so a future
vocabulary change breaks the build instead of the customer's screen.

## Removing the transitional hard-coded state

`internal/api/producers.go` currently emits a literal:

```go
"health_state":        "unknown",
```

Returning `unknown` with no evidence is **correct** and must not be replaced
with an optimistic default. Remove the literal only when the real projection is
wired, and replace it with the projected `die_read.producer_current` value plus
`health_evaluated_at`. Update the comment above `producerColumns`, which
currently states that health has no pipeline.

`getProducer` must then return `data.health` from the same projection row, its
`die_read.producer_health_component_current` rows for the same
`projection_generation`, and the effective policy. It must not compute health,
read deadlines from Go constants, join components across generations, or call a
sensor at request time.

## Scheduling and execution ownership

Maintenance schedules producer-health evaluation. The projector performs it.
These are two different roles doing two different jobs, and the split is
enforced by the stage/subject `CHECK`s and the grants, not by convention.

**Maintenance — schedule only.** A sweep enqueues
`stage = 'maintenance'`, `subject_kind = 'producer_health_schedule'`, with
`subject_id` set to the scheduled sweep instant in exact
`YYYY-MM-DDTHH:MM:SSZ` form. Executing that item, the maintenance worker reads
`die_read.producer_current` and `die_control.producer_health_policy` to find the
producers whose `next_evaluation_at` is due in the currently active generation,
and enqueues one execution item per due producer. It computes no state, derives
nothing and writes neither health read model. `die_maintenance` is explicitly
revoked from writing `die_read.producer_current` and
`die_read.producer_health_component_current`, so an attempt fails at the
database rather than silently succeeding.

**Projector — execute against one exact generation.** Each execution item is
`stage = 'project_postgres'`, `subject_kind = 'producer_health_evaluation'`,
with `subject_id` set to `<producer_id>:<projection_generation>`. The generation
is chosen at scheduling time and is part of the subject identity, so a replayed
or delayed execution can never apply to a different generation than the one it
was scheduled for; if that generation is no longer writable the item fails
rather than retargeting itself.

**Idempotency.** The existing `UNIQUE (tenant_id, stage, subject_kind,
subject_id, input_version, implementation_version)` constraint provides
idempotency for both kinds. Use the scheduled evaluation instant as
`input_version` so a crash, retry or duplicate scheduler tick collapses to
exactly one sweep and exactly one evaluation per producer per instant. The
existing lease, fence and `stage_execution` machinery applies unchanged; no new
exactly-once mechanism is needed or permitted.

**Prohibited substitutes.** A cron job that writes a health read model
directly, a maintenance worker that derives state, an API request that
calculates health, a `project_clickhouse` health evaluation and a health
evaluation with no generation in its subject are each rejected by the frozen
schema and must not be reintroduced behind an abstraction.

## Atomic single-generation projection

One `producer_health_evaluation` execution is one transaction against one
generation. In that transaction the projector writes:

- every `die_read.producer_health_component_current` row for that producer and
  generation, one row per component the producer's profile declares that the
  policy names or the source reported; and
- the matching `die_read.producer_current` row for the same generation, with
  `health_component_count` and `health_required_component_count` equal to the
  rows actually written.

Partial application is not permitted in either direction. The composite foreign
key already makes an orphaned component row impossible; the count columns make
the reverse case — an aggregate that claims components it did not write —
detectable with a single query. A conformance test must assert, for every
producer and generation, that the projected component row count equals
`health_component_count` and that the required subset equals
`health_required_component_count`.

## Derivation rules

Component observations arrive as typed `health_observations` on the normalized
observation. The normalizer never emits an aggregate producer state; it emits
one typed row per component with the normalized state and the exact
pre-normalization `source_native_state`. The projector aggregates.

Freshness compares source `observed_at` **and** central `ingested_at` against
the signed policy, so a delayed replay of an old healthy record cannot restore
`healthy`. Only components named in `required_components` are aggregated. A
required component the policy names but no source reported is projected with
`evidence_state` `missing`, `component_state` `unknown` and no native token.
Precedence for known failures is `offline` > `unhealthy` > `degraded` >
`healthy`.

The reason code must be the actual cause of the state it accompanies. The
frozen matrix is exact:

| `health_state` | allowed `health_reason_code` |
|---|---|
| `unknown` | `no_health_policy`, `insufficient_evidence` |
| `healthy` | `all_required_components_healthy` |
| `degraded` | `required_component_degraded`, `required_component_stale`, `required_component_missing`, `delivery_queue_degraded` |
| `unhealthy` | `required_component_unhealthy`, `delivery_queue_unhealthy` |
| `offline` | `required_component_offline`, `producer_liveness_expired` |

`delivery_queue_degraded` and `delivery_queue_unhealthy` additionally require
the matching `health_queue_state`. `insufficient_evidence` requires zero
projected components. Every component-derived reason requires at least one
required component to have been evaluated.

Health remains an independent axis. No constraint, query or derivation may make
`health_state` a function of `trust_state` or `coverage_state`, or the reverse.
A producer may be trusted and offline, healthy with an open coverage gap, or
revoked and recently seen, and each renders on its own terms.

## Required tests

All of these are required; none may be waived by sampling.

**Vocabulary and profiles**

1. All five common states round-trip through SQL, the API and the generated
   client.
2. Every producer profile — Browser, Browser Backend, Endpoint, LLM Gateway,
   MCP Gateway — produces a valid common state.
3. Browser Backend status mapping: `succeeded`→`healthy`, `partial`→`degraded`,
   `failed`→`unhealthy`, `blocked`→`unhealthy`, `unknown`→`unknown`, projected
   onto the `relay` component, plus a second `downstream_delivery` component
   whenever `downstream` is present and is neither `none` nor `unknown`. Browser
   Backend never normalizes to `offline`; only central deadline expiry produces
   it.
4. Endpoint native `critical` (`proxy_health_state` value 3) maps to
   `unhealthy` on the `proxy` component, and the native token survives in
   evidence, provenance, `source_native_state` and `source_native_metric`.
4a. Each profile may only project its own components: a component name from
   another profile is rejected by the `die_read.producer_health_component_current`
   `CHECK`, and a source health token with no declared mapping normalizes to
   `unknown` rather than widening either vocabulary.
4b. A profile may only carry the queue metrics it publishes:
   `oldest_queue_age_ms` only for Browser and LLM Gateway, `active_sessions`
   only for MCP Gateway, `snapshot_watermark` only for Endpoint.

**Aggregation and evidence**

5. Required-component aggregation: only declared required components change the
   state; a non-required component reporting unhealthy does not.
6. A never-seen producer is `unknown` with reason `insufficient_evidence`, and a
   producer with no valid policy is `unknown` with reason `no_health_policy`.
   Neither is ever `healthy`.
7. Missing required-component evidence prevents `healthy` and yields `degraded`
   once other producer liveness is established.

**Time-driven behavior**

8. Fresh → `degraded` → `offline` deadline transitions occur with **no new
   sensor record arriving**, driven only by the scheduled evaluation.
9. Delayed and out-of-order health records do not falsely restore `healthy`.
10. Duplicate and replayed health records are idempotent and do not double-count.
11. Queue threshold transitions in both directions across
    `queue_degraded_after_ms` and `queue_unhealthy_after_ms`.
12. Recovery from `offline` back to `healthy` once required components are fresh
    and liveness resumes.

**Axis independence**

13. A healthy producer with an open coverage gap stays `healthy`, and its gap is
    still reported.
14. Trusted-but-offline and revoked-but-recently-seen both render correctly and
    neither collapses health into trust.
15. No health transition retires inventory, deletes a relationship or emits an
    absence claim.

**Ownership, generation and atomicity**

15a. A maintenance-role connection attempting `INSERT`, `UPDATE` or `DELETE` on
    `die_read.producer_current` or
    `die_read.producer_health_component_current` is refused by the database.
15b. Enqueuing `producer_health_evaluation` on the `maintenance` or
    `project_clickhouse` stage, or `producer_health_schedule` on any stage other
    than `maintenance`, is rejected by the `work_item` and `stage_execution`
    `CHECK`s.
15c. A `producer_health_evaluation` `subject_id` without an exact
    `<producer_id>:<generation>` form is rejected, and an execution scheduled
    for one generation never writes another.
15d. Component rows and the aggregate row are written in one transaction: a
    forced failure after the component writes leaves neither, and for every
    producer and generation the projected component count equals
    `health_component_count` with the required subset equal to
    `health_required_component_count`.
15e. Every state/reason pair outside the frozen matrix is rejected by the
    database, including `healthy` with `required_component_offline` and
    `offline` with `all_required_components_healthy`.
15f. A component row cannot exist without its aggregate row in the same
    generation, and retiring a generation cannot leave orphaned component rows.

**Durability and contract**

16. Maintenance crash and retry produce exactly one sweep and exactly one
    evaluation per producer per scheduled instant.
17. API contract tests for `listProducers` and `getProducer`, including the
    field-classification mask over `ProducerHealth` and
    `ProducerHealthComponent`.
18. SQL constraint tests proving each health `CHECK` rejects its violation,
    including `healthy` without a policy and a policy with out-of-order
    thresholds.
19. Generated-client contract tests proving the health union is closed.
20. UI contract tests for every state including `unknown` and the
    no-policy explanation, asserting `unknown` is never rendered as healthy.

## Stop conditions

Stop and escalate rather than improvise if:

- a sensor requires a state outside the five common values;
- a sensor requires a component outside its profile's frozen component set;
- a required deadline is not expressible in the signed `health_policy`;
- a health evaluation appears to need to span more than one projection
  generation, or to run outside the projector; or
- an already-applied deployment migration appears to need editing.
