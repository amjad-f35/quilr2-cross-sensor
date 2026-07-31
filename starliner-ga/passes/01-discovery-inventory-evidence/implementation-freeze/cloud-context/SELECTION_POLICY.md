# Cloud-Context Selection Policy

## Purpose

Carry the smallest useful, portable source-intelligence set that prevents
implementation agents from rediscovering the sensor and legacy platforms
blindly.

## Included

- per-producer technical dossiers;
- feature, event, native-field, identifier, relationship, privacy, coverage and
  field-lineage matrices where their source analysis is bounded;
- compact schemas and sanitized fixtures that explain observed shapes;
- LG-008 reconciliation narratives and validation summaries;
- selected repository architecture, API, storage, security, failure and test
  references;
- Project Starliner starting-state documentation.

Files are copied byte-for-byte. Their original relative path, digest and size
are retained in `manifest.json`.

## Excluded

- production source trees and full source snapshots;
- `.git` object databases and worktrees;
- `node_modules`, virtual environments, caches and dependency downloads;
- generated documentation websites, `dist`, `build`, coverage and benchmark
  output;
- ZIP/TAR archives and binary artifacts;
- exhaustive symbol/file/call-site inventories that are better regenerated
  from the pinned checkout;
- the rejected LLM lexical catalog, which treated arbitrary parsed keys as
  supported sensor output;
- duplicated copies of the implementation freeze;
- organization-wide repository clones;
- credentials, secrets and customer or production captures.

The complete local analyses remain available for a targeted forensic question,
but they are not the default cloud context.

## Authority and conflict rule

The payload is `SOURCE_EVIDENCE`, never `NORMATIVE`.

```text
accepted constitution/ADR
→ executable schema, OpenAPI and DDL
→ machine-readable freeze registers and generated LG-008 authority
→ freeze prose
→ bundled source analysis
→ historical code and Quilr 1 behavior
```

If a bundled analysis conflicts with current pinned source, record the
contradiction and follow current source for what the sensor actually does.
If current source conflicts with a target contract, do not silently reinterpret
the contract: follow its declared disposition or raise a scoped implementation
ADR.

## Rebuild and admission

`selection.json` is the explicit input list. Rebuild locally with:

```bash
CONSOLIDATE_ROOT=/Users/t4ctic4l/Documents/Codex/Consolidate \
node tools/build-cloud-context.mjs
```

Then run:

```bash
node tools/validate-cloud-context.mjs
```

New files require a stated evidence role and must stay inside the size,
extension, provenance and secret-scanning bounds. Do not bulk-add a repository
because one missing fact is discovered.
