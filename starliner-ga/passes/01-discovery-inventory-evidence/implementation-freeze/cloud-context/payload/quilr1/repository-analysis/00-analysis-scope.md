# Analysis scope and method

## Repositories and immutable analysis points

| Repository | Default branch | Commit | Commit timestamp | Inventory size |
| --- | --- | --- | --- | ---: |
| `quilrbusiness/quilr-query-builder` | `main` | `c794c45a9c22b75f101c7c73da508d6e7870f97b` | 2026-07-23T20:20:45+05:30 | 328 tracked files |
| `quilrbusiness/quilr-web` | `main` | `e6f9d03ddedde756ec447e3fabccdb3a8c418ea9` | 2026-07-24T13:34:35+05:30 | 2,575 tracked files |

Verified: each commit is the `HEAD` returned by the repository’s `main` branch at clone time on 2026-07-24 (America/Los_Angeles). The full 40-character object IDs above are the analysis anchors.

## In scope

- Every tracked file at the pinned commits.
- Framework-discovered entry points, dependency manifests, build scripts, CI/CD, Kubernetes, configuration, static resources, documentation, and planning artifacts.
- Symbol, data, control-flow, call/reference, interface, state, security, failure, performance, operations, test, and consistency analysis.
- Cross-repository relationships evidenced by endpoint strings, models, routes, configuration, or dependencies.
- Git metadata needed to establish commits, branches, file provenance, and change evidence.

## Outside or externally bounded

- Private/internal dependency, CI, shared-library, ingress, migration, BFF, graph, and deployment source was later inspected where it resolves a target boundary. Those repositories are supporting evidence, not additions to the target-repository file denominator.
- Live secret stores, rendered cluster state, cloud control planes, registry policy, real tenant data, and service repositories/contracts not retrieved as supporting evidence remain outside the evidence.
- Runtime behavior requiring the unavailable production-like service/data estate remains `Unresolved`; local substitute behavior is never presented as production behavior.
- Production security posture beyond what the checked-in code/configuration demonstrates.

## Required evidence discipline

Names, comments, READMEs, and planning files are treated as claims until corroborated. Framework conventions count as registration evidence only where the pinned dependency/framework version and exact path/decorator pattern support that convention. “Unused” requires exact-name, serialized-name, import/export, framework registration, and dynamic-reference searches appropriate to the language.

## Working method

1. Inventory all tracked files and establish immutable commit anchors.
2. Inspect dependency/build/runtime configuration and bootstrap code.
3. Enumerate framework and script entry points.
4. Build language-specific symbol and dependency indexes.
5. Analyze backend and frontend subsystems incrementally, recording findings immediately.
6. Cross-check APIs, data fields, configuration, security controls, errors, tests, and documentation.
7. Run proportionate static/build/test validation where dependencies and external services permit.
8. Update the coverage and unresolved ledgers after every subsystem.
9. Run final internal consistency and link checks before declaring any completion level.

## Access and provenance

Verified: GitHub CLI authentication resolved to the user `amjad-f35`, as requested. Both repositories were confirmed as the exact private `quilrbusiness` repositories before cloning their `main` branches. The cloned worktrees remained clean throughout analysis; all generated documentation and indexes were written outside the repositories.

Verified: `git rev-list --all --count` found 402 commits in the cloned query-builder history and 7,376 in the web history. History was available for provenance checks, but the semantic analysis is anchored to the two exact `HEAD` commits above rather than silently blending older behavior.

Verified: neither commit contains a configured Git submodule or a tracked Git LFS pointer. Generated build outputs absent from Git are outside file-count coverage.

## Static extraction method

- Java: all 312 tracked `.java` files were parsed with a concrete-syntax-tree extractor. It recorded package/type/field/constructor/method declarations, annotations, exact signatures and bodies, direct calls, routes, lifecycle hooks, and line positions. Commented annotations were explicitly excluded.
- TypeScript/JavaScript: all 2,439 tracked `.ts`, `.tsx`, `.js`, `.mjs`, and `.cjs` modules—including root build/tooling modules—were parsed with the TypeScript compiler API. It recorded imports/exports, declarations, callable bodies, calls/effects, environment/storage/network references, client/server directives, and App Router conventions.
- Cross-repository: every frontend string or template containing `quilr-query-builder` was normalized and checked against the extracted backend route set. Dynamic/base-only cases remain labeled unresolved rather than guessed.
- Non-executable files: every tracked configuration, document, script, SQL/data resource, stylesheet, and asset was classified. Binary/static assets are grouped for behavioral analysis but remain individual inventory rows.

The generated references preserve exact source evidence. Narrative chapters then interpret feature, data, failure, security, and operational relationships without treating parser output alone as proof of runtime success.

## Dynamic and supporting-evidence extension

After static coverage closed, the analysis was extended without changing either target commit:

- private dependency source was fetched through authenticated GitHub access as `amjad-f35`;
- the unmodified query-builder POM was built with Java 21/Maven 3.9.11;
- the private component package was built from source and substituted only for its unreachable Nexus tarball during an exact-version frontend lock install;
- both target applications were built, started, and probed locally;
- a 17-test Java/Redis harness exercised decoder, authorization, response serialization, and queue concurrency;
- a real browser verified frontend hydration and redirect state;
- exact GitHub Actions run/job logs were inspected;
- CI scripts, BFF, ingress, migrations, Helm charts, Jenkins shared-library, graph, and common-library sources were pinned;
- BFF path stripping was traced through a live echo upstream.

Exact supporting commits, substitutions, results, and live-environment limits are in [dynamic verification](22-dynamic-verification.md).
