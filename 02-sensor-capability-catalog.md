# Sensor capability catalog

The complete matrix is [sensor-capabilities.csv](matrices/sensor-capabilities.csv). Field-level evidence is [source-fields.csv](matrices/source-fields.csv).

## Browser extension

**Verified / Available now:** Vanguard directly observes browser/page context, application URL/domain, browser file metadata (`name`, `size`, MIME hint, `lastModified`), prompt/copy/paste/upload interactions, policy/action state, user-facing allow/block/override/cancel outcomes, request/workflow IDs, Persona tenant/subscriber/token context, and diagnostics. Browser content is transferred through page, isolated, and background contexts and selected events reach the Browser Extension Service. [BR-DATA](../../Browser-extension-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md) and [BR-API](../../Browser-extension-sensor-analysis/outputs/repository-analysis/10-api-and-interface-reference.md).

It can directly establish:

- browser/user context used an application surface;
- a page interaction or file upload targeted a web origin;
- a browser control produced an outcome;
- a source event carried DLP/policy fields where emitted.

It cannot establish the exact model/provider behind a web application, a durable provider account ID, a model deployment, the local path/content identity of a browser `File`, non-browser activity, or authoritative ownership. Browser display/account hints remain observations.

## Browser native host

**Verified / Available now:** Project Sentinel receives length-framed actions with event IDs, resolves file metadata to local candidate paths, performs file metadata/DLP processing, observes clipboard copy content, supports modify/block/restore actions, records Persona/configuration state, and sends task heartbeats/results. [BR-DATA](../../Browser-extension-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md).

It can establish a local file candidate/effect on a device and clipboard activity. It cannot safely identify a file across systems from the current positional response model, because mixed scan results can reorder and lack a stable per-file request ID. It also cannot infer the browser account or model.

## Browser Extension Service

**Verified / Available now:** BES exposes 181 mappings for Persona, extension/endpoint deployment, configuration, application settings, registration, heartbeat, DLP/risk/audit ingestion, onboarding, exports, notification, and operational endpoints. Heartbeats include device/email/persona/browser/extension/OS/agent/version/sync fields. Five transformation schemas map 137 event fields into Kafka/DWH records. [BR-API](../../Browser-extension-sensor-analysis/outputs/repository-analysis/10-api-and-interface-reference.md), [BR-SCHEMA](../../Browser-extension-sensor-analysis/outputs/repository-analysis/generated/browser-extension-service-schema-ledger.md).

It can directly establish Persona-to-device/browser observations and transform browser/application/policy/DLP events. It cannot be treated as authoritative for identity or relationships merely because it writes Neo4j/DWH; decoder behavior, graph constraints, live schema, and cross-store consistency are external/unresolved. Its schema `required` and type metadata are not current validation.

## Endpoint System Monitor v2

**Verified / Available now:** the endpoint directly discovers nine typed variants: `Application`, `McpServer`, `Hook`, `Skill`, `Agent`, `Model`, `ControlledRepo`, `Permission`, and `Plugin`, with device/user/tenant/governance/sync timestamps. Process, Lua, and package scans supply observations; application names are resolved by a backend app-ID endpoint before gzip entity ingest; delta polling receives governance. [EP-ENTITY](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-runtime-discovery-and-state.md), [EP-SYNC](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-sync-enforcement-and-hooks.md).

The shipped Lua detectors provide evidence for Claude Code, Cursor, Codex, OpenClaw, NemoClaw, Ollama, and LM Studio configurations. They can observe MCP transport/command/arguments/environment-variable names/URL/scope/risk, agent/model/skill/plugin/permission/repository configuration, and application relationships. [EP-SCRIPT](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-scripting-packages-tests-and-documents.md).

Important limits:

- the converter discards raw emitted relationships/events, composite risk, and many rich artifact fields;
- existing entity payloads do not refresh beyond name/last-seen;
- same-name user-scoped entity types can collide because type is omitted from UUID input;
- MCP UUIDs omit parent application and transport;
- application exit does not update stored `is_active`;
- only applications are process-enforced.

These defects mean endpoint IDs are source aliases, not canonical IDs.

## Endpoint proxy and DLP

**Verified / Available now:** the proxy can observe attributed process/PID where resolution succeeds, destination/domain/connection context, request/response bodies in relevant paths, extracted data, DLP findings, policy actions, justification responses, alerts, and network/enforcement outcomes. [EP-DATA](../../Endpoint-agent-sensor-analysis/repository-analysis/08-data-dictionary.md), [EP-PROXY](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-proxy-dlp-ui-alerts.md).

It can establish process-to-destination and data/action observations, but cannot guarantee attribution for all UDP/IPv6/relay paths. Some analyzer/config/UI failures allow traffic or apply a default action. A network observation alone does not prove a particular browser/provider account, agent, model, or user intent.

## Endpoint IDE hooks

**Verified / Available now as telemetry:** Cursor/Claude hooks can send session, prompt, tool, file, command, user/device/application data through local framed IPC and activity batching. The production evaluator currently always allows and does not invoke DLP/policy. [EP-SYNC](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-sync-enforcement-and-hooks.md).

