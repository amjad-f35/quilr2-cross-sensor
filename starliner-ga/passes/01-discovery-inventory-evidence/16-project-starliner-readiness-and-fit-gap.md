# `project-starliner` Readiness and Fit-Gap Gate

Status: **historical repository fit-gap gate; superseded as implementation-readiness authority**

Evidence cutoff: **2026-07-28**

Current authority: the exact-source audit, retain/refactor/replace/missing
disposition and target repository map required by this gate are now complete in
the
[implementation freeze](implementation-freeze/README.md). The historical
blocking language below records why the audit was required; it no longer
prohibits the authorized full bounded-pass build.

## Executive verdict

`quilrbusiness/project-starliner` is the intended core backend repository for the Discovery, Inventory, and Evidence Pass. Do not create a second competing platform spine.

The available evidence proves that `project-starliner` already supplied a real protocol/SDK foundation and that an early ingest/evidence path was exercised from the MCP Gateway. It does **not** prove that the current repository contains a production-complete or architecture-conformant implementation of ingest, normalization, central identity resolution, canonical ledgers, materialization, transactional outbox, projections, product APIs, tenancy, operations, or deployment.

The build decision is therefore:

> **Evolve `project-starliner`, but first audit an exact source revision and classify every existing module as retain, refactor, replace, delete, or missing.**

At this evidence cutoff, implementation was limited to source-independent
contract corrections, audited sensor remediations, Quilr 1 production
inventory and repository analysis. That condition has since been closed by the
exact-source audit and frozen target map; central-platform implementation now
proceeds from those artifacts rather than from assumptions.

## What the DIE Pass includes

The pass includes all of the following. “Discovery and inventory” does not mean that source rows are sent directly to a UI.

| Capability | Included behavior | Authority |
|---|---|---|
| Starliner source integration | Typed sensor adapters, privacy disposition, capability/certification metadata, local health | Sensor repository plus shared Starliner contracts/runtime |
| Edge outbox | Durable per-producer WAL/outbox, sequence/epoch, retries, partial acknowledgements, backpressure and explicit gap/loss states | Sensor or adjacent Edge Runtime |
| Starliner ingest | Workload authentication, tenant routing, schema/profile/privacy/integrity admission, immutable evidence commit, quarantine and per-record receipt | `die-ingest-api` |
| Normalization | Deterministic profile-versioned conversion of admitted source evidence into versioned normalized observations | `die-normalizer-worker` |
| Canonicalization | Central claims, bindings, identity decisions, entity/relationship/activity/coverage lifecycle, merge/split/correction and provenance | `die-truth-worker` |
| Canonical materialization | Transactional mutation of authoritative PostgreSQL ledgers from normalized observations and resolution decisions | `die-truth-worker` |
| Central transactional outbox | Atomic canonical mutation plus durable downstream change publication | Canonical PostgreSQL transaction |
| Query projections | Idempotent PostgreSQL product read models and ClickHouse activity/evidence search projections, with checkpoints and safe rebuild/promotion | `die-projection-worker` |
| Product access | Versioned authorized APIs, Overview, Inventory, Activity & Evidence, Sources & Coverage, export and audit | `die-product-api` and `die-web` |
| Separate migration track | Not included in bounded DIE; later consumes frozen legacy-evidence, alias, API/export and tenant-routing seams | Document 10 and its independently governed runtime/state |

The pass does **not** include finding admission/materialization, risk scoring,
policy authoring, command orchestration, new enforcement, cases, cost/billing
analytics, or any Quilr 1 extraction/backfill/parity/coexistence/cutover/rollback/
retirement implementation.

There are two different outboxes:

1. the **edge outbox** prevents accepted source facts from disappearing during sensor/network failure;
2. the **central transactional outbox** keeps canonical PostgreSQL mutations and rebuildable projections consistent.

They solve different failure boundaries and neither replaces the other.

## Exact meaning of “Quilr 1”

In this corpus, **Quilr 1 is the current customer-facing platform estate**, centered on:

- `quilr-web`;
- the `/bff` routing tier and its supporting services;
- `quilr-query-builder`, the Java 21/Spring Boot service;
- ClickHouse, PostgreSQL, Redis, Neo4j, Kafka and the related graph, analytics, auth, configuration and data services;
- current source-native delivery paths that feed that customer experience.

The two deeply audited primary platform repositories are `quilr-web` and `quilr-query-builder`, but “Quilr 1” is broader than only those two processes because the web application and BFF call many related services.

**`project-starliner` is not Quilr 1.** It is the existing Quilr 2/Starliner platform repository and a candidate implementation foundation. Early code or TDD semantics inside it can still be obsolete or incompatible with the current freeze; repository name and intent do not establish correctness.

## Verified implementation evidence already available

