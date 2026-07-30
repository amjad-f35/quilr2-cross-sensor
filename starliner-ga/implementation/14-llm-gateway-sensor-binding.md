# LLM Gateway Sensor: Current-Code Binding

Status: **normative target binding; current behavior verified at `macrodata-refinement@7bbbb8e6b4d43d926d8a8285327c7adba367cd74`**

## Boundary

The LLM Gateway directly observes routed model requests. It is authoritative for the route, configured caller, provider/model identifiers it used, request outcome, gateway decision/effect, latency, token/usage metadata, and its own coverage. It is not authoritative for traffic that bypasses it or provider-side facts it did not receive.

The audited repository also contains DLP APIs, model/detector workers, a database writer, endpoint configuration, file parsing, and health services. Their existence does not make every internal worker a separate enterprise sensor.

## Current execution topology

```text
client
→ BlackSheep route
→ API-key/JWT identity context
→ application/RBAC/rate/concurrency
→ request DLP / Guardian / policy
→ provider routing and call
→ optional response controls
→ response/stream
→ product logs through NATS/ClickHouse/SQLite
```

`Verified current:` `DataClassifier.handlers.llmgateway.openai_compatible.openai_chat_completions` implements this complete flow for the principal OpenAI-compatible chat endpoint. Provider-specific, Responses, Assistants, Realtime, embeddings, rerank, audio, and SDK-compatible modules are separate transport adapters around related gateway behavior.

## Runtime placement decision

The gateway uses:

- an in-process typed adapter at the shared authenticated request/provider lifecycle;
- an in-process local PEP snapshot for the synchronous request path;
- one Starliner Edge Runtime sidecar per gateway pod/deployment unit for WAL, delivery, bundle/command verification, health, and certification.

The adapter-to-sidecar channel is local, authenticated, bounded, and non-content by default. A sidecar outage degrades evidence and declared coverage but does not silently invent a successful enqueue.

The synchronous gateway decision path never waits for evidence delivery. Normal policy evaluation uses the locally active signed bundle. Central decision escalation is reserved for policy-defined exceptional actions with a bounded deadline and explicit fail mode.

## Stable current seams

| Current symbol/module | Verified current meaning | Quilr 2 binding |
|---|---|---|
| `DataClassifier.blacksheep_app:app`, `on_start`, `on_stop` | application composition and lifecycle | runtime registration, artifact/capability/health lifecycle |
| `openai_compatible.validate_api_key` | resolves API-key/JWT context, tenant, user, app, provider, route, categories and policy | construct authenticated actor/workload/source context; never export credentials |
| `jwt_auth.validate_jwt_token` | issuer/client/key verification and claims mapping | retain verified issuer/subject/client claim refs and assurance; do not trust unverified decode fields |
| `rbac.evaluate_app_permission` | deny-precedence application access | emit native authorization result and applied policy version |
| `check_allowed_source_ip` | caller source policy | emit coarse reason/result only |
| `openai_chat_completions` | principal end-to-end model execution | canonical lifecycle interceptor reference implementation |
| provider-compatible route modules | Anthropic, Bedrock, Vertex/Gemini, Responses, Assistants, Realtime, embeddings, rerank, audio and SDK surfaces | must invoke the same lifecycle contract or declare unsupported capability |
| request DLP/Guardian modules | request classification/transformation/block | safe data labels, native decision and effect |
| provider adapter calls | actual upstream call attempt/result | provider attempt/outcome, provider request ID where returned |
| response DLP/hallucination/Guardian | nonstream response checks | result-side decision/effect; streaming limitation explicit |
| `llmgateway_database.DatabaseManager` | configured routes, providers, users, apps, permissions and keys in SQLite | configuration reconciliation source; encrypted/secret values excluded |
| `db_write_queue.publish_db_write` | product log publication to NATS without producer JetStream acknowledgement | legacy analytics path only; not Starliner durability |

## One lifecycle contract for every routed execution

Each supported gateway transport must call the following adapter operations:

```text
begin_request
→ authenticated_context
→ route_selected
→ local_policy_evaluated
→ provider_attempted
→ provider_result
→ response_policy_evaluated
→ completed
```

The adapter creates one gateway observation ID independent of client-supplied request IDs. Client, gateway, and provider request IDs are scoped aliases/correlation values.

### Required safe fields

- gateway deployment, runtime instance, route, artifact and profile version;
- tenant and authenticated workload/principal source references;
- calling application/agent/workload source reference;
- provider account/project source reference;
- configured route/deployment and source model string;
- operation/modality and streaming flag;
- occurrence and completion time;
- provider attempt/status/retry and bounded error class;
- input/output/cached token or unit counts where directly observed;
- latency;
- policy/bundle/decision IDs and native outcome;
- safe data/risk labels;
- coverage, sampling, overload, and degradation.

### Prohibited ordinary evidence

- prompts and responses;
- embeddings;
- attachments;
- tool arguments/results;
- request/response bodies and headers;
- API keys, provider credentials, cookies, tokens, and secret-bearing error messages.

