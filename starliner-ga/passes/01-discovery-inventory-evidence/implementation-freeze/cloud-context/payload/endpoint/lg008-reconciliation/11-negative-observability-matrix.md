# 11 — Negative Observability Matrix

This endpoint-only matrix evaluates 68
required concepts.

| Endpoint observability boundary | Concepts |
| --- | --- |
| CONDITIONALLY_COLLECTED | 24 |
| INFERRED_OR_DERIVED | 6 |
| OBSERVABLE_AND_COLLECTED | 11 |
| OBSERVABLE_BUT_NOT_COLLECTED | 8 |
| REQUIRES_ANOTHER_SENSOR_OR_CONNECTOR | 8 |
| UNOBSERVABLE_BY_THIS_SENSOR | 11 |

Other sensor columns are not populated with guesses. The machine table carries
`other_profiles=NOT_ADMITTED_BY_USER_SCOPE` and names the external authority
needed for endpoint-blind concepts.

Key boundaries:

- endpoint observes source-scoped OS/device/process/configuration facts;
- it cannot prove enterprise person/employment/ownership/entitlement;
- agent runtime/run/step/delegation coverage is incomplete;
- configured models/MCP servers do not prove invocation;
- MCP tools/resources/prompts are not enumerated as entities;
- attempted decisions/actions do not prove remote or final effects;
- missing activity under degraded capture cannot prove nonexistence;
- no common enrolled sensor/outbox/delivery/readiness record currently exists.
