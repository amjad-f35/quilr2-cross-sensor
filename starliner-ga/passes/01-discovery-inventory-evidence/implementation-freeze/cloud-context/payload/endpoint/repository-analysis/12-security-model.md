# 12 — Security Model

## Endpoint build and deployment trust boundary

| Control/boundary | Enforcement location | Verified result |
| --- | --- | --- |
| update metadata authenticity | distribution installers, embedded public key | RSA-PSS verification implemented and normally on; skip paths exist |
| package integrity | SHA-256 in signed update metadata | CDN ZIP checked; local install paths do not uniformly have signed metadata |
| Windows Authenticode | distribution installer/signing subset | opt-in/off by default; signing allowlist omits several executable/driver artifacts |
| macOS code signing | builder and installer executable-dir check | builder deep-verifies app; installer checks only executable regular files, not complete app/support |
| archive traversal | Windows `Test-ZipSafety`; mac `validate_zip_safety` | Windows called; mac helper uncalled |
| CA private key | builders/installers | development packaging can place key on endpoints; no profile guard |
| build credentials | GitHub secrets/temp files/command args | Windows HSM secrets reach command line; cleanup incomplete for every decoded file |
| committed old dev identity | `build/certs/dev/*` | matching usable private key/cert/container/credential committed; scoped to dev identity based on cert evidence |
| installer privilege | script elevation/root checks and OS service/cert APIs | broad privileged filesystem, trust-store, network, service and shell mutations |
| local tool access | CDN/test server binds | CDN/test server unauthenticated on all interfaces; Persona mock loopback-only |

**Potential issue requiring validation:** raw email interpolation into plist/shell/service configuration can become syntax or command-content injection depending attacker control and target parser. The repository does not establish that only trusted administrators supply it in all paths.

**Potential issue requiring validation:** local CDN root switching and test-server control/message APIs are appropriate for disposable test hosts but unsafe on an untrusted reachable network.

See [the complete delivery security findings](06-endpoint-build-release-install-and-update.md) for key material, signing coverage, trust-store effects, TLS disablement, updater/rollback boundaries, and vendor provenance.

## Dashboard/API controls

