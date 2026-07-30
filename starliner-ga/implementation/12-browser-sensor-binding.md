# Browser Sensor: Current-Code Binding

Status: **normative target binding; current behavior verified at the revisions in the sensor audit**

## Scope

The browser product is one customer product but three independently identified producer components:

1. Project Vanguard browser extension;
2. Project Sentinel Chrome native host used by the extension;
3. Browser Extension Service backend.

They share lineage, not runtime identity. Each has its own artifact, version, capability, health, sequence epoch, and certification.

## Current execution topology

```text
page MAIN world
→ isolated content bridge
→ extension background/service worker
→ BrowserSession and ProcessChain
→ optional Chrome native host
→ local file resolution/DLP
→ extension policy result
→ page allow/block/override/cancel effect

extension/admin clients
→ Browser Extension Service
→ PostgreSQL / Neo4j / Redis / Kafka / DWH / files / external services
```

`Verified current:` the first path is implementation-traced. The backend path is a separate Spring runtime with 181 mappings and multiple product-native stores. The second path does not become the Quilr 2 canonical read plane.

## Runtime placement decision

### Browser extension

The browser Starliner adapter and runtime are embedded in the extension background context.

- MAIN-world code captures page-native behavior only.
- isolated content scripts bridge page facts and render approved UI only.
- the background context owns source-record construction, privacy filtering, sequence state, policy cache, WAL, delivery, health, and effect reporting.
- restricted content and secrets never enter the ordinary evidence WAL.

The WAL uses a transactional browser database supported by the certified browser profile. It is not an unbounded in-memory queue or only a `chrome.storage` settings object. Its implementation must survive service-worker suspension, extension restart, browser restart, duplicate wakeups, and version upgrade.

The background runtime delivers directly to the Starliner ingest endpoint where enterprise network policy permits it. A Browser Extension Service relay is an allowed deployment transport, but the relay preserves the extension’s signed producer identity, record ID, sequence, and lineage. The relay does not re-issue client evidence as backend evidence.

### Native host

The native host remains a browser subcomponent and native enforcement/analysis point. It returns source-native scan facts to the background adapter. It does not independently assign canonical application, file, device, or user identity.

If a future native-host adapter writes directly to Starliner, it uses a distinct component ID and record lineage and is reconciled with the originating browser action. It must not create a second counted activity.

### Browser backend

Browser Extension Service receives its own producer identity and durable backend outbox. Its records describe:

- receipt and validation;
- enrollment/configuration lifecycle;
- heartbeat receipt and its exact durability stage;
- native product handoff stage;
- backend action result and runtime health.

It does not emit “the browser action happened” unless that statement is explicitly a relayed extension record with original producer lineage.

## Exact extension capture seams

| Current path/symbol | Verified current meaning | Quilr 2 adapter action |
|---|---|---|
| `src/core/contents/frameManager.ts::FrameManager.handleUploadEvent` | translates a MAIN-world upload message into a background `UserActionEvent` | retain as untrusted bridge input; do not construct final evidence here |
| `src/background/InternalMessages/userActivityChannel.ts::userActivityChannelController` | attaches sender tab/frame context and enqueues the event | validate source/frame, attach a runtime observation ID, and pass to the background safe-fact mapper |
| `src/core/userAction/session.ts::BrowserSession.notifyUserAction` | central dispatcher for page, form, copy, paste, upload, and other user actions | primary observation hook for privacy-safe interaction and web-surface activity |
| `src/core/processChain/processChain.ts::ProcessChain.runProcessChain` | executes the registered policy/classification chain | attach decision correlation and chain/bundle versions; never serialize mutable memory wholesale |
| `src/core/processChain/rules.ts::ActivationRules.PageLoadEvent` | URL/app classification, app details, permission and interceptor flow | emit a web-surface observation only after origin/catalog classification is available |
| `ActivationRules.GenAiPromptSubmitted` and `ScanForSensitiveDataV2` | prompt-side DLP/classification flow | emit operation, data-class labels, decision and effect; omit prompt/form content |
| `ProcessCopyEvent`, `ProcessPasteEvent` | clipboard action and policy flow | emit coarse operation and approved data-class signal only; omit clipboard content |
| `src/core/processChain/activationFunctions/ArtifactsToTrails.ts::FileUploaded` | chooses native scan, empty scan, or skip | emit scan-requested/skipped reason and coverage state |
| `src/core/services/uploadManager.service.ts::UploadManagerService` | sends native request and handles heartbeat/final response | correlate native request/result by explicit observation ID, not tab position |
| `FileUploadScanned` | prepares DLP labels and invokes browser-event policy | emit safe decision input labels and source policy result |
| MAIN-world `UploadEvent` injection result | actual page allow/block/override/cancel effect | emit `EffectObservation` after the attempted page effect |

## Exact native-host seams

| Current symbol | Verified current meaning | Target record |
|---|---|---|
| `start_native_messaging_loop` | reads Chrome native framing and converts `SystemAction` to events | runtime health, protocol errors, accepted native operation |
| `FileUploadHandler` | handles upload scan action | native action event with browser observation correlation |
| `FileSearchService.handle_upload_request_batch` | resolves candidate local files and processes scan work | file-match state, scan state, privacy-safe detection labels |
| native `uploaded_file_scanned` response | returns result to extension | command/action outcome; never canonical file identity |
| cancel handler | receives cancellation | cancellation outcome and incomplete-coverage reason |

