# quilr-query-builder HTTP API

**Pinned commit:** `c794c45a9c22b75f101c7c73da508d6e7870f97b`  
**Verified Spring mappings:** 141 operations across 26 controllers

## Global transport behavior

- Verified: Spring Boot MVC is provided by `spring-boot-starter-web`; mappings below are extracted from `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, and `@DeleteMapping`.
- Verified: CSRF and Spring Security’s default header writer are disabled. The custom request filter writes context and security response headers.
- Verified: every route is `permitAll()` at the Spring authorization-rule layer. The resolved JWT decoder filter is still inserted for the chain, with exclusions configured in `application.yml`; live probes and seven harness tests verify its principal paths.
- Verified from pinned supporting source/dynamic traces: decoder signature/revocation/tenant behavior, authorization-aspect/PDP-client decisions, NGINX/BFF prefix stripping, and the `ServiceResponse` serialization shape. Unresolved deployment edges are real issuer/PDP data and which known gateway route is active.
- Verified: most map-shaped query/header/body inputs are not controller-validated field by field. DTO validation is documented only where `@Valid` appears.
- Verified: controller methods without `ResponseEntity` or `ResponseStatusException` ordinarily return Spring’s default success status if they complete; complete global exception mapping is unresolved because dependency-provided advice may exist.

## Operation matrix

| Method | Declared path | Implementation | Input surfaces | Method-level permission | Location |
| --- | --- | --- | --- | --- | --- |
| GET | `/ai-assets/v1/ai-adoption-trend` | `com.quilr.qb.aiassets.controller.AIAssetController.getAIAdoptionTrend` | HTTP header input | No method permission annotation | `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:55` |
| GET | `/ai-assets/v1/assets/distribution` | `com.quilr.qb.aiassets.controller.AIAssetController.getAssetTypeDistribution` | HTTP header input | No method permission annotation | `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:66` |
| POST | `/ai-assets/v1/assets/list` | `com.quilr.qb.aiassets.controller.AIAssetController.listAssets` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:29` |
| GET | `/ai-assets/v1/widget` | `com.quilr.qb.aiassets.controller.AIAssetController.getAssetMetrics` | HTTP header input | No method permission annotation | `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:44` |
| GET | `/aiaccounts/query` | `com.quilr.qb.controller.AIAccountsController.getAIAppsData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAccountsController.java:27` |
| GET | `/aiaccounts/table/data` | `com.quilr.qb.controller.AIAccountsController.getTableData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAccountsController.java:34` |
| GET | `/aiaccounts/table/filter/users` | `com.quilr.qb.controller.AIAccountsController.getTableFilterUsers` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAccountsController.java:39` |
| GET | `/aiapps/app_details/id` | `com.quilr.qb.controller.AIAppsController.getAppDetailsByAppId` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:86` |
| POST | `/aiapps/app_settings/update` | `com.quilr.qb.controller.AIAppsController.updateAppTenantSettings` | HTTP header input; JSON/body input | `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "UPDATE")` | `src/main/java/com/quilr/qb/controller/AIAppsController.java:70` |
| GET | `/aiapps/category_info` | `com.quilr.qb.controller.AIAppsController.getAppCategoryDetails` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:53` |
| GET | `/aiapps/disinct/categories` | `com.quilr.qb.controller.AIAppsController.getDistinctAppCategories` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:80` |
| GET | `/aiapps/query` | `com.quilr.qb.controller.AIAppsController.getAIAppsData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:34` |
| POST | `/aiapps/table/data` | `com.quilr.qb.controller.AIAppsController.getTableData` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:41` |
| POST | `/aiapps/visitors` | `com.quilr.qb.controller.AIAppsController.getAppVisitors` | HTTP header input; query parameter input; JSON/body input; Jakarta Bean Validation requested | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:92` |
| GET | `/aiapps/whitelisted_behaviors` | `com.quilr.qb.controller.AIAppsController.getAppWhitelistedBehaviors` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIAppsController.java:61` |
| GET | `/aiconversations/detections` | `com.quilr.qb.controller.AIConversationsController.getAIDetectionsView` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:50` |
| GET | `/aiconversations/filters/app/accounts` | `com.quilr.qb.controller.AIConversationsController.getFiltersByAccounts` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:77` |
| POST | `/aiconversations/filters/apps` | `com.quilr.qb.controller.AIPromptsFilterController.getFiltersForUsers` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIPromptsFilterController.java:40` |
| GET | `/aiconversations/filters/query` | `com.quilr.qb.controller.AIConversationsController.getByAIConvFiltersKey` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:70` |
| PUT | `/aiconversations/filters/update` | `com.quilr.qb.controller.AIConversationsController.updateAIConvFilterByKey` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:63` |
| POST | `/aiconversations/filters/users` | `com.quilr.qb.controller.AIPromptsFilterController.getUserAppInteractions` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIPromptsFilterController.java:28` |
| GET | `/aiconversations/ids` | `com.quilr.qb.controller.AIConversationsController.getConversationIds` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:44` |
| GET | `/aiconversations/query` | `com.quilr.qb.controller.AIConversationsController.getConversations` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:39` |
| POST | `/aiconversations/unmasked` | `com.quilr.qb.controller.AIConversationsController.getUnMaskedData` | HTTP header input; query parameter input; JSON/body input | `@RequiresPermission(resource = "AI_USAGE", subResource = "CONVERSATION", scope = "READ")` | `src/main/java/com/quilr/qb/controller/AIConversationsController.java:56` |
| POST | `/aiusers/dwh/backfill/smart-groups` | `com.quilr.qb.controller.AIUsersController.backFillSmartGroups` | HTTP header input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:169` |
| POST | `/aiusers/dwh/sync/app-admin-users` | `com.quilr.qb.controller.AIUsersController.syncAppAdminUsers` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:176` |
| POST | `/aiusers/dwh/sync/appdata` | `com.quilr.qb.controller.AIUsersController.syncAppData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:91` |
| POST | `/aiusers/dwh/sync/appdata/appids` | `com.quilr.qb.controller.AIUsersController.synchAppDetailsByAppIds` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:105` |
| POST | `/aiusers/dwh/sync/appdata/lastupdated` | `com.quilr.qb.controller.AIUsersController.syncLastUpdatedAppData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:119` |
| POST | `/aiusers/dwh/sync/appdata/name` | `com.quilr.qb.controller.AIUsersController.getAppDetailsByName` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:98` |
| POST | `/aiusers/dwh/sync/apptenant/settings` | `com.quilr.qb.controller.AIUsersController.syncTenantAppSettings` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:112` |
| POST | `/aiusers/dwh/sync/apptenant/settings/lastupdated` | `com.quilr.qb.controller.AIUsersController.syncLastUpdatedTenantAppSettings` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:126` |
| POST | `/aiusers/dwh/sync/apptenant/settings/lastupdated/bulk` | `com.quilr.qb.controller.AIUsersController.syncLastUpdatedTenantAppSettingsBulk` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:133` |
| POST | `/aiusers/dwh/sync/smart-groups` | `com.quilr.qb.controller.AIUsersController.syncSmartGroups` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:162` |
| POST | `/aiusers/dwh/sync/users` | `com.quilr.qb.controller.AIUsersController.indexAllUsers` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:140` |
| POST | `/aiusers/dwh/sync/users/byuserid` | `com.quilr.qb.controller.AIUsersController.updateUserByEmail` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:147` |
| POST | `/aiusers/dwh/sync/users/lastupdated` | `com.quilr.qb.controller.AIUsersController.syncLastUpdatedUsers` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:155` |
| GET | `/aiusers/query` | `com.quilr.qb.controller.AIUsersController.getAIUsersResults` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:28` |
| GET | `/aiusers/redis/delete` | `com.quilr.qb.controller.AIUsersController.deleteRedisKeysForNameSpace` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:83` |
| GET | `/aiusers/redis/keys` | `com.quilr.qb.controller.AIUsersController.getKeysForNameSpace` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:76` |
| GET | `/aiusers/smartgroups` | `com.quilr.qb.controller.AIUsersController.getSmartGroups` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:182` |
| POST | `/aiusers/table/data` | `com.quilr.qb.controller.AIUsersController.getTableData` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:41` |
| GET | `/aiusers/table/filters` | `com.quilr.qb.controller.AIUsersController.getTableFilters` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:53` |
| GET | `/aiusers/violation/top_departments` | `com.quilr.qb.controller.AIUsersController.getTopDepartmentsByViolations` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/AIUsersController.java:35` |
| POST | `/clickhouse/ops/query` | `com.quilr.qb.controller.ClickhouseOpsController.executeQuery` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ClickhouseOpsController.java:29` |
| POST | `/clickhouse/ops/update` | `com.quilr.qb.controller.ClickhouseOpsController.executeUpdate` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ClickhouseOpsController.java:38` |
| POST | `/compliance/drilldown` | `com.quilr.qb.controller.ComplianceController.getComplianceDrilldown` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ComplianceController.java:43` |
| GET | `/compliance/table` | `com.quilr.qb.controller.ComplianceController.getComplainceRecords` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ComplianceController.java:29` |
| GET | `/compliance/widget` | `com.quilr.qb.controller.ComplianceController.getComplianceWidget` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ComplianceController.java:38` |
| GET | `/device/user/info` | `com.quilr.qb.controller.DeviceInfoController.getDeviceUserInfo` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DeviceInfoController.java:26` |
| GET | `/dwh/allresources` | `com.quilr.qb.controller.DWHController.getAllResources` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:96` |
| GET | `/dwh/config/ch` | `com.quilr.qb.controller.DWHController.getClickhouseConfig` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:56` |
| GET | `/dwh/config/graph` | `com.quilr.qb.controller.DWHController.getGraphConfig` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:64` |
| GET | `/dwh/config/redis` | `com.quilr.qb.controller.DWHController.getRedisConfig` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:48` |
| GET | `/dwh/cpu` | `com.quilr.qb.controller.DWHController.getCPUInfo` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:88` |
| GET | `/dwh/db_info` | `com.quilr.qb.controller.DWHController.getDBInfo` | No annotated request parameter | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:72` |
| GET | `/dwh/docker` | `com.quilr.qb.controller.DWHController.getAllDockerInfo` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:104` |
| GET | `/dwh/health` | `com.quilr.qb.controller.DWHController.health` | No annotated request parameter | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:41` |
| GET | `/dwh/memory` | `com.quilr.qb.controller.DWHController.getMemoryInfo` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/DWHController.java:80` |
| GET | `/endpoint/sync/all` | `com.quilr.qb.controller.EndpointController.syncAll` | No annotated request parameter | No method permission annotation | `src/main/java/com/quilr/qb/controller/EndpointController.java:26` |
| GET | `/endpoint/sync/tenant` | `com.quilr.qb.controller.EndpointController.syncByTenant` | HTTP header input | No method permission annotation | `src/main/java/com/quilr/qb/controller/EndpointController.java:32` |
| GET | `/endpoint/sync/tenant/device` | `com.quilr.qb.controller.EndpointController.syncByTenantAndDevice` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/EndpointController.java:39` |
| GET | `/executive/dashboard/row1/deployment/info` | `com.quilr.qb.controller.ExecutiveDashboardController.getRow1Stats` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:33` |
| GET | `/executive/dashboard/row2/action/distribution/info` | `com.quilr.qb.controller.ExecutiveDashboardController.getRow2ActionDistribution` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:58` |
| GET | `/executive/dashboard/row3/mcp/gateway/info` | `com.quilr.qb.controller.ExecutiveDashboardController.getRow3McpStats` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:82` |
| GET | `/executive/dashboard/row4/llm/gateway/info` | `com.quilr.qb.controller.ExecutiveDashboardController.getRow4LlmStats` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:106` |
| GET | `/findings/carousal/entities` | `com.quilr.qb.controller.FindingsController.getCarousalEntitiesInfo` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:39` |
| GET | `/findings/carousal/kpi_entities` | `com.quilr.qb.controller.FindingsController.getFindingsKpiAndDashboardData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:82` |
| GET | `/findings/carousel/outcomes-and-controls` | `com.quilr.qb.controller.FindingsController.getFindingsOutcomesAndControls` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:67` |
| GET | `/findings/carousel/sla-and-action_required` | `com.quilr.qb.controller.FindingsController.getFindingsSlaAndActionsRequired` | HTTP header input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:76` |
| POST | `/findings/drilldown/related_events` | `com.quilr.qb.controller.FindingsController.getFindingsDrilldownData` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:119` |
| GET | `/findings/interactions` | `com.quilr.qb.controller.FindingsController.getFindingInteractions` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:157` |
| GET | `/findings/occurrence` | `com.quilr.qb.controller.FindingsController.getStatusOccurrence` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:131` |
| GET | `/findings/pivot` | `com.quilr.qb.controller.FindingsController.getFindingsKPIData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:141` |
| POST | `/findings/table/data` | `com.quilr.qb.controller.FindingsController.getFindingsTableData` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:97` |
| GET | `/findings/table/filters` | `com.quilr.qb.controller.FindingsController.getTableFilters` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:90` |
| GET | `/findings/table/posture/counts` | `com.quilr.qb.controller.FindingsController.computeTableKPIPosturesCount` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:46` |
| GET | `/findings/widget/hero/main` | `com.quilr.qb.controller.FindingsController.getHeroMainWidget` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:55` |
| GET | `/findings/widget/hero/posture` | `com.quilr.qb.controller.FindingsController.getHeroPostureWidget` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/FindingsController.java:61` |
| GET | `/guardrails/v1/kpi` | `com.quilr.qb.controller.GuardrailController.getLastXRequestsMetrics` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/GuardrailController.java:33` |
| GET | `/guardrails/v1/latency_info` | `com.quilr.qb.controller.GuardrailController.getEventTimelines` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/GuardrailController.java:40` |
| POST | `/guardrails/v1/requests` | `com.quilr.qb.controller.GuardrailController.getGuardrailRequests` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/GuardrailController.java:48` |
| POST | `/interactions/advanced/query` | `com.quilr.qb.controller.InteractionsController.advancedQuery` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:89` |
| GET | `/interactions/advanced/query/fields` | `com.quilr.qb.controller.InteractionsController.getSearchFields` | query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:102` |
| POST | `/interactions/advanced/query/validate` | `com.quilr.qb.controller.InteractionsController.validateSearchQuery` | JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:114` |
| POST | `/interactions/chat/query` | `com.quilr.qb.controller.InteractionsController.chatQuery` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:157` |
| POST | `/interactions/distinct/applications` | `com.quilr.qb.controller.InteractionsController.getDistinctApplications` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:137` |
| POST | `/interactions/distinct/users` | `com.quilr.qb.controller.InteractionsController.getDistinctUsers` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:145` |
| GET|POST | `/interactions/filters` | `com.quilr.qb.controller.InteractionsController.getFilterOptions` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:182` |
| GET | `/interactions/filters/source` | `com.quilr.qb.controller.InteractionsController.getSourceFilters` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:195` |
| GET | `/interactions/query` | `com.quilr.qb.controller.InteractionsController.getInteractions` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:221` |
| POST | `/interactions/simple/query` | `com.quilr.qb.controller.InteractionsController.simpleQuery` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:56` |
| POST | `/interactions/users/stats` | `com.quilr.qb.controller.InteractionsController.getUserStats` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/InteractionsController.java:170` |
| POST | `/mcp/gateway/agents/data` | `com.quilr.qb.controller.MCPGatewayController.getAgentsTableData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:52` |
| GET | `/mcp/gateway/kpi` | `com.quilr.qb.controller.MCPGatewayController.getLastXRequestsMetrics` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:32` |
| GET | `/mcp/gateway/latency/trends` | `com.quilr.qb.controller.MCPGatewayController.getLatencyTrends` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:60` |
| POST | `/mcp/gateway/table/data` | `com.quilr.qb.controller.MCPGatewayController.getFindingsTableData` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:39` |
| GET | `/nonaiapps/v1/table/data` | `com.quilr.qb.controller.NonAIAppsController.getTableData` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/NonAIAppsController.java:23` |
| GET | `/qb/aipages/aggscheduled` | `com.quilr.qb.controller.WidgetsController.executeScheduledQueries` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/WidgetsController.java:69` |
| GET | `/qb/health` | `com.quilr.qb.controller.WidgetsController.health` | No annotated request parameter | No method permission annotation | `src/main/java/com/quilr/qb/controller/WidgetsController.java:31` |
| GET | `/qb/query` | `com.quilr.qb.controller.WidgetsController.getDashboardResults` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/WidgetsController.java:45` |
| GET | `/quilly/interactions/coach/summaries` | `com.quilr.qb.controller.QuillyInteractionsController.coachSummaries` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:140` |
| GET | `/quilly/interactions/coach/summaries/drilldown` | `com.quilr.qb.controller.QuillyInteractionsController.coachSummariesDrilldown` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:162` |
| GET | `/quilly/interactions/findings/summaries` | `com.quilr.qb.controller.QuillyInteractionsController.findingSummaries` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:98` |
| GET | `/quilly/interactions/findings/summaries/drilldown` | `com.quilr.qb.controller.QuillyInteractionsController.findingsSummariesDrilldown` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:120` |
| GET | `/quilly/interactions/query/withfindings` | `com.quilr.qb.controller.QuillyInteractionsController.query` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:48` |
| GET | `/quilly/interactions/query/withoutfindings` | `com.quilr.qb.controller.QuillyInteractionsController.queryByUser` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:70` |
| GET | `/quilly/interactions/user/summaries` | `com.quilr.qb.controller.QuillyInteractionsController.userSummaries` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:181` |
| GET | `/quilly/interactions/user/summaries/drilldown` | `com.quilr.qb.controller.QuillyInteractionsController.userSummariesDrilldown` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:203` |
| GET | `/quilly/interactions/users` | `com.quilr.qb.controller.QuillyInteractionsController.distinctUsers` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:223` |
| GET | `/redteaming/v1/dashboard/stats` | `com.quilr.qb.redteam.controller.RedTeamController.getDashboardTotalCounts` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:90` |
| GET | `/redteaming/v1/heatmap/category_failures` | `com.quilr.qb.redteam.controller.RedTeamController.getHeatMapFailuresPerCategory` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:71` |
| GET | `/redteaming/v1/heatmap/technique_family` | `com.quilr.qb.redteam.controller.RedTeamController.getHeatMapFailuresPerCategory` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:81` |
| GET | `/redteaming/v1/results` | `com.quilr.qb.redteam.controller.RedTeamController.getRunDetails` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:44` |
| GET | `/redteaming/v1/run/category_failures` | `com.quilr.qb.redteam.controller.RedTeamController.getRunFailuresPerCategory` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:61` |
| GET | `/redteaming/v1/runs/summary` | `com.quilr.qb.redteam.controller.RedTeamController.getRunSummaries` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:34` |
| POST | `/status-events/drilldown` | `com.quilr.qb.controller.StatusEventController.getDrilldown` | HTTP header input; JSON/body input; Jakarta Bean Validation requested | No method permission annotation | `src/main/java/com/quilr/qb/controller/StatusEventController.java:49` |
| GET | `/status-events/drilldown/filters` | `com.quilr.qb.controller.StatusEventController.getDrilldownFilterValues` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/StatusEventController.java:83` |
| GET | `/status-events/interactions/{contextId}` | `com.quilr.qb.controller.StatusEventController.getInteraction` | HTTP header input; path parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/StatusEventController.java:60` |
| POST | `/status-events/resolve` | `com.quilr.qb.controller.StatusEventController.resolveFindings` | HTTP header input; JSON/body input; Jakarta Bean Validation requested | No method permission annotation | `src/main/java/com/quilr/qb/controller/StatusEventController.java:98` |
| POST | `/status-events/summary` | `com.quilr.qb.controller.StatusEventController.getSummary` | JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/StatusEventController.java:35` |
| GET | `/status-events/summary/filters` | `com.quilr.qb.controller.StatusEventController.getSummaryFilterValues` | query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/StatusEventController.java:71` |
| POST | `/sync/endpoint/app/process` | `com.quilr.qb.controller.GrapDBSyncController.syncLastUpdatedUsers` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/GrapDBSyncController.java:27` |
| GET | `/userappapproval/app/stats` | `com.quilr.qb.controller.UserAppApprovalController.getAppStats` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:66` |
| GET | `/userappapproval/cache` | `com.quilr.qb.controller.UserAppApprovalController.getCachedApproval` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:82` |
| POST | `/userappapproval/table/data` | `com.quilr.qb.controller.UserAppApprovalController.getTableData` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:25` |
| GET | `/userappapproval/tenant/app/stats` | `com.quilr.qb.controller.UserAppApprovalController.getTenantAppStats` | HTTP header input; query parameter input | No method permission annotation | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:74` |
| POST | `/userappapproval/tenant/apps` | `com.quilr.qb.controller.UserAppApprovalController.getTenantApps` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:54` |
| POST | `/userappapproval/update` | `com.quilr.qb.controller.UserAppApprovalController.updateApprovals` | HTTP header input; JSON/body input | `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "USER", scope = "UPDATE")` | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:33` |
| POST | `/userappapproval/user/apps` | `com.quilr.qb.controller.UserAppApprovalController.getUserApps` | HTTP header input; query parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:42` |
| GET | `/v1/audit/logs/{correlationId}/snapshots` | `com.quilr.qb.audit.controller.AuditLogController.getSnapshots` | HTTP header input; query parameter input; path parameter input | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/AuditLogController.java:38` |
| POST | `/v1/audit/logs/search` | `com.quilr.qb.audit.controller.AuditLogController.searchAuditLogs` | HTTP header input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/AuditLogController.java:27` |
| GET | `/v1/audit/master-codes` | `com.quilr.qb.audit.controller.MasterCodeController.getAll` | No annotated request parameter | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:26` |
| POST | `/v1/audit/master-codes` | `com.quilr.qb.audit.controller.MasterCodeController.create` | JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:42` |
| DELETE | `/v1/audit/master-codes/{eventCode}` | `com.quilr.qb.audit.controller.MasterCodeController.delete` | path parameter input | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:60` |
| GET | `/v1/audit/master-codes/{eventCode}` | `com.quilr.qb.audit.controller.MasterCodeController.getByEventCode` | path parameter input | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:34` |
| PUT | `/v1/audit/master-codes/{eventCode}` | `com.quilr.qb.audit.controller.MasterCodeController.update` | path parameter input; JSON/body input | No method permission annotation | `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:50` |
| POST | `/whitelisting/compromised-password/{approve}` | `com.quilr.qb.controller.WhitelistingController.whitelistCompromisedPassword` | HTTP header input; path parameter input; JSON/body input | `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")` | `src/main/java/com/quilr/qb/controller/WhitelistingController.java:27` |
| POST | `/whitelisting/cred-shared/{approve}` | `com.quilr.qb.controller.WhitelistingController.whitelistCredShared` | HTTP header input; path parameter input; JSON/body input | `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")` | `src/main/java/com/quilr/qb/controller/WhitelistingController.java:51` |
| POST | `/whitelisting/password-reuse/{approve}` | `com.quilr.qb.controller.WhitelistingController.whitelistPasswordReuse` | HTTP header input; path parameter input; JSON/body input | `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")` | `src/main/java/com/quilr/qb/controller/WhitelistingController.java:63` |
| POST | `/whitelisting/weak-password/{approve}` | `com.quilr.qb.controller.WhitelistingController.whitelistWeakPassword` | HTTP header input; path parameter input; JSON/body input | `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")` | `src/main/java/com/quilr/qb/controller/WhitelistingController.java:39` |

