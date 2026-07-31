# Security, Privacy, and Retention

The field/record privacy ledger is
[`privacy-disposition.csv`](../../../matrices/sensor-intelligence/quilr1-platform/privacy-disposition.csv).
It covers 22 major data classes. This section focuses on migration/product
requirements; the exhaustive current security-control review remains in the
first-pass [security model](../../../quilr-platform-analysis/12-security-model.md).

## Trust boundaries

```text
browser/client
→ web/BFF/ingress
→ decoder/request context/PDP
→ query-builder
→ stores/external services

legacy stores
→ independently authenticated adapter
→ privacy/schema gate
→ Starliner WAL/delivery
→ tenant-cell ingest/evidence
```

The migration adapter does not reuse browser cookies, client permission state
or shared ClickHouse ops code as its identity.

## Privacy classes

| Class | Quilr examples | Target default |
| --- | --- | --- |
| structural | status, capability, count, schema version | export |
| enterprise identifier | tenant/app/device/model/tool ID | export under tenant/source scope |
| personal identifier | user ID/email/IP | minimize/tokenize by purpose |
| sensitive metadata | URL/path/process args/provider endpoint/audit diff | redact/tokenize/protect |
| restricted content | prompt/response/document/tool args/results | separate content grant/store |
| secret | bearer, cookie, refresh token, API key, password/key | prohibit from normal telemetry |

## Content and masking

Current conversation paths use AES-GCM `v2:` ciphertext and legacy AES/ECB
decrypt. Target migration preserves format/key reference/decrypt outcome under
protected access, never the key. Prompt/response/tool/file content is not
placed in ordinary Starliner records, logs or product APIs.

## Tenant isolation

Current code frequently binds tenant/subscriber in SQL/cache keys, but fallback
request headers exist. Target ingest:

- authenticates adapter workload/source installation;
- independently resolves tenant routing;
- retains claimed and admitted tenant separately;
- rejects mismatch;
- partitions evidence/checkpoints/outbox/query by admitted tenant;
- tests cross-tenant identifiers, caches and batch mixtures.

## Current controls relevant to migration

- decoder authentication and revocation/tenant checks on configured paths;
- seven method-permission operations;
- AES-GCM current masking;
- PostHog credential-like property filtering;
- named SQL parameters on many queries;
- response headers/CORS;
- request MDC cleanup.

Limitations include client-readable auth cookies, incomplete method-policy
coverage, broad operator endpoints, raw SQL/error logging, nonuniform
validation and external deployment dependencies. These are current-platform
facts, not reasons to weaken the target adapter.

## Adapter security

- read-only least-privilege store credentials;
- explicit table/query allowlists;
- short-lived workload identity;
- no arbitrary SQL/command input;
- field privacy before WAL;
- encrypted WAL/quarantine/checkpoints;
- authenticated acknowledgements;
- bounded memory/pages;
- secrets from managed references;
- diagnostic export performs second privacy pass;
- signed/profile-pinned mapping release.

## Retention

Current repository evidence does not define live ClickHouse/Neo4j/log/Kafka
retention. Redis interaction cache is three minutes; other cache/marker TTLs
vary, and app-admin marker has no TTL. Browser/session lifetime is
writer/path-specific.

Target retention is separate by:

- immutable metadata/observation;
- protected content;
- audit/workflow;
- raw imported evidence;
- quarantine;
- local WAL acknowledged tail;
- checkpoints/mapping/parity evidence;
- customer deletion/legal hold.

No numeric production retention is invented here.

## Deletion

Source deletion, evidence retention, canonical retirement, privacy deletion
and projection removal are distinct. A cache miss or absent partial snapshot
is never a deletion. Protected content deletion can retain a minimal tombstone
and integrity/audit metadata when policy permits.

## Security validation required

- tenant mismatch and cross-tenant lookup/batch tests;
- secret/content leakage corpus;
- SQL/table allowlist tests;
- malformed JDBC/JSON/Unicode/canonicalization;
- WAL permission/encryption/corruption recovery;
- credential rotation/expiry;
- audit/effect authorization;
- compatibility API data filtering;
- privileged evidence/unmask audit;
- live deployment network/identity/secrets review.

## Unresolved

- production secrets/identity/ingress/PDP configuration;
- live data/log/broker retention;
- privacy policy and regional/legal requirements;
- KMS/key rotation and legacy decrypt authorization;
- deployed grants/row policies/network controls;
- external source content/credential contracts.
