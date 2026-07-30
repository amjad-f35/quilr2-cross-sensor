# ADR-0010: Versioned findings and metrics

Status: **accepted**

## Context

Directly turning source signals into findings and ad hoc queries into product metrics produces noise, inconsistent severity, and unexplainable changes.

## Decision

Insight definitions and metrics are versioned governed contracts. They declare eligible entity grain, evidence, identity/coverage requirements, lifecycle, severity or numerator/denominator, correction behavior, quality evidence, and status.

## Consequences

- Definition releases are independently staged and rolled back.
- Historical findings/metrics identify the version that produced them.
- Product language is limited by definition evidence.
- Quality ownership is permanent, not a one-time launch task.

## Rejected

Producer-supplied severity as authoritative, arbitrary numeric constants, event= finding, and frontend metric formulas.

## Validation

Golden fixtures, production-like replay, precision review, restatement, definition rollback, and UI explanation.
