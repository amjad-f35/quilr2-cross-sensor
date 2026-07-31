# Global evidence manifest

## MCP contribution totals

| Evidence class | Count | Retention |
| --- | ---: | --- |
| Pinned source files | 351 | Git object at `1b2f2b3...`, per-file SHA-256 |
| First/second-pass analytical artifacts | 166 | Workspace files with SHA-256 |
| Frozen target artifacts | 74 | Content-addressed workspace files |
| Fresh runtime artifacts | 4 | stdout, stderr, metadata, dependency manifest |
| Total | 595 | NDJSON registry |

## Source evidence

Every tracked source file has:

- a source-file stable ID;
- evidence stable ID;
- repository and revision IDs;
- canonical `mcpgateway/<path>` locator;
- SHA-256 from the pinned file;
- a Git-object retention locator.

The evidence-link validator reads each object from the pinned commit and
recomputes its digest. This avoids silently validating against the later
`99f759d...` worktree.

## Runtime evidence

The fresh targeted run retains:

- `targeted-starliner.stdout.txt`;
- `targeted-starliner.stderr.txt`;
- `targeted-starliner.metadata.json`;
- `python-dependencies.txt`.

It materialized every one of the 351 pinned files by verified digest, used only
repository fixtures, and contacted no external service.

Two earlier aggregate runs remain narrative-only because their original raw
stdout/stderr was not retained. Their result claims remain visible and fail the
runtime-evidence validator rather than being upgraded.

## Sanitization

No credential values, raw customer data, production endpoint calls, raw tool
arguments/results, or private-key material was admitted.

## Validator result

Evidence paths and digests pass. The runtime validator still fails for the two
older unretained experiments.

The manifest is [NDJSON](../../lg008/registries/evidence-registry.ndjson).
