# Quilr 1 to Quilr 2 Migration Continuity Audit

**Status:** normative migration work package; repository-derived baseline complete; live-production evidence open

**Scope:** Discovery, Inventory, and Evidence Pass migration from the current Quilr 1 platform and four sensor families into the Quilr 2 Starliner spine

## Executive answer

Yes, the static part of this work can be done from the repositories and their completed deep analyses, and this package does it.

The repositories prove what state exists in source, where it is written, which services and APIs depend on it, which identities must survive, which sensor paths can emit Starliner evidence, and which changes would make a safe migration impossible. That material has been converted here into populated, machine-checked continuity registers. This is not an empty questionnaire.

Static source cannot prove mutable production facts such as the exact artifact installed for a customer, live row counts, manually created integrations, retained history, production credentials, or undocumented consumers. Those are isolated in the [live validation and signoff plan](10-live-validation-and-team-signoff.md) as executable evidence requests with pass/fail criteria. They do not reopen the architecture.

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
| [Identity continuity](03-identity-and-key-continuity.md) | Freezes alias, tenant, actor, device, application, agent, model, MCP, event, and export identity behavior |
| [Customer state and workflows](04-customer-state-and-workflow-continuity.md) | Defines what customers must not lose |
| [API and consumer compatibility](05-api-integration-and-consumer-compatibility.md) | Defines façade, versioning, pagination, error, auth, webhook, and export compatibility |
| [Sensor fleet continuity](06-sensor-fleet-and-protocol-continuity.md) | Defines update-in-place behavior for Browser, Endpoint, LLM Gateway, MCP Gateway, and Browser Backend |
| [Secrets, cryptography, and enrollment](07-secrets-crypto-and-enrollment.md) | Separates migratable identity metadata from non-migratable secrets |
| [Authority, cutover, and rollback](08-authority-coexistence-cutover-and-rollback.md) | Freezes the cohort state machine and safety model |
| [Change-safety guardrails](09-change-safety-guardrails.md) | Tells engineers which changes are forbidden, gated, or safe |
| [Live validation and signoff](10-live-validation-and-team-signoff.md) | Replaces open-ended team questions with required evidence |
| [Coverage ledger](11-coverage-and-evidence-ledger.md) | Counts and classifies completed versus live-only work |
| [`better-console-backend` disposition](12-better-console-backend-disposition.md) | Defines exactly what can and cannot be reused |
| [Resource register](registers/source-resources.csv) | Store/table/queue/file/cache-level preservation and migration dispositions |
| [Identity register](registers/identity-continuity.csv) | Identifier source, alias, collision, and correction contracts |
| [Customer-state register](registers/customer-state.csv) | Configuration, workflow, history, and UX continuity |
| [API register](registers/api-compatibility.csv) | Consumer-level compatibility and retirement gates |
| [Live-validation register](registers/live-validation.csv) | Exact production evidence still required |
| [Change guardrails](registers/change-guardrails.yaml) | Machine-readable prohibited and gated changes |

## Authority and precedence

This package is subordinate to the [architecture constitution](../02-architecture-constitution.md) and accepted ADRs. Within migration work it is more specific than the general migration chapter and the pass-level summary.

Precedence:

1. architecture constitution and accepted ADRs;
2. this package's invariants and registers;
3. [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md);
4. [general migration architecture](../implementation/04-quilr1-migration-and-cutover.md);
5. repository analysis as evidence;
6. current product behavior, legacy documents, and tribal knowledge.

Production evidence can fill a registered unknown. It cannot silently change a constitutional boundary.

## Completion definition

The repository-derived audit is complete when every source resource, identity family, customer state domain, sensor surface, API family, and better-console component is classified. The migration is ready for a pilot only when all `P0` live-validation rows have evidence, the tenant cohort is selected, semantic parity succeeds, rollback is rehearsed, and named owners sign the immutable cutover package.

Run:

```bash
node starliner-ga/migration-audit/tools/validate-audit.mjs
```

to validate the registers and document links.
