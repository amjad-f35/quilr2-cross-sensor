# 17 — Proposed Reconciliation Diffs

**All 16 diffs are proposed and unapplied.**

| Diff | Class | Proposed change | Blocks closure |
| --- | --- | --- | --- |
| DIFF-EP-001 | REOPEN_REQUIREMENT | Commit/tag the exact 74-file bundle and publish immutable authority metadata. | Yes |
| DIFF-EP-002 | REOPEN_REQUIREMENT | Run the central merger with the four excluded completed dossiers; do not widen this endpoint pass. | Yes |
| DIFF-EP-003 | OPEN_DEFECT | Implement the frozen protocol/normalization contract and quarantine the legacy producer-canonical field. | Yes |
| DIFF-EP-004 | OPEN_DEFECT | Generate all delivery/ingest models from one frozen schema and add golden wire tests. | Yes |
| DIFF-EP-005 | OPEN_DEFECT | Implement leased/fenced claims and crash-recovery conformance tests. | Yes |
| DIFF-EP-006 | OPEN_DEFECT | Require an explicit result for every record and retain unmentioned rows for retry/quarantine. | Yes |
| DIFF-EP-007 | OPEN_DEFECT | Implement and certify the endpoint Edge Runtime, manifest, IPC, privacy mapper, WAL, and delivery. | Yes |
| DIFF-EP-008 | OPEN_DEFECT | Advertise observe-only until exact decision/effect tests prove enforcement. | Yes |
| DIFF-EP-009 | OPEN_DEFECT | Represent decision and observed effect separately; remove the redaction-success claim until certified. | Yes |
| DIFF-EP-010 | OPEN_DEFECT | Rename/currently scope Quarantined to its verified effect or implement independent isolation. | Yes |
| DIFF-EP-011 | OPEN_DEFECT | Implement scoped snapshot/gap emission before capability advertisement. | Yes |
| DIFF-EP-012 | REOPEN_REQUIREMENT | Review this generated per-field ledger and accept or revise every SOURCE_FACT_UNMAPPED row. | Yes |
| DIFF-EP-013 | OPEN_DEFECT | Keep Linux unsupported in capability certification until a pinned implementation and runtime evidence exist. | Yes |
| DIFF-EP-014 | CLARIFICATION_ONLY | Keep it DEAD_OR_UNREACHABLE or regenerate/fix and explicitly register it in a later requirement. | No |
| DIFF-EP-015 | OPEN_DEFECT | Run the frozen live storage conformance suite on an authorized clean host and retain outputs. | Yes |
| DIFF-EP-016 | REOPEN_REQUIREMENT | Admit the exact UI revision/dirty patch as supporting evidence in the full global pass. | Yes |

Each machine row includes compatibility, migration, adapter, PostgreSQL,
ClickHouse, OpenAPI, authorization, UI, fixture, test and rollout impact. Those
fields are review scopes, not a claim that every layer necessarily changes.

Acceptance requires the target authority owner. This analysis cannot accept its
own proposed architecture changes.
