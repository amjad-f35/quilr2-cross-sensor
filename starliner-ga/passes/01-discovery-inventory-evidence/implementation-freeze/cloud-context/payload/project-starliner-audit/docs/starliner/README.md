# Starliner SDK — Legacy Compatibility Surface

> New Quilr 2 / Starliner platform code must use `starliner_contracts` as the
> only canonical ABI. The `starliner` package documented below is a retained
> prototype/compatibility SDK and must not define new sensor record families.
> See `docs/adr/ADR-001-starliner-abi-source-of-truth.md`.

`quilr-starliner-sdk` currently ships both the canonical
`starliner_contracts` package and the older import name `starliner`. The legacy
surface remains for compatibility tests and existing integrations while it is
quarantined from new platform sensor work.

This is Pass 1: the foundation only. Gateway repos are not modified here. Later
passes add thin adapters:
- Pass 2: LLM gateway adapter PR.
- Pass 3: MCP gateway adapter PR.

## Package identity and versioning

- Distribution name: `quilr-starliner-sdk`.
- Import name: `starliner`.
- Ships `py.typed` (typed package).
- Every emitted contract carries `schema_version` (see `contracts.md`).
- Package releases follow SemVer. Schema changes follow additive evolution:
  additive changes keep the version; breaking changes require a new `.vN` schema
  version and a new model.

## Layout

```
starliner/
  contracts/   typed contracts + taxonomy + JSON Schema export
  sdk/         config, clients (sync/async), outbox, enforcement, helpers
  adapters/    reusable gateway-facing helpers + SensorRuntime
  testing/     fake clients, golden helpers
docs/starliner/
  repo-discovery.md   live-repo hook discovery (cited)
  hook-map.md         minimal safe hook points
  configuration.md    env config + modes + fail behavior
  contracts.md        contract reference + schema versioning
  llm-integration.md  LLM adapter guidance (Pass 2)
  mcp-integration.md  MCP adapter guidance (Pass 3)
  rollout.md          off/observe/shadow/enforce rollout
  schemas/            exported JSON Schemas
tests/starliner/
  golden/             golden JSON fixtures
  test_*.py           contract, config, client, outbox, adapter tests
```

## Quick start (development)

```bash
cd project-starliner
python -m venv .venv && . .venv/bin/activate
pip install -e ".[dev]"
pytest -q
```

Regenerate the canonical JSON Schemas:

```bash
python -m starliner_contracts export-schemas docs/starliner/contracts/schemas
```

The older files under `docs/starliner/schemas/` describe the non-canonical
prototype package only.

## Design rules honored

- Decision API is the only synchronous platform dependency the gateways may add.
- The gateways enforce locally using their existing block/redact/monitor mechanics.
- The in-memory outbox is dev/test only; production binds a `DurableOutbox`.
- No SDK code calls `asyncio.run()` inside an existing event loop.
- No raw secrets in events/logs (see `redaction`).
