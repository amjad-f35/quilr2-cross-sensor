# Test, Certification, and Quality Strategy

Status: **normative**

## Principle

Tests prove production capabilities; they are not the product. Quality gates cover semantics, security, privacy, durability, correctness, scale, operations, and customer usability.

## Test layers

| Layer | Required proof |
|---|---|
| Contract | schema/API/profile compatibility and unknown-field behavior |
| Unit/property | deterministic rules, lifecycle, time, idempotency, invariants |
| Component | storage, retries, authorization, privacy, error handling |
| Integration | real supported dependencies and protocols |
| Conformance | sensor/runtime/profile certification |
| End-to-end | multi-sensor customer outcomes |
| Migration | Quilr 1 parity, dual-read, cutover, rollback |
| Performance | certified load, noisy neighbor, backlog, replay |
| Resilience | dependency failure, partition, corruption, failover |
| Security/privacy | hostile inputs, tenant isolation, leakage, control abuse |
| UX/accessibility | comprehension, workflow completion, accessibility |
| Production verification | canary, SLO, data-quality and outcome monitoring |

## Golden scenarios

The minimum cross-sensor golden set includes:

1. Browser, endpoint, and gateway observations resolve to one AI application with distinct surfaces.
2. Three production agent deployments begin using a newly discovered unapproved model and produce one explainable finding.
3. MCP tool names collide across servers and remain distinct until supported resolution.
4. A source correction restates identity, activity, finding, and metrics without rewriting evidence.
5. A source snapshot misses a page; absence is not inferred.
6. A canonical false merge is split with reversible downstream rematerialization.
7. Coverage drops and suppresses unsupported auto-resolution.
8. A policy command succeeds locally but independent effect is not observed.
9. A restricted-content attempt is quarantined before general analytics.
10. Quilr 1 and Quilr 2 dual-read parity detects a semantic difference despite equal counts.
11. A noisy tenant cannot degrade another tenant’s ingest or query SLO.
12. A tenant-cell restore accepts edge replay without duplication.

## Environments

Environments use production-equivalent contracts and infrastructure classes. Test tenants are isolated from production customer data. Synthetic fixtures are supplemented by privacy-approved representative datasets and controlled customer pilots; neither alone is sufficient.

## Data correctness

Tests cover:

- bitemporal and late-arrival behavior;
- duplicate/reordered/replayed events;
- merge/split/correction/deletion;
- field authority and conflicts;
- metric denominators and coverage;
- price/timezone changes;
- projection rebuild and parity;
- retention and legal hold;
- schema and code mixed-version operation.

## Security and privacy

Includes tenant-escape attempts, IDOR, SSRF, injection, decompression/parser abuse, producer spoofing, replay, command confusion, policy escalation, secret canaries, restricted-content leakage, export controls, support access, and audit tampering.

## Release qualification

A release candidate is immutable. Results bind to its artifact digests and configuration versions. Flaky tests are treated as defects. Waivers require scope, impact, accountable approval, compensating control, expiry, and follow-up.

## Production verification

Canaries check:

- protocol acceptance and schema drift;
- data-quality invariants;
- SLO/error-budget impact;
- resolver/materializer/insight diffs;
- authorization and privacy;
- resource/cost change;
- customer outcome metrics;
- rollback readiness.

## GA quality bar

No known critical security/privacy/isolation/control-safety defect; no unresolved durable-loss path; no unsupported product claim; all required gates passed; operational ownership staffed; customer documentation/support ready; rollback and disaster recovery proven.
