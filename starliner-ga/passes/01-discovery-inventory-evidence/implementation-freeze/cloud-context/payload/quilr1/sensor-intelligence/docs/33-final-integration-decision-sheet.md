# Final Quilr 1 Integration Decision Sheet

## Decision

**Integrate Quilr 1 as an imported-legacy-platform source through a dedicated
adapter and Starliner evidence pipeline. Do not treat Quilr 1 as a native
sensor or its current projections as canonical truth.**

This decision agrees with the accepted target direction in
`docs/quilr2-cross-sensor/starliner-ga/adrs/0014-quilr1-migrates-as-evidence.md`.

## Required decision fields

| Field | Decision |
| --- | --- |
| Sensor | Combined Quilr 1 platform: `quilr-query-builder` plus `quilr-web`; semantically an imported legacy platform, not a native sensor |
| Unique visibility | Joined and product-shaped legacy projections across ClickHouse, PostgreSQL, Neo4j, Redis, Kafka audit, browser state, and external services; unique value is historical/platform context, not original producer fidelity |
| Supported environments | Repository-visible Java/Spring backend, Next.js browser frontend, intended Kubernetes services, ClickHouse/PostgreSQL/Neo4j/Redis dependencies; exact deployed versions/environments remain unresolved |
| Current maturity | Product platform is implemented and both pinned applications build/run locally; the proposed adapter/capability manifest/outbox contracts are not implemented |
| Current emission boundary | Synchronous HTTP responses, database/cache/graph state, selected Kafka audit, PostHog browser analytics, and route-specific external calls; no universal versioned source-observation stream |
| Recommended adapter placement | Dedicated read-only adapter process per data-cell/source environment, next to approved stores and outside the interactive query-builder request path |
| Recommended Starliner integration | Adapter emits immutable source evidence and safe candidates/assertions into Starliner privacy gate and WAL/outbox; platform ingest/resolver/materializers own admission and canonical state |
| Durable outbox status | Absent in Quilr 1; legacy Redis work-set behavior is non-atomic and removes before processing; Starliner WAL/outbox is mandatory |
| Primary inventory contributions | Applications, accounts/users/groups, assets/endpoints/devices, app settings/resources, selected policy/configuration state |
| Primary identity contributions | Source-scoped tenant/subscriber, user/account, app, asset/device, process, provider/model/MCP/tool aliases; none globally canonical without resolution |
| Primary event contributions | Selected verified interaction/activity/audit/action occurrences; status/current-state rows remain snapshots where occurrence semantics are absent |
| Primary metrics | Versioned legacy executive counts/distributions, latency/tokens/model/provider/MCP usage formulas, plus adapter health/coverage/reconciliation metrics |
| Primary finding signals | Legacy alert/status/behavior/finding-shaped evidence; no automatic canonical finding admission |
| Primary enforcement capabilities | Existing request admission, annotated PDP checks, client route gating, and domain mutation endpoints; universal native-effect verification is absent |
| Customer-facing product contributions | Inventory, entity provenance, activity/evidence drill-down, source coverage/health, selected legacy analytics, and only admitted findings |
| Operator-only contributions | Schema/profile state, checkpoint/lag, WAL/retry/quarantine, mapping version, reconciliation, cohort/parity/rollback, and restricted evidence |
| Critical missing fields | Deployed schema/profile/version, stable key/cursor/delete semantics, authoritative tenant/provenance, field privacy/retention, detector/effect contracts, and live capability versions |
| Critical sensor changes | Build a new stable adapter/emission boundary, manifest/profile contracts, privacy classification, deterministic identity/cursor, WAL acknowledgement/replay, reconciliation, and health; source applications may remain read-only for MVS |
| Cross-sensor dependencies | Central identity resolver, authoritative inventory sources, native browser/endpoint/LLM/MCP producers, policy/command service, finding engine, and platform coverage |
| MVS scope | ClickHouse inventory/selected activity/evidence, PostgreSQL whitelist snapshot, low-authority selected Neo4j relationships, safe candidates/assertions, coverage/reconciliation, selected compatibility reads, cohort rollback |
| MVS findings | None admitted solely because of Quilr 1 legacy labels; carry alert/status rows as evidence/signals until the central definition and required corroboration accept them |
| MVS analytics | Coverage/reconciliation/health and selected versioned legacy operational or executive metrics; monetary cost is deferred |
| MVS acceptance criteria | Schema/profile pinning, restart/replay/idempotency, tenant/privacy failure-closed cases, reconciliation balance, degraded coverage, golden compatibility parity, and exercised rollback |
| Overall integration readiness | **Requires a new stable sensor integration boundary** |

