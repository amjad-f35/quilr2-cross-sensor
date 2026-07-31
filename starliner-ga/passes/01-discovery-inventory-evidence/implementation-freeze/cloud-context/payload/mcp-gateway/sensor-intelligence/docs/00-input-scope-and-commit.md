# Input scope and commit

## Sensor declaration

| Attribute | Value | Evidence status |
| --- | --- | --- |
| Sensor name | MCP Gateway | `Verified in source` |
| Sensor type | MCP gateway with browser administration, workflow control, and auxiliary processes | `Verified in source` |
| Repository | `github.com/quilrbusiness/quilr-llm-gateway` | `Verified in source` |
| Branch | `add_gateway` | `Verified in source` |
| Scoped path | `mcpgateway/` only | `Verified in source` |
| Pinned commit | `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a` | `Verified in source` |
| Commit date/subject | 2026-07-28, `box fix` | `Verified in source` |
| Subject worktree at start | clean | `Runtime verified` by local `git status --short` |
| Subject worktree at final handoff | clean at `99f759d75aa8260f97db6904433c941647a755e5` | `Runtime verified`; branch fast-forwarded after the evidence snapshot |
| Existing analysis | `outputs/mcpgateway-repository-analysis/` | `Verified in source` |
| Cross-sensor corpus | `docs/quilr2-cross-sensor/` | `Verified in source`; target/proposed authority |
| Output root | `outputs/mcpgateway-sensor-intelligence/` | Created for this mission |

## Sensor-specific input ledger

| Input | Type | Version/commit | Purpose | Sensor relevance | Status |
| --- | --- | --- | --- | --- | --- |
| `work/quilr-llm-gateway-add_gateway/mcpgateway/` | Primary sensor source | `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a` | Current implementation, schemas, tests, assets, scripts, and configuration | Normative evidence for current behavior | `Verified in source`; 351 tracked files |
| `outputs/mcpgateway-repository-analysis/` | First-pass repository analysis | Pinned to the same commit | File/symbol/interface/state/test evidence index | Required starting evidence, not a substitute for source tracing | 71 files, 61 Markdown documents; static coverage complete, runtime coverage partial |
| `mcpgateway/starliner/` and Starliner DB/routes/tests | Current sensor telemetry implementation | Same sensor commit | Observe mapping, payload safety, outbox, delivery, manifest, health, and self-test | Primary current adapter boundary | `Implemented` but optional/private-package dependent; detailed second-pass tracing pending |
| `services/starliner_adapter.py` and related tests | Legacy policy integration | Same sensor commit | Pre-tool shadow/enforce decision path | Current/compatibility control boundary | `Implemented` optional compatibility path; private dependency unresolved |
| `docs/quilr2-cross-sensor/` | Cross-sensor architecture corpus | Git base `513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc` plus a modified `README.md` and untracked `starliner-ga/` working tree | Canonical identity, observation, event, relationship, product, and migration target | Proposed platform and adapter boundary | Working-tree content must be hash-pinned per file; not evidence of current sensor behavior |
| `starliner-ga/profiles/03-mcp-gateway-source-profile.md` | Normative target profile | SHA-256 `95393b00795022ca2e2a3a7bec4984c1b265137acc60e520a7814541f0982029` | Defines target MCP source authority, safety, lifecycle, and certification | Target capability/profile contract | Read; `Proposed` relative to current sensor |
| `starliner-ga/implementation/15-mcp-gateway-sensor-binding.md` | Current-code target binding | SHA-256 `25decb2c0b5655ae632f43637935e44479222d5887bf86e92c98cde20c2f3057` | Reconciles current seams with target changes | Build-plan input | Read; current claims must still be reverified against source |
| `starliner-ga/contracts/starliner-envelope.schema.json` | Target wire meta-contract | SHA-256 `3eddc97d55a0009a1eb545f4c3b1ca716a25340f5d51bf8ea1537daf9284fdae` | Envelope identity, time, sequence, privacy, integrity, and correlation | Adapter target | Machine-readable target; current conformance pending |
| `starliner-ga/contracts/source-profile.schema.json` | Target profile meta-contract | SHA-256 `828e710254c362dd3a312d2de033128aaaf39125a96b1b15459a8a95b4f5d628` | Capability, coverage, authority, lifecycle, privacy, certification | Capability-manifest target | Machine-readable target; current conformance pending |
| `starliner_contracts` package source | External contract runtime | Sensor certification pin `860079c312c13f842b5804a590fa1d5430860286` | Current Python mapping/model imports and tests | Required to validate current observe records | `Verified in source`: the pin is declared by `services/starliner_mcp_certification.py::CONTRACT_COMMIT`; the local `project-starliner-audit` checkout contains the commit and it is an ancestor of its current HEAD. Two promised Git objects were not locally materialized, so exact-commit inspection of `signals.py` and `validation.py` remains partial. |
| Private/legacy `starliner.adapters` package | External policy SDK | Version/commit unavailable | Legacy pre-tool decision runtime | Required to runtime-verify shadow/enforce behavior | `Unresolved` |
| Remote MCP/OAuth/IdP/DLP/ZIA/ClickHouse/Google/embedding/runner services | External systems | Effective versions/endpoints unavailable | Live integration behavior | Determines operational coverage and delivery semantics | `Unresolved`; mocked or unavailable in recorded tests |
| `project-starliner-audit/` | Related local Starliner implementation/audit repository | HEAD `b747393468045425b3f07a24775dcbc93d380cb5`; sensor-pinned contract ancestor `860079c312c13f842b5804a590fa1d5430860286`; untracked `.venv312/` | Local source for the ABI pinned by the sensor certification code, plus newer audit/reference work | Current contract cross-check only at the pinned ancestor; newer HEAD is not current-sensor evidence | `Verified in source` for the pinned ABI relationship. `Unresolved` whether newer HEAD is an intended upgrade authority. |

