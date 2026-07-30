# LG-008 Five-Profile Source Authority

This directory is the generated, content-addressed static source authority for
Browser, Browser Backend, Endpoint, LLM Gateway and MCP Gateway. It closes
`LG-008`; it does not replace `LG-005` native artifact/runtime certification.

## Authority files

| File | Purpose |
|---|---|
| `authority-manifest.json` | Selected immutable revisions, input/output digests, counts and assurance boundary |
| `profile-admission.csv` | Five-profile admission verdict and per-profile counts |
| `record-catalog.csv` | Globally keyed native record catalog |
| `native-field-disposition.csv` | Globally keyed field-level collection, privacy and target disposition |
| `access-recipes.csv` | Exact selected-checkout retrieval or authority-query plus pinned-revision search recipe |
| `current-source-delta-files.csv` | Browser, Browser Backend and MCP historical-to-current delta classification |
| `target-field-traceability.csv` | Every typed profile target field and its source/derivation/support state |
| `saturation-pass.json` | Two independently regenerated zero-drift passes, bound to generated digests |

## Reproduce

From `implementation-freeze/`, with `CONSOLIDATE_ROOT` pointing at the
Consolidate evidence workspace:

```bash
node tools/run-lg008-saturation.mjs
node tools/validate-lg008-authority.mjs
node tools/query-lg008-authority.mjs --profile endpoint --record AgentData
```

`OPTIONAL_NOT_CURRENTLY_SOURCED` is an explicit unsupported/unknown boundary,
not a completeness gap. `NEW_CAPTURE_REQUIRED_BY_FROZEN_CONTRACT` identifies
target instrumentation that must be implemented and certified before the
capability is advertised.
