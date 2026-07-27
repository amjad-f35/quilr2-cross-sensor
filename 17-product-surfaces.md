# Product surfaces

## 1. AI Estate

**Main question:** what AI products, agents, models, MCP/tool, connector, and governed data dependencies exist, and what needs action?

Default:

```text
Object, type, vendor
management/lifecycle/health/ownership
users or active dependencies
last seen
source coverage/confidence
open findings
spend where available
```

Filters: object type, owner/org, governance, lifecycle, source/coverage, confidence, account type, provider, data class, finding, spend.

Actions: assign owner, review/approve/restrict/block, retire, open impact, resolve identity.

Do not show raw content, source-native duplicate rows, every identifier, debug/config fields, or source-specific tabs as separate inventories.

## 2. Findings

**Main question:** what material conditions require action?

Default:

```text
Finding
affected/root object
why it matters
evidence confidence/coverage
severity
owner/assignee
status
recommended action
first/last seen
```

Actions: assign, investigate evidence, execute remediation, suppress with expiry/reason, resolve, reopen.

No raw event feed or non-actionable anomaly list.

## 3. Activity

**Main question:** what happened, why, through which source/control, and what evidence exists?

Operator-oriented explorer for:

- sessions/runs/steps;
- application interactions;
- prompts/responses;
- model/tool calls;
- actions/effects;
- data movement;
- policy/approval/decision/enforcement;
- sensor/runtime events.

Default content is metadata. Protected content requires explicit privilege/purpose and is audited.

## 4. Contextual relationships

Relationship views are reached from an entity/finding rather than a disconnected generic graph:

- users/accounts/devices/surfaces;
- agents/models/tools/connectors/knowledge/memory;
- data/policies/enforcement/sensors;
- owner/org/cost center;
- upstream/downstream dependency impact.

Use named edges, validity, source/authority/confidence, and “why this relationship.”

## 5. Coverage

**Main question:** what can Quilr currently see and enforce?

Default:

```text
Sensor/gateway/enforcement point
installation/deployment/version/certification
declared and observed capabilities
scope
last report and expected cadence
ingest/materializer lag
covered estate/activity/policy domains
known blind spots
```

Actions: deploy/upgrade/restart sensor, repair connector, acknowledge maintenance, narrow policy claim, inspect DLQ/reconciliation.

## 6. Resolution Center

A dedicated view is required because auto-merge must be conservative and reversible.

Queues:

- unresolved aliases;
- duplicate candidates;
- conflicting strong identifiers/attributes;
- low-confidence historical merges;
- catalog corrections/rebrands;
- manual split and replay progress.

Default comparison:

```text
candidate entities/types
matched/conflicting identifiers
source independence/health
field-level values and authority
validity overlap
proposed result/score/rule
downstream impact
```

Actions: merge, keep separate, split, map catalog alias, set field authority/override, defer with reason.

## Minimal navigation

```text
AI Estate
Findings
Activity
Coverage
Resolution Center (permissioned)
Policies/Settings
```

Accounts, Credentials, Data, Knowledge/Memory, Gateways/Sensors, and detailed relationships appear as estate types/facets or permissioned subareas based on tenant scale. Internal labels such as “entity materializer” never appear in ordinary user navigation.

## Compatibility transition

During migration, source-specific browser/endpoint/LLM/MCP filters remain, but they filter canonical entities/events by observation source. They no longer create four independent inventories/findings pages. Legacy IDs/routes can deep-link through compatibility APIs to canonical entity/finding views.
