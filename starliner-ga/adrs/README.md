# Architecture Decision Records

Status: **normative**

Accepted ADRs are subordinate only to the architecture constitution. A change requires a superseding ADR and the review process in [freeze and change control](../08-freeze-and-change-control.md).

| ADR | Decision |
|---|---|
| [0001](0001-central-canonical-identity.md) | Canonical identity is assigned centrally |
| [0002](0002-dual-outboxes-and-durable-acceptance.md) | Edge and central outboxes solve different durability boundaries |
| [0003](0003-small-envelope-and-typed-profiles.md) | Small common envelope plus typed source profiles |
| [0004](0004-immutable-evidence-and-bitemporal-ledgers.md) | Append evidence and corrections; materialize bitemporal truth |
| [0005](0005-postgresql-authority-and-rebuildable-projections.md) | PostgreSQL is canonical; specialized stores are projections |
| [0006](0006-tenant-data-cell-architecture.md) | Customer data processing is cell-local and region-bound |
| [0007](0007-restricted-content-separation.md) | Restricted content is excluded from normal telemetry |
| [0008](0008-separate-telemetry-and-control-planes.md) | Evidence and control use separate planes |
| [0009](0009-coverage-before-absence-or-rate-claims.md) | Coverage is required for absence, rate, and completeness claims |
| [0010](0010-versioned-findings-and-metrics.md) | Findings and metrics are governed versioned contracts |
| [0011](0011-minimal-product-information-architecture.md) | Product UI exposes decisions, not sensor exhaust |
| [0012](0012-first-slice-is-cross-sensor.md) | First production slice proves cross-sensor value; original scope superseded by ADR-0019 |
| [0013](0013-workload-identity-and-certified-capabilities.md) | Producers use workload identity and certified capability manifests |
| [0014](0014-quilr1-migrates-as-evidence.md) | Quilr 1 state is imported as lineage-preserving evidence |
| [0015](0015-correlation-identifiers-not-universal-traces.md) | Trace context is causal; scans use observation/reconciliation IDs |
| [0016](0016-integration-roles-not-vendor-shaped-connectors.md) | Integrations are separated into runtime, discovery, telemetry, control, and response roles |
| [0017](0017-finding-definitions-own-grouping-and-severity.md) | Versioned finding definitions own grouping, severity, lifecycle, and recompute |
| [0018](0018-engineering-truth-and-feature-traceability.md) | Engineering systems preserve authority and end-to-end feature traceability |
| [0019](0019-first-customer-release-is-discovery-inventory-evidence.md) | First customer release ships five-profile discovery, inventory, evidence, coverage, and UI; its migration sequencing is superseded by ADR-0020 |
| [0020](0020-die-migration-is-a-separate-parallel-track.md) | The bounded five-profile DIE product ships independently; Quilr 1 migration/coexistence remains a separately authorized parallel track |
