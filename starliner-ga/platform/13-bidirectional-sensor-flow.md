# Bidirectional Sensor, Edge Runtime, and Platform Flow

Status: **normative logical and physical integration contract**

## Decision

Every launch sensor integrates through the same semantic boundary and a sensor-specific physical binding:

```text
source-native capture
→ typed adapter
→ privacy disposition
→ durable edge acceptance
→ authenticated delivery
→ immutable central evidence
→ source normalization
→ continuous identity resolution
→ canonical ledgers and materializers
→ unified product APIs

signed policy/configuration or typed command
→ authenticated control delivery
→ edge verification and local authorization
→ sensor-native operation
→ receipt
→ execution outcome
→ observed effect or reconciliation
→ durable evidence path
```

The first path constructs enterprise truth. The second requests a bounded native action. They are deliberately separate:

- telemetry admission never grants control authority;
- a control acknowledgement is not evidence that the requested effect occurred;
- a sensor never writes canonical inventory, relationships, findings, metrics, cases, or workflow truth;
- the product UI never joins sensor APIs to construct customer truth;
- sensor-native state remains authoritative only for the native facts and effects that the sensor directly observes.

## Physical launch bindings

| Sensor | Capture adapter | Starliner runtime placement | Hot-path policy | Durable evidence boundary | Control/effect binding |
|---|---|---|---|---|---|
| Browser extension | typed adapter at background/service-worker boundary; page and isolated-world relays preserve lineage | embedded runtime in the extension background, with the browser native host as a separately authenticated producer where used | compiled local browser rules and active signed policy snapshot | extension-owned durable browser storage/WAL before network delivery; native host owns its independent WAL when it emits directly | browser rule/config activation and supported page/native effects; effect is observed by the component that performs or verifies it |
| Browser backend | adapter at authenticated controller/service and product-native handoff seams | embedded library or colocated sidecar according to the backend deployment; distinct from extension identity and sequence space | not the ordinary browser action PEP; may distribute signed configuration and perform administrative controls | backend Starliner WAL, separate from Kafka/graph/warehouse handoff success | configuration delivery, enrollment, administrative enable/disable, and downstream-stage receipts |
| Endpoint compound sensor | authenticated adapters from process monitor, proxy, hooks, file/DLP and agent processes | one supervised device-local Starliner service/sidecar per installation | embedded snapshot evaluators in latency-sensitive proxy/hook paths; sidecar owns bundles, leases and orchestration | device-local WAL owned by the supervised runtime | typed calls into native governance, proxy, hook, DLP and agent authorities; post-action observation and reconciliation |
| LLM Gateway | in-process request lifecycle adapter shared by every provider-compatible transport | per-gateway-pod sidecar; in-process SDK performs typed capture and local PEP calls | in-process or local-IPC snapshot evaluation; no central network dependency for ordinary requests | sidecar WAL before central delivery; product NATS/log/database writes do not satisfy this boundary | route/provider/model policy, supported request/response DLP, rate/quota, route disable/drain, config reconcile, and verified runtime effect |
| MCP Gateway | in-process adapters at registry, Direct MCP, OneMCP and native-tool lifecycle seams | existing embedded Python runtime for the certified single-replica release; migrate to per-pod sidecar or certified shared runtime before horizontal scale | active local signed bundle; central Decision API only for bounded escalation or approval continuation | existing SQLite outbox upgraded to the Starliner protocol and receipt contract | registry/backend/tool controls, confirmation/approval, local DLP/policy, reconnect/disable/drain, followed by direct observation or reconciliation |

Runtime placement is an implementation binding, not a change to protocol semantics. All placements must pass the same source-profile, privacy, workload-identity, WAL, delivery, control, upgrade and certification contracts.

## Source-to-platform state machine

### 1. Capture

The native sensor generates or observes a fact at a named seam. The adapter records:

