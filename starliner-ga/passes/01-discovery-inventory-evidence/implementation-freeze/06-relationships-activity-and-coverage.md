# Relationships, Activity, and Coverage

## Relationship scope is part of identity

Canonical relationship identity is `(subject, predicate, object, semantic, scope_kind, scope_key)`, not merely the two endpoints and predicate. Most structural/configured/observed edges use `unscoped/unscoped`. A source relationship that varies by authorization context, source configuration or observation scope carries a privacy-approved SHA-256 scope-tuple digest from normalization through canonical and read projections. The digest participates in uniqueness, versioning, retraction and indexes; it is never treated as an ordinary display attribute.

For MCP `exposes`, the profile declares `shared_legacy_cache` or an authorization-scoped view. The normalizer produces `scope_kind=authorization_context` and a digest over the tenant-keyed authorization-context token, tenant-keyed endpoint-configuration token and applicable protocol version. A shared legacy cache uses `scope_kind=source_configuration` with a digest that explicitly identifies the lower-assurance shared cache. Materializers and APIs may aggregate within one selected scope only; they may not union scopes into a complete tool/resource/prompt catalog.

## Separate graphs

The platform has four conceptually different relationship sets:

1. **Estate relationships:** structural, configured, ownership, coverage and observed facts connecting customer assets.
2. **Estate entitlement relationships:** externally sourced roles, permissions, credentials and memberships used to describe what an identity may reach.
3. **Quilr product authorization relationships:** curated grants and scope membership used by the API authorization kernel.
4. **Causal/activity lineage:** what participated in one execution.

Estate entitlement is not Quilr product authorization. An imported `directory_account HAS_PERMISSION_TO resource` edge may appear in an exposure path, but it cannot grant that account access to Quilr APIs. An observed relationship never proves entitlement: seeing a user or agent access one resource does not mean it can access every resource available to that user.

## Canonical relationship contract

Every relationship contains:

- stable relationship ID;
- subject entity;
- typed predicate;
- object entity;
- semantic class;
- lifecycle;
- valid-time interval;
- system-time interval;
- source candidate and evidence membership;
- confidence;
- materializer version;
- safe attributes.

Direction is canonical. APIs may return a derived inverse label but do not store duplicate inverse truth.

## Frozen predicates

### Structural

- `contains`;
- `part_of`;
- `instance_of`;
- `version_of`;
- `deployed_on`;
- `installed_on`;
- `exposes`.

### Configured

- `configured_to_use`;
- `configured_with`;
- `configured_for`;
- `can_invoke`;
- `routes_to`;
- `runs_as`;
- `assigned_to`;

### Entitlement

- `member_of`;
- `has_role_on`;
- `has_permission_to`;
- `can_authenticate_to`;
- `has_credential_on`.

### Observed execution

- `executed_as`;
- `used`;
- `invoked`;
- `called`;
- `accessed`;
- `read_from`;
- `wrote_to`.

### Ownership

- `owned_by`;
- `administered_by`;

### Coverage

- `observed_by`;
- `covered_by`;

Predicates are valid only for registered subject/object type pairs. Producer payloads pass a stricter gate: `(profile, source subject type, source predicate, source object type, semantic)` must match exactly one row in [source-relationship-rules.yaml](ontology/source-relationship-rules.yaml), that row must map to a pair admitted by [predicates.yaml](ontology/predicates.yaml), and it must match exactly one `adapter_derivable` evidence rule in [relationship-support.csv](registers/relationship-support.csv). An unmatched payload remains immutable evidence but is quarantined from canonical truth. Observed invocation never upgrades to configured access, permission, `runs_as`, or entitlement. New combinations require ontology and sensor-evidence review.

## Configured, entitled and observed are different

Examples:

- An MCP server deployment exposing a tool is `mcp_server_deployment exposes mcp_tool`.
- An agent configuration naming a server is `agent_deployment configured_to_use mcp_server_deployment`.
- An authoritative IAM connector proving an account permission is `directory_account has_permission_to resource`.
- A completed execution is `agent_deployment invoked mcp_tool` or `agent_deployment accessed resource` only when that exact agent actor is proved by the observing source or accepted cross-sensor attribution. Otherwise the observed actor remains gateway-native or source-scoped.

The UI labels these differently. Counts and analytics never infer execution from configuration, infer entitlement from execution, or infer either from `runs_as`.

The four owned sensors can populate structural/configured/observed edges only where their certified capture seams provide the evidence. Complete enterprise `member_of`, role, permission, credential and resource edges require authoritative IdP, MDM, cloud/IAM, SaaS, repository or ACL connectors. When those connectors are absent, entitlement coverage is `unsupported` or `unknown`; the platform does not synthesize a Microsoft-style reachability map from a username.

## Materialization

A source candidate becomes a canonical relationship only when both endpoints have active bindings and the exact source/canonical predicate/type rules are valid. Otherwise it receives an append-only `pending_dependency`, `held_ambiguous` or `rejected` evaluation. Pending dependencies are reverse-indexed by source object and re-enqueued when a binding changes; legitimate arrival order is never quarantine.

Multiple source candidates may support one relationship. Losing one source closes only its support. The relationship becomes stale or ends according to source-authority and freshness rules.

## Relationship querying

PostgreSQL current-edge projection supports:

- paginated direct neighbors;
- direction, predicate and semantic filters;
- current or historical time;
- counts grouped by predicate/type;
- bounded two-hop paths for explicit product workflows.

The generic product API does not expose arbitrary graph traversal. UI visualization receives a bounded node/edge page and expansion cursors. The purpose-built agent exposure endpoint permits only registered, authorization-filtered paths of at most four hops so it can represent `agent_deployment → directory_account → team → resource` without an arbitrary query language. Each path carries its semantic/evidence class, source support and coverage. This prevents unbounded fanout and does not require Neo4j.

