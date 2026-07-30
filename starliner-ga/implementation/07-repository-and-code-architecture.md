# Repository and Code Architecture

Status: **normative boundaries; current sensor seams verified, target implementation destinations require approval**

## Rule

Do not invent framework paths in an existing repository. The pinned browser, endpoint, LLM Gateway, and MCP Gateway revisions have been inspected and their concrete adapter seams are mapped in [`implementation/12` through `15`](12-browser-sensor-binding.md). Use `NEEDS_INPUT` for named owners, target module/repository destinations, release-selected revisions, deploy paths, issuers, URLs, and credentials.

## Logical source layout

```text
contracts/
  protocol/
  source-profiles/
  product-api/
  product-events/
  generated/

edge/
  runtime-core/
  privacy/
  wal/
  delivery/
  policy/
  command/
  health/
  update/
  adapters/{browser,endpoint,llm-gateway,mcp-gateway}/

platform/
  enrollment/
  ingest/
  evidence/
  normalization/
  identity/
  canonical/
  activity/
  findings/
  metrics/
  policy/
  command/
  workflow/
  connectors/
  api/
  projectors/

product/
  web/
  sdk/

operations/
  cell/
  deployment/
  observability/
  runbooks/
  certification/
  migration/
```

This may be a monorepo or a governed multi-repo system. Contract, artifact, and ownership rules remain the same.

## Dependency direction

```text
domain types/contracts
  <- domain logic
  <- application services
  <- adapters/transports/stores
  <- deployment composition
```

Domain logic does not import frontend, database driver, message broker, or sensor-native implementation details.

## Generated contracts

- Schemas are source; generated SDK/model code is not manually edited.
- Generation is reproducible and checked for drift.
- Generated packages identify schema/profile versions.
- Consumers handle unknown compatible values.
- Schema publication precedes producer emission.

## Service boundaries

Services own APIs and storage mutations described in `registers/services.yaml`. Direct cross-service table writes are prohibited. Reporting replicas and projectors do not become mutation paths.

## Configuration

Configuration is:

- typed and validated at startup;
- environment/tenant/region explicit;
- secrets referenced from secret manager;
- versioned for material behavior;
- safe to display in diagnostics after redaction;
- separated from fixtures.

Missing critical production configuration fails startup or readiness with a clear reason.

## Database modules

Each authority module owns:

- migrations;
- repository interface;
- transaction boundary;
- idempotency;
- tenant context;
- outbox events;
- invariants;
- backup/retention classification;
- load and failure tests.

Cross-tenant queries require a separately reviewed operator workflow and cannot exist in customer paths.

## Testing layout

Every module includes unit/property tests, contract fixtures, integration tests with supported dependencies, observability assertions, and upgrade/migration cases. Shared E2E golden scenarios live outside a single service so they exercise deployed boundaries.

## Build and release

Each deployable has independent immutable artifact identity, SBOM, provenance, compatibility manifest, certification, runbook, SLO, and rollback. Shared libraries do not create lockstep fleet upgrades unless protocol compatibility truly requires it.

## Language and framework selection

Language/runtime choices are made per existing repository and operational fit. They require an implementation ADR only when they alter security, deployment, performance, compatibility, or ownership. The platform contract must not depend on one language.
