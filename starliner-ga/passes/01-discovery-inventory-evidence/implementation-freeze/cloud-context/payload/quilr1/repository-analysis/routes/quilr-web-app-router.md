# quilr-web App Router entry points

**Pinned commit:** `e6f9d03ddedde756ec447e3fabccdb3a8c418ea9`

## Counts

| Entry-point type | Count |
| --- | ---: |
| Page modules | 112 |
| Layout modules | 20 |
| Route-handler modules | 2 |
| Exported route operations | 2 |

## Page routes

`[lng]`, `[id]`, and similar segments are preserved exactly as dynamic Next.js segments. Parenthesized route groups are omitted from the URL, matching App Router convention.

| URL pattern | Module directive | Page module | Local implementation imports (evidence of delegation) |
| --- | --- | --- | --- |
| `/[lng]` | unspecified | `src/app/[lng]/(Home)/page.tsx` | `@/constants/feature-flags`, `@/utils/appPaths` |
| `/[lng]/access-control/[accessType]` | unspecified | `src/app/[lng]/access-control/[accessType]/page.tsx` | `./AccessControlBase`, `./Components/HeaderAndTitle`, `@/app/i18n` |
| `/[lng]/accounts` | unspecified | `src/app/[lng]/accounts/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/accounts/AccountsPageBase` |
| `/[lng]/ai-assets` | unspecified | `src/app/[lng]/ai-assets/page.tsx` | `@/utils/appPaths` |
| `/[lng]/ai-assets/[tabs]` | unspecified | `src/app/[lng]/ai-assets/[tabs]/page.tsx` | `./AIAssetsTabContent`, `@/utils/appPaths` |
| `/[lng]/ai-axis` | unspecified | `src/app/[lng]/ai-axis/page.tsx` | `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/ai-axis/activate-agent` | unspecified | `src/app/[lng]/ai-axis/activate-agent/page.tsx` | `@/app/Components/MainPageLayout` |
| `/[lng]/ai-axis/ai-agent` | unspecified | `src/app/[lng]/ai-axis/ai-agent/page.tsx` | `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit` | client | `src/app/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/page.tsx` | No local import |
| `/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/[tabId]` | unspecified | `src/app/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/[tabId]/page.tsx` | `@/app/[lng]/(Home)/page` |
| `/[lng]/ai-axis/ai-compliance` | unspecified | `src/app/[lng]/ai-axis/ai-compliance/page.tsx` | No local import |
| `/[lng]/ai-axis/ai-compliance/[tabId]` | unspecified | `src/app/[lng]/ai-axis/ai-compliance/[tabId]/page.tsx` | `@/types/PageProps.types` |
| `/[lng]/ai-axis/ai-usage-insights` | unspecified | `src/app/[lng]/ai-axis/ai-usage-insights/page.tsx` | `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/ai-axis/audit-logs` | unspecified | `src/app/[lng]/ai-axis/audit-logs/page.tsx` | `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/ai-axis/outputs` | unspecified | `src/app/[lng]/ai-axis/outputs/page.tsx` | `./OutputsPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/ai-axis/prompts` | unspecified | `src/app/[lng]/ai-axis/prompts/page.tsx` | `./PromptsPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/ai-axis/settings` | unspecified | `src/app/[lng]/ai-axis/settings/page.tsx` | `./SettingsPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/apps` | unspecified | `src/app/[lng]/apps/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/apps/ai-apps/AIAppsPageBase` |
| `/[lng]/apps/compliance-dashboard` | client | `src/app/[lng]/apps/compliance-dashboard/page.tsx` | No local import |
| `/[lng]/apps/compliance-dashboard-rebit` | client | `src/app/[lng]/apps/compliance-dashboard-rebit/page.tsx` | No local import |
| `/[lng]/apps/compliance-dashboard-rebit/[tabId]` | unspecified | `src/app/[lng]/apps/compliance-dashboard-rebit/[tabId]/page.tsx` | `@/types/PageProps.types` |
| `/[lng]/apps/compliance-dashboard/[tabId]` | unspecified | `src/app/[lng]/apps/compliance-dashboard/[tabId]/page.tsx` | `@/types/PageProps.types` |
| `/[lng]/audit-log` | unspecified | `src/app/[lng]/audit-log/page.tsx` | `@/components/audit-log/AuditLogPageBase` |
| `/[lng]/auth` | unspecified | `src/app/[lng]/auth/page.tsx` | `./AuthPageBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/browser-ext/[id]` | unspecified | `src/app/[lng]/browser-ext/[id]/page.tsx` | `./BrowserExtensionLandingClient`, `@/app/Components/MainPageLayout` |
| `/[lng]/browser-extension` | unspecified | `src/app/[lng]/browser-extension/page.tsx` | `@/app/[lng]/data-explorer/postures/ai-usage-risk/Components/AppBarWrapper`, `@/app/[lng]/data-explorer/postures/Utills/const`, `@/app/Components/MainPageLayout`, `@/components/browser-extension/PosturePageBase` |
| `/[lng]/control-management/[posture]` | unspecified | `src/app/[lng]/control-management/[posture]/page.tsx` | `@/components/control-management/CMPagelayout` |
| `/[lng]/control-management/control-form` | unspecified | `src/app/[lng]/control-management/control-form/page.tsx` | `@/components/control-management/ControlFormPageBase` |
| `/[lng]/data-explorer/[dataType]` | unspecified | `src/app/[lng]/data-explorer/[dataType]/page.tsx` | `./DataPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/accounts` | unspecified | `src/app/[lng]/data-explorer/accounts/page.tsx` | `./AccountsPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/activate-agent` | unspecified | `src/app/[lng]/data-explorer/activate-agent/page.tsx` | `./ActivateAgentPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/ai-usage` | unspecified | `src/app/[lng]/data-explorer/ai-usage/page.tsx` | `./AiUsagePageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/apps` | unspecified | `src/app/[lng]/data-explorer/apps/page.tsx` | `./AppsPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/findings-old` | unspecified | `src/app/[lng]/data-explorer/findings-old/page.tsx` | `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/issues` | unspecified | `src/app/[lng]/data-explorer/issues/page.tsx` | `./IssuePageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/posture` | unspecified | `src/app/[lng]/data-explorer/posture/page.tsx` | `./PosturePageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/postures` | unspecified | `src/app/[lng]/data-explorer/postures/page.tsx` | `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/data-explorer/postures/ai-usage-risk` | unspecified | `src/app/[lng]/data-explorer/postures/ai-usage-risk/page.tsx` | `../Utills/const`, `./Components/AppBarWrapper`, `./PosturePageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/postures/data-risks/[[...behavior]]` | unspecified | `src/app/[lng]/data-explorer/postures/data-risks/[[...behavior]]/page.tsx` | `../../../const`, `../../ai-usage-risk/Components/AppBarWrapper`, `../../Utills/const`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/postures/device-risks` | unspecified | `src/app/[lng]/data-explorer/postures/device-risks/page.tsx` | `../../const`, `../ai-usage-risk/Components/AppBarWrapper`, `../Utills/const`, `./PosturePageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/postures/identity-risk` | unspecified | `src/app/[lng]/data-explorer/postures/identity-risk/page.tsx` | `../ai-usage-risk/Components/AppBarWrapper`, `../Utills/const`, `./PosturePageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/postures/saas-risk` | unspecified | `src/app/[lng]/data-explorer/postures/saas-risk/page.tsx` | `../ai-usage-risk/Components/AppBarWrapper`, `../Utills/const`, `./PosturePageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-explorer/users` | unspecified | `src/app/[lng]/data-explorer/users/page.tsx` | `./HumanPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/data-models` | unspecified | `src/app/[lng]/data-models/page.tsx` | `./DataDefinitionPageBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/decision-engine` | unspecified | `src/app/[lng]/decision-engine/page.tsx` | `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/detection-models/[tabName]` | client | `src/app/[lng]/detection-models/[tabName]/page.tsx` | `@/components/data-detections/DetectionModelsAdversarialTab`, `@/components/data-detections/DetectionModelsDataRisksTab`, `@/components/data-detections/DetectionModelsInsiderTab`, `@/constants/data-detections/detectionModelsVisibility`, `@/types/PageProps.types` |
| `/[lng]/engagement-center` | unspecified | `src/app/[lng]/engagement-center/page.tsx` | `./EngagementCenterBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout` |
| `/[lng]/exports` | unspecified | `src/app/[lng]/exports/page.tsx` | `@/components/exports/ExportsPageBase` |
| `/[lng]/findings` | client | `src/app/[lng]/findings/page.tsx` | `@/app/Utils/fetchPermissionsCookie`, `@/utils/appPaths` |
| `/[lng]/findings/[dataType]` | unspecified | `src/app/[lng]/findings/[dataType]/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/findings/FindingPageBase` |
| `/[lng]/insights` | unspecified | `src/app/[lng]/insights/page.tsx` | `@/constants/feature-flags`, `@/utils/appPaths` |
| `/[lng]/insights/[tabId]` | unspecified | `src/app/[lng]/insights/[tabId]/page.tsx` | `@/components/home/ai-usage-insights/AiInsightsPageBase`, `@/components/home/dlp-insights/DLPPageBase`, `@/components/home/executive-dashboard/ExecutiveDashboard` |
| `/[lng]/integration/[tabId]` | unspecified | `src/app/[lng]/integration/[tabId]/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/integration/IntegrationPageBase`, `@/types/PageProps.types` |
| `/[lng]/integration/[tabId]/[id]` | unspecified | `src/app/[lng]/integration/[tabId]/[id]/page.tsx` | `./ConnectorPageBase`, `@/app/Components/AppBar`, `@/app/Components/BreadScrumbMenu`, `@/app/Components/MainPageLayout` |
| `/[lng]/integration/[tabId]/[id]/oauth` | unspecified | `src/app/[lng]/integration/[tabId]/[id]/oauth/page.tsx` | `./OauthPage`, `@/app/Components/MainPageLayout` |
| `/[lng]/integration/oauth` | unspecified | `src/app/[lng]/integration/oauth/page.tsx` | `./OauthIntegrationPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/integration/oauth/redirect` | unspecified | `src/app/[lng]/integration/oauth/redirect/page.tsx` | `./IntegrationRedirectBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/integration/redirect` | unspecified | `src/app/[lng]/integration/redirect/page.tsx` | `./IntegrationRedirectBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/integration/setting` | unspecified | `src/app/[lng]/integration/setting/page.tsx` | `./SettingPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/internal-login` | unspecified | `src/app/[lng]/internal-login/page.tsx` | `./InternalLoginForm`, `@/app/i18n`, `@/types/PageProps.types` |
| `/[lng]/lens` | client | `src/app/[lng]/lens/page.tsx` | `@/components/lens/LensEventsView`, `@/types/lens.types` |
| `/[lng]/login` | unspecified | `src/app/[lng]/login/page.tsx` | `./OauthPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/no-access` | client | `src/app/[lng]/no-access/page.tsx` | No local import |
| `/[lng]/oauth-landing/[token]` | unspecified | `src/app/[lng]/oauth-landing/[token]/page.tsx` | `./OauthLandingPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/onboard` | unspecified | `src/app/[lng]/onboard/page.tsx` | `./OnBoardPageBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/onboard/admin` | unspecified | `src/app/[lng]/onboard/admin/page.tsx` | `./AdminPageBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/onboard/success` | unspecified | `src/app/[lng]/onboard/success/page.tsx` | `./OnBoardSuccessPageBase`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/playground` | unspecified | `src/app/[lng]/playground/page.tsx` | `./PlaygroundPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/app/Components/Premuim/TrialBanner`, `@/types/PageProps.types` |
| `/[lng]/policies` | unspecified | `src/app/[lng]/policies/page.tsx` | `../../../components/settings/Policies/PolicyPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/self-service` | client | `src/app/[lng]/self-service/page.tsx` | `@/app/[lng]/(Home)/AuthStore`, `@/app/Components/Auth/useLogout`, `@/app/Utils/fetchPermissionsCookie`, `@/components/self-service/LLMGatewaySelfService`, `@/components/self-service/shell/MCPGatewayComingSoon`, `@/components/self-service/shell/SelfServiceHeader`, `@/components/self-service/shell/types`, `@/utils/appPaths` |
| `/[lng]/settings/ai-gateway` | unspecified | `src/app/[lng]/settings/ai-gateway/page.tsx` | No local import |
| `/[lng]/settings/ai-gateway/gateways` | unspecified | `src/app/[lng]/settings/ai-gateway/gateways/page.tsx` | `@/components/settings/ai-getway/gateways/GatewaysPageBase` |
| `/[lng]/settings/ai-gateway/logs` | client | `src/app/[lng]/settings/ai-gateway/logs/page.tsx` | `@/components/settings/ai-getway/ai-gateway/v2/AIGatewayLogsV2` |
| `/[lng]/settings/ai-gateway/mcp-gateway` | client | `src/app/[lng]/settings/ai-gateway/mcp-gateway/page.tsx` | `@/app/Components/ToolTip`, `@/app/Utils/aiGatewayConfig`, `@/app/Utils/fetchPermissionsCookie`, `@/components/commonComponents/CopyText/idex`, `@/components/settings/ai-getway/mcp-gateway/AddMCP`, `@/components/settings/ai-getway/mcp-gateway/AgentsConfiguration`, `@/components/settings/ai-getway/mcp-gateway/mcp-gateway.constants`, `@/components/settings/ai-getway/mcp-gateway/MCPGraphViewButton` |
| `/[lng]/settings/ai-gateway/mcp-gateway/logs` | client | `src/app/[lng]/settings/ai-gateway/mcp-gateway/logs/page.tsx` | `@/components/settings/ai-getway/mcp-gateway-logs/MCPLogsAnalytics`, `@/hooks/useUpdateQueryParams` |
| `/[lng]/settings/ai-gateway/mcp-gateway/status` | client | `src/app/[lng]/settings/ai-gateway/mcp-gateway/status/page.tsx` | `@/components/settings/ai-getway/mcp-gateway/MCPUserStatus` |
| `/[lng]/settings/ai-gateway/red-teaming` | client | `src/app/[lng]/settings/ai-gateway/red-teaming/page.tsx` | `@/components/settings/ai-getway/red-teaming/RedTeamingV2PageBase` |
| `/[lng]/settings/ai-gateway/red-teaming/results` | client | `src/app/[lng]/settings/ai-gateway/red-teaming/results/page.tsx` | `@/components/settings/ai-getway/red-teaming/RedTeamingV2PageBase` |
| `/[lng]/settings/ai-gateway/red-teaming/results/[run_id]` | client | `src/app/[lng]/settings/ai-gateway/red-teaming/results/[run_id]/page.tsx` | `@/components/settings/ai-getway/red-teaming/RedTeamingV2PageBase` |
| `/[lng]/settings/ai-gateway/usage` | client | `src/app/[lng]/settings/ai-gateway/usage/page.tsx` | `@/components/settings/ai-getway/ai-gateway/v2/AIGatewayUsageCost` |
| `/[lng]/settings/api-getway-logs` | unspecified | `src/app/[lng]/settings/api-getway-logs/page.tsx` | `@/components/settings/ai-getway/AIGatewayFindingsSection` |
| `/[lng]/settings/browser-extension` | unspecified | `src/app/[lng]/settings/browser-extension/page.tsx` | `@/types/PageProps.types` |
| `/[lng]/settings/browser-extension/configurations` | client | `src/app/[lng]/settings/browser-extension/configurations/page.tsx` | `@/components/settings/browser-extention/detection-configuration/DetectionConfigPageBase` |
| `/[lng]/settings/browser-extension/deployment` | unspecified | `src/app/[lng]/settings/browser-extension/deployment/page.tsx` | `@/components/settings/browser-extention/Components/NewDesign/Tabs/BEDeploymentTab`, `@/types/PageProps.types` |
| `/[lng]/settings/browser-extension/deployment_management` | unspecified | `src/app/[lng]/settings/browser-extension/deployment_management/page.tsx` | `@/components/settings/browser-extention/Components/BEDMTab`, `@/types/PageProps.types` |
| `/[lng]/settings/browser-extension/status` | unspecified | `src/app/[lng]/settings/browser-extension/status/page.tsx` | `@/components/settings/browser-extention/Components/BEStatus`, `@/types/PageProps.types` |
| `/[lng]/settings/browser-extension/whitelisting` | client | `src/app/[lng]/settings/browser-extension/whitelisting/page.tsx` | `@/components/settings/browser-extention/DomainWhitelist` |
| `/[lng]/settings/compliance` | unspecified | `src/app/[lng]/settings/compliance/page.tsx` | No local import |
| `/[lng]/settings/compliance/claude` | client | `src/app/[lng]/settings/compliance/claude/page.tsx` | `@/components/settings/compliance/claude/ClaudePage` |
| `/[lng]/settings/compliance/openai` | client | `src/app/[lng]/settings/compliance/openai/page.tsx` | `@/components/policy-engine/RulesTab`, `@/components/settings/compliance/openai/OpenaiPage`, `@/hooks/useIsDetectionPolicyEnabled` |
| `/[lng]/settings/endpoint` | unspecified | `src/app/[lng]/settings/endpoint/page.tsx` | `@/types/PageProps.types` |
| `/[lng]/settings/endpoint/configurations` | client | `src/app/[lng]/settings/endpoint/configurations/page.tsx` | `@/app/[lng]/(Home)/AuthStore`, `@/app/Utils/AxiosService`, `@/app/Utils/FetcherWithTenant`, `@/app/Utils/fetchPermissionsCookie`, `@/components/settings/endpoint/Configurations/accessControl`, `@/components/settings/endpoint/Configurations/ConfigCardItem` |
| `/[lng]/settings/endpoint/deployment` | unspecified | `src/app/[lng]/settings/endpoint/deployment/page.tsx` | `@/components/settings/endpoint/Components/EndpointDeploymentTab`, `@/types/PageProps.types` |
| `/[lng]/settings/endpoint/deployment_management` | unspecified | `src/app/[lng]/settings/endpoint/deployment_management/page.tsx` | `@/components/settings/endpoint/Components/EndpointDMTab`, `@/types/PageProps.types` |
| `/[lng]/settings/endpoint/status` | unspecified | `src/app/[lng]/settings/endpoint/status/page.tsx` | `@/components/settings/endpoint/Components/EndpointStatus`, `@/types/PageProps.types` |
| `/[lng]/settings/organizational-context` | unspecified | `src/app/[lng]/settings/organizational-context/page.tsx` | No local import |
| `/[lng]/settings/organizational-context/general-settings` | unspecified | `src/app/[lng]/settings/organizational-context/general-settings/page.tsx` | `@/components/settings/Components/Tabs/Organization/GeneralSettings`, `@/types/PageProps.types` |
| `/[lng]/settings/organizational-context/manage-users` | unspecified | `src/app/[lng]/settings/organizational-context/manage-users/page.tsx` | `@/components/settings/Components/Tabs/ManageUsers`, `@/types/PageProps.types` |
| `/[lng]/settings/organizational-context/organizational-policies` | unspecified | `src/app/[lng]/settings/organizational-context/organizational-policies/page.tsx` | `@/components/settings/Components/Tabs/Organization/Components/OrganizationalPolicies`, `@/types/PageProps.types` |
| `/[lng]/settings/organizational-context/organizational-policies/add-organizational-policy` | unspecified | `src/app/[lng]/settings/organizational-context/organizational-policies/add-organizational-policy/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/settings/Policies/AddPolicy`, `@/types/PageProps.types` |
| `/[lng]/settings/organizational-context/profile` | unspecified | `src/app/[lng]/settings/organizational-context/profile/page.tsx` | `@/components/settings/Components/Tabs/Profile`, `@/types/PageProps.types` |
| `/[lng]/settings/organizational-context/smart-groups` | unspecified | `src/app/[lng]/settings/organizational-context/smart-groups/page.tsx` | `@/components/settings/Components/Tabs/SmartGroups`, `@/types/PageProps.types` |
| `/[lng]/settings/user-interaction-hub` | unspecified | `src/app/[lng]/settings/user-interaction-hub/page.tsx` | No local import |
| `/[lng]/settings/user-interaction-hub/policies` | client | `src/app/[lng]/settings/user-interaction-hub/policies/page.tsx` | `@/components/settings/user-interaction-hub/PolicySection` |
| `/[lng]/settings/user-interaction-hub/popup-content` | client | `src/app/[lng]/settings/user-interaction-hub/popup-content/page.tsx` | `@/components/settings/user-interaction-hub/PopupContentComponent` |
| `/[lng]/settings/user-interaction-hub/user-responses` | client | `src/app/[lng]/settings/user-interaction-hub/user-responses/page.tsx` | `@/components/settings/user-interaction-hub/UserResponsesComponent` |
| `/[lng]/settings/user-interaction-hub/visual-styling` | client | `src/app/[lng]/settings/user-interaction-hub/visual-styling/page.tsx` | `@/components/settings/user-interaction-hub/VisualStylingContent` |
| `/[lng]/smart-groups` | unspecified | `src/app/[lng]/smart-groups/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/controls-smart-groups` |
| `/[lng]/things-to-review` | unspecified | `src/app/[lng]/things-to-review/page.tsx` | `./ThingsToReviewPageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/things-to-review/[id]` | unspecified | `src/app/[lng]/things-to-review/[id]/page.tsx` | `./TableViewThingsToReviewBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/things-to-review/[id]/[engage]` | unspecified | `src/app/[lng]/things-to-review/[id]/[engage]/page.tsx` | `../TableViewThingsToReviewBase`, `./EngagePageBase`, `@/app/Components/AppBar`, `@/app/Components/MainPageLayout`, `@/types/PageProps.types` |
| `/[lng]/users` | unspecified | `src/app/[lng]/users/page.tsx` | `@/app/Components/MainPageLayout`, `@/components/users/UsersPageBase` |

