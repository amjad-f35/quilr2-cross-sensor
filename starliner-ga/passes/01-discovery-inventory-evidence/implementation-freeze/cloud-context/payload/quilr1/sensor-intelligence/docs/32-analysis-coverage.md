# Analysis Coverage

**Ledger state:** specialized analysis complete against the available pinned
repository and recorded development-harness evidence. Production integration
remains unimplemented and requires the live/external inputs listed below.

## Inherited repository closure

| Measure | Count | Status |
| --- | ---: | --- |
| target repositories | 2 | pinned to immutable commits |
| target tracked files | 2,903 | 2,903 classified/accounted |
| Java files | 312 | parser-indexed, zero failures |
| TypeScript/JavaScript files | 2,439 | parser-indexed, zero failures |
| other tracked files | 152 | classified/accounted |
| target files skipped | 0 | none |
| target generated files | 2 | lockfile and Next generated declaration |
| target vendored trees | 0 | none identified |
| parser-recognized declarations | 36,010 | indexed |
| backend HTTP operations | 141 | static inventory and runtime registration agree |
| backend lifecycle hooks | 59 | static inventory |
| frontend pages | 112 | static inventory |
| frontend layouts | 20 | static inventory |
| frontend route-handler operations | 2 | static and runtime selected probes |

The full file inventory, classification method, parser results, generated
files, supporting-source commits, and limitations are in
[`quilr-platform-analysis/21-analysis-coverage.md`](../../../quilr-platform-analysis/21-analysis-coverage.md).

## Specialized corpus

| Artifact family | Count | Status |
| --- | ---: | --- |
| Markdown documents | 36 | all substantive; 5,672 lines at validation |
| CSV matrices | 30 | all populated and structurally validated |
| CSV data rows | 741 | every file has a stable header width |
| YAML artifacts | 9 | all populated and parsed |
| YAML item records | 204 | generated from reviewed CSV sources |
| fixture families | 10 | all contain README plus one JSON fixture |
| JSON fixtures | 24 | all parse; provenance/status is in-file or in the strict-envelope family README |
| strict Starliner envelope fixtures | 8 | seven expected-valid pass Draft 2020-12 schema; one expected-invalid fails on missing tenant as intended |

The YAML files are generated analysis/target-design artifacts. They are
explicitly marked `not_implemented_in_quilr1`. The JSON fixture values are
synthetic; no file is described as captured customer data.

## Matrix row coverage

| Matrix | Rows | Coverage meaning |
| --- | ---: | --- |
| input ledger | 17 | pinned targets and inherited evidence inputs |
| features | 30 | product/system feature families |
| utilities | 41 | reusable and internal subsystem capabilities |
| runtime entry points | 26 | specialized lifecycle mechanisms; exhaustive route/lifecycle lists inherited |
| capture points | 21 | store, HTTP, browser, external, and runtime surfaces |
| native record types | 29 | current record/state families |
| native fields | 62 | reviewed inherited seed rows |
| field lineage | 62 | one disposition for every seed row |
| inventory entities | 21 | entity contributions/dispositions |
| identifiers | 26 | namespace/stability/authority review |
| identity coverage | 15 | identity capability and gap review |
| relationships | 27 | current assertions/joins/graph contributions |
| native events | 22 | runtime/event/state transition families |
| event mappings | 17 | proposed event/snapshot/evidence mappings |
| metrics | 30 | verified formulas and proposed health definitions, labeled |
| detectors | 15 | detector/classifier/validator separation |
| control capabilities | 16 | admission, UI gating, mutation, and effect boundaries |
| logs/traces/audit | 17 | observability and evidence sources |
| health metrics | 18 | current and proposed states, labeled |
| interfaces | 25 | grouped interface families; exhaustive route catalog inherited |
| extraction points | 15 | proposed extraction dispositions |
| adapter components | 24 | proposed component responsibilities |
| platform contract mapping | 16 | record-to-target contract families |
| cross-sensor overlaps | 15 | correlation and authority boundaries |
| product disposition | 30 | one decision per feature row |
| findings | 16 | insight/finding signal and admission dispositions |
| privacy disposition | 22 | data-class/retention/trust-boundary review |
| gaps | 26 | implementation and external evidence gaps |
| MVS scope | 22 | included, conditional, and deferred capabilities |
| coverage | 18 | source/runtime/deployment evidence quality |

