# Native Field Dictionary

`matrices/sensor-intelligence/better-console-backend/native-fields.csv` contains 800 representative/contract field rows generated directly from the checked-in OpenAPI schemas. The exhaustive recursive OpenAPI expansion contains 2748 rows in `better-console-backend-analysis/generated-analysis/openapi-schema-fields.csv`.

All 130 environment names are separately documented. Rust and TS field declarations beyond the public API remain indexed in the symbol corpus rather than flattened into a misleading single global schema.

**Unresolved:** this is not a claim of every column in deployed ClickHouse/PostgreSQL/Neo4j. Live metadata was unavailable.
