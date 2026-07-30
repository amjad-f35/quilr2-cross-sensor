# Protocol and Source Profiles

## Contract authority

Human-authored JSON Schema in `contracts/v1` becomes the protocol source of truth. CI generates:

- Go types and validators;
- Python Pydantic models and the compatibility `starliner_contracts` package;
- TypeScript types and API client;
- canonical JSON fixtures;
- schema digests and compatibility reports.

Handwritten models may wrap generated types but may not redefine wire semantics.

## Small common envelope

The common envelope contains only delivery, trust, integrity, ordering, privacy and correlation metadata:

- protocol version;
- authenticated tenant and producer identifiers;
- installation/runtime/artifact/certification identity;
- producer epoch and monotonically increasing sequence;
- record ID, source profile and typed record kind;
- source event, observation and enqueue timestamps;
- body hash and idempotency key;
- privacy disposition;
- optional causal/correlation identifiers;
- explicit evidence quality and record origin.

Sensor facts live only in a typed profile payload. The envelope does not accumulate Browser, Endpoint, LLM or MCP fields.

Admission validates the envelope and then dispatches the payload to the exact `(profile, profile_version, schema_ref)` schema. It also validates payload kind/lifecycle/stage/operation against the envelope `record_type` using [profile-envelope-bindings.yaml](ontology/profile-envelope-bindings.yaml). A valid payload with a falsely labeled envelope kind is rejected.

Hashes and detached signatures use RFC 8785 JSON Canonicalization Scheme over I-JSON-compatible input. Non-finite numbers, duplicate object keys and values outside the admitted integer bounds are rejected. Strings retain their exact Unicode scalar sequence; adapters must not silently normalize Unicode before hashing. The conformance pack contains byte-identical Go, Java, TypeScript and Rust vectors.

The Edge Runtime durably stores the highest accepted configuration generation and its digest. It accepts a higher signed generation, treats an equal generation with the same digest as idempotent, rejects an equal generation with a different digest, and rejects every lower generation. A rollback is issued as a newly signed, monotonically higher generation whose payload selects an older artifact; generation numbers themselves never move backwards.

Native decisions and observed effects are separate records with stable correlation IDs. A source may emit a decision before the attempted action and an effect only after observing what actually happened; `not_observed` is an explicit effect and never inferred from the decision.

## Identity rule

Edge records contain:

- `source_object.type`;
- `source_object.namespace`;
- `source_object.id`;
- optional `parent_source_object`;
- source-native stable identifiers and aliases;
- evidence-supported candidate facts.

They never contain `canonical_entity_id`, `canonical_relationship_id`, canonical merge decisions, or product-facing lifecycle state.

The current `SourceObservation.canonical_entity` contract is accepted only under `starliner.legacy-source-observation.v1` and translated before normalization.

## Ordering and deduplication

Every producer maintains:

```text
producer_epoch: random UUID created only when the durable WAL is initialized
sequence: unsigned 64-bit integer allocated transactionally in the WAL
record_id: UUIDv7 allocated once and persisted with the record
idempotency_key: producer_id + epoch + sequence
content_sha256: canonical envelope-without-hash plus payload digest
```

Rules:

- retry reuses the identical record, epoch, sequence, ID and hash;
- the server uniqueness key is `(tenant_id, producer_id, producer_epoch, sequence)`;
- same key and same hash is `duplicate`;
- same key and different hash is `conflict`, permanently rejected and security-audited;
- sequence may arrive out of order;
- missing sequence intervals create a gap candidate after the configured reorder window;
- a later arrival closes or narrows the gap; it does not erase its audit history;
- a producer may not reset sequence inside an epoch.

No global event ordering is claimed.

## Batch admission

`POST /starliner/ingest/v1/batches`:

- at most 500 records;
- at most 4 MiB compressed request and 8 MiB decompressed;
- at most 256 KiB per ordinary record;
- one authenticated tenant and producer per batch;
- gzip or zstd where advertised;
- `Content-Encoding` and the batch `compression` declaration must agree; disagreement is a malformed batch;
- independent per-record results;
- `accepted` only after immutable body, evidence metadata and normalize work are durable;
- `duplicate` is success-equivalent;
- `rejected` is terminal for the exact bytes;
- `retry` is non-terminal and includes a bounded retry delay.

HTTP semantics:

