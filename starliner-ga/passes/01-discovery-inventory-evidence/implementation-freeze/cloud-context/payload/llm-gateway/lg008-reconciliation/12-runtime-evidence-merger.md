# Runtime evidence


| runtime_experiment_id | revision_id | exact_command | runtime_version | result | failed_attempts | limitations | proof_status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:runtime-experiment:f36925c6-5751-5535-98a4-e2e1cc8d76fd | urn:quilr:lg008:revision:e2dcf70f-e0c8-5096-a94f-b1ef7f3b2f67 | /bin/sh /Users/t4ctic4l/Documents/Codex/Consolidate/LLM-gateway-sensor-analysis/lg008-llm-gateway/runtime/run-targeted-tests.sh | Python 3.12.13 | 75 PASSED; 1 FAILED; exit 1 | Initial collection lacked pytest, then openai/clickhouse_connect/blacksheep; dependencies installed only into /private/tmp. | No provider/NATS/ClickHouse/Axis/Starliner service runtime | RUNTIME_OBSERVED |

## Retained artifacts

- [`run-targeted-tests.sh`](../../lg008-llm-gateway/runtime/run-targeted-tests.sh) is the exact command
  wrapper and contains no credentials.
- [`pytest-targeted.stdout.txt`](../../lg008-llm-gateway/runtime/artifacts/pytest-targeted.stdout.txt) contains the sanitized
  failure output.
- [`pytest-targeted.stderr.txt`](../../lg008-llm-gateway/runtime/artifacts/pytest-targeted.stderr.txt) records the empty separate
  stderr boundary.
- [`runtime-fixture-manifest.json`](../../lg008-llm-gateway/runtime/artifacts/runtime-fixture-manifest.json) identifies the
  fixture class and source revision.

`Runtime observed:` 75 passed and one failed. The failure shows
`normalize_provider_health_model("model-router")` returning `"model-router"`
while the test requires `None`.

`Unresolved:` live providers, NATS, ClickHouse, Axis, and Starliner were not
exercised; no successful live-integration claim is made.
