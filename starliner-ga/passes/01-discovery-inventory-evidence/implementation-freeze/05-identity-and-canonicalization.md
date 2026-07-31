# Identity and Canonicalization

## Identity layers

The platform keeps four identities separate:

1. **Producer identity:** authenticated emitting installation/runtime.
2. **Source-object identity:** strongest native identifier inside a profile namespace.
3. **Canonical entity identity:** centrally assigned UUIDv7 representing one enterprise thing.
4. **Presentation identity:** opaque API ID and customer-safe display fields.

No source ID is reused as a canonical ID. Every source ID remains queryable as an alias.

## Primary inventory ontology

The ontology preserves definition, deployment/configuration, runtime and activity as different layers.

Customer-facing primary classes:

- applications: `application_product`, `application_surface`, `application_deployment`, `application_account`;
- agents: `agent_definition`, `agent_deployment`;
- models: `model_product`, `model_family`, `model_version`, `model_deployment`, `model_route`, `provider_account`;
- MCP: `mcp_server_product`, `mcp_server_deployment`, `mcp_tool`, `mcp_resource_definition`, `mcp_prompt_definition`.

Context classes:

- `person`, `directory_account`, `service_principal`, `team`, `business_unit`;
- `device`, `browser_installation`, `endpoint_installation`;
- `llm_gateway_deployment`, `mcp_gateway_deployment`, `browser_backend_deployment`;
- `workload`, `workload_identity`, `provider`, `source_producer`, `source_object`;
- `session`, `resource`, `artifact_or_package`.

A product is not its deployment, installation, route, account or running process. A model product is not a model version or deployment. An MCP server product is not one local configuration or remote endpoint. An agent definition is not every process, project, session or request in which it runs.

### Definition, deployment and runtime invariants

For a local agent, the stable customer inventory row is one `agent_deployment` identified by:

```text
tenant
+ resolved agent_definition
+ exact device
+ source-authority installation/configuration scope
```

Project/workspace/repository, process ID/start time, session, run and version do not split that row. They are relationships, runtime workloads, activities or version history. The same agent definition on a second device or under a distinct source-authority installation scope is a different deployment. Observation user and execution identity are independent relationships: `UserContext` may describe who the sensor was observing, while exact process ownership comes from `ProcessInfo` UID/SID or another explicit native execution identity. Neither is inserted into the deployment key merely because it appears beside the discovery record. If an owning source explicitly defines a deployment as user-bound, exact execution identity may participate in that authority's key. A missing exact device or installation scope keeps the observation source-scoped and prevents an automatic cross-producer merge.

The same rule applies by layer elsewhere: browser origin/surface is distinct from product and account; an MCP server configuration is distinct from server product and its exposed tools; a model route is distinct from the model deployment it selects.

### Personal, organization, authenticated-unknown and flyby context

The canonical account/context model preserves what the Browser sources can actually prove:

- `personal`: authenticated personal account context;
- `organization`: authenticated corporate/organization-managed account context;
- `authenticated_unknown`: authentication is observed, but personal versus organization is not proved;
- `flyby`: unauthenticated or ephemeral use without a durable account binding;
- `unknown`: the source cannot prove the context.

The current extension emits `Guest` or `CredsBased`; normalization maps those to `flyby` or `authenticated_unknown`. The downstream Quilr 1 field `account_usage_type` contains `personal|guest|corporate`, but its writer was not found in the audited repositories. It may produce `personal`, `flyby`, or `organization` only after the exact writer and authority are proved. This is an observed application-account context claim, not approval or risk. A stable source-authority application account ID may resolve to `application_account`. A stable Browser `observed_identity_source_id` may resolve only to a source-scoped `directory_account`; account name, full name and email remain sensitive claims. An endpoint or directory principal resolves separately to `directory_account`; either can bind to `person` only through an exact trusted issuer/subject or authoritative identity connector. A flyby observation without a stable account ID remains on session/activity and must not be merged across sessions by cookie, display name, domain, email, or timing.

