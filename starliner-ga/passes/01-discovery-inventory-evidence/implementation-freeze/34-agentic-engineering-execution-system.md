# Agentic Engineering Execution System

The bounded architecture is frozen. Long-running implementation still needs a
durable operating system so an engineer or coding agent can resume after
context compaction, machine changes, remote validation and handoffs without
reconstructing state from chat.

The normative execution kit is
[engineering-execution](engineering-execution/README.md). It defines:

- repository-root `AGENTS.md` and Cursor project-rule installation;
- test-driven implementation and exact-SHA remote-validation skills;
- `WORK_STATE.md`, `TOPOLOGY.md` and machine-readable ledgers;
- authority and source-context maps;
- current branch and PR dispositions;
- one-branch-per-work-item hygiene rather than one branch per commit;
- local developer and remote Ubuntu validation-agent ownership;
- commit, PR, deployment, evidence and Jira-import tracking;
- compaction, interruption and handoff recovery;
- validation of the execution kit itself.

## Non-negotiable operating invariant

Chat history, an agent memory, a terminal scrollback, a local uncommitted diff
and a remote deployment are never the durable record of work.

At every resumable boundary, the repository records:

```text
accepted work item
+ exact authority revision
+ branch and base revision
+ last locally verified commit
+ last remotely verified commit
+ test/evidence references
+ current blocker or next exact action
```

The implementation repository remains source of truth for code. The frozen
cross-sensor package remains source of truth for semantics. Jira or the
importable CSV is a portfolio view; it does not override either.

## Installation boundary

The execution kit is copied into each active implementation repository. The
checked-in repository-root files are:

```text
AGENTS.md
.cursor/rules/00-die-authority.mdc
.cursor/rules/10-die-development-loop.mdc
.cursor/skills/test-driven-development/SKILL.md
.cursor/skills/remote-sha-validation/SKILL.md
docs/engineering/WORK_STATE.md
docs/engineering/TOPOLOGY.md
docs/engineering/CHANGE_LEDGER.csv
docs/engineering/REMOTE_VALIDATION_LEDGER.csv
docs/engineering/BRANCH_PR_REGISTER.csv
```

`CLAUDE.md` may contain one line directing compatible tools to `AGENTS.md`; it
must not become a competing instruction set. Legacy `.cursorrules` is not used.

## Scope

This system governs implementation of the complete bounded DIE pass. Migration,
policy, findings/intelligence, deployment-model portfolio and unrelated legacy
cleanup remain outside the pass. Repository hygiene may disposition old work,
but must not silently delete unique commits or turn legacy code into target
authority.
