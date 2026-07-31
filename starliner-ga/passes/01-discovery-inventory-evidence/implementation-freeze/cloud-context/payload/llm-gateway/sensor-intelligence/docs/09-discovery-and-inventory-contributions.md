# Discovery and inventory contributions


The gateway is request-driven and configuration-driven, not an authoritative
enterprise reconciler. First/last seen can be derived from request/config
records; deletion and tombstones require explicit configuration/audit evidence.
A source outage must lower freshness/coverage, not delete inventory.

| object_type | directly_discovered | evidence | native_ids | attributes | lifecycle_signals | relationships | platform_availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gateway | Yes | deployment/config/version | deployment/config/version | deployment/version/base URL | health/version | routes requests | Available through adapter mapping only |
| Sensor | Yes | build/deployment identity currently incomplete | build/deployment identity currently incomplete | version/config | startup/health | observes events | Requires minor sensor instrumentation |
| Application Surface | Yes, configured app_name | app_name/API key association | app_name/API key association | name/url/settings | config/request last seen | used by user/key | Available through adapter mapping only |
| Application Account | Yes when user_email/user_id present | gateway user ID/email | gateway user ID/email | email/role/tenant | request last seen | uses app/key | Derivable centrally from current output |
| Model Provider | Yes as provider type | provider string | provider string | type/label/base URL metadata | request last seen | serves invocation | Available through adapter mapping only |
| Model Route | Yes | provider/model/deployment/label tuple | provider/model/deployment/label tuple | model/provider/label | request last seen | targeted by request | Available through adapter mapping only |
| Model Version | Only if exact model string encodes one | model string | model string | model name | request last seen | served invocation | Unresolved |
| Agent Runtime/Run | Only forwarded metadata | agent_run_id/session/trace | agent_run_id/session/trace | observability metadata | request last seen | calls model | Derivable centrally from current output |
| Human/Directory Account | Email/user hints only | email/user ID | email/user ID | email/role | request last seen | initiates request | Requires an external authoritative source |
| Credential metadata | Yes, API key hash/name and provider config metadata | hash/database ID | hash/database ID | name/status/created | create/revoke/use | authorizes app | Available through adapter mapping only |
| Policy | Configuration visible | config/version/category IDs | config/version/category IDs | modes/actions | config version | governs request | Available through adapter mapping only |
| Finding signal | Yes | request/context/prediction IDs | request/context/prediction IDs | category/action/side | event time | classifies evidence | Available through adapter mapping only |
| Red-team run | Yes | run/case IDs | run/case IDs | target/status/summary | run lifecycle | tests target | Available through adapter mapping only |