## Source-object key

```text
(tenant_id, producer_id, source_profile, source_namespace, source_object_type, source_object_id)
```

`producer_id` prevents independently enrolled emitters from colliding even when one is buggy or underspecifies its namespace. `source_namespace` additionally includes the source-native authority necessary to preserve meaning:

- browser installation/device/application/account namespace;
- endpoint device/scanner/component namespace;
- LLM provider/account/deployment/gateway namespace;
- MCP gateway/backend/server namespace;
- browser-backend repository/service namespace.

The raw source ID may be long. Comparison uses the full value; indexes may add a generated digest but never discard the original.

## Strong identity keys

| Entity | Automatic keys |
|---|---|
| Application product | authoritative catalog object; OS publisher/product ID; stable source-native product ID |
| Application surface | resolved product plus surface authority ID; browser origin only under an authoritative catalog mapping; producer-scoped native surface ID when no product mapping exists |
| Application deployment | authoritative deployment ID; resolved product, exact device and installation scope |
| Application account | resolved application plus source-authority account ID |
| Agent definition | authoritative definition ID; vendor/product/distribution ID; stable source-native definition ID |
| Local agent deployment | authoritative deployment ID, or resolved definition plus exact device and source-authority installation/configuration scope; exact execution identity participates only for an explicitly user-bound source key |
| Remote/cloud agent deployment | authoritative deployment/workflow ID within the owning platform authority |
| Model product/family/version | provider authority plus immutable provider IDs at the corresponding layer |
| Model deployment | provider account plus deployment/endpoint ID and region where relevant |
| Model route | gateway authority plus route ID |
| MCP server product | registry/authority product ID or stable source-native server definition |
| MCP server deployment | authoritative deployment ID, or resolved server plus configuration scope, transport and credential-free origin |
| MCP tool | resolved server deployment plus native tool ID and schema/version digest |
| Person | trusted identity issuer plus subject |
| Directory account | directory/OS authority plus account ID, SID, UID or principal ID |
| Device | MDM/hardware/platform device ID according to approved precedence; otherwise producer-scoped native device ID that cannot cross-producer merge without signed local binding or later MDM authority |
| Workload | orchestration authority ID or host, boot epoch, process ID and process-start identity |

Email, display name, hostname, URL, origin, process name, tool name and model label are never sufficient global keys.

## Resolver pipeline

1. Load current source object, identifier claims and existing binding.
2. Apply type compatibility and tenant boundary.
3. Evaluate immutable exact keys.
4. Evaluate authoritative connector assertions.
5. Evaluate constrained composite keys.
6. Apply negative constraints.
7. Score remaining candidates for review only.
8. Produce `create`, `bind`, `no_match` or `ambiguous`.
9. Persist the complete decision and input claims.
10. Materialize only after the decision commits.

## Resolver framework and type modules

There is one resolver framework, not one universal matching algorithm. The
framework owns tenant boundaries, candidate bounds, locking, deterministic
decision persistence, ambiguity, conflicts, merge/split/alias history, replay
and audit. It dispatches through a versioned registry keyed by canonical entity
type to type-specific resolver modules:

- people, directory accounts and service principals;
- devices, browser installations and endpoint installations;
- application products, surfaces, deployments and accounts;
- agent definitions and deployments;
- model products, versions, deployments and routes;
- MCP server products/deployments, tools, resources and prompts;
- workloads, sessions, resources, repositories and artifacts.

Each module declares its accepted source types, exact/composite keys, negative
constraints, authoritative connector assertions, candidate-query bounds,
authority-policy version, resolver name/version/rules digest and positive,
negative, ambiguity, merge, split and replay fixtures. A missing module yields
`no_match`/unsupported coverage; it never falls through to fuzzy global
matching. Cross-type binding requires an explicit compatibility rule.

## Automatic versus reviewed resolution

Automatic binding is allowed only when:

