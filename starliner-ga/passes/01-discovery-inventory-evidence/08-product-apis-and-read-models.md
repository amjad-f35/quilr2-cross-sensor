# Product APIs and Read Models

Status: **normative pass API and query contract**

## API surfaces

### Overview

- `GET /die/v1/overview`
- `GET /die/v1/overview/changes`

### Inventory

- `GET /die/v1/inventory/applications`
- `GET /die/v1/inventory/agents`
- `GET /die/v1/inventory/models`
- `GET /die/v1/inventory/mcp-servers`
- `GET /die/v1/inventory/tools`
- `GET /die/v1/entities/{entity_id}`
- `GET /die/v1/entities/{entity_id}/relationships`
- `GET /die/v1/entities/{entity_id}/sources`
- `GET /die/v1/entities/{entity_id}/timeline`
- `GET /die/v1/entities/{entity_id}/identity`

### Activity and evidence

- `GET /die/v1/activity`
- `GET /die/v1/activity/{activity_id}`
- `GET /die/v1/evidence`
- `GET /die/v1/evidence/{evidence_id}`
- `GET /die/v1/evidence/{evidence_id}/lineage`

### Sources and coverage

- `GET /die/v1/coverage`
- `GET /die/v1/coverage/gaps`
- `GET /die/v1/producers`
- `GET /die/v1/producers/{producer_id}`
- `GET /die/v1/producers/{producer_id}/capabilities`
- `GET /die/v1/producers/{producer_id}/health`

### Operations

- `GET /die/v1/resolution/conflicts`
- approved correction/merge/split endpoints under operator authorization;
- `POST /die/v1/exports`
- `GET /die/v1/exports/{job_id}`
- `GET /die/v1/audit`
- migration comparison endpoints restricted to operators/pilots.

The exact OpenAPI and JSON schemas are release-blocking deliverables. Paths above are the frozen resource model, not invented proof of an implementation.

## Standard list contract

Every inventory list provides:

- canonical ID/type/name;
- lifecycle/current state;
- surfaces/deployment summary;
- first/last observed;
- owner only where authoritative;
- environment/business scope;
- source/coverage summary;
- recent activity summary;
- material relationship counts;
- conflict/ambiguity indicator;
- canonical/projection watermark.

No finding, risk, policy, severity, compliance, or cost columns exist in this pass.

## Activity search contract

Allowlisted filters:

- time range;
- activity/event family and subtype;
- entity IDs/types;
- actor/workload class;
- source profile/producer;
- application/agent/model/MCP server/tool;
- device/environment/team where authorized;
- native decision/outcome/status class;
- data class;
- coverage/gap/capture state;
- correlation/request/session ID;
- evidence/canonical version.

Queries are bounded by tenant, time, pagination, selected fields, and cost. Full-table arbitrary SQL is not exposed.

## Evidence detail contract

Default-safe:

- source record metadata;
- producer/capability/artifact;
- timestamps and sequence;
- source-native safe references;
- privacy capture state;
- direct observation/outcome;
- admission receipt;
- chain of custody;
- normalizer/resolver/canonical lineage;
- related activities/entities;
- correction/supersession;
- retention class.

Restricted content is not implemented in this pass.

## Query-plan constraints

- an ordinary inventory request reads one PostgreSQL product projection;
- relationship requests use PostgreSQL current typed edges;
- activity search reads ClickHouse;
- activity detail hydrates canonical/evidence metadata by a bounded batch;
- evidence detail reads PostgreSQL metadata and authorized object reference;
- Overview reads one PostgreSQL summary projection;
- no customer path queries Quilr 1 and Quilr 2 and reconciles them silently;
- migration comparison uses a separate explicit operator API;
- no request calls live sensors.

## Consistency and freshness

Responses include:

- canonical version or source watermark;
- product projection watermark;
- activity projection watermark where applicable;
- generated time;
- last complete reconciliation;
- degraded/stale indicators;
- partial result semantics.

Mutations for identity correction use `If-Match`, idempotency, preview, audit, and impact. Normal customer reads do not require global linearizability.

## Authorization

Every request checks:

- authenticated principal;
- tenant/environment/cell;
- role and attributes;
- entity/business scope;
- operation and purpose;
- field sensitivity;
- evidence access permission;
- export permission.

Search, counts, errors, caches, timing, and empty states must not leak other tenant/business scopes.

## Pagination, errors, and export

- cursor pagination and deterministic ordering;
- allowlisted filters/sorts/includes;
- RFC timestamps and opaque IDs;
- structured safe error with request ID and retry classification;
- rate-limit headers;
- asynchronous, immutable-scope, encrypted, expiring exports;
- export watermark, schema version, coverage disclosure, audit, per-file checksum.

## Compatibility

The pass API is not a thin rename of Quilr 1. Compatibility adapters translate only documented legacy contracts. New APIs retain unknown-enum handling, additive minor evolution, major-version migration, deprecation telemetry, generated SDK tests, and frontend contract tests.
