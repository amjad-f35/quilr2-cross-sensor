# M1 Buckets 5-6 Proof

> Closure and deployment status is superseded by
> [MCP M1 Buckets 1-6 Proof and Closure Ledger](mcp_m1_buckets_1_6_proof.md).
> This document remains the detailed implementation proof for Buckets 5-6.

Scope: Starliner ingest/evidence consumer side at the frozen
`project-starliner/main@860079c312c13f842b5804a590fa1d5430860286` ABI.
Buckets 5-6 did not change the MCP sensor or ABI. Producer-side terminal
delivery follow-up is recorded at
`quilr-llm-gateway@624dbb7c6d497b109aa02dfeb25c8800538d9c8c`.

Status: production-shaped, preprod-deployable, and live-proven in the internal
dev/preprod spine; not production-ready.

## Implemented surface

- strict environment/auth/storage configuration and startup guards;
- service JWT verification with inline/file static asymmetric key or bounded
  JWKS resolver;
- file-backed or injected registry trust interface;
- JSON-only, byte-bounded `POST /v1/evidence/ingest`;
- accepts the frozen producer request shape
  `{"api_version":"v1","records":[{"envelope":{},"body":{}}]}`;
- exact per-record status vocabulary: `accepted`, `duplicate`, `rejected`;
- wrapper/hash/schema/payload/trust admission;
- four-part idempotency scope with record-hash conflict detection;
- SQLite local/test adapter;
- packaged Postgres migration, append-only trigger, safe rejected metadata,
  certification ledger, ingest audit, and durable outbox handoff;
- deterministic tenant-bound replay/export and rejected query;
- `/healthz`, `/readyz`, `/metrics`;
- validate, ingest, serve, replay/export, certification, migrate, and
  healthcheck CLI paths.

## Frozen producer compatibility proof

`tests/starliner_ingest/test_gateway_contract_e2e.py` creates the four current
MCP families through `build_delivery_record`:

- `source_observation`
- `action_event`
- `metric_event`
- `finding_signal`

The first gateway-shaped API batch returns four `accepted` results. Exact replay
returns four `duplicate` results and does not append evidence or outbox rows.
Tampered and payload-unsafe wrappers return `rejected`; rejected storage does
not contain the raw canary. Same-scope/different-hash reuse returns
`idempotency_conflict`; cross-sensor and cross-record-type keys remain
independent.

The compatibility classifier records the frozen worker behavior:

- `accepted` -> terminal success with safe `evidence_id` metadata;
- `duplicate` -> terminal success with safe `evidence_id` metadata;
- `rejected` -> immediate terminal non-retryable dead letter;
- unknown status -> bounded retry.

Transport, timeout, network, malformed response, 429, 5xx, and unknown status
failures retry to a bounded `failed_terminal` state. Ingest's honest
`rejected` vocabulary remains unchanged.

## Local proof commands

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -e ".[dev,postgres]"
.venv/bin/python -m pytest tests/starliner_ingest -q -m "not integration"
TESTCONTAINERS_RYUK_DISABLED=true \
  .venv/bin/python -m pytest \
  tests/starliner_ingest/test_postgres_evidence_store.py -q -m integration
.venv/bin/ruff check starliner_ingest tests/starliner_ingest
.venv/bin/ruff format --check starliner_ingest tests/starliner_ingest
.venv/bin/python -m pytest -q
```

Observed during implementation:

- SQLite/API/auth/trust/replay/CLI proof: `74 passed`.
- Docker-backed Postgres migration/duplicate/replay/append-only/concurrency
  plus four-family RS256/file-registry preprod FastAPI proof: `5 passed`.
- No-Docker behavior: integration tests skip with the explicit reason
  `Docker is unavailable for Postgres integration tests`.
- Full non-Docker repository suite: `341 passed, 5 skipped, 5 deselected`.
- Ruff check/format, schema export, positive/negative golden traces, legacy ABI
  import guard, workflow YAML, and CLI smoke: PASS.

## Postgres proof

The packaged `starliner_ingest/migrations/0001_evidence_store.sql` creates:

- `accepted_evidence`;
- `rejected_evidence`;
- `sensor_certification_ledger`;
- `ingest_requests`;
- `schema_migrations`;
- `outbox_events`.

Integration tests verify:

- migration currency under a no-DDL runtime store;
- unique `(tenant_id, sensor_id, record_type, idempotency_key)` admission;
- same-hash duplicate and different-hash conflict behavior;
- concurrent duplicate admission produces one accepted row/outbox row;
- accepted evidence update/delete is rejected by the database trigger;
- validated delivery envelope and canonical body are retained separately;
- stable `(received_at, evidence_id)` cursor replay;
- health reports schema currency;
- an env-constructed preprod app accepts and duplicate-replays all four frozen
  MCP record families through RS256, a public-key file, and
  `FileSensorRegistry`.

## Safety proof

- Authentication tests cover required claims, issuer/audience, expiry,
  not-before, issued-at, bounded skew, scope, static RSA verification,
  algorithm allowlisting, explicit `alg=none` rejection, and bounded JWKS cache
  construction.
- Config tests reject noop/SQLite/in-memory-registry/symmetric-JWT production
  configurations and missing Postgres/JWT inputs without printing values.
- File-registry tests reject malformed, empty, duplicate, and unknown-sensor or
  unknown-certification inputs without returning file values, paths, DSNs, or
  key material.
- API tests cover 200/207/400/401/403/413/415 and generic safe 500 responses.
- Payload canaries do not appear in rejected rows, API errors, metrics, CLI
  output, or exception responses.
- Metrics do not use tenant IDs as default labels.

## Known limits

- The live proof is an internal dev/preprod spine, not a production
  infrastructure or SLO claim.
- No materializer/runner, read model, product API/UI, Feldera, graph, or policy
  enforcement is included.
- SQLite is reference-only and is blocked in preprod/prod.
- `FileSensorRegistry` is an immutable startup snapshot for first preprod; a
  managed dynamic production registry and availability SLO remain future
  control-plane work. In-memory registry remains local/test only.
- `starliner-ingest serve` is preprod-deployable from env with Postgres, RS256,
  a public-key file, and the file registry.

## Preprod deployment handoff

The server-connected smoke used the existing Ubuntu dev/preprod node with
ingest bound to `127.0.0.1:18080`, local Postgres, an RS256 service JWT, and the
file-backed sensor registry. The exact registry path is not present in the
available report excerpt.

Safe result:

- gateway source checkout:
  `01d486bb9998b5f9fcc692a744d9591c2677ad17`;
- outbox pending: `5 -> 0`;
- ingest: `accepted=5`, `duplicate=0`, `rejected=0`;
- tenant-bound export: five records;
- replay page size two: page counts `2`, `2`, `1`;
- temporary smoke API token: revoked;
- safe Excalidraw `tools/list` only; no `tools/call`;
- leak scan: passed with no raw arguments, results, headers, cookies, bearer
  tokens, credentials, secret-file values, or raw source payloads.

The exact Postgres container name, volume name, registry path, and export path
are absent from the available report excerpt:

```text
NEEDS_INPUT:exact Postgres container name from the server-connected smoke
NEEDS_INPUT:exact Postgres volume name from the server-connected smoke
NEEDS_INPUT:exact sensor registry path from the server-connected smoke
NEEDS_INPUT:exact server evidence export path from the server-connected smoke
```

Do not invent those values. The complete Bucket 1-6 status and follow-up
delivery semantics are maintained in
`docs/starliner/mcp_m1_buckets_1_6_proof.md`.

