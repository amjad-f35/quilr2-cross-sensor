# Policy, Control, and Enforcement

| Control | Effect | Location | Status | Tests | Effect proof |
| --- | --- | --- | --- | --- | --- |
| session-auth | allow/deny | AuthService/session extractor | implemented | tested | session response |
| permission-check | allow/deny | authz evaluator and route wrappers | implemented | tested | HTTP result |
| origin-csrf | deny unsafe mutation | AuthService mutation guard | implemented | tested | request result |
| rate-limit | temporary login deny | AuthService/Redis counters | implemented | tested | credential-safe error |
| browser-settings | update one posture field | apps management route/service | implemented | tested adapter | upstream response only |
| browser-classification | update classification | query-builder adapter | implemented | tested shapes | literal SUCCESS response |
| browser-owner-set | diff add/remove owners | apps management adapter | implemented | tested shapes | upstream response |
| browser-detection | whitelist/blacklist behavior | apps management adapter | implemented | tested shapes | upstream response |
| policy-control | create/update/delete controls | policy management adapter | implemented | tested validation | upstream response |
| llm-settings | update configuration | gateway management adapter | implemented subset | tested projections | GET/PUT response |
| mcp-settings | install/update/remove/rules/toggle | gateway management adapter | implemented | tested validation | upstream response |
| detection-model | create/update/test/upload | detection models adapter | implemented | tested validation | upstream response |
| saved-view | personal CRUD/default | SavedViewService | implemented | tested | PostgreSQL postcondition |
| dashboard-acl | publish/share/delete/clone | CustomDashboardService | implemented | tested | PostgreSQL postcondition |
| internal-admin | operator login/diagnostic control | InternalAdminService | implemented | tested | SQLite/session state |
| canonical-sensor-command | sensor-native effect command | none | not implemented | not tested | requires separate control/effect contract |

Control transport and effect observation are separate. Most management endpoints prove request validation and upstream acceptance/response; they do not supply a universal independently observed native effect.
