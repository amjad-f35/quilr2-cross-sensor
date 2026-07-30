# Normalization and Source Catalog

Status: **normative**

## Purpose

Normalizers convert accepted source records into stable, source-aware observations. They interpret native semantics but do not prematurely collapse multiple sources into canonical entities.

## Source catalog

The catalog is versioned configuration with review and rollout controls. For every field or claim it records:

- source profile and version;
- source object type;
- normalized claim type;
- source namespace and scope;
- stability and lifecycle semantics;
- field-level authority class;
- privacy classification;
- normalization function and version;
- allowed canonical entity candidates;
- deletion and snapshot behavior;
- freshness expectation;
- conflict and precedence rules;
- known limitations.

## Normalized observation

A normalized observation contains:

- immutable observation ID;
- accepted source-record reference;
- tenant and environment;
- producer/profile identity;
- source object reference;
- normalized entity candidate class;
- typed claims;
- typed relationship candidates;
- activity candidates;
- lifecycle operation and valid time;
- normalization version;
- quality signals computed from source semantics;
- privacy and retention metadata.

It has no final canonical entity ID until resolution.

## Authority classes

| Authority | Meaning |
|---|---|
| Authoritative | The source owns the fact in the declared scope, such as an IdP account status |
| Direct observation | The source directly observed the fact, such as a gateway execution |
| Attested | A trusted workload asserted the fact under an attestation contract |
| Derived | Platform logic inferred the fact from one or more inputs |
| User asserted | A customer user entered the fact |
| Imported legacy | A migrated value without stronger provenance |

Authority is field-specific. A source may be authoritative for account status but not business owner.

## Normalization rules

- Preserve original values and references; normalized values are additive.
- Make lossy conversion explicit.
- Separate parsing confidence from identity confidence.
- Normalize time, units, enum values, and identifiers deterministically.
- Treat unknown, absent, redacted, unsupported, and not applicable distinctly.
- Do not fill missing data from unrelated sources during normalization.
- Pin the exact normalizer version to every output.
- Reprocessing produces a new normalized version and does not mutate source evidence.

## Example

A gateway record containing model string `gpt-x`, provider account `acct-17`, and endpoint URL produces:

- a provider-account source object;
- a model-deployment candidate;
- a “routed execution through” relationship candidate;
- an execution activity candidate;
- normalized aliases for the model string and endpoint;
- source-observation quality based on the gateway profile.

It does not decide that `gpt-x` is the same deployment observed in a browser or endpoint.

## Registry and rollout

Normalizers are built artifacts with:

- versioned source and output contracts;
- deterministic golden fixtures;
- backward and forward compatibility tests;
- privacy tests;
- shadow reprocessing;
- diff reports against the active version;
- per-tenant or cohort activation;
- rollback without evidence loss.

## Reprocessing

Reprocessing uses immutable evidence, an exact catalog version, and a deterministic job manifest. It writes new normalized outputs into a candidate namespace. Identity and materialization impact is previewed before promotion. Large changes are rate-limited and tenant-isolated.

## Operational metrics

- accepted records awaiting normalization;
- normalization latency and error rate;
- unknown source enum or schema rate;
- privacy rejection and redaction rate;
- claim distribution drift;
- replay determinism;
- candidate-output differences by version;
- source freshness and snapshot completion.
