# Event, Message, and Record Merger


The merged Browser catalogs contain 45 records, 45 events and 20 interfaces/messages. `UploadWorkflowEventRecord` and `TaskInfo` are first-class records; `downloaded_file_scanned` uses `FileActivityResponseItem`, and `task_heartbeat` uses `TaskInfo[]`.

HTTP/native writes are not described as end-to-end acceptance. The backend is a consumer boundary where referenced, not a merged source producer.

| name | layer | producer_label | storage | delivery_confidence |
| --- | --- | --- | --- | --- |
| UserActionEvent | Extension internal | Content/frame/background capture | Transient trail memory | Internal only |
| PageLoadEvent | Extension internal | ChromeNavigation | Navigation cache/trail | Conditional |
| FormFillEvent | Extension internal | form listener/classifier | Trail memory | Conditional |
| ButtonClickEvent | Extension internal | button classifier | Trail memory | Conditional |
| LinkClickEvent | Extension internal | link classifier | Trail memory | Conditional |
| KeyPressEvent | Extension internal | keypress classifier | Trail memory | Conditional |
| CopyEvent | Extension internal | ContentPubSub | Trail memory | Conditional |
| PasteEvent | Extension internal | form/content listener | Trail memory | Conditional |
| UploadEvent | Extension internal | UploadEvent MAIN-world bridge | Per-request state | Conditional |
| DownloadEvent | Extension internal | Chrome downloads/webRequest | Per-download state | Conditional |
| PackageLogEnvelope | Extension output | Auth/Visit/DLP/CopyPaste/Upload/Download LogDrop | FailedLogQueue on some failures | Request success only; no end-to-end acknowledgement |
| AuthCheck | Extension output | AuthLogDrop | FailedLogQueue on send failure | Request success only |
| VisitCheck | Extension output | VisitLogDrop | FailedLogQueue on send failure | Request success only |
| PromptDlpCheck | Extension output | DlpLogDrop | FailedLogQueue on send failure | Request success only |
| CopyPasteCheck | Extension output | CopyPasteLogDrop | FailedLogQueue on send failure | Request success only |
| UploadCheck | Extension output | UploadLogDrop | FailedLogQueue on send failure | Request success only |
| DownloadCheck | Extension output | DownloadLogDrop | FailedLogQueue on send failure | Request success only |
| ExtensionListingCheck | Extension output | ExtensionManagement | No FailedLogQueue for discovery batch | Request result only; receiving service unresolved |
| HeartBeatRequestPayload | Extension output | Heartbeat middleware | No durable extension outbox | HTTP success only |
| DiagnosticPayload | Extension diagnostic | DiagnosticService | Compressed IndexedDB cache on failure | Upload response or cached flag |
| UploadWorkflowDiagnosticBatch | Extension diagnostic | UploadWorkflowAggregator | Transient aggregator only | Not delivered |
| NativeMessage | Extension/native transport | Extension and Sentinel | No durable transport store | Write call does not mean consumer acknowledgement |
| SystemAction | Extension/native transport | Extension/native caller | Queue only | Ack means queued receipt, not effect |
| SystemEvent | Native internal | SystemAction conversion or native service | In-memory queue/context | Handler-dependent |
| ClipboardChangeEvent | Native output | OS adapters/service | Transient | Native send only |
| FileMetadata | Native input | Extension upload SystemAction | Transient | Internal native input |
| FilePath | Native internal | Search providers | SQLite path index separately | Internal native result |
| FileActivityResponseItem | Native output | FileUploadHandler | Transient | Native send only; positional correlation defect |
| FileAnalysisMetadata | Native output | File metadata analyzer | Transient | Native send only |
| SystemID | Native state/output | System identifier collector | SQLite system_identifiers | Strong top-level fields empty in current implementation |
| FilesIndexRow | Native state | File watcher/indexer | SQLite files table | Local state only |
| StatusEvent | Extension internal | DOM/status listeners | Trail memory | Internal only |
| ArtifactsToTrails | Extension internal | Content/frame pipeline | Trail memory | Internal only |
| UploadScannedEvent | Extension internal | UploadManagerService | Per-request state | Conditional |
| UserTriggeredInteractionEvent | Extension internal | Prompt templates/content | Trail memory | Conditional |
| VoidEvent | Extension internal | Internal producers | Transient | Internal only |
| UserInteractionEvent | Extension internal | Content UI | Transient/trail | Conditional |
| UserActionTrail | Extension state | ProcessChain | Memory and diagnostic snapshot | Internal only |
| PolicyResult | Extension configuration | Policy resolver | Policy store/trail | Conditional |
| ClipboardMonitorConfig | Native configuration | Defaults/CopyConfig/DB row | SQLite configuration via source model | Local state only |
| AgentConfigurationUpdateData | Native configuration | Vanguard/native action | SQLite agent_configuration | Handler result |
| NativeFilePersona | Native sensitive input | Extension/persona state | Memory/agent state | Internal only |
| ExtensionSettingsInfo | Extension configuration | Backend settings API | Extension storage | Configuration only |
| UploadWorkflowEventRecord | Extension diagnostic | Upload workflow components | Nested in transient UploadWorkflowDiagnosticBatch | Local aggregation only |
| TaskInfo | Native operational | TaskManager | In-memory TaskManager map | Native send only; no delivery acknowledgement |
