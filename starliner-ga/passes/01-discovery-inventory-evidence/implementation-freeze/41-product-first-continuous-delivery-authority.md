# Product-First Continuous Delivery Authority

**Status:** FROZEN EXECUTION AUTHORITY; 2026-08-04

**Effect:** this document changes implementation scheduling and progress
language only. It does not change any protocol, schema, data authority,
identity, relationship, activity, authorization, API, UI or storage semantic
frozen by documents 01 through 40.

[Document 43](43-installed-product-lifecycle-and-source-verticals.md) and
[ADR-0022](../../../adrs/0022-installed-product-vertical-delivery.md) extend
this scheduling authority with the normal installed/deployed product lifecycle,
mandatory required-input/no-bypass protocol and one-source-at-a-time primary
integration order. The all-five-profile release scope below remains unchanged.

## Why this amendment exists

Earlier execution language allowed a release-evidence gate, unavailable remote
validator or green component branch to be mistaken for a development stop line
or for an integrated product. That behavior is prohibited.

The program builds the real bounded DIE product continuously. `WP-*` identifies
capability ownership. `LG-*` defines evidence that a candidate must retain
before a corresponding production claim or release. Neither is a sequential
permission system.

```text
Open or failed LG gate       -> active implementation/qualification work
Missing product code        -> active implementation work
Failed product test         -> active defect work
Unavailable external input  -> blocks only the affected lane
Proven contract contradiction -> focused ADR and affected-lane pause
```

No open LG gate blocks writing, integrating or testing production code.

## Unchanged product end state

```text
Browser / Browser Backend / Endpoint / LLM Gateway / MCP Gateway
  -> typed source adapters
  -> privacy disposition + durable Starliner edge WAL
  -> authenticated delivery + exact receipts
  -> immutable evidence and provenance
  -> deterministic one-or-many normalization
  -> source objects, claims and typed candidates
  -> continuous type-specific identity resolution
  -> canonical entity, relationship, activity and coverage ledgers
  -> transactional canonical-change outbox
  -> generation-bound PostgreSQL product read models
     + ClickHouse activity/evidence projections
  -> RBAC/ABAC/ReBAC planning before query planning + RLS + field masking
  -> die-v1 API + generated TypeScript client
  -> server-private BFF + native Nuxt/Vue/shadcn-vue customer UI
```

All five launch producers remain required and Browser Backend remains a
separate producer profile. The source registry remains extensible for future
connectors. Sensors preserve source-native identity and never assign canonical
identity. Evidence precedes derived truth. Unknown and unresolved states remain
explicit. Observed use never becomes configured access, entitlement or product
authorization. A projector never becomes authority and the UI never joins
sensors.

The minimum DIE control plane is part of this product: tenant bootstrap,
producer and installation enrollment, workload identity, certification,
capability history, expected populations, signed configuration, rotation,
revocation and health. Broader enterprise IAM administration and the other
future platform domains remain outside this pass.

## Independent state axes

One overloaded `done`, `blocked` or `green` status is invalid. Every active
product capability records these independent axes:

| Axis | Allowed states | Meaning |
|---|---|---|
| implementation | `NOT_STARTED`, `ACTIVE`, `IMPLEMENTED`, `SUPERSEDED` | whether production-path code exists |
| integration | `NOT_CONNECTED`, `PARTIAL_PATH`, `E2E_DEV`, `E2E_EXACT_SHA` | highest coherent product path reached |
| evidence | `NOT_RUN`, `TEST_VERIFIED`, `RUNTIME_OBSERVED_DEV`, `EXACT_SHA_LOCAL`, `EXACT_SHA_ISOLATED`, `RELEASE_BOUND` | strength and binding of retained proof |
| release | `NOT_ELIGIBLE`, `INTERNAL_ONLY`, `CANDIDATE`, `RELEASABLE` | allowed external release claim |
| runtime mode | `NONE`, `UNIT_HARNESS`, `DEV_PREVIEW`, `COHERENT_LOCAL_PRODUCT`, `ISOLATED_INTEGRATION`, `RELEASE_CANDIDATE` | topology that produced the result |

`IMPLEMENTED` does not imply integrated. `E2E_DEV` does not imply
release-qualified. A release gate may prevent `RELEASABLE`; it may not prevent
continued implementation.

The highest proven stage is one of:

