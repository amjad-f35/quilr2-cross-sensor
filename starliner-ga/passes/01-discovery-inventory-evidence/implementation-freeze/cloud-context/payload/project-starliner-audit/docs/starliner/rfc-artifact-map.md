# Starliner Contracts Foundation: RFC Artifact Map

This document maps the platform-owned `starliner_contracts` package, schemas,
golden traces, certification ledger, and SDK interfaces back to the RFC sections
they implement. The schemas and golden traces are the **source of truth**; the
prototype `starliner` SDK and the LLM/MCP adapter branches are reference
consumers only.

## Scope and design decisions

- New package `starliner_contracts/` is the canonical contract + certification
  layer. The existing generic `starliner/` SDK is left intact for now.
- Schema identity follows RFC-0001 §4: every record carries a string `schema`
  plus an integer `schema_version`. The python attribute is `record_schema`
  (aliased to `schema`) to avoid shadowing `BaseModel.schema`.
- All canonical `schema` strings use the `starliner.` namespace (RFC-0007 §20
  names the compatibility ABI `starliner.sensor.v1`). RFC-0001/0010 examples use
  a `quilr.` prefix; this repo standardizes on `starliner.` for a single
  coherent namespace. Field structures match the RFCs.
- Golden traces are authored as JSON (`*.trace.json`) instead of the YAML shown
  in RFC-0010 §7 to avoid adding a runtime YAML dependency. Field structure is
  identical.
- This pass implements contracts, schemas, validator CLI, golden traces, a
  certification ledger schema + sample, and minimal SDK interfaces. No
  enforcement engine, Decision API, OPA/OpenFGA, or product adapter wiring.

## Canonical records (RFC-0001)

| Artifact | Module | Schema id | RFC section |
| --- | --- | --- | --- |
| `DecisionRequest` | `starliner_contracts/decision.py` | `starliner.decision_request.v1` | RFC-0001 §5 |
| `DecisionResult` | `starliner_contracts/decision.py` | `starliner.decision_result.v1` | RFC-0001 §6 |
| `ActionEvent` | `starliner_contracts/events.py` | `starliner.action_event.v1` | RFC-0001 §7 |
| `EntitySnapshot` | `starliner_contracts/entities.py` | `starliner.entity_snapshot.v1` | RFC-0001 §8 |
| `RelationshipEvent` | `starliner_contracts/relationships.py` | `starliner.relationship_event.v1` | RFC-0001 §9 |
| `Finding` | `starliner_contracts/findings.py` | `starliner.finding.v1` | RFC-0001 §10 |
| `CostEvent` | `starliner_contracts/cost.py` | `starliner.cost_event.v1` | RFC-0001 §11 |
| `TraceSpan` | `starliner_contracts/tracing.py` | `starliner.trace_span.v1` | RFC-0001 §12 |
| Shared envelope / taxonomy | `base.py`, `taxonomy.py` | n/a | RFC-0001 §4, §5.3, §8-10 |

DecisionRequest enforces the RFC-0001 §5.2 "banned from hot path" rule by
exposing only bounded fields and `*_ref` / `*_hash` references for payloads.

## Sensor compatibility records (RFC-0007)

| Artifact | Module | Schema id | RFC section |
| --- | --- | --- | --- |
| `SensorManifest` | `starliner_contracts/manifest.py` | `starliner.sensor_manifest.v1` | RFC-0007 §8 |
| `CanonicalActivity` | `starliner_contracts/manifest.py` | `starliner.canonical_activity.v1` | RFC-0007 §9 |
| `SensorHealthEvent` | `starliner_contracts/manifest.py` | `starliner.sensor_health_event.v1` | RFC-0007 §10 |
| `ContractTestResult` | `starliner_contracts/certification.py` | `starliner.contract_test_result.v1` | RFC-0007 §13, RFC-0010 §11 |
| `SensorCertificationRecord` | `starliner_contracts/certification.py` | `starliner.sensor_certification_record.v1` | RFC-0007 §14 |
| `CapabilityMode` enum | `taxonomy.py` | n/a | RFC-0007 §7 |

## Schema export + validator CLI

| Artifact | Location | RFC section |
| --- | --- | --- |
| Schema registry + export | `starliner_contracts/schemas.py` | RFC-0007 §22 Stage 0 |
| Exported JSON Schemas | `docs/starliner/contracts/schemas/*.schema.json` | RFC-0007 §24 |
| Validator + secret scan + trace runner | `starliner_contracts/validation.py` | RFC-0007 §10/§19/§21 |
| CLI (`export-schemas`, `validate-record`, `validate-manifest`, `validate-trace`) | `starliner_contracts/cli.py` | RFC-0007 §19, RFC-0010 §14 |

