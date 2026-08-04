# ADR-0019: First customer release is Discovery, Inventory, and Evidence

Status: **accepted for first-release source and product scope; migration sequencing superseded by ADR-0020**

> **Sequencing amendment:** [ADR-0020](0020-die-migration-is-a-separate-parallel-track.md)
> supersedes only the clauses below that place Quilr 1 legacy acquisition,
> coexistence, parity, cohort cutover, fallback, or rollback inside the bounded
> DIE implementation or `DIE-GA`. The five launch producer profiles and the
> Discovery / Inventory / Evidence product boundary remain accepted. ADR-0014
> and the complete future migration/coexistence end goal remain accepted in a
> separately authorized parallel track.

## Context

ADR-0012 correctly rejected an MCP-only test platform and required a permanent cross-sensor path. Its original first slice used Browser, Endpoint, LLM Gateway, enterprise identity/population, one insight, and workflow while deferring MCP.

Current company direction requires a different release sequence:

- first complete discovery across all owned sensor families;
- build one source-backed inventory;
- expose important evidence/activity, provenance, coverage, and gaps;
- preserve a smooth Quilr 1 transition;
- defer intelligence/findings, policy, and broader platform deployment expansion until this foundation works.

Leaving the earlier sequence in authority would create conflicting implementation plans.

## Decision

The first customer release is the [Discovery, Inventory, and Evidence Pass](../passes/01-discovery-inventory-evidence/README.md).

It includes:

- Browser Extension/native host;
- Browser Backend as a distinct producer;
- Endpoint;
- LLM Gateway;
- MCP Gateway;
- Quilr 1 legacy evidence and compatibility;
- canonical applications, agents, models, MCP servers, tools, context and relationships;
- important source-backed activity/evidence;
- coverage, freshness, gaps, provenance and identity transparency;
- production APIs/UI;
- tenant-cohort backfill, semantic parity, cutover, fallback and rollback.

It excludes findings, cases, risk scoring, policy authoring, new command/remediation, cost and Quilr 1 retirement.

## Preserved ADR-0012 principle

The first slice remains cross-sensor and uses permanent security, durability, identity, canonical, API, UI and operational boundaries. A one-sensor synthetic product remains prohibited.

## Consequences

- MCP evidence and inventory enter the first pass rather than the next slice.
- Findings/workflow no longer block the first customer release.
- The pass must implement a broader event and inventory surface before intelligence.
- Migration and customer fallback are part of the first release, not later cleanup.
- Later findings/policy consume the same canonical evidence path.
- The first release has its own `DIE-GA` gate and machine-readable requirements.

## Rejected

- continuing to call the earlier unmanaged-application finding slice the first release;
- building only raw event ingestion without central inventory;
- exposing a spreadsheet-like sensor exhaust UI;
- rebuilding Quilr 1 source-specific API composition;
- removing Quilr 1 before cohort parity and stabilization.

## Validation

- all four sensor families complete the pass production scenario;
- canonical inventory and evidence UI require no sensor API joins;
- important events have source coverage and chain of custody;
- Quilr 1 backfill, member-level parity, cohort cutover and fallback pass;
- exact production artifacts meet `DIE-GA`.
