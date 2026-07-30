# Enterprise Integrations and Quilr 1 Profile

Status: **normative profile design**

## Purpose

This profile family imports authoritative enterprise facts and legacy Quilr 1 state into evidence, claims, and reconciliation workflows without granting legacy rows canonical authority.

## Enterprise sources

| Source | Strong authority |
|---|---|
| IdP/directory | principal ID, account state, groups as declared |
| HRIS | employment status, manager, organization |
| MDM/UEM | expected device population and management status |
| CMDB | service/application record, designated owner, environment |
| Cloud/Kubernetes | workload, account/project/cluster, deployment metadata |
| SaaS admin | tenant account, configured users/apps, audit events |
| AI provider | provider projects/deployments, usage and billing |
| Ticketing | external case/task state, not canonical finding truth |
| Data catalog/DLP | data-resource classification in declared scope |

Authority remains field- and scope-specific.

## Quilr 1 import object types

- legacy asset inventory rows;
- legacy interaction/event rows;
- graph nodes and relationships;
- policy and finding state;
- user/organization mappings;
- connector metadata;
- raw source references when preserved;
- legacy IDs and source strategy fields.

## Legacy trust

Every imported value has:

- `authority=imported_legacy` unless independently supported;
- source store/table/graph label;
- legacy primary ID;
- extraction watermark;
- transformation version;
- original timestamps and their known semantics;
- confidence/limitation;
- evidence locator or a declaration that raw evidence is unavailable.

The import does not mint a cross-sensor canonical ID at extraction.

## Reconciliation

Enterprise connectors use full snapshots plus incrementals/webhooks. Quilr 1 uses:

1. immutable baseline export;
2. change capture or periodic delta;
3. count/checksum reconciliation;
4. central normalization and resolution;
5. parity reporting;
6. cutover watermarks;
7. post-cutover read-only retention and deprecation.

## Identity bridges

High-value bridges include:

- endpoint/browser pseudonym to IdP principal;
- workload/service principal to cloud deployment;
- CMDB application/service to observed AI surfaces;
- provider project to model deployments and billed usage;
- legacy Quilr asset ID to source object and canonical successor.

Each bridge is a claim with provenance and revocation.

## Migration prohibitions

- no bulk copying legacy IDs as canonical IDs;
- no “latest row wins” field selection;
- no graph relationship treated as current without lifecycle validation;
- no deletion of legacy state before audit and rollback windows close;
- no parity claim based solely on aggregate row counts;
- no dual-write without a named authority and conflict rule.

## Certification

Per-connector API semantics, scope, pagination, deletions, cursor reset, privacy, rate limit, regional residency, and test tenant proof. Quilr 1 migration additionally requires historical sampling, entity/relationship/finding parity, unsupported-field accounting, and reversible cutover.
