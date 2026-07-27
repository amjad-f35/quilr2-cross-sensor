# 28. Canonical identifier strategy

## Decision

Use UUIDv7 for new canonical IDs, prefixed by record class:

```text
entity:0195d7f1-2f64-7c9a-a2d4-73f7d4a90123
id-record:0195d7f1-31a2-7e1d-942c-384401ec6789
claim:0195d7f1-3410-7f55-b260-10d366a53104
```

UUIDv7 provides a standardized time-ordered 128-bit identifier while retaining substantial random bits. It is the database identity only—not authentication, a content digest, or cryptographic proof. See [RFC 9562](https://www.rfc-editor.org/info/rfc9562/).

## Requirements

Canonical IDs are:

- opaque and never reassigned;
- independent of mutable names, owners, credentials, locations, and deployments;
- independent of any single sensor;
- tenant constrained;
- stable through alias and claim changes;
- preserved through merge redirects and split history.

## ID scopes

| Scope | Examples | Rule |
| --- | --- | --- |
| Global catalog | AI product, provider, model family | Separate catalog ID; tenants reference a catalog projection |
| Tenant canonical | Human, account, agent, app, credential, finding | Tenant is mandatory in every lookup and uniqueness key |
| Environment scoped | Deployment, workload policy binding | Tenant+environment+canonical ID |
| Provider scoped | SaaS account, OAuth client, provider model | Provider/issuer/account namespace is mandatory |
| Source scoped | Sensor-native IDs and legacy rows | Never assumed globally unique |
| Execution scoped | Session, run, step, process instance | Cannot identify enduring entity alone |
| Content addressed | Git/SWH source object, OCI/package/manifest | Always record algorithm and object type |

The namespace registry is [identifier-namespaces.csv](matrices/identifier-namespaces.csv).

## Identifier record

Native IDs and aliases use the generalized [identifier record schema](schemas/identifier-record.schema.json):

```json
{
  "identifier_record_id": "id-record:0195d7f1-31a2-7e1d-942c-384401ec6789",
  "tenant_id": "tenant:acme",
  "canonical_entity_id": "entity:0195d7f1-2f64-7c9a-a2d4-73f7d4a90123",
  "entity_kind": "Agent Version",
  "namespace": "git",
  "identifier_type": "commit_oid",
  "identifier_value": "c794c45a...",
  "algorithm": "git-sha1",
  "object_type": "commit",
  "issuer_or_authority": "github:quilrbusiness",
  "source_id": "source:github-connector",
  "first_seen": "2026-07-27T00:00:00Z",
  "last_seen": "2026-07-27T00:00:00Z",
  "valid_from": "2026-07-27T00:00:00Z",
  "valid_until": null,
  "assurance": "authoritative_source",
  "confidence": 1.0,
  "status": "active",
  "proof": null
}
```

## Identifier strength

Automatic merge requires:

1. one exact strong identifier in the same tenant and namespace; or
2. an authoritative source mapping; or
3. multiple independent secondary identifiers with no contradiction and a versioned rule allowing the combination.

Weak names, email, hostname, process filename, model alias, tool name, and image tag create candidates only. The exhaustive classification is [identifier-strength.csv](matrices/identifier-strength.csv).

## Merge, split, and negative identity

Resolution events record:

```text
merged_from / merged_into
split_from
superseded_by / replaced_by
not_same pair
resolution_reason
resolver_version
operator
timestamp
evidence
```

Merge behavior:

- keep the survivor and losing canonical IDs;
- redirect reads from losing IDs;
- recompute claims/relationships/findings without deleting observations;
- block cross-tenant merges structurally;
- preserve event-time canonical references and expose the later resolution.

Split behavior:

- create/reuse the resulting canonical identities;
- assign observations and relationships through an evidence-backed operation;
- preserve the prior merge as history;
- re-evaluate downstream findings, decisions, and metrics;
- never rewrite historical evidence.

## Hash agility and canonicalization

Digests are stored as algorithm+value:

```text
sha256:<hex>
sha512:<hex>
git-sha1:<hex>
git-sha256:<hex>
swhid:<qualified identifier>
```

Structured manifests must define deterministic canonicalization before hashing or signing. This applies to agent, prompt, tool, model, policy, configuration, intent, evidence, relationship-snapshot, and deployment-binding documents.

## API behavior

Identifier lookup requires:

```text
tenant_id
namespace
identifier_type
identifier_value
issuer/authority when applicable
```

Ambiguous matches return candidates, never an arbitrary row. API operations and failure semantics are in [identity-api-catalog.csv](matrices/identity-api-catalog.csv).

