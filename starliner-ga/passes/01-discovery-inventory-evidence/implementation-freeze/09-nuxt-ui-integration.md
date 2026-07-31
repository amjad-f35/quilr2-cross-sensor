# Nuxt Customer UI Integration

## Current implementation disposition

The existing application at `/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt` is the UI codebase. Verified characteristics:

- Nuxt 4/Vue and shadcn-vue component system;
- broad product shell, navigation, tables, inspectors and detail components;
- fixture-backed `app/lib/api/readModels.js`;
- overlapping `platformRoutes.ts` and `platformShell.ts` route registries;
- persona-based presentation;
- screens and fixture fields for deferred findings, policy, cost and recommendations.

The shell and visual components are reusable. Fixture data, local canonical-ID construction, risk fields and persona-based access are not backend contracts.

The implementation rules for extending that shell are frozen in
[Nuxt and shadcn-vue UI engineering constitution](35-nuxt-shadcn-ui-engineering-constitution.md).
The UI is built with native Nuxt/Vue composition and the checked-in
shadcn-vue/Reka primitives. Product components may compose those primitives,
but agents may not hide them behind a second generic wrapper design system,
clone common primitives or scatter repeated arbitrary visual policy across
pages. Tailwind remains the styling engine used by shadcn-vue; shared styling
belongs in semantic CSS variables, owned primitive source and typed variants.

The independent review inspected Git revision
`8c745c88e56cb6fc88a022415a596b5d436a5264` on `main` with a dirty worktree and
made no mutation there. `app/lib/api/readModels.js` explicitly calls itself a
fixture stand-in, constructs colon-delimited IDs incompatible with the opaque
API contract and derives out-of-scope risk data; `app/mock/api.ts` imports
findings/policy/spend fixtures; `package.json` has no generated DIE client.
Therefore the shell is **blocked for live DIE binding**, not production-ready.
The evidence and non-negotiable transition gates are machine-readable in
`ui/nuxt-seam-verification.yaml`.

## Frozen frontend architecture

```text
page/component
→ typed query composable
→ DIE repository interface
→ generated TypeScript OpenAPI client
→ /die/v1
```

Rules:

- no component imports fixture modules;
- no component calls `$fetch` directly;
- no page knows a sensor-native schema;
- no browser-side canonicalization, joins across sensor feeds or risk calculation;
- no direct database, ClickHouse, object-store or sensor request;
- authorization is enforced by the API; the UI additionally removes unavailable actions from server-advertised capabilities;
- `readModels.js` becomes a temporary fixture implementation of the same generated DTO-facing repository during development, then is disabled in production;
- a production build fails if a fixture provider is selected.

## Route authority

`app/constants/platformShell.ts` becomes the single route/navigation manifest. `platformRoutes.ts` is migrated or generated from it and then removed; two independent registries may not remain.

The pass exposes only routes backed by pass data:

| Route | Customer purpose |
|---|---|
| `/` | canonical estate/coverage/activity overview |
| `/govern/ai-estate` | application products/surfaces/deployments/accounts, agent definitions/deployments, models/routes, MCP products/deployments/tools and connected relationships |
| `/govern/activity` | canonical source, model, agent, MCP and tool activity |
| `/govern/enforcement?tab=coverage` | observation coverage, gaps, producer capability—not policy enforcement |
| `/govern/enforcement?tab=sensors` | producer fleet and delivery health |
| `/govern/enforcement?tab=adapter-certification` | artifact/profile certification |
| `/govern/identity` | source bindings, identity explanation and authorized conflict correction |
| `/govern/evidence-audits` | evidence search, lineage, provenance and audit access |
| `/operate/overview` | operational freshness, lag, gaps and recent source activity |
| `/operate/activity` | alternate task-oriented view of the same canonical activity resource |
| `/operate/observability` | curated pipeline/source metrics, not a raw internal-log browser |
| `/operate/reliability?tab=sensor-delivery` | producer queue, gaps and projection freshness |
| `/settings/directory-roles` | minimum product-data role/scope administration |

Routes for findings, policies, enforcement decisions, incidents, spend, value, recommendations, red team, agent build/release, workspace AI and raw observability logs remain behind disabled feature manifests. They are not populated with invented or fixture truth in a production pass build.

## Information architecture

### Home

Show only:

- active application products/surfaces/deployments, agent definitions/deployments, model products/deployments, MCP server products/deployments and tools;
- new, changed, stale and retired assets;
- activity volume by family/outcome;
- producer/coverage state;
- recent material changes;
- identity ambiguity count;
- timestamp, scope and freshness/coverage disclosure.

No generic risk score or “attention” recommendation is computed.

### AI Estate

Tabs:

1. applications;
2. agents;
3. models and deployments;
4. MCP servers and tools;
5. relationships;
6. sources and coverage.

The default is a paginated, filterable table. Graph visualization is an optional bounded detail view, not the primary inventory. Applications, agents, models, MCP servers, devices and identities each use their typed list/detail operation; `listEntities/getEntity` remains an investigation/extension surface, not the main UI contract.

Generic entity detail uses one page with:

- human-readable summary and lifecycle;
- selected canonical fields;
- configured versus observed relationships;
- recent activity;
- sources/coverage;
- field provenance and evidence;
- identity explanation;
- version/change timeline.

Application views label `generative_ai`, `other_ai`, `non_ai` or `unknown`, plus the independent `agentic_capability` state and classification authority/revision. The UI never infers those values from icons, names, domains or observed prompt-shaped traffic.

