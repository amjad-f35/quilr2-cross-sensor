# 23 — Findings and Insights

## Admission rule

An endpoint observation becomes a customer finding only when all of these are
defined and available:

1. actionable business question;
2. required entity resolution;
3. required relationship/event/claim evidence;
4. source coverage and freshness requirement;
5. deterministic condition;
6. confidence and severity rationale;
7. stable grouping/deduplication key;
8. owner and recommended action;
9. resolution and reopen semantics;
10. evidence template that does not expose unauthorized raw content.

A detector match, alert row, policy decision, configured entity, log line, or
missing event is not automatically a finding.

The complete catalog is
[findings.csv](../../../matrices/sensor-intelligence/endpoint-sensor/findings.csv).

## Sensor-only finding candidates

These can be supported primarily by endpoint evidence after the adapter and
specified instrumentation are present:

| Finding | Current evidence | Additional requirement |
| --- | --- | --- |
| Newly observed ungoverned AI application | typed Application + governance | durable observation ID, catalog/rule, coverage |
| Blocked/quarantined application rediscovered | governance + `Rediscovered(Uuid)` | durable event and process-instance/effect evidence |
| Application enforcement incomplete | step results | universal post-action re-observation |
| Risky local agentic configuration | Agent/MCP/Permission/Plugin/Skill/Repo records | accepted risk rule/version and preserved rich parser fields |
| MCP config references sensitive environment variables | MCP env-var names | approved rule; no raw values |
| Hook integrity degraded | install/integrity paths | structured health record and expected-scope manifest |
| Proxy sensitive-data action | DLP finding/decision/local response | detector/config version, content-safe evidence, coverage |
| DLP analyzer degraded to heuristic | analyzer error/fallback path | structured health/fallback event |
| Policy engine fail-open | not-ready/timeout → Allow | structured decision reason and action correlation |
| Endpoint component/snapshot/outbox stale | component/health/outbox signals | adapter health/coverage records |

Some are better presented as coverage/configuration findings than security
findings. Severity depends on policy and observed activity.

## Cross-sensor finding candidates

| Finding | Endpoint contribution | Required other evidence |
| --- | --- | --- |
| Possible LLM gateway bypass | process/destination/request evidence | healthy complete gateway coverage and no matching late invocation |
| Possible MCP gateway bypass | configured/called tool/server hint | gateway call/coverage contract and resolved backend/tool |
| Sensitive data transfer to AI | process/proxy/hook/DLP evidence | browser/gateway/provider chain as applicable |
| Endpoint versus gateway policy conflict | endpoint policy decision/effect | other enforcement decision + shared action ID/version |
| Unmanaged/personal SaaS use | install/traffic/use hint | connector/account ownership/enterprise tenant |
| Agent used unapproved model/tool | local config/hook hint | runtime or gateway invocation/effect |
| Repository contains undisclosed local agent artifacts | local scan/digest/path | SCM repo/commit/content and ownership |
| Identity/account mismatch | Persona/OS/email/device aliases | IdP/HRIS/account authority |

Absence-based findings require both sources to be healthy, in scope, and
expected to report.

## Detailed finding specifications

### EP-F-001 — Newly observed ungoverned AI application

**Business question:** Which AI applications appeared on endpoint devices
without an explicit approved governance state?

**Required entities:** resolved AI application/product surface, endpoint device,
and optionally observed human/account.

**Required relationships:** device observed application; source observation
linked to detector/parser/catalog evidence.

**Required events/claims:** new typed Application observation; governance
approval is `Unknown` or policy is absent under the tenant rule.

**Endpoint contribution:** `Entity`, `ApplicationData`, discovery timestamps,
device/user context, and `GovernanceFields`.

**Missing evidence:** current source-native event durability, reliable
new-versus-replayed snapshot origin, and accepted central governance authority.

**Detection logic:** open when a first live observation is admitted and the
effective tenant policy classifies the resolved product/surface as requiring
governance but no approved claim exists.

**Coverage:** healthy, in-scope discovery run for the device; observation may be
positive even when scan completeness is partial.

**Confidence:** medium-high after central product resolution; lower for
name-only detection.

**Severity:** tenant policy dependent; default medium, not hard-coded by sensor.

**Deduplication key:** tenant + canonical product/surface + device + governance
policy scope.

**Ownership/action:** application owner/security admin; review, approve, block,
or classify.

**Resolution:** approved/exception/removed with verified lifecycle evidence.

**Reopen:** a new device/scope observation or policy change violates the
resolved condition.

**Evidence:** source observation, detector/rule/version, device, times,
governance claims, coverage.

**Negative cases:** configured catalog entry without local observation; replayed
snapshot labeled as new; unknown governance treated as blocked.

### EP-F-002 — Blocked or quarantined application rediscovered

**Business question:** Is an application governed as blocked/quarantined
continuing to reappear after endpoint action?

**Required evidence:** governance claim, `ChangeEvent::Rediscovered(Uuid)`,
resolved application/process instance, previous action result, and scan time.

The native rediscovery event is emitted only by the blocked/quarantined
rediscovery path. It does not by itself prove the previous kill succeeded or
that persistence/reinstallation occurred.

**Detection:** group repeated rediscoveries after a completed action within a
tenant-configured window. Separate same process tree survivors from a new
process instance or reinstall.

**Resolution:** verified absence for the required healthy scan window, policy
change, or approved exception.

**Reopen:** a new process-instance rediscovery under blocked/quarantined policy.

### EP-F-003 — Endpoint application enforcement incomplete

