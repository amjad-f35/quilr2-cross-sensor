# Sensor Versus Platform Responsibilities

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Prevent source capture, adapter normalization, canonical identity and product findings from collapsing together.


| Responsibility | Vanguard/Sentinel sensor | Adapter | Starliner/platform |
| --- | --- | --- | --- |
| Capture DOM/Chrome/OS/filesystem evidence | Owns | Observes hook | Does not recapture |
| Assign stable component/source record IDs | Owns | Validates/preserves | Uses, never rewrites source IDs |
| Minimize/redact before delivery | Owns first boundary | Enforces allow-list | Enforces admission/access |
| Durable local/server delivery | Cooperates | Owns outbox/worker | Returns record-level results |
| Native-to-contract mapping | Exposes typed record | Owns | Certifies versions |
| Canonical entity merge | Must not do globally | Supplies candidates/confidence | Owns tenant-scoped resolution |
| Cross-sensor relationships | Supplies direct assertions only | Preserves provenance | Owns bounded inference |
| Finding lifecycle/dedup | Supplies detector/action evidence | Maps fields | Owns admission, severity, lifecycle |
| Desired policy/control | Consumes and enforces | Translates/validates command | Owns authoritative config |
| Enforcement effect | Captures direct local evidence | Maps result state | Presents correlated state |
| Capability/runtime health | Emits per component | Aggregates delivery health | Compares expected vs observed |
| MCP/cloud/CI/repository discovery | Declares unsupported | Does not fabricate | Routes to other authoritative sensors |
