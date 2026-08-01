# OIDC/JWKS Identity and Runtime Session Lifecycle

**Status:** FROZEN addendum; frozen 2026-08-01; makes executable the
production identity path that
[authorization and audit](07-authorization-and-audit.md) already requires in
principle, and bounds the landed HS256 transitional mode

**Scope:** OIDC discovery, JWKS fetch/cache/refresh with fail-closed
staleness bounds, accepted algorithms, required claims and claim mapping,
clock-skew bounds, token-type separation, revocation semantics around the
server-enforced `authorization_revision`, the Nuxt BFF server-private session
lifecycle matching the landed cache-identity seam, the exact permitted use of
HS256 transitional mode, and identity-provider outage behavior. This addendum
extends [authorization and audit](07-authorization-and-audit.md) (§Identity
inputs, §Cache and failure behavior),
[product API contract](08-product-api-contract.md) (§Authentication and
tenancy), and [Nuxt integration](09-nuxt-ui-integration.md) (§State and URLs,
§Accessibility and security). Concrete issuers, audiences, client IDs, group
mappings and key material remain `NEEDS_INPUT` environment bindings
([closure ledger](13-closure-and-non-blockers.md)); this addendum freezes
behavior, not environment values.

## Two identity paths, one principal contract

- **Interactive users:** tenant-configured OIDC issuer → Nuxt BFF login →
  server-private session → BFF-held credential on the upstream hop. The
  browser never holds a bearer token; the landed BFF proxy attaches the
  server-side credential and strips cookies from the upstream request and
  `set-cookie`/`authorization` from the response.
- **Workloads:** OAuth 2 client credentials → JWT access token with a
  DIE-specific audience, presented directly to the product API or ingest.

Both paths resolve to the same verified principal shape frozen in 07 (issuer,
immutable subject, tenant from trusted mapping, roles, assurance, session and
request identity). Tenant, roles and scope are never accepted from request
query/body fields; a caller-supplied `tenant_id` disagreeing with the
principal is rejected (landed `tenant_isolation`).

## OIDC discovery

- Issuers are `https` URLs from the tenant's trusted issuer configuration;
  any other scheme fails closed.
- The verifier fetches `<issuer>/.well-known/openid-configuration`; the
  document's `issuer` must byte-equal the configured issuer or verification
  fails closed.
- Discovery documents are cached per issuer: refreshed no more often than
  every 300 seconds, reused no longer than 24 hours; a stale document past 24
  hours without successful refresh fails closed for operations that need it.
- `jwks_uri` must be `https` and is the only accepted key source for
  federated issuers; keys are never inlined from configuration for OIDC
  issuers and never fetched from a URL supplied by a token.

## JWKS fetch, cache and staleness bounds

- Keys are selected by exact `kid`; accepted entries must be asymmetric
  public keys valid for signature use (`use=sig` or absent `use` with a
  permitted `alg`).
- Cache per issuer with two frozen bounds:
  - **soft TTL:** default 300 seconds, configured within 60–900 seconds;
    expiry triggers background refresh while verification continues on the
    cached set;
  - **hard staleness bound:** default 6 hours, configured within 1–24 hours;
    a cached key set older than the hard bound without successful refresh
    fails closed for **all** verification against that issuer.
- An unknown `kid` triggers one immediate forced refresh, rate-limited to at
  most one forced refresh per issuer per 60 seconds; still-unknown after
  refresh fails closed. Key-miss refresh is the rotation fast path.
- A JWKS response that is syntactically invalid, empty, or over the bounded
  response size is discarded; the prior cached set remains active until the
  hard bound. Verifier caches are replica-local and bounded.

## Accepted algorithms

Production token verification accepts exactly this asymmetric set, further
narrowed by a per-issuer allowlist:

| Algorithm | Status |
|---|---|
| `ES256` | mandatory support |
| `RS256` (≥ 2048-bit modulus) | permitted for federated issuer compatibility |
| `PS256` (≥ 2048-bit modulus) | permitted for federated issuer compatibility |
| `EdDSA` (Ed25519) | only under an explicitly certified non-FIPS algorithm profile, mirroring 02 |

