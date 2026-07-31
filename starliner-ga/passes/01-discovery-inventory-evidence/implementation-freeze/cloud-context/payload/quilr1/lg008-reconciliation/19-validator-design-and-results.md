# Validator Design and Results

Run:

```bash
node lg008/validators/validate-lg008.mjs
```

The command executes all 16 named validators and writes JSON, Markdown, and JUnit reports. It exits:

- `0` only when every validator passes and LG-008 can close;
- `2` when any `ERROR` or blocking `CHANGE_CONTROL_REQUIRED` exists;
- `1` for validator execution or artifact parse failure.

`--report-only` still runs and emits all reports but exits zero so packaging/CI collection can continue while the authoritative report remains failed.

Expected current result: stable IDs, evidence digests, proof statuses, and JSON Schemas pass; source coverage, reachability, dispositions, producer/consumer coverage, fields, access recipes, lineage, observability, runtime completeness, freeze reconciliation, ownership, and closure fail because admission or required evidence is incomplete.
