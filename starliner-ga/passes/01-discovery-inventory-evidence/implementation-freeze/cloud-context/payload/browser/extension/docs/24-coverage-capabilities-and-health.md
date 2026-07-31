# Coverage, Capabilities, and Health

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Separate capability support, runtime health, source freshness, collection coverage and evidence completeness.


## Coverage profile

| Coverage ID | Environment/surface | Capability | Supported code path | Coverage class | Known blind spots | Negative-event semantics | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CV-001 | Chrome/Chromium page | Navigation/DOM/auth/prompt/copy/paste/upload | All-URL content scripts and browser APIs | Direct but permission/runtime dependent | Cross-origin/shadow/page changes/service-worker suspension | No event does not prove no activity | Available through adapter mapping only | Verified in source |
| CV-002 | Chrome extension profile | Third-party extension inventory/lifecycle | chrome.management | Direct per observed profile | Stable profile identity missing; non-Chrome extensions excluded | Missing record may mean failed batch/service | Requires minor sensor instrumentation | Verified in source |
| CV-003 | Chrome downloads | Download observation/scan | chrome.downloads/webRequest/native | Direct for browser downloads | Non-browser transfers and API permission limits | No event does not prove no file transfer | Available through adapter mapping only | Verified in source |
| CV-004 | Named AI web apps | Prompt request/response/account | Knowledge base/interceptors | Partial, app/config/version dependent | Most response configs commented in active iConfigs; site drift | Absence cannot mean no AI use | Requires minor sensor instrumentation | Verified in source |
| CV-005 | Arbitrary AI web app | Prompt discovery | Generic classifiers | Partial heuristic | Unknown UI/network protocols | Absence cannot mean no AI use | Unresolved | Verified in source |
| CV-006 | Windows native host | File search/index/system ID/clipboard | Windows adapters/providers | Supported code path | Private dependencies/runtime not exercised in current environment | No native event may mean agent/config/OS failure | Available through adapter mapping only | Verified in source |
| CV-007 | macOS native host | File search/index/system ID/clipboard | macOS adapters/providers | Supported code path | SystemID top-level fields empty; command/profile dependencies | No event may mean permissions/agent/config failure | Available through adapter mapping only | Verified in source |
| CV-008 | Linux native host | Clipboard | Default adapter | Unsupported/stub | No Linux clipboard implementation | No events are expected, not proof of no clipboard activity | Not observable by this sensor | Verified in source |
| CV-009 | Linux native host | System identifiers | fetch_identifiers fallback | Unsupported | Returns error marker | Identity missing is capability gap | Not observable by this sensor | Verified in source |
| CV-010 | Local filesystem | Upload file resolution | Index/hot probe/Spotlight/Windows Search | Point query, not exhaustive discovery feed | Permissions, mounts, ephemeral files, collisions | Not found does not prove file absent | Available through adapter mapping only | Verified in source |
| CV-011 | Browser backend ingress | Event acceptance | BES HTTP | Direct when request reaches service | Network failure, auth, validation, missing extension-log-service | No backend record may be upstream delivery failure | Available through adapter mapping only | Verified in source |
| CV-012 | Backend heartbeat | Health aggregation | Process-local bucket/Kafka/Neo4j | Partial durability | Pod restart, multi-pod fragmentation, false send deletion | Missing graph update does not prove sensor offline | Requires substantial sensor changes | Verified in source |
| CV-013 | Offline browser | Event buffering | FailedLogQueue | Partial | Enqueue not immediately persisted; batches excluded | Offline absence cannot imply no activity | Requires substantial sensor changes | Verified in source |
| CV-014 | Offline native | Native output buffering | None shown for output delivery | Unsupported for central delivery | stdout disconnect drops/skips messages | Absence is transport state | Requires substantial sensor changes | Verified in source |
| CV-015 | Cloud VM | Agent discovery | No implementation | Unsupported | No cloud API/metadata inventory | Cannot make negative claim | Not observable by this sensor | Verified in source |
| CV-016 | Serverless | Agent discovery | No implementation | Unsupported | No provider/control-plane integration | Cannot make negative claim | Not observable by this sensor | Verified in source |
| CV-017 | CI/CD runner | Agent discovery | No implementation | Unsupported | No runner/integration scanner | Cannot make negative claim | Not observable by this sensor | Verified in source |
| CV-018 | Ephemeral agent/runtime | Agent discovery | No implementation | Unsupported | No runtime registry/process/container discovery | Cannot make negative claim | Not observable by this sensor | Verified in source |
| CV-019 | MCP server/tool/backend | Discovery | No production implementation | Unsupported | VTest MCP is test control only | Cannot make negative claim | Not observable by this sensor | Verified in source |
| CV-020 | Repository/folder/files/skills | Agent semantic discovery | No implementation | Unsupported | Native file search only resolves upload candidates | Cannot make negative claim | Not observable by this sensor | Verified in source |
| CV-021 | gRPC transport | Transport | No implementation | Unsupported | Uses existing DOM/Chrome/native/HTTPS/Kafka boundaries | No semantic coverage effect | Not observable by this sensor | Verified in source |
| CV-022 | Diagnostics | Rich evidence | User-consented diagnostic feature | On-demand only | Consent/config and cache/upload state | No diagnostic means not requested, not healthy/unhealthy | Available through adapter mapping only | Verified in source |

