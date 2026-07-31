# 09 — Relationship-Claim Merger

The catalog contains 40 source-scoped relationship
claims.

| Source classification | Count |
| --- | --- |
| Backend claim | 3 |
| Configuration | 8 |
| Configuration/backend mapping | 1 |
| Context association | 2 |
| Derived | 2 |
| Derived locally | 1 |
| Direct UI response | 1 |
| Direct action path | 1 |
| Direct control path | 1 |
| Direct current state | 1 |
| Direct decision | 1 |
| Direct decision context | 1 |
| Direct detector result | 2 |
| Direct emission | 1 |
| Direct local state | 1 |
| Direct name observation | 1 |
| Direct observed | 11 |
| Unresolved | 1 |

Every claim retains candidate subject/object, relationship type ID, source
record, direct/inferred status, temporal semantics, confidence, authority and
evidence.

Critical non-merges:

- observation user is not automatically process execution owner;
- configured permission rule is not enterprise entitlement;
- configured agent/model/MCP relationship is not runtime invocation;
- local MCP server configuration is not automatically the same deployment as
  an MCP gateway backend;
- email, hostname, display name, URL label and temporal proximity are never
  automatic canonical join keys.

Central identity resolution and exact frozen relationship-support rules own
materialization.
