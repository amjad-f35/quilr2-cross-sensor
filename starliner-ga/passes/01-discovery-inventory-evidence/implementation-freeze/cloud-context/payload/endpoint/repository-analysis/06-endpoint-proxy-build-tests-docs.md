# Endpoint proxy: build, packaging, tests, and documentation audit

## Build manifest

`proxy/Cargo.toml` defines package `sentinel-proxy` version `0.1.347`, edition 2024, one library, and two binaries (`sentinel-proxy`, `templating-engine`). There is no proxy-local lockfile; dependency resolution is governed by the endpoint workspace lockfile.

Feature graph:

| Feature | Enables | Operational scope |
| --- | --- | --- |
| `dlp-oob` | private relative-path `quilr_rust_sdk` | AI analyzer branch |
| `redirector` | `hex`, `toml`, `anyhow` | shared redirection modules/destination resolver |
| `mac-packet-redirector` | `redirector` | macOS NetworkExtension implementation |
| `win-packet-redirector` | `redirector`, WinDivert, Windows APIs | Windows packet interception |
| `image-ocr` | `image`, `uni-ocr` | OCR transform |
| `extract-pdf` | `pdf-extract` | PDF extraction |
| `extract-office` | `zip`, `calamine` | Office extraction |
| `extract-all` | PDF + Office | both document families |

**Verified build boundary:** the optional SDK path is `../../ai-internal-sdks/rust_sdk`, outside this repository. Builds enabling `dlp-oob` require that sibling checkout; its implementation/version is not captured by this repository.

Platform dependencies put `nix`/`libc` under macOS and WinDivert/Windows APIs under Windows. `.cargo/config.toml` injects macOS framework link arguments.

## Cargo build script

`proxy/build.rs` runs for every Cargo build:

- on macOS, it invokes `swift/build.sh` regardless of whether `mac-packet-redirector` is enabled;
- Swift execution/build/bundle absence is reported as Cargo warnings and the Rust build continues;
- a successful extension is copied to the workspace target profile directory after deleting an existing destination recursively;
- Objective-C bridge compilation always runs on macOS and is fatal if `cc` fails;
- it links SystemExtensions, NetworkExtension, and Foundation;
- rerun directives cover Swift sources/package/build script and three Objective-C bridge files, but not all plists/entitlements used to form the bundle.

**Contradiction:** `swift/README.md` says Cargo output is `SentinelProxyExtension.systemextension`; active `build.rs` and `swift/build.sh` use `ai.quilr.agent.sentinel.extension.systemextension`.

## Swift bundle build

`proxy/swift/build.sh`:

1. deletes `swift/build`;
2. invokes `swift build -c ${BUILD_CONFIG:-release}`;
3. finds the first executable named `SentinelProxyExtension` under `.build`;
4. constructs a bundle named by the actual bundle ID;
5. copies executable, plist, and a `SYSX????` PkgInfo;
6. signs only when `CODE_SIGN_IDENTITY` is nonempty, using `swift/TransparentProxyExtension.entitlements`.

The `ARCH` variable is printed but never passed to Swift; the default string `arm64 x86_64` does not create a universal binary by itself.

The package declares macOS 13 and links NetworkExtension, Foundation, and `bsm`.

## App packaging scripts

### Production/notarization script

`build-and-notarize.sh` detects proxy/workspace paths, defaults to a debug build, requires Cargo/Swift/Xcode, required plists/entitlements, and two untracked provisioning-profile paths under `proxy/certs`. It:

- runs `sudo cargo clean` unless skipped;
- builds with `dlp-oob,mac-packet-redirector,image-ocr,extract-all`;
- invokes the Swift build;
- constructs `target/{profile}/SentinelProxy.app` and embeds the extension/profiles;
- signs extension binary, extension bundle, app binary, and app bundle inside-out;
- ZIPs the app, submits with a keychain notary profile, waits, staples, and assesses;
- prints install/run commands.

