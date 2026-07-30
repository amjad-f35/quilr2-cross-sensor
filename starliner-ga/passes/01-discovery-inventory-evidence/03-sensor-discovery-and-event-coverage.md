# Sensor Discovery and Event Coverage

Status: **normative pass source and event catalog**

## Common record families

Every certified source supports the applicable subset:

| Family | Required meaning |
|---|---|
| producer lifecycle | enrollment, start, stop, update, revocation, version, artifact |
| capability | supported/active mode, certification, permission, effective interval |
| discovery | source object first seen, observed, changed, removed-at-source, reappeared |
| reconciliation | snapshot begin/page/complete/failed, cursor, scope, counts, checksum |
| activity | source action, request, execution, invocation, access, outcome |
| native decision | existing source policy/DLP/confirmation/routing decision |
| native effect | supported source-observed result of a native action |
| health | dependency, permission, runtime, backlog, freshness, resource state |
| gap/loss | sequence gap, WAL pressure, sampling, unsupported, privacy omission, outage |
| correction | source correction, retraction, supersession, late outcome |

Every event identifies its evidence authority. Relay stages preserve lineage and do not create a second independent action.

## Browser Extension and native host

### Discovery and lifecycle

- extension installation enrolled/started/updated/stopped/removed;
- browser/profile coverage observed;
- web AI surface first seen/observed/changed;
- browser session started/ended where supported;
- native host available/unavailable/version changed;
- catalog/configuration version activated;
- source permission or management mode changed.

### Activity and important evidence

- supported AI navigation or application activation;
- privacy-safe interaction/action metadata;
- upload/download initiated;
- native file lookup/readability outcome;
- file/data classification result;
- source policy/DLP decision;
- warning/justification/block/permit outcome;
- observed browser-native effect;
- extension→native request and response correlation;
- timeout, fail-open/fail-closed, unsupported, or delivery failure state.

### Required corrections

- replace the single response slot with keyed concurrent correlation;
- replace positional upload association with stable operation IDs;
- authenticate native messaging and bind installation/native-host identity;
- implement durable browser WAL and service-worker suspension recovery;
- separate extension, native-host, and Browser Backend producer identities.

## Browser Backend

### Discovery and lifecycle

- extension/workstation enrollment receipt;
- authenticated configuration request;
- configuration version delivery and acknowledgement;
- backend runtime/version/route state;
- persona/profile bridge result;
- heartbeat receipt under declared loss semantics.

### Processing evidence

- request received;
- validated/rejected;
- risk/native transform result;
- native queue handoff attempted;
- broker acknowledgement where directly observed;
- downstream processing confirmation only when directly observed;
- dependency failure or partial success.

The backend never republishes a client action as a new independent browser fact.

## Endpoint compound sensor

### Discovery and lifecycle

- endpoint installation/agent lifecycle;
- device and OS posture snapshot;
- boot epoch and user-session bridge;
- process start/observe/stop;
- executable/artifact/package discovered/changed/removed;
- local AI application candidate discovered/changed/removed;
- local model/runtime discovered/changed/stopped;
- local MCP client/server/process discovered;
- network destination/connection candidate;
- installed-software snapshot begin/complete/failure;
- proxy/hook/component capability and permission state;
- updater download/stage/install/restart outcome.

### Activity and important evidence

- process execution and privacy-safe lineage;
- local application activity;
- network request/connection outcome;
- proxy request and response metadata;
- file/data operation class;
- DLP evaluation;
- current native governance decision;
- hook alert/activity;
- process/network/file block or allow outcome;
- quarantine/configuration/update native effect;
- sleep/offline/permission/gap state.

### Required corrections

- centralize Quilr 2 identity; `resolve_app_ids` is migration-only;
- replace discovered-app sync as canonical inventory authority;
- authenticate and bound local IPC;
- replace best-effort activity/alert delivery with the Starliner WAL;
- disposition source-verified signing/CA material before certification.

## LLM Gateway

### Discovery and lifecycle

- gateway deployment/version/lifecycle;
- configured route upsert/delete;
- provider account/project configuration;
- provider/model alias/deployment candidate;
- authenticated application/agent/workload caller bridge;
- configuration snapshot/reconciliation;
- supported provider transport/capability state.

### Request and important evidence

- request accepted/rejected;
- authenticated tenant/principal/workload context;
- route/provider/model selected;
- input DLP/classification outcome;
- native policy/routing decision;
- upstream attempt;
- provider request ID and status where available;
- stream started/completed/cancelled/timed out;
- retry/failover attempt;
- output DLP/classification outcome;
- client response outcome;
- input/output/cached token or unit counts;
- latency and safe status/error class;
- rate/quota outcome;
- delivery/config/provider dependency gap.

### Required corrections

- apply one lifecycle contract to every advertised provider-compatible route;
- cover streaming, partial responses, cancellation, retries, and failover;
- use sidecar WAL rather than treating NATS/log/database success as evidence durability;
- disclose gateway-route coverage and bypass limitations.

## MCP Gateway

### Discovery and lifecycle

- gateway deployment/version/lifecycle;
- registry snapshot begin/page/complete/failure;
- backend/server definition upsert/delete;
- tool/resource/prompt definition upsert/delete;
- server endpoint/transport/auth posture;
- connection/reachability state;
- initialization and negotiated capability change;
- session start/end/expiry;
- Direct/OneMCP/native-tool surface capability state.

### Invocation and important evidence

- tool/resource/prompt invocation started/completed/failed;
- actor/client/delegation and request correlation;
- confirmation required/granted/denied/expired;
- input/output DLP classification outcome;
- existing native/legacy policy decision;
- upstream called or not called;
- progress/cancellation/timeout;
- safe structural argument/result metadata;
- latency/status/error class;
- observed registry/route/tool effect;
- OAuth/session/dependency/delivery gap.

### Required corrections

- remove producer-generated canonical entity IDs;
- independently instrument and certify Direct, OneMCP, and native paths;
- cover registry deletions, snapshots, resources, prompts, sessions, progress, and cancellation;
- externalize process-local state before multi-replica support;
- treat source `FindingSignal` only as a native signal/event.

## Evidence excluded by default

- prompts and responses;
- DOM, form and clipboard content;
- uploaded/downloaded file content;
- command lines, environment variables, process memory, and unredacted paths;
- LLM bodies, embeddings and attachments;
- MCP arguments/results, resources, prompts, sampling and elicitation content;
- cookies, authorization headers, tokens, API keys, passwords, client secrets, private keys;
- unkeyed hashes of sensitive or low-entropy content.

Capture state records whether a field was not available, unsupported, privacy omitted, prohibited, sampled, redacted, tokenized, or separately restricted.

## Certification rule

A source may advertise only the event types proven for the exact:

- source revision and built artifact;
- adapter and runtime artifact;
- browser/OS/gateway/MCP version;
- permissions and management mode;
- deployment topology;
- privacy profile;
- configuration;
- workload identity;
- resource/capacity profile.

The machine-readable coverage register is [`registers/source-coverage.yaml`](registers/source-coverage.yaml).
