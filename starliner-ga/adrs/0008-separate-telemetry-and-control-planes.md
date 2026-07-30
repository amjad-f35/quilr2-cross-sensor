# ADR-0008: Separate telemetry and control planes

Status: **accepted**

## Context

Evidence collection is high-volume and tolerant of delay; control requires stronger authorization, bounded targets, expiry, replay defense, safety, and cancellation. Combining them confuses trust and failure behavior.

## Decision

Use separate logical and operational channels for telemetry and commands. Policy/decision/approval centrally authorizes typed commands. Sensors execute only certified capabilities and report outcomes/effects through evidence.

## Consequences

- Visibility can continue when automation is stopped.
- Command availability and SLO differ from telemetry.
- Execution success and observed effect are distinct.
- Independent emergency stops and incident handling are required.

## Rejected

Opaque commands embedded in telemetry acknowledgements or arbitrary remote execution.

## Validation

Replay, confused deputy, expiry, wrong target, partial execution, cancellation, network partition, kill switch, and independent effect observation.
