# Identity and attribution


| entity_type | identifier | namespace | source | stability | uniqueness | reassignable | cryptographically_verified | recommended_use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gateway request | request_id | llmgateway.request | UUID generated in PerformanceLoggerAsync | request-scoped | Strong deterministic within producer | No | No | Idempotency/event correlation candidate |
| Guardrail context | context_id | axis.context | generated or supplied | conversation/request correlation | Secondary | Possible | No | Link prompt/response evidence only |
| Tenant | tenant_id/tenant | quilr.tenant | API key/database/context | configured | Secondary until authenticated ingest | Possible | No | Tenant partition after transport authentication |
| Subscriber | subscriber | axis.subscriber | database lookup | configured | Secondary | Possible | No | Source-native attribute |
| Gateway key | api_key_hash | quilr.gateway-key-hash | SHA-256 of Quilr key | key lifetime | Content-derived credential fingerprint | No | No | Key candidate; never expose raw key |
| User | user_email | email | request context/JWT/body/key binding | mutable | Weak/secondary | Yes | Usually no | Identifier candidate requiring IdP correlation |
| User | user_id | gateway.user | gateway user database | database lifetime | Source-native strong | Unresolved | No | Source identifier candidate |
| Provider | provider | llm.provider-type | routing resolution | stable enum-ish string | Secondary | Yes | No | Provider type claim |
| Provider configuration | provider_label | gateway.provider-label | administrator label | mutable | Display/mutable alias | Yes | No | Never canonical identity alone |
| Model invocation | model_name/model/deployment | provider.model-route | request/routing | mutable/provider-specific | Secondary | Yes | No | Model route/version candidate; exact provider account absent |
| Agent run | agent_run_id | otel.agent-run | forwarded observability metadata | caller-scoped | Unverified external identifier | Possible | No | Link only; gateway does not assert canonical agent identity |
| Trace | trace_id | w3c.trace | traceparent/metadata | trace-scoped | Strong if well-formed; source not verified | No | No | Causal correlation candidate |
| Conversation | conversation_id/session_id | caller.conversation | headers/metadata/baggage | caller-scoped | Secondary | Possible | No | Activity grouping |
| Provider response | external_request_id | provider.request | upstream headers/metadata | request-scoped | Strong within provider namespace | No | No | Provider evidence correlation |

| activity_type | human | account | agent | workload | process | credential | approval | sensor | completeness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Model request | user_email when available | gateway user/key | forwarded metadata only | not attested | not observed | Quilr key hash/provider key metadata | config/change-request where applicable | deployment identity incomplete | Partial |
| Tool execution analysis | Copilot/JWT/body hint | key | Copilot context only | unresolved | not observed | path key | no generic tool approval | gateway | Partial and claims may be unverified |
| Administrative configuration | session/operator identity | gateway user | not applicable | gateway | not observed | session/auth token | change-request reviewer | gateway | Stronger source attribution; external person authority absent |

`Potential issue requiring validation:` Copilot identity extraction decodes
unverified JWT content for hints. Such claims must never become authoritative
human identity. The gateway cannot observe device/process identity and cannot
attest caller-provided agent/run/trace metadata.
