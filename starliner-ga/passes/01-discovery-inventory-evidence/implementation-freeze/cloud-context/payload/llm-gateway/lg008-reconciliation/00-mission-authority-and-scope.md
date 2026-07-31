# Mission authority and LLM-only scope


This pass applies the LG-008 merger/validation method only to the LLM Gateway,
as explicitly requested. It does not admit, merge, or modify Browser, Browser
Backend, Endpoint, or MCP Gateway artifacts. Consequently it cannot satisfy the
five-profile global closure condition and must report `LG008_OPEN`.

## Authority order

1. Admitted pinned LLM source and retained runtime evidence.
2. Frozen LLM-relevant contracts and their exact file digests.
3. Requirement and defect decisions.
4. Sensor-dossier interpretations, always marked when inferred.
5. Planning material.

Primary source: `macrodata-refinement@92b0462c583b908f8ce0cadd1bc89d2e702f5a7d`. Related gateway:
`quilr-llm-gateway@99f759d75aa8260f97db6904433c941647a755e5`. Supporting Starliner code:
`project-starliner-audit@b747393468045425b3f07a24775dcbc93d380cb5`.

## Evidence and confidence

- `Verified:` all 1,093 tracked primary-repository blobs were
  matched to `git ls-files` and their SHA-256 digests.
- `Verified:` all 92 final LLM dossier artifacts and all
  73 admitted frozen artifacts were hashed.
- `Verified:` the targeted runtime command ran at the admitted primary
  revision and retained command, fixture manifest, stdout, stderr, versions,
  and timestamps.
- `Inference:` adapter and target-layer mappings are proposals. They are not
  evidence that PostgreSQL, ClickHouse, OpenAPI, or UI materialization exists.
- `Unresolved:` the frozen workspace corpus has exact digests but no immutable
  Git revision or signed release manifest.
- `Contradiction:` the frozen LLM binding cites `7bbbb8e6…`, while admitted
  source truth is `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d`.

## Output boundary

The names “global registry” and “global field register” are retained from the
LG-008 artifact contract, but their contents are explicitly
`LLM_GATEWAY_ONLY`. No cross-profile equivalence is claimed.
