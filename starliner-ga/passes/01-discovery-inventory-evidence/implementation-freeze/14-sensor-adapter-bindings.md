# Sensor Adapter Bindings

## Authority and scope

This document binds the frozen source profiles to the verified current sensor seams. It closes where the pass adapter is inserted, which runtime owns durability, what the adapter emits, and which existing paths are explicitly not evidence authority.

The deeper evidence remains in the normative current-code bindings:

- [Browser binding](../../../implementation/12-browser-sensor-binding.md)
- [Endpoint binding](../../../implementation/13-endpoint-sensor-binding.md)
- [LLM Gateway binding](../../../implementation/14-llm-gateway-sensor-binding.md)
- [MCP Gateway binding](../../../implementation/15-mcp-gateway-sensor-binding.md)

Where those broader documents discuss policy, commands, findings, migration, or deployment portfolio, those sections are outside this pass. Their verified current-code observations and capture seams remain evidence. The executable profile schemas in this package control emitted bytes.

## Common adapter contract

Every adapter implements the same behavioral boundary:

```text
native lifecycle callback
→ construct source-native SafeFact
→ validate component capability
→ privacy classify/minimize/pseudonymize
→ map to exact profile payload kind
→ validate payload and envelope binding
→ durably enqueue once in the Edge Runtime WAL
→ return bounded enqueue result to native caller
```

The native product path does not wait for central delivery. The adapter enqueue API returns:

- `accepted`: exact record is durable in the local WAL;
- `duplicate`: the same native operation/record identity is already durable;
- `backpressured`: bounded queue admission is temporarily unavailable;
- `prohibited`: privacy policy forbids the fact;
- `unsupported`: this artifact/capability is not certified;
- `invalid`: the safe fact cannot satisfy the profile;
- `failed`: local durability failed.

An adapter must not report `accepted` after an in-memory enqueue alone. A `backpressured` or `failed` result becomes component health/coverage degradation through the reserved control lane; it is never silently discarded.

Required adapter inputs:

- authenticated tenant, producer installation, component and artifact context from the Edge Runtime;
- native operation/source ID and source namespace;
- occurrence and observation time;
- typed safe fact;
- actual causal/request/session correlation where available;
- declared capability and privacy-policy version.

Required adapter outputs:

- one immutable typed source record, or an explicit non-admission result;
- no canonical ID, product authorization relationship, finding, risk, or frontend aggregate;
- no raw content prohibited by the profile.

The generated SDK owns envelope construction, UUIDv7 record identity, sequence allocation, canonical serialization, digest, WAL transaction and receipt transition. Sensor code owns native extraction and the safe-fact mapper only.

## Frozen runtime placement

| Source | Adapter placement | Durable owner | Producer identity |
|---|---|---|---|
| Browser Extension | extension background/service-worker context | transactional browser WAL in embedded Starliner runtime | extension installation; no current profile identity |
| Browser native host | native operation seam; normally returns facts to extension runtime | extension WAL unless independently certified for direct delivery | distinct native component identity and lineage |
| Browser Backend | Spring service boundary after authentication/validation | backend-local durable outbox | backend deployment, never extension identity |
| Endpoint | adapters in monitor/proxy/hook/agent processes | one device-local supervised Edge Runtime over authenticated bounded IPC | installation plus enrolled component |
| LLM Gateway | in-process request/config lifecycle adapter | one sidecar Edge Runtime/WAL per gateway pod | gateway deployment/runtime |
| MCP Gateway | embedded Python runtime for certified single-replica launch | existing SQLite outbox hardened to frozen WAL contract | gateway deployment/runtime |

The MCP Gateway must move to a per-pod sidecar or a certified shared durable runtime before evidence-producing horizontal replicas are enabled. The current SQLite/process-local state is not multi-replica safe.

## Browser Extension and native host

### Verified capture seams

