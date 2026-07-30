# Backup, Disaster Recovery, and Continuity

Status: **normative framework**

## Recovery objectives

RPO and RTO are defined per data/service class and remain `NEEDS_INPUT` until product commitments and deployment profiles are approved. Architecture must support separate objectives for:

- edge admitted records;
- immutable evidence;
- canonical ledgers;
- policies/approvals/commands;
- audit;
- projections;
- restricted content;
- configuration and trust metadata.

## Recovery authority

Authoritative stores:

- edge WAL until central acceptance;
- regional immutable evidence;
- canonical PostgreSQL;
- signed configuration and release registries;
- audit ledger.

ClickHouse, graph, search, and caches are rebuildable. They may be backed up to accelerate recovery but are never the only recovery source.

## Backup requirements

- encrypted and access controlled;
- region/residency compliant;
- independently inventoried;
- immutable or write-protected against routine compromise;
- include schema, key, and version metadata;
- retention-aligned;
- restoration regularly tested;
- monitored for freshness and completion;
- deletion/legal-hold aware.

## Recovery sequence

1. establish incident authority and target recovery point;
2. secure and isolate the recovery environment;
3. restore trust/configuration dependencies;
4. restore canonical and evidence authorities;
5. validate tenant, region, integrity, and audit invariants;
6. resume ingest with edge replay and deduplication;
7. rebuild projectors into new namespaces;
8. validate parity and watermarks;
9. restore APIs and workflows by priority;
10. reconcile connectors and commands;
11. communicate completion and residual limitations.

## Regional failure

The deployment profile declares whether recovery is:

- in-region multi-zone;
- paired-region with customer-authorized data replication;
- restore in an approved replacement region;
- customer-managed for on-prem.

The platform never silently moves resident data to an unapproved geography.

## Control continuity

- Edge uses the last valid signed policy according to declared offline behavior.
- New high-impact central commands may be suspended.
- Command reconciliation prevents double execution after failover.
- Outcomes replay through normal evidence idempotency.
- Emergency stop can be distributed through the surviving control path.

## Evidence continuity

Edge WAL absorbs a regional ingest outage within its certified budget. On recovery, replay is rate-controlled and prioritized. Coverage identifies producers that exhausted capacity or remained offline.

## Disaster-recovery tests

- database point-in-time restore;
- evidence object/index reconciliation;
- full tenant-cell loss;
- accidental canonical mutation;
- corrupted projection;
- compromised credential/trust bundle;
- region routing failure;
- backlog replay after restore;
- in-flight workflow and command recovery;
- key loss/rotation scenario;
- deletion and legal-hold preservation;
- on-prem customer-operated recovery where offered.

## Business continuity

Continuity includes people and suppliers:

- on-call and incident roles;
- dependency and subprocessor failure;
- release/signing infrastructure outage;
- customer communication;
- manual approval/control fallback;
- support access;
- capacity for prolonged degraded operation.

## GA evidence

An approved recovery test report includes exact versions, scope, achieved recovery points/times, integrity checks, gaps, corrective actions, and accountable sign-off. A backup that has never restored successfully is not GA evidence.
