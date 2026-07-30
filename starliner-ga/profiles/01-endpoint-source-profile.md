# Endpoint Source Profile

Status: **normative profile; current source binding verified at pinned audited revisions**

## Purpose and authority

The endpoint profile observes device-local processes, artifacts, network destinations, local AI applications, runtimes, and supported enforcement. It is authoritative for what the installed agent directly sees on its covered device, not for enterprise ownership or provider-side execution.

The exact process monitor, correlation/store, sync, proxy, hook, DLP and local-runtime integration seams and required corrections are in the [endpoint sensor binding](../implementation/13-endpoint-sensor-binding.md).

## Source object types

- managed device and endpoint agent;
- user/session pseudonym;
- process and process tree;
- executable/package/artifact;
- local AI application;
- local model/runtime;
- network destination;
- local MCP client/server/process;
- file or data-operation indicator;
- policy decision, command outcome, and effect;
- installed-software and capability snapshot.

## Strong identifiers

- MDM/device identity bridge where available;
- endpoint installation ID;
- executable/package digest and signed publisher;
- OS-native package ID;
- process instance ID scoped to boot epoch;
- normalized network endpoint;
- runtime-issued model/server identifiers;
- privacy-safe user/session bridge.

Process name and path alone are weak aliases.

## Default-safe fields

- artifact digest, publisher, package/version;
- process lineage identifiers;
- normalized destination;
- connection and execution metadata;
- runtime/model identifier where directly observed;
- coarse data-operation class;
- environment and device management state;
- decision, command, and outcome metadata;
- health and coverage.

## Restricted or prohibited

Command-line arguments, file paths, filenames, environment variables, file content, process memory, and local model input/output require reviewed handling. Secrets and credential material are prohibited. Path normalization must avoid usernames and confidential project names.

## Lifecycle and reconciliation

- agent and device lifecycle;
- boot/process epochs;
- installed-software snapshots;
- local model/runtime snapshots;
- explicit package removal;
- current MCP process/service snapshot where supported;
- visibility gaps during sleep, offline, permission loss, or agent failure.

## Capability classes

- observe process/artifact/network;
- detect local AI runtime/application;
- warn/block process or connection where certified;
- quarantine supported artifact;
- apply source configuration;
- report local effect;
- provide device population coverage with MDM reconciliation.

## Central resolution contributions

- application and artifact identity;
- device and user bridges;
- agent/model/MCP deployment candidates;
- process-to-network and process-to-tool relationships;
- activity and data-use indicators;
- endpoint coverage.

## Required certification

Per-OS versions and architectures, performance, boot/restart, sleep/wake, network partition, tamper resistance, privilege separation, kernel/user-mode differences, package inventory correctness, EDR coexistence, privacy, enforcement safety, upgrade/rollback, and enterprise deployment tooling.

## Product caveats

The endpoint proves device-local observation. A network connection to a provider is not automatically a model execution, and a local process named after a product is not automatically the same canonical application.
