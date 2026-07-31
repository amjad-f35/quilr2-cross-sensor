# Branch and PR Baseline

Snapshot time: 2026-07-30, from the authenticated GitHub API and local Git.
Refresh this evidence before any branch deletion or PR closure.

## Repository counts

| Repository | Default | Default SHA at snapshot | Branches | Open PRs |
|---|---|---:|---:|---:|
| `quilrbusiness/project-starliner` | `main` | `b747393468045425b3f07a24775dcbc93d380cb5` | 11 | 0 |
| `quilrbusiness/macrodata-refinement` | `dev_main` | `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d` | 109 | 9 |
| `quilrbusiness/quilr-llm-gateway` | `add_gateway` | `99f759d75aa8260f97db6904433c941647a755e5` | 25 | 5 |

The local Nuxt shell at
`/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt` is on
`main@8c745c88e56cb6fc88a022415a596b5d436a5264` with 117 dirty paths:
96 modified, two deleted and 19 untracked. It must be checkpointed on an
explicit branch and reviewed before DIE UI implementation begins.

## Project Starliner

### Already contained in `main`

The following branches have zero commits ahead of `main`. After confirming no
external release or evidence process requires the ref, they are branch-deletion
candidates:

- `feat/starliner-evidence-ingest-foundation`
- `feat/starliner-evidence-spine`
- `feat/starliner-mcp-contract-envelope`
- `feat/starliner-sdk-foundation-clean`
- `fix/starliner-preprod-deployability`

Their relevant PRs are already merged. Delete the branches; never revert or
reimplement their changes merely to make branch names disappear.

### Unique commits requiring disposition

| Branch | Ahead/behind `main` | Disposition |
|---|---:|---|
| `feat/starliner-runtime-trust-and-reality-gates` | 16 / 14 | Preserve. Inventory its registry/control/reality-gate code and tests against the freeze. Port accepted behavior into new work-item branches; do not merge wholesale. |
| `feat/starliner-sensor-delivery-runtime-identity` | 13 / 14 | Preserve. It overlaps the preceding branch and contains unmerged control/registry/runtime proof. Build one commit-level retain/refactor/reject matrix before cleanup. |
| `feat/starliner-sdk-foundation` | 4 / 21 | Superseded candidate. Old canonical-looking contracts and Feldera POC are not target authority. Retain only separately accepted tests/benchmarks/reference behavior. |
| `dev_main` | 1 / 21 | Superseded candidate containing the original SDK foundation. Verify semantic patch coverage in `main`, then delete. |
| `amjad-f35-patch-1` | 1 / 21 | One obsolete `DELIVERABLES.md` edit. Verify no unique still-valid statement, then delete. |

The central implementation starts from current `main` on a new work-item branch.
Existing Python contracts, delivery and ingest are retained/refactored or moved
to compatibility exactly as `module-disposition.csv` requires.

## LLM Gateway: `macrodata-refinement`

### PR 227 — LLM M1 certified Starliner observe runtime

- URL: https://github.com/quilrbusiness/macrodata-refinement/pull/227
- branch: `feat/starliner-llm-observe-runtime`
- state: open, mergeable, review required, checks green;
- comparison: 2 commits ahead and 128 behind current `dev_main`;
- contract baseline: old `project-starliner@b747393...`;
- content: substantial mapping, SQLite outbox, diagnostics, payload-safety,
  tests, certification and runbooks.

Disposition: **do not merge or rebase wholesale**. It is a valuable prototype
and test/evidence source, but it predates the frozen profiles, receipts,
identity, evidence and generated-contract authority. Create the new LLM adapter
branch from current `dev_main`, inventory every PR 227 file, port accepted
capture/mapping/test behavior behind generated contracts, and link the
successor PR. Then close PR 227 as `superseded` and delete its branch.

### PR 148 — Starliner LLM adapter certification gate

- URL: https://github.com/quilrbusiness/macrodata-refinement/pull/148
- branch: `feat/starliner-llm-adapter`;
- base: `feat/starliner-llm-adapter-review-base`, itself 229 commits behind
  current `dev_main`;
- comparison to current `dev_main`: 11 ahead and 435 behind;
- checks green against the historical stacked base.

Disposition: **supersede after extraction**. Preserve useful negative fixtures,
hook-placement evidence and certification assertions. Do not merge the stacked
base or old canonical contract model. Close PR 148 and delete both old branches
only after the successor work item records every unique commit as ported or
rejected.

The other seven open PRs are unrelated product work. This DIE program neither
closes nor rebases them.

## MCP Gateway: `quilr-llm-gateway`

The following Starliner changes are already in `add_gateway`:

- PR 11, Starliner MCP adapter certification gate;
- PR 15, Starliner MCP observe runtime;
- PR 16, Starliner MCP observe-runtime hardening.

Their feature branches are zero commits ahead of `add_gateway` and are deletion
candidates after ref-dependency confirmation. The code in `add_gateway` is
retained as current source and refactored to the new generated profile,
Starliner WAL/receipt and certification contracts. Do not create a parallel MCP
runtime that double-emits observations.

### PR 10 — Starliner LLM router pre-provider adapter

- URL: https://github.com/quilrbusiness/quilr-llm-gateway/pull/10
- branch: `feat/starliner-llm-adapter`;
- base: `feat/starliner-llm-router-review-base`, 59 commits behind
  `add_gateway`;
- comparison to current `add_gateway`: 2 ahead and 108 behind;
- no current checks.

Disposition: **supersede after extraction**. It is an old LLM-router experiment,
not the accepted MCP adapter. Port any still-needed hook tests deliberately,
link the successor or explicit rejection, close PR 10 and delete both historical
branches.

Other open MCP PRs remain unrelated to this cleanup unless their files overlap
the new adapter. An overlap is resolved in the active PR, not by closing another
engineer's work.

## Required cleanup order

1. Create `BRANCH_PR_REGISTER.csv` rows for every branch above.
2. For every ahead commit, classify `retain`, `port`, `superseded` or `reject`
   with evidence.
3. Create successor PRs from current protected defaults.
4. Link old and successor PRs in both directions.
5. Close superseded PRs with the disposition summary.
6. Delete only zero-ahead or fully dispositioned branches.
7. Refresh branch counts and record the API evidence.

No GitHub refs were modified during this audit.
