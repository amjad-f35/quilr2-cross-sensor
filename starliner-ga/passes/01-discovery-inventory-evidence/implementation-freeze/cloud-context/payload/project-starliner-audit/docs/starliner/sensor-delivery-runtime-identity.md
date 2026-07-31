# Starliner Sensor Delivery and Runtime Identity Foundation

`starliner_delivery` is the platform-owned SDK/reference layer for reliably
moving canonical Starliner records from sensors to the Evidence Ingest API.

This is not product wiring. It provides reusable runtime identity, durable local
outbox, batching, retry, and safe error semantics that product sensors can later
consume.

## Placement

```text
Sensor Plane
  -> starliner_delivery
  -> Evidence Ingest Service (/v1/evidence/ingest)
  -> Evidence Plane
```

The delivery layer does not make policy decisions and does not enforce. It
does not call providers, upstream MCP backends, Kafka, Feldera, graph systems,
or cloud storage.

## Runtime Identity Model

`RuntimeSensorIdentity` carries:

- tenant and sensor identity (`tenant_id`, `sensor_type`, `sensor_id`,
  `sensor_version`);
- product build (`product_repo`, `product_ref`, `product_commit`,
  `adapter_version`, `contract_version`);
- deployment reference (`deployment_id`, `environment`, `region`);
- source reference (`source_ref`, `source_type`, `producer_fingerprint`);
- future auth/attestation fields (`auth_subject`, `auth_tenant`,
  `signed_attestation_ref`).

Local/dev can use unsigned/noop identity, but the model is shaped for future
signed runtime attestation. No production trust is invented in this pass.

## Delivery Protocol

Default endpoint:

```text
/v1/evidence/ingest
```

Request payload:

```json
{
  "api_version": "v1",
  "source_ref": "sensor://example",
  "source_type": "sensor",
  "runtime_identity": {},
  "records": []
}
```

The client parses per-record ingest results:

- `accepted`
- `duplicate`
- `rejected`

Only safe errors are surfaced. Raw records are not logged by the delivery layer.

## Local Sensor Outbox

`LocalSensorOutbox` is a SQLite reference/dev queue. It validates canonical
records with `starliner_contracts` before queueing. Unsafe records are rejected
before entering the outbox and are stored only as safe terminal metadata.

Statuses:

- `pending`
- `in_flight`
- `accepted`
- `duplicate`
- `rejected`
- `failed_retryable`
- `failed_terminal`

Tracked metadata:

- `attempt_count`
- `next_attempt_at`
- `last_error_code`
- `last_safe_error`
- `content_hash`
- `idempotency_key`
- `created_at`
- `updated_at`

SQLite is reference/dev only, not the final production outbox.

## Retry Semantics

Retryable:

- network timeout
- `429`
- `503`
- `5xx`

Terminal:

- `400`
- `413`
- per-record `rejected`

Duplicate is success-equivalent. Accepted and duplicate responses mark records
complete. Retryable failures stay in the queue with exponential backoff and
jitter. Max attempts eventually marks a record `failed_terminal`.

## Batching

Batch builder rules:

- max batch records;
- max batch bytes;
- stable ordering by `created_at` / `sequence_id`;
- skip records not due for retry;
- include runtime identity/source metadata once per request;
- do not batch across tenants.

## CLI

```bash
starliner-delivery enqueue records.jsonl --db delivery.db ...
starliner-delivery flush --db delivery.db --ingest-url http://127.0.0.1:8765 ...
starliner-delivery status --db delivery.db
```

CLI output is JSON and safe for logs.

## Production Gaps

Not included:

- signed runtime attestation;
- product adapter wiring;
- background daemon/service manager;
- production queue implementation;
- Kafka/Feldera/graph/cloud storage;
- OPA or enforcement;
- production auth.

The foundation defines contracts and local reference behavior so product sensors
can later adopt delivery without changing the Starliner ABI.
