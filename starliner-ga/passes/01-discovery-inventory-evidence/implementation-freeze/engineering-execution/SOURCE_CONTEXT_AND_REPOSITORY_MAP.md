# Source, Context and Repository Map

> Repository revisions and worktree states quoted here are dated evidence, not
> current program state or startup prerequisites. Reconcile live Git only for
> repositories touched by the active product increment. Do not repeat the
> organization-wide inventory before coding.

Set:

```text
CONSOLIDATE_ROOT=/Users/t4ctic4l/Documents/Codex/Consolidate
```

The paths below are evidence and planning inputs. They are not development
worktrees unless explicitly marked. On the Ubuntu server, clone this authority
repository and authorized source repositories; do not copy a shallow analysis
snapshot and start committing from it.

Cloud and remote agents that do not have `CONSOLIDATE_ROOT` use the
[portable cloud-agent context](../cloud-context/README.md). It carries the
selected dossiers, matrices, schemas, fixtures and repository references
byte-for-byte with source paths and SHA-256 digests. It is source evidence,
not a second implementation authority.

## Normative implementation authority

| Purpose | Location |
|---|---|
| Complete cross-sensor package | `$CONSOLIDATE_ROOT/docs/quilr2-cross-sensor` |
| GA corpus index | `$CONSOLIDATE_ROOT/docs/quilr2-cross-sensor/starliner-ga/README.md` |
| Bounded pass index | `$CONSOLIDATE_ROOT/docs/quilr2-cross-sensor/starliner-ga/passes/01-discovery-inventory-evidence/README.md` |
| Implementation freeze | `$CONSOLIDATE_ROOT/docs/quilr2-cross-sensor/starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/README.md` |
| Coding handoff | `implementation-freeze/23-production-implementation-handoff.md` |
| Pre-code design closure | `implementation-freeze/32-pre-code-system-design-closure.md` |
| Execution kit | `implementation-freeze/engineering-execution/README.md` |
| Portable source-intelligence payload | `implementation-freeze/cloud-context/README.md` |
| Five-profile generated source authority | `implementation-freeze/lg008/` |
| All 377 organization repositories classified | `implementation-freeze/registers/github-repository-relevance.csv` |
| Selected immutable source/build evidence | `implementation-freeze/evidence/github/selected-revision-and-build-evidence.json` |