| Current seam | Adapter responsibility |
|---|---|
| `FrameManager.handleUploadEvent` | accept only as untrusted MAIN-world bridge input |
| `userActivityChannelController` | validate sender tab/frame and attach runtime observation ID |
| `BrowserSession.notifyUserAction` | map privacy-safe interaction and application-use facts |
| `ProcessChain.runProcessChain` | correlate existing native decision with chain/config version |
| `ActivationRules.PageLoadEvent` | emit application observation after origin/catalog classification |
| `ActivationRules.GenAiPromptSubmitted`, `ScanForSensitiveDataV2` | emit operation, safe classification labels, decision/effect; omit content |
| `ProcessCopyEvent`, `ProcessPasteEvent` | emit coarse operation and approved labels only |
| `ArtifactsToTrails.ts::FileUploaded` | emit upload/scan stage and coverage |
| `UploadManagerService` | bind native request/result to stable operation ID |
| `FileUploadScanned` | map safe scan result and current native decision |
| MAIN-world injection result | independently emit observed page effect |
| native `start_native_messaging_loop` | native component lifecycle/protocol health |
| native `FileUploadHandler` / `FileSearchService.handle_upload_request_batch` | emit correlated native scan outcome without file content |

### Profile output

- `browser.installation`
- `browser.device`
- `browser.application`
- `browser.account_context`
- `browser.relationship`
- `browser.local_binding`
- `browser.activity`
- `browser.upload`
- `browser.native_outcome`
- `browser.snapshot`
- `browser.health`
- `browser.gap`

The browser adapter emits its strongest installation, browser-native device, application and account/session identifiers and explicit typed relationships; it never joins a persona to an Endpoint device by email, hostname or timing. No stable `browser_profile_id` was found in the audited current producer, so a profile record is not part of this pass. When the new local-binding capability is implemented and Endpoint is present, the native host obtains a tenant- and audience-bound `browser.local_binding` assertion from the authenticated Endpoint Edge Runtime and relays the exact signed bytes. The assertion addresses the browser installation and a qualified Endpoint device; Browser code cannot mint or edit it. An execution-identity reference is optional and may be carried only when Endpoint proves the exact native identity—it is not copied from Browser persona email or Endpoint observation context. `technology_class`, `agentic_capability`, classification authority and catalog revision are emitted only from the catalog/configuration authority and may remain `unknown`.

The current extension can directly state `Guest` or `CredsBased`. The adapter maps those to source `guest` or `credentialed` authentication context. It may emit `personal`, `corporate`, or `guest` account-usage classification only after the exact backend/legacy writer and its authority are identified; absent that evidence, credentialed remains `authenticated_unknown` centrally.

The single pending response slot and positional upload association must be replaced by request- and item-ID maps before certification. Service-worker suspension, restart, upgrade, concurrent uploads, offline replay and WAL quota exhaustion are mandatory tests.

## Browser Backend

### Verified capture seams

| Current seam | Adapter responsibility |
|---|---|
| `UserActionController.logBrowserEvent` | emit backend receipt only after authentication and validation |
| `RiskTransformerFactory` and transformers | legacy product transformation only; never canonical normalization |
| `QuilrProducerService` | report requested/callback publication stage, not durable platform admission |
| persona registration services | emit enrollment/configuration receipt with native IDs |
| `PersonaService.recordHeartbeatV2`, `HeartbeatBucketService` | operational heartbeat evidence only |
| `HeartbeatBatchScheduler` | current process-memory path is not durable coverage authority |
| deployment/configuration services | configuration observations only in this pass |

### Profile output

- `application_catalog`
- `application_configuration`
- `browser_event`
- `native_decision`
- `action_outcome`
- `installation`
- `heartbeat`
- `publication_gap`
- `reconciliation_snapshot`

A relayed extension record preserves the original signed producer identity, epoch, sequence, record ID and digest. A backend-native processing record uses the backend producer and a parent record ID. These are never counted as two independent browser actions.