```text
NONE
NATIVE_CAPTURE
LOCAL_WAL
INGEST_RECEIPT
IMMUTABLE_EVIDENCE
NORMALIZED
CANONICAL_ENTITY
CANONICAL_GRAPH_ACTIVITY
PROJECTED
AUTHORIZED_API
LIVE_UI
REBUILD_REPLAY
RELEASE_QUALIFIED
```

Progress reports name the stage, exact component revisions, runtime mode and
unsupported remainder. Test counts and branch names are not product progress.

## Product increments

Implementation proceeds through coherent vertical outcomes. These increments
span work packages and may run in parallel when their hard code dependencies
exist. They expand the product; they never narrow the frozen source or API
surface.

| Increment | Required product outcome |
|---|---|
| `PI-001` | A real administrator bootstraps a tenant, enrolls/revokes producers and installations, distributes verified configuration and sees source health without fixed UUIDs, persona shims or manual SQL. |
| `PI-002` | Endpoint native discovery survives WAL/delivery and becomes canonical devices, applications, agents, supported relationships, evidence, authorized APIs and live UI. |
| `PI-003A` | The normally installed Browser Extension owns the one logical Browser producer, epoch, sequence, durable WAL and delivery stream; its native host is supporting capture only with separate component/artifact lineage. Together their source facts become canonical surfaces, installations, accounts and activity; Browser-to-device binding is materialized only with frozen proof and otherwise remains visibly unresolved. |
| `PI-003B` | Browser Backend runs as a separate hosted producer and contributes only server-owned catalog, configuration, receipt/processing, heartbeat, publication/gap and administrative outcome facts; relayed Browser records preserve original lineage and are never double counted. |
| `PI-004A` | Real LLM Gateway traffic becomes canonical gateway/model/activity/evidence state and connected UI, including replay, failure and unsupported-path truth. |
| `PI-004B` | Real MCP Gateway traffic becomes canonical server/tool/resource/prompt/activity/evidence state and connected UI, including authorization-context scope, replay, failure and unsupported-path truth. |
| `PI-005` | Cross-source resolution, relationship succession, ambiguity, conflicts, retractions, coverage and provenance operate continuously across all five profiles. |
| `PI-006` | All frozen API/UI surfaces operate through authorization-before-query-planning, RBAC/ABAC/ReBAC, RLS, field masking, existence hiding and generated clients. |
| `PI-007` | Generation build/activate/rollback/rebuild, retention/erasure, backup/restore, load, failure recovery, observability and runbooks operate on the coherent candidate. |

Each increment must use the production modules. A smaller fixture may prove a
boundary, but cannot replace any interior stage in the product outcome.

## Hard dependency versus release gate

A hard code dependency is an interface or persisted contract needed to execute
the next code path. Examples include an ingest contract before a native sender,
or canonical outbox pointers before a projector.

The dependency is satisfied when the frozen interface, schema or persisted
contract exists. Its future implementation work package does not become a
blanket scheduling gate: independent implementations may proceed in parallel
behind that contract and meet through contract and product-increment tests.

A release gate is proof required before an external claim. `LG-005` therefore
does not prevent implementing all five adapters; it prevents advertising or
shipping an unqualified profile. `LG-002` does not prevent building a
ClickHouse projector; it prevents accepting its production behavior until the
required server-mode evidence passes.

Schedules, Jira imports and work ledgers must keep `hard_code_dependencies` and
`release_gates` in separate fields. A release-gate ID in a hard dependency
field is a validation failure.

## Product runtime law

An integrated result binds one coherent runtime manifest containing:

- exact authority revision;
- every component repository, branch, commit and artifact digest;
- generated contract and migration digests;
- the exact release-managed source-profile registry reference, registry digest
  and accepted profile-version entries used by attached producers;
- tenant/control authority and configuration digest;
- PostgreSQL, object-store and ClickHouse endpoints/versions;
- role processes/images and credentials class;
- source producer/install/certification identities;
- UI/BFF/API endpoints; and
- start time, environment identity and evidence location.

Only one manifest may be named the current product candidate. Mixed dirty
binaries, overlapping preview stacks, manual database activation, untracked
hotfix daemons and components from different manifests do not constitute an
integrated product.

## Harness and workaround boundary

Test harnesses are valuable and retained. They are not product components.
The following may exist only behind explicit `UNIT_HARNESS` or `DEV_PREVIEW`
guards and must be unreachable from production artifacts:

