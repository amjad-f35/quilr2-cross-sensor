# Golden scenarios

## Entity resolution

| Scenario | Expected assertion |
| --- | --- |
| Claude across browser/endpoint/LLM/MCP | One product; separate web/desktop/model/deployment/client/account/activity layers |
| Claude application vs model | Different entity types; relationship only |
| Personal vs enterprise Claude | Separate accounts; no email/name auto-merge |
| Ambiguous name | Candidate only; no auto-merge |
| Product domain changes | Validity-bound alias; old events retain old catalog version |
| Application rebrands | Same product only with curator decision/strong identifiers |
| One product, several domains | Several surface/domain aliases, one product |
| Similar product names | No merge without strong evidence |
| Manual merge reversed | Split restores observations/edges and replays projections |
| Source arrives after merge | Evaluated against current decision and validity |
| Out-of-order observation | Correct event-time state; no current-state regression |
| GitHub Copilot extension/model/service | Surface/product/model/service remain distinct |
| Same SaaS web/desktop | Shared product, separate surfaces/installations |
| Model alias to providers | One route, temporal targets, separate deployments |

## Event correlation

| Scenario | Expected assertion |
| --- | --- |
| Same upload seen by browser/native/proxy/gateway | One parent activity with child events and all evidence |
| Several events form one activity | Correlation decision records keys/score/window |
| Similar concurrent uploads | Remain separate on per-file/request/process IDs |
| Duplicate delivery | Observation/event idempotent |
| Replay | Same semantic projection version, no duplicate finding |
| Event after retirement | Entity reactivated or event linked historically per policy |
| Sensor clock skew | Learned/bounded offset recorded; no timestamp-only merge |
| Browser says blocked, endpoint sees effect | Contradiction retained; assurance finding candidate |
| Mixed native upload batch | Lower confidence/review because positional defect |

## Findings

| Scenario | Expected assertion |
| --- | --- |
| Several sensors support root cause | One finding; confidence increases by independent evidence |
| Condition remediated | Resolves only after exact close condition/window |
| Condition recurs | Reopens same dedup lineage/new generation |
| Sensor stale | Coverage finding; business finding confidence changes, not silent close |
| Sensor contradiction | Conflict visible; severity/confidence recalculated |
| One symptom disappears | Root finding stays open if condition/evidence remains |
| Duplicate source alerts | One root finding |
| Account type uncertain | Review/badge or low-confidence finding, not asserted personal account |

## Inventory lifecycle

| Scenario | Expected assertion |
| --- | --- |
| First observation | `asset.observed` then `asset.discovered` |
| Owner assigned | Ownership edge/version; unowned finding resolves |
| Becomes managed | Governance dimension changes; lifecycle unchanged |
| No longer observed | Not immediately absent; coverage-aware stale threshold |
| Retired | Lifecycle change with actor/reason; observations retained |
| Retired then active | Reactivation event and review |
| Account unknown→enterprise | Field/relationship version with source authority |
| Model deployment version changes | Deployment points to new Model Version; old history retained |
| Agent dependency changes | Relationship validity transition; possible approval finding |

## Tenant integrity

| Scenario | Expected assertion |
| --- | --- |
| Same product in two tenants | Shared global catalog ID, separate tenant entities/state |
| Native IDs collide | Tenant/source-qualified aliases remain separate |
| Tenant manually merges | Decision applies only inside tenant |
| Another tenant | Unaffected |
| Global catalog update | Presentation/alias candidate updates; tenant state not overwritten |
| Cross-tenant event/edge attempt | Rejected and audited |

## Contract tests

- JSON Schema validation for observations/events, including optional-source fields.
- Fuzz invalid/unknown native fields without data loss.
- Adapter idempotency and correction/tombstone behavior.
- Resolver rule version/replay determinism.
- Manual merge/split impact preview and rollback.
- Bitemporal “as known then” and “restated now” queries.
- Raw evidence hash and tenant access isolation.
- Outbox/projector duplicate, reordering, DLQ, and rebuild.
- Neo4j/ClickHouse/search reconciliation to PostgreSQL ledger.
- Metrics invariant: sum of source rows may change while canonical distinct count does not.

Detailed cases: [Claude](examples/claude-resolution.md), [ChatGPT](examples/chatgpt-resolution.md), [agent/model/tool](examples/agent-model-tool-resolution.md), [file upload](examples/cross-sensor-file-upload.md), [finding correlation](examples/finding-correlation.md).
