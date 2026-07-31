# Gap and Sensor Change Plan

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Turn every integration, correctness, identity, privacy and coverage gap into an owned validation item.


| Gap ID | Gap | Evidence | Impact | Required change | Owner | Priority | Readiness effect | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G-001 | No stable compound sensor/browser-profile/native instance identity | Events use product extension ID/device clues; SystemID strong fields empty | Cannot safely attribute/deduplicate installs/profiles/components | Persist and emit tenant-scoped component and compound instance IDs | Vanguard/Sentinel/adapter | P0 | Blocks evidence-grade integration | Restart/reinstall/multiple-profile acceptance tests |
| G-002 | No durable sensor-to-Starliner outbox | FailedLogQueue is partial and not transactional; native has none | Offline loss, duplicates and no acceptance status | Implement DeliveryEnvelope outbox with stable idempotency/status/replay | Sensor/adapter | P0 | Blocks production delivery | Offline/replay/partial acceptance tests |
| G-003 | Untyped/unversioned browser event maps | Package/EventLogRequest variants lack native schema/version | Schema drift and unsafe mapping | Add schema_id/schema_version and per-record validators | Vanguard/BES adapter | P0 | Blocks certification | Unsupported-version/quarantine tests |
| G-004 | Per-file result identity missing and positional mapping unsafe | FileActivityResponseItem lacks ID; result zipper uses order | Wrong DLP/policy can attach to wrong file in mixed batch | Carry stable file element ID end-to-end and join by ID | Vanguard/Sentinel | P0 | Security correctness blocker | Mixed batch error/reorder test |
| G-005 | MAIN-world message bridge lacks strong sender/response binding | Window messages are not authenticated and response handler not ID-bound | Page scripts can spoof/steal or race validation messages | Use unguessable session/channel nonce, strict source/schema and request correlation | Vanguard | P0 | Security blocker | Concurrent/spoofed response tests |
| G-006 | Native inbound frame has no length cap | Allocates reported u32 length | Memory denial risk at native boundary | Enforce max frame size before allocation | Sentinel | P0 | Security hardening | Oversized frame test |
| G-007 | Native logs full inbound messages to stderr | eprintln Debug Message includes nested action/token data | Secret/content leakage in logs | Structured redacted logging; remove raw stderr dump | Sentinel | P0 | Privacy blocker | Secret-canary log test |
| G-008 | Native write/send errors not reliably surfaced | send_in_chunks result ignored in send_native_message; other paths unwrap | False success, lost output or panic | Propagate write error, explicit delivery/result state | Sentinel | P0 | Reliability blocker | Broken pipe/partial write test |
| G-009 | Chunk protocol lacks index/total fields | Chunks share ID/type and group separators only | Reassembly ambiguity/loss detection weakness | Add versioned chunk_id/index/total/checksum or avoid nested chunking | Vanguard/Sentinel | P1 | Reliability risk | Out-of-order/missing chunk tests |
| G-010 | Heartbeat pre-publish store is process-local | ConcurrentHashMap in HeartbeatBucketService | Pod restart/multi-pod loss and fragmentation | Durable/shared bucket or direct outbox/Kafka per accepted heartbeat | BES | P0 | Health evidence blocker | Pod-kill/multi-pod test |
| G-011 | Heartbeat false publish can still delete bucket | Producer logs false; scheduler deletes after call | Silent heartbeat loss | Throw/return aggregate status and delete only confirmed success | BES | P0 | Reliability blocker | Producer false-return test |
| G-012 | Heartbeat DTO mismatch drops agentEnabled/extensionEnabled | Vanguard sends unknown fields; BES ignores unknown | Health loses enabled states | Align versioned request DTO and tests | Vanguard/BES | P1 | Minor sensor change | Contract round-trip test |
| G-013 | SystemID builder emits empty strong identity fields | build_fresh_system_id explicitly sets empty/None | Device/native attribution unreliable | Repair builder and quality model; reject empty strong IDs | Sentinel | P0 | Identity blocker | Stable restart/OS fixture tests |
| G-014 | SYSTEM_ID_VALIDITY_MS is zero | Every lookup is stale | Repeated collection/DB behavior and no stable freshness semantics | Define validity/refresh policy and observed_at vs identity stability | Sentinel | P1 | Health/performance risk | Cache validity tests |
| G-015 | Linux clipboard unsupported | Default adapter; Windows/macOS only | No cross-platform clipboard claim | Implement/test Linux or declare unsupported capability | Sentinel/product | P1 | Coverage limitation | Linux adapter tests |
| G-016 | Most AI interceptor configs are inactive | Only six entries active in iConfigs; many commented | Configured files overstate live AI response/account coverage | Generate manifest from active registry and add per-app runtime health/tests | Vanguard | P1 | Coverage truth blocker | Per-app fixture/runtime tests |
| G-017 | No stable timestamp contract across layers | Browser/native/server/bucket times mixed | Ordering/latency/correlation ambiguity | Define occurred_at, observed_at, emitted_at, received_at and clock quality | All/adapter | P0 | Contract blocker | Late/out-of-order tests |
| G-018 | No end-to-end accepted/duplicate/rejected acknowledgement | HTTP/native ack/Kafka calls prove different stages | Cannot prove delivery/materialization/enforcement | Adopt outbox/Starliner delivery result protocol | Adapter/platform | P0 | Production blocker | Partial acceptance/replay tests |
| G-019 | External extension-log-service contract/repository absent | Vanguard routes inventory there, not to analyzed BES | Inventory destination/storage/ack unresolved | Obtain repository/schema or tee inventory before external call | Architecture | P0 | Inventory integration blocker | Contract/runtime capture |
| G-020 | Legacy transformer path not reachable and required metadata unenforced | Private method no caller; 137 mappings | Cannot claim normalized transformation coverage | Keep migration-only or explicitly reactivate with validation/tests | BES | P2 | Does not block raw adapter | Call graph and integration tests |
| G-021 | No exhaustive cross-environment agent/MCP/repo/skill discovery | No implementation | Product cannot claim exhaustive agent discovery | Build separate endpoint/cloud/CI/MCP/repository discovery sensors and correlate centrally | Product/platform | P0 for such claim | Out of sensor scope | Capability acceptance matrix |
| G-022 | No gRPC/protobuf | Repository search found no implementation | No streaming RPC benefits, but not a semantic coverage gap by itself | Use HTTPS batch for MVS; benchmark and add gRPC only if SLO/streaming need justifies it | Architecture | P2 | No MVS blocker | Load/SLO decision record |
| G-023 | Diagnostics and raw content lack documented central retention contract | Rich sensitive payloads and logs exist | Privacy/retention uncertainty | Define consent, encryption, TTL, access and evidence-reference policy | Security/platform | P0 | Privacy blocker | Retention/access tests |
| G-024 | No capability manifest emitted by instance | Capabilities inferred from code/config | Platform cannot distinguish unsupported, disabled and failed | Ship versioned SensorManifest with per-component/OS capabilities | Adapter/sensor | P0 | Coverage blocker | Manifest/health tests |
| G-025 | Extension retry queue persistence incomplete | enqueue does not persist and batch not queued | Restart/offline loss | Replace with durable outbox or persist transactionally on enqueue | Vanguard | P0 | Delivery blocker | Browser restart/offline tests |

## Sequencing

1. Fix per-file correlation, bridge/native boundary security, secret logging
   and heartbeat loss.
2. Add stable compound/component identities and versioned native schemas.
3. Add durable browser/native/server outboxes and Starliner result handling.
4. Add privacy projectors/evidence references and capability health.
5. Certify current source mappings and only then add control commands.
6. Build separate discovery sources for MCP, cloud, CI, repositories and agent
   definitions rather than overextending this sensor.
