# Frozen authority manifest

## Package identity

| Attribute | Value |
| --- | --- |
| Git repository | `docs/quilr2-cross-sensor` |
| Git base | `513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc` |
| Package state | untracked `starliner-ga/` working-tree content |
| Package files | 74 |
| Aggregate content digest | `sha256:e2561211b7d8cf368d759b96dc5ba16e146e26c5887585be460cc50b7fcaec41` |
| Declared status | source-corrected freeze candidate |
| Static validation | passed |
| Live storage gates | open |
| Named artifact owners | unresolved |
| Freeze date | unresolved |

`Contradiction avoided:` the Git base does not contain the untracked package,
so citing only `513d60d...` would not version the frozen artifacts.

## Included authority classes

The 74-file manifest covers:

- 24 numbered architecture/closure/handoff documents plus README;
- authorization model and API field policy;
- entity, relationship, activity, field-authority, normalization, and binding
  ontologies;
- two OpenAPI contracts;
- 11 machine registers;
- 13 JSON schemas, including MCP Gateway Profile 1.0.0;
- PostgreSQL, ClickHouse, roles/grants, and live-conformance SQL;
- UI screen/API and Nuxt seam artifacts;
- structural/schema/OpenAPI/PostgreSQL validation tools and live runner.

Validation support files are marked `INFORMATIVE`. Frozen architecture,
registries, schemas, OpenAPI, ontology, authorization, SQL, and UI contracts
are marked `NORMATIVE` within the candidate package.

## Static validation result

The package validator reported:

- 139 frozen decisions;
- 45 OpenAPI operations;
- five typed source profiles;
- 47 profile-kind dispositions;
- 44 profile-entity dispositions;
- 71 field dispositions;
- 54 relationship support rules;
- 41 UI field-lineage rules;
- 76 defect/live-gate rows;
- 74 package files.

Passing this validator establishes structural consistency, not implementation,
database execution, sensor certification, or accepted freeze status.

## Machine manifest

Every file has an artifact URN, repository/revision URN, SHA-256 digest,
authority classification, status, and evidence ID in the
[target-contract registry](../../lg008/registries/target-contract-registry.yaml).
