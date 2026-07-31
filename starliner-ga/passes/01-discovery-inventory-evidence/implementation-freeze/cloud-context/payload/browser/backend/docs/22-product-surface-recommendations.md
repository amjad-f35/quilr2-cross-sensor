# Product-surface recommendations

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Separates current source evidence from proposed customer/operator representations.

## Verified findings

- **Verified:** Disposition rows state whether information belongs in inventory, activity, evidence, health, or operator-only surfaces.
- **Verified:** Sensitive payloads are not implicitly customer-displayable.

## `product-disposition.csv`

Complete machine-readable ledger: [`product-disposition.csv`](../../../matrices/sensor-intelligence/browser-backend/product-disposition.csv) (10 rows).

| Item ID | Item | Kind | Current evidence | Platform disposition | Customer visible | Reason | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PD-001 | Observed browser/device/sensor freshness | Capability | Heartbeat and versions | Coverage and health | Yes | Direct operational value with coverage caveats | Available through adapter mapping only | Verified in source |
| PD-005 | Application visits/accounts | Inventory/activity | Visit/Auth/Prompt envelopes | Entity detail; Activity explorer | Yes | Shows observed use/account context | Available through adapter mapping only | Verified in source |
| PD-006 | Prompt activity metadata | Activity | PromptDlpCheck | Activity explorer; Analytics | Yes | High product value with content minimization | Available through adapter mapping only | Verified in source |
| PD-007 | Raw prompt/AI response text | Evidence | PromptDlpCheck | Raw-only retention; Evidence drill-down | Restricted | Highly sensitive; not overview/inventory | Available through adapter mapping only | Verified in source |
| PD-008 | Prompt DLP detections | Detector evidence | Original/final detections | Finding signal; Evidence drill-down | Yes | Supports findings after admission | Available through adapter mapping only | Verified in source |
| PD-009 | Credential reuse/compromise/sharing signals | Detector evidence | AuthCheck | Finding signal; Customer finding | Yes | Defensible with explicit coverage/lifecycle rules | Available through adapter mapping only | Verified in source |
| PD-010 | Credential fingerprint | Identifier/evidence | AuthCheck | Raw-only retention | No | Sensitive correlation primitive | Available through adapter mapping only | Verified in source |
| PD-013 | Upload/download activity and safe file metadata | Activity | Upload/Download checks | Activity explorer; Entity detail; Analytics | Yes | Direct data movement evidence | Requires minor sensor instrumentation | Verified in source |
| PD-016 | Policy configuration | Configuration | Control/PolicyResult | Configuration | Yes | Shows intended controls | Available through adapter mapping only | Verified in source |
| PD-017 | Policy evaluation/action/effect | Activity/evidence | Event fields and native results | Activity explorer; Evidence drill-down | Yes | Must separate stages | Requires minor sensor instrumentation | Verified in source |

## `inventory-entities.csv`

Complete machine-readable ledger: [`inventory-entities.csv`](../../../matrices/sensor-intelligence/browser-backend/inventory-entities.csv) (5 rows).

| Entity ID | Object type | Directly discovered | Evidence | Native IDs | Attributes | Lifecycle signals | Relationships | Platform availability | Confidence and limits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IE-001 | Human user/persona | Yes, authenticated context and persona APIs | Verified in source | personaId, email, subscriber, tenant | email, groups/roles and selected tenant in context | persona register/update/delete; heartbeat freshness | uses device, browser and application account | Available through adapter mapping only | Email is not a canonical person key by itself |
| IE-002 | Device/workstation | Partial | Verified in source | numeric device ID; weak hostname; raw serial on some native platforms | deviceType, OS/platform, versions, last access | heartbeats; native identifier refresh | hosts browser/native sensor; used by persona | Available through adapter mapping only | Current SystemID strong top-level fields are empty |
| IE-003 | Browser product | Yes | Verified in source | browser name plus version | name, version, user agent, OS | heartbeat/version changes | runs extension and observes applications | Available through adapter mapping only | Product/version is not a browser profile or installation identity |
| IE-004 | Browser installation/profile | Partial | Verified in source | extension device/browser IDs in diagnostic snapshot; no stable ordinary-event browser instance ID | browser/extension version and local profile storage | heartbeats and extension lifecycle | installed on device; has extensions | Requires minor sensor instrumentation | No consistently emitted stable browser-instance identifier |
| IE-007 | Web application surface | Yes | Verified in source | domain, URL, backend application identity when resolved | name, domain, URL, authentication type, AI/new flags | visit/auth/prompt/file/clipboard events | used by account/persona; source/destination | Available through adapter mapping only | URLs may contain sensitive path/query; domain is not tenant-specific app identity |
