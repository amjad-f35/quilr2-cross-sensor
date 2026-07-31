# Identity and Attribution

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Classify every identifier by scope, quality, stability, sensitivity and merge safety.


| Identifier ID | Identifier | Native location | Entity scope | Generation/source | Stability | Uniqueness | Sensitivity | Trust boundary | Consumers | Availability | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ID-001 | tenant | UserContext and event/heartbeat records | Tenant | Authenticated token/UserContext | Session stable | Authoritative only within identity system | Pseudonymous | Backend auth boundary | BES routing and proposed envelope | Available through adapter mapping only | Verified in source | Do not trust body tenant where auth context supplies it |
| ID-002 | subscriber | UserContext and records | Subscriber/customer | Authenticated token/UserContext | Session stable | Authority external to repos | Pseudonymous | Backend auth boundary | Events/DLP | Available through adapter mapping only | Verified in source | Canonical semantics depend on upstream identity |
| ID-003 | personaId | DeviceHeartbeat/UserContext | Persona | Authenticated user context | Account stable subject to upstream lifecycle | Authority external to repos | Pseudonymous | Backend auth boundary | Heartbeat graph and persona APIs | Available through adapter mapping only | Verified in source | Preferred over email when present |
| ID-004 | user email | PackageLog user, account and UserContext | Human/application account | Auth context or DOM/account extraction | Mutable | Not unique globally and may be shared | Sensitive | DOM/browser/backend | Policy, graph, event correlation | Available through adapter mapping only | Verified in source | Weak identifier; never auto-merge across tenants |
| ID-005 | device numeric ID | Heartbeat device/deviceId | Device | Extension persona/device context | Intended stable | Tenant-scoped, upstream-assigned | Pseudonymous | Browser/backend | Heartbeat and graph | Available through adapter mapping only | Verified in source | Type mismatch: Vanguard number, BES request string then Long |
| ID-006 | hostname | Heartbeat/SystemID extra_data | Device | Native OS collector | Mutable | Not unique | Sensitive | OS/native/browser/backend | Diagnostics/heartbeat | Available through adapter mapping only | Verified in source | Weak correlation only |
| ID-007 | hardware serial number | SystemID extra_data / HeartbeatRequest serialNumber | Device | ioreg on macOS; DTO support | Usually stable | May be unique but sensitive/reassignable | Highly sensitive | OS/native/backend | Current raw SystemID only | Available through adapter mapping only | Verified in source | Vanguard does not populate HeartbeatRequest serialNumber |
| ID-008 | SystemID.fingerprint | SystemID | Device | Intended SHA-256 over selected identifiers | Intended stable | Unknown | Pseudonymous | Native/browser | System identifier consumer | Requires substantial sensor changes | Verified in source | Current builder always sets empty string |
| ID-009 | SystemID.primary_identifier | SystemID | Device | Intended machine_id/uuid/platform_uuid choice | Intended stable | Unknown | Highly sensitive | Native/browser | System identifier consumer | Requires substantial sensor changes | Verified in source | Current builder always sets empty string |
| ID-010 | Chrome extension ID (Vanguard) | PackageLog extension.id | Sensor product | Chrome runtime ID | Build/channel stable | Product/channel, not install unique | Pseudonymous | Browser/backend | Event envelope | Available through adapter mapping only | Verified in source | Not a sensor-instance ID |
| ID-011 | third-party Chrome extension ID | ExtensionListingCheck properties.id | Extension product | Chrome management API | Product stable in store/channel | Usually product-scoped | Pseudonymous | Browser/external service | Inventory/lifecycle | Available through adapter mapping only | Verified in source | Needs browser-instance context for installation entity |
| ID-012 | browser name/version | PackageLog/heartbeat | Browser product/version | Browser user agent/runtime | Version changes | Not unique | Internal | Browser/backend | Inventory/health | Available through adapter mapping only | Verified in source | Not browser-instance identity |
| ID-013 | diagnostic ExtensionMetadata.browserId | Diagnostic snapshot | Browser instance candidate | Local diagnostic builder | Unresolved | Unresolved | Pseudonymous | Browser/operator | Diagnostics only | Unresolved | Verified in source | Not present in ordinary event/heartbeat |
| ID-014 | diagnostic ExtensionMetadata.deviceId | Diagnostic snapshot | Device candidate | Local diagnostic builder | Unresolved | Unresolved | Pseudonymous | Browser/operator | Diagnostics only | Unresolved | Verified in source | Needs source trace/normal telemetry |
| ID-015 | requestId | UserActionEvent/upload diagnostics | Action/workflow | Extension-generated | Workflow lifetime | Unique expectation not formally enforced | Pseudonymous | MAIN/isolated/background/native | Upload/action correlation | Available through adapter mapping only | Verified in source | Must become explicit source event ID |
| ID-016 | contextId/context_id | UserActionEvent/check properties | Browser activity/context | Extension context manager | Context lifetime | Not proven globally unique | Pseudonymous | Browser/backend | Event grouping and credential fan-out | Available through adapter mapping only | Verified in source | BES creates new random values for related reuse records |
| ID-017 | SystemEvent.id | Sentinel SystemEvent | Native event/action | UUID v4 or propagated action event | Event lifetime | High expected uniqueness | Pseudonymous | Browser/native | Native ack/result correlation | Available through adapter mapping only | Verified in source | Native result message ID carries it |
| ID-018 | Native Message.id | Native Message | Wire request/result | Caller UUID or propagated SystemEvent ID | Message/workflow lifetime | Not enforced | Pseudonymous | Browser/native | Upload/native response matching | Available through adapter mapping only | Verified in source | Output chunks preserve same ID |
| ID-019 | credential fingerprint ID | AuthCheck | Credential secret equivalence class | Password-derived extension logic | Changes with credential | Collision/algorithm details unresolved | Credential | Browser/backend | Reuse detection | Available through adapter mapping only | Verified in source | Treat as highly sensitive pseudonymous evidence |
| ID-020 | file optional id | UploadedFile.id | File transfer element | Extension/native path may assign | Workflow lifetime | Not consistently present | Pseudonymous | Browser/native/backend | Upload merging | Requires minor sensor instrumentation | Verified in source | Current native response omits per-element ID |
| ID-021 | file path | FilePath/metadata | Local file | Filesystem | Mutable | Unique at an instant only | Highly sensitive | OS/native/browser/backend | Resolution/scan evidence | Available through adapter mapping only | Verified in source | Do not use as canonical long-term asset ID |
| ID-022 | file tuple name/size/mtime | FileMetadata | File candidate | Browser File API | Mutable/ambiguous | Not unique | Sensitive | Browser/native | File search | Available through adapter mapping only | Verified in source | May collide and contributes to mixed-batch risk |
| ID-023 | conversation_id | PromptDlpCheck/config artifacts | AI conversation | Provider response/page parsing | Provider-specific | Provider/account scoped when present | Sensitive | Page/browser/backend | Prompt grouping | Available through adapter mapping only | Verified in source | Coverage varies; most configs inactive |
| ID-024 | application domain | PackageLog application.domain | Application surface | URL resolution/backend app lookup | Stable-ish | Not tenant/account unique | Sensitive | Page/browser/backend | App inventory/correlation | Available through adapter mapping only | Verified in source | Normalize punycode/subdomain carefully |
| ID-025 | application URL | PackageLog application.url | Page/activity | Observed page | Ephemeral | Not unique | Highly sensitive | Page/browser/backend | Activity/evidence | Available through adapter mapping only | Verified in source | May contain queries/tokens/content |
| ID-026 | routing event UUID | UserActionService ingestRiskEvents | Backend publication | UUID.randomUUID | Event lifetime | High expected uniqueness | Pseudonymous | Backend/Kafka | Producer routing | Available through adapter mapping only | Verified in source | Created server-side after source event |
| ID-027 | posture_id | EventLogRequest event map | Policy posture | Body property or default | Policy lifecycle | Tenant/config scoped | Internal | Browser/backend | Routing key | Available through adapter mapping only | Verified in source | Untyped/defaulted |
| ID-028 | behaviour_id | EventLogRequest event map | Policy behavior | Body property or default | Policy lifecycle | Tenant/config scoped | Internal | Browser/backend | Routing key | Available through adapter mapping only | Verified in source | Spelling follows source |
| ID-029 | diagnostic sessionId | DiagnosticPayload | Diagnostic session | Extension-generated | Session lifetime | Expected unique | Pseudonymous | Browser/operator | Cache/upload/progress | Available through adapter mapping only | Verified in source | Not normal activity ID |
| ID-030 | heartbeat bucket key | quilr_hb:<tenant>:<epoch> | Backend in-memory bucket | HeartbeatBucketService | Window lifetime | Process-local | Internal | Backend process | Scheduler | Available through adapter mapping only | Verified in source | Not durable or shared across pods |
| ID-031 | proposed sensor_instance_id | DeliveryEnvelope/sensor manifest target | Sensor installation | Proposed persisted UUID bound to tenant/device/browser profile/native install | Stable across restart, rotates on reinstall | Tenant/source unique | Pseudonymous | Sensor/Starliner | All target records | Requires minor sensor instrumentation | Proposed | Must distinguish browser profile and native host instance |
| ID-032 | proposed observation_id/idempotency_key | Starliner target | Delivered record | Proposed deterministic/source-stable generation | Record lifetime/retry stable | Tenant/sensor/schema scoped | Pseudonymous | Adapter/outbox/Starliner | Deduplication | Requires minor sensor instrumentation | Proposed | Must be reused across retries |

