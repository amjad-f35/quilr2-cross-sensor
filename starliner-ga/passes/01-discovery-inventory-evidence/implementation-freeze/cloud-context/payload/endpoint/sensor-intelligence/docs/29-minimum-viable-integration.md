# 29 — Minimum Viable Integration

## MVS objective

The minimum viable sensor integration (MVS) is a safe, durable,
coverage-aware path for macOS/Windows endpoint inventory and selected activity
facts into Starliner. It does not promise exhaustive discovery, universal
policy enforcement, raw-content collection, Linux/cloud/serverless/CI
coverage, or every endpoint feature.

The itemized scope is
[mvs-scope.csv](../../../matrices/sensor-intelligence/endpoint-sensor/mvs-scope.csv).

## Blocking decisions

MVS cannot begin implementation until the platform resolves:

1. pre-resolution observation identity (`canonical_entity` contradiction);
2. exact delivery wrapper/body and per-record result;
3. outbox in-flight lease/recovery semantics;
4. accepted endpoint entity/action/relationship vocabularies;
5. enrollment credential and capability-certification contract.

These are contract blockers, not optional refactors.

## In scope

### Supported deployment

- one installed sensor instance on certified macOS or Windows;
- System Monitor process, Lua/config and package discovery;
- hook events for currently supported Cursor/Claude integrations, Observe only;
- proxy request/detection/decision/effect facts for already captured supported
  paths, without raw content by default;
- Application governance/action attempt plus effect observation after required
  endpoint instrumentation;
- Persona/device/user identifier candidates, not authoritative identities;
- component/source coverage, health and adapter delivery health.

### Platform records

- compound capability manifest and certification result;
- sensor health and coverage records;
- unresolved source observations plus namespaced identifier candidates;
- relationship assertions supported by native parser evidence;
- action events with source stages;
- decision/control results;
- safe metric events;
- protected evidence references where tenant policy explicitly permits.

### Delivery properties

- deterministic source record IDs;
- append-before-async-delivery;
- bounded, encrypted-at-rest local outbox;
- tenant-bound enrollment credential;
- per-record acknowledgement/rejection;
- retry/backoff and terminal quarantine without content in errors;
- duplicate, offline/replay, late and out-of-order handling;
- crash recovery including in-flight lease reclamation;
- operator health.

### Product surfaces

- Inventory with configured/observed/governed states and freshness;
- Entity Detail with source/provenance/relationships;
- Activity with process/hook/proxy/governance stages;
- Coverage/operator health;
- Findings limited to positive-evidence endpoint findings whose prerequisites
  are satisfied.

## Explicitly out of scope

- Linux endpoint implementation;
- authoritative cloud VM/container/Kubernetes/serverless/CI inventory;
- authoritative GitHub organization/repository/file inventory;
- general agent SDK/run/step/model token/cost capture;
- complete MCP call/result/effect telemetry;
- raw prompt/body/header/secret export by default;
- hook enforcement beyond current Allow;
- distinct filesystem/network “quarantine” behavior;
- unverified redaction-and-forward;
- absence-based LLM/MCP gateway bypass findings;
- automatic remote response/control commands until authorization/effect
  contracts are certified;
- productionizing the dormant gRPC `DbService`.

## Recommended implementation slices

### Slice 0 — Contracts and fixtures

- resolve five blocking decisions;
- freeze v1 native-to-platform golden fixtures;
- define field privacy policy and protected-evidence API;
- certify macOS/Windows version matrix.

Exit: both sides validate identical fixture bytes and error classifications.

### Slice 1 — Enrollment, manifest, health

- host-local adapter service;
- enrollment/credential rotation;
- compound manifest;
- component/source self-tests;
- health and coverage admission.

Exit: platform accurately shows supported/degraded/unsupported without activity.

### Slice 2 — Durable inventory

- process/config/package capture bridges;
- native IDs/times/provenance;
- outbox/replay/admission;
- entity candidate resolution/materialization.

Exit: positive inventory survives offline/restart/duplicate/replay and never
promotes local candidates to authoritative identity.

### Slice 3 — Activity and controls

- native hook event capture;
- proxy stage capture;
- governance/enforcement stages with final effect observation;
- content-safe evidence references.

Exit: one action can be traced from capture through decision/effect/admission.

### Slice 4 — Findings and product

- only findings with complete evidence/coverage contracts;
- dedup/resolution/reopen;
- Inventory/Activity/Entity/Coverage/Operator views;
- tenant privacy/access/retention tests.

Exit: acceptance scenarios pass and failure states are visible.

## Adapter deployment recommendation

Use small in-process Rust bridges in System Monitor, hook manager, proxy and
enforcer, feeding one host-local adapter service with component-partitioned
outbox records. This preserves typed source seams and centralizes enrollment,
privacy, durability and delivery.

Do not route every hot-path request through a new synchronous remote call.
Do not scrape logs as the primary integration. Do not make the dashboard
database the endpoint outbox.

## gRPC disposition

MVS is transport-neutral at the semantic level.

`Verified:` the endpoint does not currently run an active gRPC server. Its
feature-gated `DbService` proto is dormant and incompatible with handwritten
expectations around `schema_id`.

gRPC could be selected later for local streaming or platform delivery if it
meets authentication, bounded streaming/backpressure, durable admission,
per-record results, schema versioning and proxy/firewall constraints. It does
not reduce MVS scope or repair missing contracts by itself. HTTP batch delivery
with strong record-level semantics is equally viable.

## MVS acceptance gate

The integration is not MVS-complete until:

- every in-scope component emits certified manifest/health/coverage;
- every accepted field has platform and privacy disposition;
- no raw secret fixture appears in observations/events/metrics/errors/logs;
- inventory survives restart/offline/replay without duplicates;
- records rejected by schema/auth are visible and recoverable;
- in-flight crash recovery is proven;
- current source versus new materialization parity is measured;
- local control “success” requires verified effect;
- unsupported OS/source is displayed as unsupported, never silently empty;
- product terms preserve configured/installed/observed/used/governed/action/
  effect distinctions;
- all mandatory acceptance scenarios have sanitized evidence.

## Rollback

The adapter and capture bridges need independent feature flags. Rollback must:

- stop new capture without corrupting the existing outbox;
- preserve or explicitly export/quarantine pending records;
- retain current dashboard sync until parity is proven;
- unregister/degrade capability state in the platform;
- never delete current endpoint snapshots/alerts as a side effect;
- keep control disabled when result delivery cannot be trusted.

## Completion status

**Proposed:** no MVS adapter, common outbox, manifest registration or Starliner
delivery exists in the pinned endpoint. This chapter is an implementation
contract derived from verified source limitations, not implemented behavior.

