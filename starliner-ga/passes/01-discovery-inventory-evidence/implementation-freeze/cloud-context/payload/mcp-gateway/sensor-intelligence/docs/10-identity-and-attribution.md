# Identity and attribution

## Human identity

Current observe output contains only a tenant-scoped keyed pseudonym:

```text
HMAC-SHA256(
  key = STARLINER_ACTOR_HASH_KEY,
  message = tenant_id + NUL + lower(trim(user_email))
)[:32]
→ "actor:<hex>"
```

This is stable only while the key, tenant identifier, and normalized email stay
stable. It is not cryptographically verifiable by a consumer without the key,
and there is no key-version field.

The gateway itself has richer identity sources: internal/external JWT claims,
API-token lookup, `mcpuser`, OAuth/proxy token state, workflow delegation
claims, platform IdP routes, users, companies, and logs. None are currently
normalized into Starliner identity observations.

## Identifier matrix

| Entity type | Identifier | Namespace | Source | Stability | Uniqueness | Reassignable? | Cryptographically verified? | Recommended use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant | `tenant_id` | gateway/platform tenant | claims/repositories | expected stable; production authority unresolved | expected tenant-global | unresolved | depends on auth branch | tenant scope; require authoritative resolver |
| Human actor | `actor:<HMAC32>` | sensor + tenant + key epoch (epoch not encoded) | mapper | stable while key/email/tenant stable | probabilistically unique in scope | email/tenant/key changes remap | keyed derivation, not signed assertion | privacy-preserving correlation; secondary identity |
| Human/account | email/username | email/IdP | claims/DB/logs | mutable | not globally unique across time | yes | branch-dependent | adapter identity candidate; never raw current evidence unless policy permits |
| Backend | source backend ID | gateway backend repository | registry/DB | intended stable for row lifetime | tenant-scoped in practice | deletion/recreation possible | no | strong source identity with tenant and sensor namespace |
| Backend | `mcp_backend:<tenant>:<backend>` | local mapper composite | current record | deterministic from normalized parts | intended unique | follows source parts | no | `Contradiction`: do not use as central canonical authority |
| Tool | backend ID + tool name | gateway source composite | capabilities/call | stable while upstream name stable | backend-scoped | rename/replacement possible | no | strong source identity candidate |
| Tool | `mcp_tool:<tenant>:<backend>:<tool>` | local mapper composite | current record | deterministic | intended unique | follows parts | no | source candidate only, not canonical authority |
| JSON-RPC request | client `id` | client session | request | reusable | not globally unique | yes/reused | no | response correlation only; unusable as evidence identity alone |
| Observe dispatch | UUID hex | gateway process | handler | immutable per normal dispatch | random global | no | no | primary source for derived evidence correlation |
| Derived request/flow/span | prefix + SHA-256 first 24 | tenant + dispatch | mapper | deterministic | probabilistic | no | content-derived, not signed | current event correlation |
| Source observation | `stable_id("observation", ...)` | mapper | lifecycle-specific | deterministic | probabilistic | changes with components | no | record/source observation identity |
| Signal | `stable_id("signal", ...)` | mapper | blocked call | deterministic | probabilistic | no | no | signal dedupe/grouping input |
| Idempotency | `stable_id("idem", ...)` | tenant + sensor + record semantics | mapper | deterministic | scoped by outbox unique key | no | no | delivery replay identity |
| Body/record hash | `sha256:<64>` | contract | canonical JSON | content-addressed | cryptographic collision resistance | no | digest verified locally | integrity/dedupe evidence |
| Outbox row | integer | one SQLite file | local DB | row lifetime | DB-local | not reused ordinarily | no | operator/internal only |
| Remote evidence | `evidence_id` | central ingest | response | external | unresolved | unresolved | no local signature check | terminal delivery correlation |
| Runtime instance | config string | deployment | environment | operator-defined | not enforced | yes | no | source instance provenance; must be deployment-unique |
| Workflow run/artifact | repository IDs/hash | gateway/runner | separate DB/files | row/artifact lifetime | repository-scoped | generally no | artifact SHA-256 for bytes | adapter candidates; not current observe |
| API/OAuth token | token/row ID | auth subsystem | header/DB | rotates/expires | issuer scope | yes | verification varies | credential metadata only; value discarded |

