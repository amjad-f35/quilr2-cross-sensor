# Negative Observability Matrix


All 68 required concepts have an exact Browser observability value. This prevents prompt activity from becoming agent discovery, a page identity from becoming a person, or a URL from becoming authoritative model deployment identity.

| concept | browser | condition_or_boundary | external_source_required |
| --- | --- | --- | --- |
| Enterprise person | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | No person-authoritative issuer/subject | IdP/HRIS |
| Directory account | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | Observed emails/page identities are not directory authority | IdP/directory |
| Browser profile | OBSERVABLE_BUT_NOT_COLLECTED | Browser context exists but no stable privacy-safe profile ID is emitted | Managed browser/MDM for expectation |
| SaaS account | CONDITIONALLY_COLLECTED | Login/page/account signals depend on supported pages and configuration | SaaS provider for authority |
| OS account | CONDITIONALLY_COLLECTED | Native identifiers/user context are partial and strong SystemID fields are empty | Endpoint/IdP |
| Gateway subject | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | Not a browser-native identity | LLM/MCP gateway |
| Service account | UNOBSERVABLE_BY_THIS_SENSOR | No service-account discovery | IdP/cloud provider |
| Personal versus enterprise account | INFERRED_OR_DERIVED | Page/domain signals can suggest usage; exact producer authority is not established | IdP/SaaS/managed-domain source |
| Group | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | No group source | IdP |
| Department | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | No department source | HRIS |
| Employment status | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | No employment source | HRIS |
| Product | OBSERVABLE_AND_COLLECTED | Web app and installed-extension product labels are collected within permissions/configuration | Authoritative catalog for classification |
| Application surface | OBSERVABLE_AND_COLLECTED | URL/domain/name and configured AI surface behavior | Catalog for authoritative classification |
| Installation | CONDITIONALLY_COLLECTED | Third-party extension inventory exists; own sensor installation lacks a stable instance ID | MDM/managed browser for expected deployment |
| Browser origin | OBSERVABLE_AND_COLLECTED | Page/request URLs are captured; target must reduce to origin | None |
| Desktop process | UNOBSERVABLE_BY_THIS_SENSOR | No process inventory | Endpoint/EDR |
| Device | CONDITIONALLY_COLLECTED | Heartbeat/native identifiers are partial; stable device attribution is not assured | Endpoint/MDM |
| Binary | UNOBSERVABLE_BY_THIS_SENSOR | No exhaustive binary inventory | Endpoint/EDR |
| Package | UNOBSERVABLE_BY_THIS_SENSOR | No OS package inventory | Endpoint/MDM |
| Application account | CONDITIONALLY_COLLECTED | Supported page/login/account signals only | SaaS provider/IdP |
| Agent definition | UNOBSERVABLE_BY_THIS_SENSOR | AI page use is not an agent definition | Repository/agent registry connector |
| Agent version | UNOBSERVABLE_BY_THIS_SENSOR | No agent-definition/version scanner | Repository/agent registry connector |
| Agent deployment | UNOBSERVABLE_BY_THIS_SENSOR | No workload/deployment discovery | Cloud/CI/orchestrator |
| Agent workload | UNOBSERVABLE_BY_THIS_SENSOR | No agent runtime boundary | Endpoint/cloud/CI |
| Agent runtime instance | UNOBSERVABLE_BY_THIS_SENSOR | No agent runtime identity | Agent runtime/gateway |
| Agent session | UNOBSERVABLE_BY_THIS_SENSOR | Browser session does not prove agent session | Agent runtime |
| Agent run | UNOBSERVABLE_BY_THIS_SENSOR | No agent run protocol | Agent runtime |
| Agent step | UNOBSERVABLE_BY_THIS_SENSOR | No agent step protocol | Agent runtime |
| Parent agent | UNOBSERVABLE_BY_THIS_SENSOR | No agent hierarchy | Agent runtime |
| Agent owner | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | No ownership authority | CMDB/IdP/repository |
| Model provider | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | Application/domain is not model-provider proof | LLM gateway/model registry |
| Model provider account | REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | No provider-account authority | LLM gateway/provider |
| Model family | UNOBSERVABLE_BY_THIS_SENSOR | Prompt UI does not prove backing model family | LLM gateway/model registry |
| Model version | UNOBSERVABLE_BY_THIS_SENSOR | No authoritative model version | LLM gateway/model registry |
| Model deployment | UNOBSERVABLE_BY_THIS_SENSOR | No deployment identity | LLM gateway/cloud provider |
| Model route | UNOBSERVABLE_BY_THIS_SENSOR | Browser routes do not prove selected gateway/model route | LLM gateway |
| Model endpoint | CONDITIONALLY_COLLECTED | Network URL may be seen but is not authoritative deployment identity | LLM gateway |
| Model invocation | INFERRED_OR_DERIVED | Prompt/response activity can indicate use without authoritative invocation identity | LLM gateway |
| MCP client | UNOBSERVABLE_BY_THIS_SENSOR | VTest MCP is test control, not production discovery | MCP gateway/runtime |
| MCP server | UNOBSERVABLE_BY_THIS_SENSOR | No production MCP enumeration | MCP gateway/runtime |
| MCP server deployment | UNOBSERVABLE_BY_THIS_SENSOR | No deployment discovery | MCP gateway/cloud |
| MCP tool | UNOBSERVABLE_BY_THIS_SENSOR | No tool registry discovery | MCP gateway/server |
| MCP tool version | UNOBSERVABLE_BY_THIS_SENSOR | No MCP tool version | MCP gateway/server |
| MCP tool schema | UNOBSERVABLE_BY_THIS_SENSOR | No MCP schema collection | MCP gateway/server |
| MCP connection | UNOBSERVABLE_BY_THIS_SENSOR | No production MCP transport hook | MCP gateway/client |
| MCP tool call | UNOBSERVABLE_BY_THIS_SENSOR | No production MCP call hook | MCP gateway/client |
| MCP tool result | UNOBSERVABLE_BY_THIS_SENSOR | No production MCP result hook | MCP gateway/client |
| MCP observed effect | UNOBSERVABLE_BY_THIS_SENSOR | No tool-side effect observation | Endpoint/cloud/SaaS plus MCP |
| Prompt | CONDITIONALLY_COLLECTED | Supported configured AI pages and capture hooks only; raw content is privacy restricted | LLM gateway for authoritative coverage |
| Response | CONDITIONALLY_COLLECTED | Only active/configured response parsers; most interceptor configs are inactive | LLM gateway |
| File content | CONDITIONALLY_COLLECTED | Native extraction/DLP paths can process content; canonical retention is prohibited | Endpoint/DLP authority |
| File metadata | OBSERVABLE_AND_COLLECTED | Upload/download/native file paths produce metadata within supported OS paths | Endpoint for exhaustive coverage |
| Upload | OBSERVABLE_AND_COLLECTED | Browser upload hooks and native scan workflow | None for covered browser |
| Download | OBSERVABLE_AND_COLLECTED | Chrome download and native scan workflow | None for covered browser |
| Network destination | CONDITIONALLY_COLLECTED | Fetch/XHR/WebSocket/browser hooks vary by app and permission | Network gateway for completeness |
| Tool arguments | UNOBSERVABLE_BY_THIS_SENSOR | No tool-call protocol | MCP/agent runtime |
| Tool results | UNOBSERVABLE_BY_THIS_SENSOR | No tool-result protocol | MCP/agent runtime |
| Policy decision | OBSERVABLE_AND_COLLECTED | Native browser/DLP policy results are present; they are not Quilr 2 policy | Policy service for central policy |
| Enforcement result | CONDITIONALLY_COLLECTED | UI/native result messages exist but completion semantics vary | Endpoint/SaaS for independent effect |
| Actual effect | OBSERVABLE_BUT_NOT_COLLECTED | Some callbacks imply effect; decision, acknowledgement and effect are not consistently separated | Endpoint/SaaS where browser cannot observe |
| Sensor instance identity | OBSERVABLE_BUT_NOT_COLLECTED | Product extension/native identities exist but no stable compound instance ID | Enrollment/MDM |
| Sensor version | OBSERVABLE_AND_COLLECTED | Extension and agent versions are included in current payloads | None |
| Heartbeat | OBSERVABLE_AND_COLLECTED | Extension heartbeat and native task heartbeat exist; semantics differ | Backend for accepted delivery |
| Capture-hook health | OBSERVABLE_BUT_NOT_COLLECTED | Diagnostics/logs expose partial readiness but no complete capability health record | None |
| Permission state | CONDITIONALLY_COLLECTED | Extension management permissions and failures exist; own coverage state is incomplete | Managed browser/MDM |
| Outbox state | UNOBSERVABLE_BY_THIS_SENSOR | Required transactional Starliner WAL is not implemented | Browser adapter implementation |
| Delivery state | OBSERVABLE_BUT_NOT_COLLECTED | HTTP/native write acknowledgement is not end-to-end acceptance | Backend/Starliner receipt |
| Enforcement readiness | INFERRED_OR_DERIVED | Can be inferred from config/connection/policy signals but no complete readiness event | Endpoint/backend for corroboration |

**Unresolved:** The four other profile columns cannot be populated without admitting their source truth. The closure validator reports this as a global blocker.
