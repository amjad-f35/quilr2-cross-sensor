# Analysis coverage ledger

**Ledger state:** complete static repository archaeology at the pinned commits plus completed available local dynamic verification; live external-estate gaps remain explicit  
**Inventory commits:** `quilr-query-builder@c794c45a9c22b75f101c7c73da508d6e7870f97b`; `quilr-web@e6f9d03ddedde756ec447e3fabccdb3a8c418ea9`

## File coverage

| Metric | Count | Status |
| --- | ---: | --- |
| total tracked files discovered | 2,903 | complete |
| files classified and accounted for | 2,903 | complete |
| executable/source/tooling modules parser-indexed | 2,751 | 312 Java + 2,439 TS/JS |
| non-executable/document/data/asset artifacts inspected or grouped | 152 | complete |
| files partially classified | 0 | none |
| files skipped | 0 | none |
| generated files | 2 | `package-lock.json`, `next-env.d.ts` |
| vendored files/source trees | 0 | none identified |
| Java parse failures | 0 | 312/312 parsed |
| TypeScript/JavaScript parse failures | 0 | 2,439/2,439 parsed |

## Documentation artifact coverage

| Metric | Result |
| --- | ---: |
| Markdown deliverables | 124 |
| Total Markdown lines | 519,445 |
| Approximate size | 45 MiB |
| Local Markdown links scanned | 210 |
| Missing local targets | 0 |
| Malformed local targets | 0 |

### Mutually exclusive extension classes

| Class | Files | Treatment |
| --- | ---: | --- |
| Java | 312 | full CST declaration/body/annotation/call extraction and backend subsystem analysis |
| TypeScript/JavaScript | 2,439 | full AST declaration/body/import/call/effect extraction and frontend feature analysis |
| static media | 60 | individually inventoried, grouped as non-executable UI assets |
| CSS/SCSS | 7 | individually inventoried, styling grouped by consuming feature |
| Markdown/text | 16 | read/classified and included in documentation-consistency audit |
| JSON/YAML/XML/CSV/SQL | 45 | inspected as configuration, lockfile, runtime data, schema/query, or deployment evidence |
| other scripts/config/extensionless/backup artifacts | 24 | inspected/classified; build, tooling, or legacy role documented |
| **Total** | **2,903** | **all accounted** |

## Repository/package coverage

| Repository | Completed groups | Files | Remaining repository groups |
| --- | ---: | ---: | --- |
| `quilr-query-builder` | 23 backend symbol/subsystem groups | 328 | 0 |
| `quilr-web` | 65 frontend symbol/feature/tooling groups | 2,575 | 0 |

Completed subject areas:

- root structure, history anchors, dependency manifests, lockfile, build files;
- startup/shutdown, filters, lifecycle hooks, controllers, processors, services, repositories, DTOs, utilities;
- every App Router page/layout/route handler, proxy, middleware, hook, store, type, client, feature component group;
- SQL/query resources, static runtime data, persistence/cache/graph/warehouse state;
- CI/CD, Docker, Kubernetes, scripts, editor/tooling, and repository documentation;
- cross-repository API paths and route-permission policy;
- security, errors/recovery, concurrency/performance, operations, tests, documentation consistency, and legacy/incomplete code.

## Symbol and interface coverage

| Object | Verified/documented | Coverage detail |
| --- | ---: | --- |
| Java declarations | 2,498 | 1,124 methods, 73 constructors, 248 classes, 49 interfaces, 20 records, 14 enums, 970 fields/constants |
| frontend declarations | 33,512 | 5,260 executable callables; 28,252 schema/field/module declarations |
| **all declarations** | **36,010** | exact locations/signatures/status in generated references |
| backend HTTP operations | 141 | all operations across 26 controllers |
| Next route artifacts | 134 | 112 pages, 20 layouts, 2 route-handler operations |
| backend lifecycle hooks | 59 | bean/post-construct/scheduled/async/event/pre-destroy registrations |
| frontend query-builder occurrences | 120 | 77 normalized paths; 71 matched, 6 classified unresolved/base/dynamic |
| frontend route rules | 38 | evaluated against every 112 page routes |
| frontend direct environment references | 116 occurrences | 23 direct `process.env` names; additional script/Kubernetes/template variables documented |
| backend YAML placeholder names | 51 | includes active and commented historical blocks; active status distinguished in configuration reference |
| frontend network-call syntax nodes | 2,051 | indexed for feature/API tracing |
| frontend browser-storage calls | 63 | indexed for state/security tracing |

The generated symbol references preserve exact compact bodies and direct call targets for each executable symbol. Topical references supply verified framework callers, state, data, failure, and feature relationships rather than inventing reverse callers from name matches.

## Feature and API coverage

- 29 feature-family rows are traced in [feature catalog](05-feature-catalog.md), including implemented, gated, placeholder, and external-service-backed states.
- Every backend HTTP operation is in the [canonical API matrix](api/quilr-query-builder-http.md).
- Both Next route handlers have field-level behavior in [API/interface reference](10-api-and-interface-reference.md).
- All web pages/layouts are in [App Router matrix](routes/quilr-web-app-router.md).
- Major controller → service → processor/repository → store paths and browser → client → backend flows are in [dependency/call graph](17-dependency-and-call-graph.md).
- All persistent/transient stores and known table names are in [data models](09-data-models-and-storage.md) and [data dictionary](08-data-dictionary.md).

## Test and execution coverage

