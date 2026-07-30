# Initial MCP TDD Audit and Disposition

**Input:** 7,280-line MCP-first 12-bucket TDD
**Verdict:** Retain as historical milestone evidence; do not implement as the Quilr 2 platform architecture
**Disposition:** Superseded by this corpus

## What the TDD got right

- A runtime event must travel asynchronously through an edge outbox.
- Ingest is a trust and evidence-admission boundary.
- Evidence is distinct from UI read models.
- Frontend pages must not join source APIs.
- Contracts, negative payload-safety fixtures, idempotency, replay, tenant isolation, and proof gates are mandatory.
- MCP tool calls need safe summaries instead of raw arguments and results.
- Sensor health and delivery lag must be visible.
- A repeated signal should not create finding spam.

These ideas are preserved.

## Why it cannot be the GA source of truth

### A-001 — The edge manufactures canonical identity

The TDD defines `entity_key`, `canonical_entity_key`, `subject_entity_key`, and deterministic `agent:<tenant>:<name>` values in source records. Its materializer trusts those values as canonical.

This violates the architecture boundary. An edge may emit a source-native object reference and normalized identifier candidates. Only the central resolver may assign canonical enterprise IDs.

**Replacement:** [`protocol/01-envelope-and-record-families.md`](protocol/01-envelope-and-record-families.md) and [`platform/02-continuous-identity-resolution.md`](platform/02-continuous-identity-resolution.md).

### A-002 — Source records are mislabeled canonical

The adapter returns `CanonicalRecord`, and the ABI is described as a canonical record grammar. At the edge these are typed source records, not canonical entities, relationships, findings, or activity.

**Replacement term:** `StarlinerSourceRecord`.

### A-003 — Normalization and resolution are absent

The TDD sends sensor-shaped records directly from ingest to entity materialization. It has no profile-versioned normalizer, identifier registry, claim ledger, resolution decisions, negative matches, merge/split ledger, or Resolution Center.

This guarantees future browser/endpoint/gateway conflicts and incorrect cross-source merges.

### A-004 — Continuous lifecycle is absent

The envelope and record families lack:

- `operation` (`upsert`, `correct`, `delete`, `tombstone`);
- `source_revision` and `supersedes_record_id`;
- snapshot scope/completeness;
- authoritative deletion semantics;
- reconciliation-run boundaries;
- identifier recycling and reappearance.

Without these fields, the platform cannot distinguish deletion, stale coverage, partial sync, correction, or source outage.

### A-005 — Claims and field authority are replaced by JSON merge

The entity materializer merges `attributes_json`, chooses a “better” display name, and stores maximum confidence without a field-level claim, authority, validity, or conflict ledger.

That loses explainability and makes replay dependent on processing order.

### A-006 — Relationships are current-only and source-trusted

The TDD upserts `subject + relation + object` into one current row. It does not preserve assertion source, valid time, system time, retraction, conflicts, authority, or relationship generations.

### A-007 — Configuration is converted into activity relationships

The relationship materializer can derive `agent called tool` or `human used tool` from weak source keys without stable agent, human, session, run, or call identity. This creates assertions stronger than the evidence.

### A-008 — Source signals become findings without admission

`FindingSignal` immediately creates a canonical finding. Required source coverage, not-evaluable behavior, identity assurance, effect evidence, and confidence formulas are absent.

The GA engine must admit a finding only when its definition's evidence requirements pass.

### A-009 — Severity scores are invented product truth

The TDD hardcodes arbitrary scores such as `new_high_risk_tool_seen = 45` and adds modifiers without a governed risk model, calibration evidence, or product ownership.

GA severity uses versioned definitions, business impact, confidence, scope, coverage, and explicit governance.

### A-010 — Coverage is one overloaded enum

`full`, `partial`, `degraded`, and `unknown` conflate capability, certification, runtime mode, health, scope, freshness, and evidence completeness.

GA models those dimensions independently.

