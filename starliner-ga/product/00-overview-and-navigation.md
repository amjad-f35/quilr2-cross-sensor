# Customer Overview and Navigation

Status: **normative product contract**

## Design objective

The platform must make the enterprise AI estate understandable in minutes. It must not expose every emitted field as a product feature.

The normal navigation is:

1. **Overview**
2. **Inventory**
3. **Insights**
4. **Analytics**
5. **Policies**

Permissioned operational surfaces are Activity, Coverage, Resolution, Evidence, Integrations, Audit, and Administration.

## Overview questions

The overview answers:

- What is in our AI estate?
- What changed materially?
- Where are we exposed or ungoverned?
- What needs action now?
- Is our visibility good enough to trust the answer?
- Are risk, adoption, and cost improving?

## Overview layout

### 1. Estate summary

Five primary counts:

- Applications
- Agents
- Models
- MCP servers
- Tools

Each count shows active/current scope, change over the selected period, freshness, and a governed/approved subcount where meaningful.

### 2. Action summary

Not a feed. It shows:

- critical/high open findings;
- newly discovered active ungoverned estate;
- items awaiting owner or approval;
- policy actions requiring approval;
- overdue remediation;
- material visibility gaps.

Each item has one primary next action.

### 3. Material change

Examples:

- new application entered active use;
- production agent adopted an unapproved model;
- newly reachable MCP server exposes privileged tools;
- gateway coverage dropped for a business unit;
- model spend materially exceeded its baseline;
- a remediation command failed to produce the intended effect.

Raw event volume and sensor heartbeat counts do not belong here.

### 4. Governance posture

Coverage-aware percentages:

- active estate with an owner;
- active estate with approval state;
- high-risk estate under an applicable policy;
- expected population with current visibility;
- severe findings within response SLA.

Denominators and coverage are inspectable.

### 5. Adoption, activity, and cost

Small number of decision-grade trends:

- active users/workloads;
- executions by application/agent/model;
- model mix;
- estimated or billed cost;
- error/policy decision rate;
- top material movers.

## Filters

Global filters:

- time;
- environment;
- business unit/team;
- geography;
- entity status;
- provider;
- approval/governance state.

Filter state is shareable and permission-safe. Unsupported filters do not appear.

## Freshness and confidence

The overview has one visible “Data health” affordance showing:

- last complete materialization;
- expected vs reporting source populations;
- degraded capabilities;
- stale authoritative connectors;
- effects on metrics and insights.

It never paints the estate green when material coverage is unknown.

## Empty and partial states

- A new tenant sees guided connection steps, not zero-risk claims.
- A tenant with only one sensor sees the questions that sensor can support and explicit limitations.
- Delayed data shows the last complete interval.
- Unauthorized users see neither hidden counts nor inference-revealing empty states.

## Performance and accessibility

Overview critical content is server-renderable or fetched in a bounded number of APIs, meets the product SLO, supports keyboard/screen-reader use, and does not depend on loading raw evidence or high-cardinality event tables.

## Acceptance scenarios

1. An executive identifies the top material exposure and accountable owner without opening raw telemetry.
2. A security operator drills from a posture percentage to the affected entities and evidence.
3. A platform owner sees that a drop is a visibility gap rather than a real usage decline.
4. A finance owner distinguishes estimated from billed cost and sees unattributed spend.
5. A restricted user cannot infer another business unit’s estate from counts or search.
