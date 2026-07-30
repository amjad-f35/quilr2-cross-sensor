# Tenancy, Residency, and Data Governance

Status: **normative**

## Cell model

Customer data is processed in a tenant data cell selected by trusted routing metadata. A cell contains ingest, evidence, normalization, resolution, canonical ledgers, projectors, APIs, policy, workflow, connectors, audit, backup, and observability needed for the tenant deployment profile.

The global control plane contains release, schema, certification, and tenant-routing metadata. It must not receive customer evidence when residency policy prohibits it.

## Isolation layers

- tenant-bound workload and user identity;
- regional routing before payload processing;
- database row/schema/database isolation according to profile;
- tenant-specific object-store prefixes and key policy;
- tenant-specific analytical/search/graph partitions;
- cache key and namespace isolation;
- per-tenant quotas and workload classes;
- network policy and service identity;
- authorization at API, job, export, and support boundaries;
- isolation tests in every release.

Dedicated and on-prem profiles may strengthen physical isolation without changing logical contracts.

## Data classification

| Class | Examples | Handling |
|---|---|---|
| Public/product metadata | published model/vendor catalog | normal |
| Customer operational | inventory, policy state, counts | tenant confidential |
| Customer sensitive | identity mappings, activity, findings | restricted access and audit |
| Restricted content | prompts, responses, tool results, documents | separate grant/store/retention |
| Secret | credentials, keys, tokens | secret manager only; never evidence |
| Regulated | customer-declared regulated data | profile-specific controls |

Classification flows through evidence, claims, projections, APIs, exports, logs, and backups.

## Residency

Residency applies to:

- primary and replica stores;
- object storage;
- backups and disaster-recovery copies;
- logs, traces, and support bundles;
- data-processing jobs;
- restricted-content access;
- customer exports;
- subprocessors.

Tenant routing fails closed when the required cell is unavailable or ambiguous. Cross-region transfer is explicit, policy-controlled, and audited.

## Retention

Retention is object- and purpose-specific:

- immutable source evidence;
- normalized observations;
- canonical state and history;
- detailed activity;
- aggregates;
- findings/cases/audit;
- restricted content;
- support diagnostics;
- backups and exports.

Deletion propagates through authoritative state and projections using a tracked workflow. Aggregate privacy and referential integrity are validated after deletion.

## Legal hold and deletion

- Legal hold prevents applicable erasure and is itself tightly authorized.
- Customer deletion requests have identity verification, preview, execution, validation, and completion evidence.
- Source disconnect is not automatic deletion.
- A canonical merge does not destroy source records.
- Backup expiration is included in deletion commitments.
- Cryptographic erasure may be used where the deployment profile and evidence support it.

## Purpose limitation

Evidence collected for security, governance, and operations is not reused for model training or unrelated purposes without explicit contractual authorization. Product analytics use the minimum necessary data and tenant-safe aggregation.

## Data subject and customer rights

Where applicable, the platform supports search, export, correction, restriction, and deletion through canonical/source identity mappings. Ambiguous identity is reviewed rather than over-disclosing another person’s data.

## Governance records

The platform maintains:

- data inventory and flow;
- processing purpose;
- retention schedule;
- subprocessors;
- regional deployment;
- access roles;
- privacy impact assessments;
- deletion and legal-hold evidence;
- customer configuration and contractual exceptions.

## Required inputs

Actual launch regions, regulated-market commitments, retention defaults, backup geography, encryption-key ownership, and support-access model are explicit `NEEDS_INPUT` items and must be resolved before the corresponding GA gate.
