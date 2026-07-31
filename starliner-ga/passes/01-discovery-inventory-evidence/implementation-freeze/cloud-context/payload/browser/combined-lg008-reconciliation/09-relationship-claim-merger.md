# Relationship-Claim Merger


The 25 Browser relationship claims preserve direct/inferred status, lifecycle and confidence. Backend-only device/persona heartbeat claims, proposed DeliveryEnvelope claims, and absent MCP/agent-skill claims are excluded.

**Inference:** Several account/application/file relationships are source-native associations, not canonical enterprise identity or ownership.

| subject | relationship | object | direct_or_inferred | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| Browser profile | HAS_INSTALLED | Third-party extension | Direct once profile identity exists | High for observed profile, but profile ID missing | Current record can only attach to device/browser context weakly |
| Persona | USES | Web application | Direct activity assertion | High for observed activity | Not proof of ownership |
| Persona | USES_ACCOUNT | Application account | Direct/weak | Medium | Email may be missing/shared |
| Application account | BELONGS_TO | Web application | Direct | Medium-high | Provider account ID usually absent |
| Persona | AUTHENTICATED_TO | Web application | Direct behavioral observation | High for observed browser action | Does not prove server login success after page change |
| Credential fingerprint | REUSED_AT | Application account/domain | Direct detector assertion | High for sensor detector output | Credential object should remain sensitive evidence |
| Persona account | SHARED_CREDENTIAL_WITH | Application account | Direct detector assertion | Medium; logic depends on identity context | Finding admission required |
| Persona | SUBMITTED_PROMPT_TO | AI application | Direct | High when emitted | Prompt content should not be inventory |
| AI conversation | BELONGS_TO | Application account | Inferred | Medium | Missing account/provider IDs reduce confidence |
| Prompt event | HAS_DETECTION | DLP detection | Direct | High | Detector result not finding lifecycle |
| Policy/control | EVALUATED_FOR | Browser activity | Direct | High when logged | Configured-only control is not evaluation |
| Enforcement action | ACTED_ON | Prompt/clipboard/file/extension | Direct | Medium until effect IDs standardized | Separate attempted, acknowledged and succeeded |
| Persona | COPIED_DATA_FROM | Web application | Direct browser-level assertion | Medium | OS-native source app may differ |
| Persona | PASTED_DATA_TO | Web application | Direct browser-level assertion | Medium | No complete origin without cross-event hash |
| Clipboard content hash | TRANSFERRED_BETWEEN | Applications | Cross-sensor inference | Low-to-medium; hash disabled by native default | Requires privacy-approved hash and timing rules |
| Persona | UPLOADED | File/data asset | Direct activity assertion | High for attempted upload | Outcome determines whether transfer proceeded |
| File/data asset | UPLOADED_TO | Web application | Direct | High | Stable per-file ID needed for multi-file batches |
| File/data asset | LOCATED_ON | Device | Inferred | Medium | Path alone is not stable identity |
| Persona | DOWNLOADED | File/data asset | Direct activity assertion | High | Download completion/error must be retained |
| File/data asset | DOWNLOADED_FROM | Web application/URL | Direct | High | URL can be sensitive |
| Archive file | CONTAINS | Extracted child file | Direct when extracted_files exists | High for emitted results | Child stable IDs not standardized |
| Vanguard instance | CONNECTS_TO | Sentinel instance | Direct runtime relationship | High locally, unexported centrally | Need connection-state event with both instance IDs |
| Diagnostic session | ABOUT | Browser page/workflow | Direct operator evidence | High | Operator-only, not customer graph by default |
| Browser extension | REQUESTS_PERMISSIONS_FOR | Host/API capability | Direct manifest observation | High | Does not prove active use |
| Browser extension | ENABLED_ON | Browser profile | Direct state observation once profile ID exists | High but profile identity missing | Device-only attachment may collapse profiles |