See [middleware and trust boundaries](06-dashboard-api.md#middleware-and-trust-boundaries) for enforcement logic.

| Control | Enforcement | Decision input | Failure behavior | Coverage/status |
| --- | --- | --- | --- | --- |
| Agent tenant HMAC | `TenantAuth` | bearer tenant, subscriber, HMAC and server secret | 401 | Complete integrity check for the timeless token shape; no expiry/replay protection |
| Development tenant identity | `TenantAuth` | two raw headers when secret empty | 400 | Intentional development mode; no authentication |
| Portal identity | `PortalAuth` | unverified payload, expiry, and matching tenant headers | 401 | **Potential issue requiring validation:** signature is never checked |
| Tenant isolation | Context-derived tenant/subscriber SQL predicates | middleware context | request rejection or scoped query | Present throughout reviewed production repositories |
| Role authorization | None found on production mutations | N/A | N/A | Not implemented in reviewed route chain |
| Request body limits | `MaxBytesReader` in write/ingest handlers | config or fixed cap | decoder error/400 or 413 by batch count | Partial; query endpoints have no body |
| Enum validation | handlers/model policy validator | request fields | 400 | Feature-specific and intentionally lax in several telemetry envelopes |
| Hook-config traversal guard | `validTenantID` regex | authenticated tenant ID | base-only response | Implemented |
| ClickHouse TLS | driver TLS config | `CLICKHOUSE_TLS` | connection failure | Certificate verification left enabled |

**Verified deployment contradiction:** repository comments assume a signature-verifying portal proxy, while checked-in Compose publishes the API server on host port 33333. No repository enforcement binds that port to a trusted proxy.

**Verified secret-handling concern:** `api_server/v2/.env` is a tracked file and contains a concrete ClickHouse password. This documentation does not reproduce it.

**Verified additional dashboard boundaries:** root `.env` and `app-intel/.env` also carry concrete connection credentials. API builds use a subdirectory Docker context with no effective `.dockerignore`, and `COPY . .` brings the API env file into the builder layer. Root-context builds send other unexcluded env files to the Docker daemon. The local precheck wrappers mount the source read/write, clone a floating external security branch, and delete generic paths on every exit; Bash DEBUG logging can expose `CLONE_TOKEN`. See [operations/security details](06-dashboard-operations-and-documentation.md#local-devsecops-runners).

The app-intel boundary sends database-derived application names, paths, commands, publishers, and context into a local/external Claude CLI prompt without schema validation or prompt/data isolation. Its loader is destructive and non-transactional. These are [documented as validation concerns](06-dashboard-app-intel.md#security-failure-and-operational-notes), not asserted vulnerabilities.

IPC controls and gaps are documented in the two IPC deep references. The endpoint security analysis is completed by the sections below and linked subsystem chapters.

## Endpoint Lua scripting controls

| Control/boundary | Enforcement location | Actual decision/failure | Status |
| --- | --- | --- | --- |
| Build-time signing key | `include_bytes!` plus CI materialization | scripting build requires untracked PEM | Implemented build prerequisite |
| Missing-signature rejection | `verify_bundle` | rejects unless env is exact `1`/`true` | Partial; macOS service sets bypass; active v2 never calls verifier |
| Invalid-signature rejection | `verify_ed25519` and callers | verifier returns false, but both known callers discard false | Not enforced |
| Script-content integrity | verifier | only raw manifest bytes signed | Not implemented for Lua content |
| Lua libraries/global removal | sandbox factory | selects five libraries; nils exact file/I/O/OS names; clears C module path | Partial sandbox control |
| Host capabilities | exact string gates | gates fs/process/platform only | Partial; result/JSON/log/workspace always available |
| Filesystem confinement | `resolve_path` | tilde expansion only; arbitrary readable absolute/relative paths allowed with `fs.read` | Not implemented |
| Runtime deadline | 1,000-instruction hook | runtime error after observed deadline | Partial; does not preempt blocking host calls or short scripts |
| Active script trust | v2 configured `script_dir`/filename | reads and executes directly without signature | Deployment/filesystem trust only |
| Output validation | Lua result callbacks | mostly defaults malformed fields; no enum/path/risk/schema validation | Partial |

Potential issue requiring validation: the active scripts can read any file permitted to the monitor process and emit/log derived data; effective protection depends on process identity, filesystem ACLs, script-directory integrity, and backend handling outside this core scope. See [security analysis](06-endpoint-core-scripting.md#bundle-signing-and-trust-analysis).

## Dashboard frontend boundary

- The token and independently derived tenant identity are persisted in localStorage.
- Token payloads are decoded, never cryptographically verified in the browser.
- `ProtectedRoute` checks local user presence only; role authorization does not exist.
- All API calls send token plus tenant/subscriber headers from storage.
- React Query data is not tenant-keyed or cleared on identity replacement. See the [potential cross-identity cache issue](06-dashboard-frontend.md#potential-cross-identity-cache-issue).
- Nginx does not set repository-defined CSP, HSTS, frame, or referrer policies.
- React text rendering is used for repository-controlled metadata; no raw-HTML sink was found.

## Endpoint DLP templating/webview boundary

| Control/boundary | Enforcement location | Actual behavior | Completeness/tests |
| --- | --- | --- | --- |
| Local origin/CSP | `core/tauri.conf.json` | self/custom IPC only; fixed allowed nonce; bundled asset hashes/nonces injected by Tauri build | partial; no runtime security test |
| Window capability | inline capability | core defaults and event listening for `alert-window` on macOS/Windows | configured; command inputs remain application-trusted |
| Template provenance | ordered filesystem globs | first parsable set containing `alert.html`; environment override first | ACL/signature integrity Unresolved |
| Sensitive-text rendering | highlighter + `alert.html` | attributes escaped, body raw and `safe`; reuse uses `innerHTML` | Potential issue requiring validation |
| Reason rendering | Tera initial / JS reuse | initial autoescaped; reused options interpolated into `select.innerHTML` | inconsistent |
| Decision association | `log_dlp_decision` | ID controls event clear only; current sender consumed on mismatch | incomplete, untested |
| Decision vocabulary | same command | only exact `closed`/`timeout` mean `None`; all others return `Some(value)` | no allow-list/test |
| Broker identity | pinned broker/standalone binary | request source/identity self-asserted; arbitrary template/content fields | no authenticated binding in code |

## Template service security boundary

| Control/boundary | Enforcement location | Protected resource/input | Decision/failure/status |
| --- | --- | --- | --- |
| broker participant identity | pinned IPC broker plus service consumer | render/dismiss/status/kill messages | service trusts claimed `source`; no allowlist/signature; deployment ACLs unresolved |
| kill-switch event shape | `kill_switch.rs` | process enabled state and exit | requires event name/Serde shape but does not validate sender; startup fails open |
| registry name lookup | `TemplateRegistry::lookup` | selected template file/default content | exact-key allowlist for requests; locally loaded registry can add/replace keys |
| CSS color validation | `sanitize_color` | five theme strings | regex or fixed fallback; colors are unused by committed templates |
| free-text justification | browser JavaScript | response text | client-side trimmed 20–140 only; Rust command accepts arbitrary strings/direct calls |
| Tera substitution | runtime Tera | title/description/branding | **Inference:** normal `.html` autoescaping should apply; dependency/runtime not verified here |
| HTML injection boundary | `index.html` | rendered registry-selected fragment | inserted with `innerHTML`; locally modifiable template roots control markup |
| Tauri capability sets | `tauri.conf.json` | two named macOS/Windows WebViews | core/event default/listen only; global Tauri API enabled |
| CSP | Tauri config plus HTML meta | inline/external scripts/styles/fonts | policies differ (fixed nonce versus `unsafe-inline`); final beta-runtime behavior unresolved |
| screen-capture protection | both window builders | user-facing security/policy content | explicitly disabled with `content_protected(false)` |
| secrets/sensitive values | logging/context | original text, title/description, invalid colors | original text not rendered but travels IPC/context; invalid color is logged; no redaction policy |
| filesystem integrity | external installer/OS | TOML, registry, templates | no signature/hash/ownership verification in this service; ACLs unresolved |

**Potential issue requiring validation:** a local principal able to address the broker can request UI, query status, dismiss regular work, or spoof kill events under the code-visible identity model. Whether OS broker access restrictions prevent this is not established by the repository.

**Potential issue requiring validation:** configurable local templates enter a privileged WebView via `innerHTML`. Exploitability depends on final Tauri CSP construction, template-directory ACLs, and Tera behavior, which were not executable in the environment.

## Email-discovery privilege and IPC boundary

| Boundary/control | Enforcement | Decision/failure/status |
| --- | --- | --- |
| user-session isolation | platform ProcessSpawner | launchctl/user token path is active; correctness depends on session/env selection |
| Unix endpoint | fixed `/tmp` socket | no explicit mode/chown/isolated directory/peer credentials; actual OS access unresolved |
| Windows endpoint | first pipe instance with null DACL | all principals granted; no client SID/token check |
| frame allocation | parent length reader | rejects above 1 MiB; accepts zero; exact read prevents truncation acceptance |
| payload schema | Serde `Vec<EmailCandidate>` | type/required-field check only; no nonce/signature/child binding |
| source data | nine user profile/account readers | honest-source validators exist in core; per-source errors suppressed |
| error preview | parent read error string | up to 120 lossy payload bytes can be logged, potentially including email data |
| cleanup | fixed-path remove before/after | errors mostly suppressed; no ownership check before pre-bind removal |

**Potential issue requiring validation:** a local process that wins the fixed-endpoint client race can inject structurally valid identity candidates into the privileged Persona flow under the code-visible model. Platform ACL/permission behavior may constrain this on Unix; Windows's null DACL intentionally does not.

**Potential issue requiring validation:** Windows creates the user-token process with `lpEnvironment = None` and does not merge requested environment keys. Several discovery sources consume user-path variables, so correct user-context resolution needs target testing.

## Diagnostics security boundary

| Boundary/control | Enforcement | Decision/failure/status |
| --- | --- | --- |
| producer API | typed Rust calls and process-global init | no caller authorization/delivery acknowledgement |
| broker identity | pinned IPC registration/source strings | receiver logs/trusts claimed source; no allowlist/signature/tenant/freshness rule |
| payload schema | Serde types | arbitrary message/code/context sizes and values; receiver logs invalid tagged payload in full |
| local files | host create+append and umask/ACL defaults | no explicit permissions, encryption, integrity, symlink control, retention, or redaction |
| backend transport | reqwest/Rustls capable; default plain HTTP localhost | no credentials/tenant/mTLS/custom CA; status-only success decision |
| Docker environment | security plugins disabled; host ports 9200/5601 | local-development stack is unauthenticated and not loopback-constrained in Compose |
| error logs | tracing | backend response bodies and malformed IPC content have no redaction |

**Potential issue requiring validation:** a local process able to reach the broker can inject structurally valid diagnostics under a claimed identity. Actual exploitability depends on pinned IPC OS ACLs and deployment principals.

**Potential issue requiring validation:** the default relative database base and ordinary open semantics may permit file-placement/symlink effects if the receiver runs privileged in an attacker-influenced working directory. The deployed working directory and permissions are unresolved.

The context field can contain hosts, URLs, errors, or other caller data and crosses broker, filesystem, logging, and backend boundaries. No field-level sensitivity classification or scrubber exists. See [the diagnostics security analysis](06-endpoint-diagnostics-receiver.md#security-and-trust-boundaries).
| Screen capture | window builder | `content_protected(false)` | explicitly disabled/TODO |

Potential issue requiring validation: first render combines raw request text, `safe`, `document.write`, and a fixed allowed nonce. Crafted text may alter the UI and may be able to inject nonce-bearing script with command access. No target Tauri/webview runtime was available, so this is not claimed as a confirmed exploit. See [the complete security boundary](06-endpoint-core-templating-engine.md#security-and-trust-boundaries).

## Dormant decompression and test boundaries

| Control/boundary | Repository enforcement | Completeness/status |
| --- | --- | --- |
| Production reachability | crate root comments out `mod decompression` | strongest current boundary: implementation does not run |
| Entry traversal | ZIP `enclosed_name` plus repository lexical clean/prefix; other direct strategies lexical clean/prefix | no canonical/link/file-descriptor containment; dependency behavior unresolved |
| Fallback traversal | delegated directly to compress-tools target directory | repository helper bypassed; dependency protection unresolved |
| Resource denial controls | depth five, top-level semaphore, timeout/cancel flag | no byte/count/ratio/disk/memory/password quotas; ZIP reads entire archive and uses Rayon |
| Timeout completion | cooperative atomic checked between chunks/entries | timed-out blocking work can continue; fallback worker cannot be stopped |
| Partial-file cleanup | none | ordinary errors may be labeled cancellation; files/markers retained |
| Fixture provenance | ordinary committed Git blobs | document/email licensing, source, and classification unresolved |
| Test Vault isolation | none in direct wrapper integration tests | fixed keys target ordinary user Vault on macOS/Windows |
| Test environment safety | some direct tests use unsafe environment mutation; common helpers do not | no serial marker; process-global races possible |
| Dependency integrity | version constraints only; no lockfile | exact archive/Tauri/transitive source unresolved |

These are code-level controls and missing controls, not a claim that the excluded implementation is an exploitable production path. See [the qualified archive security analysis](06-endpoint-core-crate-shell-tests-and-decompression.md#path-and-link-boundary).

## System monitor security controls and trust boundaries

| Control/boundary | Enforcement location | Verified result / bypass or gap |
| --- | --- | --- |
| Persona identity | startup IPC + `init_persona` | nonempty tenant required; access token optional; source trust inherited from broker |
| backend authentication | shared sync HTTP helper | tenant/subscriber headers always, optional bearer; delta/Auditor take different paths and do not add that bearer in source |
| kill-switch authorization | `kill_switch/ipc.rs` | message parsing/state atomic; no sender allowlist/signature; failures preserve enabled=true |
| hook IPC locality | Unix socket / Windows named pipe | Windows rejects remote; Unix is filesystem-local; both deliberately permit broad local clients and authenticate none |
| hook policy failure mode | thin client `evaluate` | default fail-open; environment can select fail-closed for IPC errors; parse/read errors always allow |
| Lua sandbox | core sandbox via executor | dangerous globals removed, require rooted to scripts; absolute filesystem reads and workspace callback remain; shipped scripts trusted |
| script integrity | active scanner | no manifest/signature check in active path; packaging/OS ACLs unresolved |
| hook config integrity | monitor/repair | detects/restores expected monitor-installed config, but no signature and malformed JSON blocks repair |
| process termination | platform actions | requires process privileges; only Application policy is actionable; dry run still audits |
| secret handling | `UserContext`/sync | access token Serde-skipped and sent only as header; type Debug does not redact; no current full-context log caller found |
| sensitive telemetry | JSONL/activity/debug/trace logging | prompts, commands, paths, tool inputs, email/groups/device IDs can cross file/network/log boundaries; rotation/redaction/access unresolved |
| frame/input limits | hook IPC/evaluator | 5 s and 128 connections; no frame-size maximum before allocation; tool/file sets capped 500 |
| snapshot/config files | ordinary filesystem | no encryption/signature/explicit Unix mode in snapshot code; external installer permissions unresolved |

**Potential issue requiring validation:** a local process that can connect to the hook socket/pipe can submit fabricated sessions/prompts and cause activity emission. Current policy response remains Allow, so this is not documented as an enforcement-bypass vulnerability beyond the deliberate unauthenticated/fail-open design.

**Potential issue requiring validation:** `Auditor` has no explicit timeout and the hook/raw logging paths have no quota/rotation. Host policy may mitigate these boundaries, but no such control is visible here.

## Endpoint infra process and IPC security boundary

| Control/boundary | Enforcement location | Verified result / gap |
| --- | --- | --- |
| service binary selection | Mac/Windows resolver | active registry names trusted; public API accepts separators/absolute names; Mac checks any execute bit, Windows only file type |
| child parameter propagation | process spawners | args/env/directory cross process boundary; no allowlist; core logs full config before spawn |
| interactive user identity | macOS console device + launchctl; Windows WTS/token duplication | Mac PID attachment not filtered by uid/session/path; Windows uses acquired primary token and fails closed if none |
| child crash containment | Windows Job Object | kill-on-close requested; creation/config/assignment failure logs and continues (fail open) |
| stale process termination | OS process scanners | privileged destructive action based on basename/parent-PID heuristic; no path/owner/start marker |
| Unix IPC path | address manager/socket | no explicit mode/ownership/peer credential/authentication; existing target removed without socket-type check |
| Windows IPC | named-pipe placeholder | address syntax only; no transport or ACL control implemented in infra |
| message validation | `IpcChannel` | raw unframed bytes; higher layers own schema, length, and authentication |
| environment confidentiality | core debug log + inherited child environment | no redaction; present values are not currently secrets, but interface permits them |

**Potential issue requiring validation:** macOS newest-name PID selection can bind lifecycle signals to another same-name process. **Potential issue requiring validation:** stale cleanup can misclassify a live-parent process when permission probing fails or PIDs are reused. Exact exploitability depends on privileges, deployment ACLs, and concurrent processes not demonstrated by repository evidence.

## Endpoint proxy security model

| Control/boundary | Enforcement location | Verified result / gap |
| --- | --- | --- |
| backend identity | Persona IPC/core policy/alert clients | bearer/tenant data comes from local broker; broker authorization depends on separately analyzed IPC deployment |
| DLP enforcement | request/response evaluation | analyzer/policy absence, timeout, task failure, no match, monitor mode, and unknown action allow traffic |
| input extraction | body/JSONPath/PDF/Office/OCR handlers | size caps exist at selected stages; arbitrary intermediary content still crosses parser-library and temp-file boundaries |
| TLS interception | certificate manager/MITM | proxy terminates client TLS and sees plaintext by design; bypass lists exist; CA/key file protection is deployment-dependent |
| upstream TLS | reqwest/rustls | normal library validation except repository-specific proxy/certificate behavior; exact enterprise trust additions unresolved |
| explicit proxy access | HTTP listener | no proxy authentication; non-loopback binds expose service to reachable peers |
| health/metrics | path dispatch | unauthenticated and served on the proxy listener; exposes counts/state/version |
| log redaction | request/context/traffic paths | bodies, URLs, headers, process/app/identity context can be logged; redaction is partial and configuration-dependent |
| Windows packet privilege | WinDivert | Administrator/kernel driver boundary; process attribution failures still intercept unknown TCP and block monitored UDP |
| process policy | Windows TCP/Swift | deny/allow logic differs by protocol/platform; Swift names are case-sensitive, Windows UDP ignores allow lists/deny PIDs |
| macOS control socket | Rust listener | chmod `0600`; no peer credential or protocol authentication; path ownership/installer context matters |
| macOS relay/heartbeat | localhost TCP | no token, peer credential, or challenge; relay trusts caller-supplied process/path/source/destination/domain metadata |
| frame bounds | Rust/Swift IPC | several caps exist (1 MiB control encode, 64 KiB relay metadata), but decoder/listener caps and queue policies differ |
| extension rules | Swift provider | hard-coded TCP/UDP 443 include rules; current UDP is rejected; configured port/TLS policy does not drive rule construction |
| code signing/entitlements | build/package scripts and plists | signing is expected; dev script tolerates signing failure, and multiple entitlement/plist sources disagree |
| shell command safety | dev build script | unquoted `PROXY_ARGS`; privileged `sudo` build/package operations increase affected scope |

**Potential issue requiring validation:** an untrusted local process may impersonate a Network Extension relay connection and inject claimed process metadata. Repository evidence proves the unauthenticated listener and trust in JSON, but deployed firewall/uid/process sandbox restrictions are unresolved. **Potential issue requiring validation:** logs and alert payloads may expose intercepted content or identity; exact production log levels, retention, access controls, and backend handling are external.
