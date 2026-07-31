# LG-003 — Evidence Object-Store Conformance

## Frozen provider port

`EvidenceObjectStoreV1` is the only platform dependency on provider behavior.
It requires:

- conditional create;
- opaque immutable version token;
- strong read-after-successful-create for the tested key;
- returned byte length and SHA-256 verification;
- tenant/evidence encryption context;
- retention and legal-hold inspection/mutation;
- exact-version delete;
- ranged streaming;
- auditable enumeration;
- no autonomous lifecycle deletion on the evidence prefix.

AWS S3 Versioning plus Object Lock is the reference profile. Another provider
must pass the same semantic suite; an S3-shaped API alone is insufficient.

## Write protocol

1. derive the tenant/evidence-scoped key;
2. conditionally create immutable bytes with encryption context;
3. verify provider version, length and digest;
4. commit PostgreSQL evidence metadata and admission receipt;
5. acknowledge the producer only after durable acceptance;
6. detect unreferenced successful puts through delayed orphan reconciliation.

Objects are never overwritten, reused by a second evidence identity or exposed
through raw provider URLs.

## Required proof families

- first conditional put succeeds;
- retry of identical bytes converges; different bytes at the same key fail;
- database failure after put produces a detectable, safely quarantined orphan;
- temporary read/list/head outage never converts accepted evidence to absent;
- provider-side versioning and encryption context match metadata;
- governance/compliance retention mode behavior is explicitly selected;
- legal hold before erasure execution wins; after execution linearization it
  receives the frozen too-late result;
- exact-version deletion cannot delete a later/unrelated version;
- partial provider failures retry idempotently with bounded backpressure;
- no lifecycle rule can expire evidence without a database-authorized plan;
- backup inventory, restore and integrity scan reproduce provider versions and
  digests;
- audit/API evidence access uses platform authorization and short-lived
  mediated streaming, not object-store credentials or URLs.

## Closure

The first production provider, account controls, region, retention mode,
encryption key model and credential boundary must be bound before this gate can
close. Every `LG003-*` required row passes in a non-production account with the
same provider features. Provider evidence includes configuration exports,
version tokens, audit events and both legal-hold race orders.
