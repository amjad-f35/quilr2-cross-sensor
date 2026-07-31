# Repository and Delivery Map

## Repository decision

The complete central DIE implementation and Starliner protocol source live in `quilrbusiness/project-starliner`. A second backend repository is not created.

The customer UI stays in `quilr-platform-nuxt`. Sensor-native capture remains in each sensor repository. The protocol schemas and generated edge/client bindings are distributed from `project-starliner`.

## Verified starting point

Audit baseline:

- repository: `quilrbusiness/project-starliner`;
- branch: `main`;
- commit: `b747393468045425b3f07a24775dcbc93d380cb5`;
- audited commit date: 2026-07-16;
- 413 Python tests collected;
- 408 non-integration tests passed, 5 skipped in the local audit;
- committed schema export matched generated output;
- repository-wide Ruff was not clean; workflows lint only selected packages;
- implementation contains Python contracts/delivery/ingest but not the central normalizer, resolver, canonical materializers, projectors, product authorization/API or UI integration.

This baseline proves useful foundations. It does not prove the pass is implemented.

## Target tree

```text
project-starliner/
├── go.mod
├── go.sum
├── cmd/
│   └── starliner/
│       └── main.go
├── contracts/
│   ├── schemas/
│   │   ├── envelope/
│   │   ├── profiles/
│   │   ├── normalized/
│   │   └── product/
│   ├── openapi/
│   │   └── die-v1.openapi.yaml
│   ├── ontology/
│   │   ├── entity-types.yaml
│   │   ├── predicates.yaml
│   │   ├── activity-types.yaml
│   │   └── field-authority.yaml
│   ├── authz/
│   │   └── model.yaml
│   └── golden/
│       ├── browser/
│       ├── browser-backend/
│       ├── endpoint/
│       ├── llm-gateway/
│       ├── mcp-gateway/
│       ├── identity/
│       └── negative/
├── gen/
│   ├── go/
│   ├── python/
│   └── typescript/
├── internal/
│   ├── domain/
│   │   ├── producer/
│   │   ├── evidence/
│   │   ├── normalized/
│   │   ├── identity/
│   │   ├── canonical/
│   │   ├── relationship/
│   │   ├── activity/
│   │   ├── coverage/
│   │   ├── authz/
│   │   └── audit/
│   ├── app/
│   │   ├── admission/
│   │   ├── normalization/
│   │   ├── truth/
│   │   ├── projection/
│   │   ├── query/
│   │   ├── correction/
│   │   ├── export/
│   │   ├── enrollment/
│   │   └── maintenance/
│   ├── ports/
│   │   ├── objectstore/
│   │   ├── evidence/
│   │   ├── canonical/
│   │   ├── work/
│   │   ├── projection/
│   │   ├── authz/
│   │   └── audit/
│   ├── adapters/
│   │   ├── http/
│   │   │   ├── ingest/
│   │   │   ├── productapi/
│   │   │   └── management/
│   │   ├── postgres/
│   │   ├── objectstore/
│   │   ├── clickhouse/
│   │   ├── oidc/
│   │   └── telemetry/
│   ├── profiles/
│   │   ├── browser/
│   │   ├── browserbackend/
│   │   ├── endpoint/
│   │   ├── llmgateway/
│   │   └── mcpgateway/
│   └── runtime/
│       ├── config/
│       ├── worker/
│       ├── role/
│       ├── health/
│       └── shutdown/
├── db/
│   ├── postgres/
│   │   ├── migrations/
│   │   └── queries/
│   └── clickhouse/
│       └── migrations/
├── sdk/
│   ├── python/
│   │   ├── contracts/
│   │   └── delivery/
│   ├── go/
│   └── typescript/
├── compat/
│   └── python-v0/
├── tests/
│   ├── contract/
│   ├── profiles/
│   ├── identity/
│   ├── integration/
│   ├── e2e/
│   ├── chaos/
│   ├── security/
│   ├── performance/
│   └── restore/
├── deploy/
│   ├── container/
│   ├── helm/
│   └── observability/
├── tools/
│   ├── contractgen/
│   ├── certification/
│   ├── replay/
│   └── integrity/
└── docs/
```

This is a target layout and naming authority. Moving a private file within a listed module is allowed; merging authority modules or adding service-to-service calls is not.

## One codebase, explicit role artifacts

`cmd/starliner` is the shared composition root. `--role` must be exactly one of:

```text
ingest
normalizer
truth
projector
api
maintenance
```

Role composition is explicit in `internal/runtime/role`; no dependency-injection
scanning or runtime reflection chooses domain writers. Each role receives only
the database/object privileges it needs.

One repository and semantic release authority do not require one lockstep image.
The release pipeline produces an immutable role artifact for each role, with
its own image digest, SBOM, provenance, tests, canary and rollback. A signed
platform-release manifest pins the compatible role artifact set, contracts,
database schemas, profile registry and generated client. Production replicas
within one role run the selected role digest. Different roles may run different
digests only inside the manifest's declared N/N-1 protocol, work-contract and
database-schema compatibility window.

The `api` role has explicit `read` and `admin` surfaces. Read replicas use only `die_api`. Admin replicas additionally use a separate `die_authz_admin` connection pool for the authorization mutation transaction and expose only the bounded admin route set. The product gateway routes authorization preview/commit to that surface; no ordinary read handler can acquire its pool.

`maintenance tenant bootstrap` and `maintenance producer apply|revoke|certify` are the pass-owned bootstrap paths. Tenant bootstrap uses a signed one-time manifest and short-lived `die_authz_admin` connection to create the root scope, self-closure, initial authorization revision and audit chain atomically. Producer operations use `app/enrollment`, a signed/revisioned manifest contract and a short-lived `die_control_admin` connection. The same producer transaction updates producer/capability/expected-population/certification authority, audit and a `project_postgres` work item keyed by producer revision. Neither path is a public customer API or loaded by long-running ingest/API roles.

