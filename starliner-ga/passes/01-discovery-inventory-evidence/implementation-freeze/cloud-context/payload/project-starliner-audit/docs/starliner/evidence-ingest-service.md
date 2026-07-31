# Starliner Evidence Ingest and Evidence Store

Buckets 5-6 provide a production-shaped, preprod-deployable ingest and
append-only evidence design, locally proven with SQLite and Docker-backed
Postgres. The internal dev/preprod spine has also accepted, exported, and
replayed five MCP records. This is not a production-readiness, public revision,
SLO, HA/DR, or operational-ownership claim.

SQLite remains a reference/dev adapter. `PostgresEvidenceStore` supplies the
production-shaped append-only relational path, with versioned migrations and
local Testcontainers coverage; provisioning and operational ownership remain
external deployment inputs.

## Plane Mapping

- Ingest Plane: `POST /v1/evidence/ingest`, admission control, canonical schema
  validation, delivery-wrapper integrity, payload safety, idempotency, and
  partial-batch semantics.
- Evidence Plane: append-only `EvidenceEnvelope` records with deterministic
  `content_hash`, `idempotency_key`, source provenance, and replay/export.
- Release Provenance / Runtime Identity: `SensorCertificationRecord` ingestion
  updates the local certification ledger and can be queried by sensor, product,
  contract, and capability.
- Runtime Trust: a validated delivery envelope is checked against a configured
  tenant/sensor registry before persistence. File-backed preprod, injected
  control-plane, and local test adapters use the same gate.
- Data Governance / Payload Safety: unsafe records are rejected before
  persistence. Rejection rows contain safe error codes, field paths, and
  violation labels only.

## API Contract

Route:

```text
POST /v1/evidence/ingest
```

Request body:

```json
{
  "api_version": "v1",
  "source_ref": "local://example",
  "source_type": "local_dev",
  "persist_decision_requests": false,
  "records": []
}
```

The frozen MCP producer sends exactly `api_version` and `records`. The extra
source fields below are local migration inputs and authenticated producers may
not override identity with them.

Response contains one result per record. `results[i].status` is a closed enum:
`accepted`, `duplicate`, or `rejected`. Detailed reasons appear only in safe
`errors[]` entries.

```json
{
  "api_version": "v1",
  "status": "partial",
  "accepted": 1,
  "rejected": 1,
  "duplicates": 0,
  "results": []
}
```

HTTP semantics:

- `200`: all records accepted or duplicate.
- `207`: one or more records were rejected, including an all-rejected batch.
- `400`: malformed request envelope.
- `401`: missing, expired, or invalid service bearer token.
- `403`: authenticated identity lacks scope or attempts an override.
- `413`: raw request or batch exceeds admission limits.
- `415`: the ingest request is not JSON.
- `500`: unexpected failure, represented by a generic safe code only.

All API responses are safe for logs: no raw payloads, raw validator exception
strings, raw prompts, raw tool arguments, or raw secret values.

The frozen MCP gateway clears `accepted` and `duplicate`. It treats `rejected`
or an unknown status through its own bounded retry/terminal path. Ingest never
lies by relabeling a rejection as success; producer-side rejected-result
terminalization remains a separate compatibility follow-up.

## Validation and Safety

Accepted schemas:

- `ActionEvent`
- `DecisionResult`
- `EntitySnapshot`
- `RelationshipEvent`
- `Finding`
- `CostEvent`
- `TraceSpan`
- `SensorHealthEvent`
- `ContractTestResult`
- `SensorCertificationRecord`
- `SourceObservation`
- `MetricEvent`
- `FindingSignal`

`DecisionRequest` is validate-only by default and is not persisted unless the
caller explicitly sets `persist_decision_requests=true` /
`--persist-decision-requests`.

The service reuses `starliner_contracts` canonical models and payload-safety
checks. Pydantic `ValidationError` strings are never persisted or logged because
they can include raw `input_value`. Errors are mapped to sanitized fields:

- `error_code`
- safe field path / JSON pointer
- schema name
- violation labels
- bounded message template

Rejected evidence never stores the original rejected record.

## M1 Delivery Wrapper and Runtime Trust

During migration, the service accepts legacy canonical records in local mode and
also accepts the M1 transport shape:

```json
{
  "envelope": {
    "tenant_id": "ten_acme",
    "sensor_id": "mcp_gateway",
    "record_type": "action_event",
    "body_hash": "sha256:...",
    "record_hash": "sha256:..."
  },
  "body": {
    "schema": "starliner.action_event.v1"
  }
}
```

