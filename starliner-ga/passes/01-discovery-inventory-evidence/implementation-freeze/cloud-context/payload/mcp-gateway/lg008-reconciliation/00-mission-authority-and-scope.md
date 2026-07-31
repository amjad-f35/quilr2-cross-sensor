# Mission authority and scope

## Scope decision

The supplied mission is defined as a five-profile global pass, but the user's
instruction for this run is “MCP Gateway only.” This contribution therefore
applies the central mechanics to MCP Gateway and preserves global closure as
open.

`Verified:` no Browser, Browser Backend, Endpoint, or LLM Gateway source-truth
artifact was used to make a semantic assertion about those profiles.

## Authority order used

1. Pinned MCP Gateway source and retained runtime evidence.
2. The content-addressed LG-008 implementation-freeze candidate.
3. Frozen requirement/defect decisions within that package.
4. The MCP repository-archeology and sensor-intelligence interpretations.
5. Planning documents and comments.

Source is authority for current implementation. It does not silently override
the target contract. The target is authority for proposed platform behavior.
It does not turn missing source behavior into implementation.

## MCP source authority

- Repository: `github.com/quilrbusiness/quilr-llm-gateway`
- Branch label: `add_gateway`
- Analyzed revision:
  `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`
- Scope: `mcpgateway/`
- Tracked files: 351
- Static file accounting: 351/351

The local branch later advanced to `99f759d...`. That delta is not mixed with
the pin.

## Target authority

The 74-file package under
`starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/`
is untracked relative to its enclosing repository's Git base. Its authority is
therefore its full per-file digest manifest plus aggregate digest, not the Git
base alone.

## Non-authorities

- Whimsical boards are explanatory views, not contracts.
- Test fixtures are not production observations.
- The compatible Starliner contract descendant is not byte-for-byte proof of
  the exact private contract pin.
- Current ClickHouse rows or SQLite configuration are not proof of deployed
  production reachability.
- Names, email, hostname, URL, user-agent, agent keyword, and tool overlap are
  not canonical identity.

## Controlled vocabularies

The machine catalogs use only the mission's proof, reachability, disposition,
observability, and freeze-reconciliation vocabularies. The validators reject
unknown or missing values.

## Mutation boundary

Neither the MCP source checkout nor the frozen package was edited. All outputs
are under `outputs/lg008-mcpgateway-reconciliation/`.
