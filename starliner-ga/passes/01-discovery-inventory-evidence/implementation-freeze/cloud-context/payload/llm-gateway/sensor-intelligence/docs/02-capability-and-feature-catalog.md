# Capability and feature catalog


Every row is grounded in an implementation path. `Implemented` means code is
present and wired; it does not assert effective production configuration or
runtime success. The full traceability matrix is
[`features.csv`](../../../matrices/sensor-intelligence/llm-gateway/features.csv).

| capability | feature | core_symbols | inputs | outputs | status | evidence_status |
| --- | --- | --- | --- | --- | --- | --- |
| Runtime | BlackSheep server lifecycle | DataClassifier/blacksheep_app.py:on_start/on_stop | process start/stop | resource initialization; route serving; cleanup | Implemented | Verified in source |
| Identity and access | Gateway session authentication | handlers/llmgateway/auth.py | login/logout/validate request | session token and user record | Implemented | Verified in source |
| Identity and access | Quilr API key lifecycle | handlers/llmgateway/api_keys.py | administrator/self-service request | hashed key identity, provider and guardrail configuration | Implemented | Verified in source |
| Identity and access | JWT/SigV4/source-IP enforcement | jwt_auth.py; bedrock_boto3.py; api_key_utils/common.py | provider request | allow/deny before upstream | Implemented | Verified in source |
| Administration | Application/provider configuration | api_key_utils/app_config.py | configuration API | encrypted provider credentials and routing settings | Implemented | Verified in source |
| Administration | Self-service RBAC and API keys | self_service.py; rbac.py | authenticated user request | filtered apps, requests, keys | Implemented | Verified in source |
| Administration | Smart groups | smart_groups.py | CRUD or request attribution | group membership/configuration | Implemented | Verified in source |
| Administration | Versioned configuration and rollback | config_versions.py | admin request | snapshot/audit/rollback | Implemented | Verified in source |
| Administration | Change request approval workflow | config_change_requests.py | self-service/admin request | pending/approved/rejected change | Implemented | Verified in source |
| Provider gateway | OpenAI chat completions | openai_compatible.py:openai_chat_completions | HTTP request | provider request/stream or JSON response | Implemented | Verified in source |
| Provider gateway | General OpenAI-compatible providers | general_openai_compatible.py | resolved general provider | HTTPX request/response/SSE | Implemented | Verified in source |
| Provider gateway | OpenAI-compatible model listing | openai_compatible.py:openai_models | HTTP GET | model list | Implemented | Verified in source |
| Provider gateway | OpenAI embeddings | openai_embeddings.py | HTTP request | embedding response | Implemented | Verified in source |
| Provider gateway | Anthropic Messages | anthropic_messages.py | HTTP request | Anthropic/Bedrock response or stream | Implemented | Verified in source |
| Provider gateway | AWS Bedrock native | bedrock_boto3.py | SigV4 or Quilr request | Converse/invoke response; stream support is operation-specific | Implemented | Verified in source |
| Provider gateway | OpenAI Responses | openai_responses.py | HTTP create/retrieve/cancel/delete | Responses API payload/SSE | Implemented | Verified in source |
| Provider gateway | OpenAI Assistants | openai_assistants.py | assistant/thread/message/run API | proxied resource/result | Implemented | Verified in source |
| Provider gateway | OpenAI Realtime | openai_realtime.py | WebSocket | bidirectional frames | Implemented | Verified in source |
| Provider gateway | Audio speech/transcription/translation | openai_tts.py; openai_stt.py | multipart or JSON request | audio/text response | Implemented | Verified in source |
| Provider gateway | Rerank | rerank.py | HTTP request | reranked results | Implemented | Verified in source |
| Provider gateway | Vertex AI Gemini | vertexai_gemini.py | HTTP request | Gemini JSON/stream | Implemented | Verified in source |
| Provider gateway | Copilot Studio validation/tool analysis | copilot_studio.py | Copilot hook | allow/block/error response | Implemented | Verified in source |
| Guardrails | Request and response data-risk detection | guardrails_utils_async.py; prediction_integration_async.py | content-bearing request/response | predictions, redaction or block | Implemented | Verified in source |
| Guardrails | Adversarial/exploit detection | WORKERS/oob_exploit_detection_prediction | NATS detection request | classification result | Implemented | Verified in source |
| Guardrails | Hallucination detection | hallucination_check_async.py | response plus context | fail-open detection result | Implemented | Verified in source |
| Guardrails | Guardian agent policy evaluation | guardian_agent.py | agent prompt/tool context | tier/result and optional block | Implemented | Verified in source |
| Guardrails | Content transformation/token saving | html_to_text_replacer.py; json_to_toon_replacer.py; markdown_to_text_replacer.py; text_compression_replacer.py; token_saving.py | configured prompt | transformed prompt and savings telemetry | Implemented | Verified in source |
| Control | Rate/concurrency/model/source limits | openai_compatible.py; model_rate_limits.py; api_key_utils/model_validation.py | authenticated request | 429/403/validation response or allowed request | Implemented | Verified in source |
| Routing | Provider/model/routing-group/fallback selection | openai_compatible.py:resolve_openai_compatible_model_routing | model, provider labels, rules and health | selected provider/model/label | Implemented | Verified in source |
| Telemetry | Request performance logging | performance_logger_async.py | request lifecycle | request log written through database manager | Implemented | Verified in source |
| Telemetry | Axis DLP alert emission | axis_logging_utils.py; axis_log_queue_async.py | guardrail result | Axis-shaped NATS record | Implemented | Verified in source |
| Telemetry | Logs, usage, pricing and analytics APIs | v2_logs.py; metrics.py; usage.py; model_pricing.py; log_export.py | operator query | filtered aggregates or export | Implemented | Verified in source |
| Health | Provider health analytics | provider_health.py; global_provider_health.py | operator query | request-derived health | Implemented | Verified in source |
| Health | External gateway probe/rollup/alerts | OTHER_APPS/gateway_health | timer/probe | probe records, incidents and alerts | Implemented | Verified in source |
| Assurance | Red-team execution and review | redteaming.py; redteaming_v2.py; WORKERS/red_teaming_worker | manual/scheduled run | cases, results, summaries, reviews | Implemented | Verified in source |
| Analytics | False-positive and intent analysis | handlers/false_positive_analysis.py; handlers/intent_analysis.py; WORKERS/intent_analysis_worker | operator job | saved analysis/result | Implemented | Verified in source |

### Important limitations

- Handler-specific content walkers mean capture and enforcement parity cannot
  be inferred across OpenAI Chat, Responses, Assistants, Anthropic, Bedrock,
  Vertex, audio, embeddings, rerank and Realtime.
- Post-response block proves the gateway withheld its normal response; it does
  not undo provider processing.
- Provider routing labels are administrator-defined aliases, not stable
  provider-account identity.
