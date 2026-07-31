# Validator design and results


Run:

```bash
/Users/t4ctic4l/Documents/Codex/Consolidate/LLM-gateway-sensor-analysis/lg008-llm-gateway/validate-lg008
```

The command emits JSON, Markdown and JUnit reports. Exit code is
**1** because closure blockers remain.

Summary: `{"errors": 10, "change_control_required": 54, "warnings": 0, "informational": 0, "validators_run": 16, "validators_with_no_issues": 14}`.

## Per-validator result

| Validator | issues | registry_records | unique_ids |
| --- | --- | --- | --- |
| ids | 0 | 70356 | 70356 |
| source-coverage | 0 |  |  |
| proof-status | 0 |  |  |
| reachability | 0 |  |  |
| dispositions | 0 |  |  |
| producers-consumers | 0 |  |  |
| fields | 0 |  |  |
| access-recipes | 0 |  |  |
| evidence-links | 0 |  |  |
| schemas | 0 |  |  |
| lineage | 0 |  |  |
| observability | 0 |  |  |
| runtime-evidence | 0 |  |  |
| freeze-reconciliation | 54 |  |  |
| ownership | 0 |  |  |
| closure | 10 |  |  |

Fourteen structural validators have zero `ERROR` findings. The freeze
validator intentionally emits `CHANGE_CONTROL_REQUIRED` for mandatory target
fields that lack `CONFIRMED` mappings. The closure validator emits the ten
`ERROR` findings that keep `LG008_OPEN`.

Reports:
[`lg008-validation.json`](../../lg008-llm-gateway/reports/lg008-validation.json),
[`lg008-validation.md`](../../lg008-llm-gateway/reports/lg008-validation.md), and
[`lg008-validation.junit.xml`](../../lg008-llm-gateway/reports/lg008-validation.junit.xml).
