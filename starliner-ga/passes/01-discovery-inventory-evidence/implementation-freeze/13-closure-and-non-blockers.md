# Closure, Blockers, and Change Control

## Direct answer

For the bounded Discovery, Inventory, Activity/Observability and Evidence pass,
the architectural boundaries and semantic contracts are now sufficiently
specific that a coding agent does not need to invent the spine. The independent
falsification pass nevertheless proved that the previous “no blocker” statement
was too strong: real PostgreSQL and ClickHouse execution, object-store retention
races, native sensor certification, cross-language
cryptographic vectors and the live Nuxt seam remain explicit evidence gates.

The earlier package was too coarse: it used single `application`, `agent` and
`mcp_server` types despite the parent pass requiring
definition/deployment/runtime separation. Later reviews also found executable
DDL ordering, authorization revision, producer control, cross-sensor replay,
evidence lifecycle projection and ClickHouse determinism defects. Those source
defects are corrected and tracked in
`registers/defect-closure-ledger.csv`. `LG-008` is now linked to its
content-addressed five-profile source authority; the remaining live gates are
not described as passed.

No open semantic decision is known for the selected-source facts after the
bounded source-level falsification and zero-drift saturation passes, and a
coding agent is not permitted to improvise in these areas. A later source
revision, runtime contradiction or failed live gate reopens the minimum
affected contract:

- source versus canonical identity;
- sensor/adapter/Starliner responsibilities;
- envelope/profile/receipt semantics;
- edge and central outboxes;
- ingest acknowledgement;
- evidence authority;
- normalizer behavior;
- identity rules and corrections;
- canonical definition/deployment/runtime entities, relationships, activity and coverage;
- local-agent identity and row-collapse semantics;
- application AI/non-AI classification semantics;
- configured versus entitlement versus observed relationship semantics;
- typed application/agent/model/MCP/device/identity read models, hydrated details and bounded relationship/exposure paths;
- materializer/projector boundary;
- databases and authority;
- foreign-keyed provenance/support ledgers;
- worker leasing/idempotency/replay;
- tenant-root and producer/expected-population bootstrap;
- RBAC/ABAC/ReBAC and field security;
- discriminated identity/authz/export mutation contracts;
- customer API, pagination, consistency and errors;
- Nuxt data seam/routes/states;
- performance/reliability/observability approach;
- repository/module ownership;
- GA verification.

“Frozen” means the intended system is determined. It does not mean the missing implementation already exists. The audited `project-starliner` contains a valuable foundation, but most central truth, projection, product API/authz and UI integration work must now be built.

It also does not mean four sensors can prove a complete Microsoft-style enterprise exposure graph. They can build an interconnected observed/configured estate for the things inside their certified coverage. Complete people/groups/roles/permissions/credentials/cloud/SaaS/repository/resource reachability requires separately scoped authoritative connectors. Without them, the product must report entitlement coverage as `unsupported` or `unknown`.

## Closed architecture questions

| Question | Frozen answer |
|---|---|
| Monolith or microservices? | modular monolith in source/authority, independently replicated role processes |
| Central language? | Go |
| Contracts? | JSON Schema 2020-12, ontology/authz registries, OpenAPI 3.1, generated bindings |
| Edge? | source adapter + Starliner SDK/sidecar responsibility + durable WAL |
| Ingest? | authenticated/profile-certified, content-addressed evidence, per-record receipt |
| Queue? | PostgreSQL atomic handoff/leased work initially; canonical transactional outbox |
| Identity? | continuous central resolution from source-native claims; exact-only auto-binding; application accounts, directory accounts and people remain distinct |
| Asset layering? | product/definition, deployment/configuration, runtime/session and activity are separate |
| Local agent row? | agent definition + exact device + source-authority installation/configuration scope; observation user and execution identity are separately evidenced; project/process/session/version never split it |
| Inventory truth? | PostgreSQL canonical version ledgers |
| Relationships? | typed bitemporal PostgreSQL edges with structural/configured/entitlement/observed separation; generic two-hop and purpose-built four-hop agent exposure API |
| Activity? | canonical evidence-backed events; ClickHouse search projection |
| Evidence? | immutable object bytes + PostgreSQL metadata/lineage |
| Provenance? | immutable foreign-keyed claim/candidate/evidence/resource/relationship support ledgers |
| Materialization? | central truth worker; projectors are disposable |
| Rebuild? | one synchronized product generation, frozen required-partition manifest, snapshot+tail, all-partition acknowledgement, verify, active/standby swap, rollback, then retirement |
| Authorization? | in-process typed RBAC/ReBAC/ABAC kernel + field masks + RLS |
| Bootstrap? | signed one-time tenant-root transaction, then signed revisioned producer/capability/population/certification enrollment |
| UI? | existing Nuxt/shadcn app through generated API client; no production fixtures |
| Extra databases? | none required; no Redis/Neo4j/Kafka/search authority |
| Failure semantics? | at-least-once work, idempotent durable effects, explicit gaps/backpressure |
| Quality? | digest-bound certification and full GA gates |

## Inputs and live evidence required before production implementation/GA

