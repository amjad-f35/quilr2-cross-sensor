# Mission Authority and Scope

## Verified authority

- Sensor intelligence mission attachment: `../../../.codex/attachments/8ed80aa9-789a-43d5-b910-75ee4d3db798/pasted-text.txt`, SHA-256 `de525cd0759d2ac0c8b36bb5ba2aef17fe2ab9758a8bfd071257b89b38e7dbe0`.
- Central merger mission attachments: `../../../.codex/attachments/9f6b3d95-49dd-4f04-90f2-8ad06f7b84ca/pasted-text.txt` and `../../../.codex/attachments/fae156ca-28bb-4d24-8b7d-89d30f785cfa/pasted-text.txt`; both SHA-256 `430dde4f2b5d62bbe6bb56ee46a044f694d5902d3d2c878c69e8ca2e1de66d46`.
- Frozen corpus: 74 files under `../docs/quilr2-cross-sensor/starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze`.
- Frozen corpus aggregate: `eb4c2c7621fc42d5624dae0e05a377d41674e9f92f8348b4d41145c9bd0ad866`, computed as SHA-256 of sorted `relative_path + NUL + file_sha256 + LF`.
- Containing repository HEAD: `513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc`.

## Authority limitation

**Contradiction:** the 74-file implementation-freeze tree is untracked in the containing Git repository. The commit above does not reproduce its bytes. This run therefore treats the per-file SHA-256 manifest as the frozen byte authority and records the missing immutable repository revision as a change-control blocker.

## Scope

The five required profiles are Browser, Browser Backend, Endpoint, LLM Gateway, and MCP Gateway. Current Quilr1 and Better Console analyses are supporting platform evidence only. They are not sixth or seventh sensor profiles and cannot satisfy missing sensor dossier requirements.

## Method

1. Hash the mission inputs and frozen package.
2. Admit or reject each profile using the required artifact classes.
3. Stop semantic merging when every required profile is rejected.
4. Register only input, repository, frozen-contract, evidence, runtime, change, and unresolved IDs.
5. Generate mechanical validators and machine reports.
6. Keep frozen artifacts unchanged.
