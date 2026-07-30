# ADR-0015: Correlation identifiers, not universal traces

Status: **accepted**

## Context

W3C trace context represents causal distributed transactions. Scans, heartbeats, snapshots, and independent observations are not spans in one trace. Pretending otherwise creates misleading lineage and unbounded traces.

## Decision

Propagate `traceparent` only when a real causal transaction crosses components. Use observation IDs, execution IDs, source request IDs, snapshot/reconciliation IDs, and bounded correlation decisions for other relationships.

## Consequences

- Causal traces remain useful.
- Independent evidence is correlated centrally with recorded confidence.
- Schemas support several explicit correlation types.
- UI can distinguish direct causal lineage from inference.

## Rejected

One trace for a scan/day/device or synthesizing trace parentage for unrelated sensor events.

## Validation

Gateway-to-provider/tool causal calls, browser/endpoint independent observation, reconciliation scans, late correlation, and trace cardinality/load.
