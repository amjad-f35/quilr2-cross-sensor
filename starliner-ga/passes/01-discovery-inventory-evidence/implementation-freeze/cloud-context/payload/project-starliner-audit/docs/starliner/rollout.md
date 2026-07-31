# Starliner Rollout

Rollout is staged per gateway, per tenant, and per action via mode + fail
behavior. The order below keeps gateway behavior stable while adding
observability first, then central policy.

## Modes in order

### 1. `off`
- `STARLINER_ENABLED=false` (or `STARLINER_MODE=off`).
- No Decision API call, no event emission (except optional
  `sensor.config.loaded`).
- Existing gateway behavior is byte-for-byte unchanged. This is the safe default
  for shipping the adapter PRs.

### 2. `observe`
- Emit `ActionEvent`s and entity/relationship observations.
- No Decision API call, no enforcement.
- Use to validate event shape, flow correlation, and volume against the Events
  pipeline before involving policy.

### 3. `shadow`
- Call the Decision API and record the decision (`mode: shadow`).
- Never enforce. Existing gateway guardrails remain authoritative.
- Compare what the Decision API would have done vs. what the gateway did. A
  decision failure in shadow never changes behavior.

### 4. `enforce`
- Call the Decision API and enforce the result using existing gateway mechanics.
- Apply per-action fail behavior on decision failure (see below).
- Roll out to a canary tenant/action set first; widen as confidence grows.

## Per-action fail behavior

Set a conservative global fail mode and override per action/sensor via
`STARLINER_FAIL_MODE_OVERRIDES`. Recommended starting matrix:

| Action | Fail behavior |
| --- | --- |
| `llm.provider.models.list`, `mcp.tools.list` | allow (fail open) |
| `llm.chat_completion.*` low-risk | use existing gateway behavior |
| `mcp.tool.call` high-risk / production write | deny (fail closed) |
| `mcp.oauth.*`, `llm.admin.api_key.*` | deny (fail closed) |
| event emission | always fail open (never blocks the request) |

## Failure cases to verify before enforce

- Decision API timeout, 500, and malformed response (typed errors + metrics).
- Events API timeout and queue-full drop (request still succeeds).
- Circuit breaker opens during an outage and recovers (half-open).

## Outbox durability

The in-memory outbox is acceptable for dev and the foundation tests only. Before
enforce in production, bind a `DurableOutbox` implementation (SQLite, Postgres,
NATS, Kafka, or local disk) so events survive process restarts. Do not treat the
in-memory outbox as production durability.

## Replacing fakes with real services

`starliner.testing` ships `FakeSyncDecisionClient`, `FakeAsyncDecisionClient`,
`StaticDecisionClient`, and fake event clients. In production, swap these for the
HTTP-backed `SyncDecisionClient` / `AsyncDecisionClient` and
`SyncEventClient` / `AsyncEventClient` pointed at the real Decision and Event
endpoints. The contract surface does not change.

## Metrics to watch

From `starliner.sdk.metrics.Metrics.snapshot()`: `decision_requests`,
`decision_allow`/`deny`/`other`, `decision_errors`, `decision_timeouts`,
`circuit_open_skips`, `events_enqueued`/`flushed`/`dropped`,
`event_flush_errors`. Forward these to the gateway's existing metrics system.
