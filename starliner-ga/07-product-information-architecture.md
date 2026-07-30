# Product Information Architecture

## Primary navigation

```text
Overview
Inventory
Insights
Analytics
Policies
```

Permissioned/operator navigation:

```text
Activity
Coverage
Resolution Center
Evidence
Administration
```

The [32-domain capability taxonomy](09-capability-and-workflow-taxonomy.md) is an ontology and traceability lens, not a navigation proposal. New workspaces or tabs require a customer workflow, canonical ownership home, feature-to-evidence trace, and applicable release gate.

## Inventory

Primary tabs:

```text
Applications | Agents | Models | MCP & Tools
```

Contextual facets:

- users/accounts;
- devices/installations/processes;
- connectors;
- credentials/NHIs;
- data/knowledge/memory;
- policies/controls;
- sensors/enforcement points.

### Default application columns

```text
application/vendor
governance
owner
active users
surfaces
last activity
highest material issue
spend
source coverage
```

### Default agent columns

```text
agent/owner
version/deployment
environment
models
tools/capabilities
active use
privilege
findings
cost
coverage
```

### Default model columns

```text
provider/exact ID or alias state
deployments/routes
applications/agents
approval
usage
latency/errors
findings
spend
```

### Default MCP/tool columns

```text
server/tool
transport/host
clients/agents
capability/privilege
approval
last use
schema change
findings
coverage
```

## Overview

The page answers in thirty seconds:

1. What is in the AI estate?
2. What is unmanaged, unowned, new, or changing?
3. What material risk needs action?
4. How is AI adoption and spend changing?
5. Where is coverage insufficient?
6. What are the top actions?

Overview counts use canonical IDs and include freshness/coverage. No sensor-row sums.

## Insights

Every insight card contains:

```text
plain-language condition
why it matters
affected scope
confidence
required and actual coverage
evidence summary
owner/assignee
recommended action
workflow status
first/last seen
```

No raw signal feed.

## Analytics

Curated domains:

- estate and adoption;
- governance and ownership;
- sensitive-data exposure;
- agentic capabilities and privilege;
- model/provider usage and reliability;
- cost and optimization;
- coverage and certification;
- findings and remediation performance.

Every chart drills to canonical entities/events/findings and declares grain, time semantics, coverage, and freshness.

## Entity detail

Applicable tabs:

```text
Overview
Identity and Sources
Relationships
Activity
Findings
Policies and Controls
Cost and Outcomes
Versions and Changes
Evidence
```

Evidence is permissioned. Raw content is never displayed by default.

## Product truthfulness

The UI MUST distinguish:

- configured versus invoked;
- discovered versus verified;
- name/alias versus exact identity;
- source-reported versus centrally resolved;
- approved versus unknown;
- absent versus not observed;
- healthy versus stale coverage;
- candidate insight versus confirmed finding.