## Layout entry points

| Route subtree | Module directive | Layout module | Local imports |
| --- | --- | --- | --- |
| `/[lng]` | unspecified | `src/app/[lng]/layout.tsx` | `../globals.css`, `../i18n/settings`, `./(Home)/JotaiProvider`, `@/components/app-layout/AppLayout` |
| `/[lng]/access-control/[accessType]` | unspecified | `src/app/[lng]/access-control/[accessType]/layout.tsx` | `@/app/Components/AppBar`, `@/app/Components/BreadScrumbMenu`, `@/app/Components/MainPageLayout` |
| `/[lng]/ai-assets` | client | `src/app/[lng]/ai-assets/layout.tsx` | `@/hooks/useIsEndpointAgentEnabled`, `@/utils/appPaths` |
| `/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit` | unspecified | `src/app/[lng]/ai-axis/ai-apps/compliance-dashboard-rebit/layout.tsx` | `../Components/ComplianceDashboard-rebit/ComplianceDashboardPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/ai-axis/ai-compliance` | unspecified | `src/app/[lng]/ai-axis/ai-compliance/layout.tsx` | `@/app/[lng]/apps/Components/ComplianceDashboard/ComplianceDashboardPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/apps` | unspecified | `src/app/[lng]/apps/layout.tsx` | `@/app/Components/MainPageLayout`, `@/components/apps/AppsPageBase` |
| `/[lng]/apps/compliance-dashboard` | unspecified | `src/app/[lng]/apps/compliance-dashboard/layout.tsx` | `../Components/ComplianceDashboard/ComplianceDashboardPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/apps/compliance-dashboard-rebit` | unspecified | `src/app/[lng]/apps/compliance-dashboard-rebit/layout.tsx` | `../Components/ComplianceDashboard/ComplianceDashboardPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/audit-log` | unspecified | `src/app/[lng]/audit-log/layout.tsx` | `@/app/Components/MainPageLayout` |
| `/[lng]/detection-models` | client | `src/app/[lng]/detection-models/layout.tsx` | `@/app/Components/MainPageLayout`, `@/app/Components/PageHeader`, `@/constants/data-detections/detectionModelsVisibility` |
| `/[lng]/exports` | unspecified | `src/app/[lng]/exports/layout.tsx` | `@/app/Components/MainPageLayout` |
| `/[lng]/insights` | client | `src/app/[lng]/insights/layout.tsx` | `@/app/[lng]/(Home)/AuthStore`, `@/app/Components/QuilrLoader/QuilrLoader`, `@/constants/feature-flags`, `@/utils/appPaths`, `@/utils/fetch-service/fetchAPI` |
| `/[lng]/integration/[tabId]` | unspecified | `src/app/[lng]/integration/[tabId]/layout.tsx` | `../../../../components/integration/IntegrationLayoutPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/settings` | unspecified | `src/app/[lng]/settings/layout.tsx` | `../../../components/settings/SettingsPageBase`, `@/app/Components/MainPageLayout` |
| `/[lng]/settings/ai-gateway` | unspecified | `src/app/[lng]/settings/ai-gateway/layout.tsx` | `@/components/settings/ai-getway/AIGetway` |
| `/[lng]/settings/browser-extension` | unspecified | `src/app/[lng]/settings/browser-extension/layout.tsx` | `@/components/settings/browser-extention/BrowserPageBase` |
| `/[lng]/settings/compliance` | unspecified | `src/app/[lng]/settings/compliance/layout.tsx` | `@/components/settings/compliance/CompliancePage` |
| `/[lng]/settings/endpoint` | unspecified | `src/app/[lng]/settings/endpoint/layout.tsx` | `@/components/settings/browser-extention/BrowserPageBase`, `@/components/settings/endpoint/EndpointPageBase` |
| `/[lng]/settings/organizational-context` | unspecified | `src/app/[lng]/settings/organizational-context/layout.tsx` | `@/components/settings/Components/Tabs/Organization/OrganizationSettings` |
| `/[lng]/settings/user-interaction-hub` | unspecified | `src/app/[lng]/settings/user-interaction-hub/layout.tsx` | `@/components/settings/user-interaction-hub/UserInteractionHubBase` |

