# Nuxt and shadcn-vue UI Engineering Constitution

This document is the implementation authority for the customer UI of the
bounded Discovery, Inventory/Catalog, Activity/Observability and Evidence
pass. It complements the product information architecture, screen/API matrix,
OpenAPI and UI transition gates. It does not change their semantics.

## Verified starting point

The implementation worktree is:

`/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt`

The inspected baseline is `main@8c745c88e56cb6fc88a022415a596b5d436a5264`
plus 117 uncommitted paths. Before DIE UI work, preserve that work on an
explicit checkpoint branch and review it. Never reset, overwrite or silently
discard it.

The checked-in shell already uses:

- Nuxt 4, Vue 3 and TypeScript;
- `shadcn-nuxt` with source-owned shadcn-vue components in
  `app/components/ui`;
- Reka UI primitives and Lucide icons;
- Tailwind CSS 4, CSS variables, `class-variance-authority`, `clsx` and
  `tailwind-merge`;
- Pinia, VueUse and Nuxt data/runtime facilities;
- TanStack Vue Table for complex tables;
- Unovis/Vue for bounded charts;
- Vue Flow for bounded relationship views;
- `pnpm` as the package manager.

These are the accepted implementation foundations. Do not introduce another
component framework, an iframe/microfrontend, a generated dashboard shell or a
parallel design system for this pass.

## Meaning of “native Nuxt/Vue/shadcn”

shadcn-vue intentionally checks component source into the repository and uses
Tailwind internally. The rule is therefore not “never use Tailwind.” The rule
is:

> Build pages and product components with native Vue single-file components,
> Nuxt pages/layouts/composables/server facilities and the checked-in
> shadcn-vue/Reka primitives. Customize the owned primitives, shared tokens and
> typed variants instead of placing a second wrapper component system or
> arbitrary utility soup on top of them.

Product/domain components are required and permitted. For example,
`AgentInventoryTable`, `EvidenceLineage`, `CoverageDisclosure` and
`EntityDetailInspector` are legitimate compositions. A second generic
`QuilrButton`, `PlatformDialog`, `BaseTable` or `MagicCard` that merely wraps
and obscures the existing shadcn primitive is not.

## Component layers

Dependencies flow down this stack:

```text
Nuxt page and layout
→ DIE product/domain component
→ shared product pattern
→ checked-in shadcn-vue/Reka UI primitive
→ design tokens and primitive variants
```

The layers are:

1. `app/pages` and `app/layouts`: routing, page composition, Nuxt metadata and
   initial query orchestration. They contain no transport DTO construction,
   sensor joins or one-off primitive implementations.
2. product components: typed estate, agent, model, MCP, activity, evidence,
   identity and coverage behavior. They compose primitives and expose
   product-language props/events.
3. shared product patterns: a deliberately small set such as data-surface
   state, filter bar, detail inspector, provenance block and freshness banner.
   A pattern must have two proven consumers or be required across the frozen
   screen matrix; speculative abstraction is prohibited.
4. `app/components/ui`: checked-in shadcn-vue/Reka primitives. These may be
   edited directly to add accessible, reusable variants consistent with the
   upstream primitive contract.
5. `app/assets/css/tailwind.css` and variant definitions: shared semantic
   design tokens, theme variables and bounded layout/typography utilities.

Pages may use simple layout utilities. Repeated visual policy moves into a
token, variant, primitive or proven shared pattern.

## Styling rules

Required:

- use semantic CSS variables for color, border, elevation, radius, typography,
  spacing and state;
- use existing shadcn variants or add typed CVA variants at the primitive that
  owns the behavior;
- use the repository `cn` helper when conditional class composition is needed;
- preserve light/dark and future tenant-theme behavior through tokens;
- make density, truncation, overflow and responsive behavior deliberate;
- keep source strings untrusted and render them as text.

Prohibited:

- a new wrapper design system over shadcn-vue;
- duplicated button, input, dialog, drawer, table, tabs, badge, tooltip,
  pagination or form primitives;
- arbitrary-value classes and per-page colors when a semantic token applies;
- long copied class strings that encode the same component policy in multiple
  files;
- `!important`, deep selectors or global element overrides used to fight a
  primitive instead of correcting it;
- inline styles for stable product design;
- styling by DOM assumptions inside a third-party primitive;
- embedding React components, an alternate Tailwind component kit or another
  CSS framework;
- a generic JSON renderer or raw telemetry grid as a substitute for designed
  product views.

An exception requires a short code comment identifying the missing primitive
or browser constraint and a test. Repeated exceptions require a reviewed
primitive/token change.

## Product-data boundary

The UI data path remains:

```text
page or product component
→ typed query composable
→ DieRepository
→ generated TypeScript client
→ /die/v1
```