For a wrapper, ingest validates the outer schema, canonical body schema,
tenant/schema/record-type identity, correlation fields, body hash, record hash,
and payload-safety rules before it considers the body persistable. The immutable
canonical body is stored unchanged; the validated outer envelope and bounded
auth/trust provenance are stored separately as `transport_metadata`.

`ServiceJWTAuthVerifier` requires signature, issuer, audience, `exp`, `nbf`,
`iat`, `sub`, `tenant_id`, `sensor_id`, and the
`starliner.evidence.ingest` scope. Algorithms are allowlisted and `alg=none` is
rejected before decode. Production key sources are HTTPS JWKS with a bounded
cache/refresh-on-key-miss or a static asymmetric public key for customer cloud,
on-prem, and air-gapped deployments. HMAC is retained for local integration
tests only and is forbidden in preprod/prod configuration. Safe authentication
codes are limited to `auth_missing`, `auth_invalid`, `auth_expired`,
`auth_forbidden`, and `auth_misconfigured`.

`RuntimeTrustGate` checks the validated envelope against a `SensorRegistry`:

- authenticated tenant and sensor must match the envelope;
- registered allowed record types, auth subjects, origins, and evidence quality
  are enforced;
- `trusted` and configured `degraded` producers are admitted;
- `unknown`, `uncertified`, `revoked`, and `rejected` producer states are
  rejected by default with safe error codes;
- runtime instance, certification, contract, and adapter versions can be
  constrained by registration policy.

`SensorRegistry` is behind an interface. `InMemorySensorRegistry` is local/test
only. `FileSensorRegistry` is the first preprod-deployable provider; an injected
control-plane provider remains supported. Preprod/prod startup rejects
in-memory trust and readiness reports provider availability.

## Runtime configuration and startup guards

The service reads:

- `STARLINER_ENV=local|dev|test|preprod|prod`
- `STARLINER_AUTH_MODE=noop|service_jwt`
- `STARLINER_STORAGE=sqlite|postgres`
- `STARLINER_POSTGRES_DSN`
- `STARLINER_JWT_ISSUER`, `STARLINER_JWT_AUDIENCE`
- exactly one of `STARLINER_JWKS_URL`, `STARLINER_JWT_PUBLIC_KEY`, or
  `STARLINER_JWT_PUBLIC_KEY_FILE`
- `STARLINER_JWT_ALGORITHMS`, bounded JWT clock skew, JWKS cache TTL, and JWKS
  request timeout
- bounded request, batch, and record limits
- `STARLINER_REGISTRY_MODE=in_memory|injected|file`,
  `STARLINER_REGISTRY_PATH`, and
  `STARLINER_ALLOW_DEGRADED_TRUST`
- `STARLINER_REQUIRE_DELIVERY_WRAPPERS` (the former
  `STARLINER_REQUIRE_DELIVERY_ENVELOPES` name remains a compatibility alias)

Startup fails with safe codes, never values, when configuration is incomplete.
Preprod/prod forbid noop auth, SQLite, symmetric signing keys, missing delivery
wrappers, automatic in-process registry defaults, and a missing Postgres DSN.
Production defaults to schema verification without DDL; migrations run
separately under a migration role.

### File registry contract

`STARLINER_REGISTRY_MODE=file` loads one immutable JSON snapshot at process
startup. Empty, malformed, oversized, duplicate tenant/sensor, unknown-field,
or empty-record-type registrations fail startup with `registry_file_invalid`;
file paths and values are not returned. Restart the process after an approved
registry change.

The exact JSON shape is:

```json
{
  "schema": "starliner.sensor_registry.v1",
  "registrations": [
    {
      "tenant_id": "<tenant_id from pending delivery envelopes>",
      "sensor_id": "mcp_gateway",
      "auth_subject": "<JWT sub>",
      "runtime_instance_id": "<runtime_instance_id from pending envelopes>",
      "certification_id": "<certification_id from pending envelopes>",
      "contract_version": "<contract_version from pending envelopes>",
      "adapter_version": "<adapter_version from pending envelopes>",
      "allowed_record_types": [
        "source_observation",
        "action_event",
        "metric_event",
        "finding_signal"
      ],
      "allowed_record_origins": ["live_sensor"],
      "allowed_evidence_qualities": ["operational"],
      "trust_state": "trusted"
    }
  ]
}
```

