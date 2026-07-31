# Relationship contributions

## Current explicit relationship records

`Verified in source:` the current manifest declares
`record_relationship_event="deferred"`, and repository-wide searches found no
current `RelationshipEvent` construction in the MCP observe runtime.

Therefore the sensor emits **zero explicit relationship records**.

## Relationships directly evidenced by current action/observation records

| Subject | Relationship | Object | Direct/inferred | Source record | Native keys | Temporal? | Confidence | Platform use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pseudonymous human actor | CALLS | MCP tool | direct event semantics | `ActionEvent` | actor HMAC, resource ID/backend/tool | yes, `occurred_at` | high when actor exists | `Relationship view`, `Activity explorer` |
| tool-call action | TARGETS | MCP tool | direct event semantics | `ActionEvent` | request/flow/span, resource | yes | high | `Activity explorer`, evidence |
| MCP gateway sensor | OBSERVED | tool-call action | direct provenance | action sensor + delivery envelope | sensor ID/version/runtime instance | yes | high | evidence/source coverage |
| MCP gateway sensor | OBSERVED | backend/tool source candidate | direct provenance | `SourceObservation` | sensor ID, observation ID | yes | high | inventory provenance |
| MCP backend | PROVIDES | MCP tool | derived from source composite/context | tool observation/action resource | backend ID + tool name | sighting time only | medium | inventory relationship |
| MCP tool | WAS_BLOCKED_BY | native DLP | derived | `FindingSignal` reason + action status | signal/event/tool IDs | yes | medium; component not explicitly identified | finding/evidence |
| tool-call action | EXECUTED_AGAINST | MCP backend | derived | action resource `backend_id` | request + backend | yes | high | activity/backend detail |

`Derivable centrally from current output:` CALLS, TARGETS, OBSERVED, and
backend context can be materialized without changing the sensor. A formal
backend-PROVIDES-tool inventory edge is less robust because current discovery
records lack snapshot completeness and deletion semantics.

## Configuration relationships available but not emitted

| Subject | Relationship | Object | Source | Platform availability |
| --- | --- | --- | --- | --- |
| tenant/user | OWNS/CONFIGURES | backend | `backends`, ownership/user columns and routes | `Available through adapter mapping only` |
| backend | LINKED_TO | catalog item | `catalog_id` | `Available through adapter mapping only` |
| backend | EXPOSES | tool/resource/prompt | cached capabilities | `Available through adapter mapping only` |
| user | CONNECTED_TO/PREFERS | backend | `user_mcp_preferences`, OAuth/static auth state | `Available through adapter mapping only`; configured is not proof of actual use |
| tenant/group/user | GOVERNED_BY | scoped settings | `backend_scoped_settings` and resolver | `Available through adapter mapping only` |
| workflow agent version | ALLOWS | tool | workflow allowlist | `Available through adapter mapping only` |
| workflow agent | BOUND_TO | tenant/group/user | workflow bindings | `Available through adapter mapping only` |
| workflow run | EXECUTES | workflow version | run request/runner payload | `Available through adapter mapping only` |
| workflow run | PRODUCES | artifact | runner tables | `Available through adapter mapping only` |
| company | HAS_ADMIN/HAS_DOMAIN | user/domain | company tables | `Available through adapter mapping only`; canonical account identity external |
| credential metadata | AUTHORIZES | backend/user connection | OAuth/API/static-auth tables | `Available through adapter mapping only`; never emit values |

These are configuration relationships unless a runtime event proves use.

## Runtime relationships available but not mapped

| Relationship | Evidence source | Limitation |
| --- | --- | --- |
| user authenticated via auth mode/account | Direct route branch and logs | no observe field; raw logs may be sensitive |
| client/agent invoked MCP method | user-agent classification/rejection/event logs | client classification can be heuristic |
| workflow agent called tool | runner/gateway delegation and tool logs | cross-process correlation must be verified |
| OAuth token refreshed for backend/user | event log + OAuth state | credential value excluded; exact account link may vary |
| backend connection/session active | process-local sessions/event channels | lost on restart; multi-replica view incomplete |
| DLP/ZIA transformed or blocked content | handler result/log metadata | observe mapper reduces most control attribution |

## Relationships not supportable from this sensor

- application observed on physical device;
- process executed binary;
- device connected to destination;
- binary signed by publisher;
- workload deployed by human;
- agent uses model for ordinary Direct MCP calls;
- credential owner as an externally authoritative person/account.

These require an endpoint, cloud/IAM, IdP, LLM gateway, deployment, or build
authority.

## Relationship lifecycle gaps

Current output has no:

- relationship assertion/retraction record;
- validity interval;
- source snapshot/revision;
- deletion/tombstone;
- configured-versus-observed flag;
- central-resolution state;
- confidence methodology beyond source observation `1.0`.

`Proposed:` central materialization should preserve the current record as
evidence and generate relationship assertions with explicit provenance,
direct/derived classification, valid/observed times, and source coverage.