The readiness conclusion is chosen because the repositories expose rich
source data and stable read surfaces but no universal observation envelope,
capability manifest, durable acknowledgement/replay path, or source-profile
contract. A dedicated adapter can supply that boundary without rewriting the
interactive platform first.

## What to carry forward

| Carry forward | Representation | Authority |
| --- | --- | --- |
| selected ClickHouse/PostgreSQL/Neo4j source records | immutable raw evidence with profile, fingerprint, cursor, digest, tenant, capture time | source evidence |
| applications, accounts, users, assets, endpoints | source-scoped entity candidates and aliases | candidate, not canonical |
| joined/graph relationships | evidence-backed relationship assertions | profile-specific, often low authority |
| selected activity/interaction rows | occurrence events only where event semantics are verified; otherwise state/evidence | source-native |
| alert/status/audit/finding-shaped rows | imported evidence or signals | not canonical findings |
| executive formulas | versioned legacy metric definitions and source aggregates | legacy metric evidence |
| whitelist/filter state | source policy/configuration snapshots, privacy classified | source state |
| selected route behavior | versioned compatibility facade over target read models | compatibility only |
| capability, lag, schema, reconciliation state | coverage and health records | operational truth for this adapter |

## What not to carry as truth

- Redis cache values, locks, markers, or work sets;
- UI presentation state;
- `ServiceResponse` success as proof of domain success;
- a TCP or `/qb/health` response as proof of data capability;
- source-local IDs as global canonical IDs;
- Neo4j projections as universally authoritative relationships;
- alert/finding DTO names as finding admission;
- request acceptance as native enforcement effect;
- unversioned calculations as canonical metric definitions;
- comments, green CI conclusions, or migration files as proof of live state.

## First release

Implement the MVS in [`29-minimum-viable-integration.md`](29-minimum-viable-integration.md):

1. pinned read-only source profiles;
2. immutable evidence, privacy gating, WAL/outbox, acknowledgement, and replay;
3. inventory candidates, relationship assertions, selected activity/signals;
4. reconciliation and capability-specific health;
5. selected critical compatibility reads;
6. shadow/backfill/catch-up/cohort/rollback operation.

Canonical finding creation, new controls, monetary cost, restricted content,
native MCP call mapping, full graph authority, and retirement are deferred.

## Required summary matrices

### Capability summary

| Capability | Implemented | Runtime verified | Emits data | Can enforce | Platform value | Gap |
| --- | --- | --- | --- | --- | --- | --- |
| authentication/request admission | yes, with external libraries/services | selected decoder/authz paths | request context and responses; not telemetry stream | request allow/deny | trusted access context | deployed issuer/gateway/PDP contract |
| inventory queries | yes | route registration only; stores unavailable | synchronous rows/aggregates | no | inventory/evidence candidates | deployed schema, cursor, provenance |
| findings/status views | yes, one stale route mismatch | registration and selected failures | legacy rows/responses | selected mutations only | signals and evidence | detector/admission lifecycle |
| app/behavior configuration | yes | source and relational bootstrap selected | database/cache state and responses | mutation endpoints | policy/config snapshot | idempotency and effect proof |
| dashboards/metrics | yes | build/registration; light routes only | synchronous aggregates | no | legacy analytics | formula/version/coverage contract |
| adapter evidence delivery | no | no | no universal envelope | no | required integration boundary | implement profile + Starliner WAL |
| capability health/reconciliation | partial dependency/process health | selected degraded runtime | route/log status only | no | operator/customer coverage | per-profile cursor/WAL/count health |

### Discovery summary

