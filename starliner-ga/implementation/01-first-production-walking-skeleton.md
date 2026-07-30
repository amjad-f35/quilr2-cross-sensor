# First Production Walking Skeleton

Status: **normative pointer to the CTO-directed first pass**

## Current release authority

The first production walking skeleton is now the complete [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md).

The earlier sequence that shipped one unmanaged-application finding and deferred MCP has been superseded. That sequence conflicted with the current product and migration directive:

- integrate Browser, Browser Backend, Endpoint, LLM Gateway, and MCP Gateway evidence now;
- build one canonical inventory now;
- expose important source-backed activity, evidence, provenance, coverage, and gaps now;
- preserve Quilr 1 customer continuity now;
- defer intelligence/findings and policy/control until the evidence foundation and migration pass work.

## Walking-skeleton outcome

> All four sensor families emit privacy-approved evidence through the permanent Starliner path; the tenant cell continuously resolves it into applications, agents, models, MCP servers, and tools with distinct surfaces/deployments; the UI exposes inventory, activity, evidence, provenance, coverage, and gaps; and an approved tenant cohort can move between Quilr 1 and Quilr 2 reads without losing accepted evidence.

This is production code and a customer release, not a synthetic event viewer.

## Permanent components proven

- typed source profiles and adapters;
- Edge Runtime privacy/WAL/delivery;
- authenticated ingest and durable receipts;
- immutable evidence/quarantine/replay;
- deterministic normalizers;
- central identity and canonical ledgers;
- PostgreSQL product read models;
- ClickHouse activity/evidence projection;
- unified APIs and UI;
- tenant/security/privacy boundary;
- projection rebuild;
- Quilr 1 backfill, semantic parity, cohort cutover, fallback, and rollback;
- release, operations, support, and certification.

## Explicitly deferred

- findings, risk/severity, recommendations, cases;
- policy authoring, decisions, commands, and new remediation;
- cost/billing analytics;
- restricted content;
- graph/search/cache infrastructure without measured need;
- broader deployment profiles;
- Quilr 1 retirement.

## Completion

The walking skeleton is complete only at `DIE-GA` under the pass [definition of done](../passes/01-discovery-inventory-evidence/13-delivery-plan-and-definition-of-done.md), [requirements](../passes/01-discovery-inventory-evidence/registers/requirements.csv), and [quality gates](../passes/01-discovery-inventory-evidence/12-quality-certification-and-operability.md).
