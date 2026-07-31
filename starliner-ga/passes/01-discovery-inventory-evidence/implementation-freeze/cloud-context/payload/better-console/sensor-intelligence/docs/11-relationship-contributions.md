# Relationship Contributions

| Subject | Predicate | Object | Evidence | Time | Authority |
| --- | --- | --- | --- | --- | --- |
| tenant | contains | account | PostgreSQL/session scope | current | high within auth source |
| tenant | contains | application | ClickHouse/source rows | observation window | source projection |
| subscriber | scopes | browser/endpoint data | trusted session + query predicates | request/window | high |
| user | uses | application | activity joins/aggregates | observation window | derived |
| user | owns | browser application | app admin service/PostgreSQL | current snapshot | source authority |
| user | member_of | group | PostgreSQL/directory mirror | current snapshot | source authority with drift states |
| persona | represents | user | Neo4j normalized email | graph snapshot | candidate |
| device | belongs_to | user/persona | Neo4j/Endpoint source | snapshot/last seen | source-specific |
| application | observed_via | sensor channel | LocalStore mapping | window/current | derived provenance |
| conversation | contains | interaction | source correlation IDs | event time | source-specific |
| interaction | invokes | model/provider | LLM row | event time | source evidence |
| tool_call | invokes | MCP tool/backend | MCP row | event time | source evidence |
| activity_event | classified_as | topic | activity topic classification | bucket version | derived with evidence refs |
| dashboard | owned_by/shared_with | user/group/tenant | PostgreSQL ACL | current | authoritative document ACL |
| saved_view | owned_by | user | PostgreSQL composite scope | current/soft delete | authoritative |
| policy_control | targets | browser/app/sensor | policy adapter request | current upstream | external effect unresolved |

Graph and aggregate relationships must retain source/time/coverage. A current Neo4j snapshot or LocalStore join is not automatically a permanent canonical edge.
