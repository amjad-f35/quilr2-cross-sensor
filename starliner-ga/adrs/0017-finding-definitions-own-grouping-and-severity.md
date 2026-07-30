# ADR-0017: Finding Definitions Own Grouping, Severity, and Recompute

Status: **accepted**

## Context

The QFG drafts correctly separated events, signals, findings, and incidents, but also proposed example dedupe windows, severity scores, weights, sample limits, accepted-risk durations, and lifecycle rules that could be mistaken for platform defaults.

## Decision

Every finding family is governed by an immutable versioned definition. The definition owns:

- eligibility and coverage admission;
- correlation/grouping key and member identity;
- temporal/update/reopen behavior;
- lifecycle and exception semantics;
- severity rubric and confidence calculation;
- evidence/display policy;
- quality evaluation, rollout, recompute, and rollback.

There are no universal production windows, scores, weights, or TTLs. Severity, confidence, source assurance, coverage, and work priority are separate dimensions. Producers cannot supply the admitted values.

Recompute writes a candidate namespace, produces an impact/quality diff, and promotes atomically. Corrections may lower current severity; history is retained.

## Consequences

- Finding results are reproducible by definition, evidence, resolver, policy, and watermark version.
- Different finding families can group correctly without platform-wide heuristics.
- Manual workflow state survives recompute under an explicit mapping.
- Quality and analyst workload gate each family independently.

## Rejected

- direct source finding creation;
- `severity = max(previous, incoming)` as a universal rule;
- source-supplied `evidence_quality`, final confidence, or risk;
- permanent suppression or fixed accepted-risk duration as a hidden default;
- fixture-only proof for GA.
