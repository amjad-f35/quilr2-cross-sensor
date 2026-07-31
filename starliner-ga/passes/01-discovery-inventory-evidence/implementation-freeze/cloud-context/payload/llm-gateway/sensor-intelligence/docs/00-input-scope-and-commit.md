# Input scope and immutable commit


`Verified in source:` The production LLM Gateway sensor is analyzed from
`quilrbusiness/macrodata-refinement`, branch `dev_main`, commit `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d`.
`gh auth status` identified `amjad-f35` as the configured default account but
reported its `gh` token invalid; the repository's separate Git credential path
successfully fetched and verified this remote head on 2026-07-30. The related
`quilrbusiness/quilr-llm-gateway` checkout is pinned at `99f759d75aa8260f97db6904433c941647a755e5`; its
README says production LLM code is in `macrodata-refinement`.

The first-pass structural evidence was regenerated at `92b0462c583b908f8ce0cadd1bc89d2e702f5a7d` before this
second pass. It accounts for 1,093 tracked files, 6,526
scoped declarations, 252 LLM-facing route registrations,
26,292 native key occurrences, and 316 scoped static
test declarations.

## Sensor input ledger

| Input | Commit | Role | Status |
| --- | --- | --- | --- |
| macrodata-refinement | 92b0462c583b908f8ce0cadd1bc89d2e702f5a7d | primary production source | Verified |
| quilr-llm-gateway | 99f759d75aa8260f97db6904433c941647a755e5 | related legacy/development and separate MCP source | Verified scope |
| repository-analysis | 92b0462c583b908f8ce0cadd1bc89d2e702f5a7d | regenerated exhaustive static evidence | Verified |
| Quilr 2.0/Starliner workspace | not one repository pin | target/proposed contracts | Proposed evidence only |

No production source was edited by this mission. Generated documentation lives
outside both source repositories.
