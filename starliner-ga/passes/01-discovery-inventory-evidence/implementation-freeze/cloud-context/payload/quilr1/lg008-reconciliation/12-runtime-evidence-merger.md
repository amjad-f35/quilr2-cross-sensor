# Runtime-Evidence Merger

Runtime validation was executed for the frozen corpus and the newer Quilr1 supporting platform. No profile-wide runtime ledgers were available, so cross-profile runtime merging is blocked.

| Experiment | Scope | Command | Result | Proof |
| --- | --- | --- | --- | --- |
| urn:quilr:lg008:runtime-experiment:fbc4c812-ec18-5b20-b531-942d88bc1b6a | frozen contract static validator | node ../docs/quilr2-cross-sensor/starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs | PASS; 74 files and declared decision/register counts validated | RUNTIME_OBSERVED |
| urn:quilr:lg008:runtime-experiment:c8f5401e-624a-5835-8d96-80bcb5816918 | frozen JSON Schema contract fixtures | /private/tmp/lg008-freeze-venv/bin/python -m pytest tools/test-schema-contracts.py | PASS; 13 meta-schemas, 62 accepted fixtures, 31 rejected fixtures | RUNTIME_OBSERVED |
| urn:quilr:lg008:runtime-experiment:a29aad72-f9db-51a6-a530-54e26d7da4e5 | frozen OpenAPI contracts | /private/tmp/lg008-freeze-venv/bin/python -m pytest tools/test-openapi-contracts.py | PASS; duplicate-key scan across 14 YAML documents and both OpenAPI specifications | RUNTIME_OBSERVED |
| urn:quilr:lg008:runtime-experiment:664dcf13-8a9a-580b-b807-edf7f74b618f | frozen PostgreSQL DDL parse | /private/tmp/lg008-freeze-venv/bin/python -m pytest tools/test-postgres-ddl.py | PASS; 891 statements parsed across three DDL files | RUNTIME_OBSERVED |
| urn:quilr:lg008:runtime-experiment:5b00640d-1648-5bd3-8d11-4be865815cfe | full Starliner documentation corpus links | node ../docs/quilr2-cross-sensor/starliner-ga/tools/validate-corpus.mjs | FAIL; 17 broken local references in migration-audit indexes/register links | RUNTIME_OBSERVED |

## Better Console supporting runtime evidence

Verified at `quilr-ai-config-manager@68132e67d0b494d52aac01a1ad811c03faf21550`:

- Rust format and strict clippy passed.
- Rust full test suite with real embedded SPA: 897 passed, 30 ignored live-service tests, 0 failed.
- Frontend on Node 24.18.1: 537 tests passed in 76 files; lint passed with 30 warnings; typecheck, formatting, self-test, and production build passed.
- Playwright, Docker, live stores, and provider-service tests were not executed and remain explicit external gaps.

These results establish platform behavior only; they do not repair missing Browser/Endpoint/LLM/MCP source-profile runtime ledgers.
