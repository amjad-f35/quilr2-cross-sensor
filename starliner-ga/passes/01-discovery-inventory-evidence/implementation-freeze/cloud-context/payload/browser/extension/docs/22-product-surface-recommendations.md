# Product Surface Recommendations

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Place every high-value field, event and capability in the correct customer/operator surface.


| Item ID | Item | Kind | Current evidence | Platform disposition | Customer visible | Reason | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PD-001 | Observed browser/device/sensor freshness | Capability | Heartbeat and versions | Coverage and health | Yes | Direct operational value with coverage caveats | Available through adapter mapping only | Verified in source |
| PD-002 | Installed third-party extensions | Inventory | chrome.management discovery | Inventory list; Entity detail | Yes | Direct browser-profile inventory once profile identity exists | Requires minor sensor instrumentation | Verified in source |
| PD-003 | Extension install/enable/disable/uninstall | Activity | Lifecycle callbacks | Activity explorer | Yes | Direct observed lifecycle event | Requires minor sensor instrumentation | Verified in source |
| PD-004 | Extension permissions/host permissions | Attribute/signal | ExtensionInfo | Entity detail; Finding signal | Yes | Useful configuration/risk evidence, not vulnerability proof | Available through adapter mapping only | Verified in source |
| PD-005 | Application visits/accounts | Inventory/activity | Visit/Auth/Prompt envelopes | Entity detail; Activity explorer | Yes | Shows observed use/account context | Available through adapter mapping only | Verified in source |
| PD-006 | Prompt activity metadata | Activity | PromptDlpCheck | Activity explorer; Analytics | Yes | High product value with content minimization | Available through adapter mapping only | Verified in source |
| PD-007 | Raw prompt/AI response text | Evidence | PromptDlpCheck | Raw-only retention; Evidence drill-down | Restricted | Highly sensitive; not overview/inventory | Available through adapter mapping only | Verified in source |
| PD-008 | Prompt DLP detections | Detector evidence | Original/final detections | Finding signal; Evidence drill-down | Yes | Supports findings after admission | Available through adapter mapping only | Verified in source |
| PD-009 | Credential reuse/compromise/sharing signals | Detector evidence | AuthCheck | Finding signal; Customer finding | Yes | Defensible with explicit coverage/lifecycle rules | Available through adapter mapping only | Verified in source |
| PD-010 | Credential fingerprint | Identifier/evidence | AuthCheck | Raw-only retention | No | Sensitive correlation primitive | Available through adapter mapping only | Verified in source |
| PD-011 | Clipboard activity/source/destination | Activity | CopyPasteCheck/native clipboard | Activity explorer; Finding signal | Yes | Useful transfer evidence | Requires minor sensor instrumentation | Verified in source |
| PD-012 | Raw clipboard content | Evidence | Native/browser clipboard payload | Raw-only retention | Restricted | Highly sensitive | Available through adapter mapping only | Verified in source |
| PD-013 | Upload/download activity and safe file metadata | Activity | Upload/Download checks | Activity explorer; Entity detail; Analytics | Yes | Direct data movement evidence | Requires minor sensor instrumentation | Verified in source |
| PD-014 | Local full file path/extracted content | Evidence | Native file result | Raw-only retention | Restricted | Highly sensitive; not inventory | Available through adapter mapping only | Verified in source |
| PD-015 | Full local files SQLite index | Internal state | Native file index | Internal implementation only; Discard with reason | No | Used for upload resolution, not authorized whole-device inventory export | Not observable by this sensor | Verified in source |
| PD-016 | Policy configuration | Configuration | Control/PolicyResult | Configuration | Yes | Shows intended controls | Available through adapter mapping only | Verified in source |
| PD-017 | Policy evaluation/action/effect | Activity/evidence | Event fields and native results | Activity explorer; Evidence drill-down | Yes | Must separate stages | Requires minor sensor instrumentation | Verified in source |
| PD-018 | Diagnostic payload | Operator evidence | DiagnosticPayload | Operator-only | Restricted | Consent-scoped debugging bundle | Available through adapter mapping only | Verified in source |
| PD-019 | Upload workflow diagnostics | Health | Local batch | Coverage and health; Operator-only | Operator | Excellent pipeline health once emitted | Requires minor sensor instrumentation | Verified in source |
| PD-020 | Native logs/stdout/stderr | Operations | Rust logs | Operator-only | Operator | Unstructured and potentially secret-bearing | Available through adapter mapping only | Verified in source |
| PD-021 | VTest MCP server | Test tooling | VTest code | Internal implementation only | No | Not production MCP inventory | Not observable by this sensor | Verified in source |
| PD-022 | gRPC availability | Transport fact | No implementation | Internal implementation only | No | Transport implementation is not a product surface | Not observable by this sensor | Verified in source |
| PD-023 | Cloud/CI/serverless/MCP/agent-skill inventory | Capability absence | No source | Discard with reason | No current claim | Sensor cannot support the claim | Not observable by this sensor | Verified in source |

Overview should show sensor freshness, coverage, version drift and high-level
risk counts—not raw content. Inventory should show observed browser extensions,
applications/accounts and qualified device/browser/sensor instances. Activity
explorer should expose auth, prompt, clipboard and file actions. Findings need
admission/dedup/lifecycle logic. Diagnostics, local paths, raw content and logs
remain restricted evidence/operator surfaces.
