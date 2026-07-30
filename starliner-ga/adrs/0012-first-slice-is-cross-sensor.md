# ADR-0012: First slice is cross-sensor

Status: **accepted principle; first-release scope superseded by ADR-0019**

## Context

The initial TDD proposed an MCP-first vertical pipeline. It can prove transport but not the defining enterprise value of one continuously resolved estate.

## Decision

The original decision made the first production walking skeleton resolve browser, endpoint, and LLM gateway observations plus enterprise identity/population into one application with distinct surfaces, coverage, ownership, one insight, and workflow, with MCP in the next slice.

[ADR-0019](0019-first-customer-release-is-discovery-inventory-evidence.md) supersedes that source/product sequencing. The retained decision is that the first production release must be cross-sensor, exercise permanent platform boundaries, and must not be an MCP-only or disposable test architecture.

## Consequences

- More coordination is required before the first visible result.
- Central identity and coverage are proven before architecture proliferates.
- There is no disposable MCP-only product architecture.
- Individual adapters can still develop in parallel against frozen profiles.

## Rejected

Calling a one-sensor synthetic UI the Quilr 2 foundation or allowing it to set canonical contracts.

## Validation

The full walking-skeleton acceptance in the implementation plan.
