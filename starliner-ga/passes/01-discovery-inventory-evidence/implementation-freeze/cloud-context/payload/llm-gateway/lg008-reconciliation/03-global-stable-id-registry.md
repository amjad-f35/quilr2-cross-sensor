# LLM-scoped stable ID registry


Deterministic UUIDv5 IDs use `urn:quilr:lg008:<kind>:<uuid>` and include
repository/revision/qualified locator for source-versioned objects.

## Identity rules

- Logical and revision-bound objects have separate IDs.
- Source-file IDs use repository-relative paths; component-version IDs also
  carry the pinned revision.
- The symbol extractor lacks lexical qualification, so logical component IDs
  conservatively include path and declaration line to prevent false merging of
  same-named declarations. This sacrifices cross-revision stability rather than
  claiming an equivalence the evidence cannot prove.
- Registry references, parents, supersession edges, and every machine-readable
  ID reference are mechanically checked.

Registry rows: **70,356**.

| Kind | Count |
| --- | --- |
| access-recipe | 1199 |
| adapter-mapping | 26292 |
| capability | 36 |
| change-request | 8 |
| component | 6526 |
| component-version | 6526 |
| configuration-item | 224 |
| defect | 8 |
| diagnostic-signal | 5 |
| entry-point | 252 |
| event-type | 14 |
| evidence-item | 1265 |
| feature | 36 |
| field | 26292 |
| health-signal | 9 |
| message-type | 257 |
| metric | 19 |
| persisted-artifact | 14 |
| reconciliation-diff | 8 |
| record-type | 14 |
| relationship-claim | 9 |
| relationship-type | 9 |
| repository | 3 |
| requirement | 10 |
| revision | 3 |
| runtime-experiment | 1 |
| source-file | 1093 |
| source-profile | 1 |
| target-contract | 79 |
| target-field | 128 |
| unresolved-evidence-item | 8 |
| validation-procedure | 8 |

Machine registry: [`global-id-registry.yaml`](../../lg008-llm-gateway/registries/global-id-registry.yaml).
