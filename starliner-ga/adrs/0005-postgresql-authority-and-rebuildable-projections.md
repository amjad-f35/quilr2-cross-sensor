# ADR-0005: PostgreSQL authority and rebuildable projections

Status: **accepted**

## Context

Quilr 1 composes inventory and analytics from warehouse, graph, caches, services, and frontend calls with unclear authority and synchronization.

## Decision

PostgreSQL in the tenant cell is authoritative for canonical operational ledgers. ClickHouse, graph, search, and caches are disposable/rebuildable projections updated through the transaction outbox.

## Consequences

- Every mutation has one transaction authority.
- Product APIs read stable projections or canonical state with explicit freshness.
- Projection-specific scaling remains possible.
- Rebuild/promotion tooling is mandatory.

## Rejected

Graph-as-universal authority, Redis authority, frontend joins across sensors, or dual-write to canonical stores.

## Validation

Transaction failure, projector replay, new-namespace rebuild, parity, atomic alias switch, and rollback.
