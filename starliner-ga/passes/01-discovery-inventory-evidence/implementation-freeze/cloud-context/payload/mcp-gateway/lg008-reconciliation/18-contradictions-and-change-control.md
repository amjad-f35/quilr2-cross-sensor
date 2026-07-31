# Contradictions and change control

## Open register

| Contradiction | Severity | Consequence | Resolution owner | Change control |
| --- | --- | --- | --- | --- |
| Producer-created canonical entity | `BLOCKER` | bypasses central identity authority and can create false joins | unassigned MCP remediation owner | proposed |
| Required server product identity | `BLOCKER` | adapter must fabricate identity or reject valid custom deployments | unassigned target/MCP owners | proposed |
| Direct exception observation gap | `MAJOR` | failed calls disappear from complete activity claims | unassigned MCP remediation owner | proposed |
| Surface coverage overclaim | `MAJOR` | missing OneMCP/native/workflow events can look like absence | unassigned MCP remediation owner | proposed |
| Current outbox versus frozen WAL | `MAJOR` | successful HTTP delivery is not frozen durable acceptance | unassigned adapter/Starliner owners | proposed |
| Runtime evidence not retained | `MAJOR` | two runtime claims cannot satisfy evidence validator | analysis/remediation owner unassigned | proposed |

All six are closure-blocking in this contribution.

## Evidence handling

Each contradiction includes:

- stable defect ID;
- both assertions;
- source and target evidence IDs;
- proof/reachability states;
- affected profile and target contract;
- customer and engineering consequences;
- required owner;
- change-request ID;
- closure impact.

## Change-request state

Six change requests exist as `PROPOSED_NOT_ACCEPTED`. No accepted resolution is
recorded. LG-008 requirement remains open rather than being silently rewritten.

Machine outputs:

- [contradictions](../../lg008/reconciliation/contradictions.csv)
- [change requests](../../lg008/change-control/change-requests.yaml)
- [defect proposals](../../lg008/change-control/defect-proposals.yaml)
- [requirement status](../../lg008/change-control/requirement-reopen-proposals.yaml)
