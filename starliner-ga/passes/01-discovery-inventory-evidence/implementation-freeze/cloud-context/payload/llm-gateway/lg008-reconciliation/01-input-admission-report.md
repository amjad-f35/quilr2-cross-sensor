# LLM Gateway input admission


## Admission decision

| Profile | Revision coverage | Catalog completeness | IDs valid | Recipes complete | Runtime ledger complete | Admission result |
|---|---:|---:|---:|---:|---:|---|
| LLM Gateway | primary + two supporting revisions pinned | 17/17 required input classes | yes | yes | complete for executed experiments | `ACCEPTED` |

`Verified:` source coverage is 1,093/1,093;
the original dossier has zero partial file statuses. Closure gaps do not make
the source-truth dossier incomplete, so the profile is admitted. They remain
explicit closure blockers.

## Required input classes

| artifact_class | paths | status | missing | owner |
| --- | --- | --- | --- | --- |
| Source/evidence manifest | matrices/sensor-intelligence/llm-gateway/source-files.csv;matrices/sensor-intelligence/llm-gateway/input-ledger.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Repository and revision manifest | docs/sensor-intelligence/llm-gateway/00-input-scope-and-commit.md | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Component and entry-point catalog | matrices/sensor-intelligence/llm-gateway/symbols.csv;matrices/sensor-intelligence/llm-gateway/runtime-entry-points.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Feature and capability catalog | matrices/sensor-intelligence/llm-gateway/features.csv;matrices/sensor-intelligence/llm-gateway/control-capabilities.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Event/message/record catalog | matrices/sensor-intelligence/llm-gateway/native-events.csv;matrices/sensor-intelligence/llm-gateway/interfaces.csv;matrices/sensor-intelligence/llm-gateway/native-record-types.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Field and data-point dictionary | matrices/sensor-intelligence/llm-gateway/native-fields.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Field-transformation lineage | matrices/sensor-intelligence/llm-gateway/field-lineage.csv;matrices/sensor-intelligence/llm-gateway/platform-contract-mapping.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Relationship-claim catalog | matrices/sensor-intelligence/llm-gateway/relationships.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Persistence catalog | docs/sensor-intelligence/llm-gateway/06-native-record-types.md;matrices/sensor-intelligence/llm-gateway/native-record-types.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Health and diagnostic catalog | matrices/sensor-intelligence/llm-gateway/health-metrics.csv;matrices/sensor-intelligence/llm-gateway/logs-traces-audit.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Authorized-access cookbook equivalent | docs/sensor-intelligence/llm-gateway/17-interfaces-and-extraction-points.md;matrices/sensor-intelligence/llm-gateway/extraction-points.csv;matrices/sensor-intelligence/llm-gateway/capture-points.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Negative-observability boundaries | docs/sensor-intelligence/llm-gateway/21-cross-sensor-correlation.md;matrices/sensor-intelligence/llm-gateway/identity-coverage.csv;matrices/sensor-intelligence/llm-gateway/cross-sensor-overlaps.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Dynamic-analysis notebook | docs/sensor-intelligence/llm-gateway/26-runtime-verification.md;matrices/sensor-intelligence/llm-gateway/runtime-verification.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Unresolved-evidence register | docs/sensor-intelligence/llm-gateway/31-open-questions.md;matrices/sensor-intelligence/llm-gateway/gaps.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Source-to-adapter mapping recommendations | docs/sensor-intelligence/llm-gateway/18-adapter-architecture.md;matrices/sensor-intelligence/llm-gateway/adapter-components.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Analysis coverage report | docs/sensor-intelligence/llm-gateway/32-analysis-coverage.md;matrices/sensor-intelligence/llm-gateway/coverage.csv | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |
| Final sensor-integration decision sheet | docs/sensor-intelligence/llm-gateway/33-final-integration-decision.md | PRESENT_EQUIVALENT_INPUT | NONE | llm_gateway_lead |

The other four profiles are **not evaluated by user scope**, not rejected and
not silently admitted. Global closure therefore remains open.

Machine ledger: [`input-admission.csv`](../../lg008-llm-gateway/catalogs/input-admission.csv).
