# Migration and backfill plan

## Strategy

Use tenant-sequenced strangler migration, not a big bang:

```text
schemas/evidence
→ adapters/observations
→ catalog/resolver
→ entity/relationship materialization
→ event normalization
→ finding/metric materialization
→ backfill and reconciliation
→ dual-read validation
→ canonical UI
→ compatibility/deprecation
```

## Stages

| Stage | Source/backfill key | Validation/completion | Rollback/data-loss control |
| --- | --- | --- | --- |
| 0. Freeze semantics | Current tables/APIs/source docs | Version 1 glossary, owners, privacy, IDs, SLOs approved | No runtime change |
| 1. Raw/evidence + schemas | Live source records; tenant/source/native ID | Raw hash/ack tests, quarantine/DLQ, tenant isolation | Disable adapter; raw records immutable |
| 2. Observation adapters | Browser/BES, endpoint, LLM first | Golden source fixtures, idempotent replay, watermark parity | Stop downstream; reprocess raw |
| 3. Catalog/identifier registry | `apps_db`, domains/process/model mappings | Curator review, alias/non-merge tests | Revert catalog version and replay |
| 4. Resolver/entity materializer | Inventory/apps/users/devices/gateway config | Candidate/merge precision, source-count parity, manual split | Pin decisions/revert resolver version/replay |
| 5. Relationship materializer | Neo4j, endpoint config/raw edges, settings/approvals | Typed-edge parity and authority report | Rebuild Neo4j projection from ledger |
| 6. Event normalization | interactions/visits/enriched/events/gateway/endpoint | Per-source count/hash, duplicate/correlation samples, time bounds | Drop/rebuild projection; raw preserved |
| 7. Finding migration | Alert/action/status/outcome/current findings | Root-cause dedup, state/owner/evidence parity | Keep legacy read-only; recompute findings |
| 8. Metrics | Summary tables/current dashboards | Dual-run definitions, canonical-count and coverage reconciliation | Serve legacy metric with warning |
| 9. Dual-read API/UI | Existing routes/pages vs canonical APIs | Tenant acceptance thresholds and discrepancy report | Feature-flag tenant back to legacy read |
| 10. Canonical writes | Settings/approvals/owner/finding actions | Outbox/legacy projection parity | Command rollback/compensation; legacy write fallback |
| 11. Deprecation | Legacy endpoints/tables/caches | No active consumers; retention/archive approved | Compatibility façade remains for defined window |

## Backfill order and keys

1. Tenants and catalog seeds.
2. Users/IdP aliases, devices, sensors.
3. Applications/settings/IdP apps/process mappings/assets.
4. Accounts/credentials where provider IDs exist.
5. Agents/models/MCP/tools/connectors with source confidence.
6. Ownership/policy/approval relationships.
7. Visits/interactions/enriched events.
8. Gateway/endpoint/BES events.
9. Alerts/status/audit/compliance/red-team.
10. Cost/summary data.

Each backfill row records:

```text
backfill_run_id
source table/schema/partition
tenant
native primary/sort key
source row hash/version
observed/event time range
adapter/schema version
observation/event/canonical IDs
result/status/error
```

## Current source backfills

| Domain | Inputs |
| --- | --- |
| Applications | `apps_db`, caches as comparison only, `app_tenant_settings`, `app_process_info`, `quilr_idp_apps`, `quilr_asset_inventory` |
| Users/accounts/org | `users`, `smart_groups`, `user_app_approvals`, graph/IdP/connector records |
| Devices | `ep_user_devices`, BES heartbeats, endpoint entity/device context |
| Events | `quilr_interaction_logs`, `quilly_interactions`, `visit_app_logs`, `enriched_events`, gateway/endpoint/BES tables/messages |
| Findings | alert/action/status/outcome tables; current finding processors/IDs |
| Assurance | audit/compliance/red-team tables |
| Metrics | current summary/materialized tables as validation, not authority |
| Relationships | Neo4j snapshot and explicit source configuration, authority labeled |

## Dual-read report

Per tenant/entity/time window:

```text
legacy rows vs canonical entities
aliases resolved/unresolved/conflicting
source observation counts
users/accounts/devices/surfaces
event counts before/after exact dedup/correlation
finding rows vs root-cause findings and status
metric values and explained deltas
graph edge parity/authority gaps
freshness/watermarks/DLQs
sampled field-level lineage
```

Expected differences—deduplicated source rows, separated accounts/surfaces/models, corrected stale state—must be explainable, not forced to numerical parity.

## Tenant sequencing

- Internal/test tenant.
- Small tenant with browser+endpoint+gateway coverage.
- Tenant with known duplicate/product/account cases.
- Tenant with heavy interactions/findings.
- Tenant with MCP/connectors after their contracts pass.
- Cohorts by schema/volume/region.

Never run one tenant’s merge/catalog decisions in another tenant. Global catalog releases are independently versioned.

## Completion gates

- Zero unreconciled P0 tenant-isolation/integrity defects.
- 100% selected source partitions checkpointed or explicitly waived.
- Raw→observation→canonical/event lineage sampled and reproducible.
- Manual merge/split replay proven.
- Findings dedup/close/reopen golden tests pass.
- Metric differences have documented canonical/source-duplicate explanations.
- UI makes source coverage and unknown/conflict visible.
- Rollback executed in rehearsal.
- Legacy consumers inventoried and notified before deprecation.
