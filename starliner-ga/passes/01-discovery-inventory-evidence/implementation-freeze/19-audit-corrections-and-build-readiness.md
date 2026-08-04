# Audit Corrections and Build Readiness

> **Historical evidence record:** retain the corrections and tests in this
> document, but do not use its dated readiness wording to schedule current
> implementation. Documents 40 and 41 are the active build authority.

**Status:** required acceptance record

## Why this record exists

The freeze previously contained claims that exceeded the audited sensor evidence. That is unacceptable for a production source of truth. This record identifies the corrections, the controls that now prevent recurrence, and the exact meaning of “ready to build.”

## Corrections made

| Prior problem | Evidence-based correction | Enforced by |
|---|---|---|
| Browser profile was treated as a current source object. | No stable `browser_profile_id` was found. `browser.profile` was removed from the Browser schema, bindings, canonical current-pass ontology, OpenAPI enum, SQL enum and tests. | Browser schema, entity ontology, profile capability register, validators |
| Browser→Endpoint relationship examples assumed a profile. | The new signed local binding addresses `browser_installation → Endpoint device`. It is `new_capture_required` and cannot materialize without a valid signed assertion. | Browser schema, source normalization, REL-X-001 |
| Cross-sensor relationship storage was described as if both endpoints shared one producer. | Normalized references and SQL store observing, subject and object producer identities independently. No cross-producer candidate is valid without both qualified references. | normalized-observation schema, SQL DDL, contract negative fixture |
| Endpoint `UserContext` was treated as execution identity. | It is observation context. `executed_as` requires exact `ProcessInfo` UID/SID mapping or another explicit native identity. UI exposes `observed_user` and `execution_identity` separately. | Endpoint profile, REL-EP-004/008, Agent DTO/SQL/UI lineage |
| Local agent identity always required execution identity. | Current deployment identity is authoritative deployment ID, or definition + exact device + source-authority installation/configuration scope. Exact execution identity enters only an explicitly user-bound source key. | entity ontology, decisions register, API and UI contracts |
| Endpoint profile included unsupported workload identity, model runtime/version/deployment, MCP tools/resources/prompts, file, IDE extension and browser profile types. | The source enum is restricted to deterministic outputs from the exact nine native `EntityKind` variants plus device/user/process context. | Endpoint schema and profile-entity disposition |
| Endpoint `PermissionData` could be mistaken for enterprise permission. | It becomes `configured_permission_rule`; enterprise entitlement predicates require future authoritative connectors. | ontology, field register, relationship register |
| LLM/MCP optional agent labels could be promoted to local agents. | Optional agent/workflow objects require stable native IDs and remain source-scoped; Endpoint attribution requires signed request binding or exact authoritative mapping. | profile-entity disposition, REL-X-002/003 |
| Relationship register used composite endpoint strings and predicates not valid in the ontology. | Every row now contains one exact canonical subject, predicate and object pair and is validator-checked against the predicate registry. Identity equivalence is a resolver binding, not a `same_as` graph edge. | relationship-support register and validator |
| Only Agents had a typed UI read model. | Applications, Models, MCP servers, Devices and Identities now have typed list/detail operations, DTOs, PostgreSQL projections, RLS, indexes and UI bindings. | OpenAPI, SQL, screen/API matrix |
| Important UI fields could still be invented from generic attributes. | Every primary visible field now has a native/profile/canonical/read-model/API/UI lineage row and an explicit unknown behavior. | UI field lineage register and validator |

## What is verified about current sources

The audited code supports the facts marked `adapter_derivable`; it does not currently emit the frozen Starliner profiles.

- Browser: installation/runtime metadata, Browser-native device/heartbeat context, origin/application, persona context, `Guest|CredsBased`, action/upload/native outcome and health seams.
- Endpoint: exact nine `EntityKind` variants; `DeviceContext`; `UserContext`; `ProcessInfo`; application/scanner artifacts; prompt-turn and process/proxy/hook/native control seams.
- LLM Gateway: `llmgateway_logs_v3` request/identity/observability/tools/features metadata and routed invocation/control lifecycle.
- MCP Gateway: backend registry/capabilities, `mcp_tool_calls_v2`, `mcp_events_v2`, `mcp_rejected_requests_v2`, and separately instrumentable Direct/OneMCP/native/workflow surfaces.
- Browser Backend/Quilr 1/Better Console: continuity evidence and useful presentation semantics only; they are not target canonical authority.

