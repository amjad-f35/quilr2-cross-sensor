# Native Field Dictionary

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Provide repository-wide semantic treatment for 776 sensor-relevant fields and nested data points.


The canonical field ledger is
`../../../matrices/sensor-intelligence/browser-extension/native-fields.csv`.
It records type, source, direct/derived status, nullability, units,
sensitivity, current destination, platform availability, product disposition,
and exact source location.

## Field counts by record

| Record | Fields |
| --- | --- |
| AgentConfigurationUpdateData | 22 |
| ArtifactsToTrails | 7 |
| AuthCheck | 18 |
| ButtonClickEvent | 11 |
| ClipboardChangeEvent | 7 |
| ClipboardMonitorConfig | 15 |
| CopyEvent | 4 |
| CopyPasteCheck | 17 |
| DeviceHeartbeat | 20 |
| DiagnosticPayload | 108 |
| DownloadCheck | 24 |
| DownloadEvent | 5 |
| EventLogKafkaRecord | 10 |
| EventLogRequest | 5 |
| ExtensionListingCheck | 23 |
| ExtensionSettingsInfo | 5 |
| FileActivityResponseItem | 5 |
| FileAnalysisMetadata | 5 |
| FileMetadata | 3 |
| FilePath | 4 |
| FilesIndexRow | 4 |
| FormFillEvent | 21 |
| HeartBeatRequestPayload | 15 |
| HeartbeatBatch | 4 |
| HeartbeatRequest | 15 |
| KeyPressEvent | 8 |
| LegacyTransformer.ai_risk_schema.yml | 44 |
| LegacyTransformer.data_risk_schema.yml | 30 |
| LegacyTransformer.identity_risk_schema.yml | 38 |
| LegacyTransformer.interaction_schema.yml | 6 |
| LegacyTransformer.saas_risk_schema.yml | 19 |
| LinkClickEvent | 11 |
| NativeFilePersona | 4 |
| NativeMessage | 4 |
| PackageLogEnvelope | 23 |
| PageLoadEvent | 14 |
| PasteEvent | 6 |
| PolicyResult | 16 |
| PromptDlpCheck | 28 |
| StatusEvent | 4 |
| SystemAction | 7 |
| SystemEvent | 7 |
| SystemID | 14 |
| TaskInfo | 4 |
| UploadCheck | 27 |
| UploadEvent | 7 |
| UploadScannedEvent | 5 |
| UploadWorkflowDiagnosticBatch | 10 |
| UploadWorkflowEventRecord | 4 |
| UserActionEvent | 17 |
| UserActionTrail | 5 |
| UserInteractionEvent | 22 |
| UserTriggeredInteractionEvent | 5 |
| VisitCheck | 8 |
| VoidEvent | 2 |

## High-risk field facts

- `PromptDlpCheck.properties.original_prompt`, `final_prompt`, and response are
  raw highly sensitive content; response base64 is encoding, not protection.
- `SystemID.fingerprint` and `primary_identifier` are required strings in the
  struct but are currently emitted as empty strings.
- `HeartBeatRequestPayload.agentEnabled` and `.extensionEnabled` are sent by
  Vanguard but ignored by BES JSON binding.
- Local paths, request headers/bodies, diagnostic DOM/HAR/screenshots/MHTML,
  passwords, tokens, and extracted content must never enter Starliner safe
  summaries.