GitHub authority repository:
[amjad-f35/quilr2-cross-sensor](https://github.com/amjad-f35/quilr2-cross-sensor).
Agents pin a commit; they never consume an unqualified moving branch as
semantic authority.

## Production implementation repositories

| Area | Repository | Audited source baseline (historical) | Required treatment |
|---|---|---|---|
| Central Starliner protocol and DIE backend | [quilrbusiness/project-starliner](https://github.com/quilrbusiness/project-starliner) | `main@b747393468045425b3f07a24775dcbc93d380cb5` at audit | Primary implementation repository; retain/refactor/compat according to `12-repository-and-delivery-map.md` and `module-disposition.csv` |
| Browser extension | [quilrbusiness/Project-Vanguard](https://github.com/quilrbusiness/Project-Vanguard) | `8e7a3e0c22c3ec29d0c642b211d59e9abc0071cb` | Add certified adapter/privacy/delivery at verified capture seam; do not add canonicalization |
| Browser native host | [quilrbusiness/project-sentinel](https://github.com/quilrbusiness/project-sentinel) | `6f55960ff5c3bf3cf1838985acd4155fc9f16334` | Preserve native identity and capture; implement signed local binding only from frozen contract |
| Browser Backend producer | [quilrbusiness/browser-extension-service](https://github.com/quilrbusiness/browser-extension-service) | `496b8c216025e5d21871f5959e61dcdd01836106` | Separate producer/profile; preserve legacy evidence semantics, never canonical authority |
| Current Browser/Endpoint relay context | [quilrbusiness/extension-log-service](https://github.com/quilrbusiness/extension-log-service) | `5b5b37516d0aacd4b1fec51a849eac73fe952c7f` | Consumer/context only; do not copy its legacy retry or delivery behavior into Starliner |
| Endpoint sensor | [quilrbusiness/sentinel-endpoint-agent](https://github.com/quilrbusiness/sentinel-endpoint-agent) | `a022e52bf2fff6a9445ebad96c3afeaf277e259f` | Add adapter and Starliner WAL at frozen seams; retain local enforcement/state, no central truth |
| LLM Gateway producer | [quilrbusiness/macrodata-refinement](https://github.com/quilrbusiness/macrodata-refinement) | `dev_main@92b0462c583b908f8ce0cadd1bc89d2e702f5a7d` | Current product code is authority for native capture; old open Starliner PRs are prototypes requiring disposition |
| MCP Gateway producer | [quilrbusiness/quilr-llm-gateway](https://github.com/quilrbusiness/quilr-llm-gateway) | `add_gateway@99f759d75aa8260f97db6904433c941647a755e5` | Existing merged MCP adapter/observe code is retain/refactor evidence, not target contract authority |
| Customer UI | [amjad-f35/quilr-platform-nuxt](https://github.com/amjad-f35/quilr-platform-nuxt) | local `main@8c745c88e56cb6fc88a022415a596b5d436a5264` plus 117 dirty paths at audit | Recheck live Git; preserve any overlapping dirty work before edits; retain native Nuxt/Vue and source-owned shadcn-vue/Reka system under `35-nuxt-shadcn-ui-engineering-constitution.md`; replace fixture repository through generated DIE client |

Sensor placement and emitted profile kinds are frozen in
`implementation-freeze/14-sensor-adapter-bindings.md`. Field-level truth is in
`lg008/record-catalog.csv`, `lg008/field-catalog.csv`,
`lg008/target-traceability.csv`, field dispositions and relationship support.

## Analysis and evidence packages under Consolidate

| Package | Primary entry points | Use | Must not be used as |
|---|---|---|---|
| Better Console | `$CONSOLIDATE_ROOT/Better-Console-Analysis/README.md`; `docs/sensor-intelligence/better-console-backend/README.md`; `better-console-backend-analysis/README.md` | Verified current alternative-console behavior and legacy consumers | Quilr 2 backend or canonical authority |
| Browser + Browser Backend | `$CONSOLIDATE_ROOT/Browser-Extension-System/Browser-extension-sensor-analysis/ANALYSIS_STATE.md`; `outputs/browser-extension-sensor-intelligence/docs/sensor-intelligence/browser-extension/README.md`; `outputs/browser-backend-sensor-intelligence/docs/sensor-intelligence/browser-backend/README.md`; `outputs/lg008-browser-backend-central-pass/docs/lg008-global-reconciliation/README.md` | Source archaeology, native fields, routes, lineage, access recipes, combined reconciliation | Current moving source without the LG-008 delta reconciliation |
| Browser complete archive | `$CONSOLIDATE_ROOT/Browser-Extension-System/Browser-Extension-Analysis-Complete-2026-07-30.zip`; checksum beside it | Immutable historical package and portable evidence | Development checkout |
| Endpoint | `$CONSOLIDATE_ROOT/ENDPOINT-AGENT-ANALYSIS-COMPLETE/README.md`; `docs/sensor-intelligence/endpoint-sensor/README.md`; `docs/lg008-endpoint-reconciliation/README.md`; `repository-analysis/README.md` | Endpoint capture, models, IPC, field/relationship/access evidence | Proof of unsupported entitlement or runtime certification |
| LLM Gateway | `$CONSOLIDATE_ROOT/LLM-GATEWAY-ANALYSIS/WORKSPACE/docs/sensor-intelligence/llm-gateway/README.md`; `WORKSPACE/docs/lg008-llm-gateway-reconciliation/README.md`; `WORKSPACE/lg008-llm-gateway/` | Reachable routes, serialized/stored fields, runtime fixture evidence and reconciliation | The rejected 26,292-key lexical catalog |
| MCP Gateway | `$CONSOLIDATE_ROOT/MCP-GATEWAY-ANALYSIS-COMPLETE/README.md`; `analysis/mcpgateway-repository-analysis/README.md`; `analysis/lg008-mcpgateway-reconciliation/docs/lg008-global-reconciliation/README.md` | Protocol, route, storage, capability and access evidence | Current source without the reconciled 32-file delta |
| Quilr 1 | `$CONSOLIDATE_ROOT/Quilr1-Platform-Analysis/README.md`; `quilr-platform-analysis/README.md`; `docs/sensor-intelligence/quilr1-platform/README.md` | Historical platform/data-flow context and mistakes to avoid | Runtime dependency, migration scope or Quilr 2 authority |
| Project Starliner audit | `$CONSOLIDATE_ROOT/project-starliner-audit/README.md` | Verified starting implementation and tests | Frozen target architecture |
| Organization source snapshot | `$CONSOLIDATE_ROOT/Org-Recon-2026-07-30/` | Read-only selected repository source at the source-saturation date | Branch for new development |

The authoritative disposition of every analysis input is
`implementation-freeze/registers/source-analysis-inputs.csv`. When an analysis
and generated LG-008 authority disagree, use LG-008 and its pinned evidence.

## Legacy context only

These repositories explain current Quilr 1 and Better Console behavior but are
not target dependencies:

- [quilrbusiness/quilr-web](https://github.com/quilrbusiness/quilr-web)
- [quilrbusiness/quilr-query-builder](https://github.com/quilrbusiness/quilr-query-builder)
- [quilrbusiness/quilr-ai-config-manager](https://github.com/quilrbusiness/quilr-ai-config-manager)
- [quilrbusiness/quilr-platform-analytics-backend](https://github.com/quilrbusiness/quilr-platform-analytics-backend)
- graph/cache/legacy ingestion services identified in the repository-relevance
  register.

No migration, dual-run, legacy backfill or legacy decommission implementation
is authorized in this bounded pass.

## Context-loading rule

Do not attach every analysis directory to every agent prompt. Start from the
freeze and load source evidence progressively:

```text
active work item
→ exact normative contract/register
→ selected LG-008 record/field/access rows
→ relevant sensor dossier section
→ pinned source file and test
```

This preserves context capacity without weakening evidence.

When the full local analysis is unavailable, replace “relevant sensor dossier”
with its path in `cloud-context/payload/`. Never compensate by recursively
re-analyzing all organization repositories or treating the bundled dossier as
current runtime proof.