## First-pass evidence quality

| Measure | Result |
| --- | ---: |
| Tracked sensor files accounted for | 351 / 351 |
| Text-decodable files | 346 |
| Binary/opaque files classified | 5 |
| Python files parsed | 259 / 259 |
| Rust files indexed | 16 |
| Indexed symbols and assignments | 6,584 |
| Python gateway HTTP/WebSocket operations | 275 |
| Workflow-runner operations | 25 |
| Rust Axum routes | 45 |
| FastMCP tools/resources | 18 |
| Python test functions | 663 |

`Runtime verified:` the recorded default Python suite produced 568 passed,
6 failed, and 1 xfailed. The separately collectable top-level files produced
112 passed, 10 failed, 1 skipped, and 33 passing subtests. This is not line,
branch, integration, or production coverage.

## Starliner ABI reconciliation

`Verified in source:` `mcpgateway/services/starliner_mcp_certification.py`
defaults `CONTRACT_COMMIT` to
`860079c312c13f842b5804a590fa1d5430860286`. The local
`project-starliner-audit` Git graph contains that commit and reports it as an
ancestor of HEAD `b747393468045425b3f07a24775dcbc93d380cb5`.

The following exact-commit contracts were inspected at the pin:

- `starliner_contracts/base.py`
- `starliner_contracts/decision.py`
- `starliner_contracts/events.py`
- `starliner_contracts/metrics.py`
- `starliner_contracts/observations.py`
- `starliner_contracts/delivery_envelope.py`
- `starliner_contracts/manifest.py`

`Unresolved:` the partial local Git clone did not contain the promised objects
needed to render exact-commit `starliner_contracts/signals.py` and
`starliner_contracts/validation.py`. Git attempted to materialize those objects
from the promisor remote, but the analysis environment had no DNS access. The
working-tree versions were inspected only as compatibility context. Git history
shows a post-pin `signals.py` change (`3b7b82e`, “Extend LLM QFG observe
vocabulary”), so its expanded signal-type enumeration is not attributed to the
pinned MCP ABI. No post-pin `validation.py` change appeared in the available
path history, but this is not equivalent to inspecting the missing pinned blob.

## Scope boundary

Current sensor claims are limited to the pinned `mcpgateway/` subtree. Parent
repository scripts, deployment files, secret helpers, and private packages are
external inputs unless separately supplied and pinned.

The cross-sensor and Starliner corpora define `Proposed` target behavior. They
cannot upgrade a source capability from missing, partial, or runtime-unverified
to implemented.

### Post-snapshot branch drift

`Verified:` at 2026-07-30 10:21:38 -0700, after the analysis snapshot had been
fixed, the local `add_gateway` branch was fast-forwarded from
`1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a` to
`99f759d75aa8260f97db6904433c941647a755e5`. The final worktree is clean.

The later commit contains 356 tracked files under `mcpgateway/`, versus 351 at
the pin. Relative to the pin, 27 scoped files are modified and 5 are added
(4,165 insertions and 322 deletions). The additions include protocol-cache,
streamable-HTTP, and associated test/source files.

`Unresolved for this dossier:` those post-pin changes were detected and
quantified but were not folded into the pinned inventory, symbol catalog,
feature matrices, tests, or Whimsical boards. This is deliberate snapshot
discipline rather than evidence that the later behavior is absent. A new
analysis version must select `99f759d...` (or another explicit commit) as its
authority and re-run every coverage phase.

## Phase-order guard

No platform field, metric card, customer finding, or adapter mapping is admitted
until the relevant implemented feature, capture point, native record, native
field, transformation, persistence, and output path are traced.
