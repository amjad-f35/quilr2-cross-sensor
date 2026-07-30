# Scope, Method, and Evidence

## Question answered

This audit answers: **what must be preserved, transformed, rebuilt, compatibly exposed, live-validated, cut over, rolled back, and eventually retired so existing Quilr 1 customers can receive Quilr 2 as a normal product transition?**

It does not re-evaluate whether Quilr 2 should centralize canonical truth. That decision is already accepted. It determines how to reach that architecture without customer-visible loss.

## Evidence classes

Every conclusion uses one of four classes:

| Marker | Meaning | Permitted use |
|---|---|---|
| `VERIFIED_REPOSITORY` | Demonstrated by source, migrations, configuration, tests, or completed revision-pinned analysis | May define a migration mapping or engineering constraint |
| `INFERENCE` | Strongly implied by multiple repository facts but not directly executed against production | May guide implementation; must be proven by test before cutover |
| `NEEDS_LIVE_VALIDATION` | Depends on mutable deployment, customer, volume, credential, data-quality, or consumer state | Must be supplied as gate evidence |
| `UNRESOLVED` | Neither source nor a named operational evidence procedure currently determines it | Blocks the relevant gate until converted into an evidence-producing task |

Documentation claims and table names are not treated as production existence. Repository DDL proves intended schema. A live catalog query proves deployed schema. An artifact digest plus deployment inventory proves what code is running.

## Reviewed source boundaries

The audit consumes the revision-pinned evidence recorded in [Current Sensor Repository Audit](../evidence/02-current-sensor-repository-audit.md):

- Browser Extension client `Project-Vanguard`;
- browser native host `project-sentinel`;
- Browser Extension Service;
- Endpoint Agent, Endpoint Dashboard, and both current and pinned IPC trees;
- LLM Gateway / data-protection platform;
- MCP Gateway;
- Quilr 1 platform, including its service dependencies and migration service;
- `better-console-backend` on `quilr-preprod`, commit `4d0dfded2e462d63fd7f68bb6bc0330a291fd0aa`.

The prior analysis packages account for 3,872 sensor paths and 46,226 indexed declarations/bindings. The Quilr 1 analysis adds the current Java/Spring, frontend, ClickHouse, PostgreSQL, Redis, Neo4j, and dependency topology. This audit consumes those detailed outputs instead of repeating their symbol references.

## Method

1. Enumerate every durable or customer-significant resource visible in the source analyses and migration DDL.
2. Classify it as one of:
   - `PRESERVE_AS_EVIDENCE`;
   - `TRANSFORM_TO_CANONICAL`;
   - `REBUILD_PROJECTION`;
   - `COMPATIBILITY_ONLY`;
   - `RETAIN_NATIVE`;
   - `ROTATE_OR_REENROLL`;
   - `RETIRE_AFTER_GATE`;
   - `DO_NOT_MIGRATE`.
3. Identify writers, readers, IDs, ordering or watermark, customer effect, and loss mode.
4. Define a replay-safe extraction and a semantic comparison.
5. Assign one authority per tenant/domain/cohort state.
6. Attach rollback and retirement requirements.
7. Separate static completion from production verification.

## Systems of record versus migration inputs

A legacy store is a source of migration evidence, not automatically a Quilr 2 authority.

| Source class | Migration treatment |
|---|---|
| Event/log table | Export immutable rows with source primary key, tenant, event time, ingest time where available, schema version, extraction watermark, and checksum |
| Configuration or workflow table | Preserve complete state and mutation history where it exists; import through a typed legacy profile; explicitly select future mutation authority |
| Cache | Do not migrate values as truth; use it to discover dependencies and parity behavior; rebuild from the selected authority |
| Queue/lock/marker | Drain or reach a declared watermark; do not clone in-flight coordination state into a new runtime |
| Graph | Preserve source node/edge IDs and properties as evidence; reconstruct typed canonical relationships; compare topology and member semantics |
| Aggregate/summary | Use only for parity checks unless raw contributing evidence is unavailable and the exception is documented |
| Local sensor state | Retain what is necessary for upgrade continuity; do not promote it to enterprise canonical truth |
| Secret/private key/token | Never bulk-copy as ordinary data; rotate, reissue, re-enroll, or use an approved rewrap ceremony |

## Completeness boundary

The registers intentionally include resources that will not be present in the first customer UI. Migration completeness is broader than UI scope because configuration, audit, authorization, export, support, installation, and rollback state can break existing workflows even when not directly displayed.

Static completeness does not mean production readiness. Production readiness requires the [live validation package](10-live-validation-and-team-signoff.md).
