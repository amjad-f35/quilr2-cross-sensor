# Quality, Certification, and Operability

Status: **normative pass proof strategy**

## Test layers

### Contract

- envelope/profile schemas;
- positive/negative fixtures;
- unknown compatible values;
- canonicalization/idempotency vectors;
- privacy/prohibited-field vectors;
- receipt/error behavior;
- generated SDK compatibility.

### Edge and adapter

- exact audited seam golden traces;
- WAL crash/restart/corruption/disk pressure;
- offline/reconnect/partial acknowledgement;
- duplicate/reordered/late/correction;
- resource overhead;
- source unavailable/permission loss;
- native outcome/effect;
- update/rollback/version skew;
- secret canaries.

### Platform component

- ingest tenant/auth/schema/privacy/idempotency;
- normalizer determinism/reprocessing;
- resolver create/link/defer/merge/split/rebind;
- canonical transaction/outbox;
- projector duplicate/rebuild/promotion/rollback;
- API authorization/pagination/error/freshness.

### Integrated and E2E

- all four sensor families plus Browser Backend into one tenant cell;
- cross-sensor application identity;
- agent/model/MCP/tool relationships;
- important source event timelines;
- gap/outage behavior;
- late correction and source deletion;
- browser relay double-count prevention;
- endpoint local IPC;
- LLM streaming/cancellation;
- Direct/OneMCP separation;
- customer UI and export;
- backup/restore and replay.

### Non-functional

- largest certified tenant;
- steady/burst/backlog catch-up;
- noisy neighbor;
- replay during live ingest;
- projection rebuild;
- tenant isolation;
- privacy and penetration;
- accessibility;
- upgrade/mixed versions;
- dependency failure;
- regional/cell recovery for the selected deployment;
- support/incident exercises.

## Certification artifact

Each source certification binds:

- source repository and revision;
- built source artifact digest;
- adapter/runtime artifact digest;
- SBOM/provenance/signatures;
- configuration digest;
- environment/deployment topology;
- supported browser/OS/gateway/MCP versions;
- permissions/management mode;
- workload identity profile;
- source profile/capability manifest;
- event coverage;
- privacy profile;
- load/resource profile;
- test results;
- known limitations;
- expiry/revocation.

Static audit alone cannot certify production.

## Service indicators

### Source and edge

- capture success/availability;
- WAL durable enqueue;
- backlog age/bytes;
- sequence gaps/loss;
- reconnect recovery;
- adapter/native latency and overhead;
- version/certification coverage.

### Ingest and processing

- durable acceptance latency/availability;
- rejects/quarantine by reason;
- normalization/resolution lag;
- unresolved/conflict/merge quality;
- canonical transaction failures;
- outbox and projection lag;
- ClickHouse/PostgreSQL parity.

### Product

- Overview/inventory/activity/API availability and latency;
- search/export completion;
- projection freshness;
- error/partial states;
- authorization denials;
- accessibility;
- customer support rate and product limitations.

Numerical SLOs and error budgets require measurement and accountable approval.

## Operational readiness

Every role has:

- owner/on-call;
- dashboard/alerts;
- health/readiness;
- runbook;
- capacity and expansion;
- dependency map;
- data authority;
- backup/restore;
- deployment/upgrade/rollback;
- incident and customer communication;
- safe diagnostics/support bundle;
- kill/pause controls for admission, processing, projection, maintenance and export.

## Backup and recovery

- encrypted, residency-compliant, monitored backups;
- PostgreSQL point-in-time recovery;
- object evidence durability/versioning appropriate to retention;
- ClickHouse projection rebuild plus required backup where rebuild RTO demands it;
- tenant-cell restore rehearsal;
- edge replay after restore;
- canonical/projection invariant validation;
- export and key recovery.

## Quality gates

These gates qualify a release candidate; they are not sequential permission
gates for product coding or integration. A failed row is active correction and
evidence work on the affected behavior.

### DIE-0 — Contract freeze

- pass scope/claims approved;
- source event catalog and typed schemas;
- canonical model and read contracts;
- runtime/storage/worker ADR;
- threat/privacy model;
- named owners and release inputs.

### DIE-1 — Dark production pipeline

- certified adapters emit to production-like ingest;
- durability, isolation, privacy and resource proof;
- canonical inventory/activity materializes;
- no customer reads;
- installed sensor adapters do not mutate or reroute Quilr 1 behavior.

### DIE-2 — Internal product

- all UI/API surfaces work;
- five-profile golden scenario covering Browser, Browser Backend, Endpoint,
  LLM Gateway and MCP Gateway;
- coverage/gaps/provenance;
- accessibility and operator readiness.

### DIE-3 — Customer pilot

- exact production artifacts;
- approved pilot tenants;
- measured SLO/capacity;
- security/privacy/backup/upgrade;
- support and rollback rehearsal;
- customer acceptance.

### DIE-GA — Approved availability population

- all release-blocking requirements and inputs closed;
- approved artifacts/configuration/deployment profile;
- no critical security/privacy/durability/tenant gap;
- product claims exactly match evidence;
- immutable gate package signed.

## Separate migration-track qualification

Document 10 retains the future migration watermarks/checksums, immutable
backfill, member-level parity, SSO compatibility, cohort/cutover/rollback,
fallback, restore and stabilization tests. They are independently scheduled and
do not appear in DIE-0 through DIE-GA.

## Prohibited proof shortcuts

- mocked dependencies only;
- a populated screenshot;
- source inspection without runtime proof;
- total row-count equality;
- “no errors in logs”;
- one sensor or one tenant;
- production deployment without certification;
- hidden gaps or stale projections;
- waived cross-tenant, evidence-loss, or critical credential risks.
