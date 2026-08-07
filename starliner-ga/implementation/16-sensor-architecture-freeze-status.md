# Architecture Freeze Status and Remaining Decisions

Status: **normative determination ledger**

Release-sequencing amendment: [ADR-0019](../adrs/0019-first-customer-release-is-discovery-inventory-evidence.md), [ADR-0020](../adrs/0020-die-migration-is-a-separate-parallel-track.md), [ADR-0022](../adrs/0022-installed-product-vertical-delivery.md), [installed-product document 43](../passes/01-discovery-inventory-evidence/implementation-freeze/43-installed-product-lifecycle-and-source-verticals.md), and the [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md) define the first customer release and source-vertical implementation order. The broader platform determinations below remain the long-term architecture, but findings, policy, cost, broad deployment expansion, Quilr 1 migration/coexistence, and Quilr 1 retirement are not dependencies of `DIE-GA`. Migration remains fully preserved under the independent `MIGRATION` track and G6.

## Bottom line

The core Quilr 2 architecture is decided sufficiently to build:

- sensor/platform responsibility boundary;
- source profiles and adapter semantics;
- physical Starliner placement for all four launch sensors;
- observation, management, policy, decision, command and effect flows;
- edge and central durability;
- producer identity and capability certification;
- privacy/content separation;
- central identity, canonical ledgers and materializers;
- tenant-cell data plane and global metadata-only control plane;
- canonical APIs and minimal customer information architecture;
- migration, release, security, reliability and GA gates.

The remaining inputs do not authorize teams to redesign the spine. They select customer promises, production values, vendors, owners, launch scope and environment bindings inside the frozen architecture.

The platform is therefore in **architecture-frozen, implementation-inputs-open** state—not “everything in production is known,” and not “still in discovery.”

## Sensor binding closure

| Sensor | Repository evidence | Physical binding | Adapter seam status | Remaining release evidence |
|---|---|---|---|---|
| Browser Extension + native host | static source verified at pinned revisions | one embedded Extension background runtime owns the logical Browser installation producer, epoch, sequence, durable WAL and delivery stream; the native host is supporting capture only, retains distinct component/artifact lineage and returns correlated results to the Extension | exact upload/action/messaging/native-host seams mapped | exact installed compound artifacts, normal enrollment, supported versions, effective policy/config, keyed correlation fix, durability and Browser certification |
| Browser Backend | static source verified at pinned revision | embedded library or colocated sidecar; separate hosted producer identity and sequence space from the Browser installed sensor | controllers, risk transform, producer, persona and heartbeat seams mapped; only server-owned facts or qualified original-record relay are admitted | deployed topology, effective auth, downstream guarantees, multi-replica heartbeat, current release artifact and relay no-double-count proof |
| Endpoint compound sensor | static source verified at pinned revisions | one supervised device-local runtime; authenticated component IPC; embedded hot PEP snapshots | process, correlation, entity store, sync, proxy, hook, alert and activity seams mapped | credential incident disposition, secure IPC, durable evidence, removal of source ID authority, supported OS/package certification |
| LLM Gateway | static source verified at pinned revision | in-process adapter plus per-pod sidecar | auth context, OpenAI lifecycle, provider routes, configuration and NATS seams mapped | uniform lifecycle on all transports, streaming/cancel semantics, deployment artifact/config, sidecar resource and failure certification |
| MCP Gateway | static source verified at pinned revision | embedded runtime for certified single replica; sidecar/shared durable runtime before horizontal scale | registry, Direct MCP, OneMCP gap, tool lifecycle, mapper and SQLite outbox mapped | remove source canonical IDs, cover all MCP surfaces, local bundle PEP, private dependencies, production credentials/config and scaling-state certification |

No additional conceptual adapter design is needed before implementation. Each remaining item is a named code change, release proof or production input.

## Frozen versus selectable

### Frozen constitutional architecture

The following require a superseding ADR to change:

