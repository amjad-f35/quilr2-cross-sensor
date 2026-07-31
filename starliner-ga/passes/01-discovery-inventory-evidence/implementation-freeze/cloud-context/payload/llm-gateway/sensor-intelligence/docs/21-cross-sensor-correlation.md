# Cross-sensor correlation


| shared_concept | this_sensor_evidence | other_source | correlation_key | authority | duplicate_risk | conflict_handling |
| --- | --- | --- | --- | --- | --- | --- |
| AI application use | inline request with app/key/user/model | Browser/endpoint | user email, app/domain, time, trace if propagated | Gateway strongest for routed invocation; browser/endpoint stronger for local app/device | High | Link distinct observations; do not merge product/application/account |
| Model invocation | provider/model/usage/latency/outcome | Agent runtime/provider billing | trace/external request ID/time | Gateway for inline route; provider for billing; runtime for agent causality | High | Deduplicate event by request IDs where strong; retain source claims |
| Tool call | tool-call text in supported OpenAI/Responses walkers | MCP Gateway/agent runtime | trace/run/tool call ID if propagated | MCP Gateway for MCP execution; LLM Gateway only sees model payload | Medium | Relate suggestion/request to execution; never infer effect |
| Human identity | user_email/user_id/JWT hints | IdP/HRIS | normalized email/source user ID | IdP/HR authoritative | High | Identifier candidate only |
| Sensitive data event | prompt/response detector result and action | Browser/endpoint/DLP | trace/context/time/content digest | Each source proves its observation point | High | Correlate but retain separate enforcement/evidence |

### Worked scenario

Browser observes `claude.ai`; endpoint observes a Claude application/process;
LLM Gateway observes an Anthropic/model invocation; MCP Gateway observes a tool
call. The LLM Gateway proves only the invocation routed through it, its
gateway-observed account/key/app/model, content controls, latency/usage and
response outcome. It cannot alone prove browser/device/process identity, that
the MCP tool executed, or that all Claude use passed through the gateway.
Strong trace/provider request IDs may link events; otherwise time/email/app
correlation remains probabilistic and records should link rather than merge.
