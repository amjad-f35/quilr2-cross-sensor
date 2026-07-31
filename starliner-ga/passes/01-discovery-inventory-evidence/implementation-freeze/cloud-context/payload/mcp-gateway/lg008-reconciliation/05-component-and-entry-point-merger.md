# Component and entry-point merger

## Scope

No cross-profile component equivalence was asserted because only MCP Gateway
was admitted. Similar names in other dossiers are not merger evidence.

## Counts

- 15 material utility/runtime components;
- 15 pinned component versions;
- 13 executable/runtime entry points;
- 351 source-file anchors.

## Runtime families

The entry-point catalog covers:

- primary FastAPI gateway startup;
- gateway module execution;
- workflow runner API/worker;
- workflow scheduler;
- retention worker;
- SQLite-to-ClickHouse synchronization;
- Google FastMCP example/service roots;
- diagnostic, development, and certification-related commands represented in
  the pinned dossier.

Every row separates:

- `SOURCE_PROVEN` implementation;
- deployment reachability, usually `CONFIGURATION_DEPENDENT`;
- source-local or evidence disposition;
- proof evidence IDs.

## Component boundaries

Material components include configuration, identity/privacy helpers, mapper,
manifest, outbox repository, HTTP transport, delivery worker, runtime,
metrics, self-test, registry hooks, handler hooks, and the legacy policy
adapter.

Direct MCP and OneMCP are not merged into one implementation. The existing
observe hook belongs to the Direct handler path; OneMCP requires its own
surface certification.

## Producer/consumer status

Current source-local producers and consumers use component IDs. Frozen target
messages intentionally have unresolved central consumers in this MCP-only
contribution, producing warnings rather than invented service IDs.

Machine catalogs:

- [components](../../lg008/catalogs/components.csv)
- [entry points](../../lg008/catalogs/entry-points.csv)
