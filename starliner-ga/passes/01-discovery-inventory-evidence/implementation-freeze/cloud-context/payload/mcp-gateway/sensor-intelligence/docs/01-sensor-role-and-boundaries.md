# Sensor role and boundaries

## Verified role

`Verified in source:` the scoped system is primarily an MCP gateway and control
plane. The FastAPI application in `mcpgateway/gateway.py` creates backend
registry, authentication, OAuth, DLP, logging, OneMCP, workflow-agent, and
optional Starliner services. It exposes direct per-backend MCP forwarding,
aggregated OneMCP behavior, browser administration, log and audit APIs, and
workflow control surfaces.

The current Starliner observe implementation is not the whole gateway. It is a
bounded sensor subsystem attached to three lifecycle seams:

1. successful backend registration;
2. successful tool-capability discovery or refresh; and
3. completed Direct MCP `tools/call` processing.

`Verified in source:` the observe subsystem maps only safe metadata from those
seams into validated delivery wrappers, writes them to a bounded SQLite outbox,
and optionally drains the outbox to an HTTP ingest endpoint. The evidence side
path is intentionally fail-open with respect to the MCP response.

## Runtime boundaries

| Boundary | In scope | Current sensor observation | Evidence |
| --- | --- | --- | --- |
| Main FastAPI gateway process | Yes | Hosts the optional observe runtime, SQLite outbox, delivery worker, and Starliner operational routes | `gateway.py::starliner_runtime`, `gateway.py::lifespan` |
| Backend registry | Yes | Emits backend and tool discovery after persistence/cache update | `services/registry.py::_observe_backend_registration`, `_observe_tool_discovery` |
| Direct per-backend MCP | Yes | Emits completed `tools/call` metadata | `services/mcp_handler.py::handle_request` |
| OneMCP aggregate endpoint | Yes as product functionality | No dedicated observe seam found; it may reuse the Direct handler for some upstream calls, but OneMCP-native behavior is not certified or comprehensively instrumented | `services/onemcp_handler.py`; certification marks native OneMCP memory tools deferred |
| MCP resources, prompts, completion, logging-level, progress | Yes as Direct MCP functionality | Not mapped to Starliner records | `services/mcp_handler.py::handle_request`; manifest has no corresponding capability |
| Workflow runner/API/worker/scheduler | Separate processes | No current Starliner sensor mapping found | first-pass entry-point inventory and workflow source |
| ClickHouse synchronizer | Separate process/background surface | No current Starliner mapping found | first-pass entry-point and storage analysis |
| Google Workspace FastMCP server | Separate auxiliary server | No current Starliner mapping found | first-pass entry-point inventory |
| Rust implementation | Separate/partial implementation | No current Starliner integration found | first-pass Rust analysis |
| Central Starliner ingest | External | Optional HTTP delivery boundary only | `starliner/delivery.py::HttpDeliveryTransport` |
| Legacy Starliner decision plane | External/private SDK | Separate pre-tool compatibility path; may shadow or enforce | `services/starliner_adapter.py` |

## Current observe path versus legacy control path

| Property | Observe runtime | Legacy pre-tool adapter |
| --- | --- | --- |
| Source | `starliner/`, outbox DB, delivery worker | `services/starliner_adapter.py` |
| Activation | `STARLINER_ENABLED=true`, `STARLINER_MODE=observe`, non-empty `STARLINER_ACTOR_HASH_KEY` | `STARLINER_ENABLED=true`, `STARLINER_MODE` is `shadow` or `enforce` |
| Lifecycle position | after completed Direct `tools/call`; after registry persistence | before upstream tool execution |
| Main purpose | evidence mapping and delivery | central policy evaluation |
| Can alter MCP response | No | Yes in `enforce`; no in `shadow` |
| Failure behavior | mapping/enqueue/scheduling/delivery failures do not alter MCP response | private SDK load failure returns proceed=true; other evaluation exceptions are not caught locally |
| Raw arguments | mapper never receives them | parameter is accepted then explicitly discarded |
| User identity | tenant-scoped HMAC pseudonym | raw `user_email` is passed as `human_user_id` to the private request builder |
| Package dependency | `starliner_contracts` | different private `starliner.*` SDK |
| Evidence status | Implemented, optional, partly contract-certified | Implemented compatibility seam; external ABI and live behavior unresolved |

`Contradiction:` the cross-sensor target reserves canonical entity resolution
for the central platform, but current `MCPObserveMapper` constructs
`canonical_entity` references locally for source observations.

## Trust boundaries

1. **MCP client to gateway.** Authentication and tenant resolution occur before
   handler execution in route code. The observe mapper receives resolved
   `tenant_id`, optional `user_email`, backend ID, tool name, bounded DLP
   predictions/outcomes, block flags, upstream flag, latency, and response error
   classification.
2. **Gateway to upstream MCP backend.** Tool arguments/results cross this
   boundary in the functional handler. `Verified in source:` the observe mapper
   does not receive arguments, results, headers, tokens, or transport
   credentials.
3. **Gateway memory to local SQLite.** Validated `{envelope, body}` delivery
   records cross into `starliner_outbox`. Pending/retry rows retain the complete
   safe wrapper as JSON. Terminal rows retain metadata only.
4. **Gateway to central ingest.** A batch is POSTed as
   `{"api_version":"v1","records":[...]}`. Bearer authentication is optional
   only when an explicit loopback-only unauthenticated override is set.
5. **Gateway to legacy decision plane.** The compatibility adapter constructs a
   bounded decision request through an external private SDK and may receive a
   deny outcome before upstream execution.

## Source authority and limitations

`Verified in source:` all current-behavior claims in this analysis are pinned to
gateway commit `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`.

`Verified in source:` the observe contracts are pinned by certification code to
Starliner commit `860079c312c13f842b5804a590fa1d5430860286`.

`Unresolved:` production configuration, remote ingest behavior, private legacy
SDK behavior, horizontal topology, and live external integration semantics were
not available. Static source and local tests cannot establish that any optional
mode is enabled in production.

## Explicit non-claims

- The gateway is not claimed to observe every MCP method.
- The gateway is not claimed to observe every OneMCP/native tool execution.
- The current source observations are not treated as authoritative central
  inventory.
- A `FindingSignal` is not treated as a customer-visible finding.
- Local delivery acceptance is not treated as proof of central persistence or
  downstream materialization.
- Manifest capability declarations are not treated as runtime enablement.

