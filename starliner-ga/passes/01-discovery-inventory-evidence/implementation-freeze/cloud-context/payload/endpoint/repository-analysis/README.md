# Sentinel Repository Archaeology

This documentation analyzes three repositories together because they form an endpoint-agent, server/dashboard, and IPC-library system.

## Revisions analyzed

| Repository | Remote | Branch | Commit |
| --- | --- | --- | --- |
| Endpoint agent | `quilrbusiness/sentinel-endpoint-agent` | `main` | `a022e52bf2fff6a9445ebad96c3afeaf277e259f` |
| API server/dashboard | `quilrbusiness/sentinel-dashboard` | `main` | `cd755d37c14b8b86623a15a4dbae41d33b226b2b` |
| IPC library | `quilrbusiness/ipc-event-bus` | `main` | `0cf45bc50e4121d6a4521c58f1fa52a97c125e19` |

The endpoint checkout additionally pins the IPC repository at detached commit `9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b`; its 108-path tree is inventoried separately because it materially differs from current `main`.

## Evidence vocabulary

- **Verified:** directly demonstrated by source code, configuration, tests, or committed runtime artifacts.
- **Inference:** strongly suggested by evidence but not directly demonstrated.
- **Unresolved:** the repositories do not provide enough evidence.
- **Contradiction:** repository sources disagree.
- **Potential issue:** behavior deserves investigation but is not conclusively defective.
- **Dead-code candidate:** no caller or registration was found after repository-wide searches.
- **Documentation-only:** described but not found in implementation.
- **Implementation-only:** implemented but not documented.

## Contents

- [00 — Analysis scope](00-analysis-scope.md)
- [01 — Repository inventory](01-repository-inventory.md)
  - [Endpoint-agent inventory appendix](01-inventory-sentinel-endpoint-agent.md)
  - [Endpoint-pinned IPC submodule inventory appendix](01-inventory-sentinel-endpoint-agent-pinned-ipc-submodule.md)
  - [Dashboard/API inventory appendix](01-inventory-sentinel-dashboard.md)
  - [IPC-library inventory appendix](01-inventory-ipc-event-bus.md)
- [02 — Executive overview](02-executive-overview.md)
- [03 — Architecture](03-architecture.md)
- [04 — Runtime entry points](04-runtime-entry-points.md)
- [05 — Feature catalog](05-feature-catalog.md)
- [06 — Module and file reference](06-module-and-file-reference.md)
  - [Endpoint agent and security bootstrap](06-endpoint-agent-and-bootstrap.md)
  - [Endpoint core service runtime and default graph](06-endpoint-core-service-runtime.md)
  - [Endpoint core alerting and delivery pipeline](06-endpoint-core-alerting.md)
  - [Endpoint core Persona identity, authentication, storage, and monitoring](06-endpoint-core-persona.md)
  - [Endpoint core Vault persistence, key derivation, and platform keystore](06-endpoint-core-vault-and-keystore.md)
  - [Endpoint core file index, search, and metadata utilities](06-endpoint-core-file-index-search-and-metadata.md)
  - [Endpoint database core, SQLite registry, migrations, and dormant gRPC bridge](06-endpoint-core-database.md)
  - [Endpoint core HTTP client](06-endpoint-core-http-client.md)
  - [Endpoint core kill switch](06-endpoint-core-kill-switch.md)
  - [Endpoint core cache, managed configuration, and global constants](06-endpoint-core-cache-config-global.md)
  - [Endpoint core gRPC IPC and Persona broker client](06-endpoint-core-ipc-and-persona-client.md)
  - [Endpoint core trusted time and interval scheduler](06-endpoint-core-time-and-scheduler.md)
  - [Endpoint core logging module](06-endpoint-core-logging.md)
  - [Endpoint core diagnostics facade and code registry](06-endpoint-core-diagnostics.md)
  - [Endpoint core utilities: configuration, environment cache, and default directories](06-endpoint-core-utilities.md)
  - [Endpoint core policy engine](06-endpoint-core-policy-engine.md)
  - [Endpoint core Lua scripting](06-endpoint-core-scripting.md)
  - [Endpoint core DLP templating engine and legacy UI assets](06-endpoint-core-templating-engine.md)
  - [Endpoint core crate shell, build/protobuf, dormant decompression, benchmarks, examples, and integration harness](06-endpoint-core-crate-shell-tests-and-decompression.md)
  - [Endpoint system monitor v2 runtime, configuration, state, and process discovery](06-endpoint-system-monitor-runtime-discovery-and-state.md)
  - [Endpoint system monitor v2 synchronization, enforcement, hooks, and activity telemetry](06-endpoint-system-monitor-sync-enforcement-and-hooks.md)
  - [Endpoint system monitor v2 Lua/package discovery, tests, build, and documentation audit](06-endpoint-system-monitor-scripting-packages-tests-and-documents.md)
  - [Endpoint template service IPC protocol, registry, state, Tauri UI, tests, and documentation audit](06-endpoint-template-service.md)
  - [Endpoint email-discovery user-session helper and IPC handoff](06-endpoint-email-discovery.md)
  - [Endpoint diagnostics producer IPC, receiver, persistence, OpenSearch, and operations](06-endpoint-diagnostics-receiver.md)
  - [Endpoint infrastructure platform selection, process lifecycle, binary resolution, and IPC](06-endpoint-infra-platform-runtime.md)
  - [Endpoint proxy bootstrap, HTTP/TLS forwarding, state, and health](06-endpoint-proxy-bootstrap-http.md)
  - [Endpoint proxy DLP, extraction, policy bridge, UI, and alerting](06-endpoint-proxy-dlp-ui-alerts.md)
  - [Endpoint proxy Windows/macOS packet redirection](06-endpoint-proxy-packet-redirection.md)
  - [Endpoint proxy build, packaging, tests, and documentation audit](06-endpoint-proxy-build-tests-docs.md)
  - [Endpoint build, CI, packaging, installers, auto-update, uninstall, and legacy deployment paths](06-endpoint-build-release-install-and-update.md)
  - [Endpoint root files, test utilities, dormant root tests, and complete documentation audit](06-endpoint-root-tools-tests-and-documentation.md)
  - [Dashboard/API server deep reference](06-dashboard-api.md)
  - [Dashboard frontend deep reference](06-dashboard-frontend.md)
  - [Dashboard application-intelligence pipeline](06-dashboard-app-intel.md)
  - [Dashboard operations, CI, and documentation audit](06-dashboard-operations-and-documentation.md)
- [07 — Symbol reference](07-symbol-reference/README.md)
  - [Endpoint Persona semantic symbol reference](07-symbol-reference/endpoint-persona.md)
  - [Endpoint Vault and keystore semantic symbol reference](07-symbol-reference/endpoint-vault-keystore.md)
  - [Endpoint file index, search, and metadata semantic symbol reference](07-symbol-reference/endpoint-file-index-search-metadata.md)
  - [Endpoint database core semantic symbol reference](07-symbol-reference/endpoint-database.md)
  - [Endpoint HTTP client semantic symbol reference](07-symbol-reference/endpoint-http-client.md)
  - [Endpoint kill-switch semantic symbol reference](07-symbol-reference/endpoint-kill-switch.md)
  - [Endpoint cache, managed-config, and global semantic symbol reference](07-symbol-reference/endpoint-cache-config-global.md)
  - [Endpoint gRPC IPC and Persona-client semantic symbol reference](07-symbol-reference/endpoint-ipc-persona-client.md)
  - [Endpoint trusted-time and scheduler semantic symbol reference](07-symbol-reference/endpoint-time-scheduler.md)
  - [Endpoint core logging semantic symbol reference](07-symbol-reference/endpoint-logging.md)
  - [Endpoint core diagnostics semantic symbol reference](07-symbol-reference/endpoint-core-diagnostics.md)
  - [Endpoint core utilities semantic symbol reference](07-symbol-reference/endpoint-core-utilities.md)
  - [Endpoint core policy-engine semantic symbol reference](07-symbol-reference/endpoint-core-policy-engine.md)
  - [Endpoint core Lua-scripting semantic symbol reference](07-symbol-reference/endpoint-core-scripting.md)
  - [Endpoint core templating-engine semantic symbol reference](07-symbol-reference/endpoint-core-templating-engine.md)
  - [Endpoint core crate-shell, tests, benchmarks, and decompression semantic symbol reference](07-symbol-reference/endpoint-core-crate-shell-tests-and-decompression.md)
  - [Endpoint system monitor v2 semantic symbol reference](07-symbol-reference/endpoint-system-monitor-v2-semantic.md)
  - [Endpoint template service semantic symbol reference](07-symbol-reference/endpoint-template-service-semantic.md)
  - [Endpoint email-discovery semantic symbol reference](07-symbol-reference/endpoint-email-discovery-semantic.md)
  - [Endpoint diagnostics semantic symbol reference](07-symbol-reference/endpoint-diagnostics-semantic.md)
  - [Endpoint infrastructure platform-runtime semantic symbol reference](07-symbol-reference/endpoint-infra-platform-runtime.md)
  - [Endpoint proxy runtime semantic symbol reference](07-symbol-reference/endpoint-proxy-runtime.md)
  - [Endpoint proxy DLP semantic symbol reference](07-symbol-reference/endpoint-proxy-dlp.md)
  - [Endpoint proxy packet-redirector semantic symbol reference](07-symbol-reference/endpoint-proxy-redirector.md)
  - [Endpoint build/deployment/script AST catalog](07-symbol-reference/endpoint-build-deployment-scripts.md)
  - [Endpoint root/support AST catalog](07-symbol-reference/endpoint-root-and-support.md)
  - [Endpoint tools and root-tests AST catalog](07-symbol-reference/endpoint-tools-and-tests.md)
- [08 — Data dictionary](08-data-dictionary.md)
- [09 — Data models and storage](09-data-models-and-storage.md)
- [10 — API and interface reference](10-api-and-interface-reference.md)
- [11 — Configuration reference](11-configuration-reference.md)
- [12 — Security model](12-security-model.md)
- [13 — Error and recovery model](13-error-and-recovery-model.md)
- [14 — Concurrency and performance](14-concurrency-and-performance.md)
- [15 — Build, deployment, and operations](15-build-deployment-and-operations.md)
- [16 — Test analysis](16-test-analysis.md)
- [17 — Dependency and call graph](17-dependency-and-call-graph.md)
- [18 — Documentation consistency audit](18-documentation-consistency-audit.md)
- [19 — Dead, legacy, and incomplete code](19-dead-legacy-and-incomplete-code.md)
- [20 — Open questions](20-open-questions.md)
- [21 — Analysis coverage](21-analysis-coverage.md)
