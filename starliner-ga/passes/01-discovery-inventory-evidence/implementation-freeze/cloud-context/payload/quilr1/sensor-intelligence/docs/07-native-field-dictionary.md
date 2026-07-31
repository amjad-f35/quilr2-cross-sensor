# Native Field Dictionary

The reviewed field ledger is
[`native-fields.csv`](../../../matrices/sensor-intelligence/quilr1-platform/native-fields.csv).
It currently contains 62 Quilr 1 rows carried from the first repository data
dictionary and cross-sensor analysis, with second-pass record classification
and corrected target dispositions.

## Coverage status

**Partial field closure.** The 62 rows account for all Quilr 1 rows in
`docs/quilr2-cross-sensor/matrices/source-fields.csv`, but they are not every
physical column in every ClickHouse table or every field in all 141 request
operations.

The rows divide as follows:

| Section | Rows | Content |
| --- | ---: | --- |
| Request identity and tenancy | 6 | authorization, tenant/subscriber/user and request correlation |
| Browser authentication/client state | 7 | cookies, permissions, authenticated user and PostHog |
| Common query-builder transport | 9 | query selection, ranges, pagination, filters, source and response wrapper |
| Status-event domain | 5 | status, identifiers, resolution and filter projections |
| Findings/masking/approval | 6 | protected content, whitelist, approval, smart group and audit reference |
| AI asset inventory | 4 | asset identity, JSON metadata and query pagination |
| Cache/lock/scheduler state | 7 | caches, work queue, locks and markers |
| Warehouse resource families | 10 | grouped table-name families, not atomic fields |
| Ports/limits/time values | 8 | runtime and UI defaults |

The ten warehouse rows (`0045`–`0054`) are deliberately classified as
**resource-family identifiers**, not fields. They enumerate tables that still
require deployed-schema validation and table-specific column reconciliation.

## Identity and request data

| Native datum | Verified lifecycle | Target treatment |
| --- | --- | --- |
| `Authorization` | browser client attaches a token; external decoder processes it before `RequestFilter` | do not canonicalize bearer material; retain only redacted auth fact or protected raw evidence when required |
| `subscriberid` | decoder context is preferred; fallback raw header can populate request context/MDC | candidate tenant/subscriber alias only after authenticated binding |
| tenant ID | usually first browser-user tenant; backend prefers selected tenant then raw header fallback | candidate `Tenant` alias with source/authority |
| user ID/email | auth response, context, filters, rows and audit metadata | candidate `User`/`Account` alias; preserve whether ID or email |
| `traceId` | incoming value or generated UUID; written to MDC/response, cleared in `finally` | request/observation correlation, not authorization |
| `requestId` | caller/DTO/cache identity | source-local correlation alias with collision domain |

No repository-wide syntax or authority contract unifies these IDs.

## Browser/session fields

Auth cookie name/value, external-auth cookie, roles cookie, permission map,
authenticated user, and PostHog identity are client/runtime state. They can
explain a platform request or UI decision but must not seed canonical
authorization or upstream activity.

Specific handling:

- the OAuth auth-cookie path sets a 12-hour age;
- client JavaScript reads the auth cookie;
- malformed cookie JSON can fail middleware parsing;
- roles and permissions are presentation state;
- logout paths clear different subsets;
- PostHog removes credential-like properties and bounds recursive
  sanitization to four levels.

Credential/token values are excluded from canonical records.

## Query transport fields

`queryName`, time range, pagination, ordering, filters, search fields, and
`source` describe a query/projection request:

- `queryName` selects a processor by a string key;
- the widget controller normalizes its time range before dispatch;
- status pagination defaults to page `0`, page size `50`, maximum `100`, but
  negative values are not uniformly clamped;
- interaction advanced search validates fields/operators;
- asset inventory concatenates caller-selected field identifiers without a
  visible local allowlist;
- `source` selects a source-specific interaction strategy and is a claimed
  selector, not independent proof of provenance.

`ServiceResponse` status/message/data is a transport envelope. Its payload
must be mapped per operation; the wrapper itself is not a finding/event.

## Findings, workflow, controls, and protected data

- Event status is a legacy finding/workflow state. The default query literal
  is `open`; no complete authoritative state enum is committed.
- Event/behavior IDs have record-specific meaning and cannot be universally
  renamed event IDs.
- Resolution items are control commands with per-item outcomes; multi-table
  writes can partially succeed.
