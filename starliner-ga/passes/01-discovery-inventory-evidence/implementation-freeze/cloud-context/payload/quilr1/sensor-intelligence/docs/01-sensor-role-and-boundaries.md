# Platform Role and Boundaries

## Exact role definition

**Verified in source:** Quilr 1 is a two-target application boundary composed
of:

1. `quilr-web`, a Next.js/React product and administrative UI;
2. `quilr-query-builder`, a Spring Boot query, aggregation, enrichment,
   workflow, and diagnostic service.

It consumes browser-, endpoint-, LLM-, MCP-, identity-, graph-, and
connector-originated data through ClickHouse, external APIs, Neo4j, Redis,
PostgreSQL, and Kafka-facing dependencies. It does not implement the native
capture hooks of those upstream sensors.

## Role attributes

| Attribute | Verified answer | Evidence | Confidence |
| --- | --- | --- | --- |
| Where it runs | Next.js process on port 3000 and Spring/Tomcat process on configurable port 8052 | target Docker/runtime configuration and prior runtime probes | Runtime verified |
| Invocation | `next start` for web; executable Spring Boot JAR for query-builder | build files and dynamic verification | Runtime verified |
| Primary actors | authenticated platform users, administrators, schedulers, and external API clients | routes, UI shells, controllers, lifecycle hooks | Verified in source |
| Data access | HTTP services; ClickHouse; one local JPA family in PostgreSQL; Redis/Redisson; Neo4j; Kafka audit publisher; classpath/static files | imports, configuration, repositories, dynamic registration | Verified in source |
| Trust boundary | browser → Next/BFF/ingress → decoder/request context → controllers → stores/services | target/supporting source and probes | Runtime verified for isolated paths |
| Passive or active | both: reads/aggregates data and performs settings, approvals, whitelist, status, synchronization, audit, and administrative mutations | feature/API catalog | Verified in source |
| Inline or asynchronous | synchronous HTTP plus schedulers, `@Async`, application-ready work, and a daemon bootstrap executor | 59 lifecycle hooks | Verified in source |
| Offline operation | no platform-wide offline mode or durable telemetry outbox | source searches and recovery analysis | Verified absence in targets |
| Local buffering | Redis caches/sets/markers and ClickHouse tables exist, but not a universal acknowledged outbox | storage analysis | Verified in source |
| Receives policy/commands | selected HTTP mutation APIs and external authz/PDP decisions; no signed Starliner control channel | API/security analysis | Verified / target channel absent |
| User-facing UI | 112 App Router pages across inventory, findings, users, gateways, controls, settings, integrations, and secondary features | route inventory | Verified in source |
| Administrator-facing UI | settings, integration, gateway, detection, control, endpoint, browser-extension, audit, and diagnostic surfaces | feature and route catalogs | Verified in source |
| Native enforcement | selected whitelist/approval/status/configuration writes; no generic inline source action interceptor | controller/service flows | Verified in source |
| Unique visibility | a cross-source, tenant-facing composite view and legacy warehouse/workflow state | feature/store mapping | Verified in source |

## What Quilr 1 can directly know

It can directly know only what is present at one of its own execution
boundaries:

- the HTTP request, caller-supplied headers, decoded context supplied by the
  dependency, and request trace it creates;
- the browser cookie/session/client state handled by `quilr-web`;
- data returned by its configured stores and external services at query time;
- results and errors of mutations it invokes;
- its own scheduler/cache/lock/marker state;
- its own runtime health, mappings, resource diagnostics, logs, and build
  identity as observed in the isolated verification.

Even these facts retain source and trust qualifications. A raw tenant header,
for example, is not equivalent to an authenticated tenant identity.

## What Quilr 1 cannot establish alone

**Verified boundary / Unresolved external evidence:**

- whether an upstream browser, endpoint, LLM, or MCP sensor observed every
  relevant activity;
- whether absence of a row proves absence of an asset or event;
- canonical cross-sensor entity identity;
- authoritative human/person identity from email or display name alone;
- exact model artifact/deployment identity from a model-name string;
- full agent definition/version/deployment/runtime/run attribution;
- actual tool-call side effects when only an analytics row exists;
- production retention, coverage, completeness, or delivery guarantees;
- current rendered deployment/artifact identity;
- current graph authority or graph-to-warehouse consistency;
- whether legacy findings represent unique root causes.

## Supported and unsupported modes

| Mode | Current status | Evidence |
| --- | --- | --- |
| Query/read/analytics | Implemented | 141 backend operations and 112 pages |
| Administrative mutation | Implemented | app settings, approvals, whitelist, status, audit codes, sync, ClickHouse ops |
| Scheduled synchronization | Implemented | seven active scheduled methods |
| Degraded HTTP-ready state | Runtime verified | HTTP served while ClickHouse/Neo4j paths failed |
| Observe-only sensor mode | Not applicable | platform is not a native sensor |
| Native monitor/audit capture | Not observable by this platform alone | upstream sensor responsibility |
| Warn/justification/approval | Approval and selected status UI/workflows exist; universal inline semantics unresolved | feature/API evidence |
| Redact/transform | Conversation decrypt/masking and response transformations exist; generic enforcement redaction does not | masking/processor flows |
| Block/quarantine/terminate | No generic platform-native enforcement point found | control analysis |
| Offline durable collection | Not implemented | no WAL/outbox/ack/replay contract |
| Enrollment/certification | Not implemented as Starliner source enrollment | target architecture only |
| Updating | Build/deployment pipelines exist; no signed sensor self-update lifecycle | operations analysis |
| Diagnostic | Implemented backend DWH/Actuator surfaces | runtime/API evidence |
| Disabled/feature-gated | Implemented for multiple frontend features | feature flags |

## Architectural classification for Quilr 2

**Proposed, aligned with accepted ADR-0014:** treat current Quilr 1 stores and
APIs as a family of legacy evidence and compatibility sources:

- ClickHouse: backfill/compatibility source for observations, events, signals,
  workflow, and projections;
- Neo4j: relationship observations with unknown authority/history;
- Redis: operational reconciliation only, never canonical authority;
- PostgreSQL: narrow legacy operational state;
- frontend/query-builder APIs: compatibility façades during migration;
- web UI: reusable workflows and interaction patterns, but not a canonical
  identity join layer.

This classification does not grant the legacy platform the responsibilities
of a native sensor or Starliner adapter.
