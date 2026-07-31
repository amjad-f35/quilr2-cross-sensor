# Analysis Coverage

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Provide measurable final coverage and distinguish source implementation gaps from analysis gaps.


## Repository basis

- Tracked files discovered/accounted for in prior full archaeology: **1,226**
- Files fully analyzed/classified there: **1,226**
- Files partially analyzed: **0**
- Files skipped: **0**
- Project-Vanguard: **707/707**
- project-sentinel: **226/226**
- browser-extension-service: **293/293**

## Sensor-intelligence ledgers

| Ledger | Rows | Status |
| --- | ---: | --- |
| Features | 45 | Complete |
| Utilities | 57 | Complete |
| Entry points | 34 | Complete |
| Capture points | 44 | Complete |
| Record types | 59 | Complete |
| Native fields | 776 | Complete |
| Field lineages | 776 | Complete |
| Inventory entities | 20 | Complete |
| Identifiers | 32 | Complete |
| Relationships | 30 | Complete |
| Events | 50 | Complete |
| Metrics | 40 | Complete |
| Detectors | 26 | Complete |
| Controls | 24 | Complete |
| Interfaces | 35 | Complete |
| Findings | 22 | Complete |
| Required matrices | 29/29 | Complete |
| Required schemas | 9/9 | Complete |
| Fixture/expected files | 32 | Complete |

## Dynamic/static limitations

No in-scope file or requested ledger is partially analyzed. Runtime execution
limitations and external-service unknowns are explicitly recorded in
[runtime verification](26-runtime-verification.md) and
[open questions](31-open-questions.md). Dynamic AI-site behavior, OS-specific
effects, external service routing, private auth components and production
brokers cannot be proven from the supplied repositories; none is promoted from
`Unresolved`/`Configured but runtime-unverified` to implemented runtime fact.
