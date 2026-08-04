# UI Information Architecture

Status: **normative pass product experience**

## Navigation

The pass shows:

1. **Overview**
2. **Inventory**
3. **Activity & Evidence**
4. **Sources & Coverage**

Permissioned:

- Identity & Resolution
- Exports
- Audit
- Administration

Insights, Cases, Analytics/Cost, and Policies do not appear as empty navigation.

## Overview

### Estate

Five cards:

- Applications
- Agents
- Models
- MCP Servers
- Tools

Each card includes current count, newly discovered count for selected time, last complete watermark, and applicable source coverage.

### Material source changes

Explicit fact-based changes:

- entity discovered;
- surface/deployment added or removed-at-source;
- model route/deployment observed;
- MCP server/tool registry changed;
- new activity observed;
- source became stale/degraded/recovered;
- identity was merged/split/corrected.

No risk ranking or finding language.

### Visibility

- expected versus reporting producers where population is available;
- freshness by source profile;
- active gaps and affected time/population;
- last complete snapshots;
- projection lag;
- unsupported/bypass caveats.

### Activity

- bounded activity counts/trends by source and entity class;
- native outcome/status classes;
- top active entities by explicit count;
- data is labeled with source coverage and watermark.

## Inventory

Tabs:

- Applications
- Agents
- Models
- MCP Servers
- Tools

Lists support server-side search, filters, saved views, cursor pagination, optional useful columns, export, stable selection, and permission-safe counts.

### Entity page

- simple identity summary;
- distinct surfaces/deployments/versions/accounts;
- source-backed lifecycle;
- relationships;
- recent activity;
- source coverage/freshness;
- identity and sources panel;
- aliases and native identifiers;
- evidence/provenance drilldown;
- ambiguity/conflict;
- timeline;
- export.

No owner is shown unless an approved source exists. No policy or risk action is implied.

## Activity & Evidence

### Activity view

Human-readable canonical activity:

- who/what acted;
- application/agent/model/MCP/tool;
- source and environment;
- time/duration;
- outcome;
- existing native decision/effect;
- correlation confidence;
- evidence members;
- coverage/capture caveat.

### Evidence view

Source-native admitted records:

- event family/subtype;
- producer and artifact;
- sequence and timestamps;
- source references;
- safe body summary;
- capture state;
- receipt;
- lineage;
- normalization/resolution result;
- correction history.

The interface is an investigation product, not a spreadsheet dump or database browser.

## Sources & Coverage

- producer installations;
- profile/capabilities/certification;
- version and artifact;
- reporting mode;
- last record and last complete snapshot;
- WAL/backlog age where safe;
- health dimensions;
- gaps/loss/sampling;
- expected/reported population;
- affected inventory/activity questions;
- deployment/upgrade state;
- actionable diagnostic and support reference.

“Healthy” dimensions remain separate: connectivity, capture, durability, processing, projection, reconciliation, certification, and permission.

## Partial and empty states

- unconnected tenant → guided sensor connection, no zero-estate claim;
- one sensor only → supported inventory plus explicit limits;
- stale projection → prior watermark with warning;
- sensor outage → retained inventory marked stale, no absence;
- unresolved identity → separate candidates or unresolved group;
- no activity under unknown coverage → “not evaluable”;
- unauthorized evidence → safe not-found/permission state;

Migration comparison, cohort and fallback interfaces belong to a separately
shipped migration operator experience. They are not navigation, screen states or
API consumers in bounded DIE.

## Interaction constraints

- no client-side joins across sensors;
- no loading thousands of raw columns;
- no default raw JSON;
- no unrestricted evidence content;
- no color-only status;
- keyboard/screen-reader support;
- shareable permission-safe filters;
- bounded API requests per screen;
- responsive large-tenant behavior;
- every count and trend drills to exact members under the same watermark where applicable.

## Customer language

Use:

- Discovered
- Observed
- Active within selected evidence
- Removed at source
- Reporting / degraded / stale
- Unresolved / conflicted
- Existing native decision
- Evidence omitted by privacy policy

Avoid:

- Safe
- Dangerous
- Critical
- Compliant
- Enterprise-wide
- Complete
- Blocked by Quilr 2

unless a later governed capability establishes the claim.
