# LG-005 — Native Adapter and Starliner Certification

## Certification unit

The certification identity is:

```text
profile + sensor artifact digest + adapter digest + Starliner runtime digest
+ OS/runtime matrix + capability manifest + privacy policy digest
```

A source profile is not globally “certified.” Each artifact/runtime/capability
combination is certified and can be revoked independently.

## Common adapter suite

Every profile must prove:

- native trigger to exact typed payload field lineage;
- source IDs and timestamps retain native semantics;
- no producer-created canonical IDs;
- unsupported/new-capture fields remain absent or explicit unknown;
- privacy filter discards secrets before WAL persistence;
- UUIDv7, epoch, sequence, digest and idempotency correctness;
- crash before/after WAL append and before/after receipt;
- offline bounded retention, retry, backpressure and restart recovery;
- duplicate/reorder/lost-response convergence;
- signed configuration validation, expiry and rollback protection;
- capability manifest, heartbeat, gap and self-test truth;
- upgrade/downgrade compatibility and outbox preservation;
- CPU, memory, disk, latency and host-impact budgets;
- negative permission/OS/API-version behavior fails visibly, not silently.

## Profile-specific suites

### Browser

Exercise supported browsers, extension lifecycle, application/origin
discovery, profile/account-context classifications, uploads/activity,
extension/native-host binding, suspended/background gaps and secret canaries.

### Browser Backend

Exercise catalog/configuration ingestion, installation/heartbeat, browser event,
native decision/effect, publication failure, reconciliation and tenant/source
authentication.

### Endpoint

Exercise supported OS versions, device/local-user/process/application/agent/MCP
configuration discovery, service restart, privilege boundaries, DLP/activity
records, local-only versus emitted fields and high-rate backpressure.

### LLM Gateway

Exercise every supported transport/provider route, model/account/request
identity, accepted/forwarded/result/error stages, streaming, tools, redaction,
queue-publish gaps and signed endpoint attribution.

### MCP Gateway

Exercise direct/proxied surfaces, authorization-context and endpoint-config
scoped capability identity, server/tool/resource operations, rejection/effect
stages, protocol versions, upstream cache behavior and the six currently
failing selected-source tests.

## Golden pack

Each pack contains native input/fixture, exact executable artifact, captured
native trace, expected envelope/payload, expected privacy disposition,
expected receipt/replay behavior and source line/digest. Golden outputs are
signed and versioned; updating one requires reviewed semantic diff.

## Closure

Certification closes per profile only when its common and profile-specific
required rows pass on every supported runtime. The platform may ship a subset
of certified profiles, but UI/API capability state must accurately reflect
uncertified combinations. MCP may be implemented and integrated continuously;
its production advertisement/release remains unqualified until selected-source
failures are resolved or individually proven environmental and the native pack
passes.
