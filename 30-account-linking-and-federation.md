# 30. Account linking and federation

## Account linking

Account linking produces relationships, not destructive replacement:

```text
Person
├─ HAS_EMPLOYMENT → Employment Relationship
├─ HAS_ACCOUNT → Okta Account
├─ HAS_ACCOUNT → Entra Account
├─ HAS_ACCOUNT → GitHub Account
├─ HAS_ACCOUNT → Slack Account
└─ HAS_ACCOUNT → Google Workspace Account
```

Each account retains its provider-native identity, lifecycle, roles, sessions, and evidence.

## Matching rules

1. Exact provider/issuer-scoped immutable IDs resolve the account, not necessarily the person.
2. An authoritative HRIS/directory crosswalk can link accounts to a person.
3. Provider-verified account-link claims may link pairwise OIDC subjects.
4. Matching email can create a candidate only unless an authoritative source guarantees its uniqueness and non-reassignment for the evaluated interval.
5. Personal and enterprise provider accounts remain distinct even when used by the same person.
6. Negative-match decisions prevent a weak future rule from recreating a rejected link.
7. All links are bitemporal and reversible.

The executable rule matrix is [human-account-linking.csv](matrices/human-account-linking.csv).

## Pairwise subject handling

OIDC pairwise subjects can differ by sector/client while representing the same provider account/person relationship. The resolver must not infer equivalence from similar claims. It requires:

- authoritative provider mapping;
- directory/SCIM crosswalk;
- or an explicitly approved tenant mapping with evidence.

Issuer migration creates a new issuer-scoped identifier and a verified migration relationship; it does not silently rewrite the former identifier.

## Federation object

Every federation is a first-class identity:

```text
federation_id
tenant_id
federation_type
local trust domain
remote issuer/trust domain
trust anchors
accepted audiences
subject mapping
claim mapping
permitted entity types
effective interval
metadata/bundle version
owner
last verified
status
```

The normative contract is [federation.schema.json](schemas/federation.schema.json).

## Federation types

| Type | Identity anchor | Continuous checks |
| --- | --- | --- |
| Human OIDC | Issuer metadata, JWKS, issuer+subject, audience | Metadata/JWKS change, audience, signing algorithm, claim mapping |
| SAML | Entity ID, signed metadata, NameID policy | Certificate/metadata expiry and mapping change |
| SPIFFE | Local/remote trust domains and bundles | Bundle rotation, trust-domain authorization, SVID validation |
| Cloud workload | Cloud issuer, subject, audience, account/project | Issuer keys, subject conditions, audience, role policy |
| Kubernetes-to-cloud | Cluster issuer, namespace/service account/pod conditions | Projected-token issuer/audience and trust mapping |
| CI/CD-to-cloud | Workflow/repository/ref/environment claims | Workflow identity, branch/environment protection, audience |
| SaaS OAuth | Authorization server, client registration, provider tenant/account | Issuer metadata, client/grant status, consent/scopes |

## Trust boundaries

- Production and non-production use separate trust domains or equivalently isolated trust roots/policies.
- Federation acceptance is tenant and environment scoped.
- Accepted audiences are explicit and as narrow as practical.
- Subject/claim mapping is versioned and tested against collision cases.
- A valid remote credential proves only the accepted remote identity; local authorization still applies.
- Federation deletion/revocation blocks new credentials and defines the treatment of active sessions/grants.

## Continuous federation lifecycle

```text
configured
→ verified
→ active
→ metadata_changed / bundle_rotated
→ reverified or degraded
→ expired / revoked
```

Emit federation events for creation, metadata change, trust-bundle rotation, failed verification, expiration, and revocation. A failed refresh does not automatically replace the last known valid trust material, but it does produce a material finding and can fail closed for new authentication under tenant policy.

## Product surface

Federation & Trust shows:

- issuer/trust domain and type;
- owner and tenant/environment;
- accepted audiences and subject mappings;
- trust-anchor/bundle versions;
- last successful verification;
- key/bundle rotation;
- dependent identities, grants, and workloads;
- degraded, expired, and revoked state.

Cryptographic internals are available in evidence drill-down, not the default view.