## Canonical activity

Activity is a customer-readable, evidence-backed event—not a finding.

Required fields:

- activity ID/version;
- tenant;
- family and subtype;
- event time;
- actor where supported;
- one or more resources;
- source profile and producer;
- outcome;
- native decision and observed effect where present;
- safe metrics;
- correlation/causal lineage;
- evidence IDs;
- capture and coverage state;
- normalizer/materializer/projection versions.

Families:

- application;
- agent;
- workload/process;
- session;
- model;
- MCP;
- tool;
- network;
- resource/file/upload/prompt;
- source/fleet;
- native control.

The executable subtype registry and the exhaustive source-stage mappings are [activity-types.yaml](ontology/activity-types.yaml) and [source-normalization.yaml](ontology/source-normalization.yaml). A normalizer build fails validation if a profile adds a stage without a canonical mapping; adapters and workers do not invent fallbacks at runtime.

## Lifecycle events

An execution can arrive as several source stages. Materialization groups only when a deterministic source correlation key exists:

```text
accepted → routed → stream_started → completed
requested → confirmation_required → confirmation_granted → started → completed
upload_observed → scan_requested → decision_received → effect
process_started → network_request → response → process_stopped
```

Later stages append a new canonical activity version. They do not mutate evidence.

If correlation is uncertain, stages remain separate related activities. The platform does not fabricate a single execution.

Decision and effect profiles remain distinct even when one native callback supplies both. Adapters persist the decision first, then a separately identified effect record after the outcome is observed. Normalization maps these to `native.decision` and `native.effect`; the canonical activity exposes `native_decision` and `observed_effect` independently. A decision never proves its intended effect occurred.

## Cross-sensor correlation

Order of evidence:

1. propagated trace context from one causal transaction;
2. exact shared source request ID with compatible namespaces;
3. exact session/producer/resource correlation;
4. deterministic parent/child link;
5. bounded temporal/resource candidate.

Only levels 1–4 can automatically establish lineage when profile rules explicitly allow it. Level 5 is a candidate/debug hint.

## Dedupe

Within a profile, dedupe uses stable source event ID or the producer epoch/sequence record identity. Across profiles, similar events are not dropped. They may become members of one canonical activity only through deterministic correlation, preserving every source observation.

`activity_source_binding` records every source activity identity as `(profile, producer, namespace, source_activity_id)` and binds it to the canonical activity with the accepted correlation level and evidence. Automatic bindings admit levels 1–4 only; an explicitly reviewed level-5 candidate records `binding_kind=reviewed`. This prevents identical native request IDs from different deployments from colliding and preserves every member when deterministic cross-source stages form one canonical activity.

Every canonical activity version also links to its exact normalized activity candidates and evidence. Lifecycle and visibility are versioned; retention appends tombstone/deletion versions and current projections show only active, visible activity.

## Coverage model

Coverage answers:

- which producer and capability should observe a population;
- which producer was healthy;
- which records were successfully admitted;
- which intervals are degraded, missing, unsupported or unknown;
- which inventory/activity assertions are backed by which coverage.

Coverage states:

- `covered`;
- `degraded`;
- `gap`;
- `unsupported`;
- `unknown`.

Expected populations come from configured deployment/enrollment and approved authoritative connectors. Absence of an event is not evidence of absence without an expected population and covered interval.

The physical denominator is `die_control.expected_population`. Every normalized coverage candidate carries the exact population type, source namespace and source population ID needed to address that registry. Every active producer capability receives a producer-scoped population of one at enrollment. Larger browser-installation, device, account, workload, gateway-route or MCP-surface populations require a signed deployment/connector binding with scope, environment, capability, expected count and authority reference. The truth worker resolves each coverage candidate to exactly one active population; no match or multiple matches yields `unknown` plus an operator-visible configuration conflict, never a guessed percentage.

## Reconciliation and absence

Continuous inventory uses snapshot streams in addition to deltas:

```text
snapshot started
→ zero or more ordered membership pages
→ completed with count + digest + completeness
→ truth verifies the exact producer/profile/scope run
→ absent prior source memberships may close only for a verified full snapshot
```

The source snapshot ID is scoped by tenant, producer, profile and declared scope. Pages are idempotent, bounded and may arrive again; conflicting content for the same page identity is quarantined. The truth worker verifies that every declared page is present, membership is unique, observed count matches, and the final digest matches the ordered normalized membership set.

`started`, `page`, `partial`, `unknown`, `failed`, timed-out, conflicting or incomplete runs never mean removal. They produce degraded/gap coverage. A verified full snapshot closes only the absent source’s support; canonical inventory remains active when another eligible source still supports it. This rule prevents outages, permission loss and truncated scans from mass-retiring the estate.

## Gap sources

- producer sequence intervals;
- explicit edge queue loss/eviction;
- heartbeat/freshness breach;
- unsupported browser/OS/transport surface;
- sensor disabled or permission missing;
- gateway route not instrumented;
- MCP handler surface missing;
- storage/admission backpressure beyond WAL budget;
- projection lag.

Projection lag is a product freshness gap, not evidence loss. They are shown separately.

## Overview semantics

Overview uses canonical entities and activities only:

- total active application products/surfaces/deployments, agent definitions/deployments, model products/deployments, MCP server products/deployments and tools;
- newly observed/retired/stale counts in selected period;
- activity volume and active users/workloads where actor support exists;
- covered/degraded/unknown source summary;
- recent material changes;
- ambiguity/conflict count.

It shows no risk score, severity, finding or policy recommendation.

Every number carries scope, time, canonical watermark, projection watermark and coverage disclosure.
