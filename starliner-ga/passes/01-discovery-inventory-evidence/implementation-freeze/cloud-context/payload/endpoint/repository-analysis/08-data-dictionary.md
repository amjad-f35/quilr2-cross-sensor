# 08 — Repository-Wide Data Dictionary

## Endpoint delivery, installer, and test-tool data

| Data point | Type/origin | Consumers/lifecycle | Validation/trust/sensitivity |
| --- | --- | --- | --- |
| root manifest `Version` | XML string, `manifest.xml` | current package filename/version; old runtime manifest transform | required by builders; value `0.30.276`; installer lowercase fallback mismatches |
| update `version` | JSON string | platform updater comparison/download naming/quarantine | parsed as dotted numeric version by scripts; malformed rejects/fails path-dependently |
| `checksum_sha256` | lowercase hex string | whole-ZIP integrity check | generated from package; signed inside canonical metadata |
| `force_update` | JSON string | bypasses ordinary version comparison | exact string `"true"`; generator default `"false"`; not a JSON Boolean |
| `manifest_signature` | base64 RSA-PSS bytes | updater public-key verification | crosses CDN trust boundary; invalid/missing rejects unless explicit skip paths |
| installer environment | `quartz|preprod|secure` in builders/scripts | baked/persisted endpoint/CDN selection | workflow advertises four additional invalid values |
| work email | CLI/string | plist/service/shell env, Persona fallback | active distribution validates basic form; predecessor paths interpolate raw/unvalidated data; sensitive identity |
| CA certificate/key | PEM files | TLS interception/trust and leaf signing | private key is highly sensitive; development package mode deliberately ships it |
| `.last_downloaded_checksum` | support-file string | duplicate-download suppression | mac writes before deploy and does not restore on rollback |
| download failure/quarantine state | support files/counters | after three failures, version skip | mac quarantine has no expiry |
| rollback ZIPs | local package files | update recovery | first update can store incoming new ZIP rather than previous version |
| test-server `Config` | JSON status/headers/body/mode/delay | unauthenticated control API, response threads | no schema/range/auth beyond deserialization/handler assumptions |
| captured `Message`/`RawMessage` | in-memory dict/struct | test queries/assertions until clear/exit | may contain credentials/bodies; control endpoint can read it |
| local CDN root | mutable absolute path | maps updater paths to basenames | any network client can change it to an existing directory when exposed |

Exact file names, defaults, and failure paths are in [the delivery chapter](06-endpoint-build-release-install-and-update.md) and [the tool chapter](06-endpoint-root-tools-tests-and-documentation.md).

## Dashboard browser identity and cache keys

| Name | Type/origin | Consumers/lifecycle | Sensitivity/boundary |
| --- | --- | --- | --- |
| `sentinel_token` | localStorage string from login URL | every client request; cleared only expiry/invalid boot | bearer credential; same-origin script readable |
| `sentinel_identity` | localStorage JSON derived from token payload | tenant/subscriber headers, user display state | tenant identity; stored independently of token |
| `token` query parameter | URL string | `LoginPage` once, then replacement navigation | credential crosses URL/browser/server-log boundary |
| `identity.exp` | Unix seconds | boot validation and expiry timeout | client-decoded, not signed locally |
| `['assets', params]` | React Query key | 30-second asset cache | does not include tenant |
| `['overview']` | React Query key | two-minute browser cache | does not include tenant |
| `['relationships']` | React Query key | one-minute graph cache | does not include tenant |
| `['settings','policy']` | React Query key | infinite policy cache, optimistic updates | tenant-sensitive and not tenant-keyed |
| DLP tuple | app ID, classifier ID, state | last-write-wins client map; server uniqueness validation | persisted tenant policy |
| skill tuple | app ID, skill ID, optional tool ID | client/server uniqueness | persisted tenant policy |
| dangerous permission key | `ide_id|permission_id` string | UI set and `perms.blocked` | persisted tenant policy |

The complete Go transport/table fields are described in [Dashboard/API deep reference](06-dashboard-api.md). The remaining sections complete the endpoint/IPC and repository-shell data dictionary.

