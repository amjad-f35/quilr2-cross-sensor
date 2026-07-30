# Source Profiles and Capability Model

## Source profile contract

Every producer record is governed by a versioned profile declaring:

```text
profile identity/version
source/connector class
integration roles: runtime sensor, discovery, telemetry import, control, response
allowed record families and subtypes
required native identity fields
identifier namespaces and stability
body schemas
allowed action/relation/reason vocabularies
privacy field classes and capture states
payload/cardinality limits
sequence and reorder semantics
correction and tombstone semantics
snapshot and authoritative-negative semantics
expected cadence and freshness thresholds
sampling/gap behavior
declared capabilities
known blind spots
self-test and certification cases
```

## Capability dimensions

Capabilities are independent:

```text
discover
observe
classify
decide
warn
justify
enforce
execute_command
observe_effect
verify_effect
```

## Capability state

```text
declared        producer manifest claim
tested          self-test result
certified       approved test-pack result bound to artifact
deployed        runtime advertises exact certified artifact/profile
enabled         tenant configuration permits capability
in_scope        action/entity/domain is covered
healthy         required runtime dimensions are healthy
fresh           heartbeat/evidence within threshold
complete        no disqualifying gap/sampling state
```

Product coverage is derived from all applicable dimensions. No single `full` flag exists.

## Certification binding

A certification binds:

```text
source repository/revision
build invocation
artifact digest
runtime/adapter version
protocol/profile/schema releases
capability set and limitations
test-pack digest
environment and date
signer/approver
expiry/revocation
```

Runtime drift from the certified digest or profile changes certification state to `drifted`.

## Source authority

Profiles declare source authority at field/operation level:

- direct observation;
- source-native configuration;
- authoritative record;
- derived classification;
- self-reported runtime state;
- unverified claim.

Profiles do not declare themselves authoritative for canonical identity.

Integration roles follow [ADR-0016](../adrs/0016-integration-roles-not-vendor-shaped-connectors.md). Multi-role packages declare and certify every role separately; capability or credential authority never transfers implicitly between roles.

## Lifecycle semantics

For every object subtype the profile specifies:

```text
create/upsert trigger
stable native key
source revision
change detection
delete/tombstone support
full snapshot boundary
absence semantics
reappearance behavior
native ID recycling risk
freshness/stale/retirement thresholds
```

## Initial profiles

- Browser extension
- Browser native host/service
- Endpoint agent discovery
- Endpoint proxy/DLP
- Endpoint IDE hooks
- LLM Gateway
- LLM workers
- MCP Gateway
- Agent runtime
- Discovery connector
- Telemetry importer
- Control connector
- Response connector
- Quilr 1 backfill

Profiles are detailed under [`../profiles/`](../profiles/).

## Source-profile release gate

A profile cannot be enabled for live evidence until:

- schemas validate;
- identity/lifecycle semantics are complete;
- unsafe fixtures fail;
- required hook families have evidence;
- payload and cardinality budgets pass;
- gap and outage behavior passes;
- producer enrollment/certification is active;
- known limitations are product-visible;
- rollback/deprecation compatibility is documented.
