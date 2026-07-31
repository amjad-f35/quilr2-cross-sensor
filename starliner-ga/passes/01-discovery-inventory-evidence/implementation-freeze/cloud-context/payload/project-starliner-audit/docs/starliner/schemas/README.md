# Legacy Prototype Schemas

These JSON Schemas describe the retained `starliner.contracts` compatibility
package. They are not the Quilr 2 / Starliner platform ABI.

Canonical schemas are generated from `starliner_contracts` and committed under
`docs/starliner/contracts/schemas/`:

```bash
python -m starliner_contracts export-schemas docs/starliner/contracts/schemas
```

New sensors must not import or extend `starliner.contracts`.
