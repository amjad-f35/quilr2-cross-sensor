# Quilr 2 DIE Engineering Instructions

## Mission

Implement the complete bounded Discovery, Inventory/Catalog,
Activity/Observability and Evidence pass from the frozen authority. Build
production software, not a demonstration, mock platform or parallel truth
system.

Document 41 governs execution: work packages are concurrent capability lanes,
LG gates are release-acceptance evidence, and the real product advances through
coherent native-to-UI increments. Never stop independent coding because an LG
is open or a remote validator is unavailable.

Document 43 and ADR-0022 govern normal installed/deployed product integration.
The first customer release remains all five profiles, but the primary
integration lane takes one real Gate-A trace through the permanent funnel at a
time: control/enrollment, Endpoint, Browser installed sensor and the first
cross-source graph proof, then Browser Backend, LLM and MCP. Gate-B breadth
closes concurrently after that proof.

For each source, Gate A proves one continuous native-to-UI trace and Gate B
completes every supported route plus replay, restart, offline, gap, health and
reconciliation behavior. After Endpoint Gate A, Browser Gate A and the first
real cross-source graph plus unresolved-negative proof come next; do not
postpone them behind Endpoint long-tail breadth. The remaining Gate-A
verticals follow while Gate B closes in parallel for all profiles. Independent
common-module work may continue in parallel.

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
`unknown` remain explicit until implementation supplies the fact and release
qualification supports the external claim.

Migration, policy, findings/intelligence, cost/value and deployment-model
portfolio are outside this pass.

## Product path versus harness

Fixed tenant/producer IDs, shared HS256 preview secrets, persona shims,
unsigned manifests, manual SQL control transitions, fake provenance, dirty
hotfix binaries and fixtures replacing Quilr-owned internal stages are
diagnostic only. They cannot count as integrated product behavior or satisfy a
WP outcome. Stubs are allowed only at genuine external provider boundaries.

An integrated claim requires one exact `RUNTIME_MANIFEST.yaml`; never combine
results from overlapping preview stacks or different component revisions.

Browser Extension and its native messaging host are components of one logical
Browser installation. The Extension alone owns its producer epoch/sequence,
durable WAL and delivery stream; the native host is supporting capture only.
They retain distinct component/artifact lineage. Browser Backend is a separate
hosted producer for server-owned facts and never double-counts relayed Browser
activity.

## Required inputs: search, ask, never bypass

Before modifying a sensor/gateway integration, read document 43 and bind the
official installer/deployer, existing organization tenant Discovery/bootstrap,
persona/device/workload bootstrap prerequisite, enrollment, secure credential
store, supervisor/entrypoint, native capture, WAL, sender and receipt owner in
`SOURCE_PRODUCT_PATH.yaml`.

For Browser or Endpoint, begin with the pinned `quilrai/installdocs` revision
and `https://installdocs.quilrai.dev/llms.txt`, follow every applicable linked
installation page, then reconcile it with the current installer/package-builder
and product source named in `SOURCE_CONTEXT_AND_REPOSITORY_MAP.md`. Do not
invent an install command, tenant/persona input or service topology from memory.

Do not treat a path string as evidence. Bind every required file through the
source path's `evidence_bindings` with its safe relative ref, exact SHA-256 and
closed evidence kind. `COHERENT_E2E` requires all bindings to resolve beneath
the runtime evidence root with no traversal, symlink escape or digest drift.

Classify every prerequisite as `FOUND`, `MISSING_PRODUCT_CODE`,
`EXTERNAL_CREDENTIAL`, `EXTERNAL_INFRASTRUCTURE`, `PRIVILEGED_USER_ACTION`,
`DESTRUCTIVE_APPROVAL`, `CONTRACT_CONTRADICTION` or
`UNKNOWN_AFTER_EXHAUSTIVE_SEARCH`. `DESTRUCTIVE_APPROVAL` is only for one exact
delete, erase, reset, uninstall, reimage, destroy, truncate, revoke or overwrite
operation and records recovery or irreversibility. Implement missing
owned code. For an external input/action, record the exact blocked action,
proof it is unavailable and objective success condition, ask the user one
bounded question, pause only that action and continue independent work.

Never replace the normal product path with a fixed tenant/producer ID, second
tenant, persona shim, hand-minted/shared token, unsigned manifest, manual
browser storage/DevTools injection, manual plist/environment/SQL mutation,
alternate daemon, fake artifact digest or fixture interior. An authorized
diagnostic harness remains `UNIT_HARNESS` or `DEV_PREVIEW` and cannot advance
installed-product integration.