## Endpoint scripting data points

| Name | Type/origin | Consumers/lifecycle | Validation / boundary |
| --- | --- | --- | --- |
| `ScriptManifest.version` | required JSON string | engine validation; updater cached version/query | only engine rejects empty; updater collapses invalid to `0.0.0` |
| `ScriptEntry.entry` | required JSON path string | joined to `script_dir` and read | no containment/canonicalization |
| `ScriptEntry.capabilities` | string array, default empty | exact sandbox gates | only `fs.read`, `process.list`, `platform.info` recognized; unknown silent |
| `ScriptEntry.timeout_ms` | `u64`, default 5,000 | wall deadline checked every 1,000 Lua instructions | no bounds; cannot preempt host calls |
| `scan_context` | Lua table from v2 match | active script global | path/type required by constructor; timestamp optional |
| `__event_data` | Lua value from trigger context | dormant manifest scripts | absent when source option is `None` |
| `SENTINEL_ALLOW_UNSIGNED_SCRIPTS` | process environment | missing-signature verifier branch | exact `1`/`true`; active v2 ignores signing entirely |
| `SENTINEL_WORKSPACE_DIRS` | process environment path list | ungated workspace roots per call | `;` Windows / `:` other; existing directories only; no canonicalization |
| `manifest.json.sig` | raw 64-byte signature | Ed25519 verifier | invalid returns false; both known callers discard it |
| `signing_public_key.pem` | gitignored compile-time file from CI secret | embedded verifier key | absent from checkout; permissive raw/final-32-byte decoder |
| `ScriptResult` | in-memory Serde aggregate | Lua callbacks → engine/v2 | mutex-protected; active converter uses nine typed vectors only |
| risk/scope/type strings | Lua fields | typed entities/backend sync | defaults supplied, no allowed-value validation in core |

