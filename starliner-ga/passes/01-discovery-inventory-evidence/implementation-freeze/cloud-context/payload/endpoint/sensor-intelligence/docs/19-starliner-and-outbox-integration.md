# 19 — Starliner and Durable Outbox Integration

## Decision

**Proposed:** the endpoint compound sensor integrates with the platform-owned
`starliner_contracts` ABI and `/v1/evidence/ingest`, but it needs a production
Rust delivery/outbox implementation and endpoint contract extensions before
shipping.

The current endpoint delivery paths are compatibility paths, not Starliner:

```text
System Monitor → dashboard /ea/v1/sync/*
Proxy → local alerting service → configured alert backend
Hooks → ActivityBatcher → dashboard /ea/v1/sync/activity
Diagnostics → broker → optional OpenSearch
Persona → separate auth/heartbeat backend
```

None provides the required common sensor identity, certification, immutable
delivery envelope, tenant-isolated durable outbox, per-record acknowledgement,
and replay across all endpoint record families.

## Inspected Starliner foundation

This analysis inspected the separate local source tree
`/Users/t4ctic4l/Documents/Codex/Consolidate/project-starliner-audit`.
Statements below describe that checked source, not code in the endpoint repo.

### Authoritative ABI

`docs/adr/ADR-001-starliner-abi-source-of-truth.md` accepts
`starliner_contracts` as the only new Quilr 2 ABI. The legacy
`starliner.contracts` package is compatibility-only.

`DeliveryRecord` is:

```text
envelope: DeliveryEnvelope
body: canonical Starliner v1 record
```

The envelope verifies:

- tenant, record type, and canonical body schema;
- sensor ID;
- adapter, contract, certification, and runtime-instance identity;
- record origin and evidence quality;
- occurrence time and optional request/flow/span correlation;
- idempotency key;
- SHA-256 body and whole-record hashes;
- a bounded `SafePayloadSummary`.

The ingest service accepts wrapped records, verifies envelope/body/hash/
correlation consistency, runs safety checks, optionally evaluates runtime trust,
persists the inner canonical record, and retains the delivery envelope as
transport provenance.

### Reference delivery runtime

`starliner_delivery` supplies:

- `RuntimeSensorIdentity`;
- `LocalSensorOutbox` backed by SQLite WAL;
- canonical-record validation and secret/banned-key checks;
- record/batch/queue limits;
- tenant-isolated stable-order batches;
- `/v1/evidence/ingest` client;
- accepted/duplicate/rejected result handling;
- retry classification, exponential backoff, jitter, and safe errors.

Defaults in `DeliveryConfig` are:

| Setting | Default |
| --- | ---: |
| ingest path | `/v1/evidence/ingest` |
| maximum record | 256 KiB |
| maximum queue rows | 10,000 |
| maximum batch records | 100 |
| maximum batch bytes | 2 MiB |
| maximum attempts | 5 |
| initial / maximum backoff | 1 / 60 seconds |
| jitter | 0.2 |
| SQLite busy timeout | 5,000 ms |

These defaults are external reference behavior. They are not endpoint
configuration and should not be copied into production without load/retention
analysis.

## Starliner foundation gaps affecting endpoint adoption

### Delivery wrapper and reference outbox mismatch

**Contradiction:** the ingest service and `starliner_contracts` support
`DeliveryRecord {envelope, body}`. `starliner_delivery.validation.validate_for_outbox`
looks only for top-level `schema` and validates the payload as a canonical body.
No call from `starliner_delivery` to `build_delivery_record` was found.

Therefore the reference outbox/worker, as inspected, queues and sends bare
canonical bodies even though production ingest can require delivery envelopes.
The endpoint must not claim envelope-backed runtime provenance until the
delivery implementation builds, validates, persists, and sends the wrapper.

### Stranded in-flight rows

**Potential issue requiring validation:** `DeliveryWorker.flush_once` changes
selected rows to `in_flight` before network transmission. `due_records` selects
only `pending` and `failed_retryable`. No lease, startup recovery, or stale
`in_flight` reset was found. A process crash after `mark_in_flight` can strand
rows indefinitely.

Production endpoint requirements:

- `in_flight` lease owner and expiry;
- atomic claim with compare-and-set;
- startup reclamation of expired claims;
- safe duplicate resend after an uncertain response;
- acknowledgement persisted in the same transaction as terminal state.

### Missing per-record results treated as accepted

**Potential issue requiring validation:** on a successful HTTP response,
`DeliveryWorker._apply_success_response` substitutes `{"status":"accepted"}`
when the response has fewer result objects than sent records. Production
delivery should treat a missing/misaligned result as retryable protocol failure,
not acknowledgement.

