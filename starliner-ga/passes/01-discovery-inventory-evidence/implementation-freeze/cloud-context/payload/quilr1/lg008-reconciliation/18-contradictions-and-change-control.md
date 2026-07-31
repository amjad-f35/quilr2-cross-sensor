# Contradictions and Change Control

| Severity | Contradiction | Evidence | Effect |
| --- | --- | --- | --- |
| ERROR | Required five source-truth dossiers are absent; architecture profile summaries exist instead. | `profiles/00`, `01`, `02`, `03`, `05` | Stops merger before semantic catalogs. |
| CHANGE_CONTROL_REQUIRED | The declared frozen package is untracked at repository HEAD `513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc`. | Git status plus 74-file digest manifest | Revision cannot reproduce frozen bytes. |
| ERROR | The Starliner corpus validator reports 17 broken local references. | `starliner-ga/tools/validate-corpus.mjs` runtime result | Evidence-link closure fails. |
| ERROR | Frozen live PostgreSQL/ClickHouse conformance is explicitly blocked. | `22-live-storage-conformance.md` and harness | Runtime/storage closure fails. |
| WARNING | Better Console external gates were unavailable. | Better Console coverage report | Supporting platform boundary; not a substitute for sensor proof. |

No source-vs-target semantic contradiction was declared because semantic reconciliation did not begin. Absence of such rows is not proof that the source and target agree.