## Detailed operations

## `com.quilr.qb.aiassets.controller.AIAssetController`

**Location:** `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java`  
**Mapped operations:** 4

### `POST /ai-assets/v1/assets/list`

**Implementation:** `com.quilr.qb.aiassets.controller.AIAssetController.listAssets`  
**Location:** `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:29`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ResponseEntity<PaginatedResponse<AssetDto>> listAssets( @RequestBody(required = false) SearchAndFilterDto searchDto, @RequestHeader(value = HeaderConstants.TENANT) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ResponseEntity<PaginatedResponse<AssetDto>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAssetServiceIntf.getAssets(subscriberId, tenant, searchDto)`
2. `ResponseEntity.ok(page)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } com.quilr.qb.common.PaginatedResponse<AssetDto> page = aiAssetServiceIntf.getAssets(subscriberId, tenant, searchDto); return ResponseEntity.ok(page); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /ai-assets/v1/widget`

**Implementation:** `com.quilr.qb.aiassets.controller.AIAssetController.getAssetMetrics`  
**Location:** `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:44`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ResponseEntity<WidgetSummaryResponse> getAssetMetrics( @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ResponseEntity<WidgetSummaryResponse>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAssetServiceIntf.getAIAssetsWidget(subscriberId, tenant)`
2. `ResponseEntity.ok(widget)`

Compact verified controller body: `{ WidgetSummaryResponse widget = aiAssetServiceIntf.getAIAssetsWidget(subscriberId, tenant); return ResponseEntity.ok(widget); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /ai-assets/v1/ai-adoption-trend`

