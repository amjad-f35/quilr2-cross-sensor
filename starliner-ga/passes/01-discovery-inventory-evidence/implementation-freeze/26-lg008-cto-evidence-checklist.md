# LG-008 Evidence Acquisition Disposition

**Supersedes:** the earlier developer/CTO evidence-request checklist
**Machine authority:** [LG-008 evidence dispositions](registers/lg008-owner-inputs.csv)
**Source investigation:** [Quilr GitHub organization reconciliation](27-quilrbusiness-org-source-reconciliation.md)

## Direct answer

The CTO/user does not need to ask developers for another repository analysis,
source location, revision decision, dependency list or configuration inventory
for `LG-008`. Engineering has authenticated read access to the Quilr
organization and must derive those facts directly.

The prior checklist was wrong where it called the following unavailable or
owner-only:

- `extension-log-service`;
- `sentinel-macro-lib`, `ai-internal-sdks` and `ipc-event-bus`;
- Browser Backend Java libraries;
- Browser/Endpoint configuration repositories and routes;
- the complete current LLM/MCP gateway checkout;
- the PostgreSQL schema owner and current Browser extension read API;
- a source-revision selection for analysis.

Those items are now pinned in
[source revision selection](registers/source-revision-selection.csv) and
[selected GitHub evidence](evidence/github/selected-revision-and-build-evidence.json).

## Engineering-owned source rule

For every source family:

1. use the selected immutable default-branch checkout as the source-saturation
   cutoff;
2. record latest successful build and published release separately;
3. mark behavior after the last successful build as `SOURCE_ONLY`;
4. mark conditional code as `CONFIGURATION_GATED` or `BUILD_GATED`;
5. never require a live customer export to model a source capability;
6. never turn source presence into a deployed/enabled claim; and
7. move executable capture/integration proof to `LG-005` or `LG-006`.

This lets the target design include the complete source capacity without
fabricating present customer behavior.

## Engineering queue disposition

Every listed source-reconciliation action is complete. The immutable revisions,
five admissions, global IDs, field/record/access/target catalogs, delta
classifications and two-pass saturation evidence are retained in
[the generated authority](lg008/README.md). No developer answer remains for
static `LG-008`.

## What still requires an executable environment

These are not developer answers:

- supported Browser/OS/native/Endpoint execution and packaging: `LG-005`;
- LLM/MCP provider, streaming, registry and persistence execution: `LG-005`;
- cross-language signing/canonicalization parity: `LG-006`;
- PostgreSQL/ClickHouse/object-store behavior: `LG-001..003` and `LG-007`;
- live Nuxt/generated-client behavior: `LG-004`.

If the company later wants to claim “this exact customer deployment currently
enables capability X,” the claim needs the deployed artifact digest and
redacted effective configuration. That evidence is operational truth, not a
prerequisite to freeze the complete source-driven architecture.
