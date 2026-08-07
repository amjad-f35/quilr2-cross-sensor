# Starliner / Quilr 2 GA Build Source of Truth

**Authority:** Normative for implementation
**Status:** Architecture frozen; protocol and release gates defined in this corpus
**Audience:** Product, architecture, platform, sensor, security, data, SRE, frontend, QA, compliance
**Replaces as implementation authority:** the MCP-first 12-bucket TDD and standalone draft PRDs

## Purpose

This corpus is the closed implementation system for the customer-facing Quilr 2 platform. It converts browser, endpoint, LLM Gateway, MCP Gateway, and enterprise-integration evidence into one continuously resolved AI estate, canonical activity, trustworthy insights, analytics, policy decisions, and verified remediation.

The platform is not a telemetry viewer and is not a test harness. Tests, fixtures, self-tests, conformance tools, and certification are proof mechanisms for production capabilities; none is a substitute for a customer-facing release.

## Product promise

Quilr 2 answers:

1. What AI applications, agents, models, MCP servers, and tools exist?
2. Who or what owns and uses them?
3. What data, systems, credentials, and capabilities can they access?
4. What actually happened?
5. Is the estate approved, covered, healthy, and enforceable?
6. What material condition requires action?
7. What action should be taken, and was its effect verified?

## Non-negotiable boundary

> Preserve privacy-approved source-native evidence and perform latency-sensitive enforcement at the edge. Resolve identity, construct canonical enterprise truth, derive insights, govern policy, orchestrate actions, and verify effects in the tenant's Starliner cell.

## Finite implementation domains

Every implementation change MUST map to one or more of these domains:

1. Product and scope governance
2. Protocol, schemas, source profiles, and compatibility
3. Sensor adapters and Starliner Edge Runtime
4. Producer enrollment, trust, capability, and certification
5. Delivery, ingest, immutable evidence, replay, and retention
6. Source normalization, catalog, and enrichment
7. Continuous identity, claims, aliases, resolution, and lifecycle
8. Canonical entity, relationship, activity, decision, and coverage ledgers
9. Event correlation, finding admission, workflow, metrics, cost, and outcomes
10. Policy lifecycle, hot context, Decision API, approval, and delegation
11. Commands, response integrations, effect observation, and verification
12. Enterprise connectors and authoritative reconciliation
13. Read projections, unified APIs, search, and customer UI
14. Privacy, security, tenant isolation, residency, and audit
15. Reliability, capacity, observability, backup, disaster recovery, and support
16. Secure development, release provenance, deployment, and certification
17. Quilr 1 backfill, dual-read migration, compatibility, and deprecation
18. Program ownership, delivery increments, acceptance gates, and change control

Work outside these domains is out of scope or requires an approved amendment to the domain map.

## Document authority order

When documents conflict, use this order:

1. [Architecture constitution](02-architecture-constitution.md)
2. Approved ADRs in [`adrs/`](adrs/)
3. Normative protocol and platform specifications
4. Machine-readable registers in [`registers/`](registers/)
5. Sensor profiles in [`profiles/`](profiles/)
6. Implementation increments and acceptance plans
7. Existing cross-sensor analysis as evidence
8. Legacy TDDs, PRDs, code comments, and product behavior

No implementation is authorized by a lower-ranked document when it conflicts with a higher-ranked one.

## Entry points

- [Audit of the initial TDD](00-initial-tdd-audit.md)
- [Program charter](01-program-charter.md)
- [Architecture constitution](02-architecture-constitution.md)
- [Normative vocabulary](03-normative-vocabulary.md)
- [System context and scope](04-system-context-and-scope.md)
- [Reference architecture](05-reference-architecture.md)
- [Data and authority map](06-data-and-authority-map.md)
- [Product information architecture](07-product-information-architecture.md)
- [Capability taxonomy and customer workflows](09-capability-and-workflow-taxonomy.md)
- [Freeze and change control](08-freeze-and-change-control.md)
- [New-context evidence and disposition](evidence/01-context-disposition.md)
- [Machine-readable contract freeze](contracts/README.md)
- [Architecture decision records](adrs/README.md)
- [Edge Runtime architecture](edge/00-edge-runtime-architecture.md)
- [Ingest, trust, and evidence](platform/00-ingest-trust-and-evidence.md)
- [Bidirectional sensor/platform flow](platform/13-bidirectional-sensor-flow.md)
- [Continuous identity resolution](platform/02-continuous-identity-resolution.md)
- [Canonical ontology](data/00-ontology-and-aggregate-model.md)
- [Product overview contract](product/00-overview-and-navigation.md)
- [Source profiles](profiles/00-browser-source-profile.md)
- [Security and threat model](operations/00-security-and-threat-model.md)
- [Implementation strategy](implementation/00-delivery-strategy.md)
- [First customer release: Discovery, Inventory, and Evidence Pass](passes/01-discovery-inventory-evidence/README.md)
- [Quilr 1 to Quilr 2 migration continuity audit](migration-audit/README.md)
- [Production walking skeleton](implementation/01-first-production-walking-skeleton.md)
- [Engineering backlog](implementation/08-engineering-backlog.md)
- [Acceptance scenarios](implementation/09-acceptance-scenario-catalog.md)
- [Engineering control system](implementation/10-engineering-control-system.md)
- [Feature-to-evidence traceability](implementation/11-feature-evidence-traceability.md)
- [Current sensor repository audit](evidence/02-current-sensor-repository-audit.md)
- [Browser sensor binding](implementation/12-browser-sensor-binding.md)
- [Endpoint sensor binding](implementation/13-endpoint-sensor-binding.md)
- [LLM Gateway sensor binding](implementation/14-llm-gateway-sensor-binding.md)
- [MCP Gateway sensor binding](implementation/15-mcp-gateway-sensor-binding.md)
- [Architecture freeze status](implementation/16-sensor-architecture-freeze-status.md)
- [GA definition of done](implementation/06-ga-definition-of-done.md)
- [Requirements register](registers/requirements.csv)
- [Architecture decisions](registers/decisions.yaml)
- [GA gates](registers/ga-gates.yaml)
- [Known external inputs](registers/needs-input.yaml)