Fail-closed, non-negotiable: `alg=none`; every HMAC algorithm on the
federated path; any algorithm not in the issuer's allowlist; a token whose
`alg` is not permitted for the resolved key; embedded `jwk`/`jku`/`x5u`
header key material. The key resolved by `kid` decides which algorithms are
acceptable — tokens never negotiate.

## Required claims and mapping

Every token accepted by the product API or ingest must carry `iss`, `aud`,
`exp`, `iat`, `nbf` and `sub`, all validated. Landed behavior is restated as
frozen: `exp` validation alone is insufficient — `iat` and `nbf` **presence**
is enforced explicitly because JWT libraries commonly validate them only when
present.

| Principal fact | Source | Rule |
|---|---|---|
| tenant | trusted per-issuer/client mapping, or mapped tenant claim (`tenant_id` by default) | never from caller-supplied request fields; mapping is configuration, not payload |
| roles | mapped roles claim (`roles` by default) or trusted group→role mapping | at least one role required; unknown values fail closed per `authz/model.yaml` |
| authorization revision | `authorization_revision` claim on workload/internal tokens; session-held for interactive principals | see §Revocation |
| producer identity (ingest) | `producer_id` claim plus required ingest scope | UUID-validated; scope required (landed) |
| assurance/step-up | `acr`/`amr` mapping per issuer configuration | corrections and authz administration require step-up per 07 |

Clock skew: verification leeway for `exp`, `nbf` and `iat` is at most 60
seconds and applies symmetrically; zero leeway is compliant (the landed
verifier uses zero). An `iat` more than the leeway in the future is rejected.
A token whose lifetime `exp − iat` exceeds 24 hours is rejected regardless of
issuer; recommended production issuance is ≤ 60 minutes.

## Token-type separation

- User-facing product API, workload product API and ingest use **distinct
  audiences**; a token presented against the wrong audience fails closed
  (landed audience enforcement).
- Workload tokens carry client/workload identity and scopes; ingest
  additionally requires the producer scope and `producer_id`. User tokens
  carry no producer claims; a user token can never authenticate a producer
  batch, and a workload token can never open a UI session.
- Support-session principals remain time-bounded, explicitly approved
  identities per 07; token type does not substitute for the approval record.

## Revocation and `authorization_revision`

The server-side revision check is already landed and is frozen as the
revocation mechanism: every authorized request compares the principal's
revision against `die_authz.authorization_revision` for the tenant and fails
closed on mismatch (`authorization_revision_stale`) or absence
(`authorization_revision_unknown`).

- Tokens carrying `authorization_revision` (workload/internal) must equal the
  current revision **exactly**; both older and newer-than-current claims are
  rejected.
- Interactive principals bind the revision at session establishment; the API
  re-validates it server-side on every request, so a session survives a
  revision advance only by re-resolving its principal, never by reusing
  cached grants.
- Frozen rotation triggers — each advances the tenant revision exactly once,
  transactionally, through the authorization administration path (07):
  1. any role binding, scope, or curated relation grant/close;
  2. principal disable/offboarding in the trusted identity mapping;
  3. group→role mapping changes affecting effective grants;
  4. support-session approval and expiry where implemented as grants;
  5. operator-forced rotation on suspected credential or session compromise.
- A revision advance implicitly invalidates: outstanding
  revision-claim-bearing tokens, cursors (`CURSOR_STALE`, 08), cached
  authorization snapshots and revision-keyed response caches (07). No
  invalidation fan-out is trusted for correctness; the revision comparison
  is the authority (07 §Cache and failure behavior).

Issuer-side revocation (IdP session/refresh-token revocation) is additive
defense; the platform's authorization outcome never depends on it alone.

## Nuxt BFF server-private session lifecycle

The landed seam is frozen: no public bearer credential in the browser; the
BFF holds the upstream credential server-side; the die query cache binds to
the session principal.

- **Cookie contract:** the session cookie is `__Host-`-prefixed, `HttpOnly`,
  `Secure`, `SameSite=Lax` or stricter, `Path=/`, no `Domain` attribute; the
  session identifier is ≥ 128 bits from a CSPRNG and is an opaque reference
  to server-side state — never a JWT, never claims.
- **Session record (server-private):** issuer, subject, tenant, roles
  snapshot, authorization revision at establishment, session epoch,
  authentication time/assurance, idle expiry, absolute expiry.
