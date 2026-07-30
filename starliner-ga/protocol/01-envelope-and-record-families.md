# Common Envelope and Record Families

## Envelope

```json
{
  "protocol_version": "starliner.protocol.v1",
  "record_id": "019c...",
  "record_type": "source_observation",
  "schema_version": "starliner.source_observation.v1",
  "source_profile": "starliner.source.endpoint_agent.v1",
  "source_profile_version": "1.0.0",

  "claimed_tenant_id": "tenant_123",
  "source_definition_id": "endpoint_agent",
  "source_installation_id": "srcinst_123",
  "runtime_instance_id": "runtime_456",
  "claimed_producer_identity": "spiffe://example/workload",
  "adapter_id": "endpoint-starliner",
  "adapter_version": "1.0.0",
  "claimed_certification_id": "cert_abc",

  "operation": "upsert",
  "source_native_id": "native_789",
  "source_revision": "42",
  "supersedes_record_id": null,

  "occurred_at": "2026-07-28T00:00:00Z",
  "observed_at": "2026-07-28T00:00:00.003Z",
  "enqueued_at": "2026-07-28T00:00:00.010Z",

  "sequence": {
    "stream_id": "runtime_456",
    "number": "187",
    "previous_record_hash": "sha256:..."
  },

  "correlation": {
    "traceparent": null,
    "tracestate": null,
    "session_id": null,
    "request_id": null,
    "run_id": null,
    "step_id": null,
    "action_id": null,
    "decision_id": null,
    "command_id": null,
    "trail_id": null
  },

  "privacy": {
    "collection_policy_id": "cp_123",
    "collection_policy_version": "9",
    "capture_summary": {},
    "content_reference_count": 0
  },

  "idempotency_key": "source-scoped-stable-key",
  "body_hash": "sha256:...",
  "record_hash": "sha256:...",
  "signature": null
}
```

## Trusted admission metadata

Ingest creates immutable admission metadata that is not accepted from the envelope:

```text
evidence_id
authenticated_tenant_id
authoritative_cell_id
authenticated_producer_identity
verified_source_installation_id
verified_runtime_identity
verified_certification_id
admitted_assurance
schema/profile trust result
integrity result
ingested_at
received transport metadata
```

Claimed and admitted values are retained separately when they differ.

## Operations

```text
upsert      source asserts current/valid state
correct     source supersedes a prior source record
delete      authoritative source asserts native object deletion
tombstone   source invalidates or retires an assertion/identifier
```

Silence is never an operation.

## Record families

### `EntitySnapshot`

Source-scoped current or interval state for one native object. Contains native identifiers and allowlisted attributes. It is not canonical.

### `SourceObservation`

Typed statement about a source object, behavior, or condition when no more specific family applies. Certified profiles MUST define a strict subtype.

### `RelationshipAssertion`

Proposed source relationship between source object references. Includes validity, assertion operation, basis, confidence, and evidence.

### `ActionEvent`

Attempted, started, completed, failed, cancelled, or observed action with source-native actors, targets, resources, run/session references, safe input classifications, outcome, reversibility, and side-effect possibility.

### `DecisionResult`

Native, local Starliner, leased, central, approval, or fail-mode decision. Includes policy/bundle/context versions, reasons, obligations, enforcement point, and latency.

### `ExecutionOutcome`

Native runtime report of attempted execution, upstream invocation, result class, and side-effect possibility. It is not effect verification.

### `EffectObservation`

Observed postcondition from an eligible source with verification capability and binding to the action/command.

### `FindingSignal`

Source/local deterministic signal with source refs, reasons, evidence, confidence, and severity hint. Central admission ignores source dedupe/severity as authority.

### `TraceSpan`

Bounded trace metadata. Trace IDs never authorize tenant or actor.

### `MetricEvent`

Bounded measurement input with controlled dimensions. Metrics cannot establish entity existence or findings unless a definition explicitly permits it.

### `CostEvent`

Economic fact with currency, source, rate-card/billing version, estimation confidence, and allocation hints.

### `SensorHealthEvent`

Dimension-specific runtime, adapter, identity, privacy, policy, outbox, delivery, dependency, self-test, certification, and coverage health.

### `ControlConfigEvent`

Bundle/configuration lifecycle evidence.

### `AuditEvent`

Typed administrative/security event not represented elsewhere. It is not a generic payload escape hatch.

### Reconciliation records

```text
ReconciliationStarted
ReconciliationPageCommitted
ReconciliationCompleted
ReconciliationFailed
SourceGapNotice
SamplingSummary
```

`ReconciliationCompleted` includes scope, authoritative-negative semantics, counts, cursor, page/hash manifest, and completeness. Only a successfully completed authoritative run may generate absence/deletion candidates.

### Management/certification

```text
SourceManifest
SelfTestResult
ContractTestResult
CertificationRecord
PolicyBundleStatus
CommandLifecycleEvent
```

## Source references

Source bodies refer to:

```text
source_object_type
source_native_id
identifier namespace/value
source-local parent references
optional platform binding token with binding revision
```

They never contain a producer-minted `canonical_entity_id`.