| Entity type | Directly observed | Stable native ID | Attributes | Relationships | Freshness | Inventory use |
| --- | --- | --- | --- | --- | --- | --- |
| application | source projection | source-scoped `app_id`; global stability unresolved | name/domain/category/settings and profile-specific fields | tenant/user/asset/activity joins | query/snapshot dependent | primary candidate |
| human/account/group | source projection | source/issuer scoped | email/name/account/group fields | memberships/activity | table/graph dependent | candidate/alias, privacy classified |
| asset/device/endpoint | source projection | profile-specific ID | device/resource attributes | application/user/tenant | table-dependent | primary candidate |
| process/runtime | selected rows | source-scoped IDs where present | process/runtime metadata | app/device/activity | occurrence/snapshot dependent | secondary entity/evidence |
| model/provider/MCP/tool | aggregates and selected rows | semantics external | names/IDs/usage fields | interaction/account/app | query-window dependent | candidate only pending producer contract |

### Telemetry summary

| Native record | Producer | Fields | Transport | Reliability | Adapter target | Product use |
| --- | --- | --- | --- | --- | --- | --- |
| ClickHouse row/projection | upstream services, often unresolved | profile-specific maps/DTOs | SQL query response | durable store; extraction cursor not universal | raw evidence + typed snapshot/event candidate | inventory/activity/evidence |
| PostgreSQL state row | query-builder/external workflow path | typed JPA/table fields | JDBC/JPA | transactional store; live drift unresolved | policy/config snapshot | entity/config detail |
| Neo4j node/edge projection | graph services | query-shaped fields | Bolt/query | graph availability/history/authority unresolved | low-authority candidate/assertion | relationship drill-down |
| Redis cache/work member | query-builder/support library | cache/work payload | Redis | TTL/claim/removal semantics vary; work claim non-atomic | exclude as canonical; operational evidence only | health/debug |
| HTTP response | query-builder controllers | route-specific `ServiceResponse`/DTO/map | synchronous HTTP | caller retry/status inconsistencies | selected compatibility only | existing UI |
| audit/product analytics | Kafka/PostHog paths | library/vendor specific | broker/vendor HTTPS | deployed contract unresolved | selected audit evidence only | operations/product analytics |

### Metric summary

| Metric | Existing/derived | Formula | Dimensions | Coverage | Product card | Action |
| --- | --- | --- | --- | --- | --- | --- |
| executive users/extensions | existing derived | source-defined distinct graph counts and time filters | tenant/time | graph completeness | legacy executive overview | inspect inventory/coverage |
| findings/actions | existing derived | source query counts/distributions | tenant/time/behavior/status | warehouse/profile completeness | legacy findings analytics | drill to evidence |
| latency | existing derived | average/p50/p95 with current missing-value handling | tenant/time/app/model where queried | interaction coverage | performance analytics | investigate slow path |
| tokens/model/provider | existing derived | source sums/distributions | tenant/time/model/provider | interaction/provider field coverage | usage analytics | optimize/configure |
| MCP usage/outcomes | existing derived | source query counts/distributions | tenant/time/server/tool/outcome | MCP producer contract incomplete | integration analytics | inspect evidence |
| adapter lag/reconciliation | proposed | cursor/watermark lag and count-balance equations | tenant/profile/version | adapter + ingest visibility | coverage/health | repair/replay |

### Enforcement summary

| Action | Observe | Warn | Redact | Block | Approve | Verify effect |
| --- | --- | --- | --- | --- | --- | --- |
| request admission | yes | error response | no general transform | decoder/PDP can deny | PDP can allow | request acceptance only |
| client navigation | route/permission state | UI message/redirect | no | UI render only | client rule | no backend effect |
| behavior whitelist/config mutation | current state query | route-specific | no universal | route/PDP may deny | mutation may be accepted | no universal postcondition observation |
| guardrail/red-team/approval workflows | legacy data/status visible | product-specific | external/route-specific | external/native behavior unresolved | workflow-specific | incomplete/external |
| proposed platform command | required | capability-specific | capability-specific | capability-specific | central decision | mandatory separate effect observation |

### Product summary

