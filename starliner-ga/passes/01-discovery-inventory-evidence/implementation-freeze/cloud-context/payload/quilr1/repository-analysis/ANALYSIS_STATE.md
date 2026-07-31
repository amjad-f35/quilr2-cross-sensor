# Durable analysis state

## Status

Static repository archaeology and the available local dynamic verification are complete for:

- `quilrbusiness/quilr-query-builder@c794c45a9c22b75f101c7c73da508d6e7870f97b`
- `quilrbusiness/quilr-web@e6f9d03ddedde756ec447e3fabccdb3a8c418ea9`

All 2,903 tracked files are classified/accounted. All 312 Java and 2,439 TypeScript/JavaScript modules were parsed with zero errors. The output contains 124 Markdown files totaling 519,445 lines, 36,010 declaration entries, route/lifecycle/cross-repository indexes, and all required topical chapters.

Dynamic work now includes clean target builds, application startup and HTTP probes, browser hydration, a 17-test Java/Redis harness, Redis concurrency, exact CI logs, BFF path tracing, lightweight load probes, shutdown, and supporting dependency/CI/ingress/migration/deployment source.

## Completed areas

- authenticated GitHub access as `amjad-f35`, provenance, commits, history counts, worktree state;
- submodule/LFS/generated/vendored classification;
- full tracked-file inventories;
- Java and TypeScript/JavaScript declarations, bodies, imports/calls/effects;
- 141 backend operations, 59 lifecycle hooks, 134 frontend route artifacts;
- backend controllers/services/processors/repositories/DTOs/config/utilities/schedulers;
- frontend routes/components/hooks/stores/types/clients/middleware/tooling;
- frontend → query-builder calls and page permission evaluation;
- data dictionary, storage lifecycle, API, configuration, security, failure, concurrency, operations, tests;
- documentation contradictions and dead/legacy/incomplete code;
- link, status-marker, inventory-total, and repository-cleanliness checks.
- query-builder clean Maven package and executable-JAR inspection;
- web exact-version install, typecheck, lint, format check, production build/start, HTTP and browser probes;
- decoder, authorization, `ServiceResponse`, and Redis queue harness (17/17 passing);
- private component build/package plus its own 18-suite Jest run;
- exact target-commit GitHub Actions job logs and reusable-workflow commit;
- BFF/ingress prefix stripping, migration DDL, Axis Helm target charts, and Jenkins shared image-tag logic.

## Verified anchors

- Query-builder: Java 21 / Spring Boot 3.5.14 JAR, executable `com.quilr.QBApp`; clean package passed and produced 370 application-class entries plus 158 nested JARs.
- Web: Next.js 16.2.6 / React 19.2 / npm, request entry `src/proxy.ts`; typecheck, lint, format check, production build, start, route probes, and browser render passed under the documented dependency substitution.
- Query-builder Spring authorization uses `permitAll`, while an external decoder filter remains in chain; seven operations carry local `@RequiresPermission`.
- Request context prefers external selected tenant/subscriber and otherwise accepts raw headers.
- Only one target-local JPA entity family exists; migration source now defines its PostgreSQL table/indexes. ClickHouse is the principal query/state store, Redis handles cache/locks/queues/markers, and Neo4j is a source/read model.
- Web auth/refresh material is JavaScript-readable cookie state; route permissions are UI-only and 53/112 pages have no matching rule.
- Static cross-repository matching found 71 compatible paths out of 77 normalized candidates; two concrete-looking mismatches remain.
- Neither target repository has a tracked automated test suite. The supporting component repository has 18 Jest suites; with declared React peers installed, 12 suites/90 tests passed and 6 suites/23 tests failed.
- Live Redis proved `popFromSet` duplicate delivery under two concurrent consumers: both returned all 800 loaded members.
- Exact green target GitHub Actions runs performed detection only; both application build jobs were skipped by the library-only reusable workflow allowlist.

## Remaining evidence gaps

No target-repository file remains unprocessed. Many of the former 35 gaps are now resolved or narrowed in [20-open-questions.md](20-open-questions.md). Remaining items require live/environment evidence:

- published private-artifact equivalence to reconstructed source packages;
- live rendered Kubernetes/Vault/registry/Jenkins state and rollback procedure;
- live ClickHouse/PostgreSQL/Neo4j schema drift, grants, data, and query plans;
- real external-service contracts and authenticated tenant fixtures;
- end-to-end, data-backed, soak, chaos, and production-load execution.

## If continuing with new evidence

1. Read this file, [coverage](21-analysis-coverage.md), and [README](README.md).
2. Pin any new artifact/deployment/runtime evidence to an immutable version or exact capture time.
3. Resolve the corresponding open-question ID.
4. Update affected topical chapter, contradiction/dead-code status, and coverage ledger.
5. Re-run generated indexes only if repository source commits change.

## Generated scripts and indexes

Working generators are outside the cloned repositories under `work/`:

- `generate-inventory.mjs`
- `generate-symbol-indexes.mjs`
- `generate-reference-docs.mjs`
- `generate-frontend-reference.mjs`
- `generate-cross-repository-analysis.mjs`

Machine-readable indexes are under `work/indexes/`. They are analysis working artifacts; user-facing deliverables are exclusively under `outputs/repository-analysis/`.

The dynamic evidence synthesis is [22-dynamic-verification.md](22-dynamic-verification.md).