| Check | Result |
| --- | --- |
| tracked automated test discovery | zero suites in both repositories |
| manual verification artifact | one 712-line guardrail remote mutation/restore smoke script |
| backend Jenkins test execution | explicitly skipped with `-DskipTests` |
| query-builder clean package | passed under Java 21.0.11/Maven 3.9.11 after building private dependencies from pinned source |
| query-builder target tests | 0 discovered |
| query-builder start/probe | started with Redis and an H2 relational substitute; 141 custom mappings/26 controllers verified; failure/startup matrix and shutdown exercised |
| Java/Redis dynamic harness | 17/17 passed across decoder, authorization, REST PDP client, `ServiceResponse`, and Redis queue behavior |
| web exact-version install | passed under Node 20.20.2 after reconstructing private component 0.2.79 and preserving all other locked versions/integrities |
| web typecheck | passed |
| web lint | passed with 0 errors/44 warnings |
| web format check | passed |
| web production build/start | passed; Next reported 114 static outputs; production server and both route handlers probed |
| browser verification | login hydration and unauthenticated protected-route redirect verified |
| supporting component tests | with declared React peers: 12/18 suites and 90/113 tests passed; 6 suites/23 tests failed |
| BFF path trace | mount prefix stripped, query/body/auth forwarded, cookies removed |
| exact GitHub Actions runs | both target build jobs skipped; green top-level runs are not application-build evidence |
| repository cleanliness | pinned target worktrees remained clean; runtime substitutions used detached worktrees |

Static parsing still does not substitute for behavior against the real service/data estate. The local builds and probes do establish that the pinned target source compiles and starts under the documented substitutions.

## Unresolved coverage

The original 35 gaps have been reclassified in [open questions](20-open-questions.md): resolved items are preserved with evidence, partially resolved items identify the remaining live-state question, and the smaller remaining set requires runtime access:

- published-artifact equality for the reconstructed private npm package;
- current rendered Kubernetes/Vault/registry/Jenkins state;
- live database schema drift, grants, contents, and plans;
- external service contracts and authenticated end-to-end fixtures;
- production-like data-backed, soak, chaos, and load tests.

These are not unprocessed repository files. Each gap identifies the exact missing evidence.

## Dynamic behavior that cannot be fully statically traced

1. external identity issuer and a real deployed PDP end to end (library behavior itself is now verified);
2. runtime processor names supplied by clients and duplicate-bean ordering;
3. remaining private/external auto-configuration not exercised by target startup;
4. Next/React callbacks or dynamic imports formed wholly from runtime data;
5. actual deployed ingress/BFF selection (both known rewrite implementations are source- and dynamically verified);
6. feature/environment values injected outside checked manifests;
7. live database query plans, drift, grants, retention, and transaction semantics;
8. external scripts/clients calling public HTTP routes or manual mains.

## Completed checklist

- [x] Authenticate as `amjad-f35`, clone, and pin both repositories.
- [x] Enumerate/classify every tracked file.
- [x] Verify submodules, LFS pointers, generated, vendored, and worktree state.
- [x] Extract all backend routes and lifecycle/background hooks.
- [x] Extract all frontend pages/layouts/route handlers, proxy, middleware, and instrumentation.
- [x] Build complete Java and TS/JS declaration/body indexes with zero parse failures.
- [x] Analyze all backend subsystem groups.
- [x] Analyze all frontend feature/tooling groups.
- [x] Trace frontend query-builder calls and route permissions.
- [x] Document data, storage, APIs, configuration, security, errors, concurrency, operations, tests, dependencies, and call graphs.
- [x] Audit documentation claims and classify dead/legacy/incomplete code.
- [x] Record every external/runtime evidence gap.
- [x] Validate Markdown links, stale pending markers, inventory totals, and repository cleanliness.
- [x] Build the unmodified query-builder target and inspect its executable JAR.
- [x] Build the private component and install the web's exact locked versions with the documented private-tar substitution.
- [x] Run web typecheck, lint, format check, production build, production start, HTTP probes, and browser render.
- [x] Run the query-builder startup/failure matrix, live mapping/HTTP probes, lightweight load check, and shutdown.
- [x] Run the 17-test decoder/authz/response/Redis harness.
- [x] Inspect exact CI runs/reusable workflow and supporting BFF, ingress, migration, Helm, Jenkins, graph, and common-library source.
- [x] Run the supporting component's own Jest suite with required peers.
- [x] Reconcile stale pre-runtime claims across the narrative, API, feature, configuration, security, operations, and cross-repository chapters.
- [x] Re-run final documentation link, inventory-row/status, commit, and tracked-worktree checks.

## Final mechanical audit

- Both inventory tables contain exactly 328 and 2,575 file rows respectively; every row has a completed analysis status and none contains a pending/partial/skipped/unknown status.
- Target HEADs still equal the pinned inventory commits.
- Neither target has a tracked or staged diff. Query-builder retains only untracked `target/` and `logs/` verification output; untracked artifacts are excluded from the tracked-file denominator as declared in the inventory method.
- The final Markdown link checker scanned all 124 files and 210 local links with zero missing or malformed local targets.
- The declaration summary remains 312 Java files/2,498 Java declarations and 2,439 TS/JS files/33,512 declarations, with zero parser failures.

## Completion statement

The source analysis of the two requested pinned repositories is **complete**: every tracked file is classified/accounted for, every parser-recognized source declaration is documented, and every required subject area has a code-evidence narrative.

The available local dynamic verification is also **complete for the documented development harness**: both targets built, both started under the stated conditions, major middleware/route/lifecycle behavior was probed, supporting boundaries were resolved, and all created harness checks ran.

The deployed multi-service system is **partially dynamically verified**, not fully production-verified, because the remaining questions require a real database/service/identity/Kubernetes/Jenkins estate. Those limits are explicit and do not conceal unprocessed target files.
