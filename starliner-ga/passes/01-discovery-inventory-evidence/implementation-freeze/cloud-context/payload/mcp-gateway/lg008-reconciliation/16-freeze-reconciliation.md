# Freeze reconciliation

## Package-level result

All 74 files in the content-addressed implementation-freeze package are in the
authority manifest. The package's own structural validator passes.

The package remains a candidate, not an accepted implementation:

- P0 live storage gates are open;
- LG-008 is open in the defect ledger;
- named artifact owners and freeze date are unresolved;
- current MCP adapter/profile implementation is incomplete.

## MCP source profile and adapter contract

### Confirmed target boundaries

- adapters emit source IDs, not canonical IDs;
- Direct, OneMCP, native, workflow, resource, prompt, and session surfaces are
  separately certified;
- raw arguments/results/headers/tokens are excluded;
- decisions and observed effects remain distinct;
- gateway state is not central canonical state;
- current SQLite/process-local runtime is single-replica only.

### Partially confirmed

- backend/tool source observation;
- Direct tool-call activity and DLP block outcomes;
- local outbox/delivery prototype;
- manifest, metrics, and self-test;
- source-local decision/effect seams;
- operation/rejection data in source-local logs.

### Contradicted or unsourced

- current mapper creates `canonical_entity`;
- custom server deployment may lack required distinct `product_source_id`;
- complete snapshot/delete/lifecycle coverage is absent;
- complete health/gap/loss contracts are absent;
- frozen envelope/receipt/sequence/certification is absent.

## Protocol JSON Schema

All 118 MCP top-level fields have a reconciliation status. Types/enums are
contract evidence only. The source is not required to fabricate unsupported
fields.

One schema contradiction requires change control: server deployment requires
`product_source_id`, while a custom registry backend may only have a stable
deployment ID.

## Ontology and identity

The freeze correctly separates:

- server product/deployment;
- tool/resource/prompt definition;
- client application, agent definition/deployment, workload, session;
- directory account/service principal;
- source identity and canonical identity.

The current producer-created canonical entity violates that separation.

## Normalization

Frozen normalization contains explicit MCP entity, predicate, activity,
decision, outcome, reconciliation, coverage, health, and gap routing.

Current source mappings cover only a subset. No frozen rule is treated as
implemented merely because it exists.

## PostgreSQL and ClickHouse

The frozen SQL files are hashed and structurally tested. The MCP pass does not
claim live PostgreSQL/ClickHouse execution. Source-to-storage mappings are
target lineages, while current gateway SQLite/ClickHouse tables remain
source-local evidence.

## OpenAPI, authorization, and UI

MCP-relevant UI/API rows have source/protocol/storage/read-model lineage.
Authorization remains target-contract evidence. The current gateway's local
admin/user routes are not silently exposed as central API authorization.

The UI must represent `unknown`, `partial`, `unsupported`, and source-scoped
identity rather than interpreting missing coverage as zero.