## Route handlers

## `POST /api/cookie`

**Location:** `src/app/api/cookie/route.ts:6`  
**Implementation:** `src/app/api/cookie/route.ts#POST`  
**Signature:** `export async function POST(request: NextRequest)`

Verified implementation:

```typescript
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { AuthApiResponse } from '@/app/Types/Login';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const cookieStore = cookies();

  if (data.user) {
    const user = data.user as AuthApiResponse;
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(process.env.NEXT_PUBLIC_AUTH_COOKIE!, JSON.stringify(user), {
      path: '/',
    });

    return response;
  } else {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

## `POST /api/download-mdm-file`

**Location:** `src/app/api/download-mdm-file/route.ts:3`  
**Implementation:** `src/app/api/download-mdm-file/route.ts#POST`  
**Signature:** `export async function POST(request: NextRequest)`

Verified implementation:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, fileName } = await request.json();

    // Fetch the file from the external URL (server-side, no CORS)
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    // Return the file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
```


## Middleware/proxy boundary

Verified execution order in `src/proxy.ts#proxy`:

1. Clone request headers and add `current-url` through `additionalHeaders`.
2. Return HTTP 404 immediately for every `OPTIONS` request matched by the proxy.
3. Run locale detection/redirect through `i18Middleware`; return its redirect when present.
4. Run cookie-shape/path gating through `authMiddleware`; return its redirect when present.
5. Continue with `NextResponse.next`, forwarding the augmented request headers.

Contradiction: `refreshAuthTokenMiddleware` is imported by `src/proxy.ts` but never called there. No other caller was present in the initial exact-name search.
