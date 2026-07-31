# 02 — Frozen Authority Manifest

The authoritative machine manifest is
[`../../lg008-endpoint/registries/target-contract-registry.yaml`](../../lg008-endpoint/registries/target-contract-registry.yaml).
It lists every file path, SHA-256 digest, declared status, normative class,
endpoint applicability and reconciliation status.

## Inventory

- Files: 74
- Aggregate content revision: `untracked-bundle-sha256:d644397d63cb9a9878a0e22bf193c268c23d4eefaa1bce9b10ed1fa9e23dee55@containing-repo:513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc`
- Containing repository HEAD: `513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc`
- Worktree fact: `starliner-ga/` is untracked.
- README status: source-corrected freeze candidate; static validation required;
  P0 live storage gates open.
- Pinned Starliner source cutoff: `b747393468045425b3f07a24775dcbc93d380cb5`.

| Classification | Count |
| --- | --- |
| NORMATIVE | 41 |
| NORMATIVE_PROSE_PER_FREEZE_AUTHORITY | 25 |
| NORMATIVE_VALIDATION | 8 |

| Endpoint applicability | Count |
| --- | --- |
| ENDPOINT_OR_SHARED | 70 |
| EXCLUDED_OTHER_SENSOR_PROFILE | 4 |

## Authority caution

`Contradiction:` an untracked directory cannot be reconstructed from the
containing repository commit. The machine manifest preserves exact bytes, but
governance still must commit/tag/sign the bundle. No “accepted freeze” claim is
made here.

Files for other source-profile schemas remain in the 74-file authority
inventory because they are physically part of the candidate. They receive
`NOT_APPLICABLE_WITH_REASON` for endpoint source reconciliation; their semantic
contents were not merged.
