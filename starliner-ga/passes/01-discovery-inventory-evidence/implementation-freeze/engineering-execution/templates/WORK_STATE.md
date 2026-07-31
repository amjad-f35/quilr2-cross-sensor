# Engineering Work State

Update this file before stopping, after a verified commit, before likely
context compaction and whenever ownership or the next action changes.

## Identity

| Field | Value |
|---|---|
| Work item | `UNASSIGNED` |
| Repository | `UNASSIGNED` |
| Branch | `UNASSIGNED` |
| Protected base | `UNASSIGNED` |
| Developer owner | `UNASSIGNED` |
| Remote validator owner | `UNASSIGNED` |
| Architecture authority commit | `UNASSIGNED` |
| Execution-kit commit | `UNASSIGNED` |
| Code base commit | `UNASSIGNED` |
| Last locally verified commit | `NONE` |
| Last remotely verified commit | `NONE` |
| PR | `NONE` |
| Status | `READY` |
| Updated at | `UNASSIGNED` |

## Objective and acceptance

State the bounded production outcome and link the exact work package,
requirements, gate-test IDs and contracts. Do not restate the entire
architecture.

## Verified completed work

- None.

## Current implementation state

- Changed modules/files:
- Generated artifacts:
- Persistent schema/runtime changes:
- Known failures:

## Verification

| Scope | Exact command | Result | Commit | Evidence |
|---|---|---|---|---|
| focused | `UNASSIGNED` | `NOT_RUN` | `UNASSIGNED` | `UNASSIGNED` |
| affected | `UNASSIGNED` | `NOT_RUN` | `UNASSIGNED` | `UNASSIGNED` |
| remote | `UNASSIGNED` | `NOT_RUN` | `UNASSIGNED` | `UNASSIGNED` |

## Blockers and decisions

- Blocker: none.
- ADR required: no.
- Assumptions requiring validation: none.

## Next exact action

`Select and accept one work item before modifying production code.`

## Recovery checklist

```text
read AGENTS.md
read this file and TOPOLOGY.md
verify authority commits
git status --short --branch
git log --oneline --decorate -10
inspect current PR and latest remote validation
continue Next exact action
```
