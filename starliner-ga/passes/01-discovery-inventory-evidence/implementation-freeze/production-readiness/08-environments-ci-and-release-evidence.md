# Environments, CI and Release Evidence

## Validation tiers

| Tier | Trigger | Environment | Purpose |
|---|---|---|---|
| static intrinsic | every pull request | clean pinned Node/Python toolchain | schemas, APIs, SQL grammar, corpus integrity and committed LG-008 authority |
| source rederivation | source-revision or authority change | authorized source workspace | regenerate all five profiles twice and prove zero drift |
| exact-engine smoke | every storage-contract change | disposable exact PostgreSQL/ClickHouse images | deployability and fast semantic regression |
| integration | every main candidate | isolated multi-service cell | real ingest-to-UI path and failure recovery |
| nightly stress | nightly/release | production-shaped topology | contention, load, soak, mutation and recovery |
| release qualification | signed release candidate | representative deployment | all applicable LG, security, restore and operational gates |

## Clean-room contract

The repository pins Node and Python in `.tool-versions`, Python dependencies in
`tools/requirements-test.lock`, immutable GitHub Action revisions and one
entrypoint:

```bash
node starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/run-clean-room-validation.mjs --intrinsic
```

Intrinsic mode needs only the checkout and verifies committed LG-008 artifacts
against their manifest. Source mode additionally requires `CONSOLIDATE_ROOT`,
retrieves/contains the revision-pinned sources and analyses, recomputes input
digests, regenerates twice and rejects drift:

```bash
CONSOLIDATE_ROOT=/authorized/evidence-root \
node starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/run-clean-room-validation.mjs --source
```

Absolute paths are environment configuration, never manifest identity. Every
manifest path is relative and content-addressed.

The clean-room command also mutation-tests seven validator boundaries:
LG-008 input integrity, PostgreSQL RLS, OpenAPI authorization, gate-catalog
states, gate-evidence path safety, exact negative SQL assertions and corpus
links. A validator candidate that accepts any injected defect fails.

## CI security

- checkout credentials are not persisted;
- workflow permissions are read-only;
- third-party actions are pinned to full commit SHAs;
- no production/customer credentials are permitted;
- provider tests use isolated non-production accounts and short-lived workload
  identity;
- logs are sanitized and privacy canaries fail on secret/content leakage;
- artifacts have bounded retention and digest manifests;
- dependency, container and source provenance scanning is a release gate.

## Candidate identity

An authoritative run binds:

- Git commit and tree;
- generated-contract digest;
- source-authority manifest digest;
- container/binary digests;
- database/provider versions and configuration;
- test-data generator and seed;
- deployment manifest digest;
- evidence-package digest; and
- reviewer disposition.

Rebuilding code, changing a migration, changing configuration semantics or
advancing a source revision creates a new candidate and reruns affected gates.
