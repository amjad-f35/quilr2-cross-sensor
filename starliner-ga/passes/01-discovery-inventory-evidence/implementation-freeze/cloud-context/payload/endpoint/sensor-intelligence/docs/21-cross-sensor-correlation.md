# 21 — Cross-Sensor Correlation

## Principle

The endpoint is strongest at host-local existence, configuration, process,
network, and attempted-control evidence. It is not authoritative for:

- enterprise human identity or employment;
- SaaS/browser account ownership;
- provider/model deployment identity;
- MCP runtime calls/effects outside captured hooks;
- repository remote state;
- cloud/serverless/runtime inventory where no supported endpoint is installed;
- business outcome or cost.

Central correlation may combine endpoint evidence with other sensors, but it
must retain each source observation and its coverage. A correlation is not a
license to rewrite one sensor's claim as another sensor's direct observation.

The complete overlap ledger is
[cross-sensor-overlaps.csv](../../../matrices/sensor-intelligence/endpoint-sensor/cross-sensor-overlaps.csv).

## Browser overlap

### Shared observations

Browser and endpoint can both contribute:

- application/domain use;
- user/device context;
- prompt or action hints;
- file-upload/data-transfer evidence;
- DLP classification;
- policy decision/outcome;
- heartbeat/coverage.

### Different authority

| Question | Browser stronger | Endpoint stronger |
| --- | --- | --- |
| Which web origin/page handled the action? | Yes | Proxy destination/path may be partial |
| Which browser tab/account surface? | Browser-native context | Endpoint cannot prove account |
| Which local process originated the flow? | Usually not | Proxy attribution where supported |
| Which local path/package/config exists? | No | System Monitor/file/package scan |
| Which local file candidate was involved? | Browser metadata only | Native host/endpoint can add path/digest candidate |
| What happened outside the browser? | No | Endpoint hooks/process/proxy |

Browser domain + endpoint signed/bundle/process application + product catalog
alias can resolve one AI Product with distinct browser and installed
application surfaces. This is a central resolution rule, not a source-native
identity merge.

## LLM gateway overlap

The LLM gateway has structured provider/model/route, usage/token, provider
outcome, rate/concurrency, and gateway policy context for traffic routed through
it. Endpoint proxy/hooks may see application, process, local user/device,
destination, prompt/tool/file hints, and endpoint DLP/control outcomes.

Useful central deductions:

- local application/process → gateway-routed invocation;
- configured local model/agent → actually invoked provider/model;
- endpoint DLP versus gateway DLP detector disagreement;
- gateway bypass candidate;
- sensitive action with provider outcome and local process attribution.

**Gateway bypass rule:** endpoint provider-destination activity with no matching
gateway event is only a candidate. It requires:

- healthy endpoint proxy coverage for that platform/path;
- healthy gateway ingest coverage;
- calibrated clock and correlation window;
- destination/provider alias confidence;
- exclusion of browser/service relay and unsupported protocol paths;
- no matching late gateway record.

Absence without those conditions is unknown.

## MCP gateway overlap

Endpoint can discover local MCP configuration:

- configured server name;
- command/arguments;
- environment-variable names;
- URL/transport/scope where parsed;
- parent application/config path;
- risk/classification output from the Lua/native converter;
- selected IDE hook tool activity.

It cannot establish, by configuration alone:

- that the server started;
- a remote backend's canonical identity;
- available tool schema/version;
- a gateway-observed call;
- request/result/effect;
- OAuth account/scope authority;
- gateway enforcement.

An external MCP gateway must supply native server/client/tool/call/result/effect
contracts. Endpoint configuration and gateway runtime observations can then be
correlated using normalized command/package/URL, parent application, user/
device, explicit propagated IDs, and time. Name-only matching is insufficient.

## Agent runtime overlap

System Monitor discovers configured/local Agent/Skill/Plugin/Model/Repo/
Permission artifacts. Cursor/Claude hooks provide session/tool/file/prompt
activity. Together they can support an endpoint-local activity chain.

They still do not supply:

- a stable cross-process agent run ID;
- a step ID for every action;
- a delegation chain;
- proof a requested tool executed;
- tool result/effect;
- autonomous versus human-triggered classification;
- workload credentials/attestation.

An instrumented agent runtime can supply those facts. Central correlation should
prefer propagated run/session/step IDs and use time/path/name only as lower-
confidence inference.

## IdP and HRIS overlap

Persona and process enumeration expose email/user/account hints. These are
secondary identity aliases.

Authoritative IdP/HRIS inputs are required for:

- issuer-qualified subject;
- account enabled/disabled state;
- groups/roles with source authority;
- manager/department/employment status;
- joiner/mover/leaver lifecycle;
- service-account distinction;
- ownership assignment.

