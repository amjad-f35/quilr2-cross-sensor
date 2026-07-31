# Gap and sensor-change plan


| platform_need | available_now | adapter_work | sensor_change | external_dependency | priority | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Versioned SourceObservation envelope | No | Yes | Minor stable emission callback | Starliner contracts | P0 | No current Quilr 2.0 observation boundary |
| Durable local outbox with central acknowledgement | No | Substantial | New local outbox integration | Starliner runtime | P0 | Existing SQLite/NATS paths do not provide Quilr 2.0 ack/replay semantics |
| Sensor instance/workload/artifact identity | Partial deployment context | Manifest mapping | Signed identity/certification | Starliner identity | P0 | No signed sensor-instance envelope |
| Complete request-stage events | Request final record | Map final outcome | Emit requested/decided/executed/effect timestamps | None | P1 | Timing state is collapsed into final row |
| Stable agent identity | Forwarded metadata only | Identifier candidates | Preserve verified caller/workload attestation | Agent runtime/IdP | P1 | observability metadata is caller supplied |
| Provider account/deployment authority | Configured provider type/label | Map source claims | Expose stable account/deployment IDs where provider supports | Provider API/billing | P1 | labels are mutable aliases |
| Exact enforcement effect | Gateway response and some final text | Map observed result | Explicit effect record especially post-upstream block | Provider/tool source for downstream effects | P1 | Decision/execution/effect are not separate records |
| Consistent endpoint coverage | Protocol-specific walkers | Capability manifest | Close field/content parity gaps | None | P1 | Handlers implement distinct schemas and capture paths |

P0 is a stable versioned finalized-record callback plus Starliner identity,
manifest and durable outbox. P1 adds stage-specific events, stronger
workload/provider identity, protocol parity and effect reporting. None of these
target changes are claimed as current implementation.
