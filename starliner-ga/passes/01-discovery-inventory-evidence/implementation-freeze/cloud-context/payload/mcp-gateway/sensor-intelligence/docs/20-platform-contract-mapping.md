# Platform contract mapping

All target rows are `Proposed`. Current availability is stated explicitly.

## Observation mapping

| Native source | Current record | Target record | Mapping | Availability | Required correction |
| --- | --- | --- | --- | --- | --- |
| backend registration | `SourceObservation` | source observation: MCP server definition upsert | tenant, sensor, source object type, backend native ID, transport claim, observed time | `Available now without sensor changes` | remove producer canonical ref; add namespace/method/operation/revision |
| tool discovery | `SourceObservation` | source observation: MCP tool definition upsert | backend-scoped tool native ID/name/time | `Available now without sensor changes` | snapshot/delete/completeness and safe schema metadata |
| call-time tool sighting | `SourceObservation` | source observation: tool last-seen/activity provenance | backend/tool + call correlation | `Available now without sensor changes` | correct identity boundary |
| Direct tool result | `ActionEvent` | canonical event candidate `mcp.tool.called` | actor pseudonym, source tool/backend, operation, outcome, latency, labels | `Available now without sensor changes` | central entity resolution; surface/phase/error/decision detail |
| DLP block | `FindingSignal` | source-local signal + action governance | tool/event, input/output block reasons | `Available now without sensor changes` | central finding admission; control component/decision evidence |
| call/latency metrics | `MetricEvent` | canonical metric samples | metric/type/value/unit/dimensions/time | `Available now without sensor changes` | resolved entity dimensions and coverage/loss denominator |
| native event/rejection logs | SQLite records | canonical auth/admin/control/failure event candidates | strict allowlist | `Available through adapter mapping only` | new DB adapter/checkpoint/privacy contract |
| tool-call logs | SQLite records | richer MCP action candidate/evidence | safe projection only | `Available through adapter mapping only` | correlation/dedup and content exclusion |
| workflow records | gateway/runner DB | agent run/step/tool/action candidates | IDs/status/times/limits/effects | `Available through adapter mapping only` | separate process extraction + cross-system correlation |
| OneMCP native/session behavior | memory/handler events | MCP session/native action events | surface/client/session/native tool | `Requires minor sensor instrumentation` | typed lifecycle hooks |
| registry deletion/snapshot | repository operations | delete/tombstone/snapshot records | source IDs/revision/completeness | `Requires minor sensor instrumentation` | new hooks and records |
| sensor health/loss | local metrics/health | `SensorHealthEvent` | status/reason/capability/loss/lag | `Requires minor sensor instrumentation` | durable emission |

## Target source-observation fields

| Target field | Current source | Availability |
| --- | --- | --- |
| `observation_id` | current deterministic ID | `Available now without sensor changes` |
| `tenant_id` | current body/envelope | same, but `"unknown"` quality issue |
| `source_sensor_id/type/version` | envelope + action sensor/config | same |
| `source_native_id` | backend or backend/tool composite | same |
| `source_object_type` | current source entity type | same |
| `entity_kind_hint` | current locally authoritative-looking type | `Available through adapter mapping only` after semantic correction |
| `observed_at` | current | available |
| `valid_from/until` | absent | `Requires minor sensor instrumentation` |
| `first/last_observed_at` | current individual time only | central last-seen `Derivable centrally from current output`; first/last source aggregation absent |
| `collection_method` | hook type known in code | `Available through adapter mapping only` |
| `collection_scope` | tenant/backend/request available | `Available through adapter mapping only` |
| `native_identifiers` | current source IDs | `Available through adapter mapping only` into target shape |
| `normalized_identifiers` | safe IDs | `Available now without sensor changes` |
| `native_attributes` | only transport/observed-via | current subset available; richer state adapter-only |
| `proposed_relationships` | absent | `Derivable centrally from current output` for limited edges |
| `confidence` | `1.0` | available; methodology must be corrected |
| `raw_payload_reference` | absent | `Requires substantial sensor changes` |
| `schema/ingestion_version` | current contract/adapter versions | partial; profile/mapping versions need instrumentation |
| `operation` | implicit upsert only | `Available through adapter mapping only` for current records; deletes need instrumentation |
| `sequence` | absent | `Requires minor sensor instrumentation` |

## Event mapping

| Target event field | Current value | Disposition |
| --- | --- | --- |
| event/source IDs | derived request/observation/envelope IDs | preserve as source IDs; central assigns canonical event ID |
| occurred/observed/ingested times | occurred and local created/terminal times | preserve distinct semantics; central sets ingest time |
| human actor | actor HMAC | identity candidate only |
| agent/workload/account | absent | no invented values |
| MCP server/tool | source backend/tool | resolve centrally |
| action | `mcp.tool.call`, `tools/call`, boundary | map directly |
| data | input/output labels | map directly; no raw content |
| governance | block implied only | map source signal; decision/control enrichment needs instrumentation |
| outcome | status/upstream/latency | map directly with surface coverage |
| usage/cost | absent | no value |
| evidence | delivery/body/record IDs/hashes | preserve as evidence refs |

## Platform datum disposition

| Datum | Availability | Product disposition |
| --- | --- | --- |
| source backend/tool inventory | `Available now without sensor changes` | `Inventory list`, `Entity detail`, `Relationship view` |
| Direct tool activity | same | `Activity explorer`, `Analytics`, `Evidence drill-down` |
| DLP block signal | same | `Finding signal`, `Activity explorer` |
| customer finding | `Derivable centrally from current output` only for narrowly admitted conditions with coverage caveats | `Customer finding` |
| source health/backlog | `Available through adapter mapping only` route/local health | `Coverage and health`, `Operator-only` |
| OneMCP full activity | `Requires minor sensor instrumentation` | future activity/analytics |
| canonical human/account | `Requires an external authoritative source` | inventory/relationship |
| model identity/cost | `Not observable by this sensor` for Direct MCP | correlate with LLM gateway |
| device/process/bypass | `Requires an external authoritative source` | correlate with endpoint/browser |

## Example target payload policy

No invented full target JSON is supplied here. Machine fixtures distinguish:

- current valid delivery records generated from verified schemas;
- proposed target source observations generated from the checked-in target
  schema;
- invalid/privacy fixtures.

No target example may contain raw arguments, results, headers, tokens,
credentials, low-entropy content hashes, or unverified canonical IDs.

