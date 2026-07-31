# MCP M1 Buckets 1-6 Proof and Closure Ledger

As of: 2026-07-15

Milestone: `M1 — MCP Certified Observe Runtime`

This document supersedes the deployment-status and closure claims in
`docs/starliner/m1_buckets_5_6_proof.md`. The implementation proof in that
document remains valid.

## Closure decision

Buckets 1-6 are **closed for the frozen executable MCP Observe v1 scope**.
Older literal checklist items that require every sensor to emit every canonical
family are explicitly superseded by the M1 scope amendment in ADR-001.

| Bucket | Literal closure map | Frozen executable scope |
| --- | --- | --- |
| 1. Scope boundary | **AMENDED** | **DONE** |
| 2. Canonical contracts / ABI | **DONE** | **DONE** |
| 3. Sensor runtime adapter | **AMENDED** | **DONE for MCP Observe v1** |
| 4. Delivery outbox | **DONE** | **DONE** |
| 5. Ingest / auth / trust | **SUPERSEDED DETAILS** | **DONE in code/CI; live accepted responses observed** |
| 6. Evidence storage | **SUPERSEDED DETAILS** | **DONE in code/CI; live export/replay observed** |

The closure does not claim production hardening, a public ingest revision,
dynamic registry control, terminal-ledger retention policy, materialization, or
read APIs. Those are later work. It does prove one safe path from MCP
observation through durable delivery, ingest, Postgres evidence, export, and
replay, while keeping MCP customer traffic fail-open.

Buckets 7-12 remain out of scope.

## Authoritative baseline

There are two different specifications in the project history. They must not be
combined silently.

The executable baseline is:

- `project-starliner@860079c312c13f842b5804a590fa1d5430860286`,
  which froze the delivery wrapper and MCP record families;
- `quilr-llm-gateway/add_gateway@01d486bb9998b5f9fcc692a744d9591c2677ad17`,
  which is the current producer implementation;
- `project-starliner/main@e611002f40f3fc9a4a4b896fb4039dab83082e93`,
  which is the current ingest/evidence consumer implementation.

That executable contract is:

```json
{
  "api_version": "v1",
  "records": [
    {
      "envelope": {},
      "body": {}
    }
  ]
}
```

Per-record status is exactly:

```text
accepted | duplicate | rejected
```

Idempotency is scoped by:

```text
tenant_id + sensor_id + record_type + idempotency_key
```

The older structural text uses a top-level `producer` object,
`accepted_duplicate` / `rejected_*` statuses, three-part idempotency, JWT
allowlist claims, `evidence_records`, and materializer jobs. Those details were
superseded before Buckets 5-6 landed. Reintroducing them would break the frozen
gateway contract and requires a versioned ABI decision, not an unreviewed
implementation change.

## Exact commits and merges

### `project-starliner`

| Purpose | Commit |
| --- | --- |
| MCP observe delivery contracts and ABI freeze | `860079c312c13f842b5804a590fa1d5430860286` |
| Buckets 5-6 implementation, PR #5 head | `e4e5d802d8ac392fe932c7ad110254cb4056e98a` |
| PR #5 merge | `df071a4aac3c5caef84420d1489b5c573c96e621` |
| Preprod deployability, PR #6 head | `058c2758f78a42bfb4b6e99a8ade31e1c9958668` |
| Current `main`, PR #6 merge | `e611002f40f3fc9a4a4b896fb4039dab83082e93` |

PR #5: <https://github.com/quilrbusiness/project-starliner/pull/5>

PR #6: <https://github.com/quilrbusiness/project-starliner/pull/6>

### `quilr-llm-gateway`

| Purpose | Commit |
| --- | --- |
| Dev runtime certification identity exposed by the live manifest | `a877f5e1036b46a0bd27ebcd7e8bcc246371db65` |
| Frozen producer/source baseline used for live flush | `01d486bb9998b5f9fcc692a744d9591c2677ad17` |
| Bucket 4 closure implementation | `624dbb7c6d497b109aa02dfeb25c8800538d9c8c` |