### Verified from the audited MCP Gateway source

At the audited MCP Gateway revision, the repository:

- pins `quilrbusiness/project-starliner` `main` at commit `860079c312c13f842b5804a590fa1d5430860286`;
- installs the package as `quilr-starliner-sdk`;
- imports the platform-owned `starliner_contracts` package;
- expects a legacy `starliner.adapters.SensorRuntime` API as well as the newer contract package;
- builds an enabled MCP image using a private repository-read secret without embedding that secret;
- defines contract/certification tests against platform golden traces;
- implements an embedded observe runtime, SQLite outbox, delivery worker, manifest, self-test and metrics in the MCP repository.

This is direct evidence that `project-starliner` contained at least a consumable protocol/SDK and certification backbone at that commit. It is not evidence that every central platform module existed.

The MCP release runbook also records a 2026-07-15 loopback flush of five discovery records to a Starliner ingest/evidence service with `accepted=5`, tenant-bound export and paginated replay. That is **implementation-history evidence**, but the central service source, artifact digest, deployment manifest, logs and independent proof package are not present in the supplied analysis. Treat the ingest/evidence service as an existing prototype/reuse candidate, not as GA-proven infrastructure.

### Verified incompatibility with the current freeze

The audited MCP `MCPObserveMapper` populates `SourceObservation.canonical_entity` with producer-generated deterministic backend/tool IDs.

That violates the frozen rule that the edge preserves source-native references and only the central resolver assigns canonical identity. Therefore the pinned SDK/contract semantics cannot be adopted unchanged. The compatibility plan must address:

- source record and envelope versioning;
- removal of producer-minted canonical identity;
- source reference and optional binding-token semantics;
- mixed-version adapter operation;
- golden-trace and certification version transition;
- replay of already accepted prototype evidence under an explicit legacy profile.

### Evidence not currently available

No supplied source checkout or independent runtime proof currently establishes:

- the current default branch and commit of `project-starliner`;
- complete repository inventory, public APIs, packages and deployable entry points;
- build, test, database-upgrade and release status;
- an admission transaction that durably commits evidence bytes, metadata, idempotency and handoff before returning `accepted`;
- profile normalizers;
- claims/bindings and a continuous central identity resolver;
- canonical entity, relationship, activity and coverage ledgers;
- merge/split/correction and field-authority behavior;
- a canonical PostgreSQL transactional outbox;
- independently recoverable projector checkpoints;
- rebuildable PostgreSQL and ClickHouse product projections;
- a production product API;
- tenant isolation, workload identity, encryption, backup/restore, capacity or SLO proof;
- deployed customer use.

Design documents or TDD schemas are not implementation proof.

## Current fit-gap hypothesis

This table is an audit hypothesis, not a substitute for reading the repository.

| DIE component | Current evidence classification | Required disposition before implementation |
|---|---|---|
| Contracts and Python SDK | **Verified existing at pinned commit; semantics partially superseded** | Audit, version and refactor |
| Golden traces/certification types | **Verified consumed by MCP** | Retain useful fixtures; migrate identity and lifecycle semantics |
| Legacy SDK decision adapter | **Verified consumed by MCP compatibility path** | Isolate; policy is deferred from DIE-GA |
| MCP embedded runtime/outbox/delivery | **Verified in MCP repository** | Retain and harden in sensor repo |
| Central ingest/evidence | **Recorded prototype smoke; source unverified** | Inspect code and productionize or replace by measured fit-gap |
| Schema/profile registry | **Unresolved** | Inspect and classify |
| Browser/Endpoint/LLM shared Edge Runtime implementations | **Not evidenced in `project-starliner` source** | Inspect; then build missing language/runtime support |
| Source normalizers | **Unresolved** | Inspect and classify |
| Claims/bindings/resolver | **Unresolved** | Inspect and classify |
| Canonical ledgers/materializers | **TDD/design evidence only** | Do not reuse schema or merge logic without source and invariant audit |
| Canonical transactional outbox | **Unresolved** | Inspect and classify |
| Projection runner/read models | **Unresolved** | Inspect and classify |
| Product API | **Unresolved** | Inspect and classify |
| Quilr 2 web application | **Unresolved and expected outside core backend** | Bind the approved frontend repository |
| Separate Quilr 1 migration runtime/parity | **Outside bounded DIE** | Govern only under document 10 and its parallel-track requirements |
| Deployment/IaC/operations | **Unresolved** | Inspect and bind approved ownership |

## Required repository audit

The exact release-selected `project-starliner` source must undergo the same evidence discipline already applied to the sensors and Quilr 1.

### 1. Establish source identity

- obtain authorized repository access;
- record repository ID, default branch, exact commit, tags and commit date;
- record dirty state, submodules, LFS, generated and vendored content;
- identify the commit used by every current consumer and deployment;
- compare the MCP pin `860079c...` with current main and deployed artifacts.

