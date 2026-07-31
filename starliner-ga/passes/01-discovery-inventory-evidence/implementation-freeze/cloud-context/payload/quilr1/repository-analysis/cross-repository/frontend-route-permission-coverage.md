# Frontend route-permission coverage

**Verified method:** The route list comes from tracked Next.js App Router `page.*` files. Each route was concretized with the first configured language and placeholder values, then evaluated against the checked-in rule order and the exact regex construction in `src/config/routePermissions.ts#buildRouteRegex`.

**Security boundary:** This is client-side page visibility/navigation behavior. It is not evidence of backend authorization.

## Summary

| Metric | Count |
| --- | ---: |
| App Router pages | 112 |
| Pages matching a permission rule | 59 |
| Pages with no matching rule | 53 |
| Configured permission rules parsed | 38 |

`evaluatePageAccess` returns `{ status: 'granted' }` when no rule matches. Therefore every “No matching rule” row is **Verified** to be granted by this UI-layer evaluator once a nonempty permission map exists. Authentication middleware may still require a login, and backend services may independently authorize requests.

## Page matrix

| Route | Page file | First matching rule | Evaluator behavior |
| --- | --- | --- | --- |
| `/[lng]` | `src/app/[lng]/(Home)/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/access-control/[accessType]` | `src/app/[lng]/access-control/[accessType]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/accounts` | `src/app/[lng]/accounts/page.tsx` | `/[lng]/accounts` → `'AI_USAGE'` | Permission resource required |
| `/[lng]/ai-assets` | `src/app/[lng]/ai-assets/page.tsx` | `/[lng]/ai-assets` → `'AI_ASSET'` | Permission resource required |
| `/[lng]/ai-assets/[tabs]` | `src/app/[lng]/ai-assets/[tabs]/page.tsx` | `/[lng]/ai-assets/*` → `'AI_ASSET'` | Permission resource required |
| `/[lng]/ai-axis` | `src/app/[lng]/ai-axis/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/activate-agent` | `src/app/[lng]/ai-axis/activate-agent/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/ai-agent` | `src/app/[lng]/ai-axis/ai-agent/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit` | `src/app/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/[tabId]` | `src/app/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/[tabId]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/ai-compliance` | `src/app/[lng]/ai-axis/ai-compliance/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/ai-compliance/[tabId]` | `src/app/[lng]/ai-axis/ai-compliance/[tabId]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/ai-usage-insights` | `src/app/[lng]/ai-axis/ai-usage-insights/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/audit-logs` | `src/app/[lng]/ai-axis/audit-logs/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/outputs` | `src/app/[lng]/ai-axis/outputs/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/prompts` | `src/app/[lng]/ai-axis/prompts/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/ai-axis/settings` | `src/app/[lng]/ai-axis/settings/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/apps` | `src/app/[lng]/apps/page.tsx` | `/[lng]/apps` → `'APP_MANAGEMENT'` | Permission resource required |
| `/[lng]/apps/compliance-dashboard` | `src/app/[lng]/apps/compliance-dashboard/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/apps/compliance-dashboard-rebit` | `src/app/[lng]/apps/compliance-dashboard-rebit/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/apps/compliance-dashboard-rebit/[tabId]` | `src/app/[lng]/apps/compliance-dashboard-rebit/[tabId]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/apps/compliance-dashboard/[tabId]` | `src/app/[lng]/apps/compliance-dashboard/[tabId]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/audit-log` | `src/app/[lng]/audit-log/page.tsx` | `/[lng]/audit-log` → `'REPORT'` | Permission resource required |
| `/[lng]/auth` | `src/app/[lng]/auth/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/browser-ext/[id]` | `src/app/[lng]/browser-ext/[id]/page.tsx` | `/[lng]/browser-ext/*` → `'EXTENSION'` | Permission resource required |
| `/[lng]/browser-extension` | `src/app/[lng]/browser-extension/page.tsx` | `/[lng]/browser-extension` → `'EXTENSION'` | Permission resource required |
| `/[lng]/control-management/[posture]` | `src/app/[lng]/control-management/[posture]/page.tsx` | `/[lng]/control-management/*` → `'CONTROL'` | Permission resource required |
| `/[lng]/control-management/control-form` | `src/app/[lng]/control-management/control-form/page.tsx` | `/[lng]/control-management/*` → `'CONTROL'` | Permission resource required |
| `/[lng]/data-explorer/[dataType]` | `src/app/[lng]/data-explorer/[dataType]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/accounts` | `src/app/[lng]/data-explorer/accounts/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/activate-agent` | `src/app/[lng]/data-explorer/activate-agent/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/ai-usage` | `src/app/[lng]/data-explorer/ai-usage/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/apps` | `src/app/[lng]/data-explorer/apps/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/findings-old` | `src/app/[lng]/data-explorer/findings-old/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/issues` | `src/app/[lng]/data-explorer/issues/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/posture` | `src/app/[lng]/data-explorer/posture/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/postures` | `src/app/[lng]/data-explorer/postures/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/postures/ai-usage-risk` | `src/app/[lng]/data-explorer/postures/ai-usage-risk/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/postures/data-risks/[[...behavior]]` | `src/app/[lng]/data-explorer/postures/data-risks/[[...behavior]]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/postures/device-risks` | `src/app/[lng]/data-explorer/postures/device-risks/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/postures/identity-risk` | `src/app/[lng]/data-explorer/postures/identity-risk/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/postures/saas-risk` | `src/app/[lng]/data-explorer/postures/saas-risk/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-explorer/users` | `src/app/[lng]/data-explorer/users/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/data-models` | `src/app/[lng]/data-models/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/decision-engine` | `src/app/[lng]/decision-engine/page.tsx` | `/[lng]/decision-engine` → `'GUARDRAIL'` | Permission resource required |
| `/[lng]/detection-models/[tabName]` | `src/app/[lng]/detection-models/[tabName]/page.tsx` | `/[lng]/detection-models/*` → `'DETECTION_MODELS'` | Permission resource required |
| `/[lng]/engagement-center` | `src/app/[lng]/engagement-center/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/exports` | `src/app/[lng]/exports/page.tsx` | `/[lng]/exports` → `'REPORT'` | Permission resource required |
| `/[lng]/findings` | `src/app/[lng]/findings/page.tsx` | `/[lng]/findings` → `'FINDING'` | Permission resource required |
| `/[lng]/findings/[dataType]` | `src/app/[lng]/findings/[dataType]/page.tsx` | `/[lng]/findings/*` → `'FINDING'` | Permission resource required |
| `/[lng]/insights` | `src/app/[lng]/insights/page.tsx` | `/[lng]/insights` → `['INSIGHTS', 'LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/insights/[tabId]` | `src/app/[lng]/insights/[tabId]/page.tsx` | `/[lng]/insights/*` → `['INSIGHTS', 'LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/integration/[tabId]` | `src/app/[lng]/integration/[tabId]/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/integration/[tabId]/[id]` | `src/app/[lng]/integration/[tabId]/[id]/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/integration/[tabId]/[id]/oauth` | `src/app/[lng]/integration/[tabId]/[id]/oauth/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/integration/oauth` | `src/app/[lng]/integration/oauth/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/integration/oauth/redirect` | `src/app/[lng]/integration/oauth/redirect/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/integration/redirect` | `src/app/[lng]/integration/redirect/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/integration/setting` | `src/app/[lng]/integration/setting/page.tsx` | `/[lng]/integration/*` → `'INTEGRATION'` | Permission resource required |
| `/[lng]/internal-login` | `src/app/[lng]/internal-login/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/lens` | `src/app/[lng]/lens/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/login` | `src/app/[lng]/login/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/no-access` | `src/app/[lng]/no-access/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/oauth-landing/[token]` | `src/app/[lng]/oauth-landing/[token]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/onboard` | `src/app/[lng]/onboard/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/onboard/admin` | `src/app/[lng]/onboard/admin/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/onboard/success` | `src/app/[lng]/onboard/success/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/playground` | `src/app/[lng]/playground/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/policies` | `src/app/[lng]/policies/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/self-service` | `src/app/[lng]/self-service/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/settings/ai-gateway` | `src/app/[lng]/settings/ai-gateway/page.tsx` | `/[lng]/settings/ai-gateway` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/gateways` | `src/app/[lng]/settings/ai-gateway/gateways/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/logs` | `src/app/[lng]/settings/ai-gateway/logs/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/mcp-gateway` | `src/app/[lng]/settings/ai-gateway/mcp-gateway/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/mcp-gateway/logs` | `src/app/[lng]/settings/ai-gateway/mcp-gateway/logs/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/mcp-gateway/status` | `src/app/[lng]/settings/ai-gateway/mcp-gateway/status/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/red-teaming` | `src/app/[lng]/settings/ai-gateway/red-teaming/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/red-teaming/results` | `src/app/[lng]/settings/ai-gateway/red-teaming/results/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/red-teaming/results/[run_id]` | `src/app/[lng]/settings/ai-gateway/red-teaming/results/[run_id]/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/ai-gateway/usage` | `src/app/[lng]/settings/ai-gateway/usage/page.tsx` | `/[lng]/settings/ai-gateway/*` → `['LLM_GATEWAY', 'MCP_GATEWAY']` | Permission resource required |
| `/[lng]/settings/api-getway-logs` | `src/app/[lng]/settings/api-getway-logs/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/settings/browser-extension` | `src/app/[lng]/settings/browser-extension/page.tsx` | `/[lng]/settings/browser-extension` → `'EXTENSION'` | Permission resource required |
| `/[lng]/settings/browser-extension/configurations` | `src/app/[lng]/settings/browser-extension/configurations/page.tsx` | `/[lng]/settings/browser-extension/*` → `'EXTENSION'` | Permission resource required |
| `/[lng]/settings/browser-extension/deployment` | `src/app/[lng]/settings/browser-extension/deployment/page.tsx` | `/[lng]/settings/browser-extension/*` → `'EXTENSION'` | Permission resource required |
| `/[lng]/settings/browser-extension/deployment_management` | `src/app/[lng]/settings/browser-extension/deployment_management/page.tsx` | `/[lng]/settings/browser-extension/*` → `'EXTENSION'` | Permission resource required |
| `/[lng]/settings/browser-extension/status` | `src/app/[lng]/settings/browser-extension/status/page.tsx` | `/[lng]/settings/browser-extension/*` → `'EXTENSION'` | Permission resource required |
| `/[lng]/settings/browser-extension/whitelisting` | `src/app/[lng]/settings/browser-extension/whitelisting/page.tsx` | `/[lng]/settings/browser-extension/*` → `'EXTENSION'` | Permission resource required |
| `/[lng]/settings/compliance` | `src/app/[lng]/settings/compliance/page.tsx` | `/[lng]/settings/compliance` → `'COMPLIANCE'` | Permission resource required |
| `/[lng]/settings/compliance/claude` | `src/app/[lng]/settings/compliance/claude/page.tsx` | `/[lng]/settings/compliance/*` → `'COMPLIANCE'` | Permission resource required |
| `/[lng]/settings/compliance/openai` | `src/app/[lng]/settings/compliance/openai/page.tsx` | `/[lng]/settings/compliance/*` → `'COMPLIANCE'` | Permission resource required |
| `/[lng]/settings/endpoint` | `src/app/[lng]/settings/endpoint/page.tsx` | `/[lng]/settings/endpoint` → `'ENDPOINT_AGENT'` | Permission resource required |
| `/[lng]/settings/endpoint/configurations` | `src/app/[lng]/settings/endpoint/configurations/page.tsx` | `/[lng]/settings/endpoint/*` → `'ENDPOINT_AGENT'` | Permission resource required |
| `/[lng]/settings/endpoint/deployment` | `src/app/[lng]/settings/endpoint/deployment/page.tsx` | `/[lng]/settings/endpoint/*` → `'ENDPOINT_AGENT'` | Permission resource required |
| `/[lng]/settings/endpoint/deployment_management` | `src/app/[lng]/settings/endpoint/deployment_management/page.tsx` | `/[lng]/settings/endpoint/*` → `'ENDPOINT_AGENT'` | Permission resource required |
| `/[lng]/settings/endpoint/status` | `src/app/[lng]/settings/endpoint/status/page.tsx` | `/[lng]/settings/endpoint/*` → `'ENDPOINT_AGENT'` | Permission resource required |
| `/[lng]/settings/organizational-context` | `src/app/[lng]/settings/organizational-context/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/settings/organizational-context/general-settings` | `src/app/[lng]/settings/organizational-context/general-settings/page.tsx` | `/[lng]/settings/organizational-context/general-settings` → `'TENANT'` | Permission resource required |
| `/[lng]/settings/organizational-context/manage-users` | `src/app/[lng]/settings/organizational-context/manage-users/page.tsx` | `/[lng]/settings/organizational-context/manage-users` → `'USER'` | Permission resource required |
| `/[lng]/settings/organizational-context/organizational-policies` | `src/app/[lng]/settings/organizational-context/organizational-policies/page.tsx` | `/[lng]/settings/organizational-context/organizational-policies` → `'ORG_POLICY'` | Permission resource required |
| `/[lng]/settings/organizational-context/organizational-policies/add-organizational-policy` | `src/app/[lng]/settings/organizational-context/organizational-policies/add-organizational-policy/page.tsx` | `/[lng]/settings/organizational-context/organizational-policies/*` → `'ORG_POLICY'` | Permission resource required |
| `/[lng]/settings/organizational-context/profile` | `src/app/[lng]/settings/organizational-context/profile/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/settings/organizational-context/smart-groups` | `src/app/[lng]/settings/organizational-context/smart-groups/page.tsx` | `/[lng]/settings/organizational-context/smart-groups` → `'SMART_GROUP'` | Permission resource required |
| `/[lng]/settings/user-interaction-hub` | `src/app/[lng]/settings/user-interaction-hub/page.tsx` | `/[lng]/settings/user-interaction-hub` → `'TEMPLATE'` | Permission resource required |
| `/[lng]/settings/user-interaction-hub/policies` | `src/app/[lng]/settings/user-interaction-hub/policies/page.tsx` | `/[lng]/settings/user-interaction-hub/*` → `'TEMPLATE'` | Permission resource required |
| `/[lng]/settings/user-interaction-hub/popup-content` | `src/app/[lng]/settings/user-interaction-hub/popup-content/page.tsx` | `/[lng]/settings/user-interaction-hub/*` → `'TEMPLATE'` | Permission resource required |
| `/[lng]/settings/user-interaction-hub/user-responses` | `src/app/[lng]/settings/user-interaction-hub/user-responses/page.tsx` | `/[lng]/settings/user-interaction-hub/*` → `'TEMPLATE'` | Permission resource required |
| `/[lng]/settings/user-interaction-hub/visual-styling` | `src/app/[lng]/settings/user-interaction-hub/visual-styling/page.tsx` | `/[lng]/settings/user-interaction-hub/*` → `'TEMPLATE'` | Permission resource required |
| `/[lng]/smart-groups` | `src/app/[lng]/smart-groups/page.tsx` | `/[lng]/smart-groups` → `'SMART_GROUP'` | Permission resource required |
| `/[lng]/things-to-review` | `src/app/[lng]/things-to-review/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/things-to-review/[id]` | `src/app/[lng]/things-to-review/[id]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/things-to-review/[id]/[engage]` | `src/app/[lng]/things-to-review/[id]/[engage]/page.tsx` | **No matching rule** | Granted by evaluatePageAccess (no rule) |
| `/[lng]/users` | `src/app/[lng]/users/page.tsx` | `/[lng]/users` → `'AI_USAGE'` | Permission resource required |
