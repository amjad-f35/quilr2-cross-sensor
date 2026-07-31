# Quilr 1 to Quilr 2 Migration Continuity Audit

**Status:** incomplete parallel work package; chapters `03..12` and their
registers are planned but are not present and are not normative authority

**Scope:** Discovery, Inventory, and Evidence Pass migration from the current Quilr 1 platform and four sensor families into the Quilr 2 Starliner spine

## Executive answer

The present three chapters establish a repository-derived starting point. They
do not complete the migration audit.

The repositories establish parts of the source-system resource baseline. The
missing identity, customer-state, API, fleet, secret, cutover, guardrail,
live-validation and coverage artifacts are still required before this package
can become migration authority.

Static source cannot prove mutable production facts such as the exact artifact
installed for a customer, live row counts, manually created integrations,
retained history, production credentials or undocumented consumers. A future
`10-live-validation-and-team-signoff.md` must isolate those facts as executable
evidence requests with pass/fail criteria. That document does not exist yet;
this package must not be used as migration build authority.

## Migration verdict

The migration is feasible without copying Quilr 1's architecture into Quilr 2 if five invariants hold:

1. Quilr 1 stores remain readable and unchanged while watermarked exports are captured.
2. Every durable legacy identifier is preserved as a typed source alias; no migration generates a replacement and discards the old value.
3. Legacy rows enter Quilr 2 as immutable, provenance-bearing evidence and are then normalized and resolved under Quilr 2 rules.
4. Customer reads switch by tenant and domain through a compatibility façade; there is one declared read authority and one mutation authority for each domain.
5. Rollback changes routing and authority. It never deletes accepted Quilr 2 evidence or tries to reverse irreversible writes.

The unsafe alternative is a flag-day replacement, direct dual-writes into unrelated schemas, copying aggregate tables as canonical truth, or allowing the frontend to merge Quilr 1 and Quilr 2 records. Those approaches lose lineage, create split authority, and make rollback unverifiable.

## What this audit contains

| Artifact | Purpose |
|---|---|
| [Scope and evidence](00-scope-method-and-evidence.md) | Defines verified, inferred, and live-only evidence |
| [Migration verdict](01-executive-migration-verdict.md) | Gives the engineering decision and hard blockers |
| [Source systems and resources](02-source-system-and-resource-register.md) | Explains the populated resource inventory |
| `03-identity-and-key-continuity.md` — planned | Must freeze alias, tenant, actor, device, application, agent, model, MCP, event and export identity behavior |
| `04-customer-state-and-workflow-continuity.md` — planned | Must define what customers cannot lose |
| `05-api-integration-and-consumer-compatibility.md` — planned | Must define façade, versioning, pagination, error, authentication, webhook and export compatibility |
| `06-sensor-fleet-and-protocol-continuity.md` — planned | Must define update-in-place behavior for all five producers |
| `07-secrets-crypto-and-enrollment.md` — planned | Must separate migratable identity metadata from non-migratable secrets |
| `08-authority-coexistence-cutover-and-rollback.md` — planned | Must freeze the cohort state machine and safety model |
| `09-change-safety-guardrails.md` — planned | Must classify forbidden, gated and safe changes |
| `10-live-validation-and-team-signoff.md` — planned | Must replace open-ended questions with executable evidence |
| `11-coverage-and-evidence-ledger.md` — planned | Must count and classify completed versus live-only work |
| `12-better-console-backend-disposition.md` — planned | Must define what can and cannot be reused |
| [Resource register](registers/source-resources.csv) | Store/table/queue/file/cache-level preservation and migration dispositions |
| `registers/identity-continuity.csv` — planned | Must record identifier source, alias, collision and correction contracts |
| `registers/customer-state.csv` — planned | Must record configuration, workflow, history and UX continuity |
| `registers/api-compatibility.csv` — planned | Must record consumer compatibility and retirement gates |
| `registers/live-validation.csv` — planned | Must record exact production evidence still required |
| `registers/change-guardrails.yaml` — planned | Must encode prohibited and gated changes |

## Authority and precedence

This package is subordinate to the
[architecture constitution](../02-architecture-constitution.md) and accepted
ADRs. The three present chapters are evidence context only. This package
becomes more specific than the general migration chapter only after every
planned artifact exists, validates and is formally accepted.

Precedence:

1. architecture constitution and accepted ADRs;
2. this package's invariants and registers;
3. [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md);
4. [general migration architecture](../implementation/04-quilr1-migration-and-cutover.md);
5. repository analysis as evidence;
6. current product behavior, legacy documents, and tribal knowledge.

Production evidence can fill a registered unknown. It cannot silently change a constitutional boundary.

## Completion definition

The repository-derived audit is not complete. Completion requires every source
resource, identity family, customer-state domain, sensor surface, API family
and Better Console component to be classified in the planned artifacts. The
migration is ready for a pilot only after those artifacts are accepted, all
`P0` live-validation rows have evidence, a tenant cohort is selected, semantic
parity succeeds, rollback is rehearsed and named owners sign the immutable
cutover package.

No migration-audit validator exists yet. The repository-wide corpus validator
checks only that the current incomplete package is truthfully linked and
parseable; it does not certify migration readiness.