## Health metrics

| Health ID | Metric/signal | Layer | Source | Healthy condition | Degraded condition | Unavailable condition | Emission today | Target action | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H-001 | extension heartbeat freshness | Extension/backend | DeviceHeartbeat.lastAccessedTimestamp | Within configured window | Late beyond warning | No heartbeat beyond outage threshold with expected install evidence | Heartbeat graph/Kafka | SensorHealthEvent | Verified in source |
| H-002 | extension version convergence | Extension | extensionVersion/availableVersion | Meets required version policy | Available newer version | Unsupported/unknown version | Heartbeat | Finding/health card | Verified in source |
| H-003 | native connection | Extension/native | ping/pong/agentVersion | Connected and recent | Reconnects/timeouts | Expected native absent | Local state only | Emit component health | Verified in source |
| H-004 | native agent version | Extension/native | agentVersion | Meets required version | Outdated | Missing when expected | Heartbeat optional field | Health/finding | Verified in source |
| H-005 | rules freshness | Extension | rulesLastSync | Within policy threshold | Stale | Never synced/missing | Heartbeat | Health/finding | Verified in source |
| H-006 | relays freshness | Extension | relaysLastSync | Within threshold | Stale | Never/missing | Heartbeat | Health/finding | Verified in source |
| H-007 | lookups freshness | Extension | lookupsLastSync | Within threshold | Stale | Never/missing | Heartbeat | Health/finding | Verified in source |
| H-008 | DLP data freshness | Extension | dlpLastSync | Within threshold | Stale | Never/missing | Heartbeat | Health/finding | Verified in source |
| H-009 | FailedLogQueue depth | Extension | Queue state | Zero/small | Growing | Unknown after process loss | Local only | Emit MetricEvent | Verified in source |
| H-010 | FailedLogQueue oldest age | Extension | createdAt | Below threshold | Old backlog | Queue state lost | Local only | Emit MetricEvent | Verified in source |
| H-011 | browser event send success | Extension | network result | Successful/acknowledged request | Retrying | Endpoint/auth unavailable | Logs/queue | Emit health counters | Verified in source |
| H-012 | extension inventory batch delivery | Extension | PackageExtensionLogs.sendBatched result | Successful request | Failure | Receiving service unresolved | Boolean/log only | Durable queue and metric | Verified in source |
| H-013 | upload workflow completion | Extension/native | UploadWorkflowDiagnosticBatch finalState | Terminal success/intentional block | Slow/retries | Timeout/error/missing terminal | Local batch, sender inactive | Emit workflow health | Verified in source |
| H-014 | native message read/write | Native | loop errors/connection flag | Valid frames/write success | Intermittent errors | Disconnected/EOF | Logs/local flag | Emit counters/state | Verified in source |
| H-015 | native handler timeout/error | Native | chain configs/handler result | Within chain timeout | Retry/error tolerant | Repeated failure | Logs | Emit per-chain health | Verified in source |
| H-016 | clipboard capability | Native | manifest/config/OS adapter | Listener enabled and adapter supported | Disabled/skipping apps | Linux unsupported | Local only | Capability health | Verified in source |
| H-017 | file index freshness | Native | files.last_seen/index service | Watcher active/index updated | Lag/errors | Service unavailable | SQLite/logs | Emit coverage/lag | Verified in source |
| H-018 | file search resolution | Native | batch results | Expected files resolved | Partial errors | Provider/index unavailable | Logs/result | Emit success/error counts | Verified in source |
| H-019 | heartbeat bucket durability | Backend | process-local map | Process running until flush | Backlog | Pod death loses unflushed data | Logs only | Replace with durable/shared outbox | Verified in source |
| H-020 | heartbeat Kafka publish | Backend | send result | All chunks true | Partial false | Producer unavailable | Logs | Do not delete failed bucket; emit metric | Verified in source |
| H-021 | heartbeat consumer validity | Backend | deserialize count | All valid | Some malformed | All malformed committed | Logs | Quarantine and metric | Verified in source |
| H-022 | Neo4j heartbeat write | Backend | write/retry/timeout | Success | Transient retries | Terminal/timeout | Logs | Metric/health | Verified in source |
| H-023 | adapter outbox depth | Adapter | Proposed outbox | Below threshold | Growing | Storage unavailable/corrupt | None | Required MVS metric | Proposed |
| H-024 | adapter delivery lag | Adapter | Proposed timestamps | Within SLO | Late | No delivery | None | Required MVS metric | Proposed |
| H-025 | schema compatibility | Adapter | Proposed version gate | Supported schema | Deprecated version | Unsupported/quarantined | None | Required MVS health | Proposed |
| H-026 | identity completeness | Adapter | Required ID validator | Complete IDs | Weak/fallback IDs | Missing/empty critical ID | None | Block/quarantine unsafe record | Proposed |

No event is not equivalent to no activity. Coverage state requires an expected
installation/capability source, a current manifest, component heartbeat/hook
evidence, delivery health, and explicit unsupported/disabled states.
