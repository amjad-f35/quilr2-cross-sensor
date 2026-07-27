# Canonical event model

The normative envelope and allowed type list are [canonical-event.schema.json](schemas/canonical-event.schema.json). The catalog is [event-types.csv](matrices/event-types.csv).

## Distinct layers

| Layer | Meaning | Mutable? |
| --- | --- | --- |
| Raw sensor record | Exact source payload/message/row/file | Immutable |
| Source observation | Versioned statement of what one source saw | Immutable; corrections append |
| Canonical event | Time-bound fact linked to resolved entities | Rebuildable/versioned |
| State transition | Change to entity/relationship/finding/materializer state | Append-only transition |
| Finding signal | Event/relationship/state fact used by a condition | Rebuildable |
| Finding | Actionable root-cause condition with workflow | Mutable through versioned workflow |
| Metric | Aggregate on canonical grain/time | Rebuildable |
| Evidence | Integrity/provenance-bound support for a claim | Immutable metadata/content |

## Required canonical envelope

```text
event_id, tenant_id, event_type, event_version
occurred_at, observed_at, ingested_at
source.sensor_id/type/native_event_id/schema_version
actors.human/agent/workload/device/account
correlation.session/run/step/correlation_id/parent_event
entities.application/model/provider/mcp_client/mcp_server/tool/connector/target
action
data classifications and movement
governance policy/decision/enforcement/approval
outcome
usage latency/tokens/bytes/cost
confidence
evidence_references
raw_payload_references
```

Only the common identity/time/source/evidence fields are mandatory. Actor/entity/action/data/governance/outcome/usage objects are optional because sensors have different capabilities.

## Event identity

- `event_id` identifies the canonical event version/aggregate, not the source record.
- Every source contribution is listed through observation/evidence references.
- Exact source duplicates collapse under source-native idempotency before canonical correlation.
- A multi-observer event records all observers and source times.
- Parent/child relationships express one activity with several subevents; they do not erase legitimate distinct actions.

## Event families and availability

The 75 types cover:

- discovery and inventory transitions;
- identity, account, credential, and relationships;
- application/interaction/prompt/response/model usage;
- agent session/run/step/delegation;
- MCP tool discovery/calls and actions/effects;
- data read/upload/download/transfer/redaction/retention/deletion;
- policy/decision/approval/control/exception;
- sensor/connector/provider/runtime operations;
- cost/budget/task/outcome;
- finding lifecycle.

Each type is marked `Available now`, `Derivable now`, `MVS`, `Requires new telemetry`, `Requires external integration`, or `Future capability` in the matrix. A type in the taxonomy is not a claim that all sources emit it.

## Source mappings

| Source | Direct canonical candidates | Do not invent |
| --- | --- | --- |
| Browser | `ai.application.used`, `prompt.submitted`, `data.uploaded`, control/decision outcomes | Exact model/deployment/account |
| Browser native host | file/clipboard actions, scan task/heartbeat | Stable file identity without new element ID |
| BES | identity/account/application observations, heartbeats, risk/audit/policy events | Graph authority |
| Endpoint discovery | asset/relationship observations, enforcement/governance changes | Rich relationships discarded by current converter |
| Endpoint proxy | data transfer/action/decision/runtime events | Agent/model/account certainty |
| IDE hooks | prompt/tool/file activity | Enforced decision; current evaluator always allows |
| LLM Gateway | model invocation, prompt/response, DLP/policy, usage/cost/outcome | Direct-provider activity |
| Workers | detection result/complete/error, DB write operational events | Product findings |
| MCP external | tool/server/call/action events after contract | Any native field until contract supplied |
| Quilr 1 tables | backfilled observations/events with table provenance | Current graph/cache as historical truth |

## Retention

- Canonical event: tenant/policy-dependent analytical retention; IDs and minimal audit metadata may outlive content.
- Raw/evidence: separate retention by sensitivity, legal hold, source, and business need.
- Prompt/tool/file content: protected content store, shortest justified retention, redaction/deletion workflow.
- Finding evidence links: retained for the finding/audit obligation; links can point to redacted/deleted content metadata where lawful.

## Query semantics

Event APIs require:

- tenant filter implicit from identity;
- event-time and ingestion-time ranges;
- canonical entity filters;
- source/coverage filters;
- event version and restatement mode;
- content/evidence authorization;
- deterministic cursor pagination;
- explicit “unknown,” “not observed,” and “out of scope” states.

Default executive/inventory APIs never return raw prompt/file/tool content.
