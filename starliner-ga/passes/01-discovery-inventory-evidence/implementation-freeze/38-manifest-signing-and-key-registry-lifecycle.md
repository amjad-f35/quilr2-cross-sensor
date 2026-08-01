# Manifest Signing and Key-Registry Lifecycle

**Status:** FROZEN addendum; frozen 2026-08-01; closes the operational
signing contract the implementation ledger marked
`OPEN (no frozen key-registry contract; activation still SQL in tests)`

**Scope:** the trusted signer key registry for manifest verification, key
identity and fingerprint format, rotation with overlap, revocation and
compromise semantics, verifier cache freshness bounds, fail-closed outage
behavior, the maintenance role's end-to-end signed-bootstrap verification
including the frozen audit-row contents, and the exact permitted use of
unsigned manifests. This addendum extends
[protocol and source profiles](02-protocol-and-source-profiles.md)
(§Small common envelope signature format, §Producer enrollment and
certification), the signed manifest schemas
([producer enrollment](schemas/producer-enrollment-manifest.schema.json),
[tenant bootstrap](schemas/tenant-bootstrap-manifest.schema.json)),
[physical data and storage](03-physical-data-and-storage.md)
(§PostgreSQL schemas, `die_control`),
[authorization and audit](07-authorization-and-audit.md)
(§Scope and relationship model, tenant-root bootstrap), and the key-lifecycle
requirements of
[LG-006 cross-language crypto](production-readiness/06-lg006-cross-language-crypto.md).
The JCS/JWS wire format, algorithms and fail-closed verification rules frozen
in 02 are unchanged; this addendum freezes where trust lives and how it
moves.

## Signed surfaces covered

The registry governs verification trust for exactly these detached-JWS
surfaces:

1. tenant bootstrap manifests (`starliner.tenant-bootstrap.v1` and the
   declarative `starliner.bootstrap.v1` applied by the maintenance role);
2. producer enrollment/revocation/certification manifests
   (`apply`/`revoke`/`certify`, 02);
3. signed Edge Runtime configuration generations (02).

Cross-sensor assertion issuers keep their own producer/issuer ledger
(02/03); KMS/HSM audit-checkpoint signing (07) keeps its own environment key
configuration. Neither is re-keyed by this registry.

## Signer key registry

Trusted manifest-signing keys live in `die_control.manifest_signer_key`,
release-managed like source-profile authority: rows are written by immutable
release migrations or by the controlled `die_control_admin` path, never by
runtime workers or the API (03 §writer table). Frozen row semantics:

| Field | Frozen meaning |
|---|---|
| `key_id` | unique verification handle ≤ 512 chars; byte-equal to the manifest `signature.key_id` and protected-header `kid`; never reused across distinct key material |
| `algorithm` | `ES256` or `EdDSA` (02); ES256 mandatory, EdDSA only under a certified non-FIPS profile |
| `public_jwk` | public key as a JWK containing only public members (`kty`,`crv`,`x`,`y` for EC; `kty`,`crv`,`x` for OKP); private members fail closed |
| `fingerprint` | `sha256:` + lowercase hex of the SHA-256 over the RFC 7638 JWK-thumbprint input (the JCS-compatible canonical form of the required public members); recorded in every verification audit row |
| `state` | `pending` → `active` → `retiring` → `retired`, or terminal `revoked` / `revoked_compromised` |
| `manifest_kinds` | subset of the three signed surfaces this key may verify |
| `environment` / `tenant_scope` | environment binding plus optional tenant restriction; a key never verifies outside its scope |
| `not_before` / `not_after` | validity window checked at verification time |
| provenance | issuer, creation/rotation audit references; private keys are HSM/KMS or OS-keystore backed (LG-006) and never enter the registry, a manifest, or a repository |

State semantics, frozen: `pending` never verifies and never signs — it
exists so distribution precedes activation. `active` verifies and is the only
state that may sign new manifests. `retiring` verifies but must not sign.
`retired`, `revoked` and `revoked_compromised` never verify new
applications. Exactly one key per `(environment, manifest kind, tenant
scope)` is `active` at a time.

