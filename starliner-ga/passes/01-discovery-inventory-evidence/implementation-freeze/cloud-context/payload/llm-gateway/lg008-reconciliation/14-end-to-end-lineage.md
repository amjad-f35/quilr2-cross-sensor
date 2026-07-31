# End-to-end lineage


Lineage edges: **79,196**.

Each source-field path contains at least:

```text
source field → authorized access recipe → adapter mapping
             → frozen target field or explicit disposition terminal
```

Fields with multiple same-name target candidates receive separate inferred
edges, making the ambiguity visible. The validator walks every source-field
graph to a registered `target-field` or `target-contract` terminal and checks
incoming edges for every target with claimed source support.

Edges into PostgreSQL, ClickHouse, OpenAPI, and UI remain proposals; an adapter
mapping is not misrepresented as materialized product data.

Machine graph:
[`end-to-end-lineage.ndjson`](../../lg008-llm-gateway/reconciliation/end-to-end-lineage.ndjson).
