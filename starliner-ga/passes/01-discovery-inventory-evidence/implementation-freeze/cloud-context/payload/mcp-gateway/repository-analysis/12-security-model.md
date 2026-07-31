# Security model

This is a code-based control inventory, not a penetration-test result. Concerns that need deployment or threat-model confirmation are labeled `Potential issue`.

## Authentication and authorization controls

| Control | Enforcement location | Decision input/protected resource | Failure/bypass evidence | Coverage/status |
| --- | --- | --- | --- | --- |
| Internal JWT verification | `utils.jwt.verify_token` | HS256 signature, required identity/tenant/role claims, expiry; REST and delegation identity | Invalid/expired returns no identity → 401; source default signing key exists | Implemented; broadly exercised by auth/route tests |
| External JWT verification | `utils.jwt._verify_external_token`, `decode_token.decode_with_public_key` | RS512 signature; `email`, first `tenantIds`, subscriber/id | No public key or invalid token fails closed; no issuer/audience check is visible in the scoped verifier | Partial; `Potential issue` if upstream key alone is insufficient for the intended trust model |
| Admin REST authorization | `dependencies.auth.get_current_admin` | authenticated `role == "admin"` | legacy tenant/subscriber header fallback can produce admin context | Implemented; many admin tests |
| User REST authorization | `get_current_user_facing`, `get_current_mcp_user` | internal user role or externally resolved `mcp_users` identity | role mismatch 403 | Implemented; user/memory/dashboard tests |
| Legacy header authentication | `dependencies.auth._authenticate_with_headers` | tenant and subscriber header variants mapped to stored user | Deprecated in comments; still executable; 401/409 paths | Implemented compatibility path |
| External admin provisioning | `_authenticate_external_admin` | verified external tenant/email, domain policy, company/admin state | Can create company/admin/local user; Quilr-address special “ghost admin” proxies as first real admin | Implemented; policy-sensitive path requiring deployment review |
| Direct MCP authentication | `routes.mcp` helpers and token repositories | workflow delegation, OAuth passthrough, API token + `mcpuser`, proxy token, raw legacy token | Branch-specific JSON-RPC/HTTP errors; raw-token compatibility broadens accepted credentials | Implemented; direct OAuth/token tests |
| OneMCP authentication | `quilrone` route/OAuth helpers | tenant path, OAuth/proxy/platform identity, session | tenantless and tenant forms intentionally differ; optional raw-token flag | Implemented; OneMCP auth tests |
| Workflow internal authentication | workflow gateway routes and `workflow_runner.app` dependency/helper | internal runner token/delegation token | missing/mismatch rejected; source default exists | Implemented; workflow tests |
| Rust authentication | `mcpgateway-rs/src/auth.rs` and route checks | HS256/admin-token settings | Separate implementation/defaults; not Python middleware | Partial parallel control |
| Google MCP authentication | `GoogleWorkspaceAuthProvider` | bearer/access token and Google OAuth provider | eager client-secret failure; live token behavior untested | Implemented, dynamically unverified |

## Tenant isolation

Tenant/user/company/backend ownership checks occur in dependencies, route helpers, repositories, scoped-setting resolution, memory service, workflow service, OAuth backend lookup, log filtering, and artifact lookup. Cross-tenant negative tests are present for admin memory, workflows, scoped settings, upstream auth, and dashboard flows.

`Potential issue requiring validation:` isolation is application-enforced across many independent query helpers; SQLite has few foreign-key constraints and not every query is centralized. The presence of tests does not prove every new route applies the same predicate. The endpoint and symbol indexes make review locations explicit.

## Credential generation, storage, and propagation

- OAuth states, gateway authorization codes, proxy tokens, API tokens, session IDs, and confirmation IDs use `secrets.token_urlsafe`.
- OAuth PKCE uses SHA-256/S256 for generated verifier/challenge pairs.
- Static upstream credentials are encrypted with Fernet in `utils.secret_crypto`; the key is SHA-256-derived from `MCP_SECRET_ENCRYPTION_KEY`, falling back to `JWT_SECRET_KEY`.
- `Verified:` OAuth access/refresh fields named with an `encrypted` suffix are treated as ordinary strings by `db.oauth_repository`; no encryption call protects them.
- `Verified:` source code contains fallback/default secrets and committed OAuth client-secret material. Values are not repeated here.
- `Verified:` local username/password authentication hashes passwords with one unsalted SHA-256 operation in `AuthService._hash_password`.

`Potential issue:` unsalted fast password hashing is not a password-hardening construction. Operational impact depends on whether local password login is enabled/exposed and whether defaults are replaced.

`Potential issue:` source defaults make failure to configure secrets fail open to known credentials rather than fail closed. Tests also emitted an HMAC key-length warning for the checked-in default.

