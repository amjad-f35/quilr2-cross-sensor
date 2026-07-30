# Security, Privacy, Tenancy, and Access

Status: **normative pass security boundary**

## Trust boundaries

1. page/untrusted browser context → extension isolated/background context;
2. extension → native host;
3. endpoint components → supervised local runtime;
4. gateway process → sidecar/embedded runtime;
5. sensor/connector → regional ingest;
6. global metadata control → tenant cell;
7. evidence/canonical authorities → query projections;
8. product user/support actor → API/evidence;
9. Quilr 1 → migration worker;
10. CI/release/signing → deployed artifact.

Each boundary requires explicit authentication, authorization, input bounds, audit, failure posture, and secret handling.

## Producer identity

Every producer is bound to:

- tenant/environment;
- installation/workload;
- source profile and capability;
- artifact digest/version;
- certification;
- region/cell;
- credential lifecycle;
- revocation state.

Static shared bearer credentials are not an acceptable GA identity. The production profile must select and certify mTLS/SVID, cloud workload identity, or short-lived asymmetric credentials with rotation and revocation.

## Human identity and authorization

- OIDC-based customer identity;
- tenant is derived from trusted authorization context;
- roles plus entity/business scope and field sensitivity;
- evidence access is separately permissioned and purpose-bound;
- operator/support access is JIT, approved, time-bounded, tenant-specific, audited, and revocable;
- identity correction and migration operations require elevated permission and preview;
- exports require explicit authorization and immutable scope;
- cross-tenant operator workflows are isolated from customer APIs.

Quilr 1 SSO may be reused through an approved identity-broker/compatibility path during migration, but new APIs enforce Quilr 2 tenant/field authorization.

## Privacy

- metadata-first collection;
- local filtering before WAL;
- prohibited secret canaries at edge and ingest;
- no restricted-content product path;
- user/device pseudonymization where approved;
- normalized origins/endpoints/paths;
- safe structural counts rather than payload bytes;
- capture state for omitted/unsupported/prohibited values;
- privacy configuration version in evidence;
- field-level display/export controls;
- no raw customer evidence in global control plane or ordinary logs.

## Tenant isolation

Tests cover:

- database predicates/RLS strategy;
- object-store prefixes and keys;
- ClickHouse partition/filter enforcement;
- worker partitions and leases;
- cache absence or tenant keys;
- API authorization;
- search/count/empty-state leakage;
- exports;
- logs, metrics and traces;
- replay/rebuild/migration jobs;
- support access;
- backups and restores;
- error messages and timing.

Tenant ID supplied in a record or URL never overrides authenticated routing.

## Encryption and keys

- TLS for network paths;
- authenticated local IPC appropriate to platform;
- encryption at rest for PostgreSQL, object storage, ClickHouse, backups and exports;
- KMS/HSM-backed production keys;
- separate signing, workload, storage and export key purposes;
- rotation/revocation and disaster recovery;
- no private key in source, image, package, log, diagnostic or support bundle;
- provenance-bound release signatures.

Exact issuers/providers/lifetimes are registered inputs.

## Security blockers

The following block affected source certification:

- endpoint private signing/CA material without approved incident disposition;
- unauthenticated or world-writable endpoint IPC;
- browser correlation allowing response confusion;
- MCP committed/default credentials or plaintext token handling;
- optional authentication that can remain disabled in production;
- unresolved cross-tenant derivation;
- raw secret/content leakage;
- evidence acknowledgement before durability;
- artifacts without provenance/SBOM/signature;
- source-created canonical IDs that can target another entity.

## Audit

Audit includes:

- authentication and denied access;
- producer enrollment/revocation;
- evidence admission/quarantine;
- evidence access/export;
- identity correction/merge/split;
- migration extraction/parity/cutover/rollback;
- configuration/release changes;
- support elevation;
- backup/restore;
- retention/deletion.

Audit records are immutable, tenant scoped, bounded, privacy safe, time synchronized, searchable, exportable under authorization, and retained under a separate policy.

## Threat and abuse testing

- spoofed producer/tenant/profile;
- replay/conflicting duplicate;
- sequence reset;
- malicious oversized/high-cardinality record;
- path/content/header secret leakage;
- cross-tenant ID/filter/export;
- compromised sensor credential;
- forged artifact/capability;
- local IPC impersonation;
- browser message confusion;
- SQL/object/ClickHouse injection;
- migration source poisoning;
- identity merge manipulation;
- denial of service/noisy tenant;
- support/operator abuse;
- backup/export theft;
- supply-chain compromise.
