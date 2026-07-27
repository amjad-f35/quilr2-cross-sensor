# 27. Identity taxonomy

## Required vocabulary

| Term | Meaning |
| --- | --- |
| Entity | A real or logical thing modeled by Quilr |
| Identity | Quilr’s continuing representation of one entity across time and sources |
| Identifier | A value used to refer to an identity |
| Canonical ID | Quilr’s durable, opaque internal identifier |
| Native ID | Identifier assigned by an external source |
| Alias | Alternate identifier, name, domain, path, or label |
| Observation | A statement that a source saw something |
| Claim | An assertion about an entity or attribute |
| Proof | Evidence supporting a claim |
| Authentication | Verification that a presenter controls or represents an identity |
| Attestation | Signed evidence about identity, runtime, artifact, or environment properties |
| Authorization | Determination of what an identity may do |
| Credential | Material or token used to authenticate or exercise authority |
| Secret | Confidential material requiring protected storage |
| Grant | Authority issued to a subject |
| Delegation | Authority passed from one subject to another |
| Impersonation | Acting as another subject without preserving a distinct actor chain |
| Attenuation | Narrowing delegated authority |
| Federation | Accepting identity from another trust authority |
| Provenance | Verifiable history of origin and production |
| Attribution | Identifying initiating, approving, executing, and effective identities |
| Ownership | Accountability; never authentication proof |
| Assurance | Strength of evidence supporting a claim |
| Confidence | Resolver certainty that observations refer to the same entity |
| Freshness | Recency of claim confirmation |
| Revocation | Explicit invalidation of identity, credential, grant, or trust |

## Identity dimensions

Every entity can possess distinct:

```text
canonical identity
provider-native identity
source-observation identity
display identity
account identity
credential identity
cryptographic-key identity
artifact identity
deployment identity
runtime identity
session identity
run identity
authority identity
ownership identity
provenance identity
```

These are related through typed relationships; none should be reused as the primary key for another dimension.

## Invalid collapses

- email ≠ human identity
- API key ≠ agent identity
- service account ≠ workload instance
- agent name ≠ agent version
- agent version ≠ deployment
- deployment ≠ workload
- model name ≠ model version
- model version ≠ endpoint
- model artifact ≠ serving workload
- product ≠ tenant subscription/account
- tenant account ≠ user account
- container tag ≠ artifact
- Git branch/tag ≠ immutable source revision
- Git commit ≠ built artifact
- artifact digest ≠ signer
- certificate serial without issuer ≠ globally unique certificate/key
- sensor name ≠ authenticated sensor instance
- request ID ≠ actor identity

## Canonical entity evaluation

All 54 canonical entity types from the base architecture have been evaluated. The identity addendum also makes 64 previously implicit layers first class—including person/employment/accounts, browser/device/runtime layers, agent/model sublayers, OAuth grants, repositories/builds/artifacts/releases, secret/key/certificate/trust objects, attestations/provenance, and policy versions/deployments. All 118 types are evaluated against:

- current identifier and source;
- stability/reassignability;
- proof available now;
- target canonical ID;
- strong and weak identifiers;
- field/source authority;
- lifecycle;
- current availability classification.

The exhaustive matrix is [identity-types.csv](matrices/identity-types.csv). The builder asserts the complete 54-type base set from [canonical-entities.yaml](schemas/canonical-entities.yaml) and adds the explicit identity-extension set to the identity schemas, resolution rules, and migration matrix.

## Principal taxonomy

Human and non-human principals must remain separate:

```text
Person
├─ employment relationship
├─ directory/IdP account
├─ SaaS/local/privileged account
└─ authenticated session

Non-human principal
├─ agent definition and version
├─ workload/service principal
├─ OAuth/API client
├─ connector/sensor/enforcement point
├─ CI/build/deployment identity
└─ database/robot/webhook identity
```

The complete required non-human inventory is [non-human-identities.csv](matrices/non-human-identities.csv).

## Assurance versus confidence

Assurance answers “how strongly is this claim proven?”:

```text
claimed
→ observed
→ correlated
→ authoritative record
→ cryptographically authenticated
→ runtime attested
→ hardware attested
```

Confidence answers “how likely is it that these observations describe the same entity?” on a bounded resolver scale. A cryptographically authentic observation can still be linked to the wrong canonical entity with low confidence; a high-confidence catalog match may still lack runtime attestation.

## Claim record

Every canonical attribute is a claim record:

```text
claim_id
canonical_entity_id
field
value
source
source_native_field
observed_at
valid_from / valid_until
authority_level
assurance
proof_reference
confidence
resolver_version
```

The target identity does not expose a single unqualified “truth” field without retaining the winning claim and competing claims.

## Authority is field-level

The platform must not name one source authoritative for an entire entity. HRIS may own employment state, IdP authentication identity, endpoint runtime process, catalog product metadata, provider model IDs, build system artifact digests, and explicit assignment business ownership. The full policy is [field-authority.csv](matrices/field-authority.csv).
