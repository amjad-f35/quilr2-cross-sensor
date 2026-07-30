# Browser Package Admission and Owner Inputs

**Review date:** 2026-07-30
**Scope:** Browser and Browser Backend LG-008 contribution
**Verdict:** admitted as a historical static baseline for two distinct
profiles; current-source delta reconciliation is mandatory and global LG-008
remains open

## Reviewed delivery

The reviewed archive is:

```text
/Users/t4ctic4l/Documents/Codex/Consolidate/Browser-Extension-System/
Browser-Extension-Analysis-Complete-2026-07-30.zip
```

Its SHA-256 is:

```text
4da74590dba71860abb2bcb0b3c8b0afa084168a953c08df650f914adb31ffa3
```

It pins and separates:

| Profile | Producer | Revision |
|---|---|---|
| `browser` | Project Vanguard | `fc09f3a20e3e129b02f69f5045965e8fa694c022` |
| `browser` | Project Sentinel native host | `88ae4e3b2d531e3b285bb5a42f6ccb76568414f9` |
| `browser-backend` | Browser Extension Service | `99e9599e1582184f5061492b430cd0b2af38d753` |

Browser Extension Service is no longer treated as a Browser-originating
producer. Relayed observations retain their Browser origin while the backend
has its own producer identity, source profile, revision and backend-native
records.

## Independent verification

The ZIP checksum matched. The archive was extracted into a new temporary
directory rather than validated through the original workspace. All 3,518
entries in `MANIFEST.sha256` passed.

The portable central validator independently reported:

- 34,891 unique stable IDs with no collision;
- 1,226 source files accounted: 707 Vanguard, 226 Sentinel and 293 Browser
  Extension Service;
- 776 source fields and 776 lineage rows;
- 1,632 evidence records with no broken evidence link;
- 1,282 registered access states/recipes with no structural error;
- zero errors in all 15 non-closure checks;
- five expected global closure errors: three absent profiles, 12 unresolved
  contradictions, seven blocking evidence boundaries, no immutable final
  authority revision, and 50 currently unsourced target fields.

The source-field contribution contains 585 Browser fields and 191 Browser
Backend fields. Every row has one explicit disposition. Runtime reachability
remains deliberately unknown at field level and must be refined from record
reachability plus the active configuration evidence rather than guessed.

## Admission decision

The package is sufficient for the central merger to admit Browser and Browser
Backend as two **pinned historical** static source profiles. It corrects the
earlier profile-combining defect and the 246 relocation failures. It is not the
current source cutoff.

Direct GitHub inspection after this package was delivered established:

- `Project-Vanguard` advanced from `fc09f3a...` to `8e7a3e0...`: 102 files,
  +10,043/-424;
- `project-sentinel` advanced from `88ae4e3...` to `6f55960...`: one 448-line
  on-demand build workflow;
- `browser-extension-service` advanced from `99e9599...` to `496b8c2...`: six
  files, +145/-25.

The Vanguard delta changes observable/captured semantics, including managed
persona, login control, response capture/joining, identity artifacts,
navigation and logging. The package therefore cannot close current Browser
source saturation by itself. Exact cutoffs and changes are governed by
[the organization reconciliation](27-quilrbusiness-org-source-reconciliation.md).

Admission does **not** mean:

- the current sensors already implement the target Starliner adapter, WAL,
  enrollment, snapshot, health or gap contracts;
- a hash of a source file proves a runtime datum was emitted;
- configuration-dependent or proprietary-library behavior is reachable in a
  supported release;
- current Browser-to-native-to-backend delivery has been runtime certified;
- the 12 source-to-target contradictions or 50 unsourced target fields should
  be deleted from the target contract.

Those target gaps become explicit source changes, adapter work, certification
cases or unsupported boundaries during the five-profile reconciliation.

## Packaging limitation

The authoritative packaged validator under
`outputs/lg008-browser-backend-central-pass/lg008/` is relocation-safe.
However, two retained work scripts—`work/lg008_browser_backend_validator.py`
and `work/audit_repository_analysis.py`—still embed assumptions about their
original layout or prior absolute repository paths and fail when invoked
directly from the extracted archive. They are historical generation/audit
tools, not the admitted validator. This is a package-hygiene defect and must
not be represented as portable validation coverage.

## What the CTO/team must still supply

Nothing for static Browser or Browser Backend source discovery. Engineering
recovered `extension-log-service`, native dependencies, Java libraries,
configuration repositories, routing, schema ownership and current build
evidence from GitHub.

The remaining work is engineering-owned:

1. saturate the current Browser and Browser Backend deltas;
2. merge their fields/records/relationships with the other three profiles;
3. classify configuration/build-gated facts without pretending they are
   deployed;
4. certify selected Browser/OS/native/Backend combinations under `LG-005`; and
5. commit the final reviewed authority revision.

The renamed-in-place [evidence disposition register](registers/lg008-owner-inputs.csv)
records how every former owner request was resolved or moved to runtime
certification. No developer interview is a blocker.
