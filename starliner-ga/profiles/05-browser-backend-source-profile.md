# Browser Backend Source Profile

Status: **normative profile; current source binding verified at the pinned audited revision**

## Boundary

The Browser Backend/service and the installed Browser sensor are different
producers. The installed Browser sensor consists of the Browser Extension plus
its native messaging host under one logical Browser installation,
producer/epoch/sequence, WAL and delivery stream; the native host retains
distinct component/artifact lineage but is not a second launch producer.

- The extension client and its native host observe browser-local actions and
  may enforce before execution.
- Browser Backend manages enrollment/configuration, receives selected client
  events and heartbeats, and may fan out to product-native queues/stores.

The installed Browser producer and Browser Backend producer MUST have distinct
runtime identities, adapter versions, capability manifests, certification,
sequence state, durable state, health, coverage and evidence semantics. A
shared product name does not collapse them into one source. Browser Backend is
authoritative only for server-owned facts below; a relayed Browser record keeps
the qualified original producer, epoch, record ID and digest in the single
canonical `payload.qualified_client_record`. It MUST omit the duplicate
`envelope.correlation.qualified_parent_record`. Admission resolves the exact
payload tuple to same-tenant accepted Browser evidence. Backend
`accepted`/`transformed`/`published` observations normalize as
`source_processing` lineage only and emit no customer activity candidate,
recent-activity contribution, activity count or risk input. This boundary is governed by
[ADR-0022](../adrs/0022-installed-product-vertical-delivery.md) and
[document 43](../passes/01-discovery-inventory-evidence/implementation-freeze/43-installed-product-lifecycle-and-source-verticals.md).

## Direct authority

Where implemented and certified, the browser backend is a source for:

- extension/workstation enrollment and configuration delivery receipt;
- authenticated backend request receipt;
- backend validation/acceptance result;
- product-native queue or side-effect enqueue result;
- backend runtime/version/route health;
- heartbeat receipt and freshness under its documented loss semantics;
- administrative enable/disable or configuration action receipt/effect.

It is not direct authority for:

- browser action occurrence when the client event was never received;
- exact client-side enforcement timing or effect;
- complete browser-profile population without authoritative reconciliation;
- enterprise owner, provider model deployment, or activity outside its client scope;
- downstream persistence merely because an enqueue call returned.

## Identifier and binding rules

Preferred source-native identifiers include:

- managed extension installation ID;
- workstation/endpoint enrollment ID;
- backend request/event ID;
- backend runtime instance and deployment artifact;
- privacy-safe user/persona/profile bridge;
- product-native queue/message ID;
- configuration/policy version and delivery receipt.

Source IDs remain aliases/claims. The backend never assigns canonical application, user, device, or activity IDs.

## Record semantics

The backend emits typed source records for:

- lifecycle/configuration observations;
- event/heartbeat receipt;
- validation/rejection;
- accepted product-native handoff;
- native administrative action result;
- runtime and dependency health;
- explicit gap/correction/reconciliation.

It does not re-label received client records as independently observed browser
facts. The payload's qualified client reference identifies the original client
producer while the Backend envelope identifies the processing observation.
The normalizer emits a lineage-only observation and an empty activity-candidate
set for accepted/transformed/published stages; double counting is structurally
impossible rather than a query-time convention.

## Heartbeat and freshness

Heartbeat semantics declare:

- who emitted and who received it;
- expected cadence as configured, not invented;
- persistence point;
- whether state is pod-local, cache-backed, queued, or durable;
- loss, restart, and multi-replica behavior;
- last complete reconciliation, if any.

Best-effort heartbeat supports operational freshness only. It is not audit proof, proof of absence, or a complete population denominator.

## Downstream side effects

For each queue, graph, warehouse, or native store side effect, the profile distinguishes:

```text
request_received
validated
enqueued
broker_accepted
consumer_processed
native_store_committed
reconciled
```

Only a stage directly observed by this producer may be claimed. Platform evidence admission remains separate from product-native delivery.

## Control surface

If the backend distributes policy/configuration, the control role uses the integration-role contract:

- typed signed command or bundle reference;
- tenant/installation binding;
- version, expiry, rollback, and receipt;
- client acknowledgement/effect when available;
- read/write credential separation;
- audit and kill switch.

The normal Quilr 2 UI does not query browser-backend event APIs to build inventory/findings. Those pages use unified canonical APIs.

## Required certification

Certification covers:

- current route/security matrix from live source inspection;
- authentication and tenant derivation;
- malformed/oversized/duplicate/replayed client events;
- extension and workstation lifecycle;
- configuration/policy delivery and rollback;
- multi-replica heartbeat behavior;
- queue/downstream failure and partial success;
- retry/idempotency;
- privacy/redaction and secret canaries;
- source/client double-count prevention;
- version skew;
- overload, backpressure, observability, recovery, and support.

Mock Kafka/graph/warehouse dependencies can validate contracts but cannot alone certify GA reliability.

## Current binding and remaining release proof

The current static audit verifies the Spring route/security matrix, DTO/mapping seams, Kafka/graph/warehouse handoffs and process-local heartbeat behavior at the pinned revision. The exact adapter placement and required corrections are in the [browser sensor binding](../implementation/12-browser-sensor-binding.md).

`NI-032` now covers only remote-current delta and deployed-runtime proof: release artifact, effective authentication/configuration, topology, downstream durability, multi-replica behavior and production support matrix. Static source does not establish those facts.
