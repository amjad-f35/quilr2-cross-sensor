# 12 — Runtime-Evidence Merger

| ID | Experiment | Result | Proof | Limit |
| --- | --- | --- | --- | --- |
| RT-EP-001 | Endpoint sensor dossier validator | PASS | RUNTIME_OBSERVED | No Rust/Go/Windows/macOS Network Extension production runtime executed. |
| RT-EP-002 | Freeze structural cross-reference validator | PASS | RUNTIME_OBSERVED | Static structure only. |
| RT-EP-003 | Freeze schema contract corpus | PASS | RUNTIME_OBSERVED | Dependencies were installed into analysis-local library after the initial missing-dependency failure. |
| RT-EP-004 | Freeze PostgreSQL DDL grammar parse | PASS | RUNTIME_OBSERVED | Grammar parse is not PostgreSQL execution or transaction/RLS conformance. |
| RT-EP-005 | Freeze OpenAPI validation | PASS | RUNTIME_OBSERVED | No deployed API was called. |
| RT-EP-006 | Live storage prerequisite check | FAILED_PREREQUISITE | RUNTIME_OBSERVED | PostgreSQL, ClickHouse, object evidence, replay, RLS and live materializer behavior remain unvalidated. |

All outputs are sanitized and retained under
[`runtime/evidence/`](../../lg008-endpoint/runtime/evidence/). The command,
working directory, OS/architecture, runtime versions, result, failed attempt
and limitation are machine-readable.

The successful experiments prove only the validator behavior they executed.
They do not prove endpoint production capture, macOS signed Network Extension,
Windows WinDivert/SCM behavior, Rust/Go build/runtime, live ingest, storage,
authorization or UI.
