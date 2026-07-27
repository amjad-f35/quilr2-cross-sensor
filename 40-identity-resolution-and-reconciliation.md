# 40. Identity resolution and reconciliation

## Resolution pipeline

```text
source observation
→ validate tenant/source/schema/time/authentication
→ normalize identifiers without discarding originals
→ exact tenant+namespace candidate lookup
→ deterministic matching
→ contradiction evaluation
→ confidence calculation
→ auto-resolve, candidate, conflict, or manual review
→ append resolution event
→ materialize identity/claims/relationships
→ recompute findings and metrics
```

The engine never mutates raw evidence and never searches across tenant boundaries.

## Resolution inputs

- native/provider/directory IDs;
- cryptographic key/certificate fingerprints;
- workload IDs and attestation;
- content and manifest digests;
- domains, bundle/package IDs, repository coordinates;
- account and model-provider IDs;
- artifact provenance and deployment bindings;
- temporal overlap/exclusion;
- ownership, device, and runtime relationships.

## Automatic resolution

Automatic merge requires:

1. an exact strong identifier in the same tenant, authority, and namespace; or
2. an authoritative mapping from an accepted source; or
3. an explicitly approved multi-signal rule whose independent secondary identifiers meet threshold with no contradiction.

Rules are entity specific and versioned in [identity-resolution-rules.csv](matrices/identity-resolution-rules.csv).

## Candidate-only evidence

These never auto-merge alone:

- similar display/application/agent/tool/model names;
- logo or browser title;
- email from unrelated issuers;
- hostname after possible reassignment;
- executable filename;
- endpoint URI;
- container tag/model route;
- temporal proximity without causal/source IDs.

Candidates record the proposed pair/cluster, signals, contradictions, resolver version, confidence, and expiry/review state.

## Contradictions

Contradiction rules override weak matches:

- cross-tenant identity;
- different immutable provider tenant/account IDs;
- personal versus enterprise account proof;
- incompatible bundle/package/code-signing identities;
- different immutable OIDC/SCIM subjects;
- overlapping active device identities that cannot coexist;
- different artifact/model manifest digests under a purported immutable version;
- incompatible providers/object types;
- signed negative-match decision;
- authoritative ownership/lifecycle conflict.

Strong contradictions create `identity.conflict_detected` and a review finding; they do not force an arbitrary winner.

## Confidence and assurance

Resolver confidence considers:

```text
identifier strength
authority
independent corroboration
proof freshness
temporal compatibility
relationship context
contradictions
source health
rule calibration
```

It does not include authentication/attestation assurance as the same numeric field. A claim carries both its categorical assurance and resolver confidence.

## Manual operations

Resolution Center supports:

- merge;
- split;
- link without merge;
- add/end-date alias;
- mark not-same;
- select field authority;
- suppress/expire candidate;
- re-run under a new resolver version;
- undo through a compensating resolution event.

Every operation requires tenant, operator, authentication strength, reason, evidence, before/after state, and idempotency key.

## Merge behavior

1. Select a survivor by durable policy, never by display-name preference.
2. Append `identity.merged`.
3. Redirect the losing canonical ID.
4. Reassign materialized claims/relationships while preserving their source identity.
5. Keep event-time references and provide current-resolution projection.
6. Recompute downstream findings/metrics.
7. Support later split.

## Split behavior

The operator/rule assigns observation groups to resulting identities, end-dates invalid relationships, creates corrected claims, and emits `identity.split`. Historical decisions retain the prior snapshot and are not rewritten.

## Continuous reconciliation

The Identity Reconciler:

- consumes provider change cursors/webhooks;
- schedules risk-based full comparisons;
- tracks source health and cursor age;
- records authoritative deletions separately from silence;
- recomputes freshness/staleness;
- detects missing, extra, changed, and conflicting identities;
- replays materializers deterministically.

A source outage disables deletion inference for that source and opens a coverage finding.

## APIs

Resolve, lookup, observation, identifier, merge/split, verification, federation, delegation, credential, attribution, and access operations are enumerated in [identity-api-catalog.csv](matrices/identity-api-catalog.csv). All:

- authenticate the caller and authorize operation scope;
- require tenant scope;
- support idempotency on writes;
- version schemas and rule/policy inputs;
- preserve evidence/audit;
- expose staleness/unknown state;
- return conflict rather than guessing.

## Storage

| Store | Authoritative content |
| --- | --- |
| PostgreSQL operational ledger | canonical identities, identifiers, claims, state dimensions, merge/split, ownership, grants |
| Relationship ledger/Neo4j projection | membership, ownership, access, delegation, agent/model/tool/workload bindings |
| ClickHouse | observations, identity/auth/runtime events, materialized analytics |
| Object/evidence store | raw observations, attestations, signatures, certificates, provenance, snapshots |
| Secret manager/HSM | secret values, private keys, refresh tokens, signing material |
| Search projection | tenant-scoped aliases/native IDs/fingerprints/names/owners |
| Redis | bounded cache only; never identity/revocation authority without durable source |

The graph is rebuildable from the operational relationship ledger.

