# 33 — Final Sensor Integration Decision Sheet

| Item | Decision |
| --- | --- |
| Sensor | Sentinel endpoint sensor |
| Unique visibility | Privileged macOS/Windows local process, configured file/Lua/package, selected Persona/account, Cursor/Claude hook, proxy/TLS/DLP/policy, application process-control and device-local operational evidence |
| Supported environments | Active implementation paths: macOS and Windows, conditional by component/config/privilege; Linux/cloud/serverless/CI authority unsupported |
| Current maturity | Substantial implemented local capability with fragmented/lossy outputs, uneven health/effect evidence and no common platform sensor contract |
| Current emission boundary | Dashboard HTTP sync, local broker IPC, memory queues, logs/files, alert SQLite/backend paths and component-specific metrics; no single durable acknowledged feed |
| Recommended adapter placement | Small typed in-process bridges in monitor/hooks/proxy/enforcer feeding one host-local endpoint adapter service |
| Recommended Starliner integration | Pre-resolution observations/identifier candidates, relationships, action/decision/effect events, coverage/health, safe metrics and protected evidence references through a tenant-bound durable delivery contract |
| Durable outbox status | Not implemented as a common endpoint facility; required for MVS |
| Primary inventory contributions | Applications/processes, local agent/MCP/model/skill/permission/plugin/repository/config artifacts, packages, hooks, endpoint/sensor/enforcement components; all source-scoped |
| Primary identity contributions | Device/user/account/application/process/repository/MCP/tool aliases and candidates; none is final canonical authority |
| Primary event contributions | Process/entity transitions, config discovery, hook activity, proxy request/detection/policy/effect stages, enforcement attempts/results, lifecycle/config/health/delivery stages after instrumentation |
| Primary metrics | Current proxy health/request/failure/circuit/pool/destination/DLP-config metrics; derived inventory/activity/DLP/action counts; proposed source coverage/outbox/delivery/control-effect metrics |
| Primary finding signals | Ungoverned/risky local application/config, blocked rediscovery, DLP detection/control degradation, hook integrity/coverage, stale sensor/config/snapshot/outbox, effect failure and cross-sensor traffic/policy/identity conflicts |
| Primary enforcement capabilities | Kill switch; macOS/Windows Application process termination for Blocked/Quarantined; proxy Block/prompt/justification paths; hook active mode is Allow only |
| Customer-facing product contributions | Inventory, Entity Detail, Relationships, Activity, selected Findings, Analytics, Coverage/Health and Configuration—with explicit state/evidence distinctions |
| Operator-only contributions | Component lifecycle/self-tests, scan failures, proxy internals, attribution quality, outbox/admission/lease metrics, safe errors, certification and version state |
| Critical missing fields | Stable sensor/component/runtime/process/action IDs; source/event/append/ack times; scan/coverage boundaries; parser/detector/policy/config versions; final effect; delivery/admission receipt |
| Critical sensor changes | Capture before current lossy conversion; native IDs/times; structured source coverage/health; hook/proxy/control stages; final enforcement re-observation; privacy tags |
| Cross-sensor dependencies | IdP/HRIS/device authority, browser, LLM/MCP gateway, agent runtime, SaaS connector, SCM, cloud/serverless/CI sources |
| MVS scope | Certified macOS/Windows manifest/health/coverage; durable positive inventory; Observe-only hooks; selected proxy/control stages; privacy-safe evidence; coverage-aware product views |
| MVS findings | Positive-evidence ungoverned/risky local config, DLP/control facts and sensor/coverage degradation only after required adapter/instrumentation/rules; absence-based gateway findings deferred |
| MVS analytics | Entities by kind/source/freshness, new observations, hook activity, DLP categories/actions, component/source coverage and outbox/delivery health; no agent-run/token/MCP-success metrics |
| MVS acceptance criteria | Contract blockers resolved; deterministic durable replay; per-record results; field privacy; source coverage; final effect; unsupported states; product terminology; sanitized scenario evidence |
| Overall integration readiness | **Requires a new stable sensor integration boundary** |

## Readiness rationale

The endpoint is not lacking useful sensing capability. Its problem is that
customer-relevant facts are split across processes and lossy converters, have
inconsistent IDs/provenance/coverage, and are delivered through unrelated
best-effort or subsystem-specific paths.

The recommended boundary is new but bounded: typed capture bridges plus one
host-local adapter/outbox. It does not require replacing every collector or
choosing gRPC. It does require resolving the current Starliner
pre-resolution/delivery contradictions before build work begins.

## Quantified analysis basis

| Catalog | Count |
| --- | ---: |
| Features | 63 |
| Utilities/subsystems | 58 |
| Runtime entry points | 37 |
| Capture points | 58 |
| Native record families | 66 |
| Native fields/variant payloads | 639 |
| High-value field lineages | 60 |
| Inventory entity contributions | 51 |
| Identifiers | 30 |
| Identity coverage cases | 15 |
| Relationships | 40 |
| Native events | 47 |
| Event mappings | 20 |
| Metrics | 50 |
| Detectors/classifiers | 24 |
| Control capabilities | 28 |
| Interfaces | 52 |
| Extraction points | 22 |
| Adapter components | 22 |
| Per-field platform mappings | 639 |
| Cross-sensor overlaps | 30 |
| Product disposition rows | 799 |
| Finding candidates | 32 |
| Coverage rows | 28 |
| Health metrics | 40 |
| Per-field privacy rows | 639 |
| Gaps | 50 |
| MVS scope rows | 30 |
| Sanitized fixture JSON files | 18 |

