# Dead, legacy, experimental, and incomplete code

Classification here follows repository-wide exact-name/import searches, Spring/Next conventions, annotations, reflection-like registries, and framework entry points. “No direct caller” alone was not sufficient.

## Fully comment-disabled Java files

The following 13 tracked `.java` files contain no active declaration after comments are excluded. They are not compiled symbols, Spring beans, or registration targets:

1. `src/main/java/com/quilr/qb/common/BehaviorIds.java`
2. `src/main/java/com/quilr/qb/processors/impl/aiapps/AIAppGrpByAppProcessor_bkp.java`
3. `src/main/java/com/quilr/qb/processors/impl/aiapps/backup/AIAppGrpByAppProcessor_union_wrk.java`
4. `src/main/java/com/quilr/qb/processors/impl/aiapps/backup/AIAppGrpByAppProcessor_v2_30jul.java`
5. `src/main/java/com/quilr/qb/processors/impl/aiapps/backup/AIAppsProcessor.java`
6. `src/main/java/com/quilr/qb/processors/impl/aiapps/backup/AIAppsProcessorImpl.java`
7. `src/main/java/com/quilr/qb/processors/impl/aiapps/backup/AIAppsProcessorImpl_30jul.java`
8. `src/main/java/com/quilr/qb/processors/impl/aiusers/KPISensitiveUploadUsersProcessor.java`
9. `src/main/java/com/quilr/qb/processors/impl/aiusers/KPITopDepartmentsProcessor.java`
10. `src/main/java/com/quilr/qb/processors/impl/aiusers/TableDepartmentProcessor.java`
11. `src/main/java/com/quilr/qb/processors/impl/aiusers/TableSmartGroupsProcessor.java`
12. `src/main/java/com/quilr/qb/processors/impl/aiusers/TableUsersProcessor.java`
13. `src/main/java/com/quilr/qb/processors/impl/aiusers/users/UsersTableQueryFormatter.java`

Classification: **legacy/comment archive**. They preserve old implementations in the production tree but have no runtime effect.

## Manual/demo production classes

| Symbol/file | Evidence | Classification |
| --- | --- | --- |
| `CHLatestTest.main` | production source, hard-coded ClickHouse cloud connection/query, prints output, no caller | manual demonstration executable; sensitive legacy diagnostic |
| `TestDateJava.main` | parses/prints one fixed date and current year, no caller | manual scratch executable |

Both are technically invokable public Java mains, so “dead” would overstate the evidence. They are not the packaged Spring Boot main class and have no build/CI invocation.

## Backend incomplete implementations

### `FindingsWhitelistService`

The service checks account existence in Neo4j, then:

- logs `TODO: Create account ... in Neo4j` instead of calling creation;
- logs `TODO: Create whitelist entry in ClickHouse DB` instead of persisting it.

Classification: **active service with placeholder side effects**. Any response implying those specific writes completed would be misleading.

### `CHCleanupService`

It is a Spring component and has an annotated `initialize`, but the initializer's cleanup body is commented. Repository-wide searches found no active caller to its cleanup methods.

Classification: **Dead-code candidate / dormant maintenance service**. It remains injectable by convention, so dynamic use outside this repository is unresolved.

### Executive dashboard widget 4

The executive row-one service identifies widget 4 as a stub. Other widgets use Neo4j/ClickHouse. Classification: **placeholder slot**, not an implemented metric.

### Hunting daily schedule

`HuntingScheduler.startScheduler` is actively scheduled at 00:10, but its scheduler list is empty at this commit. The method runs and logs/iterates without actual hunt work.

Classification: **active no-op scheduled entry point**, not dead.

### Abstract processor defaults

`AbstractQueryProcessor` supplies default methods that return empty `ServiceResponse` objects. Concrete processors can inherit them without an explicit unsupported error.

Classification: **permissive stub/default API**. Each concrete caller must be checked; the base methods are not globally dead.

### Filter update success masking

The AI conversation filter update implementation catches failure paths yet can return `true`.

Classification: **incomplete/incorrect failure signaling**, not placeholder.

### Findings posture cache stage

The startup initializer's POSTURE branch is commented while other categories are populated.

Classification: **disabled implementation path**.

## Frontend backup/old artifacts

These tracked filenames explicitly preserve copies:

- `src/app/Components/DynamicTable/index copy._backup`
- `src/app/Components/InfinityLoader/index.old.css`
- `src/app/Components/InfinityLoader/index.old.tsx`
- `src/app/Components/PaginationSWR/index_backup.tsx`
- `src/app/Components/UserAvatar/index copy.tsx`
- `src/app/[lng]/integration/IntegrationPageBase.tsx.backup`
- `src/app/[lng]/onboard/Components/CongratsPopup/index.old.tsx`
- `src/app/[lng]/onboard/Components/SuccessfulPopup/index.old.tsx`

No active import resolving to these backup/old paths was found. Several suffixes are not normal TypeScript module extensions and will not be compiled by the configured source glob/Next import graph unless explicitly loaded.

Classification: **legacy backup artifacts / dead-code candidates**. They remain individually accounted for in the inventory.

## Frontend unused/dormant candidates

