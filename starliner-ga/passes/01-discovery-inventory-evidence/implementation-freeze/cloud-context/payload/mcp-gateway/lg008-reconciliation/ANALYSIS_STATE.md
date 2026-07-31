# Analysis state

## Accepted source profiles

- MCP Gateway:
  `ACCEPTED_WITH_NONBLOCKING_EXTERNAL_BOUNDARIES` for the pinned static profile.

## Rejected or incomplete profiles

- Browser: `REJECTED_INCOMPLETE`
- Browser Backend: `REJECTED_INCOMPLETE`
- Endpoint: `REJECTED_INCOMPLETE`
- LLM Gateway: `REJECTED_INCOMPLETE`

These four results mean “not consumed in this MCP-only run,” not that their
separate dossiers are necessarily defective.

## Frozen artifacts inventoried

- 74/74 files in the implementation-freeze package.
- Content snapshot:
  `sha256:e2561211b7d8cf368d759b96dc5ba16e146e26c5887585be460cc50b7fcaec41`.
- Static package validator: passed.
- Declared package status: source-corrected freeze candidate; acceptance and P0
  live storage gates remain open.
- Named target-contract owner and freeze date: unresolved.

## Merger status

| Area | Status |
| --- | --- |
| Global ID registry | MCP contribution complete: 1,523 IDs |
| Component merger | 15 components; no cross-profile equivalence asserted |
| Entry-point merger | 13 MCP entry points |
| Feature/capability merger | 18 features and 18 capabilities |
| Record/event/message merger | 13 native records, 20 events, 10 frozen messages |
| Field merger | 31 native fields and 118 frozen target fields reconciled |
| Relationship merger | 12 source claims; frozen MCP relationship rules linked |
| Access recipes | 76 recipes |
| Negative observability | 62 concepts; MCP column complete, four columns blocked |
| Runtime evidence | 3 experiments; targeted run retained, two aggregate transcripts absent |
| Lineage | 31 source-field edges plus frozen UI/API mappings |
| Freeze reconciliation | 74 artifacts and 118 MCP target fields classified |

## Open contradictions

Six contradictions are open:

1. producer-created `canonical_entity`;
2. required server `product_source_id` versus custom backend reality;
3. Direct exception observation gap;
4. incomplete per-surface coverage;
5. current outbox versus frozen WAL/receipt semantics;
6. two historical runtime-result sets without retained raw artifacts.

## Open change requests

Six proposed, unaccepted change-control records correspond to those
contradictions.

## Validator status

- Overall: `FAIL`
- LG-008: `LG008_OPEN`
- Errors: 19
- Change-control-required findings: 11
- Warnings: 16

All structural ID, pinned source coverage, controlled proof, reachability,
disposition, field, recipe, evidence-digest, schema, and lineage validators
pass. Failures are concentrated in absent global profiles, runtime evidence
retention, unresolved ownership, and closure.

## Current closure blockers

- four required profiles not admitted;
- six blocking contradictions;
- seven blocking unresolved-evidence items;
- other-profile observability columns unavailable;
- two runtime experiment transcripts not retained;
- target/adapter/remediation ownership not assigned;
- current `99f759d...` branch delta not saturated;
- global five-profile zero-new-item pass not performed.

## Next exact task

The authoritative central agent must ingest the other four pinned profiles,
assign named owners, decide the six MCP change requests, retain or downgrade the
two historical runtime claims, choose whether `1b2f2b3...` or `99f759d...` is
the MCP release authority, and rerun `./validate-lg008`.
