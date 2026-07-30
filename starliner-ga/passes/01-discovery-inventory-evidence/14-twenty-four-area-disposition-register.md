# Twenty-Four-Area Disposition Register

Status: **normative scope/dependency ledger**

## Purpose

The broader architecture contains twenty-four areas that are incomplete, uncertain, or dependent on accountable production evidence. This pass does not forget them. It classifies exactly what must be closed now, what receives a pass-local decision, and what remains deliberately deferred.

| # | Area | Current confidence | DIE Pass disposition | Required artifact or evidence |
|---:|---|---|---|---|
| 1 | Modular-monolith deployment architecture | Previously recommended, not formally frozen | **Freeze now** as modular codebase plus seven role-specific deployments | accepted pass architecture ADR, repository/module/deployment map |
| 2 | Worker, stream, and partition topology | Dark at physical level | **Freeze now** using PostgreSQL leased inbox/outbox baseline, tenant/aggregate partitions and fenced workers | topic/work-table schemas, partition keys, lease/retry/backpressure spec |
| 3 | Minimum storage topology | Previously over-broad | **Freeze now** to PostgreSQL + object storage + ClickHouse; no graph/search/Redis by default | capacity/query evidence and technology ADR |
| 4 | Physical canonical database design | Logical only | **Blocks implementation completion** | production DDL, indexes, partitions, RLS, migrations, transaction ownership |
| 5 | Machine-executable contracts | Partial meta-contracts | **Blocks adapter/platform parallel build** | typed source schemas, receipts, management APIs, product OpenAPI, SDKs, fixtures |
| 6 | Global control plane/cell mechanics | Boundary clear, mechanics open | **Use minimum existing environment binding**; full fleet/placement platform deferred | tenant/cell routing and producer enrollment needed for selected deployment only |
| 7 | Launch deployment model | Executive decision open | **Select one pilot/GA profile**; other profiles deferred | approved DIE deployment/operations responsibility profile |
| 8 | Workload identity and cryptographic trust | Principles only | **Blocks production** | issuer/trust domain, enrollment, rotation, revocation, KMS/signing profile |
| 9 | Endpoint signing and local IPC | Source-confirmed critical risk | **Stop-line blocker** | incident disposition, revoked/rotated trust, clean artifacts, authenticated IPC proof |
| 10 | Deployed sensor reality | Static source known, production unknown | **Blocks certification** | exact artifact/config/topology/version/runtime evidence per environment |
| 11 | Browser durability/lifecycle | Adapter seam known, runtime proof missing | **Must close for Browser claim** | service-worker WAL/quota/restart, native auth, correlation and managed-version certification |
| 12 | LLM Gateway transport completeness | Principal path known | **Must close for advertised routes** | uniform lifecycle matrix including streaming/cancel/retry/failover |
| 13 | MCP coverage and scale | Prototype known, gaps known | **Must close for advertised MCP scope** | Direct/OneMCP/native coverage, identity correction, state/topology certification |
| 14 | Identity-resolution quality | Model clear, thresholds/data absent | **Blocks trustworthy inventory** | authority rules, evaluation corpus, precision/review thresholds, merge/split quality report |
| 15 | Finding/insight definitions | Not selected | **Deferred after pass** | retain evidence needed; no finding engine/UI/placeholders |
| 16 | Policy/enforcement defaults | Not selected | **Deferred after pass** | retain observed native decisions only; no new Quilr policy claims |
| 17 | Product read-model design | High-level only | **Freeze now** to explicit PostgreSQL/ClickHouse paths and pass OpenAPI | screen-to-query matrix, schemas, watermark/degraded behavior, load proof |
| 18 | Scale/performance/capacity | No approved values | **Blocks GA, not early coding** | certified tenant/load profile, SLO measurements, resource/autoscaling/cost plan |
| 19 | Reliability and DR | Framework only | **Blocks GA** for selected deployment | SLO/error budget, backup/restore, RPO/RTO, runbooks, on-call, game day |
| 20 | Data governance/privacy values | Architecture clear, values open | **Blocks production data collection** | approved collection/retention/residency/deletion/export policy |
| 21 | Enterprise connector scope | Broadly open | **Only bridges required by pilot claim** | selected IdP/device/owner population sources and reconciliation contracts |
| 22 | Plans/licensing/entitlements | Mostly open | **Deferred**, except feature entitlement for cohort UI | temporary approved cohort entitlement; later commercial/licensing design |
| 23 | Quilr 1 migration reality | Repository known, production dark | **Core pass work, blocks pilot/cutover** | live tenant/store/consumer inventory, mappings, parity, cohort and rollback plan |
| 24 | Organization and ownership | Roles exist, names/capacity absent | **Blocks gate exit** | named RACI/backups, repositories, funded plan, on-call and systems of record |

## Additional dark areas surfaced by the pass

The twenty-four areas remain the umbrella register. The pass also requires explicit detail for:

- exact event eligibility and “full evidence” claim;
- source population and coverage denominators;
- safe evidence retention/cardinality;
- identity correction authorization;
- ClickHouse tenant isolation and rebuild;
- export compatibility;
- customer-visible fallback behavior;
- operational migration comparison;
- endpoint incident/customer exposure;
- source resource budgets.

These are represented in the pass requirements and needs-input registers.

## Decision rule

An item marked deferred cannot be pulled into the pass merely because a schema or existing sensor field mentions it. It requires a pass scope amendment.

An item marked block cannot be waived when it would hide:

- customer evidence loss;
- cross-tenant access;
- prohibited content;
- source-created canonical identity;
- unbounded false merges;
- compromised credentials/artifacts;
- a broken Quilr 1 fallback;
- an unsupported customer claim.

## Review cadence

At every pass gate:

1. review all twenty-four dispositions;
2. confirm deferred areas remain compatible;
3. close or re-evidence pass blockers;
4. record new constraints from internal engineering decisions;
5. update the broader Starliner needs-input/risk registers;
6. prevent a local workaround from becoming unreviewed platform architecture.
