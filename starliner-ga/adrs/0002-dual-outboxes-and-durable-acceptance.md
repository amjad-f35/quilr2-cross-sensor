# ADR-0002: Dual outboxes and durable acceptance

Status: **accepted**

## Context

Evidence can be lost between sensor capture and central ingest, while canonical state can diverge from analytical/search/graph projections. These are different transaction boundaries.

## Decision

Use:

1. an edge WAL/outbox retaining admitted source records until authenticated central durable acceptance; and
2. a central transactional outbox committed atomically with canonical PostgreSQL mutations.

Ingest acknowledges only after durable evidence admission and idempotency state.

## Consequences

- At-least-once transport and idempotent consumers.
- Offline sensor operation has a measured disk budget.
- Projectors can rebuild without corrupting canonical state.
- Two explicit lag/backlog SLOs exist.

## Rejected

In-memory queues, acknowledgement at load balancer, dropping admitted events under pressure, or one “outbox” used as a vague substitute for both boundaries.

## Validation

Crash/power loss, duplicate/reorder, partial acknowledgement, network partition, disk pressure, transaction rollback, projection rebuild, and regional recovery.
