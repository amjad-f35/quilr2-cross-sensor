# Policy, control, and enforcement

## Native enforcement sequence for Direct tool calls

```text
tool enabled check
→ optional human confirmation gate
→ native input DLP monitor/redact/block
→ smart-group web-domain exclusion injection
→ optional ZIA input filtering
→ optional legacy Starliner shadow/enforce decision
→ upstream tool call
→ optional ZIA output filtering
→ native output/structured-output DLP monitor/redact/block
→ optional token-saving transformation
→ response/logging/post-result observation
```

The exact sequence matters: an output block can occur after the upstream side
effect; a pre-tool input/legacy deny prevents it.

## Control catalog

| Control | Enforcement location | Decision input | Effect | Failure behavior | Current telemetry |
| --- | --- | --- | --- | --- | --- |
| tool enable/disable | `MCPHandler._handle_tools_call` and tool listing | resolved backend settings + tool name | JSON-RPC method-not-found; no upstream | local deterministic | action shows pre-upstream error, but reason/control absent |
| tool confirmation | direct/OneMCP confirmation helpers | scoped setting, context-bound pending record, user approval | defer, discard, or replay original call | volatile pending state expires after 10 min | current action only shows no-upstream error/success; no approval actor |
| input DLP | `DLPService.process_input` | content, categories/actions, tenant | monitor, redact, block | invalid redacted JSON uses original input | labels/outcome/block mapped |
| output DLP | `DLPService.process_output` | response text, categories/actions | monitor, redact, replace result with block error | external processor exceptions are not universally caught here | labels/outcome/block mapped |
| ZIA URL policy | handler mixin | URL/domain, user/group/department, overrides | remove/block entries | timeouts/cache/degradation handled in mixin | not mapped |
| smart-group web exclusions | handler | cached group membership + settings | inject `domain_filter` | missing groups means no exclusions | not mapped |
| legacy Starliner shadow | compatibility adapter | IDs, email, DLP labels/signals, external policy | observe decision but proceed | SDK missing fails open | decision details not mapped |
| legacy Starliner enforce | same | same | JSON-RPC `-32003`, no upstream | SDK missing fails open; evaluation exceptions may propagate | final blocked action/signal only if normal return reaches hook |
| scoped access policy | Direct/OneMCP route/resolver | tenant/user/group/backend/client | deny endpoint/tool visibility/use | structured rejection/event | not mapped to Starliner |
| OAuth/API/static auth | routes/services | credentials/claims/state | authenticate, challenge, refresh, deny | branch-specific | event/rejection/log stores only |
| token-saving transforms | post-DLP output service | enabled methods/content | rewrite output | per-transform fail-open | tool metadata only |
| workflow quotas/readiness/allowlist | workflow control/scheduler/runner | published version, bindings, quota, limits | block enqueue/execution/tool | schedule/run error records | not Starliner-mapped |

## Tool confirmation state

`ToolConfirmationStore` keeps complete pending params/arguments, optional email,
tenant, backend and source in process memory under a random token URL-safe
confirmation ID. The record expires after 600 seconds and is guarded by an
async lock.

Context matching checks supplied source/backend/tenant/email, but a missing
context argument does not constrain that dimension. Route/handler callers must
supply the expected context.

The confirmation response echoes recursively truncated arguments: strings above
50 characters keep the first and last 25 characters. This is display
truncation, not redaction; short secrets can be echoed.

`Potential issue requiring validation:` confirmation payloads can expose
sensitive arguments to the MCP client. DLP runs before confirmation in current
Direct flow only after the confirmation branch? Source order shows confirmation
is checked before native input DLP, so the echoed arguments have not yet passed
native DLP.

## Legacy Starliner decision behavior

- off/observe modes: compatibility control inactive;
- shadow: decision evaluated, optional event emitted, call always proceeds;
- enforce: negative evaluation returns block response;
- missing SDK: active result with proceed=true and safe class-based reason;
- raw arguments explicitly discarded;
- raw email passed to private builder;
- event emission is synchronous `runtime.emit(event)` call without local await;
  exact SDK semantics unresolved.

## Current remote control channel

There is no Starliner platform-to-sensor command API in this repository. The
HTTP ingest is telemetry-only. Operational/admin APIs can mutate gateway
settings, but they use existing gateway auth and request schemas, not a
Starliner command contract.

## Proposed command catalog

These are design candidates, not implemented commands.

| Command | Native target | Availability | Required authorization/effect proof |
| --- | --- | --- | --- |
| enable/disable tool | scoped/backend settings | `Available through adapter mapping only` for a trusted adapter that calls existing admin API | tenant-admin policy; read-back setting and subsequent tools/list/call effect |
| set DLP action/category | scoped settings | same | tenant-admin; read-back effective setting; representative self-test |
| require tool confirmation | tool setting | same | tenant-admin; read-back and client-flow observation |
| pause workflow schedule | workflow schedule API | same | tenant-admin; schedule status/event |
| revoke API token | backend admin API | same | tenant-admin; revocation lookup + subsequent auth rejection |
| disconnect OAuth/backend | existing OAuth/preferences routes | same | user/admin scope; token/connection status |
| retry/drop outbox record | no public supported API | `Requires minor sensor instrumentation` | operator-only; immutable audit and effect result |
| rotate actor pseudonym key | deployment secret | `Requires substantial sensor changes` | deployment authority; key epoch/coverage transition |

`Proposed:` telemetry and control must use separate authenticated channels,
schemas, queues, idempotency scopes, and audit trails. A telemetry ingest
response must never act as an implicit control command.

## Control result requirements

Every accepted future command needs:

- command ID and idempotency key;
- tenant, target source identity, requested change;
- authorizing principal and policy decision;
- accepted/rejected status and safe reason;
- before/after safe configuration hash;
- native read-back or runtime-effect evidence;
- observed time and sensor/runtime version;
- rollback/reversal semantics.

No current Starliner record satisfies this full contract.

