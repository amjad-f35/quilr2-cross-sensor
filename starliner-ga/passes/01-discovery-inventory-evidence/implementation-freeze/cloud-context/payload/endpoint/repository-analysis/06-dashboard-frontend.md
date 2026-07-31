# Dashboard Frontend Deep Reference

This file covers `sentinel-dashboard/frontend` at dashboard commit `cd755d37c14b8b86623a15a4dbae41d33b226b2b`. Paths are relative to the dashboard repository.

## Scope and verification

- **Verified:** all 101 tracked frontend paths were inventoried. The 83 files under `frontend/src` comprise 32 TSX, 21 TypeScript, and 30 CSS files.
- **Verified:** `npm ci` from the pinned lockfile and `npm run build` succeeded on 2026-07-20. TypeScript passed; Vite 6.4.1 transformed 1,845 modules.
- **Verified build output:** index 0.40 kB, CSS 74.03 kB, JavaScript 582.62 kB (179.27 kB gzip), and logo 8.75 kB. Vite warned that the JavaScript chunk exceeded 500 kB.
- **Verified hygiene:** the tracked generated `dist/index.html` was restored after verification; no repository source change from the build was retained.
- **Unresolved:** no repository test runner exists for frontend behavior, and the committed Playwright console logs are diagnostic artifacts rather than repeatable tests.

## File classification