## Endpoint compound sensor

### Component IPC

System Monitor, proxy, hooks and agent/service adapters send typed safe facts to one supervised runtime through a dedicated Unix-domain socket or Windows named pipe. The channel requires OS peer identity, restrictive ACLs, enrolled component/artifact identity, frame and message bounds, capability allowlists and per-component backpressure. The current broad unauthenticated hook socket is not reused as this trust boundary.

### Verified capture seams

| Current seam | Adapter responsibility |
|---|---|
| agent `main`, shared shutdown, `ServiceManager`, `LifecycleManager` | component lifecycle, version, crash and health |
| Persona context | source tenant/person/device/account claims; never tokens |
| bootstrap integrity and updater status | provenance/update outcome evidence only |
| `Orchestrator::run` | register component capabilities and independent degradation |
| `ProcessEnumerator`, `process_monitor::run` | process instances scoped by device boot epoch |
| `Correlator::correlate` | source alias claims; never canonical merge |
| `scanner::run`, `execute_script`, `convert_results` | versioned scanner observations after privacy mapping |
| `pkg_scanner::{npm,cargo,go}` | package/application candidates and snapshot scope |
| `EntityStore::upsert` and events | principal delta observation seam |
| local snapshot save/load | native recovery only; not evidence durability |
| `ActivityEvaluator::evaluate` / `build_entry` | privacy-safe activity; current Allow is not enforcement proof |
| `ActivityBatcher` | retire as evidence transport in favor of WAL |
| proxy `handle_request`, `RequestContext` | structural request lifecycle and attribution |
| `capture_body_with_streaming` | do not pass body to ordinary evidence |
| `evaluate_body`, `handle_dlp_for_ctx` | approved data labels only |
| native block/forward/redact/justification paths | separate decision and observed effect |
| `HookManagerService`, `HookInstaller::install_merged` | hook capability and native configuration outcome |
| `HookIpcServer` | native current behavior only; not trusted Starliner IPC |

### Profile output

- `endpoint.entity`
- `endpoint.relationship`
- `endpoint.activity`
- `endpoint.native_decision`
- `endpoint.native_effect`
- `endpoint.snapshot`
- `endpoint.health`
- `endpoint.gap`

`endpoint.entity` is restricted to the executable profile enum: `endpoint_installation`, `device`, `local_user`, `process`, `application_product`, `application_installation`, `agent_definition`, `agent_deployment`, `model_product`, `mcp_server`, `mcp_server_deployment`, `repository`, `agent_hook`, `agent_skill`, `configured_permission_rule`, and `agent_plugin`. The current native `EntityKind` values are exactly `Application`, `McpServer`, `Hook`, `Skill`, `Agent`, `Model`, `ControlledRepo`, `Permission`, and `Plugin`; device/user/process context comes from separately named runtime seams. Endpoint does not currently emit MCP tool/resource/prompt definitions, model version/deployment/runtime, enterprise roles/permissions/credentials, or a browser profile. The source `mcp_server` type maps to canonical `mcp_server_product`; it may not collapse product and deployment into one object.

For every local `agent_deployment`, the adapter supplies the definition source ID, exact device source ID, source-authority installation/configuration scope and `deployment_locality=local`. Project/workspace/repository, process, session and version are separate attributes/relationships/activity. Endpoint `UserContext` is stored as observation-user context; it is not relabeled as execution identity. `executed_as` requires exact `ProcessInfo` UID/SID mapped to a local account or another explicit native execution identity. A missing execution identity does not erase the deployment, but it remains null/unknown and prevents any user-bound cross-producer identity rule.

For every MCP configuration, the adapter separates server product from deployment and supplies the parent application/agent or configuration scope, locality, transport and credential-free origin needed to distinguish same-name local and remote servers. Configuration produces `configured` edges; a hook/proxy observation produces `observed` activity/edges. Empty current hook fields do not become fabricated observations.

