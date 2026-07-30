# Canonical Ledgers and Materialization

Status: **normative**

## Separation of concerns

The platform distinguishes:

1. immutable source evidence;
2. normalized observations;
3. identity claims and resolution decisions;
4. canonical entity and relationship ledgers;
5. product read models;
6. analytical projections.

Conflating these layers makes corrections, provenance, replay, and customer explanations unreliable.

## Canonical operational authority

PostgreSQL in the tenant cell is the canonical operational authority for:

- entity records and versions;
- source-object links;
- claims and resolution decisions;
- typed relationships;
- ownership and governance state;
- findings and lifecycle;
- policies, decisions, approvals, commands, and outcomes;
- workflow state;
- projection checkpoints and transactional outbox.

Object storage retains large immutable evidence and exports. ClickHouse, graph, search, and caches are projections.

## Bitemporal model

Material facts record:

- **valid time**: when the fact was true in the source or enterprise;
- **system time**: when the platform accepted or decided it.

This supports late arrivals, corrections, “what did we know then,” and historical reporting without rewriting history.

## Entity projection

A canonical entity projection includes:

- stable canonical ID and entity class;
- display name and aliases;
- lifecycle state;
- source coverage and last-seen by source;
- ownership and governance;
- approved/managed status;
- material attributes with provenance;
- confidence and conflict state;
- first/last observed;
- relationships;
- active findings;
- activity and cost summaries;
- change version.

Every material field resolves to claims and evidence.

## Field selection

Field selection is controlled by the authority map:

1. applicable authoritative active claim;
2. strongest direct observation within freshness bounds;
3. approved user assertion;
4. derived value with method and confidence;
5. imported legacy value as fallback.

Conflicting material claims are visible. The system does not merge arbitrary JSON using last-write-wins.

## Relationship ledger

Relationships are typed, directional where appropriate, and effective-dated. Examples:

- application `USES` model deployment;
- agent deployment `INVOKES` tool;
- tool `SERVED_BY` MCP server;
- user `OPERATES` agent deployment;
- team `OWNS` application;
- gateway `OBSERVED_EXECUTION_FOR` application;
- endpoint `COVERS` device;
- policy `APPLIES_TO` entity.

Each edge has evidence, authority, confidence, valid time, system time, and lifecycle.

## Transactional outbox

Every canonical mutation and its projection event commit in one database transaction. Outbox consumers update search, graph, analytical, notification, and cache projections idempotently. The outbox is independently monitored and replayable.

## Materializer model

Materializers are:

- deterministic for the same inputs and version;
- partitioned by tenant and aggregate;
- idempotent;
- checkpointed;
- safe under duplicate and reordered events;
- versioned;
- observable;
- capable of shadow output and comparison;
- able to rebuild into a new namespace.

## Rebuild and promotion

Never clear the active customer read model before a rebuild. Instead:

1. snapshot input watermarks and versions;
2. build a candidate projection;
3. validate counts, invariants, samples, and product-impact diffs;
4. catch up changes after the snapshot;
5. atomically switch the projection alias;
6. retain the prior projection for the rollback window;
7. erase it under retention policy after approval.

## Data invariants

- A source object links to at most one active canonical entity for a given resolution context.
- All field values have provenance.
- Canonical IDs are tenant-scoped and never reused.
- A deleted source object does not automatically delete the canonical entity.
- Current state can be reproduced from ledgers and versioned code.
- A projection failure cannot corrupt canonical state.
- Cross-tenant joins are impossible by construction.
- Findings and policies target canonical entities with preserved resolution history.

## Change-data distribution

Projection events contain canonical IDs and changed-field summaries, not unrestricted evidence. Consumers are authorized per topic and purpose. Sensitive projections use separate encryption and access classes.
