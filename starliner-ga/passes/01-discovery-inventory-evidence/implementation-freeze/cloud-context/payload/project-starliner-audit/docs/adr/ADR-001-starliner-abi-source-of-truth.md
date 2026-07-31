# ADR-001: `starliner_contracts` is the Quilr 2 ABI source of truth

## Status
Accepted for M1.

## Context
The repository contains both the prototype `starliner` SDK contracts and the
platform-owned `starliner_contracts` package. Treating both as canonical allows
product adapters, schemas, golden traces, and certification results to diverge.

M1 introduces a production-shaped MCP observe runtime. It needs one stable
contract surface for record validation, fixture generation, certification, and
delivery-wrapper integrity checks.

## Decision

- New Quilr 2 sensor records, JSON schemas, golden traces, and certification
  assertions use `starliner_contracts` only.
- The M1 delivery payload is `DeliveryRecord { envelope, body }`. The
  `envelope` carries runtime provenance and integrity metadata; `body` remains
  the unmodified v1 canonical record.
- `SourceObservation`, `MetricEvent`, and `FindingSignal` are approved M1
  additions to `starliner_contracts`.
- The legacy `starliner` package is not an ABI dependency of new MCP runtime
  code. It may remain for existing behavior behind an explicitly documented
  compatibility boundary until it is retired.
- CI rejects new imports of the legacy ABI outside the legacy package and its
  tests. Existing imports are not silently rewritten in M1.

## Consequences

Product adapters must validate records against `starliner_contracts` and include
product-local certification coverage. The legacy prototype package cannot add
new sensor behavior by default.

The initial contract commit did not claim that Evidence Ingest accepted the
delivery wrapper. That boundary subsequently landed without changing the ABI:
`project-starliner/main@e611002f40f3fc9a4a4b896fb4039dab83082e93`
accepts the frozen `{"api_version":"v1","records":[{"envelope":{},"body":{}}]}`
request and returns only `accepted`, `duplicate`, or `rejected` per record.

## M1 closure amendment — 2026-07-15

MCP Observe v1 certifies and emits exactly:

```text
SourceObservation
ActionEvent
MetricEvent
FindingSignal
```

These canonical families remain available but are enhanced v1.1 coverage for
MCP unless separately implemented and certified:

```text
EntitySnapshot
RelationshipEvent
DecisionResult
TraceSpan
SensorHealthEvent
```

A sensor is not required to emit every canonical family on day one. Every
family it does emit must be registered in `starliner_contracts`, payload-safe,
covered by product certification, and accepted by ingest. This amendment
changes the M1 capability declaration, not the frozen ABI.