## Identity rules

- Backend `personaId` and tenant context are stronger than body email.
- Email, hostname, application domain, browser product/version and file path
  are weak/contextual identifiers and must not independently auto-merge
  canonical entities.
- Chrome extension ID identifies an extension product/channel, not one browser
  profile installation.
- A numeric device ID can anchor current heartbeat projections, but the
  native-host component still needs its own stable instance ID.
- Empty `SystemID` strong fields are invalid evidence, not empty-but-valid
  identifiers.

## Coverage

| Identity class | Observed | Identifier quality | Attribution path | Coverage conditions | Failure/ambiguity | Platform availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant | Yes | Strong when taken from verified UserContext | JWT/security context to BES records | Authenticated backend request | Private decoder and upstream issuer not in repos | Available through adapter mapping only | Verified in source |
| Subscriber | Yes | Strong within upstream auth system | UserContext to event/DLP | Authenticated backend request | Semantics external | Available through adapter mapping only | Verified in source |
| Human persona | Yes | personaId strong; email weak | UserContext and persona services | Authenticated/enrolled user | Shared/mutable email and missing persona in pre-enrollment | Available through adapter mapping only | Verified in source |
| Application account | Partial | Email/account name weak; provider IDs generally absent | DOM/network account extractors to application envelope | Site/parser active and logged in | Most response/account configs inactive; guest use | Available through adapter mapping only | Verified in source |
| Device | Partial | Numeric device ID useful; hostname/serial weak/sensitive | Heartbeat and native system identifier | Enrolled device and heartbeat | Strong SystemID fields empty | Requires substantial sensor changes | Verified in source |
| Browser product | Yes | Product/version only | Runtime browser info to envelope/heartbeat | Extension running | No stable profile/install identity | Available through adapter mapping only | Verified in source |
| Browser profile/installation | No reliable normal-telemetry identity | Diagnostic-only IDs unresolved | No consistent emitted path | N/A | Product extension ID is not installation ID | Requires minor sensor instrumentation | Verified in source |
| Vanguard instance | Partial | Product ID plus device context | Envelope/heartbeat | Device known | Reinstall/profile multiplicity unresolved | Requires minor sensor instrumentation | Verified in source |
| Sentinel instance | Partial | Agent version and native connection only | Native ping/system identifier | Native host installed and connected | Strong ID fields empty; multiple native installs unresolved | Requires substantial sensor changes | Verified in source |
| Third-party extension product | Yes | Chrome extension ID strong for product | chrome.management | Management permission/browser support | Installation instance needs browser profile context | Available through adapter mapping only | Verified in source |
| AI conversation | Partial | Provider-native ID where parser active | Interceptor artifacts | Supported app/path | Coverage varies and configs inactive | Available through adapter mapping only | Verified in source |
| MCP server/tool/backend | No | None | None | None | No discovery code | Not observable by this sensor | Verified in source |
| Cloud/serverless/CI workload | No | None | None | None | No relevant control-plane integrations | Not observable by this sensor | Verified in source |
| Agent definition/runtime | No | None | None | None | AI page use is not agent-runtime proof | Not observable by this sensor | Verified in source |
