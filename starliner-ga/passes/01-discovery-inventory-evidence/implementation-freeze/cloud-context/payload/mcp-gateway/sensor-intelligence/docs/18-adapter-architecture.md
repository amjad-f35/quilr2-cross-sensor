# Adapter architecture

## Decision

`Proposed:` evolve the existing embedded observe runtime for the first MCP
sensor release. Do not replace it with log scraping or an external database
writer.

Reasons grounded in current source:

- typed capture seams already exist at registry and Direct tool lifecycles;
- the mapper receives a deliberately reduced safe DTO;
- a validated bounded SQLite outbox already participates in gateway lifecycle;
- observation failure is isolated from the client response;
- manifest, self-test, metrics, delivery health, retry, terminal metadata, and
  certification scaffolding already exist.

This decision is conditional on an explicit single-replica deployment support
statement. The current process-local state and SQLite coordination are not
certified for arbitrary horizontal scaling.

## Responsibility boundary

```text
Sensor product code
  owns native request/control/state semantics
  owns exact capture timing and safe native DTO construction
  owns native effect verification

MCP adapter
  owns source profile normalization
  owns source identifiers and source observations
  owns privacy allowlist and data disposition
  owns versioned mapping and current binding tokens

Starliner runtime
  owns wrapper validation, local durability, replay, delivery,
  capability/health reporting, certification hooks

Central platform
  owns canonical identity, entity/relationship/event materialization,
  finding grouping/severity/lifecycle, product projections, cross-sensor truth
```

The adapter must not mint central canonical IDs, issue product findings, or
silently claim unobserved lifecycle completeness.

## Target module build sheet

| Target module | Current source to retain/evolve | Target responsibility | Change class |
| --- | --- | --- | --- |
| `profile.py` | `ObserveConfig`, manifest | MCP profile/version/capability declaration | minor |
| `capture/registry.py` | registry hooks | snapshot begin/page/complete, upsert/delete/status/capability revisions | minor-to-substantial |
| `capture/direct.py` | handler hook | all Direct operation/result/session/control DTOs with exception closure | minor |
| `capture/onemcp.py` | none dedicated | remote/native/resource/prompt/session/progress/cancel | minor/substantial |
| `capture/workflow.py` | workflow delegation/run state | workflow→MCP lineage | substantial/cross-process |
| `normalize/identity.py` | current identity helpers | source IDs, pseudonym key epoch, current binding token; no canonical ID | minor |
| `normalize/records.py` | `MCPObserveMapper` | source observation and canonical candidate compilation | minor/substantial |
| `privacy.py` | `safe_labels`, pinned validator | field allowlist, class/retention/content-reference decisions | minor |
| `outbox.py` | current repository | sequence/epoch, correction conflict, retention, workload provenance | substantial |
| `delivery.py` | current worker/transport | workload identity, receipt validation, central replay contract | substantial |
| `health.py` | counters/routes | durable `SensorHealthEvent`, coverage/loss/source-gap state | minor |
| `commands.py` | existing admin/service methods | typed commands; never direct DB writes | substantial |
| `effects.py` | native read-back/reconciliation | command effect observations | substantial |
| `policy.py` | legacy adapter + native controls | local signed bundle/PEP, bounded escalation | substantial |
| `certification.py` | current M1 certification | full profile trace pack and default CI inclusion | substantial |

These names are a design decomposition, not existing paths.

## Capture DTO rules

Every in-process hook should construct an immutable safe DTO before scheduling:

- tenant and sensor/source scope;
- gateway observation ID and available native request/session/run IDs;
- exact surface (`direct`, `onemcp_remote`, `onemcp_native`,
  `workflow_delegated`);
- operation and lifecycle phase;
- source backend/tool/resource/prompt identity;
- actor/delegation classes and safe references;
- status, upstream/effect flags, phase timings;
- safe data/risk labels and structural metadata;
- native policy/confirmation/decision/effect references;
- error code class, never free-form sensitive exception text;
- capture timestamp and source revision.

Arguments/results/headers/tokens are excluded from ordinary DTOs. Optional
content evidence must use a separately authorized protected reference.

## Deployment model

### Initial

```text
one gateway process/pod
├── product handlers and native controls
├── embedded typed adapter
├── bounded in-process task supervisor
├── local SQLite Starliner WAL/outbox
└── delivery worker → authenticated central ingest
```

### Scale-out options

1. per-pod Starliner sidecar owns WAL/delivery/policy/command state while typed
   capture remains in process; or
2. certified shared durable runtime with multi-process leases, sequences, and
   correctly isolated per-instance state.

The present SQLite/process-local implementation must not be shared across
uncontrolled replicas.

## Versioning

Each emitted record needs:

- product repo/ref/commit;
- adapter name/version;
- source profile/version;
- contract version;
- certification ID/test-pack hash;
- runtime instance ID and instance epoch;
- mapping/schema version;
- privacy-policy version;
- optional current central binding revision.

Current envelope supplies only a subset.

## Failure isolation

Telemetry:

- never changes client result;
- bounded memory queue and disk capacity;
- durable loss/health signal when possible;
- replay/idempotency/correction conflict preserved.

Control:

- separately authenticated;
- explicit timeout/fail behavior per command/policy;
- auditable decision and effect;
- no command through telemetry acknowledgement;
- no platform direct write to `gateway.db`.

## Adapter acceptance blockers

- source-side canonical identity violation;
- incomplete Direct exception coverage;
- no explicit OneMCP/native/resource/prompt/session coverage;
- no snapshot/delete semantics;
- no durable health event or loss-by-tenant;
- bearer-only delivery prototype and no signed receipt/workload identity;
- no sequence/epoch/correction-conflict record;
- optional packages/tests outside default reproducible test path;
- raw-email legacy decision seam;
- no typed command/effect protocol;
- unverified production topology.