### Reference/dev status

The Starliner documentation explicitly labels `LocalSensorOutbox` as
reference/dev rather than final production storage. It lacks demonstrated
production key management, disk-quota enforcement, compaction, retention,
corruption recovery, multi-process ownership, backup/repair, and installer
upgrade semantics.

### Canonical-before-durable limitation

The reference outbox validates canonical bodies before queueing and retains no
invalid raw record. For endpoint source archaeology and future remapping, the
sensor requires a privacy-approved immutable native record/evidence layer before
canonical mapping. That native layer must not persist forbidden secrets and
must be independently retention controlled.

## Current endpoint buffering and durability

| Path | Current buffer | Durable | Acknowledgement | Replay | Loss behavior |
| --- | --- | --- | --- | --- | --- |
| Entity inventory | `EntityStore` + JSON snapshot | current state only | backend mapping is not a durable record ack | snapshot bootstrap | intermediate changes and process exits not retained |
| Discovery ingest | pending flag in entity state | partial current-state durability | response mappings update state | next sync cycle | converted batch has no WAL and parse failure can leave uncertain state |
| Governance delta | cursor in store/snapshot | cursor only | none | later poll | cursor is saved before applying; source calls this crash safety although a crash can skip re-fetch and rely on idempotent local state already being durable only at next snapshot |
| Hook request | IPC and JSONL append | JSONL best effort | local `HookResponse` only | none | IPC failure fails open by default; activity can be absent |
| Activity | bounded mpsc + batch vector | no | success HTTP response only | one retry | channel-full drops one record; exhausted batch drops all |
| Enforcement alert | async HTTP | no | HTTP status first attempt | one retry | retry non-success response can be silently lost |
| Proxy alerting | alert-specific SQLite queue | alert records only | alert delivery semantics | alert-specific retries | does not cover non-alert sensor data |
| Diagnostics | local channel/broker | no common WAL | no sensor ack | reconnect behavior varies | receiver/backend loss possible |
| Logs/traffic | files | file persistence only | none | operator read | rotation/truncation and schema instability |

**Potential issue:** `poll_delta` calls `store.set_delta_cursor(delta.cursor)`
before applying all settings. The comment claims replay crash safety, but the
cursor advancement actually prevents re-fetch of the same delta after restart
if the new cursor is durably snapshotted before all settings are applied.
Whether that ordering loses governance depends on snapshot timing and process
failure point; it requires a fault-injection test.

## Target outbox pipeline

```text
native capture
→ apply source-side privacy classification
→ construct immutable internal capture record
→ commit component outbox transaction
→ return to capture path
→ decode/map to accepted Starliner body
→ build DeliveryRecord envelope
→ atomically claim due records
→ batch by tenant and size
→ authenticate and send
→ validate one result per sent record
→ accepted/duplicate: mark complete
→ rejected: terminal quarantine with safe error
→ retryable: release with backoff
→ expire/archive only under retention policy
```

For proxy throughput, group commit may be required, but the product must not
call an uncommitted in-memory record “durably captured.”

## Endpoint outbox record

The production outbox must retain at least:

| Field | Requirement |
| --- | --- |
| `outbox_id` | local storage key; not a cross-system ID |
| `native_record_id` | stable retry/correction identity |
| `tenant_id` | immutable after enrollment |
| `sensor_instance_id` | installed endpoint sensor identity |
| `component` / `component_instance_id` | producer and boot/runtime namespace |
| `record_type` / native schema version | decoder and replay selection |
| target schema / adapter version | derived-body compatibility |
| component sequence | local ordering; monotonic within component instance |
| occurred / observed / captured / created times | distinct time semantics |
| protected evidence reference | optional; no raw secret in ordinary row |
| payload/body/record hashes | integrity and conflict detection |
| canonical body and delivery envelope | exact bytes to resend once mapped |
| status | pending/claimed/accepted/duplicate/rejected/retryable/terminal/expired |
| claim owner / lease expiry | crash-safe multi-worker claim |
| delivery attempts / next attempt | bounded retry state |
| last safe error | code and non-sensitive summary only |
| evidence ID / acknowledgement time | central admission result |
| expiration / retention class / legal hold | lifecycle control |
| correction/supersession reference | immutable correction chain |

## Idempotency

Use two IDs:

1. `native_record_id` identifies the source statement/revision.
2. Delivery `idempotency_key` identifies the exact tenant, sensor, schema,
   native statement/revision, and canonical body version being admitted.

The endpoint cannot use payload hash alone:

