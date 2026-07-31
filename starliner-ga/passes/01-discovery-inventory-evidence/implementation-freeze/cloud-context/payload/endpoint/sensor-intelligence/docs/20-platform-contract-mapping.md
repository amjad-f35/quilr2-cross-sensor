# 20 — Platform Contract Mapping

## Scope

This chapter maps all 639 verified native fields in
[native-fields.csv](../../../matrices/sensor-intelligence/endpoint-sensor/native-fields.csv)
to an explicit platform disposition in
[platform-contract-mapping.csv](../../../matrices/sensor-intelligence/endpoint-sensor/platform-contract-mapping.csv).

The record-level mappings are also represented in:

- [adapter-observation-mapping.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/adapter-observation-mapping.yaml)
- [adapter-event-mapping.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/adapter-event-mapping.yaml)

Every row in the mapping CSV is `Proposed mapping from verified source field`.
That label is deliberate: source fields are verified, while Starliner target
admission is not implemented in the endpoint repo.

## Mapping completeness

| Measure | Count |
| --- | ---: |
| Native fields | 639 |
| Mapping rows | 639 |
| Unique mapped native field IDs | 639 |
| Unmapped native field IDs | 0 |

Dispositions:

| Disposition | Fields |
| --- | ---: |
| Used as event field | 273 |
| Preserved as source-native attribute | 104 |
| Preserved as evidence only | 96 |
| Used as claim | 57 |
| Used as metric input | 43 |
| Operator-only | 24 |
| Used as identifier candidate | 18 |
| Used as relationship | 13 |
| Used as finding signal | 8 |
| Discarded with reason | 3 |

Availability:

| Availability | Fields |
| --- | ---: |
| Available through adapter mapping only | 406 |
| Requires minor sensor instrumentation | 218 |
| Requires substantial sensor changes | 15 |

No field is marked `Available now without sensor changes` as a Starliner datum:
the pinned endpoint has no Starliner endpoint adapter. “Available through
adapter mapping only” means the necessary value already crosses or persists at
an accessible native boundary. “Requires minor sensor instrumentation” means
the value exists but needs a new capture call/durable record.

## Contract vocabulary status

The mission target names more logical contracts than the accepted
`starliner_contracts` ABI currently registers.

| Logical contract in mapping | Current authoritative Starliner status |
| --- | --- |
| `SourceObservation` | Registered, but requires `canonical_entity`; pre-resolution mismatch is unresolved |
| `ActionEvent` | Registered |
| `MetricEvent` | Registered |
| `FindingSignal` | Registered, but closed endpoint-incompatible signal list |
| `EntitySnapshot` | Registered; valid only after canonical identity assignment |
| `RelationshipEvent` | Registered; current relation enum is narrower than endpoint source facts |
| `DecisionResult` | Registered |
| `TraceSpan` | Registered |
| `SensorHealthEvent` | Registered |
| `SensorCapabilityManifest` / `SensorManifest` | Registered under `SensorManifest`; mapping uses the mission term in some rows |
| `RawEvidence` | Logical platform/evidence-layer concept; no same-named canonical body in current registry |
| `EntityCandidate` / `IdentifierCandidate` | Resolver inputs in target architecture; no same-named accepted current body |
| `Claim` | Target materialization concept; no same-named accepted current body |
| `RelationshipAssertion` | Pre-resolution graph input; accepted current body is `RelationshipEvent` and requires typed entity refs |
| `CanonicalEventCandidate` | Target normalizer concept; `ActionEvent` is the nearest accepted durable event |
| `CoverageRecord` | Target coverage concept; no same-named accepted current body |
| `ControlCommand` / `ControlResult` / `ObservedEffect` | Target control concepts; not all are registered current schemas |

**Unresolved:** the platform team must decide whether these logical inputs
become new accepted bodies, safe extensions to current bodies, or ingest-side
derivatives from an accepted pre-resolution native record.

## Record-family mappings

### Inventory and discovery

| Native records | Primary target | Notes |
| --- | --- | --- |
| `Entity` + `ApplicationData` through `PluginData` | pre-resolution `SourceObservation` | preserve native UUID/fields; central resolver assigns final entity |
| `ProcessInfo` / `ProcessDelta` | `ActionEvent` and process identity candidates | PID plus start time is a process-instance hint; PID alone is not stable |
| `Snapshot` | protected raw/bootstrap evidence + coverage | snapshot time is not entity discovery time |
| `ChangeEvent` | inventory event candidate | payload is only UUID; consumer lookup required except removal |
| `DiscoveredEntity` + sync contexts | compatibility observation projection | retain only to reconcile old/current delivery; do not double-count with native entity |

The source adapter preserves backend `canonical_id` as a source claim. It does
not promote it to a Quilr 2 canonical ID without an explicit authority rule.

### Identity

Persona, monitor user/device/tenant context, `EmailCandidate`, and `UserDevice`
fields map to:

- native identifier candidates with source namespace;
- actor/device/tenant claims with observation time;
- protected evidence for sensitive context;
- discarded raw credential values.

