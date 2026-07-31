# Identity and attribution

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents tenant, persona, device, browser, request, and delivery identifiers at the Backend trust boundary.

## Verified findings

- **Verified:** Authenticated `UserContext` supplies stronger tenant/persona attribution than conflicting body fields.
- **Verified:** Current identifiers do not form a stable compound installation identity.

## Unresolved or non-implemented behavior

- **Unresolved:** Stable sensor/component instance identity requires source changes.

## `identifiers.csv`

Complete machine-readable ledger: [`identifiers.csv`](../../../matrices/sensor-intelligence/browser-backend/identifiers.csv) (20 rows).

| Identifier ID | Identifier | Native location | Entity scope | Generation/source | Stability | Uniqueness | Sensitivity | Trust boundary | Consumers | Availability | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ID-001 | tenant | UserContext and event/heartbeat records | Tenant | Authenticated token/UserContext | Session stable | Authoritative only within identity system | Pseudonymous | Backend auth boundary | BES routing and proposed envelope | Available through adapter mapping only | Verified in source | Do not trust body tenant where auth context supplies it |
| ID-002 | subscriber | UserContext and records | Subscriber/customer | Authenticated token/UserContext | Session stable | Authority external to repos | Pseudonymous | Backend auth boundary | Events/DLP | Available through adapter mapping only | Verified in source | Canonical semantics depend on upstream identity |
| ID-003 | personaId | DeviceHeartbeat/UserContext | Persona | Authenticated user context | Account stable subject to upstream lifecycle | Authority external to repos | Pseudonymous | Backend auth boundary | Heartbeat graph and persona APIs | Available through adapter mapping only | Verified in source | Preferred over email when present |
| ID-004 | user email | PackageLog user, account and UserContext | Human/application account | Auth context or DOM/account extraction | Mutable | Not unique globally and may be shared | Sensitive | DOM/browser/backend | Policy, graph, event correlation | Available through adapter mapping only | Verified in source | Weak identifier; never auto-merge across tenants |
| ID-005 | device numeric ID | Heartbeat device/deviceId | Device | Extension persona/device context | Intended stable | Tenant-scoped, upstream-assigned | Pseudonymous | Browser/backend | Heartbeat and graph | Available through adapter mapping only | Verified in source | Type mismatch: Vanguard number, BES request string then Long |
| ID-006 | hostname | Heartbeat/SystemID extra_data | Device | Native OS collector | Mutable | Not unique | Sensitive | OS/native/browser/backend | Diagnostics/heartbeat | Available through adapter mapping only | Verified in source | Weak correlation only |
| ID-007 | hardware serial number | SystemID extra_data / HeartbeatRequest serialNumber | Device | ioreg on macOS; DTO support | Usually stable | May be unique but sensitive/reassignable | Highly sensitive | OS/native/backend | Current raw SystemID only | Available through adapter mapping only | Verified in source | Vanguard does not populate HeartbeatRequest serialNumber |
| ID-010 | Chrome extension ID (Vanguard) | PackageLog extension.id | Sensor product | Chrome runtime ID | Build/channel stable | Product/channel, not install unique | Pseudonymous | Browser/backend | Event envelope | Available through adapter mapping only | Verified in source | Not a sensor-instance ID |
| ID-012 | browser name/version | PackageLog/heartbeat | Browser product/version | Browser user agent/runtime | Version changes | Not unique | Internal | Browser/backend | Inventory/health | Available through adapter mapping only | Verified in source | Not browser-instance identity |
| ID-016 | contextId/context_id | UserActionEvent/check properties | Browser activity/context | Extension context manager | Context lifetime | Not proven globally unique | Pseudonymous | Browser/backend | Event grouping and credential fan-out | Available through adapter mapping only | Verified in source | BES creates new random values for related reuse records |
| ID-019 | credential fingerprint ID | AuthCheck | Credential secret equivalence class | Password-derived extension logic | Changes with credential | Collision/algorithm details unresolved | Credential | Browser/backend | Reuse detection | Available through adapter mapping only | Verified in source | Treat as highly sensitive pseudonymous evidence |
| ID-020 | file optional id | UploadedFile.id | File transfer element | Extension/native path may assign | Workflow lifetime | Not consistently present | Pseudonymous | Browser/native/backend | Upload merging | Requires minor sensor instrumentation | Verified in source | Current native response omits per-element ID |
| ID-021 | file path | FilePath/metadata | Local file | Filesystem | Mutable | Unique at an instant only | Highly sensitive | OS/native/browser/backend | Resolution/scan evidence | Available through adapter mapping only | Verified in source | Do not use as canonical long-term asset ID |
| ID-023 | conversation_id | PromptDlpCheck/config artifacts | AI conversation | Provider response/page parsing | Provider-specific | Provider/account scoped when present | Sensitive | Page/browser/backend | Prompt grouping | Available through adapter mapping only | Verified in source | Coverage varies; most configs inactive |
| ID-024 | application domain | PackageLog application.domain | Application surface | URL resolution/backend app lookup | Stable-ish | Not tenant/account unique | Sensitive | Page/browser/backend | App inventory/correlation | Available through adapter mapping only | Verified in source | Normalize punycode/subdomain carefully |
| ID-025 | application URL | PackageLog application.url | Page/activity | Observed page | Ephemeral | Not unique | Highly sensitive | Page/browser/backend | Activity/evidence | Available through adapter mapping only | Verified in source | May contain queries/tokens/content |
| ID-026 | routing event UUID | UserActionService ingestRiskEvents | Backend publication | UUID.randomUUID | Event lifetime | High expected uniqueness | Pseudonymous | Backend/Kafka | Producer routing | Available through adapter mapping only | Verified in source | Created server-side after source event |
| ID-027 | posture_id | EventLogRequest event map | Policy posture | Body property or default | Policy lifecycle | Tenant/config scoped | Internal | Browser/backend | Routing key | Available through adapter mapping only | Verified in source | Untyped/defaulted |
| ID-028 | behaviour_id | EventLogRequest event map | Policy behavior | Body property or default | Policy lifecycle | Tenant/config scoped | Internal | Browser/backend | Routing key | Available through adapter mapping only | Verified in source | Spelling follows source |
| ID-030 | heartbeat bucket key | quilr_hb:<tenant>:<epoch> | Backend in-memory bucket | HeartbeatBucketService | Window lifetime | Process-local | Internal | Backend process | Scheduler | Available through adapter mapping only | Verified in source | Not durable or shared across pods |

