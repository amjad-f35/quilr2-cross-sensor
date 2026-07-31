# Cross-sensor correlation

## What MCP Gateway contributes

Strongest contributions:

- tenant-scoped source backend registry ID;
- backend-scoped tool name;
- gateway sensor/runtime/source provenance;
- Direct request correlation and call time;
- pseudonymous human actor when email is available;
- outcome, upstream-called, latency, and DLP labels/block;
- local evidence integrity and delivery state.

Missing authoritative dimensions:

- durable person/account identity;
- client agent/workload/delegation in current output;
- model/provider/deployment;
- device/process/browser;
- direct/bypass traffic;
- data asset and content identity;
- source deployment/workload attestation.

## Correlation keys

| Key | Other likely source | Strength | Caveat |
| --- | --- | --- | --- |
| tenant ID | platform/IdP/other sensors | strong when same authority | branch normalization must match |
| actor email-derived HMAC | only sensors sharing exact tenant/key algorithm | secondary | key/version not emitted; other sensors should not receive this key casually |
| source backend ID | gateway DB/logs/workflow delegation | strong within gateway | not globally meaningful |
| backend endpoint/transport | endpoint discovery/configuration source | secondary | current Starliner output omits endpoint |
| tool name + backend | LLM/agent/workflow traces | strong source tuple | rename/version ambiguity |
| gateway observation/request/flow/span | gateway-local stores | strong if propagated | current tool logs may use client request ID, not derived IDs |
| workflow run/delegation claims | workflow runner/LLM gateway | potential strong | not current observe output |
| time window | every sensor | weak | clock/latency/retry ambiguity |
| body/record hash | same record only | content-addressed | not cross-sensor activity identity |

## Required non-merge rules

- never merge tools by unqualified name;
- never merge backends solely by display name;
- never merge users solely by email-shaped safe identifier or user-agent;
- never merge JSON-RPC requests across sessions by client `id`;
- never count ClickHouse and its source SQLite row as independent observers;
- never treat current backend endpoint equivalence as same deployment without
  tenant/source/lifecycle context;
- never infer model from tool/backend naming;
- never treat a source-local actor HMAC as an IdP account ID.

## Worked scenario

### Scenario: workflow-delegated MCP call to a sensitive tool

```text
IdP/platform
  authoritative human/account/tenant
      │
      ▼
Workflow control/runner
  workflow agent version + run/step + delegation token
      │
      ▼
MCP Gateway
  Direct or OneMCP tool call
  backend/tool, DLP label/block, upstream flag, latency
      │
      ├──► Starliner evidence/outbox
      │
      ▼
LLM Gateway
  model/provider/deployment, prompt/response labels, usage/cost
      │
      ▼
Endpoint/browser sensor
  device/process/client application evidence
```

Current correlation status:

1. The workflow subsystem has run/version/delegation state, but current MCP
   observe output does not carry those identifiers.
2. MCP output can identify backend/tool/outcome and a user pseudonym.
3. LLM gateway model/cost identity is not present in MCP output.
4. Endpoint/browser client identity is not present.

`Requires minor sensor instrumentation:` propagate safe workflow
run/step/agent/delegation references into the MCP capture DTO and canonical
event candidate.

`Requires an external authoritative source:` resolve human/account and
device/process identities.

`Derivable centrally from current output:` backend/tool use and DLP-blocked
action only, with Direct-only coverage.

## Cross-sensor overlaps

| Subject | MCP Gateway | LLM Gateway | Endpoint/browser | Identity/IAM | Resolution rule |
| --- | --- | --- | --- | --- | --- |
| human | pseudonym | may have API/user credential | browser/device user | authoritative account/person | IAM anchors; activity sources support use |
| agent/workflow | source state, not emitted | agent/model call context | client app/process | workload identity | stable run/delegation IDs required |
| model | absent | provider/model/deployment/route | product surface only | none | LLM source authoritative for invocation |
| MCP server/tool | registry/tool/call | possibly tool-call metadata | endpoint process/network partial | none | MCP gateway source tuple primary; endpoint confirms deployment/reachability |
| data class | DLP labels | prompt/response DLP | upload/file/clipboard class | none | preserve per-stage observations, correlate by run/action |
| enforcement | native DLP/confirmation/ZIA/policy | LLM controls | browser/endpoint controls | policy authority | record each decision/effect; do not double-count |
| cost | absent | usage/rate/cost | absent | billing authority | LLM/billing primary |
| bypass | sees only routed traffic | sees routed model traffic | process/network can expose direct MCP/provider use | policy scope | coverage finding requires independent source |

## Confidence

Central confidence should combine:

- identifier strength and scope;
- explicit propagated correlation;
- source health and capability coverage;
- event-time proximity;
- independent versus derived sources;
- contradictions;
- lifecycle completeness.

Two records produced from the same gateway tool log/outbox are not independent
evidence. Missing MCP observations during sensor degradation lower coverage;
they do not prove no action occurred.

