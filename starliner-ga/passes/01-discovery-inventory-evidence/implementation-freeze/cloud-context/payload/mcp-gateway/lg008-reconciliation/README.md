# LG-008 reconciliation — MCP Gateway contribution

## Decision

`LG008_OPEN`

This directory is the MCP Gateway contribution to the single global LG-008
evidence-merger mission. It is not a five-profile merger and does not claim
global closure.

The user deliberately limited this run to MCP Gateway. Consequently:

- MCP Gateway has a source-grounded admission package, deterministic stable
  IDs, evidence, catalogs, access recipes, observability boundaries, lineage,
  freeze reconciliation, contradictions, proposed diffs, and validators.
- Browser, Browser Backend, Endpoint, and LLM Gateway have profile IDs only.
  They are `REJECTED_INCOMPLETE` in this scoped admission report because their
  evidence was not consumed.
- Frozen architecture files were not edited.
- Proposed diffs and change requests remain proposals.

## Exact authorities

| Authority | Revision |
| --- | --- |
| MCP Gateway source | `quilr-llm-gateway@1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`, `mcpgateway/` only |
| Frozen-package Git base | `docs/quilr2-cross-sensor@513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc` |
| Frozen-package content snapshot | `sha256:e2561211b7d8cf368d759b96dc5ba16e146e26c5887585be460cc50b7fcaec41` |
| Frozen-package status | source-corrected freeze candidate; static validation required; P0 live gates open |
| Current branch after source snapshot | `99f759d75aa8260f97db6904433c941647a755e5`; 32-path delta not merged |

## Measured contribution

| Artifact | Count |
| --- | ---: |
| Stable IDs | 1,523 |
| Evidence items | 595 |
| Pinned source files | 351 |
| Frozen artifacts hashed | 74 |
| Components / entry points | 15 / 13 |
| Features / capabilities | 18 / 18 |
| Native records / events | 13 / 20 |
| Frozen MCP messages / target fields | 10 / 118 |
| Native fields / relationships | 31 / 12 |
| Persisted artifacts | 9 |
| Health / diagnostic signals | 15 / 9 |
| Authorized-access recipes | 76 |
| Runtime experiments | 3 |
| Lineage edges | 31 |
| Contradictions / proposed diffs / change requests | 6 / 6 / 6 |
| Unresolved evidence items | 9 |

## Reading order

1. [Mission authority and scope](00-mission-authority-and-scope.md)
2. [Input admission](01-input-admission-report.md)
3. [Frozen authority manifest](02-frozen-authority-manifest.md)
4. [Global stable IDs](03-global-stable-id-registry.md)
5. [Evidence manifest](04-global-evidence-manifest.md)
6. [Components and entry points](05-component-and-entry-point-merger.md)
7. [Features and capabilities](06-feature-and-capability-merger.md)
8. [Events, messages, and records](07-event-message-and-record-merger.md)
9. [Field register](08-global-field-register.md)
10. [Relationship claims](09-relationship-claim-merger.md)
11. [Authorized-access cookbook](10-authorized-access-cookbook.md)
12. [Negative observability](11-negative-observability-matrix.md)
13. [Runtime evidence](12-runtime-evidence-merger.md)
14. [Source-to-adapter reconciliation](13-source-to-adapter-reconciliation.md)
15. [End-to-end lineage](14-end-to-end-lineage.md)
16. [Source-to-target coverage](15-source-to-target-coverage.md)
17. [Freeze reconciliation](16-freeze-reconciliation.md)
18. [Proposed diffs](17-proposed-reconciliation-diffs.md)
19. [Contradictions and change control](18-contradictions-and-change-control.md)
20. [Validator results](19-validator-design-and-results.md)
21. [Unresolved evidence](20-unresolved-evidence-register.md)
22. [Saturation pass](21-final-saturation-pass.md)
23. [Closure report](22-closure-report.md)
24. [Coverage](23-global-coverage.md)
25. [Continuation state](ANALYSIS_STATE.md)

## Machine-readable authority

- [Global ID registry](../../lg008/registries/global-id-registry.yaml)
- [Evidence registry](../../lg008/registries/evidence-registry.ndjson)
- [Target-contract registry](../../lg008/registries/target-contract-registry.yaml)
- [MCP target-field coverage](../../lg008/reconciliation/target-field-coverage.csv)
- [Contradictions](../../lg008/reconciliation/contradictions.csv)
- [Validation report](../../lg008/reports/lg008-validation.md)
- [Closure result](../../lg008/reports/lg008-closure.json)

Run all mechanical validators with:

```bash
./validate-lg008
```

The command intentionally exits nonzero while closure blockers remain.