The current positional response association is not accepted as a GA contract. New request and file-item IDs are explicit and preserved end to end.

## Browser backend seams

| Current symbol/path | Verified current meaning | Target disposition |
|---|---|---|
| `UserActionController.logBrowserEvent` | accepts and transforms browser events | enqueue a backend-receipt record after authentication/validation and before product-native fanout |
| `RiskTransformerFactory` and risk transformers | source-specific transformation for current Kafka/DWH products | legacy product path only; do not reuse as canonical normalization |
| `QuilrProducerService` | asynchronous Kafka publication | report only “publish requested/callback result” as observed; not central persistence |
| persona registration services | enrollment/workstation/persona creation and graph/DWH side effects | emit enrollment/config receipt with source-native IDs |
| `PersonaService.recordHeartbeatV2` and `HeartbeatBucketService` | write heartbeat to process-local epoch bucket | operational receipt only; not durable coverage or audit |
| `HeartbeatBatchScheduler` | removes local bucket then publishes | current lossy legacy path; Starliner outbox must be independent and durable |
| deployment/configuration services | mutate browser/endpoint enablement and product-native stores | expose typed command adapter only for certified actions; report native effect separately |

## Browser-to-platform records

The launch browser profile emits only approved subtypes of:

- installation/profile lifecycle;
- web-surface observation;
- privacy-safe interaction action;
- upload/download/data-operation indicator;
- local/native scan outcome;
- policy decision result;
- effect observation;
- health, coverage, gap, and snapshot lifecycle;
- backend receipt/handoff stage under the backend producer identity.

Each record includes tenant, producer/workload, component/artifact, source namespace, source-native IDs, observation ID, sequence/epoch, occurrence time, privacy disposition, capability/certification version, and source lineage.

Raw prompt, DOM, form, clipboard, uploaded content, cookies, headers, tokens, and credentials are prohibited from normal evidence.

## Platform-to-browser flow

```text
policy publisher
→ signed bundle/version invalidation
→ background runtime downloads and verifies
→ compatible bundle staged
→ atomic activation in local PEP
→ ProcessChain uses active bundle
→ decision result
→ page/native effect
→ effect observation through WAL
```

The background accepts:

- signed policy bundles and revocation epochs;
- bounded decision or approval leases;
- typed configuration commands;
- reconciliation requests;
- runtime/certification revocation.

It does not accept arbitrary JavaScript, selectors, SQL, shell commands, or opaque executable policy payloads.

The page MAIN world never receives signing keys, control credentials, full policy internals, or reusable approval authority. It receives only the minimum decision/UI primitive.

## Decision and effect semantics

For an upload:

```text
page capture
→ browser observation ID
→ optional native scan request/result
→ local PEP decision
→ allow/block/override/cancel
→ attempted synthetic page effect
→ independently recorded effect state
```

“Decision was block” and “page upload was prevented” are different records. An exception during synthetic injection, tab closure, extension suspension, native disconnect, or stale response produces an explicit unknown/failed effect rather than an assumed result.

## Required current-code corrections

1. Replace the single `MainContentMessaging` response slot with request-ID-scoped pending operations.
2. Replace positional native upload association with explicit batch/item IDs.
3. Add bounded transactional background WAL and monotonic producer sequence.
4. Add privacy mapper before persistence and secret-canary tests.
5. Bind every policy result to bundle/decision version and every effect to the originating decision.
6. Add snapshot/coverage semantics for installations and managed profiles; activity silence is not removal.
7. Give Browser Extension Service a distinct producer/outbox and preserve client relay lineage.
8. Stop using process-memory heartbeat as a population or audit denominator.
9. Keep current Kafka/graph/DWH transformations as migration-only paths; customer inventory and findings read canonical APIs.
10. Certify service-worker suspend/restart, offline, upgrade, concurrency, and relay failure.

## Migration sequence

1. Add observation IDs and safe-fact mapping without changing current policy behavior.
2. Add the browser WAL, delivery receipt handling, manifest, health, and self-test.
3. Dual-emit to legacy browser APIs and Starliner while Starliner is non-authoritative.
4. Add central normalization and client/backend lineage reconciliation.
5. Compare legacy event/finding counts by semantics, not row count.
6. Switch Quilr 2 UI reads to canonical APIs.
7. Move policy/configuration to signed bundle control with shadow comparison.
8. Enable certified enforcement cohorts.
9. retire legacy fanout only after cutover, retention, and rollback closure.

## Certification blockers from current evidence

- missing generated production manifest proof;
- concurrency/correlation defects in upload messaging;
- native result positional mismatch;
- fail-open paths and incomplete diagnostic delivery;
- native-host installer/registration evidence absent from the audited repos;
- Browser Extension Service effective auth depends on external libraries/gateway;
- lossy process-local heartbeat and non-atomic multi-store behavior;
- unresolved production mounts, network controls, private dependencies, and deployed artifact combinations.