## Subject completion

| Subject | Result | Remaining boundary |
| --- | --- | --- |
| platform role | complete | none |
| capability and utility catalogs | complete | live utilization is external |
| lifecycle and entry points | complete | dynamic execution of every branch is external |
| capture surfaces | complete | native upstream producer contracts are external |
| record families | complete family-level review | deployed physical schema profile unresolved |
| field dictionary/lineage | 62/62 inherited seed rows reviewed | exhaustive deployed column closure unresolved |
| identity and relationships | complete source-authority review | canonical resolver policy/live graph authority external |
| events and metrics | complete current/proposed separation | product formula thresholds and source occurrence semantics external where labeled |
| detectors/findings | complete admission-boundary review | canonical detector definitions external |
| controls | complete current capability/effect-boundary review | future command state machine/native effect contracts external |
| interfaces | complete grouped specialization plus inherited exhaustive API/UI inventory | live traffic prioritization external |
| adapter/Starliner mapping | complete proposed design | implementation repository/release external |
| product dispositions | 30/30 | product priority/tolerance decisions external |
| privacy/retention | complete repository-visible review | policy/legal decisions external |
| runtime verification | all recorded local evidence reconciled | production-like estate/load/chaos external |
| MVS, gaps, acceptance, responsibilities | complete specification | implementation/certification not performed |

## Dynamic evidence

Verified in the recorded harness:

- clean query-builder and web builds;
- backend startup/failure matrix and 141-route registration;
- selected backend HTTP/CORS/error probes;
- seven decoder and seven authorization tests;
- `ServiceResponse` serialization;
- two live-Redis concurrency tests, including duplicate return of all 800
  members to both consumers;
- frontend production startup, middleware, two route handlers, and browser
  hydration;
- BFF path rewriting with local upstream;
- exact CI run/job decisions;
- intended deployment manifests;
- shutdown;
- 100-request/concurrency-10 smoke probes for health/login.

Not available:

- production-like ClickHouse/PostgreSQL/Neo4j data and schema state;
- external identity/PDP/service estate;
- live Kubernetes/Vault/ingress/images;
- Jenkins execution logs;
- authenticated end-to-end browser use;
- data-backed load, soak, chaos, failover, upgrade, and rollback;
- execution of every route and UI branch.

These are environment-evidence limits, not unprocessed target files.

## Explicitly unresolved

1. exhaustive physical field closure beyond the 62-row cross-sensor seed;
2. deployed source versions, grants, drift, row policies, counts, plans, and
   retention;
3. native producer/provenance contracts for several warehouse projections;
4. external service and MCP/audit contracts;
5. real tenant/identity/policy authority;
6. product parity thresholds, route cohorts, SLOs, retention decisions, and
   owners;
7. implementation, live conformance, and production certification.

The exact question/owner/blocker ledger is
[`31-open-questions.md`](31-open-questions.md).

## Validation record

The final validation performed:

- parsed every CSV and confirmed one consistent column count per file;
- parsed every YAML file;
- parsed all 24 JSON fixtures;
- validated seven positive proposed source-observation fixtures against
  `starliner-envelope.schema.json` using Ajv 8.20.0 and confirmed the
  designated missing-tenant fixture fails the required-property check;
- scanned the specialized corpus for placeholder text and empty YAML item
  lists;
- checked relative Markdown links within the specialized corpus;
- reconciled machine-readable row counts with narrative claims;
- preserved `Verified`, `Inference`, `Proposed`, `Unresolved`,
  `Contradiction`, and dead-code qualifications.

## Completion classification

- **Pinned repository archaeology:** complete.
- **Development-time dynamic analysis possible in the available estate:**
  complete and reconciled.
- **Specialized Quilr 1 platform intelligence and integration specification:**
  complete against available evidence.
- **Production implementation and live certification:** not performed;
  blocked by missing live/external evidence and owner decisions, not by
  unprocessed repository files.
