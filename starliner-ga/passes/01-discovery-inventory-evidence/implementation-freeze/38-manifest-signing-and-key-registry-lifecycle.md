# Manifest Signing and Key-Registry Lifecycle

**Status:** FROZEN addendum; frozen 2026-08-01; closes the operational
signing contract the implementation ledger formerly marked
`no frozen key-registry contract; activation still SQL in tests`

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
2. producer enrollment/credential-rotation/revocation/certification manifests
   (`apply`/`rotate`/`revoke`/`certify`, 02), each as an exact discriminated
   payload with no stale fields from another operation arm;
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
| `manifest_kind` | exactly one of the three signed surfaces this key may verify; different kinds use separate key IDs even when backed by the same HSM policy |
| `environment` / `tenant_id` | required environment and tenant binding; a key never verifies outside that exact scope |
| `not_before` / `not_after` | validity window checked at verification time |
| provenance | issuer, creation/rotation audit references; private keys are HSM/KMS or OS-keystore backed (LG-006) and never enter the registry, a manifest, or a repository |

State semantics, frozen: `pending` never verifies and never signs — it
exists so distribution precedes activation. `active` verifies and is the only
state that may sign new manifests. `retiring` verifies but must not sign.
`retired`, `revoked` and `revoked_compromised` never verify new
applications. Exactly one key per `(tenant_id, environment, manifest_kind)`
is `active` at a time. Tenant scoping is deliberately mandatory: a platform
root may provision equivalent public material into many tenants, but it does
so with distinct tenant-scoped key IDs and audit rows so no global key row
becomes an accidental cross-tenant authority.

The machine contract is
[`manifest-signer-key.schema.json`](schemas/manifest-signer-key.schema.json).
The normative DDL now defines `die_control.manifest_signer_key`, its partial
single-active index, controlled state-transition trigger, append-only
`manifest_signer_key_version` history (a transition requires an explicit
`app.change_reason`), RLS policy and least-privilege grants.

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
5. decode the protected header: exactly the operation's frozen `typ`, `alg`,
   `kid`, `b64:false`, and `crit:["b64"]`; `alg`/`kid` byte-equal to the
   outer `algorithm`/`key_id`; unknown members and embedded key material fail
   closed (02);
6. verify the detached JWS over
   `ASCII(BASE64URL(protected)) + "." + JCS payload bytes` with the registry's
   `public_jwk` (RFC 7797 unencoded payload);
7. manifest semantic checks (02): unexpired `issued_at`/`expires_at`, tenant
   match, scope/environment match, monotonic revision, unreplayed
   `manifest_id`, artifact/certification digest match, passing unexpired
   certification;
8. the isolated verifier appends immutable verification evidence with
   `applied_at = null`; it cannot register keys or apply effects;
9. control administration applies only the retained operation-specific effects
   and then sets the existing row's sole mutable field, `applied_at`, in the
   same transaction. It cannot insert verification evidence or register keys.

Frozen audit-row contents for every **tenant-resolved** verification attempt
— success and failure — live in immutable
`die_control.manifest_verification`:

```text
tenant_id
manifest_id + manifest kind + schema version
received_document_digest   (sha256: over the exact received signed bytes)
canonical_payload_digest   (sha256: over the RFC 8785 unsigned payload bytes)
protected-header + signature digests
issuer
signer key_id + immutable key revision + key fingerprint + algorithm
verification_result        (passed | exact fail-closed code)
verifier artifact digest
operation-specific applied effects (exact key set), empty on failure
verified_at / applied_at
```

Failure rows apply nothing and are security-audited; replayed `manifest_id`
after a key rotation remains a replay (the replay ledger is keyed by
manifest identity, not by key).

Malformed bytes that cannot safely yield a tenant or manifest kind never
enter a tenant table. They are rejected before apply and emitted to the
platform security telemetry/quarantine channel with byte digest, verifier
artifact and fail-closed code. Once tenant identity is schema-resolved, every
attempt must have a database audit row; an implementation must not use the
pre-tenant exception to omit ordinary signature failures.

## Unsigned documents

Unsigned documents never enter the manifest-application pipeline in any
environment. Local tests may construct state with explicitly labelled fixture
loaders, but that state is not an enrollment-manifest application, cannot
create a `passed` `manifest_verification`, and cannot be promoted or reused as
preprod/production evidence. Production and preprod startup fail closed when
the verifier/key registry is absent. There is no `unsigned_dev` verification
result and no unsigned path to `applied_at`.

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
- unsigned input: rejection before effects in every environment; test fixtures
  remain out-of-band and non-promotable;
- cache: revocation observed within the 60-second bound; registry outage
  fail-closed behavior.
