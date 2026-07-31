# 08 — Global Field Register

All 639 source-native field/variant rows are preserved. Each row
has native record, name, type, source locator, meaning/consumer, producer,
proof, reachability, exactly one disposition, observability boundary,
sensitivity, retention, access recipe, evidence, adapter mapping and target
IDs when an explicit mapping resolves.

| Disposition | Field rows |
| --- | --- |
| ACTIVITY_OBSERVATION | 337 |
| CANONICAL_INVENTORY_INPUT | 59 |
| COVERAGE_OR_HEALTH | 24 |
| IMMUTABLE_EVIDENCE_ONLY | 94 |
| PRIVACY_PROHIBITED | 84 |
| RELATIONSHIP_CLAIM | 13 |
| SOURCE_LOCAL_STATE | 28 |

- Exact frozen target-field IDs resolved from explicit mappings: 66
- Fields terminating at a frozen contract or bounded non-product disposition:
  573

The latter are not silently dropped. The field validator reports each
non-prohibited non-exact mapping as `CHANGE_CONTROL_REQUIRED` so the target
owner can accept an evidence-only/source-local terminal or add a precise frozen
field mapping.

`Verified privacy boundary:` raw access/refresh token values are
`PRIVACY_PROHIBITED`. Identity metadata such as email remains sensitive
source-scoped evidence; it is not treated as a secret credential value or
enterprise-person proof.

No fields are merged merely because their serialized names match.