### 2. Inventory the whole repository

- root/build/package/lock files;
- packages, applications, services, workers and libraries;
- schemas, migrations, fixtures and generated clients;
- tests and certification corpus;
- Dockerfiles, Helm/Kubernetes, Terraform and CI/CD;
- operational scripts, configuration, secrets references and documentation;
- dead, legacy, experimental and incomplete code.

### 3. Trace every runtime

For each API, worker, CLI, migration and scheduled job, verify:

- entry point and startup/shutdown;
- dependencies and configuration;
- authentication, authorization and tenant context;
- state read/written and transaction boundary;
- messages/events produced and consumed;
- retries, idempotency, backpressure and recovery;
- health, metrics, logs, traces and audit;
- packaging and deployment path.

### 4. Map code to the frozen pipeline

Produce a symbol-backed trace for:

```text
sensor delivery
→ admission
→ immutable evidence
→ normalization
→ resolution
→ canonical transaction
→ transactional outbox
→ projection
→ API
→ UI contract
```

Missing or inferred edges remain explicit.

### 5. Execute verification

- clean build from lockfiles;
- unit, property, contract, integration and E2E tests;
- schema create and database upgrade from supported versions;
- ingest duplicate/partial-ack/crash/replay tests;
- canonical transaction/outbox atomicity tests;
- resolver merge/split/correction tests;
- projector failover/rebuild/promotion tests;
- cross-tenant negative tests;
- backup/restore and version-skew smoke where supported;
- artifact/SBOM/signing/provenance inspection.

Tests in files or CI YAML do not count unless the selected CI/release path actually runs them.

### 6. Publish a disposition matrix

Every meaningful module receives one disposition:

| Disposition | Meaning |
|---|---|
| `RETAIN` | Implements the frozen behavior and passes required verification |
| `HARDEN` | Correct boundary, incomplete GA security/reliability/operations |
| `REFACTOR` | Useful implementation with incorrect contract, authority or dependency direction |
| `COMPATIBILITY_ONLY` | Required temporarily for pinned consumers through a named compatibility window |
| `REPLACE` | Conflicts materially with frozen invariants and cannot be safely evolved |
| `DELETE_LATER` | Superseded code retained only through a named compatibility window |
| `MISSING` | Required Pass capability not present |
| `UNRESOLVED` | Evidence is insufficient |

The result must map module and symbol evidence to every applicable `DIE-REQ-*`, deployable role, database schema, API and release gate.

## Build readiness

> **Historical gate notice:** this section records the pre-freeze audit state.
> The audit completed and the current implementation/scheduling authority is
> documents 40 and 41. Nothing below blocks present product construction.

### Work that can start now

- audit and branch/revision selection for `project-starliner`;
- correct source-envelope and identity semantics;
- versioned source profiles and golden traces;
- audited sensor-hook remediations that do not depend on unresolved central internals;
- stable extension seams and non-regression checks that do not inspect, extract,
  backfill, route or compare Quilr 1 data;
- physical data-model design and threat/privacy review;
- UI interaction design and contract fixtures clearly labeled non-production;
- production backlog, ownership and test/certification harness setup.

### Work that was blocked before the completed audit

- declaring an existing central module reusable;
- implementing around undocumented APIs or tables;
- selecting final module destinations and deployment entry points;
- freezing concrete generated SDKs against the old canonical-at-source grammar;
- broad parallel implementation of ingest, resolver, materializers, projections and product APIs;
- customer pilot.

Quilr 1 inventory, parity and cutover construction belongs exclusively to the
parallel migration track in document 10; it was never a prerequisite for the
bounded product build.

### Readiness statement

Historical cutoff verdict: the implementation baseline was not yet
sufficiently verified for an autonomous full build. Current verdict: the
required exact-source fit-gap audit has completed and the
[production implementation handoff](implementation-freeze/23-production-implementation-handoff.md)
authorizes the autonomous bounded-pass build.

The exact-source fit-gap audit and technical freeze are complete. Current
release/environment inputs do not block implementation; they affect only the
applicable qualification or external lane under document 41. Teams implement
missing/refactored work inside the frozen boundaries without reopening the
central architecture.

## Historical required output of `DIE-0`

`DIE-0` must include:

- exact `project-starliner` source revision and repository inventory;
- existing-module disposition matrix;
- requirement-to-symbol/deployable fit-gap matrix;
- approved target module/repository/deployment map;
- protocol compatibility and version-transition decision for the pinned SDK;
- named owners and release branches;
- clean build/test evidence;
- initial physical DDL and workload/security decisions;
- a sequenced plan that reuses verified code and never builds a parallel spine.