1. sensors preserve strongest privacy-approved source-native identity but do not assign canonical identity;
2. sensor adapters remain thin and source-specific;
3. Starliner provides common runtime behavior through SDK and/or sidecar;
4. edge WAL and central transactional outbox solve separate durability boundaries;
5. telemetry and control use separate authenticated protocols;
6. ordinary enforcement uses a local signed policy bundle;
7. central Decision API is bounded escalation, not a dependency for every action;
8. immutable evidence precedes normalization and resolution;
9. identity, relationships, canonical activity, findings and analytics are central tenant-cell authorities;
10. PostgreSQL owns operational canonical mutations; other stores are rebuildable projections or specialized evidence/analytic stores;
11. UI and public product APIs read unified canonical resources;
12. cells provide bounded blast radius and physical tenant placement;
13. global control plane receives metadata required to operate cells, not resident customer evidence;
14. restricted content is a separate protocol, storage and authorization path;
15. every command requires typed authority, target, precondition, outcome and effect semantics;
16. Quilr 1 migrates as evidence and compatibility—not as the new architecture.

### Frozen implementation defaults

- Protocol v1 is UTF-8 JSON using JSON Schema 2020-12 and OpenAPI 3.1.2.
- Protobuf is not a launch blocker and may be added later only after cross-language semantic conformance.
- Browser uses an embedded background runtime because its enforcement and browser storage boundary are local.
- Endpoint uses one supervised device-local runtime because it is a compound multi-process sensor.
- LLM Gateway uses one sidecar per pod plus an in-process typed adapter/PEP boundary.
- MCP Gateway preserves its embedded runtime for a single-replica first release and must change state architecture before scale-out.
- Source observations may carry source references and revisioned binding hints, never producer-created canonical entity IDs.
- Browser Extension and native messaging host are one logical Browser
  installation producer/epoch/sequence/WAL stream with distinct component
  lineage; Browser Backend is a separate hosted producer for server-owned facts
  or a qualified original-record relay.
- Direct MCP and OneMCP are separate certified surfaces until parity is proven.
- Product-native queues and logs do not replace the Starliner WAL or central admission receipt.

These are build defaults. A team may propose a different physical implementation through an implementation ADR only if it preserves every contract and demonstrates a better operational result.

## Complete platform-domain determination

`Closed` means the architecture and responsibility model are decided. `Input open` means accountable business or environment values are still required. `Implementation proof open` means the target is defined but source code, deployment and certification must prove it.

