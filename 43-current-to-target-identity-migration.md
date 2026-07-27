# 43. Current-to-target identity migration

## Migration sequence

```text
inventory current identifiers
→ create canonical identity/identifier/claim registries
→ ingest current records as source observations
→ preserve current IDs as namespaced aliases
→ resolve deterministic matches
→ queue weak/conflicting candidates
→ backfill ownership and field authority
→ materialize bitemporal relationships
→ bind events to identities
→ introduce actor chains and workload identity
→ introduce artifact provenance
→ introduce credential brokering
→ migrate APIs/UI
→ retire source-specific identity joins
```

## Phases

### Phase 0 — Contract and safety

- Approve canonical vocabulary, tenant boundary, UUIDv7 format, source namespaces, state dimensions, and evidence tiers.
- Add schemas and conformance tests.
- Define privacy/retention and manual-resolution authorization.
- Measure current source health and identifier collision rates.

Exit: all new observations can be validated and every source/native ID is namespaceable.

### Phase 1 — Observation and alias foundation

- Deploy Identity Observation Ingestor and evidence store.
- Adapt all 17 current source profiles.
- Backfill existing IDs/rows without merging.
- Store source cursor, observed/ingested time, source authentication, raw digest, and schema version.

Exit: replay reproduces the observation ledger and no current identifier is lost.

### Phase 2 — Canonical registry and resolver

- Create canonical identity, identifier, claim, negative-match, merge/split, and lifecycle tables.
- Auto-resolve only deterministic matches.
- Launch candidate/conflict review.
- Generate dual-read comparison against current inventory.

Exit: entity counts, collisions, unexplained merges/splits, and field authority differences are reconciled.

### Phase 3 — Relationships, access, and event attribution

- Materialize ownership, membership, account, deployment, model/tool, observation, and authorization edges.
- Add event-time canonical IDs and identity snapshots.
- Introduce actor-chain completeness indicators.
- Keep Neo4j as rebuildable projection.

Exit: product views no longer join raw sensor APIs for identity.

### Phase 4 — Non-human, credential, and workload controls

- Integrate secret-manager metadata and issuer credential status.
- Inventory non-human principals/owners/permissions/last use.
- Deploy workload identity and Runtime Identity Binder for highest-risk services.
- Add grant/delegation and revocation cascade.

Exit: high-risk actions use short-lived scoped credentials and verified workload/deployment bindings.

### Phase 5 — Artifact and provenance

- Content-address production artifacts.
- Generate/verify build and release attestations.
- Bind deployment/runtime to exact artifact/config.
- Add signer/builder/trust policy and SBOM verification.

Exit: production artifacts trace to source/build/release and match runtime.

### Phase 6 — API/UI cutover and retirement

- Cut over identity, effective-access, attribution, finding, and evidence APIs.
- Launch Identity Overview, People, Agents & Workloads, Non-Human, Delegations, Credentials, Federation, Provenance, and Resolution Center.
- Remove frontend/source-specific identity reconstruction.
- Retire legacy joins only after dual-read SLOs and rollback window.

## Minimum viable identity system

MVS includes:

- immutable identity observations and raw/evidence references;
- canonical identity, identifier/alias, claim, state, and merge/split registries;
- deterministic resolver plus manual Resolution Center;
- continuous source freshness and periodic reconciliation;
- bitemporal identity/ownership/deployment relationships;
- canonical identity events/findings/metrics;
- actor-chain structure with explicit missing-layer indicators;
- secret/credential metadata without values;
- tenant-safe search and canonical APIs;
- replay/backfill/dual-read/reconciliation reports.

Workload identity, credential brokering, and full provenance can roll out incrementally, but the schema must distinguish those layers from day one.

## Data and store migration

| Current | Target | Treatment |
| --- | --- | --- |
| ClickHouse inventory/activity rows | Observation/event facts and analytic projections | Backfill with source/table/row lineage |
| PostgreSQL operational records | Canonical operational ledger | Add identities/identifiers/claims/states/relationships |
| Neo4j nodes/edges | Rebuildable typed graph | Import with edge provenance; stop treating as unversioned authority |
| Redis caches/queues | Cache/work coordination | Never canonical identity; fix loss/atomicity risks |
| Files/object payloads | Immutable raw/evidence objects | Content address, encrypt, retain, and reference |
| Secret values/config | Approved secret manager | Inventory metadata only |

## API migration

Adapters initially translate canonical API reads to current sources and compare results. Writes use idempotency and dual-write only where compensating/reconciliation logic is defined. The target API catalog is [identity-api-catalog.csv](matrices/identity-api-catalog.csv).

## Required protections

- no cross-tenant merges;
- no loss of historical IDs or observations;
- reversible merges/splits and alias redirects;
- historical events/decisions preserve event-time identity;
- explicit staleness/tombstone/reappearance;
- manual review queue and separation of duties;
- dual-read validation and rollback;
- backfill provenance and resolver version;
- source outage never becomes mass deletion.

## Reuse and replacement

Reuse:

- existing sensor/runtime/sync paths as observation adapters;
- ClickHouse for events/analytics;
- PostgreSQL for operational canonical state;
- Neo4j for graph projection;
- Redis for bounded cache/coordination;
- existing auth/provider/build/deploy systems as external authorities where verified.

Replace:

- `quilr_asset_inventory` or any source row as cross-source identity authority;
- display/email/name/tag-based automatic merges;
- frontend identity mashups;
- source-specific finding identity;
- Redis/cache state as authority;
- unversioned graph/decision identity;
- long-lived shared bearer credentials for delegated agent execution.

## Required integrations/new telemetry

P0:

- authoritative IdP/SCIM/HRIS and JML;
- MCP client/server/tool/connection contract;
- agent definition/version/deployment/run IDs;
- workload identity and runtime binding;
- sensor enrollment/authenticated sequence;
- credential/grant/consumer/revocation metadata;
- event-time actor chain and identity snapshot.

P1:

- MDM/EDR;
- provider account/model catalogs;
- cloud/Kubernetes inventory;
- repository/build/registry/provenance;
- secret-manager metadata;
- data catalog and ownership.

The complete prioritized ledger is [current-identity-gaps.csv](matrices/current-identity-gaps.csv).

## Acceptance

Migration is complete only after all 40 design validations in [identity-validation.csv](matrices/identity-validation.csv) pass in implementation and all 71 scenarios in [identity-golden-scenarios.csv](matrices/identity-golden-scenarios.csv) pass with reconstructable evidence.

