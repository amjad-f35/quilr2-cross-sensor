# 30 — Acceptance Scenarios

## Scenario evidence rules

Every scenario records the exact source/build/contract versions, platform,
configuration, manifest, self-tests, native input/output, adapter output,
platform result, logs/metrics/coverage and cleanup. Proposed fixtures are
cataloged under
`fixtures/sensor-intelligence/endpoint-sensor/`.

Generated examples are not runtime proof. A scenario is accepted only after a
supported environment produces sanitized captured evidence.

## A. Enrollment, capability and coverage

### AC-001 — Certified macOS enrollment

**Given:** a supported macOS build, valid tenant enrollment authorization and
enabled monitor/hooks/proxy configuration.

**When:** the adapter enrolls and executes required self-tests.

**Then:**

- credential-bound tenant and sensor instance are returned;
- component/build/adapter/contract versions are exact;
- each sub-sensor has a separate mode/result;
- hook declares Observe, not Enforce;
- unsupported/disabled capabilities remain explicit;
- first health/coverage records are durably acknowledged.

### AC-002 — Certified Windows enrollment

Same as AC-001, with WinDivert driver/filter/attribution self-tests and Windows
process/enforcement support. A missing/failed driver degrades transparent proxy
only; it does not erase process/config discovery health.

### AC-003 — Linux rejected as unsupported

**Given:** the current endpoint artifact is evaluated for Linux.

**Then:** certification returns `unsupported`; no empty/healthy inventory is
created and no Linux endpoint coverage is claimed.

### AC-004 — Partial source scan

**Given:** process enumeration succeeds but one configured Lua root is denied.

**Then:** positive process observations are accepted; Lua coverage is `partial`
with a safe error class; absence under the denied root is unusable; no existing
inventory is deleted.

### AC-005 — Framework running but source unhealthy

**Given:** the service manager reports `Running` while the hook socket or proxy
redirector self-test fails.

**Then:** the failed sub-sensor is degraded/unhealthy; the platform does not
promote framework state to full readiness.

## B. Inventory and identity

### AC-006 — New application process observation

**Given:** a controlled AI application process starts.

**Then:**

- source observation carries native ID, device/sensor/runtime/process instance,
  source/event/observed/append time, parser/catalog version and coverage;
- the adapter does not assign a canonical entity;
- the platform resolves or preserves an unresolved candidate;
- replay of the same native ID does not create a duplicate observation;
- “observed” is not displayed as “approved” or “used by account.”

### AC-007 — PID reuse

**Given:** one process exits and a later different process receives the same
PID.

**Then:** boot/start-time/process-instance evidence prevents conflation; action
results remain attached to the original instance.

### AC-008 — Rich Lua graph preservation

**Given:** a fixture emits Agent, MCP server, Skill, Permission and their native
relationships/risk/provenance.

**Then:** every supported native field/edge survives into source observations/
relationship assertions or is explicitly discarded with the matrix reason.
Current converter loss is not copied into the adapter.

### AC-009 — Device identity conflict

**Given:** Persona hashed device ID, monitor serial-derived ID and UserDevice ID
map inconsistently.

**Then:** all values remain namespaced candidates; the platform records a
conflict/resolution decision; the adapter never merges them silently.

### AC-010 — Tenant switch

**Given:** an endpoint changes authenticated Persona/tenant.

**Then:** the old outbox partition is closed/drained/quarantined under its old
credential; caches and health are reset safely; new records cannot be delivered
under the previous tenant; raw aliases never correlate across tenants.

## C. Hooks

### AC-011 — Normal Cursor/Claude event

**Given:** a supported hook sends a verified normal event.

**Then:** source event ID/time/type/tool/file/session aliases are preserved;
content follows tenant privacy policy; current response remains Allow; activity
and delivery outcomes are separate.

### AC-012 — Invalid and oversized hook input

**Given:** malformed JSON, missing required fields or a frame above the accepted
limit.

**Then:** client behavior matches declared fail mode; no unbounded allocation;
a safe health/error event is emitted; invalid content is not logged/exported.

### AC-013 — Local hook spoof attempt

**Given:** an untrusted local process attempts to connect and fabricate a hook
event.

**Then:** target implementation rejects it by verified peer identity, or until
that control exists marks provenance/confidence degraded and certification does
not permit authoritative policy evidence.

### AC-014 — Hook queue saturation/restart

**Given:** native events exceed queue capacity and the hook manager restarts.

**Then:** every durable admitted event replays; non-admitted losses increment a
health counter and degrade coverage; duplicates retain native IDs; session
state loss is explicit.

## D. Proxy, DLP and policy

### AC-015 — Supported captured HTTP request

**Given:** a process sends a supported request through a certified proxy path.

**Then:** capture, process attribution, detector, decision, UI (if any), local
effect and upstream outcome carry a shared action ID and stage times; unsupported
body stages are explicit.

### AC-016 — Unattributed connection

**Given:** traffic is captured but process attribution fails.

**Then:** the action remains valid network evidence with `unknown` attribution,
method/failure/age; it is not assigned to the last or same-port process.

### AC-017 — Heuristic false-negative boundary

**Given:** non-UTF8 content and a sensitive fixture whose value lacks the
heuristic prefilter triggers.