These records are activity/evidence inputs, not proof of enforcement. Stable agent/run/step/tool IDs require new telemetry.

## Persona and email discovery

**Verified / Available now:** the helper obtains email candidates from nine local discovery sources and returns email/source/all-source/time data to its privileged parent; Persona supplies tenant/subscriber/access-token context and device identifiers. [EP-DATA](../../Endpoint-agent-sensor-analysis/repository-analysis/08-data-dictionary.md).

Email is a secondary identity alias unless linked to an issuer-qualified IdP subject. The fixed local endpoint and absent peer binding limit evidence integrity.

## Endpoint diagnostics

**Verified / Available now:** diagnostic event/batch/lifecycle records include UUID, timestamp, level, category, component, code, message, and arbitrary context; records can move through the local broker, NDJSON, and OpenSearch bulk. Source process identity is claimable and the standalone receiver regenerates ID/time in one path. Use this as operational evidence with confidence/integrity metadata, not canonical business identity.

## Endpoint Dashboard/API

**Verified:** the Go service and frontend expose tenant-scoped asset, relationship, activity, policy, configuration, integration, and health views over ClickHouse and endpoint HTTP ingestion. [EP-EXEC](../../Endpoint-agent-sensor-analysis/repository-analysis/02-executive-overview.md).

It is an aggregation/source-compatibility boundary. Rows may seed backfill, but are not promoted directly to canonical entities without their originating sensor evidence and identity rules.

## LLM/DLP gateway

**Verified / Available now:** the gateway observes tenant, request/event/context/behavior IDs, application/API-key/user identity, provider, selected model/deployment/route inputs, messages, tools/tool calls in provider payloads, streaming mode, input/output tokens/usage, rate/concurrency controls, prompt/response DLP classifications, Guardian/hallucination results, policy actions, provider outcomes, latency, and partial cost inputs. [LLM-DATA](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md).

It can establish that a credential/user/application context invoked a provider/model through this gateway and that gateway policies/detectors produced results. It cannot see direct-provider/browser/endpoint activity that bypasses it. Agent and human attribution are only as strong as supplied credential/context. A model alias is not a model version or deployment.

## LLM/DLP workers

**Verified / Available now:** Rust/Python workers consume DLP, exploit, custom-category, prompt-category, hallucination, red-team, embeddings, false-positive, and database-write messages. Tagged results carry result/complete/error, category IDs/names, sensitive entities, subcategories, reason, detection type/metadata, timing, count, and optional predictions. [LLM-DATA](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md), [LLM-STORE](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/09-data-models-and-storage.md).

Workers provide classification/evidence and operational version/timing when emitted. They do not create canonical data assets or findings by themselves.

## Endpoint Config Manager

**Verified / Available now:** per-tenant endpoint settings, exclusions, scoped DLP/hook configuration, browser process names, effective resolution, mutations/access-control config, and dependency-security checks are exposed over HTTP/SQLite. Versioned writes use optimistic conflict detection. The service has no application-level authorization in source and is not launched by the tracked all-in-one production supervisor. [LLM-EXEC](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/02-executive-overview.md).

Treat it as configuration evidence; enforce network/authentication before collection.

## Gateway-health probes

**Verified / Available now:** provider and MCP endpoints are periodically probed and summarized in SQLite/public rollups. Health is synthetic reachability/latency evidence, not proof of tenant use, authorization, or product inventory.

## External MCP Gateway

**Verified only as an external boundary:** Quilr 1 has client/server/tool/prompt/resource/policy management UI and query-builder endpoints for MCP findings, requests, agents, KPIs, and latency. [Q1-FEATURE](../../quilr-platform-analysis/05-feature-catalog.md).

**Unresolved:** native server/client/tool IDs, tool schema/version, call/request/result/effect, OAuth/account, policy decision, and replay contracts. Do not present these as verified fields until the missing source/API schema is supplied.

## Quilr 1, IdP, and connector boundaries

Quilr 1 tables and graph/cache records are compatibility/backfill sources. Identity/IdP and SaaS connectors are evidenced external systems, but their native contracts were not supplied. They are required for authoritative human/group/department, application account/subscription, connected account, OAuth scope, ownership, billing, and access lifecycle.

## Cross-sensor deductions available now

- Browser domain + endpoint signed/bundle application + catalog alias can resolve a shared AI Product while retaining separate surfaces.
- Endpoint model/agent/MCP configuration + LLM gateway model invocation can establish an agent-to-model dependency when user/device/application/time identifiers corroborate.
- Browser upload + native file resolution/DLP + endpoint proxy destination + gateway prompt attachment can form one data-transfer activity.
- BES/endpoint heartbeat + activity can distinguish “not recently observed” from “sensor is stale.”
- Endpoint provider traffic with no matching gateway event can produce a bypass candidate, not a conclusive bypass, until clock/coverage/correlation thresholds pass.

## Cross-sensor deductions that require new evidence

- personal versus enterprise browser account;
- exact agent run/step and human delegation;
- MCP tool call/result/effect and gateway bypass;
- provider deployment/account/region behind aliases;
- governed data-asset identity behind content classifications;
- cost per successful business outcome;
- historical decision replay and certification coverage.
