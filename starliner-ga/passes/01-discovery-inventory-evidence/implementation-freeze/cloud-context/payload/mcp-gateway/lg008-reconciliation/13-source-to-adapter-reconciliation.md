# Source-to-adapter reconciliation

## Responsibility boundary

### Native MCP Gateway

- capture registry, protocol, request, decision, effect, health, and gap facts;
- enforce local native controls;
- construct immutable safe facts;
- avoid raw content/credential export.

### MCP source adapter

- map source-qualified IDs and lifecycle;
- preserve Direct/OneMCP/native/workflow surface;
- minimize/pseudonymize source data;
- emit no canonical ID, finding, or enterprise authorization claim.

### Starliner

- producer identity and certification;
- envelope and sequence;
- durable WAL/outbox admission;
- delivery, replay, receipts, health, and signed control.

### Central platform

- canonical identity and conflict resolution;
- cross-sensor joins;
- inventory, activity, relationships, findings, analytics, API, and UI.

## Current extraction points

Preferred current seams are:

- `BackendRegistry._observe_backend_registration`;
- registry tool/capability refresh;
- `MCPHandler._observe_completed_tool_call`;
- validated outbox enqueue;
- safe projections of `tool_call_logs`, events, and rejected requests;
- workflow repository/API;
- new OneMCP lifecycle hooks.

Packet interception, generic middleware scraping, stdout parsing, token-table
reads, and process-local-dictionary inspection are rejected.

## Mapping statuses

The 14 source-to-target mapping families are classified as:

- `READY_WITH_MINOR_SOURCE_CHANGE` where current capture is close but violates
  identity, lifecycle, or completeness requirements;
- `BLOCKED_BY_UNRESOLVED_EVIDENCE` for surfaces without certified capture;
- `REQUIRES_EXTERNAL_CONNECTOR` where authority does not belong to MCP.

## Required MCP changes

1. remove producer-created canonical references;
2. add source namespace and binding revision/token semantics;
3. close Direct exception paths;
4. instrument OneMCP/native/workflow/resource/prompt/session/progress/cancel
   surfaces separately;
5. add registry snapshot/delete/completeness and fetch-error state;
6. emit distinct decision and observed effect;
7. add durable health/gap/loss records;
8. harden the current outbox to frozen WAL/receipt/certification semantics.

Machine mappings:

- [source to adapter](../../lg008/reconciliation/source-to-adapter.yaml)
- [source to protocol](../../lg008/reconciliation/source-to-protocol.yaml)