## Module dependency rules

Allowed:

```text
adapters → app → domain
adapters → ports
app → domain + ports
runtime → app + adapters
```

Forbidden:

- domain importing adapters, transport or generated HTTP clients;
- app modules importing another app module's database adapter;
- profiles importing canonical repositories;
- API importing normalizer/truth handlers;
- projector calling product API;
- sensor adapters importing central internal packages;
- UI importing any backend internal package;
- Python compatibility packages becoming a second canonical contract definition.

`go list`/architecture tests enforce import constraints.

## Contract generation

Source authority:

- JSON Schema for producer/envelope/normalized contracts;
- ontology YAML for registered types/predicates/authority;
- OpenAPI for product HTTP;
- authorization YAML for capabilities/roles/rules;
- SQL migrations for physical persistence.

Generation produces:

- Go validation/domain transport types;
- Java source-profile records and validators;
- Python edge SDK models;
- TypeScript source-profile models and product client/DTOs;
- Rust source-profile records and validators;
- schema registry bundle and digests;
- docs/reference tables.

Generated output is committed and CI requires regeneration to produce no diff. Hand-editing `gen/` is forbidden.

## Current-code disposition

### Retain and harden

- `starliner_contracts` golden/negative corpus concepts, certification ledger and payload-safety tests;
- `starliner_delivery` WAL/retry/client responsibilities;
- `starliner_ingest` authentication/trust/partial receipt/evidence semantics;
- PostgreSQL integration tests and legacy-import guard;
- existing safe profile evidence gathered from analyzed sensor repositories.

### Refactor into target contracts

- Pydantic transport definitions become generated Python output;
- delivery SQLite queue adopts atomic sequence allocation, explicit epochs, receipt state and concurrency tests;
- ingest FastAPI behavior becomes the conformance reference while production central ingest is Go;
- current evidence SQL is migrated into the frozen `die_*` schemas;
- current CLI tooling moves to contract/certification/operations tools.

### Compatibility only

- `starliner/contracts`, `starliner/sdk`, `starliner/adapters`;
- producer `EntitySnapshot` and `RelationshipEvent`;
- `SourceObservation.canonical_entity`;
- legacy action/decision/finding/cost families.

Compatibility input is translated at admission/normalization, tagged by origin/quality, and never allowed to assign central identity. New sensor work may not emit these superseded canonical-looking contracts.

### Remove from pass build

- top-level mock policy demo;
- `bundle-service`;
- `cmd/opa-server`;
- top-level Rego policy/k8s examples;
- cost/finding/policy engine modules.

They may remain in history or a separately built compatibility tree, but cannot be linked into the DIE release artifact or described as this pass.

The complete classification is [module-disposition.csv](registers/module-disposition.csv).

## Sensor repository boundary

Each sensor repository owns:

```text
native hook/scan/interception
→ typed profile adapter
→ local privacy disposition
→ Starliner generated SDK
→ durable edge WAL/delivery
```

It may also own local state required for delta detection, offline operation and existing native enforcement. It does not own canonical entities, cross-sensor resolution, product inventory or product analytics.

Per-sensor placement, verified current-code seams and emitted profile kinds are frozen in [sensor adapter bindings](14-sensor-adapter-bindings.md). The sensor team may choose private helper names but may not move the capture boundary or substitute a legacy delivery path. The contract and certification pack remain central in `project-starliner`.

## UI repository target

In `quilr-platform-nuxt`:

```text
app/
├── generated/die-v1/        # generated OpenAPI client/types
├── repositories/die/        # DieRepository and live implementation
├── composables/die/         # typed query/state adapters
├── components/die/          # pass-specific product composition
├── pages/...                # shell routes bound to repository
└── fixtures/die/            # tests/dev only, excluded from production
```

The existing shadcn-vue primitives and shell are reused. `app/lib/api/readModels.js` is retired after its fixture adapter has been replaced.

## Database change ownership

- migrations are ordered, immutable after release and tested against supported versions;
- one migration tool acquires an advisory migration lock;
- expand/migrate/contract supports old/new artifact overlap;
- application startup validates a compatible schema range but never applies production migrations;
- only release automation runs migrations;
- emergency rollback favors application rollback and forward-compatible schema over destructive down migration.

## CI lanes

Required repository-wide lanes:

1. formatting/lint/static analysis for all Go/Java/Python/TypeScript/Rust owned
   code on the selected producer/platform path;
2. dependency/import architecture rules;
3. contract generation and compatibility;
4. unit/property/fuzz;
5. real PostgreSQL/object/ClickHouse integration;
6. sensor/profile certification;
7. end-to-end producer-to-API;
8. security/tenant/RLS;
9. migration/restore/rebuild;
10. UI type/lint/unit/E2E/accessibility/build;
11. reference performance (scheduled and release);
12. SBOM/signing/provenance/container scan.

Workflows trigger on `main`, every pull request and relevant release tag. The current branch-restricted workflow triggers are insufficient and must be replaced.

## Delivery and ownership

One change may span contracts, central code, SDK and UI, but each artifact has an owner:

| Area | Accountable owner |
|---|---|
| protocol/schema/compatibility | platform contracts |
| edge runtime/SDK | sensor platform |
| individual native adapter | sensor product team |
| ingest/evidence/worker runtime | data spine |
| identity/canonical/relationships/activity/coverage | enterprise truth |
| projection/query/API | product platform |
| authz/audit | platform security |
| Nuxt experience | product engineering |
| DB/object/ClickHouse/SLO/restore | platform/SRE |

Named people are environment/organization bindings. Ownership areas are frozen.
