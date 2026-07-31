# API and Interface Reference

## Complete inventories

- `generated-analysis/http-route-inventory.csv`: 209 canonical path-family rows from `docs/API_LIST.md`, including legacy and v2 routes.
- `generated-analysis/openapi-operations.csv`: 214 typed v2/internal OpenAPI operations across 182 paths.
- `openapi/platform-admin-v2.json`: exact request/response/security schema.

## Families

| Family | Path | Authentication | Implementation |
| --- | --- | --- | --- |
| health | /hello, /health | none | src/routes/health.rs |
| LLM legacy | /llmgateway_admin_platform_apis/v1 | trusted tenant or export key | src/routes/admin_* |
| MCP legacy | /mcpgatewayapis | trusted tenant or export key | src/routes/mcpgateway* |
| Endpoint | /endpointagentapis/v2 | trusted tenant | src/routes/endpointagent.rs |
| Browser | legacy browser route set | trusted tenant | src/routes/browser_extension.rs |
| typed platform | /platformadminapis/v2 | console session except auth starts/callbacks | src/routes/platform_admin_v2.rs |
| internal diagnostics | /quilr_internal_admin | internal admin session | src/routes/internal_admin.rs |
| SPA | explicit navigation allowlist and /assets | client session boundary | src/spa.rs |

Examples are intentionally not invented here; repository-derived request/response examples live in OpenAPI, unit fixtures, and `frontend/__test__`. The TS symbol index includes the test fixture declarations and source paths.
