# Final DIE Delta-Freeze Closure

**Status:** FROZEN IMPLEMENTATION AUTHORITY

**Date:** 2026-08-01

## Verdict

For the bounded Discovery / Inventory / Catalog / Activity-Observability /
Evidence pass, the system structure and semantic contracts are frozen enough
for continuous end-to-end production engineering. Coding agents do not need
to invent components, authority boundaries, stores, flows, concurrency
semantics, identity behavior, relationship behavior, authorization, APIs,
UI lineage, failure behavior or release evidence.

This is not a claim that the current code is complete or GA-certified. The
remaining work is tracked as implementation conformance and executable
release gates. A gate failure may expose a specific contradiction; it does
not authorize ad-hoc redesign.

## Final architectural shape

```text
native sensor/backend fact
  -> typed source adapter + privacy disposition
  -> Starliner durable edge WAL / authenticated delivery
  -> admission + immutable evidence/object reference + receipt
  -> deterministic one-or-many normalization bundle
  -> source objects, claims, relationship/activity/coverage candidates
  -> type-specific continuous resolver
  -> canonical entity/relationship/activity/coverage ledgers in PostgreSQL
  -> transactional canonical-change outbox
  -> generation-bound PostgreSQL product read models
     and ClickHouse activity/evidence projections
  -> authorization before query planning + field policy/existence hiding
  -> die-v1 OpenAPI + generated TypeScript client
  -> Nuxt server-private BFF + native Vue/Nuxt/shadcn-vue customer screens
```

The modular core is one codebase and semantic release authority with
role-specific compiled processes (`ingest`, `normalizer`, `truth`,
`projector`, `api`, `maintenance` and the server-private BFF). Roles have
separate credentials, grants, resource budgets, scaling and rollout; this is
neither one giant process nor independently designed microservices.

## Decisions closed by the final delta

| Area | Frozen answer | Executable authority |
|---|---|---|
| source revision, late arrival, tie and retraction | numeric decimal revision where the schema carries it; otherwise observed time then stable record ID; stale inputs remain history but cannot move the head; retraction differs from end and never erases evidence | 36, `source-temporal-precedence.csv`, 25 PRC fixtures |
| interactive identity | tenant-pinned HTTPS OIDC discovery, allowlisted asymmetric algorithms, bounded JWKS caching/refresh, strict claims and authorization revision | 37, issuer schema, `die_authz.oidc_trust` |
| browser session | `__Host-` opaque cookie, server-private HMAC record bound to exact issuer-trust revision, idle/absolute expiry, session epoch/cache rotation, RLS tenant lookup and maintenance-only tombstone purge within seven days | 37, session schema, `die_authz.runtime_session`, `die_bff` grants |
| bootstrap/enrollment/config trust | detached JCS/JWS, tenant/environment/kind-scoped public key, one active key, overlap rotation, revocation/compromise, immutable attempt audit | 38, signer schema, signer/verification SQL |
| relationship withdrawal | canonical lifecycle ends, `end_reason` distinguishes source end/retraction/reconciliation/correction, support/evidence lineage retained | 36, SQL support roles, OpenAPI `Relationship.end_reason` |
| transitional implementation debt | closed classifications, exact inspected revisions, release effect and objective removal condition | 39, `implementation-conformance.csv` |

## What is fully specified for coding agents

- source acquisition for the five producer profiles and the future connector
  seam without hard-coding the platform to five sources;
- typed envelopes, profile schemas, admission, privacy and receipts;
- producer enrollment, certification, expected populations, freshness, gaps
  and source coverage;
- immutable evidence, object-store disposition and lineage;
- deterministic multi-output normalization and partial/unsupported behavior;
- source-scoped identity, deterministic resolver modules, merge/split/alias,
  ambiguity and no-fabrication rules;
- canonical entity, relationship, activity, coverage and reconciliation state;
- transactions, outbox, leasing, fencing, replay, wake/dependency behavior and
  projection generations;
- PostgreSQL authority, object storage evidence and ClickHouse projection
  ownership;
- RBAC/ABAC/ReBAC composition, RLS, existence hiding, field masking, audit and
  authorization revision;
- 45-operation die-v1 contract, cursors, errors, idempotency, exports and
  generated client boundary;
- customer information architecture and UI field lineage;
- performance lanes, budgets, operational telemetry, backups, DR and every
  LG-001..LG-007 release-evidence family;
- clean-code boundaries, transitional-code removal and change control.

## Implementation work still required

[`implementation-conformance.csv`](registers/implementation-conformance.csv)
is authoritative. At freeze time it includes production OIDC/JWKS, manifest
verification, temporal precedence, remaining API operations, typed hydration,
full ABAC/ReBAC, projection lifecycle automation, native certification,
crypto/provider/erasure evidence and operational qualification. These are not
unspecified architecture; they are work and acceptance criteria.

## Explicitly outside this bounded freeze

Enterprise IAM administration as a separate product domain, licensing and
entitlements, policy/enforcement, intelligence/findings, future connector
implementations, Quilr 1 migration/coexistence, customer support operations
and broader company compliance/release management remain separate passes.
Their extension seams are preserved; coding agents must not smuggle them into
the DIE truth model.

## Authorization to build

```text
Complete bounded DIE implementation program: GO

Claim of production acceptance or GA: NO until applicable conformance rows
and LG-001..LG-007 exit evidence pass at the exact release candidate.

Architectural improvisation: NO. Proven contradiction -> ADR and atomic
cross-contract change; otherwise implement the frozen authority.
```

This is the final pre-code architecture closure for the bounded pass. Further
documents may clarify evidence or implementation, but may not silently change
the authority chain.
