# First Production Walking Skeleton

Status: **normative pointer to the CTO-directed first pass**

## Current release authority

The first production walking skeleton is now the complete [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md).

The earlier sequence that shipped one unmanaged-application finding and deferred MCP has been superseded. That sequence conflicted with the current bounded product directive:

- integrate Browser, Browser Backend, Endpoint, LLM Gateway, and MCP Gateway evidence now;
- build one canonical inventory now;
- expose important source-backed activity, evidence, provenance, coverage, and gaps now;
- preserve stable extension seams for a separately authorized Quilr 1 migration/coexistence track;
- defer intelligence/findings and policy/control until the evidence foundation works.

## Walking-skeleton outcome

> All four sensor families, with Browser Backend as a distinct fifth producer, emit privacy-approved evidence through the permanent Starliner path; the tenant cell continuously resolves it into applications, agents, models, MCP servers, and tools with distinct surfaces/deployments; and the UI exposes inventory, activity, evidence, provenance, coverage, and gaps.

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
- release, operations, support, and certification.

## Separate parallel migration track

[ADR-0020](../adrs/0020-die-migration-is-a-separate-parallel-track.md)
preserves the complete Quilr 1 legacy-evidence, backfill, semantic-parity,
cohort-cutover, fallback, rollback, and stabilization program under the
independent `MIGRATION` track gate. That program consumes versioned seams from
this product but is not a walking-skeleton component or a `DIE-GA` prerequisite.
The walking skeleton must not create placeholder migration roles, state, APIs,
UI, fixtures, or release evidence.

## Explicitly deferred

- findings, risk/severity, recommendations, cases;
- policy authoring, decisions, commands, and new remediation;
- cost/billing analytics;
- restricted content;
- graph/search/cache infrastructure without measured need;
- broader deployment profiles;
- Quilr 1 extraction, coexistence, parity, cutover, fallback, and rollback implementation;
- Quilr 1 retirement.

## Completion

The walking skeleton is complete only at `DIE-GA` under the pass [definition of done](../passes/01-discovery-inventory-evidence/13-delivery-plan-and-definition-of-done.md), [requirements](../passes/01-discovery-inventory-evidence/registers/requirements.csv), and [quality gates](../passes/01-discovery-inventory-evidence/12-quality-certification-and-operability.md).
