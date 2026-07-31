# Source Analysis Intake and LG Gate Plan

**Status:** normative evidence-admission and continuation plan
**Review date:** 2026-07-30
**Machine registers:** [source inputs](registers/source-analysis-inputs.csv) and
[LG evidence needs](registers/lg-evidence-needs.csv)

## Direct verdict

The supplied material plus direct authenticated GitHub organization access is
enough to complete the static, authoritative LG-008 reconciliation without
requesting another analysis, architecture document or developer interview. It
has now been centrally merged and `LG-008` is closed. This does not close
any live storage, native certification, cross-language, UI, or erasure gate.

The analysis volume is substantial, but volume is not admission. A profile is
admitted only when its semantic catalogs, source proof, access recipes,
dispositions, target reconciliation and unresolved boundaries survive central
review.

## What is now durably captured

The input register content-addresses and dispositions:

- all seven supplied conversation/context artifacts;
- Better Console at `quilr-ai-config-manager@68132e67...` and the design system
  at `2fc373c...`;
- Browser extension `Project-Vanguard@fc09f3a...`, native host
  `project-sentinel@88ae4e3...`, and Browser Extension Service
  `99e9599...`;
- Endpoint `a022e52...`, its pinned/current IPC revisions and Dashboard
  `cd755d3...`;
- LLM Gateway production source `macrodata-refinement@92b0462...` and related
  gateway `99f759d...`;
- MCP Gateway at the separately pinned `mcpgateway/` revision `1b2f2b3...`;
- Quilr 1 query-builder `c794c45...` and web `e6f9d03...`;
- existing `project-starliner@b747393...`.
- the 377-repository Quilr organization snapshot, 30 selected current
  source/build evidence rows, 62 local source checkouts, direct dependency
  repositories, ingress/schema/read consumers and routing/configuration
  manifests recorded in
  [the organization reconciliation](27-quilrbusiness-org-source-reconciliation.md).

These artifacts are evidence inputs. None may silently override the executable
freeze.

## Independent intake findings

### Browser and Browser Backend now have separate static admissions

The rebuilt Browser package at SHA-256 `4da74590...` separately admits
Project Vanguard plus Project Sentinel as `browser` and Browser Extension
Service as `browser-backend`. A fresh archive extraction passed all 3,518
manifest digests and every non-closure central validator. The package preserves
three producer identities and does not reclassify relayed Browser evidence as
backend-originated evidence.

This resolves the earlier profile-combining and relocation defects for the
pinned package. Direct GitHub comparison subsequently proved the package is a
historical baseline: Vanguard has a 102-file semantic delta and Browser Backend
has a six-file delta at the selected current cutoff. Native execution remains
LG-005; it is not an LG-008 owner-input dependency. The admission evidence and
exact dispositions are frozen in
[the Browser admission review](25-browser-package-admission-and-owner-inputs.md).

### Structural validator success is not semantic closure

Examples found during this intake:

- the Browser field catalog labels values assembled into the outbound event as
  `OBSERVABLE_BUT_NOT_COLLECTED`, which conflicts with its cited producing
  path and requires row-level correction;
- the Endpoint generated disposition marks a process start timestamp
  `PRIVACY_PROHIBITED` while describing it as ordinary operational telemetry;
- the LLM catalog expands lexical keys and expressions into 26,292 “fields,”
  including HTTP verbs such as `GET`, `POST` and `DELETE`; this is a source
  index, not an admissible serialized telemetry dictionary;
- many LLM access recipes merely hash arbitrary repository files rather than
  reproduce or retrieve a captured/emitted datum or feature;
- MCP access recipes contain the literal placeholder
  `python -m pytest -q <catalog-linked-test>`, which is not an executable,
  exact access recipe;
- the pre-rebuild Browser work product failed with 246 relocation errors; the
  rebuilt archive eliminated them and passes all 15 non-closure validators,
  but its pinned source is behind the selected current cutoff;
- the LLM package currently fails its own validator with 1,211 errors,
  including 1,197 unresolved evidence paths;
- the MCP validator aborts on a hard-coded path to the pre-consolidation
  workspace and therefore does not currently validate its advertised
  self-contained package;
- all contribution packages leave target diffs, contradictions or unresolved
  evidence unaccepted, and each uses a local ID namespace that still requires
  deterministic global normalization.

The current local validators correctly report several packages as open, but
they do not reject all of the semantic problems above. The central merger must
add semantic invariants rather than merely concatenate artifacts or trust
per-package closure JSON.

### The Quilr 1 global LG-008 generator is not a central merger

