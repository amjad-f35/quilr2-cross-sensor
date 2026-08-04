# Ingest, Normalization, and Resolution

Status: **normative processing behavior**

## Admission state machine

```text
received
→ authenticated
→ tenant_routed
→ schema_validated
→ privacy_validated
→ idempotency_checked
→ durably_admitted
→ accepted | duplicate

any validation stage
→ retryable_rejection | permanent_rejection | quarantine
```

`accepted` requires durable evidence metadata, immutable payload/reference, and an available processing handoff. It does not imply normalization or product visibility.

## Admission verification

- trusted tenant/environment routing;
- producer/workload enrollment and revocation;
- exact source profile/capability/artifact certification;
- schema and compatibility;
- canonical JSON/integrity where applicable;
- size, cardinality, timestamp and sequence bounds;
- privacy disposition and prohibited-field canaries;
- object reference integrity;
- idempotency and conflicting duplicate detection;
- regional/residency class;
- rate/quota and abuse controls.

Permanent rejection is observable to the producer and operator. Poison records do not retry forever.

## Evidence acknowledgement

Per record:

- `accepted`
- `duplicate_same`
- `duplicate_conflict`
- `retryable`
- `rejected_schema`
- `rejected_profile`
- `rejected_identity`
- `rejected_tenant`
- `rejected_privacy`
- `rejected_size`
- `quarantined`

The receipt contains no sensitive body echo. Edge deletion/sealing requires a verifiable `accepted` or `duplicate_same`.

## Normalization

Normalizers:

- interpret one source profile and subtype;
- preserve source-native identifiers and claim scope;
- generate source objects, claims, lifecycle observations, activity candidates, and coverage observations;
- use pinned catalog/normalizer versions;
- distinguish configured from observed;
- distinguish source decision from central decision;
- preserve absence/gap/snapshot completeness;
- never mint canonical IDs;
- never emit admitted findings;
- never silently discard unknown fields.

Unknown compatible fields remain retained in immutable evidence and generate drift telemetry. Unsupported meaning is explicit.

## Source snapshots and deletion

Snapshot protocol:

```text
snapshot_begin(scope, expected semantics)
→ page records
→ snapshot_complete(count/checksum/cursor)
```

Only a complete authorized snapshot can close missing source claims. Partial, timed-out, unauthorized, or inconsistent snapshots degrade coverage and retain prior state.

Event-only sources never infer deletion from silence.

## Resolution

The resolver consumes:

- normalized identifiers and claims;
- catalog identities;
- approved enterprise bridges;
- current bindings and negative constraints;
- source assurance/capability;
- valid/system time;
- source lifecycle;
- legacy aliases;
- operator corrections.

Possible decisions:

- create canonical entity;
- link source object to existing entity;
- defer unresolved;
- mark not-same;
- propose review;
- merge;
- split;
- rebind after correction/reuse;
- close binding/claim.

Each decision records rule/model/version, inputs, explanation, confidence, impact, time, and actor.

## Field authority

Examples:

- catalog may own normalized product/vendor identity;
- endpoint directly owns observed artifact/package/version on a covered device;
- browser owns observed web origin/surface;
- LLM Gateway owns routed provider/model/account/request metadata;
- MCP Gateway owns its registry and routed invocation;
- IdP/HR/CMDB may own person/team/device/owner fields when included;
- user/operator assertion owns only its approved assertion class;
- last observed user never becomes owner.

Legacy-value authority and fallback selection are defined only when the
separate migration track submits a certified legacy evidence profile. Bounded
DIE neither imports those values nor compares them with Quilr 1.

## Activity correlation

Correlation is conservative and versioned. Inputs may include:

- exact propagated request/operation ID;
- authenticated workload and actor chain;
- provider request ID;
- browser/native operation ID;
- endpoint process/session/boot identity;
- MCP request/session ID;
- actual causal trace context;
- bounded time and target agreement.

Name/time similarity alone cannot merge activities. Low-confidence candidates remain separate and may share a correlation group without becoming one execution.

## Failure behavior

- ingest unavailable → edge WAL retains evidence;
- normalizer unavailable → evidence backlog grows, canonical state remains;
- resolver unavailable → normalized backlog grows, no source canonical IDs;
- catalog unavailable → use pinned valid version or defer;
- canonical transaction conflict → retry idempotently with bounded contention;
- projection unavailable → canonical commits continue and UI exposes stale projection;
- bad release → stop candidate namespace, preserve active version, rollback code;
- replay → never mutates original evidence.

## Data-quality telemetry

- evidence admission lag/rejection;
- producer sequence gaps;
- snapshot completion;
- normalizer drift/errors;
- unresolved/ambiguous rate;
- automatic merge/split/correction rate;
- projection/canonical parity;
- provenance completeness;
- capture/privacy omission;
- stale coverage and producer health.
