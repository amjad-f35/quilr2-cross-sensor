# Global coverage

## Scope label

`MCP_GATEWAY_CONTRIBUTION_ONLY`

This is not global five-profile coverage.

## Deliverable inventory

| Deliverable class | Count | Validation |
| --- | ---: | --- |
| Total contribution files | 103 | accounted |
| Narrative Markdown | 26 | 1,631 lines; links and fences checked |
| Machine/report/validator/runtime files under `lg008/` | 74 | parsed or syntax-checked by type |
| Build/runtime capture tools | 2 | Node syntax checked |
| One-command validator launcher | 1 | shell syntax checked and executed |
| JSON | 12 | parsed |
| JSON-compatible YAML | 20 | parsed |
| CSV | 17 | 378 rows; uniform widths |
| NDJSON | 2 | 626 rows parsed |

## Source and authority coverage

| Class | Discovered | Registered | Status |
| --- | ---: | ---: | --- |
| Pinned MCP tracked files | 351 | 351 | complete |
| First-pass analysis artifacts | 71 | 71 evidence-addressed | complete |
| Sensor-intelligence artifacts | 95 | 95 evidence-addressed | complete |
| Frozen package files | 74 | 74 | complete |
| Fresh runtime artifacts | 4 | 4 | complete |
| Post-pin changed paths | 32 | 0 in pinned catalogs | explicit separate revision |
| Other source profiles | 4 | profile IDs only | incomplete |

## Catalog coverage

| Catalog | Rows |
| --- | ---: |
| Components | 15 |
| Entry points | 13 |
| Features | 18 |
| Capabilities | 18 |
| Records | 13 |
| Events | 20 |
| Messages | 10 |
| Fields | 31 |
| Relationships | 12 |
| Persisted artifacts | 9 |
| Health signals | 15 |
| Diagnostic signals | 9 |
| Recipes | 76 |
| Observability concepts | 62 |
| Target fields | 118 |
| Lineage edges | 31 |

## Controlled-vocabulary coverage

All MCP catalog assertions have:

- exactly one proof status;
- exactly one reachability state;
- exactly one disposition;
- exactly one MCP observability boundary;
- at least one evidence ID;
- an owner role.

The other four observability columns intentionally fail the global validator.

## Validator coverage

Sixteen validators run through one command. Eleven pass outright or with
warnings/change-control findings; observability, runtime retention, ownership,
and closure fail for recorded blockers.

## Completion

MCP source registration and frozen-target reconciliation are complete for the
pinned snapshot. Global LG-008 coverage and closure are incomplete.
