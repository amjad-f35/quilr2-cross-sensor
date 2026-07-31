# Sensor versus platform responsibilities

| Concern | MCP Gateway product | MCP adapter/Starliner runtime | Central platform | Must not happen |
| --- | --- | --- | --- | --- |
| native protocol semantics | execute MCP, know Direct/OneMCP/session/control phase | capture typed safe lifecycle DTO | normalize/query canonical event | infer protocol phase from logs alone |
| source identity | own backend/tool/session/request native IDs | namespace and preserve source identifiers | resolve canonical entity | sensor mint canonical identity |
| human/account identity | authenticate and expose safe source claims | pseudonym/identity candidate and provenance | reconcile with IdP/IAM | email alone becomes person authority |
| content privacy | enforce native DLP and avoid unnecessary copies | allowlist/map/reference under privacy profile | authorize evidence access/retention | ordinary telemetry contains raw content/secrets |
| native policy/effect | enforce tool/settings/DLP/ZIA/confirmation | record decision/control/effect safely | policy authoring/distribution/cross-source assessment | telemetry ack acts as command |
| canonical relationships | provide direct/config/runtime facts | propose source relationships with authority | materialize/version/expire graph | configured relationship claimed as observed use |
| canonical events | provide exact lifecycle/outcome | map source event candidate | correlate/dedupe/version across sources | one call’s records appear as separate actions |
| metrics | expose native counters/measurements | normalize samples + coverage | aggregate with resolved IDs/windows | ratios lack denominators/loss context |
| findings | emit bounded signals only | preserve evidence references | group/severity/owner/lifecycle/action | sensor emits customer finding |
| outbox | no response dependence | validate/durably queue/replay/deliver | idempotent admission/receipt | central edits local DB |
| health | expose runtime/capability/loss | emit durable health | source coverage materialization | silence treated as healthy/absent |
| commands | native service methods/read-back | typed authenticated adapter/result | authorize/orchestrate/audit | raw SQL mutation |
| certification | supply representative native paths | run profile/golden/privacy/replay tests | admit supported version/capabilities | manifest declaration equals certification |
| deployment | define replica/state topology | instance/workload identity/epoch | deployment inventory/coverage | share process-local assumptions across replicas |
| retention | source-local safe spool policy | terminal/raw metadata policy | tenant/legal/evidence lifecycle | indefinite sensitive logs by default |

## Decision authority

### Sensor/product authority

- whether upstream was actually invoked by this handler;
- native DLP outcome and whether input/output was replaced/blocked;
- current backend/tool configuration and registry rows;
- native confirmation result;
- native API/OAuth/workflow state;
- local outbox/delivery transition.

### Adapter authority

- which safe fields were captured;
- mapping/normalization version;
- source record identity/idempotency;
- collection method/scope/confidence;
- privacy disposition;
- capability and health declaration.

### Central authority

- canonical MCP server/tool/person/account/agent/model identity;
- merges/splits/aliases;
- relationship materialization across sources;
- canonical event grouping;
- customer finding severity/owner/status;
- cross-sensor metrics/product views;
- policy/command authorization;
- global source coverage.

## Special rules

1. A source delete retires that source assertion, not automatically the
   canonical entity.
2. A command acceptance is not an observed effect.
3. A block after upstream execution is not prevention.
4. A configured backend/tool is not proof of use.
5. Missing observation is unknown unless source health/scope/delta semantics
   prove absence.
6. Two derived representations of one gateway row/event are one observer.
7. Central canonical bindings may be supplied back to the sensor as versioned
   references, but the sensor does not decide them.

