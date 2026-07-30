# Architecture Constitution

This document contains invariants that implementation, schemas, services, APIs, UI, migrations, and operations MUST preserve.

## System boundary

1. Starliner consists of a language-neutral protocol, Edge Runtime, and regional/customer-isolated Platform Services.
2. Sensors and connectors remain authoritative only for their native execution and source facts.
3. The tenant cell is authoritative for admitted evidence metadata, canonical identity, canonical relationships, findings, policy state, commands, and unified product state.
4. Logical centralization does not require global customer-data centralization.

## Evidence and identity

5. The edge never mints canonical enterprise IDs.
6. Every source-native identifier has a namespace, source, validity, assurance, status, and reassignability classification.
7. Accepted evidence is immutable. Corrections, deletion assertions, and retention expiry append records.
8. Every canonical field is backed by one or more claims with source, time, authority, confidence, proof, and resolver version.
9. Merge, split, negative-match, rekey, revoke, retire, and reappearance are append-only decisions.
10. No cross-tenant resolution, merge, binding, relationship, command, cursor, or replay is permitted.

## Lifecycle and coverage

11. Source silence never proves canonical deletion.
12. Source deletion affects that source assertion; canonical retirement follows lifecycle policy and required coverage.
13. Capability, certification, runtime mode, health, scope, freshness, and evidence completeness are separate dimensions.
14. Missing, empty, unavailable, out-of-scope, omitted-by-policy, redacted, sampled, gapped, stale, conflicting, and known-absent are distinct.
15. Findings and metrics declare required coverage and return not-evaluable when it is unmet.

## Materialization and storage

16. PostgreSQL canonical ledgers are operational authority.
17. ClickHouse, graph, search, Redis, and UI summaries are projections or bounded runtime state and are rebuildable.
18. Every canonical transaction writes its central outbox event atomically.
19. The edge outbox and central transactional outbox solve different failure boundaries and both exist.
20. Materializers are idempotent, versioned, late-data aware, and independently checkpointed.
21. Rebuilds write versioned targets, reconcile, and switch atomically; GA rebuilds do not clear active state in place.

## Policy and action

22. Policy source, compiled bundle, deployment, decision, enforcement, execution outcome, and verified effect are separate objects.
23. Latency-sensitive deterministic policy can run locally from signed bundles or leases.
24. Central Decision API is bounded escalation and never scans raw evidence synchronously.
25. Every consequential decision records subject, action, resource, context, authority, policy/version, reasons, obligations, and evidence.
26. Commands are typed, signed, authorized, expiring, idempotent, preconditioned, and target a valid source binding.
27. Native action retry is distinct from transport retry.
28. A command reaches success only after its verification policy passes.

## Privacy and security

29. Collection is allowlisted and privacy-approved before edge persistence.
30. Restricted content is separate from ordinary records, encrypted, purpose-bound, access-audited, and retained independently.
31. Hashing does not make content non-sensitive. Sensitive correlation digests use approved tenant-keyed mechanisms.
32. Producer claims are distinct from authenticated/admitted facts.
33. Tenant, sensor, runtime, certification, quality, and cell are verified from authenticated registry state.
34. Trace context is correlation input, never authorization.
35. Secrets, bearer tokens, raw credentials, and private keys never enter ordinary evidence, logs, metrics, dead letters, or UI.

## Product

36. Normal UI reads only unified canonical APIs.
37. Customer inventory shows canonical applications, agents, models, and MCP/tools rather than source rows.
38. Evidence and debug details are permissioned drill-down.
39. A sensor signal cannot directly create a customer finding.
40. Product copy is compiled from admitted claims and identifies uncertainty.

## Delivery and change

41. Every requirement maps to an owner, implementation increment, acceptance test, and GA gate.
42. Architecture and protocol changes use expand/migrate/contract and documented compatibility windows.
43. Quilr 1 is migrated by tenant-sequenced strangler, backfill, dual-read, reconciliation, feature flags, rollback, and deprecation.
44. No source, schema, service, UI page, or infrastructure component is declared complete without runtime proof.
45. No production-specific value is invented; unresolved environment values use `NEEDS_INPUT`.
46. Runtime sensor, discovery connector, telemetry importer, control connector, and response connector are distinct authority roles even when packaged together.
47. Browser client and browser backend are distinct producers; relay or receipt does not become an independent observation of the same native fact.
48. Severity, confidence, source assurance, coverage, and work priority are distinct and are centrally governed by versioned definitions.
49. Conceptual planes and ontology domains do not determine repository, service, deployment, or navigation counts.
50. Tickets, wikis, catalogs, dashboards, fixtures, mocks, and assistants cannot override this corpus or prove a production capability.
