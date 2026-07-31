# quilr-query-builder lifecycle and background entry points

## Application/process startup

- Verified: `com.quilr.QBApp.main(String[])` calls `SpringApplication.run(QBApp.class, args)`.
- Verified: `@EnableAsync` and `@EnableScheduling` activate Spring proxy-based async execution and scheduler discovery.
- Verified: component scan roots are `com.quilr` and `ai.quilr`.
- Verified: JPA entity scan is restricted to `com.quilr.entities`; repository scan is restricted to `com.quilr.repository`.
- Verified: `QBApp.decoder()` constructs the external JWT `Decoder` bean.
- Verified: `QBAppListener.onApplicationEvent` only logs; its comment about starting consumers is not implemented in that method.
- Verified: `QBAppListener.onExit` calls a private cleanup method that only logs; it does not stop resources explicitly.

## Framework lifecycle registrations

The table is parser-extracted. Commented annotations are not included by the CST.

| Hook/annotation | Symbol | Location | Declaration |
| --- | --- | --- | --- |
| `Bean` | `com.quilr.qb.common.InteractionsCacheConfig.interactionsCacheManager` | `src/main/java/com/quilr/qb/common/InteractionsCacheConfig.java:34` | `@Bean("interactionsCacheManager") public CacheManager interactionsCacheManager(RedisConnectionFactory connectionFactory)` |
| `Bean` | `com.quilr.qb.common.InteractionsCacheConfig.interactionsCacheKeyGenerator` | `src/main/java/com/quilr/qb/common/InteractionsCacheConfig.java:64` | `@Bean("interactionsCacheKeyGenerator") public KeyGenerator interactionsCacheKeyGenerator()` |
| `PostConstruct` | `com.quilr.qb.common.RedissonConfig.init` | `src/main/java/com/quilr/qb/common/RedissonConfig.java:38` | `@PostConstruct public void init()` |
| `Bean` | `com.quilr.qb.common.RedissonConfig.redisConfigCustomizer` | `src/main/java/com/quilr/qb/common/RedissonConfig.java:46` | `@Bean public RedissonAutoConfigurationCustomizer redisConfigCustomizer()` |
| `Bean` | `com.quilr.qb.common.SwaggerConfig.quilrOpenAPI` | `src/main/java/com/quilr/qb/common/SwaggerConfig.java:15` | `@Bean public OpenAPI quilrOpenAPI()` |
| `Bean` | `com.quilr.qb.config.DashboardExecutorConfig.dashboardQueryExecutor` | `src/main/java/com/quilr/qb/config/DashboardExecutorConfig.java:24` | `@Bean(name = DASHBOARD_QUERY_EXECUTOR) public ThreadPoolTaskExecutor dashboardQueryExecutor()` |
| `Bean` | `com.quilr.qb.config.RestTemplateConfig.restTemplate` | `src/main/java/com/quilr/qb/config/RestTemplateConfig.java:15` | `@Bean public RestTemplate restTemplate()` |
| `PostConstruct` | `com.quilr.qb.device.DeviceInfoServiceImpl.initialize` | `src/main/java/com/quilr/qb/device/DeviceInfoServiceImpl.java:26` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.executive.ExecutiveDashboardServiceImpl.initialize` | `src/main/java/com/quilr/qb/executive/ExecutiveDashboardServiceImpl.java:30` | `@PostConstruct public void initialize()` |
| `Bean` | `com.quilr.qb.findings.client.BrowserExtensionServiceClientFactory.createBrowserExtensionServiceClient` | `src/main/java/com/quilr/qb/findings/client/BrowserExtensionServiceClientFactory.java:21` | `@Bean public BrowserExtensionServiceClient createBrowserExtensionServiceClient( @Value("${browser.extension.service.url:http://localhost:8085}") String browserExtensionServiceUrl, @Value("${browser.extension.service.connect-timeout:1000}") int connectTimeoutMs, @Value("${browser.extension.service.read-timeout:5000}") int readTimeoutMs)` |
| `PostConstruct` | `com.quilr.qb.findings.processors.FindingsPivotProcessor.initialize` | `src/main/java/com/quilr/qb/findings/processors/FindingsPivotProcessor.java:23` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.masking.EncryptMaskingKeyBootstrap.init` | `src/main/java/com/quilr/qb/masking/EncryptMaskingKeyBootstrap.java:26` | `@PostConstruct public void init()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiaccounts.AIAccountsProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiaccounts/AIAccountsProcessor.java:35` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiapps.AIAppsTableProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiapps/AIAppsTableProcessor.java:53` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiconversations.AIAppsConversationsProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiconversations/AIAppsConversationsProcessor.java:41` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiconversations.AIUsersConversationsProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiconversations/AIUsersConversationsProcessor.java:58` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.departments.DepartmentFilterQueryProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/departments/DepartmentFilterQueryProcessor.java:29` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.departments.DepartmentTableProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/departments/DepartmentTableProcessor.java:30` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.smartgroups.SmartGroupFilterQueryProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/smartgroups/SmartGroupFilterQueryProcessor.java:30` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.smartgroups.SmartGroupTableProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/smartgroups/SmartGroupTableProcessor.java:34` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.users.UsersFilterQueryProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/users/UsersFilterQueryProcessor.java:28` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.users.UsersTableDataEnrichment.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/users/UsersTableDataEnrichment.java:32` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.aiusers.users.UsersTableProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/aiusers/users/UsersTableProcessor.java:42` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.endpoint.EndpointAppSyncService.initialize` | `src/main/java/com/quilr/qb/processors/impl/endpoint/EndpointAppSyncService.java:47` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.interactions.InteractionsChatProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/interactions/InteractionsChatProcessor.java:44` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.interactions.InteractionsProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/interactions/InteractionsProcessor.java:51` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.processors.impl.quillyinteractions.QuillyInteractionsProcessor.initialize` | `src/main/java/com/quilr/qb/processors/impl/quillyinteractions/QuillyInteractionsProcessor.java:31` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.scheduler.AppAdminUsersBackfillScheduler.initialize` | `src/main/java/com/quilr/qb/scheduler/AppAdminUsersBackfillScheduler.java:48` | `@PostConstruct public void initialize()` |
| `Scheduled` | `com.quilr.qb.scheduler.AppAdminUsersBackfillScheduler.backfillAppAdminUsers` | `src/main/java/com/quilr/qb/scheduler/AppAdminUsersBackfillScheduler.java:53` | `@Scheduled( initialDelay = 60000, fixedDelay = 3600000 ) public void backfillAppAdminUsers()` |
| `PostConstruct` | `com.quilr.qb.scheduler.AppSyncScheduler.initialize` | `src/main/java/com/quilr/qb/scheduler/AppSyncScheduler.java:61` | `@PostConstruct public void initialize()` |
| `Scheduled` | `com.quilr.qb.scheduler.AppSyncScheduler.processQueue` | `src/main/java/com/quilr/qb/scheduler/AppSyncScheduler.java:73` | `@Scheduled(fixedDelayString = "${app.sync.scheduler.poll-interval-ms:5000}") public void processQueue()` |
| `Scheduled` | `com.quilr.qb.scheduler.HuntingScheduler.startScheduler` | `src/main/java/com/quilr/qb/scheduler/HuntingScheduler.java:49` | `@Scheduled(cron = "0 10 0 * * ?") // @Scheduled(cron = "0 0/1 * * * ?") // TODO only for testing public void startScheduler()` |
| `Scheduled` | `com.quilr.qb.scheduler.HuntingScheduler.scheduleAppSyncScheduler` | `src/main/java/com/quilr/qb/scheduler/HuntingScheduler.java:80` | `@Scheduled(cron = "0 0/1 * * * ?") public void scheduleAppSyncScheduler()` |
| `Scheduled` | `com.quilr.qb.scheduler.HuntingScheduler.scheduleLatestUsersSyncScheduler` | `src/main/java/com/quilr/qb/scheduler/HuntingScheduler.java:117` | `@Scheduled(cron = "0 0/1 * * * ?") public void scheduleLatestUsersSyncScheduler()` |
| `Scheduled` | `com.quilr.qb.scheduler.HuntingScheduler.scheduleAppsDbToAppTenantSettingsSync` | `src/main/java/com/quilr/qb/scheduler/HuntingScheduler.java:138` | `@Scheduled(cron = "0 0 0/1 * * ?") public void scheduleAppsDbToAppTenantSettingsSync()` |
| `Scheduled` | `com.quilr.qb.scheduler.MasterDataBootstrap.scheduledRunOnce` | `src/main/java/com/quilr/qb/scheduler/MasterDataBootstrap.java:59` | `@Scheduled(initialDelayString = "${masterdata.bootstrap.schedule-after-ms:20}", fixedDelayString = "${masterdata.bootstrap.fixed-delay-ms:9223372036854775807}") public void scheduledRunOnce()` |
| `PreDestroy` | `com.quilr.qb.scheduler.MasterDataBootstrap.shutdownExecutor` | `src/main/java/com/quilr/qb/scheduler/MasterDataBootstrap.java:81` | `@PreDestroy public void shutdownExecutor()` |
| `PostConstruct` | `com.quilr.qb.service.AIAccountsServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/AIAccountsServiceImpl.java:27` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.AIAppsServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/AIAppsServiceImpl.java:73` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.AIConversationsServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/AIConversationsServiceImpl.java:64` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.AIUsersServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/AIUsersServiceImpl.java:102` | `@PostConstruct public void initialize()` |
| `Async` | `com.quilr.qb.service.AuditService.auditSmartGroupChange` | `src/main/java/com/quilr/qb/service/AuditService.java:41` | `@Async public void auditSmartGroupChange(String eventCode, String task, String logLevel, String groupName, Map<String, Object> extraInfo, String subscriber, String tenant, String actionedBy, String ipAddress)` |
| `Async` | `com.quilr.qb.service.AuditService.auditUserAppApprovalChange` | `src/main/java/com/quilr/qb/service/AuditService.java:61` | `@Async public void auditUserAppApprovalChange(String eventCode, String task, String logLevel, String appId, String userMail, Map<String, Object> extraInfo, String subscriber, String tenant, String actionedBy, String ipAddress)` |
| `Async` | `com.quilr.qb.service.AuditService.auditSensitiveDataUnmask` | `src/main/java/com/quilr/qb/service/AuditService.java:82` | `@Async public void auditSensitiveDataUnmask(String eventCode, String task, String logLevel, Map<String, Object> extraInfo, String subscriber, String tenant, String actionedBy, String ipAddress)` |
| `Async` | `com.quilr.qb.service.AuditService.auditAppSyncChange` | `src/main/java/com/quilr/qb/service/AuditService.java:101` | `@Async public void auditAppSyncChange(String eventCode, String task, String logLevel, Map<String, Object> extraInfo, String subscriber, String tenant, String actionedBy, String ipAddress)` |
| `PostConstruct` | `com.quilr.qb.service.CHCleanupService.initialize` | `src/main/java/com/quilr/qb/service/CHCleanupService.java:49` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.EndpointSyncServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/EndpointSyncServiceImpl.java:58` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.GlobalAppCacheService.initialize` | `src/main/java/com/quilr/qb/service/GlobalAppCacheService.java:80` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.GlobalAppDetailsService.initialize` | `src/main/java/com/quilr/qb/service/GlobalAppDetailsService.java:47` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.NonAIAppsServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/NonAIAppsServiceImpl.java:29` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.TenantAppCacheService.initialize` | `src/main/java/com/quilr/qb/service/TenantAppCacheService.java:38` | `@PostConstruct public void initialize()` |
| `PostConstruct` | `com.quilr.qb.service.TenantAppSettingsService.initialize` | `src/main/java/com/quilr/qb/service/TenantAppSettingsService.java:72` | `@PostConstruct public void initialize()` |
| `Async` | `com.quilr.qb.service.TenantAppSettingsService.onApplicationReady` | `src/main/java/com/quilr/qb/service/TenantAppSettingsService.java:85` | `@Async @EventListener(ApplicationReadyEvent.class) public void onApplicationReady(ApplicationReadyEvent event)` |
| `EventListener` | `com.quilr.qb.service.TenantAppSettingsService.onApplicationReady` | `src/main/java/com/quilr/qb/service/TenantAppSettingsService.java:85` | `@Async @EventListener(ApplicationReadyEvent.class) public void onApplicationReady(ApplicationReadyEvent event)` |
| `PostConstruct` | `com.quilr.qb.service.WidgetsServiceImpl.initialize` | `src/main/java/com/quilr/qb/service/WidgetsServiceImpl.java:33` | `@PostConstruct public void initialize()` |
| `Bean` | `com.quilr.QBApp.decoder` | `src/main/java/com/quilr/QBApp.java:38` | `@Bean public Decoder decoder()` |
| `PreDestroy` | `com.quilr.QBAppListener.onExit` | `src/main/java/com/quilr/QBAppListener.java:30` | `@PreDestroy public void onExit()` |
| `Bean` | `com.quilr.SecurityConfig.filterChain` | `src/main/java/com/quilr/SecurityConfig.java:36` | `@Bean public SecurityFilterChain filterChain(HttpSecurity http, Decoder decoder, RequestFilter requestFilter) throws Exception` |
| `Bean` | `com.quilr.SecurityConfig.corsConfigurationSource` | `src/main/java/com/quilr/SecurityConfig.java:55` | `@Bean public CorsConfigurationSource corsConfigurationSource()` |

## Invocation and shutdown model

- `@PostConstruct` methods run when their lazily initialized beans are first created; because `spring.main.lazy-initialization=true`, not every such method is guaranteed to run at process startup unless another eager bean demands it. This is a Spring-framework inference grounded in the checked configuration and annotations.
- `@Scheduled` methods are framework-invoked once their containing bean is instantiated and registered.
- `@Async` changes execution only when calls cross a Spring proxy; self-invocation does not. Each caller must be checked before asserting asynchronous execution.
- `@PreDestroy` methods are invoked during managed bean destruction on a graceful Spring context shutdown. Abrupt process/container termination can bypass cleanup.