The exact native fields and paths are in:

- [sensor capability register](registers/sensor-capability-register.csv);
- [field disposition](registers/field-disposition.csv);
- [profile entity disposition](registers/profile-entity-disposition.csv);
- [source traceability](16-sensor-capability-and-field-traceability.md).

## New implementation required

These are deliberate implementation requirements, not claims about current code:

- privacy-safe source adapters and generated profile bindings;
- durable edge WAL/outbox for every producer;
- authenticated ingest and immutable evidence;
- bounded reconciliation snapshots and explicit gap intervals;
- Browser-installation↔Endpoint-device signed local binding;
- signed Endpoint agent/workload attribution into LLM/MCP requests where desired;
- deterministic source normalizers;
- continuous identity resolution and correction;
- canonical entity/relationship/activity/coverage materializers;
- central transactional outbox and rebuildable read projections;
- product authorization, typed APIs and live Nuxt integration.

The registers mark these facts `new_capture_required` where the desired native correlation, snapshot or gap record does not exist today.

## Deliberately unresolved source truth

These do not authorize improvisation:

| Unresolved truth | Frozen behavior |
|---|---|
| Writer/authority of Quilr 1 `account_usage_type=personal|guest|corporate` | Use Browser `Guest→flyby`, `CredsBased→authenticated_unknown`; omit stronger classification until writer authority is proved. |
| Browser and Endpoint represent the same physical device | Keep separate unless exact approved ID, authoritative mapping, reviewed correction, or valid signed local binding exists. |
| Endpoint MCP config equals MCP Gateway deployment | Keep separate unless exact gateway deployment/server ID or authoritative mapping exists. |
| Gateway agent label equals Endpoint local agent | Never auto-bind; require signed request attribution or exact authoritative client mapping. |
| Optional provider/model layers are present | Emit only the strongest actual layer; return null/unknown/unsupported for absent layers. |
| Parent application string maps to one application | Quarantine ambiguous edge; keep child source object and evidence. |
| Current coverage is complete | Report unsupported/unknown until snapshot/gap and artifact certification pass. |

## Future connector boundary

Enterprise people/groups/organization, roles/permissions/credentials, filesystem ACLs, cloud/IAM, SaaS, source-control and complete resource reachability are recorded in [future connectors](18-future-authoritative-connectors.md). No current sensor field is allowed to masquerade as that authority.

## Automated acceptance

The package validator checks:

- every required document/artifact exists and parses;
- OpenAPI references, operations and UI operation/capability bindings;
- ontology/OpenAPI/PostgreSQL entity-type equality;
- every profile payload kind has a support disposition;
- every Endpoint/LLM/MCP entity enum has an exact canonical disposition matching normalization;
- every relationship row is one valid ontology pair;
- unsupported/future/unresolved/legacy relationships cannot auto-materialize;
- every primary UI field has a complete evidence-to-screen chain;
- cross-producer normalized source references require producer/profile/namespace/type/ID;
- read-model/RLS/provenance/worker/storage invariants.

The executable schema corpus validates all JSON Schemas and positive/negative fixtures, including rejection of:

- a prohibited fact admitted into delivery;
- accepted receipt without durable evidence ID;
- cross-sensor relationship missing an object producer;
- local binding missing its signature;
- invalid decision/effect conflation;
- invalid attribution without signature;
- reconciliation pages without digests.

## Readiness verdict

After team acceptance:

- **Ready to implement:** the whole bounded target architecture, adapters, central spine, canonicalization/materialization, typed read models/APIs, authorization and Nuxt UI.
- **Not already implemented:** the majority of that target.
- **Not allowed to advertise:** any producer/capability before artifact-specific conformance, privacy, WAL/replay, coverage and performance certification.
- **Not in this pass:** findings/intelligence, policy orchestration, complete enterprise entitlement, migration/cutover, and deployment-portfolio decisions.

No coding agent may treat a plausible field as supported. It must either point to the corresponding evidence/disposition row or add a reviewed contract change with source evidence and tests.