- Filter values are distinct-value projections, not reference authorities.
- Masked conversation attributes and encrypted tokens are protected
  evidence. Current ciphertext uses a `v2:` AES-GCM format while legacy
  decrypt accepts AES/ECB data.
- Whitelist and user-app approval values are configuration/control state, not
  findings by themselves.
- Smart-group membership can produce a typed relationship observation and a
  separate mutation/audit outcome.
- Master audit codes are versionable reference data.

## Asset fields

Asset identity is a candidate source entity/alias. Metadata JSON must be
preserved exactly before parsing because `AssetInventoryDao.putJson` omits a
property when parsing fails. Search/filter/sort names and pagination belong to
request provenance; total count is a separate derived metric from a separate
query.

## Cache, queue, lock, and marker fields

These seven rows are operational:

- interaction and application/settings caches are projections;
- queue members are pending-work hints with non-atomic claim behavior;
- lock and last-run keys are coordination;
- app-admin marker can claim completion despite row failures;
- master bootstrap state changes before asynchronous work completes.

None is canonical identity, finding, event, or durable extraction cursor.

## Resource-family rows

| Family | Native resources | Required split |
| --- | --- | --- |
| alerts/findings/status | nine named alert/action/status/outcome/insight tables | signals, workflow, actions, outcomes, references |
| applications/settings | seven app/settings/process/IDP/admin resources | product/app aliases, configuration, cache, relationship |
| users/groups/approvals | four user/group/approval/action resources | people/accounts, membership, approval, relationship |
| interactions/visits | five interaction/summary/visit/enriched resources | native activity rows versus derived summaries |
| assets/devices | asset inventory and endpoint device table | asset/device observations and aliases |
| compliance/policy | event, score, policy and type-specific tables | events, calculated scores, definitions and projections |
| password findings | four status trackers | qualified finding signals and workflow state |
| audit/reference | audit rows and two master/reference tables | event evidence versus mutable reference data |
| red teaming | `redteaming_results` | run/result evidence and framework mappings |
| summary materializations | three AI-user summary tables | derived metrics with formula/freshness/coverage |

## Configuration values

| Value | Verified current value | Classification |
| --- | --- | --- |
| backend port | `AI_AXIS_PORT`, default `8052` | deployment endpoint configuration |
| frontend port | `3000` | deployment endpoint configuration |
| ClickHouse operation maximum | `10000` rows | post-materialization check, not database/extraction bound |
| dashboard executor | core 8, max 32, queue 200, caller-runs, 30-second wait | concurrency/backpressure configuration |
| interaction cache TTL | 3 minutes | cache configuration |
| OAuth cookie age | 12 hours | session configuration |
| PostHog sanitizer depth | 4 levels | analytics privacy configuration |
| status page defaults | page 0, size 50, max 100, status `open` | query/UI defaults |

## Corrected cross-sensor mapping contradictions

The earlier generalized mapping assigned target categories mechanically.
Second-pass code review contradicts these examples:

| Prior mapping | Actual evidence | Reviewed disposition |
| --- | --- | --- |
| `pageSize` → event usage/economic attribute | it controls result pagination | request/extraction metadata |
| response status/message/data → finding signal | it is the generic `ServiceResponse` wrapper | route-specific compatibility transport |
| interaction cache → finding signal | it is a three-minute query projection | diagnostics only |
| application/settings cache → entity identity | it is an ephemeral projection | reconciliation only, never identity authority |
| users/groups/approvals resource family → finding signal | the row is a grouped table index containing different concepts | split per physical record |
| backend/frontend port → entity identity | values configure HTTP listeners | deployment/runtime configuration |
| interaction cache TTL → finding signal | value is three minutes | cache-expiry configuration |
| status page defaults → finding signal | values control a query/UI default | configuration; only the status literal may seed a legacy vocabulary |

The specialized CSV contains corrected dispositions for all 62 rows without
altering the historical cross-sensor source matrix.

## Missing evidence for exhaustive physical closure

`Unresolved:` exact deployed physical columns, nullable/default expressions,
codecs, materialized columns, TTLs, indexes/order keys, producer ownership,
and population rules for every warehouse resource. Supporting migrations
provide source-controlled DDL for many tables, but deployment profile/version
and drift were not supplied.

Before adapter sign-off, every physical field used by a selected backfill
record must be added with:

- exact table/column and source migration;
- native type, null/default and unit;
- producer and consumer symbols;
- transformation and loss behavior;
- identity/relationship/event/metric disposition;
- privacy and trust-boundary classification;
- live-schema verification result.