Record installed/deployed source progress in `SENSOR_VERTICAL_STATE.csv`.
Every stage through `highest_integrated_stage` must reference a retained file
and exact SHA-256; every later stage must remain `NONE`. Never skip a prior
stage, combine evidence from different candidates, or advance the ledger from
a prose report, unit harness, preview fixture or manual bypass.

Copy the generated `GATE_B_CERTIFICATION.csv` template and close every route
and required-field obligation with exact retained evidence or focused approved
unsupported change control; an external blocker remains honest but keeps the
profile gate open. After Endpoint and Browser Gate A, record the positive
relationship and unresolved-negative proof in `CROSS_SOURCE_GATE.csv`. Product
capabilities PC-002..PC-006 may never claim a stage beyond the corresponding
validated sensor vertical.

## Customer UI

When this repository is `quilr-platform-nuxt`, also read the installed
Nuxt/shadcn-vue UI constitution and UI Cursor rule. Continue the existing shell
with native Vue SFCs, Nuxt pages/layouts/composables and the checked-in
shadcn-vue/Reka primitives in `app/components/ui`.

Product components compose those primitives. Do not create a second generic
wrapper design system, clone existing Button/Dialog/Table/etc., add another
component framework or embed a separate dashboard. Tailwind remains the
shadcn-vue styling engine; put shared visual policy into semantic CSS
variables, owned primitives and typed CVA variants instead of repeated
arbitrary page classes.

UI remote data flows only through typed query composables, `DieRepository` and
the generated `/die/v1` client. UI code never joins sensors or invents
canonical identity, relationships, authorization, coverage or evidence.

## Resume protocol

At the beginning of every session, after compaction and before modifying code:

1. Read this file.
2. Read `docs/engineering/WORK_STATE.md` and `TOPOLOGY.md`.
3. Read the active work package, contract and acceptance tests.
   For a source vertical, also read ADR-0022, document 43 and the exact current
   installation/deployment authority before touching code.
4. Inspect `git status --short --branch`, recent commits and the branch diff.
5. Inspect central program/capability state and the current runtime manifest;
   inspect a PR or remote result only when one exists and is relevant.
6. Continue the recorded next product action.

Do not infer progress from chat history. If durable state and Git disagree,
reconcile them promptly, record the correction and continue product work.

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

Every session that can change product code must advance production behavior,
correct a proven defect or produce required executable evidence. Governance
updates alone are not a product increment.

Generated outputs are regenerated from authority and committed; never edit them
by hand. Do not weaken or delete a test to make a candidate pass.

## State and commits

One branch is one work item or coherent vertical increment, not one commit.
Push after each verified coherent unit on the same branch. Do not open a pull
request unless the user explicitly requests one. Use stable work IDs in branch
names, commits and ledgers.

Before yielding or when context may compact, update `WORK_STATE.md` with:

- repository, branch, base and work item;
- exact authority and code commits;
- what is verified and with which commands;
- changed files and unresolved failures;
- current blocker, if any;
- next exact action.

Never leave the only copy of work in an uncommitted remote checkout.

## Optional exact-SHA validation lane

The developer agent is the only writer to the implementation branch. When a
qualified isolated environment is available, the remote validation agent
fetches an exact pushed SHA, deploys that SHA or its digest-bound artifact,
runs the required suite and records immutable evidence. It does not edit code
or push fixes.

A remote pass applies only to the recorded SHA, artifact digest, configuration
digest and environment. A newer commit is unverified until tested again.
Remote evidence is required for release rows that name it, not for continued
implementation or local integration.

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

Raise a focused ADR and pause only the affected semantic lane if executable
evidence proves that implementation must change:

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

## Blocker rule

Only `CONTRACT_CONTRADICTION`, `EXTERNAL_CREDENTIAL`,
`EXTERNAL_INFRASTRUCTURE`, `PRIVILEGED_USER_ACTION` or
`DESTRUCTIVE_APPROVAL` may set `development_blocked=true`. Code that is not yet
written, a failing test, an open LG, missing qualification evidence or an
unfinished harness is the next active action. Continue every independent
lane.

A blocked row is invalid unless it records the exact blocked action, retained
evidence, owner, objective unblock condition, RFC3339 recheck time and an
independent next action. External credentials or infrastructure block only the
specific external execution, never production-code implementation, a true
third-party-boundary stub, harness construction or unrelated product work.

## Completion

An implementation slice is complete when production code and generated
artifacts are committed and pushed, focused and affected tests pass, and
durable state identifies the next product action. Integration and release
qualification remain separate states; exact-SHA remote evidence is required
only where the release catalog demands it. A PR is optional and opened only on
explicit request. Report uncertainty directly; never claim a runtime or sensor
behavior that was not executed or source-proven.
