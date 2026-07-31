# Input Scope, Provenance, and Immutable Commits

## Mission instance

| Input | Value |
| --- | --- |
| Sensor/source name | Quilr 1 platform |
| Type | `runtime` / aggregation and product platform; **not a native sensor** |
| Target repositories | `quilrbusiness/quilr-query-builder`, `quilrbusiness/quilr-web` |
| Query-builder commit | `c794c45a9c22b75f101c7c73da508d6e7870f97b` |
| Web commit | `e6f9d03ddedde756ec447e3fabccdb3a8c418ea9` |
| Existing analysis | `quilr-platform-analysis/` |
| Cross-sensor architecture | `docs/quilr2-cross-sensor/` |
| Output | `docs/sensor-intelligence/quilr1-platform/` and matching matrix/schema/fixture roots |

**Verified in source:** both local worktrees still resolve to the commits above.
The query-builder worktree contains only untracked `target/` and `logs/`
created by the prior dynamic verification. The web worktree is clean.

## Repository-analysis baseline

The first-pass archaeology reports:

| Measure | Verified value |
| --- | ---: |
| Target tracked files | 2,903 |
| Files classified/accounted | 2,903 |
| Java modules parsed | 312/312 |
| TypeScript/JavaScript modules parsed | 2,439/2,439 |
| Parser failures | 0 |
| Java declarations | 2,498 |
| Frontend declarations | 33,512 |
| Backend HTTP operations | 141 |
| Backend lifecycle hooks | 59 |
| Frontend pages | 112 |
| Frontend layouts | 20 |
| Next route-handler operations | 2 |

The original file denominator is inherited as evidence; this second pass does
not pretend to re-count supporting repositories as target files.

## Inputs reviewed before new conclusions

Phase 0 reviewed the repository-analysis index, scope, inventory, overview,
architecture, entry points, feature catalog, data dictionary, data/storage,
API/interface, configuration, security, failure/recovery,
concurrency/performance, build/deployment, tests, dependency/call graph,
documentation audit, incomplete-code ledger, open questions, dynamic
verification, coverage, and durable state.

It also reviewed the cross-sensor index/state and the Quilr 1 current-state,
source-extraction, current-to-target, identity-audit, enterprise/legacy source
profile, Starliner contract overview, record-family definition, and
ADR-0014 (`Quilr 1 migrates as evidence`).

The machine-readable ledger is
[`input-ledger.csv`](../../../matrices/sensor-intelligence/quilr1-platform/input-ledger.csv).

## Supporting repositories

The following immutable supporting commits resolve behavior consumed by the
targets. They remain supporting evidence rather than target-file coverage:

| Repository | Commit | Relevance |
| --- | --- | --- |
| `jwt-decoder-library` | `5dfc35a8da27183f66e1d89206e9829a8c03a6f9` | JWT filter and request context |
| `quilr-authz-lib` | `ce03e70b41736f9bf240e2f53f3fe8a6e555d56f` | permission aspect and PDP client |
| `quilr-kafka-client` | `c484b3645f8747ec2a52a942d23a179a4341c002` | audit publication |
| `quilr-common-lib` | `40e8bce63d505e6b50e85d1902bfc776f761f82c` | response, Redis, DWH, graph, entity behavior |
| `quilr-components` | `2d66c4a1dafd7cba10c2979b58b2a83d34d24721` | web component package 0.2.79 |
| `ci-scripts` | `cf687f6a1713498d2843f0f60a8ddf30d672775d` | exact reusable CI selection |
| `quilr-bff` | `929ea208f36ef2db4446064e76643e292507b715` | BFF prefix/header/body behavior |
| `nginx-ingress-controller` | `412ed6f4fcea07c687f3164ec4f6bef68d7541ff` | direct ingress rewrite |
| `quilr-migration-service` | `e4a8ac44844b8c3991881cf7fe873d973fcdb7a7` | PostgreSQL/ClickHouse source DDL |
| `quilr-helm-charts-axis-bank` | `b1adf162383166770bb4acc74ec9b409da08c8c5` | target deployments/resources/probes |
| `quilr-helm-charts` | `a72753199c90b14a8f8b16d599ebc14a11affac3` | SaaS web chart evidence |
| `quilr-jenkins-shared-library` | `d16ec670f1a5e9d6f641b099c52e6ecab9f854c3` | image/tag/push behavior |
| `quilr-graph-service` | `a4a80bb8c43fccc82153f825d987419860cd816a` | graph model boundary |

## Evidence boundary

### Directly available

- all target source/configuration/assets at the pinned commits;
- generated exhaustive declaration/route/lifecycle indexes;
- prior clean builds and isolated runtime results;
- supporting source listed above;
- Quilr 2 / Starliner target contracts and migration decisions.

### Unresolved external state

- current rendered Kubernetes/Vault/registry/Jenkins state;
- production image digests and rollback proof;
- live ClickHouse/PostgreSQL/Neo4j schemas, grants, retention, volumes, and plans;
- real identity/PDP and most external service contracts;
- authenticated tenant fixtures and full data-backed end-to-end execution;
- authoritative MCP Gateway source contract;
- provenance and retention of many legacy warehouse rows.

No later document may convert an item in the second list into current
implemented behavior without new pinned evidence.
