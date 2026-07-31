# 11 — Configuration Reference

## Endpoint build, release, and installer configuration

| Name | Type/default/source | Consumers/effect | Failure/secret status |
| --- | --- | --- | --- |
| build `mode` | four workflow/local values; required | selects build/embed/installer/update-json commands | validated |
| `platform` | windows/macos/both in workflow | job selection | local mapper accepts one platform |
| `profile` | dev/release; release default in local mapper | Cargo target and package name | no production-policy enforcement |
| `embed_env` | workflow seven values; preprod default | baked installer backend/CDN environment | builders accept only quartz/preprod/secure; contradiction |
| `sign_windows` | Boolean false unless selected | SSL.com CodeSignTool | requires four `WIN_CS_*` secrets; credentials passed to child args |
| `inject_updater` | Boolean false | embeds updater into agent ZIP | collector can upload original ZIP on macOS |
| `SCRIPTING_SIGNING_PUBLIC_KEY_PEM_BASE64` | required secret | compile-time scripting verifier | decoded to gitignored PEM |
| `UPDATER_PRIVATE_KEY_PEM_BASE64` | required secret | RSA-PSS update manifest | private signing material |
| `DEV_CA_CERT_PEM_BASE64`, `DEV_CA_KEY_PEM_BASE64` | required workflow secrets | package CA and optional key | key is private; release/dev distinction not enforced |
| mac provision/notary values | profiles/P12/password/Apple ID/team/app password | app/extension signing and notarization | secrets; temporary keychain cleanup only |
| `GH_PAT` | classic repository token | sibling clone/submodule URL rewrite | secret; global Git URL rewrite lasts job |
| AWS cache settings | fixed bucket/region/role/prefix | sccache only | external availability/permissions unresolved |
| installer trust/signature switches | platform CLI flags; implemented defaults differ from help on mac | CA and update/package validation | documented/actual discrepancy |
| updater floor | `0.10.200` | blocks versions depending platform/install state | Windows CDN fresh enforced; mac fresh not enforced |
| `SENTINEL_DEPLOY_DEBUG` | `1|true|yes` | alternate Python debug logging | non-secret |
| `ENTERPRISE_ROOT_CA` | source constant | alternate pre-staged presence search | placeholder term; fingerprint unused |
| `SCEP_CONFIG` | disabled/None defaults | alternate SCEP path | even enabled enrollment is stub |

The builders also consume `RUSTC_WRAPPER`, Cargo job/cache variables, `CODE_SIGN_IDENTITY`, and `NOTARY_PROFILE`; all exact script flags and precedence are traced in [the delivery chapter](06-endpoint-build-release-install-and-update.md). Secret values are deliberately not reproduced.

## Dashboard/API

