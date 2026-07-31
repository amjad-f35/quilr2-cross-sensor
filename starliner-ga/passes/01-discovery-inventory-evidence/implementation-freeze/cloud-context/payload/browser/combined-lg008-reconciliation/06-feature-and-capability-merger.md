# Feature and Capability Merger


The Browser profile includes 42 source features and 64 capabilities (42 feature-derived plus 22 native/browser control capabilities). Browser Extension Service-only features and proposed/absent control surfaces are excluded.

| feature | trigger | proof_status | reachability | disposition |
| --- | --- | --- | --- | --- |
| All-URL content-script bootstrap | Document start on <all_urls> | SOURCE_PROVEN | ENABLED_AND_REACHABLE | SOURCE_LOCAL_STATE |
| Main-world bootstrap | Document end on <all_urls> | SOURCE_PROVEN | ENABLED_AND_REACHABLE | SOURCE_LOCAL_STATE |
| Page and frame navigation capture | chrome.webNavigation callbacks | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Website/application resolution | Navigation and user-action context creation | SOURCE_PROVEN | ENABLED_AND_REACHABLE | CANONICAL_INVENTORY_INPUT |
| Form and field observation | input, beforeinput, blur, cut, paste and click listeners | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Login and signup classification | Form, button, link and keypress chain | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Password-strength evaluation | Authentication event resolution | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| Compromised-password lookup | Authentication event resolution | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| Credential-reuse detection | Authentication event resolution and backend fan-out | SOURCE_PROVEN | ENABLED_AND_REACHABLE | RELATIONSHIP_CLAIM |
| Credential-sharing detection | Authentication event resolution | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| Password-manager and MFA observation | Form/browser heuristics in auth chain | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | CANONICAL_INVENTORY_INPUT |
| GenAI prompt request capture | Prompt submission in configured/recognized AI page | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| GenAI response capture | MAIN-world response interception and DOM response handling | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | ACTIVITY_OBSERVATION |
| Application-specific AI parsers | MAIN-world request/response matches | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | COVERAGE_OR_HEALTH |
| Knowledge-base application behaviors | Page analyzer and MAIN-world interceptor | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | COVERAGE_OR_HEALTH |
| Prompt sensitive-data detection | Prompt request and response resolution | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| Browser copy observation | copy event in isolated-world content script | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Browser paste observation | paste event in form/content listeners | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Native OS clipboard monitoring | OS clipboard change notification | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | ACTIVITY_OBSERVATION |
| Native clipboard modification/block/restore | SystemAction chain keys | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Browser upload capture | file input, drag/drop and prototype getter interception | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Native upload file resolution and scan | FileActivity:Upload:Scan SystemAction | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Upload policy enforcement | Native result or timeout consumed by extension | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Download observation and scan | chrome.downloads created/changed and webRequest metadata | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Local file index | Native service startup and filesystem watcher | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| On-demand file search | Upload metadata request | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| Installed extension discovery | Extension bootstrap | SOURCE_PROVEN | ENABLED_AND_REACHABLE | CANONICAL_INVENTORY_INPUT |
| Extension lifecycle observation | chrome.management onInstalled/onEnabled/onDisabled/onUninstalled | SOURCE_PROVEN | ENABLED_AND_REACHABLE | CANONICAL_INVENTORY_INPUT |
| Third-party extension enable/disable/remove policy | Settings sync and user action | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Persona enrollment and token acquisition | Bootstrap, backend registration and native persona actions | SOURCE_PROVEN | ENABLED_AND_REACHABLE | CANONICAL_INVENTORY_INPUT |
| Native system identifier observation | PersonaActivity:FetchIdentifiers:Scan | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | COVERAGE_OR_HEALTH |
| Browser/device/native heartbeat | Bootstrap timer and periodic middleware | SOURCE_PROVEN | ENABLED_AND_REACHABLE | COVERAGE_OR_HEALTH |
| Extension self-update availability reporting | Heartbeat construction and version check | SOURCE_PROVEN | ENABLED_AND_REACHABLE | COVERAGE_OR_HEALTH |
| Agent configuration update | AgentUpdate:Configuration:Update | SOURCE_PROVEN | ENABLED_AND_REACHABLE | ACTIVITY_OBSERVATION |
| Agent disable/revive | AgentUpdate:Configuration:Disable and launcher behavior | SOURCE_PROVEN | ENABLED_AND_REACHABLE | COVERAGE_OR_HEALTH |
| Native binary update | Updater event and success chain | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | COVERAGE_OR_HEALTH |
| User-consented diagnostic collection | Options/popup diagnostic state machine | SOURCE_PROVEN | ENABLED_AND_REACHABLE | IMMUTABLE_EVIDENCE_ONLY |
| Upload workflow milestone aggregation | Upload capture/process milestone calls | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | COVERAGE_OR_HEALTH |
| Failed browser log retry | Single-event send failure | SOURCE_PROVEN | CONFIGURATION_DEPENDENT | COVERAGE_OR_HEALTH |
| VTest extension automation and MCP test server | Developer test commands only | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE |
| Cross-environment agent/MCP/cloud/CI discovery | No entry point exists | SOURCE_PROVEN | UNKNOWN | IMMUTABLE_EVIDENCE_ONLY |
| gRPC or protobuf transport | No entry point exists | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE |
