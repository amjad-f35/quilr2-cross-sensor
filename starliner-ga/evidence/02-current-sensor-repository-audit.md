# Current Sensor Repository Audit

Status: **verified static evidence at pinned revisions; deployed-runtime verification remains required**

## Conclusion

The launch-sensor repositories were already analyzed deeply. They are not missing, shallow, or limited to directory-level summaries.

The four audit packages account for **3,872 tracked paths** and **46,226 indexed declarations or bindings** across the browser, endpoint, LLM Gateway, and MCP Gateway source sets. Each package includes repository inventory, entry points, features, symbols, data, interfaces, configuration, security, failure behavior, concurrency, deployment, tests, call graphs, contradictions, dead/incomplete code, open questions, and coverage.

This closes the static-source portion of the former blanket `NI-025` and `NI-032` statements for the pinned revisions. It does not prove that:

- a remote branch has not advanced after the pinned revision;
- the pinned revision is the artifact deployed to a customer;
- production environment values, network policy, identities, credentials, mounts, queues, databases, or security overlays match source;
- external/private dependencies behave as assumed;
- source-described deployment scripts are the actual release path.

Those narrower facts remain release evidence.

## Audited revisions

| Product boundary | Repository and revision | Scope and coverage | Local checkout verification on 2026-07-28 |
|---|---|---|---|
| Browser extension client | `quilrbusiness/Project-Vanguard@fc09f3a20e3e129b02f69f5045965e8fa694c022`, `main` | Included in the 1,226-path browser package; 7,610 declarations | `HEAD` equals audited commit; analysis-created `tsconfig.tsbuildinfo` modification and untracked `pnpm-workspace.yaml` are not commit evidence |
| Browser native host | `quilrbusiness/project-sentinel@88ae4e3b2d531e3b285bb5a42f6ccb76568414f9`, `main` | Included in browser package; 2,364 declarations | clean checkout; `HEAD` equals audited commit |
| Browser backend service | `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`, `main` | Included in browser package; 2,982 declarations and 181 HTTP mappings | clean checkout; `HEAD` equals audited commit |
| Endpoint agent | `quilrbusiness/sentinel-endpoint-agent@a022e52bf2fff6a9445ebad96c3afeaf277e259f`, `main` | Included in the 1,265-record endpoint package; compound agent, monitor, proxy, hook, service, IPC, build, and installer system | clean checkout; `HEAD` equals audited commit |
| Endpoint dashboard/API | `quilrbusiness/sentinel-dashboard@cd755d37c14b8b86623a15a4dbae41d33b226b2b`, `main` | Included in endpoint package; Go API, ClickHouse, React frontend, CI and operations | clean checkout; `HEAD` equals audited commit |
| Endpoint IPC current main | `quilrbusiness/ipc-event-bus@0cf45bc50e4121d6a4521c58f1fa52a97c125e19`, `main` | Included in endpoint package | clean checkout; `HEAD` equals audited commit |
| Endpoint-pinned IPC dependency | `ipc-event-bus@9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b` | Separate 108-path tree because it materially differs from current `main` | audited from the endpoint dependency revision |
| LLM Gateway/data protection platform | `quilrbusiness/macrodata-refinement@7bbbb8e6b4d43d926d8a8285327c7adba367cd74`, `dev_main` | 1,030/1,030 tracked files; 15,506 declarations/bindings; 287 active primary routes | `HEAD` equals audited commit; only analysis documents are untracked |
| MCP Gateway | `quilrbusiness/quilr-llm-gateway@1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`, `add_gateway`, scoped to `mcpgateway/` | 351/351 tracked paths; 6,584 declarations/assignments; 275 main-gateway operations plus runner/Rust/FastMCP surfaces | clean checkout; `HEAD` equals audited commit |

The browser package covers three repositories. The endpoint package covers three requested repositories plus the endpoint-pinned IPC revision. They are distinct product/source sets even though both contain historical “Sentinel” naming.

## Analysis artifact integrity

The following digests identify the state and coverage ledgers used by this corpus:

| Evidence artifact | SHA-256 |
|---|---|
| Browser `ANALYSIS_STATE.md` | `64d3ecbd99030f894d625df3165ee6140c6b87337ea3df1fbe5f6d0e67eea9c6` |
| Browser `21-analysis-coverage.md` | `c06420532f0286e28d7d45c16a37dbb0459fc68e110a281789b67efe258107f0` |
| Endpoint `ANALYSIS_STATE.md` | `c319c2c0dc981d8226dde30b3b85f4671a314023b3c96c0fba8727074317ca2e` |
| Endpoint `21-analysis-coverage.md` | `683161624b3864a2ca976153fdfadd951b179daba3e1e4c762da72324bf0396b` |
| LLM Gateway `00-analysis-scope.md` | `bfb264fe98d28428d2173c18f6a413513c5ec81a022610bc1f0e84af7ca2352c` |
| LLM Gateway `21-analysis-coverage.md` | `6fcc9a5638660c09d66bf0e693caacddc978010d64996962317a3e6d755c4b02` |
| MCP Gateway `ANALYSIS_STATE.md` | `3020b8e7ecabe6f7683266d3285ed3a9bc69f173e70a4d568f368cba02ec2b0b` |
| MCP Gateway `21-analysis-coverage.md` | `3380e89d193544f2669542021a4510c7777682037e05c9707c7211ca627cbd54` |
| Quilr 1 `ANALYSIS_STATE.md` | `0547910336f316cd6bec8178bdbaa077a8b545a91d7b9cc7fdd44f22b35c99cb` |
| Quilr 1 `21-analysis-coverage.md` | `a01080224a80151e522b8da10930bcff7856873412d272f5213060d1da0d8981` |

A digest identifies reviewed bytes. It does not convert static analysis into deployed-runtime proof.

## Verified source seams

| Sensor/profile | Native observation seam | Native control/effect seam | Existing delivery seam | Quilr 2 disposition |
|---|---|---|---|---|
| Browser client | `FrameManager.handleUploadEvent`, `userActivityChannelController`, `BrowserSession.notifyUserAction`, `ProcessChain`, and `ActivationRules` | process-chain policy result, `UploadEvent` allow/block/override/cancel injection, native scan response | browser messages, BFF calls, browser storage; no Starliner runtime | bind an embedded browser adapter in the background context; MAIN/isolated scripts remain capture/UI boundaries |
| Browser native host | native messaging loop, `FileUploadHandler`, `FileSearchService.handle_upload_request_batch` | native scan result/cancel and heartbeat stages | Chrome native-message stdout | emit native facts through the browser component lineage; do not make it canonical endpoint inventory |
| Browser backend | `UserActionController.logBrowserEvent`, transformation/producer services, registration and `recordHeartbeatV2` | deployment/configuration service results | Kafka, graph, DWH, PostgreSQL, Redis, disk; heartbeat V2 is process memory | add a distinct backend producer/outbox; preserve client lineage; do not use product-native fanout as canonical truth |
| Endpoint | `ProcessEnumerator`, `Correlator`, `EntityStore`, Lua/package scanners, proxy request context, hooks, service status | `Enforcer`, proxy policy/403/forward, template UI, service lifecycle | direct `/ea/v1/sync/*` HTTP, activity batcher, alert HTTP/IPC, local snapshots | replace direct canonical-ID/sync coupling with a device Starliner runtime and authenticated component adapters |
| LLM Gateway | shared gateway auth/routing/DLP/provider lifecycle around `openai_chat_completions` and provider-compatible modules | existing RBAC, DLP, Guardian, rate/concurrency and provider-route action | `db_write_queue`/NATS/ClickHouse and local SQLite | introduce a common LLM lifecycle adapter and dedicated Starliner WAL; product analytics queues are not evidence durability |
| MCP Gateway | `BackendRegistry` registration/tool discovery and `MCPHandler.handle_request`/`_handle_tools_call` | DLP, confirmation, ZIA, legacy Starliner pre-tool adapter | existing Starliner SQLite outbox/delivery worker plus product logs | retain and upgrade the prototype; cover Direct and OneMCP; remove producer-created canonical references; replace normal central hot-path decisions with local signed policy |

## High-impact verified facts

### Browser

- The browser upload path is fully traced across page MAIN world, isolated content, background process chain, Chrome native messaging, native file resolution/DLP, policy result, and page injection.
- `MainContentMessaging` uses one response slot rather than a request-ID map; concurrent requests can interfere.
- native scan results and browser packaging assume positional alignment; mixed batches can misassociate results.
- ordinary upload-processing errors generally allow, while a scan timeout cancels.
- Browser Extension Service has 181 handler mappings, `permitAll` URL rules with effective proprietary auth outside source, multi-store partial failure, and a process-local lossy heartbeat implementation.

### Endpoint

- System Monitor v2 already discovers nine entity kinds but only process-enforces `Application`.
- Its active source-to-backend path requests application IDs from a backend before ingest. That is incompatible with the Quilr 2 rule that only the central resolver assigns canonical identity.
- `EntityStore` is in memory plus one JSON snapshot; hook activity and enforcement audit have no durable local evidence spool.
- hook installation and telemetry are implemented, but `ActivityEvaluator` always allows and does not invoke DLP or policy.
- the hook IPC server is unauthenticated, permits broad local access, and trusts an unbounded frame length.
- the proxy has real DLP/policy/UI enforcement but commonly fails open when analysis or the policy engine is unavailable.
- the audited source contains an unencrypted development signing key/certificate/PKCS#12 set, and one Windows packaging mode can include a CA private key. Source presence is verified; distribution, production use, revocation, and customer exposure remain incident questions.

### LLM Gateway

- The primary application has 287 active routes and separate Rust/Python detector, model, and database writer processes.
- `validate_api_key` produces the tenant, user, application, provider, route, category, and policy context needed by a safe adapter.
- `openai_chat_completions` is a verified end-to-end routed execution seam, but the other provider-compatible route modules must be brought under the same lifecycle contract.
- the current product logging path publishes to NATS without a JetStream admission acknowledgement at the producer boundary.
- the tracked production supervisor is a large tmux/all-in-one composition and omits some implemented services. It is not the Quilr 2 platform topology.

### MCP Gateway

- An existing optional observe runtime already maps backend discovery, tool discovery, and completed direct tool calls; owns a bounded SQLite outbox; retries delivery; exposes manifest/self-test/metrics; and keeps observation fail-open.
- a separate legacy pre-tool Starliner adapter supports `shadow` and `enforce`.
- the observe mapper currently constructs `canonical_entity` references from producer-generated IDs. This must be changed to source-native references/binding tokens.
- the direct and OneMCP handlers are separate stacks. Existing direct-handler instrumentation is not proof of complete OneMCP/native-tool/resource/prompt coverage.
- the private contracts/adapter packages and parent-repository scripts were unavailable to the scoped test run.

## What remains `NEEDS_INPUT`

The unresolved implementation evidence is now precise:

1. accountable repository/service owners and backups;
2. which source revision and signed artifact is deployed in each environment;
3. the delta from these pinned commits to the implementation branch selected for Quilr 2;
4. effective production configuration, identities, secrets, policies, routes, storage, network controls, and external/private dependency versions;
5. target repositories and deployment paths for new central services and shared runtime packages;
6. supported release matrices and customer deployment profiles;
7. runtime certification under real dependencies, load, outage, upgrade, and recovery;
8. endpoint credential incident disposition and rotation evidence.

## Authority

These audits establish current implementation facts and constrain adapter placement. They do not authorize reuse of Quilr 1’s API mashups, source-specific UI composition, multi-store truth, or sensor-issued canonical identity.