**Security/operations note:** the default signing identity contains a named individual and team ID. No secret password is hard-coded; the notary credential is expected in Keychain.

**Potential issue:** extensive use of `sudo` for Cargo, cleanup, ZIP, signing, and notarization can create root-owned workspace artifacts and expands script privilege beyond the `/Applications` install operation.

### Development script

`dev-build-install-run.sh` can build, install, and run. It may advise disabling SIP and enabling system-extension developer mode. Build/signature failures are deliberately tolerated through `|| true`; a failed verification is a warning. Install kills matching proxy processes, unregisters the extension, removes `/Applications/SentinelProxy.app`, copies a new bundle, then runs with packet interception and transparent TLS.

**Verified:** `PROXY_ARGS` is collected as a shell string and expanded unquoted in `exec`. Arguments containing whitespace/glob characters are not preserved as an array.

The script's build flags match the production feature bundle. Provisioning profiles are optional in this dev path.

## Configuration/static artifacts

| Path | Classification | Runtime/build role |
| --- | --- | --- |
| `configs/redirector_config.toml` | handwritten config | Windows port/UDP/process settings; macOS Pong loader may read deployed bundle copy. |
| `dlp_content_extractor.json` | handwritten empty fixture/config | exact contents are `[]`; it provides no DLP pattern by itself. |
| `h2_disable_hosts.txt` | handwritten static compatibility list | hundreds of exact hosts loaded to suppress HTTP/2. No generator/upstream provenance is recorded. |
| `Info.plist` | host app metadata | bundle ID `ai.quilr.agent.sentinel`, version `1.0`/build `1`, macOS 13, UI element. |
| `entitlements/sentinel-proxy.entitlements` | host signing input | team/application IDs, system-extension install, app-proxy-provider system extension entitlement, app group. |
| `swift/TransparentProxyExtension/Info.plist` | extension metadata | provider class and XPC group, version `1.0`/build `1`. |
| `swift/TransparentProxyExtension.entitlements` | active extension signing input | application/team IDs, app-proxy-provider-systemextension, app group. |
| `swift/TransparentProxyExtension/SentinelProxyExtension.entitlements` | unused alternate | transparent-proxy, sandbox/network entitlements, absolute `/var/run` exception; no build reference found. |

Version sources disagree: Cargo `0.1.347`, both plists `1.0`/`1`, and health JSON `0.1.0`.

## Test topology

Cargo treats each root `proxy/tests/*.rs` as a separate integration crate:

| Root crate | Included content | Status |
| --- | --- | --- |
| `tests/lib.rs` | `common`, six unit modules, `integration/proxy_flow_tests.rs` | active harness source |
| `tests/ipc_integration_test.rs` | macOS IPC codec/socket tests | not correctly target/feature gated |
| `tests/image_ocr_tests.rs` | OCR tests | gated by `image-ocr` |

`tests/unit/mod.rs` includes WebSocket, forward, body, request-context, state, and traffic-logger tests. It does **not** include `alert_payload_tests.rs`.

### Static test count

Repository-wide proxy test files declare:

- 121 `#[test]`/`#[tokio::test]` declarations in the `tests/lib.rs` module tree: 4 WebSocket, 9 forward, 11 body, 28 request-context, 29 state, 7 traffic-logger, and 33 integration declarations;
- 10 alert-payload declarations in an unimported file;
- 13 OCR declarations in the separately gated `image_ocr_tests.rs` root, one of which is an empty placeholder;
- 10 declarations in the separate IPC integration-test root;
- 164 inline test declarations under `proxy/src/`.

**Verified static total:** 154 declarations under Rust test roots plus 164 inline source-module declarations, or 318 proxy test declarations. This is declaration accounting, not evidence that Cargo discovers, compiles, or passes all 318.
- numerous inline source-module tests, especially packet parsing, UDP tracking, macOS IPC models, health/state/config/DLP helpers.