`validate-trace` emits a `ContractTestResult` and exits non-zero on failure, the
machine-readable certification artifact required by RFC-0010 §11.

## Golden trace corpus (RFC-0007 §12, RFC-0010 §7)

Traces live in `starliner_contracts/corpus/golden/`. Format model:
`starliner_contracts/golden.py`.

| Trace id | Fixture file | Sensor | RFC evidence |
| --- | --- | --- | --- |
| `llm.gateway_normal.v1` | `llm_gateway_normal.trace.json` | LLM | RFC-0007 §12.1 `normal_openai_chat` |
| `llm.gateway_fake_ssn.v1` | `llm_gateway_fake_ssn.trace.json` | LLM | RFC-0007 §12.1 `dlp_positive_*`, §21 |
| `llm.gateway_fake_credit_card.v1` | `llm_gateway_fake_credit_card.trace.json` | LLM | RFC-0007 §12.1, §21 |
| `llm.sdk_missing_observe.v1` | `llm_sdk_missing_observe.trace.json` | LLM | RFC-0007 §10 degraded (fail-open observe) |
| `llm.sdk_missing_enforce.v1` | `llm_sdk_missing_enforce.trace.json` | LLM | RFC-0007 §10/§11 fail-closed enforce |
| `mcp.direct_tool_call.v1` | `mcp_direct_tool_call.trace.json` | MCP | RFC-0007 §12.2 `direct_tools_call_allowed` |
| `mcp.rejected_request.v1` | `mcp_rejected_request.trace.json` | MCP | RFC-0007 §12.2 `direct_tools_call_dlp_denied`/`rejected_request_logged` |
| `endpoint.network_dlp_candidate.v1` | `endpoint_network_dlp_candidate.trace.json` | Endpoint | RFC-0008 §2.1 unified DLP fail-open; RFC-0010 §9 |
| `endpoint.hook_tool_candidate.v1` | `endpoint_hook_tool_candidate.trace.json` | Endpoint | RFC-0008 §6 `dangerous_permissions=enforce`; RFC-0010 §9 |
| `browser.heartbeat_candidate.v1` | `browser_heartbeat_candidate.trace.json` | Browser/backend | RFC-0009 §heartbeat degraded modes; RFC-0010 §10 |

Each trace embeds the canonical records the adapter is expected to produce, plus
`expect` assertions (upstream-called, validity, degraded reason, decision, and
raw-secret absence). Degraded traces ship a `SensorHealthEvent` (RFC-0007 §10).

### Endpoint/browser evidence source

Endpoint and browser fixture facts are grounded in
`/Users/xquark_home/star/Browser-and-endpoint-repos/endpoint_browser_mock_code_only_report.md`
and RFC-0008/RFC-0009. No product behavior is inferred beyond those sources:

- Endpoint unified network DLP **allows on detect failure** (fail-open) →
  modeled as an `observe` candidate with a `network_dlp_allow_on_detect_failure`
  health event, not a provable `enforce` path.
- Endpoint hook dangerous-permissions is an `enforce` path → block before action.
- Browser heartbeat pre-Kafka state is pod-local and `publish=false` is logged,
  not thrown → modeled as `observe` evidence, not durable enforcement.

## Certification ledger (RFC-0007 §14)

| Artifact | Location |
| --- | --- |
| `SensorCertificationRecord` schema | `starliner_contracts/certification.py` |
| Sample ledger (LLM + MCP + endpoint) | `starliner_contracts/corpus/certification/ledger.sample.jsonl` |
| Loader | `starliner_contracts/corpus.py:load_ledger` |

## Sensor manifests (RFC-0007 §8, RFC-0008 §6, RFC-0009)

Sample manifests in `starliner_contracts/corpus/manifests/`:
`llm_gateway`, `mcp_gateway`, `endpoint_agent` (compound sub-sensors), and
`browser_backend` (with `known_degraded_modes`).

## Minimal sensor SDK interfaces (RFC-0003, RFC-0007 §3)

`starliner_contracts/sdk.py` defines runtime-checkable Protocols only:
`SensorAdapter`, `ContractValidator`, `CertificationRunner`, `EvidenceSink`.
These operate on canonical records and golden traces; they contain no
enforcement engine, decision client, or outbox.

## Tests

`tests/starliner_contracts/`:

- `test_canonical_contracts.py` — required names, schema ids, alias/int version,
  required fields, capability-mode rejection, additive evolution.
- `test_schema_export_cli.py` — schema registry coverage and the CLI surface.
- `test_golden_traces.py` — corpus presence, per-trace validation, no raw
  secrets in canonical records, degraded traces declare a health reason.
- `test_certification.py` — sample ledger validation and SDK Protocol shape.