`resolve_app_ids`, `/ea/v1/sync/discovered-apps`, `/ea/v1/sync/activity` and `/ea/v1/sync/alerts` do not become Quilr 2 truth paths. Native source IDs are emitted first and central resolution owns the canonical binding.

The signing/CA incident, authenticated IPC, updater integrity and clean artifact provenance block certification of affected endpoint capabilities. They do not change this target design.

## LLM Gateway

### One lifecycle interceptor

Every advertised provider-compatible transport invokes:

```text
begin_request
→ authenticated_context
→ route_selected
→ native_decision
→ provider_attempted
→ provider_result
→ response_decision
→ completed
```

One gateway observation ID is generated at ingress and carried through retries, failover, streaming and cancellation. Client and provider request IDs remain namespaced aliases.

A certified Endpoint proxy or instrumented client may attach a short-lived signed Starliner context assertion bound to tenant, gateway audience and request digest. The gateway verifies it before placing `cross_sensor_attribution` on the invocation; the central normalizer verifies it again. Without valid proof, `agent_deployment_source_id` is gateway-local only and cannot be silently rebound to an Endpoint agent.

### Verified capture seams

| Current seam | Adapter responsibility |
|---|---|
| `DataClassifier.blacksheep_app:app`, `on_start`, `on_stop` | deployment/artifact/capability lifecycle |
| `openai_compatible.validate_api_key` | verified tenant/principal/app/provider/route context without credentials |
| `jwt_auth.validate_jwt_token` | verified issuer/subject/client claim references |
| `rbac.evaluate_app_permission`, `check_allowed_source_ip` | native decision and safe reason |
| `openai_chat_completions` | reference lifecycle implementation |
| provider-specific/Responses/Assistants/Realtime/embedding/rerank/audio modules | implement the same interceptor or advertise unsupported |
| request/response DLP and Guardian modules | safe labels plus native decision/effect |
| provider adapter call | upstream attempt/result and returned provider ID |
| `llmgateway_database.DatabaseManager` | secret-free configuration reconciliation |
| `db_write_queue.publish_db_write` | legacy analytics only; not evidence durability |

### Profile output

- `llm.entity`
- `llm.relationship`
- `llm.invocation`
- `llm.native_decision`
- `llm.native_effect`
- `llm.snapshot`
- `llm.health`
- `llm.gap`

`llm.entity` can distinguish gateway deployment, provider, provider account, model product/family/version/deployment, route, client application/deployment, workload/workload identity and agent definition/deployment only when the corresponding current request/configuration field contains a stable source-native identifier. Optional observability agent fields stay gateway-source-scoped and cannot become an Endpoint agent without signed attribution or an authoritative mapping. Gateway caller identity proves only the authenticated/routed gateway context; it does not prove the caller's endpoint device or activity that bypasses the gateway.

Streaming response enforcement is advertised only for an exact transport/artifact that proves it. Otherwise the profile emits request-side controls, stream lifecycle and an explicit unsupported/degraded response-control capability.

The audited DLP bypass, credential-encryption defaults, unauthenticated configuration service and bundled process supervision block affected artifact certification. They are not reasons to invent a different data spine.

## MCP Gateway

### Verified capture seams

| Current seam | Adapter responsibility |
|---|---|
| `gateway.py` ASGI lifespan | runtime start/stop and health |
| `BackendRegistry` registration/discovery hooks | server/tool discovery and reconciliation |
| `MCPHandler.handle_request` | Direct MCP observation ID and lifecycle |
| `_handle_tools_call` | decision/upstream/effect stage correlation |
| `MCPObserveMapper` | replace producer canonical references with source refs |
| `StarlinerOutboxRepository` | harden into exact WAL/sequence/receipt contract |
| `StarlinerDeliveryWorker` | retain partial-ack/retry behavior under frozen ingest API |
| `OneMCPHandler` and native tools | instrument independently; Direct coverage proves nothing about these surfaces |
| resource/prompt/session/progress/cancel handlers | emit only when exact surface is certified |
| `UpstreamProtocolCacheRepository` and `mcp_protocol_cache.py` | preserve capability/transport observations by backend, authorization context, endpoint fingerprint and protocol version |

