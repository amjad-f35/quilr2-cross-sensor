# ADR-0012: First customer release is cross-sensor

Status: **accepted principle; release scope superseded by ADR-0019 and
implementation order clarified by ADR-0022**

## Context

The initial TDD proposed an MCP-first vertical pipeline. It can prove transport but not the defining enterprise value of one continuously resolved estate.

## Decision

The original decision made the first production walking skeleton resolve browser, endpoint, and LLM gateway observations plus enterprise identity/population into one application with distinct surfaces, coverage, ownership, one insight, and workflow, with MCP in the next slice.

[ADR-0019](0019-first-customer-release-is-discovery-inventory-evidence.md)
supersedes that source/product sequencing. The retained decision is that the
first customer release must be cross-sensor, exercise permanent platform
boundaries, and must not be an MCP-only or disposable test architecture.

[ADR-0022](0022-installed-product-vertical-delivery.md) distinguishes that
release requirement from implementation order. The first integration vertical
is one normally installed or deployed source through the complete permanent
funnel. Subsequent source verticals extend the already-frozen five-profile
contracts and the same central spine. They do not create a source-specific
backend or redefine canonical semantics.

## Consequences

- The first releasable result requires all five profiles and their cross-source
  behavior.
- Product integration can become visible earlier through one real, complete
  source vertical.
- Central identity and coverage are proven on permanent boundaries before
  architecture proliferates.
- There is no disposable MCP-only product architecture.
- Individual adapters and common modules can develop in parallel against
  frozen profiles, but an integration claim advances only through the exact
  installed/deployed source path.

## Rejected

- calling a one-sensor synthetic UI proof of the unified estate or allowing it
  to set canonical contracts;
- requiring fixture-complete adapters for all profiles before one real source
  traverses the permanent product; or
- shipping a one-source customer release.

## Validation

The per-source vertical gates in
[document 43](../passes/01-discovery-inventory-evidence/implementation-freeze/43-installed-product-lifecycle-and-source-verticals.md)
and the final all-five-profile walking-skeleton acceptance in the
implementation plan.
