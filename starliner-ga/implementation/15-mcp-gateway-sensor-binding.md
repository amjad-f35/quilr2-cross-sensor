# MCP Gateway Sensor: Current-Code Binding

Status: **normative target binding; current behavior verified at `quilr-llm-gateway@1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`, scoped to `mcpgateway/`**

## Executive decision

The MCP Gateway already contains the beginning of the correct Starliner integration. It is not production-complete, but it should be evolved rather than discarded.

Keep:

- optional observe runtime separated from legacy enforcement;
- `BackendRegistry` discovery hooks;
- completed-tool lifecycle hook;
- privacy-safe mapping intent;
- bounded SQLite outbox;
- asynchronous delivery worker;
- per-record accepted/duplicate/rejected handling;
- manifest, self-test, metrics and delivery health;
- observation failure isolation from the MCP response path.

Change:

- source records must not contain producer-created canonical entity references;
- Direct MCP, OneMCP, native tools, resources, prompts, sessions and capability changes need explicit coverage;
- normal policy must use a local signed bundle rather than a central call on every tool;
- delivery requires the full Starliner envelope, workload identity, sequencing, admission receipt, certification and privacy contract;
- process-local sessions/confirmations/locks/queues must be externalized or the release must remain explicitly single-replica.

## Verified current integration

### Composition

`gateway.py`:

1. initializes the three SQLite schemas at import;
2. constructs `starliner_runtime = create_observe_runtime()`;
3. passes it to `MCPHandler`;
4. attaches it to `BackendRegistry`;
5. exposes Starliner routes;
6. starts/stops the runtime in ASGI lifespan.

### Discovery

`BackendRegistry` schedules:

- `observe_backend_discovered` after backend registration;
- `observe_tools_discovered` after registration and later tool discovery.

The runtime maps those into outbox records.

### Direct tool calls

`MCPHandler.handle_request` generates a gateway observation ID for `tools/call`, executes `_handle_tools_call`, then asynchronously calls `observe_tool_call` with:

- tenant;
- gateway observation and JSON-RPC request IDs;
- backend and tool;
- user email for pseudonymization;
- input/output DLP labels/outcomes;
- input/output block state;
- whether upstream was called;
- latency;
- response error state.

`_handle_tools_call` currently orders native controls as:

```text
tool enabled
→ confirmation requirement
→ input DLP
→ smart-group web-search exclusions
→ ZIA pre-filter
→ legacy Starliner pre-tool decision
→ upstream tool
→ ZIA output filter
→ output DLP
→ token-saving transform
→ response
```

This exact order is source behavior, not the final universal policy precedence. The target precedence is the control protocol and its certified native mapping.

### Current observe mapping

`starliner.mapping.MCPObserveMapper` produces:

- backend/tool `SourceObservation`;
- tool-call `ActionEvent`;
- call and latency `MetricEvent`;
- blocked-tool `FindingSignal`.

It deliberately excludes raw user email and raw prediction content and pseudonymizes the actor with a deployment-provided key.

### Current outbox/delivery

`StarlinerOutboxRepository` and `StarlinerDeliveryWorker` provide:

- bounded local rows;
- due-record claim;
- batch delivery;
- per-record accepted/duplicate/rejected handling;
- bounded exponential backoff and terminal state;
- shutdown claim release/retry behavior;
- health and metrics.

The HTTP transport posts JSON with optional bearer auth. This is a useful delivery prototype, not the complete workload-identity and signed-receipt contract.

## Current contract violations and gaps

### Producer-created canonical reference

The mapper populates `SourceObservation.canonical_entity` using deterministic IDs from `backend_entity_id` and `tool_entity_id`.

That violates the Quilr 2 identity boundary. The replacement record contains:

- source namespace;
- source backend registry ID;
- source tool name scoped to backend deployment;
- normalized endpoint/transport claim;
- optional current platform binding token and binding revision.

Only the central resolver assigns the canonical MCP server/tool identity.

### Incomplete surface coverage

Direct MCP and OneMCP are separate route and handler stacks.

Existing direct-handler observation does not establish:

- OneMCP remote dispatch coverage;
- OneMCP native memory/client/confirmation tool coverage;
- resource read;
- prompt get;
- session start/end;
- server capability negotiation change;
- progress/cancellation;
- sampling or elicitation;
- authentication/reachability posture;
- explicit server/tool removal;
- workflow-delegated MCP lineage.

Each surface either implements the profile subtype or declares the capability unsupported/deferred.

### Direct source signal is not a finding

The existing `FindingSignal` for a blocked tool is permitted only as a source-local signal. It is not a customer finding, does not own grouping/severity/lifecycle, and cannot bypass central finding admission.

### Legacy hot-path decision adapter

`services.starliner_adapter.evaluate_starliner_mcp_pre_tool` lazily constructs an external SDK runtime and can call a central decision service for each tool in `shadow` or `enforce`.

For the GA design:

- common actions evaluate against the active local signed bundle;
- bounded central escalation is policy-defined;
- decision/approval leases are cached and scoped;
- the observe path remains asynchronous;
- the control path remains separately authenticated and audited.