**Coverage wording:** counts above are static declarations, not executed/passing tests. Cargo/rustc are unavailable in the analysis environment, and checked endpoint CI has not yet been analyzed in the current repository phase.

### IPC test compile boundary

`tests/ipc_integration_test.rs` unconditionally imports `sentinel_proxy::packet_redirector::mac`. The library exports `packet_redirector` only with a mac or Windows redirector feature, and `mac` only with `mac-packet-redirector`. Therefore plain `cargo test` cannot resolve these imports. The file also lacks a `target_os = "macos"` guard; enabling the mac feature on a non-macOS target reaches mac-specific dependencies that are target-gated.

**Verified static defect:** the IPC integration root should be feature/target gated or declared through a required-features test target; it is neither.

### What tests actually verify

- Body tests cover ASCII truncation and non-truncated Unicode, but not truncation at a multibyte boundary—the verified panic remains uncovered.
- Forward tests cover only `safe_method_no_body`, not URI/header rebuilding, fallbacks, circuit state, or network I/O.
- WebSocket tests validate builder-created request structure and independently recompute the RFC accept hash. They do not call the production upgrade/relay path.
- Request-context tests cover JSON shape, extraction/result state, enriched-event basics, and source app. They call `record_dlp_result` with lowercase direction and therefore do not reveal the production capitalized-direction defect.
- State tests cover H2 string classification, process attribution, and uniqueness-cache behavior. They confirm a repeated uniqueness key is suppressed; they do not assert that production maps suppression to 403.
- Traffic logger tests assert queue calls succeed and one timing threshold; they do not read the file, validate flushing, simulate write failure, or shut the logger down. The runtime is intentionally leaked.
- `proxy_flow_tests` directly exercises JSONPath/transforms, cert generation, state/config helpers, formatters, and a mock server's ability to accept a TCP connection. Its “bypass logic” tests primarily call `ProxyConfig::is_dlp_domain`; several comments explicitly acknowledge they do not call actual `should_monitor_host` bypass code.
- The certificate integration test uses fixed relative filenames and deletes them before/after, making concurrent test processes/worktrees a collision risk.
- OCR tests accept success, empty extraction, or engine failure for the only real PNG; they prove little about OCR correctness. Failed OCR results are not cached, so the cache-eviction test can pass with an empty cache.
- IPC tests validate serde/framing and a test-owned Unix listener. They do not start `start_listener`, pass an FD, verify permissions, authenticate a relay, or run Swift/Rust interoperability.

### Test utilities

The common request/response/WebSocket builders are used by the WebSocket tests. The custom mock DLP analyzer, mock HTTP client, and mock certificate manager have no consumer outside their declaration file. Many assertion helpers likewise have no active test caller. They are test-helper/dead-code candidates, not production code.

### Documentation-only test suite claims

`tests/README.md` names `config_tests.rs`, `mitm_tests.rs`, `dlp_tests.rs`, and `cert_gen_tests.rs`; none exists in the checked tree. It presents coverage goals but no committed coverage report or CI enforcement. `tests/integration/README.md` labels complete HTTP, HTTPS MITM, WebSocket, DLP, fallback, and redirector scenarios as planned. The active integration source is helper-level and does not execute an end-to-end proxy.

## Documentation consistency table

