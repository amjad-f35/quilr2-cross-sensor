# ADR-0021: Producer health is a closed, policy-derived vocabulary

Status: **accepted; fixes a frozen authority defect**

## Context

`Producer.health_state` was frozen as an unconstrained `string` in the DIE
OpenAPI and as an unconstrained `text` column in `die_read.producer_current`.
Nothing in the corpus said which values were legal, what they meant, how they
were derived, or when they changed.

That is an authority defect rather than a preference. Five source profiles
already agreed on the same five states, and the temporal precedence register
already defined newer health observations and offline terminal observations, so
the corpus carried a real common vocabulary that its own frozen contracts
refused to state. An implementer reading only the frozen contracts could emit
any string, could invent per-sensor states, and had no rule that prevented a
producer from being reported healthy on no evidence at all.

Three further hazards were unaddressed:

- health, trust, and coverage were not separated, so an offline producer could
  be read as an absence claim about the customer's estate;
- endpoint-native `critical` had no defined common meaning; and
- no timing authority existed, so deadlines would have become hard-coded
  constants and health would only ever change when a new record arrived.

## Decision

`ProducerHealthState` is exactly:

`unknown`, `healthy`, `degraded`, `unhealthy`, `offline`.

`Producer.health_state` references it, `die_read.producer_current.health_state`
carries the equivalent `CHECK`, and every source profile keeps the identical
enum. `critical`, `stale`, `revoked`, `gap`, and sensor-specific values are not
added to the common producer state.

### Independent axes

- `health_state` is the enrolled producer's operational reporting and delivery
  health;
- `trust_state` is enrollment and certification trust; and
- `coverage_state` is what the producer can currently observe completely.

A producer may be healthy while coverage has a gap, or trusted while offline.
Producer health never retires inventory, deletes relationships, or proves source
absence. ADR-0009 continues to govern absence, rate, and completeness claims.

### Normalization

Adapters normalize sensor-native health into the common vocabulary and preserve
the original value and its metrics in evidence and provenance.

Browser Backend delivery status maps `succeeded`→`healthy`, `partial`→`degraded`,
`failed`→`unhealthy`, `blocked`→`unhealthy`, `unknown`→`unknown`, and a heartbeat
missed beyond its configured deadline→`offline`.

Endpoint-native `critical` maps to `unhealthy`. The native value stays visible
through provenance and `ProducerHealthComponent.source_native_state`; the common
enum does not expand to hold it.

### Deterministic derivation

1. The latest accepted health observation per required component.
2. Central accepted-ingest time for producer transport liveness.
3. Source `observed_at` plus central `ingested_at` for component freshness, so a
   delayed replay cannot falsely restore `healthy`.
4. Only components declared required by the signed effective health policy are
   aggregated.
5. `offline` when a required component reports offline, or when no accepted
   producer liveness exists beyond `offline_after_seconds`. `unhealthy` when a
   required component reports unhealthy, or the durable delivery queue exceeds
   its unhealthy threshold. `degraded` when a required component reports
   degraded, or a component is missing or stale but not offline, or the queue
   exceeds its degraded threshold. `healthy` when every required component is
   fresh and healthy, transport liveness is fresh, and queue thresholds are
   clear. `unknown` when there is no valid health policy or insufficient initial
   evidence.
6. Precedence for known failures is `offline` > `unhealthy` > `degraded` >
   `healthy`.
7. Missing required-component evidence prevents `healthy` and yields `degraded`
   once other producer liveness is established; before any usable evidence the
   state stays `unknown`.

`unknown` is never guessed into `healthy`.

### Timing authority

There are no hard-coded global health timing constants. A signed `health_policy`
is carried by producer enrollment and edge configuration and contains
`expected_report_interval_seconds`, `degraded_after_seconds`,
`offline_after_seconds`, `queue_degraded_after_ms`, `queue_unhealthy_after_ms`,
and `required_components`. Admission validates
`expected_report_interval_seconds` < `degraded_after_seconds` <
`offline_after_seconds` and `queue_degraded_after_ms` <
`queue_unhealthy_after_ms`. The effective versioned policy is persisted in
`die_control.producer_health_policy`. With no valid policy, time-based health
stays `unknown`.

### Time-driven behavior

Transitions to `degraded` and `offline` must occur with no new sensor record
arriving. The maintenance role enqueues an idempotent producer-health evaluation
at `next_evaluation_at` through the existing fenced work-item path. Request-time
health calculation is prohibited, and no cron job may mutate `producer_current`
directly.

## Consequences

- The API, the read projection, and all five profiles share one enum that the
  validator proves identical; a sensor cannot widen the common vocabulary.
- The UI can explain a state, because `getProducer` returns the evaluation time,
  the exact reason code, policy state, queue state, and per-component evidence
  under the existing field-classification policy.
- Health deadlines become tenant/producer configuration rather than code, so an
  operator retunes a noisy sensor without a release.
- A producer with no policy or no evidence is visibly `unknown` instead of
  silently `healthy`, which removes the most dangerous default in the contract.
- Health becomes time-driven work with the same exactly-once fencing as other
  pipeline stages, rather than an unlogged side effect of a scheduler.

## Rejected

- leaving `health_state` an open string and letting each adapter choose;
- adding `critical`, `stale`, `revoked`, or `gap` to the common producer state;
- folding health into `trust_state` or `coverage_state`;
- letting producer health retire inventory or stand in for an absence claim;
- computing health during an API request or from a cron job writing the
  projection directly; and
- hard-coding heartbeat, staleness, or queue thresholds anywhere in the platform.

## Validation

- all five common states, every producer profile, Browser Backend status
  mapping, and endpoint `critical` mapping;
- required-component aggregation, never-seen→`unknown`, and
  fresh→`degraded`→`offline` transitions driven only by time;
- delayed and out-of-order health records, duplicate/replay idempotency, and
  queue threshold transitions;
- recovery from `offline`, a healthy producer with a coverage gap, and both
  trusted-but-offline and revoked-but-recently-seen;
- maintenance crash and retry yielding exactly-once evaluation; and
- API, SQL, generated-client, and UI contract tests.
