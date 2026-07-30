# ADR-0001: Central canonical identity

Status: **accepted**

## Context

Browser, endpoint, gateway, MCP, IdP, provider, and legacy sources see different surfaces and identifiers. Letting each source mint a canonical ID creates incompatible truths and irreversible false merges.

## Decision

Sensors and connectors preserve the strongest safe source-native identifiers. Only the tenant-cell identity service assigns canonical entity IDs. It uses versioned claims, authority, constraints, confidence, and reversible resolution decisions.

## Consequences

- Source adapters remain thin.
- Product/account/surface/deployment/instance remain distinct.
- Canonical identity may change through an audited merge or split.
- All consumers use canonical IDs but retain source provenance.
- Identity resolution becomes a critical production service and quality program.

## Rejected

- edge-generated `canonical_entity_key`;
- name-only hashes;
- last-writer-wins identity;
- destructive deduplication.

## Validation

Cross-source golden scenarios, false-merge evaluation, merge/split replay, conflicting claims, and tenant isolation.