Build this file from safe envelope metadata and the verified runtime manifest;
do not copy raw evidence payloads, tokens, arguments, or results into it. One
tenant/sensor row deliberately binds the JWT subject and exact runtime,
certification, contract, and adapter identifiers.

### Preprod environment

The stock CLI can now construct the file-registry preprod app entirely from
environment configuration:

```text
STARLINER_ENV=preprod
STARLINER_AUTH_MODE=service_jwt
STARLINER_STORAGE=postgres
STARLINER_POSTGRES_DSN=<secret source>
STARLINER_REGISTRY_MODE=file
STARLINER_REGISTRY_PATH=/home/ubuntu/dev/starliner-secrets/sensor-registry.json
STARLINER_JWT_ISSUER=quilr-starliner-preprod
STARLINER_JWT_AUDIENCE=starliner-ingest
STARLINER_JWT_PUBLIC_KEY_FILE=/home/ubuntu/dev/starliner-secrets/jwt_public.pem
STARLINER_JWT_ALGORITHMS=RS256
STARLINER_REQUIRE_DELIVERY_WRAPPERS=true
STARLINER_APPLY_MIGRATIONS=true
```

Keep the environment file, registry snapshot, and key files outside the
repository with deployment-controlled permissions. After bootstrap, a
least-privilege runtime role should use `STARLINER_APPLY_MIGRATIONS=false`.

## Evidence Envelope

Accepted records are wrapped in an immutable envelope:

- `evidence_id`
- `tenant_id`
- `schema`
- `schema_version`
- `sensor`
- `sensor_id`
- `record_type`
- `request_id`
- `flow_id`
- `source_ref`
- `source_type`
- `source_identity`
- `producer_fingerprint`
- `auth_subject`
- `auth_tenant`
- `identity_mode`
- `received_at`
- `content_hash`
- `body_hash`
- `record_hash`
- `idempotency_key`
- runtime instance, certification, adapter, contract, origin, quality, and
  trust status
- `validation_status`
- `partition_key`
- `audit_trace_id`
- `transport_metadata` (validated delivery envelope plus bounded trust/auth
  provenance only)

Accepted evidence must include source provenance. Under `NoopAuthVerifier`, the
local default is `source_ref=local://starliner-ingest`.

`content_hash` is computed from canonical record JSON only. Envelope-only fields
such as `evidence_id`, `received_at`, `source_ref`, `auth_subject`, and
`idempotency_key` are excluded.

Database uniqueness is exactly:

```text
(tenant_id, sensor_id, record_type, idempotency_key)
```

Within that scope, the same `record_hash` returns `duplicate` and the retained
evidence ID. A different `record_hash` returns `rejected` with
`idempotency_conflict`; accepted evidence is never overwritten. Tenant, sensor,
and record-type scopes are independent. The database constraint is the
concurrency boundary.

## Delivery Semantics

The service is at-least-once compatible:

- repeated delivery in the same four-part scope with the same record hash
  returns the existing `evidence_id`;
- duplicates do not append new accepted evidence;
- partial batches commit accepted records and reject unsafe records independently;
- accepted evidence is immutable.

The local SQLite adapter uses one transaction per record so partial batch success
is possible. Accepted evidence insert, certification ledger update, and local
outbox enqueue are transactionally consistent where SQLite supports it.

## Storage Model

SQLite reference tables:

- `accepted_evidence`
- `rejected_evidence`
- `sensor_certification_ledger`
- `outbox_events`
- `ingest_requests`
- `schema_migrations`

Indexes exist for:

- `tenant_id`
- tenant/time, tenant/sensor/time, and tenant/record-type/time
- `request_id`
- `flow_id`
- `content_hash`
- `record_hash`
- `certification_id`
- `idempotency_key`

SQLite connection settings:

- WAL mode
- `busy_timeout`
- `foreign_keys=ON`

Logical partition key is modeled as:

```text
tenant_id/sensor/date
```

Production storage can later map this to Postgres partitions, object prefixes,
or Kafka keys.

### Postgres

`PostgresEvidenceStore` applies SQL migrations from
`starliner_ingest/migrations/`. Its initial migration includes:

- append-only `accepted_evidence` and rejected-evidence rows;
- separate validated delivery-envelope JSONB and canonical-body JSONB;
- unique tenant/sensor/record-type/idempotency constraint with record-hash
  conflict detection;
- `sensor_certification_ledger`, safe `ingest_requests`, and durable
  `outbox_events`;
