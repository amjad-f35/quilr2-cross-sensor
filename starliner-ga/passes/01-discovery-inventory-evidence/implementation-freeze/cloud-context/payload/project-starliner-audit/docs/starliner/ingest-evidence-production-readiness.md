# Ingest and Evidence Production Readiness

Status: production-shaped and preprod-deployable; not production-ready or
deployed.

## Supported deployment modes

### Quilr SaaS

- Quilr-operated ingest, registry provider, asymmetric service JWT issuer, and
  Postgres.
- HTTPS JWKS with bounded caching and key rotation.
- Separate migration and least-privilege application roles.
- Quilr-owned backup/PITR, retention, monitoring, and incident response.

### Customer cloud

- Customer network and customer-managed Postgres are supported.
- Authentication may use the customer's HTTPS JWKS or a rotated static public
  key.
- Registry/certification lookup can use a strict file snapshot or an injected
  provider; neither requires a Quilr SaaS call on the request path.
- Migrations can run through the customer's deployment pipeline before the
  application role starts.

### On-premises and air-gapped

- No mandatory Quilr SaaS dependency.
- A static asymmetric public key and customer-managed Postgres provide the
  offline path.
- Migration SQL is packaged in the wheel and can be reviewed/applied offline.
- Registry policy can be supplied by a strict local file snapshot or an
  injected on-prem provider.
- Evidence replay/export is tenant-scoped JSONL and can feed customer-owned
  backup or audit systems.

No mode permits noop authentication, SQLite, symmetric JWT verification, or an
in-memory registry in preprod/prod. `starliner-ingest serve` can construct a
Postgres/service-JWT/file-registry preprod app from environment configuration.
Production can replace the file snapshot with an injected control-plane
provider through `create_configured_app`.

The first preprod provider is `FileSensorRegistry`. It loads a bounded,
schema-versioned snapshot once at startup, rejects malformed or duplicate
registrations, and binds each tenant/sensor to an auth subject plus exact
runtime, certification, contract, adapter, and record-type policy. Operators
must restart after an approved file change.

## Database roles and migration

1. A migration role runs `starliner-ingest migrate` against versioned packaged
   SQL.
2. The runtime role starts with `STARLINER_APPLY_MIGRATIONS=false` and verifies
   that every packaged version exists in `schema_migrations`.
3. The runtime role receives only required insert/select privileges.
4. `accepted_evidence` rejects updates and deletes through a database trigger.
5. Accepted evidence and its durable downstream outbox handoff are committed in
   one transaction.

Rollback does not delete accepted evidence. Application rollback uses a prior
compatible binary; schema rollback requires a separately reviewed forward-fix
migration.

## Backup, restore, and replay validation

Before release approval:

1. Create a database backup under the approved platform process.
2. Restore it into an isolated environment.
3. Run `starliner-ingest healthcheck`.
4. Compare accepted/rejected/certification/outbox counts using safe operational
   queries.
5. Replay representative tenant evidence ordered by
   `(received_at, evidence_id)`.
6. Verify cursor continuation has no gaps or duplicates.
7. Verify append-only triggers and idempotency constraints remain active.
8. Record elapsed restore time and maximum observed data loss against approved
   RTO/RPO.

## Availability and scaling shape

- Stateless API replicas can share Postgres.
- Idempotency correctness is enforced by the database unique constraint, not
  process-local state.
- JWKS caches are replica-local and bounded; key miss causes provider refresh.
- Registry provider availability participates in readiness. File snapshots are
  immutable per process; managed dynamic registry rollout remains production
  work.
- Request, record, and batch sizes are bounded before durable admission.
- Metrics exclude payloads and tenant IDs from default labels.
- `outbox_events` supplies a durable recovery scan; downstream runners and
  materializers are bucket 7 work.

## Security and privacy controls

- Raw prompts, responses, MCP arguments/results, headers, cookies, bearer
  tokens, OAuth material, API keys, and secret-like values are rejected before
  accepted persistence.
- Rejected evidence stores safe identifiers/hashes/error labels only, never the
  rejected JSON body.
- JWTs, decoded claim sets, key material, DSNs, and library exception strings
  are not returned or logged by the ingest boundary.
- Authenticated tenant/sensor claims are checked against the delivery envelope
  and registry policy.

## NEEDS_INPUT

The file-registry path is sufficient for the selected single-node preprod
proof. The service must not be called production-ready until owners approve:

- public ingest URL and network/TLS ownership;
- service JWT issuer, audience, HTTPS JWKS or static public-key rotation;
- gateway credential issuance/revocation and tenant mapping;
- managed production sensor registry/certification source and availability SLO;
- Postgres DSN delivery, pool sizing, migration role, and runtime grants;
- HA topology and capacity/load-test target;
- RPO and RTO;
- evidence and rejected-metadata retention/deletion policy;
- data residency requirements;
- backup/PITR owner and restore-test cadence;
- KMS/secret-manager owner and key-rotation cadence;
- monitoring, paging, incident, and rollback owners.

