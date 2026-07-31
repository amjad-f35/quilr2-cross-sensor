# Capability and Feature Catalog

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Account for all 45 current, partial, absent, test-only, and target-relevant capabilities.


The full machine-readable catalog is
`../../../matrices/sensor-intelligence/browser-extension/features.csv`.

| Feature ID | Domain | Feature | Trigger or entry point | Implementation status | Evidence status | Availability |
| --- | --- | --- | --- | --- | --- | --- |
| F-001 | Browser observation | All-URL content-script bootstrap | Document start on <all_urls> | Implemented | Verified in source | Available now without sensor changes |
| F-002 | Browser observation | Main-world bootstrap | Document end on <all_urls> | Implemented | Verified in source | Available now without sensor changes |
| F-003 | Navigation | Page and frame navigation capture | chrome.webNavigation callbacks | Implemented | Verified in source | Available through adapter mapping only |
| F-004 | Application discovery | Website/application resolution | Navigation and user-action context creation | Implemented | Verified in source | Available through adapter mapping only |
| F-005 | DOM behavior | Form and field observation | input, beforeinput, blur, cut, paste and click listeners | Implemented | Verified in source | Available through adapter mapping only |
| F-006 | Identity behavior | Login and signup classification | Form, button, link and keypress chain | Implemented | Verified in source | Available through adapter mapping only |
| F-007 | Credential security | Password-strength evaluation | Authentication event resolution | Implemented | Verified in source | Available through adapter mapping only |
| F-008 | Credential security | Compromised-password lookup | Authentication event resolution | Implemented | Verified in source | Available through adapter mapping only |
| F-009 | Credential security | Credential-reuse detection | Authentication event resolution and backend fan-out | Implemented | Verified in source | Available through adapter mapping only |
| F-010 | Credential security | Credential-sharing detection | Authentication event resolution | Implemented | Verified in source | Available through adapter mapping only |
| F-011 | Credential security | Password-manager and MFA observation | Form/browser heuristics in auth chain | Partially implemented | Verified in source | Available through adapter mapping only |
| F-012 | AI use | GenAI prompt request capture | Prompt submission in configured/recognized AI page | Implemented | Verified in source | Available through adapter mapping only |
| F-013 | AI use | GenAI response capture | MAIN-world response interception and DOM response handling | Partially implemented | Verified in source | Available through adapter mapping only |
| F-014 | AI use | Application-specific AI parsers | MAIN-world request/response matches | Partially implemented | Verified in source | Requires substantial sensor changes |
| F-015 | AI use | Knowledge-base application behaviors | Page analyzer and MAIN-world interceptor | Configured but runtime-unverified | Verified in source | Requires minor sensor instrumentation |
| F-016 | DLP | Prompt sensitive-data detection | Prompt request and response resolution | Implemented | Verified in source | Available through adapter mapping only |
| F-017 | Clipboard | Browser copy observation | copy event in isolated-world content script | Implemented | Verified in source | Available through adapter mapping only |
| F-018 | Clipboard | Browser paste observation | paste event in form/content listeners | Implemented | Verified in source | Available through adapter mapping only |
| F-019 | Clipboard | Native OS clipboard monitoring | OS clipboard change notification | Partially implemented | Verified in source | Available through adapter mapping only |
| F-020 | Clipboard | Native clipboard modification/block/restore | SystemAction chain keys | Implemented | Verified in source | Available through adapter mapping only |
| F-021 | File protection | Browser upload capture | file input, drag/drop and prototype getter interception | Implemented | Verified in source | Available through adapter mapping only |
| F-022 | File protection | Native upload file resolution and scan | FileActivity:Upload:Scan SystemAction | Implemented | Verified in source | Available through adapter mapping only |
| F-023 | File protection | Upload policy enforcement | Native result or timeout consumed by extension | Implemented | Verified in source | Available through adapter mapping only |
| F-024 | File protection | Download observation and scan | chrome.downloads created/changed and webRequest metadata | Implemented | Verified in source | Available through adapter mapping only |
| F-025 | File discovery | Local file index | Native service startup and filesystem watcher | Implemented | Verified in source | Available through adapter mapping only |
| F-026 | File discovery | On-demand file search | Upload metadata request | Implemented | Verified in source | Available through adapter mapping only |
| F-027 | Browser inventory | Installed extension discovery | Extension bootstrap | Implemented | Verified in source | Available through adapter mapping only |
| F-028 | Browser inventory | Extension lifecycle observation | chrome.management onInstalled/onEnabled/onDisabled/onUninstalled | Implemented | Verified in source | Available through adapter mapping only |
| F-029 | Browser control | Third-party extension enable/disable/remove policy | Settings sync and user action | Implemented | Verified in source | Available through adapter mapping only |
| F-030 | Identity | Persona enrollment and token acquisition | Bootstrap, backend registration and native persona actions | Implemented | Verified in source | Available through adapter mapping only |
| F-031 | Identity | Native system identifier observation | PersonaActivity:FetchIdentifiers:Scan | Partially implemented | Verified in source | Requires substantial sensor changes |
| F-032 | Health | Browser/device/native heartbeat | Bootstrap timer and periodic middleware | Implemented | Verified in source | Available through adapter mapping only |
| F-033 | Health | Extension self-update availability reporting | Heartbeat construction and version check | Implemented | Verified in source | Available through adapter mapping only |
| F-034 | Native lifecycle | Agent configuration update | AgentUpdate:Configuration:Update | Implemented | Verified in source | Available through adapter mapping only |
| F-035 | Native lifecycle | Agent disable/revive | AgentUpdate:Configuration:Disable and launcher behavior | Implemented | Verified in source | Available through adapter mapping only |
| F-036 | Native lifecycle | Native binary update | Updater event and success chain | Partially implemented | Verified in source | Requires minor sensor instrumentation |
| F-037 | Diagnostics | User-consented diagnostic collection | Options/popup diagnostic state machine | Implemented | Verified in source | Available through adapter mapping only |
| F-038 | Diagnostics | Upload workflow milestone aggregation | Upload capture/process milestone calls | Partially implemented | Verified in source | Requires minor sensor instrumentation |
| F-039 | Reliability | Failed browser log retry | Single-event send failure | Partially implemented | Verified in source | Requires substantial sensor changes |
| F-040 | Backend ingress | Browser event validation and Kafka publication | POST /browser/interaction/log, /log/v2, /events | Implemented | Verified in source | Available through adapter mapping only |
| F-041 | Backend processing | Legacy schema-based event transformation | Private transformAndIngestEvents path | Dead-code candidate | Verified in source | Requires substantial sensor changes |
| F-042 | Backend health | Heartbeat aggregation, Kafka and graph ingestion | POST persona heartbeat and five-minute scheduler | Implemented | Verified in source | Available through adapter mapping only |
| F-043 | Testing | VTest extension automation and MCP test server | Developer test commands only | Experimental | Verified in source | Not observable by this sensor |
| F-044 | Environment discovery | Cross-environment agent/MCP/cloud/CI discovery | No entry point exists | Documentation-only | Verified in source | Not observable by this sensor |
| F-045 | Transport | gRPC or protobuf transport | No entry point exists | Documentation-only | Verified in source | Not observable by this sensor |

## Critical status corrections

- The 44 application interceptor configuration files are not 44 active runtime
  integrations. `iConfigs` enables six account/session extractors; most
  response parsers are commented out.
- The 137 BES transformation mappings exist, but the central private
  transformation method has no caller found; current risk ingestion publishes
  the raw/enriched EventLogKafkaRecord path.
- VTest MCP is experimental developer tooling, not a production MCP discovery
  or telemetry capability.