- source-native namespace and identifier;
- tenant and environment derivation inputs;
- producer, workload, installation and artifact identity;
- observation/action/correlation identifier;
- source and observed time;
- profile subtype and schema version;
- privacy capture state and disposition;
- native lifecycle, decision or outcome;
- safe structural attributes;
- lineage to an earlier source action when this is a relay or processing stage.

The adapter does not assign a canonical enterprise entity identifier. A current central binding may be carried only as a revisioned hint and never as source authority.

### 2. Privacy disposition

Before durable enqueue, the profile-specific privacy filter classifies every candidate field as:

- ordinary evidence;
- tokenized or pseudonymized evidence;
- omitted with an explicit capture state;
- restricted content requiring a separate grant and protocol;
- rejected as secret, credential or prohibited data.

Ordinary records do not contain prompt/response bytes, file content, tool arguments/results, authorization headers, cookies, tokens, credentials, or unkeyed hashes of sensitive material.

### 3. Edge durable acceptance

The runtime writes the complete transport record to its WAL/outbox before reporting local evidence acceptance to the adapter. The durable row binds:

- producer epoch and monotonically ordered sequence where the profile supports sequencing;
- idempotency key;
- immutable serialized body or digest-bound payload;
- profile, schema, adapter and artifact versions;
- retry and terminal-state metadata;
- tenant routing assertion;
- privacy disposition;
- local loss/gap state.

The product's own log, queue, cache, database, analytics call, or native event bus is not a substitute for this WAL.

If local durability cannot be obtained, the adapter follows the certified source-specific failure posture. It never silently claims durable capture.

### 4. Delivery and central admission

The delivery worker:

1. authenticates with short-lived workload identity;
2. sends a bounded tenant-homogeneous batch;
3. receives a per-record result;
4. removes or seals only records that received a verifiable central `accepted` or `duplicate` disposition;
5. retries retryable failures with bounded backoff;
6. quarantines permanent schema/privacy/authorization rejection;
7. exposes gaps, age, pressure and loss as health and coverage evidence.

`accepted` means the tenant cell durably admitted the immutable evidence. It does not mean normalization, resolution, materialization, finding evaluation, or product projection is complete.

### 5. Immutable evidence and source normalization

The tenant cell verifies:

- tenant routing and producer authorization;
- producer artifact, capability and certification state;
- schema/profile compatibility;
- signature or sender binding where required;
- idempotency and sequence semantics;
- size/cardinality/privacy rules;
- residency and retention class.

It then stores immutable evidence and an admission receipt. Source normalizers convert only source semantics:

```text
browser URL/product hint
endpoint executable/process/package
LLM route/provider/model request
MCP registry/server/tool/call
→ normalized claims and observations
```

Normalizers preserve provenance and do not silently resolve ambiguous identity.

### 6. Continuous identity and canonical mutation

The resolver evaluates source claims, authoritative connectors, catalog facts, current aliases, negative evidence, time and conflict rules. It writes:

- identity claims and bindings;
- merge/split/review decisions;
- canonical entity and alias ledger mutations;
- typed relationship claims;
- lifecycle changes;
- resolution confidence and explanation.

High-impact or ambiguous changes use review policy. Every decision is tenant-scoped, versioned, reversible and replayable.

### 7. Materialization and product publication

Canonical mutations and their transactional outbox drive:

- current AI estate;
- typed relationship and lineage graph;
- canonical activity;
- coverage and freshness;
- finding candidates and admitted findings;
- metrics, cost and outcomes;
- search, analytics and cache projections;
- unified APIs and customer UI.

The canonical transaction commits before its outbox item is publishable. Projectors are idempotent and rebuildable. A projector or cache never becomes a mutation authority.

## Platform-to-sensor state machine

### Policy and configuration

The platform compiles approved policy into a signed, versioned, tenant- and capability-scoped bundle:

```text
draft
→ validate and simulate
→ approve
→ sign
→ stage to cohort
→ edge download and verify
→ prepare
→ activate atomically
→ observe
→ promote or rollback
```

