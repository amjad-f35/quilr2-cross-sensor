# Security, privacy, and retention

## Data classes

| Class | Examples | Current observe disposition |
| --- | --- | --- |
| source identity | tenant, backend/tool, sensor/runtime | retained after normalization |
| human identity | email | keyed pseudonym only |
| content | arguments/results/resources/prompts | not supplied to mapper |
| classifier metadata | prediction IDs/names/labels | bounded safe labels only |
| control outcome | DLP outcome/block/upstream/error | retained |
| credential/auth | headers, bearer/API/OAuth/static tokens | prohibited |
| operational | latency, status, counters, queue health | retained or route-only |
| evidence integrity | idempotency/body/record/evidence IDs | retained |
| free-form errors | exception/message/remote body | class/safe code only in observe path |

## Authentication and trust

Starliner ingest uses a static bearer token when configured. An unauthenticated
override is allowed only for explicit loopback targets. URL parsing rejects
non-HTTP(S), missing host, and embedded credentials; bearer whitespace is
rejected.

`Potential issue:` no certificate pinning, mTLS, workload identity, request
signature, signed receipt, or key rotation mechanism appears in source.

The public manifest route requires no auth. It intentionally excludes secret
values but reveals enabled state, sensor/runtime IDs, versions, delivery
configuration/authentication booleans, capability modes, metrics, and health.
Production exposure intent is `Unresolved`.

Metrics/self-test require `get_current_admin`.

## Tenant isolation

Current records and idempotency include tenant. SQLite tables share one DB file
and repository operations are not exposed as tenant-query APIs. Operational
metrics/health aggregate the instance.

`Potential issue:` missing tenant becomes literal `"unknown"`, creating a shared
namespace across otherwise unrelated requests. The mapper should reject or
quarantine missing-tenant production evidence rather than merge it.

Central ingest authorization and tenant-routing behavior are `Unresolved`.

## Payload minimization

Verified protections:

- mapper signature excludes raw arguments/results/headers;
- user email HMAC;
- token-shaped source identifiers opacity-hashed;
- labels regex/length/secret-screened;
- safe summary strict contract;
- body and summary payload-safety validation;
- strict outer delivery fields;
- safe error/evidence ID regexes;
- terminal payload deletion.

Limitations:

- canonical body models allow additive fields at pinned ABI;
- tool/backend ordinary identifiers may still be sensitive business metadata;
- legacy policy path passes raw email externally;
- richer SQLite logs contain raw/sensitive fields;
- debug paths can print arguments/prediction entities;
- confirmation echoes arguments before native DLP;
- full safe wrapper remains plaintext in SQLite until terminal.

## Secret handling

Never include:

- authorization/request/response headers;
- bearer/API/OAuth/static-auth values;
- client secrets, PKCE verifiers, states/codes;
- DLP sensitive entity values;
- raw arguments/results/content;
- database encryption/passphrase material.

Only credential metadata—type, scope, issuer/provider, status, created/expiry,
fingerprint where approved—may be mapped.

`Contradiction:` OAuth columns named `*_encrypted` are handled as plaintext by
current repositories. Static upstream auth does use Fernet. Documentation/UI
must not generalize one behavior to the other.

## Retention

| Store | Current retention behavior | Gap |
| --- | --- | --- |
| active Starliner outbox | until terminal; bounded row count | no age limit or disk-byte cap |
| terminal delivery | indefinite metadata in scope | no cleanup |
| tool logs | no general retention worker found | sensitive content exposure |
| event/rejection logs | no general retention worker found | identity/free-form data |
| core gateway state | entity-specific delete/status behavior | backup/recovery policy absent |
| runner DB/artifacts | explicit retention worker/batch deletion | deployment not scoped |
| ClickHouse | external | TTL/replication/backup unresolved |
| process counters/state | process lifetime | lost at restart |

## Access and product privacy

- default inventory/overview excludes content;
- activity shows safe labels and outcome, not raw arguments/results;
- evidence drill-down requires explicit evidence authorization;
- operator health can expose instance IDs and queue metrics, not tenant content;
- raw SQLite log extraction requires separate least-privilege adapter and
  protected retention/access logging;
- subject deletion/key rotation effects on pseudonyms and retained evidence are
  unresolved.

## Security boundaries and concerns

| Concern | Evidence-based status |
| --- | --- |
| observation affects client response | isolated/fail-open by design |
| control affects upstream | native and legacy enforce paths do |
| queue capacity loss | recorded only in process counter/log |
| CORS | default regex `.*` with credentials enabled; production override unresolved |
| committed/default credential material | first-pass source found insecure defaults/embedded client material |
| horizontal isolation | process-local sessions/locks/queues; unsupported claim unresolved |
| SQLite encryption at rest | none in source |
| output encoding | FastAPI/JSON/Pydantic; content-specific UI safety outside this pass |
| command execution | workflow runner executes constrained tasks/Python; not current observe path |
| deserialization | JSON/Pydantic/SQLite payload parsing; validation exists at outbox boundary |

These are `Potential issue` items requiring deployment/runtime validation, not
unqualified vulnerability claims.

## Required privacy additions

- versioned privacy profile and per-field disposition;
- pseudonym key ID/epoch and rotation reconciliation;
- missing-tenant quarantine;
- explicit raw evidence reference policy or explicit absence;
- encrypted local outbox or documented disk encryption requirement;
- retention/cleanup for terminal/log data;
- structured safe error codes across all adapter sources;
- privacy leakage certification with adversarial fixtures;
- admin/public route exposure policy;
- central evidence access audit and subject-deletion workflow.

