# 36. Secrets, credentials, certificates, and keys

## Required distinctions

| Object | Meaning |
| --- | --- |
| Secret record | Managed container for confidential material |
| Secret version | One immutable version of secret material |
| Credential | Material presented to authenticate or exercise authority |
| Grant | Authority associated with a subject/credential |
| Token | Encoded credential or authorization artifact |
| Key | Cryptographic key material |
| Certificate | Signed binding between an identity and public key |
| API key | Provider-issued bearer-like credential |
| OAuth client | Registered software identity |
| OAuth grant | User/system authorization relationship |
| Access token | Short-lived authority credential |
| Refresh token | Credential used to obtain access tokens |
| Session | Authenticated interaction state |

These objects have different owners, issuers, validity, revocation, and evidence. They cannot share one “secret” row.

## Current evidence

The supplied systems use or reference bearer/JWT tokens, access/refresh tokens, API keys, provider credentials, auth/session cookies, encryption/signing material, Vault/secret configuration, database/broker credentials, and local credential storage.

Important verified risks include browser-held auth material without all desired cookie flags on the primary path, plaintext Persona token storage/logging in Sentinel paths, committed/default credential/encryption material in gateway paths, and incomplete production rotation/injection evidence. These are source-specific findings, not proof that every deployment shares one behavior.

Evidence: [Quilr security model](../../quilr-platform-analysis/12-security-model.md), [browser security model](../../Browser-extension-sensor-analysis/outputs/repository-analysis/12-security-model.md), [gateway security model](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/12-security-model.md).

## Secret inventory

Never store secret values in the canonical inventory. Store:

```text
secret ID
manager and native resource ID
secret version
tenant/environment
owner, purpose, and consumers
issuer
created/rotated/expires/last-used/revoked times
classification
rotation policy
storage compliance
evidence references
```

The exact metadata contract is [secret-metadata.csv](matrices/secret-metadata.csv). Secret values and private keys remain in the approved secret manager/HSM.

## Safe correlation

Do not create a plain unsalted hash of low-entropy secret values. If cross-source correlation is necessary and approved:

```text
tenant-specific protected HMAC key
→ HMAC(secret material)
→ protected correlation index
```

The HMAC key is versioned and protected; access to the correlation index is restricted. Prefer provider key IDs and secret-manager resource/version IDs.

## Credential metadata

Capture:

```text
credential ID and type
issuer
subject and actor
audience/resource
scope and authorization_details
key/sender binding
issue/expiration/lease
parent grant/delegation
revocation
last use
storage location
owner and consumers
```

The complete inventory is [credential-types.csv](matrices/credential-types.csv).

## Tokens and API keys

- Never use the raw bearer token as an identifier.
- Prefer issuer+subject+audience+client/authorized party+token ID+confirmation key+time/scope metadata.
- Retain only a provider key ID, safe prefix, or protected fingerprint for API keys.
- Shared keys must enumerate every consumer and produce attribution findings.
- Long-lived credentials require exception, owner, review, rotation, and compensating controls.
- Sender-constrain high-risk OAuth tokens using mTLS or DPoP when feasible; DPoP proves key possession but does not replace authorization.

## Key and certificate identity

A `kid` is not globally unique. Normalize:

```text
JWK thumbprint + algorithm
public-key fingerprint
certificate issuer + serial + fingerprint
KMS resource + key version
HSM object ID
SSH/TPM public-key fingerprint
```

[RFC 7638](https://www.rfc-editor.org/info/rfc7638/) defines deterministic JWK thumbprints. Symmetric key material and derived identifiers require stricter confidentiality.

Key purposes remain separate:

- signing;
- encryption;
- key encryption;
- TLS;
- token signing;
- workload identity;
- artifact signing;
- device attestation;
- user authentication.

## Cryptographic trust

Every verification record states:

```text
algorithm/key type
key/certificate identity
issuer/subject/SAN/serial
not-before/not-after
trust anchor and policy version
revocation result
verification time and verifier
signature/subject digest
```

Trust-anchor families include enterprise CA, SPIFFE bundles, OIDC/SAML/cloud issuers, artifact signing authorities, KMS/HSM, device attestation, TLS PKI, transparency logs, and timestamp authorities.

## Encryption identity

Evidence records contain only:

```text
encryption algorithm
data-encryption-key reference
key-encryption-key resource/version
key manager
rotation/re-encryption status
```

They never contain private or secret key material.