## Corpus map

| Directory | Authority |
|---|---|
| [`adrs/`](adrs/) | Individually accepted architecture decisions |
| [`protocol/`](protocol/) | Wire semantics, lifecycle, integrity, privacy, control, and compatibility |
| [`contracts/`](contracts/) | Machine-valid governance and protocol meta-contracts |
| [`edge/`](edge/) | Production Edge Runtime, adapter, WAL, policy, health, and certification |
| [`platform/`](platform/) | Ingest through canonical truth, insights, analytics, control, connectors, and APIs |
| [`data/`](data/) | Canonical ontology and logical ledgers/invariants |
| [`profiles/`](profiles/) | Browser, endpoint, LLM gateway, MCP gateway, enterprise, and legacy authority |
| [`product/`](product/) | Customer-facing information architecture and workflows |
| [`api/`](api/) | Product resource, endpoint, event, mutation, and error catalog |
| [`operations/`](operations/) | Security, tenancy, SLO, observability, recovery, release, and quality |
| [`implementation/`](implementation/) | Stages, first slice, workstreams, releases, migration, ownership, backlog, scenarios, and GA |
| [`passes/`](passes/) | Scope-frozen customer release packages with their own requirements, decisions, inputs, proof, and definition of done |
| [`migration-audit/`](migration-audit/) | Repository-derived Quilr 1 continuity inventory, change guardrails, live validation, cutover, and signoff evidence |
| [`registers/`](registers/) | Requirements, decisions, inputs, services, profiles, gates, and risks |
| [`evidence/`](evidence/) | Hash-locked non-normative inputs and their normative disposition |
| [`tools/`](tools/) | Corpus validation |

Pass status:

- [`passes/01-discovery-inventory-evidence/`](passes/01-discovery-inventory-evidence/) is the active normative first-release authority.
- [`passes/02-intelligence-findings/`](passes/02-intelligence-findings/) is a deferred pre-freeze checklist only; it records what must be decided and proven before intelligence implementation is authorized.

## Evidence inputs

This corpus was produced from:

- Initial MCP-first TDD: SHA-256 `67c959f7bb8f0e985636bbf8f51102d6c8e3b700e8ab9b27c6a9f53bdf0c984c`
- Starliner protocol/edge/platform PRD: SHA-256 `6cf66a7016f8edb2e4d43f74be587f3681883bdac9cb5f7adef06a8b92224939`
- The complete [`quilr2-cross-sensor`](../README.md) architecture and identity addendum
- Browser, endpoint, LLM Gateway, MCP Gateway, and Quilr 1 repository analyses, including revision-pinned current sensor audits
- Quilr platform RFC pack: 12 files, SHA-256 values recorded in [`evidence/source-inputs.yaml`](evidence/source-inputs.yaml)
- QFG finding pack: 10 files, SHA-256 values recorded in [`evidence/source-inputs.yaml`](evidence/source-inputs.yaml)
- Quilr 1/2 contrast context: SHA-256 `021963e2be7f6e3388bb546cfb338d598a32538c04aae7adde678de2f8b4fd34`
- Platform architecture/workflow context: SHA-256 `a3c1670e0ac6db8202c16c61b10b14e17414d38c8401156d8f80c10d82abd92f`
- Additional mixed/stale conversation context: SHA-256 `84946ffa766068a3f5fbe80b06a49ca7f625fb6509c93102f3f2e6f9ba6b652b`

All 25 new inputs (19,397 lines) were read and dispositioned in [`evidence/01-context-disposition.md`](evidence/01-context-disposition.md). The inputs are evidence. This corpus is the build authority.

## No invented production values

Unknown environment-specific values use `NEEDS_INPUT` and are registered in [`registers/needs-input.yaml`](registers/needs-input.yaml). This applies to internal tenant-cell placement, owners, production URLs, regions, identity issuers, JWKS, KMS keys, secrets, deployment paths, SLO commitments, on-call ownership, and infrastructure endpoints. The customer-facing logical tenant is not unknown: installed sources use the existing organization tenant UUID through the supported Discovery/enrollment path defined by ADR-0022.

`NEEDS_INPUT` is not permitted for architecture behavior that this corpus freezes.
