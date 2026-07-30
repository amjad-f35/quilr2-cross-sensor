# Organization Source Reconciliation Validation

**Date:** 2026-07-30
**Environment:** local macOS workspace; authenticated GitHub read access;
network restricted during test execution
**Production/customer access:** none

## Freeze validation

Command:

```bash
node tools/validate-freeze.mjs
```

Result: exit 0.

- 139 frozen decisions
- 45 OpenAPI operations
- 5 source-profile schemas
- 76 defect/live-gate rows
- 377 organization repositories classified
- 30 selected source/build evidence rows
- 16 source reachability edges

## Contract validation

Commands used the existing isolated
`/private/tmp/lg008-freeze-venv/bin/python` environment:

```bash
python tools/test-schema-contracts.py
python tools/test-postgres-ddl.py
python tools/test-openapi-contracts.py
bash -n tools/run-live-storage-conformance.sh
```

Results:

- schemas: 13 meta-schemas, 62 positive fixtures and 31 negative fixtures
  passed;
- PostgreSQL grammar: 891 statements parsed;
- OpenAPI: duplicate-key checks passed for 14 normative YAML documents and
  both OpenAPI specifications passed;
- live-runner shell syntax passed.

PostgreSQL, ClickHouse and object storage were not executed.

## Current MCP checkout

Checkout:

```text
quilr-llm-gateway@99f759d75aa8260f97db6904433c941647a755e5
```

Full command from the required `mcpgateway/` working directory:

```bash
/private/tmp/mcpgateway-analysis-venv/bin/python -m pytest -q
```

Result: exit 1 — 595 passed, 6 failed, 1 xfailed.

Failure disposition:

- three token-saving tests attempted to download the `o200k_base` tokenizer
  from Azure and failed DNS resolution in the restricted environment;
- one real source test failed because
  `services/onemcp_client_apps.py` has 1,266 lines versus the enforced 1,100
  limit;
- two Starliner-policy tests could not import `starliner_contracts` because
  the gateway certification workflow installs `project-starliner` as a
  separate private package and the plain MCP test invocation did not.

The Starliner subset was rerun with the selected
`project-starliner@b747393...` checkout on `PYTHONPATH`:

```bash
PYTHONPATH='<project-starliner>:<mcpgateway>' \
  /private/tmp/mcpgateway-analysis-venv/bin/python -m pytest -q \
  e2e_test/test_starliner_mcp_policy.py \
  test_starliner_mcp_adapter.py \
  test_starliner_mcp_handler.py \
  test_starliner_optional_dependency.py \
  test_starliner_outbox_repository.py \
  test_starliner_registry_hooks.py \
  test_starliner_mcp_certification.py \
  test_starliner_observe_runtime.py
```

Result: exit 1 — 87 passed, 2 failed.

The remaining failures are:

- macOS Bash with `set -u` treats the empty `reload_args` array in
  `run_dev.sh` as unbound when reload is disabled;
- the runtime environment validator checks installed package metadata and
  rejects `PYTHONPATH`-only availability as
  `STARLINER_PLATFORM_PACKAGE=MISSING`.

These results mean the selected current MCP source is analyzable but does not
have a clean local test result. Its existing Starliner integration is also
bound to the older `project-starliner` package, which is fit-gap evidence and
is superseded wherever it conflicts with this freeze. The new MCP adapter must
target the frozen profile/edge contracts and later pass LG-005/LG-006; it must
not copy the old package coupling blindly.
