# Runtime-evidence merger

## Experiments

| Experiment | Result | Retained raw artifacts |
| --- | --- | --- |
| Default `e2e_test` suite | 568 passed, 6 failed, 1 xfailed | No; narrative record only |
| Separately collectable top-level tests | 112 passed, 10 failed, 1 skipped, 33 passing subtests | No; narrative record only |
| Fresh targeted Starliner suite | 78 passed, 6 failed, 1 warning in 4.05 seconds | Yes |

## Fresh targeted run

The retained command used:

```text
/private/tmp/mcpgateway-analysis-venv/bin/python -m pytest -q
-p no:cacheprovider
test_starliner_observe_runtime.py
test_starliner_outbox_repository.py
test_starliner_registry_hooks.py
test_starliner_mcp_handler.py
test_starliner_mcp_adapter.py
test_starliner_optional_dependency.py
test_starliner_mcp_certification.py
```

Every scoped source file was materialized from either its unchanged worktree
byte stream or pinned Git object and checked against the first-pass SHA-256.
The temporary tree contained all 351 pinned files. A temporary Git context was
created only for the repository test that calls `git check-ignore`.

Environment:

- macOS `darwin 25.5.0`, arm64;
- Python 3.12.13;
- bytecode and pytest cache disabled;
- temporary gateway data directory;
- local compatible Starliner contract descendant;
- no external services.

Retained artifacts:

- [stdout](../../lg008/runtime/artifacts/targeted-starliner.stdout.txt)
- [stderr](../../lg008/runtime/artifacts/targeted-starliner.stderr.txt)
- [metadata and hashes](../../lg008/runtime/artifacts/targeted-starliner.metadata.json)
- [dependency manifest](../../lg008/runtime/artifacts/python-dependencies.txt)

## Six expected failures

- three parent-script families are outside the scoped source archive;
- the no-reload `run_dev.sh` unbound-array defect reproduces;
- certification-emitter tests cannot load the absent parent script.

## Remaining validator failure

The two historical aggregate claims have no original retained raw artifacts.
The runtime validator therefore reports two errors. It does not alter their
recorded counts or relabel them as source proof.

Machine outputs:

- [experiments](../../lg008/runtime/runtime-experiments.csv)
- [evidence index](../../lg008/runtime/runtime-evidence-index.yaml)
- [future procedures](../../lg008/runtime/validation-procedures.yaml)
