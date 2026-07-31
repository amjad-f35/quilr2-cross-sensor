# Findings and insights

## Admission result

The current source emits one `FindingSignal` type,
`mcp_tool_blocked`. That signal is not, by itself, a customer finding.

Most current MCP-derived conditions belong first in inventory, activity,
analytics, recommendation, or coverage. The central platform may admit a
customer finding only after it supplies canonical entities, owner, policy,
deduplication, severity, close/reopen rules, and sufficient healthy coverage.

## Finding disposition matrix

| Candidate | Current evidence | Disposition | Availability |
| --- | --- | --- | --- |
| individual native DLP-blocked tool call | action + signal + labels/upstream flag | `Finding signal`, `Activity explorer`; not customer finding | `Available now without sensor changes` |
| repeated sensitive/risky tool attempts | grouped signals/calls | potential `Customer finding` after policy/owner/window admission | `Derivable centrally from current output` |
| output blocked after upstream execution | action boundary/upstream=true + output reason | potential exposure/control-effect finding after action semantics | `Derivable centrally from current output` |
| new/unmanaged MCP server | source observation + external approval/management policy | inventory badge or customer finding | source available now; policy/owner external |
| new/high-risk MCP tool | tool observation + risk taxonomy/policy | badge/signal/finding after tool classification | name now; schema/classification adapter/instrumentation needed |
| stale/removed server/tool | insufficient lifecycle | no current finding | `Requires minor sensor instrumentation` |
| sensor delivery backlog/dead letters | route health | coverage/operator finding | `Available through adapter mapping only` |
| sensor stale/disabled/missing dependency | manifest/health | coverage finding | adapter polling now; durable source event needs instrumentation |
| Direct MCP coverage gap | manifest declares deferred surfaces | coverage finding/known limitation | `Available now without sensor changes` |
| OneMCP activity bypasses observation | architecture gap, no event proof per call | coverage/configuration finding, not activity accusation | `Requires minor sensor instrumentation` |
| authentication/access denial spike | rejection/events | analytics or finding after threshold/owner | `Available through adapter mapping only` |
| OAuth refresh failures | events | analytics/operational finding | same |
| orphaned API/OAuth credential | metadata + authoritative owner lifecycle | customer finding | adapter mapping plus external identity authority |
| destructive tool executed | no reliable tool risk/effect schema | no current finding | `Requires substantial sensor changes`/external classification |
| tool side effect failed/succeeded | result/upstream flag only | activity, not verified effect | `Not observable by this sensor` without native effect |
| MCP bypass/direct local traffic | gateway cannot see it | cross-sensor coverage finding | `Requires an external authoritative source` |

## Finding: repeated native DLP-blocked MCP tool activity

**Status:** `Proposed`; condition can be centrally derived from current output,
but not source-owned.

### Business question

Is a user/agent repeatedly attempting to send or receive protected data through
a particular MCP tool despite gateway controls?

### Required entities

Resolved MCP tool/server; actor or accountable owner; tenant; enforcement point.

### Required relationships

Actor CALLS tool; server PROVIDES tool; policy APPLIES TO action; decision
ENFORCED BY gateway/native DLP.

### Required events or claims

Blocked action events and signals within a versioned threshold/window; healthy
Direct observation coverage.

### This sensor’s contribution

Actor pseudonym, backend/tool source identity, input/output safe labels, block
direction, upstream flag, event time, source/evidence IDs.

### Missing evidence

Canonical person/account/agent, owner, event-time policy version, exact detector
confidence, OneMCP/bypass coverage.

### Detection logic

Group distinct action IDs by tenant + resolved tool + resolved actor/owner +
label family + block direction in a defined window; exclude delivery duplicates.
Threshold is a central policy, not hard-coded here.

### Coverage requirement

Healthy sensor/delivery; certified relevant surface. Direct-only evidence cannot
make an enterprise-wide claim.

### Confidence and severity

Confidence rises with resolved identity, healthy coverage, repeated distinct
actions, and independent supporting LLM/endpoint evidence. Severity depends on
data class, tool capability, pre/post-upstream boundary, recurrence, and policy.

### Deduplication key

Tenant + finding type + resolved root tool/server + resolved accountable actor
or owner + data-class family + direction + generation.

### Ownership and actions

Assign to tool/server owner or security/data-governance owner. Actions may
include review activity, adjust access, disable tool, require confirmation,
rotate exposed credential, or investigate workflow.

### Resolution/reopen

Resolve only when attempts cease for the confirmation window or an authorized
exception applies and coverage remains healthy. Reopen on same dedup key after
close; sensor loss moves to verification impaired, not resolved.

### Negative cases

Single expected test, self-test/fixture origin, duplicate delivery, unknown
tenant, unhealthy coverage, allowed/monitored event, or tool result blocked
after upstream when the claim says execution was prevented.

## Finding: MCP result blocked after upstream execution

**Status:** `Proposed`; narrow, evidence-backed control-effect risk.

This is distinct from prevention. Current output can prove:

- output-side block reason;
- action boundary `post_execution`;
- `upstream_called=true`.

It cannot prove what side effect the upstream tool performed or whether
sensitive output escaped elsewhere.

Recommended disposition: `Finding signal` and activity badge by default.
Promote to `Customer finding` only when tool risk, data class, owner, policy,
coverage, and concrete response are known.

## Finding: MCP sensor evidence delivery degraded

**Status:** `Proposed`; operator/coverage finding.

Inputs: runtime enabled/status, dependency state, delivery configuration,
outbox depth/age, retries/dead letters, last success/error, task/outbox loss.

Current availability is local route/manifest polling. Tenant-level impact and
durable health events require instrumentation.

Dedup key: tenant or deployment scope + sensor instance + capability + degraded
reason + generation. Resolve after healthy delivery and backlog recovery for a
confirmation window.

## Finding: observed MCP server is unapproved/unowned

**Status:** `Proposed`, requires external/config evidence.

The gateway supplies a server source candidate. Central inventory/IAM/policy
must supply canonical identity, approval and owner. A new observation alone is
an inventory badge, not proof of unmanaged risk.

## Explicit non-findings

- nonzero tool-call count;
- slow single call;
- any source observation;
- a delivery retry;
- a `FindingSignal` object;
- configured but unused backend/tool;
- raw DLP prediction;
- missing observation while sensor is unhealthy;
- backend/tool name containing a risk-like word;
- blocked output described as prevented upstream execution.

