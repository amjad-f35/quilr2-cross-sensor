# LLM M1 QFG ABI Extension Proof

## Boundary

This change is an additive extension of the existing
`starliner.sensor.v1`/`FindingSignal` v1 ABI for the Macrodata LLM Gateway
observe runtime. It does not add a record family or change delivery wrappers,
ingest result vocabulary, idempotency, trust, evidence storage, or raw-payload
policy.

Baseline:

```text
project-starliner origin/main
4fe39fd3ebf440edf5a7ef3544561f3e20c11703
```

Branch:

```text
feat/llm-qfg-abi-extension
```

## Dry-run result

Representative safe records were validated for all ten LLM M1 families:

```text
entity_snapshot       failed for missing LLM inventory entity kinds
source_observation    passed
relationship_event    passed with existing relations; two required directional
                      inventory relations were missing
action_event          passed for all llm.chat.*, provider, guardrail, Guardian,
                      and admin/config audit action labels
decision_result       passed for native Macrodata decision attribution
trace_span            passed
metric_event          passed
cost_event            passed
finding_signal        failed for all eight required LLM signal types and for a
                      bounded label array
sensor_health_event   passed for incomplete identity/degraded coverage
```

Request/action correlation remains in `ActionEvent` and `TraceSpan`. No
request or action pseudo-entity was introduced.

## Additive vocabulary

Entity kinds:

```text
llm_gateway_app
llm_api_key
tenant
policy_config
smart_group
prompt_store_object
```

Existing `llm_provider`, `llm_model`, `human_user`, and `workload` kinds were
already sufficient.

Relationship kinds:

```text
governed_by
used_by
```

Existing `uses` remains the truthful app-to-provider/model/prompt-store
relation.

Finding signal types:

```text
llm_dlp_monitored
llm_dlp_redacted
llm_dlp_blocked
llm_guardian_warned
llm_guardian_blocked
llm_response_dlp_monitored
llm_response_dlp_redacted
llm_response_dlp_blocked
```

`FindingSignal.attributes` additionally accepts a label list limited to 32
strings of at most 128 characters each. No unbounded object/list type was
added.

## Payload-safety extension

The validator explicitly rejects `raw_dlp_entity`, `raw_dlp_entity_value`, and
`dlp_entity_value`, in addition to the existing raw prompt, raw response,
header, token, cookie, credential, and secret canaries.

## Proof

Coverage added:

- one model test per LLM signal type;
- one bundled positive fixture per LLM signal type, certified through the
  canonical trace validator;
- unknown-signal rejection;
- raw response and raw DLP entity negative corpus traces;
- raw prompt/response/header/token/DLP-entity canary tests;
- all-ten-family representative validation;
- ingest and strict registry/trust acceptance plus duplicate handling for each
  LLM signal type;
- regenerated entity, relationship, and finding-signal JSON Schemas.

The complete Starliner test suite, schema export comparison, positive/negative
corpus gates, ABI/import guard, Ruff checks, and focused MCP compatibility suite
must pass before this branch is proposed for `main`.

Macrodata must pin its CI, certification, and runtime install to the canonical
commit produced when this extension lands on `project-starliner/main`. A
feature-branch SHA is not a canonical runtime pin.