### Profile output

- `mcp.entity`
- `mcp.relationship`
- `mcp.tool_call`
- `mcp.operation`
- `mcp.native_decision`
- `mcp.native_effect`
- `mcp.snapshot`
- `mcp.health`
- `mcp.gap`

`mcp.entity` distinguishes gateway deployment, server product/deployment, tool/resource/prompt definition, client application and gateway-native caller identity. Agent definition/deployment and workflow version/schedule/run are emitted only by the exact native workflow/custom-agent code path with a stable native ID; `agent_keyword`, `agent_name`, user-agent, caller email and timing are never sufficient. Server/tool configuration is `configured`; calls and resource operations are `observed`. The gateway never upgrades one of those into an enterprise permission claim.

The current gateway has two materially different capability authorities. `backends.capabilities` is a backwards-compatible shared list cache. Exact initialize and transport observations are scoped by `(backend_id, auth_context_key, endpoint_fingerprint[, protocol_version])`. The adapter must label an `exposes` relationship `shared_legacy_cache` or `authorization_context`; the latter carries tenant-keyed HMAC tokens for the authorization context and endpoint configuration. Raw source hashes, endpoint inputs, headers and credentials are prohibited. Central relationship identity and materialization include the scope fields, so one principal's tool/resource/prompt view can never be flattened into another principal's or into a tenant-wide complete catalog. Protocol version and observation freshness are claims on that scoped view, not global server attributes.

Endpoint-to-MCP activity attribution uses the same tenant-, audience-, request-digest- and expiry-bound signed context contract as LLM invocation. A remote Endpoint configuration binds to a Quilr MCP deployment only through its exact gateway deployment/server ID or authoritative mapping; URL/name/tool overlap is insufficient.

`FindingSignal` remains a source-native signal and is not emitted as a customer finding. Existing `canonical_entity` values are accepted only through the named legacy compatibility profile and cannot bind central identity.

Direct, OneMCP, native tools, resources, prompts, sessions, progress and cancellation each have independent capability bits and certification. An uninstrumented surface is `unsupported`; a supported surface that stops producing is a `gap`.

## Reconciliation implementation

Every source must support delta records and periodic bounded snapshots before that capability is certified. Current Browser, Endpoint, LLM Gateway and MCP Gateway code does not yet implement the frozen reconciliation protocol; `*.snapshot` is therefore `new_capture_required`. The implemented adapter produces:

1. `started` with exact producer/profile/scope, source revision and optional expected count;
2. ordered `page` records containing source references only;
3. `completed` with observed count, `full|partial|unknown` completeness and digest; or
4. `failed` with a bounded reason code.

The digest is calculated over the sorted normalized tuple:

```text
(source_object_type, source_namespace, source_object_id)
```

using length-prefixed UTF-8 components and SHA-256. Empty full snapshots are valid only after the source proves the expected scope exists and the completion record passes all page/count/digest checks.

## Certification stop lines

Code can be implemented against these bindings now. A source/capability may be advertised in production only when the exact built sensor, adapter and runtime artifact passes:

- positive and negative profile corpus;
- privacy canary tests;
- native correlation and concurrency tests;
- WAL crash/restart/upgrade/replay/partial-receipt tests;
- identity/tenant/component authentication;
- reconciliation truncation/conflict/empty/full/partial tests;
- capability-specific integration tests;
- artifact signing/provenance and vulnerability gates;
- measured overhead and backpressure gates.

An uncertified capability is disabled or reported `unsupported`. No permissive “best effort” advertisement is allowed.