These must not be guessed in source code. `LG-001` and `LG-002` block broad
domain implementation beyond the conformance harness. `LG-003` through
`LG-007` block their respective retention/erasure, sensor-runtime, crypto and UI
claims and all remain GA blockers. `LG-008` static source closure is complete.

| Binding | Needed for | Owner output |
|---|---|---|
| production OIDC issuers, audiences, claims and group mapping | authentication | approved identity configuration |
| service/workload identity issuer and trust roots | producer/API service auth | approved trust bundle |
| KMS/HSM key aliases and rotation schedule | encryption/signing | environment key configuration |
| PostgreSQL/object/ClickHouse endpoints and credentials | runtime | secret references, never committed values |
| data residency and approved region routing | placement | environment deployment values |
| retention classes, legal-hold rules and raw-evidence policy | lifecycle | approved policy configuration |
| supported browser/OS/provider/MCP versions and permissions | advertised coverage | profile certification matrix |
| built sensor/adapter/runtime artifact digests | admission trust | certification records |
| authoritative IdP/MDM/cloud/IAM/SaaS/repository/ACL connector roster and mappings | complete enterprise identity and entitlement exposure, if added to this pass | accepted connector scope and certified source profiles |
| cell resource topology and autoscaling bounds | performance | capacity certification manifest |
| contractual RPO/RTO and SLA | operations | environment service tier |
| alert destinations, on-call rotations and named owners | operations | ownership bindings |
| customer-facing domains/certificates | exposure | deployment configuration |

An absent runtime binding results in disabled/unadvertised capability or deployment failure. An absent entitlement connector results in `unsupported` or `unknown` entitlement coverage, not a guessed edge or a deployment failure.

## Evidence required before claiming GA

Implementation begins with the live conformance harness and frozen module
boundaries. Broad domain construction proceeds after PostgreSQL and ClickHouse
gates pass. GA is not declared until:

- every schema/OpenAPI/ontology/authz artifact validates;
- all target modules exist and architecture tests pass;
- each advertised sensor/profile artifact is certified;
- PostgreSQL/object/ClickHouse migrations and restore pass;
- end-to-end native fixture to Nuxt works for all five profiles;
- resolver/field-authority corpora pass;
- tenant/scope/field/raw-evidence isolation passes;
- load objectives pass and queues drain;
- replay/rebuild/activation/rollback passes;
- failure/chaos proves no acknowledged evidence loss;
- production UI has no fixture/deferred truth;
- runbooks/dashboards/alerts/support diagnostics exist;
- signed artifact/SBOM/provenance gates pass.

These are proof gates, not design gaps.

## Intentionally deferred and prohibited dependencies

The pass does not wait for or build:

- findings, intelligence, risk/severity, recommendations;
- AI-use policy authoring/decision engine;
- central enforcement orchestration/approval/remediation;
- cost, spend, value, budgets or FinOps;
- final shared/dedicated/BYOC/on-prem/air-gapped portfolio;
- Quilr 1 migration/cutover mechanics;
- licensing/billing/entitlements beyond product-data authz;
- complete cloud/SaaS/repository/resource inventory and reachability from sources outside the four owned sensors;
- arbitrary graph database/traversal;
- raw customer content capture by default.

None of those may be pulled into pass modules as a hidden prerequisite. The pass emits stable canonical/evidence foundations they can consume later.

## What a coding agent receives

The agent must read, in order:

1. this package README and authority order;
2. architecture and current implementation disposition;
3. protocol/profile schemas;
4. physical DDL and worker transactions;
5. identity/ontology/materialization specifications;
6. authorization model;
7. capability, profile-entity, field, relationship and UI-field-lineage registers;
8. OpenAPI and UI matrix;
9. performance and GA gates;
10. repository/disposition/authority registers.

It may then divide implementation into delivery increments, but no increment may redefine the frozen end state.

## Change control

Requires an ADR and updated artifacts/tests:

- moving an authority;
- adding/removing an identity key or automatic resolution rule;
- changing a profile field meaning, predicate or activity correlation rule;
- weakening admission, privacy, tenancy or authorization;
- changing transaction/idempotency boundaries;
- adding a state technology or synchronous service hop;
- changing product API semantics;
- allowing a projection/UI/sensor to write canonical truth;
- relaxing a GA gate.

Batch size, worker count, index selection and private code organization may change after measurement if observable semantics remain identical.

## Final status

```text
architecture: internally validated freeze candidate; team acceptance required
protocol and profiles: internally validated and evidence-gated
storage and authority: source-corrected; PostgreSQL/ClickHouse live gates blocked
distributed processing: frozen
identity and canonicalization: frozen
relationships activity coverage: frozen
connected observed/configured four-sensor estate: frozen
enterprise entitlement/cloud reachability: unsupported unless authoritative connectors are separately accepted
authorization and audit: frozen
typed API boundary: internally validated
existing Nuxt seam: reusable shell; live repository/client binding blocked
reliability and verification: frozen
current implementation: partial foundation
full pass implementation: begin with conformance; broad build blocked by LG-001/LG-002
production GA: requires implementation plus environment certification evidence
```
