# Platform Role and Boundaries

## Actual role

**Verified:** this code is a customer-admin platform/BFF/read-model service with an embedded console. It does not directly instrument browsers, endpoints, LLM inference, or MCP clients. It reads their ClickHouse/graph/config projections and calls their management services.

## Modes

- HTTP server and embedded SPA.
- Custom-dashboard MCP stdio proxy selected by a CLI argument.
- Background local-store refresh/mirror loops.
- Optional activity-topic classifier/derived-table writer.
- Build-time OpenAPI exporter and SPA builder.

## Boundaries

The platform may normalize presentation and create derived topic/dashboard/saved-view/support state. It must not claim upstream capture authority or silently promote source finding labels to canonical findings. A future adapter should preserve source evidence and leave global identity/finding admission to Starliner/platform services.