**Then:** target output is `unsupported/skipped/degraded`, not a universal
`clean` claim; detector/version/config and coverage reflect limitation.

### AC-018 — Remote analyzer failure and fallback

**Given:** remote analyzer returns 401, 500, malformed 2xx and timeout.

**Then:** each status is classified; raw request is not logged; primary/
fallback/unavailable mode is emitted; fallback output identifies heuristic
coverage; policy receives an explicit degraded fact.

### AC-019 — Policy engine timeout

**Given:** policy evaluation exceeds the current 100 ms limit.

**Then:** current local Allow effect is preserved for compatibility; a durable
fail-open decision reason and expected policy mode are emitted; required-control
coverage is degraded; a configured finding may open.

### AC-020 — Mandatory justification timeout

**Given:** mandatory justification is required and UI cancels/times out.

**Then:** local action is blocked as current behavior specifies; request,
policy, UI result/default reason and local/upstream effect remain distinct.

### AC-021 — Redaction action

**Given:** policy returns `AllowPromptAfterRemovalOfSensitiveData`.

**Then:** until actual byte-level redaction and forwarding are implemented and
verified, capability certification rejects a “redacted and allowed” claim.
The current Block-like branch is represented truthfully.

### AC-022 — Transparent interception matrix

**Given:** IPv4/IPv6 TCP/UDP flows across macOS Network Extension and Windows
WinDivert configurations.

**Then:** every flow is classified captured, bypassed, rejected, tunneled,
failed or unsupported with exact filter/rule/port/protocol scope. No global
network-coverage claim is derived.

## E. Enforcement and control

### AC-023 — macOS staged termination

**Given:** a blocked application with roots and children.

**Then:** Apple Events quit (when applicable), grace, SIGTERM roots, grace,
SIGKILL survivors and final process-tree observation are separate result
stages. The control is successful only when expected effect is observed.

### AC-024 — Windows non-success taskkill

**Given:** taskkill returns a non-success status not containing “not found.”

**Then:** the platform-native status is preserved and the target code does not
classify the step as successful merely because the process launched; final
re-observation determines effect.

### AC-025 — Blocked versus quarantined

**Given:** identical process fixtures under Blocked and Quarantined policies.

**Then:** current termination effects are the same and product labels do not
claim filesystem/network isolation for Quarantined.

### AC-026 — Command duplicate and stale policy

**Given:** a control command is replayed and another references an obsolete
policy version.

**Then:** duplicate command ID is idempotent with the original result; stale/
unauthorized command is rejected before action; all decisions are audited.

## F. Delivery and recovery

### AC-027 — Offline/replay

**Given:** the platform is unavailable while observations continue.

**Then:** records append within quota, health reports backlog/oldest age,
delivery later replays in bounded batches, native IDs remain stable, and
event-time ordering is not replaced by replay time.

### AC-028 — Crash at every outbox boundary

Crash after:

1. native capture before append;
2. append before return;
3. selection before `in_flight`;
4. `in_flight` before send;
5. send before result;
6. accepted response before local ack.

**Then:** admitted records are neither stranded nor duplicated semantically;
leases recover; unadmitted loss is visible in coverage; repeated delivery is
idempotent.

### AC-029 — Partial batch acceptance

**Given:** one record is accepted, one retryable and one terminally rejected in
the same HTTP success response.

**Then:** each outbox row follows its own result; no absent result defaults to
accepted; safe rejection detail is visible without record body.

### AC-030 — Quota and sensitive data

**Given:** outbox approaches quota with content-sensitive and operational
records.

**Then:** quota policy is deterministic and auditable; no silent eviction;
coverage/health reports impact; ordinary inspection/error surfaces do not
expose content.

## G. Cross-sensor and product

### AC-031 — Late gateway match

**Given:** endpoint provider traffic arrives before a gateway event.

**Then:** no bypass finding opens until the declared late window closes with
both source coverages healthy; a late exact match prevents or resolves the
candidate without losing history.

### AC-032 — Gateway outage

**Given:** endpoint traffic exists while gateway coverage is unhealthy.

**Then:** activity is shown; bypass finding is suppressed or explicitly
insufficient-evidence; outage itself can become a coverage finding.

### AC-033 — Sensitive cross-sensor transfer

**Given:** browser/hook/proxy/DLP/gateway records represent one protected test
transfer.

**Then:** platform groups one root transfer, retains every child source,
propagates missing/degraded coverage, applies evidence access, and avoids one
finding per detector/alert.

### AC-034 — Product terminology

For the same application, the UI separately demonstrates:

- configured but not observed;
- installed/package observed;
- process observed;
- network/hook use observed;
- governance approved/blocked/unknown;
- control requested/attempted/effect verified;
- stale/unsupported coverage.

No transition is inferred without required evidence.

## Required negative assertions

The suite fails if the product claims any of the following from endpoint
evidence alone:

- exhaustive agent discovery across all environments;
- authoritative GitHub/cloud/serverless/CI estate;
- exact agent run/tool success/token/cost;
- personal versus enterprise account ownership;
- hook Deny/Ask/Justify enforcement;
- successful redaction-forward;
- quarantine isolation;
- final canonical identity assigned by adapter;
- successful control from an attempted platform call;
- absence/bypass while required source coverage is stale.

