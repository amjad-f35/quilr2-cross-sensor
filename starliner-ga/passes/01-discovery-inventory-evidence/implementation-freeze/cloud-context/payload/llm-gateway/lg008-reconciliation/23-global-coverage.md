# LLM-only reconciliation coverage


| Catalog | Rows |
| --- | --- |
| files | 1093 |
| components | 6526 |
| entry_points | 252 |
| features | 36 |
| capabilities | 36 |
| records | 14 |
| events | 14 |
| messages | 257 |
| fields | 26292 |
| relationships | 9 |
| metrics | 19 |
| configuration_items | 224 |
| lineage_edges | 79196 |
| analysis_artifacts | 92 |
| input_classes | 17 |
| evidence_items | 1265 |
| access_recipes | 1199 |
| runtime_experiments | 1 |
| target_contract_artifacts | 73 |
| target_fields | 128 |
| frozen_artifacts_reconciled | 73 |
| contradictions | 8 |
| proposed_diffs | 8 |
| change_requests | 8 |
| unresolved | 8 |
| blocking_unresolved | 6 |
| validator_exit_code | 1 |

All admitted LLM source files, dossier artifacts, fields, mappings, frozen
artifacts, and runtime artifacts are registered. The coverage report records
counts and validator results:
[`lg008-coverage.json`](../../lg008-llm-gateway/reports/lg008-coverage.json).

Other sensors were intentionally untouched and are not counted. Therefore
“global” in filenames is an LG-008 contract name, not a five-profile coverage
claim.
