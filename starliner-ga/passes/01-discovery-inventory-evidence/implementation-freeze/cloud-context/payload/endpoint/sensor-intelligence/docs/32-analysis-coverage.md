# 32 — Endpoint Sensor Intelligence Analysis Coverage

## Coverage semantics

This ledger measures the specialized sensor pass. “Complete” means every
required subject/artifact has a source-grounded disposition at the pinned
commits. It does not mean production runtime, every deployment or target
platform was dynamically verified.

## Final coverage

| Metric | Count/status |
| --- | --- |
| Prior source inventory records accounted for | 1,265/1,265 |
| Pinned revisions reverified | 4/4 |
| Required narrative files | 35/35 |
| Additional final decision sheet | 1 |
| Required YAML schemas | 9/9 |
| Required CSV matrices | 29/29 |
| Additional input ledger CSV | 1 |
| Required fixture directories | 10/10 |
| Fixture JSON files | 18 |
| Features | 63/63 dispositioned |
| Utilities/subsystems | 58/58 dispositioned |
| Runtime entry points | 37 |
| Capture points | 58 |
| Native record families | 66/66 |
| Native fields/variant payloads | 639/639 |
| Per-field platform mapping | 639/639 |
| Per-field privacy disposition | 639/639 |
| High-value field lineages | 60 |
| Inventory entities | 51 |
| Identifiers / identity coverage cases | 30 / 15 |
| Relationships | 40 |
| Native events / mappings | 47 / 20 |
| Metrics | 50 |
| Logs/traces/audit surfaces | 16 |
| Detectors/classifiers | 24 |
| Controls | 28 |
| Interfaces / extraction points | 52 / 22 |
| Adapter components | 22 |
| Cross-sensor overlaps | 30 |
| Product dispositions | 799 |
| Finding candidates | 32 |
| Coverage rows / health metrics | 28 / 40 |
| Gaps / MVS items | 50 / 30 |
| Acceptance scenarios | 34 |
| Open questions | 72 |
| Dynamic endpoint tests in specialized pass | 0 |
| Static artifact validators | Passed |

## Native-field closure

`native-fields.csv` contains 639 unique field IDs across all 66 native record
families. The same 639 IDs appear exactly once in:

- `platform-contract-mapping.csv`;
- `privacy-disposition.csv`.

`product-disposition.csv` contains:

- 639 field rows;
- 63 feature/capability rows;
- 47 event rows;
- 50 metric rows;
- 799 total rows.

The initial intermediate checkpoint counted 640 native rows. That count was
corrected to 639 after replacing an inaccurate `ChangeEvent` payload model with
the exact source variants:

- `Added(Uuid)`;
- `GovernanceUpdated(Uuid)`;
- `Rediscovered(Uuid)`;
- `Removed(Uuid)`.

## Required deliverable closure

### Narrative

- [x] Input scope and immutable commits
- [x] Sensor role/boundaries/modes
- [x] Feature and utility catalogs
- [x] Runtime lifecycle
- [x] Capture surfaces
- [x] Native records/fields/lineage
- [x] Discovery/inventory
- [x] Identity/attribution
- [x] Relationships/events/metrics/evidence
- [x] Detection/control
- [x] Interfaces/extraction
- [x] Adapter/Starliner/outbox/platform mapping
- [x] Cross-sensor/product/findings
- [x] Coverage/health/privacy
- [x] Runtime verification boundary
- [x] Gaps/responsibilities/MVS
- [x] Acceptance/open questions
- [x] Final decision sheet

### Machine-readable

- [x] Nine required YAML schemas
- [x] Twenty-nine required CSV matrices
- [x] Input ledger
- [x] Per-field platform and privacy closure
- [x] Required fixture directory structure
- [x] All mandatory fixture classes

## Mandatory semantic checks

- [x] Captured, parsed, enriched, stored, emitted, delivered, acknowledged,
  materialized and displayed remain distinct.
- [x] Configured, registered, discovered, observed, active and recently used
  remain distinct.
- [x] Requested, authorized, attempted, succeeded and effect-observed remain
  distinct.
- [x] Native identity candidates are not canonical entity IDs.
- [x] Logs are not represented as structured events unless a structured path
  exists.
- [x] Sampled/conditional visibility is not represented as complete coverage.
- [x] Absence is gated by health/scope/freshness/late/clock evidence.
- [x] Detector, policy, enforcement and finding semantics remain separate.
- [x] Planned/dormant/placeholder behavior is labeled.

## Validation results

- 30/30 CSV files parse; no blank or width-mismatched rows.
- 9/9 YAML files parse.
- 18/18 fixture JSON files parse and contain `evidence_label`.
- All local Markdown links in the sensor documentation resolve.
- Required file/directory inventory matches the mission.
- All fixture data is synthetic/sanitized and labeled non-runtime.

## Files intentionally excluded from new symbol analysis

No source file was silently excluded. Symbol/file accountability is inherited
from the completed 1,265-path repository archaeology. Generated/vendored/build
artifacts remain grouped according to that verified inventory. This pass
reopened sensor-relevant source paths and reused the prior symbol evidence
instead of duplicating all 1,265 file descriptions.

## Remaining evidence gaps

The 72 questions in [31-open-questions.md](31-open-questions.md) require
platform ownership, deployed configuration, live service or supported OS
evidence. They are classified and do not prevent completion of the pinned-
source analysis; the contract-blocking subset prevents production MVS
implementation.

Dynamic gaps include:

- production build/test execution;
- macOS/Windows driver/extension/proxy route matrix;
- live parser/capture values and data-loss rates;
- final process action effects;
- Starliner admission/outbox recovery;
- deployed ACL, credentials, privacy, retention and deletion;
- cross-sensor late/coverage correlation.

## Completion status

**Complete for pinned-source sensor intelligence and required deliverables.**

**Partial for runtime certification and live integration.** No claim is made
that the endpoint currently emits the proposed platform contracts or that its
coverage is exhaustive.

