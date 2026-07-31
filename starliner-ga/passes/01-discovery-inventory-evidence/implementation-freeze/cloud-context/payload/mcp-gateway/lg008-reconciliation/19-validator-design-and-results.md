# Validator design and results

## Command

```bash
./validate-lg008
```

The command runs all validators, emits JSON, Markdown, JUnit XML, and closure
JSON, then exits nonzero when any `ERROR` exists.

## Latest result

- Validation: `FAIL`
- Closure: `LG008_OPEN`
- Errors: 19
- Change-control-required: 11
- Warnings: 16
- Informational: 0

## Validator matrix

| Validator | Result | Material outcome |
| --- | --- | --- |
| Stable IDs | PASS | 1,523 unique valid URNs; no orphan registry references |
| Source coverage | PASS with change control | 351/351 pinned files; post-pin revision not saturated |
| Proof status | PASS | controlled values and evidence links present |
| Reachability | PASS | no source-only enabled/reachable claims |
| Disposition | PASS | exactly one controlled disposition per catalog row |
| Producer/consumer | PASS with 16 warnings | source producers valid; frozen central consumers unresolved |
| Fields | PASS | provenance, producer, meaning, evidence, mapping checks pass |
| Access recipes | PASS | 76 valid recipes; no credential/production recipe |
| Evidence links | PASS | pinned Git-object and workspace digests match |
| Schemas | PASS | local schemas parse; 74-file freeze validator passes |
| Lineage | PASS | 31/31 source fields terminate |
| Observability | FAIL | four non-MCP profile columns intentionally unavailable |
| Runtime evidence | FAIL | two old aggregate runs lack retained transcripts |
| Freeze reconciliation | PASS with 10 change-control findings | required/contradicted target fields remain open |
| Ownership | FAIL | five required owner roles unassigned/unresolved |
| Closure | FAIL | four rejected profiles, blockers, and no global saturation |

## Intentional failures

These failures are evidence, not validator defects:

- other-profile observability cannot be filled from MCP evidence;
- old raw runtime artifacts do not exist;
- target/adapter/remediation owners are not named;
- global closure conditions are not met.

## Reports

- [JSON](../../lg008/reports/lg008-validation.json)
- [Markdown](../../lg008/reports/lg008-validation.md)
- [JUnit XML](../../lg008/reports/lg008-validation.junit.xml)
- [Closure JSON](../../lg008/reports/lg008-closure.json)

Individual validator entry points are under `lg008/validators/`.
