# Discovery and inventory contributions

## Current emitted inventory contribution

The current observe runtime emits source observations for two entity families.
This is source evidence, not central inventory authority.

| Candidate entity | Native trigger | Native keys/attributes | Lifecycle coverage | Authority | Platform availability |
| --- | --- | --- | --- | --- | --- |
| MCP backend/server | successful registration | tenant, safe backend ID, optional safe transport type, sensor/time/confidence | create/first registration only; no update/delete/disable/replay-at-start | source observation | `Available now without sensor changes` when observe runtime is active |
| MCP tool | registration, tools overwrite, full refresh, or call-time sighting | tenant, safe backend/tool IDs, observed name, optional `observed_via=tool_call` | create/sighting; repeated discovery deduplicated; no removal/tombstone | source observation | `Available now without sensor changes` |

`Contradiction:` both are emitted with a locally constructed
`canonical_entity`. The proposed platform architecture requires the adapter to
emit source identity candidates and the central resolver to assign canonical
identity.

## Inventory data available in gateway state but not emitted

| Candidate entity | Existing source/state | What is available | Current output | Platform availability |
| --- | --- | --- | --- | --- |
| Tenant/company | `companies`, user/company repositories | company ID, tenant ID, names/domains/admin links | absent | `Available through adapter mapping only` |
| Human user/account | `users`, `mcp_users`, IdP claims, logs | emails/usernames/subscriber/tenant, IdP branch | pseudonymous actor only on current action | `Available through adapter mapping only`; authoritative identity may require IdP |
| Gateway sensor instance | runtime config/manifest | sensor ID, adapter/certification/runtime instance/product refs | manifest and delivery envelope | `Available now without sensor changes` |
| MCP backend configuration | `backends` | name, description, URL, transport, status, owner/user, tenant, catalog, settings, capabilities | limited source observation | `Available through adapter mapping only` |
| MCP tool definition | cached `capabilities.tools` | name, description, input schema, annotations where returned | name only | `Available through adapter mapping only` |
| MCP resource/template | cached capabilities | URI/name/description/MIME/template fields per upstream payload | absent | `Available through adapter mapping only` |
| MCP prompt | cached capabilities | name/description/arguments | absent | `Available through adapter mapping only` |
| MCP catalog item | `mcp_catalog`/FTS | catalog identity, display/search/install metadata | absent | `Available through adapter mapping only` |
| MCP client/custom agent | `custom_agents`, request user-agent/agent classification, rejection log | keyword/display name/access configuration; observed request agent | absent from observe | `Available through adapter mapping only` |
| OAuth client/connection | OAuth client/state/token tables | IDs, backend/user/tenant scope, timestamps and statuses | absent | `Available through adapter mapping only`; secret values must be discarded |
| API/static credential metadata | API token/upstream-auth tables | credential ID/scope/mode/status metadata | absent | `Available through adapter mapping only`; raw values `Discard with reason` |
| Memory record | `memories` | owner, content, metadata, timestamps/embedding | absent | identity/metadata `Available through adapter mapping only`; content requires privacy decision |
| Workflow agent/version | workflow tables | agent/version/status/mode/definition/bindings/tool allowlist | absent | `Available through adapter mapping only` |
| Workflow run/step | gateway and runner DBs | request/run/step/status/timing/limits/errors | absent | `Available through adapter mapping only`; runner is separate process/store |
| Workflow artifact | runner DB/files | ID, run/chat context, path, size, hash, encoding/content type | absent | metadata `Available through adapter mapping only`; bytes raw-only or discard |
| Model | no consistent model identity in MCP observe path | insufficient | absent | `Not observable by this sensor` for Direct MCP; some workflow payloads may carry model configuration but authority is unresolved |
| Device/endpoint | no endpoint identity | insufficient | absent | `Not observable by this sensor` |
| Binary/package/artifact deployment | build manifests/commit refs, not runtime inventory | image/source metadata only | manifest commit/ref may be unknown | `Requires substantial sensor changes` for trustworthy runtime artifact inventory |

## Discovery lifecycle

### Backend

```text
registration validation/probe
→ repository save
→ capabilities/raw capabilities save
→ registry cache + slug index update
→ backend SourceObservation scheduled
→ tool SourceObservations scheduled
```

No observe hook exists for startup `registry.load()`, status change, settings
change, delete, or catalog backfill.

### Tool

```text
tools/list or registration discovery
→ processed/raw capability persistence
→ tool-name reduction
→ one SourceObservation per name
```

Call-time sightings provide partial discovery even when a prior discovery
observation was absent. The call-time source observation is tied to the derived
request and has `observed_via=tool_call`.

### Staleness and completeness

`Unresolved:` the current record has no snapshot ID, list completeness flag,
cursor, source revision, last-seen expiration, deletion record, or
authoritative-set marker. Central code cannot safely interpret absence from a
later list as deletion from current output alone.

`Potential issue:` discovery idempotency is deterministic and terminal
idempotency metadata has no visible expiration. A backend/tool removed and
later recreated with the same source identity can be suppressed as an already
delivered observation.

## Current inventory attribution

- **Observed by:** delivery envelope sensor ID/runtime instance and action
  sensor reference.
- **Owned by:** not captured in current source observation.
- **Provided by:** backend→tool relationship is implicit in source external ID
  and tool action resource, not emitted as `RelationshipEvent`.
- **Configured by:** not captured.
- **Active/disabled:** not captured on source observation.
- **Last seen:** `observed_at` exists per sighting; central last-seen semantics
  are `Derivable centrally from current output`.

## Recommended inventory disposition

These are target recommendations, not current behavior:

| Datum | Product disposition | Availability |
| --- | --- | --- |
| backend source ID, transport type, first/last seen, provenance | `Inventory list`, `Entity detail`, `Coverage and health` | `Available now without sensor changes` |
| tool source ID/name, backend context, first/last seen | `Inventory list`, `Entity detail`, `Relationship view` | `Available now without sensor changes` |
| backend display/description/status/owner/settings | `Entity detail`, `Configuration` | `Available through adapter mapping only` |
| tool schema/description/annotations | `Entity detail`, `Configuration` | `Available through adapter mapping only` |
| resources/prompts | `Inventory list`, `Entity detail` | `Available through adapter mapping only` |
| delete/stale lifecycle | `Coverage and health`, `Activity explorer` | `Requires minor sensor instrumentation` |
| raw auth tokens, secrets, tool content | `Discard with reason` or tightly governed `Raw-only retention` | not an inventory field |