### A-011 — Evidence quality is producer-asserted

The source supplies `evidence_quality=operational` and the store persists it. The producer may claim quality; ingest derives the admitted assurance from authentication, certification, profile, integrity, freshness, and known limitations.

### A-012 — Raw-value hashing is unsafe

The TDD hashes complete tool arguments and results with plain SHA-256. Low-entropy or structured sensitive values may be recoverable by guessing. Hashing also does not make restricted content safe.

GA defaults to no content hash for restricted values. When correlation requires a digest, use an approved tenant-keyed HMAC over an explicitly allowed canonical subset.

### A-013 — Outbox loss can be silent

The edge outbox permits `dropped` and allows ActionEvents to be discarded under pressure. A dropped record must produce a durable gap/sampling record and coverage consequence. Decision, command, and effect evidence must use protected priority lanes.

### A-014 — Evidence acceptance is underspecified

The TDD does not define whether `accepted` means the immutable bytes, metadata, idempotency key, and durable handoff committed together. It also postpones restricted-content storage without defining content references.

### A-015 — Canonical state and read projections are conflated

The same `canonical_entities`, `relationships`, findings, and telemetry tables are called both materialized authority and rebuildable read models. GA separates authoritative PostgreSQL ledgers from rebuildable ClickHouse, graph, search, Redis, and UI projections.

### A-016 — Materializer dispatch is not independently recoverable

One evidence job dispatches to multiple materializers and can be marked done or dead-lettered as a unit. GA uses independent idempotent consumer checkpoints/results so one failed materializer does not block unrelated consumers.

### A-017 — Rebuild is not production-safe

The TDD permits pausing a tenant and clearing rows. GA rebuilds into versioned projection namespaces/tables, reconciles them, and atomically switches active versions.

### A-018 — Policy, decision, approval, command, and verification are out of the system

The 12 buckets end at an observe-only UI. They do not include policy lifecycle, bundle compilation, local PEP behavior, central context, approval, delegation, commands, or effect verification.

### A-019 — Enterprise identity and connectors are excluded

IdP/SCIM/HRIS, SaaS, cloud, MDM/EDR, secret manager, provider catalog, billing, data catalog, repository/build/registry, and connector reconciliation are absent.

### A-020 — No tenant-cell, residency, DR, or production operations architecture

The TDD describes a preproduction-shaped PostgreSQL system rather than shared SaaS, dedicated cloud, on-prem, and regional cells with RPO/RTO, quotas, isolation, and operational ownership.

### A-021 — No Quilr 1 strangler migration

The TDD explicitly excludes Quilr 1 backfill and source compatibility. A real build requires tenant-sequenced backfill, dual reads, reconciliation, feature flags, compatibility routes, rollback, and deprecation.

### A-022 — The milestone proves infrastructure, not customer value

The final test proves that synthetic MCP events reach an MCP-only UI. A GA release must prove customer outcomes using production-supported browser, endpoint, gateway, and enterprise evidence.

## Reusable disposition

| TDD component | Disposition |
|---|---|
| Negative payload-safety corpus | Reuse after adapting to capture-state and HMAC rules |
| Edge outbox state-machine tests | Reuse after removing silent drop and adding gap records |
| Batch partial-ack tests | Reuse |
| MCP hook inventory | Re-audit against current source and use in MCP source profile |
| Manifest/self-test concepts | Reuse under Starliner management protocol |
| API/UI no-source-join rule | Freeze |
| Source-defined entity keys | Delete |
| Direct signal-to-finding logic | Delete |
| Arbitrary severity values | Delete |
| PostgreSQL schemas | Treat as non-normative sketches; redesign from canonical ledgers |
| M1 UI routes | Use as research only; replace with customer IA |

## Final disposition

The TDD is not “wrong” as an experiment checklist. It is wrong as a GA platform plan. Its useful test cases become conformance fixtures; its identity, materialization, finding, coverage, and production architecture are replaced.
