# Quilr 2 DIE Engineering Instructions

## Mission

Implement the complete bounded Discovery, Inventory/Catalog,
Activity/Observability and Evidence pass from the frozen authority. Build
production software, not a demonstration, mock platform or parallel truth
system.

## Authority

Record the exact installed architecture-authority and execution-kit commits in
`docs/engineering/WORK_STATE.md`. When sources disagree, use:

1. JSON Schema, OpenAPI, SQL/DDL and authorization policy;
2. ontology and exact source normalization/relationship rules;
3. decision and defect registers;
4. implementation-freeze architecture;
5. source analyses as evidence context;
6. existing code.

Existing code, old PRs, comments and names do not override frozen contracts.
Never fabricate a sensor field, relationship, identity binding or coverage
claim. `new_capture_required`, `optional_unsourced`, `unsupported` and
`unknown` remain explicit until implementation and certification prove
otherwise.

Migration, policy, findings/intelligence, cost/value and deployment-model
portfolio are outside this pass.

## Resume protocol

At the beginning of every session, after compaction and before modifying code:

1. Read this file.
2. Read `docs/engineering/WORK_STATE.md` and `TOPOLOGY.md`.
3. Read the active work package, contract and acceptance tests.
4. Inspect `git status --short --branch`, recent commits and the branch diff.
5. Inspect the active PR and last exact-SHA remote result.
6. Continue the recorded next action.

Do not infer progress from chat history. If durable state and Git disagree,
stop, reconcile them and record the correction.

## Development loop

Use the repository's test-driven-development skill for features, defects,
refactors, migrations and contract work:

1. Establish the contract and failing test or executable reproduction.
2. Implement the smallest production behavior that satisfies it.
3. Run focused tests.
4. Run affected contract, integration, security and architecture tests.
5. Review the diff for authority, privacy, tenant and failure-path regressions.
6. Update state, topology and ledgers.
7. Commit the coherent verified unit.

Generated outputs are regenerated from authority and committed; never edit them
by hand. Do not weaken or delete a test to make a candidate pass.

## State and commits

One branch is one work item or coherent vertical increment, not one commit.
Open one draft PR early. Commit after each verified coherent unit on the same
branch. Use stable work IDs in branch names, commits, PRs and ledgers.

Before yielding or when context may compact, update `WORK_STATE.md` with:

- repository, branch, base and work item;
- exact authority and code commits;
- what is verified and with which commands;
- changed files and unresolved failures;
- current blocker, if any;
- next exact action.

Never leave the only copy of work in an uncommitted remote checkout.

## Two-agent ownership

The developer agent is the only writer to the implementation branch. The
remote validation agent fetches an exact pushed SHA, deploys that SHA or its
digest-bound artifact into an isolated Ubuntu environment, runs the required
suite and records immutable evidence. It does not edit code or push fixes.

A remote pass applies only to the recorded SHA, artifact digest, configuration
digest and environment. A newer commit is unverified until tested again.

## Git and PR hygiene

- Branch from the current protected target unless the branch register says
  otherwise.
- Do not build new work on historical review-base branches.
- Do not merge an old PR wholesale because its checks are green.
- Do not close or delete a branch with unique commits until every commit is
  classified as retained, ported, superseded or intentionally rejected.
- Delete merged branches after retained evidence and release references no
  longer depend on the ref.
- Never force-push a shared branch without explicit ownership and recovery
  confirmation.
- Never mix unrelated sensor, platform or UI changes in one PR.

## Change control

Raise a focused ADR and stop semantic implementation if work would change:

- authority or source-of-truth boundaries;
- identity, merge/split or relationship semantics;
- evidence, privacy, retention or provenance meaning;
- transaction, ordering, replay or idempotency invariants;
- authorization outcome, RLS, field masking or tenant isolation;
- API or generated-client semantics;
- projection authority or activation rules;
- a sensor capture claim or certified support boundary.

Private code organization, tested libraries behind frozen interfaces, bounded
batch/concurrency tuning and equivalent query plans remain implementation
choices.

## Completion

An item is complete only when its acceptance criteria pass, code and generated
artifacts are committed, local evidence is recorded, required remote exact-SHA
validation passes, the PR is reviewed and durable state identifies the next
item. Report uncertainty directly; never claim a runtime or sensor behavior
that was not executed or source-proven.