The edge runtime checks signature, tenant, environment, target capability, minimum/maximum compatible version, activation time, expiry, rollback reference and local resource limits. Last-known-good behavior and fail-open/fail-closed posture are explicit per policy class and source profile.

The local PEP is the normal decision path. Central Decision API calls are limited to cases the policy marks for fresh context, exceptional risk, human approval, or delegated authorization. Those calls are bounded by deadline and have an explicit unavailable result.

### Typed command

A command contains:

- tenant, environment and command identifier;
- target source binding and frozen target revision;
- command family and typed parameters;
- required producer capability/certification;
- issuer and authorization evidence;
- policy/workflow/approval reference;
- preconditions;
- creation, activation and expiry times;
- idempotency key;
- expected effect and verification method;
- rollback or compensation where supported.

The control channel authenticates independently from evidence ingestion. The edge runtime rejects unknown, expired, replayed, unauthorized, incompatible, wrongly targeted or unsafe commands.

### Receipt, outcome and effect

The following states are distinct:

```text
delivered
accepted
rejected
started
succeeded | failed | expired | cancelled
effect_observed
effect_verified
effect_conflicted | effect_unknown
```

- `accepted` means the target accepted responsibility to attempt the command.
- `succeeded` means the native operation returned success.
- `effect_observed` means the source directly observed the intended resulting state.
- `effect_verified` means the governed central verification rule passed.

All receipts, outcomes and effect observations enter the ordinary evidence WAL. A synchronous command response alone does not mutate canonical truth.

## Exact per-sensor flows

### Browser

```text
page MAIN-world upload/action
→ isolated-world relay
→ background/service-worker adapter
→ optional native-host request with authenticated correlation
→ local file/DLP/policy evaluation
→ browser-native effect
→ extension WAL
→ tenant-cell evidence
→ browser normalization and cross-sensor resolution

signed browser policy/configuration
→ background verifies and activates
→ activation receipt
→ compiled local decision
→ permit/block/warn/native effect
→ action + decision + effect evidence
```

The current single-response-slot and positional upload association are replaced by keyed, bounded, authenticated correlation. Browser client and browser backend use distinct identities and do not double count relayed facts.

### Endpoint

```text
process/package/proxy/hook/file observation
→ authenticated local adapter IPC
→ one supervised device runtime
→ device WAL
→ tenant-cell evidence
→ endpoint normalization
→ central resolution and inventory
```

The current application-ID resolver and `/ea/v1/sync/discovered-apps` path are migration compatibility paths only. They do not assign Quilr 2 canonical IDs.

```text
signed endpoint bundle or typed governance command
→ device runtime verifies target/capability
→ native agent/proxy/hook/DLP method
→ native outcome
→ later process/network/file reconciliation
→ effect evidence
```

Unauthenticated world-writable hook IPC is prohibited. Every local caller has a workload/component identity, bounded frame, replay protection and least-privilege method set.

### LLM Gateway

```text
authenticated request context
→ route/provider/model normalization at request lifecycle seam
→ local policy + input DLP
→ upstream attempt and streaming lifecycle
→ output DLP/decision
→ client outcome
→ sidecar WAL
→ tenant-cell evidence
```

Every provider-compatible route uses the same lifecycle contract. Product NATS publishing, request logs and database writes remain native operational state, not Starliner admission.

```text
signed route/model/policy bundle or drain/disable command
→ pod sidecar and in-process PEP activate
→ new requests observe version
→ native router/config authority applies operation
→ request/reconciliation evidence verifies effect
```

### MCP Gateway

```text
registry snapshot/change + negotiated capabilities
→ registry adapter
→ runtime WAL
→ server/tool/resource/prompt source claims
→ central MCP identity resolution

Direct MCP | OneMCP | native tool invocation
→ one lifecycle contract
→ local policy/DLP/confirmation/approval
→ upstream or native execution
→ response/timeout/cancel outcome
→ runtime WAL
→ canonical activity and lineage
```

