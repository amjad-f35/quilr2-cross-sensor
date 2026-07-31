# Contradictions and Change Control


| assertion_a | assertion_b_or_contract | severity | required_owner | closure_blocking |
| --- | --- | --- | --- | --- |
| Frozen authority is hashable but not pinned to an immutable repository revision | LG-008 requires exact full revision and supersession evidence | CRITICAL | program_lead | BLOCKER |
| Earlier source dossier combined browser, native host and backend evidence | Frozen profile requires Vanguard, Sentinel and Browser Extension Service to remain independently identified producers; backend is a separate profile | MAJOR | program_lead | BLOCKER |
| No stable compound extension/profile/native installation identity is emitted | Frozen browser installation/profile and producer enrollment require stable IDs | CRITICAL | browser_sensor_lead | BLOCKER |
| Sentinel SystemID strong top-level identity fields are empty in the current implementation | Frozen device/local-binding semantics require qualified stable source identity | MAJOR | native_host_lead | BLOCKER |
| FailedLogQueue is partial/nontransactional and Sentinel has no Starliner outbox | Frozen browser binding requires transactional browser WAL, sequence, retry and receipts | CRITICAL | edge_lead | BLOCKER |
| MAIN-world bridge lacks authenticated/scoped sender and complete request correlation | Frozen source evidence requires trustworthy correlation and boundary validation | CRITICAL | browser_sensor_lead | BLOCKER |
| Native upload response items lack stable per-file IDs and Vanguard merges positionally | Frozen upload/nativeOutcome mapping requires explicit correlation | CRITICAL | native_host_lead | BLOCKER |
| Current source paths can capture/log raw prompt, response, clipboard, file content, URL/path, headers and native stderr | Frozen privacy disposition forbids these values in canonical inventory/activity and requires controlled evidence access | CRITICAL | privacy_lead | BLOCKER |
| Policy decision, acknowledgement and actual effect are not consistently separate or independently proven | Frozen contracts require native decision and observed effect semantics | MAJOR | policy_lead | BLOCKER |
| Snapshot lifecycle, explicit coverage gaps, complete hook health and enforcement readiness records are absent | Frozen browser profile defines snapshot, health and gap record families | CRITICAL | browser_sensor_lead | BLOCKER |
| Native installer/manifest registration, supported-OS release artifact and upgrade proof are incomplete | Frozen certification claims require tested deployment and lifecycle evidence | MAJOR | release_lead | BLOCKER |
| Linux clipboard path is unsupported/conditional in inspected source | Any blanket browser/native coverage claim would overstate supported platforms | MAJOR | native_host_lead | BLOCKER |
| Frozen Browser profile/binding do not state the admitted Vanguard and Sentinel full revisions | Central admission requires exact source revisions | MAJOR | program_lead | BLOCKER |

All contradictions are linked to proposed, unaccepted change requests. Frozen requirements are not silently rewritten.
