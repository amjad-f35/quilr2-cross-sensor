# Portable Cloud-Agent Source Context

This directory is the compact, content-addressed source-intelligence companion
to the Discovery, Inventory, Activity and Evidence implementation freeze. It
lets an engineer or cloud agent answer source questions without recursively
archeologizing 28 GB of local analysis and repository snapshots.

It is deliberately **not** another authority layer. The implementation freeze,
its executable contracts and its generated `lg008/` authority remain
normative. Files under `payload/` are exact copies of selected analysis
evidence and retain their original source digest.

## Start here

Use this order:

1. read the implementation-freeze `README.md` and active work package;
2. query `lg008/` for the exact profile, record, field or access recipe;
3. use the routing table below to load only the relevant source dossier;
4. inspect the pinned production source file and test before changing code.

Do not read the whole payload into one context window.

| Question | First bundled file | Then use |
|---|---|---|
| Browser capture, persona, application or identity | [`payload/browser/extension/docs/README.md`](payload/browser/extension/docs/README.md) | `extension/matrices/field-lineage.csv`, `native-fields.csv`, `identifiers.csv` |
| Browser Backend routes, persona/device/enrollment evidence | [`payload/browser/backend/docs/README.md`](payload/browser/backend/docs/README.md) | `backend/matrices/` and `combined-lg008-reconciliation/` |
| Endpoint process, device, user, application, local-agent or DLP capture | [`payload/endpoint/sensor-intelligence/docs/README.md`](payload/endpoint/sensor-intelligence/docs/README.md) | `sensor-intelligence/matrices/` and `repository-analysis/` |
| LLM request/model/provider/usage capture | [`payload/llm-gateway/sensor-intelligence/docs/README.md`](payload/llm-gateway/sensor-intelligence/docs/README.md) | `lg008-reconciliation/` and selected small matrices |
| MCP server/tool/resource/prompt and call behavior | [`payload/mcp-gateway/sensor-intelligence/docs/README.md`](payload/mcp-gateway/sensor-intelligence/docs/README.md) | `lg008-reconciliation/` and `repository-analysis/evidence/` |
| Current or historical Better Console behavior | [`payload/better-console/sensor-intelligence/docs/README.md`](payload/better-console/sensor-intelligence/docs/README.md) | `repository-analysis/` and generated route/schema indexes |
| Quilr 1 flow, stores, APIs and failure modes | [`payload/quilr1/sensor-intelligence/docs/README.md`](payload/quilr1/sensor-intelligence/docs/README.md) | `repository-analysis/`; use only as legacy context |
| Existing Project Starliner seams | [`payload/project-starliner-audit/README.md`](payload/project-starliner-audit/README.md) | `docs/starliner/`; target contracts still outrank it |

## Exact lookup

`manifest.json` is the machine-readable inventory. For example:

```bash
jq -r '.files[] | select(.source_package == "endpoint") |
  [.bundle_path, .sha256, .bytes] | @tsv' cloud-context/manifest.json
```

Every entry includes:

- stable context ID;
- original path relative to `Consolidate`;
- portable bundled path;
- exact SHA-256 and byte size;
- source package and evidence role.

The aggregate payload digest prevents silent replacement of one selected file.

## Boundaries

- Browser Backend is retained as a separate producer evidence set.
- Quilr 1 and Better Console explain legacy behavior; they are not target
  services, migration authority or canonical truth.
- The LLM lexical-key explosion is intentionally excluded. Only reconciled
  serialized/emitted/stored behavior and compact source evidence are carried.
- Raw source trees, `.git`, dependency caches, websites, archives, build
  outputs, exhaustive symbol indexes and organization-wide clones are
  intentionally excluded.
- A bundled analysis claim is not proof of current runtime behavior. Current
  source and the applicable LG-005 certification decide that.

See [selection policy](SELECTION_POLICY.md) and
[cloud-agent bootstrap](CLOUD_AGENT_BOOTSTRAP.md).
