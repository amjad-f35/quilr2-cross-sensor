# Analysis coverage


## Exact snapshot

| Measure | Count |
| --- | ---: |
| Primary repository tracked files | 1,093 |
| Files classified | 1,093 |
| Files partially analyzed | 0 |
| Files skipped | 0 |
| Scoped declaration rows | 6,526 |
| LLM route entry points | 252 |
| Features | 36 |
| Utilities | 6,526 |
| Capture points | 9 |
| Native record types | 14 |
| Native field/key occurrences | 26,292 |
| Field lineage rows | 26,292 |
| Inventory entity types | 13 |
| Identifiers | 14 |
| Relationships | 9 |
| Events | 14 |
| Metrics | 19 |
| Detectors | 5 |
| Controls | 8 |
| Interfaces | 257 |
| Platform field mappings | 26,292 |
| Findings evaluated | 8 |
| Static scoped tests | 316 |
| Runtime tests executed | 76 |
| Runtime tests passed | 75 |
| Runtime tests failed | 1 |
| Open questions | 8 |

## File classification

| Scope | Files |
| --- | --- |
| Deployment/operations context | 86 |
| Documentation evidence | 8 |
| LLM Gateway health subsystem | 16 |
| LLM Gateway operator UI | 16 |
| LLM Gateway test evidence | 30 |
| LLM Gateway worker dependency | 453 |
| Primary LLM Gateway | 70 |
| Primary LLM Gateway state/analytics | 25 |
| Repository context | 117 |
| Repository-adjacent subsystem | 250 |
| Shared LLM/DLP capability | 15 |
| Shared runtime dependency | 7 |

Every tracked file has a classification and immutable hash in
[`source-files.csv`](../../../matrices/sensor-intelligence/llm-gateway/source-files.csv).
No file is labeled partially analyzed. Binary files are classified by path,
size and hash; their opaque bytes are not falsely described as symbol-analyzed.

## Completion boundary

Static sensor intelligence is complete at commit `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d` for tracked-file
classification, scoped declarations, routes, native key occurrences and all
required product/adapter dispositions. Runtime integration verification remains
explicitly unresolved where credentials, live providers, NATS, ClickHouse,
Axis and private Starliner packages are absent; this does not leave any source
file or datum unclassified.