| # | Major domain | Determination | What is already decided | What remains open |
|---:|---|---|---|---|
| 1 | Service and deployment models | **Architecture closed; launch input open** | shared control plane + regional tenant cells supports shared SaaS, dedicated cells, BYOC/on-prem/hybrid by packaging the same contracts; customer data plane remains local to its approved placement | launch offer and operating-responsibility matrix (`NI-002`); air-gap/update/support commitments |
| 2 | Tenancy and isolation | **Closed** | tenant is mandatory on every mutation and runtime object; cells bound blast radius; per-tenant authorization, quotas, encryption context and placement; no customer evidence in global control plane | exact launch isolation tier/capacity and residency values (`NI-001`, `NI-002`, `NI-010`) |
| 3 | Control plane and data plane | **Closed** | global metadata/fleet/placement/release control is separate from resident ingest, evidence, canonical, policy execution and query data plane; telemetry and native control are separate again | physical cloud accounts, regions, endpoints and operator model |
| 4 | Identity and access management | **Closed target; integration input open** | OIDC/SCIM human identities, workload identity, RBAC plus relationship/attribute/field authorization, JIT support access, delegated actor chain, tenant-bound service identities | issuers, federation/SCIM launch modes and break-glass authorities (`NI-004`, `NI-005`, `NI-019`) |
| 5 | Administration and tenant management | **Closed target; implementation proof open** | global operator and tenant-admin resources are separated; all changes are authorized/audited; tenant placement, suspension, configuration, fleet/cell health and support access have authority boundaries | exact initial admin UX increment, named operators and production endpoints |
| 6 | Policy, configuration, secrets, and keys | **Closed target; inputs open** | typed/versioned config, signed policy bundles, staged activation/rollback, local PEP, separate secrets/KMS, short-lived workload credentials, typed commands and effect evidence | KMS/HSM, issuers, lifetimes, default policy and supported customer key modes (`NI-005`, `NI-006`, `NI-017`) |
| 7 | Plans, entitlements, metering, billing, and licensing | **Boundary closed; commercial model open** | entitlements/quotas are authoritative control inputs separate from telemetry metrics; metering requires governed definitions/provenance; offline deployments need signed time-bounded license/entitlement state | plans, SKUs, billing provider, price book, quotas, offline license terms and launch packaging |
| 8 | Platform engineering and infrastructure | **Architecture closed; environment open** | cell topology, immutable infrastructure, network/trust boundaries, authority stores, queues, object storage, Kubernetes-compatible deployment and IaC/reproducibility requirements | provider/account/cluster/network/database instance choices and approved production configuration (`NI-026`) |
| 9 | Environment management | **Closed target** | development/test/staging/production/DR and customer sandboxes have separate identities, data, keys, artifacts and promotion; fixtures cannot become production defaults | exact account/project naming, topology and customer sandbox offer |
| 10 | Software delivery, CI/CD, and release engineering | **Closed target** | build once/promote by digest, signed artifacts, compatibility, migrations, cohort/canary, rollback, update channels and gate evidence | selected CI/release systems, repo map, release cadence and named owners (`NI-025`, `NI-030`) |
| 11 | DevSecOps and software supply chain | **Closed target; proof open** | scans, SBOM, provenance, signing isolation, dependency policy, secret prevention, vulnerability disposition and artifact certification are release gates | tooling integrations, risk SLAs, endpoint credential incident disposition and clean artifacts |
| 12 | API and integration operations | **Closed target; connector scope open** | versioned canonical APIs, workload/user auth, idempotency, pagination, quotas, webhooks, typed connector roles, private-connectivity boundary and compatibility | launch connectors, SDK languages, public/private endpoints, VPN/proxy offer and quotas (`NI-012`, `NI-026`) |
| 13 | Observability and auditability | **Closed target; numeric values open** | privacy-safe logs/metrics/traces, audit ledger, data-quality watermarks, fleet/cell/source health, customer coverage and status/runbook hooks | SLO thresholds, alert routes, vendor tooling and status-page ownership (`NI-009`, `NI-020`) |
| 14 | Reliability and production operations | **Closed target; measured commitments open** | HA by cell/service class, backpressure, idempotency, capacity isolation, incident/maintenance/runbook model, error budgets and kill switches | measured SLO/SLA/capacity/latency values, on-call names and support coverage (`NI-009`, `NI-010`, `NI-020`) |
| 15 | Backup, disaster recovery, and business continuity | **Closed target; commitments open** | encrypted monitored backups, regular restores, cell recovery, replay-safe evidence, command reconciliation, regional recovery and game days | approved RPO/RTO, geography and customer continuity promises (`NI-008`) |
| 16 | Data management, privacy, and governance | **Closed target; policy values open** | classification, minimization, residency routing, encryption, retention/deletion/legal hold propagation, export, restricted-content separation and purpose-bound access | retention schedule, data collection policy, CMK scope and regulated launch data (`NI-006`, `NI-007`, `NI-028`) |
| 17 | Security operations and compliance | **Closed target; market scope open** | actor/threat model, runtime monitoring, access review, incident response, penetration/assurance gates, evidence packages and customer security review support | certification/regulatory launch scope, control mappings, pen-test schedule and incident decisions (`NI-023`, `NI-031`) |
| 18 | Customer implementation and support | **Closed operating boundary; offer open** | enrollment/install/upgrade/diagnostic/support-bundle/migration paths; support access is JIT/purpose-bound/audited; customer/vendor responsibility must be explicit per deployment | tiered support offer, onboarding SLAs, launch documentation/training and named customer cohorts |
| 19 | FinOps and capacity economics | **Closed measurement model; values open** | cost attribution by tenant/cell/service/workload, capacity reserve, quotas, estimate-vs-billed separation and deployment-tier economics | price sources, budgets, commitments, profitability targets and load profiles (`NI-010`, `NI-016`) |
| 20 | Documentation, ownership, and operating model | **Closed control system; assignments open** | authority hierarchy, ADRs, requirements, service catalog, traceability, runbooks, RACI roles, change control and immutable gate packages | named people/backups, systems of record and funded capacity (`NI-024`, `NI-027`, `NI-030`) |
| 21 | Version lifecycle and decommissioning | **Closed target; schedule open** | semantic compatibility, certification support matrix, deprecation telemetry, mixed-version upgrades, end-of-support, customer offboarding, data/credential/infrastructure teardown and Quilr 1 G6 | concrete support periods, release channels, customer notice terms and coexistence/cutover dates (`NI-011`, `NI-022`) |

