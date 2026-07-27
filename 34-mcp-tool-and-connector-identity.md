# 34. MCP, tool, and connector identity

## Current limitation

The current dossier identifies an external MCP Gateway boundary and Quilr/MCP analytics/UI paths, but the authoritative MCP source repository and full schemas were not supplied. Endpoint discovery and gateway request metadata provide partial observations. Current capability is therefore explicitly **integration-dependent**.

## MCP client

Distinguish:

```text
MCP client product
client installation
client version/artifact
human or agent user
device/workload
session
OAuth client
connection
```

Claude Desktop, for example, can be an application surface and MCP client without becoming the same entity as the Anthropic product, a user account, or an agent.

## MCP server

Distinguish:

```text
server product/definition
server version
artifact
deployment
endpoint
runtime workload
tenant registration
connection
```

Strong candidates include registry/registration IDs, server public key or workload identity, package/container digest, and signed manifest. An endpoint URI is a mutable locator and cannot identify the server by itself.

## Tool identity

Canonical tool identity includes:

```text
MCP server identity
tool namespace and name
tool version
canonical input-schema digest
canonical output-schema digest
declared capabilities
declared side effects
implementation artifact
```

`search`, `execute`, or `read` are not globally unique tool IDs. A schema change without version change emits `identity.conflict_detected` and a tool-schema finding.

## Connector identity

Separate:

```text
connector product
implementation version/artifact
tenant integration instance
provider account
OAuth client
OAuth grant
credential
synchronization job/cursor
```

Disconnecting an integration ends the connection/grant but does not delete provider-account or historical activity identity.

## External resources

Provider-native IDs are retained for:

- tenant/workspace/project;
- repository/database;
- folder/file/record;
- ticket/message/calendar;
- customer account and other business resources.

Path, filename, title, and URL are aliases/locations with valid intervals.

## Required adapter contract

An MCP/connector source adapter must emit:

```text
tenant and source instance
client/server/tool/connector native IDs and versions
provider account/registration/connection IDs
human, agent, workload, and session/run references
OAuth client/grant/credential metadata
tool schemas and digests
event ID/sequence/time
registration/change/revocation/deletion events
authenticated source/evidence reference
```

It must support full registry reconciliation and source tombstones in addition to streaming activity.

## Authorization and attribution

Every tool call references:

- initiating human/workflow and account;
- agent definition/version/deployment/run when present;
- MCP client and connection;
- MCP server deployment/workload;
- exact tool version/schema;
- effective principal, grant, credential, audience, and resource;
- policy decision/approval;
- observing sensor/gateway and evidence.

An OAuth client identifies registered software; the grant identifies authority; the access token exercises that authority; the connector connection associates them with the provider account. These cannot be collapsed.

## Findings

The target detects unverifiable server identity, ambiguous tool name, unversioned schema change, credential/connection attribution gaps, unowned OAuth clients, unidentified connected accounts, and unattributed tool execution. See [identity-findings.csv](matrices/identity-findings.csv).

