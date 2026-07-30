# Versioning, Certification, and Conformance

## Independently versioned boundaries

```text
protocol
envelope
record family
source profile
identifier/action/relation/reason vocabularies
adapter
Edge Runtime
normalizer
resolver
materializer
finding/metric/policy/command definitions
API
projection
catalog
certification pack
```

Every accepted record binds exact protocol/profile/schema versions. Every canonical decision binds normalizer/resolver/materializer/catalog versions.

## Compatibility

Additive optional fields are minor-compatible only when all consumers tolerate unknown values. Required fields, removals, renames, meaning changes, and enum reinterpretation require a major version.

Evidence retains unknown optional fields even when current normalizers ignore them.

## Conformance packs

Each source profile includes:

- positive records;
- schema-invalid records;
- profile-invalid records;
- unsafe payload canaries;
- idempotency conflicts;
- correction/tombstone/reconciliation;
- out-of-order/late sequence;
- sampling/gap behavior;
- authentication/certification mismatch;
- bundle/lease/command signatures where supported;
- source-specific golden flows.

## Certification tiers

1. Protocol conformant
2. Payload safe
3. Observe certified
4. Decision certified
5. Enforcement certified
6. Effect-observation certified
7. Effect-verification certified
8. Operationally certified

Certification is per capability, not one global pass.

## Drift

Runtime manifest is compared with certification:

```text
artifact digest
adapter/runtime versions
profile/schema versions
hook/route inventory
enabled capabilities
known limitations
```

Mismatch produces `drifted`; product claims downgrade immediately according to policy.

## Release sequence

```text
additive storage migrations
→ registry and schemas
→ ingest consumers
→ normalizers/resolvers/materializers
→ projectors/APIs
→ Edge Runtime/adapters
→ UI capability
→ contract old-version deprecation after telemetry proves no active producers
```

## Conformance gate

No implementation is certified from documentation alone. Proof requires commit, build provenance, artifact digest, test-pack result, runtime manifest, self-test, accepted evidence, operational telemetry, and deployment identity.
