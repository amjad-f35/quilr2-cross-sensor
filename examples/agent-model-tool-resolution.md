# Agent, model, and tool resolution

## Custom internal agent using several models

Create:

- one Agent Definition from repository/native definition ID;
- one immutable Agent Version per artifact/config digest;
- one Agent Deployment per environment/deployment ID;
- runtime instances and runs as ephemeral/activity objects;
- separate Model Deployments for every provider/account/endpoint/region;
- temporal `Agent Definition USES Model Deployment` relationships supported by configuration and/or invocation evidence.

Switching models changes a relationship and emits model invocation events; it does not create a new agent unless the definition/version identity changed.

## One MCP server exposing several tools

Create one MCP Server Deployment from strong transport/deployment identity. Create each Tool from:

```text
server deployment ID
+ exact tool name/capability ID
+ canonical schema digest/version
```

`search`, `read`, and `delete` on one server are three tools. The same `search` name on another server is a different Tool. A manifest/schema change creates a Tool Version and may open a “Tool manifest changed” finding.

Calls are canonical events linked to Agent Run/MCP Client/Server/Tool/target/decision/evidence. Tool arguments/results remain protected evidence by default.

## Model route to several providers

One Model Route alias has bitemporal `RESOLVES_TO` relationships to one or more Model Deployments. Each invocation records the actual resolved deployment. Aggregation by route answers routing intent; aggregation by deployment/provider answers operational reality.
