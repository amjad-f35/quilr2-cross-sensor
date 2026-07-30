# Capability Taxonomy and Customer Operating Workflows

Status: **normative completeness and scope model**

## Purpose

The 32-domain map is a completeness lens for requirements, ontology, authorization, evidence, and roadmap analysis. It is not:

- 32 navigation items;
- 32 services or repositories;
- a promise that every domain ships in the first GA;
- permission to invent data a launch source cannot support.

The 18 implementation domains in the corpus README remain the program decomposition. The minimal product navigation remains `Overview`, `Inventory`, `Insights`, `Analytics`, and `Policies`. Capabilities appear only when their gate, source authority, product contract, and GA evidence are complete.

## Product grammar

Every customer capability maps to at least one stable verb:

```text
discover
classify
govern
decide
enforce
observe
prove
investigate
remediate
evaluate
optimize
```

If a page, metric, event, service, or proposed feature maps to none of these and no customer outcome, it is debug/operator infrastructure or out of scope.

## Thirty-two-domain completeness lens

| # | Domain | Canonical concern | Product expression |
|---:|---|---|---|
| 1 | Organization / tenant / boundary | tenant, environment, region, business scope, trust zone | global scope, filters, administration |
| 2 | Purpose / intended use | approved use case and declared purpose | governance and policy context |
| 3 | Ownership / accountability | owner, steward, reviewer, oversight | inventory posture and workflows |
| 4 | Actor / subject | human, agent, workload, process, service | identity and activity |
| 5 | Identity / authentication / credential | account, principal, NHI, credential posture | contextual inventory and authority |
| 6 | Relationship / authority / delegation | association, grant, delegation, effective access | relationships and policy context |
| 7 | Inventory / discovery / managed object | canonical application, agent, model, MCP server/tool | primary Inventory |
| 8 | Composition / dependency / provenance | artifact, dependency, AI-BOM, supply chain | entity relationships and evidence |
| 9 | Lifecycle / version / change / retirement | first/last seen, state, version, rollout, reappearance | entity history and change |
| 10 | Compliance / legal / ethics / privacy | residency, retention, lawful use, control mapping | permissioned assurance/admin |
| 11 | Goal / intent / task | declared task or execution purpose | activity context where supported |
| 12 | Plan / workflow / session / run | execution grouping and step sequence | Activity and entity drill-down |
| 13 | Model / prompt / reasoning | model identity, route, prompt reference/class | Models and restricted activity context |
| 14 | Knowledge / retrieval / memory / state | knowledge base, vector index, memory surface | contextual inventory; later gated |
| 15 | Tool / connector / external system | MCP tool/server, integration endpoint | MCP & Tools and integration admin |
| 16 | Action / capability / effect class | canonical attempted operation and effect class | Activity, policy, findings |
| 17 | Target asset / resource | object or resource acted upon | relationships and activity detail |
| 18 | Data / payload / information use | safe data class, egress, upload, memory use | findings and policy, content-gated |
| 19 | Runtime / surface / channel / environment | browser, endpoint, gateway, connector, CI/CD | source coverage and surfaces |
| 20 | Context / sequence / behavioral state | bounded causal context and prior state | correlation, decisions, investigation |
| 21 | Policy / control / exception / obligation | policy source, exception, bundle, obligation | Policies |
| 22 | Decision / explanation | verdict, authority, reasons, policy/context version | decision history and findings |
| 23 | Enforcement / intervention / coverage | enforcement point, supported effect, actual coverage | Coverage and Policies |
| 24 | Execution / outcome / impact | attempted, invoked, succeeded, failed, blocked, verified | Activity and control effectiveness |
| 25 | Observability / telemetry | operational logs, traces, metrics, health | permissioned operations |
| 26 | Evidence / audit / replay | immutable proof, chain, replay, export | permissioned Evidence |
| 27 | Threat / vulnerability / attack path | governed threat taxonomy and reachable path | findings/investigation where supported |
| 28 | Finding / risk / posture / treatment | material condition and customer workflow | Insights and cases |
| 29 | Evaluation / quality / safety / red team | release/evaluation assurance | later capability gate unless launch-scoped |
| 30 | Assurance / certification / effectiveness | source certification and control proof | Coverage/Evidence |
| 31 | Operations / incident / resilience / recovery | SLO, incident, continuity, support | permissioned operations |
| 32 | Value / adoption / cost / FinOps | use, outcome, spend, efficiency | Analytics |

