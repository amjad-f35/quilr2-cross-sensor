# ADR-0011: Minimal product information architecture

Status: **accepted**

## Context

Four sensors and enterprise connectors can emit hundreds of fields and many object types. Exposing them directly creates spreadsheets instead of a usable platform.

## Decision

The primary product is Overview, Inventory, Insights, Analytics, and Policies. Inventory is Applications, Agents, Models, and MCP & Tools. Activity, Coverage, Resolution, Evidence, Integrations, Audit, and Admin are permissioned supporting surfaces.

## Consequences

- APIs/materializers hide source complexity while preserving drilldown.
- Every primary field must support a customer decision.
- Source-specific diagnostics stay out of normal navigation.
- Advanced operators retain evidence and resolution access.

## Rejected

One table per sensor, a global event firehose as homepage, or frontend composition across sensor APIs.

## Validation

User comprehension and workflow studies, accessibility, scale, permissions, partial coverage, and golden customer scenarios.
