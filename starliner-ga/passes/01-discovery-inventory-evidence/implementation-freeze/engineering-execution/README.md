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
   For a source vertical, also read ADR-0022 and implementation-freeze document
   43, then bind the current official installer/deployer and normal product
   lifecycle in `SOURCE_PRODUCT_PATH.yaml`.
5. Inspect the latest product-delivery state, runtime manifest and any
   applicable local or remote evidence for the intended commit.
6. Inspect `git status`, the branch diff and the exact pushed remote SHA.
7. Continue the recorded next product action; do not restart the design from
   chat memory or turn state reconciliation into the session's deliverable.

If these files are absent, install them from [templates](templates) and
[Cursor assets](cursor) in the first setup commit. Ordinary ledger templates
may be copied to the corresponding repository path. Generate
`PRODUCT_DELIVERY_STATE.csv` from the capability map and exact authority commit
instead of copying its header-only template:

```bash
node tools/initialize-product-delivery-state.mjs \
  --authority <40-hex-authority-commit> > docs/engineering/PRODUCT_DELIVERY_STATE.csv
node tools/validate-product-delivery-state.mjs \
  docs/engineering/PRODUCT_DELIVERY_STATE.csv
```

The template suffix prevents empty ledger contracts from being mistaken for
completed corpus data.

Installed-source progress and required-input rows are not accepted by visual
inspection. Validate each populated repository ledger against its retained
evidence root:

```bash
node tools/validate-sensor-vertical-state.mjs \
  docs/engineering/SENSOR_VERTICAL_STATE.csv docs/engineering
node tools/validate-required-inputs.mjs \
  docs/engineering/REQUIRED_INPUTS.csv docs/engineering
node tools/validate-product-delivery-state.mjs \
  docs/engineering/PRODUCT_DELIVERY_STATE.csv \
  registers/product-capability-map.csv \
  docs/engineering/SENSOR_VERTICAL_STATE.csv docs/engineering
node tools/validate-gate-b-certification.mjs \
  docs/engineering/GATE_B_CERTIFICATION.csv docs/engineering \
  registers/gate-b-certification-obligations.csv \
  /path/to/quilr2-cross-sensor "$AUTHORITY_COMMIT"
node tools/validate-cross-source-gate.mjs \
  docs/engineering/CROSS_SOURCE_GATE.csv \
  docs/engineering/SENSOR_VERTICAL_STATE.csv docs/engineering
```

The vertical validator reads each stage proof, verifies its content digest and
predecessor, and binds every stage to one source commit, install artifact,
installed artifact, tenant, producer, installation, source record and coherent
runtime. The required-input validator dereferences evidence for all five
mandatory authority searches and rejects unclassified, overbroad, secret-
bearing or product-bypass rows.

The authority repository and commit are mandatory whenever a Gate-B row uses
`APPROVED_UNSUPPORTED`. The validator loads the bounded-pass decision register
from that exact Git object; a working-tree-only or patterned approval cannot
close an obligation. A release-qualified product validation must additionally
pass `GATE_B_CERTIFICATION.csv`, its generated obligation catalog, the same
authority repository and commit to `validate-product-delivery-state.mjs`.

## Durable files

| Artifact | Purpose | Update rule |
|---|---|---|
| `AGENTS.md` | Always-on authority, safety and development behavior | Change only with reviewed engineering-process change |
| `.cursor/rules/*.mdc` | Cursor project-wide persistent context | Mirror `AGENTS.md`; never create a conflicting rule |
| `.cursor/skills/*/SKILL.md` | Task-specific TDD and remote verification procedures | Invoke when the task matches |
| `WORK_STATE.md` | Exact resumable state for the active work item | Before stopping, after compaction risk, after every verified commit |
| `PROGRAM_STATE.md` | One coherent cross-repository product candidate | After each integrated candidate or component-manifest change |
| `PRODUCT_DELIVERY_STATE.csv` | Independent capability implementation/integration/evidence/release states | After every material capability-stage change |
| `TOPOLOGY.md` | Code-to-runtime mapping actually implemented | Whenever a module, role, store, contract or deployment mapping changes |
| `SOURCE_PRODUCT_PATH.yaml` | Exact normal install/deploy, organization-tenant bootstrap, enrollment, supervisor, capture, WAL, sender and receipt authority for the active source | Before source code changes and whenever an artifact, entrypoint, configuration authority or prerequisite changes |
| `REQUIRED_INPUTS.csv` | Bounded external inputs/actions and exhaustive-search questions under document 43 | When a normal-product prerequisite is unavailable; close only with retained objective evidence |
| `SENSOR_VERTICAL_STATE.csv` | Per-source continuous exact-artifact stage evidence, content digests and honest limitations | After every native-to-UI stage advance or regression; every stage through the claimed high-water must dereference to digest-bound retained evidence and fixtures never advance an installed-product stage |
| `GATE_B_CERTIFICATION.csv` | Generated 47-route plus 262-required-field completeness obligations for all five source profiles | Copy the generated template; each obligation remains pending, becomes evidence-complete, is approved unsupported under focused change control, or retains one bounded external blocker; a profile is complete only when no pending/blocked row remains |
| `CROSS_SOURCE_GATE.csv` | Immediate Endpoint+Browser positive relationship and unresolved-negative proof | Prove after PI002 and PI003A, before postponing graph value behind the other three Gate-A integrations |
| `RUNTIME_MANIFEST.yaml` | Exact components, stores, identities and endpoints in one coherent runtime | Before any integrated-product claim; validate and bind its SHA-256 digest from capability state |
| `CHANGE_LEDGER.csv` | Work item → commit → PR → local/remote proof | Append for every pushed candidate |
| `REMOTE_VALIDATION_LEDGER.csv` | Exact-SHA server deployment and result | Remote agent appends one immutable result per run |
| `BRANCH_PR_REGISTER.csv` | Active and historical branch disposition | On branch/PR creation, base change, merge, close or delete |
| Jira import | Portfolio bootstrap | Import once, then keep stable IDs in commits/PRs |

