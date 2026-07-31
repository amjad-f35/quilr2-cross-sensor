# Runtime-Evidence Merger


| exact_command | result | proof_status | stdout_path | stderr_path | limitations |
| --- | --- | --- | --- | --- | --- |
| /Users/t4ctic4l/Documents/Codex/Consolidate/Browser-Extension-System/Browser-extension-sensor-analysis/work/repositories/Project-Vanguard/node_modules/.bin/jest tests/core/network/checkUpdate.test.ts tests/core/policy/jsonPolicyStore.hasControlsForBrowserEvent.test.ts --runInBand --forceExit | PASSED | RUNTIME_OBSERVED | /Users/t4ctic4l/Documents/Codex/Consolidate/Browser-Extension-System/Browser-extension-sensor-analysis/outputs/lg008-browser-backend-central-pass/lg008/runtime/artifacts/vanguard-targeted-jest.stdout.txt | /Users/t4ctic4l/Documents/Codex/Consolidate/Browser-Extension-System/Browser-extension-sensor-analysis/outputs/lg008-browser-backend-central-pass/lg008/runtime/artifacts/vanguard-targeted-jest.stderr.txt | Unit tests only. --forceExit avoids the repository's known open handle; this does not prove production browser/native/backend behavior or CI gating. |
| cargo test --locked | NOT_EXECUTED_PRIVATE_PATH_DEPENDENCIES | NEEDS_LIVE_VALIDATION | NOT_APPLICABLE | NOT_APPLICABLE | Pinned Cargo graph references unavailable private path dependencies; no result fabricated. |

Runtime evidence is assertion-scoped. A passing unit test proves only its test behavior. Sentinel and cross-repository behavior remain `NEEDS_LIVE_VALIDATION`; exact future procedures are in [`validation-procedures.yaml`](../../lg008/runtime/validation-procedures.yaml).
