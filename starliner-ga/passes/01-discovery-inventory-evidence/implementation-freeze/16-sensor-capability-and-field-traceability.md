# Sensor Capability and Field Traceability

**Status:** normative evidence boundary for this pass

## Why this document exists

The architecture is not allowed to outrun the sensors.

Every product-visible fact must have this chain:

```text
exact native field or lifecycle seam
→ named source adapter transformation
→ typed source-profile field
→ normalized source object, claim, relationship candidate, or activity
→ canonical binding/materialization rule
→ purpose-built read model
→ API field
→ UI location
```

If any link is missing, the fact is not a supported current capability. It is classified as adapter work, new capture work, a future connector dependency, prohibited content, legacy-only evidence, or unresolved.

The machine-readable controls are:

- [Profile capability disposition](registers/profile-capability-disposition.csv)
- [Profile entity disposition](registers/profile-entity-disposition.csv)
- [Sensor capability register](registers/sensor-capability-register.csv)
- [Field disposition](registers/field-disposition.csv)
- [Relationship support](registers/relationship-support.csv)
- [UI field lineage](registers/ui-field-lineage.csv)
- [Future connector backlog](registers/future-connector-backlog.csv)
- [Five-profile source authority](lg008/README.md)

## Selected-source closure

`LG-008` is closed at the immutable selected revisions. The generated authority
accounts for 148 native records, 1,837 native fields, 422 exact access recipes
and 931 target-field traces across all five profiles. Optional-unsourced and
new-capture target fields remain explicit unsupported/implementation states;
they are not silently treated as current sensor output.

## Support states

| State | Exact meaning |
|---|---|
| `adapter_derivable` | The audited code captures enough native information. A new privacy-safe adapter, durable WAL path, profile mapper, and certification are still required. |
| `new_capture_required` | The desired fact is not captured with sufficient identity, lifecycle, or correlation today. Sensor/runtime code must change before the profile capability can be advertised. |
| `legacy_backend_only` | Quilr 1 or Browser Backend currently stores/composes the fact. It may be a migration/source claim but is not Quilr 2 canonical authority. |
| `future_connector_required` | The fact requires an authoritative external connector such as IdP, MDM, IAM, SaaS, repository, or ACL. |
| `prohibited` / `prohibited_default` | The field must not enter the ordinary source profile or customer UI. |
| `unresolved` | Evidence is insufficient. The implementation must retain unknown/unresolved state. |

`adapter_derivable` never means “implemented.” It means the target can be built without inventing a native fact.

## Audited evidence boundary

This freeze uses the pinned repository analyses and the current source trees
they inventory. Their exact intake state, revisions, anchor hashes and permitted
uses are registered in
[source-analysis-inputs.csv](registers/source-analysis-inputs.csv):

| Source | Audited evidence |
|---|---|
| Browser Extension and native host | historical package SHA-256 `4da74590...` plus current `Project-Vanguard@8e7a3e0...` and `project-sentinel@6f55960...`; 102-file Browser delta reconciled |
| Browser Backend | separately admitted `browser-extension-service@496b8c2...`; six-file delta reconciled and producer identity preserved |
| Endpoint | `sentinel-endpoint-agent@a022e52...`; generated dispositions semantically re-reviewed and 639 fields admitted with distinct collection states |
| LLM Gateway | `macrodata-refinement@92b0462...`; lexical-key catalog rejected and 144 reachable typed/serialized fields admitted |
| MCP Gateway | `quilr-llm-gateway@99f759d...`; historical `1b2f2b3...` delta reconciled, 247 fields and exact access recipes admitted |
| Current platform | `Quilr1-Platform-Analysis`, including `quilr-query-builder@c794c45...`, `quilr-web@e6f9d03...`, dynamic evidence and legacy stores; context only |
| Better Console | `Better-Console-Analysis` at `quilr-ai-config-manager@68132e6...`, inspected as a current read/composition implementation; context only |
| Existing Starliner | `project-starliner-audit` at `b747393...`, with 413 collected Python tests and 403 passing/10 skipped in this intake; implementation fit-gap evidence only |
| Target UI shell | `/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt`, inspected as a fixture-backed shell and reusable component library |

