# Starliner Foundation Proof

> Historical compatibility proof: this document covers the prototype
> `starliner` SDK. It is not the canonical ABI or the acceptance gate for new
> sensors. New platform code uses `starliner_contracts`; see ADR-001 and
> `docs/starliner/contracts/schemas/`.

This document records the foundation proof points required before gateway adapter
work begins. It is intentionally focused on the reusable SDK surface in this
repository, not on gateway implementation details.

## 1. Off mode has no gateway import/runtime side effects

The package separates import-time definitions from runtime activity:

- Importing `starliner`, `starliner.contracts`, `starliner.sdk`, or
  `starliner.adapters` only defines classes/functions/constants.
- No Decision API client is created at import time.
- No Event API client is created at import time.
- No background task, thread, timer, or flush loop is started at import time.
- `StarlinerConfig.from_env({})` defaults to `enabled=False` and `mode=off`.
- `SensorRuntime.evaluate(...)` and `SyncSensorRuntime.evaluate(...)` short-circuit
  Decision API calls unless `config.calls_decision_api` is true.
- `EventClient.emit(...)` returns without emitting unless `config.emits_events`
  is true.

The tests in `tests/starliner/test_adapters_llm.py` and
`tests/starliner/test_adapters_mcp.py` assert that `STARLINER_ENABLED=false` /
`off` causes zero Decision calls and zero emitted events.

## 2. Contract schemas are stable enough for future Go/TypeScript SDKs

Every public contract is a Pydantic v2 model with a required `schema_version`.
JSON Schema is exported for every public contract under
`docs/starliner/schemas/`:

- `decision_request.schema.json`
- `decision_response.schema.json`
- `action_event.schema.json`
- `events_batch.schema.json`
- `entity_observation.schema.json`
- `relationship_observation.schema.json`
- `finding_candidate.schema.json`
- `cost_event.schema.json`
- `trace_span.schema.json`

The compatibility gate is not just coverage. Golden fixtures in
`tests/starliner/golden/` are validated both through Pydantic and through the
exported JSON Schemas. Future Go/TypeScript SDKs should generate or hand-write
their models against those JSON Schemas and verify compatibility against the
same golden files.

Schema evolution rule:

- Additive changes (new optional fields, new taxonomy constants) keep the same
  `schema_version`.
- Breaking changes require a new `.vN` schema version and a new model.

## 3. Default serialization prevents raw prompt/tool/token/secret leakage

The foundation avoids raw payload leakage by design:

- `DecisionRequest` contains labels, classifications, sizes, risk signals, and
  refs. It does not require raw prompts, raw responses, full tool arguments, or
  full tool outputs.
- `redact_mapping(...)` redacts secret-looking keys such as `password`,
  `secret`, `token`, `authorization`, `api_key`, `client_secret`,
  `access_token`, `refresh_token`, and `credential`.
- Secret values are hashed by default with `hash_secret(...)` so events can keep
  stable references without emitting raw tokens.
- Bearer tokens embedded in free text are scrubbed.

The tests in `tests/starliner/test_redaction_idempotency.py` verify redaction,
hashing, bearer-token scrubbing, and stable idempotency keys.

## 4. InMemoryOutbox is not positioned as production durability

`InMemoryOutbox` is explicitly documented as dev/test only:

- `starliner/sdk/outbox.py` states that `InMemoryOutbox` is not durable and must
  not be treated as production durability.
- `DurableOutbox` is an abstract interface for future production bindings.
- Later gateway adapters can bind `DurableOutbox` to SQLite, Postgres, NATS,
  Kafka, or local disk depending on deployment.
- Event emission is fail-open by default so an event-path outage does not break
  user traffic.

## Gateway-facing API surface

This surface is retained for legacy compatibility only. New gateway observe
adapters must import `starliner_contracts`, not the examples below.

### Contracts

```python
from starliner.contracts import (
    Action,
    Actor,
    ActionEvent,
    CostEvent,
    DataContext,
    DecisionRequest,
    DecisionResponse,
    EntityObservation,
    FindingCandidate,
    RelationshipObservation,
    Resource,
    Risk,
    Sensor,
    TraceSpan,
)
from starliner.contracts.taxonomy import (
    ActionType,
    Decision,
    EntityType,
    EventKind,
    ObligationKey,
    RelationType,
    ResourceType,
    SensorType,
)
```

### SDK runtime and clients

```python
from starliner.sdk import (
    AsyncDecisionClient,
    AsyncEventClient,
    SyncDecisionClient,
    SyncEventClient,
    StarlinerConfig,
    RequestContext,
    InMemoryOutbox,
    DurableOutbox,
    event_idempotency_key,
    hash_secret,
    redact_mapping,
)
```

### Adapter helpers

```python
from starliner.adapters import (
    SensorRuntime,
    SyncSensorRuntime,
    build_llm_chat_decision_request,
    llm_request_observations,
    build_mcp_tool_decision_request,
    mcp_tool_observations,
)
```

### Test fakes for gateway tests

```python
from starliner.testing import (
    FakeAsyncDecisionClient,
    FakeAsyncEventClient,
    FakeSyncDecisionClient,
    FakeSyncEventClient,
    StaticDecisionClient,
    make_decision_response,
)
```

