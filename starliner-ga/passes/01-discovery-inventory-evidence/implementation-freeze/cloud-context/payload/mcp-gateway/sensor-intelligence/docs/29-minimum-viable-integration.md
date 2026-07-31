# Minimum viable integration

## MVS decision

`Proposed:` ship a corrected observe-only MCP source integration first. Do not
make legacy central hot-path enforcement or bidirectional commands a prerequisite
for the initial evidence release.

## First record types

1. source observation: gateway deployment/server/tool upsert and tool sighting;
2. MCP tool-call action event;
3. call/latency metric samples;
4. native DLP block finding signal;
5. capability-specific sensor health event;
6. delivery receipt/terminal metadata;
7. registry snapshot begin/complete and delete/tombstone if inventory is exposed
   as current.

Relationship, trace, decision, command, and protected raw-content records are
deferred unless their contracts and certification are complete.

## Mandatory fields

- tenant and source sensor/profile/adapter/product versions;
- runtime instance/workload identity and instance epoch;
- source-native backend/tool and observation IDs;
- operation, surface, occurred/observed times, sequence/revision where
  applicable;
- actor source pseudonym/class when available;
- action/resource/outcome/upstream/latency;
- safe labels and control phase;
- idempotency, body/record integrity, privacy/evidence quality;
- capability and loss/health state;
- central receipt identity/status.

No source-created canonical entity ID.

## MVS entities

- source sensor/runtime instance;
- MCP server deployment candidate;
- MCP tool candidate;
- pseudonymous actor candidate;
- enforcement point candidate.

Human/account/agent/model/device canonical entities require cross-sensor
resolution and are not asserted by MCP alone.

## MVS relationships

Central derivations:

- sensor OBSERVED source/action;
- server PROVIDES tool, supported by snapshot/tool source records;
- actor CALLED tool for observed Direct action;
- action TARGETED tool/server;
- decision/effect ENFORCED BY gateway when native evidence exists.

## MVS events and metrics

Events:

- server/tool observed/upserted/deleted;
- Direct tool called/outcome;
- native DLP blocked;
- sensor capability/health/loss;
- delivery terminal outcome.

Metrics:

- call count/status;
- full gateway tool-call latency;
- block direction/label counts centrally;
- inventory/source freshness;
- outbox depth/age and delivery outcomes;
- lost/dropped observation count.

## MVS findings

Launch as signals/activity:

- individual DLP-blocked call;
- post-upstream output block;
- new server/tool observation.

Customer findings only with central admission:

- repeated native DLP-blocked activity;
- externally confirmed unapproved/unowned server;
- sensor/delivery degradation and coverage gap.

## MVS controls

Observe-only release:

- no new platform command required;
- native gateway controls continue;
- record safe decision/effect when available.

Next control release:

- typed enable/disable tool/backend and DLP/confirmation setting commands;
- existing service/API methods, not DB writes;
- explicit result/effect reconciliation.

## Sensor-side changes required before MVS acceptance

1. identity-boundary correction;
2. contract package/default CI reproducibility;
3. durable health/loss and missing-tenant handling;
4. production delivery identity/receipt/conflict semantics;
5. registry snapshot/delete lifecycle if current inventory is claimed;
6. Direct exception closure;
7. explicit supported/deferred surface declaration;
8. privacy/version/sequence/instance-epoch fields;
9. terminal retention/operator recovery policy.

OneMCP/resource/prompt/session instrumentation may be deferred only if the
product clearly labels coverage as Direct-only.

## Deferred

- comprehensive OneMCP/native/workflow coverage;
- local policy bundle and typed commands;
- raw content evidence;
- action-effect verification for arbitrary tools;
- multi-replica support;
- model/cost/device/process/bypass claims;
- authoritative account/agent/workload identity.

## Readiness verdict

Current code is a credible MVS prototype but **not release-ready** for the
target platform contract. The outbox and mapper are unusually mature for a
prototype; identity authority, coverage honesty, delivery trust, health, and
release/certification integration remain blocking.