The complete field-level dictionary is in [scripting result and data model](06-endpoint-core-scripting.md#result-and-data-model).

## Endpoint DLP templating data points

| Name | Type/origin | Consumers/lifecycle | Validation / sensitivity / boundary |
| --- | --- | --- | --- |
| `Detection.entity` | detector/IPC `String` | lowercase substring search; retained in serialized UI context | only trimmed-empty is skipped; potentially sensitive and crosses into webview |
| `Detection.category` / `sub_category` | optional strings | event label, HTML attributes, category tags | no allowed values/length; Tera escapes initial tags |
| extended detection metadata | five optional strings plus `detection_type` | retained in UI context; type controls proxy template/action | no local validation; not copied to simplified event entity |
| `Entity.start` / `end` | `usize` byte offsets from lowercased string | original-text slicing and webview event | Unicode lowercase can invalidate original boundaries |
| `Entity.confidence` | `f32` | serialized event only | always hard-coded `0.95` |
| `DlpEvent.id` | `event-<local timestamp millis>` | current-event association in webview command | not guaranteed unique; empty when no match |
| `JustificationContext.default_justification` | adapter/config string | retained by adapter for fallback | core never reads it |
| `timeout_secs` | request/config `u64` | clamped to ≥1 by adapter, cast to UI `u32`, used in outer queue deadline | no CLI maximum; wrapping UI cast |
| `resp_sender` | optional Tokio oneshot sender | `Some` defines blocking/FIFO; taken by decision/hide | known adapters always use `Some`; drop/cancel becomes default |
| `template_name` | string from internal selection/IPC | Tera lookup/window recreation | no allow-list; limited to loaded names |
| `popup_active` | relaxed atomic Boolean | blocking gate | changed with queue lock; read in display/query paths |
| `popup_sequence_num` | relaxed atomic usize | queue counter | reset at drain; live snapshot only |
| `popup_queue` | `VecDeque<JustificationContext>` | up to 30 waiting | in-memory only; ingress channel before it is unbounded |
| `UserJustification.event_id` | webview string | conditional event clearing | does not gate response-sender consumption |
| `UserJustification.value` | webview string | oneshot result then proxy log/policy | unconstrained; any non-closed/non-timeout decision returns it |
| `comments` / command `originalText` | webview strings | accepted by command | ignored by active response logic |

Full schemas/defaults/lifecycles are in [the templating data dictionary](06-endpoint-core-templating-engine.md#data-model-and-data-dictionary).

## Core crate/build/archive data points

| Name | Type/origin | Consumers/lifecycle | Validation / sensitivity / boundary |
| --- | --- | --- | --- |
| `sentinel-core` version | Cargo string `0.30.276` | package metadata, version consumers | independent Tauri config still says `0.0.0` |
| default features | string set: `file_index`, `file_search`, `local_discovery` | Cargo compilation | `file_search` implies `file_index`; no runtime toggle |
| `grpc_server` | Cargo feature, off | build script and IPC modules | generates schema whose `table` field contradicts Rust `schema_id` |
| implicit `compress-tools` | Cargo optional-dependency feature, off | required by excluded archive source if re-enabled | not in handwritten feature table |
| `MAX_EXTRACTION_DEPTH` | `u32 = 5` | recursive extractor | stops at `>=5`; not compiled |
| `MAX_EXTRACTION_TIMEOUT` | 300 seconds | timeout-zero default | nonzero timeouts are not clamped |
| `COPY_BUFFER_SIZE` | 131,072 bytes | archive copy loop | one allocation per copy; cancellation before reads |
| `CPU_UTILIZATION_PERCENT` | `usize = 75` | lazy semaphore | top-level task count only; does not bound Rayon |
| `STRICT_NESTED_MAGIC` | Boolean true | extracted-file classification | makes extension branch unreachable |
| archive result tuple | `(PathBuf, FileCheckResult)` | shared mutex vector → public return | partial/suppressed errors; can diverge from disk after timeout |
| protobuf `table` | field 1 string | generated QueryRequest/WriteOperation | comments give examples; no protobuf enum/validation |
| `operation` | request/write string | handwritten DB runtime dispatch | allowed names defined dynamically by schemas, not wire schema |
| `params_json` / `result_json` | UTF-8 JSON strings | DB runtime/response | protobuf itself accepts arbitrary strings |
| `op_id` / `acks` | client ID / repeated response IDs | batch sync | no format/uniqueness rule in schema |
| archive fixtures | three Git blobs totaling 129,115,948 bytes | excluded decompression tests | contain repeated docs/email and extension mismatches; provenance/classification unresolved |
| benchmark “512” text | `&str`, 519 ASCII bytes | legacy string benchmark | identifier/comment is wrong |
| bootstrap-test environment | three process-global strings | integration helpers/tests | direct tests use unsafe blocks; undiscovered common helpers do not |
| fixed test Vault keys | strings such as `test_key`, `key`, `large_data` | legacy wrapper integration tests | target real user default Vault on macOS/Windows; not namespaced/cleaned |

Exact protobuf fields, archive hashes, constants, and fixture structure are in [the final core chapter](06-endpoint-core-crate-shell-tests-and-decompression.md).

## System monitor data dictionary

| Datum | Type/allowed values | Origin → consumers | Lifecycle/validation/trust |
| --- | --- | --- | --- |
| entity `id` | UUIDv5 | discovery → store/snapshot/ingest | deterministic; formulas omit kind for several user artifacts |
| `canonical_id` | optional string on Application | app-add backend → store/children/ingest/delta match | not validated as UUID at set boundary in every path |
| `EntityKind` | 9 tagged variants | process/Lua/package → store/sync/enforcer | unknown snapshot variant fails entire load |
| governance approval | `NeedsReview`, `Approved`, `Blocked` | defaults/backend → store | unknown backend text defaults NeedsReview |
| criticality | `NotCritical`, `Critical` | defaults/backend → store | unknown defaults NotCritical |
| execution policy | `Allowed`, `Audit`, `Blocked`, `Quarantined` | defaults/backend → enforcer | unknown defaults Allowed (failure-open) |
| sync state | `Never`, `Pending`, `Synced`, `Failed` | entity/store | pending selector includes Never/Pending/Failed; current HTTP failures usually do not set Failed |
| delta cursor | `u64`, zero full bootstrap | snapshot/backend → query | stored atomically/in snapshot; no monotonicity validation |
| pending governance key | canonical-ID string | delta → store → later `mark_synced` | TTL metadata; eviction only on buffer insertion |
| PID / parent PID | `u32` / optional `u32` | OS enumerator → monitor/enforcer | PID name detects some reuse; start time unused |
| process-map entry | app name, patterns, system flag | embedded/backend → correlator | case-sensitive; remote successful empty replaces embedded |
| exclusion rule `field` | string | JSON/backend | serialized but ignored; condition always receives process name |
| cache timestamp | `Instant` | correlator/DLP | hits do not refresh; DLP eviction is oldest insertion |
| Persona tenant/subscriber | strings | local IPC → environment/context/HTTP | tenant must be nonempty; subscriber can become literal default |
| access token | optional string | Persona IPC → context/Authorization | Serde-skipped, cloneable, Debug field not redacted |
| device ID | string | platform serial helpers → sync/activity/audit | failure becomes empty string |
| scan rule | path/script/optional hook template | JSON → walker/hook probe | scanner's Windows absolute check differs from hook probe |
| Lua `scan_context` | path/type/modified table | walker → script | shipped scripts largely use their own home paths |
| raw Lua entity/relationship/risk | collector vectors/values | scripts → `ScriptResult` | converter ignores raw graph and composite risk |
| hook frame length | big-endian `u32` | local caller → server allocation | no explicit maximum before allocation |
| hook decision | Allow/Deny/Ask/Justify | evaluator/client → IDE | active evaluator emits Allow only |
| hook session ID | arbitrary string | IDE event → `DashMap` key | missing becomes `unknown`; unauthenticated local input |
| prompt/tool/file data | optional string/vectors | IDE → raw JSONL/activity HTTP/logs | potentially sensitive; 500 distinct tool/file caps only |
| activity channel/batch | 1,000 / 100 entries | evaluator → HTTP | full/drop; two attempts; no durable spool |
| popup cooldown | seconds per entity name | config/enforcer | separate from kill backoff |
| kill attempt counter | `u32` per entity name | enforcer | gates sweep, not Rediscovered events |

Complete entity/artifact/request field tables are in the [runtime](06-endpoint-system-monitor-runtime-discovery-and-state.md#entity-and-governance-model) and [sync/hook](06-endpoint-system-monitor-sync-enforcement-and-hooks.md) chapters.

## Template service data dictionary

| Datum | Type/allowed values | Origin → consumers | Lifecycle/validation/trust |
| --- | --- | --- | --- |
| `type` | `render_request`, `render_response`, `dismiss_request`, `status_query`, `status_response` | broker JSON ↔ Serde enum | required internal tag; malformed/unknown messages silently dropped inbound |
| `request_id` | arbitrary string | caller → active slot/response | no format, uniqueness, or length validation; queue retains ID but dedup can discard later IDs |
| `template_name` | arbitrary string | caller → exact registry lookup | unknown receives Closed; file selected indirectly by registry |
| `template_type` | optional `Justify`, `Block`, `Notification` | caller/registry → routing/display | request Notification alone selects notification state; absent value uses registry only for display |
| `title` / `description` | optional strings | caller or registry defaults → Tera/slot | no length validation; title is regular dedup key; title+description part of notification key |
| `original_text` | optional string | caller → Tera context | no committed fragment consumes it; crosses local IPC/trust boundary |
| theme colors | five optional strings | caller → regex sanitization → Tera context | `#[0-9A-Fa-f]{3,8}` or fallback; no committed fragment reads theme |
| `criticality` | optional Info/Warning/NeedsAttention | caller → notification fragment/state | missing notification value defaults Info; NeedsAttention forces stored timeout zero |
| `show_timer` | Boolean | caller → Tera conditional | not exposed in view; JavaScript still starts timer when timeout > 0, even if false |
| `timeout_seconds` | `u32` | caller → rendered text/view/browser timer | no maximum; navigation/reload restarts full value; NeedsAttention overrides to zero |
| `show_dismiss_button` | Boolean | caller → alert/block fragment | ignored by notification fragment, which always has X |
| `justifications` | string vector | caller/default → Tera context | committed alert uses only free-text input; vector unused |
| `branding_text` | optional string | caller → handler fallback → fragment | missing/None becomes `Secured by Quilr`; displayed only when `show_logo` true |
| `logo_url` | optional string | caller → Tera context | no committed fragment reads it |
| `show_logo` | Boolean | caller → fragment | controls branding text and CSS logo block together, despite field name |
| response `decision` | five enum values | UI/handler → caller | unknown browser decision input maps Closed before serialization |
| `justification` / `comments` | optional strings | browser/handler → response | alert enforces 20–140 trimmed chars client-side; no Rust-side validation |
| broker `source` / response target | arbitrary claimed participant ID | broker → internal command → active slot/response | not authenticated; discarded on queue and later dedup requests |
| `dedup_count` | `u32` starting at 1 | state → browser badge | unchecked increment; process-local; duplicate IDs not retained |
| `created_at` | `Instant` | slot creation/dedup | refreshed but never read; not serialized/persisted |
| regular active limit / FIFO limit | `usize`, defaults 5/50 | TOML → state | zero produces queue-only/non-draining behavior |
| notification active/FIFO limit | `usize` default 5 / literal 50 | TOML/code → state | FIFO bound is not configurable |
| registry key | exact string | hardcoded/simple/backend-shaped local JSON | later layer overwrites; no normalization |
| backend `content` | stringified JSON | local file → inner content parser | header/title required; malformed row skipped |
| status counts | `usize` regular active/queue only | state → query response | excludes notifications; visibility failure becomes false |

The complete schemas and lifecycle defects are in [the template-service chapter](06-endpoint-template-service.md#ipc-public-interface).

## Email-discovery helper data dictionary

| Datum | Type/format | Origin → consumer | Validation/lifecycle/trust |
| --- | --- | --- | --- |
| `--ipc-socket` | optional arbitrary string | parent ProcessConfig/operator → helper | first precedence; no empty/path validation |
| `IPC_SOCKET` | optional environment string | parent/helper environment → helper fallback | used only if CLI absent; Windows active spawner does not explicitly pass config env |
| `RUST_LOG` | filter string | environment → tracing subscriber | invalid/missing becomes `warn` |
| endpoint name | fixed `/tmp/sentinel-email-discovery.sock` or `\\.\pipe\sentinel-email-discovery` | `IpcAddress::for_service` → parent/child | predictable/shared; no per-run nonce |
| frame length | four-byte big-endian `u32` | core producer → parent reader | parent accepts zero; rejects above 1 MiB; producer cast unchecked/no cap |
| payload | UTF-8 JSON `Vec<EmailCandidate>` | nine sources → privileged parent | Serde shape only at receive; no peer binding/post-receive email validation |
| candidate | email/source/all_sources/discovered/last-access timestamps | local profiles/accounts → Persona dedup/sort | per-source validation precedes honest frame; source failures suppressed |
| exit code | normal zero, explicit 1, Clap-controlled syntax code | helper → OS/parent | parent generally does not inspect it in hot path |
| parent accept deadline | 30 seconds | core constant → accept/read future | spans connection plus frame; timeout kill result ignored |
| parent payload cap | 1,048,576 bytes | core constant → allocation gate | bounds one payload; producer has no matching limit |

Full field provenance and trust behavior are in [the helper chapter](06-endpoint-email-discovery.md).

## Diagnostics data dictionary

| Datum | Type/allowed values | Origin → consumers | Lifecycle/validation/trust |
| --- | --- | --- | --- |
| payload `id` | UUID v4 string | producer constructor → IPC/file/OpenSearch/sent set | required on wire; standalone receiver discards/regenerates; ordinary backend field, not `_id` |
| `timestamp` | UTC RFC 3339 datetime | constructor → file/OpenSearch | required; standalone receiver regenerates; template maps date |
| `level` | debug/info/warn/error/critical | macro/direct caller → display/index | exact enum; unknown fails Serde |
| `category` | ten snake-case variants | caller → display/index | exact enum; unknown fails |
| `component` | 16 snake-case variants | module-path classifier/direct caller → display/index | required; substring inference, no override pattern |
| `code` | optional string | `DiagCode.code_str`/direct caller → backend | constructor always Some; receiver null becomes `UNKNOWN`; no registry/length check |
| `message` | string | caller → broker/log/index | required; no length/redaction check |
| `context` | optional arbitrary JSON | macro/direct caller → broker/log/index | no schema/size/redaction; template declares `flat_object` |
| envelope `type` | event/batch/lifecycle | producer → receiver Serde | internal tag required; valid untagged JSON debug-dropped |
| lifecycle type | started/stopped/crashed/heartbeat | sender constructors → wildcard broker message | crashed has no production caller found |
| lifecycle process ID | arbitrary string | facade initialization → broker/log only | claimed identity; receiver does not bind into payload |
| lifecycle timestamp | `u64` epoch ms | host clock → receiver log | host pre-epoch failure becomes zero |
| broker channel/service | fixed `ipc_light_broker` / `diagnostics_service` | sender/receiver | not configurable; diagnostics layer has no source authorization |
| local base path | string default `diagnostics` | Config → `<base>.log`/`.sent` | relative to CWD; no parent creation/mode/rotation |
| `.log` records | NDJSON payloads | ring flush → batch scanner | invalid/read-error lines silently skipped; append-only/no compaction |
| `.sent` records | UUID per line | successful-status marking → startup HashSet | invalid/read-error lines skipped; append-only; one open/flush per ID |
| buffer capacity/threshold | usize default 100 / 50 | Config → RingBuffer | zero accepted; upstream queue still unbounded |
| batch size | usize default 10 | Config → log scan/Bulk | zero prevents export |
| retry/poll delay | u64 default 5,000 ms | Config → worker sleep | recreated after every event; sustained input can starve it |
| Bulk index | literal `diagnostics` | Sender action line → OpenSearch | independent of configured endpoint URL |

The complete serialization and state lifecycle is in [the diagnostics chapter](06-endpoint-diagnostics-receiver.md#wire-and-stored-data-dictionary).

## Endpoint infra platform/process data points

| Data point | Type/origin | Consumers/lifecycle | Validation and trust-boundary behavior |
| --- | --- | --- | --- |
| `IpcAddress.path` | public `String` | address managers, client/server, core logs | constructor accepts anything; target-specific manager validation is separate |
| service IPC path | formatted string | `/tmp/sentinel-{service}.sock` or `\\.\pipe\sentinel-{service}` | service name unescaped/untrimmed; active names are repository constants |
| `ProcessConfig.binary_path` | required `PathBuf` | `Command` or native command line | OS validates at spawn; resolver need not return canonical/absolute |
| `ProcessConfig.args` | ordered `Vec<String>` | child command line | macOS `Command`/env args; Windows native custom quoting is incomplete for edge backslashes |
| `ProcessConfig.env` | optional map | ordinary spawn and macOS user spawn | Windows native user spawn does not read it |
| `working_dir` | optional path | ordinary/native spawn | no prevalidation; OS error becomes spawn failure |
| `ipc_address` | optional string | builder/default helper | concrete spawners do not read it; environment/CLI separately transports endpoint |
| `run_in_user_space` | bool default false | process spawners | only active when service-mode variable exists |
| `SENTINEL_SERVICE_MODE` | ambient variable | macOS/Windows branch selection | presence only; value not parsed |
| `SERVICE_NAME` / `IPC_SOCKET` / `NO_COLOR` | core config map | child service setup | not explicitly supplied in Windows native path |
| `SENTINEL_LOG_DIR` | config or ambient | Windows ordinary stderr log and child | file open failure suppressed; per-spawn entry omitted natively |
| `SENTINEL_DLP_TEMPLATE_DIR` | config map | templating child | omitted by Windows native spawn map handling |
| `IPC_LIGHT_PIPE_PATH_IPC_LIGHT_BROKER` | ambient/config | broker and in-process clients | core writes the derived/user value into ambient agent environment |
| cached executable directory | `Option<PathBuf>` | each resolver instance | snapshot at construction; failure remains for instance lifetime |
| cached exit status | `Option<ExitStatus>` | process handles | absent means immutable `is_alive` reports true even after actual exit |
| Job Object handle | process-global `OnceLock` | Windows all child assignments | invalid first result permanently disables retry; valid handle intentionally never closed by Rust |
| macOS target PID | `u32` from `pgrep -n -x` | launchctl handle and signals | not filtered by uid/session/path/start time |
| timeouts/polls | 10/100/500 ms and fixed attempt counts | sync loops | Unix connect can overshoot; Windows pipe requested timeout ignored by stub |

See [the full infra data/config analysis](06-endpoint-infra-platform-runtime.md#configuration-and-data-dictionary).

## Endpoint proxy data dictionary

| Data point | Type/origin | Consumers/lifecycle | Validation, trust, and invalid behavior |
| --- | --- | --- | --- |
| proxy bind/HTTP/HTTPS ports | CLI/config integers | listeners and redirector runtime overrides | bind validates operationally; redirector scalar ranges are not prevalidated |
| monitored TCP/UDP ports | vectors from TOML/runtime | WinDivert filter and Swift rules | Windows uses effective values; Swift hard-codes TCP+UDP 443 |
| `intercept_tls` | bool redirector config | intended TLS selection | ignored by current Swift provider rules |
| process allow/deny names/PIDs | config vectors | Windows TCP and Swift exclusion | Windows UDP ignores allow lists/deny PIDs; Swift name lookup is case-sensitive |
| `RequestContext` identity | request/mutable state | extraction, policy, alert, logs | process attribution may be absent; direction capitalization disagrees with DLP recorder |
| request/response body bytes | Hyper frames | capture, extraction, alert construction | full buffering in key paths; invalid UTF-8 becomes lossy text; size caps vary by stage |
| DLP finding | rule/category/confidence/matches | policy decision and alert | analyzer-dependent; analyzer errors generally permit flow |
| DLP action | Allow/Block/Ask/Monitor variants | response/UI/alert path | unknown or missing core policy action defaults to Allow |
| justification response | option/string/default | enforcement decision | timeout, cancellation, queue saturation, UI failure resolve to configured default |
| uniqueness key | xxh/hash-derived identifier | in-memory suppression cache | cache state only; collisions are not independently validated |
| OCR cache key/value | `xxh3_64(image bytes)` → text | process-lifetime bounded-entry cache | successes only; arbitrary eviction; no byte cap or collision byte check |
| destination cache entry | connection/destination tuple | transparent TLS lookup | cache expiry/absence can fail connection; distinct dormant resolver configuration exists |
| circuit state | named breaker counters/timestamps | forwarding | fixed breaker identities; destination scoping not demonstrated |
| Windows C2S/S2C tuple maps | socket tuples/process metadata | packet rewrite/masquerade | no periodic TCP-flow expiry; one reverse map has no read consumer |
| UDP attribution key | local IPv4 + port | Windows UDP policy | destination/process-start omitted; port reuse within TTL can misattribute |
| macOS control frame | u32 BE length + tagged JSON | Swift/Rust Unix socket | Rust encode max 1 MiB; listener framing/FD limits differ; current Swift queue keeps newest 64 |
| relay metadata | JSON length + process/source/destination/domain/protocol/timestamp | Rust localhost relay | up to 64 KiB metadata; claimed by unauthenticated localhost peer; IPv6 unsupported in attribution |
| Swift TCP source | `0.0.0.0:0` in active relay | Rust global attribution map | causes tuple collision/overwrite across relayed flows |
| heartbeat request | one 256-byte read | Rust heartbeat server | substring path match only; no method/auth validation |
| health response | JSON | unauthenticated local/network caller | version is fixed `0.1.0`, disagreeing with Cargo/plists |

Field-level Rust/Swift schema locations are in [DLP semantics](07-symbol-reference/endpoint-proxy-dlp.md) and [redirector semantics](07-symbol-reference/endpoint-proxy-redirector.md).
