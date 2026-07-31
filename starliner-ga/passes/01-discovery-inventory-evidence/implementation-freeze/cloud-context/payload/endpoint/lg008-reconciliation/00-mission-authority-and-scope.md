# 00 — Mission, Authority, and Scope

## Mission

This is the central merger/reconciliation pass for the endpoint profile. It
does not repeat the 1,265-path archaeology; it consumes that source-truth
dossier and reconciles it against the 74-file DIE freeze candidate.

## Scope override

The supplied mission describes five global profiles. The user subsequently
limited execution to “endpoint agent only” and explicitly excluded the other
sensors/gateways. This directory therefore uses endpoint-scoped paths
(`docs/lg008-endpoint-reconciliation` and `lg008-endpoint`) instead of writing a
misleading `lg008-global-reconciliation` result.

`Verified:` endpoint scope includes:

- the endpoint runtime, monitor, proxy, hooks, enforcer, installer/updater and
  diagnostic paths in `sentinel-endpoint-agent`;
- current API/control surfaces in `sentinel-dashboard`;
- endpoint-pinned IPC behavior and current IPC comparison;
- the completed endpoint sensor dossier;
- the endpoint-applicable/shared frozen target contracts;
- pinned Starliner implementation only where it resolves a referenced
  delivery/contract boundary.

`Out of scope with reason:` Browser, Browser Backend, LLM Gateway and MCP
Gateway source dossiers are not inputs because the user excluded them. A
freeze reference to them does not make them admitted source profiles.

## Authority application

For source behavior:

1. pinned endpoint/dashboard/IPC source;
2. retained runtime/static command output;
3. generated dossier interpretation;
4. documentation/comments.

For target behavior:

1. accepted architecture constitution/ADRs if supplied;
2. executable freeze schema/OpenAPI/DDL;
3. freeze decision/data-authority registers;
4. freeze prose;
5. pinned current Starliner code as implementation evidence only.

Source truth does not silently rewrite target authority. Every conflict is in
`contradictions.csv`, has a proposed diff and change request, and leaves the
freeze unchanged.

## Evidence qualification

The freeze candidate has no immutable source revision because its directory is
untracked. Its exact aggregate identity is:

`untracked-bundle-sha256:d644397d63cb9a9878a0e22bf193c268c23d4eefaa1bce9b10ed1fa9e23dee55@containing-repo:513d60d34c0e3c121a39cec5bb8d5ff7b49c2fdc`

That identity is content-addressed evidence, not governance acceptance.
