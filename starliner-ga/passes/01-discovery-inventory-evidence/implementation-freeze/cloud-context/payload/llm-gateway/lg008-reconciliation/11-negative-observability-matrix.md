# LLM Gateway observability boundaries


This matrix intentionally contains only the LLM Gateway column and required
external-source boundary.

| concept | llm_gateway | condition_or_boundary | external_source_required |
| --- | --- | --- | --- |
| Enterprise person | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | IdP/HRIS | IdP/HRIS |
| Directory account | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | IdP | IdP |
| Browser profile | UNOBSERVABLE_BY_THIS_SENSOR | Browser source | Browser source |
| SaaS account | OBSERVABLE_BUT_NOT_COLLECTED | SaaS connector for authority | SaaS connector for authority |
| OS account | UNOBSERVABLE_BY_THIS_SENSOR | Endpoint/IdP | Endpoint/IdP |
| Gateway subject | CONDITIONALLY_COLLECTED | Gateway auth/JWT context | Gateway auth/JWT context |
| Service account | CONDITIONALLY_COLLECTED | IdP/cloud authority | IdP/cloud authority |
| Personal versus enterprise account | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | IdP/HRIS/policy | IdP/HRIS/policy |
| Group | CONDITIONALLY_COLLECTED | IdP for authority | IdP for authority |
| Department | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | HRIS | HRIS |
| Employment status | UNOBSERVABLE_BY_THIS_SENSOR | HRIS | HRIS |
| Application surface | OBSERVABLE_AND_COLLECTED | Gateway app configuration/request | Gateway app configuration/request |
| Installation | UNOBSERVABLE_BY_THIS_SENSOR | Endpoint/browser | Endpoint/browser |
| Device | UNOBSERVABLE_BY_THIS_SENSOR | Endpoint/MDM | Endpoint/MDM |
| Process and binary | UNOBSERVABLE_BY_THIS_SENSOR | Endpoint/EDR | Endpoint/EDR |
| Application account | CONDITIONALLY_COLLECTED | Gateway user/key context | Gateway user/key context |
| Agent definition | CONDITIONALLY_COLLECTED | Agent runtime/registry for authority | Agent runtime/registry for authority |
| Agent deployment | CONDITIONALLY_COLLECTED | Agent runtime/registry | Agent runtime/registry |
| Agent runtime/session/run/step | CONDITIONALLY_COLLECTED | Agent runtime; gateway sees forwarded metadata only | Agent runtime; gateway sees forwarded metadata only |
| Model provider | OBSERVABLE_AND_COLLECTED | Gateway route | Gateway route |
| Provider account | OBSERVABLE_BUT_NOT_COLLECTED | Provider/cloud connector | Provider/cloud connector |
| Model family/version | INFERRED_OR_DERIVED | Model registry/provider | Model registry/provider |
| Model deployment/route | CONDITIONALLY_COLLECTED | Gateway configuration/request | Gateway configuration/request |
| Model invocation | OBSERVABLE_AND_COLLECTED | Gateway request lifecycle | Gateway request lifecycle |
| MCP client/server/tool | UNOBSERVABLE_BY_THIS_SENSOR | MCP Gateway | MCP Gateway |
| Tool call/result/effect | CONDITIONALLY_COLLECTED | MCP Gateway/agent runtime for execution authority | MCP Gateway/agent runtime for execution authority |
| Prompt | CONDITIONALLY_COLLECTED | Restricted; privacy contract | Restricted; privacy contract |
| Response | CONDITIONALLY_COLLECTED | Restricted; privacy contract | Restricted; privacy contract |
| File content/metadata/upload/download | UNOBSERVABLE_BY_THIS_SENSOR | Browser/endpoint/MCP as applicable | Browser/endpoint/MCP as applicable |
| Network destination | OBSERVABLE_AND_COLLECTED | Provider endpoint only; not general network | Provider endpoint only; not general network |
| Policy decision | OBSERVABLE_AND_COLLECTED | Gateway policy/DLP | Gateway policy/DLP |
| Enforcement result | CONDITIONALLY_COLLECTED | Gateway response/action | Gateway response/action |
| Actual effect | OBSERVABLE_BUT_NOT_COLLECTED | Provider/tool/endpoint for downstream effect | Provider/tool/endpoint for downstream effect |
| Sensor instance identity/version | OBSERVABLE_BUT_NOT_COLLECTED | Starliner enrollment/build identity | Starliner enrollment/build identity |
| Heartbeat/capture-hook health | OBSERVABLE_BUT_NOT_COLLECTED | New manifest/self-test instrumentation | New manifest/self-test instrumentation |
| Outbox/delivery state | UNOBSERVABLE_BY_THIS_SENSOR | Starliner sidecar required | Starliner sidecar required |
| Enforcement readiness | OBSERVABLE_BUT_NOT_COLLECTED | Certified self-test required | Certified self-test required |
