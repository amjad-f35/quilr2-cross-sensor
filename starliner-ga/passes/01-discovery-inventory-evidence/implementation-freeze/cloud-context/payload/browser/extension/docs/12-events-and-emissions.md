# Events and Emissions

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Account for 50 internal, external, native, backend and target events and their acknowledgement semantics.


| Event ID | Layer | Native event name | Trigger | Payload record | Producer | Consumer | Delivery/ack semantics | Implementation status | Evidence | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | Extension internal | page_load | webNavigation event | PageLoadEvent | ChromeNavigation | ProcessChain | Internal callback only | Implemented | Verified in source | Project-Vanguard/src/browser/chrome/chrome.navigation.ts |
| EV-002 | Extension internal | form_fill | field input/blur | FormFillEvent | form listener | ProcessChain | Internal callback only | Implemented | Verified in source | Project-Vanguard/src/core/contents/listeners/form.ts |
| EV-003 | Extension internal | button_click | classified click | ButtonClickEvent | button classifier | ProcessChain | Internal callback only | Implemented | Verified in source | Project-Vanguard/src/types/userAction.d.ts |
| EV-004 | Extension internal | link_click | classified link click | LinkClickEvent | link classifier | ProcessChain | Internal callback only | Implemented | Verified in source | Project-Vanguard/src/types/userAction.d.ts |
| EV-005 | Extension internal | key_press | classified key event | KeyPressEvent | keypress classifier | ProcessChain | Internal callback only | Implemented | Verified in source | Project-Vanguard/src/types/userAction.d.ts |
| EV-006 | Extension output | login | Resolved authentication form | AuthCheck | AuthLogDrop | BES | HTTP success; later materialization not acknowledged | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/AuthLogDrop |
| EV-007 | Extension output | signup | Resolved signup form | AuthCheck | AuthLogDrop | BES | HTTP success; later materialization not acknowledged | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/AuthLogDrop |
| EV-008 | Extension output | visit | Application/page visit resolution | VisitCheck | VisitLogDrop | BES | HTTP success only | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/VisitLogDrop |
| EV-009 | Extension output | data_leak_prevention prompt_request | Prompt submission | PromptDlpCheck | DlpLogDrop | BES | BES renames check name to prompt during ingest | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/DlpLogDrop |
| EV-010 | Extension output | data_leak_prevention prompt_response | AI response capture | PromptDlpCheck | DlpLogDrop | BES | Conditional capture and HTTP success only | Partially implemented | Verified in source | Project-Vanguard/src/core/LogDrop/DlpLogDrop |
| EV-011 | Extension output | copy | Browser copy | CopyPasteCheck | CopyPasteLogDrop | BES | HTTP success only | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/CopyPasteLogDrop |
| EV-012 | Extension output | paste | Browser paste | CopyPasteCheck | CopyPasteLogDrop | BES | HTTP success only | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/CopyPasteLogDrop |
| EV-013 | Extension output | upload | Upload resolved/logged | UploadCheck | UploadLogDrop | BES | HTTP success only | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/UploadLogDrop |
| EV-014 | Extension output | download | Download resolved/logged | DownloadCheck | DownloadLogDrop | BES | HTTP success only | Implemented | Verified in source | Project-Vanguard/src/core/LogDrop/DownloadLogDrop |
| EV-015 | Extension output | extension-listing discover | Initial chrome.management inventory | ExtensionListingCheck batch | ExtensionManagement | extension-log-service | HTTP result; no durable retry for batch | Implemented | Verified in source | Project-Vanguard/src/core/ExtensionManagement |
| EV-016 | Extension output | extension-listing install | chrome.management onInstalled | ExtensionListingCheck | ExtensionManagement | extension-log-service | HTTP result | Implemented | Verified in source | Project-Vanguard/src/core/ExtensionManagement |
| EV-017 | Extension output | extension-listing enable | chrome.management onEnabled | ExtensionListingCheck | ExtensionManagement | extension-log-service | HTTP result | Implemented | Verified in source | Project-Vanguard/src/core/ExtensionManagement |
| EV-018 | Extension output | extension-listing disable | chrome.management onDisabled | ExtensionListingCheck | ExtensionManagement | extension-log-service | HTTP result | Implemented | Verified in source | Project-Vanguard/src/core/ExtensionManagement |
| EV-019 | Extension output | extension-listing uninstall | chrome.management onUninstalled | ExtensionListingCheck | ExtensionManagement | extension-log-service | HTTP result | Implemented | Verified in source | Project-Vanguard/src/core/ExtensionManagement |
| EV-020 | Extension output | heartbeat | Periodic heartbeat call | HeartBeatRequestPayload | Heartbeat middleware | BES | HTTP acceptance; bucket/Kafka/graph later | Implemented | Verified in source | Project-Vanguard/src/core/network/middleware/hearBeat.ts |
| EV-021 | Extension diagnostic | upload workflow stages | Milestone calls | UploadWorkflowEventRecord | Upload workflow components | UploadWorkflowAggregator | Local aggregation only | Partially implemented | Verified in source | Project-Vanguard/src/types/diagnostic.d.ts |
| EV-022 | Native input | ping | Native port handshake | Message | Vanguard | Sentinel | pong indicates send path/connection; no sensor identity | Implemented | Verified in source | project-sentinel/src/infra/messaging/native_messaging.rs |
| EV-023 | Native output | pong | ping handling | Message | Sentinel | Vanguard | Sets connection flag on successful write | Implemented | Verified in source | project-sentinel/src/infra/messaging/native_messaging.rs |
| EV-024 | Native input | action | Native command | Message<SystemAction> | Vanguard | Sentinel | acknowledgement means parsed/queued, not handler effect | Implemented | Verified in source | project-sentinel/src/infra/messaging/native_messaging.rs |
| EV-025 | Native output | acknowledgement | Valid action parsed | Message | Sentinel native loop | Vanguard | Receipt/queue acknowledgement only | Implemented | Verified in source | project-sentinel/src/infra/messaging/native_messaging.rs |
| EV-026 | Native output | err_action | Invalid SystemAction JSON | Message | Sentinel native loop | Vanguard | Write attempt only | Implemented | Verified in source | project-sentinel/src/infra/messaging/native_messaging.rs |
| EV-027 | Native output | failed_transmission | Native framed read error | Message | Sentinel native loop | Vanguard | Write attempt may itself unwrap/panic | Implemented | Verified in source | project-sentinel/src/infra/messaging/native_messaging.rs |
| EV-028 | Native output | clipboard_copy | OS clipboard observation | ClipboardChangeEvent | ClipboardHandler | Vanguard | Native send only | Partially implemented | Verified in source | project-sentinel/src/handlers/clipboard_handler.rs |
| EV-029 | Native output | clipboard_content_modified | Modify handler result | Message | ClipboardModifyHandler | Vanguard | Handler result, no platform delivery | Implemented | Verified in source | project-sentinel/src/handlers/clipboard_modify_handler.rs |
| EV-030 | Native output | clipboard_content_deleted | Block/delete handler result | Message | ClipboardDeleteHandler | Vanguard | Handler result, no platform delivery | Implemented | Verified in source | project-sentinel/src/handlers/clipboard_delete_handler.rs |
| EV-031 | Native output | clipboard_content_restored | Restore handler result | Message | ClipboardRestoreHandler | Vanguard | Handler result, no platform delivery | Implemented | Verified in source | project-sentinel/src/handlers/clipboard_restore_handler.rs |
| EV-032 | Native output | uploaded_file_scanned | File upload handler completes | FileActivityResponseItem array | FileUploadHandler | Vanguard upload manager | Positional mapping; write is not consumption ack | Implemented | Verified in source | project-sentinel/src/handlers/file_upload_handler.rs |
| EV-033 | Native output | downloaded_file_scanned | File download handler completes | FileActivityResponseItem | FileDownloadHandler | Vanguard | Native send only | Implemented | Verified in source | project-sentinel/src/handlers/file_download_handler.rs; project-sentinel/src/handlers/file_upload_handler.rs |
| EV-034 | Native output | downloaded_file_removed | File delete handler effect | Message | FileDeleteHandler | Vanguard | Handler result | Implemented | Verified in source | project-sentinel/src/handlers/file_delete_handler.rs |
| EV-035 | Native output | downloaded_file_restored | File restore handler effect | Message | FileRestoreHandler | Vanguard | Handler result | Implemented | Verified in source | project-sentinel/src/handlers/file_restore_handler.rs |
| EV-036 | Native output | task_heartbeat | Long file task progress | TaskInfo[] | TaskManager/TaskHeartbeatTask | Vanguard upload manager | Stage heartbeat, not sensor health | Implemented | Verified in source | project-sentinel/src/heartbeat/task_heartbeat.rs; project-sentinel/src/heartbeat/task_manager.rs; Project-Vanguard/src/core/services/uploadManager.service.ts |
| EV-037 | Native output | SystemIdentifier | FetchIdentifiers scan | SystemID | System identifier module | Vanguard | Current strong ID fields empty | Partially implemented | Verified in source | project-sentinel/src/core/utils/system_identifiers/system_id.rs |
| EV-038 | Native output | GetToken | Persona token request/result chain | Message | PersonaTokenHandler | Vanguard/native persona flow | Native handler result | Implemented | Verified in source | project-sentinel/chains.json |
| EV-039 | Native output | GetEmail | Persona email scan chain | Message | PersonaScanHandler | Vanguard | Native handler result | Implemented | Verified in source | project-sentinel/chains.json |
| EV-040 | Native output | persona_updated | Persona update handler | Message | PersonaHandler | Vanguard | Native handler result | Implemented | Verified in source | project-sentinel/src/handlers/persona_handler.rs |
| EV-041 | Native output | persona_deletion_in_progress | Persona delete handler | Message | PersonaDeleteHandler | Vanguard | Signals process, not completion | Implemented | Verified in source | project-sentinel/src/handlers/persona_delete_handler.rs |
| EV-042 | Native output | config_updated | Agent config handler | Message | AgentConfigurationUpdateHandler | Vanguard | Handler result | Implemented | Verified in source | project-sentinel/src/handlers/agent_configuration_update_handler.rs |
| EV-043 | Native output | log_level_updated | Log config handler | Message | LogUpdateHandler | Vanguard | Handler result | Implemented | Verified in source | project-sentinel/src/handlers/log_update_handler.rs |
| EV-044 | Native output | file_scan_cancelled | Cancel handler | Message | FileCancelHandler | Vanguard | Handler result | Implemented | Verified in source | project-sentinel/src/handlers/file_cancel_handler.rs |
| EV-045 | Native output | AgentUpdateAvailable | Updater detects release | Message | Updater | Vanguard | Native send only | Partially implemented | Verified in source | project-sentinel/src/updater |
| EV-046 | Backend output | EventLogKafkaRecord publication | ingestRiskEvents | EventLogKafkaRecord | UserActionService/QuilrProducerService | Kafka/pipeline | HTTP response may precede callback delivery | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/actionrelay |
| EV-047 | Backend output | HeartbeatBatch publication | Expired bucket flush | HeartbeatBatch | HeartbeatKafkaProducer | Kafka consumer | Bucket deleted after producer call; false result is logged but not thrown | Implemented | Verified in source | browser-extension-service/src/main/java/io/quilr/browserextensionservice/persona/heartbeat |
| EV-048 | Target | SourceObservation accepted | Proposed adapter observation | DeliveryEnvelope<SourceObservation> | Proposed adapter/outbox | Starliner | Requires durable accepted/duplicate/rejected status | Placeholder | Proposed | project-starliner-audit/starliner_contracts |
| EV-049 | Target | CanonicalActivity/ActionEvent | Proposed normalized activity/control | Starliner contracts | Proposed adapter/platform | Starliner/product | Not current sensor behavior | Placeholder | Proposed | project-starliner-audit/starliner_contracts |
| EV-050 | Target | SensorHealthEvent | Proposed health/coverage emission | Starliner contract | Proposed adapter | Starliner/product | Not current sensor behavior | Placeholder | Proposed | project-starliner-audit/starliner_contracts |

## Delivery semantics

- HTTP 200 means BES accepted the request path; it does not prove Kafka or
  downstream materialization.
- Native `acknowledgement` means the action was parsed and queued, not that a
  handler ran or the requested effect occurred.
- A native result message represents handler output, but `send_native_message`
  currently does not provide consumer acknowledgement.
- Kafka producer invocation/boolean and consumer commit are different stages.
- Starliner must return record-level `accepted`, `duplicate`, `rejected`,
  retryable, or terminal results to the durable outbox.
