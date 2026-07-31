# Capture surface catalog

| capture_point | surface | api_hook | trigger | privilege | scope | frequency | native_records | blind_spots |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI-compatible HTTP ingress | chat/models/embeddings/audio | BlackSheep routes | caller request | valid Quilr key and optional JWT/source policy | request headers/body/path and upstream response | per request | api_request_log; Axis prompt/response alerts | Calls bypassing gateway; content omitted by endpoint-specific walkers |
| Anthropic Messages ingress | /anthropic_messages/v1/messages | BlackSheep POST | caller request | valid Quilr key | Anthropic/Bedrock-native request and response text/usage | per request | api_request_log; Axis records | Provider-side activity outside gateway |
| AWS Bedrock native ingress | Converse/invoke | BlackSheep POST plus SigV4 validation | caller request | configured base AWS identity or Quilr auth | supported JSON bodies/event stream | per request | api_request_log; Axis records | Unsupported invoke-with-response-stream handler explicitly returns unsupported |
| OpenAI Responses/Assistants ingress | resource APIs | literal route tables | caller request | valid Quilr key | input/output text and tool-call strings where walkers implement them | per request | api_request_log; DLP/Axis records | Non-text opaque provider objects |
| OpenAI Realtime relay | WebSocket frames | six WS routes | bidirectional frame | key in supported header/query/subprotocol form | relayed frames and selected prediction logging | per frame/session | realtime prediction log | No durable session/connection entity contract |
| Copilot Studio hooks | validate/tool-execution | BlackSheep POST | Copilot hook | path key; JWT is decoded without verification for identity hints | messages, history and flattened tool arguments | per hook | allow/block and performance/Axis logs | Decoded unverified JWT claims are not authoritative identity |
| DLP NATS request/reply | JetStream dlp.req/dlp.res | nats_client and Rust workers | gateway classification call | NATS connectivity | content chunks and detector result | per DLP call | detector request/result | Timeouts/errors fail according to caller; absence is not clean content |
| Performance request lifecycle | in-process log_entry | PerformanceLoggerAsync | gateway request | database writer available | timing, tokens, outcome, model/provider/error | per request | llmgateway_api_request_logs row | Temporary timestamps are removed; delivery acknowledgement to Quilr 2.0 does not exist |
| External gateway health probes | gateway/component HTTP | gateway_health worker | timer | network access | availability/status/latency | configured interval | probe/incident/anomaly | Probe success is not complete request-path coverage |

Coverage is limited to traffic that traverses these hooks. A lack of gateway
events is never evidence that no LLM use occurred.