## Rotation

Rotation is overlap plus re-issuance. The frozen manifest schemas carry
exactly one `signature` object, so dual-signing is **not** part of v1;
introducing multiple signatures requires a new manifest schema major
version.

1. Add the successor key as `pending` (audited registry change; distribute to
   verifiers/edge trust anchors).
2. In one registry transaction: successor `pending → active`, predecessor
   `active → retiring`. From this commit, new manifests sign only with the
   successor.
3. Overlap window: the predecessor stays `retiring` at least as long as the
   longest unexpired manifest validity for its kinds, so every manifest
   signed before rotation verifies through its own expiry. Default 30 days;
   ceiling 90 days.
4. A manifest whose needed validity outlives the retiring key is re-issued
   under the active key with a new `manifest_id` and the next monotonic
   revision — the ordinary optimistic-revision `apply` from 02. Generation
   numbers and enrollment revisions never move backward for rotation.
5. After the window: `retiring → retired` (audited). Verification with a
   retired key fails closed; history and audit rows referencing it remain.

Edge Runtime trust anchors rotate through the already-frozen signed
configuration channel: a configuration generation that replaces edge trust
anchors is itself signed by a currently trusted key, and generation
monotonicity (02) prevents rollback. The edge never fetches signing keys
over the open network at verification time.

## Revocation

- **`revoked` (routine distrust):** effective at registry commit. Every
  later verification against the key fails closed and is security-audited.
  Manifests already applied remain applied: their effects are durable,
  audited control-plane rows, and trust state changes only through new
  signed operations (02 — revocation does not delete evidence).
- **`revoked_compromised`:** everything above, plus a mandatory remediation
  obligation:
  1. enumerate from audit every manifest whose verification row references
     the key fingerprint within its validity window (the audit row contents
     below make this query exact);
  2. within the remediation window — default 7 days, configured ≤ 30 —
     re-issue affected producer enrollments/certifications under a trusted
     key with advanced revisions; producers not re-issued in time have trust
     suspended before subsequent ingest authorization (02 revocation
     semantics);
  3. tenant roots are never recreated: root replacement remains an invariant
     violation (07). A tenant bootstrapped under a compromised key keeps its
     root; the remediation record is a new audited, signed administrative
     operation, and every producer/authorization fact introduced by the
     affected manifest is re-verified or re-issued.
- Revocation is never expressed by deleting a registry row; registry rows
  are append-preserved state transitions with audit.

## Verifier cache freshness

- The registry's PostgreSQL state is the verification authority. In-process
  verifier caches of the key set are bounded to **60 seconds**; a
  verification that would rely on a cache entry older than that re-reads the
  registry.
- There is no fallback allowlist: registry unreadable → no manifest
  application, no enrollment change, no configuration signing acceptance —
  fail closed with an operator alert. Already-applied state keeps serving;
  nothing new is trusted during the outage.
- Revocation therefore propagates to central verifiers within one cache
  bound (≤ 60 s). Edge devices converge at their next signed-configuration
  acceptance; the platform never treats an edge as having accepted a
  post-revocation manifest because central admission re-verifies (edge trust
  is defense in depth, central verification is authority).

## Maintenance bootstrap: end-to-end verification

Input: manifest bytes, detached `signature` object (`format`, `algorithm`,
`key_id`, `value`), and the registry. Frozen algorithm — every step fails
closed and steps never reorder:

1. parse as I-JSON; reject duplicate keys, non-finite numbers, unsafe
   integers (02);
2. schema-validate against the exact manifest schema version named by the
   document;
3. remove the top-level `signature` member; serialize the remainder with
   RFC 8785 JCS;
4. resolve `signature.key_id` in `die_control.manifest_signer_key` for the
   manifest kind, environment and tenant scope: state must be `active` or
   `retiring`, the verification time inside `not_before`/`not_after`, and
   the key's `algorithm` byte-equal to `signature.algorithm`;
