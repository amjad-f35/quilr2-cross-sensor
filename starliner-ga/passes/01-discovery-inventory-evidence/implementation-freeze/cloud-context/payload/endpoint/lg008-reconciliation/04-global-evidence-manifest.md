# 04 — Global Evidence Manifest

The endpoint manifest contains 1780 evidence items. Every
source-controlled file is content-digested at its exact revision; analysis and
freeze artifacts are content-digested; runtime output is retained under
`lg008-endpoint/runtime/evidence`.

| Evidence type | Count |
| --- | --- |
| CONFIGURATION | 61 |
| DATABASE_ARTIFACT | 26 |
| FIXTURE | 22 |
| GENERATED_INDEX | 173 |
| RUNTIME_STDERR | 1 |
| RUNTIME_STDOUT | 5 |
| SCHEMA | 50 |
| SOURCE_FILE | 1285 |
| SUPPORTING_REPOSITORY | 5 |
| TEST | 152 |

| Repository/bundle | Evidence rows |
| --- | --- |
| DIE implementation-freeze | 74 |
| Endpoint-agent-sensor-analysis | 210 |
| ipc-event-bus | 140 |
| project-starliner | 227 |
| sentinel-dashboard | 252 |
| sentinel-endpoint-agent | 877 |

## Proof semantics

- Source catalog assertions reference the generated source ledger and the
  pinned repository snapshot evidence.
- Runtime claims reference retained output artifacts.
- Proposed adapter/target lineage is `INFERRED`, never `SOURCE_PROVEN`.
- Unavailable runtime claims are represented through validation procedures and
  `NEEDS_LIVE_VALIDATION`.
- Historical endpoint-pinned IPC blobs use content digests retained by Git
  object reference rather than the current working tree.

`Unresolved:` this pass did not capture production logs, network traffic,
database rows, screenshots, customer data or production API responses.
