# Minimum viable sensor integration


| scope_item | include | reason | required_change |
| --- | --- | --- | --- |
| Finalized api_request_log observation | Yes | complete common request outcome | stable versioned emission callback |
| Axis/DLP evidence reference | Yes | supports one defensible sensitive-data finding | privacy filter + evidence hash/reference |
| Tenant/gateway/key/app/provider/model/request identifiers | Yes | minimum inventory and attribution | namespace/strength mapping |
| Gateway/app/model-route inventory candidates | Yes | customer inventory value | ObservationMapper |
| Request/blocked/redacted/failed events | Yes | activity/finding path | event mapper; request-stage instrumentation deferred |
| Durable local outbox/ack/replay | Yes | trustworthy delivery | Starliner integration |
| Capability/coverage manifest and health | Yes | prevent overclaiming protocol coverage | manifest/self-test |
| Signed control channel | No for first observe MVS | current inline enforcement is local; remote channel is substantial new trust boundary | defer separate certification increment |
| Raw prompt/response default ingestion | No | privacy-heavy; evidence references suffice by default | policy-governed opt-in later |

The smallest trustworthy path is:

`finalized native request/Axis signal → privacy filter → durable authenticated
outbox → SourceObservation + identifier/relationship/event candidates →
gateway/app/model-route inventory → request activity → one admitted
sensitive-data finding → evidence drill-down`.
