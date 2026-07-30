# Ingest, Trust, and Evidence

Status: **normative**

## Responsibility

Regional ingest authenticates the producer, validates the protocol, durably accepts source records, and writes the immutable observation ledger. It does not assign canonical enterprise identity or perform product-facing analytics.

## Request path

```text
edge or managed connector
  -> regional load balancer
  -> workload authentication
  -> tenant/environment/region route
  -> capability and schema admission
  -> replay/integrity check
  -> durable append
  -> authenticated acknowledgement
  -> asynchronous normalization
```

## Trust checks

Ingest MUST verify:

- workload identity and credential freshness;
- tenant, environment, region, producer, and profile bindings;
- signed capability manifest and admitted version;
- record family and schema version;
- producer sequence epoch and replay window;
- record and batch integrity;
- declared privacy and content class;
- payload, batch, and rate budgets;
- lifecycle and reconciliation validity;
- whether the runtime version is certified or revoked.

Authentication answers who produced the record. It does not prove every producer claim is true.

## Durable acceptance

An acknowledgement is issued only after the exact record or batch is committed to the authoritative regional evidence store and its idempotency entry is durable. Queue admission, transient replication, or downstream processing does not count.

The acceptance receipt contains:

- receipt ID;
- tenant and regional cell;
- producer, epoch, and sequence interval;
- accepted record IDs or range digest;
- ingest time;
- schema/profile decision;
- evidence locator;
- receipt signature or authenticated channel binding.

## Rejection classes

| Class | Retry? | Example |
|---|---|---|
| Authentication | After credential repair | expired workload credential |
| Authorization | No until configuration changes | wrong tenant or profile |
| Protocol | No for that payload | unsupported schema version |
| Integrity | No; investigate | same record ID, different digest |
| Privacy | No; quarantine and alert | secret-like prohibited content |
| Capacity | Yes with backoff | tenant rate or regional pressure |
| Dependency | Yes | durable store temporarily unavailable |

Permanent rejection never masquerades as acceptance.

## Observation ledger

The immutable ledger preserves:

- accepted source record;
- original safe source identifiers;
- producer identity and certification;
- event, observation, ingest, and correction time;
- record lifecycle operation;
- integrity and acceptance receipt;
- privacy classification;
- normalized-record references when produced;
- quarantine and supersession state;
- retention class and legal-hold state.

Source corrections append new records and supersession links. They do not rewrite accepted history.

## Quarantine

Quarantined records are isolated by tenant and region. Reasons include unknown schema, integrity mismatch, privacy violation, impossible lifecycle transition, or revoked producer. Quarantine supports:

- safe metadata inspection;
- controlled repair and reprocessing;
- time-bounded retention;
- audited operator access;
- customer-visible coverage impact;
- bulk isolation by producer version or schema.

## Availability behavior

If the authoritative ledger cannot meet its durability contract, ingest fails closed for acceptance. Edge runtimes retain admitted records. Ingest does not return success in exchange for possible data loss.

## Scaling model

- Tenant and producer routing keys preserve ordered processing where required.
- Global ordering is neither promised nor required.
- Reconciliation streams preserve source-scope ordering.
- Work is partitioned by tenant cell and source profile.
- Backpressure is explicit to the edge.
- Hot tenants have per-tenant isolation and quotas.
- Poison records are quarantined without blocking unrelated partitions.

## Audit

All changes to schema admission, producer certification, routing, quarantine release, and retention are auditable administrative actions. Support staff cannot read evidence solely because they operate the service.

## Service objectives

Concrete SLOs are recorded in the SLO register after load and customer commitments are known. At minimum, measurements include ingest availability, acceptance latency, durable loss, duplicate acceptance, rejection accuracy, regional failover, and backlog recovery.
