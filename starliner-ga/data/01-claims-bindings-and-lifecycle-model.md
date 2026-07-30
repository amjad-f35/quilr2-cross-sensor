# Claims, Bindings, and Lifecycle Data Model

Status: **normative logical model**

## Source object

Required logical fields:

```text
source_object_id
tenant_id / environment_id
source_installation_id / profile
source_object_type
native_namespace / native_id
source_epoch / source_revision
first_observed / last_observed / last_confirmed
source_lifecycle_state
privacy / retention
latest_evidence_id
```

The uniqueness boundary is tenant, source installation, namespace, native ID, and epoch according to the profile.

## Claim

```text
claim_id
claim_kind: identifier | attribute | relationship_candidate | lifecycle
subject_source_object_id
predicate
typed_value
issuer/source
authority_class
valid_from / valid_until
system_from / system_until
observed_at / ingested_at
normalizer_version / catalog_version
evidence_id
status
parsing_quality
privacy / retention
```

Claims are append-only. Supersession closes system validity through a ledger mutation; evidence remains unchanged.

## Binding

A binding links a source object to a canonical entity:

```text
binding_id
source_object_id
canonical_entity_id
resolution_context
decision_id
confidence
valid_from / valid_until
system_from / system_until
status
```

Statuses: proposed, active, deferred, disputed, superseded, rejected.

## Resolution decision

```text
decision_id
decision_type: create | link | merge | split | defer | reject | not_same
candidate/source/canonical IDs
supporting and conflicting claim IDs
rule/model/catalog versions
confidence components
actor: system | user
reason codes and explanation
downstream impact manifest
created_at
supersedes_decision_id
```

## Canonical entity version

```text
canonical_entity_id
entity_class
entity_version
tenant/environment
lifecycle_state
display projection
material field values with selected claim IDs
conflict summary
first/last observed
valid/system time
created_by_decision
```

The display projection is not an unproven source of truth; it records selected claims.

## Merge

Merge creates a successor entity or selects a durable survivor according to the ID policy. It:

- closes predecessor active bindings/versions;
- records predecessor/successor aliases;
- rebinds claims through the decision;
- queues downstream impact;
- preserves API redirects where authorized;
- retains a reversible boundary.

## Split

Split creates or restores successors, assigns source objects/claims, recomputes fields and relationships, restates findings/metrics, and retains the erroneous merge in audit history.

## Source deletion and retirement

```text
source delete/tombstone
  -> close applicable source claims
  -> recalculate bindings and entity coverage
  -> keep entity if other claims or retention support it
  -> lifecycle policy may mark inactive/retired
  -> purge only under retention/legal-hold workflow
```

## Index and integrity needs

- unique active source-object identity within source scope;
- unique canonical entity ID per tenant;
- exclusion/uniqueness preventing overlapping active bindings where prohibited;
- evidence foreign-key/reference integrity;
- bitemporal query indexes;
- decision and impact indexes;
- privacy/retention partition indexes;
- no foreign key crossing tenants.

Physical DDL is owned by the implementation and must pass these logical invariants.
