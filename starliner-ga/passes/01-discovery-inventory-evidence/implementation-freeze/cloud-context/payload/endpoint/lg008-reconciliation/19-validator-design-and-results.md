# 19 — Validator Design and Results

Run from `ENDPOINT-AGENT-ANALYSIS-COMPLETE`:

```bash
./lg008-endpoint/validate-lg008
```

It executes 16 checks:

`ids`, `source-coverage`, `proof-status`, `reachability`, `dispositions`, `producers-consumers`, `fields`, `access-recipes`, `evidence-links`, `schemas`, `lineage`, `observability`, `runtime-evidence`, `freeze-reconciliation`, `ownership`, `closure`.

Reports:

- `lg008-validation.json`
- `lg008-validation.md`
- `lg008-validation.junit.xml`
- `lg008-coverage.json`
- `lg008-closure.json`

Latest completed run: **16/16 validators passed, 0 `ERROR`, 566
`CHANGE_CONTROL_REQUIRED`, `LG008_OPEN`**. The change-control total is 489
non-prohibited source fields without an exact frozen target-field ID plus 77
open contradiction/unresolved closure findings.

`ERROR` exits nonzero. `CHANGE_CONTROL_REQUIRED` blocks closure but is not a
structural machine-artifact error. The closure validator succeeds only when an
open decision correctly records every blocker; it would fail a false
`LG008_CLOSED` state.

See the generated
[`validation report`](../../lg008-endpoint/reports/lg008-validation.md)
after the command runs.
