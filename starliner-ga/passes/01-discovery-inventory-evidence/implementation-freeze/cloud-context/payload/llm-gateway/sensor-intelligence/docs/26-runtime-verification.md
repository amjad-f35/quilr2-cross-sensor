# Runtime and dynamic verification


Static verification was regenerated at `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d`. The repository contains
316 LLM-scoped test declarations in this pass and 895
repository-wide tests in the first-pass index.

| capability | command | environment | result | failure_boundary |
| --- | --- | --- | --- | --- |
| Eight targeted LLM Gateway test files | pytest -q [8 cited files] | Python 3.12; disposable /private/tmp dependencies | 75 passed, 1 failed | provider-health normalization returns model-router rather than test-expected None |
| Initial dependency-free collection | same target under available Starliner venv | pytest present; gateway deps absent | collection errors for openai/clickhouse_connect; RBAC tests initially lacked blacksheep | environment dependency, resolved by disposable install for final run |
| Live external integrations | not executed | provider/NATS/ClickHouse/Axis credentials unavailable | Unresolved | no production service authority |

The final targeted run exercised eight LLM Gateway test files: **75 passed and
1 failed**. The failure is substantive repository evidence:
`normalize_provider_health_model("model-router")` returned `"model-router"`
while `test_provider_health_model_aliases_normalize_to_known_models` requires
`None`. This is recorded as a code/test contradiction; it was not repaired
because the mission prohibits production-source changes.

No synthetic fixture is represented as production runtime capture.
