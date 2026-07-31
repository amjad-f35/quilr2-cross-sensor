# Engineering Execution Kit

This directory is the durable implementation operating system for human and
coding-agent work on the bounded Discovery, Inventory/Catalog,
Activity/Observability and Evidence pass.

## Start or resume

Before changing code:

1. Verify the clean checkout, repository, branch, base and current commit.
2. Read repository-root `AGENTS.md`.
3. Read `docs/engineering/WORK_STATE.md` and `TOPOLOGY.md`.
4. Read the referenced work package and exact frozen contracts.
5. Inspect the latest local and remote validation ledger entries for the
   intended commit.
6. Inspect `git status`, the branch diff and its open PR.
7. Continue the recorded next action; do not restart the design from chat
   memory.

If these files are absent, install them from [templates](templates) and
[Cursor assets](cursor) in the first setup commit. Copy each
`*.csv.template` to the corresponding repository `*.csv` path; the template
suffix prevents empty ledger contracts from being mistaken for completed
corpus data.

## Durable files

| Artifact | Purpose | Update rule |
|---|---|---|
| `AGENTS.md` | Always-on authority, safety and development behavior | Change only with reviewed engineering-process change |
| `.cursor/rules/*.mdc` | Cursor project-wide persistent context | Mirror `AGENTS.md`; never create a conflicting rule |
| `.cursor/skills/*/SKILL.md` | Task-specific TDD and remote verification procedures | Invoke when the task matches |
| `WORK_STATE.md` | Exact resumable state for the active work item | Before stopping, after compaction risk, after every verified commit |
| `TOPOLOGY.md` | Code-to-runtime mapping actually implemented | Whenever a module, role, store, contract or deployment mapping changes |
| `CHANGE_LEDGER.csv` | Work item → commit → PR → local/remote proof | Append for every pushed candidate |
| `REMOTE_VALIDATION_LEDGER.csv` | Exact-SHA server deployment and result | Remote agent appends one immutable result per run |
| `BRANCH_PR_REGISTER.csv` | Active and historical branch disposition | On branch/PR creation, base change, merge, close or delete |
| Jira import | Portfolio bootstrap | Import once, then keep stable IDs in commits/PRs |

Do not use an unstructured `TODO.md` as the authoritative backlog. Temporary
notes are acceptable only when every surviving item is moved to a stable work
item or deleted before commit.

## Work-item lifecycle

```text
READY
→ ACTIVE
→ LOCAL_VERIFIED
→ PUSHED
→ REMOTE_VALIDATING
→ REMOTE_VERIFIED
→ REVIEWED
→ MERGED
→ BRANCH_DELETED
```

Failure returns the same item to `ACTIVE` with the failing commit and evidence
recorded. A blocked item remains `BLOCKED` with an exact external condition and
the smallest command or observation that can unblock it.

## Commit and branch unit

One branch represents one coherent work item or vertical increment. It may
contain many verified commits. A new branch is not created for every commit,
test cycle or remote deployment.

Open one draft PR early. Keep it rebased or merged from its protected base
according to repository policy. Delete the branch after merge. At most one
agent writes a branch at a time.

## Local and remote agents

The developer agent owns code changes and the feature branch. The remote Ubuntu
agent fetches and validates exact immutable SHAs. It never edits the deployed
checkout, commits fixes or force-pushes the developer's branch.

The complete protocol is
[two-agent development and remote validation](TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md).

## Index

- [Source, context and repository map](SOURCE_CONTEXT_AND_REPOSITORY_MAP.md)
- [Branch and PR baseline](BRANCH_AND_PR_BASELINE.md)
- [Machine-readable branch/PR baseline](registers/branch-pr-baseline.csv)
- [Branch hygiene and change control](BRANCH_HYGIENE_AND_CHANGE_CONTROL.md)
- [Two-agent development and remote validation](TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md)
- [Coding-agent launch prompt](CODING_AGENT_START_PROMPT.md)
- [Nuxt/shadcn-vue Cursor rule](cursor/rules/20-nuxt-shadcn-ui.mdc)
- [Jira import](jira/die-work-program-import.csv)
- [Execution-kit validator](tools/validate-execution-kit.mjs)
