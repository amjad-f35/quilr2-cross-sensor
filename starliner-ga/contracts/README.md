# Machine-Readable Contract Freeze

Status: **normative**

These schemas freeze the cross-team meta-contracts. Source-profile-specific record bodies and product APIs are generated incrementally under these contracts and cannot contradict the protocol or ADRs.

| Contract | Purpose |
|---|---|
| [Starliner envelope](starliner-envelope.schema.json) | Required identity, lifecycle, time, sequence, privacy, integrity, and correlation around every source record |
| [Source profile](source-profile.schema.json) | Source/integration role, authority, identifiers, lifecycle, privacy, capabilities, coverage, and certification |
| [Insight definition](insight-definition.schema.json) | Admission, coverage, grouping, severity, confidence, lifecycle, exceptions, recompute, remediation, and quality for findings |
| [Metric definition](metric-definition.schema.json) | Grain, population, numerator/denominator, coverage, time, correction, privacy, and lifecycle |
| [GA evidence package](ga-evidence-package.schema.json) | Immutable evidence needed for a release-gate decision |

Rules:

- Schemas use JSON Schema 2020-12.
- `additionalProperties` is false at governance boundaries unless extension semantics are explicitly defined.
- IDs are stable opaque strings; pattern rules do not assign business meaning.
- Schema validity is necessary but not sufficient for semantic conformance.
- Concrete source bodies get their own `$id`, version, examples, privacy classification, and conformance pack.
- Concrete product HTTP contracts use OpenAPI 3.1.2 and reference these schemas where applicable.