The three discarded rows are raw access/refresh credential values. Expiry time,
authentication status, device identifiers, and email can be retained under
privacy policy, but none is automatic canonical identity.

### Hook and proxy activity

`HookRequest`, `HookResponse`, `ActivityEntry`, proxy `RequestContext`,
connection/process attribution, body-capture metadata, extension flow records,
and traffic observations map to stage-aware `ActionEvent` inputs.

Current gaps:

- hook requests lack a native event/request ID;
- `ActivityEntry` loses the hook session/event;
- proxy stages do not share one durable event envelope;
- content-bearing fields need protected evidence references;
- allow/decision does not prove execution;
- forwarding/local response proves only transport outcome, not business effect.

### DLP, alerts, and findings

- native `Detection` / `DlpFinding` → `FindingSignal` input;
- `DlpDecision` / popup result → `DecisionResult` and event governance fields;
- DLP/upload alert bodies → `ActionEvent` evidence projections;
- serialized/local stored alerts → `EvidenceReference` plus alert-pipeline
  health.

The mapping never turns a detector match or alert into a customer finding. The
accepted endpoint signal taxonomy, grouping rule, coverage requirement, and
workflow are prerequisites.

### Metrics and health

`HealthMetrics`, connection pool, circuit breaker, destination snapshots,
service lifecycle, diagnostics, alert queue state, config freshness, and future
adapter/outbox counters feed:

- `MetricEvent`;
- `SensorHealthEvent`;
- target `CoverageRecord`;
- operator diagnostics / `TraceSpan`.

Metric reset/grain/window semantics must accompany every numeric sample. The
current proxy cumulative counters cannot be labeled as the configured
`failure_window_secs`.

### Controls and effect

Governance, policy decision, hook decision, UI prompt, hook installation,
process termination, packet backpressure, kill switch, and config responses
remain separate stages:

```text
configuration/claim
→ decision
→ command/request
→ attempted action
→ result
→ observed effect
```

Only map the stage directly evidenced. Current process termination lacks a
universal final effect check. Hook evaluator production output is always allow.
Proxy policy timeout/not-ready paths become allow.

## Field-transformation rules

1. Preserve the exact source field in the immutable native layer.
2. Namespace every native identifier by tenant, sensor instance, component,
   record type, and identifier type.
3. Normalize case/path/URL/email only into a second field; never overwrite the
   source value.
4. Preserve timestamp origin and unit. Do not equate captured, occurred,
   observed, ingested, and acknowledged time.
5. Carry source enum text plus mapped value when the mapper has an unknown
   branch/default.
6. Replace raw prompt/body/header/file/command/snippet fields with bounded
   labels, hashes, size, and protected evidence reference.
7. Omit raw access/refresh credentials entirely.
8. Preserve rule/analyzer/config/version provenance when available.
9. Record explicit loss for compatibility wire projections.
10. Central resolution owns canonical entity/relationship identity.

## Native-to-platform worked flows

### Application discovery

```text
ProcessInfo
→ Correlator
→ Entity { kind: Application(ApplicationData) }
→ native capture record
→ protected RawEvidence reference
→ pre-resolution source observation
→ identifier candidates:
     entity UUID
     process name
     executable path
     bundle ID
     backend canonical_id as a source claim
→ relationship candidates:
     device observed process/application
     application contains child artifact where explicit app_name exists
→ central resolution/materialization
```

**Loss avoided by the proposed seam:** `to_discovered_entity` name truncation,
child deferral, JSON flattening, and current HTTP loss do not erase the native
record.

### IDE hook

```text
Cursor/Claude native stdin
→ HookRequest
→ native hook observation
→ ActionEvent candidate (requested/observed action)
→ HookResponse
→ decision evidence
→ protected prompt/command/file reference
```

No `executed` or `succeeded` event is emitted unless the IDE supplies and the
adapter captures post-action evidence.

### Proxy DLP block

```text
RequestContext
→ extraction
→ analyzer result
→ DlpFinding / Detection
→ policy decision
→ local blocked response
→ alert construction/storage/delivery
```

Target outputs are one correlated activity with distinct detection, decision,
transport-effect, and evidence records. The alert is not the original
observation and must not be counted as a second user action.

## Generated examples and fixtures

The fixtures directory will contain proposed target fixtures generated from:

- verified endpoint Serde/native field schemas;
- authoritative `starliner_contracts` fields where the target body exists;
- explicit placeholder/blocker metadata where the ABI does not yet admit the
  endpoint fact.

They are not runtime captures. No example may contain a fabricated native field
or be labeled as currently emitted.

## Admission gates

A mapping row is not shippable until:

1. target body is registered in `starliner_contracts`;
2. endpoint mapping passes payload-safety validation;
3. sensor manifest declares the record/capability;
4. endpoint certification includes a golden positive and negative trace;
5. delivery wrapper and authenticated runtime identity are present;
6. ingest accepts it;
7. product materializer handles coverage, staleness, correction, and deletion;
8. privacy/retention disposition is enforced.

