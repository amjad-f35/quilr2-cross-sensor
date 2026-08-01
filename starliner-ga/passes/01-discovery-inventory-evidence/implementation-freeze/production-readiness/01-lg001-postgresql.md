# LG-001 — PostgreSQL Production Conformance

## Final delta authorities

LG-001 includes concurrent execution of the 25 temporal precedence cases,
manifest signer rotation/single-active/audit behavior, and OIDC/BFF session
state under RLS. Local PostgreSQL 17.10 smoke executes the tables, triggers,
grants, terminal-session and cross-tenant negatives; retained multi-session,
crash/failover evidence remains the release exit defined by LG001-T015..017.

## Frozen runtime design

PostgreSQL 17 is the mutation authority for tenant/control identity, admission
metadata, source observations, canonical versions and heads, relationships,
coverage, evidence lifecycle, work/fences, authorization, audit, projection
generation and the transactional pointer outbox.

The version policy is PostgreSQL major 17 plus the current supported minor. The
initial exact target is 17.10. Patch upgrades require the same suite.

Runtime roles are separate logins with `NOBYPASSRLS`, no schema-wide writer
grant and one effective workload role. Every tenant table has forced RLS.
Workers use short transactions, row/advisory locks in frozen order, bounded
leases and same-transaction terminal-work/execution coupling.

## Harness topology

- three-node PostgreSQL-compatible test topology for failover cases;
- a single-primary exact-engine topology for deterministic contention cases;
- at least three tenants across two cells;
- independent API, ingest, normalizer, truth, projector, maintenance, control
  and authorization logins;
- parent and default/future partitions;
- deterministic fixture seed plus concurrent operation scheduler;
- connection termination, process kill, network interruption and promotion
  fault controls;
- statement, lock, deadlock, WAL, checkpoint and query telemetry retained.

An alternative managed provider is acceptable only if it exposes equivalent
PostgreSQL 17 semantics and passes the same SQL/role/failover assertions.

## Required proof families

### Migration and catalog

- empty-database apply and supported previous-version upgrade;
- transactionality or documented non-transactional migration stop/recovery;
- extension, constraint, trigger, policy, grant, owner and default-privilege
  snapshots;
- parent and every partition inherit the intended RLS posture;
- prohibited PUBLIC, owner and `BYPASSRLS` paths are absent.

### Tenant and authorization isolation

- guessed tenant GUC, stale cell binding, revoked principal and wrong workload
  role fail closed;
- transitive role membership cannot create a second workload role;
- count/search/export and object-redemption preparation cannot observe another
  tenant;
- prepared statements and pooled connections do not retain prior tenant or
  authorization revision;
- cell move revokes old bindings before new bindings become usable.

### Concurrency and state machines

- canonical head/version, expected population, coverage and authorization
  revisions serialize without lost update or dual current state;
- lease claim/renew/expiry, stolen token, final recovery and quarantine are
  exhaustive;
- stage-role checks reject cross-stage work under valid tenant context;
- outbox pointer and canonical/evidence state commit together;
- audit shard sequence/hash remains gapless under concurrent append;
- projection activation, standby rollback and export snapshot binding remain
  linearizable.

### Failure and recovery

- lost response after commit is safely replayed;
- connection loss before/after commit never causes divergent idempotency;
- primary crash during each critical transaction has one observable outcome;
- failover preserves constraints, RLS, leases, outbox and audit chain;
- restore to a clean environment passes integrity and negative isolation scans.

### Performance

Measure p50/p95/p99 and lock waits at the reference small, medium and large
tenant profiles. Required queries must use bounded plans and declared indexes;
no full-tenant scan may enter a latency SLO silently. Limits are configured
capacity profiles, not hard-coded semantic changes.

## Closure

`LG-001` closes only after every `LG001-*` required row in the catalog passes on
the digest-pinned candidate, zero P0/P1 PostgreSQL defect remains, failover and
restore evidence exist, and the role/catalog snapshot is independently
reviewed.

The existing PostgreSQL 17.10 local run is `PASS_LOCAL_SMOKE`: it proves the
baseline executes, but not contention, failover or full partition isolation.