## `identity-coverage.csv`

Complete machine-readable ledger: [`identity-coverage.csv`](../../../matrices/sensor-intelligence/browser-backend/identity-coverage.csv) (6 rows).

| Identity class | Observed | Identifier quality | Attribution path | Coverage conditions | Failure/ambiguity | Platform availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant | Yes | Strong when taken from verified UserContext | JWT/security context to BES records | Authenticated backend request | Private decoder and upstream issuer not in repos | Available through adapter mapping only | Verified in source |
| Subscriber | Yes | Strong within upstream auth system | UserContext to event/DLP | Authenticated backend request | Semantics external | Available through adapter mapping only | Verified in source |
| Human persona | Yes | personaId strong; email weak | UserContext and persona services | Authenticated/enrolled user | Shared/mutable email and missing persona in pre-enrollment | Available through adapter mapping only | Verified in source |
| Device | Partial | Numeric device ID useful; hostname/serial weak/sensitive | Heartbeat and native system identifier | Enrolled device and heartbeat | Strong SystemID fields empty | Requires substantial sensor changes | Verified in source |
| Browser product | Yes | Product/version only | Runtime browser info to envelope/heartbeat | Extension running | No stable profile/install identity | Available through adapter mapping only | Verified in source |
| Browser profile/installation | No reliable normal-telemetry identity | Diagnostic-only IDs unresolved | No consistent emitted path | N/A | Product extension ID is not installation ID | Requires minor sensor instrumentation | Verified in source |
