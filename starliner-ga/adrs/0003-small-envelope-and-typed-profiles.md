# ADR-0003: Small envelope and typed profiles

Status: **accepted**

## Context

A single enormous cross-sensor event schema forces meaningless null fields and loses source semantics. Fully unrelated schemas make trust, lifecycle, routing, and tooling inconsistent.

## Decision

Use a small common Starliner envelope for identity, time, lifecycle, integrity, privacy, and correlation, plus typed record families and versioned source profiles.

## Consequences

- Common ingest and delivery behavior.
- Source semantics remain explicit.
- Code is generated from JSON Schema 2020-12.
- Capability manifests declare which profile records a producer may emit.
- Compatibility is managed independently per profile and record.

## Rejected

One universal flat event, arbitrary untyped maps, or source-specific transport protocols.

## Validation

Schema conformance, unknown-field behavior, mixed-version tests, source fixtures, and profile certification.