- an exact strong key matches one active entity; or
- an authoritative connector explicitly maps the objects; or
- a previously reviewed binding remains valid and no negative constraint appears.

Names, domains, URLs, process similarity, timing, co-occurrence and fuzzy matching can rank candidates but cannot auto-merge in this pass.

This conservative rule eliminates an uncalibrated probabilistic threshold as a build blocker. Evaluation later may promote a new deterministic rule through a versioned resolver release.

## Negative constraints

Binding is forbidden when any applicable condition holds:

- different tenants;
- incompatible entity classes;
- different authoritative issuer subjects;
- same tool name under different unresolved MCP servers;
- model deployments under incompatible provider accounts where account is part of identity;
- distinct authoritative device IDs;
- source explicitly declares separate objects;
- active manual split/correction constraint;
- lifecycle intervals prove mutually exclusive identities.

Negative constraints outrank positive weak evidence.

## Field authority

Identity resolution selects entity membership. Field materialization separately selects values.

For each canonical field the authority policy defines:

- allowed source profiles/classes;
- precedence;
- freshness window;
- whether empty can clear;
- conflict handling;
- sensitivity;
- normalization function.

Example:

```text
model_product.provider_model_id:
  provider/gateway native ID > declared configuration > endpoint inference

application_product.owner:
  authoritative IdP/CMDB > explicit tenant configuration > no owner

entity.last_observed_at:
  maximum eligible direct observation time
```

The platform never invents an owner from “most frequent user.”

## Entity lifecycle

States:

- `active`: at least one eligible current source supports presence;
- `inactive`: source explicitly reports inactive/disabled;
- `stale`: expected source freshness expired without an explicit tombstone;
- `retired`: authoritative source declares removal and retention rule closes lifecycle;
- `ambiguous`: unresolved membership/conflict affects presentation.

A source tombstone closes that source’s claims. It does not automatically delete an entity still supported by another source.

## Merge, split and correction

### Merge

- persist a short-lived tenant/principal-bound preview of impacted entities, bindings, relationships, activity, saved references and API aliases;
- choose survivor canonical ID;
- append merge decision;
- redirect active bindings;
- rematerialize fields/relationships/activity;
- keep predecessor IDs as permanent aliases;
- audit actor/reason/evidence.

`resolution_decision_entity` records every source, target, created, restored, retired and survivor participant. `entity_alias` is bitemporal and cycle-protected, so old API IDs resolve deterministically without erasing history.

### Split

- persist a short-lived preview of the partition of source objects and claims;
- create or restore successor entity IDs;
- move bindings by explicit decision;
- rematerialize affected data;
- preserve the erroneous merge and correction history.

### Field correction

A correction is an append-only high-authority `correction_claim` with command, actor, reason, scope and validity. `entity_version_correction_claim` records exactly where it was selected. It does not mutate source evidence. A later authoritative source can create a visible conflict; it cannot silently overwrite a protected correction.

All merge, split, bind, unbind and correction commits carry `preview_id`, `preview_digest`, `If-Match` and `Idempotency-Key`. A preview stores the normalized request server-side, so commit never depends on reconstructing an action from a digest. Expired, consumed, principal-mismatched, scope-mismatched or revision-stale previews fail closed.

## Explainability

Entity identity endpoint returns:

- canonical ID/type/version;
- active and historical source bindings;
- strong keys used;
- claims selected for each displayed field;
- rejected/conflicting candidates;
- resolver/materializer versions;
- corrections/merge/split history;
- linked evidence IDs;
- ambiguity and freshness.

The default UI summarizes this. Authorized users can inspect full provenance.

## Determinism

Given the same:

- evidence set and order-independent content;
- normalizer version;
- resolver rule digest;
- authority policy;
- correction ledger;
- canonical starting watermark;

materialization must produce the same canonical versions and digests. Generated IDs are recorded decisions and reused on replay; replay does not create new IDs for already decided source objects.
