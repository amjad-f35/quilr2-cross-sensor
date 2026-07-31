# Endpoint sensor fixture corpus

These files are sanitized analysis fixtures. None is represented as captured
production telemetry.

Each wrapper contains:

- `evidence_label`: `Generated` or `Proposed`;
- `runtime_observed`: always `false` in this pass;
- `fixture_class`: normal, minimal, invalid, duplicate, out-of-order, late,
  sensitive, redacted, offline/replayed, enforcement success/failure, partial
  or unsupported-version;
- `source_basis`: the verified native symbol/schema or proposed target chapter;
- `payload`: current-shape input or proposed target-shape record.

`Generated` means constructed from verified source fields. `Proposed` means it
exercises the target integration contract and is not an implemented wire
schema. The `expected/fixture-expectations.json` file states the expected
admission/materialization behavior.

No fixture contains a usable credential, real tenant, real email, real path or
real prompt. Strings such as `tok_TEST_REDACT_ME` are synthetic detector
canaries and must never be copied into an accepted output.

## Coverage

| Directory | Purpose |
| --- | --- |
| `raw/` | current native input shapes, malformed input and safe detector canary |
| `source-observations/` | proposed normal/minimal/duplicate/late/replay/redacted/version cases |
| `entity-candidates/` | unresolved identifier/entity inputs |
| `relationship-assertions/` | native graph edges |
| `canonical-event-candidates/` | action-stage candidate records |
| `metric-samples/` | bounded operational metric examples |
| `health/` | component/coverage degraded state |
| `control-commands/` | proposed authorized/idempotent command input |
| `control-results/` | attempted/effect-verified success and failure |
| `expected/` | expected handling for every fixture |

Captured runtime replacements should be sanitized, reviewed and given a new
`evidence_label: Captured test` with environment/build metadata.