- two identical prompts may be separate actions;
- two rediscovery events for the same entity may be legitimate;
- current hook requests have no native event ID;
- current proxy requests may lack one stable ID across all stages.

Generated IDs must include a versioned component instance and sequence or
source-native discriminator. An idempotency-key collision with a different
record/body hash is an integrity conflict, never a duplicate.

## Ordering and correction

- Preserve sequence per component instance.
- Preserve native session/request/flow IDs where available.
- Do not manufacture total host ordering from timestamps.
- Accept out-of-order/late records centrally.
- Inventory refresh is an upsert/observation, not an event-order guarantee.
- A correction appends a new record referencing the original.
- A tombstone expires only the endpoint source assertion.
- Snapshot bootstrap records must be marked as snapshot/backfill origin and
  must not look like event-time discovery.

## Backpressure and priority

Suggested priority classes:

1. control result and observed effect;
2. inventory tombstone/correction and sensor health transition;
3. policy decision and security detection;
4. hook/proxy/process activity;
5. inventory refresh;
6. aggregate metrics;
7. debug diagnostics.

**Proposed:** maintain separate quotas/partitions so debug or high-volume proxy
traffic cannot evict control evidence. On pressure:

- reduce or aggregate low-value metrics;
- suppress duplicate refreshes with explicit counters;
- retain safe drop summaries;
- degrade capability/coverage health;
- never silently rewrite an audit-grade capability to best-effort.

## Offline behavior

- Network outage must not stop local discovery or allowed traffic.
- Enforcement behavior during central outage is governed by signed last-known-
  good policy and explicit fail-mode; telemetry delivery failure must not
  silently choose allow/deny.
- Keep records until acknowledged or retention/quota policy acts.
- On reconnection, replay in stable per-partition order with tenant isolation.
- Backfill must be rate limited so live high-priority records are not starved.
- Long outage beyond retention is a reported coverage gap.

## Enrollment and runtime identity

The endpoint needs:

- stable installed `sensor_id`;
- new `runtime_instance_id` on each adapter start;
- deployment/environment/region;
- endpoint product repo/ref/commit;
- endpoint and adapter versions;
- compound sub-sensor versions and status;
- certification ID matching the emitted schemas/capabilities;
- producer fingerprints for each local component;
- authenticated tenant-bound workload identity;
- certificate/key rotation and revocation.

Persona user access tokens are not a substitute for sensor workload identity.
The three existing device-ID namespaces also cannot be selected as
`sensor_id` without an explicit migration/registration rule.

## Telemetry and control separation

### Telemetry

```text
Endpoint adapter
→ mutually authenticated Starliner ingest
→ accepted / duplicate / rejected per record
```

### Control

```text
Quilr control plane
→ signed command for tenant + sensor + component
→ endpoint adapter verifies signature / expiry / nonce / capability
→ local authenticated component dispatch
→ ControlResult
→ post-action ObservedEffect
```

Governance delta, app-ID mappings, process maps, DLP configurations, and
kill-switch messages remain distinct current control/config inputs. An ingest
response cannot carry an administrative side effect.

## Required Starliner work before endpoint MVS

1. Resolve the pre-resolution observation ABI mismatch.
2. Add endpoint entity kinds and relationship vocabulary or define bounded
   source-native extension fields.
3. Add endpoint finding signal types.
4. Make the delivery outbox wrapper-aware.
5. Add in-flight lease recovery and strict per-record result cardinality.
6. Supply a production outbox implementation or approve/certify a hardened
   endpoint SQLite design.
7. Add production workload authentication/attestation and endpoint producer
   registration.
8. Define `ControlCommand`, `ControlResult`, and `ObservedEffect` authoritative
   bodies if controls are in MVS; these names are mission target concepts but
   are not all registered current `starliner_contracts` schemas.
9. Provide protected raw-evidence reference semantics and deletion/retention
   behavior for endpoint prompt/body/file metadata.
10. Certify endpoint-specific golden traces and degraded modes.

## Acceptance criteria

- crash after local commit but before send replays the record;
- crash after send but before ack safely resends and becomes duplicate;
- stale `in_flight` claims are reclaimed;
- missing/misaligned result objects do not acknowledge records;
- tenant A records cannot enter tenant B batches/outboxes;
- invalid/secret-bearing records do not persist raw content;
- unsupported schema remains quarantined and visible;
- queue pressure changes health/coverage and never silently drops priority-1
  records;
- network outage and restart preserve pending records;
- central duplicate result links to the original evidence ID;
- upgrade/rollback with pending records is tested;
- current compatibility delivery may run in parallel without double-counting,
  using explicit source/record IDs during migration.

