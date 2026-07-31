# Starliner and durable outbox integration


`Verified current state:` SQLite uses WAL; NATS JetStream workers implement
ack/NAK/redelivery and DB-writer backpressure; those mechanisms are specific to
current worker/persistence delivery. They are not a versioned Quilr 2.0 sensor
outbox and do not supply central observation acknowledgements.

`Proposed target:` each immutable observation stores stable record ID, tenant,
sensor instance, record type/schema, monotonic sequence, occurred/observed
times, payload digest, evidence references, attempts/error, create/expiry and
ack state. Capture commits locally before returning; publisher batches;
authenticated ingest acknowledges; records retry until policy expiry and then
dead-letter/operator handling.

Telemetry remains `Sensor → Quilr`. Any future control channel must be signed,
authorized, replay-protected and independently audited.
