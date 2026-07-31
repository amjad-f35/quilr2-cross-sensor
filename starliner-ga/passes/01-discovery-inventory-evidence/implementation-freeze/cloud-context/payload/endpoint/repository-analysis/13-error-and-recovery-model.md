# 13 — Error and Recovery Model

## Endpoint delivery and support errors

The [delivery failure matrix](06-endpoint-build-release-install-and-update.md#builddeployment-failure-matrix) classifies builder, signer, notarization, installer, update, rollback, uninstall, Python deployment, and old manifest errors. Important repository-wide outcomes are:

- current Windows packaging fails closed on a missing required primary binary; current mac packaging warns and can omit companions;
- updater metadata/signature/checksum errors reject a CDN update, while local package paths have weaker/different trust inputs;
- update rollback is best-effort and cannot restore the pre-update version on the first update under the verified backup logic;
- the mac distribution uninstaller suppresses every wrapped phase's nonzero status before reporting success;
- alternate Python normal deployment fails before its main exception handler due to a missing parser attribute;
- old manifest signing catches errors and permits an unsigned package;
- install checker findings and local DevSecOps findings are displayed but not returned as an aggregate nonzero exit;
- Rust test-server startup can hang on its untimed blocking first-line read; Unix stale cleanup replaces the calling process.

## Dashboard/API error matrix

| Failure | Handling | Observable result | Recovery |
| --- | --- | --- | --- |
| Missing/invalid startup config | logged fatal | exit 1 | correct environment and restart |
| ClickHouse connect/table validation | logged fatal | exit 1 | migrate/restore database and restart |
| Unexpected HTTP server failure | serving goroutine calls `os.Exit(1)` | immediate process termination | external restart only |
| Graceful HTTP shutdown exceeds 30 s | logged, exit 1 | writer drain is skipped | external restart; queued data can be lost |
| Ingest queue `Add` context ends | converted to `ErrBufferFull` | 503 + `Retry-After: 5` | client retry |
| Mid-entity multi-queue enqueue failure | propagated after earlier queue side effects | 500/503 | retry can duplicate already queued work |
| Edge enqueue failure | warning only | ingest still 200 | no internal replay |
| Batch insert failure | retry with exponential delay; then log/drop | original request already succeeded | none after retry exhaustion |
| Dashboard primary query failure | error returned | usually 500 | client retry |
| Several dashboard subordinate queries | error suppressed | partial 200 | client cannot distinguish omission |
| Delta query/scan/marshal failure after stream start | embedded `error` field | partial HTTP 200 JSON | client must inspect body |
| Static-config reload failure | log; serve stale when cached | 200 stale or 500 if no cache | retry after five-minute/stale check |
| Tenant-policy row corruption | converted | 500 `stored policy is corrupt` | repair stored row |
| Tenant-policy migration row failure | warning and continue | command exits 0 after scan | inspect logs and rerun after repair |
| Panic in request handler | Chi Recoverer | 500 | next request continues |

Detailed retry, shutdown, and partial-failure semantics are in [the API deep reference](06-dashboard-api.md#batch-writer-concurrency-and-durability).

### Frontend error behavior

| Failure | Current behavior |
| --- | --- |
| Missing/malformed/expired login token | generic auth error page; reason only console-logged |
| Expiry while open | storage/user cleared; ProtectedRoute redirects; query cache retained |
| HTTP non-2xx | client throws status plus raw body; React Query retries queries once |
| Overview query failure | indefinitely displays loading text when no data |
| Assets/activity/alerts failure | often displays empty state because page ignores query error |
| Detail fetch failure | swallowed; previous related/device state can remain |
| Policy 409 | policy invalidated and temporary conflict toast appended to DOM |
| Other policy save failure | cache invalidated; no user-facing message |
| Clipboard failure | swallowed |

There is no frontend error boundary or centralized 401 cleanup.

## Endpoint scripting error matrix

| Failure | Handling | Observable result | Recovery |
| --- | --- | --- | --- |
| Missing/invalid compile-time PEM | compile-time include fails when feature builds | build failure | materialize correct file before Cargo |
| Missing manifest | engine/verifier returns `NotFound` or `Manifest` | constructor/update error | repair bundle and retry externally |
| Missing signature | verifier errors unless bypass | constructor/update error | sign or set bypass |
| Present invalid signature | verifier returns false; known callers ignore | load/install proceeds | none; caller must explicitly inspect Boolean |
| Manifest I/O/JSON/empty version | typed `ScriptError` | engine fails; reload may already have cleared/partially filled state | repair and reload/reconstruct |
| Missing referenced script | warning/skip | reduced script count | restore file/reload |
| Lua setup/exec error | engine emits error result; v2 returns/logs error and discards partial output | warning/error log | next script/match/cycle continues |
| Timeout observed | engine `Timeout`; v2 generic formatted Lua error | current script fails | later cycle only; blocking host call is not cancelled |
| Host read/process failure | usually nil/empty/false | script may under-discover without cause | script can only infer absence |
| Collector mutex poison | unwrap panic | task/process behavior depends on caller | none in module |
| Dispatcher task panic | dropped join handle | unobserved | none |
| Update HTTP/archive/copy failure | propagated `Io` | false not returned; destination may be partial during copy | external retry; no rollback |

Full classification is in [scripting errors](06-endpoint-core-scripting.md#errors-and-recovery-matrix).

## Endpoint DLP templating error matrix

| Failure | Classification | Handling/result | Recovery |
| --- | --- | --- | --- |
| Template globs fail/miss `alert.html` | startup | log and return before Tauri | none; later callers fail/default |
| Tera serialization or poisoned mutex | fatal/panic | `unwrap` | none |
| Tera render | converted | error HTML returned as success string | later update may rerender |
| Window show/focus/emit | suppressed | waiter remains outstanding | safety timeout/default |
| Template-change close | logged/continued | sleep then same-label build | build may panic |

## Template service error and recovery matrix

| Error/failure | Handling | Retry/cleanup | Final effect |
| --- | --- | --- | --- |
| TOML absent/unreadable/invalid | silently default | none | service continues with defaults |
| registry base/overlay unreadable | silently retain prior layers | none | defaults/earlier entries remain |
| registry JSON invalid | warning | none | prior entries remain |
| backend inner content invalid | warning and per-row skip | none | only that key absent/not overwritten |
| Tokio runtime creation | `expect` | none | process panic |
| initial kill query failure/late response | debug | listener later resyncs | fixed gate can start enabled (fail-open) |
| persistent kill listener failure | debug/warn | unbounded exponential reconnect | enabled atomic retains prior value |
| main IPC session failure | warn/error | cumulative max ten, exponential delay | detached IPC task permanently stops; UI stays alive |
| broker Shutdown | normal break | none | IPC task exits; UI is not signaled |
| malformed/unsupported inbound JSON | ignored | none | request receives no response |
| closed render-command receiver | send error ignored | none | request lost |
| unknown template name | Closed response/comments | none | rejected without UI |
| Tera per-request render error | logged, escaped fallback HTML | none | request accepted with error page |
| active/FIFO full | Closed response/comments | none | rejected |
| response channel uninitialized/closed | send error suppressed | none | response lost |
| regular window builder | `expect` in render thread | none | render thread panics; process/IPC may survive |
| notification window builder | log only | none | active notification can remain invisible |
| Tera startup parse/glob failure | log and return | none | binary returns normally |
| Tauri application build | `expect` | none | process panic |
| poisoned Tera/state mutex | `into_inner` recovery | none | operation continues with protected value |
| browser invoke/listen action | console error | decision guard reset only on selected failures | current request can remain active |
| Ctrl+C or kill disable | standard channel | closes known windows, exits 0 | all in-memory requests lost; external supervisor may restart |

There is no transaction rollback, durable replay, dead-letter queue, response acknowledgment, request expiry in Rust state, or shutdown drain. The detailed queue/dedup partial failures are in [the template-service flow analysis](06-endpoint-template-service.md#render-and-state-flow).

## Email-discovery error conversion

| Error | Classification in child | Parent outcome |
| --- | --- | --- |
| missing endpoint | fatal exit 1 | normally 30-second accept timeout; spawn wrapper may notice early exit in one macOS case |
| invalid CLI | Clap fatal | same parent qualification |
| individual source error | warning/suppressed | partial or empty successful frame |
| source task panic/cancel | error/suppressed | partial or empty successful frame |
| serialization | error converted to `[]` | empty successful frame |
| connect/open/write/flush | fatal exit 1 | read error or timeout; kill attempt; empty Ok |
| bind/binary resolution/spawn | no child/parent log | parent returns `NoEmailSourcesFound` Err and cleans as applicable |
| zero-length frame | helper does not produce | parent accepts empty Ok |
| oversized frame | no producer cap | parent rejects before allocation, kill attempt, empty Ok |
| truncated/invalid JSON | child may already exit | parent logs read failure with preview, kill attempt, empty Ok |
| 30-second timeout | child may be blocked | kill result ignored, empty Ok, detached five-second reap |

This layer deliberately mixes fatal `Err`, empty success, process exit, and logged suppression. The comment claiming all errors are nonzero is false. No subprocess retry or durable recovery exists.
| Window/app build | fatal/panic | `expect` | none |
| FIFO full | handled/degraded | sender receives `None` | adapter returns default |
| Context disconnect | logged | receiver stops, app continues | none |
| Shutdown value/disconnect | terminal | close best-effort, exit zero | none |
| Response send failure | suppressed | FIFO still advances | none |
| Webview invoke rejection | browser error UI | sender unresolved | safety timeout/default |
| Block/prompt second hide | handled but incorrect | next sender gets `None`; FIFO advances twice | next caller defaults |
| Unicode lowercase offset mismatch | potential panic | original UTF-8 slice can panic | none |

Adapters collapse `None`, cancellation, and timeout to the configured default; callers cannot distinguish close, expiry, queue rejection, UI failure, shutdown, or channel loss. See [the detailed failure matrix](06-endpoint-core-templating-engine.md#error-failure-and-recovery-matrix).

## Core build/archive/test error matrix

| Failure | Handling | Observable result | Recovery/status |
| --- | --- | --- | --- |
| Tauri build processing fails | dependency build script behavior | core build failure | repair configuration/dependency environment |
| Vendored protoc lookup fails | ignored | tonic-build attempts normal resolution | external compiler may be used; exact path unresolved |
| Proto compilation fails | explicit panic | package build fails | fix compiler/schema |
| Generated schema/Rust field mismatch | static compile error when feature builds | `grpc_server` unusable | align `table`/`schema_id` source |
| Archive root detection fails | recursive coordinator converts to `None` | no flattening; extraction continues | none |
| ZIP entry open/path/create failure | often dropped | partial `Ok` vector | none; caller cannot distinguish omission |
| Any ZIP/TAR copy I/O error | relabeled `Cancelled` | outer public function suppresses it and returns partial vector | partial file retained |
| 7z non-interrupted final error | suppressed | partial success | none |
| RAR entry extraction failure | logged then loop breaks | partial `Ok` | none |
| Fallback channel disconnect | treated as success | target walk result | none |
| Archive timeout | sets cancellation then immediately snapshots | `Ok(partial)` while workers may continue | cooperative eventual stop only; no join |
| macOS-junk filter failure | return ignored | unfiltered partial vector | none |
| Legacy benchmark API mismatch | compile failure | no results | port to current `SerializedAlert` API |
| Test stale default assertion | panic | test executable failure | migrate expected graph |
| Service startup in permissive tests | errors often discarded | test may proceed/pass with no service evidence | logs only |
| Common helper environment mutation | edition-2024 unsafe call outside unsafe | static compile failure if module is imported | add audited unsafe/isolation or avoid mutation |

The archive subsystem is excluded, and checked CI invokes builds rather than tests/benches. Full branch evidence is in [the core shell chapter](06-endpoint-core-crate-shell-tests-and-decompression.md).

## System monitor error and recovery matrix

| Failure | Handled as | Retry/recovery | Terminal effect |
| --- | --- | --- | --- |
| explicit/adjacent config invalid | propagated `anyhow` | none | monitor exits |
| kill-switch IPC unavailable/late/malformed | log + enabled default | listener/query behavior only | startup normally proceeds |
| Persona unavailable | retry/backoff | indefinite until cancel | orchestrator never reaches workers |
| snapshot corrupt | warning | start empty | policy/cursor/cache state lost/rebuilt |
| process-map initial fetch | warning | embedded fallback + 600 s refresh | discovery continues |
| process enumeration | warning | next scan | transient discovery gap |
| scanner HOME absent/top-level error | task wrapper error | none | Lua scanner permanently stops while process lives |
| Lua script failure | per-script log/continue | next scan interval | that detector's entities absent/stale |
| Go metadata child stalls | unbounded wait | none until child exits | package task and shutdown join can stall |
| app-ID/ingest network | warn | fixed 5 s loop | entities remain pending/deferred |
| ingest response parse | warn | next loop | successful server write can be repeated |
| delta network/parse | warn | configured interval | cursor unchanged |
| delta server error string | warn + `Ok` | configured interval | cursor unchanged |
| event broadcast lag | warning | enforcement sweep partly repairs | non-enforcement transitions can be missed |
| process action partial failure | per-PID log | later event/sweep | survivors possible |
| alert POST | immediate one retry | no durable retry | event lost; second non-2xx silent |
| hook install/integrity | warn | discovery/probe/integrity repeats | hooks absent or drifted |
| hook IPC error | client fail mode | none within invocation | allow by default / deny when configured closed |
| session worker channel failure | retry once | then Allow | request fail-open |
| activity channel full | warning/drop | none | entry lost |
| activity HTTP failure | one delayed retry | then drop | batch lost |
| DLP failure | propagated to caller | none in dormant client | no production effect |
| cancellation | shared token + joins | final snapshot | unjoined listeners/process-global state stop only at process exit |

`crate::error::Error` is not a single universal error mechanism: modules also use `anyhow`, `String`, `std::io::Error`, Serde/reqwest errors, log-and-suppress branches, `unwrap`, `expect`, and panic-producing invalid numeric settings.

## Diagnostics error and recovery matrix

| Failure | Classification/handling | Data effect | Recovery |
| --- | --- | --- | --- |
| local init without Tokio runtime | panic from spawn | process/caller abort | none |
| repeated init | silently ignored | first config remains | process restart |
| storage construction | error logged; worker returns | global sender remains closed; future sends silently lost | none |
| local channel closed | `emit` ignores send error | event lost | none |
| receive-branch file write | warning | drained suffix can be lost | next event/timer only |
| timer read/flush | error silently ignored | drained suffix can be lost | later timer |
| sent mutex poisoned | unwrap panic | worker stops | none |
| corrupt/read-error file line | silently skipped | log event omitted or sent ID forgotten | manual repair/restart may resend |
| backend network/non-2xx | batch not marked | retained in log | fixed periodic retry if timer fires |
| Bulk HTTP 200 item failure | treated success | failed item marked sent | none |
| sent-file mark failure | ignored after in-memory insert | current process suppresses; restart can duplicate | restart/rescan |
| IPC connect/handshake/send/receive | first silent, later debug; queue drained | queued and failed-send events lost | exponential reconnect to 60 s |
| broker Shutdown sender | normal permanent return | later facade events lost | process restart only |
| broker Shutdown receiver | normal main return | runtime cancellation can lose memory buffer | external restart only |
| malformed IPC | debug/warn and discard | message lost; full payload may log | sender retry only |
| backend absent on receiver startup | warn and continue | file buffer if writes succeed | worker retry; Docker auto-start attempted |
| Docker command hang | no timeout | receiver never reaches broker | external termination |

No transaction rollback, dead-letter queue, item-level retry, atomic log/sent commit, graceful drain, circuit breaker, compaction, or recovery command exists. Full branch evidence is in [the diagnostics error analysis](06-endpoint-diagnostics-receiver.md#error-and-recovery-matrix).

## Endpoint infra error and recovery

| Operation/error | Classification | Suppression/degradation | Recovery |
| --- | --- | --- | --- |
| platform getter on Linux | panic via `todo!` | none | unsupported without code change/rebuild |
| address preparation | `io::Error` → core initialization failure | Unix absence accepted | later service retry through core policy |
| resolver missing/permission/not-executable | `BinaryError` → initialization failure | Windows candidate errors suppressed to later `NotFound` | core retry/restart only |
| stale child scan/kill | tracing warning | every error ignored; spawn continues | next spawn scans again |
| ordinary spawn | typed `ProcessError` | stderr-log/Job assignment failure suppressed | core supervisor retry |
| interactive session/token unavailable | `SpawnFailed` | per-session failures tried/logged | core supervisor retry |
| macOS PID discovery exhaustion | `SpawnFailed` | intermediate lookup errors hidden | core supervisor retry |
| Unix connect timeout | `IpcError::Timeout` | last OS error discarded; may overshoot | caller retry |
| Unix receive timeout | `ReceiveFailed` | reset error ignored | caller decides |
| Windows IPC | `NotImplemented` | core standard probe degrades to no-op | no transport recovery implemented |
| standard IPC probe failure | core warning | paired `NoOpIpcChannel` silently discards sends | process remains managed |
| process wait | `WaitFailed` | macOS launchctl blocking wait suppresses wrapper wait error | supervisor may restart based on resulting handle state |
| Job containment failure | warning | process runs uncontained | no reinitialization after invalid `OnceLock` value |
| server shutdown unlink failure | `OsError` | Drop retries best effort | external filesystem cleanup |

Error enums contain numerous never-constructed variants, so their documented categories do not prove implemented detection. Infra itself has no retry queue, circuit breaker, rollback, health state, or recovery command.

## Endpoint proxy error and recovery matrix

| Failure | Handling/classification | Recovery/result |
| --- | --- | --- |
| invalid mutually exclusive/config relationship | panic in `ProxyConfig::from_args` | process terminates; no typed CLI validation response |
| logging/global initialization repeat | error, ignored `OnceCell` set, or panic depending initializer | process is designed for one start; no reset |
| policy initialization/fetch unavailable | background retry; request evaluator sees unavailable state | traffic allowed while unavailable |
| DLP analyzer/extractor error | logged/converted by DLP path | generally allow/monitor; stage-specific empty data possible |
| justification timeout/UI/queue/channel failure | converted to configured default | request action follows default rather than distinct failure state |
| alert/diagnostic enqueue failure | warning/drop or upstream subsystem behavior | does not roll back forwarded/blocked request |
| upstream request error | breaker accounting and configured retry/fallback | may retry non-idempotent request; final generated gateway error |
| body/stream error | propagated or generated response | no transaction rollback across already logged/extracted state |
| DNS/connect failure | configured retry/backoff in DNS adapter | final connection error; health counters may update |
| certificate/temp-file error | connection-local error | no automatic CA repair; selected temp cleanup is best effort |
| WebSocket side failure | detached/select relay terminates/logs | no reconnect, circuit, or overall timeout |
| Windows WinDivert open/filter error | setup error | redirector fails; outer proxy join behavior determines process outcome |
| Windows packet receive error | log and immediate loop | no backoff; potential CPU/log loop |
| Windows shutdown | broadcast plus local wake connects | wake is excluded by filter; blocked worker can hang indefinitely |
| process attribution miss | Windows TCP intercepts; UDP blocks except bypasses; Swift uses Unknown/0 | connectivity remains for TCP through inspection; UDP differs |
| macOS initial IPC connect failure | Swift logs and still calls startup completion | no scheduled reconnect from this failure path; TCP cannot relay without address |
| macOS control EOF/error | Swift reconnect with exponential delay/grace queue | recovery task/state has suppression and heartbeat-restart gaps |
| macOS heartbeat failure | connection-death handler/reconnect | heartbeat task property remains non-null, preventing a new monitor after recovery |
| macOS flow relay saturation | three-second permit wait | rejects/ends flow; Swift has separate 200-permit cap |
| macOS monitored UDP | active branch opens then closes with `ECONNREFUSED` | no active forward/retry |
| Objective-C preference save on stop | callback error captured but success returned | stop can report success despite failed persisted disable |
| Swift build failure in Cargo build | Cargo warning | Rust build continues without proved extension bundle |
| dev signature/verification failure | warning/`|| true` | install/run can continue with unsigned/invalid artifacts |

There is no end-to-end transactional recovery linking interception, extraction, policy, UI, alerting, forwarding, and audit. See the four proxy chapters for exact error types and symbol paths.