The exhaustive repository analyses remain evidence inputs, not authority by
volume. The completed central reconciliation rejected lexical keys, arbitrary
symbols, placeholder access commands and contradictory generated dispositions.
The accepted result is [the generated authority](lg008/README.md); historical
intake defects remain documented in
[the source-analysis intake](24-source-analysis-intake-and-lg-gate-plan.md).

## Verified sensor surface

### Browser

The current browser path directly provides:

- browser family/name, version, OS, user agent, extension ID/version;
- a Browser-native device value and, through heartbeat paths, device/serial/hostname/platform/device type and sync watermarks;
- application name, URL/domain and browser-use events;
- persona display/email context;
- `Guest` versus `CredsBased` authentication context;
- prompt/copy/paste/upload event families, safe policy/action fields, classifications, outcomes and correlation fields;
- upload file metadata, request IDs, native scan stages and outcomes;
- component/heartbeat/version state.

It does **not** currently prove:

- a stable `browser_profile_id`;
- that a Browser-native device ID is the same device as Endpoint’s hardware serial;
- direct `personal`, `business`, `organization`, and `flyby` semantics from the extension event. Quilr 1 reads `personal|guest|corporate` from `account_usage_type`, but the audited writer was not found;
- durable evidence delivery or complete reconciliation;
- an authoritative enterprise person.

Therefore the default target graph is:

```text
browser_installation
→ observed on browser-source device
→ observed application_surface
→ source-scoped persona/application-account or guest session context
→ browser activity and evidence
```

A browser profile is absent unless a future certified capture seam produces a stable profile identifier.

### Endpoint

The current `EntityKind` enum has exactly:

```text
Application
McpServer
Hook
Skill
Agent
Model
ControlledRepo
Permission
Plugin
```

The supporting context and runtime code also captures:

- device serial-derived ID, hostname, OS type/version;
- local username and optional persona user ID/email/full name/authenticated state/group strings;
- process PID, parent PID, start time, normalized/raw name, executable path, command line and owner UID/SID;
- application bundle/version/vendor/install/runtime/system/privilege information;
- parent application, scope, transport and configuration metadata for MCP servers and local agent artifacts;
- prompt-turn activity containing tool names and raw file/project/prompt fields;
- proxy/hook/process lifecycle and native decision/effect seams.

The Endpoint adapter may derive typed source objects from those exact facts:

| Native fact | Permitted target |
|---|---|
| `DeviceContext` | Endpoint installation and source-scoped device |
| `UserContext` | source-scoped local/directory account claim and observation context |
| `ProcessInfo` | boot-scoped workload/process and exact owner candidate |
| `ApplicationData` | application deployment; product only when a strong source-native/catalog key exists |
| `AgentData` | agent definition plus device/install-scope deployment derived from the same observation |
| `McpServerData` | server product candidate and local/remote configuration/deployment |
| `ModelData` | configured model product claim; not model version/runtime/deployment |
| `HookData`, `SkillData`, `PluginData` | typed local configuration components |
| `PermissionData` | configured command-permission rule, never enterprise entitlement |
| `ControlledRepoData` | repository configuration/observation, with a privacy-safe path token |

Endpoint does **not** currently emit MCP tool/resource/prompt definitions. It also does not prove enterprise roles, effective permissions, credentials, group membership authority, or every resource reachable by the local user.

`UserContext` is the sensor’s observation context. It is not automatically the owner of every discovered process. `RUNS_AS` requires an exact process owner UID/SID mapped to the local account or another explicit native execution identity.

### LLM Gateway

The current `llmgateway_logs_v3` projection and lifecycle code provide:

- request, tenant, API-key alias/name, provider, surface, model and endpoint;
- route group/mode;
- stream/status/error;
- request/response/cache/write/reasoning token counts;
- upstream, Quilr, guardrail, total and first-response latency;
- blocked, anonymized, monitored and guardrail outcome semantics;
- exact identity-source paths for email/ID/JWT claims;
- conversation, trace, correlation and session IDs;
- optional agent ID/name/version/framework/run/thread/span/step/workflow fields when instrumentation supplies them;
- tool definitions/calls/results/function names and call IDs;
- request feature flags.

