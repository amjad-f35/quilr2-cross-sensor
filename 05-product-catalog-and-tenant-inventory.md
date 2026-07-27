# Product catalog and tenant inventory

## Separation

### Global curated catalog

The catalog describes vendor-controlled concepts:

```text
AI Product
Application Surface templates
Model Provider / Family / Version
MCP Server Product
Tool capability templates where globally stable
Connector product
aliases and identifier patterns
```

Suggested catalog fields:

- catalog ID and version;
- vendor/product canonical name;
- aliases and rebrand validity;
- verified domains/origins;
- bundle/package IDs, binary names, and code-signing identities;
- known surfaces and account types;
- provider-qualified model identifiers/families;
- known MCP manifest/product identifiers;
- category/capability/compliance metadata;
- source, curator, confidence, valid time, and review state.

### Tenant inventory

Tenant inventory describes what ACME actually owns, configured, observed, or used:

```text
Tenant Application
Application Installation
Tenant Subscription
Application Account
Model Deployment / Route
Agent Definition / Version / Deployment
MCP Client / Server Deployment / Tool
Integration Instance / Connected Account
Device / Sensor / Enforcement Point
Data Asset / Knowledge Base / Memory Store
```

Tenant fields—owner, management state, approval, users, accounts, spend, policy, first/last seen, findings, aliases, manual decisions—never update the global catalog.

## Catalog-assisted resolution

**Proposed:** catalog rules generate candidates and deterministic matches only from strong identifiers:

- exact verified `claude.ai` origin → Claude Web surface template;
- exact signed Claude bundle/package ID → Claude Desktop surface template;
- `provider=anthropic` plus exact `claude-*` provider ID → Anthropic model version/family;
- catalog alias `Claude Desktop MCP client` → MCP Client related to the desktop surface.

A catalog rule never collapses a surface, account, model, client, or activity into the product. It creates `SURFACE_OF`, `ACCOUNT_FOR`, `PROVIDED_BY`, or other typed relationships.

## Catalog changes

- Add aliases with `valid_from`, optional `valid_until`, source, and review decision.
- Model rebrands as catalog history; do not rewrite tenant observations.
- Split a mistakenly broad catalog product into successor products and replay candidate resolution.
- Preserve the catalog version used by every resolver decision.
- Global metadata updates may update presentation but never tenant governance/ownership/evidence.

## Custom/internal products

An internal AI application or MCP server begins as tenant-scoped. It can be promoted to a global/curated catalog product only through an explicit stewardship workflow; no tenant-private names/paths/configuration are published globally by default.

## Quilr 1 reuse

**Inference / Proposed:** `apps_db`, domain/process mappings, static application metadata, and model/provider mappings can seed catalog candidates. They are not automatically authoritative because the current analyses do not demonstrate one ownership/review/version contract across them. `app_tenant_settings`, users, device, usage, and findings are tenant data and must never be imported as global catalog facts. See [current-to-target.csv](matrices/current-to-target.csv).