- **Timeouts:** idle timeout default 60 minutes (configured ≤ 8 hours);
  absolute timeout default 12 hours (configured ≤ 24 hours). Expiry destroys
  the server-side record; the cookie alone re-establishes nothing.
- **Session-principal cache binding (landed, frozen):** die query cache keys
  bind `(tenant, subject, session epoch)` in addition to the frozen
  scope/filter/projection-generation/authorization-revision dimensions (09).
  Login, logout and tenant switch each increment the session epoch, rotating
  every die query key **and** purging the cached entries, even when the same
  user returns or revision/generation coincide across tenants. Re-asserting
  the identical principal is a no-op so in-session navigation keeps its
  cache. The cache identity grants nothing; the backend remains the sole
  authorization authority.
- **Logout:** destroy the server-side session, expire the cookie, increment
  the session epoch, purge session-scoped cached data. Logout is a
  state-changing route and carries CSRF protection (09).
- **Tenant switch:** a new principal binding through the same establishment
  path — roles and revision re-resolved for the target tenant, session epoch
  incremented, cache rotated/purged. A tenant switch never carries cached
  responses, cursors or capability advertisements across tenants.
- **SSR:** the SSR-derived cache identity hydrates into the client so keys
  are identical across the boundary (landed); the upstream hop from SSR
  carries the session's principal, never a shared ambient identity for
  authenticated routes.

## HS256 transitional mode

The landed HS256 resolvers (API principal, ingest producer) are transitional
local verticals. Frozen boundaries:

**MAY be used for:** local development; compiled test harnesses and E2E
suites; single-operator preprod verticals on private networks without
customer data.

**MUST NOT be used for:** production; any environment holding customer
tenant data; any internet-exposed endpoint; multi-team shared environments;
producer credentials distributed outside the operating team.

While in use, transitional mode keeps the full landed strictness: symmetric
key ≥ 32 bytes; `exp`, `iat`, `nbf` presence, `iss`, `aud`, `sub` all
mandatory; tenant/roles/`authorization_revision` claims identical to the
production contract, so replacing the verifier changes no downstream
semantics. A production or preprod configuration selecting HS256, a
symmetric secret, or no verifier **must refuse to start** — the startup guard
is release-gated, mirroring the audited ingest-service guard that rejects
symmetric JWT outside local tests.

## Outage behavior

| Failure | Frozen behavior |
|---|---|
| OIDC discovery unreachable | new logins and new issuer onboarding fail closed; established sessions continue under their own expiries and server-side revision checks |
| JWKS unreachable, cache within hard bound | cached keys keep verifying; unknown `kid` fails closed; operator alert required once refresh failure exceeds the soft TTL |
| JWKS unreachable, cache past hard bound | all verification for that issuer fails closed |
| authorization store unavailable | fail closed; never degrade to allow (07) |
| session store unavailable | session-authenticated routes fail closed; public health endpoints stay up without tenant data (07) |

Alerting is a requirement, not advice: identity-verifier degradation
(discovery/JWKS refresh failures, hard-bound approach, startup-guard
rejections) must page through the frozen observability path
([performance, reliability and operations](10-performance-reliability-and-operations.md)).
Readiness reflects degradation; it never converts to permissive verification.

## Required tests

Beyond the frozen suites in
[verification](11-testing-conformance-and-release-gates.md):

- discovery issuer mismatch, non-`https` issuer and stale-discovery rejection;
- JWKS rotation via key-miss refresh; forced-refresh rate limit; hard-bound
  fail-closed; malformed/oversized JWKS discard;
- algorithm matrix: each accepted algorithm verifies; `none`, HMAC,
  unlisted algorithms, and `alg`/key mismatch fail closed;
- claim matrix: each missing required claim fails closed; future `iat`;
  lifetime over 24 hours; skew boundaries at the configured leeway;
- audience separation: user token on ingest, workload token on UI session,
  wrong-audience API calls;
- revision revocation: stale and newer-than-current revision claims;
  cursor/cache invalidation on revision advance (existing landed E2E);
- session lifecycle: logout/login and tenant-switch cache isolation
  (landed 131-test seam suite is the baseline), cookie attributes, idle and
  absolute expiry, CSRF on logout;
- startup guards: HS256/symmetric/no-verifier production configurations
  refuse to start.
