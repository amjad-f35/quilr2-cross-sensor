# Proposed Reconciliation Diffs


All 13 diffs are proposals only. No frozen artifact was edited. Each diff names source truth, target artifact, affected requirements/defect, downstream impact, owner and approval requirement.

| source_truth | proposed_change | classification | owner | closure_blocking |
| --- | --- | --- | --- | --- |
| Frozen authority is hashable but not pinned to an immutable repository revision | Move/freeze artifacts in an immutable reviewed revision and record supersession. | CONTRACT_METADATA_CHANGE | program_lead | BLOCKER |
| Earlier source dossier combined browser, native host and backend evidence | Admit Browser as Vanguard+Sentinel and Browser Backend separately; retain original producer lineage. | SOURCE_IMPLEMENTATION_CHANGE | program_lead | BLOCKER |
| No stable compound extension/profile/native installation identity is emitted | Persist tenant-scoped installation, profile and component IDs and validate restart/reinstall semantics. | SOURCE_IMPLEMENTATION_CHANGE | browser_sensor_lead | BLOCKER |
| Sentinel SystemID strong top-level identity fields are empty in the current implementation | Populate qualified native identifiers or explicitly omit unsupported claims; add platform tests. | SOURCE_IMPLEMENTATION_CHANGE | native_host_lead | BLOCKER |
| FailedLogQueue is partial/nontransactional and Sentinel has no Starliner outbox | Implement transactional background-context WAL and accepted/duplicate/rejected receipt state. | SOURCE_IMPLEMENTATION_CHANGE | edge_lead | BLOCKER |
| MAIN-world bridge lacks authenticated/scoped sender and complete request correlation | Add per-request nonce/correlation, strict schema/origin checks and timeout/error telemetry. | SOURCE_IMPLEMENTATION_CHANGE | browser_sensor_lead | BLOCKER |
| Native upload response items lack stable per-file IDs and Vanguard merges positionally | Carry request and file IDs through every native result and reject ambiguous/duplicate responses. | SOURCE_IMPLEMENTATION_CHANGE | native_host_lead | BLOCKER |
| Current source paths can capture/log raw prompt, response, clipboard, file content, URL/path, headers and native stderr | Implement source-local allow-list/redaction before WAL; isolate authorized evidence with retention/audit. | SOURCE_IMPLEMENTATION_CHANGE | privacy_lead | BLOCKER |
| Policy decision, acknowledgement and actual effect are not consistently separate or independently proven | Emit distinct decision, attempted action, acknowledgement and observed effect records with correlation. | SOURCE_IMPLEMENTATION_CHANGE | policy_lead | BLOCKER |
| Snapshot lifecycle, explicit coverage gaps, complete hook health and enforcement readiness records are absent | Implement source-local snapshot/coverage state machine and health/gap emissions. | SOURCE_IMPLEMENTATION_CHANGE | browser_sensor_lead | BLOCKER |
| Native installer/manifest registration, supported-OS release artifact and upgrade proof are incomplete | Produce signed installers/manifests and OS-matrix install/upgrade/uninstall evidence. | SOURCE_IMPLEMENTATION_CHANGE | release_lead | BLOCKER |
| Linux clipboard path is unsupported/conditional in inspected source | Declare capability coverage by OS and certify or explicitly exclude Linux clipboard. | SOURCE_IMPLEMENTATION_CHANGE | native_host_lead | BLOCKER |
| Frozen Browser profile/binding do not state the admitted Vanguard and Sentinel full revisions | Update binding through change control with reviewed exact source revisions. | SOURCE_IMPLEMENTATION_CHANGE | program_lead | BLOCKER |