The generated client and generated DTOs are never hand-edited. Product view
models may format, group or disclose server data, but cannot:

- invent a canonical ID, relationship, person, risk, coverage or classification;
- parse opaque IDs for meaning;
- join Browser, Endpoint, LLM or MCP source records;
- query sensors, PostgreSQL, ClickHouse or object storage;
- infer authorization from hidden controls;
- turn `unknown`, `unsupported`, `partial`, `gap` or `stale` into an empty or
  successful state;
- put raw evidence content, tokens or withheld values into URLs, logs,
  analytics or persistent client state.

Server authorization and field masking are authoritative. UI capability checks
prevent invalid actions; they do not replace API authorization.

## State ownership

- URL state owns scope, time range, tab, sort and shareable filters.
- Nuxt data facilities and typed query composables own remote request state.
- Pinia owns durable client interaction state only when multiple unrelated
  components genuinely share it.
- Local component state owns transient interaction.
- Server-provided authorization revision and projection generation participate
  in cache keys and invalidation.
- Opaque pagination cursors are not saved as durable bookmarks.

Do not create a global store for every response or duplicate the generated
client cache in Pinia.

## Tables, charts and graphs

- Use TanStack Vue Table for the high-density server-paginated inventories and
  activity surfaces. Column definitions remain typed and field authorization
  aware.
- Use the existing shadcn table, pagination, dropdown, popover, command,
  skeleton and empty-state primitives as presentation building blocks.
- Use Unovis/Vue only for bounded aggregates returned by the API.
- Use Vue Flow only for bounded, typed relationship/exposure views returned by
  the API. Provide an equivalent accessible list/table representation.
- Never render the entire enterprise graph, activity history or raw evidence
  corpus in the browser.
- Avoid per-row request waterfalls. Use frozen list/detail operations and
  bounded parallel detail requests.

## Required screen behavior

Every screen implements and tests the states in
`09-nuxt-ui-integration.md`:

- loading;
- first-use and filtered empty;
- unauthorized without existence hints;
- partial/unknown/unsupported coverage;
- stale projection and source gap;
- retryable transport failure;
- invariant failure with request ID;
- offline/reconnect where applicable.

Progressive disclosure is mandatory: overview, inventory, detail, relationship,
activity, source/coverage and provenance surfaces present useful customer
information before exposing low-level evidence metadata. Raw prompt, file,
tool argument/result or response content requires a separate, audited,
purpose-bound authorization flow.

## Accessibility, localization and security

- Meet WCAG 2.2 AA for pass screens.
- Preserve Reka focus management and keyboard semantics.
- Provide keyboard operation and a non-graph alternative for relationships.
- Use text/icon as well as color for state.
- Announce asynchronous state changes without flooding live regions.
- Restore focus when an inspector closes.
- Use Nuxt i18n keys for customer-visible strings; do not create concatenated
  fragments that cannot be translated.
- Do not use `v-html` for source-originated content.
- Do not leak withheld data through counts, filter choices, tooltips,
  client-side errors, analytics or timing-dependent prefetch.

## Test and review gates

The UI work is not complete at visual parity. Each change runs the smallest
focused test first and then the affected combination of:

- unit tests for view-model transformations and state machines;
- generated-client contract tests;
- Vue component tests for states, variants and events;
- Nuxt route/integration tests;
- accessibility tests and keyboard checks;
- authenticated browser E2E for RBAC/ABAC/ReBAC, existence hiding and field
  redaction;
- responsive visual regression for supported breakpoints and themes;
- typecheck, lint and production build;
- bundle/fixture scan proving no production fixture corpus or prohibited
  alternate UI framework is reachable.

Architecture checks must reject:

- direct `$fetch`/database/sensor use in pages/components;
- production imports from fixture or mock modules;
- handwritten transport DTOs;
- primitive duplicates outside `app/components/ui`;
- a new generic UI-wrapper layer;
- prohibited out-of-scope routes or product claims.

`UI-GATE-001..010` and `LG004-*` remain the release exits.

## Implementation sequence

1. Preserve the 117-path dirty baseline on a checkpoint branch and record the
   disposition of every path.
2. Confirm the current component/token inventory; remove nothing solely
   because it predates DIE.
3. Install the engineering execution kit and establish component/architecture
   tests.
4. Generate the `/die/v1` client and implement `DieRepository`.
5. Adapt deterministic fixtures to the repository interface for tests only.
6. Consolidate routes and implement shared data-surface states.
7. Build the frozen customer screens through native Nuxt/Vue/shadcn
   composition.
8. Disable deferred routes and make production fixture reachability a build
   failure.
9. Close contract, authorization, accessibility, performance and live E2E
   gates against an exact pushed SHA.

This sequence preserves the existing shell while replacing its false data
seams. It is not permission to rewrite the UI from scratch.
