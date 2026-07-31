# Coverage, capabilities, and health


| capability | environment | version_requirement | permission | observe | enforce | evidence_quality | known_gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI-compatible HTTP ingress | Configured gateway deployment | 92b0462c583b | valid Quilr key and optional JWT/source policy | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Calls bypassing gateway; content omitted by endpoint-specific walkers |
| Anthropic Messages ingress | Configured gateway deployment | 92b0462c583b | valid Quilr key | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Provider-side activity outside gateway |
| AWS Bedrock native ingress | Configured gateway deployment | 92b0462c583b | configured base AWS identity or Quilr auth | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Unsupported invoke-with-response-stream handler explicitly returns unsupported |
| OpenAI Responses/Assistants ingress | Configured gateway deployment | 92b0462c583b | valid Quilr key | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Non-text opaque provider objects |
| OpenAI Realtime relay | Configured gateway deployment | 92b0462c583b | key in supported header/query/subprotocol form | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | No durable session/connection entity contract |
| Copilot Studio hooks | Configured gateway deployment | 92b0462c583b | path key; JWT is decoded without verification for identity hints | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Decoded unverified JWT claims are not authoritative identity |
| DLP NATS request/reply | Configured gateway deployment | 92b0462c583b | NATS connectivity | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Timeouts/errors fail according to caller; absence is not clean content |
| Performance request lifecycle | Configured gateway deployment | 92b0462c583b | database writer available | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Temporary timestamps are removed; delivery acknowledgement to Quilr 2.0 does not exist |
| External gateway health probes | Configured gateway deployment | 92b0462c583b | network access | Yes within stated scope | Protocol/path dependent | Source verified; runtime verification separate | Probe success is not complete request-path coverage |

| metric | definition | source | classification | availability |
| --- | --- | --- | --- | --- |
| heartbeat_age | time since sensor health record | Proposed adapter health | Customer coverage | Requires minor sensor instrumentation |
| source_freshness | time since last accepted gateway observation | Current request log max timestamp | Customer coverage | Derivable centrally from current output |
| outbox_depth | unacknowledged local records | Proposed Starliner outbox | Administrator health | Requires substantial sensor changes |
| oldest_undelivered_age | age of oldest unacknowledged record | Proposed Starliner outbox | Customer coverage | Requires substantial sensor changes |
| delivery_retry_count | delivery attempts/retries | Proposed Starliner publisher | Operator metric | Requires substantial sensor changes |
| capture_errors | request logging/detector instrumentation failures | Existing logs; no stable aggregate | Administrator health | Requires minor sensor instrumentation |
| policy_age | age of current config/policy version | config snapshot/watcher | Customer coverage | Available through adapter mapping only |
| provider_probe_state | latest external probe/rollup | gateway_health | Administrator health | Available through adapter mapping only |
| enforcement_readiness | auth, DLP, policy and inline hook self-test | No complete self-test | Customer coverage | Requires substantial sensor changes |

Current request/probe freshness is derivable. A versioned manifest, local
outbox health, certificate identity and enforcement self-test are proposed and
must not be described as implemented.
