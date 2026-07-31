# Open Questions

Repository analysis is complete against the pinned source inventory. These
questions require deployed state, external repositories/contracts, or product
decisions. They block production certification only where indicated.

## P0 production blockers

| ID | Question / missing evidence | Why repository evidence is insufficient | Needed from | Blocks |
| --- | --- | --- | --- | --- |
| OQ-001 | Which ClickHouse migration/profile is deployed per environment and what are the live `DESCRIBE`, engine, partition/order, grants, row policies, distributed/local mappings, counts, and maximum watermarks? | source contains multiple migration profiles and query assumptions | data platform/operator | all ClickHouse cohorts |
| OQ-002 | What PostgreSQL migration version, constraints, indexes, grants, isolation, row counts, and drift are live? | H2 verified wiring only; migrations prove intended DDL | database/operator | relational cohorts |
| OQ-003 | What Neo4j labels, constraints, indexes, relationship ownership, tenant rules, mutation history, and scale are live? | supporting queries are not an authoritative deployed schema | graph owner/operator | graph cohort |
| OQ-004 | What exact tenant/subscriber authority and conflict rule applies to every source family? | fields/context differ across routes/tables | identity/tenant owner | admission |
| OQ-005 | Which source IDs/columns provide a stable key and cursor for each selected table, including update/delete/reset semantics? | query code does not define one universal checkpoint contract | source owners | restart/replay |
| OQ-006 | Which prompts, responses, URLs, identifiers, audit payloads, and metadata may leave the source; what are retention/deletion/legal-hold rules? | no complete field-level policy exists in the target repos | privacy/legal/product | content and sensitive metadata |
| OQ-007 | What are the deployed IdP issuer/claims, gateway header rules, PDP policy/failure mode, and internal-header trust boundary? | local decoder/authz harness does not prove the external estate | identity/security platform | authenticated serving and commands |
| OQ-008 | Which Starliner envelope, WAL/ack, ingest, candidate/assertion, health, and version contracts are the implementation target and where is their owning code released? | design artifacts exist; implementation release is external | Starliner/platform owner | adapter implementation |
| OQ-009 | What first tenant/table/route cohort and parity thresholds are approved? | source archaeology cannot determine business priority or tolerance | product/operator | MVS rollout |
| OQ-010 | What is the rollback SLO/window, checkpoint restore rule, and authority to switch traffic? | no live runbook or deployment state was available | SRE/product | cutover |

## P1 feature blockers

| ID | Question / missing evidence | Needed from | Blocks |
| --- | --- | --- | --- |
| OQ-011 | What is the native MCP producer schema, call identity, actor/resource binding, outcome, and retention contract? | MCP service owner/repository | call-level MCP mapping |
| OQ-012 | What Kafka audit topics, payload schemas, keys, acknowledgements, retention, consumer ownership, and failure handling are deployed? | audit/platform owner | audit stream migration |
| OQ-013 | Which external instance-manager, LLM/provider, compliance, extension, graph, and administrative endpoints are authoritative and versioned? | service owners | affected feature parity |
| OQ-014 | Which alert/status records are signals, findings, detector outputs, or current-state snapshots; what are detector versions and lifecycle rules? | detection/product owners | canonical findings |
| OQ-015 | Which metric formulas become canonical, what are windows/dimensions/null rules, and how are historical formula changes versioned? | analytics/product | metric parity |
| OQ-016 | What price source, currency, effective date, allocation, credits, and correction rules govern cost? | finance/product | monetary analytics |
| OQ-017 | Which legacy mutation endpoints must survive, and what native acknowledgement/effect-observation/idempotency contract exists for each? | control owners/upstream services | command compatibility |
| OQ-018 | Which of the two contradictory AI-conversation filter paths and absent/present findings KPI contracts is intended? | frontend/backend/product owners plus traffic | route compatibility |
| OQ-019 | Which 141 backend routes and frontend workflows have live usage and named owners? | gateway/browser telemetry/product | prioritization and retirement |
| OQ-020 | Are any generated/current source fields outside the 62-row seed ledger required for the first cohort? | deployed metadata and selected queries | physical field closure |

## Operations and certification questions

| ID | Question / missing evidence | Needed from | Blocks |
| --- | --- | --- | --- |
| OQ-021 | What images/digests, Helm values, Vault keys, ConfigMaps, ingress objects, probes, replica/autoscaling settings, and network policies are currently rendered? | cluster/operator | environment certification |
| OQ-022 | What Jenkins jobs/logs/artifacts actually build and deploy these commits, and how are mutable tags resolved? | CI/CD owner | reproducible release proof |
| OQ-023 | What source and platform throughput, latency, lag, outage, disk, and cost limits define success? | SRE/product/load evidence | performance sign-off |
| OQ-024 | What representative, privacy-approved datasets can exercise joins, pagination, late rows, resets, drift, high cardinality, and query plans? | data owners | realistic test certification |
| OQ-025 | Who owns mapping review, schema-drift approval, quarantine repair, replay, cohort change, and retirement sign-off? | engineering/operations governance | operating model |
| OQ-026 | How long must Quilr 1 remain available after a cohort cutover, and which data/artifacts must remain recoverable? | product/legal/SRE | retirement |

## Resolved by repository evidence

The following are no longer open:

- exact target commits and full tracked-file accounting;
- local buildability of both pinned targets;
- backend runtime registration count: 141 custom operations and 26
  application controllers;
- presence of zero target backend tests and no target web test script;
- local decoder/authz/Redis behavior covered by the recorded harness;
- frontend proxy and two App Router handler behavior under local fixtures;
- the fact that exact green GitHub Actions runs skipped application builds;
- intended source-manifest ports/probes/resources;
- source-controlled PostgreSQL table definitions for the two identified
  relational entity families;
- the non-atomic Redis work-set claim/remove sequence.

## Decision rule

An unanswered question must not be converted into an implementation
assumption. The owning profile, mapping, or feature remains disabled,
quarantined, low-authority, or explicitly deferred until evidence and an owner
are recorded.

