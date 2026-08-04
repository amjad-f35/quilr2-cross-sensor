# Discovery, Inventory, and Evidence Pass

Status: **normative first customer release authority**

Short name: **DIE Pass**

Approval state: **the bounded technical freeze is complete and the full product
implementation is authorized.** Named engineering, security, SRE and product
owners approve promotion/release evidence for their domains; their signoff is
not a prerequisite for writing or integrating the frozen product. Migration is
a separate future track.

## Executive decision

The first Quilr 2 customer-facing release is deliberately limited to:

1. continuous discovery from the Browser, Endpoint, LLM Gateway, and MCP Gateway sensor families;
2. one centrally resolved, source-backed inventory;
3. complete privacy-approved evidence and canonical activity for the important events those sensors can directly observe;
4. coverage, freshness, gaps, provenance, and identity transparency;
5. a simple production UI and API over that truth;
6. stable contracts that a separate migration/coexistence track can integrate without changing this pass.

Findings, intelligence, risk scoring, policy authoring, new enforcement orchestration, autonomous remediation, cost, and the broader deployment portfolio are not dependencies of this pass. The pass preserves their future contracts but does not build empty versions of them.

## Customer promise

> Continuously discover and inventory the AI applications, agents, models, MCP servers, and tools visible to the customer's covered Browser, Endpoint, LLM Gateway, and MCP Gateway sensors; show the important source-backed activity and evidence explaining what was discovered and used; and disclose coverage and gaps.

“All” means all supported, certified, privacy-approved facts within the declared capability and coverage of the installed sensors. It never means visibility into bypass traffic, unsupported environments, prohibited content, or time intervals with unknown coverage.

## Authority

This directory is the build and release authority for the DIE Pass. Authority order is:

1. the [architecture constitution](../../02-architecture-constitution.md);
2. accepted Starliner ADRs;
3. the [frozen engineering implementation package](implementation-freeze/README.md);
4. this parent pass;
5. the broader Starliner specifications;
6. current sensor repository audits;
7. Quilr 1 behavior and legacy documents.

This pass changes release sequencing, not constitutional architecture. A conflict with the constitution requires a superseding ADR. A broader platform capability not required here remains deferred even when described elsewhere.

## Release boundary

### Included

- all four sensor families plus the Browser Backend as a distinct producer;
- source lifecycle, discovery, reconciliation, action/outcome, health, gap, and coverage evidence;
- Starliner adapters, local privacy, edge WAL, delivery, ingest receipts, quarantine, and replay;
- source normalizers;
- continuous identity resolution needed for inventory;
- canonical entities, relationships, activity, provenance, and coverage;
- PostgreSQL canonical/read models, object evidence storage, and a ClickHouse activity projection;
- Overview, Inventory, Activity & Evidence, Sources & Coverage, entity pages, producer operations, export, and audit;
- production security, tenancy, privacy, SLO, backup, release, support, and certification for this pass.

### Excluded from the customer claim

- findings, cases, severity, risk scoring, recommendations, or “needs action” inference;
- policy authoring, new decision services, command orchestration, or remediation;
- cost and billing analytics;
- raw prompt, response, file, tool argument/result, DOM, clipboard, credential, or restricted-content capture;
- enterprise-wide completeness without declared sensor coverage;
- Quilr 1 retirement;
- Quilr 1 extraction, coexistence, parity, cohort cutover and rollback implementation; these remain a separate track described in document 10 and do not block this freeze;
- every possible SaaS/BYOC/on-prem/air-gap deployment profile;
- graph/search/cache infrastructure without a measured pass requirement.

Existing native sensor decisions, DLP results, blocks, warnings, and effects are retained as evidence. Showing that an existing native control occurred does not mean the new Quilr 2 policy platform has shipped.

## Documentation map

1. [CTO directive and release charter](00-cto-directive-and-release-charter.md)
2. [Scope, claims, and non-goals](01-scope-claims-and-non-goals.md)
3. [Pass architecture freeze](02-pass-architecture-freeze.md)
4. [Sensor discovery and event coverage](03-sensor-discovery-and-event-coverage.md)
5. [Canonical inventory and relationships](04-canonical-inventory-and-relationships.md)
6. [Evidence, activity, and provenance](05-evidence-activity-and-provenance.md)
7. [Runtime, storage, workers, and scaling](06-runtime-storage-workers-and-scaling.md)
8. [Ingest, normalization, and resolution](07-ingest-normalization-and-resolution.md)
9. [Product APIs and read models](08-product-apis-and-read-models.md)
10. [UI information architecture](09-ui-information-architecture.md)
11. [Quilr 1 migration and coexistence](10-quilr1-migration-and-coexistence.md)
12. [Security, privacy, tenancy, and access](11-security-privacy-tenancy-and-access.md)
13. [Quality, certification, and operability](12-quality-certification-and-operability.md)
14. [Delivery plan and definition of done](13-delivery-plan-and-definition-of-done.md)
15. [Twenty-four-area disposition register](14-twenty-four-area-disposition-register.md)
16. [Traceability and team review](15-traceability-and-team-review.md)
17. [`project-starliner` readiness and fit-gap gate](16-project-starliner-readiness-and-fit-gap.md)
18. [Frozen engineering implementation package](implementation-freeze/README.md)

Machine-readable registers:

- [Pass requirements](registers/requirements.csv)
- [Pass decisions](registers/decisions.yaml)
- [Pass needs-input](registers/needs-input.yaml)
- [Source coverage](registers/source-coverage.yaml)
- [Migration authority matrix](registers/migration-matrix.csv)
- [Pass risks](registers/risks.csv)

## Definition of “fully”

The pass is fully delivered only when:

- every advertised source capability has exact production artifact certification;
- every eligible record is durably captured or an explicit gap/loss state is visible;
- inventory identity is centrally resolved, explainable, reversible, and source-backed;
- every material inventory field links to claims and evidence;
- important activity has actor/resource/outcome/time/lineage where the source can support it;
- the UI exposes freshness, coverage, ambiguity, errors, and partial states;
- customer reads do not call sensor APIs or reconstruct truth in the frontend;
- security, privacy, durability, capacity, accessibility, backup/restore, upgrade, support, and pilot gates pass;
- all implementation-semantic items are closed and environment/certification bindings are supplied for the release target.

Code completion, a populated dashboard, and successful synthetic tests are not equivalent to this definition.
