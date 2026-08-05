# ADR-0021: Producer health is a closed, policy-derived vocabulary

Status: **accepted vocabulary and axes; execution semantics amended after independent review**

> **Remediation record.** Independent review accepted the five-state vocabulary,
> the independent trust/health/coverage axes and `health_evaluated_at` on the
> producer summary, but found the execution semantics incomplete: derivation
> ownership, typed component observations, component projection authority,
> generation atomicity and state/reason pairing were underspecified. Defect
> `FP-095` and conformance item `IC-015` are `remediation_required`, and
> producer-health implementation is blocked until the sections below are
> satisfied. This ADR now carries the corrected semantics as
> `DIE-HEALTH-001` and `DIE-HEALTH-002`.

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

### Normalization into typed component observations

Component health is a typed normalized observation, never an unconstrained JSON
blob and never an aggregate. A source health record normalizes to
`health_observations` rows on the normalized observation, each naming one
component from its own profile's frozen set, one normalized state, the exact
pre-normalization `source_native_state`, the observation instant and only the
queue metrics that profile actually publishes. Deriving the producer's aggregate
state from those rows belongs to the projector, not the adapter.

The component set is closed per profile:

| Profile | Components | Source of the component identity |
|---|---|---|
| Browser | `extension`, `background`, `content_script`, `native_host`, `backend_link` | `browser.health.component` |
| Browser Backend | `relay`, `downstream_delivery` | derived from `heartbeat`; see below |
| Endpoint | `supervisor`, `monitor`, `proxy`, `hook`, `template_service`, `delivery` | `endpoint.health.component` |
| LLM Gateway | `gateway`, `provider_route`, `classifier`, `db_writer`, `delivery` | `llm.health.component` |
| MCP Gateway | `gateway`, `registry`, `direct_handler`, `onemcp_handler`, `workflow_runner`, `delivery` | `mcp.health.component` |

Browser, Endpoint, LLM Gateway and MCP Gateway all publish the identical five
state values, which map to themselves.

Browser Backend publishes no component field and no state field. Its heartbeat
`status` maps `succeeded`→`healthy`, `partial`→`degraded`, `failed`→`unhealthy`,
`blocked`→`unhealthy`, `unknown`→`unknown`. Every heartbeat emits one `relay`
observation from that status; when `downstream` is present and is neither `none`
nor `unknown`, the same heartbeat additionally emits one `downstream_delivery`
observation carrying the downstream token as its native state. Browser Backend
carries no `offline` value, so no Browser Backend observation may normalize to
`offline`; a heartbeat missed beyond the configured deadline is derived
centrally by the projector.

Endpoint-native `critical` maps to `unhealthy` on the `proxy` component. The
native value stays visible through provenance,
`ProducerHealthComponent.source_native_state` and `source_native_metric`
(`proxy_health_state`); the common enum does not expand to hold it.

A component name outside its own profile's set, or a source token with no
declared mapping, is quarantined or normalized to `unknown`. Neither widens a
vocabulary.

### Component projection authority

`die_read.producer_health_component_current` is the authority for per-component
health. It is keyed by `(tenant_id, projection_generation, producer_id,
component)`, and its composite foreign key to `die_read.producer_current
(tenant_id, projection_generation, producer_id)` binds every component row to
the same exact generation as its aggregate. Each row carries whether the
component is required, its normalized state, the native token and native metric
name, freshness (`fresh`, `stale`, `missing`) decided against the signed policy
rather than reported by the source, the observation and ingest instants, the
evaluation instant, the evidence and normalization-run lineage, the policy
version and only the queue metrics its profile publishes. It has RLS enabled and
forced with `tenant_isolation_read_producer_health_component`; the projector
holds `SELECT, INSERT, UPDATE, DELETE` and every other runtime role is
explicitly revoked from writing it.

### Atomic single-generation projection

One evaluation is one transaction against one generation. The projector writes
every component row for that producer and generation and the matching
`die_read.producer_current` row together, recording
`health_component_count` and `health_required_component_count` equal to the rows
it actually wrote. Partial application is not permitted in either direction: the
foreign key makes an orphaned component row impossible, and the count columns
make an aggregate claiming components it did not write detectable with one
query. The API returns the aggregate and its components for the single
`ProducerHealth.projection_generation`, so an explanation can never mix
generations.

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

### Exact state and reason pairing

A reason code is the cause of the state it accompanies, so the legal pairs are
frozen and enforced by `CHECK`, not left to the writer:

| `health_state` | allowed `health_reason_code` |
|---|---|
| `unknown` | `no_health_policy`, `insufficient_evidence` |
| `healthy` | `all_required_components_healthy` |
| `degraded` | `required_component_degraded`, `required_component_stale`, `required_component_missing`, `delivery_queue_degraded` |
| `unhealthy` | `required_component_unhealthy`, `delivery_queue_unhealthy` |
| `offline` | `required_component_offline`, `producer_liveness_expired` |

A delivery-queue reason additionally requires the matching `health_queue_state`.
`insufficient_evidence` requires zero projected components. Every
component-derived reason requires at least one evaluated required component.
These constraints bind health to its own evidence only; none of them reference
`trust_state` or `coverage_state`, and none may. Health, trust and coverage stay
independent in both directions.

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

### Scheduling and execution ownership

Transitions to `degraded` and `offline` must occur with no new sensor record
arriving, and the work that produces them is split across two roles.

Maintenance schedules. A `maintenance`-stage `producer_health_schedule` work
item, whose `subject_id` is the exact scheduled sweep instant, reads which
producers are due in the active generation and enqueues execution work. It
derives nothing and writes no health read model; `die_maintenance` is explicitly
revoked from writing either health table.

The projector executes. Each `project_postgres`-stage
`producer_health_evaluation` work item names one producer and one exact
projection generation in its `subject_id` as `<producer_id>:<generation>`, so a
delayed or replayed execution can never apply to a different generation than the
one it was scheduled for. The existing lease, fence and `stage_execution`
machinery provides exactly-once behavior; the scheduled instant is the
`input_version`, so a duplicate tick collapses to one evaluation.

Request-time health calculation is prohibited, a maintenance role projecting
health is prohibited, and no cron job may mutate `producer_current` or
`producer_health_component_current` directly.

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
  projection directly;
- letting the maintenance role derive or project health rather than schedule it;
- carrying component health as unconstrained JSON, or letting an adapter emit an
  aggregate producer state;
- evaluating health without naming an exact projection generation, or writing
  component and aggregate rows in separate transactions or generations;
- allowing arbitrary state/reason combinations, or constraining health against
  trust or coverage to obtain them; and
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
- per-profile component sets, with a foreign component and an out-of-profile
  queue metric both rejected;
- maintenance refused write access to both health read models, and the stage,
  subject and `subject_id` format constraints rejecting a health evaluation
  scheduled on the wrong stage or without an exact generation;
- component and aggregate rows written in one transaction for one generation,
  with the projected component counts matching the aggregate's recorded counts;
- every state/reason pair outside the frozen matrix rejected by the database;
- maintenance crash and retry yielding exactly-once evaluation; and
- API, SQL, generated-client, and UI contract tests.
