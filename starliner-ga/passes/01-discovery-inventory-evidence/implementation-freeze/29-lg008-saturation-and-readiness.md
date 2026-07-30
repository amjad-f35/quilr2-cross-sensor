# LG-008 Saturation and Readiness

## Closure test

The authority generator and semantic validator run twice from the selected
inputs. Both passes must produce byte-identical generated artifacts, zero
unresolved required derivations, five accepted profiles and no placeholder
access recipe. A final validation binds `saturation-pass.json` to the generated
digests.

```bash
node tools/run-lg008-saturation.mjs
node tools/validate-lg008-authority.mjs
```

The last retained run reports:

- five accepted profiles;
- 148 records;
- 1,837 native fields;
- 422 access recipes;
- 931 target traces;
- 140 classified current delta files;
- zero required derivation gaps;
- zero rejected profiles; and
- zero generated drift on the second full pass.

## Development consequence

There is no remaining source-context, developer-interview or static
five-profile semantic blocker. Coding agents may implement the five adapters
and normalizers only from the generated authority and frozen contracts. An
optional-unsourced or new-capture field must remain unsupported/unknown until
the corresponding implementation and `LG-005` certification exists.

This does **not** remove the independent runtime gates:

- `LG-001` PostgreSQL;
- `LG-002` ClickHouse;
- `LG-003` object-store lifecycle;
- `LG-004` live generated-client/Nuxt seam;
- `LG-005` native sensor certification;
- `LG-006` cross-language cryptographic vectors; and
- `LG-007` physical evidence-copy enumeration and erasure.

Consequently, gate-closing production engineering can proceed autonomously.
Broad domain implementation still begins only after `LG-001` and `LG-002`
pass, because those tests may force physical-contract corrections. GA remains
blocked by the relevant live gates.
