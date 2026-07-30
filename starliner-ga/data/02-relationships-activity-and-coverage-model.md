# Relationships, Activity, and Coverage Data Model

Status: **normative logical model**

## Canonical relationship

```text
relationship_id
tenant/environment
subject_entity_id
relation_type
object_entity_id
qualifiers
valid_from / valid_until
system_from / system_until
status
selected assertion/claim IDs
authority and confidence
materializer version
```

Current-state uniqueness is relation-specific. `OWNS` may permit several typed owners; `INSTANCE_OF` may require one active parent in a context.

## Relationship groups

### Structural

`INSTANCE_OF`, `DEPLOYED_AS`, `VERSION_OF`, `ROUTES_TO`, `SERVED_BY`, `CONTAINS_TOOL`

### Organizational

`OWNS`, `OPERATES`, `MEMBER_OF`, `MANAGED_BY`, `APPROVES`

### Dependency

`USES_MODEL`, `CONNECTS_TO`, `CAN_INVOKE`, `DEPENDS_ON`, `AUTHENTICATES_AS`

### Observed activity

`USED`, `INVOKED`, `ACCESSED`, `ROUTED_EXECUTION`, `OBSERVED_ON`

### Governance

`SUBJECT_TO_POLICY`, `HAS_EXCEPTION`, `AFFECTED_BY_FINDING`, `COVERED_BY`

Configured capability and observed use use different relationship types.

## Activity candidate

```text
activity_candidate_id
source observation/evidence
activity_type
source-native principal/resource/target references
event/observation/ingest time
source request/session/trace identifiers
safe measures
outcome candidate
normalizer version
```

## Correlated execution

```text
execution_id / version
execution_type
actor chain and principal confidence
application/agent/workload
model route/deployment
MCP server/tool
resource/data-class indicators
started/completed/event times
outcome and measures
member candidate IDs
correlation decision/version/confidence
coverage
privacy/retention
```

One execution can be enriched later. Previous versions remain reproducible.

## Coverage expectation

```text
coverage_expectation_id
tenant/environment
population_type and selector
population_source/version
required source profile/capability
effective interval
expected count or member set reference
policy/contract basis
```

## Coverage observation

```text
producer/source installation
capability/certification
scope/population bridge
health dimensions
mode
first/last healthy
freshness/completeness
gap and sampling intervals
reconciliation run
```

## Coverage materialization

Coverage is calculated at population, entity class, capability, source, scope, and time:

```text
expected
eligible
reporting healthy
reporting degraded
not reporting
unknown bridge
excluded by policy
freshness
completeness
```

The platform retains member-level references or an authorized reproducible set, not only a percentage.

## Product constraints

- A configured relationship never appears as an execution.
- Low-confidence correlation cannot create a stronger relationship than its definition permits.
- A relationship survives source outage according to lifecycle and is marked stale/unsupported, not silently removed.
- Coverage data appears alongside any claim of completeness.
- High-cardinality execution detail has shorter retention than canonical relationship history where policy requires.