No row above is permission to invent a production value. Conversely, an open value in a row is not permission to change the closed responsibility boundary.

## What can start immediately

The following work is unblocked by deployment/commercial decisions:

1. freeze and generate protocol v1 contracts and conformance fixtures;
2. implement the tenant-scoped ingest/admission receipt and immutable evidence path;
3. implement producer enrollment, workload identity interfaces and certification registry against a development issuer;
4. build source normalizers and central identity claims/binding ledger;
5. implement canonical entity/relationship/activity mutations with transactional outbox;
6. implement the four sensor adapters and WAL paths at the exact audited seams;
7. remove producer-created canonical IDs from endpoint and MCP paths;
8. build unified inventory/coverage/activity APIs and the first cross-sensor UI slice;
9. establish privacy, secret-canary, isolation, replay and failure tests.

## Separate parallel migration work

Separately, once the `MIGRATION` track is staffed and authorized, W18 may
dual-run against Quilr 1 using legacy evidence adapters. That work is not part
of the immediate bounded build and does not block `DIE-GA` or G2 through G5.

Development fixtures for issuers, keys, tenants, regions and endpoints must be visibly non-production and replaceable by typed configuration.

## Decisions that must close before specific gates

### Before G0 exits

- approve launch deployment profile;
- assign named owners and funded workstreams;
- approve systems of record;
- disposition the endpoint key/certificate exposure as a security incident;
- approve repository-to-module ownership map.

### Before G1 exits

- bind exact source and target artifacts to builds/deployments;
- approve workload identity/KMS/environment endpoints;
- prove tenant isolation, durability, privacy and secure local IPC;
- certify resource/capacity profiles;
- verify current deployed sensor artifacts and effective configuration.

### Before G2 and later customer gates

- approve launch regions, retention, data collection, identity connectors and support access;
- approve product/SLO/capacity/finding definitions and customer support matrix;
- prove every customer claim against deployed artifacts and representative environments;
- close migration, rollback and customer-cohort inputs before Quilr 1 retirement.

## Evidence boundary

Static repository truth is now verified for the pinned sensor revisions listed in the [current sensor repository audit](../evidence/02-current-sensor-repository-audit.md). It proves code and configuration present in those snapshots.

It does not prove:

- the pinned revision is the latest remote revision;
- a particular artifact was deployed to a customer;
- an optional/private dependency was included;
- effective production configuration;
- live identity, network, database or external-service behavior;
- production volume, latency, reliability or security posture.

Those are release and operational evidence requirements—not architecture rediscovery.

## Change-control test

A proposal requires a constitutional ADR when it changes any of:

- edge versus central authority;
- canonical identity ownership;
- immutable evidence or outbox semantics;
- tenant/cell boundary;
- telemetry/control separation;
- policy/command/effect meaning;
- privacy/content boundary;
- canonical store or projection authority;
- customer API truth source.

A proposal requires only an implementation ADR when it changes a language, library, IPC, broker, workflow engine, search/graph implementation or physical runtime placement without changing those invariants.

An environment approval is sufficient when it binds an already-defined interface to a region, issuer, key, endpoint, repository, owner, capacity value, SLO or supported version.
