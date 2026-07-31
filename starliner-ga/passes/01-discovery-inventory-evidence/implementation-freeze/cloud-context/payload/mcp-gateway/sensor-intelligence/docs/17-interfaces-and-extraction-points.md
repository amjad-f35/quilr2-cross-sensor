# Interfaces and extraction points

## Interface inventory

| Interface family | Count/evidence | Direction | Auth model | Sensor extraction disposition |
| --- | ---: | --- | --- | --- |
| primary Python HTTP/WebSocket | 275 operations | inbound/outbound responses | route-specific admin/user/internal/public/custom MCP | do not scrape generally; use source hooks or bounded DB projections |
| workflow runner HTTP | 25 operations | gateway/worker control | internal runner token for protected operations | separate runner adapter or authenticated API extraction |
| Rust Axum | 45 operations | inbound | independent Rust JWT/admin helpers | partial implementation; no current Starliner mapping |
| FastMCP tools/resources | 18 declarations | inbound MCP | provider-specific | separate sensor runtimes; not current gateway observe coverage |
| Direct MCP | GET/POST/DELETE `/{backend_id}/mcp` | bidirectional JSON-RPC/SSE/HTTP | multi-branch MCP identity/OAuth/API token/delegation | current post-result `tools/call` hook is preferred |
| OneMCP | tenantless/tenant GET/POST/DELETE | aggregate MCP/SSE | OneMCP OAuth/gateway identity | requires dedicated hooks; current observe incomplete |
| OAuth/OIDC/DCR | direct and OneMCP route families | inbound/outbound provider traffic | OAuth state/client/PKCE/provider | use safe native event/rejection projection, never token interception |
| SQLite | four DB files across gateway/runner | internal persistence | filesystem/process | change-aware adapter possible; schema-version and locking required |
| ClickHouse | three v2 output tables + smart-group input | outbound/inbound | configured credentials | secondary analytics source; avoid double-counting with SQLite |
| Starliner ingest | HTTP POST configured URL | outbound | bearer or loopback override | current durable telemetry channel |
| Starliner operational routes | 3 | inbound reads/test | manifest public; metrics/self-test admin | health/capability extraction only |
| process logs | stdout/stderr | outbound | collector-defined | operator-only; not primary structured adapter |
| files/artifacts | runner artifact root and committed/test files | internal/external download | route/filesystem permissions | metadata mapping; content privacy gate |
| environment/config | process env, DB settings, build args | inbound | deployment authority | safe manifest projection only |

## Primary route families

| Family | Operations | Data value |
| --- | ---: | --- |
| gateway/root | 30 | pages, health, detailed diagnostics, smart group/ZIA |
| authentication | 19 | users/companies/admin/domain/catalog login |
| backends | 27 | CRUD/probe/capabilities/settings/auth/tokens |
| Direct MCP | 3 | live protocol activity |
| OneMCP core | 6 | aggregate live protocol/session activity |
| OneMCP OAuth/connect | 30 | connection/auth lifecycle |
| direct OAuth | 29 | upstream OAuth/DCR/token lifecycle |
| IdP routes | 15 | Entra/Google/Auth0 login |
| store/catalog | 10 | catalog/install lifecycle |
| logs/export | 10 | operational/evidence extraction |
| dashboard/audit | 10 | health/configuration/audit |
| memories | 9 | user/tenant memory |
| clients | 6 | client/agent access |
| workflow agents | 57 | definitions/bindings/readiness/run/chat/schedule/quota |
| workflow run admin | 11 | run/step/artifact/cancel/rerun |
| Starliner | 3 | manifest/self-test/metrics |

The exact method/path/symbol registry remains in the first-pass generated
`evidence/active-interface-registry.md`.

## Exact current extraction points

| Extraction ID | Point | Why chosen | Limitations |
| --- | --- | --- | --- |
| EP-001 | `BackendRegistry._observe_backend_registration` | post-persistence source lifecycle with tenant/backend/tool context | create only; display/schema/lifecycle omitted |
| EP-002 | `BackendRegistry._observe_tool_discovery` | post-capability-persistence tool set | no snapshot/delete/completeness |
| EP-003 | `MCPHandler._observe_completed_tool_call` | result-aware, after native controls, before response path ends | Direct only; exception gap; reduced context |
| EP-004 | `StarlinerOutboxRepository.enqueue_many` | validated durable boundary | records already reduced; unsuitable for richer native extraction |
| EP-005 | `events`/`mcp_rejected_requests` safe DB projection | structured auth/admin/control/failure history | new adapter; retention/sensitivity |
| EP-006 | `tool_call_logs` safe DB projection | richer activity/DLP/token-saving evidence | highly sensitive; double-counting/correlation |
| EP-007 | workflow runner repository/API | execution/run/step/artifact lifecycle | separate process/store/deployment |
| EP-008 | OneMCP handler lifecycle hooks (new) | native/remote/session context at actual execution | `Requires minor sensor instrumentation` |

## Rejected extraction strategies

- packet interception: encrypted/application semantics and credentials; no need
  when application seams exist;
- generic HTTP middleware scraping: cannot reliably distinguish successful
  domain effects and risks payload capture;
- stdout parsing: unstable/unstructured and may contain secrets;
- reading process-local dictionaries from a sidecar: unsafe and replica-local;
- using ClickHouse plus SQLite without source identity: double-counts the same
  event families;
- reading OAuth token tables for token values: violates data-minimization;
- treating documentation/API names as event proof: configured endpoint is not
  observed use.

## Adapter access requirements

For a sidecar/collector design:

- read-only SQLite access to explicit allowlisted tables;
- checkpoint storage separate from source tables;
- schema/version detection;
- busy-timeout/WAL-compatible reads;
- separate runner DB/artifact metadata access if workflows are included;
- admin-authenticated health/self-test only when DB access is unavailable;
- outbound Starliner telemetry credentials;
- no read permission for environment secrets or credential values where
  avoidable.

For an in-process design:

- explicit typed lifecycle calls;
- bounded asynchronous queue;
- immutable safe DTOs before scheduling;
- no request/response mutation from telemetry;
- startup/shutdown/health hooks;
- no import-time hard dependency while disabled.

## Interface failure semantics

- FastAPI validation: 422 before handler;
- auth: 401/403 or MCP challenge/error depending interface;
- MCP: JSON-RPC error/result and SSE transport behavior;
- outbox ingest: retry all transport/non-2xx; per-record terminal/retry;
- SQLite: transactional errors/lock timeout;
- runner/control: HTTP error plus local gateway translation;
- ClickHouse: best-effort startup sync and independent continuous sync errors;
- external IdP/MCP/ZIA/DLP/embedding: branch-specific timeout/error behavior.

Exact status/error values remain source-symbol evidence; adapter mappings must
preserve safe reason codes rather than free-form messages.