Endpoint `groups` or local OS user fields should remain source claims with
freshness. They cannot authorize enterprise access by themselves.

## SaaS connector overlap

Endpoint/browser evidence can show an application was installed, configured, or
used. A SaaS connector may establish:

- tenant/account/subscription identity;
- connected enterprise account;
- OAuth grant/scope;
- administrator/owner;
- license and billing;
- provider-side activity;
- access lifecycle.

One does not replace the other. Connector existence without endpoint activity
does not prove local use; endpoint traffic without connector evidence does not
prove a personal account.

## Repository and code overlap

Endpoint `ControlledRepo` and script/package scanners can observe a local path,
remote hint, project configuration, package/framework markers, skill Markdown,
MCP config, or agent artifact where the detector covers it.

GitHub/GitLab/SCM connectors are required for authoritative:

- repository/organization ID;
- default branch and remote commit state;
- teams/permissions/ownership;
- protected branches;
- CI workflow/runs;
- pull requests/issues;
- server-side files absent locally.

Local repo paths and remote URLs are identifier candidates. They may correlate
to connector repository IDs, but local modified/untracked content remains
endpoint-only evidence.

## Cloud, serverless, CI/CD, and ephemeral environments

The endpoint code supports macOS and Windows runtime paths. It does not contain
a Linux endpoint implementation in the analyzed active product path.

Therefore:

- a Windows/macOS CI runner can be observed only if the endpoint is installed,
  privileged, running, and its scanners cover the relevant paths/processes;
- Linux runners and Linux cloud instances are not observable by this endpoint
  revision;
- serverless runtimes without the endpoint process are not observable;
- short-lived/ephemeral machines may terminate before poll/sync and lose
  in-memory records;
- cloud control-plane metadata, instance lifecycle, image, account, region,
  function, job, and workload identity require cloud/CI/runtime sensors.

Do not describe this endpoint as exhaustive agent discovery across all
environments.

## Worked scenario: sensitive file/prompt transfer

### Possible source contributions

| Source | Direct fact | Limitation |
| --- | --- | --- |
| Browser | origin/page, file name/size/type/time, request/workflow IDs, browser decision | no stable local path/content identity |
| Browser native host | local candidate path/metadata/DLP/task outcome | known positional mixed-batch correlation risk |
| Endpoint process/proxy | source process/PID, destination, request stage, endpoint DLP/policy/local response | attribution and interception coverage vary |
| IDE hook | session, prompt/tool/file/command fields, local allow response | no guaranteed execution/result; no native event ID |
| LLM gateway | provider/model/route, request ID, usage, gateway DLP/policy/provider outcome | only routed traffic |
| DLP worker | detector/version/category/entity/reason/timing | classification is not a finding |
| IdP/connector | authoritative subject/account/grant | external contracts required |

### Correlation order

1. Exact propagated request/flow/session IDs.
2. Protected content/file digest or stable per-file ID.
3. Device + human account + application + destination + event-time window.
4. File name/size/type/last-modified candidate.
5. Name/domain-only correlation only as low confidence.

### Central output

One parent transfer/activity may have child records for:

```text
file read
→ browser or IDE submission
→ endpoint proxy interception
→ endpoint DLP detection
→ gateway model invocation
→ gateway/provider outcome
→ policy/decision/effect
```

Every child retains source/evidence references. A customer finding is created
once for the actionable root condition, not once per sensor.

## Deduplication

- First deduplicate exact source retries by source-native idempotency.
- Then correlate distinct source observations into one activity without
  deleting them.
- Alerts, logs, and derived `ActivityEntry` records should link to the original
  native event rather than count as additional actions.
- Late observations can revise confidence or reopen findings.
- A content hash is evidence correlation, not proof of the same user intent.
- Endpoint entity UUID collision defects prevent using UUID equality alone
  across kinds/parents.

## Confidence requirements

| Correlation basis | Default interpretation |
| --- | --- |
| propagated cryptographic/opaque request ID from both sources | high, subject to source integrity |
| exact workload/account/device identity plus event ID | high |
| protected digest + device + calibrated time | medium-high |
| user + device + application + destination + short window | medium |
| normalized path/command/package/URL | medium for configuration identity |
| display name/domain only | low; candidate only |
| missing event from one source | no inference unless healthy in-scope coverage proves expected reporting |

## Required central responsibilities

- canonical identity resolution;
- multi-source event correlation;
- duplicate-versus-multi-observer distinction;
- source authority and freshness;
- coverage-aware absence;
- finding grouping/lifecycle;
- cross-source policy conflict analysis;
- customer-facing confidence explanation;
- source evidence retention and access control.