Source mappings carry registry/backend/tool identifiers, not producer-created canonical entity IDs. Direct MCP observation does not imply OneMCP coverage; each surface is independently manifested and certified.

```text
signed MCP bundle or typed registry/backend/tool command
→ runtime verifies
→ repository/registry/connection authority acts
→ receipt/outcome
→ registry snapshot or route rejection confirms effect
→ evidence path
```

## Cross-sensor correlation

Sensors may share causal and correlation references, but they do not negotiate canonical identity with one another.

Examples:

- a browser upload observation and endpoint file/network observation share a privacy-safe correlation claim;
- an endpoint process and LLM Gateway API request share device/workload/user/session claims;
- an LLM application action and MCP tool call share authenticated actor/delegation/request lineage;
- a browser/backend relay preserves the original action ID plus its own processing observation ID.

The platform correlator records candidate linkage and confidence. It never merges events solely because timestamps, usernames, executable names, model labels or tool names resemble each other.

## Failure and outage behavior

| Failure | Required behavior |
|---|---|
| Sensor cannot reach platform | continue bounded WAL/offline operation; expose age/pressure; never invent central acceptance |
| WAL pressure | apply certified priority/shedding policy; emit explicit gap/loss record; protect policy/control state |
| Central ingest rejects schema/privacy | quarantine record, surface permanent reason, stop poison-loop retry |
| Resolver unavailable | retain immutable evidence and normalization backlog; do not source-assign canonical IDs |
| Projector unavailable | canonical writes and outbox remain durable; API exposes freshness/degraded state |
| Policy distribution unavailable | use valid last-known-good until expiry according to policy class; explicit unavailable posture after expiry |
| Central decision unavailable | return typed unavailable/deadline result; profile policy defines native fallback |
| Command channel unavailable | command remains pending/expired; no effect is claimed |
| Sensor native operation partially succeeds | report partial outcome and reconcile; workflow chooses retry, compensate or review |
| Version skew | accept only declared compatible records/commands; expose unsupported capability and block unsafe promotion |

## Migration rule

Every sensor migrates in four separable stages:

1. **Observe:** new adapter and WAL emit alongside existing behavior.
2. **Resolve:** platform builds canonical state while Quilr 1 remains the customer read authority.
3. **Dual-read/control shadow:** compare canonical APIs and local policy decisions against legacy behavior.
4. **Cut over:** Quilr 2 becomes read/control authority by tenant and domain; legacy writes and source-specific UI joins are retired after rollback closure.

Existing product APIs, queues and stores may coexist during migration, but they never become the new canonical spine.

## Prohibited shortcuts

- direct sensor writes to canonical tables or projections;
- producer-created canonical IDs;
- a central policy network call on every browser, proxy, LLM or MCP action;
- using Kafka/NATS/database logging as proof of Starliner durable acceptance;
- command success inferred from HTTP 2xx alone;
- UI aggregation across source APIs;
- a shared bearer token for all installations or tenants;
- silent fail-open/fail-closed behavior;
- source signal promoted directly to customer finding;
- horizontal replicas sharing process-local or SQLite state without a certified coordination model;
- deployment claims derived only from source code.

## Binding references

- [Browser binding](../implementation/12-browser-sensor-binding.md)
- [Endpoint binding](../implementation/13-endpoint-sensor-binding.md)
- [LLM Gateway binding](../implementation/14-llm-gateway-sensor-binding.md)
- [MCP Gateway binding](../implementation/15-mcp-gateway-sensor-binding.md)
- [Current sensor repository audit](../evidence/02-current-sensor-repository-audit.md)
- [Ingest, trust, and immutable evidence](00-ingest-trust-and-evidence.md)
- [Continuous identity resolution](02-continuous-identity-resolution.md)
- [Commands and effect verification](08-commands-workflows-and-effect-verification.md)
