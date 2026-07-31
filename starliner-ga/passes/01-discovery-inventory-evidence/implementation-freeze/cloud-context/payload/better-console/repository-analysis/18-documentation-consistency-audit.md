# Documentation Consistency Audit

| Claim | Source | Code/runtime evidence | Result |
| --- | --- | --- | --- |
| one Rust binary embeds the SPA | README/ARCHITECTURE | build.rs + include_dir SPA + successful real build | Confirmed |
| request ClickHouse clients are read-only | README/ARCHITECTURE | AppState readonly=2 on three clients | Confirmed |
| only topic subsystem writes three tables | README | private writer + persistence DDL test | Confirmed in code; deployed grants unresolved |
| scripts/verify.sh is CI gate | subtree workflow | workflow calls script | Confirmed for workflow definition; execution at pinned root run not shown |
| green root GitHub build means application built | workflow name/conclusion implication | exact build job skipped | Contradicted |
| Node 24 required | Docker/workflow/package engine | Node 24 resolves unit suite; Node 26 does not | Confirmed and behaviorally significant |
| handwritten production files below 1,500 lines | current AGENTS guidance | several Rust files exceed 1,500 lines | Contradicted by existing code |
| health covers platform health | route name | only main ClickHouse check; worker state excluded | Partially confirmed |
| TODO items are implemented behavior | TODO.md | items explicitly pending | Planned, not implemented |