| Documentation claim | Source | Code evidence | Result |
| --- | --- | --- | --- |
| macOS packet redirector uses PF/pfctl | `proxy/README.md` packet section | `packet_redirector/mac` delegates to NetworkExtension/Swift; pfctl fields are legacy | **Outdated** |
| log-only DLP is asynchronous/nonblocking | `README.md`, DLP comments | handler awaits DLP analysis before forwarding | **Contradicted** |
| body “streaming” avoids buffering | `README.md`, body comments | all chunks retained and request forwarded only after EOF | **Contradicted** |
| local AI consumes configured model file | `README.md` | `model_path` selects AI but is not passed to analyzer | **Contradicted** |
| cert cache/cert validity is 365 days | `README.md` | current rcgen paths/settings do not establish every stated value in the prose; cache is unbounded | **Partially verifiable** |
| Linux uses `platform::windows` | `README.md` | module only compiled for Windows; non-mac caller remains | **Contradicted** |
| `logs/proxy.log.*` daily rotation | `README.md` tree | traffic logger writes fixed relative `proxy_traffic.log`; tracing appender behavior is separate | **Partially confirmed / conflated** |
| code signing IDs are `com.sentinel.proxy*` | `CODESIGNING.md`, `SETUP.md`, Swift README examples | plists/source use `ai.quilr.agent.sentinel*` | **Outdated/contradicted** |
| extension entitlements contain transparent-proxy+sandbox | `CODESIGNING.md` | active script signs with different entitlement values/file | **Contradicted** |
| build outputs `SentinelProxyExtension.systemextension` | READMEs | scripts use bundle-ID filename | **Contradicted** |
| automatic Cargo build embeds extension in proxy binary | Swift README/code-signing prose | build script copies a sidecar bundle to target; no `include_bytes!` embedding exists | **Contradicted** |
| macOS TCP uses SCM_RIGHTS zero copy | Swift README and module comments | active provider connects to localhost flow relay and copies bytes both directions | **Outdated** |
| macOS UDP is forwarded over IPC | Swift README/architecture details | active `handleNewFlow` closes UDP; forwarding functions have no reachable active caller | **Planned/legacy, not active** |
| Rust flow permit limit is 200 | `MAC_ARCHITECTURE.md` | `FLOW_RELAY_PERMITS = 4096`; Swift remains 200 | **Outdated** |
| Rust flow timeout is 300 s | `MAC_ARCHITECTURE.md` | Rust has no timeout; Swift has 300 s | **Misattributed** |
| process names from Pong are case-insensitive | message docs | Swift stores original strings in a Set and uses exact `contains` | **Contradicted** |
| all listed tests exist and run | `tests/README.md` | several files absent; alert tests unimported; IPC root ungated | **Contradicted** |
| all major end-to-end flows have integration tests | integration README framing | file labels them planned; active tests are mostly helpers/config | **Documentation-only** |
| `dlp_content_extractor.json` supplies patterns | setup/examples | committed file is empty array | **Not configured as committed** |
| default app run on macOS starts listeners before extension traffic | architecture startup prose | tunnel starts before IPC/listener bind | **Contradicted** |

## Missing operational evidence

- No committed proxy-specific GitHub workflow exists inside this subtree; workspace CI analysis must establish which feature/target tests run.
- No provisioning profiles are tracked at the paths required by the production packaging script.
- No committed runtime captures prove the NetworkExtension entitlements/bundle work on a clean signed host.
- No benchmark source exists in `proxy/`; performance values in comments/readmes are unverified prose.
- No generated macOS `.app`, `.systemextension`, ZIP, certificate, or log is tracked under `proxy/`; build outputs are described but not repository artifacts.

## File classification summary

All 118 tracked `proxy/` paths are classified:

- 71 Rust/Objective-C implementation and module files;
- 13 Swift package/source/plist/entitlement files;
- 18 test source/helper/readme files;
- 6 build/package scripts/manifests;
- 5 primary documentation files plus Swift/test docs;
- 5 runtime/static configs/assets (with overlap in the category presentation avoided in the inventory appendix).

No proxy path is verified generated or vendored. The H2 host list is handwritten/committed but its upstream provenance is unresolved. Generated build outputs are not tracked.

## Unresolved

- **Unresolved:** actual compile/test results; Rust/Cargo is absent from the analysis host.
- **Unresolved:** whether an external CI template injects target/feature gating that avoids the IPC integration compile defect.
- **Unresolved:** notarization/provisioning success with current App IDs and active entitlement file.
- **Unresolved:** provenance and maintenance procedure for `h2_disable_hosts.txt`.
