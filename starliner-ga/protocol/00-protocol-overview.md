# Starliner Protocol Overview

## Purpose

The protocol lets independently deployed products and connectors submit bounded evidence, receive policy and control state, request decisions, report effects, expose management state, and prove certification without sharing language or storage.

## Protocol surfaces

1. Observation: typed source records and evidence delivery
2. Management: manifest, health, self-test, metrics, enrollment
3. Policy: bundle discovery, download, activation, rollback, expiry
4. Decision: request, response, obligations, leases, approval continuation
5. Command: typed targeted commands, acknowledgement, execution, effect
6. Certification: conformance results, capability claims, artifact binding
7. Content: optional restricted-content grant, upload, commit, access, expiry

## Normative baseline

| Concern | Frozen baseline |
|---|---|
| JSON schemas | JSON Schema Draft 2020-12 |
| HTTP API description | OpenAPI 3.1.2 |
| JSON canonicalization | RFC 8785 JCS plus verified errata; `-0`, NaN, infinity forbidden |
| Internal opaque IDs | UUIDv7 according to RFC 9562 |
| Trace propagation | W3C Trace Context; baggage allowlist |
| Event interoperability | CloudEvents-compatible mapping; Starliner envelope normative |
| Observability | OpenTelemetry semantic conventions with pinned release and Quilr extension registry |
| Human identity | OIDC issuer+subject; SCIM resource IDs |
| Workload identity | SPIFFE/SVID, cloud workload identity, mTLS, or short-lived asymmetric JWT by profile |
| Delegation | OAuth token exchange semantics where applicable; actor chain retained |
| Sender-constrained OAuth | DPoP or mTLS where supported |
| Supply chain | Content digests, SLSA provenance, Sigstore-compatible verification |

Standards are compatibility baselines, not the Quilr ontology. External semantic conventions are pinned because they evolve independently.

## Design rules

- One small common envelope
- Typed profile-specific bodies
- No unbounded arbitrary JSON in certified profiles
- No canonical enterprise IDs from producers
- Explicit privacy and capture state
- Explicit correction/deletion/reconciliation lifecycle
- Authenticated producer claims separated from admitted facts
- Idempotent and replayable
- Bounded size/cardinality
- Causal tracing only where a real transaction propagates
- Observation/correlation IDs for independent scans
- Additive minor compatibility; major version for meaning changes
- Machine-readable conformance fixtures

## Encoding

Protocol v1 uses UTF-8 JSON constrained to I-JSON/JCS-compatible values. Integers exceeding exact interoperable JSON range, decimal currency, hashes, and timestamps use canonical string representations defined by schema.

Protobuf MAY be introduced as an additional encoding only after semantic v1 conformance is proven across at least two languages. It does not create a second semantic model.

## Delivery semantics

- At-least-once transport
- Per-record partial acknowledgement
- Deterministic idempotency
- Edge durable enqueue before asynchronous delivery
- Central durable admission before `accepted`
- No batch-level transactional implication
- Retryable versus permanent errors are explicit
- Gaps, sampling, and loss are evidence and coverage inputs

## Protocol artifacts

Implementation MUST ship:

```text
schemas/
source profiles/
identifier namespace registry
action and relation vocabularies
reason-code registry
capture-state registry
positive/negative fixtures
canonicalization vectors
signature vectors
compatibility matrix
conformance CLI
certification packs
```
