# Freeze and Change Control

## Freeze classes

### Class A — Constitutional

Examples: edge/central boundary, canonical identity authority, evidence immutability, tenant isolation, no frontend source joins.

Change requires:

- architecture review board approval;
- security and migration impact;
- superseding ADR;
- compatibility and rollback plan;
- update to requirements and GA gates.

### Class B — Protocol

Examples: envelope fields, record family semantics, source profiles, signing, idempotency, lifecycle.

Change requires:

- schema diff;
- positive/negative fixtures;
- compatibility classification;
- producer/consumer matrix;
- migration/deprecation window;
- certification update.

### Class C — Domain behavior

Examples: resolver rule, finding definition, metric formula, policy behavior, command verification.

Change requires:

- versioned rule/definition;
- replay and historical impact;
- product copy change;
- owner approval;
- golden scenarios.

### Class D — Implementation

Examples: library, framework, index, query, deployment tuning.

Change may proceed within existing contracts when tests, SLOs, and operations gates pass.

## Decision states

```text
proposed
accepted
superseded
deprecated
rejected
needs_input
```

Only `accepted` decisions are build authority.

## Change workflow

```text
problem and evidence
→ affected requirements/invariants
→ options and tradeoffs
→ ADR
→ schema/API/data migration
→ test and certification changes
→ rollout/rollback
→ approval
→ register update
```

## Compatibility

- Minor protocol/profile releases are additive.
- Meaning changes, removals, required-field additions, and enum reinterpretation require a major version.
- Unknown optional fields are preserved in evidence and ignored by consumers that do not understand them.
- Unknown required semantics fail admission.
- No producer emits a version before the target cell supports it.
- Expand/migrate/contract is mandatory for data and APIs.
- Accepted evidence is never rolled back or rewritten when code rolls back.

## Requirements traceability

Every implementation PR must list:

```text
requirement IDs
ADR IDs
source profile/schema versions
tests and certification cases
deployment/migration effect
known limitations
NEEDS_INPUT
```

## Freeze gate

The corpus becomes fully frozen when:

- all `accepted` decisions are represented in ADRs/registers;
- all P0 `NEEDS_INPUT` items have owners and due increments;
- schemas have machine validation;
- requirements have owners, gates, and tests;
- source profiles have capability and lifecycle semantics;
- walking-skeleton release scope is approved;
- rollback and Quilr 1 migration are defined.
