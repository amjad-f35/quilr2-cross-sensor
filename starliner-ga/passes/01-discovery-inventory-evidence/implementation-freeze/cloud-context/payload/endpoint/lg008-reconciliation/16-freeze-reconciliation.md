# 16 — Freeze Reconciliation

All 74 files are present in the authority manifest.

| Artifact reconciliation status | Files |
| --- | --- |
| NEEDS_LIVE_VALIDATION | 7 |
| NOT_APPLICABLE_WITH_REASON | 4 |
| PARTIALLY_CONFIRMED | 63 |

Static validators prove internal structure, schema corpus behavior, DDL grammar
parse and OpenAPI syntax/reference consistency. They do not accept the freeze,
prove live databases, prove endpoint adapter output, or prove target UI/API
implementation.

The current Starliner producer-canonical `SourceObservation` is treated as
legacy/superseded where it conflicts with the freeze. That is a verified
target-authority statement and an implementation contradiction, not a silent
source edit.

Every change is proposed under change control. The 74 frozen source files were
not modified by this pass.
