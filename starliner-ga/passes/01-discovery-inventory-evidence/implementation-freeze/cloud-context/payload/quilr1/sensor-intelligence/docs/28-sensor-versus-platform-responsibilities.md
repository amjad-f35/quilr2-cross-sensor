# Source, Adapter, Starliner, and Platform Responsibilities

## Why the boundary matters

Quilr 1 reads and reshapes data produced by several systems. Treating every
query-builder projection as a native sensor observation would erase producer
provenance, confuse caches/aggregates with facts, and let legacy IDs or
finding-shaped rows become canonical truth without admission.

The ownership model below is the integration contract.

## Responsibility matrix

| Concern | Source store / upstream producer | Quilr 1 adapter | Starliner runtime | Ingest / normalizer | Resolver / materializer | Product / operator |
| --- | --- | --- | --- | --- | --- | --- |
| native row/event semantics | owns, when producer contract is available | records known provenance; marks unknown producer | preserves bytes | validates declared kind | consumes admitted facts | displays provenance |
| deployed schema/version | exposes metadata | fingerprints and selects profile | reports compatibility state | rejects unsupported profile | none | approves profile changes |
| extraction | permits stable read | owns query, pagination/cursor, capture timestamp | schedules/runs adapter | none | none | scopes cohorts |
| raw evidence | provides source payload | losslessly serializes and digests | persists before delivery | admits immutable evidence | references, never rewrites | audits/replays |
| tenant binding | provides tenant/subscriber keys and access boundary | applies explicit profile rule; quarantines ambiguity | transports binding | validates authority | maintains tenant-scoped canonical data | configures cohort/access |
| privacy classification | may expose sensitive data | applies source-field classification | redacts/restricted-routes before egress | enforces admission class | limits projections | defines policy/retention |
| delivery durability | none beyond native store | supplies deterministic identity and cursor | owns WAL/outbox, retry, ack, replay, quarantine | returns typed acknowledgement | none | repairs failures |
| safe normalization | supplies native names/types | emits source-scoped facts/candidates/assertions | preserves mapping version | validates normalized schema | combines facts | inspects mapping |
| canonical identity | supplies aliases/IDs | must not mint global IDs | none | routes candidates | resolver owns merge/split/conflict | reviews ambiguity |
| canonical relationships | supplies relationship evidence | emits assertions with time/evidence | none | validates assertions | resolver owns canonical edges | reviews conflicts |
| canonical metrics | supplies rows/aggregates | may publish legacy formula/version | none | admits metric evidence | materializer owns canonical definition/results | owns product meaning |
| canonical findings | supplies signals/evidence | does not auto-promote | none | validates signal/evidence | finding engine owns admission/lifecycle | triages/remediates |
| command workflow | may expose native mutation API | optional compatibility transport | durably transports command/result | command service validates | command service owns state | user/operator requests |
| native enforcement | upstream enforcement service owns effect | never claims more than response/evidence | transports result | records result/effect evidence | computes command state | observes/rolls back |
| health | exposes connectivity/error | source/profile/cursor health | WAL/delivery health | admission health | resolution/materialization health | composite coverage view |
| reconciliation | supplies source counts/watermarks | owns extract-side counts | delivery counts | admission counts | materialized counts | evaluates balance |
| retention/deletion | owns native retention | records source policy/version | enforces buffered-data retention | enforces admitted-data policy | owns canonical retention | approves/legal hold |

## Hard rules

1. **A query result is not automatically a native observation.** It may be a
   projection, join, aggregate, cache value, or UI transport.
2. **The adapter does not create canonical identity.** It creates stable
   source-scoped identifiers and candidates.
3. **A row named alert/finding/status is not automatically a canonical
   finding.** It is evidence or a signal until admitted.
4. **A successful mutation response is not verified effect.** Request,
   acceptance, execution, and effect observation are separate states.
5. **Starliner owns reliable transport, not source semantics.**
6. **Product materializers may replace legacy calculations; raw evidence may
   not be rewritten to match the replacement.**
7. **Coverage and degraded state are user-visible product data.** Missing
   source capability must not be presented as an empty/healthy result.

## Authority examples

### Application row

A ClickHouse application row can supply a source app ID, tenant binding, name,
domain/category attributes, and evidence. The adapter creates an application
candidate. The resolver decides whether it is the same canonical application
as an app reported by another sensor. The product inventory renders the
resolved entity while retaining source provenance.

### Neo4j edge

A graph query can supply a low-authority relationship assertion. The adapter
records the query/profile and source node IDs. It does not treat the current
graph edge as globally authoritative because live constraints, mutation
history, and tenant rules are unresolved.

### Alert row

The adapter preserves the source alert/status record and mapped signal
attributes. The finding engine decides whether this evidence satisfies a
canonical detector policy. Legacy severity/status may be retained as
source-native fields without becoming canonical severity/status.

### Whitelisted behavior

The PostgreSQL row is a source policy-state assertion keyed by
`(tenant, app_id, behaviour_id)`. If a future command changes it, the command
service records the request and native response; a subsequent snapshot/event
provides effect evidence.

## Build-time, runtime, and operator ownership

- Build time owns compiled mapping code, schema validators, fixture suites,
  dependency locks, and version metadata.
- Runtime owns source connectivity, extraction, privacy decisions,
  WAL/delivery, acknowledgements, checkpoints, and health telemetry.
- Operators own environment/profile selection, credentials, cohort scope,
  mapping rollout, quarantine repair, replay, rollback, and source retirement.

Environment configuration may select a reviewed profile. It must not silently
change the meaning of a field without a mapping version.

