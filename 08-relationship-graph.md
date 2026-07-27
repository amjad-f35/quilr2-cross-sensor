# Relationship graph

The normative catalog is [relationships.csv](matrices/relationships.csv) and [canonical-relationships.yaml](schemas/canonical-relationships.yaml).

## Relationship record

Every relationship has:

```text
relationship_id
tenant_id
subject_id / subject_type
relationship_type
object_id / object_type
authority: authoritative | direct_observation | inferred | analytical
confidence
valid_from / valid_until
recorded_from / recorded_until
source_observation_ids
derivation/rule version
attributes
supersedes
```

**Proposed:** uniqueness is tenant + typed subject/relation/object + authority source + validity version. Multiple sources can support one materialized relationship without destroying their independent assertions.

## Core relationship families

### Organization and use

- `Human User MEMBER_OF Group`
- `Group PART_OF Organization Unit`
- `Agent Definition OWNED_BY Organization Unit`
- `Tenant Application OWNED_BY Human User`
- `Data Asset OWNED_BY Human User`
- `Human User USES Tenant Application`
- `Human User USES Agent Definition`
- `Human User LOGGED_INTO Application Account`
- `Application Installation INSTALLED_ON Device`
- `Application Surface SURFACE_OF AI Product`
- `Tenant Application INSTANCE_OF AI Product`

### AI dependencies

- `Agent Definition USES Model Deployment`
- `Agent Definition USES Tool`
- `Agent Definition CONNECTED_THROUGH Integration Instance`
- `MCP Client CONNECTS_TO MCP Server Deployment`
- `MCP Server Deployment PROVIDES Tool`
- `Model Version PROVIDED_BY Model Provider`
- `Model Deployment DEPLOYS Model Version`
- `Model Route RESOLVES_TO Model Deployment`
- `Agent Definition RETRIEVES_FROM Knowledge Base`
- `Agent Definition WRITES_TO Memory Store`

### Identity and authority

- `Agent Deployment RUNS_AS Workload Identity`
- `Agent Run INITIATED_BY Human User`
- `Agent Run EXECUTED_BY Agent Runtime`
- `Credential AUTHENTICATES Integration Instance`
- `Application Account GRANTS_ACCESS_TO Data Asset`
- `Policy APPLIES_TO Tenant Application`
- `Policy ENFORCED_AT Enforcement Point`

### Runtime, data, findings, economics

- `Endpoint Process INSTANCE_OF Application Installation`
- `Endpoint Process CONNECTED_TO Application Surface`
- `Agent Run INVOKED Model Deployment`
- `Agent Run CALLED Tool`
- `Tenant Application ACCESSES Data Asset`
- `Model Deployment PROCESSES Data Class`
- `Tool READS|MODIFIES Data Asset`
- `Decision GOVERNED_BY Policy`
- `Decision ENFORCED_BY Enforcement Point`
- `Canonical Event OBSERVED_BY Sensor`
- `Finding AFFECTS Tenant Application`
- `Finding SUPPORTED_BY Evidence Record`
- `Finding CAUSED_BY Tenant Application`
- `Certification COVERS Sensor`
- `Cost Record ATTRIBUTED_TO Agent Run`
- `Outcome RESULT_OF Agent Run`

The CSV contains exact source, authority, lifecycle, and availability for every relationship. Object-specific extensions require schema review; a generic untyped `RELATED_TO` is forbidden.

## Three logical projections

### Authorization graph

Answers:

- who owns and may access a resource;
- which human delegated to an agent;
- which workload identity an agent uses;
- which account/credential grants access;
- which policy/exception/approval applies.

Only authoritative or explicitly modeled effective-access derivations are admitted. Current sensor-use observations do not grant authority.

### Asset and dependency graph

Answers:

- product/surface/tenant instance/installation relationships;
- agent→model/tool/connector/knowledge/memory dependencies;
- MCP client→server→tool topology;
- device/application/process relationships;
- impact of disabling a model, tool, connector, or server.

Direct configuration and deployment records outrank activity inference. Activity can confirm current use or expire stale inferred edges.

### Activity and evidence graph

Answers:

- which run/step/action/decision/sensor/evidence produced an outcome;
- which events support a finding;
- where cost and data classifications attach.

High-volume facts stay in ClickHouse. The “graph” is a query projection or bounded relationship index over event IDs, not a requirement to store every event as a Neo4j node.

## Physical recommendation

Use a combination:

| Store | Role |
| --- | --- |
| PostgreSQL | Authoritative current/bitemporal entity, identifier, merge/split, relationship, ownership, policy/workflow ledger |
| Neo4j | Rebuildable typed projection for traversal/impact/effective-access queries |
| ClickHouse | High-volume canonical events, activity/evidence-link projections, time-series relationships, findings signals, metrics |
| Object storage | Immutable raw payloads and large evidence |
| Search index | Alias, entity, event, and evidence metadata search where allowed |
| Redis | Read cache, short-lived coordination, never relationship authority |

**Verified current gap:** Quilr 1 uses Neo4j for master/enrichment/sync and ClickHouse for rows, while authoritative relationship cardinality, constraints, event-time history, and drift are unresolved. [Q1-STORE](../../quilr-platform-analysis/09-data-models-and-storage.md). The target writes PostgreSQL relationship state and an outbox atomically, then projects to Neo4j/ClickHouse with reconciliation.

## Lifecycle

- Direct relationship observation expires according to source delete/TTL semantics.
- Materialized relationship remains while at least one valid supporting assertion or authoritative record exists.
- Inferred relationship records its derivation window and confidence and expires automatically.
- Revocation closes `valid_until`; history is not deleted.
- Contradictory authoritative assertions coexist as conflict state and may open a finding.
- Graph projection deletion is idempotent and rebuildable from the ledger.

## Query examples

```text
Impact: Model Deployment <-USES- Agent Definition <-OWNED_BY- Team
Path: Human User -> Agent Run -> Tool -> Data Asset
Coverage: Policy -> Enforcement Point -> Sensor health
Identity: Observation -> Tenant Application -> AI Product -> Application Surface
Evidence: Finding -> Evidence Record <- Canonical Event -> Sensor
```