This supports a routed model-activity estate. It does not prove endpoint placement, traffic that bypasses the gateway, or that an optional agent name is the same local agent discovered by Endpoint.

Raw request/response messages, raw tool arguments and source rows are outside the default pass profile.

### MCP Gateway

The current MCP registry and logging paths provide:

- registered backend/server native ID, tenant, owner/user, name, transport/type, endpoint, status, catalog/slug and auth mode;
- cached tools, resources and prompts, including fetch errors;
- tool-call backend/tool/request/session/caller/surface/transport/auth/time/status and DLP context;
- initialize/list/resource/prompt/session/progress/cancel protocol events;
- rejected-request reason/stage/status/JSON-RPC/method/tool context;
- direct, OneMCP, native and workflow code surfaces.

This supports server deployments, capability definitions and actual gateway-observed operations for each separately instrumented surface.

It does not prove local endpoint configuration, enterprise permissions, or a canonical local agent from `agent_keyword`, `agent_name`, or user-agent heuristics.

Raw tool arguments/results, headers, bearer tokens, authorization values and arbitrary event data are prohibited from the ordinary profile.

## Cross-sensor truth table

| Desired join | Current automatic status | Exact requirement |
|---|---|---|
| Browser device → Endpoint device | **Not supported** | Same approved stable identifier under compatible authority, an authoritative mapping, reviewed correction, or the new signed local binding |
| Browser persona/email → Endpoint user | **Not supported** | Same trusted issuer/subject or authoritative directory mapping; email alone is a review candidate |
| Browser profile → Endpoint device | **Not supported** | First obtain a real stable browser profile ID, then an exact device binding |
| Endpoint agent → LLM invocation | **Not supported** | Signed request-bound attribution or exact authoritative client/workload mapping |
| Endpoint agent → MCP tool call | **Not supported** | Signed request-bound attribution or exact authoritative client/workload mapping |
| Endpoint MCP config → MCP Gateway server deployment | **Unresolved by default** | Exact gateway deployment/server ID in configuration or authoritative mapping |
| LLM caller → enterprise person | **Source-scoped by default** | Trusted issuer/subject and directory connector mapping |
| MCP caller heuristic → agent deployment | **Never automatic** | Stable native agent identity or verified cross-sensor assertion |

No join uses hostname, email, display name, URL label, tool overlap, or temporal proximity as an automatic canonical merge key.

## What becomes customer inventory

The supported product estate is the safe, connected subset of captured facts:

- Applications: web surfaces and endpoint deployments, with separate product/deployment/account context.
- Local agents: definitions and device/install-scope deployments derived from Endpoint `AgentData`.
- Models: configured local model products and gateway-observed routed model products/deployments where exact provider identity exists.
- MCP: Endpoint-configured server deployments and MCP-Gateway-visible server/tool/resource/prompt definitions, kept separate until an exact binding exists.
- Devices: source-scoped Browser and Endpoint devices, merged only under the approved rules.
- Identities: source-scoped persona/local/gateway caller claims, with assurance and unresolved state.
- Agent components: hooks, skills, plugins, configured command-permission rules and controlled repositories.
- Activity: browser application/action/upload, minimized Endpoint prompt-turn/proxy/process observations, LLM invocations and MCP operations.
- Evidence and coverage: source observations, selected-claim provenance, lineage, health, gaps, snapshots and field-level support.

The platform does not expose a spreadsheet of raw fields. Each captured field has one disposition:

1. canonical/read-model attribute;
2. relationship or activity semantic;
3. aggregate metric;
4. evidence/provenance-only metadata;
5. privacy-minimized token/digest;
6. prohibited;
7. unsupported/unknown.

## Canonicalization and materialization rules

- A source adapter emits native source IDs, never canonical IDs.
- One native observation may yield several typed source objects only when the transformation is deterministic and recorded in the capability register.
- Central identity resolution binds source objects to canonical entities.
- A relationship candidate materializes only when both source endpoints bind and [relationship support](registers/relationship-support.csv) authorizes the exact source/rule.
- `configured`, `entitlement`, and `observed` semantics remain separate.
- Field selection follows [field authority](ontology/field-authority.yaml) and retains all supporting claim/evidence IDs.
- Materializers build canonical current/history state; projectors build disposable list/detail/search views.
- An unsupported entity or relationship is absent, not synthesized as an empty placeholder.
- The UI receives `unknown`, `source_scoped`, `unresolved`, `unsupported`, `stale`, and `partial` explicitly.