**Business question:** Did a block/quarantine attempt fail to produce the
expected process-tree effect?

Current macOS/Windows actions provide attempted step results, but no universal
final verification.

**Required new telemetry:**

- targeted root/process-instance identity;
- per-step result and platform error;
- final process-tree enumeration after the last grace period;
- action correlation/decision/policy version;
- explicit expected effect.

**Potential issue:** a signal/command returning success is not proof the process
exited. Do not open this finding until final re-observation exists.

### EP-F-004 — Risky local agentic configuration

**Business question:** Does a local agent/MCP/plugin/permission configuration
grant risky capability outside tenant policy?

Endpoint may contribute command, arguments, environment-variable names, URL,
transport, scope, repository/permission/plugin metadata, and detector/risk
output. Current converter loss means raw rich Lua relationships/risk must be
preserved by the adapter.

**Detection:** versioned rule evaluates normalized source configuration; raw
secret values are excluded. Central policy decides whether the pattern is
disallowed.

**Negative cases:** command/package name alone; env-var name interpreted as a
secret value; configured artifact assumed active.

### EP-F-005 — IDE hook integrity degraded

**Business question:** Is an endpoint expected to capture IDE activity but its
hook is missing or semantically modified?

**Required:** supported IDE installed, hook capability enabled, expected config
hash/semantic keys, last integrity run, repair result, and component health.

**Detection:** expected hook absent/mismatched after repair window, or repeated
repair failure.

**Resolution:** verified correct hook config and successful manager connectivity
under a complete integrity check.

### EP-F-006 — Endpoint DLP sensitive action

**Business question:** What sensitive data was detected in intercepted traffic,
what policy decided, and what effect was observed?

This should normally be an activity with a finding only when the tenant rule
declares the combination actionable.

Required:

- request/event/process/destination correlation;
- data labels and protected evidence reference;
- analyzer/rule/config version and degradation state;
- policy ID/version/decision reason;
- local action and transport effect;
- interception coverage.

The heuristic detector's uppercase pattern label is not the matched secret
value. Non-UTF8 content currently becomes non-sensitive, and the heuristic
prefilter can miss values without its trigger characters.

### EP-F-007 — DLP or policy control degraded open

**Business question:** Did a required inspection/policy control allow activity
because the analyzer or policy engine was unavailable/timed out?

Required:

- control expected for the request/domain/data class;
- structured failure/fallback reason;
- actual fail-mode and decision;
- request stage/coverage;
- recovery state.

Examples include remote analyzer parse/fetch failure falling back to heuristic
and policy engine not-ready/100 ms timeout becoming `Allow`. The finding must
distinguish “fallback still inspected” from “control entirely bypassed.”

### EP-F-008 — Endpoint sensor coverage degraded

**Business question:** Which endpoint evidence can no longer be trusted as
complete or fresh?

Signals:

- component unhealthy/not ready;
- unsupported OS/version;
- stale complete scan;
- hook integrity/manager failure;
- proxy/extension heartbeat or interception degradation;
- stale DLP/policy configuration;
- outbox backlog/quota/rejection;
- clock error;
- certification mismatch.

This finding changes interpretation of absence and suppresses unsupported
absence-based security findings. It does not delete existing inventory.

### EP-F-021 — Possible LLM gateway bypass

**Business question:** Did an endpoint reach a provider outside the approved LLM
gateway?

**Endpoint contribution:** attributed process, destination, timing, request
metadata, interception scope, and proxy health.

**Required external evidence:** provider alias resolution, complete gateway
events, gateway coverage/health, clock bounds, and late-arrival allowance.

**Detection:** a provider-destination action remains unmatched after the
correlation/late window while both sources were healthy and in scope.

**Severity/confidence:** policy dependent; confidence is lower for destination-
only evidence and unsupported UDP/IPv6/relay paths.

**Resolution:** matching late gateway evidence, approved direct-provider
exception, destination reclassification, or verified routing remediation.

**Reopen:** new unmatched activity after resolution.

### EP-F-029 — Cross-sensor sensitive transfer

**Business question:** Was sensitive data transferred to an AI application or
model contrary to policy?

Required evidence may combine browser file/prompt action, endpoint
process/proxy/hook evidence, DLP worker result, gateway invocation/outcome,
identity/account authority, and policy effect.

The finding groups one root transfer, retains every source child observation,
and records which expected sensors were unavailable. It must not create one
finding per alert or detector.

## Findings that are not currently defensible

- exact successful MCP tool-call rate;
- exact agent run/step failures;
- model token/cost anomalies from endpoint;
- personal versus enterprise account use;
- exhaustive Linux/cloud/serverless/CI agent discovery;
- policy-driven hook denial/justification effect;
- successful redaction-and-forward for
  `AllowPromptAfterRemovalOfSensitiveData`;
- application quarantine as filesystem/network isolation;
- user intent from network traffic;
- “unused application” from absence of endpoint events.

## Evidence-quality propagation

Finding confidence must degrade when:

- hook socket producer is unauthenticated;
- current compatibility batch can drop;
- event ID/time is generated after capture;
- process attribution is unavailable;
- detector falls back or version is missing;
- source coverage is stale;
- identity uses display/name/email only;
- native UUID collision conditions apply;
- raw content was unavailable/redacted;
- one cross-sensor observer was out of scope.

Confidence can increase when:

- exact propagated IDs match;
- protected digest and event-time align;
- two independent healthy sensors corroborate;
- authoritative account/device/repository identity is linked;
- observed effect follows an action;
- runtime component is certified for the declared capability.

