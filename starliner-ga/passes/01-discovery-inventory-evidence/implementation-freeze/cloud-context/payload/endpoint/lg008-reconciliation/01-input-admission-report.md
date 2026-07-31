# 01 — Input Admission Report

| Profile | Repositories/revisions | Files accounted | Catalog completeness | Runtime evidence | Admission |
| --- | --- | --- | --- | --- | --- |
| Endpoint Sensor | 3 repositories; 4 relevant revisions | 1,265/1,265 path records | All 30 CSV ledgers, 36 docs, 9 schemas, 18 JSON fixtures | 6 central experiments; production runtime bounded | ACCEPTED_WITH_NONBLOCKING_EXTERNAL_BOUNDARIES |
| Browser Sensor | Not inspected | Not inspected | Not admitted | Not admitted | NOT_ADMITTED_BY_USER_SCOPE |
| Browser Backend | Not inspected | Not inspected | Not admitted | Not admitted | NOT_ADMITTED_BY_USER_SCOPE |
| LLM Gateway | Not inspected | Not inspected | Not admitted | Not admitted | NOT_ADMITTED_BY_USER_SCOPE |
| MCP Gateway | Not inspected | Not inspected | Not admitted | Not admitted | NOT_ADMITTED_BY_USER_SCOPE |

## Endpoint admission evidence

- Repository archaeology: 1,265/1,265 classified paths.
- Specialized endpoint dossier: 36 Markdown documents, 30 CSV files, 9 YAML
  schemas and 18 generated/sanitized JSON fixtures.
- Cross-ledger closure: all 639 native field IDs occur exactly once in native,
  platform-mapping and privacy ledgers; the 799 product disposition rows cover
  all fields/features/events/metrics.
- Stable ID, proof, reachability, disposition, access-recipe and unresolved
  ledgers are generated in the central output.

`Admission qualification:` the profile is accepted as source truth. This is
not a claim that production components are enabled or that the frozen target is
implemented.

`Closure consequence:` global condition 1 (“all five profiles admitted”) fails
by deliberate scope. The endpoint-only pass may be complete while LG-008
remains `LG008_OPEN`.