The server-side checkout proof names `01d486b...`; the public manifest's
certification/runtime identity still names `a877f5e...`. The public endpoint
alone therefore does not attest the launcher-only updates. The safe live flush
counts below come from the server-connected proof, while `624dbb7...` is the
tested follow-up closure commit and is not claimed deployed.

The Buckets 5-6 PRs changed only `project-starliner`; they did not change the
MCP Gateway producer.

## Exact verification results

### `project-starliner`

Executed on the closure branch based on
`e611002f40f3fc9a4a4b896fb4039dab83082e93`:

```bash
.venv/bin/python -m pytest -o addopts="" -q -m "not integration"
```

Result:

```text
341 passed, 5 skipped, 5 deselected, 1 warning in 11.01s
```

```bash
TESTCONTAINERS_RYUK_DISABLED=true \
  .venv/bin/python -m pytest \
  tests/starliner_ingest/test_postgres_evidence_store.py \
  -m integration --tb=no
```

Result:

```text
5 passed, 1 warning
```

Additional closure gates:

- committed schema regeneration diff: passed;
- positive golden corpus: passed;
- negative golden corpus: failed as required;
- legacy ABI import guard against `origin/main`: passed;
- Ruff ingest check: passed;
- Ruff ingest format check: 23 files already formatted;
- payload leak safety canaries: 3 passed;
- updated scope/workflow YAML parse: passed.

### `quilr-llm-gateway`

Executed against committed closure revision
`624dbb7c6d497b109aa02dfeb25c8800538d9c8c`:

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=mcpgateway \
  .venv/bin/python -m pytest \
  mcpgateway/test_starliner_mcp_adapter.py \
  mcpgateway/test_starliner_mcp_handler.py \
  mcpgateway/test_starliner_optional_dependency.py \
  mcpgateway/test_starliner_outbox_repository.py \
  mcpgateway/test_starliner_registry_hooks.py \
  mcpgateway/test_starliner_mcp_certification.py \
  mcpgateway/test_starliner_observe_runtime.py \
  mcpgateway/e2e_test/test_starliner_mcp_policy.py \
  --tb=no
