# LG-006 — Cross-Language Cryptographic Conformance

## Frozen algorithms and representations

- JSON canonicalization: RFC 8785 JCS over the exact contract object;
- content digest: SHA-256 with `sha256:` lowercase-hex representation;
- producer/configuration signature: detached JWS object
  `{format, algorithm, key_id, value}`;
- primary algorithm: ES256 with exact protected-header fields and raw JWS
  signature representation;
- EdDSA: certified non-FIPS deployments only;
- nonce/replay: issuer, audience, purpose and expiry scoped central use ledger;
- key identity: stable key ID bound to workload/artifact certification, never a
  raw secret;
- safe integers: absolute maximum `9,007,199,254,740,991`.

## Shared vector corpus

One versioned corpus is generated once and consumed unchanged by Go, Java,
Python, TypeScript and Rust. It includes:

- Unicode normalization edge cases, escaped characters and key ordering;
- positive/negative zero, exponent forms, safe-integer boundaries and rejected
  non-finite/unsafe numbers;
- envelope-without-content-digest plus payload record-digest input;
- complete decompressed batch request digest;
- producer/epoch/base-10 sequence idempotency;
- valid ES256 and allowed EdDSA signatures;
- wrong key/algorithm/header, high-S/noncanonical, truncation and corrupt
  signature negatives;
- stale, reused, wrong-audience and wrong-request-binding nonces;
- configuration generation rollback and expiry;
- cross-sensor assertion issuer/certification/revocation cases;
- receipt and artifact digest cases.

No language may serialize through a generic map whose numeric or key-order
behavior differs from the vector model.

## Harness

Every implementation exposes a small conformance CLI accepting vector JSON and
emitting result JSON. A matrix runner compares:

1. canonical bytes;
2. digest bytes/text;
3. protected header;
4. signing input;
5. signature verification result;
6. replay/rollback decision; and
7. exact error code.

Fuzz/property testing generates equivalent JSON representations and malformed
inputs. Differential results fail the gate.

## Key lifecycle and security

Vectors do not contain production private keys. Test keys are corpus-scoped.
Production design requires HSM/KMS or OS-keystore-backed keys, rotation with
overlap, revocation propagation, audit, least-privilege signing and explicit
FIPS posture.

## Closure

All `LG006-*` rows pass in every language/toolchain used by a supported
artifact. The corpus digest, CLI binaries/modules and matrix report bind to the
candidate release. One-language success or library unit tests do not close the
gate.