- fixed tenant, producer, installation or certification UUIDs;
- synthetic shared HS256 credentials;
- persona/subscriber shims or Quilr 1 authentication as Quilr 2 enrollment;
- unsigned manifests;
- manual SQL that substitutes for bootstrap, identity, projection activation
  or maintenance roles;
- fake artifact digests or source revisions;
- dirty or locally patched runtime binaries;
- in-memory replacements for durable work, WAL, evidence or truth; and
- fixture-only interior stages presented as native-to-UI behavior.

Such a mechanism may increase test evidence for the boundary it exercises. It
cannot advance integration beyond `PARTIAL_PATH`, runtime mode beyond
`DEV_PREVIEW`, or release state beyond `INTERNAL_ONLY`. The production-path
feature remains open until the real component replaces it.

## Development blockers

`development_blocked=true` is valid only for the affected lane and only with
one of these classes:

- `CONTRACT_CONTRADICTION`;
- `EXTERNAL_CREDENTIAL`;
- `EXTERNAL_INFRASTRUCTURE`;
- `PRIVILEGED_USER_ACTION`; or
- `DESTRUCTIVE_APPROVAL`.

Missing code, failed tests, an open LG, unavailable remote validation, a missing
harness, an unimplemented API or a discovered defect are not blockers. They
are the next product action. When one lane has a valid external blocker, agents
continue all independent product work.

Every blocked capability records the exact blocked action, retained evidence,
owner, objective unblock condition, recheck time and an independent next
action. `EXTERNAL_CREDENTIAL` and `EXTERNAL_INFRASTRUCTURE` block only the
specific external execution that needs them. They never block production-code
implementation, deterministic stubs at true third-party boundaries, harness
construction or another independent product lane. A
`CONTRACT_CONTRADICTION` additionally cites the conflicting authority
references, a reproducible counterexample and the focused ADR/change-control
record; an assertion of ambiguity is insufficient.

## Required input and installed-product boundary

Before changing a sensor or gateway integration, the agent follows document
43's `SOURCE_PRODUCT_PATH.yaml` and searches the official installer/deployer,
current product source/configuration and safe runtime evidence for the normal
tenant/bootstrap, enrollment, credential, supervisor, capture, WAL, sender and
receipt path. Every prerequisite receives the document 43 disposition.

Missing owned product code is implemented. A genuinely unavailable credential,
infrastructure resource or privileged user action is requested with the exact
blocked action and objective success condition, and blocks only that action.
`UNKNOWN_AFTER_EXHAUSTIVE_SEARCH` requires the searched sources and one concrete
question before changing the path. None permits a fixed identity, second
tenant, persona shim, hand-minted token, manual service/storage/SQL mutation,
alternate daemon, fake provenance or fixture interior to become product code
or integration evidence.

## Program state and branch state

Per-repository `WORK_STATE.md` records one writer's exact branch and next
action. The central `PROGRAM_STATE.md` records the single integrated candidate
across repositories. `PRODUCT_DELIVERY_STATE.csv` records the independent
axes for every capability. `RUNTIME_MANIFEST.yaml` binds any coherent runtime.

No repository may claim a work-package exit merely because its own tests pass.
An exit is an accountability summary derived from the capability map and
cross-repository product evidence. A pull request is optional and created only
when explicitly requested; a PR cannot be a completion requirement.

## Completion language

- **Implemented:** production-path code for the stated behavior exists at the
  exact revision and its focused tests pass.
- **Integrated:** the stated behavior traverses the coherent runtime to its
  claimed stage with retained evidence.
- **Qualified:** the applicable acceptance rows pass in the required
  environment against exact artifacts.
- **Releasable:** every applicable conformance obligation and release gate for
  the claim is `RELEASE_BOUND`.

The bounded DIE product is not complete until every required capability in
[`product-capability-map.csv`](engineering-execution/registers/product-capability-map.csv)
is integrated through `LIVE_UI` where customer-facing, unsupported states are
truthful, and product correctness no longer depends on a forbidden harness.
GA remains separately conditioned on the release gates.

## Precedence and change control

This document supersedes scheduling, blocking and completion language in 13,
19 through 24, 30, 31, 34, 39 and the production-readiness/execution-kit
packages when that language conflicts with product-first continuous delivery.
It does not supersede their architecture, semantics, tests or release exits.

Document 43 supersedes this document only for installed-product prerequisites,
required-input handling, Browser producer topology and the primary source-
vertical order.

A proven conflict with a frozen semantic still requires a focused ADR and an
atomic cross-contract update. Ordinary implementation difficulty never does.
