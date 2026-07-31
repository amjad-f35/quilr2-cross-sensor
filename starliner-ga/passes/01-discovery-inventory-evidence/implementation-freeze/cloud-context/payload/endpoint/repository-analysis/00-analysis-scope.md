# 00 — Analysis Scope and Method

## Scope

The analysis covers all committed files reachable from the checked-out revisions of the three repositories listed in [README.md](README.md), including source, tests, fixtures, scripts, configuration, infrastructure, documentation, committed build artifacts, generated outputs, and vendored code.

## Method

1. Inventory and classify every committed file.
2. Inspect structure, dependency manifests, configuration, build/deployment files, and runtime entry points before drawing architectural conclusions.
3. Analyze meaningful symbols and repository-wide references.
4. Trace features and cross-repository flows using registrations, serialized names, configuration, tests, and scripts in addition to direct callers.
5. Mark facts, inferences, unresolved behavior, contradictions, and dead-code candidates explicitly.
6. Keep exact revision and coverage information in [21-analysis-coverage.md](21-analysis-coverage.md) and resumable state in `ANALYSIS_STATE.md`.

## Exclusions

None have been established yet. Any later exclusion will be recorded with an exact reason in the inventory and coverage ledger.

