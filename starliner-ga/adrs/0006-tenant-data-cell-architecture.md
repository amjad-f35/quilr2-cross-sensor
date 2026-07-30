# ADR-0006: Tenant data-cell architecture

Status: **accepted**

## Context

Enterprise customers require isolation, residency, failure containment, dedicated/on-prem options, and predictable scale. A global shared data plane makes these harder.

## Decision

Process customer evidence, canonical state, analytics, policy, and workflow in a region-bound tenant data cell. Keep the global control plane limited to release, schema, certification, trust, and tenant-routing metadata permitted by residency.

## Consequences

- Clear regional and failure boundary.
- Shared regional, dedicated, and on-prem profiles can use the same contracts.
- Cell deployment/operations automation is a first-class product dependency.
- Cross-cell analytics are prohibited unless explicitly authorized and designed.

## Rejected

One global evidence lake as required authority or residency enforced only by application filters.

## Validation

Routing failure, cross-tenant/cell penetration tests, regional recovery, key separation, observability isolation, and deployment-profile conformance.