The concepts remain separate. Identity is not authority. Telemetry is not evidence authority. Decision is not enforcement. A finding is not an incident or overall posture. Certification is not current health or coverage.

## Thirteen customer workflows

| Workflow | Customer outcome | Primary product home | Minimum gate |
|---|---|---|---|
| AI estate discovery | know active AI applications/models with identity, owner, governance, and sources | Overview / Inventory | G2 |
| Source coverage and certification | know what Quilr can observe/enforce and where claims are degraded | Overview / Coverage | G2 |
| Policy and control lifecycle | author, review, simulate, stage, publish, rollback | Policies | G5 |
| Runtime action governance | decide and enforce at real chokepoints with evidence | Policies / Activity | G5 |
| Findings and investigation | receive grouped material conditions and complete resolution workflow | Insights | G2; agentic families G3 |
| Evidence, audit, and replay | prove provenance, decisions, effects, and rebuild correctness | Evidence | G2 |
| Identity, authority, delegation, and NHI | understand actor/workload identity and authority chains | Inventory facets / Resolution / Policies | G3 |
| Agent lifecycle and release governance | track definition, version, deployment, runtime, provenance | Agents | G3 |
| Tool, MCP, connector, and external-system governance | inventory and govern MCP/tool/integration surfaces | MCP & Tools / admin | G3 |
| Data protection and memory governance | govern privacy-safe data-class and memory/knowledge use | Insights / Policies | separate source/content gates |
| Evaluation, quality, safety, and red teaming | prove release/safety quality | permissioned assurance | separate capability gate |
| Operations, reliability, and incident response | operate sources/cells and respond safely | operator surfaces | G1/G2 |
| Value, adoption, and FinOps | attribute governed use, outcomes, and cost | Analytics | G4 |

“Minimum gate” means the first gate at which a coherent slice may become customer-facing. It is not a blanket guarantee that every feature named in the workflow ships at that gate.

## Workflow admission

A workflow reaches a release gate only when it has:

1. customer problem, persona, and supported decision/action;
2. feature-to-evidence trace;
3. source authority and coverage contract;
4. canonical object and lifecycle semantics;
5. API, UI, and authorization contract;
6. failure, empty, stale, partial, conflict, and not-evaluable states;
7. SLO, capacity, privacy, security, support, and migration evidence;
8. tested production artifacts and pilot acceptance.

## Product projection

The taxonomy collapses into the product as follows:

| Product area | Owns |
|---|---|
| Overview | estate, material change, risk, adoption/spend, coverage, next actions |
| Inventory | canonical applications, agents, models, MCP servers/tools and contextual facets |
| Insights | findings, cases, investigations, recommended and executed actions |
| Analytics | governed adoption, governance, risk, cost, reliability, control effectiveness |
| Policies | policy, simulation, approval, exception, deployment, decision/control state |
| Permissioned surfaces | Activity, Coverage, Resolution, Evidence, Administration |

No ontology-domain map may be rendered as a source-shaped spreadsheet or a permanent navigation layer.

## Roadmap boundary

The following are explicitly not implied by G2:

- full NHI/effective-access graph;
- agent creation/execution workspace;
- raw-content review;
- universal red teaming/evaluation;
- every control point in enforce mode;
- full cost/outcome attribution;
- graph-database or streaming-engine adoption;
- dedicated/on-prem/air-gapped support;
- every prospective external connector.

Those capabilities require their applicable later or optional gate.
