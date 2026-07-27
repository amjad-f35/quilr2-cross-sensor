# Canonical object model

## Shared entity contract

Every first-class canonical entity carries:

```text
canonical_id
tenant_id (null only for global catalog objects)
entity_type
lifecycle_state
governance_state
health_state
ownership_state
confidence
first_seen / last_seen
valid_from / valid_until
source_observation_ids
native_identifier aliases
field-level values + provenance + validity
conflicts
resolver/materializer version
merge/split/manual-override history
created_at / updated_at
```

**Proposed:** canonical IDs are opaque, immutable, non-semantic UUID/ULID values generated inside the tenant boundary. Strong business keys live in a versioned identifier registry; they are not embedded in the canonical ID.

The machine-readable list is [canonical-entities.yaml](schemas/canonical-entities.yaml). All 54 types have a strong-key rule in [entity-resolution-rules.csv](matrices/entity-resolution-rules.csv).

## Organization and identity

| Object | Definition / not | Scope and lifecycle | Product role / evidence |
| --- | --- | --- | --- |
| Tenant | Quilr isolation boundary; not a business unit | Global identity, tenant-scoped contents | Platform boundary |
| Organization Unit | Typed department/team/project/cost-center/legal-entity record; not a free label | Tenant; bitemporal | Facet/detail when used for ownership/allocation; requires IdP/HR |
| Human User | A person under issuer-qualified identity; not an email string | Tenant; active/inactive/terminated | Users/detail; Persona/gateway now, IdP authority external |
| Group | IdP or platform group with explicit subtype; not an array on user | Tenant; bitemporal membership | User/relationship context |
| Service Account | Non-human provider/application account; not a human with a shared email | Tenant; active/revoked | Accounts/credentials |
| Workload Identity | Runtime issuer/subject for a deployment; not an agent name | Tenant; temporal | Agent deployment identity; new integration |
| Credential | Metadata/fingerprint for key/token/cert; never the secret | Tenant; issued/active/rotated/revoked | Credentials page only when actionable |
| Session | Short-lived source correlation object; not durable inventory | Tenant; event-only | Activity drill-down |

## Products, surfaces, and accounts

| Object | Definition / not | Scope and lifecycle | Product role / example |
| --- | --- | --- | --- |
| AI Product | Global vendor product concept; not a tenant subscription, account, surface, or model | Global curated catalog | `Anthropic Claude`, `OpenAI ChatGPT` |
| Application Surface | Distinct access surface of a product; not every observation | Global/tenant-aware depending custom product | Claude Web, Claude Desktop, OpenAI API |
| Tenant Application | Tenant’s managed/discovered instance of a product/surface | Tenant; discovered→active/stale/retired | Primary AI Applications row |
| Application Installation | Device-local install/version/path observation | Tenant/device; temporal nested object | Claude Desktop on device X |
| Tenant Subscription | Commercial/enterprise subscription | Tenant; active/canceled/expired | Account/cost detail; connector/billing required |
| Application Account | Provider account used by a human/service | Tenant; personal/enterprise/unknown; active/revoked | employee@acme.com on Claude |

Do not merge web and desktop surfaces; connect both to one product. Do not merge a product with a model family or provider API. Do not infer enterprise account merely from corporate email.

## Runtime and model objects

| Object | Definition / not | Scope and lifecycle | Product role / example |
| --- | --- | --- | --- |
| Device | Managed/observed endpoint; not hostname alone | Tenant; active/stale/retired | Devices/context |
| Browser Instance | Browser installation/profile observation | Tenant/device; nested/temporal | Source detail |
| Endpoint Process | One process lifetime | Tenant/device; event-only | Activity/evidence |
| Model Provider | Global organization/operator supplying models | Global catalog | Anthropic, OpenAI, Azure OpenAI |
| Model Family | Product lineage/family; not exact callable ID | Global catalog | Claude, GPT |
| Model Version | Exact provider-qualified model identity | Global/tenant custom; released/deprecated/retired | Models row |
| Model Deployment | Tenant/provider callable endpoint/account/region | Tenant; active/degraded/retired | Models detail |
| Model Route | Gateway alias/routing configuration | Tenant; versioned configuration | Contextual route, not top-level estate by default |

**Verified:** LLM gateway fields support provider/model/route/usage observations, while endpoint detectors observe configured model/provider names. Exact deployment/region/account identity is incomplete. [LLM-DATA](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md), [EP-SCRIPT](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-scripting-packages-tests-and-documents.md).

## Agent objects

| Object | Definition / not | Scope and lifecycle | Product role |
| --- | --- | --- | --- |
| Agent Definition | Logical agent purpose/configuration root; not a runtime process | Tenant; draft/active/retired | Agents row |
| Agent Version | Immutable definition/config/artifact version | Tenant; released/superseded | Version facet |
| Agent Deployment | Governed deployment of a version | Tenant; active/degraded/suspended/retired | Agents deployment detail |
| Agent Runtime | One process/container instance | Tenant; nested/ephemeral | Activity/runtime facet |
| Agent Run | One goal/task execution | Tenant; event-only | Activity/outcomes |