- persisted export-cursor and retention-tombstone metadata;
- tenant/schema/received-at indexes for replay;
- a database trigger rejecting update or delete of accepted evidence.

All application queries use parameters. The local/default constructor applies
migrations; production should run migrations under a migration role, then create
`PostgresEvidenceStore(dsn, apply_migrations=False)` under a least-privilege
application role. Deployment must still provision backups/PITR, retention
policy, residency controls, connection pooling, and operational monitoring.

An accepted append and its durable outbox row share one transaction. Duplicate
admission cannot create a second outbox row. `pending_outbox()` provides the
recovery scan seam; materializer/runner implementation belongs to bucket 7 and
is intentionally absent.

Run local Postgres integration coverage without provisioning shared
infrastructure:

```bash
pip install -e ".[dev,postgres]"
TESTCONTAINERS_RYUK_DISABLED=true pytest tests/starliner_ingest/test_postgres_evidence_store.py
```

`TESTCONTAINERS_RYUK_DISABLED` is only a local Colima workaround; do not use it
as a production deployment setting. When Docker is unavailable, the integration
suite skips explicitly rather than claiming Postgres proof.

## Certification Ledger

When a `SensorCertificationRecord` is accepted, the service indexes it by:

- `sensor`
- `product_ref`
- `product_commit`
- `contract_version`
- `capability`

The ledger is an evidence/query projection. Runtime admission trust comes from
the configured registry provider, not from an unverified record self-assertion.

## Replay and Export

The store exposes an accepted-evidence iterator and stable tenant-bound cursor
pages. CLI:

```bash
starliner-ingest export-evidence --db .starliner/evidence.db --tenant-id ten_acme
starliner-ingest replay-evidence --db .starliner/evidence.db --tenant-id ten_acme --limit 100
starliner-ingest query-rejected --db .starliner/evidence.db --tenant-id ten_acme
```

Export output is JSONL and can feed future graph, intelligence, Feldera, or audit
pipelines. `replay-evidence` returns a `next_cursor` bound to its tenant and
schema/sensor/type/time filters; it resumes on `(received_at, evidence_id)`
without offset drift.
This pass does not implement those downstream systems.

Operational commands and routes:

```bash
set +x
set -a
. /home/ubuntu/dev/starliner-secrets/ingest.env
set +a
starliner-ingest validate-config
starliner-ingest migrate
starliner-ingest healthcheck
starliner-ingest serve --host 127.0.0.1 --port 18080
```

- `validate-config` validates the public-key PEM and complete registry content
  without printing either.
- Operational store commands use `STARLINER_STORAGE` and
  `STARLINER_POSTGRES_DSN` when `--db`/`--postgres-dsn` is omitted, keeping the
  DSN out of process arguments.
- `serve` resolves `FileSensorRegistry`, RS256 verification, and Postgres from
  the environment. Injected control-plane registries remain available through
  `create_configured_app`.
- `GET /healthz` proves the process is alive.
- `GET /readyz` checks authentication configuration, store reachability,
  migration currency, and required trust-provider readiness.
- `GET /metrics` exposes bounded counters/observations without payloads,
  tenant IDs, bearer material, or secret configuration, including the age of
  the oldest pending durable-outbox record as replay lag.

## Threat Model

The first security boundary is before persistence:

- reject banned raw-payload keys;
- reject raw SSN, credit-card, OpenAI key, and AWS key values;
- never store raw rejected payload;
- never persist/log raw validator exception strings;
- keep query paths tenant-scoped.

Tests assert leaked values do not appear in accepted rows, rejected rows, API
responses, or CLI output.

## Deployment status and remaining inputs

This implementation is production-shaped and preprod-deployable, not
production-ready or deployed. Not included in buckets 5-6:

- cloud storage;
- Feldera;
- graph or intelligence fanout;
- UI;
- OPA or enforcement;
- product adapter changes;
- deployed issuer/JWKS credentials or tenant mapping;
- a managed production registry/certification control plane (the strict file
  snapshot is the first preprod provider);
- Postgres deployment, role grants, backup/PITR, retention, residency, or
  HA/DR policy.

The service is production-shaped. SQLite is only the reference/dev storage
adapter, while Postgres is tested locally through Testcontainers rather than
provisioned in preprod.

See `m1_buckets_5_6_proof.md` for exact local proof and
`ingest-evidence-production-readiness.md` for deployment modes and
`NEEDS_INPUT` ownership.
