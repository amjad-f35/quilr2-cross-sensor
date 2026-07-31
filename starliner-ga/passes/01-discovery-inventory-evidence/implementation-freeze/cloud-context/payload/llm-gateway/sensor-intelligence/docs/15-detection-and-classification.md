# Detection and classification


| detector | location | status | inputs | output | match_semantics | proof_semantics | failure | platform_mapping |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Data risk classifier pipeline | DataClassifier/handlers/llmgateway/prediction_integration_async.py; WORKERS/oob_data_risk_prediction | Implemented | selected request/response text and category configuration | prediction dictionaries and disabled predictions | multi-stage rules/models; see worker symbol ledger | Content matched configured detector criteria; not a customer finding by itself | Caller-specific; errors/timeouts must be read per path | FindingSignal/evidence |
| Exploit/adversarial classifier | WORKERS/oob_exploit_detection_prediction | Implemented | content plus enabled categories | classification/result | Rust detector and optional stage2 | Classifier result, not proof of malicious actor intent | Configuration/runtime dependent | FindingSignal |
| Hallucination detector | handlers/llmgateway/hallucination_check_async.py | Implemented; fail-open | context and response text | hallucinated/result metadata | remote NATS worker result | Detector judgment, not verified factual falsity | Infra errors return non-blocking/fail-open result | Signal or assurance result |
| Guardian agent | handlers/llmgateway/guardian_agent.py | Implemented | system prompt, messages/tool context and tier settings | policy/category result | model/rule orchestration in cited module | Policy evaluation output | Path-specific | Decision/Signal |
| Custom EDM/category matching | WORKERS/custom_categories_prediction | Implemented | configured definitions and content | entity/category matches | exact/FTS/vector paths per worker | Configured sensitive-value/category match | Index/config freshness dependent | FindingSignal/evidence |

No detector result is automatically a customer finding. Each finding in
`23-findings-and-insights.md` declares evidence, coverage, deduplication and
action requirements.