## Quilr 1 and Better Console disposition

Quilr 1 and Better Console are evidence about existing fields, customer continuity and useful presentation—not the target truth architecture.

Better Console improves API composition and presentation, but its unified inventory still:

- reads source-specific ClickHouse/current platform tables;
- builds source-specific rows;
- merges them in request-process memory;
- uses display/name/hash grouping in places;
- proxies legacy app-management services.

The target may reuse its verified field semantics and UI lessons. It must not reproduce request-time source fanout or treat those merged rows as canonical identity.

## Production exit criteria

This evidence boundary is complete only when:

1. every source-profile payload kind appears in `profile-capability-disposition.csv`;
2. every admitted product field has a row in `field-disposition.csv`;
3. every auto-materialized relationship has an `adapter_derivable` evidence rule in `relationship-support.csv`;
4. unsupported/new-capture/future-connector relationships cannot be auto-materialized;
5. every adapter fixture traces to an exact native source path and expected privacy transformation;
6. raw prompt, response, tool argument/result, credential, token, header, command and path canaries are rejected or transformed as registered;
7. source ID collision fixtures cover Endpoint’s current same-name/cross-kind risks;
8. cross-sensor negative fixtures prove that names, emails, hostnames and timing never merge objects;
9. UI contract tests prove every displayed field includes support/coverage/provenance state;
10. sensor artifact, WAL, replay, reconciliation and capability certification pass.

Until those implementation tests pass, this package freezes what to build; it does not claim the adapters are already production-ready.

## Source-completeness and automatic expansion protocol

The tables above are the supported product boundary derived from the evidence
available at this freeze. They are not evidence that every relevant native
source item has already been enumerated. A schema-valid register can prove that
known rows are internally coherent while still missing an event, field,
feature-gated code path or operator-visible artifact that was never entered.

The pass therefore includes all four customer domains—discovery,
inventory/catalog, activity/observability and evidence—under this closure rule:

1. inventory every native component, feature, trigger, event/message, field,
   relationship assertion, health/diagnostic signal, persisted artifact and
   authorized access path in Browser, Browser Backend, Endpoint, LLM Gateway
   and MCP Gateway;
2. assign stable repository, component, feature, event and field IDs and bind
   each assertion to an exact revision plus code/config/schema/test/fixture or
   controlled runtime artifact;
3. classify proof as `SOURCE_PROVEN`, `RUNTIME_OBSERVED`, `BOTH`, `INFERRED` or
   `NEEDS_LIVE_VALIDATION`, separately classify reachability as implemented,
   enabled/gated, deprecated, dead, test-only or documentation-only, and never
   advertise an inferred item;
4. give every source-proven item exactly one explicit disposition:
   product attribute, entity, configured/structural/observed relationship,
   activity, aggregate, health/coverage, evidence/provenance-only,
   minimized/tokenized, prohibited, intentionally not collected, unsupported,
   future connector or out of this bounded pass with a reason;
5. trace every admitted item through native producer → adapter/profile →
   evidence → normalization → canonical/materialized state or deliberate
   evidence-only path → authorization → API/access recipe → UI or justified
   non-UI consumer;
6. add positive, negative, privacy, replay, ordering, lifecycle and
   authorization fixtures at each affected boundary; and
7. mechanically reject orphan native IDs, missing dispositions, missing
   lineage/access recipes and claims whose proof no longer matches the pinned
   source revision.

A newly proven native item is not silently ignored because the current schema
does not contain it. It reopens the minimum affected profile, normalization,
ontology, storage, authorization, API, UI and test contracts under change
control. Raw prompts, responses, tool arguments/results, credentials, tokens,
headers and other prohibited content remain excluded even if a sensor can see
them; completeness means a justified disposition, not indiscriminate
collection or display.

`LG-005` proves that implemented adapters emit every registered
`adapter_derivable` fact. `LG-008` separately proves that the registers
themselves are complete against the pinned native source and controlled runtime
inventory. Both must pass before the product can claim the full certified
capacity of the five profiles.