| Paths | Classification and role | Analysis status |
| --- | --- | --- |
| `src/main.tsx`, `src/App.tsx` | Browser bootstrap, provider composition, route table | Fully inspected |
| `src/api/auth.ts`, `client.ts`, `settings.ts` | Browser credential store and HTTP clients | Fully inspected |
| `src/api/hooks/*.ts` | React Query adapters, cache keys, optimistic policy mutation | Fully inspected |
| `src/contexts/AuthContext.tsx`, `src/utils/jwt.ts`, `components/auth/*` | Token decode, identity lifecycle, route guard | Fully inspected |
| `src/pages/*.tsx` | Routed pages plus one unreachable OTel page | Fully inspected |
| `src/components/discovery`, `overview`, `graph`, `settings`, `layout`, `ui` | Tables, detail drawer, charts, graph, policy editor, shell and primitives | Fully inspected |
| `src/types/*.ts` | Frontend transport expectations | Fully inspected against Go models |
| `src/data/settingsMockData.ts` | Static settings reference data and legacy in-memory store | Fully inspected; active and dead portions separated below |
| `src/data/mockGraphData.ts` | Static relationship demo | Dead-code candidate; no import found |
| `src/styles/global.css`, `src/tokens/tokens.css` | Reset/global styling and design tokens | Active |
| 28 CSS modules | Component/page-scoped presentation corresponding to their basename | Active where owning component is active; dead owners noted below |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts` | Dependency/build configuration and generated dependency lock | Fully inspected |
| `Dockerfile`, `nginx.conf`, `index.html`, `.dockerignore`, `.gitignore` | Container build, reverse proxy, SPA entry, build exclusions | Fully inspected |
| `src/assets/QuilrLogo.svg`, root `assets/QuilrLogo.svg` integration copy | Source logo assets | Active |
| `dist/index.html`, `dist/assets/QuilrLogo-C6sTColq.svg` | Committed generated build fragments | Generated, stale/incomplete; classified below |
| `frontend/.playwright-mcp/*.log` (5 paths) | Historical browser console captures | Generated diagnostic artifacts; inspected |
| `frontend/CLAUDE.md`, `.claude/agents/fullstack-qa-engineer.md` | Developer/agent instructions | Documentation/configuration, not runtime |

CSS modules with no active owner are `ActivityLogPage.module.css`, `AppExplorerPage.module.css`, and `GraphSidebar.module.css`; the dead `ClaudeActivityPage`, `SkillsTree`, and `Tooltip` components also make their corresponding modules unreachable from `main.tsx`.

## Runtime entry and route tree

`src/main.tsx` requires DOM element `#root`, creates a React 18 root, enables `StrictMode`, and renders `App`. There is no fallback if the element is absent; the non-null assertion affects TypeScript only.

`App` wraps the router in one module-level `QueryClient`, then `AuthProvider`. Query defaults disable focus refetch and allow one retry.

```text
/login                   → LoginPage (public)
ProtectedRoute
└── AppShell / Sidebar
    ├── /                → DashboardPage → OverviewDashboard
    ├── /applications    → DashboardPage(assetType="app")
    ├── /agents          → DashboardPage("agent")
    ├── /models          → DashboardPage("model")
    ├── /mcp-servers     → DashboardPage("mcp")
    ├── /skills          → DashboardPage("skill")
    ├── /hooks           → DashboardPage("hook")
    ├── /repos           → DashboardPage("repo")
    ├── /permissions     → DashboardPage("perm")
    ├── /plugins         → DashboardPage("plugin")
    ├── /relationships   → RelationshipGraphPage
    ├── /activity        → ActivityLogPage
    ├── /alerts          → AlertsPage
    └── /settings        → SettingsPage
```

The browser-router basename is `import.meta.env.BASE_URL` with the final slash removed. There is no catch-all/error route and no route for `ClaudeActivityPage`.

## Authentication and browser state

### Login flow

The implemented login is portal-token bootstrap, not email/password authentication:

1. `LoginPage` reads `token` from the URL query.
2. `decodeJwt` accepts either one base64url payload segment or a three-segment JWT and only decodes JSON. It does not verify a signature.
3. `buildIdentityFromJwt` requires nonempty email, first `tenantIds` entry, subscriber ID, numeric finite expiry in the future; it constructs display name from first/last name or email.
4. The raw token is stored in localStorage key `sentinel_token`; the derived object is separately stored under `sentinel_identity`.
5. `AuthProvider.authenticateFromIdentity` sets the React user and the page navigates to `/` with replacement.
6. With no URL token, a still-future stored identity plus any stored token is accepted and restored. Otherwise the generic `AuthErrorPage` renders.

`AuthProvider` schedules a browser timeout for token expiry and clears both storage entries/user then. It performs no network authentication check, provides no logout function, and does not clear React Query cache. `ProtectedRoute` only tests whether the context user is non-null.

**Contradiction:** frontend architecture/product documents describe an email/password form, SHA-256 password hashing, `/auth/login`, `/auth/me`, a user menu, logout, 401-triggered cleanup, and backend JWT validation. None of those flows exist in the current frontend; historical Playwright logs showing `/auth/me` calls correspond to older code, not this revision.

### Credential propagation

Both HTTP clients read token/identity fresh from localStorage and send:

- `Authorization: Bearer <raw token>`
- `X-Tenant-ID: <stored identity tenant>`
- `X-Subscriber-ID: <stored identity subscriber>`

The generic client always sends JSON content type, including GETs. For POST/PATCH JSON bodies it adds an `email` property before caller data; caller-supplied email wins because it is spread later. Current policy PATCH backend ignores both that email and `entity_type` as unknown fields. The settings-policy client uses a separate header helper and does not add email.

### Potential cross-identity cache issue

**Potential issue requiring validation:** all React Query keys omit tenant/subscriber identity, and authentication changes do not call `QueryClient.clear` or invalidate tenant data. A `/login?token=...` navigation can replace the stored identity within the same SPA while keeping cached data. Asset/overview/graph caches can be shown until their stale time, and `['settings','policy']` has infinite stale and garbage-collection times. Thus a second identity can receive the first identity's policy state without refetch; a subsequent edit can attempt to PUT that cached document to the second tenant. The exact result depends on policy versions (conflict or write), but the display/reuse path is directly present in code.

Tokens are readable by any same-origin script because they are in localStorage. The token also arrives in the login URL query before `navigate(..., replace)` removes that history entry; repository Nginx does not define referrer or content-security headers.

## HTTP client surface and contract audit

The active client base is the absolute path `/api/v1`.

| Client symbol | Server endpoint | Active consumer | Contract result |
| --- | --- | --- | --- |
| `api.getAssets` | `GET /dashboard/assets` | `useAssets` / typed dashboard pages | Active; adds `asset_type` alias from canonical `entity_type` |
| `api.getAsset` | `GET /dashboard/assets/{id}` | `AssetDetailModal` | Active, but sends `?type=` while server accepts `os_type`; query is ignored |
| `api.updatePolicy` | `PATCH /dashboard/assets/{id}/policy` | application actions | Active; extra email/entity type ignored by lax server decoder |
| `api.getKpis` | `GET /dashboard/kpis` | `useKpis` | Active |
| `api.getRelationships` | `GET /dashboard/relationships` | graph page | Active |
| `api.search` | `GET /dashboard/search` | none | Dead-code candidate; sends `types`, while server expects singular `type` |
| `api.getOverview` | `GET /dashboard/overview` | overview page | Active |
| `api.getInventoryOverview` | `GET /frontend_apis/inventory_overview` | hook exported, no component consumer | Implemented-but-unreachable frontend feature |
| `api.getAlerts` | `GET /dashboard/alerts` | alerts page | Active |
| `api.getActivityConversations` | `GET /dashboard/activity/conversations` | activity page | Active |
| `getPolicy` / `putPolicy` | `GET/PUT /dashboard/policy` | settings DLP/permissions | Active; PUT carries `If-Match` |
| `getDangerousPermissionsConfig` | `GET /dashboard/dangerous-permissions/config` | permissions settings | Active |
| `api.getOtelSessions/Session/Events/Stats` | `/otel/*` | unreachable `ClaudeActivityPage` | Server has no matching routes |

The frontend has no active call for the server tool-call endpoint, direct conversation detail/hook events, ordinary ungrouped activity, inventory-overview related-entity paging, admin entity settings, agent sync/config endpoints, or internal test-only auth endpoints.

### Type mismatches

- `Asset.entity_type` is declared as short `AssetType`, but the server emits canonical values such as `Application` and `McpServer`.
- `Asset.entity_context` is typed as an object, while the Go dashboard model serializes it as a string.
- `api.getAsset` uses `any`, so its actual `{asset,devices,related_entities}` shape bypasses declared `AppDetails`.
- `ActivityConversation` omits the server's additive `conversation_key`; current UI uses `conversation_id`, which is still present.
- Overview's local `ActivityLogItem` omits newer action/metadata fields, matching the backend overview projection rather than the full activity type.

## Feature implementation

### Overview

`OverviewDashboard` renders KPI cards, entity distribution, risk table, recent activity, seven-day trend, and top apps/tools from `GET /dashboard/overview`. It fills missing local calendar days and computes growth using the last two nonzero points. Fetch error is not distinguished from loading: once React Query errors and has no data, the component continues rendering `Loading overview...`.

`PolicyStatus` implements a donut and governance score but is never rendered by `OverviewDashboard`. Policy counts still appear in the KPI cards. Therefore the product requirements for the donut/governance view are code-present but unreachable.

### Typed asset inventory

`DashboardPage` maintains page, page size, sort, search, filters, selected asset and policy-confirm state. Search waits 300 ms; filters wait 400 ms; changing entity route resets controls. It calls assets and KPIs separately. Applications default to `hide_system=true`; other types do not.

`DiscoveryTable` chooses per-type columns, risk strip, pagination and application allow/block controls. Only applications expose actions, and `is_system` rows disable them. Blocking requires `ConfirmDialog`; allowing does not. After successful mutation it invalidates assets, KPI and relationship keys, but not overview.

For non-application rows the table de-duplicates the current page by ID without adjusting server `total`; this can make a page visually shorter than its pagination count if duplicate IDs arrive.

### Asset detail

`AssetDetailModal` fetches detail directly rather than through the exported `useAsset`. It displays devices, related-type tables, properties, and a client-built ego graph. The ego graph is synthesized from returned lists: device edges are named `runs_on`, child edges `has_<type>`, and each neighbor class caps at ten; it is not the server relationship graph.

The detail request error is swallowed. Related/device state is not cleared when the asset changes, so a failed fetch after in-modal graph navigation can leave the prior asset's details visible under the new header. The wrong `?type=` query also prevents OS-specific detail selection.

### Relationship graph

The page loads the full server graph, performs client-side search, type counts, two-hop focus/filter projections, and node detail connections. It displays only user/app/model/MCP/agent filter groups even if other node types arrive.

`useElkLayout` is a misleading name: it does not import or call `elkjs`. `concentricLayout` assigns node rings in the order user → app → model → agent → MCP → other, then creates ReactFlow edges. `requestAnimationFrame` defers the synchronous calculation but does not move work off the UI thread. `elkjs` remains a direct installed dependency with no source import found.

### Activity and alerts

Activity UI reads conversation-grouped pages, derives worst outcome, unique tool/file summaries, parses a specific `reason_detail` text convention, and expands all turns already returned by the list endpoint. It does not call direct conversation/hook-event detail, so hook telemetry is not shown. Four free-text filters debounce for 300 ms; action/decision update immediately.

Alerts pages by entity/app/action and expands properties. The server accepts arbitrary alert action strings, while the UI filter options use `blocked`, `warn`, `allowed`, and `quarantined`; the UI badge treats `blocked|deny` as denial but not `block`. Whether agents emit these exact strings is addressed in the cross-repository analysis.

Both pages treat a failed query with no data as an empty result rather than showing an error. The generic client exception includes status and raw response body.

### Tenant policy settings

The visible settings tabs are DLP and Dangerous Permissions. Skills code exists but is not routed/rendered.

`useTenantPolicy` loads the server document once with infinite stale/GC. `fromWire` removes unknown app IDs and de-duplicates DLP tuples last-write-wins; `toWire` reconstructs server snake_case shape. DLP uses the shared embedded JSON catalog through Vite alias `@catalog`.

All policy edits are optimistic and feed a module-global 400 ms save scheduler. Only one PUT is allowed in flight; later schedules re-arm. PUT uses the cached version in `If-Match`. A 409 invalidates policy and emits a DOM-created toast; other failures invalidate without a user message.

**Potential lost-edit issue:** scheduler comments say `localRev` detects any edit during an in-flight PUT, but `scheduler.bumpRev()` is called only for dangerous-permission mutations. DLP and dead Skills mutations do not increment it. A DLP edit during an in-flight save can therefore be overwritten by the older server echo; the pending follow-up then reads the overwritten cache.

Dangerous-permission toggles have a second per-key one-second trailing debounce, overlay intended UI state, then update a composite `ide|permission` string in `perms.blocked`. Unmount commits pending toggles and calls `flushPolicySave`; because the mutation-triggered scheduler is asynchronous, exact navigation/unmount timing still depends on React Query mutation execution.

`YamlPreviewDrawer` combines real policy state with static mock apps, classifiers, skills, MCP servers and compliance profiles, then emits a custom YAML shape. **Contradiction:** its UI says this is what the backend will receive once persistence is wired. Persistence is wired, and the displayed composite/camelCase document is not the server's tenant-policy payload.

## Client state, caching, and errors

| Query key | Stale / GC | Notes |
| --- | --- | --- |
| `['assets', params]` | 30 s / default | keeps previous only when dataset filters match |
| `['kpis', type]` | 2 min / 10 min | placeholder can fall back to another type's cached KPI data |
| `['relationships']` | 1 min / default | full graph |
| `['overview']` | 2 min / 10 min | server independently caches two minutes |
| activity / alerts with params | 30 s / default | keeps previous page |
| `['settings','policy']` | infinite / infinite | not tenant-keyed |
| dangerous-permission config | infinite / infinite | common static file |

There is no error boundary, centralized 401 response handling, cancellation/abort controller in the direct detail fetch, logout cache clearing, offline persistence, service worker, or browser session state beyond React/localStorage. Most pages do not render `error` from React Query.

## Security and authorization

- Frontend route protection is presence/expiry of client-controlled local state, not an authorization decision.
- No role is stored in `User`, and no page/action has role checks.
- Token decoding and identity building do not verify signatures; the backend behavior is separately documented and also does not verify portal signatures.
- React's normal JSX escaping protects rendered strings. Raw HTML APIs (`dangerouslySetInnerHTML`) were not found.
- Generic metadata/properties are rendered as text nodes. Custom YAML quoting is for display/copy and not passed to a parser in the browser.
- Nginx defines no CSP, HSTS, frame-ancestor, referrer, or other security response headers.
- **Potential issue requiring validation:** tenant-agnostic caches can expose stale previous-identity data as described above.

## Build, dependencies, and deployment

`package.json` has only `dev`, `build`, and `preview`; no test, lint, format, or typecheck-only scripts. The lock resolves React 18.3.1, React Query 5.90.21, React Router DOM 6.30.3, ReactFlow 12.10.1, Vite 6.4.1, and TypeScript 5.9.3 among the direct packages.

`vite.config.ts` uses port 5173, proxies `/api` and `/ea` to localhost:33333, selects base from `VITE_BASE_PATH`, and aliases the backend policy catalog. The Docker build must copy that backend JSON outside frontend's build context path, which its root-context Dockerfile does.

Docker builds with Node 20 Alpine, then serves with Nginx 1.27 Alpine. Nginx proxies `/api/` and `/ea/`, supports both root and `/sentinel-dashboard/` SPA paths, redirects `/` to the prefixed path, and turns off buffering for every `/ea/` request. Its comment names `/ea/v1/sync/stream`, but the server has no such route.

Jenkins passes `VITE_BASE_PATH=/sentinel-dashboard/`; Compose uses Dockerfile default `/`. Nginx supports both layouts. The committed `dist/index.html` references hashed JavaScript/CSS files that are not tracked; only it and a logo are committed. It is therefore an incomplete/stale generated artifact, but Docker always rebuilds `dist` and does not rely on it.

`npm audit` against the pinned installation on 2026-07-20 reported six advisories (one low, three moderate, two high): direct `vite` and `react-router-dom` plus transitive React Router, PostCSS, Picomatch and Babel Core. Fixes were reported available. **Potential issue requiring validation:** audit presence does not establish exploitability in this application's production/runtime context, especially for build-only dependencies.

## Tests and diagnostic artifacts

- No `*.test.*`, `*.spec.*`, Vitest, Jest, Playwright configuration, or frontend test script is tracked.
- A successful build proves only static type checking and bundling.
- Five frontend and ten root `.playwright-mcp` console logs are tracked. They record manual/historical sessions with React Router warnings, missing favicon, old auth endpoint 401/404/405, API 404/500, stopped Vite WebSocket, and external portal/Google console messages. They contain no commands, assertions, expected outputs, or CI registration and are not test evidence.
- Some logs reference source behavior no longer present (`/auth/me`, email/password login), demonstrating that the artifacts are stale relative to this revision.

## Dead, legacy, incomplete, and unused surfaces

- `ClaudeActivityPage.tsx`, `useOtel.ts`, `types/otel.ts`, and all `api.getOtel*` methods: no route; server lacks endpoints.
- `SkillsTree.tsx` and skill mutation hooks: component not rendered by the two-tab settings page.
- `Tooltip.tsx`: no consumer.
- `mockGraphData.ts`: no consumer.
- `useAsset`, `useSearch`, `useInventoryOverview`: exported but no component consumer.
- `PolicyStatus`, `RISK_ORDER`: declared in overview module but not used in render path.
- `store`, legacy defaults/system instructions, MCP/compliance/audit stubs in `settingsMockData.ts`: several values feed YAML preview, but the mutable store itself has no consumer.
- `ActivityLogPage.module.css`, `AppExplorerPage.module.css`, `GraphSidebar.module.css`: no imports.
- `elkjs`: installed but not imported; custom layout is used.
- `dist`: generated and incomplete in Git; rebuilt by Docker.

These are repository-local reachability findings. Public exports might be consumed only after code not present in this repository is added, but the Vite entry graph has no dynamic loader/plugin registration that could load them today.

## Documentation consistency findings

| Claim | Code evidence | Result |
| --- | --- | --- |
| Login is an email/password form with SHA-256 and API login. | `LoginPage` accepts only a query token. | Contradicted/outdated |
| Auth context has login/logout/loading and calls `me`. | Context exposes user, boolean, and identity setter only. | Contradicted/outdated |
| 401 triggers logout. | Generic client throws; it does not clear auth. | Contradicted |
| Graph uses ReactFlow plus ELK. | ReactFlow is active; `elkjs` is never imported and layout is custom concentric code. | Partially confirmed |
| User menu shows identity/role/logout. | No user-menu component or sidebar control exists. | Documentation-only |
| Policy donut and governance score are displayed. | `PolicyStatus` exists but is not rendered. | Planned/code-present but unreachable |
| Claude activity is a navigable feature. | Page/client/hooks exist, but no route and no backend endpoints exist. | Incomplete/documentation-only at runtime |
| Asset detail errors are displayed. | Fetch catch is empty. | Contradicted |
| Frontend is stateless except auth token. | It also stores a separate identity and maintains substantial query/local component cache. | Partially confirmed |

