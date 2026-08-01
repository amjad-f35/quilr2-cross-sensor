# LG-004 — Product API, Generated Client and Nuxt

## Final identity/session scope

This gate includes OIDC discovery/JWKS rotation and hard-expiry behavior,
server-private session lifecycle, production startup guards, trusted BFF
tenant routing, session/cache isolation and browser-level cross-tenant
existence hiding, plus bounded terminal-session purge. Exact tests are
LG004-T011..015. HS256 or a public/ambient
bearer may close a local vertical but can never satisfy this gate.

## Frozen integration shape

OpenAPI is the customer contract. The TypeScript client is generated from the
committed specification and wrapped only by `DieRepository`. Nuxt components
never call sensor services, databases, legacy query builders or ad hoc
endpoints.

The server performs authentication, authorization revision resolution, RBAC +
ABAC + ReBAC planning, RLS-scoped query execution and fail-closed field masking
before serialization. The UI treats omitted/masked, unsupported, unknown,
unobserved and zero as different states.

## Customer surfaces

- overview: estate size, source/coverage freshness and actionable data-quality
  state without out-of-scope findings;
- inventories: devices, identities/accounts, applications/surfaces, agents,
  models/providers, MCP servers/tools and evidence;
- detail: summary plus progressively disclosed device, account, source,
  relationships, activity, coverage, conflicts and evidence provenance;
- graph/map: bounded, typed, source-supported relationships only;
- activity/evidence: authorized filters, stable cursors and explicit gaps;
- export: separately authorized create/read/download with immutable snapshot.

## Required proof families

- OpenAPI generation is deterministic and generated diff is clean;
- every operation has authentication, capability, mask and audit behavior;
- authorization happens before query planning, counts and pagination;
- cursor binds filter, sort, generation and authorization revision;
- revoked access invalidates pagination, caches and download redemption;
- masked/unknown fields never reappear through sort, filter, count or export;
- tenant/cell isolation survives pooled server connections;
- all `ui-field-lineage` and `screen-api-matrix` rows render from live DTOs;
- production build has no reachable fixture repository or invented
  risk/finding/policy/spend computation;
- empty, partial, stale, source-gap, conflict, forbidden, error and loading
  states are distinguishable;
- direct object-store URLs and internal scope tokens never reach the browser;
- accessibility, keyboard navigation, responsive layout and browser support
  pass;
- list/detail/activity endpoints meet budgets at representative cardinality.

## Closure

`UI-GATE-001..010` and every `LG004-*` catalog row pass against a live API,
generated client and clean pinned Nuxt revision. Network traces prove the
absence of legacy/sensor calls. DTO snapshots are derived from real fixtures
seeded through ingest—not handwritten UI objects.