`Quilr1-Platform-Analysis/work/generate-lg008-open-reconciliation.mjs`
hard-codes every required source profile as `REJECTED_INCOMPLETE`, emits empty
central catalogs, and does not import the independently generated Browser,
Endpoint, LLM Gateway, or MCP Gateway contributions. It is a fail-closed
placeholder that correctly prevents a false closure, but it cannot be reused
as the reconciliation engine. The central LG-008 continuation must implement
explicit package import, stable-ID mapping, semantic reduction, contradiction
handling and disposition admission before any profile becomes `ADMITTED`.

## Admission state by input at closure

| Input | Current use | Central admission |
|---|---|---|
| Browser extension/native host | historical static catalog plus current GitHub source delta | current 102-file delta classified; 19 material addenda admitted |
| Browser Backend | historical static catalog plus current GitHub source delta | separate current profile admitted; six-file delta classified |
| Endpoint | source catalog and matching selected revision | generated dispositions semantically reclassified and admitted |
| LLM Gateway | typed serializers/routes/database rows | lexical dump rejected; 144 real serialized fields admitted |
| MCP Gateway | historical catalog plus complete current GitHub checkout | 32-file delta classified; 247 fields and exact access recipes admitted |
| Quilr 1 | continuity and legacy lineage | context only, never a current sensor profile |
| Better Console | composition/UI and legacy access evidence | context only, never canonical authority |
| project-starliner | implementation fit-gap and reusable-code evidence | context only, never target-contract authority |

## Authoritative LG-008 pipeline executed

The completed central pipeline is:

```text
pinned source trees and admitted analysis evidence
→ common five-profile input schema
→ deterministic global ID re-keying
→ semantic field/event/record/access review
→ separate Browser Backend admission
→ duplicate/conflict and negative-observability checks
→ source-to-adapter/profile reconciliation
→ source-to-canonical/activity/evidence/coverage disposition
→ schema/ontology/SQL/OpenAPI/UI/privacy/test change proposals
→ accepted change control
→ five-profile saturation pass
→ LG-008 verdict
```

The merger must reject:

- source-file, symbol, key or variable occurrences mislabeled as emitted data;
- non-executable placeholder access recipes;
- `SOURCE_PROVEN` without a reachable producer/consumer or exact source
  locator;
- `RUNTIME_OBSERVED` without retained raw sanitized evidence;
- collected fields labeled uncollected, or privacy states inconsistent with
  their declared target treatment;
- target fields marked supported only because they share a name;
- profile-local stable IDs that collide with or duplicate another profile's
  logical object;
- any profile that combines independently enrolled producers without retaining
  producer identity and lineage;
- closure while a blocking contradiction, unowned mandatory target gap or
  unaccepted semantic change remains.

The generated result and exact counts are in
[the five-profile authority](28-lg008-five-profile-static-authority.md).

## What more is needed from people

Nothing for static LG-008 source discovery or architecture. Engineering can
derive the remaining facts from the authenticated organization and supplied
analyses.

Execution environments, credentials and supported-OS runners are still needed
later to *run* LG-001 through LG-007. A customer-deployment claim also needs a
deployed artifact digest and effective configuration. Those are engineering,
release and operational gates—not knowledge requests to the developers and not
reasons to leave target semantics undecided.

## Remaining LG gates

The exact evidence needed for every live gate is in
[the machine register](registers/lg-evidence-needs.csv). In summary:

- `LG-001` and `LG-002` need engines, not more prose.
- `LG-003` needs a selected object-store implementation and authorized test
  bucket.
- `LG-004` needs the live API/client implementation and a writable exact Nuxt
  worktree.
- `LG-005` needs implemented adapters plus real native test environments.
- `LG-006` needs all five selected-path language implementations—Go, Java,
  Python, TypeScript and Rust—against one shared vector
  corpus; the current Python tests are useful but insufficient.
- `LG-007` needs an authoritative deployment/placement inventory and live
  erasure environment.
- `LG-008` is statically closed; native execution remains `LG-005`.

Gate-closing engineering can proceed now. Broad implementation remains bound
by the stop conditions in [the production handoff](23-production-implementation-handoff.md).

## Validation rerun retained

The exact local commands, versions and outcomes from this intake are retained
in
[2026-07-30-source-input-validation.txt](evidence/runtime/2026-07-30-source-input-validation.txt).
The current result is:

| Package | Result |
|---|---|
| Browser + Browser Backend rebuilt package | historical input accepted after current-source delta reconciliation |
| Endpoint | generated dispositions re-reviewed against selected source |
| LLM Gateway | lexical catalog rejected and replaced with typed serialization authority |
| MCP Gateway | stale package recipes replaced and current 32-file delta reconciled |
| project-starliner Python | 403 passed, 10 skipped; useful fit-gap evidence only |

The central authority validator and two-pass saturation runner now pass; the
historical package results above remain intake evidence rather than the closure
verdict.