**Implementation:** `com.quilr.qb.aiassets.controller.AIAssetController.getAIAdoptionTrend`  
**Location:** `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:55`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ResponseEntity<List<AIAdoptionTrend>> getAIAdoptionTrend( @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ResponseEntity<List<AIAdoptionTrend>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAssetServiceIntf.getAIAdoptionTrend(subscriberId, tenant)`
2. `ResponseEntity.ok(trend)`

Compact verified controller body: `{ List<AIAdoptionTrend> trend = aiAssetServiceIntf.getAIAdoptionTrend(subscriberId, tenant); return ResponseEntity.ok(trend); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /ai-assets/v1/assets/distribution`

**Implementation:** `com.quilr.qb.aiassets.controller.AIAssetController.getAssetTypeDistribution`  
**Location:** `src/main/java/com/quilr/qb/aiassets/controller/AIAssetController.java:66`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ResponseEntity<List<AssetTypeDistribution>> getAssetTypeDistribution( @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ResponseEntity<List<AssetTypeDistribution>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAssetServiceIntf.getAssetTypeDistribution(subscriberId, tenant)`
2. `ResponseEntity.ok(dist)`

Compact verified controller body: `{ List<AssetTypeDistribution> dist = aiAssetServiceIntf.getAssetTypeDistribution(subscriberId, tenant); return ResponseEntity.ok(dist); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.audit.controller.AuditLogController`

**Location:** `src/main/java/com/quilr/qb/audit/controller/AuditLogController.java`  
**Mapped operations:** 2

### `POST /v1/audit/logs/search`

**Implementation:** `com.quilr.qb.audit.controller.AuditLogController.searchAuditLogs`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/AuditLogController.java:27`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> searchAuditLogs( @RequestHeader(HeaderConstants.TENANT) String tenant, @RequestBody(required = false) AuditLogSearchRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `auditLogService.getAuditLogs(tenant, request)`

Compact verified controller body: `{ if (request == null) { request = new AuditLogSearchRequest(); } return auditLogService.getAuditLogs(tenant, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /v1/audit/logs/{correlationId}/snapshots`

**Implementation:** `com.quilr.qb.audit.controller.AuditLogController.getSnapshots`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/AuditLogController.java:38`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getSnapshots( @RequestHeader(HeaderConstants.TENANT) String tenant, @PathVariable(name="correlationId") String correlationId, @RequestParam(name="action") String action)`

Verified input surfaces: HTTP header input; query parameter input; path parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `auditLogService.getSnapshots(tenant, correlationId, action)`

Compact verified controller body: `{ return auditLogService.getSnapshots(tenant, correlationId, action); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.audit.controller.MasterCodeController`

**Location:** `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java`  
**Mapped operations:** 5

### `GET /v1/audit/master-codes`

**Implementation:** `com.quilr.qb.audit.controller.MasterCodeController.getAll`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:26`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<MasterCodeResponse>> getAll()`

Verified input surfaces: No annotated request parameter. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<MasterCodeResponse>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `response.setResponse(masterCodeService.getAll())`
2. `masterCodeService.getAll()`

Compact verified controller body: `{ ServiceResponse<List<MasterCodeResponse>> response = new ServiceResponse<>(); response.setResponse(masterCodeService.getAll()); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /v1/audit/master-codes/{eventCode}`

**Implementation:** `com.quilr.qb.audit.controller.MasterCodeController.getByEventCode`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:34`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<MasterCodeResponse> getByEventCode(@PathVariable String eventCode)`

Verified input surfaces: path parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<MasterCodeResponse>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `response.setResponse(masterCodeService.getByEventCode(eventCode))`
2. `masterCodeService.getByEventCode(eventCode)`

Compact verified controller body: `{ ServiceResponse<MasterCodeResponse> response = new ServiceResponse<>(); response.setResponse(masterCodeService.getByEventCode(eventCode)); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /v1/audit/master-codes`

**Implementation:** `com.quilr.qb.audit.controller.MasterCodeController.create`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:42`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<MasterCodeResponse> create(@RequestBody MasterCodeRequest request)`

Verified input surfaces: JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<MasterCodeResponse>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `response.setResponse(masterCodeService.create(request))`
2. `masterCodeService.create(request)`

Compact verified controller body: `{ ServiceResponse<MasterCodeResponse> response = new ServiceResponse<>(); response.setResponse(masterCodeService.create(request)); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `PUT /v1/audit/master-codes/{eventCode}`

**Implementation:** `com.quilr.qb.audit.controller.MasterCodeController.update`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:50`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<MasterCodeResponse> update( @PathVariable String eventCode, @RequestBody MasterCodeRequest request)`

Verified input surfaces: path parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<MasterCodeResponse>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `response.setResponse(masterCodeService.update(eventCode, request))`
2. `masterCodeService.update(eventCode, request)`

Compact verified controller body: `{ ServiceResponse<MasterCodeResponse> response = new ServiceResponse<>(); response.setResponse(masterCodeService.update(eventCode, request)); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `DELETE /v1/audit/master-codes/{eventCode}`

**Implementation:** `com.quilr.qb.audit.controller.MasterCodeController.delete`  
**Location:** `src/main/java/com/quilr/qb/audit/controller/MasterCodeController.java:60`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Void> delete(@PathVariable String eventCode)`

Verified input surfaces: path parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Void>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `masterCodeService.delete(eventCode)`
2. `response.setMessage("Master code deleted: " + eventCode)`

Compact verified controller body: `{ masterCodeService.delete(eventCode); ServiceResponse<Void> response = new ServiceResponse<>(); response.setMessage("Master code deleted: " + eventCode); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.AIAccountsController`

**Location:** `src/main/java/com/quilr/qb/controller/AIAccountsController.java`  
**Mapped operations:** 3

### `GET /aiaccounts/query`

**Implementation:** `com.quilr.qb.controller.AIAccountsController.getAIAppsData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAccountsController.java:27`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,Object>> getAIAppsData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAccountsService.getAIAccountsKPICarousalData(headers, requestParams)`

Compact verified controller body: `{ ServiceResponse<Map<String,Object>> response = aiAccountsService.getAIAccountsKPICarousalData(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiaccounts/table/data`

**Implementation:** `com.quilr.qb.controller.AIAccountsController.getTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAccountsController.java:34`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTableData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAccountsService.getGrpTableData(headers, requestParams)`

Compact verified controller body: `{ return aiAccountsService.getGrpTableData(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiaccounts/table/filter/users`

**Implementation:** `com.quilr.qb.controller.AIAccountsController.getTableFilterUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAccountsController.java:39`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTableFilterUsers(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAccountsService.getTableFilterUsers(headers, requestParams)`

Compact verified controller body: `{ return aiAccountsService.getTableFilterUsers(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.AIAppsController`

**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java`  
**Mapped operations:** 8

### `GET /aiapps/query`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getAIAppsData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:34`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,Object>> getAIAppsData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.getAIAppKPICarousalData(headers, requestParams)`

Compact verified controller body: `{ ServiceResponse<Map<String,Object>> response = aiAppsService.getAIAppKPICarousalData(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiapps/table/data`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:41`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTableData( @RequestHeader Map<String, String> headers, @RequestParam(value = "groupby", required = false) String groupBy, @RequestBody(required = false) SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.getGrpTableData(headers, groupBy, searchDto)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } return aiAppsService.getGrpTableData(headers, groupBy, searchDto); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiapps/category_info`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getAppCategoryDetails`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:53`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,Object>> getAppCategoryDetails(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `requestParams.getOrDefault("app_name", "")`
2. `aiAppsService.getAppCategoryDetails(appName)`

Compact verified controller body: `{ String appName = requestParams.getOrDefault("app_name", ""); ServiceResponse<Map<String,Object>> response = aiAppsService.getAppCategoryDetails(appName); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiapps/whitelisted_behaviors`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getAppWhitelistedBehaviors`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:61`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getAppWhitelistedBehaviors( @RequestHeader(HeaderConstants.TENANT) String tenant, @RequestHeader(HeaderConstants.SUBSCRIBER_ID) String subscriberId, @RequestParam("app_id") String appId)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.getAppWhitelistedBehaviors(tenant, subscriberId, appId)`

Compact verified controller body: `{ return aiAppsService.getAppWhitelistedBehaviors(tenant, subscriberId, appId); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiapps/app_settings/update`

**Implementation:** `com.quilr.qb.controller.AIAppsController.updateAppTenantSettings`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:70`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "UPDATE")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> updateAppTenantSettings( @RequestHeader Map<String, String> headers, @RequestBody Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.updateAppTenantSettings(headers, requestBody)`

Compact verified controller body: `{ return aiAppsService.updateAppTenantSettings(headers, requestBody); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiapps/disinct/categories`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getDistinctAppCategories`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:80`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getDistinctAppCategories(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.getDistinctAppCategories()`

Compact verified controller body: `{ return aiAppsService.getDistinctAppCategories(); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiapps/app_details/id`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getAppDetailsByAppId`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:86`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getAppDetailsByAppId(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.getAppDetailsByAppId(requestParams)`

Compact verified controller body: `{ return aiAppsService.getAppDetailsByAppId(requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiapps/visitors`

**Implementation:** `com.quilr.qb.controller.AIAppsController.getAppVisitors`  
**Location:** `src/main/java/com/quilr/qb/controller/AIAppsController.java:92`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<PaginatedResponse<AppVisitorResponse>> getAppVisitors( @RequestHeader(HeaderConstants.TENANT) String tenant, @RequestHeader(HeaderConstants.SUBSCRIBER_ID) String subscriberId, @RequestParam("app_id") String appId, @Valid @RequestBody(required = false) AppVisitorsRequest request)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input; Jakarta Bean Validation requested. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<PaginatedResponse<AppVisitorResponse>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsService.getAppVisitors(subscriberId, tenant, appId, request)`

Compact verified controller body: `{ return aiAppsService.getAppVisitors(subscriberId, tenant, appId, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.AIConversationsController`

**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java`  
**Mapped operations:** 7

### `GET /aiconversations/query`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.getConversations`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:39`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getConversations(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersConversationsProcessor.getAIRawConversionResults(headers,requestParams)`

Compact verified controller body: `{ return aiUsersConversationsProcessor.getAIRawConversionResults(headers,requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiconversations/ids`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.getConversationIds`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:44`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, List<Map<String, Object>>>> getConversationIds(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, List<Map<String, Object>>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersConversationsProcessor.getAIConversationIds(headers,requestParams)`

Compact verified controller body: `{ return aiUsersConversationsProcessor.getAIConversationIds(headers,requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiconversations/detections`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.getAIDetectionsView`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:50`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getAIDetectionsView(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersConversationsProcessor.getAIDetectionsView(headers,requestParams)`

Compact verified controller body: `{ return aiUsersConversationsProcessor.getAIDetectionsView(headers,requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiconversations/unmasked`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.getUnMaskedData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:56`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "AI_USAGE", subResource = "CONVERSATION", scope = "READ")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getUnMaskedData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams, @RequestBody UnMaskedRequest unMaskedRequest)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiConversationsService.getUnMaskedData(headers,requestParams, unMaskedRequest)`

Compact verified controller body: `{ return aiConversationsService.getUnMaskedData(headers,requestParams, unMaskedRequest); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `PUT /aiconversations/filters/update`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.updateAIConvFilterByKey`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:63`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Boolean> updateAIConvFilterByKey(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams, @RequestBody AIConvFilterRequest payload)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Boolean>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiConversationsService.updateAIConvFilterByKey(headers, requestParams, payload)`

Compact verified controller body: `{ ServiceResponse<Boolean> response = aiConversationsService.updateAIConvFilterByKey(headers, requestParams, payload); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiconversations/filters/query`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.getByAIConvFiltersKey`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:70`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<AiConvFilter> getByAIConvFiltersKey(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<AiConvFilter>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiConversationsService.getByAIConvFiltersKey(headers, requestParams)`

Compact verified controller body: `{ return aiConversationsService.getByAIConvFiltersKey(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiconversations/filters/app/accounts`

**Implementation:** `com.quilr.qb.controller.AIConversationsController.getFiltersByAccounts`  
**Location:** `src/main/java/com/quilr/qb/controller/AIConversationsController.java:77`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFiltersByAccounts(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiAppsConversationsProcessor.getFiltersByAccounts(headers, requestParams)`

Compact verified controller body: `{ return aiAppsConversationsProcessor.getFiltersByAccounts(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.AIPromptsFilterController`

**Location:** `src/main/java/com/quilr/qb/controller/AIPromptsFilterController.java`  
**Mapped operations:** 2

### `POST /aiconversations/filters/users`

**Implementation:** `com.quilr.qb.controller.AIPromptsFilterController.getUserAppInteractions`  
**Location:** `src/main/java/com/quilr/qb/controller/AIPromptsFilterController.java:28`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getUserAppInteractions( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams, @RequestBody(required = false) Map<String, String> requestBody)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `requestParams.putAll(requestBody)`
2. `aiPromptsFilterProcessor.getAIUserPromptFilters(headers, requestParams)`

Compact verified controller body: `{ if (requestBody != null) { requestParams.putAll(requestBody); } return aiPromptsFilterProcessor.getAIUserPromptFilters(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiconversations/filters/apps`

**Implementation:** `com.quilr.qb.controller.AIPromptsFilterController.getFiltersForUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/AIPromptsFilterController.java:40`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFiltersForUsers( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams, @RequestBody(required = false) Map<String, String> requestBody)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `requestParams.putAll(requestBody)`
2. `aiPromptsFilterProcessor.getAIAppPromptFilters(headers, requestParams)`

Compact verified controller body: `{ if (requestBody != null) { requestParams.putAll(requestBody); } return aiPromptsFilterProcessor.getAIAppPromptFilters(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.AIUsersController`

**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java`  
**Mapped operations:** 20

### `GET /aiusers/query`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getAIUsersResults`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:28`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,Object>> getAIUsersResults(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getCarousalData(headers, requestParams)`

Compact verified controller body: `{ ServiceResponse<Map<String,Object>> response = aiUsersService.getCarousalData(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiusers/violation/top_departments`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getTopDepartmentsByViolations`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:35`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTopDepartmentsByViolations(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getTopDepartmentsByViolations(headers, requestParams)`

Compact verified controller body: `{ return aiUsersService.getTopDepartmentsByViolations(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/table/data`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:41`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTableData( @RequestHeader Map<String, String> headers, @RequestParam(value = "groupby", required = false) String groupBy, @RequestBody(required = false) SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getGrpTableData(headers, groupBy, searchDto)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } return aiUsersService.getGrpTableData(headers, groupBy, searchDto); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiusers/table/filters`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getTableFilters`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:53`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getTableFilters(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getGrpTableFilters(headers, requestParams)`

Compact verified controller body: `{ return aiUsersService.getGrpTableFilters(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiusers/redis/keys`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getKeysForNameSpace`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:76`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<String>> getKeysForNameSpace(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<String>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getRedisKeysForNameSpace(headers, requestParams)`

Compact verified controller body: `{ return aiUsersService.getRedisKeysForNameSpace(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiusers/redis/delete`

**Implementation:** `com.quilr.qb.controller.AIUsersController.deleteRedisKeysForNameSpace`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:83`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Integer> deleteRedisKeysForNameSpace(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Integer>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.deleteRedisKeysForNameSpace(headers, requestParams)`

Compact verified controller body: `{ return aiUsersService.deleteRedisKeysForNameSpace(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/appdata`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncAppData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:91`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> syncAppData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncAppData(headers, requestParams)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.syncAppData(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/appdata/name`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getAppDetailsByName`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:98`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> getAppDetailsByName(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getAppDetailsByName(headers, requestParams)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.getAppDetailsByName(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/appdata/appids`

**Implementation:** `com.quilr.qb.controller.AIUsersController.synchAppDetailsByAppIds`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:105`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> synchAppDetailsByAppIds(@RequestHeader Map<String, String> headers, @RequestBody List<String> appIds)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getAppDetailsByAppIds(headers, appIds)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.getAppDetailsByAppIds(headers, appIds); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/apptenant/settings`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncTenantAppSettings`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:112`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> syncTenantAppSettings(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncAppTenantData(headers, requestParams)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.syncAppTenantData(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/appdata/lastupdated`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncLastUpdatedAppData`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:119`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> syncLastUpdatedAppData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncLastUpdatedAppData(requestParams)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.syncLastUpdatedAppData(requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/apptenant/settings/lastupdated`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncLastUpdatedTenantAppSettings`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:126`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,Object>> syncLastUpdatedTenantAppSettings(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncLastUpdatedAppTenantData(requestParams)`

Compact verified controller body: `{ ServiceResponse<Map<String,Object>> response = aiUsersService.syncLastUpdatedAppTenantData(requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/apptenant/settings/lastupdated/bulk`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncLastUpdatedTenantAppSettingsBulk`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:133`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,Object>> syncLastUpdatedTenantAppSettingsBulk(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncLastUpdatedAppTenantDataBulk(requestParams)`

Compact verified controller body: `{ ServiceResponse<Map<String,Object>> response = aiUsersService.syncLastUpdatedAppTenantDataBulk(requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/users`

**Implementation:** `com.quilr.qb.controller.AIUsersController.indexAllUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:140`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> indexAllUsers(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.indexAllUsers()`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.indexAllUsers(); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/users/byuserid`

**Implementation:** `com.quilr.qb.controller.AIUsersController.updateUserByEmail`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:147`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> updateUserByEmail(@RequestHeader Map<String, String> headers, @RequestBody Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.updateUserByUserIds(headers, requestBody)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.updateUserByUserIds(headers, requestBody); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/users/lastupdated`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncLastUpdatedUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:155`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> syncLastUpdatedUsers(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncLastUpdatedUsersData(requestParams)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.syncLastUpdatedUsersData(requestParams); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/smart-groups`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncSmartGroups`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:162`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> syncSmartGroups(@RequestHeader Map<String, String> headers, @RequestBody Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncSmartGroups(headers, requestBody)`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.syncSmartGroups(headers, requestBody); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/backfill/smart-groups`

**Implementation:** `com.quilr.qb.controller.AIUsersController.backFillSmartGroups`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:169`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> backFillSmartGroups(@RequestHeader Map<String, String> headers)`

Verified input surfaces: HTTP header input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.backFillSmartGroups()`

Compact verified controller body: `{ ServiceResponse<Object> response = aiUsersService.backFillSmartGroups(); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /aiusers/dwh/sync/app-admin-users`

**Implementation:** `com.quilr.qb.controller.AIUsersController.syncAppAdminUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:176`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> syncAppAdminUsers(@RequestHeader Map<String, String> headers, @RequestBody Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.syncAppAdminUsers(headers, requestBody)`

Compact verified controller body: `{ return aiUsersService.syncAppAdminUsers(headers, requestBody); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /aiusers/smartgroups`

**Implementation:** `com.quilr.qb.controller.AIUsersController.getSmartGroups`  
**Location:** `src/main/java/com/quilr/qb/controller/AIUsersController.java:182`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getSmartGroups( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `aiUsersService.getSmartGroups(headers, requestParams)`

Compact verified controller body: `{ return aiUsersService.getSmartGroups(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.ClickhouseOpsController`

**Location:** `src/main/java/com/quilr/qb/controller/ClickhouseOpsController.java`  
**Mapped operations:** 2

### `POST /clickhouse/ops/query`

**Implementation:** `com.quilr.qb.controller.ClickhouseOpsController.executeQuery`  
**Location:** `src/main/java/com/quilr/qb/controller/ClickhouseOpsController.java:29`  
**Flags:** OpenAPI-hidden  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> executeQuery( @RequestHeader Map<String, String> headers, @RequestBody Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `clickhouseOpsProcessor.executeQuery(headers, requestBody)`

Compact verified controller body: `{ return clickhouseOpsProcessor.executeQuery(headers, requestBody); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /clickhouse/ops/update`

**Implementation:** `com.quilr.qb.controller.ClickhouseOpsController.executeUpdate`  
**Location:** `src/main/java/com/quilr/qb/controller/ClickhouseOpsController.java:38`  
**Flags:** OpenAPI-hidden  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> executeUpdate( @RequestHeader Map<String, String> headers, @RequestBody Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `clickhouseOpsProcessor.executeUpdate(headers, requestBody)`

Compact verified controller body: `{ return clickhouseOpsProcessor.executeUpdate(headers, requestBody); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.ComplianceController`

**Location:** `src/main/java/com/quilr/qb/controller/ComplianceController.java`  
**Mapped operations:** 3

### `GET /compliance/table`

**Implementation:** `com.quilr.qb.controller.ComplianceController.getComplainceRecords`  
**Location:** `src/main/java/com/quilr/qb/controller/ComplianceController.java:29`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getComplainceRecords(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `requestParams.containsKey("app_name")`
2. `requestParams.get("app_name")`
3. `requestParams.get("app_name").isBlank()`
4. `complianceTableService.getComplianceRecords(headers, requestParams)`

Compact verified controller body: `{ if (!requestParams.containsKey("app_name") || requestParams.get("app_name") == null || requestParams.get("app_name").isBlank()) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "app_name parameter is required"); } ServiceResponse<List<Map<String, Object>>> response = complianceTableService.getComplianceRecords(headers, requestParams); return response; }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /compliance/widget`

**Implementation:** `com.quilr.qb.controller.ComplianceController.getComplianceWidget`  
**Location:** `src/main/java/com/quilr/qb/controller/ComplianceController.java:38`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getComplianceWidget(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `complianceService.getComplianceWidget(requestParams)`

Compact verified controller body: `{ return complianceService.getComplianceWidget(requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /compliance/drilldown`

**Implementation:** `com.quilr.qb.controller.ComplianceController.getComplianceDrilldown`  
**Location:** `src/main/java/com/quilr/qb/controller/ComplianceController.java:43`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getComplianceDrilldown(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams, @RequestBody ComplianceDDDTO complianceDDDTO )`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `complianceService.getComplianceDrilldown(headers, requestParams, complianceDDDTO)`

Compact verified controller body: `{ return complianceService.getComplianceDrilldown(headers, requestParams, complianceDDDTO); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.DWHController`

**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java`  
**Mapped operations:** 9

### `GET /dwh/health`

**Implementation:** `com.quilr.qb.controller.DWHController.health`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:41`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ResponseEntity<String> health()`

Verified input surfaces: No annotated request parameter. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ResponseEntity<String>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info("Health Received Request....")`

Compact verified controller body: `{ log.info("Health Received Request...."); return new ResponseEntity<>( "RUNNING", HttpStatus.OK); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/config/redis`

**Implementation:** `com.quilr.qb.controller.DWHController.getRedisConfig`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:48`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> getRedisConfig(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(redisConfig)`

Compact verified controller body: `{ final ServiceResponse<Object> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(redisConfig); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/config/ch`

**Implementation:** `com.quilr.qb.controller.DWHController.getClickhouseConfig`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:56`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> getClickhouseConfig(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(dwhConfig)`

Compact verified controller body: `{ final ServiceResponse<Object> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(dwhConfig); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/config/graph`

**Implementation:** `com.quilr.qb.controller.DWHController.getGraphConfig`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:64`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> getGraphConfig(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(graphConfig)`

Compact verified controller body: `{ final ServiceResponse<Object> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(graphConfig); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/db_info`

**Implementation:** `com.quilr.qb.controller.DWHController.getDBInfo`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:72`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<DBConfig> getDBInfo()`

Verified input surfaces: No annotated request parameter. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<DBConfig>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(dbConfig)`

Compact verified controller body: `{ final ServiceResponse<DBConfig> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(dbConfig); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/memory`

**Implementation:** `com.quilr.qb.controller.DWHController.getMemoryInfo`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:80`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,String>> getMemoryInfo(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,String>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(resourceUtil.getMemoryInfo())`
2. `resourceUtil.getMemoryInfo()`

Compact verified controller body: `{ final ServiceResponse<Map<String,String>> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(resourceUtil.getMemoryInfo()); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/cpu`

**Implementation:** `com.quilr.qb.controller.DWHController.getCPUInfo`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:88`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,String>> getCPUInfo(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,String>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(resourceUtil.getProcessCpuLoad())`
2. `resourceUtil.getProcessCpuLoad()`

Compact verified controller body: `{ final ServiceResponse<Map<String,String>> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(resourceUtil.getProcessCpuLoad()); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/allresources`

**Implementation:** `com.quilr.qb.controller.DWHController.getAllResources`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:96`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String,String>> getAllResources(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String,String>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(resourceUtil.getAllContainerInfo())`
2. `resourceUtil.getAllContainerInfo()`

Compact verified controller body: `{ final ServiceResponse<Map<String,String>> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(resourceUtil.getAllContainerInfo()); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /dwh/docker`

**Implementation:** `com.quilr.qb.controller.DWHController.getAllDockerInfo`  
**Location:** `src/main/java/com/quilr/qb/controller/DWHController.java:104`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getAllDockerInfo(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `serviceResponse.setResponse(resourceUtil.getAllDockerInfo())`
2. `resourceUtil.getAllDockerInfo()`

Compact verified controller body: `{ final ServiceResponse<Map<String,Object>> serviceResponse = new ServiceResponse<>(); serviceResponse.setResponse(resourceUtil.getAllDockerInfo()); return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.DeviceInfoController`

**Location:** `src/main/java/com/quilr/qb/controller/DeviceInfoController.java`  
**Mapped operations:** 1

### `GET /device/user/info`

**Implementation:** `com.quilr.qb.controller.DeviceInfoController.getDeviceUserInfo`  
**Location:** `src/main/java/com/quilr/qb/controller/DeviceInfoController.java:26`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getDeviceUserInfo( @RequestHeader Map<String, String> headers, @RequestParam("device_id") String deviceId)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.get("subscriberid")`
2. `headers.get("tenant")`
3. `subscriberId.isBlank()`
4. `tenantId.isBlank()`
5. `error.setStatus(ServiceResponse.STATUS.ERROR)`
6. `error.setMessage("Missing required headers: subscriberid and tenant")`
7. `log.info("Fetching device user info — deviceId={}, subscriberId={}, tenantId={}", deviceId, subscriberId, tenantId)`
8. `deviceInfoService.getDeviceUserInfo(subscriberId, tenantId, deviceId)`

Compact verified controller body: `{ String subscriberId = headers.get("subscriberid"); String tenantId = headers.get("tenant"); if (subscriberId == null || subscriberId.isBlank() || tenantId == null || tenantId.isBlank()) { ServiceResponse<List<Map<String, Object>>> error = new ServiceResponse<>(); error.setStatus(ServiceResponse.STATUS.ERROR); error.setMessage("Missing required headers: subscriberid and tenant"); return error; } log.info("Fetching device user info — deviceId={}, subscriberId={}, tenantId={}", deviceId, subscriberId, tenantId); return deviceInfoService.getDeviceUserInfo(subscriberId, tenantId, deviceId); }`

#### Failure behavior and tests

Verified: At least one validation branch returns a `ServiceResponse` marked `ERROR`.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.EndpointController`

**Location:** `src/main/java/com/quilr/qb/controller/EndpointController.java`  
**Mapped operations:** 3

### `GET /endpoint/sync/all`

**Implementation:** `com.quilr.qb.controller.EndpointController.syncAll`  
**Location:** `src/main/java/com/quilr/qb/controller/EndpointController.java:26`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> syncAll()`

Verified input surfaces: No annotated request parameter. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `endpointSyncService.syncAll()`

Compact verified controller body: `{ return endpointSyncService.syncAll(); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /endpoint/sync/tenant`

**Implementation:** `com.quilr.qb.controller.EndpointController.syncByTenant`  
**Location:** `src/main/java/com/quilr/qb/controller/EndpointController.java:32`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> syncByTenant( @RequestHeader(HeaderConstants.TENANT) String tenant)`

Verified input surfaces: HTTP header input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `endpointSyncService.syncByTenant(tenant)`

Compact verified controller body: `{ return endpointSyncService.syncByTenant(tenant); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /endpoint/sync/tenant/device`

**Implementation:** `com.quilr.qb.controller.EndpointController.syncByTenantAndDevice`  
**Location:** `src/main/java/com/quilr/qb/controller/EndpointController.java:39`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> syncByTenantAndDevice( @RequestHeader(HeaderConstants.TENANT) String tenant, @RequestParam("device_id") String deviceId)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `endpointSyncService.syncByTenantAndDevice(tenant, deviceId)`

Compact verified controller body: `{ return endpointSyncService.syncByTenantAndDevice(tenant, deviceId); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.ExecutiveDashboardController`

**Location:** `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java`  
**Mapped operations:** 4

### `GET /executive/dashboard/row1/deployment/info`

**Implementation:** `com.quilr.qb.controller.ExecutiveDashboardController.getRow1Stats`  
**Location:** `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:33`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getRow1Stats( @RequestHeader Map<String, String> headers, @RequestParam(value = "from_time_ms", required = false) Long fromTimeMs, @RequestParam(value = "to_time_ms", required = false) Long toTimeMs)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.get("subscriberid")`
2. `headers.get("tenant")`
3. `log.info("Executive Dashboard Row1 — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs)`
4. `executiveDashboardService.getRow1Stats(subscriberId, tenantId, fromTimeMs, toTimeMs)`

Compact verified controller body: `{ String subscriberId = headers.get("subscriberid"); // optional String tenantId = headers.get("tenant"); log.info("Executive Dashboard Row1 — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs); return executiveDashboardService.getRow1Stats(subscriberId, tenantId, fromTimeMs, toTimeMs); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /executive/dashboard/row2/action/distribution/info`

**Implementation:** `com.quilr.qb.controller.ExecutiveDashboardController.getRow2ActionDistribution`  
**Location:** `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:58`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getRow2ActionDistribution( @RequestHeader Map<String, String> headers, @RequestParam(value = "from_time_ms", required = false) Long fromTimeMs, @RequestParam(value = "to_time_ms", required = false) Long toTimeMs)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.get("subscriberid")`
2. `headers.get("tenant")`
3. `log.info("Executive Dashboard Row2 action distribution — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs)`
4. `executiveDashboardService.getRow2ActionDistribution(subscriberId, tenantId, fromTimeMs, toTimeMs)`

Compact verified controller body: `{ String subscriberId = headers.get("subscriberid"); // optional String tenantId = headers.get("tenant"); log.info("Executive Dashboard Row2 action distribution — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs); return executiveDashboardService.getRow2ActionDistribution(subscriberId, tenantId, fromTimeMs, toTimeMs); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /executive/dashboard/row3/mcp/gateway/info`

**Implementation:** `com.quilr.qb.controller.ExecutiveDashboardController.getRow3McpStats`  
**Location:** `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:82`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getRow3McpStats( @RequestHeader Map<String, String> headers, @RequestParam(value = "from_time_ms", required = false) Long fromTimeMs, @RequestParam(value = "to_time_ms", required = false) Long toTimeMs)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.get("subscriberid")`
2. `headers.get("tenant")`
3. `log.info("Executive Dashboard Row3 MCP stats — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs)`
4. `executiveDashboardService.getRow3McpStats(subscriberId, tenantId, fromTimeMs, toTimeMs)`

Compact verified controller body: `{ String subscriberId = headers.get("subscriberid"); String tenantId = headers.get("tenant"); log.info("Executive Dashboard Row3 MCP stats — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs); return executiveDashboardService.getRow3McpStats(subscriberId, tenantId, fromTimeMs, toTimeMs); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /executive/dashboard/row4/llm/gateway/info`

**Implementation:** `com.quilr.qb.controller.ExecutiveDashboardController.getRow4LlmStats`  
**Location:** `src/main/java/com/quilr/qb/controller/ExecutiveDashboardController.java:106`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getRow4LlmStats( @RequestHeader Map<String, String> headers, @RequestParam(value = "from_time_ms", required = false) Long fromTimeMs, @RequestParam(value = "to_time_ms", required = false) Long toTimeMs)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.get("subscriberid")`
2. `headers.get("tenant")`
3. `log.info("Executive Dashboard Row4 LLM stats — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs)`
4. `executiveDashboardService.getRow4LlmStats(subscriberId, tenantId, fromTimeMs, toTimeMs)`

Compact verified controller body: `{ String subscriberId = headers.get("subscriberid"); String tenantId = headers.get("tenant"); log.info("Executive Dashboard Row4 LLM stats — subscriberId={}, tenantId={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, fromTimeMs, toTimeMs); return executiveDashboardService.getRow4LlmStats(subscriberId, tenantId, fromTimeMs, toTimeMs); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.FindingsController`

**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java`  
**Mapped operations:** 13

### `GET /findings/carousal/entities`

**Implementation:** `com.quilr.qb.controller.FindingsController.getCarousalEntitiesInfo`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:39`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getCarousalEntitiesInfo(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getCarousalEntities(headers, requestParams)`

Compact verified controller body: `{ return findingsService.getCarousalEntities(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/table/posture/counts`

**Implementation:** `com.quilr.qb.controller.FindingsController.computeTableKPIPosturesCount`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:46`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> computeTableKPIPosturesCount(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.computeTableKPIPosturesCount(headers, requestParams)`

Compact verified controller body: `{ return findingsService.computeTableKPIPosturesCount(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/widget/hero/main`

**Implementation:** `com.quilr.qb.controller.FindingsController.getHeroMainWidget`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:55`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getHeroMainWidget(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getHeroMainWidget(headers,requestParams)`

Compact verified controller body: `{ return findingsService.getHeroMainWidget(headers,requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/widget/hero/posture`

**Implementation:** `com.quilr.qb.controller.FindingsController.getHeroPostureWidget`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:61`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse< Map<String, List<Map<String,Object>>> > getHeroPostureWidget(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse< Map<String, List<Map<String,Object>>> >`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getHeroPostureWidgetInfo(headers,requestParams)`

Compact verified controller body: `{ return findingsService.getHeroPostureWidgetInfo(headers,requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/carousel/outcomes-and-controls`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingsOutcomesAndControls`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:67`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getFindingsOutcomesAndControls( @RequestHeader Map<String, String> headers, @RequestParam(value = "outcomes_limit", required = false) Integer outcomesLimit, @RequestParam(value = "controls_limit", required = false) Integer controlsLimit)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getOutcomesAndTopControls(headers, outcomesLimit, controlsLimit)`

Compact verified controller body: `{ return findingsService.getOutcomesAndTopControls(headers, outcomesLimit, controlsLimit); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/carousel/sla-and-action_required`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingsSlaAndActionsRequired`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:76`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getFindingsSlaAndActionsRequired(@RequestHeader Map<String, String> headers)`

Verified input surfaces: HTTP header input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getSlaPerformanceAndActions(headers)`

Compact verified controller body: `{ return findingsService.getSlaPerformanceAndActions(headers); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/carousal/kpi_entities`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingsKpiAndDashboardData`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:82`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getFindingsKpiAndDashboardData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getKpiAndCarousalData(headers, requestParams)`

Compact verified controller body: `{ return findingsService.getKpiAndCarousalData(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/table/filters`

**Implementation:** `com.quilr.qb.controller.FindingsController.getTableFilters`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:90`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getTableFilters(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getTableFilters(headers, requestParams)`

Compact verified controller body: `{ return findingsService.getTableFilters(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /findings/table/data`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingsTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:97`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFindingsTableData( @RequestHeader Map<String, String> headers, @RequestBody(required = false) SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `System.currentTimeMillis()`
2. `log.info("getFindingsTableData START - subscriber={}, tenant={}", headers.get("subscriberid"), headers.get("tenant"))`
3. `headers.get("subscriberid")`
4. `headers.get("tenant")`
5. `findingsService.getFindingsTableData(headers, searchDto)`
6. `(response != null && response.getResponse() != null)`
7. `response.getResponse()`
8. `response.getResponse().size()`
9. `log.info("getFindingsTableData END - subscriber={}, tenant={}, findings={}, timeTakenMs={}", headers.get("subscriberid"), headers.get("tenant"), findingsCount, System.currentTimeMillis() - startMs)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } long startMs = System.currentTimeMillis(); log.info("getFindingsTableData START - subscriber={}, tenant={}", headers.get("subscriberid"), headers.get("tenant")); ServiceResponse<List<Map<String, Object>>> response = findingsService.getFindingsTableData(headers, searchDto); int findingsCount = (response != null && response.getResponse() != null) ? response.getResponse().size() : 0; log.info("getFindingsTableData END - subscriber={}, tenant={}, findings={}, timeTakenMs={}", headers.get("subscriberid"), headers.get("tenant"), findingsCount, System.currentTimeMillis() - startMs); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /findings/drilldown/related_events`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingsDrilldownData`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:119`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFindingsDrilldownData(@RequestHeader Map<String, String> headers, @RequestBody SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `response.setStatus(ServiceResponse.STATUS.ERROR)`
2. `response.setMessage("Invalid request and No body found")`
3. `findingsService.getDrilldownRelatedFindings(headers, searchDto)`

Compact verified controller body: `{ if (searchDto == null) { ServiceResponse<List<Map<String, Object>>> response = new ServiceResponse<>(); response.setStatus(ServiceResponse.STATUS.ERROR); response.setMessage("Invalid request and No body found"); return response; } return findingsService.getDrilldownRelatedFindings(headers, searchDto); }`

#### Failure behavior and tests

Verified: At least one validation branch returns a `ServiceResponse` marked `ERROR`.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/occurrence`

**Implementation:** `com.quilr.qb.controller.FindingsController.getStatusOccurrence`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:131`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getStatusOccurrence( @RequestHeader Map<String, String> headers, @RequestParam("usecase_id") String usecaseId, @RequestParam("app_name") String appName, @RequestParam("persona_email") String personaEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getStatusOccurrence(headers, usecaseId, appName, personaEmail)`

Compact verified controller body: `{ return findingsService.getStatusOccurrence(headers, usecaseId, appName, personaEmail); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/pivot`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingsKPIData`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:141`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFindingsKPIData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `requestParams.getOrDefault("pivot_by", "users")`
2. `pivotBy.trim()`
3. `pivotProcessor.getPivotByUserCounts(headers, requestParams)`
4. `pivotProcessor.getPivotByAppCounts(headers, requestParams)`
5. `pivotProcessor.getPivotByControlCounts(headers, requestParams)`

Compact verified controller body: `{ String pivotBy = requestParams.getOrDefault("pivot_by", "users"); switch (pivotBy.trim()) { case "users": return pivotProcessor.getPivotByUserCounts(headers, requestParams); case "apps": return pivotProcessor.getPivotByAppCounts(headers, requestParams); case "controls": return pivotProcessor.getPivotByControlCounts(headers, requestParams); default: return pivotProcessor.getPivotByUserCounts(headers, requestParams); } }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /findings/interactions`

**Implementation:** `com.quilr.qb.controller.FindingsController.getFindingInteractions`  
**Location:** `src/main/java/com/quilr/qb/controller/FindingsController.java:157`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFindingInteractions( @RequestHeader Map<String, String> headers, @RequestParam("finding_id") String findingId)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `findingsService.getFindingInteractions(headers, findingId)`

Compact verified controller body: `{ return findingsService.getFindingInteractions(headers, findingId); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.GrapDBSyncController`

**Location:** `src/main/java/com/quilr/qb/controller/GrapDBSyncController.java`  
**Mapped operations:** 1

### `POST /sync/endpoint/app/process`

**Implementation:** `com.quilr.qb.controller.GrapDBSyncController.syncLastUpdatedUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/GrapDBSyncController.java:27`  
**Flags:** OpenAPI-hidden  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Integer> syncLastUpdatedUsers(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Integer>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `endpointAppSyncService.syncAllAppProcessToCH()`
2. `response.setResponse(count)`

Compact verified controller body: `{ int count = endpointAppSyncService.syncAllAppProcessToCH(); ServiceResponse<Integer> response = new ServiceResponse<>(); response.setResponse(count); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.GuardrailController`

**Location:** `src/main/java/com/quilr/qb/controller/GuardrailController.java`  
**Mapped operations:** 3

### `GET /guardrails/v1/kpi`

**Implementation:** `com.quilr.qb.controller.GuardrailController.getLastXRequestsMetrics`  
**Location:** `src/main/java/com/quilr/qb/controller/GuardrailController.java:33`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getLastXRequestsMetrics(@RequestHeader Map<String, String> headers,@RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info(": {}", requestParams)`
2. `guardrailService.getKPIResults(headers, requestParams)`

Compact verified controller body: `{ log.info(": {}", requestParams); return guardrailService.getKPIResults(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /guardrails/v1/latency_info`

**Implementation:** `com.quilr.qb.controller.GuardrailController.getEventTimelines`  
**Location:** `src/main/java/com/quilr/qb/controller/GuardrailController.java:40`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getEventTimelines(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info(": {}", requestParams)`
2. `guardrailService.getEventTimelineResults(headers, requestParams)`

Compact verified controller body: `{ log.info(": {}", requestParams); return guardrailService.getEventTimelineResults(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /guardrails/v1/requests`

**Implementation:** `com.quilr.qb.controller.GuardrailController.getGuardrailRequests`  
**Location:** `src/main/java/com/quilr/qb/controller/GuardrailController.java:48`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<GuardrailRequestDto>> getGuardrailRequests( @RequestHeader(value = HeaderConstants.TENANT) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization, @RequestParam(value = "app_name") String appName, @RequestBody(required = false) SearchAndFilterDto filterDto)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<GuardrailRequestDto>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info("Getting guardrail requests for tenant: {}, subscriber: {}, app: {}", tenant, subscriberId, appName)`
2. `guardrailService.getGuardrailRequests( tenant, subscriberId, appName, filterDto)`

Compact verified controller body: `{ log.info("Getting guardrail requests for tenant: {}, subscriber: {}, app: {}", tenant, subscriberId, appName); if (filterDto == null) { filterDto = new SearchAndFilterDto(); } ServiceResponse<List<GuardrailRequestDto>> response = guardrailService.getGuardrailRequests( tenant, subscriberId, appName, filterDto); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.InteractionsController`

**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java`  
**Mapped operations:** 11

### `POST /interactions/simple/query`

**Implementation:** `com.quilr.qb.controller.InteractionsController.simpleQuery`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:56`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> simpleQuery( @RequestHeader Map<String, String> headers, @RequestBody InteractionsSimpleRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.simpleQuery(headers, request)`

Compact verified controller body: `{ return interactionsService.simpleQuery(headers, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /interactions/advanced/query`

**Implementation:** `com.quilr.qb.controller.InteractionsController.advancedQuery`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:89`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> advancedQuery( @RequestHeader Map<String, String> headers, @RequestBody InteractionsSearchRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.search(headers, request)`

Compact verified controller body: `{ return interactionsService.search(headers, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /interactions/advanced/query/fields`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getSearchFields`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:102`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getSearchFields( @RequestParam(required = false) String source)`

Verified input surfaces: query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.getSearchFields(source)`

Compact verified controller body: `{ return interactionsService.getSearchFields(source); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /interactions/advanced/query/validate`

**Implementation:** `com.quilr.qb.controller.InteractionsController.validateSearchQuery`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:114`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> validateSearchQuery( @RequestBody Map<String, String> body)`

Verified input surfaces: JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `body.get("source")`
2. `StringUtils.trimToEmpty(body.get("query"))`
3. `body.get("query")`
4. `SubproductStrategy.forSource(source)`
5. `new InteractionsSearchParser(strategy.searchFields()).validate(query)`
6. `strategy.searchFields()`
7. `result.put("valid", errors.isEmpty())`
8. `errors.isEmpty()`
9. `result.put("errors", errors)`
10. `result.put("query", query)`
11. `response.setResponse(result)`

Compact verified controller body: `{ String source = body.get("source"); String query = StringUtils.trimToEmpty(body.get("query")); SubproductStrategy strategy = SubproductStrategy.forSource(source); List<String> errors = new InteractionsSearchParser(strategy.searchFields()).validate(query); Map<String, Object> result = new LinkedHashMap<>(); result.put("valid", errors.isEmpty()); result.put("errors", errors); result.put("query", query); ServiceResponse<Map<String, Object>> response = new ServiceResponse<>(); response.setResponse(result); return response; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /interactions/distinct/applications`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getDistinctApplications`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:137`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getDistinctApplications( @RequestHeader Map<String, String> headers, @RequestBody DistinctApplicationsRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.getDistinctApplications(headers, request)`

Compact verified controller body: `{ return interactionsService.getDistinctApplications(headers, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /interactions/distinct/users`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getDistinctUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:145`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getDistinctUsers( @RequestHeader Map<String, String> headers, @RequestBody DistinctUsersRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.getDistinctUsers(headers, request)`

Compact verified controller body: `{ return interactionsService.getDistinctUsers(headers, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /interactions/chat/query`

**Implementation:** `com.quilr.qb.controller.InteractionsController.chatQuery`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:157`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> chatQuery( @RequestHeader Map<String, String> headers, @RequestBody InteractionsChatRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsChatService.chatQuery(headers, request)`

Compact verified controller body: `{ return interactionsChatService.chatQuery(headers, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /interactions/users/stats`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getUserStats`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:170`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getUserStats( @RequestHeader Map<String, String> headers, @RequestBody UserStatsRequest request)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.getUserStats(headers, request)`

Compact verified controller body: `{ return interactionsService.getUserStats(headers, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET|POST /interactions/filters`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getFilterOptions`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:182`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFilterOptions( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams, @RequestBody(required = false) Map<String, String> requestBody)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `mergedParams.putAll(requestBody)`
2. `interactionsService.getFilterOptions(headers, mergedParams)`

Compact verified controller body: `{ Map<String, String> mergedParams = new HashMap<>(requestParams); if (requestBody != null) { mergedParams.putAll(requestBody); } return interactionsService.getFilterOptions(headers, mergedParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /interactions/filters/source`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getSourceFilters`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:195`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getSourceFilters( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.getSourceFilters(headers, requestParams)`

Compact verified controller body: `{ return interactionsService.getSourceFilters(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /interactions/query`

**Implementation:** `com.quilr.qb.controller.InteractionsController.getInteractions`  
**Location:** `src/main/java/com/quilr/qb/controller/InteractionsController.java:221`  
**Flags:** Deprecated  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getInteractions( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `interactionsService.getInteractions(headers, requestParams)`

Compact verified controller body: `{ return interactionsService.getInteractions(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.MCPGatewayController`

**Location:** `src/main/java/com/quilr/qb/controller/MCPGatewayController.java`  
**Mapped operations:** 4

### `GET /mcp/gateway/kpi`

**Implementation:** `com.quilr.qb.controller.MCPGatewayController.getLastXRequestsMetrics`  
**Location:** `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:32`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getLastXRequestsMetrics(@RequestHeader Map<String, String> headers,@RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info(": {}", requestParams)`
2. `gatewayService.getKPIResults(headers, requestParams)`

Compact verified controller body: `{ log.info(": {}", requestParams); return gatewayService.getKPIResults(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /mcp/gateway/table/data`

**Implementation:** `com.quilr.qb.controller.MCPGatewayController.getFindingsTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:39`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getFindingsTableData( @RequestHeader Map<String, String> headers, @RequestBody(required = false) SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `gatewayService.getFindingsTableData(headers, searchDto)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } return gatewayService.getFindingsTableData(headers, searchDto); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /mcp/gateway/agents/data`

**Implementation:** `com.quilr.qb.controller.MCPGatewayController.getAgentsTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:52`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getAgentsTableData( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `gatewayService.getAIAgentTableData(headers, requestParams)`

Compact verified controller body: `{ return gatewayService.getAIAgentTableData(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /mcp/gateway/latency/trends`

**Implementation:** `com.quilr.qb.controller.MCPGatewayController.getLatencyTrends`  
**Location:** `src/main/java/com/quilr/qb/controller/MCPGatewayController.java:60`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getLatencyTrends( @RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info("Latency trends request: {}", requestParams)`
2. `gatewayService.getLatencyTrends(headers, requestParams)`

Compact verified controller body: `{ log.info("Latency trends request: {}", requestParams); return gatewayService.getLatencyTrends(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.NonAIAppsController`

**Location:** `src/main/java/com/quilr/qb/controller/NonAIAppsController.java`  
**Mapped operations:** 1

### `GET /nonaiapps/v1/table/data`

**Implementation:** `com.quilr.qb.controller.NonAIAppsController.getTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/NonAIAppsController.java:23`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTableData(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `nonAIAppsService.getGrpTableData(headers, requestParams)`

Compact verified controller body: `{ return nonAIAppsService.getGrpTableData(headers, requestParams); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.QuillyInteractionsController`

**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java`  
**Mapped operations:** 9

### `GET /quilly/interactions/query/withfindings`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.query`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:48`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> query( @RequestHeader Map<String, String> headers, @RequestParam(value = "context_id", required = false) String contextId, @RequestParam(value = "user_mail", required = false) String userMail, @RequestParam(value = "limit", defaultValue = "50") int limit, @RequestParam(value = "offset", defaultValue = "0") int offset)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("subscriberid", "")`
2. `headers.getOrDefault("tenant", "")`
3. `StringUtils.isBlank(subscriber)`
4. `StringUtils.isBlank(tenant)`
5. `bad.setResponse(Collections.emptyList())`
6. `Collections.emptyList()`
7. `bad.addExtraInfo("error", "subscriberid and tenant headers are required.")`
8. `quillyInteractionsService.fetchAlertActions(headers, contextId, userMail, limit, offset)`

Compact verified controller body: `{ String subscriber = headers.getOrDefault("subscriberid", ""); String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(subscriber) || StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "subscriberid and tenant headers are required."); return bad; } return quillyInteractionsService.fetchAlertActions(headers, contextId, userMail, limit, offset); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/query/withoutfindings`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.queryByUser`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:70`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> queryByUser( @RequestHeader Map<String, String> headers, @RequestParam("user_mail") String userEmail, @RequestParam(value = "limit", defaultValue = "50") int limit, @RequestParam(value = "offset", defaultValue = "0") int offset)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("subscriberid", "")`
2. `headers.getOrDefault("tenant", "")`
3. `StringUtils.isBlank(subscriber)`
4. `StringUtils.isBlank(tenant)`
5. `bad.setResponse(Collections.emptyList())`
6. `Collections.emptyList()`
7. `bad.addExtraInfo("error", "subscriberid and tenant headers are required.")`
8. `StringUtils.isBlank(userEmail)`
9. `bad.addExtraInfo("error", "user_email is required.")`
10. `quillyInteractionsService.fetchAlertActionsByUser(headers, userEmail, limit, offset)`

Compact verified controller body: `{ String subscriber = headers.getOrDefault("subscriberid", ""); String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(subscriber) || StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "subscriberid and tenant headers are required."); return bad; } if (StringUtils.isBlank(userEmail)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "user_email is required."); return bad; } return quillyInteractionsService.fetchAlertActionsByUser(headers, userEmail, limit, offset); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/findings/summaries`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.findingSummaries`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:98`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> findingSummaries( @RequestHeader Map<String, String> headers, @RequestParam(value = "user_email", required = false) String userEmail, @RequestParam(value = "finding_id", required = false) String findingId, @RequestParam(value = "from_time", required = false) Long fromTime, @RequestParam(value = "to_time", required = false) Long toTime, @RequestParam(value = "limit", defaultValue = "50") int limit, @RequestParam(value = "offset", defaultValue = "0") int offset)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchSummaries(headers, userEmail, findingId, fromTime, toTime, limit, offset)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchSummaries(headers, userEmail, findingId, fromTime, toTime, limit, offset); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/findings/summaries/drilldown`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.findingsSummariesDrilldown`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:120`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> findingsSummariesDrilldown( @RequestHeader Map<String, String> headers, @RequestParam("request_id") String requestId, @RequestParam("finding_id") String findingId, @RequestParam(value = "user_email", required = false) String userEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchInteractionsDrilldown(headers, requestId, findingId, userEmail)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchInteractionsDrilldown(headers, requestId, findingId, userEmail); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/coach/summaries`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.coachSummaries`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:140`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> coachSummaries( @RequestHeader Map<String, String> headers, @RequestParam(value = "user_email", required = false) String userEmail, @RequestParam(value = "from_time", required = false) Long fromTime, @RequestParam(value = "to_time", required = false) Long toTime, @RequestParam(value = "limit", defaultValue = "50") int limit, @RequestParam(value = "offset", defaultValue = "0") int offset)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchCoachSummaries(headers, userEmail, fromTime, toTime, limit, offset)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchCoachSummaries(headers, userEmail, fromTime, toTime, limit, offset); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/coach/summaries/drilldown`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.coachSummariesDrilldown`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:162`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> coachSummariesDrilldown( @RequestHeader Map<String, String> headers, @RequestParam("request_id") String requestId, @RequestParam(value = "user_email", required = false) String userEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchCoachInteractionsDrilldown(headers, requestId, userEmail)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchCoachInteractionsDrilldown(headers, requestId, userEmail); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/user/summaries`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.userSummaries`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:181`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> userSummaries( @RequestHeader Map<String, String> headers, @RequestParam(value = "user_email", required = false) String userEmail, @RequestParam(value = "from_time", required = false) Long fromTime, @RequestParam(value = "to_time", required = false) Long toTime, @RequestParam(value = "limit", defaultValue = "50") int limit, @RequestParam(value = "offset", defaultValue = "0") int offset)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchUserSummaries(headers, userEmail, fromTime, toTime, limit, offset)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchUserSummaries(headers, userEmail, fromTime, toTime, limit, offset); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/user/summaries/drilldown`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.userSummariesDrilldown`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:203`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> userSummariesDrilldown( @RequestHeader Map<String, String> headers, @RequestParam("request_id") String requestId, @RequestParam(value = "user_email", required = false) String userEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchUserInteractionsDrilldown(headers, requestId, userEmail)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchUserInteractionsDrilldown(headers, requestId, userEmail); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /quilly/interactions/users`

**Implementation:** `com.quilr.qb.controller.QuillyInteractionsController.distinctUsers`  
**Location:** `src/main/java/com/quilr/qb/controller/QuillyInteractionsController.java:223`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> distinctUsers( @RequestHeader Map<String, String> headers, @RequestParam(value = "trigger_type", required = false) String triggerType, @RequestParam(value = "from_time", required = false) Long fromTime, @RequestParam(value = "to_time", required = false) Long toTime)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.getOrDefault("tenant", "")`
2. `StringUtils.isBlank(tenant)`
3. `bad.setResponse(Collections.emptyList())`
4. `Collections.emptyList()`
5. `bad.addExtraInfo("error", "tenant header is required.")`
6. `quillyInteractionsService.fetchDistinctUsers(headers, triggerType, fromTime, toTime)`

Compact verified controller body: `{ String tenant = headers.getOrDefault("tenant", ""); if (StringUtils.isBlank(tenant)) { ServiceResponse<List<Map<String, Object>>> bad = new ServiceResponse<>(); bad.setResponse(Collections.emptyList()); bad.addExtraInfo("error", "tenant header is required."); return bad; } return quillyInteractionsService.fetchDistinctUsers(headers, triggerType, fromTime, toTime); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.StatusEventController`

**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java`  
**Mapped operations:** 6

### `POST /status-events/summary`

**Implementation:** `com.quilr.qb.controller.StatusEventController.getSummary`  
**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java:35`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<StatusEventSummary>> getSummary( @RequestBody(required = false) StatusEventSummaryRequest request)`

Verified input surfaces: JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<StatusEventSummary>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `getSubscriberFromContext()`
2. `UserContextHolder.get().getSelectedTenant()`
3. `statusEventService.getSummary(subscriber, tenant, request)`

Compact verified controller body: `{ String subscriber = getSubscriberFromContext(); String tenant = UserContextHolder.get().getSelectedTenant(); if (request == null) { request = new StatusEventSummaryRequest(); } return statusEventService.getSummary(subscriber, tenant, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /status-events/drilldown`

**Implementation:** `com.quilr.qb.controller.StatusEventController.getDrilldown`  
**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java:49`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<DrilldownEvent>> getDrilldown( @RequestHeader(HeaderConstants.TENANT) String tenant, @Valid @RequestBody DrilldownRequest request)`

Verified input surfaces: HTTP header input; JSON/body input; Jakarta Bean Validation requested. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<DrilldownEvent>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `getSubscriberFromContext()`
2. `statusEventService.getDrilldown(subscriber, tenant, request)`

Compact verified controller body: `{ String subscriber = getSubscriberFromContext(); return statusEventService.getDrilldown(subscriber, tenant, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /status-events/interactions/{contextId}`

**Implementation:** `com.quilr.qb.controller.StatusEventController.getInteraction`  
**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java:60`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<InteractionDetail>> getInteraction( @RequestHeader(HeaderConstants.TENANT) String tenant, @PathVariable("contextId") String contextId)`

Verified input surfaces: HTTP header input; path parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<InteractionDetail>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `getSubscriberFromContext()`
2. `statusEventService.getInteraction(subscriber, tenant, contextId)`

Compact verified controller body: `{ String subscriber = getSubscriberFromContext(); return statusEventService.getInteraction(subscriber, tenant, contextId); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /status-events/summary/filters`

**Implementation:** `com.quilr.qb.controller.StatusEventController.getSummaryFilterValues`  
**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java:71`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<FilterOption>> getSummaryFilterValues( @RequestParam("filter_type") String filterType, @RequestParam(value = "search", required = false) String search, @RequestParam(value = "page", defaultValue = "0") Integer page, @RequestParam(value = "page_size", defaultValue = "20") Integer pageSize)`

Verified input surfaces: query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<FilterOption>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `getSubscriberFromContext()`
2. `UserContextHolder.get().getSelectedTenant()`
3. `statusEventService.getSummaryFilterValues(subscriber, tenant, filterType, search, page, pageSize)`

Compact verified controller body: `{ String subscriber = getSubscriberFromContext(); String tenant = UserContextHolder.get().getSelectedTenant(); return statusEventService.getSummaryFilterValues(subscriber, tenant, filterType, search, page, pageSize); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /status-events/drilldown/filters`

**Implementation:** `com.quilr.qb.controller.StatusEventController.getDrilldownFilterValues`  
**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java:83`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<FilterOption>> getDrilldownFilterValues( @RequestHeader(HeaderConstants.TENANT) String tenant, @RequestParam("user_email") String userEmail, @RequestParam("usecase_id") String usecaseId, @RequestParam("source_app_id") String sourceAppId, @RequestParam("filter_type") String filterType, @RequestParam(value = "search", required = false) String search, @RequestParam(value = "page", defaultValue = "0") Integer page, @RequestParam(value = "page_size", defaultValue = "20") Integer pageSize)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<FilterOption>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `getSubscriberFromContext()`
2. `statusEventService.getDrilldownFilterValues(subscriber, tenant, userEmail, usecaseId, sourceAppId, filterType, search, page, pageSize)`

Compact verified controller body: `{ String subscriber = getSubscriberFromContext(); return statusEventService.getDrilldownFilterValues(subscriber, tenant, userEmail, usecaseId, sourceAppId, filterType, search, page, pageSize); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /status-events/resolve`

**Implementation:** `com.quilr.qb.controller.StatusEventController.resolveFindings`  
**Location:** `src/main/java/com/quilr/qb/controller/StatusEventController.java:98`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<ResolveResult>> resolveFindings( @RequestHeader(HeaderConstants.TENANT) String tenant, @Valid @RequestBody BulkResolveRequest request)`

Verified input surfaces: HTTP header input; JSON/body input; Jakarta Bean Validation requested. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<ResolveResult>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `getSubscriberFromContext()`
2. `statusEventService.resolveFindings(subscriber, tenant, request)`

Compact verified controller body: `{ String subscriber = getSubscriberFromContext(); return statusEventService.resolveFindings(subscriber, tenant, request); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.UserAppApprovalController`

**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java`  
**Mapped operations:** 7

### `POST /userappapproval/table/data`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.getTableData`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:25`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTableData( @RequestHeader Map<String, String> headers, @RequestBody(required = false) Map<String, Object> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.getTableData(headers, requestBody != null ? requestBody : Map.of())`
2. `Map.of()`

Compact verified controller body: `{ return userAppApprovalService.getTableData(headers, requestBody != null ? requestBody : Map.of()); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /userappapproval/update`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.updateApprovals`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:33`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "USER", scope = "UPDATE")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> updateApprovals( @RequestHeader Map<String, String> headers, @RequestBody List<Map<String, Object>> requestBody)`

Verified input surfaces: HTTP header input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.updateApprovals(headers, requestBody)`

Compact verified controller body: `{ return userAppApprovalService.updateApprovals(headers, requestBody); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /userappapproval/user/apps`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.getUserApps`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:42`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getUserApps( @RequestHeader Map<String, String> headers, @RequestParam("user_email") String userEmail, @RequestBody(required = false) SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.getUserApps(userEmail, headers, searchDto)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } return userAppApprovalService.getUserApps(userEmail, headers, searchDto); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /userappapproval/tenant/apps`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.getTenantApps`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:54`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getTenantApps( @RequestHeader Map<String, String> headers, @RequestParam(value = "user_email", required = false) String userEmail, @RequestBody(required = false) SearchAndFilterDto searchDto)`

Verified input surfaces: HTTP header input; query parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.getTenantApps(headers, userEmail != null ? userEmail : "", searchDto)`

Compact verified controller body: `{ if (searchDto == null) { searchDto = new SearchAndFilterDto(); } return userAppApprovalService.getTenantApps(headers, userEmail != null ? userEmail : "", searchDto); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /userappapproval/app/stats`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.getAppStats`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:66`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getAppStats( @RequestHeader Map<String, String> headers, @RequestParam("user_email") String userEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.getAppStats(userEmail, headers)`

Compact verified controller body: `{ return userAppApprovalService.getAppStats(userEmail, headers); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /userappapproval/tenant/app/stats`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.getTenantAppStats`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:74`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getTenantAppStats( @RequestHeader Map<String, String> headers, @RequestParam(value = "user_email", required = false) String userEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.getTenantAppStats(headers, userEmail != null ? userEmail : "")`

Compact verified controller body: `{ return userAppApprovalService.getTenantAppStats(headers, userEmail != null ? userEmail : ""); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /userappapproval/cache`

**Implementation:** `com.quilr.qb.controller.UserAppApprovalController.getCachedApproval`  
**Location:** `src/main/java/com/quilr/qb/controller/UserAppApprovalController.java:82`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getCachedApproval( @RequestHeader Map<String, String> headers, @RequestParam("app_id") String appId, @RequestParam("user_email") String userEmail)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `userAppApprovalService.getCachedApproval(headers, appId, userEmail)`

Compact verified controller body: `{ return userAppApprovalService.getCachedApproval(headers, appId, userEmail); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.WhitelistingController`

**Location:** `src/main/java/com/quilr/qb/controller/WhitelistingController.java`  
**Mapped operations:** 4

### `POST /whitelisting/compromised-password/{approve}`

**Implementation:** `com.quilr.qb.controller.WhitelistingController.whitelistCompromisedPassword`  
**Location:** `src/main/java/com/quilr/qb/controller/WhitelistingController.java:27`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `Map<String, Object> whitelistCompromisedPassword( @RequestBody List<Map<String, Object>> requestData, @PathVariable("approve") boolean approve, @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input; path parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `Map<String, Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `whitelistingService.whitelistCompromisedPassword(requestData, approve, tenant, subscriberId, authorization)`

Compact verified controller body: `{ return whitelistingService.whitelistCompromisedPassword(requestData, approve, tenant, subscriberId, authorization); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /whitelisting/weak-password/{approve}`

**Implementation:** `com.quilr.qb.controller.WhitelistingController.whitelistWeakPassword`  
**Location:** `src/main/java/com/quilr/qb/controller/WhitelistingController.java:39`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `Map<String, Object> whitelistWeakPassword( @RequestBody List<Map<String, Object>> requestData, @PathVariable("approve") boolean approve, @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input; path parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `Map<String, Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `whitelistingService.whitelistWeakPassword(requestData, approve, tenant, subscriberId, authorization)`

Compact verified controller body: `{ return whitelistingService.whitelistWeakPassword(requestData, approve, tenant, subscriberId, authorization); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /whitelisting/cred-shared/{approve}`

**Implementation:** `com.quilr.qb.controller.WhitelistingController.whitelistCredShared`  
**Location:** `src/main/java/com/quilr/qb/controller/WhitelistingController.java:51`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `Map<String, Object> whitelistCredShared( @RequestBody List<Map<String, Object>> requestData, @PathVariable("approve") boolean approve, @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input; path parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `Map<String, Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `whitelistingService.whitelistCredShared(requestData, approve, tenant, subscriberId, authorization)`

Compact verified controller body: `{ return whitelistingService.whitelistCredShared(requestData, approve, tenant, subscriberId, authorization); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `POST /whitelisting/password-reuse/{approve}`

**Implementation:** `com.quilr.qb.controller.WhitelistingController.whitelistPasswordReuse`  
**Location:** `src/main/java/com/quilr/qb/controller/WhitelistingController.java:63`  
**Flags:** Permission annotation  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: the method is annotated `@RequiresPermission(resource = "APP_MANAGEMENT", subResource = "TENANT", scope = "WHITELIST")`. Unresolved: enforcement semantics and failure response are supplied by the external `quilr-authz-lib`.

#### Inputs

Exact controller signature: `Map<String, Object> whitelistPasswordReuse( @RequestBody List<Map<String, Object>> requestData, @PathVariable("approve") boolean approve, @RequestHeader(value = HeaderConstants.TENANT, required = false) String tenant, @RequestHeader(value = HeaderConstants.SUBSCRIBER_ID, required = false) String subscriberId, @RequestHeader(value = HeaderConstants.AUTHORIZATION, required = false) String authorization)`

Verified input surfaces: HTTP header input; path parameter input; JSON/body input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `Map<String, Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `whitelistingService.whitelistPasswordReuse(requestData, approve, false, tenant, subscriberId, authorization)`

Compact verified controller body: `{ return whitelistingService.whitelistPasswordReuse(requestData, approve, false, tenant, subscriberId, authorization); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.controller.WidgetsController`

**Location:** `src/main/java/com/quilr/qb/controller/WidgetsController.java`  
**Mapped operations:** 3

### `GET /qb/health`

**Implementation:** `com.quilr.qb.controller.WidgetsController.health`  
**Location:** `src/main/java/com/quilr/qb/controller/WidgetsController.java:31`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ResponseEntity<String> health()`

Verified input surfaces: No annotated request parameter. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ResponseEntity<String>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `log.info("Health Received Request....")`

Compact verified controller body: `{ log.info("Health Received Request...."); return new ResponseEntity<>( "RUNNING", HttpStatus.OK); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /qb/query`

**Implementation:** `com.quilr.qb.controller.WidgetsController.getDashboardResults`  
**Location:** `src/main/java/com/quilr/qb/controller/WidgetsController.java:45`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Object> getDashboardResults( @RequestHeader Map<String, String> headers, @Parameter(description = "Query parameters including dashboard_name, optional from_time_ms and to_time_ms (epoch ms)") @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Object>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `headers.get("subscriberid")`
2. `headers.get("tenant")`
3. `requestParams.get("dashboard_name")`
4. `TimeRangeUtil.resolve(requestParams)`
5. `requestParams.put("from_time_ms", Long.toString(range[0]))`
6. `Long.toString(range[0])`
7. `requestParams.put("to_time_ms", Long.toString(range[1]))`
8. `Long.toString(range[1])`
9. `log.info("Widgets query — subscriberId={}, tenantId={}, dashboardName={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, dashboardName, range[0], range[1])`
10. `widgetsService.getDashboardResults(headers, requestParams)`
11. `serviceResponse.setResponse(widgetResponse.getResponse())`
12. `widgetResponse.getResponse()`
13. `widgetResponse.getExtraInfo()`
14. `widgetResponse.getExtraInfo().forEach(serviceResponse::addExtraInfo)`

Compact verified controller body: `{ String subscriberId = headers.get("subscriberid"); String tenantId = headers.get("tenant"); String dashboardName = requestParams.get("dashboard_name"); long[] range = TimeRangeUtil.resolve(requestParams); requestParams.put("from_time_ms", Long.toString(range[0])); requestParams.put("to_time_ms", Long.toString(range[1])); log.info("Widgets query — subscriberId={}, tenantId={}, dashboardName={}, fromTimeMs={}, toTimeMs={}", subscriberId, tenantId, dashboardName, range[0], range[1]); final ServiceResponse<Object> serviceResponse = new ServiceResponse<>(); ServiceResponse<List<Map<String, Object>>> widgetResponse = widgetsService.getDashboardResults(headers, requestParams); serviceResponse.setResponse(widgetResponse.getResponse()); if (widgetResponse.getExtraInfo() != null) { widgetResponse.getExtraInfo().forEach(serviceResponse::addExtraInfo); } return serviceResponse; }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /qb/aipages/aggscheduled`

**Implementation:** `com.quilr.qb.controller.WidgetsController.executeScheduledQueries`  
**Location:** `src/main/java/com/quilr/qb/controller/WidgetsController.java:69`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> executeScheduledQueries(@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> requestParams)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `requestParams.get("dashboard_name")`
2. `widgetsService.executeScheduledQueries(dashboard_name, false)`

Compact verified controller body: `{ String dashboard_name = requestParams.get("dashboard_name"); return widgetsService.executeScheduledQueries(dashboard_name, false); }`

#### Failure behavior and tests

Verified: No controller-local failure conversion is visible in this method; downstream exceptions propagate to Spring or a controller-level handler.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

## `com.quilr.qb.redteam.controller.RedTeamController`

**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java`  
**Mapped operations:** 6

### `GET /redteaming/v1/runs/summary`

**Implementation:** `com.quilr.qb.redteam.controller.RedTeamController.getRunSummaries`  
**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:34`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getRunSummaries(@RequestHeader(HeaderConstants.TENANT) String tenant, @RequestParam("app_name") String appName)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `tenant.isBlank()`
2. `new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header")`
3. `HttpStatusCode.valueOf(400)`
4. `redTeamService.getRunSummaries(tenant, appName)`

Compact verified controller body: `{ if (tenant == null || tenant.isBlank()) { throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header"); } return redTeamService.getRunSummaries(tenant, appName); }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /redteaming/v1/results`

**Implementation:** `com.quilr.qb.redteam.controller.RedTeamController.getRunDetails`  
**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:44`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getRunDetails( @RequestHeader(HeaderConstants.TENANT) String tenant, @RequestParam(value = "run_id", required = false) String runId, @RequestParam(value ="app_name", required = false) String appName, @RequestParam(value ="compliance_type", required = false) String complianceType, @RequestParam(name = "offset", defaultValue = "0") int offset, @RequestParam(name = "limit", defaultValue = "10") int limit)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `tenant.isBlank()`
2. `new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header")`
3. `HttpStatusCode.valueOf(400)`
4. `redTeamService.getRunDetails(tenant, runId, appName, complianceType, offset, limit)`

Compact verified controller body: `{ if (tenant == null || tenant.isBlank()) { throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header"); } return redTeamService.getRunDetails(tenant, runId, appName, complianceType, offset, limit); }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /redteaming/v1/run/category_failures`

**Implementation:** `com.quilr.qb.redteam.controller.RedTeamController.getRunFailuresPerCategory`  
**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:61`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getRunFailuresPerCategory(@RequestHeader(HeaderConstants.TENANT) String tenant, @RequestParam("app_name") String appName, @RequestParam("compliance_type") String complianceType)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `tenant.isBlank()`
2. `new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header")`
3. `HttpStatusCode.valueOf(400)`
4. `redTeamService.getRunFailuresPerCategory(tenant, appName, complianceType)`

Compact verified controller body: `{ if (tenant == null || tenant.isBlank()) { throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header"); } return redTeamService.getRunFailuresPerCategory(tenant, appName, complianceType); }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /redteaming/v1/heatmap/category_failures`

**Implementation:** `com.quilr.qb.redteam.controller.RedTeamController.getHeatMapFailuresPerCategory`  
**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:71`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getHeatMapFailuresPerCategory(@RequestHeader(HeaderConstants.TENANT) String tenant, @RequestParam("app_name") String appName, @RequestParam("compliance_type") String complianceType)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `tenant.isBlank()`
2. `new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header")`
3. `HttpStatusCode.valueOf(400)`
4. `redTeamService.getHeatMapFailuresPerCategory(tenant, appName, complianceType)`

Compact verified controller body: `{ if (tenant == null || tenant.isBlank()) { throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header"); } return redTeamService.getHeatMapFailuresPerCategory(tenant, appName, complianceType); }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /redteaming/v1/heatmap/technique_family`

**Implementation:** `com.quilr.qb.redteam.controller.RedTeamController.getHeatMapFailuresPerCategory`  
**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:81`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<List<Map<String, Object>>> getHeatMapFailuresPerCategory(@RequestHeader(HeaderConstants.TENANT) String tenant,@RequestParam("app_name") String appName)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<List<Map<String, Object>>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `tenant.isBlank()`
2. `new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header")`
3. `HttpStatusCode.valueOf(400)`
4. `redTeamService.getHeatMapTechniqueFamily(tenant, appName)`

Compact verified controller body: `{ if (tenant == null || tenant.isBlank()) { throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header"); } return redTeamService.getHeatMapTechniqueFamily(tenant, appName); }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.

### `GET /redteaming/v1/dashboard/stats`

**Implementation:** `com.quilr.qb.redteam.controller.RedTeamController.getDashboardTotalCounts`  
**Location:** `src/main/java/com/quilr/qb/redteam/controller/RedTeamController.java:90`  
**Flags:** None visible on method  
**Confidence:** Verified

#### Authentication and authorization

Verified: the repository’s Spring `SecurityFilterChain` permits every request at its authorization-rule layer and inserts the external `ai.quilr.jwtdecoder.filter.Decoder` before `BasicAuthenticationFilter`. The decoder’s implementation is not in this repository.

Verified: no method-level `@RequiresPermission` annotation is present. This does not prove the operation is unauthenticated because the external decoder/filter and any external gateway may still enforce identity.

#### Inputs

Exact controller signature: `ServiceResponse<Map<String, Object>> getDashboardTotalCounts(@RequestHeader(HeaderConstants.TENANT) String tenant,@RequestParam("app_name") String appName)`

Verified input surfaces: HTTP header input; query parameter input. Required/optional/default semantics are exactly those expressed by the Spring annotations in the signature; map-shaped inputs have no controller-level field schema.

#### Outputs

Declared return type: `ServiceResponse<Map<String, Object>>`. The external/common `ServiceResponse` implementation is not declared in this repository where used, so its complete serialized envelope is unresolved unless the method returns `ResponseEntity` or a raw map.

#### Execution logic

Verified direct calls in source order:

1. `tenant.isBlank()`
2. `new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header")`
3. `HttpStatusCode.valueOf(400)`
4. `redTeamService.getDashboardTotalCounts(tenant, appName)`

Compact verified controller body: `{ if (tenant == null || tenant.isBlank()) { throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Missing tenant header"); } return redTeamService.getDashboardTotalCounts(tenant, appName); }`

#### Failure behavior and tests

Verified: The controller body explicitly throws on at least one branch.

Verified: no `src/test` tree exists in this repository, so no repository-local test directly covers this endpoint.
