# Executive Migration Verdict

## Determination

**The migration is architecturally feasible and can preserve customer continuity. It is not safe as a flag-day rewrite. It is ready for implementation of extractors, the legacy source profile, compatibility routing, parity tooling, and sensor adapters. It is not yet authorized for a production customer cutover.**

The source-derived design is sufficiently determined. Remaining uncertainty is operational evidence: deployed revisions, live schemas and volumes, external consumers, tenant-specific data quality, credential state, cohort selection, and measured rollback.

## What is already decided

- Quilr 2 is a central canonical intelligence plane, not a copy of the Quilr 1 backend.
- Legacy state enters as source evidence with provenance.
- Canonical IDs are assigned only by the central resolver.
- Existing IDs remain typed aliases permanently.
- Browser, Endpoint, LLM Gateway, MCP Gateway, and Browser Backend get explicit Starliner adapter boundaries.
- Edge WAL and central transactional outbox are separate and both required.
- PostgreSQL owns operational canonical mutation for the pass.
- Object storage owns immutable evidence bodies.
- ClickHouse is a rebuildable activity/query projection, never identity or lifecycle authority.
- Customer APIs read Quilr 2 read models, not sensor APIs and not frontend joins.
- Migration is tenant/cohort/domain based, reversible, and observable.

## What would make migration impossible or unacceptably dangerous

Any of the following is a release blocker:

1. deleting or mutating Quilr 1 data before checksum-verified export and rollback expiry;
2. discarding legacy IDs during import;
3. reusing email, display name, URL, process name, or model label as a globally unique identity;
4. changing tenant IDs without a complete, immutable mapping;
5. simultaneous uncoordinated writers for the same policy, approval, correction, or configuration domain;
6. mutating both systems through naïve dual-write request code;
7. cutting API consumers to a new shape without inventorying auth, pagination, error, time, and null semantics;
8. rebuilding aggregates from only current-state tables when customers depend on history;
9. resetting sensor enrollment, device identity, policy cache, or offline state without an upgrade path;
10. copying secrets, API keys, session tokens, signing keys, or certificate private keys as regular migration rows;
11. scaling process-local MCP or browser state horizontally before externalization;
12. making `better-console-backend`, ClickHouse, Neo4j, Redis, or a projection the new canonical authority;
13. treating row-count equality as semantic parity;
14. making rollback depend on deleting accepted Quilr 2 evidence;
15. retiring a legacy API or workflow before consumer-zero and rollback-window evidence.

## Build decision

Engineering may begin these workstreams immediately:

- source catalog and immutable exporter;
- tenant and identifier alias ledger;
- legacy Starliner source profile;
- normalization and canonicalization transforms;
- compatibility façade and tenant/domain routing;
- semantic parity engine and reconciliation reports;
- four sensor-family adapter upgrades plus Browser Backend producer;
- customer state importers;
- rollback controller and cutover audit ledger;
- support/export validation tooling.

Production cutover remains gated by live-validation `P0` rows.

## Recommended delivery order

| Increment | Deliverable | Why first |
|---|---|---|
| M-A | Production inventory collectors and immutable source manifests | Establishes exact scope without mutating anything |
| M-B | Tenant/identity alias ledger and collision report | Prevents irreversible identity loss |
| M-C | Watermarked event/config extractors and replay harness | Proves completeness and resumability |
| M-D | Legacy profile → evidence → normalizer → resolver → canonical read model | Proves the new spine on real legacy semantics |
| M-E | Compatibility façade, API contract capture, export parity | Preserves user and integration workflows |
| M-F | Sensor update-in-place, dual emission, coverage/gap visibility | Moves live evidence safely |
| M-G | Shadow comparison and tenant/domain cutover | Makes divergence visible before authority changes |
| M-H | Stabilization, rollback rehearsal, consumer retirement | Converts technical success into customer-safe transition |

## Honest readiness statement

The design is not blocked on another broad architecture discussion. It is blocked on producing specific operational evidence and implementing the frozen migration mechanisms. If live evidence contradicts a repository-derived assumption, update the relevant mapping and test; do not redesign the spine unless a constitutional invariant is actually invalidated.
