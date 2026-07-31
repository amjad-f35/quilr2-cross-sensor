# Relationship contributions


| subject | relationship | object | direct_inferred | source_record | native_keys | temporal | confidence | platform_use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gateway API key | AUTHORIZES | Application configuration | Configuration | api_key_settings | api_key_hash/app_name | No | Verified shape; identity strength varies | Relationship view/activity/evidence |
| User account | MAY_USE | Application configuration | Configuration | user_app_permissions/RBAC | user_id/email/app_name | Temporal configuration | Verified shape; identity strength varies | Relationship view/activity/evidence |
| Request | ROUTED_THROUGH | Gateway deployment | Direct observed | api_request_log | request_id | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |
| Request | TARGETS | Model route | Direct observed | api_request_log | model_name/provider/provider_label | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |
| Request | INITIATED_BY | Gateway-observed account | Direct when user context present | extra_data/Axis user | user_email/user_id | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |
| Guardrail decision | GOVERNS | Request or response | Direct | actions_and_categories/Axis | request_id/context_id | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |
| Gateway | CALLED | Provider endpoint | Direct | upstream metadata | request_id/external_request_id | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |
| DLP result | CLASSIFIES | Prompt/response evidence | Direct | predictions | context_id/request_id | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |
| Red-team run | TESTS | Application/model target | Configured plus observed run | redteam run/case | run_id/target | Yes | Verified shape; identity strength varies | Relationship view/activity/evidence |

Configured permission/routing relationships are not represented as actual use.
Runtime request relationships are temporal and retain the source request ID.
