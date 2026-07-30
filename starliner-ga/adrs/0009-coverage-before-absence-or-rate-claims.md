# ADR-0009: Coverage before absence or rate claims

Status: **accepted**

## Context

No events may mean no use, an offline sensor, an uncovered user, sampling, an incomplete snapshot, or a broken connector. Rates computed only from observed objects can be misleading.

## Decision

Model expected population, reporting population, capability, freshness, scope, and time. Findings/metrics using “new,” “all,” “stopped,” absence, or percentages declare and satisfy minimum coverage.

## Consequences

- Coverage is a canonical product object and customer surface.
- Findings can be evaluation-degraded.
- Auto-resolution pauses under insufficient coverage.
- Source health and enterprise population connectors are required.

## Rejected

Treating recent event presence as complete coverage or hiding missing denominators.

## Validation

Partial rollout, sensor outage, snapshot failure, bypass traffic, stale connector, sampling, and recovery.
