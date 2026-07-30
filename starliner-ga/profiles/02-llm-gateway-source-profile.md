# LLM Gateway Source Profile

Status: **normative profile; current source binding verified at the pinned audited revision**

## Purpose and authority

The LLM gateway directly observes and may govern model requests routed through it. It is strong for provider account, deployment/model string, request outcome, token/latency metadata, and gateway policy effect. It has no visibility into bypass traffic.

The exact request authentication, provider-route lifecycle, configuration and product-queue seams and required sidecar binding are in the [LLM Gateway sensor binding](../implementation/14-llm-gateway-sensor-binding.md).

## Source object types

- gateway deployment;
- provider account/organization;
- API endpoint and model deployment candidate;
- calling application, agent, workload, or principal;
- model execution;
- streaming session;
- policy decision;
- token/usage/cost input;
- command/effect and health.

## Strong identifiers

- gateway deployment and route ID;
- authenticated calling workload/principal;
- provider account/project ID;
- source request ID;
- provider request ID where returned;
- configured route/deployment ID;
- provider model string and endpoint scope;
- propagated trace context for actual causal calls.

API keys are never identifiers in evidence.

## Default-safe fields

- operation and modality;
- source and provider request/correlation IDs;
- caller identity class;
- provider/account/route/model identifiers;
- timestamps, latency, status, retry;
- input/output/cached token or unit counts;
- streaming metadata;
- policy decision and outcome;
- data-class indicators;
- price-input references;
- health and capacity state.

## Restricted or prohibited

Prompts, responses, embeddings, attachments, tool arguments/results, headers, and bodies are restricted. Authorization headers, API keys, cookies, raw credentials, and unredacted secrets are prohibited. Normal discovery, inventory, insight, and cost features must work without content.

## Lifecycle and reconciliation

The profile reconciles configured routes, provider accounts/projects, model aliases/deployments, and policy configuration. Executions are append-only with corrections for late provider usage/billing. Route deletion does not erase historical activity.

## Capability classes

- observe request and response metadata;
- identify configured caller and route;
- allow, warn, require approval, deny, reroute, redact, or limit where certified;
- emit usage/cost inputs;
- correlate provider outcome;
- report enforcement effect.

## Central resolution contributions

- model product and deployment claims;
- application/agent/workload execution relationships;
- provider account relationships;
- token, latency, status, and cost activity;
- policy and effect evidence;
- gateway coverage and bypass limitation.

## Required certification

Provider/API compatibility, streaming, retries, timeouts, idempotency, model aliases, token accounting, policy latency, high availability, fail-open/closed behavior, content leakage, credential isolation, load/shedding, upgrade, and multi-region routing.

## Product caveats

Gateway analytics apply only to routed traffic. The UI must show the eligible and routed population before presenting gateway-derived enterprise percentages.
