# Assurance Model and Build Authorization

## Objective

The target is not a rhetorical percentage. The target is progressively smaller
residual uncertainty through explicit claims, falsification, retained evidence
and release-bound gates.

The strongest permitted statement is:

> No known blocker within the complete tested boundary, with all untested
> behavior enumerated and prohibited from stronger customer claims.

## Evidence states

Every material result uses one state:

- `SOURCE_PROVEN`: exact immutable source/configuration/schema evidence;
- `RUNTIME_OBSERVED`: controlled execution with retained artifacts;
- `BOTH`: matching source and runtime evidence;
- `INFERRED`: reasoned but not contract or runtime proof;
- `NEEDS_LIVE_VALIDATION`: explicitly unproven;
- `PASS_LOCAL_SMOKE`: target-version local compatibility evidence that does not
  close a production gate;
- `PASS_RELEASE_BOUND`: pass against the exact signed release/deployment
  candidate.

## Readiness ladder

1. `BASELINE_ADMITTED`: clean commit, tree digest, selected-source revisions and
   generated authority are immutable.
2. `STATIC_FREEZE_ACCEPTED`: all intrinsic validators, schemas, OpenAPI, SQL
   grammar, source manifests and links pass from a clean room.
3. `IMPLEMENTATION_AUTHORIZED`: target-engine smoke and frozen contracts permit
   production code to be implemented without semantic invention.
4. `INTERNAL_INTEGRATION_READY`: the implemented end-to-end path passes in a
   representative isolated environment.
5. `CONTROLLED_PILOT_READY`: selected tenants, artifacts and operational
   controls pass the pilot matrix.
6. `GA_READY`: all release gates pass on immutable production candidates.

The current state is `IMPLEMENTATION_AUTHORIZED`. It is not
`INTERNAL_INTEGRATION_READY`, `CONTROLLED_PILOT_READY` or `GA_READY`.

## Gate evidence rule

Each test run records:

- gate and test IDs;
- exact repository commit and tree;
- build provenance and artifact digests;
- tool, engine, provider, OS and architecture versions;
- tenant/cell topology and configuration digest;
- sanitized fixtures and seed digest;
- command and UTC interval;
- assertion-level results;
- full logs/traces/query plans/catalog snapshots where applicable;
- injected fault schedule;
- retries, flakes and reruns;
- limitations;
- reviewer identity and disposition; and
- a final evidence-package digest.

The schema is `../schemas/gate-evidence-package.schema.json`.

## Defect discipline

- Any P0/P1 discovery creates a closure-ledger entry before correction.
- The correction adds a regression test that fails on the old artifact.
- A semantic correction updates schema, SQL, ontology, API, UI lineage and
  source traces wherever affected.
- A physical correction reopens only the affected gate unless it invalidates
  an authority boundary.
- A test is never weakened to preserve a readiness label.
- Flaky or quarantined required tests count as failure.
- “Not reproducible” is not closure.

## Independence

Gate authors may execute tests. Gate acceptance requires a second reviewer who:

1. starts from the immutable candidate;
2. reproduces the evidence or verifies the signed CI package;
3. mutation-tests at least one critical assertion;
4. checks every catalog row and limitation;
5. confirms no bypass/skip flag was active; and
6. signs the gate disposition.
