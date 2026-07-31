# Proposed reconciliation diffs

## Change-control rule

No frozen file was modified. These six entries are proposed diffs or
clarifications and remain unaccepted.

| Diff | Classification | Source truth | Proposed resolution | Blocks closure |
| --- | --- | --- | --- | --- |
| `MCP-DIFF-001` | `ADD_SOURCE_MAPPING` | mapper creates `canonical_entity` | remove producer canonical authority; emit source refs and binding metadata | yes |
| `MCP-DIFF-002` | `CHANGE_OPTIONALITY` | custom backend may lack separate product ID | make product optional or define explicit unresolved-product semantics | yes |
| `MCP-DIFF-003` | `CLARIFICATION_ONLY` | Direct exception result bypasses observation | require failed terminal outcome at conversion seam | yes |
| `MCP-DIFF-004` | `CLARIFICATION_ONLY` | current hooks cover only selected Direct/registry paths | require independent advertised-surface certification and gap state | yes |
| `MCP-DIFF-005` | `CLARIFICATION_ONLY` | current outbox is not frozen WAL/receipt contract | require WAL, identity, sequence, receipt, certification, control-lane parity | yes |
| `MCP-DIFF-006` | `CLARIFICATION_ONLY` | two old test summaries lack raw transcripts | retain future runtime artifacts or downgrade proof | yes |

## Impact dimensions

Each diff records:

- affected LG-008 requirement and defect;
- source evidence IDs;
- current contract and source truth;
- adapter, PostgreSQL, ClickHouse, OpenAPI, authorization, UI, fixture, test,
  migration, compatibility, and rollout effects;
- owner, approval requirement, and closure impact.

## Important distinction

Several discrepancies require source implementation changes rather than target
architecture changes. `ADD_SOURCE_MAPPING` is not permission to edit the
frozen schema. The server-product optionality issue is the one direct target
schema reconciliation request.

Machine outputs:

- [reconciliation diffs](../../lg008/reconciliation/reconciliation-diffs.yaml)
- [impact matrix](../../lg008/change-control/impact-matrix.csv)
