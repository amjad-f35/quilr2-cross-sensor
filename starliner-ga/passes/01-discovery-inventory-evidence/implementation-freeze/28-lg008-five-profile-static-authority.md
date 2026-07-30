# LG-008 Five-Profile Static Source Authority

**Verdict:** closed for selected-source static reconciliation
**Runtime boundary:** native capture-to-profile behavior remains `LG-005`
**Machine authority:** [LG-008 generated authority](lg008/README.md)

## What is now frozen

All five profiles are admitted at immutable selected revisions:

| Profile | Selected source | Records | Native fields | Target traces | Current delta |
|---|---|---:|---:|---:|---:|
| Browser | `Project-Vanguard@8e7a3e0...`; `project-sentinel@6f55960...` | 52 | 611 | 136 | 102 files |
| Browser Backend | `browser-extension-service@496b8c2...` | 12 | 196 | 396 | 6 files |
| Endpoint | `sentinel-endpoint-agent@a022e52...` | 66 | 639 | 129 | none from selected analysis cutoff |
| LLM Gateway | `macrodata-refinement@92b0462...` | 9 | 144 | 128 | none from selected source cutoff |
| MCP Gateway | `quilr-llm-gateway@99f759d...` | 9 | 247 | 142 | 32 files |

The merged authority contains 148 records, 1,837 native fields, 422 access
recipes, 931 target-field traces and 140 classified current-delta files.
Every stable identifier includes the profile and semantic identity material;
producer/source identity is retained and Browser Backend is never silently
relabelled as Browser.

## Reconciliations performed

### Browser and Browser Backend

The 102-file Vanguard delta and six-file Browser Backend delta were compared
against the delivered historical package. Nineteen Browser delta files require
field/capability addenda. Authentication tokens are discarded before the
ordinary profile; diagnostic network bodies are raw-evidence-reference-only;
package hostnames are classified as actually serialized. Two Browser Backend
legacy control changes are retained as out-of-pass security/migration evidence
and are not copied into the target authority.

### Endpoint

The generated blanket “observable and collected” interpretation was rejected.
Fields are separated into serialized/emitted, local serialized/persisted,
source-local capture, control input and captured-but-not-currently-emitted
states. This prevents local/control-only facts from being advertised as current
central telemetry.

### LLM Gateway

The 26,292-entry lexical identifier dump was rejected as a data dictionary.
Only reachable typed/serialized structures and database projections are
admitted: request/log rows and the request, identity, observability, feature,
tool/event and action JSON structures.

### MCP Gateway

The 32-file delta was reconciled and placeholder recipes were replaced. The
current source proves that upstream capabilities are scoped by backend,
authorization context, endpoint fingerprint and protocol version. The target
now preserves that distinction in:

- the MCP profile with tenant-keyed scope tokens;
- normalized relationship-candidate scope;
- canonical and read relationship scope columns and uniqueness;
- relationship materialization rules;
- API/UI coverage state without exposing internal scope tokens; and
- positive and negative conformance fixtures.

Without this correction, two callers/configurations of one backend could
collapse into one false capability edge.

## Assurance boundary

`LG-008` proves that the design can account for the selected source capacity
without inventing a native fact. It does not prove that a built artifact, OS,
provider, configuration or customer deployment emits every admitted path.
Those claims require `LG-005`; cross-language signing requires `LG-006`.

The selected MCP source suite remains 595 passed, six failed and one xfailed.
The failures are retained as source qualification evidence and must be resolved
or dispositioned during `LG-005`; they do not convert a source field into an
unsupported or runtime-proven fact.