Do not use an unstructured `TODO.md` as the authoritative backlog. Temporary
notes are acceptable only when every surviving item is moved to a stable work
item or deleted before commit.

## Independent lifecycles

```text
implementation: NOT_STARTED → ACTIVE → IMPLEMENTED
integration:    NOT_CONNECTED → PARTIAL_PATH → E2E_DEV → E2E_EXACT_SHA
evidence:       NOT_RUN → TEST_VERIFIED → RUNTIME_OBSERVED_DEV
                → EXACT_SHA_LOCAL → EXACT_SHA_ISOLATED → RELEASE_BOUND
release:        NOT_ELIGIBLE → INTERNAL_ONLY → CANDIDATE → RELEASABLE
```

Failure keeps or returns implementation to `ACTIVE` with the failing commit and
next correction recorded. It does not erase already proven lower stages.
`development_blocked` is valid only for the blocker classes in document 41 and
only for the affected lane. Missing code, failed tests, open LGs, missing
remote evidence and unfinished harnesses are active work, not blockers.

Implementation-slice completion means production code, focused/affected tests,
a pushed exact SHA and durable state. Release qualification is separate. A PR,
review, merge or remote validator is not required to continue building.

The first release is all five profiles, but source integration is vertical:
real control/enrollment, Endpoint, Browser Extension plus native host as one
Browser stream, the immediate supported Endpoint+Browser relationship plus
unresolved-negative proof, then Browser Backend as a separate server-owned
producer, LLM and MCP while Gate-B breadth closes in parallel. If a normal
install/deploy prerequisite is missing,
use document 43's disposition and ask for the exact bounded input/action. Never
substitute fixed identities, preview persona/credentials, manual service or
storage mutation, an alternate daemon, fake provenance or a fixture interior.

## Commit and branch unit

One branch represents one coherent work item or vertical increment. It may
contain many verified commits. A new branch is not created for every commit,
test cycle or remote deployment.

Push the work-item branch after each coherent verified commit so the remote
agent can test its exact SHA. Do not open a pull request unless the user
explicitly requests one. Keep the branch current with its designated base and
delete it only after its accepted commits are integrated. At most one agent
writes a branch at a time.

## Local and remote agents

The developer agent owns code changes and the feature branch. When an isolated
remote environment exists, a validation agent fetches and validates exact
immutable SHAs. It never edits the deployed checkout, commits fixes or force-
pushes the developer's branch. Unavailable remote infrastructure is release-
evidence work and never stops local product construction.

`RUNTIME_MANIFEST.yaml` is strict YAML parsed through the pinned duplicate-key-
rejecting helper so semantic validation remains dependency-stable. Run
`node tools/validate-runtime-manifest.mjs docs/engineering/RUNTIME_MANIFEST.yaml`
before referencing it from capability state. A non-`NONE` runtime with empty,
dirty, mixed, manually mutated or digest-unbound components is invalid.

Every active manifest also binds the exact release-managed source-profile
registry snapshot used by its producers. The registry digest is SHA-256 over
compact JSON containing entries sorted by `(profile, profile_version)`, with
each entry serialized as `profile`, `profile_version`, `component_role`, then
`schema_digest`. The five launch profiles bind to like-named component roles.
Future registered profiles remain structurally supported, but may bind only to
`connector_runner`, `connector_webhook`, `connector_poller` or `connector_cdc`;
an unregistered profile, wrong role or mismatched component artifact fails
closed.

The complete protocol is
[two-agent development and remote validation](TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md).

## Index

- [Source, context and repository map](SOURCE_CONTEXT_AND_REPOSITORY_MAP.md)
- [Portable cloud-agent source context](../cloud-context/README.md)
- [Branch and PR baseline](BRANCH_AND_PR_BASELINE.md)
- [Machine-readable branch/PR baseline](registers/branch-pr-baseline.csv)
- [Branch hygiene and change control](BRANCH_HYGIENE_AND_CHANGE_CONTROL.md)
- [Two-agent development and remote validation](TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md)
- [Coding-agent launch prompt](CODING_AGENT_START_PROMPT.md)
- [Product-first delivery authority](../41-product-first-continuous-delivery-authority.md)
- [Installed-product lifecycle and source verticals](../43-installed-product-lifecycle-and-source-verticals.md)
- [Product capability map](registers/product-capability-map.csv)
- [Nuxt/shadcn-vue Cursor rule](cursor/rules/20-nuxt-shadcn-ui.mdc)
- [Jira import](jira/die-work-program-import.csv)
- [Execution-kit validator](tools/validate-execution-kit.mjs)