5. decode the protected header: exactly `alg`, `kid`,
   `typ:"application/quilr+jcs"`; `alg`/`kid` byte-equal to the outer
   `algorithm`/`key_id`; `crit`, `b64:false`, unknown members, embedded key
   material fail closed (02);
6. verify the detached JWS over
   `ASCII(protected) + "." + BASE64URL(JCS payload bytes)` with the
   registry's `public_jwk`;
7. manifest semantic checks (02): unexpired `issued_at`/`expires_at`, tenant
   match, scope/environment match, monotonic revision, unreplayed
   `manifest_id`, artifact/certification digest match, passing unexpired
   certification;
8. apply the one idempotent control-plane transaction (landed: identical
   replay is a no-op, any same-ID content difference fails closed);
9. write the immutable verification audit row **after** the apply and
   projection declaration succeed (landed audit-last ordering), so the audit
   row's existence proves the complete apply.

Frozen audit-row contents for every verification attempt — success and
failure:

```text
tenant_id
manifest_id + manifest kind + schema version
manifest_digest            (sha256: over the exact received bytes)
issuer
signer key_id + key fingerprint + algorithm
verification_result        (verified | exact fail-closed code | unsigned_dev)
verifier artifact digest
applied effects            (root scope / enrollment revisions / generation), empty on failure
verified_at / applied_at
```

Failure rows apply nothing and are security-audited; replayed `manifest_id`
after a key rotation remains a replay (the replay ledger is keyed by
manifest identity, not by key).

## Unsigned manifests

An unsigned manifest — missing signature, or verification explicitly
disabled — is a development and test convenience only. Frozen boundaries:

- **Permitted:** local development, compiled test harnesses, and
  single-operator preprod verticals on private networks without customer
  data, and only when the deployment sets the explicit
  `insecure_dev` manifest-verification mode in its configuration.
- **Production and preprod fail closed:** the startup guard refuses a
  production-class configuration whose manifest verification is absent or
  `insecure_dev`, exactly as the identity startup guard refuses symmetric
  JWT ([OIDC/JWKS addendum](37-oidc-jwks-and-runtime-session-lifecycle.md)).
- Every unsigned application is audited with
  `verification_result = unsigned_dev`; an environment cannot both apply
  unsigned manifests and claim any `LG-*` production gate.
- The landed maintenance bootstrap path — which records `issuer` and
  `signer_key_id` but does not yet verify — is this dev/test mode by
  definition; production activation of the maintenance bootstrap requires
  steps 1–9 above implemented and tested.

## Outage and failure matrix

| Failure | Frozen behavior |
|---|---|
| registry unreachable | no new manifest verifies; enrollment/bootstrap/config changes stop; applied state keeps serving; alert |
| `kid` unknown | fail closed; no fallback key search by fingerprint or algorithm |
| key expired / `pending` / `retired` / revoked | fail closed; security audit |
| algorithm substitution or header mismatch | fail closed (02); security audit |
| replayed `manifest_id` | fail closed (02), including across rotations |
| HSM/KMS signing unavailable | new manifests cannot be issued; verification of existing manifests is unaffected |

## Required tests

Beyond the frozen suites in
[verification](11-testing-conformance-and-release-gates.md) and the LG-006
vector corpus:

- rotation: predecessor-signed manifest verifies during overlap and fails
  after retirement; successor signs from activation; sign-with-`retiring`
  rejected;
- revocation: immediate distrust at commit; compromise enumeration query
  returns exactly the affected manifests by fingerprint; remediation-window
  suspension;
- registry scope: wrong environment, wrong tenant scope, wrong manifest
  kind, `pending` key, validity window edges;
- verification order: each step 1–9 fails closed independently; audit row
  written on every path with the exact result code; apply-before-audit
  ordering;
- unsigned mode: production startup refusal; `unsigned_dev` audit rows in
  permitted environments;
- cache: revocation observed within the 60-second bound; registry outage
  fail-closed behavior.