MCP list rows show tool/resource/prompt counts only with a `capability_scope_state` badge. The detail drawer shows whether the view is authorization-scoped, shared legacy, mixed, partial, stale, failed, unsupported or unknown, plus safe protocol/freshness fields. It never renders or logs authorization-context or endpoint-configuration tokens, and it never sums capability definitions across scoped views.

### Agent inventory and detail

The default Agents table is deployment-scoped. For a local agent it shows, subject to field authorization:

- agent definition/name/vendor, kind and current observed version;
- deployment locality and lifecycle;
- device name, OS and type;
- observed user context and independently proved execution account/person;
- configured MCP server count;
- first/last observed, source count, identity assurance and coverage.

It does not create a separate row for every process, session, project, workspace or repository.

Opening an agent uses `getAgentDeployment`; it does not assemble the drawer from generic entity calls. The detail contains agent attributes, device context, observation identity, independently proved execution identity, related workload, configured MCP servers split into local/remote, configured models, hooks/skills/plugins/configured permission rules, repositories, recent activity, sources, coverage and provenance. The UI never relabels `UserContext` as process owner. “View relationships” renders structural, configured and observed edges as visibly different facts. The future “enterprise exposure” view is enabled only when an authoritative entitlement connector covers the requested scope; otherwise the UI says “enterprise permissions not connected/unknown,” not “no exposure.”

### Activity

The primary representation is a high-density virtualized timeline/table with family, subtype, actor, resources, outcome, source, coverage and time. Details disclose the canonical lifecycle, correlation, lineage and evidence membership. It does not dump raw prompts, files, tool arguments/results or internal trace spans.

### Evidence

The ordinary list shows evidence metadata, capture state, quality, producer/profile, admitted time, digest, canonical links and retention state. Detail shows the complete permitted lineage:

```text
producer record
→ admitted evidence
→ normalized observation and claims
→ identity decision
→ canonical entity/relationship/activity
→ active projection version
```

Raw content access is a separately authorized purpose dialog, expires quickly and is audited.

### Coverage and producers

Make “what we do not know” obvious:

- expected versus observed population;
- supported/unsupported capabilities;
- covered/degraded/gap/unknown intervals;
- last heartbeat, edge queue depth/age and sequence gaps;
- adapter artifact/profile/certification;
- canonical and projection lag;
- remediation limited to pass-safe operations such as retry/replay/pause where authorized.

## Screen states

Every data surface implements:

- loading skeleton preserving layout;
- first-use empty state;
- filtered empty state;
- unauthorized state without data hints;
- partial coverage warning;
- stale projection warning with watermarks;
- source gap/degraded state;
- retryable error;
- terminal invariant error with request ID;
- offline/reconnect where useful.

An empty result is not presented as “none exist” when coverage is `unknown`, `gap` or `unsupported`.

## State and URLs

- scope, time range, tab, sort and filters are URL state;
- cursors are navigation state, not durable bookmarks;
- saved views store the normalized public filter, not opaque cursors;
- Pinia/composables store UI state and authenticated principal metadata only;
- TanStack/Nuxt async-data cache keys include scope, filter, projection generation and server authorization revision;
- a revision/generation change invalidates affected cache;
- detail inspectors are deep-linkable and keyboard accessible.

## Typed client

OpenAPI generation produces:

- TypeScript DTOs;
- endpoint functions;
- error union;
- enum unknown handling;
- request/response validators in development tests.

Handwritten UI view models may format or group fields but may not rename semantic states without an explicit mapping tested against the OpenAPI. Money/risk/finding/policy properties in current fixtures are absent from DIE DTOs.

## Performance rules

- server-side first fetch for primary page data where authentication topology permits;
- route-level code splitting;
- no bundle containing the fixture corpus in production;
- tables virtualize after the configured row threshold;
- generic graphs cap nodes/edges and expand explicitly; agent exposure renders only the API's allowlisted four-hop paths;
- search is debounced/cancelled and server-side;
- charts receive bounded aggregate series, not raw activity;
- no waterfall of one request per row;
- entity detail uses parallel bounded requests or one detail aggregate, not browser fanout across sensors;
- content bodies load only after explicit evidence access.

## Accessibility and security

- WCAG 2.2 AA release target for pass screens;
- full keyboard navigation for tables, filters, tabs, drawers and graph alternatives;
- focus is restored on inspector close;
- status uses text/icon in addition to color;
- live regions announce async state changes without flooding;
- sensitive values do not enter analytics, client logs, error reporting, URL query or local storage;
- rendered source strings are treated as untrusted text;
- CSP, trusted-types-compatible rendering, secure cookies and CSRF protection are applied according to auth topology;
- download links use `rel=noopener`, safe filenames and content disposition.

## Migration sequence inside the UI repository

1. introduce generated client and `DieRepository` interface;
2. adapt fixtures to the interface for deterministic component tests;
3. consolidate route manifests;
4. implement shared freshness/coverage/error chrome;
5. bind overview, application estate, deployment-scoped agent list/detail/exposure, model/MCP estate, activity, evidence, coverage, producer and identity screens;
6. remove component imports of fixture/derive modules for pass routes;
7. gate deferred routes with a server-provided feature manifest;
8. make production fixture selection a build failure;
9. run contract, accessibility, performance and authorization-state E2E gates.

This is a frontend integration sequence, not a reduction of the backend pass.
