# Edge Runtime Architecture

Status: **normative**

## Purpose

The Starliner Edge Runtime is the production runtime embedded in, or deployed beside, a sensor. It gives every sensor the same security, durability, management, and control behavior without moving source interpretation or canonical enterprise truth to the edge.

The runtime is not an inventory database, an identity resolver, an analytics engine, or a miniature tenant cell.

## Deployment forms

The same protocol behavior is supported in three forms:

1. **Embedded library** for a sensor whose process and release lifecycle Quilr controls.
2. **Local sidecar or daemon** when process isolation, independent upgrades, or privilege separation are required.
3. **Managed connector worker** inside the tenant cell for external APIs, webhooks, and sources where Quilr cannot deploy code.

The profile manifest declares the deployment form. Conformance requirements do not become weaker for an embedded runtime.

## Internal components

| Component | Responsibility | Durable state |
|---|---|---|
| Adapter SPI | Receives source-native safe facts and enforcement outcomes | No |
| Profile registry | Pins supported record types, capabilities, and source semantics | Manifest cache |
| Record builder | Validates, canonicalizes serialization, assigns record IDs, and applies privacy class | No |
| Privacy engine | Redacts, tokenizes, classifies, and blocks prohibited content before persistence | Policy cache |
| Local correlation | Creates observation, execution, and reconciliation correlation IDs | Minimal bounded cache |
| WAL/outbox | Persists admitted records until durable central acceptance | Yes |
| Delivery engine | Batches, compresses, signs, retries, and handles acknowledgements | Checkpoints |
| Policy cache | Stores signed, versioned, time-bounded policies needed locally | Yes |
| Enforcement adapter | Performs only declared and authorized local actions | Action journal |
| Command verifier | Verifies target, signature, authority, expiry, replay protection, and preconditions | Replay window |
| Health manager | Emits heartbeat, capability, backlog, error, and self-test state | Bounded diagnostics |
| Updater | Verifies signed releases, staged rollout eligibility, and rollback package | Version metadata |

## Process and privilege boundaries

- Capture that requires OS, browser, proxy, or gateway privilege is separated from network delivery where practical.
- The unprivileged runtime cannot acquire new privileges from a control command.
- Secrets are obtained from platform-native secret stores and are never accepted in telemetry payloads.
- The WAL is encrypted at rest with a machine- or workload-bound key.
- Diagnostic endpoints bind locally unless an explicitly authenticated management plane is configured.
- A compromised adapter cannot declare new capabilities; the installed signed manifest is authoritative.

## Data flow

```text
native signal
  -> source adapter
  -> safe-fact boundary
  -> schema and privacy validation
  -> pre-admission sampling or aggregation
  -> append to local WAL
  -> signed/compressed batch
  -> regional ingest
  -> durable evidence acceptance
  -> acknowledgement
  -> local compaction
```

Control is separate:

```text
policy authoring
  -> central evaluation/approval
  -> signed command
  -> command verification
  -> local precondition check
  -> enforcement adapter
  -> action journal
  -> effect observation through the evidence outbox
```

## Resource governance

Every profile has tested CPU, memory, disk, network, and latency budgets. The runtime:

- uses bounded queues and bounded-cardinality diagnostics;
- applies configured capture budgets before WAL admission;
- never silently deletes an admitted record;
- preferentially preserves reconciliation, lifecycle, finding-supporting, command-effect, and coverage records;
- reports pressure before capture is degraded;
- exposes the precise interval and class of any degraded or lost visibility;
- applies randomized retry with server-provided backoff;
- cannot block the protected application indefinitely when the telemetry path is unavailable.

Production values are profile- and environment-specific and remain `NEEDS_INPUT` until measured.

## Startup and shutdown

Startup is fail-closed for configuration authenticity and fail-safe for the protected workload:

1. verify binary and manifest provenance;
2. open and recover the WAL;
3. load the last valid signed policy and trust bundle;
4. register health as `starting`;
5. perform adapter and delivery self-tests;
6. resume unacknowledged delivery;
7. begin capture;
8. register `healthy`, `degraded`, or `blocked` with reasons.

Shutdown stops new capture, flushes in-memory records to the WAL, checkpoints local state, and reports a final lifecycle record when time permits. It does not wait indefinitely for network delivery.

## Failure behavior

| Failure | Required behavior |
|---|---|
| Network unavailable | Continue within the offline disk budget; show backlog and coverage risk |
| Ingest rejects schema | Quarantine locally by rejection reason; do not hot-loop |
| Authentication expired | Refresh through the workload identity path; retain admitted records |
| WAL corruption | Isolate the damaged segment, preserve recoverable records, emit a high-priority health event |
| Disk pressure | Apply preconfigured capture degradation before exhaustion; never silently erase admitted evidence |
| Policy expired | Use profile-specific fail-open/fail-closed behavior declared in the policy and manifest |
| Command replay or invalid signature | Reject and report; do not execute |
| Adapter crash | Restart with backoff and emit a visibility gap |
| Clock uncertainty | Preserve local monotonic ordering and declare clock quality |

## Unsupported responsibilities

The edge runtime MUST NOT:

- mint canonical entity IDs;
- merge identities across sources;
- infer enterprise ownership or approval;
- create an authoritative central finding;
- compute enterprise-wide metrics;
- accept unrestricted remote shell or arbitrary code execution;
- treat successful command dispatch as evidence of effect;
- delete evidence merely because a local source object disappeared.

## Exit criteria

An edge runtime release is production-eligible only when recovery, upgrade, rollback, offline retention, resource pressure, credential rotation, command safety, privacy filtering, and compatibility have passed the certification suite for every advertised deployment form.