Classification:

- strong deterministic source identity: tenant + backend ID; backend + tool
  name;
- secondary identity: actor HMAC and email/claim links;
- runtime-scoped: JSON-RPC request ID, outbox integer;
- content-addressed: body hash, record hash, artifact SHA-256;
- mutable alias/display-only: backend/tool display names, email;
- unusable for identity alone: request method, transport URL without tenant,
  user-agent keyword.

## Attribution chain

| Activity type | Human | Account | Agent | Workload | Process | Credential | Approval | Sensor | Completeness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Direct observed tool call | HMAC pseudonym when email exists | not explicit | absent | absent | gateway only through sensor type | auth mode/credential ID absent | confirmation/legacy decision absent | sensor ID/version and runtime envelope | partial |
| Native DLP block | same | absent | absent | absent | gateway | absent | DLP outcome only | sensor ID/version | partial |
| Legacy policy deny | current action later shows blocked/pre-upstream | absent | absent | absent | gateway + external decision plane implied | absent | decision ID/reason not mapped | sensor ID/version | partial |
| Backend registration observation | absent | owner/user not mapped | absent | absent | gateway sensor | absent | registering admin absent | sensor ID | low |
| Workflow execution | rich gateway/runner state exists | delegated user fields exist | workflow agent exists | worker ID exists | runner process | delegation token exists | version/publish/readiness controls exist | not currently observed | available only through new mapping |

## Attribution-chain coverage

| Link | Current observe evidence |
| --- | --- |
| `initiated_by` | actor HMAC for Direct call, without explicit relationship name |
| `requested_by` | same partial actor evidence |
| `delegated_by` | absent |
| `planned_by` | absent |
| `approved_by` | absent; confirmation result not mapped |
| `executed_by` | gateway sensor is known; upstream executor identity absent |
| `runs_as` | absent |
| `authenticated_as` | absent; auth mode/account/credential not mapped |
| `effective_principal` | partial actor HMAC only |
| `credential_used` | absent by design |
| `observed_by` | sensor ID/type/version/runtime instance |
| `decided_by` | absent in observe path; legacy external decision details dropped |
| `enforced_by` | native DLP implied by reason code; explicit component identity absent |
| `deployed_by`, `built_by`, `signed_by` | absent |

## Identity trust and privacy issues

1. `Potential issue:` there is no pseudonym key ID/epoch. Central consumers
   cannot distinguish a real new actor from a key rotation.
2. `Potential issue:` tenant fallback `"unknown"` can merge unrelated missing-
   tenant activities into one pseudonym/idempotency namespace.
3. `Potential issue:` the legacy adapter passes raw user email to an external
   SDK builder, unlike the observe mapper.
4. `Unresolved:` which auth branches are permitted to supply `user_email` and
   `tenant_id` in production and whether their issuer/claim verification is
   equivalent.
5. `Requires an external authoritative source:` durable human/account
   canonical identity and lifecycle should be reconciled with the IdP/platform,
   not inferred solely from email.

## Target identity disposition

| Identity datum | Product disposition | Availability |
| --- | --- | --- |
| sensor/runtime identity | `Coverage and health`, `Evidence drill-down` | `Available now without sensor changes` |
| actor pseudonym | `Activity explorer`, `Evidence drill-down` | `Available now without sensor changes` |
| human/account canonical identity | `Inventory list`, `Entity detail`, `Relationship view` | `Requires an external authoritative source` |
| backend/tool source IDs | `Inventory list`, `Entity detail`, `Activity explorer` | `Available now without sensor changes` |
| auth mode/credential metadata | `Activity explorer`, `Configuration`, `Evidence drill-down` | `Available through adapter mapping only` |
| secret/token values | `Discard with reason` | never platform identity |
| agent/workload/delegation identity | `Activity explorer`, `Relationship view` | `Requires minor sensor instrumentation` for Direct MCP; adapter mapping for workflows |
| pseudonym key epoch | `Coverage and health`, `Internal implementation only` | `Requires minor sensor instrumentation` |

