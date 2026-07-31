# Legacy `starliner.contracts` Reference

> This document describes the retained prototype ABI only. New platform code
> must import `starliner_contracts`, whose schemas are committed under
> [`contracts/schemas/`](contracts/schemas/). ADR-001 makes
> `starliner_contracts` the only canonical Quilr 2 / Starliner ABI.

Regenerate the canonical schema set with:

```bash
python -m starliner_contracts export-schemas docs/starliner/contracts/schemas
```

## Legacy prototype schema versions

The remaining content documents Pydantic v2 models under
`starliner.contracts` so existing compatibility behavior can be maintained. It
must not be used to add new sensor records.

## Schema versions

Legacy registry: `starliner.contracts.common.SCHEMA_VERSIONS`.

| Contract | `schema_version` |
| --- | --- |
| DecisionRequest | `starliner.decision_request.v1` |
| DecisionResponse | `starliner.decision_response.v1` |
| ActionEvent | `starliner.action_event.v1` |
| EntityObservation | `starliner.entity_observation.v1` |
| RelationshipObservation | `starliner.relationship_observation.v1` |
| FindingCandidate | `starliner.finding_candidate.v1` |
| CostEvent | `starliner.cost_event.v1` |
| TraceSpan | `starliner.trace_span.v1` |
| EventsBatch | `starliner.events_batch.v1` |

### Evolution rules

- Additive (new optional field, new enum value): keep the `schema_version`.
  Models use `extra="allow"`, so an older consumer tolerates new fields.
- Breaking (remove/rename/retype, change required-ness): bump to `.vN+1` and add
  a new model class. The golden + schema tests guard against accidental breaks.

## Common envelope

`Envelope` fields shared by correlated records: `schema_version`, `tenant_id`,
`request_id`, `flow_id`, `span_id`, `parent_span_id`, `timestamp`, `sensor`,
`source_repo`, `source_service`, `environment`.

## Taxonomy

`starliner.contracts.taxonomy` is the legacy prototype registry. Existing
compatibility code may import it; new gateways use `starliner_contracts`:
- `SensorType`, `ActionType`, `ResourceType`, `EntityType`, `RelationType`,
  `EventKind`, `Decision`, `ObligationKey`, `FindingType`, `Severity`.

## DecisionRequest (hot path, compact)

Must NOT carry full prompts/responses/tool output or large payloads. Use refs
(`data.payload_ref`, `data.evidence_refs`, `risk.risk_context_ref`). Required:
`action`, `resource` (+ envelope). See `golden/llm_decision_request.json` and
`golden/mcp_decision_request.json`.

## DecisionResponse

`decision` is one of `Decision`. `obligations` carries `redact`, `redact_fields`,
`require_human_approval`, `route_override`, `max_tokens`, `tool_filter`, etc.
`ttl_ms` allows the sensor to cache a decision.

## ActionEvent (async, rich)

May be richer than DecisionRequest but still avoids raw secrets/credentials.
Carries `event_kind`, `outcome`, `performance`, `cost`, `decision` evidence, and
`evidence_refs`. Batched as `EventsBatch` to `POST /v1/events/batch`.

## EntityObservation / RelationshipObservation

Feed Inventory/App Intel and the relationship graph. Sensors only observe; they
do not own inventory truth or final relationship authorization state.

## FindingCandidate

Sensors suggest findings (input/output DLP block, new external tool, denied tool
call, OAuth failure pattern). Final finding lifecycle is owned by the platform.

## CostEvent / TraceSpan

`CostEvent` normalizes usage with a `meter` + `dimensions`. `TraceSpan` provides
`flow_id`/`span_id`/`parent_span_id` correlation for the end-to-end Events view.

## No-secret serialization

`starliner.sdk.redaction.redact_mapping` redacts secret-looking keys (hashing by
default) and scrubs bearer tokens from free text. Use it before attaching any
captured metadata to events.