The [dashboard/API deep reference](06-dashboard-api.md#configuration-reference) enumerates all 24 values consumed by `internal/config.Config`, their exact defaults, parsing behavior, failure modes, and consumers, plus migration-only `DEPLOYMENT_MODE`.

Important verified properties:

- `CLICKHOUSE_PASSWORD` is the only required nonempty environment variable.
- Invalid integer strings silently fall back; numeric ranges are not validated.
- Boolean values accept only exact lowercase `true`.
- An empty `TENANT_AUTH_SECRET` switches agent/admin routes to direct trust in tenant/subscriber headers.
- `CATALOG_NAMESPACE_SECRET` is parsed and can prevent startup, but no current production consumer was found.
- The tracked `api_server/v2/.env`, root `.env`, and `app-intel/.env` contain concrete environment credentials. Values are intentionally not duplicated in this documentation.

The [app-intel reference](06-dashboard-app-intel.md#entry-point-and-configuration) covers its nine extraction and six loader inputs. The [root operations reference](06-dashboard-operations-and-documentation.md#root-configuration-and-artifacts) covers root `.env`, `.env.dev`, Compose precedence, the unused PostgreSQL keys, external CI/Jenkins inputs, and Docker-context behavior. Frontend build configuration, `VITE_BASE_PATH`, browser storage keys, Vite proxy, and Nginx template variables are documented in the [frontend reference](06-dashboard-frontend.md).

IPC configuration is documented in [current IPC](06-ipc-current-main.md) and [endpoint-pinned IPC](06-ipc-endpoint-pinned.md). The endpoint-agent configuration reference is completed by the sections below and linked subsystem chapters.

## Endpoint scripting

| Setting/input | Location/type/default | Consumer/effect | Failure/secrecy |
| --- | --- | --- | --- |
| Cargo feature `scripting` | core feature; off by default; enables `mlua`, `ed25519-dalek`, `glob` | exports entire module | monitor v2 enables it transitively |
| `SENTINEL_ALLOW_UNSIGNED_SCRIPTS` | environment; absent=false | permits a missing signature only for exact `1` or `true` | macOS LaunchDaemon sets `1`; not secret; active v2 does not verify |
| `SENTINEL_WORKSPACE_DIRS` | environment path list; absent=conventional home roots only | adds existing workspace scan roots | `;` on Windows, `:` otherwise; not classified secret but paths may be sensitive |
| `signing_public_key.pem` | gitignored build input; no default | compiled into verifier | required whenever scripting compiles; CI derives it from secret; absent locally |
| manifest `version` | required string | engine requires nonempty; updater sends cached value | updater defaults all read/parse/type failures to `0.0.0` |
| manifest `capabilities` | string array; default `[]` | exact host API gates | unknown values silently inert |
| manifest `timeout_ms` | `u64`; default `5000` | instruction-hook wall deadline | no range validation |
| manifest `enabled` | bool; default true | load/skip entry | wrong type rejects JSON |
| updater URL | constructor string; no default | bare GET `<url>?version=<value>` | no URL parsing/encoding/auth/timeout in repository code |
| v2 sandbox timeout/capabilities | fixed in executor | 10,000 ms; `fs.read`, `platform.info` | not user-configurable at this call site |

Exact scan-rule configuration belongs to pending System Monitor v2 analysis. Scripting-specific effects are complete in [the deep reference](06-endpoint-core-scripting.md).

## Endpoint DLP templating

| Setting/input | Location/type/default | Consumer/effect | Failure/secrecy |
| --- | --- | --- | --- |
| `SENTINEL_DLP_TEMPLATE_DIR` | environment string; unset by default | first Tera glob as `<normalized-dir>/**/*.html` | empty ignored; arbitrary installed HTML is security-sensitive |
| Windows template paths | fixed Program Files then ProgramData globs | startup fallback order | each must parse and include `alert.html` |
| macOS template paths | fixed Application Support then Users/Shared globs | startup fallback order | each must parse and include `alert.html` |
| `BUNDLE_TEMPLATES_PATTERN` | macOS fixed Application Support glob; Windows `./templates/**/*.html` | final fallback | Windows is CWD-sensitive |
| `SENTINEL_SERVICE_MODE` | presence test, value ignored | selects external templating IPC and activates process path injection | `0`/`false` still select service behavior |
| `SENTINEL_LOG_DIR` | optional nonempty path | standalone templating log directory | directory-create result suppressed |
| `RUST_LOG` | string; default `info` | standalone `EnvFilter`; invalid falls back to info | non-secret |
| `--dlp-justify-timeout-secs` | Clap `u64`, default 3 | context/outer deadline; UI casts to `u32` | no maximum; values above `u32::MAX` wrap in UI |
| `--dlp-justify-options` | semicolon string with five CLI defaults | adapter trims/drops empty pieces; alert reasons | no length/dedup validation; reuse uses raw `innerHTML` |
| `--dlp-justify-default` | string default `[No Justification Provided]` | adapter fallback and mandatory block comparison | carried but unused inside core UI |
| Tauri identity | `Sensitive Text Alert`, `0.0.0`, `ai.quilr.sentinel` | generated app/bundle metadata | version differs from core Cargo `0.30.276` |
| `frontendDist` / global API | `ui`; `withGlobalTauri=true` | bundles bootstrap/exposes `window.__TAURI__` | local webview trust boundary |
| CSP nonce | static `347394` | active template inline scripts | fixed/visible; dynamic raw-HTML concern |
| capability | `alert-window`, macOS/Windows, core/event defaults/listen | window core/event permissions | inline only |
| window properties | 700×500, always-on-top, taskbar-skipped, nonclosable, devtools off, content protection off | `display_popup_from_context` | build panics; capture protection disabled |

Contradiction: `OptionsConfig` describes zero as no timeout, but every checked proxy adapter applies `.max(1)`. Exact precedence/path behavior is in [the templating configuration analysis](06-endpoint-core-templating-engine.md#entry-points-and-startup).

## Core crate/build configuration

| Setting | Exact value/default | Consumer/effect | Failure/contradiction |
| --- | --- | --- | --- |
| package | `sentinel-core 0.30.276`, edition 2024 | Cargo/library consumers | Tauri app version is independently `0.0.0` |
| crate types | `cdylib`, `rlib` | Cargo artifacts | no C header/export contract committed |
| doctest | false | Cargo test selection | documentation code is not validated |
| default features | `file_index,file_search,local_discovery` | compile surface | several compiled capabilities are not active default services |
| `grpc_server` | off; enables tonic/prost/tokio-stream | proto build and IPC modules | schema/Rust field mismatch |
| `detection` | off, empty dependency list | file detection | feature-gated source references absent symbols |
| `scripting` | off; enables mlua/signing/glob | Lua module | requires untracked PEM when enabled |
| `compress-tools` | implicit optional-dependency feature, off | excluded archive fallback | re-enabled module needs this feature or refactor |
| `PROTOC` | set only if vendored lookup succeeds | tonic-build | lookup failure suppressed; compile may use external discovery |
| Cargo lockfiles | ignored by `Cargo.lock` and `**/Cargo.lock` patterns | dependency resolution | exact versions/build reproducibility unresolved |
| archive timeout | caller `u64`; zero → 300 s | dormant `Extractor` | no maximum clamp |
| archive depth/CPU/copy | 5 / 75% / 128 KiB | dormant recursion/semaphore/copy | CPU percentage bounds top-level tasks only |
| benchmark channel | 50,000 | legacy benchmark init | benchmark cannot compile; errors suppressed |
| test environment keys | bootstrap PID/path/version | integration-test globals | no serial isolation; common helpers lack edition-required unsafe blocks |

All manifest requirements and target-specific dependencies are enumerated in [the core manifest reference](06-endpoint-core-crate-shell-tests-and-decompression.md#direct-dependencies).

## System monitor configuration

`Config::load` uses `QUILR_SYSMON_CONFIG`, then executable-adjacent `sysmon-config.json`, then built-ins. Explicit/adjacent malformed configuration is fatal. Per-OS arrays select `macos`, `windows`, or `linux` at deserialization. No semantic validation rejects zero intervals/batches.

The complete 32-field JSON table with Rust defaults, committed values, consumers, and zero-value behavior is in [the runtime configuration reference](06-endpoint-system-monitor-runtime-discovery-and-state.md#exact-setting-table).

Runtime environment names verified by code are:

`QUILR_SYSMON_CONFIG`, `QUILR_DLP_ENDPOINT`, `SENTINEL_SCRIPT_DIR`, `SENTINEL_LOG_DIR`, `RUST_LOG`, `SENTINEL_INSTALLATION_PATH`, `QUILR_THIN_CLIENT_PATH`, `QUILR_CLAUDE_THIN_CLIENT_PATH`, `SENTINEL_HOOK_TIMEOUT_MS`, `SENTINEL_HOOK_FAIL_MODE`, `SENTINEL_HOOK_SOCKET`, `SENTINEL_HOOK_LOG_FILE`, `SENTINEL_WORKSPACE_DIRS`, `QUILR_TENANT_ID`, `QUILR_SUBSCRIBER_ID`, `HOME`, `USER`, `USERPROFILE`, `USERNAME`, `SystemDrive`, `APPDATA`, `LOCALAPPDATA`, `TEMP`, `NPM_CONFIG_PREFIX`, `CARGO_HOME`, `GOBIN`, and `GOPATH`.

**Contradictions:** ADR 013 names `DLP_BASE_URL` instead of implemented `QUILR_DLP_ENDPOINT`; ADR 020 names `notification_cooldown_secs` instead of `popup_cooldown_secs`; `PersonaConfig.ipc_timeout_secs` has no runtime consumer; `scripts/manifest.json` limits/capabilities are not loaded.

## Template service configuration

`TemplateEngineConfig::load` reads `$QUILR_CONFIG_DIR/template_engine.toml`, otherwise uses `HOME`, then `USERPROFILE`, then an empty home string. Missing, unreadable, or invalid TOML silently yields all defaults. There is no semantic validation or error result.

| Setting | Type/default | Consumer/effect | Failure/secret status |
| --- | --- | --- | --- |
| `max_concurrent_templates` | `usize`, 5 | regular active-slot bound | zero creates queue-only state; non-secret |
| `default_timeout_seconds` | `u32`, 30 | startup log only | inert configuration; non-secret |
| `max_queue_size` | `usize`, 50 | regular FIFO bound | zero rejects overflow immediately; non-secret |
| `default_notification_timeout_seconds` | `u32`, 10 | parsed into underscore-prefixed field | inert configuration; non-secret |
| `max_concurrent_notifications` | `usize`, 5 | notification active-slot bound | zero creates queue-only state; non-secret |

Runtime environment inputs are `QUILR_CONFIG_DIR`, `HOME`, `USERPROFILE`, `SENTINEL_TEMPLATE_FILE`, `SENTINEL_TEMPLATE_DIR`, `SENTINEL_INSTALLATION_PATH`, and `RUST_LOG`. Repository installers set `SENTINEL_TEMPLATE_DIR`; `SENTINEL_TEMPLATE_FILE` is marked deprecated in source but remains active. No variable is intrinsically a credential, although selected files can contain user-facing policy content.

Fixed runtime values include broker channel `ipc_light_broker`, process ID `template_engine_service`, two kill-switch participant IDs, target `kill_switch_service`, the 3-second main IPC delay, 500-ms-to-30-second reconnect delay and ten-error limit, five-to-30-second kill-listener backoff, five-second kill query timeout, six-second startup gate, and hard-coded notification queue bound 50.

Template resolution precedence is valid `SENTINEL_TEMPLATE_DIR`, compile-time manifest templates, installation/executable-adjacent templates, then a current-directory relative glob. The checked guides document a different/incomplete order and omit two active variables. Full path and configuration behavior is in [the template-service configuration reference](06-endpoint-template-service.md#complete-configuration-reference).

## Email-discovery configuration

The helper has no configuration file. Exact inputs are:

| Name | Type/default/precedence | Consumer | Failure/status |
| --- | --- | --- | --- |
| `--ipc-socket` | optional string; first | helper main/transport | absent falls to env; empty reaches connect |
| `IPC_SOCKET` | optional string; second | helper main | missing with no CLI exits 1 |
| `RUST_LOG` | optional tracing filter; invalid/missing `warn` | stderr logger | non-secret |
| `SERVICE_NAME=email-discovery` | parent ProcessConfig | platform child environment | helper does not read; Windows active path omits config environment |
| `NO_COLOR=1` | parent ProcessConfig | intended child environment | logger already disables ANSI; Windows omission has no helper-visible effect |
| `SENTINEL_SERVICE_MODE` | presence Boolean in parent | chooses subprocess versus in-process discovery | helper itself does not read for routing; linked source utilities may read it |
| endpoint address | platform fixed name | parent/child | not configurable/randomized |
| timeout/cap | 30 seconds / 1 MiB | parent | fixed, not configurable |

Manifest choices are edition 2021, one binary, core defaults disabled plus mandatory `local_discovery`, Tokio full, and no lockfile.

## Diagnostics configuration

The receiver binary has no CLI/config-file bridge and always uses `Config::default`. Library callers can construct:

| Name | Type/default | Consumer/effect | Failure/secret status |
| --- | --- | --- | --- |
| `backend_url` | String, `http://localhost:9200/diagnostics/_bulk` | HTTP POST destination | validated only by reqwest; non-secret; action index stays `diagnostics` |
| `db_path` | String, `diagnostics` | base for `.log`/`.sent` | relative CWD by default; no parent creation; potentially sensitive output |
| `buffer_capacity` | usize, 100 | ring allocation/half-full threshold | no bounds; zero accepted |
| `batch_size` | usize, 10 | unsent scan limit | zero disables export |
| `retry_delay_ms` | u64, 5,000 | worker poll/retry sleep | no bounds; zero busy-loop potential |
| `RUST_LOG` | optional filter | binary tracing subscriber | only runtime environment input used by binary |
| health URL | fixed localhost:9200 | binary readiness/auto-start | not derived from `backend_url` |
| Bulk timeout | fixed 30 s | reqwest sender | per request |
| health timeout/attempts | fixed 2 s / 20 | binary startup | “60 s” excludes request/command time |
| IPC startup/heartbeat | fixed 500 ms / 30 s | sender | not configurable |
| IPC reconnect | fixed 5→60 s | sender/receiver | not reset after success |

Cargo features are default `embedded`, `centralized`, `standalone`, `ipc-client`, and `ipc-server`. Only `centralized` has actual conditional code; the other four are empty/non-gating. The local Compose uses fixed ports 9200/5601, fixed container names, security-disabled flags, 512-MiB OpenSearch heap, and a named volume. See [the full configuration reference](06-endpoint-diagnostics-receiver.md#configuration-reference).

## Endpoint infra configuration

Infra has no config file or CLI. Configuration arrives through `ProcessConfig`, service names, and ambient variables:

| Exact name/value | Type/default/source | Consumer/effect | Failure/secret classification |
| --- | --- | --- | --- |
| `SENTINEL_SERVICE_MODE` | optional ambient; agent sets `1` for `--service` | presence plus config flag selects interactive-user spawn | not secret; value ignored |
| `SERVICE_NAME` | per-child string | child identity and Windows stderr stem | config-only value omitted by Windows native path |
| `IPC_SOCKET` | per-child string | child standard endpoint | config-only value omitted by Windows native path; email helper also has CLI |
| `NO_COLOR=1` | per-child string | child logging | omitted by Windows native path |
| `SENTINEL_LOG_DIR` | config or ambient path | Windows ordinary stderr file; child log discovery | directory/open failure suppressed; may contain sensitive logs |
| `SENTINEL_DLP_TEMPLATE_DIR` | config path | templating-engine lookup | omitted by Windows native path |
| `IPC_LIGHT_PIPE_PATH_IPC_LIGHT_BROKER` | ambient/user override or generated path | broker binding and clients | core also mutates process environment |
| Unix socket maximum | hard-coded 108 bytes | address validation | no override; target bind remains authoritative |
| Unix connect retry | 10 ms doubled without cap | timeout connect | can overshoot requested duration |
| process wait polls | 10 ms ordinary, 100 ms launchctl | timed waits | blocking sleeps |
| launchctl PID discovery | 15 attempts, 500 ms→2 s | macOS user-session spawn | no override; final failure `SpawnFailed` |
| Windows pipe timeout | hard-coded 5 s in factory | placeholder connect | caller timeout ignored; stub returns immediately |

`infra/Cargo.toml` has no feature flags. Target dependency selection is compile-time macOS/Windows. `tokio` full and Windows `zeroize` have no source use; exact dependency versions are unlocked because no workspace lockfile is committed.

## Endpoint proxy configuration

### CLI inventory

Every long option in `proxy/src/args.rs::Args` is accounted for below. Booleans default false unless an inverse name/effective-default note says otherwise.

| Exact option(s) | Default | Runtime effect/status |
| --- | --- | --- |
| `-p`, `--port`; `--https-port`; `-a`, `--address` | 8080; 8443; absent | listener ports/bind; interception with no address derives LAN IPv4; loopback is rejected |
| `--cert-path`; `--key-path` | `cert.pem`; `key.pem` | MITM root material paths |
| `--max-log-bytes`; `--small-body-buffer-max`; `--max-extraction-file-size` | 32 KiB; 1 MiB; 10 MiB | logging, buffering, extractor read caps |
| `--buffer-host`; `--disable-streaming` | empty; false | host/global buffering selection; advertised streaming remains whole-body in important paths |
| `--disable-upstream-h2`; `--disable-upstream-h2-host`; `--h2-disable-file`; `--disable-client-h2` | false; empty; `h2_disable_hosts.txt`; false | H2 client/upstream compatibility policy |
| `--auto-fallback-h2-400`; `--auto-fallback-h2-404` | true; false | safe bodyless-method fallback rules |
| `--dlp-egress`; `--dlp-ingress`; `--dlp-egress-enforce`; `--dlp-ingress-enforce` | false | DLP direction and log-only/enforcement switches |
| `--dlp-endpoint`; `--dlp-model-path` | empty | remote/local analyzer choice; both together panic; model requires feature/external SDK behavior |
| `--disable-dlp-justify-ui`; `--dlp-justify-timeout-secs` | false; 3 | effective UI enabled; timeout |
| `--dlp-justify-options`; `--dlp-justify-default` | five semicolon-separated choices; `[No Justification Provided]` | popup inputs/fallback |
| `--dlp-domain`; `--dlp-patterns-file` | empty; `dlp_content_extractor.json` | CLI/file patterns; empty domains/patterns disable matching |
| `--upstream` | empty | chained HTTP proxy; MITM/WebSocket paths do not uniformly honor it |
| `--enable-packet-interception`; `--handle-transparent-tls`; `--packet-redirection-config` | false; false; empty | redirector/TLS activation; config without enable flag panics |
| `--install-extension`; `--uninstall-extension`; `--extension-status` | false | macOS administrative one-shot commands |
| `-v`, `--verbose`; `--enable-traffic-log` | false | logging filters/traffic file |
| `--dlp-unique-ttl-mins` | 30 | saturating conversion to seconds |
| `--app-details-endpoint`; `--app-details-refresh-mins` | empty; 60 | app/domain metadata API/cache refresh |
| `--user-context-refresh-secs`; `--dlp-config-refresh-interval-secs` | 120; 1800 | Persona/context and interceptor-config refresh |
| `--disable-tauri` | false | chooses native platform entry instead of Tauri |
| `--enable-destination-cache`; `--cache-ttl-seconds`; `--cache-max-entries`; `--fail-closed-on-unknown-dest` | effective true; 300; 10,000; effective true | destination cache settings; fail-closed flag is stored/logged but not read in active decision |
| `--pfctl-check-interval-secs`; `--metrics-log-interval-secs`; `--enable-pfctl-auto-recovery` | 15; 60; effective true | renamed legacy health settings; multiple fields inert under Network Extension path |
| `--dns-cache-enabled`; `--dns-cache-ttl-secs`; `--dns-cache-max-entries`; `--dns-connect-timeout-secs`; `--dns-max-retry-attempts`; `--dns-retry-backoff-ms` | effective true; 300; 1,000; 10; 2; 1,000 | DNS/connect cache and retry configuration |
| `--request-timeout-secs`; `--upload-timeout-threshold-bytes`; `--disable-timeout-for-uploads` | 60; 524,288; false | application request deadline exemption logic |
| `--slow-op-threshold-ms` | 500 | slow-operation log threshold |
| `--process-attr-max-entries`; `--process-attr-ttl-secs` | 10,000; 300 | global attribution cleanup bounds |
| `--pool-max-idle-per-host`; `--pool-idle-timeout-secs`; `--max-connections` | 10; 30; 2,000 | reqwest pool and connection semaphore |
| `--ws-dlp-max-frame-size`; `--ws-dlp-log-only` | 1 MiB; false | WebSocket inspection cap/mode |
| `--http2-keepalive-interval-secs`; `--http2-keepalive-timeout-secs`; `--disable-http2-keepalive-while-idle`; `--tcp-keepalive-secs` | 20; 10; false; 60 | zero intervals disable optional keepalive; inverse idle flag |
| `--disable-health-monitoring`; `--health-failure-threshold`; `--health-window-secs`; `--health-degraded-threshold`; `--health-unhealthy-threshold` | false; 0.8; 30; 0.3; 0.6 | health settings; several configured fields are not consumed by active decisions |
| `--disable-active-probes`; `--probe-interval-secs`; `--probe-timeout-ms`; `--probe-endpoints` | false; 10; 5,000; three public `:443` endpoints | connectivity-probe configuration; active wiring is partial |
| `--disable-circuit-breaker`; `--circuit-breaker-failure-threshold`; `--circuit-breaker-success-threshold`; `--circuit-breaker-timeout-secs`; `--circuit-breaker-half-open-max-requests` | false; 5; 2; 30; 3 | breaker configuration |
| `--enable-auto-restart`; `--restart-max-retries`; `--restart-initial-delay-secs`; `--restart-max-delay-secs` | false; 3; 10; 300 | restart manager; operational restart path is incomplete |
| `--persona-email` | absent, debug builds only | temporary Persona creation through normal validation path |

### Environment and build settings

| Exact name | Default/source | Consumer and classification |
| --- | --- | --- |
| `QUILR_DLP_ENDPOINT` | hard-coded preprod fallback in `constants.rs` | lazy remote DLP endpoint; non-secret URL |
| `QUILR_BACKEND_BASE_URL` | hard-coded preprod fallback | lazy app/config/control base URL; non-secret URL |
| `RUST_LOG` | `info` | proxy and templating logging filter |
| `SENTINEL_LOG_DIR` | platform-derived fallback | log directory; may contain sensitive traffic/context |
| `SENTINEL_SERVICE_MODE` | presence check | selects external templating and service path; value not parsed |
| `SERVICE_NAME` | optional | Tauri service-mode detection |
| `LOCALAPPDATA` | Windows ambient | log-directory fallback |
| `DEVICE_ID`, then `HOSTNAME`, then `COMPUTERNAME` | optional | alert device fallback identity |
| `CODE_SIGN_IDENTITY` | absent | build script/Swift signing; sensitive only as identity metadata, not secret key material |
| `BUILD_CONFIG` | `release` | Swift build configuration |
| `ARCH` | printed default `arm64 x86_64` | no actual Swift compiler effect |
| Cargo `PROFILE`, `CARGO_CFG_TARGET_OS`, `CARGO_MANIFEST_DIR` | Cargo supplied | build script paths/target behavior |

### Redirector TOML

`RedirectorConfig` fields are `target_port`, `proxy_port`, `https_proxy_port`, `intercept_tls`, `local_ip`, `additional_ports`, `priority`, `sniff_mode`, `max_packet_size`, `worker_threads`, `allow_pids`, `allow_processes`, `deny_pids`, `deny_processes`, `local_ip_check_secs`, `verbose`, `pfctl_check_interval_secs`, `udp_ports`, `udp_flow_timeout_secs`, `udp_max_flows`, and `udp_attribution_cache_ttl_secs`. Runtime overrides proxy ports/pfctl interval/local address and appends self exclusions. The committed TOML omits serde-defaulted allow lists, intervals, and pfctl fields; it differs from Rust defaults for priority, packet size, and UDP ports. `sniff_mode`, redirector `verbose`, and macOS use of most fields are inert or incomplete. Exact values are in [the redirection chapter](06-endpoint-proxy-packet-redirection.md#shared-orchestration-and-configuration).