No low-entropy content hash is a privacy substitute.

## Configuration reconciliation

`DatabaseManager` and related route/provider tables are a source for a bounded current snapshot of:

- gateway deployment and route definitions;
- configured provider account/project references;
- model aliases/deployment strings;
- application/workload bindings;
- enabled policy capability and route status.

The snapshot protocol declares page scope, total/completeness, revision, and completion. Secret fields are never serialized. Deleting a route emits an explicit source deletion; it does not delete historical executions.

Central identity resolves source model strings, routes, provider accounts, applications, agents, and workloads. The gateway does not construct canonical model or application IDs.

## Platform-to-gateway flow

### Policy bundle

The local policy adapter translates approved decision primitives into existing gateway operations:

| Platform primitive | Native gateway operation |
|---|---|
| `PERMIT` | continue current route |
| `DENY` | return compatible blocked/authorization response |
| `WARN`/obligation | compatible warning metadata where protocol permits |
| `REQUIRE_APPROVAL` | suspend only through an explicitly supported continuation protocol |
| `REROUTE` | select an approved configured route/model; record original and applied route |
| `REDACT`/transform | invoke certified native DLP transformation |
| `LIMIT` | apply existing rate/token/concurrency control |

The adapter cannot invent a provider route, expose provider credentials, or silently degrade an unsupported obligation to permit.

### Typed commands

Candidate certified commands include:

- reconcile configuration;
- enable/disable a route;
- revoke a workload/API-key setting through the native configuration authority;
- invalidate a policy bundle or decision lease;
- drain a gateway deployment;
- initiate bounded diagnostics;
- stage/activate/rollback a signed adapter/runtime artifact.

Each command has preconditions, a current source binding, native idempotency, authorization, expiry, and effect verification. Direct database writes from the platform are prohibited.

## Streaming semantics

Current streaming responses are not synchronously response-DLP-gated per chunk. The source profile must report that capability limitation.

The adapter may emit:

- stream started;
- first-byte and completion latency;
- upstream/provider status;
- usage returned at completion;
- cancellation/client disconnect;
- request-side policy result.

It must not claim response-side enforcement unless the exact streaming transport and release were certified for it.

## Failure and delivery semantics

- Adapter enqueue to the local runtime is bounded and observable.
- Runtime durable enqueue precedes successful edge acceptance.
- central `accepted` means durable evidence admission, not analytic projection completion.
- duplicate delivery is normal and idempotent.
- overload sampling/drop is an explicit gap/coverage event.
- provider errors are bounded classes, not raw error bodies.
- product NATS/ClickHouse logging success does not stand in for Starliner receipt.

## Current architecture not carried forward

The all-in-one tmux container is a current deployment artifact, not the Quilr 2 platform design.

For production:

- the HTTP gateway, model-serving processes, detector workers, database writer, and support services are separately deployable and health-scoped;
- a pod/container does not use tmux as the production service supervisor;
- the Starliner runtime is a sidecar or managed local service with an independent readiness/degradation surface;
- configuration, secrets, queues, and persistent state have declared ownership;
- rollout, rollback, mixed-version compatibility, capacity and failure domains are release-gated.

This does not require rewriting provider logic before the adapter exists. It prevents the existing process bundle from becoming the new platform topology.

## Required current-code changes

1. Introduce a single typed gateway lifecycle interface used by all supported transport modules.
2. Generate a gateway observation ID at ingress and carry it through provider completion.
3. Add source configuration reconciliation without secret fields.
4. Add sidecar WAL/delivery and producer workload identity.
5. map DLP/Guardian/RBAC/rate decisions to typed decision/effect records.
6. report streaming enforcement limitations explicitly.
7. preserve provider source IDs and model strings without producer canonicalization.
8. remove Starliner dependence on `db_write_queue`, product ClickHouse, or current dashboard tables.
9. add policy shadow comparison before native behavior changes.
10. certify every provider/API family independently and reject unsupported capability claims.

## Migration sequence

1. instrument OpenAI chat nonstream in observe-only mode;
2. prove privacy, WAL durability, replay and central resolution;
3. add streaming and remaining provider/API families by certification matrix;
4. reconcile routes/provider/model configuration;
5. dual-write legacy product logs and Starliner evidence;
6. switch Quilr 2 model/activity/cost reads to canonical APIs;
7. introduce signed local policy in shadow mode;
8. canary native enforcement/reroute/limit actions;
9. retire legacy inventory/analytics authority after semantic parity and cutover.

## Certification blockers from current evidence

- unconditional literal DLP authorization bypass in audited source;
- committed/default provider credential-encryption material;
- endpoint configuration service lacks application-level auth;
- all-in-one supervisor omissions and incomplete health formula;
- no tracked CI/release proof for the complete production bundle;
- product log producer lacks durable stream-admission acknowledgement;
- external providers, NATS, ClickHouse, models and Action API were not exercised by the static audit;
- exact production environment, secret rotation and deployment topology remain unresolved.
