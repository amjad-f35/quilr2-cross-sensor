# End-to-End Lineage


The lineage graph has 585 rows—exactly one for every Browser source field. Each row terminates at an explicitly matched frozen target field or a controlled terminal disposition.

`source field → capture locator → source record → adapter mapping → protocol target or disposition terminal`

PostgreSQL, ClickHouse, OpenAPI and UI edges are marked proposed/not implemented. See [`end-to-end-lineage.ndjson`](../../lg008/reconciliation/end-to-end-lineage.ndjson).