| HTTP | Meaning |
|---:|---|
| `200` | Batch envelope processed; inspect every record result |
| `400` | Malformed batch envelope; no record admitted |
| `401/403` | Workload identity or producer authority failure; no record admitted |
| `409` | Producer epoch/sequence hash conflict |
| `413` | Request/batch bound exceeded; no record admitted |
| `415` | Unsupported media type/encoding |
| `422` | Batch is syntactically valid but no record can be interpreted |
| `429` | Admission capacity unavailable; no unacknowledged record may be discarded |
| `503` | Durable admission unavailable |

The response never echoes source payloads or secrets.

## Compatibility

- Protocol major version is in the route and envelope.
- Profile versions use semantic versioning.
- Additive optional fields are allowed only inside a schema revision and explicit namespaced `extensions`.
- Unknown enum values are preserved as `unknown:<source-value>` during normalization; public APIs expose `unknown` plus safe raw source value only when authorized.
- Removing, changing meaning/type/cardinality, changing identity semantics, or tightening previously valid input requires a new major profile version.
- Ingest supports current and previous major protocol for a declared overlap window.
- Normalizers are selected by exact profile and version, never latest-at-runtime.
- Evidence is replayed using the originally recorded profile and an explicitly selected normalizer version.

## Typed source-profile families

### Browser Extension

Required record kinds:

- extension/native-host installation lifecycle, version, management mode and capability;
- application/surface observed, changed, tombstoned;
- browser-native device observations and exact installation-to-device relationships;
- authentication context observed as `guest`, `credentialed`, or `unknown`;
- optional source classification `personal`, `corporate`, `guest`, or `unknown` only when the exact writer and classification authority are identified;
- signed Endpoint-runtime local binding assertion from the browser installation to an exact Endpoint device when the new local-binding capability is implemented and certified;
- application visit/use;
- upload attempt lifecycle;
- native scan request/outcome/cancel/timeout;
- native decision/effect;
- bounded application/device/installation snapshot start, page, complete and failure;
- extension and native-host capability/health/gap.

Stable source keys prioritize extension installation, browser-native device, normalized origin/app source ID, tab/session/request ID and native request ID. No stable browser-profile ID was found in the audited producer, so this pass does not emit or canonicalize a browser profile. DOM, file content, prompt/response, cookies, headers and credentials are prohibited. `origin` is exactly scheme plus authority: user information, path, query and fragment are rejected by schema.

### Browser Backend

Required record kinds:

- application catalog/config observation;
- tenant/user application state observation;
- browser event accepted/transformed/published;
- backend decision/status/action outcome already produced by the existing product;
- extension installation/heartbeat/capability;
- downstream publication gap or partial-failure evidence.
- bounded catalog/configuration/installation snapshot start, page, complete and failure.

Browser Backend is a separate producer. It may correlate to a client record using source IDs; it may not impersonate the extension.

### Endpoint

Required record kinds:

- device, local user/account, process and application installation lifecycle where captured by the named seams;
- `Application`, `McpServer`, `Hook`, `Skill`, `Agent`, `Model`, `ControlledRepo`, `Permission`, and `Plugin` observations from the current `EntityKind` contract;
- derived agent definition/deployment, configured model product, MCP server product/deployment and typed component records only under the deterministic mappings in the capability register;
- process/application/configuration/repository relationships authorized by `registers/relationship-support.csv`;
- application/process/hook/proxy activity;
- native DLP/policy decision and observed effect;
- service/component capability, heartbeat, snapshot watermark and gap.
- bounded process/application/agent/model/MCP/component/repository/device snapshot start, page, complete and failure after the new reconciliation capability is implemented.

Endpoint does not currently emit MCP tool/resource/prompt definitions, enterprise entitlements, authoritative directory groups, or complete filesystem access. `UserContext` is observation context—not automatically process ownership. `executed_as` requires exact `ProcessInfo` UID/SID or another explicit native execution identity. File content, traffic bodies, raw prompt/response, tool arguments/results, secrets and unrestricted paths are prohibited. `path_token` is a policy-approved normalized structural token or tenant-keyed pseudonym and is never a raw filesystem path.

### LLM Gateway

Required record kinds:

