# Field disposition ledger

## Result

**Verified:** 578 meaningful rows are cataloged:

- every data row from the browser/native/BES repository-wide data dictionary;
- every data row from the endpoint repository-wide data dictionary;
- every data row from the LLM/DLP gateway repository-wide data dictionary;
- every data row from the Quilr 1 repository-wide data dictionary;
- all 137 Browser Extension Service transformation-schema mappings.

Artifacts:

- [source-fields.csv](matrices/source-fields.csv) — native name, meaning, source/line, directness, type, identifier status, cardinality, scope, collection method, extraction point, freshness, history, reliability, sensitivity, confidence, destination, visibility, and gaps.
- [field-disposition.csv](matrices/field-disposition.csv) — concise disposition.
- [data-disposition.csv](matrices/data-disposition.csv) — inventory/relationship/event/finding/metric/evidence/raw projection.
- [canonical-field-lineage.csv](matrices/canonical-field-lineage.csv) — authority and merge rules for key canonical fields.

## Disposition rules

| Destination | Admission rule | Examples | Product visibility |
| --- | --- | --- | --- |
| Canonical entity identity | Stable, tenant-qualified identifier with entity-specific resolution rule | IdP subject, device ID, provider model ID, verified origin, API-key fingerprint | Entity detail/Resolution Center |
| Canonical entity attribute | Durable fact with field authority and validity | product vendor, device OS version, management state | Inventory/detail |
| Source observation attribute | Useful source fact that is not canonical | endpoint local risk, browser MIME hint, native task state | Sources & Observations |
| Canonical relationship | Typed subject/object fact with authority/confidence/validity | application installed on device, agent uses model | Contextual relationship view |
| Normalized event field | Time-bound activity/decision/outcome fact | prompt size, token usage, action, occurred time | Activity drill-down |
| Finding signal | Fact that can contribute to an actionable correlated condition | DLP class, blocked action, stale sensor | Finding evidence |
| Metric input | Additive/non-additive fact with canonical grain/time semantics | tokens, latency, cost, bytes | Aggregate only |
| Evidence-only | Sensitive or assurance-bearing detail needed for investigation | prompt text, file path/content, justification, raw decision input | Privileged evidence view |
| Raw-only retained | Operational/source-specific data without canonical/product meaning | queue depth fields, transient headers, debug state | Operator telemetry |
| Discarded with reason | Proven redundant, unsafe, or legally prohibited after raw retention policy | None admitted by default in this analysis | Hidden |
| Unresolved | Meaning/authority cannot be established | external MCP-native fields, some relationship semantics | Resolution/operator view |

## Sensitive content

**Proposed:** raw prompts, responses, file/clipboard content, local paths, tool arguments/results, tokens, credentials, justifications, and arbitrary diagnostic context are never default inventory attributes. They are encrypted evidence references with separate authorization, retention, legal hold, access audit, and deletion controls. Canonical events keep size/classification/digest/reference—not duplicated plaintext.

**Verified:** supplied systems currently move sensitive content across browser/native, endpoint, HTTP, NATS, SQLite, ClickHouse, files, and logs with source-specific handling. There is no repository-wide retention/encryption/deletion policy. [BR-DATA](../../Browser-extension-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md), [EP-DATA](../../Endpoint-agent-sensor-analysis/repository-analysis/08-data-dictionary.md), [LLM-DATA](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md).

## Identifier caveats

- Names are aliases, never strong keys by themselves.
- Email is issuer/tenant/time-qualified secondary identity.
- Domain identifies an application surface only when catalog/ownership evidence supports it.
- PID requires device and process start time.
- Endpoint UUIDs are source IDs because their formulas can collide.
- `request_id`, `context_id`, and `prompt_id` are source correlation IDs; canonical event IDs remain separate.
- `source` is normalized through a source registry; native values are retained.
- Hashes are scoped by algorithm, normalization, source, and tenant. Non-cryptographic hashes are not integrity evidence.

## No silent discard

The ledger’s default for fields without a justified canonical destination is `Source observation attribute` or `Raw-only retained field`. A future deletion policy must record source field, schema version, legal/security justification, effective time, approver, and whether raw payload retrieval is also prohibited.
