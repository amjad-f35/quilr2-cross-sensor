# MCP Gateway Source Profile

Status: **normative profile; current source binding verified at the pinned audited revision**

## Purpose and authority

The MCP gateway profile observes registered MCP servers/tools and proxied MCP sessions, requests, and outcomes. It can be an enforcement point for traffic routed through it. It does not see direct or local MCP traffic that bypasses it.

The exact registry, Direct MCP, OneMCP, observe mapper, outbox and legacy policy seams and required corrections are in the [MCP Gateway sensor binding](../implementation/15-mcp-gateway-sensor-binding.md).

## Source object types

- gateway deployment;
- MCP server definition and deployment;
- server connection/session;
- tool/resource/prompt definition;
- client application or agent;
- authenticated user/workload;
- initialization and capability negotiation;
- tool/resource/prompt invocation;
- policy decision, command, outcome, and effect;
- health and reconciliation snapshot.

## Strong identifiers

- gateway and route ID;
- server registry ID;
- normalized server endpoint/transport;
- server-native name/version;
- tool/resource/prompt name scoped to server deployment;
- authenticated client workload/principal;
- MCP session and request ID;
- propagated causal trace/correlation ID where available.

Display labels or tool names without server scope are not global identity.

## Default-safe fields

- MCP protocol/version and transport;
- negotiated capabilities;
- server/tool/resource/prompt identifiers;
- client and principal identity class;
- operation type and timestamps;
- status, latency, retry, cancellation;
- argument/result structural shape, size, and data-class indicators;
- decision and command metadata;
- health, reachability, authentication posture.

## Restricted or prohibited

Tool arguments/results, resources, prompts, sampling content, elicitation content, headers, tokens, and credentials are restricted or prohibited. Hashes of low-entropy raw arguments do not make them safe; approved tenant-keyed tokenization or feature extraction is required.

## Lifecycle and reconciliation

- gateway deployment lifecycle;
- registry snapshot of servers and tools;
- explicit server/tool removal;
- session lifecycle;
- protocol capability changes;
- current authentication and reachability posture;
- incomplete scan and bypass coverage.

## Capability classes

- observe registry and invocation metadata;
- authenticate/authorize supported clients and servers;
- allow, warn, require approval, deny, or rate-limit invocation;
- disable or quarantine a registered route where certified;
- report command and independently observed effect.

## Central resolution contributions

- MCP server/tool canonical candidates;
- agent/application/client relationships;
- user/workload delegation;
- tool invocation activity and outcomes;
- exposure/authentication findings;
- MCP gateway coverage.

## Required certification

Supported MCP versions and transports, initialization negotiation, request/notification semantics, progress/cancellation, streaming, server restarts, tool list changes, schema size/cardinality, privacy leakage, authentication modes, bypass behavior, enforcement latency, offline delivery, and effect verification.

## Product caveats

The MCP profile is a crucial source, but a single MCP walking skeleton cannot prove the Quilr 2 value proposition. Cross-sensor resolution with agent/application/model identity and coverage must be proven before declaring the unified estate GA.