An “Agent” typed result from endpoint discovery is an observation hint until repository/deployment identity is available. Agent name/path/application may create a review candidate but not an automatic cross-device merge.

## MCP, tools, and connectors

| Object | Definition / not | Scope and lifecycle | Product role |
| --- | --- | --- | --- |
| MCP Client | MCP-capable client instance/config; not the whole AI product | Tenant; active/stale/retired | MCP facet/page |
| MCP Server Product | Global known server product | Global catalog | Catalog |
| MCP Server Deployment | Tenant/host/account/transport-specific server | Tenant; active/degraded/retired | MCP Servers row |
| Tool | Server-qualified callable capability | Global/tenant; active/deprecated | Tools row/facet |
| Tool Version | Schema/capability revision | Nested/versioned | Versions facet |
| Connector | Global integration adapter product | Global catalog | Connector catalog |
| Integration Instance | Tenant configuration of a connector | Tenant; connected/degraded/revoked | Connectors row |
| Connected Account | Provider account reachable through integration | Tenant; active/revoked | Account/detail |

Endpoint `McpServer` can seed server observations; current tenant+name UUID cannot be canonical. A tool must be qualified by server identity and schema/version. External MCP Gateway source is required for authoritative client/server/tool-call semantics.

## Knowledge and data

| Object | Definition / not | Scope and lifecycle | Product role |
| --- | --- | --- | --- |
| Data Asset | Governed file/repository/table/document/resource identity | Tenant; active/versioned/retired | Data Assets only when actionable |
| Data Class | Classification taxonomy value | Global/tenant configuration | Filter/badge |
| Knowledge Base | Retrieval corpus/source exposed to AI | Tenant; active/stale/retired | Knowledge & Memory facet/page |
| Vector Index | Technical index behind KB | Tenant; nested | Operator detail |
| Memory Store | Long-lived agent/application memory | Tenant; active/retired | Knowledge & Memory |
| Prompt Template | Versioned reusable instruction/template | Tenant; configuration | Agent/application detail |

Prompt/response/file/clipboard text remains evidence or an event payload reference, not a Data Asset unless a stable governed asset identifier exists.

## Control, assurance, and economics

| Object | Definition / not | Scope and lifecycle | Product role |
| --- | --- | --- | --- |
| Gateway | Deployed LLM/MCP/API control plane | Tenant; active/degraded/retired | Coverage/estate |
| Sensor | Installed observing component/version | Tenant; healthy/stale/degraded/retired | Coverage |
| Enforcement Point | Sensor/deployment capability that can effect a decision | Tenant; healthy/stale/uncertified | Coverage/policy |
| Policy | Governed intent/scope/version | Tenant; draft/active/retired | Policies |
| Control | Concrete rule/configuration within policy | Tenant; versioned config | Policy detail |
| Exception | Temporal override | Tenant; active/expired/revoked | Policy detail |
| Approval | Human/system approval record | Tenant; event/config object | Activity/finding workflow |
| Decision | Point-in-time policy result | Tenant; event-only | Explainability |
| Finding | Correlated actionable condition | Tenant; open/suppressed/resolved/reopened | Findings |
| Evidence Record | Immutable provenance/integrity record | Tenant; retained/expired/legal hold | Privileged evidence |
| Certification | Assurance claim over artifact/version/capability | Tenant/global; valid/expired/revoked | Assurance detail |
| Cost Record | Provider/billing/rate-card economic fact | Tenant; event-only | Metrics |
| Outcome | Verified task/business result | Tenant; event-only | Cost/value detail |

## Candidate objects not promoted

| Candidate | Classification | Reason |
| --- | --- | --- |
| Business unit, department, team, project, cost center, legal entity | `Organization Unit` subtypes | One typed model avoids redundant identity logic |
| Region, environment | Attributes or first-class only when independently governed | Do not create empty micro-objects |
| API client, OAuth client, API key | Credential/Service Account/Integration attributes or subtype | Promote only when ownership/revocation/impact requires it |
| Fine-tuned/embedding/reranking model | Model Version subtype | Same identity/lifecycle rules |
| Agent session/sub-agent/template/owner/workload | Session/event, Agent Definition relationship, Prompt Template, ownership edge, Workload Identity | Avoid duplicating relationships as objects |
| File/repository/retrieval source/memory record/system instruction | Data Asset subtype, relationship, evidence, or Prompt Template version | Promote only with stable governed lifecycle |
| IDE/channel | Application Surface subtype/attribute | Separate page rarely actionable |
| Incident | Future first-class workflow object | Not evidenced as a current cross-sensor canonical need |

## State dimensions

Never store one overloaded `status`. At minimum:

```text
lifecycle: discovered | active | inactive | stale | retiring | retired | merged | superseded
governance: unknown | unmanaged | under_review | approved | restricted | blocked
health: unknown | healthy | degraded | failed | stale
ownership: owned | unowned | disputed
confidence: numeric + band
coverage: observed | not_observed | sensor_unhealthy | out_of_scope | unknown
```

An entity may be `active`, `unmanaged`, `healthy`, `unowned`, and `high confidence` simultaneously. “New,” “stale,” and “unowned” may also drive badges/findings, but are not the same state axis.
