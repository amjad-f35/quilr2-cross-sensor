# Global field register

## Scope and counts

- 31 current native/Starliner fields;
- 118 fields extracted from the ten frozen MCP profile payloads;
- 31 source-field lineage terminals.

No fields were merged merely because their serialized names match.

## Required source-field attributes

Each native field row contains:

- field and owning-record URNs;
- native and serialized names;
- profile/repository/revision;
- source locator;
- native and semantic type;
- meaning and transformation;
- unit, cardinality, nullability, default, and allowed-values status;
- producer and consumer IDs;
- proof, reachability, disposition, and observability boundary;
- sensitivity and retention;
- evidence, access recipe, adapter mapping, and target-field IDs;
- owner.

The field validator reports no missing source locations, producers, meanings,
dispositions, evidence, or required adapter mappings.

## Identity-sensitive fields

The register keeps these semantics distinct:

- `tenant_id`: gateway/platform tenant claim, branch-dependent authority;
- actor HMAC: tenant/key-epoch scoped pseudonym, not enterprise person;
- backend ID: gateway tenant-scoped deployment identity;
- tool name: backend-scoped capability identity;
- JSON-RPC request ID: session/request correlation only;
- runtime/sensor IDs: deployment claims, not canonical entities;
- `canonical_entity`: current producer-created field explicitly terminated as
  `OUT_OF_SCOPE_WITH_REASON`.

## Privacy disposition

Raw tool arguments/results, arbitrary prediction content, tokens, authorization
headers, and credential values are not promoted to target fields. Safe
structural keys, counts, sizes, digests, labels, and bounded error classes may
be separate fields only where source and frozen contract support them.

## Frozen target-field result

| Reconciliation status | Fields |
| --- | ---: |
| `PARTIALLY_CONFIRMED` | 50 |
| `SOURCE_FACT_UNMAPPED` | 44 |
| `UNSOURCED` | 21 |
| `REQUIRES_FUTURE_CONNECTOR` | 2 |
| `CONTRADICTED` | 1 |

The contradicted field is the conditional server-deployment
`product_source_id` requirement. Custom gateway backend rows do not necessarily
provide a distinct stable product/catalog identity.

Machine outputs:

- [native fields](../../lg008/catalogs/fields.csv)
- [target-field coverage](../../lg008/reconciliation/target-field-coverage.csv)