| Product area | Data supplied by sensor | Default display | Drill-down | Action |
| --- | --- | --- | --- | --- |
| inventory | application/account/asset/endpoint candidates | canonical entity with source badges and coverage | source fields/evidence/profile | resolve/configure/repair |
| entity detail | attributes, aliases, relationships, activity | normalized facts, not raw maps | immutable Quilr 1 evidence | correct mapping/identity |
| activity | verified occurrences plus snapshots distinguished | canonical timeline with source/type | raw row and lineage | investigate |
| findings | signals/evidence only | only centrally admitted findings | detector/evidence/coverage | triage/remediate |
| analytics | versioned legacy metrics plus coverage | formula/version/coverage visible | contributing records | optimize/fix coverage |
| operations | schema/cursor/WAL/reconciliation | operator-only health | failed records/logs | retry/quarantine/rollback |

### Adapter summary

| Adapter path | Existing boundary | New work | Starliner dependency | Acceptance test |
| --- | --- | --- | --- | --- |
| ClickHouse backfill/incremental | SQL queries/migrations | profile, cursor, evidence, privacy, count balance | envelope, WAL, ingest receipt | schema/restart/duplicate/late/reconcile |
| PostgreSQL snapshots | JPA/migration tables | snapshot/delete/cursor semantics | same plus restricted routing where needed | composite-key update/delete/replay |
| Neo4j snapshot | graph queries | low-authority assertion mapping and outage isolation | evidence/assertion admission | outage does not imply deletion |
| identity/relationship normalization | source IDs and joins | candidates, namespaces, evidence, conflict handling | ingest + resolver contracts | alias/cross-tenant conflicts |
| selected compatibility reads | 141 routes and UI callers | target materializers, golden fixtures, cohort router | canonical read models | parity and rollback |
| health/reconciliation | process/dependency routes/logs | per-profile schema/cursor/lag/WAL/count state | health/coverage records | degraded and unsupported-version cases |

## Go/no-go gates

| Gate | Go condition | No-go condition |
| --- | --- | --- |
| source contract | deployed schema/profile/key/cursor/tenant rule verified | inferred schema or ambiguous tenant/key |
| privacy | field policy and retention/deletion path approved and tested | unrestricted sensitive content or secret leakage |
| delivery | WAL restart/replay/ack/checkpoint tests pass | checkpoint can cross unacknowledged or unknown records |
| reconciliation | every interval balances or has located in-flight records | unexplained count or watermark gap |
| identity | candidates are stable and tenant-scoped; conflicts explicit | adapter performs unreviewed global merges |
| semantics | snapshot/event/signal/finding distinctions tested | table/DTO name drives canonical semantics |
| compatibility | selected golden fixtures meet approved tolerance | undocumented output/status difference |
| health | per-capability source/schema/cursor/WAL/admission state visible | process readiness reported as full coverage |
| operations | shadow, cohort switch, repair, and rollback drilled | rollback exists only on paper |
| release | immutable images/config/mapping versions and logs available | mutable/untraceable deployed artifact |

## Evidence confidence

- **Verified:** all 2,903 tracked files in the two pinned targets were
  classified/accounted by the first pass; all 312 Java and 2,439 TS/JS files
  parsed without failure; local builds and selected dynamic probes are
  recorded.
- **Verified:** this second pass classifies platform capabilities, source
  record families, the 62-row inherited field seed, identity, relationships,
  events, metrics, controls, interfaces, privacy, adapter mappings, product
  disposition, gaps, and MVS.
- **Inference:** the proposed adapter/component boundaries are the safest fit
  for the accepted Starliner direction and observed source behavior. They are
  not implemented in Quilr 1.
- **Unresolved:** deployed schemas/data/contracts/topology, production-like
  performance/resilience, product tolerances, and source-owner decisions
  listed in [`31-open-questions.md`](31-open-questions.md).

## Completion statement

The repository and development-time behavior analysis is complete against the
available pinned evidence. The adapter design package is complete as an
evidence-grounded implementation specification. Production integration is
**not implemented and not certified**; it is blocked at the relevant gates by
the live/external evidence and owner decisions identified in the open-question
ledger.