- provider, model product, provider model ID, deployment/route and tenant account observations;
- API-client/workload/application/agent source observations where the gateway has a strong source ID;
- invocation accepted, routed, streamed, completed, cancelled, timed out, failed or rejected;
- optional verified signed Endpoint agent/workload request attribution bound to the exact gateway audience and request digest;
- native DLP/classification/policy result and effect;
- usage/token/status/latency metadata where supplied by the provider;
- retry/failover route transitions;
- gateway instance, transport capability and evidence gap.
- bounded provider/model/deployment/route/caller snapshot start, page, complete and failure.

Raw prompts, responses, headers, credentials and unapproved provider payloads are prohibited. Provider-native request IDs are source aliases, not canonical IDs.

### MCP Gateway

Required record kinds:

- backend/server registration, discovery, change and removal;
- tool/resource/prompt/native-tool discovery and lifecycle;
- custom/workflow agent, version, binding, schedule and run source observation;
- Direct and OneMCP request lifecycle;
- tool call requested, confirmation-required, confirmation-granted or denied, started, completed, failed, timed out and cancelled;
- optional verified signed Endpoint agent/workload request attribution bound to the exact gateway audience and request digest;
- native DLP/ZIA/policy results and observed effect;
- resource reads, prompt requests, session start/end, progress, cancellation, capability and connection changes where supported;
- gateway capability, health, queue/outbox and evidence gap.
- bounded server/tool/resource/prompt/agent/workflow/session snapshot start, page, complete and failure.

Tool identity is scoped to server/backend. Tool name alone is never a global key. Arguments/results and OAuth/API credentials are prohibited. `origin_pseudonym` is tenant-keyed and cannot contain a URL, command line or path. `safe_description` is admitted only after adapter sanitization and privacy classification; dynamic tool content is not descriptive metadata.

## Privacy disposition

Every field is classified at build time:

- `required_metadata`;
- `optional_metadata`;
- `tenant_pseudonymous`;
- `restricted_reference`;
- `prohibited`.

The edge privacy filter runs before the WAL. A prohibited fact is not serialized, queued or admitted; the adapter returns `prohibited` and may emit a separate profile-valid, content-free gap/health record when coverage disclosure is required. Admitted envelopes record policy version, capture state and categories removed—not removed values. A canary scanner runs both before WAL and at ingest.

Snapshot pages contain only scoped source references and bounded verification metadata. Only a successfully completed `full` snapshot can support absence processing. A partial, failed, unknown or incomplete snapshot is coverage evidence, never an implicit tombstone.

## Correlation

- `traceparent` is used only when a real causal transaction propagates across components.
- `request_id`, `session_id` and `correlation_id` retain source-native semantics and namespaces.
- independent scans use `observation_id`.
- every normalized relationship/activity source reference is qualified by producer ID, profile, namespace, type and source ID;
- signed local binding/context assertions are tenant-, active-issuer-, artifact-, audience-, nonce/request-digest-, expiry- and signature-verified before they can produce deterministic cross-producer candidates;
- exact authoritative configuration mappings may establish a deterministic cross-producer binding;
- probabilistic cross-sensor correlations become review candidates with evidence and confidence; they never mutate identity directly.

## Management surface

### Producer enrollment and certification

The pass-owned bootstrap contract is [producer-enrollment-manifest.schema.json](schemas/producer-enrollment-manifest.schema.json). `apply`, `revoke` and `certify` are optimistic-revision operations. Before verification, the implementation removes the `signature` member, canonicalizes the remaining JSON with RFC 8785 JCS, and verifies the detached compact JWS against the environment's issuer/key allowlist. V1 permits `ES256` and `EdDSA`; algorithm substitution, an unknown key, an expired manifest, a tenant/scope mismatch, a stale/non-monotonic revision, an artifact/certification mismatch or a replayed `manifest_id` fails closed and is audited.

The apply transaction assigns a non-null business scope/environment, writes the producer/capabilities/certification, activates only a passing unexpired certification whose artifact and contract digests match, appends audit, and enqueues a producer projection work item keyed by revision. Revocation changes trust state before any subsequent ingest authorization and does not delete evidence. No credential or private key is carried in the manifest.

Producers implement:

- manifest and supported profiles;
- health/readiness;
- WAL depth/oldest age/disk budget;
- last allocated, delivered and acknowledged sequence;
- gap/loss state;
- effective privacy configuration version;
- artifact/certification identity;
- self-test;
- controlled flush and diagnostic bundle.

Management endpoints are local or separately authenticated. They are not exposed through the telemetry ingest route.
