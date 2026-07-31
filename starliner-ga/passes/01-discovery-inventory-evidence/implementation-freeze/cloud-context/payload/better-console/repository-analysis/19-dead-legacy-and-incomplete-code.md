# Dead, Legacy, and Incomplete Code

## Legacy/compatibility

- Legacy LLM/MCP/Endpoint/Browser HTTP shapes coexist with typed v2 contracts.
- Configuration decoding preserves older plaintext/double-base64 Fernet and casing/value-shape quirks, with tests.
- Generated Orval clients are active contract artifacts, not dead merely because direct imports may be indirect through barrels.

## Incomplete/planned

TODO.md explicitly defers LLM application creation, several LLM management surfaces, LLM agent observability, real-data validation, and performance reviews. These are not described as implemented.

## Dead-code conclusions

No production symbol is declared dead solely from missing textual callers. The symbol index records declarations; framework route registration, exports, tests, build embedding, generated clients, and dynamic registries were searched. Items without a proven consumer remain `Unknown`/candidate in the detailed references rather than being labeled dead.

## Placeholders

`BETTER_CONSOLE_SKIP_FRONTEND_BUILD` deliberately writes an HTML placeholder only for contract-regeneration bootstrap. Source explicitly forbids it for real server builds; it is active tooling, not product UI.
