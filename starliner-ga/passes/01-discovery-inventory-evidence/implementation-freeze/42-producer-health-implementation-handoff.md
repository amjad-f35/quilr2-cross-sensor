# Producer Health Implementation Handoff

This handoff implements exactly one frozen amendment:
[ADR-0021](../../../adrs/0021-producer-health-is-a-closed-derived-vocabulary.md),
recorded as fixed authority defect `FP-095` and frozen decision `DIE-HEALTH-001`.

It is scoped to producer health. It does not authorize any other contract
change, and it does not widen `ProducerHealthState` for any sensor.

## What is already frozen upstream

| Artifact | Change |
|---|---|
| [`openapi/die-v1.openapi.yaml`](openapi/die-v1.openapi.yaml) | `ProducerHealthState`; `Producer.health_state` references it; required `Producer.health_evaluated_at`; required `ProducerDetail.health` with `ProducerHealth`, `ProducerHealthReason` and `ProducerHealthComponent` |
| [`sql/001-die-core.sql`](sql/001-die-core.sql) | `die_read.producer_current` health columns and `CHECK`s; `die_control.producer_health_policy`; `producer_health_evaluation` work subject |
| [`sql/003-die-roles-and-grants.sql`](sql/003-die-roles-and-grants.sql) | projector reads the effective policy; only the control admin writes it |
| [`schemas/producer-enrollment-manifest.schema.json`](schemas/producer-enrollment-manifest.schema.json) | signed `health_policy`, required on `apply` |
| [`schemas/edge-configuration.schema.json`](schemas/edge-configuration.schema.json) | required signed `health_policy` |
| [`authz/api-field-policy.yaml`](authz/api-field-policy.yaml) | `ProducerHealth` and `ProducerHealthComponent` default to `sensitive_metadata` |
| [`ontology/source-normalization.yaml`](ontology/source-normalization.yaml) | Browser Backend status mapping, endpoint native `Critical` mapping, global producer-health rule |

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
   `next_evaluation_at` and `last_accepted_ingest_at`;
2. backfills existing rows to the only honest starting value — `health_state`
   `unknown`, `health_reason_code` `no_health_policy`, `health_queue_state`
   `unknown`, and NULL policy/evaluation timestamps — before the constraints
   are validated;
3. adds the `health_state`, `health_reason_code` and `health_queue_state`
   `CHECK`s and the four health invariants exactly as they read in the frozen
   `sql/001-die-core.sql`;
4. creates `die_control.producer_health_policy` with its ordering `CHECK`s, the
   `EXCLUDE USING gist` non-overlap constraint, `ENABLE`/`FORCE ROW LEVEL
   SECURITY` and the `tenant_isolation_producer_health_policy` policy;
5. extends the `die_pipeline.work_item` and `die_pipeline.stage_execution`
   `subject_kind` and stage/subject `CHECK` constraints with
   `producer_health_evaluation`; and
6. grants `SELECT` on `die_control.producer_health_policy` to `die_projector`
   and `SELECT, INSERT, UPDATE` to `die_control_admin`.

The frozen `sql/001-die-core.sql` in this package remains the declared
green-field schema. A fresh database built from it and an existing database
migrated with `008` must be structurally identical; prove that rather than
assume it.

## Contract regeneration

`tools/contractgen/generate.py` pins the authority it vendors:

- `AUTHORITY_COMMIT` and `AUTHORITY_TREE` must be bumped to the SHA this
  amendment is pushed at;
- `EXPECTED_SCHEMA_BUNDLE` must be recomputed, because
  `producer-enrollment-manifest.schema.json` and `edge-configuration.schema.json`
  both changed; and
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

`getProducer` must then return `data.health` from the same projection row and
the effective policy. It must not compute health, read deadlines from Go
constants, or call a sensor at request time.

## Derivation placement

Derivation belongs in the projector, driven by an idempotent maintenance work
item, not in the API and not in a cron job:

- the maintenance role enqueues `stage = 'maintenance'`,
  `subject_kind = 'producer_health_evaluation'`, `subject_id = producer_id` at
  `next_evaluation_at`;
- the existing `UNIQUE (tenant_id, stage, subject_kind, subject_id,
  input_version, implementation_version)` constraint provides idempotency —
  use the scheduled evaluation instant as `input_version` so a crash, retry or
  duplicate scheduler tick collapses to exactly one evaluation;
- the existing lease, fence and `stage_execution` machinery applies unchanged;
  no new exactly-once mechanism is needed or permitted.

Freshness compares source `observed_at` **and** central `ingested_at`, so a
delayed replay of an old healthy record cannot restore `healthy`. Only
components named in `required_components` are aggregated. Precedence for known
failures is `offline` > `unhealthy` > `degraded` > `healthy`.

## Required tests

All of these are required; none may be waived by sampling.

**Vocabulary and profiles**

1. All five common states round-trip through SQL, the API and the generated
   client.
2. Every producer profile — Browser, Browser Backend, Endpoint, LLM Gateway,
   MCP Gateway — produces a valid common state.
3. Browser Backend status mapping: `succeeded`→`healthy`, `partial`→`degraded`,
   `failed`→`unhealthy`, `blocked`→`unhealthy`, `unknown`→`unknown`.
4. Endpoint native `critical` (`proxy_health_state` value 3) maps to
   `unhealthy`, and the native token survives in evidence, provenance and
   `source_native_state`.

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

**Durability and contract**

16. Maintenance crash and retry produce exactly one evaluation per scheduled
    instant.
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
- a required deadline is not expressible in the signed `health_policy`; or
- an already-applied deployment migration appears to need editing.