The legacy adapter remains behind a migration mode until local-PEP parity passes.

## Runtime placement decision

The MCP Gateway initially retains an embedded Python Starliner runtime because:

- it already owns a durable SQLite outbox;
- it is wired to gateway lifecycle;
- the audited repository topology configures a single replica;
- it minimizes migration risk.

Before horizontal scaling, either:

1. move WAL/delivery/policy/command state to a per-pod sidecar while keeping the typed adapter in process; or
2. certify a shared durable runtime implementation with correct multi-process coordination.

Sharing the current SQLite/process-local state across uncontrolled replicas is prohibited.

The product’s OneMCP sessions, confirmations, OAuth locks and event queues are operational gateway state, not Starliner canonical state. They must be externalized for multi-replica gateway support independently of the evidence runtime.

## MCP-to-platform records

Required profile subtypes include:

- gateway deployment and runtime lifecycle;
- registry snapshot begin/page/complete;
- server definition upsert/delete;
- tool/resource/prompt definition upsert/delete;
- server connection/reachability/auth posture;
- initialize and negotiated capability observation;
- session lifecycle;
- tool/resource/prompt invocation action;
- progress/cancellation/timeout outcome;
- local policy decision and native effect;
- safe structural argument/result metadata and data labels;
- health, coverage, bypass, gap and loss.

Tool arguments/results, resource/prompt/elicitation/sampling content, authorization headers, tokens and credentials are not ordinary evidence.

## Platform-to-MCP flow

### Policy

The local PEP binds:

- authenticated user/workload/delegation chain;
- client application/agent;
- server/tool source refs or current binding tokens;
- action;
- safe data/risk labels;
- active bundle/context/authority versions.

It returns only supported primitives:

- permit;
- deny;
- require confirmation/approval;
- rate limit;
- redact through the certified native DLP path;
- disable/quarantine a registered route where supported.

### Commands

Candidate command families:

- reconcile server/tool registry;
- enable/disable a registered backend or scoped tool;
- invalidate OAuth/upstream auth through the native authority;
- force re-discovery/reconnect;
- revoke a bundle/lease;
- drain a deployment;
- collect bounded diagnostics;
- stage/activate/rollback a signed runtime/adapter artifact.

Commands target source bindings and use repository/service methods. The platform never edits `gateway.db` directly.

### Effect

Examples:

```text
deny tool decision
→ JSON-RPC policy error returned
→ upstream_called=false
→ effect observation

disable backend command
→ registry/repository mutation accepted
→ active connection closed or route rejects
→ registry reconciliation confirms disabled
→ central effect verified
```

A command receipt is not an effect. A product log row is not an effect.

## Exact current-code changes

1. Replace `canonical_entity` in source mappings with source refs and optional binding tokens.
2. Add profile-specific records for registry deletion, snapshots and capability negotiation.
3. Instrument `OneMCPHandler` and native-tool paths explicitly; do not infer coverage through `MCPHandler`.
4. Instrument resources, prompts, progress, cancellation and session lifecycle by certified capability.
5. Preserve a gateway-generated observation ID across Direct, OneMCP and workflow delegation.
6. Upgrade the outbox envelope with workload identity, sequence/epoch, privacy disposition, profile/certification and central receipt semantics.
7. replace static bearer-only delivery with the approved workload identity profile.
8. replace normal legacy central pre-tool calls with local PEP/bundle evaluation.
9. add typed command adapters and post-effect reconciliation.
10. make optional private packages release-pinned, reproducible and included in default certification.
11. make the default/CI test selection include Starliner contract, outbox, adapter, handler and script tests.
12. externalize operational state or retain a certified single-replica support statement.

## Migration sequence

1. freeze golden traces from the audited direct MCP behavior;
2. correct identity semantics in observe mappings;
3. prove outbox crash/replay/duplicate/partial-ack behavior with the approved contracts;
4. add OneMCP and registry reconciliation coverage;
5. ingest to the tenant cell and validate central server/tool resolution;
6. dual-run legacy and local policy in shadow mode;
7. add typed effects and commands;
8. certify multi-replica state or keep the release single-replica;
9. switch Quilr 2 MCP inventory/activity/findings to canonical APIs;
10. remove legacy adapter modes after cutover and rollback closure.

## Certification blockers from current evidence

- private `starliner_contracts` and legacy `starliner.adapters` were unavailable to the scoped default test environment;
- top-level Starliner tests are outside configured default `pytest` discovery;
- Direct and OneMCP surfaces are separate and not uniformly observed;
- producer-created canonical reference semantics;
- optional delivery authentication can remain deferred;
- process-local OneMCP sessions/confirmations/locks/queues;
- committed/default credentials and plaintext OAuth-token behavior;
- permissive credentialed CORS and unresolved production override;
- no scoped production orchestration for workflow runner/scheduler/retention/sync processes;
- no live remote MCP, IdP, DLP, ClickHouse or multi-replica certification.
