# Detection and Classification

The classifier ledger is
[`detectors.csv`](../../../matrices/sensor-intelligence/quilr1-platform/detectors.csv).
It contains 15 mechanisms. Most are consumers, filters, label enrichers,
validators, or presentation classifiers—not native detectors.

## Detector boundary

Quilr 1 reads detector output from legacy alert/compliance/password/red-team
rows and external services. The code does not show the original models/rules
that generated most observations. It therefore cannot claim native detection
coverage, false-positive rates, or model versions.

```text
upstream detector (outside target)
→ legacy row
→ Quilr filter/group/map/enrich
→ dashboard/status/whitelist
```

The target imports the row as `FindingSignal` with source provenance. Central
finding admission remains independent.

## Finding mapping and criticality

`FindingsCacheInitializer` loads use-case and behavior names from Neo4j into
mutable static maps with `putIfAbsent`; POSTURE graph loading is disabled.
Static mappings coexist. Unknown IDs render “Unknown” labels.

`FindingsConstants.buildRiskLevelCondition` maps current criticality strings:

| Requested label | Native condition |
| --- | --- |
| Very High | `criticality = '1'` |
| High | `criticality = '2'` |
| Moderate | `criticality = '3'` |
| Low | `'4'` or not in `'1','2','3','5'` |
| Very Low | `criticality = '5'` |

Unknown requested labels add no condition, eventually yielding `1=1`.
This is query classification, not severity governance.

## Application risk band

`TenantAppsProcessor` calculates a rounded 24-hour average of
`qae.risk_score`, substituting `0.2` for null values and NaN aggregate, then
assigns:

```text
<= 0.2  Very Low
<= 0.4  Low
<= 0.6  Moderate
<= 0.8  High
else    Very High
```

This is verified derived labeling. Missing source data becomes a numeric
default, so the label lacks an explicit unknown state and coverage
denominator. Treat it as a legacy metric/badge until redefined.

## Interaction classifiers

`SubproductStrategy.forSource` selects browser, endpoint, LLM, or MCP query
logic. Null/unknown values default to browser extension. Each strategy also
defines a “sensitive” expression based on nonempty source columns.

The advanced-search parser validates allowed fields/operators and binds
values. These are useful query mechanisms, but:

- source selection is a caller claim;
- nonempty category/control is not a sensitivity taxonomy/confidence;
- syntax validity is not semantic truth;
- unknown source silently falling back can misclassify provenance.

## Other classification mechanisms

- password whitelist services map four behavior families to fixed IDs/names;
- hero duration selects hourly, daily, or “yearly” from request span;
- red-team mapping transforms MITRE/OWASP arrays while retaining originals;
- compliance processors present source events/scores/policy details;
- PostHog sanitizer classifies/removes credential-like analytics properties;
- ClickHouse ops uses lexical SQL classification;
- frontend route rules classify UI access;
- decoder validates request authentication.

Only the first four relate to product signals/analytics. The last four are
privacy, administrative, presentation, or request controls.

## False-positive and exception handling

Current false-positive/exception mechanisms are fragmented:

- password whitelisting;
- application/user approvals;
- status resolution;
- finding filters/status;
- policy/control external services;
- mapping/label fallbacks.

No common record links detector definition/version, signal, exception,
approver, scope, expiry, observed effect, and close/reopen behavior.

## Target disposition

| Current mechanism | Target |
| --- | --- |
| alert/detection row | `FindingSignal` |
| static/graph name mapping | versioned mapping release |
| risk/criticality band | metric/finding-definition input with explicit unknown |
| source strategy | adapter/table mapping provenance |
| search parser | compatibility query utility |
| whitelist/approval/status | control/exception/workflow records |
| SQL/route/auth classifier | operator/product control, not sensor detection |

## Unresolved

- upstream detector definitions, code, versions and calibration;
- source coverage and negative-observation semantics;
- true/false-positive labels and appeal workflow;
- live mapping graph and changes over time;
- compliance/risk score formula versions;
- MCP native detection/action semantics;
- deployed policy/control service behavior.
