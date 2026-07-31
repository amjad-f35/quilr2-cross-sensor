---
name: test-driven-development
description: Use for every DIE feature, defect, refactor, migration, adapter, contract, authorization, persistence, API or UI behavior change.
---

# Test-Driven Development

1. Read `AGENTS.md`, the active `WORK_STATE.md`, the governing frozen contract
   and the work-item acceptance criteria.
2. Identify the nearest observable behavior and the cheapest test level that
   can falsify it. Prefer contract or domain tests over implementation-detail
   mocks.
3. Add or select a test that fails for the intended reason. For a defect,
   preserve the exact reproduction. For generated contracts or database
   migrations, write the contract/conformance assertion before generation or
   DDL changes.
4. Implement the smallest production behavior that makes the focused test pass
   without bypassing authority, provenance, tenant, privacy, replay or failure
   invariants.
5. Run the focused test, then affected unit, contract, property, integration,
   security, architecture and generated-drift checks.
6. Inspect negative cases: malformed, absent, duplicate, reordered, replayed,
   unauthorized, cross-tenant, stale, partial-failure and unsupported inputs.
7. Do not update a golden or snapshot merely because output changed. Explain
   and review the semantic difference first.
8. Record exact commands and results in `WORK_STATE.md`; append the candidate
   commit to `CHANGE_LEDGER.csv`.
9. Commit only a coherent, reviewed and locally verified unit.

If the required behavior cannot be expressed without changing a frozen
semantic contract, stop and open an ADR. Do not encode the change indirectly
in an adapter, projection or UI.
