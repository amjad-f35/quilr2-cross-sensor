# Final Integration Decision Sheet

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Give the final production-readiness, transport, product and scope decisions in one place.


## Decision

**Final readiness:** **Requires a new stable sensor integration boundary.**

## Why

The current components expose valuable extraction points but not one
evidence-grade sensor contract:

- browser records are unversioned, variant maps;
- no stable browser-profile/Vanguard/Sentinel compound instance identity is
  emitted;
- SystemID strong fields are empty;
- browser retries are partial and native delivery has no outbox;
- extension inventory routes to an unanalyzed external service;
- native acknowledgements do not prove effect;
- per-file upload results lack stable IDs;
- heartbeat pre-publish state is process-local and can be deleted after a false
  producer result;
- raw sensitive content can cross boundaries without a Starliner-safe
  projection.

## What is adapter-ready now

With a server-side durable tee, existing BES browser event ingress and
HeartbeatBatch can seed an MVS. Chrome extension inventory and native action
results need small stable-ID/version hooks. Native device authority and
evidence-grade offline delivery need larger changes.

## Product claims

Supported with caveats: observed browser applications/accounts/actions,
third-party Chrome extensions, prompt DLP, browser/native clipboard activity,
file transfer scanning, policy enforcement signals, and device/browser/sensor
health.

Unsupported: exhaustive discovery of all agents/environments, cloud/serverless/
CI, MCP servers/tools/backends, repositories/skills/prompts, or all installed
software.

## gRPC decision

No gRPC exists. Do not add it merely to modernize transport. First implement
the versioned contract, stable identities, privacy projection, outbox and
record-level delivery results. Use HTTPS batch for MVS. Reassess gRPC after a
measured load/SLO study; it is useful only if sustained streaming,
bidirectional commands, schema tooling or connection efficiency justify the
operational cost.

## P0 admission gates

| Gap ID | Gap | Required change | Owner | Validation |
| --- | --- | --- | --- | --- |
| G-001 | No stable compound sensor/browser-profile/native instance identity | Persist and emit tenant-scoped component and compound instance IDs | Vanguard/Sentinel/adapter | Restart/reinstall/multiple-profile acceptance tests |
| G-002 | No durable sensor-to-Starliner outbox | Implement DeliveryEnvelope outbox with stable idempotency/status/replay | Sensor/adapter | Offline/replay/partial acceptance tests |
| G-003 | Untyped/unversioned browser event maps | Add schema_id/schema_version and per-record validators | Vanguard/BES adapter | Unsupported-version/quarantine tests |
| G-004 | Per-file result identity missing and positional mapping unsafe | Carry stable file element ID end-to-end and join by ID | Vanguard/Sentinel | Mixed batch error/reorder test |
| G-005 | MAIN-world message bridge lacks strong sender/response binding | Use unguessable session/channel nonce, strict source/schema and request correlation | Vanguard | Concurrent/spoofed response tests |
| G-006 | Native inbound frame has no length cap | Enforce max frame size before allocation | Sentinel | Oversized frame test |
| G-007 | Native logs full inbound messages to stderr | Structured redacted logging; remove raw stderr dump | Sentinel | Secret-canary log test |
| G-008 | Native write/send errors not reliably surfaced | Propagate write error, explicit delivery/result state | Sentinel | Broken pipe/partial write test |
| G-010 | Heartbeat pre-publish store is process-local | Durable/shared bucket or direct outbox/Kafka per accepted heartbeat | BES | Pod-kill/multi-pod test |
| G-011 | Heartbeat false publish can still delete bucket | Throw/return aggregate status and delete only confirmed success | BES | Producer false-return test |
| G-013 | SystemID builder emits empty strong identity fields | Repair builder and quality model; reject empty strong IDs | Sentinel | Stable restart/OS fixture tests |
| G-017 | No stable timestamp contract across layers | Define occurred_at, observed_at, emitted_at, received_at and clock quality | All/adapter | Late/out-of-order tests |
| G-018 | No end-to-end accepted/duplicate/rejected acknowledgement | Adopt outbox/Starliner delivery result protocol | Adapter/platform | Partial acceptance/replay tests |
| G-019 | External extension-log-service contract/repository absent | Obtain repository/schema or tee inventory before external call | Architecture | Contract/runtime capture |
| G-023 | Diagnostics and raw content lack documented central retention contract | Define consent, encryption, TTL, access and evidence-reference policy | Security/platform | Retention/access tests |
| G-024 | No capability manifest emitted by instance | Ship versioned SensorManifest with per-component/OS capabilities | Adapter/sensor | Manifest/health tests |
| G-025 | Extension retry queue persistence incomplete | Replace with durable outbox or persist transactionally on enqueue | Vanguard | Browser restart/offline tests |
