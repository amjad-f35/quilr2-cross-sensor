# Analysis coverage

## Status

`Partial only where repository evidence is unavailable.` Static source,
configuration, tests, existing analysis, and sensor-intelligence artifacts are
closed for the pinned `mcpgateway/` scope. Live production systems, the exact
complete pinned contract worktree, and external-service behavior remain
unresolved; therefore this analysis does **not** claim 100% dynamic completion.

## Measured deliverables

| Artifact class | Count | Validation status |
| --- | ---: | --- |
| Scoped tracked source files | 351 | 351 classified in the first-pass inventory |
| Post-snapshot branch drift | 32 paths | 27 modified and 5 added after the pin; intentionally outside this snapshot |
| Markdown documents | 36 | 4,802 lines; links/fences checked |
| Required narrative subject chapters | 33 numbered chapters | 33 present |
| YAML schemas/manifests | 9 | 9 parsed as mappings |
| CSV matrices | 29 | 29 parsed; 400 data rows; uniform widths |
| JSON fixtures | 21 | 21 parsed |
| Required fixture categories | 10 | 10 represented |
| Current DeliveryRecord fixtures | 3 | 3 contract-valid |
| Intentionally invalid DeliveryRecord fixtures | 1 | 1 contract-rejected |
| Targeted second-pass tests | 84 | 78 passed; 6 classified failures |
| Whimsical boards | 7 | 7 overall renders inspected |
| Whimsical major-zone renders | 31 | 31 cropped renders inspected |
| Final top-level spatial overlaps | 0 | Detailed spatial audit across all 7 boards |

## Sensor-intelligence matrix closure

| Matrix | Rows | Coverage status |
| --- | ---: | --- |
| features | 18 | Closed for implemented and material partial feature families |
| utilities | 15 | Closed for material supporting subsystems |
| runtime-entry-points | 13 | Closed for distinct executable/runtime families |
| capture-points | 9 | Closed for current and major missing capture surfaces |
| native-record-types | 13 | Closed for durable and material transient records |
| native-fields | 31 | Closed for all fields entering current Starliner mapping plus material native state |
| field-lineage | 20 | Closed for current emitted fields and transformations |
| inventory-entities | 14 | Closed with current/proposed dispositions |
| identifiers | 13 | Closed with privacy and canonicalization dispositions |
| identity-coverage | 8 | Closed for observed identity dimensions |
| relationships | 12 | Closed with current/central derivation status |
| native-events | 20 | Closed for material runtime transitions |
| event-mappings | 10 | Closed for current/proposed canonical mappings |
| metrics | 14 | Closed for current and derivable measures |
| logs-traces-audit | 9 | Closed for evidence-bearing outputs |
| detectors | 9 | Closed for native and central inference candidates |
| control-capabilities | 10 | Closed with observe/shadow/enforce status |
| interfaces | 15 | Closed at interface-family level |
| extraction-points | 8 | Closed for admissible adapter seams |
| adapter-components | 15 | Closed for current plus proposed central responsibilities |
| platform-contract-mapping | 14 | Closed for current record/field families |
| cross-sensor-overlaps | 8 | Closed against the available central target analysis |
| product-disposition | 14 | Closed using the prescribed disposition vocabulary |
| findings | 12 | Closed with evidence/confidence |
| coverage | 10 | Closed for key capability dimensions |
| health-metrics | 15 | Closed for current and proposed health signals |
| privacy-disposition | 16 | Closed for sensitive/material field families |
| gaps | 20 | Closed with sensor-change classifications |
| mvs-scope | 15 | Closed for minimum viable integration |

## File accounting

| Class | Discovered | Fully accounted | Partial | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Scoped tracked files | 351 | 351 | 0 | 0 |
| Post-pin `1b2f2b3..99f759d` delta | 32 paths | 0 | 32 | Branch advanced after snapshot; requires a separately pinned revision |
| Generated/vendored files | Grouped under first-pass inventory classifications | Accounted at group/interface level | 0 | Symbol-level detail intentionally grouped |
| Source outside `mcpgateway/` | Not in mission scope | 0 | 0 | Explicitly excluded |
| Live external systems | 8 families | 0 | 8 | No credentials/endpoints/runtime authorization supplied |
| Private Starliner package behavior | 2 package families | Public optional-dependency paths inspected | 2 | Private implementation unavailable |

## Static and runtime evidence

- **Verified in source:** all source/configuration claims cited in the narrative
  and ledgers.
- **Verified by test:** mapper, privacy, correlation, outbox, delivery,
  registry-hook, Direct-handler, legacy-adapter, optional-dependency, and
  certification behaviors covered by the targeted test selection.
- **Runtime verified:** 78 targeted cases passed in Python 3.12 using the
  available local compatible contract descendant.
- **Unresolved:** no live external MCP/ingest/identity/DLP/ZIA/ClickHouse/
  Google/workflow deployment was exercised.
- **Visual verification:** seven linked Whimsical boards, seven whole-board
  renders, 31 cropped major-zone renders, and a final zero-overlap spatial
  audit are recorded in `33-whimsical-visual-architecture.md`.
- **Snapshot drift:** the final clean checkout points at `99f759d...`, which has
  27 modified and 5 added `mcpgateway/` paths relative to the analyzed
  `1b2f2b3...` pin. Those changes are not silently attributed to this dossier.

## Checklist

- [x] Inventory and pin the exact scoped source.
- [x] Reconcile repository instructions, first-pass analysis, and target
  contracts.
- [x] Trace current Starliner observe records field by field.
- [x] Trace Direct MCP capture through delivery.
- [x] Trace OneMCP/native/resource/prompt/session surfaces and record gaps.
- [x] Close capability, utility, native record, field, identity, relationship,
  event, metric, evidence, detector, control, and interface ledgers.
- [x] Produce adapter, mapping, product, finding, coverage, privacy, gap, MVS,
  and acceptance artifacts.
- [x] Populate all required machine-readable schemas, matrices, and fixture
  categories.
- [x] Run proportionate targeted dynamic verification.
- [x] Cross-validate YAML, CSV, JSON, Markdown, and current DeliveryRecords.
- [ ] Complete live integration verification. `Unresolved:` external systems
  and production environment are unavailable.
- [ ] Execute against the exact complete pinned Starliner contract tree.
  `Unresolved:` partial-clone blobs are unavailable.
- [x] Complete Whimsical visual architecture QA and record board links.

## Completion guard

The repository-derived static analysis and requested artifact families are
complete for the pinned subtree. The overall mission remains explicitly
partial at dynamic/external boundaries and for post-snapshot branch changes;
those boundaries are listed rather than inferred.