| File/symbol | Search and framework evidence | Classification |
| --- | --- | --- |
| `refreshAuthTokenMiddleware` | exported and imported by `src/proxy.ts`, but never called | dormant implementation in active module; refresh instead occurs in Axios |
| `ServerApiService` / `serverApiService` | export found, no active consumer found | dead-code candidate; server API abstraction |
| `src/app/Utils/test.ts::Test` | no consumer found | scratch/dead-code candidate |
| `testSingleTon.ts::TestSingle` | imported by `AxiosService` but never read | unused import/object |
| `POST /api/cookie` | filesystem route is always externally reachable, but only in-repository call is commented | no active internal consumer; **not dead as an HTTP entry point** |
| `gatewaysApi.service.ts` in LLM gateway | internal agent reference and imports show active inventory bypasses it | unused alternative service candidate |

## Frontend explicit TODOs

These are implementation gaps, not inferred from names:

| Location | Missing behavior |
| --- | --- |
| `src/components/ai-assets/AssetsTable.tsx` | add-assets functionality |
| `src/components/integration/mcp-gateway/mcp-clients/MCPClientsBase.tsx` | delete API integration |
| `src/components/ai-axis/ai-agent/aiAgentUtils.tsx` | deactivate, duplicate, and delete actions |
| `src/components/ai-axis/ai-agent/drawer/tabs/Activity.tsx` | actual backend ID |
| `src/components/ai-axis/ai-agent/drawer/tabs/Guardrails.tsx` | save guardrails configuration |
| three compliance drilldown components | detailed detection scoring replacement |
| `src/components/settings/ai-getway/integrations/hooks/useIntegrationFormHandlers.ts` | actual integration save and key-generation APIs |
| MCP server card | logo URL |

Classification: **partially implemented user features**. UI presence must not be interpreted as completed mutation behavior.

## Feature-gated code

Checked defaults disable adversarial/insider features, data insights, executive dashboard, decision sidebar, lens, and event/prompt areas; new user drawer defaults enabled.

Feature-disabled code is **experimental/gated**, not dead. Environment/config changes may make it reachable, and imports/routes still exist.

## Unmapped/stale interface artifacts

| Artifact | Evidence | Classification |
| --- | --- | --- |
| frontend `GET /aiconversations/filters/app/users` | no compatible backend mapping; backend has POST `/aiconversations/filters/users` | stale/incompatible call candidate |
| frontend `/findings/kpi` | no mapped backend route; KPI-related code exists through other endpoints/commented mapping | stale call or incomplete backend route |
| base `/executive/dashboard`, `/status-events`, `/` config strings | used as prefixes/types | not endpoints and not dead |
| dynamic `/whitelisting/{url}` | suffix selected at runtime and maps to behavior routes | statically unresolved, not dead |

## Commented configuration and pipelines

- alternate PostgreSQL, ClickHouse, and Neo4j connection blocks in YAML are historical comments;
- `Jenkinsfile.dev` retains a complete older commented build/push stage;
- Kubernetes security contexts, volumes, image pull secrets, and ConfigMap `envFrom` are commented;
- Maven's older standard compiler build block is commented and replaced by the skip configuration;
- numerous old query fragments and testing crons remain comments.

Classification: **configuration history**, not active infrastructure.

## Dead-code claim limitations

The following could not be excluded:

- reflection/dynamic use from private dependencies;
- external scripts invoking public HTTP routes or public Java mains;
- feature flags/configuration not represented in checked-in values;
- Next dynamic string imports not expressible as literal paths;
- runtime processor names supplied by remote callers.

Accordingly:

- Spring beans with no local caller are “dead-code candidates,” not conclusively dead.
- HTTP route handlers remain entry points even without a frontend caller.
- named query processors remain public dispatch targets through `QueryProcessorFactory`.
- static assets can be referenced through constructed URLs/CSS and are classified/grouped rather than called unused.

## Supporting-source incomplete or inconsistent behavior affecting the targets

The following behavior is outside the two target repositories but is executed through their resolved dependencies or delivery workflow. It is included here because the dynamic/source follow-up made those dependency implementations directly inspectable.

| Supporting symbol/path | Verified behavior | Classification / target effect |
| --- | --- | --- |
| `quilr-common-lib/quilr-dw-client/.../redis/RedisServiceImpl.saveEntity` | accepts `expireInSeconds` but always calls `SETEX` with `3600` | incomplete parameter implementation; target cache callers cannot select the requested entity TTL through this method |
| `RedisServiceImpl.getFetchUserInfo` / `deleteFetchUserInfo` | read key is `ft_users:<tenant>_<email>`; delete key is `ft_users.<tenant>.<email>` | inconsistent key construction; delete normally targets a different key |
| `RedisCacheServiceImpl.closeCache` | method body is empty despite its cleanup TODO | cleanup stub; no Redis/graph client close is performed there |
| `RedisCacheServiceImpl.getAppDetails` | branch condition is `redAppDetails == null || redAppDetails != null`, which is always true | incomplete/test branch left active; graph lookup runs even on a Redis cache hit and the cache-hit `else` is unreachable |
| `RedisLockService.popFromSet` | reads members and later removes them as separate operations; a two-consumer live test returned all 800 members to both callers | non-atomic queue/set claim; duplicate delivery is dynamically verified under concurrent direct consumers |
| `@quilrbusiness/quilr-components` test suite | after explicitly providing its declared React peers, 12/18 suites and 90/113 tests passed; 6 suites/23 tests failed | supporting component package builds, but its inspected test suite is not green |
| reusable GitHub Actions workflow at `ci-scripts@cf687f6a1713498d2843f0f60a8ddf30d672775d` | both exact target-commit runs passed detection and skipped their application build jobs because the repositories were absent from the library allowlists | incomplete target CI verification; green top-level runs are not compile/test evidence |

These findings do not change the target-file inventory denominator. The supporting repositories were pinned and used only to resolve behavior actually consumed by the targets.
