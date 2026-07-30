# WAL, Delivery, and Offline Operation

Status: **normative**

## Durability promise

Once the runtime returns `admitted` to an adapter, the record is durably represented in the local write-ahead log. It remains there until:

1. the authoritative regional ingest has durably accepted it;
2. the ingest has returned an authenticated acknowledgement covering its sequence;
3. the runtime has persisted that acknowledgement; and
4. compaction has safely advanced beyond it.

“Sent,” “HTTP 2xx,” and “placed on an in-memory queue” do not satisfy this promise.

## WAL organization

The WAL is partitioned by producer identity, profile, and sequence epoch. Each segment has:

- versioned header;
- producer and workload identity;
- sequence epoch and inclusive range;
- creation and sealing times;
- encryption and key identifiers;
- per-record checksum;
- segment digest;
- compression metadata;
- recovery and compaction state.

Records use monotonic producer sequence numbers within an epoch. A new epoch requires an explicit lifecycle record and cannot silently reuse sequence numbers.

## Admission

Admission order is:

1. validate typed record;
2. apply privacy and export policy;
3. apply permitted pre-admission sampling or aggregation;
4. calculate stable record ID and integrity fields;
5. append and synchronize according to the profile durability class;
6. acknowledge the adapter.

If durability cannot be achieved, the runtime returns a typed failure. It never reports success and drops the record later.

## Batching and acknowledgement

Batches contain contiguous or explicitly sparse sequence ranges, stable batch IDs, record digests, compression metadata, and retry attempt metadata. The server response identifies:

- accepted sequence intervals;
- already accepted intervals;
- retryable record or batch failures;
- permanent schema/profile rejections;
- quarantine references;
- server backoff;
- server trust and protocol version.

Partial success is explicit. A permanent rejection remains locally diagnosable until operator policy authorizes bounded cleanup.

## Idempotency

The ingest deduplicates by tenant, producer, sequence epoch, and record ID. Replays produce the original acceptance result. A payload using the same identity tuple with a different digest is an integrity violation and is quarantined.

## Offline budget

Every deployment declares:

- maximum disk budget;
- target offline duration at certified load;
- reserve for lifecycle, reconciliation, policy, command, and health records;
- capture degradation ladder;
- operator notification thresholds;
- behavior at exhaustion.

These values are measured and profile-specific. They are not copied from a development fixture.

## Capture degradation ladder

The ladder is deterministic and visible. A typical ordering is:

1. reduce high-volume sampled activity before admission;
2. aggregate eligible repetitive observations;
3. disable optional enriched metadata;
4. retain lifecycle, reconciliation, policy, outcome, finding-supporting, and health records;
5. reject new low-priority admissions with a typed reason;
6. emit a visibility-gap record as soon as capacity permits.

No stage may delete already admitted records to make room.

## Crash recovery

Recovery:

- scans only uncommitted segment tails;
- truncates incomplete frames without discarding earlier valid frames;
- verifies checksums and segment digests;
- rebuilds the in-memory delivery index;
- resumes from persisted authenticated acknowledgements;
- isolates rather than overwrites corrupt segments;
- emits health state with the affected sequence interval.

Power-loss and process-kill tests must cover every filesystem and deployment form claimed as supported.

## Security

- WAL encryption keys are machine- or workload-bound and rotatable.
- Secret and restricted-content fields are rejected before the normal WAL.
- File permissions are least privilege.
- Diagnostic export requires authorization and performs a second privacy pass.
- Acknowledgements are bound to the authenticated ingest connection and regional tenant route.
- Anti-rollback metadata prevents an old runtime from misreading or weakening a newer WAL format.

## Compaction and retention

Compaction is incremental, crash-safe, and constrained to fully acknowledged ranges. A local retention tail may be kept for diagnostics only if declared by policy and protected equivalently. Expired local material is cryptographically or physically erased according to the platform and customer retention contract.

## Required proof

Certification includes:

- duplicated and reordered batches;
- partial acknowledgement;
- retry storms and throttling;
- credential expiration and rotation;
- network partition across process restarts;
- disk full and inode exhaustion;
- torn writes and corrupted tail frames;
- clock jumps;
- source epoch reset;
- upgrade with backlog;
- rollback with backlog;
- multi-day offline operation at profile load;
- evidence that no admitted record vanishes without a coverage consequence.
