# Runtime verification

## Verification environment

| Attribute | Value |
| --- | --- |
| Sensor source | `quilr-llm-gateway@1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`, `mcpgateway/` |
| Date | 2026-07-30 |
| OS context | local macOS Codex workspace |
| Python | 3.12 from `/private/tmp/mcpgateway-analysis-venv` |
| Gateway dependencies | previously installed public `requirements.txt` test environment |
| Contract import | local `project-starliner-audit` working tree at HEAD `b747393468045425b3f07a24775dcbc93d380cb5` |
| Contract pin declared by sensor | `860079c312c13f842b5804a590fa1d5430860286` |
| Network/external services | no live MCP, ingest, IdP, DLP, ZIA, ClickHouse, Google, embedding, or runner |
| Bytecode/cache | disabled (`PYTHONDONTWRITEBYTECODE=1`, pytest cache provider disabled) |

`Limitation:` the exact pinned contract could not be installed as a complete
worktree because two promised blobs were missing from the partial clone and the
environment could not reach the promisor remote. The local contract HEAD is a
descendant of the pin. A post-pin signal-vocabulary expansion exists, so this
run proves compatibility with the available descendant, not byte-for-byte
execution against the complete pin.

## Targeted command

```text
pytest -q
  test_starliner_observe_runtime.py
  test_starliner_outbox_repository.py
  test_starliner_registry_hooks.py
  test_starliner_mcp_handler.py
  test_starliner_mcp_adapter.py
  test_starliner_optional_dependency.py
  test_starliner_mcp_certification.py
```

The command used explicit `PYTHONPATH` entries for the local contract repository
and `mcpgateway`, plus a temporary gateway data directory.

## Result

**Runtime verified:** 78 passed, 6 failed, 1 warning in 4.21 seconds.

| Area | Result |
| --- | --- |
| observe mapping/privacy/correlation/safe identifiers | passed cases |
| outbox validation/idempotency/migration/capacity/lease/terminalization | passed cases |
| delivery retry/partial result/shutdown/health | passed cases |
| registry capture hooks and failure isolation | passed cases |
| Direct handler allowed/blocked/scheduling behavior | passed cases |
| legacy adapter shadow/enforce/privacy behavior | passed cases |
| optional-package disabled/degraded boot behavior | passed cases |
| two M1 golden-trace mapper/certification cases | passed cases |
| parent installer/env-validator/certification-emitter scripts | 5 failures: files absent from this scoped checkout |
| no-reload development launcher | 1 failure: `reload_args[@]` unbound at line 59 |

## Failure classification

### Missing parent-repository scripts

Tests refer to:

- `scripts/install_starliner_runtime.sh`;
- `scripts/validate_starliner_runtime_env.sh`;
- `scripts/starliner_mcp_certify.py`.

Those paths are above the scoped `mcpgateway/` subtree and absent in the local
subject checkout. Five test failures are `FileNotFoundError`/shell 127 caused by
that boundary. This does not establish whether the upstream branch contains or
passes those scripts.

### Development launcher defect

`test_dev_launcher_can_disable_reload` fails because `run_dev.sh` uses
`reload_args[@]` under `set -u` when reload is disabled and the array is unset.
This reproduces the first-pass finding. It affects the dev launcher path, not
the observe mapper/outbox runtime.

## First-pass runtime evidence retained

The prior archaeology executed the default suite in the same isolated Python
3.12 environment:

- 568 passed;
- 6 failed;
- 1 xfailed;
- 169 warnings;
- 6.39 seconds.

The default `pytest.ini` uses `testpaths=e2e_test`, so it excludes the top-level
Starliner tests.

The separately collectable top-level files previously produced:

- 112 passed;
- 10 failed;
- 1 skipped;
- 33 passing subtests.

## Runtime matrix

| Scenario | Static | Test | Runtime this pass | Live external |
| --- | --- | --- | --- | --- |
| runtime disabled without config | yes | yes | yes | n/a |
| missing contract package degrades | yes | yes | yes | no production image |
| backend/tool mapping | yes | yes | yes | no live registry |
| normal Direct call mapping | yes | yes | yes | no remote MCP |
| DLP-block mapping | yes | yes | yes | synthetic/fake DLP |
| privacy/no raw email/prediction | yes | yes | yes | no adversarial live payload |
| idempotent enqueue | yes | yes | yes | local temporary SQLite |
| outbox migration/lease/capacity | yes | yes | yes | local temporary SQLite |
| retry/partial ack/terminalization | yes | yes | yes | fake transport |
| self-test | yes | yes | indirectly | no route server |
| HTTP ingest auth/TLS/receipt | yes config/unit | fake | no | no |
| restart/crash window | partial tests | partial | no process kill | no |
| multi-replica | source limitation | no | no | no |
| OneMCP/resources/prompts/sessions | gap | no certification | no | no |
| legacy private decision service | source/fakes | faked | fake SDK only | no |
| CI selection | config inspected | n/a | top-level explicit only | Jenkins shared library unresolved |

## Unverified dynamic behavior

- actual remote MCP protocol/version/streaming behavior;
- live native DLP and ZIA responses;
- central Starliner ingest authentication, partial acknowledgements, receipts,
  idempotency conflicts, and retention;
- OAuth/IdP/account identity;
- ClickHouse synchronization and freshness;
- workflow runner/scheduler/retention deployment;
- Google Workspace server secret/auth behavior;
- process restart during delivery;
- disk-full/corrupt DB/clock-skew cases;
- multiple gateway replicas;
- production CORS/secrets/orchestration.

## Artifact integrity verification

After fixture completion, a separate local validator produced:

- 9/9 YAML documents parsed as mapping roots;
- 29/29 CSV matrices parsed with uniform row widths and 400 data rows;
- 21/21 JSON fixtures parsed;
- all 10 required fixture category directories represented;
- 3 current `DeliveryRecord` fixtures accepted by
  `starliner_contracts.validate_delivery_record`;
- 1 deliberately invalid/sensitive `DeliveryRecord` rejected;
- 36 Markdown files checked for balanced fences and resolvable local links;
- zero validation errors.

The validation used the same local compatible contract descendant described
above, so the exact-pin limitation still applies.
