# Branch Hygiene and Change Control

## Branch model

Use protected-trunk development with short-lived work-item branches:

```text
<type>/DIE-<work-id>-<short-purpose>
```

Examples:

```text
feat/DIE-WP03-producer-enrollment
feat/DIE-WP05-llm-normalizer
fix/DIE-LG001-lease-fencing
chore/DIE-HYG01-starliner-branch-disposition
```

One branch may contain many commits and local/remote test cycles. It represents
one reviewable outcome. Cross-repository work uses the same stable work ID in
each repository; it does not share a Git branch.

Long-lived environment branches already used by a legacy repository remain
outside this policy until that repository owner changes them. New DIE work
still branches from the current protected target and returns through a PR.

## Concurrency and ownership

- One writer per branch.
- No pull request unless the user explicitly requests one.
- An agent may own several branches only when they are independent and each has
  durable state.
- A remote validator owns no implementation branch.
- Never have two agents alternately push to the same branch.
- Use separate worktrees for concurrent local work.
- Do not stack on a temporary review-base branch unless the dependency is real,
  accepted and recorded. Prefer a normal PR to the protected base.

Recommended active limits per repository:

- at most one active branch per work item;
- at most three concurrent DIE implementation PRs unless owners and dependency
  order are explicit;
- zero merged branches retained without a release/evidence reason;
- zero stale branches with unknown unique commits.

Repository settings should enable automatic deletion of merged head branches.
The protected default requires PR review, required CI, no force-push and no
direct deletion. A scheduled report refreshes branch head, last activity,
ahead/behind count and associated PR into `BRANCH_PR_REGISTER.csv`; it may
recommend cleanup but never deletes an ahead/unknown branch automatically.

## Commit policy

A commit is a coherent, locally verified unit. It is not necessarily a whole
work item. Commit messages include the stable ID:

```text
DIE-WP05: normalize LLM gateway invocation records
```

Each pushed candidate appends `CHANGE_LEDGER.csv`. Do not push secrets, runtime
credentials, raw customer payloads, local environment files or unreviewed
generated drift.

Rewriting unpublished local commits is allowed. Rewriting a pushed branch is
allowed only for its sole owner and only when the PR and remote validator are
not consuming the old SHA. Never force-push protected or shared branches.

## PR policy

When the user explicitly requests a PR, open it only after the first coherent
verified commit. The PR contains:

- work item and frozen authority commit;
- affected modules/contracts;
- exact local commands and results;
- expected remote suites and environments;
- unsupported/new-capture boundaries;
- schema/migration/compatibility notes;
- security, privacy and tenant effects;
- retained evidence links;
- rollback or compatibility consequences.

Green checks on a stale base do not mean the PR is safe to merge. Review is
against the current protected base and frozen authority.

## Branch and PR disposition

Use only these dispositions:

| Disposition | Meaning | Required proof |
|---|---|---|
| `ACTIVE` | accepted current work | owner, work item, base, PR and recent state |
| `MERGED_DELETE` | content in protected base | zero commits ahead or merged PR plus patch verification |
| `SUPERSEDE` | replaced by accepted successor | successor link and commit-level retain/reject mapping |
| `PORT` | selected work will move | destination work item and exact source commits/files |
| `ARCHIVE_REF` | ref must remain temporarily | explicit release/evidence consumer and expiry |
| `REJECT` | unique work intentionally abandoned | owner/reviewer rationale and no required behavior loss |
| `UNKNOWN` | insufficient evidence | no close or delete permitted |

An old PR is closed only after `SUPERSEDE` or `REJECT` proof. A branch is deleted
only after `MERGED_DELETE`, fully completed `PORT`, expired `ARCHIVE_REF`, or
reviewed `REJECT`.

## Repository cleanup is separate from feature code

Cleanup uses its own work item and PR where repository files change. Branch
deletion and PR closure are recorded in `BRANCH_PR_REGISTER.csv`. Never mix
large historical cleanup with a sensor adapter, schema or customer UI PR.

## Release coordination

Cross-repository compatibility is bound by the signed platform-release manifest
and generated-contract digests, not by matching branch names. The release
candidate records:

- every repository commit;
- role/sensor/UI artifact digest;
- schema, ontology, OpenAPI and profile digests;
- compatibility window;
- local and remote gate evidence.

The remote server deploys this immutable set. `latest`, an unqualified branch
or an SSH-edited checkout is never a release candidate.