```

Result:

```text
89 passed, 3 warnings in 11.08s
```

The product-local golden certification passed at the exact closure commit:

```text
sensor=mcp_gateway
product_ref=fix/starliner-m1-delivery-closure
product_commit=624dbb7c6d497b109aa02dfeb25c8800538d9c8c
baseline=origin/add_gateway
contract=main (860079c312c13f842b5804a590fa1d5430860286)
result=passed
cases=2
```

Ruff check, Ruff format check, shell syntax, workflow YAML parsing, and
`git diff --check` also passed. The last `add_gateway` CI run before this
follow-up remains:

<https://github.com/quilrbusiness/quilr-llm-gateway/actions/runs/29379715113>

### Live preprod observation

The server-connected smoke completed without copying raw evidence or credential
values into this ledger:

| Safe proof field | Result |
| --- | --- |
| Gateway source checkout | `add_gateway@01d486bb9998b5f9fcc692a744d9591c2677ad17` |
| Public runtime certification identity | `a877f5e1036b46a0bd27ebcd7e8bcc246371db65` |
| Ingest bind | `127.0.0.1:18080` |
| Postgres container | `NEEDS_INPUT:exact Postgres container name from the server-connected smoke` |
| Postgres volume | `NEEDS_INPUT:exact Postgres volume name from the server-connected smoke` |
| Registry path | `NEEDS_INPUT:exact sensor registry path from the server-connected smoke` |
| Outbox pending | `5 -> 0` |
| Ingest per-record results | `accepted=5`, `duplicate=0`, `rejected=0` |
| Export path | `NEEDS_INPUT:exact server evidence export path from the server-connected smoke` |
| Export count | `5` safe evidence records |
| Replay | page size `2`; three pages with counts `2`, `2`, `1` |
| Temporary smoke API token | revoked |
| Leak scan | passed |
| MCP operation | Excalidraw `tools/list` only; no `tools/call` |

The leak scan found no raw tool arguments, tool results, request/response
headers, cookies, bearer tokens, credentials, secret-file values, or raw source
payloads in committed proof, API output, export metadata, or rejected evidence.

Public checks remained consistent with the server proof:

- `/health` returned HTTP 200 with `status=healthy`;
- `/starliner/manifest` returned `runtime_status=active`,
  `delivery_configured=true`, `delivery_authenticated=true`,
  `delivery_ready=true`, and `metrics.delivery.accepted=5`;
- unauthenticated `/starliner/metrics` returned HTTP 401.

Only the four exact server resource/path names marked `NEEDS_INPUT` are absent
from the available transcript. They are proof-ledger metadata, not runtime or
ABI blockers, and must be filled from the original server report rather than
guessed.

## Bucket 1 — Scope boundary

Status: **DONE**

Proven:

- `docs/starliner/m1_scope.yaml` is the stable compatibility pointer to the
  complete machine-readable scope at `docs/platform-now/m1_scope.yaml`;
- the scope names the frozen ABI/producer/consumer baselines, exact ingest
  vocabulary, landed Buckets 1-6, emitted and deferred families, non-goals, and
  required safety/fail-open invariants;
- `docs/adr/ADR-001-starliner-abi-source-of-truth.md` is accepted for M1;
- `.github/pull_request_template.md` requires bucket touched, explicit ABI
  changed yes/no, `NEEDS_INPUT`, live-deploy requirement, proof, and payload
  safety declarations;
- materializers, read models, APIs, UI, enforcement, graph, Feldera, and LLM
  work remain out of M1.

## Bucket 2 — Canonical contracts / ABI

Status: **DONE**

Proven:

- `starliner_contracts` is the ABI used by the MCP observe path and ingest;
- ADR-001 defines the legacy `starliner.contracts` package as compatibility
  only;
- `tools/check_no_new_legacy_abi_imports.py` is covered by tests and wired into
  contract and ingest CI;
- the runtime registry is finite and rejects unregistered schema versions;
- the delivery wrapper validates envelope/body tenant, schema, hash, and
  payload safety;
- positive MCP golden traces validate;
- negative raw-argument, raw-header, prompt, secret, and wrapper-integrity
  traces fail validation;
- committed schema exports now include `source_observation`, `metric_event`,
  `finding_signal`, and `delivery_record`;
- contract CI regenerates schemas to a temporary directory and diffs them
  against the committed canonical set;
- `docs/starliner/README.md`, `contracts.md`, `foundation-proof.md`, and
  `docs/starliner/schemas/README.md` quarantine the legacy
  `starliner.contracts` surface;
- the PR template requires an explicit ABI-change declaration and ADR link.

No ABI shape or ingest result vocabulary changed in this closure pass.

## Bucket 3 — Sensor runtime adapter

Status: **DONE for the frozen MCP Observe v1 scope**

Proven in `quilr-llm-gateway`:

- the FastAPI runtime owns `/starliner/manifest`, `/starliner/selftest`, and
  protected `/starliner/metrics`;
- backend/tool discovery is hooked in
  `mcpgateway/services/registry.py`;
- completed tool calls are observed from
  `mcpgateway/services/mcp_handler.py`;
- the adapter maps records with `starliner_contracts`, deterministic
  idempotency data, and full delivery envelopes;
- no raw tool arguments/results are passed into the observe adapter;
- native DLP blocks produce `FindingSignal`;
- adapter and enqueue failures are fail-open to MCP traffic.

Current emitted families are:

```text
SourceObservation
ActionEvent
MetricEvent
FindingSignal
```

ADR-001 and both scope documents now explicitly classify these as enhanced
v1.1/deferred MCP coverage unless separately implemented and certified:

```text
EntitySnapshot
RelationshipEvent
DecisionResult
TraceSpan
SensorHealthEvent
```

The manifest declares all four emitted families as `observe` and all five
enhanced families as `deferred`. The closure rule is not “every sensor emits
every canonical family”; it is “every emitted family is registered, certified,
payload-safe, and accepted by ingest.”

An end-to-end self-test that writes synthetic evidence through a live ingest,
strict no-tenant emission, and finer attempted/decided/completed hooks remain
possible v1.1 hardening. They do not expand the frozen M1 emitted-family set.

## Bucket 4 — Delivery outbox

Status: **DONE**

Proven:

- a durable SQLite `starliner_outbox` table exists;
- enqueue is idempotent on
  `(tenant_id, sensor_id, record_type, idempotency_key)`;
- due rows are leased and stale in-flight claims are recovered;
- a supervised asynchronous worker flushes bounded batches;
- `accepted` and `duplicate` are terminal success states and persist a bounded
  returned `evidence_id`;
- `rejected` is an immediate terminal non-retryable dead letter;
- transport/network/429/5xx/malformed-response/unknown-result failures retry
  with exponential backoff and jitter;
- maximum-attempt exhaustion becomes `failed_terminal`;
- capacity and delivery failures remain fail-open to MCP runtime;
- bounded safe error codes are stored instead of response bodies or secrets;
- terminal outcomes move atomically to metadata-only
  `starliner_terminal_delivery`, which has no payload column;
- terminal metadata includes scope, hashes, safe status/error code, attempts,
  timestamps, and optional evidence ID;
- the active queue retains payload only while delivery is pending/in flight;
- manifest and metrics expose `outbox_depth`, `oldest_record_age_seconds`,
  `delivery_lag_seconds`, `last_success_at`, `last_error_at`,
  `accepted_total`, `duplicate_total`, `rejected_total`, `retry_total`, and
  `dead_letter_total`;
- mixed `accepted` / `duplicate` / `rejected` / unknown-result behavior is
  covered in one batch, including database and log canary assertions;
- graceful shutdown drains or releases claims.

Response-position association remains the frozen batch protocol behavior.
Returned-idempotency correlation, priority-aware dropping, byte-bounded claim,
and terminal-ledger retention policy are non-M1 hardening and would need a
separate compatibility decision if they change the wire contract.

## Bucket 5 — Ingest / auth / trust

Status: **DONE against the frozen producer contract; older shape superseded**

Proven:

- JSON-only, byte-bounded `POST /v1/evidence/ingest`;
- required `api_version="v1"`;
- exact `accepted | duplicate | rejected` per-record statuses and partial
  success;
- local-only `NoopAuthVerifier`;
- service JWT verification for issuer, audience, signature, time claims,
  subject, tenant, sensor, and `starliner.evidence.ingest` scope;
- static asymmetric public key, public-key file, and bounded JWKS sources;
- preprod/prod startup guards reject noop auth, SQLite, in-memory registry,
  symmetric JWT, missing Postgres, and missing delivery wrappers;
- injected or validated file-backed sensor/certification registry;
- wrapper, envelope, schema, trust, payload safety, and record-size admission;
- four-part idempotency with same-hash duplicate and different-hash conflict;
- accepted and safe rejected persistence;
- durable `outbox_events` handoff;
- health, readiness, metrics, migration, replay/export, and query CLI paths.

Intentional differences from the older text:

- no top-level `producer` object;
- no `accepted_duplicate` or `rejected_*` status values;
- tenant/record allowlists are registry policy, not JWT array claims;
- `runtime_instance_id` is validated from the wrapper/registration rather than
  required as the service token identity;
- accepted evidence creates a durable outbox handoff, not a Bucket 7
  materializer job.

Those are frozen contract decisions, not missing implementation.

## Bucket 6 — Evidence storage

Status: **DONE against the frozen storage contract; older schema sketch
superseded**

Proven:

- `EvidenceStore`, local/test SQLite, and production-shaped Postgres adapters;
- packaged migration `starliner_ingest/migrations/0001_evidence_store.sql`;
- accepted evidence, safe rejected metadata, certification ledger, ingest
  audit, migration ledger, export cursor, tombstone, and outbox tables;
- Postgres append-only update/delete trigger;
- database-enforced four-part idempotency uniqueness;
- concurrent duplicate admission produces one accepted row and one outbox row;
- tenant-bound opaque cursor replay/export ordered by
  `(received_at, evidence_id)`;
- safe rejected rows never store the raw rejected body;
- the same admission behavior is exercised against SQLite and Postgres.

Intentional differences from the older text:

- the accepted table is `accepted_evidence`, not `evidence_records`;
- replay order is `(received_at, evidence_id)`, not
  `(occurred_at, ingested_at, evidence_id)`;
- the evidence row has no mutable materialization status;
- `outbox_events` is the durable Bucket 7 handoff; materializer jobs and runner
  state belong to the next bucket.

## Remaining non-blocking items

- Fill the exact Postgres container name, volume name, and export path from the
  original server-connected report; do not infer them.
- Retarget the public runtime certification identity from `a877f5e...` when the
  closure commit is deliberately deployed.
- Define terminal-ledger retention/archival and production backup/restore.
- Add response-idempotency correlation and byte-bounded or priority-aware
  batching only through a separate compatibility decision.
- Complete production RBAC, dynamic registry, tenancy, retention, HA/DR, and
  deployment-mode decisions outside M1.

## Final M1 statement

```text
MCP M1 Buckets 1-6 are closed for the frozen executable scope.
Remaining items are proof-ledger metadata or non-M1 production hardening.
The repository state is ready for an explicit handoff to LLM Gateway sensor work.
```

## Final Agent 2 server and record-family verification

As of 2026-07-16, Agent 2's final server sanity pass supplied the following
safe, metadata-only proof. This documentation pass did not reconnect to the
server or copy credentials, raw evidence, or runtime configuration values.

Server revisions and health:

- Starliner ingest/evidence checkout:
  `main@e611002f40f3fc9a4a4b896fb4039dab83082e93`;
- gateway source checkout:
  `add_gateway@01d486bb9998b5f9fcc692a744d9591c2677ad17`;
- gateway delivery-closure code is canonical at
  `add_gateway@624dbb7c6d497b109aa02dfeb25c8800538d9c8c`, but this server
  proof does not claim that follow-up revision was deployed;
- ingest `/healthz` and `/readyz` returned HTTP `200` / `200`;
- gateway local and public `/health` returned HTTP `200` / `200`;
- `/starliner/manifest` returned HTTP `200` with runtime `active` in
  `observe` mode;
- `/starliner/selftest` and `/starliner/metrics` returned HTTP `200`.

Registry and evidence proof:

- the final `allowed_record_types` value, treated as an order-insensitive set,
  was exactly:

  ```text
  source_observation
  action_event
  metric_event
  finding_signal
  ```

- the safe Excalidraw smoke used `tools/list` only, returned five tools, and
  made no `tools/call`;
- temporary-token revocation residue was `0`;
- pending outbox depth moved `5 -> 0` and remained `0`;
- tenant-bound evidence export returned five records;
- replay with page size two returned page counts `2`, `2`, and `1`;
- evidence remained exactly five records during the final registry/duplicate
  sanity pass;
- the leak scan passed with no raw tool arguments, tool results, headers,
  cookies, bearer tokens, credentials, or secret configuration values exposed
  or persisted.

The in-process duplicate metric did not advance during the bounded observation
window. This is recorded as an observability limitation, not a durable-state
failure: outbox depth remained zero and append-only evidence remained exactly
five records.

Historical terminal rows migrated from the earlier runtime have no
`evidence_id` because that runtime did not capture the returned ID. This is
expected historical provenance, not evidence loss introduced by migration.
The current gateway test
`test_mixed_delivery_batch_terminalizes_safely_and_retries_unknown_result`
proves that new `accepted` and `duplicate` results persist their bounded
`evidence_id` values in metadata-only terminal rows.

### MCP Observe v1 family truth

The exact MCP M1 certified record families are:

```text
source_observation
action_event
metric_event
finding_signal
```

Verification against canonical code and tests confirms:

- all four models exist in `starliner_contracts` and are registered by
  `CONTRACT_MODELS`;
- `MCPObserveMapper` produces all four across observed tool-call and native-DLP
  block paths, and product-local certification validates their delivery
  wrappers;
- file-registry and Postgres preprod tests use an `allowed_record_types` set
  containing all four and prove accepted, duplicate, persisted, and replayed
  behavior;
- no MCP M1 documentation requires every sensor to emit every Starliner
  canonical family.

The following families are outside MCP M1 unless deliberately added and
certified later:

```text
entity_snapshot
relationship_event
decision_result
trace_span
sensor_health_event
cost_event
```

The manifest declares the first five of those as deferred enhanced coverage.
`cost_event` is outside the MCP M1 capability surface entirely. Neither
omission nor deferral authorizes implicit emission.
