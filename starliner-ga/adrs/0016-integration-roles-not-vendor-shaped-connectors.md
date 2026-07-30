# ADR-0016: Integration Roles, Not Vendor-Shaped Connectors

Status: **accepted**

## Context

The source material used “sensor,” “connector,” “integration,” “BFF,” “control adapter,” and “response action” inconsistently. A single vendor integration can discover inventory, import telemetry, apply controls, and coordinate response, but those behaviors have different authority, permissions, reliability, and risk.

## Decision

Classify every integration capability as one or more separately governed roles:

1. runtime sensor;
2. discovery connector;
3. telemetry importer;
4. control/PEP connector;
5. response connector.

Each role has distinct manifest capabilities, credentials/scopes, health, certification, queues/cursors, authority, and kill switch. A package may combine roles without transferring authority between them.

Normal product reads use unified canonical APIs. Native integration APIs are used for source collection, certified control, health, and response—not as page-specific BFFs.

## Consequences

- Connector implementation and administration become role-aware.
- Read and write credentials can be separated.
- Product claims state whether they come from discovery, runtime observation, telemetry import, or verified control.
- A failing response integration does not invalidate source evidence.
- A discovery connector cannot imply execution, and a control receipt cannot imply verified effect.

## Rejected

- one undifferentiated `connector` capability;
- one platform BFF per sensor/vendor for normal UI;
- importing external rows directly into canonical tables;
- allowing response/ticket state to become canonical finding authority.
