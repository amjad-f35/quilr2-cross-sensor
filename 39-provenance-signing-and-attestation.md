# 39. Provenance, signing, and attestation

## Trust statements

- A digest proves content equality under the named algorithm; it does not prove origin.
- A signature proves possession of a key over the signed bytes; it does not by itself prove the signer was authorized.
- A certificate binds claims/identity to a public key under an issuer; it still requires path, time, revocation, identity, and policy validation.
- An attestation binds subject digests to claims.
- Provenance explains where, when, how, and by whom artifacts were produced.
- Deployment/runtime verification proves the approved artifact is the one actually executing.

## Required chain

```text
repository
→ full source revision/tree
→ build invocation
→ builder identity and inputs
→ output artifact digest
→ signature and provenance
→ release manifest
→ deployment record
→ runtime workload and actual digest
```

Any missing edge reduces assurance and can produce a finding.

## Attestation format

Use an in-toto-compatible statement envelope with:

```text
subject names and digests
predicate type
builder/signer identity
build definition and parameters
materials/source
timestamps
signature/transparency/timestamp evidence
verification result and trust policy
```

The target contract is [provenance-record.schema.json](schemas/provenance-record.schema.json). [SLSA 1.2 provenance](https://slsa.dev/spec/v1.2/provenance) defines verifiable information tracing an artifact through its production process.

## Signing choices

Evaluate:

- Sigstore keyless signing for identity-bound ephemeral certificates and transparency records;
- enterprise CA/KMS/HSM-backed signing;
- in-toto attestations for provenance/test/SBOM/certification claims;
- trusted timestamps and transparency logs;
- private transparency infrastructure where public metadata disclosure is unacceptable.

[Sigstore](https://docs.sigstore.dev/cosign/signing/overview/) binds an OIDC identity to an ephemeral key via Fulcio and records signing events in Rekor. Adoption requires an explicit trust-root distribution, certificate identity/issuer policy, transparency/timestamp policy, and offline verification plan.

## Verification policy

For every verification record answer:

1. Which artifact digest and algorithm were verified?
2. Which signature/attestation bytes were evaluated?
3. Which issuer/trust anchor and version were accepted?
4. Which signer/builder claims matched policy?
5. Was the key/certificate valid and unrevoked at the trusted time?
6. Was a transparency inclusion/timestamp verified where required?
7. Was the signer authorized for this product/repository/environment?
8. Did provenance reference the expected source/build definition/materials?
9. Did the release include this exact artifact?
10. Does the deployment/runtime use this exact digest?

A cryptographically valid signature fails policy when the signer is unexpected or unauthorized.

## Attestation types

| Attestation | Subject | Required predicate |
| --- | --- | --- |
| Source provenance | Git/SWH source object | repository/change-control properties |
| Build provenance | Artifact digest | builder, definition, source, parameters, materials |
| Test/evaluation | Artifact or agent/model manifest | suite/version/result/environment |
| SBOM | Artifact digest | SBOM document and generator |
| Vulnerability scan | Artifact digest | scanner/database/result/time |
| Certification | Agent/model/policy/release | certifier, controls, validity |
| Deployment binding | Deployment/workload | artifact/config/tenant/environment |
| Runtime verification | Runtime instance | actual artifact/config and workload attestation |

## Storage

- Operational registry: artifact/build/release/deployment metadata and current verification state.
- Object/evidence store: signed statements, certificates, bundles, transparency proofs, SBOMs.
- Secret manager/HSM: signing/private keys only.
- Analytics: verification events/findings/metrics.

Evidence is content addressed, access controlled, tenant scoped, retained under legal/security policy, and never mutated in place.

## Current-to-target

Current build and deployment machinery is reusable as an observation source. It must be augmented with:

- immutable subject digests;
- authenticated builder/deployer identities;
- generated signed provenance;
- release manifests;
- verification gates;
- runtime digest/attestation checks;
- revocation and trust-policy versioning.

The current per-component support matrix is [provenance-support.csv](matrices/provenance-support.csv).

