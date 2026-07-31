# 10 — Identity and Attribution

## Identity model summary

The endpoint has useful identity material, but no single, uniform identity
contract. Three different device identifiers, deterministic entity UUIDs,
backend canonical IDs, runtime IDs and display names coexist.

The detailed ledgers are:

- [identifiers.csv](../../../matrices/sensor-intelligence/endpoint-sensor/identifiers.csv)
- [identity-coverage.csv](../../../matrices/sensor-intelligence/endpoint-sensor/identity-coverage.csv)
- [native-identifier-types.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/native-identifier-types.yaml)

## Device identity

### Persona device ID

`core/src/persona/heartbeat/device_id.rs::generate_device_id` tries:

1. hardware UUID;
2. motherboard serial;
3. OS machine GUID;
4. MAC + hostname;
5. synthetic timestamp + UUIDv4.

Every chosen raw value is SHA-256 hashed to 64 hex characters. The final
synthetic tier is non-deterministic across invocations and the output itself
does not encode which tier was used.

### Monitor device ID

`system-monitor/v2/src/entity/context.rs::fetch_device_id` is separate:

- macOS: raw `IOPlatformSerialNumber` from `ioreg`;
- Windows: BIOS serial via SMBIOS, WMI/COM, PowerShell CIM, then PowerShell WMI;
- failure: empty string.

This value is not the same algorithm or privacy treatment as the Persona
device ID.

### Backend device ID

`UserDevice.id` is assigned by the backend and accepts string or signed integer
JSON before normalizing to string.

**Contradiction:** three device namespaces are present without a first-class
namespace/tier field. They must not be merged by value blindly.

## Human and account identity

- `Persona.id` is the backend user UUID string and is the strongest current
  human/account identifier.
- `Persona.email` and `UserProfile.emailaddress` are mutable aliases, useful
  for correlation but not immutable person IDs.
- `subscriber` and `tenant` are backend UUID strings according to source
  comments; format is not validated by the struct.
- roles, permissions, groups, department, admin status, job title, location and
  account status are attributes/claims, not identities.
- OS `ProcessInfo.user` is a local account/SID observation. It is discarded
  before the discovery entity wire.
- Hook `user_id` is copied from current context, not independently
  authenticated by the IDE hook.

## Entity identifiers

### Applications

`entity_id(app_name, install_path)` is UUIDv5 in `Uuid::NAMESPACE_URL` over:

- `"{app_name}:{install_path}"` when path exists;
- `"process:{app_name}"` otherwise.

It is deterministic for identical text, but path normalization/casing and
missing-path behavior affect stability. A later scan with a path can create a
different ID from an earlier process-only discovery.

### MCP servers

`mcp_server_id(tenant_id, name)` is UUIDv5 over
`"{tenant_id}:{mcp_server_name}"`.

**Potential issue:** parent application, user, transport, command, URL and
configuration path are omitted. Two distinct configured servers with the same
tenant/name collide.

### User-scoped entities

Skills, hooks, agents, models, repositories, permissions and plugins use
UUIDv5 over `"{tenant_id}:{email}:{entity_name}"`.

**Potential issue:** kind is absent. Same-name objects of different kinds for
the same tenant/email collide in the single `EntityStore` UUID keyspace.
Repository conversion sometimes constructs a `unique_name`, but this does not
fix the general cross-kind collision.

### Backend canonical application ID

`ApplicationData.canonical_id` is returned by the app-add/ingest API and is the
preferred platform correlation key when present. It remains source/backend
namespaced; it is not automatically a global Quilr canonical ID.

## Runtime and correlation identifiers

| Identifier | Scope | Strength |
| --- | --- | --- |
| PID | OS process table until reuse | runtime-scoped; combine with start time/device |
| process start time | OS/process sample | secondary process-instance component |
| hook `session_id` | IDE/source session | source-defined, validation weak |
| activity entry | no native ID | cannot be reliably deduplicated/correlated |
| proxy request ID | one proxy request | timestamp + random hex; correlation only |
| extension connection ID | Network Extension connection | source-defined local runtime |
| UDP packet ID | one extension packet | source-defined local runtime |
| alert UUID | one serialized alert | strong random transport ID, not action ID |
| diagnostic UUID | one diagnostic | strong random event ID |
| service name/process ID | configured process label | mutable operational alias |

## Process attribution

The strongest observed chain is available on macOS Network Extension traffic:

```text
connection ID
→ audit-token-derived process metadata
→ PID + process path
→ source socket
→ original destination
→ proxy request
```

Current `RequestContext::set_source_app` retains only PID and optional name.
Audit token and process path are lost before alert construction.

Windows redirector state retains tuple/PID/name associations but not an
equivalent cryptographic audit token.

Process snapshots have PID, start time, PPID, executable and user; current
Application emission drops PPID/start/user.

## Agent, model, MCP and tool attribution

- Agent definitions can declare models, tools and MCP servers. This is a
  configuration relationship, not observed use.
- Hook ActivityEntry has `tool_name` but current output leaves `agents`,
  `skills`, `mcp_servers`, `model` and `version` empty.
- Tool input/command is captured in HookRequest but omitted from activity.
- Proxy alerts can identify process, user/device and destination application;
  they do not provide canonical agent-run/model/tool-call identities.
- No credential ID, OAuth grant ID, MCP connection ID or effective remote
  principal is emitted.

## Attribution-chain coverage

```text
initiated_by        Partial: user/device/process context
requested_by        Partial: hook/proxy request source
delegated_by        Not observed
planned_by          Not observed
approved_by         Partial: local user justification only
executed_by         Partial: process attribution; no agent runtime identity
runs_as             Partial: OS process user captured then dropped
authenticated_as    Partial: Persona/backend account; remote app auth unproven
effective_principal Not observed for remote action
credential_used     Secret material exists locally; safe credential ID absent
observed_by         Implicit sensor component; canonical sensor instance absent
decided_by          Partial policy/control labels
enforced_by         Monitor/proxy component can be identified
deployed_by         Not observed
built_by            Not observed
signed_by           Not generally observed
```

## Recommended canonical use

- Preserve identifier namespace, source component and algorithm/tier.
- Model Persona backend user ID separately from email and OS account.
- Model the three device IDs as aliases until an authoritative mapping confirms
  equivalence.
- Use `(device, PID, process_start_time)` as the minimum process-instance key;
  current wire requires instrumentation to supply it.
- Treat entity UUIDv5 values as source observation keys, not global canonical
  IDs.
- Use backend `canonical_id` as a source-system alias.
- Never materialize an agent run, MCP connection, tool call or remote SaaS
  account from display names alone.