## Input validation and output handling

- Pydantic rejects malformed REST models and unknown scoped-setting fields.
- Query parameters commonly use numeric lower/upper bounds.
- Backend/static-auth validation restricts auth types and requires header/query names; reserved identity headers cannot be injected through extra headers.
- Tenant domain utilities normalize and restrict email/domain relationships.
- MCP JSON-RPC and transport helpers validate method/framing/session behavior.
- Workflow runtime configuration validates artifact/tool/Python/network limits and agent modes.
- Artifact paths are generated/owned by `ArtifactStore`; records include hashes and size limits.
- Admin audit payloads redact a defined set of sensitive keys.

`Unresolved:` there is no repository-wide HTML escaping policy to audit as one unit. Static pages and dynamically generated OAuth/login HTML should be evaluated with concrete input paths in a browser security test.

## DLP and policy enforcement

`DLPService` sends request/output data to a configured DLP API and resolves actions `monitor`, `redact`, or `block`, including category overrides. `ScopedSettingsResolver` combines backend, tenant, group, and user settings. Tool enable/confirmation checks run before supported dispatch paths.

`Verified limitation:` memory content is stored outside the MCP tool-call DLP pipeline. `Verified limitation:` logging is not downstream of a universal DLP scrubber; request/response content may be retained even when other output is redacted.

Starliner has two paths:

- `starliner/` observe delivery records bounded/sanitized lifecycle evidence;
- `services.starliner_adapter` is an optional legacy shadow/enforce pre-tool decision adapter.

Private packages are missing locally, so complete enforcement behavior is `Unresolved`.

## Network and SSRF-like boundaries

Backend registration/probing and OAuth discovery intentionally connect to configured remote URLs and may follow redirects. `gateway.zia_connect` accepts an administrator-supplied HTTP(S) service URL and establishes a ZIA client. Workflow/LLM/embedding/ClickHouse endpoints are configuration-driven.

`Potential issue requiring validation:` URL scheme checks do not by themselves prove protection from internal-address access, DNS rebinding, or cloud metadata endpoints. Because outbound connectivity is a product feature, exploitability depends on administrator trust and production egress controls; this analysis does not label it a vulnerability.

## Browser, CORS, and origin controls

The Python app allows credentials, all methods/headers, and an origin regex that defaults to `.*`. A custom middleware validates `Origin` against the same configurable expression.

`Potential issue:` the default is effectively cross-origin permissive. Risk depends on browser token storage/cookie use and deployment override. The static UIs use browser-held tokens and call JSON APIs.

No Content-Security-Policy, CSRF token framework, or general secure-cookie/session configuration was identified in scope. Some OAuth state parameters protect OAuth flows, which is separate from general REST CSRF protection.

## Diagnostic and logging exposure

- `/health` is public and minimal.
- `/healthx` accepts a hardcoded diagnostic token. Without a token it returns metadata; with the known source token it returns a filtered environment snapshot; a wrong token is 403.
- Detailed-log routes use admin or diagnostic-token checks depending on handler.
- Log export uses deterministic hash-derived key formats tied to tenant/backend values.
- Logs and events may contain identity, MCP arguments, response metadata, backend URLs, and auth-flow context.

`Potential issue:` a hardcoded diagnostic token and deterministic export-key derivation are not equivalent to independently provisioned secrets. Production exposure should be validated. The environment filter reduces but does not eliminate information sensitivity.

## Rate limiting, sandboxing, and resource controls

No general incoming HTTP/MCP rate limiter is implemented. Workflow quota policies, queue bounds, pagination limits, tool/Python/artifact caps, HTTP timeouts, and Starliner outbox capacity provide capability-specific controls.

The workflow engine permits or denies network/web-fetch/Python capabilities based on runtime configuration, but no OS/container sandbox implementation is present in this subtree. `Unresolved:` execution isolation may belong to the external LLM/gateway or deployment.

## Security control gaps and status

| Observation | Classification |
| --- | --- |
| Committed/default credential material | `Verified potential issue` |
| Unsalted SHA-256 password hashes | `Verified potential issue` |
| OAuth tokens stored plaintext despite encrypted names | `Verified potential issue` |
| Static upstream secrets encrypted, with fallback key | `Verified partial control` |
| Default permissive credentialed CORS | `Verified potential issue` |
| No general rate limiter | `Verified absence in scope` |
| App-level tenant checks, limited DB constraints | `Potential issue requiring route-by-route validation` |
| Diagnostic token/environment detail | `Verified potential issue` |
| Memory/log content outside universal DLP | `Verified limitation` |
| Admin-configured outbound URLs | `Potential issue requiring egress/threat-model validation` |
| Private Starliner behavior unavailable | `Unresolved` |
