# Documentation consistency audit

The query-builder has no README or architecture document at the pinned commit. Its documentary evidence is source comments/Javadocs, OpenAPI annotations, configuration comments, SQL, and CI comments. The web repository has a generic README, three root plan documents, eleven `for_coding_agents` reference/data files, and workflow comments.

Documentation was treated as a claim source and checked against imports, routes, symbols, active statements, and framework registrations.

## Contradiction table

| Documentation claim | Source | Actual code evidence | Result |
| --- | --- | --- | --- |
| master encryption key has no committed default and must come from environment | backend `application.yml` comment | YAML placeholder and `EncryptMaskingKeyBootstrap.@Value` both contain the same nonempty Base64 fallback | **Contradicted** |
| application-ready listener starts consumers and exit cleanup stops them | `QBAppListener` comments | `onApplicationEvent` and private cleanup only log; no consumer start/stop call | **Contradicted** |
| interaction/query result maximum is 10,000 | `ClickhouseOpsProcessor` comment/message | query executes and materializes first; only adds a warning when result size is `>= 10000` | **Partially confirmed; limit not enforced** |
| ClickHouse update endpoint executes UPDATE/DELETE/ALTER | processor Javadoc | finite blocklist allows any other statement, including `INSERT`; no required-prefix check | **Broader than documented** |
| cache TTL environment variables control tenant/global app caches | YAML names/comments | YAML populates `redis.*`; services read `cache.*` | **Contradicted / ineffective wiring** |
| decoder excludes query-builder DWH | YAML excluded-path | local controllers map `/dwh/**`; excluded value is `/quilr-query-builder/dwh`; known NGINX/BFF routing strips the service prefix and decoder uses an `AntPathRequestMatcher` | **Contradicted at inspected commits/configuration** |
| findings whitelist creates missing Neo4j accounts and ClickHouse entry | service comments/TODO description | creation calls are commented and replaced by TODO logs | **Planned but not implemented** |
| POSTURE findings cache population participates in startup | initializer/process intent | POSTURE stage is commented | **Not implemented in current path** |
| ClickHouse cleanup initializes cleanup | `CHCleanupService` class/method names | `@PostConstruct initialize` body is commented/no-op and no active caller was found for cleanup methods | **Dead/incomplete implementation** |
| Next PostHog path is same-origin with no locale prefix | `next.config.js` rewrite comment | all three implemented sources begin `/:lng/ingest/` | **Contradicted** |
| refresh middleware participates in the request proxy | import/name and middleware file | imported in `src/proxy.ts` but not called in the exported proxy | **Implementation absent from active flow** |
| web container runs as created `nextjs` user | Docker stage sequence implies non-root intent | both Dockerfiles execute `USER nextjs`, then `USER root` before `CMD` | **Contradicted by effective instruction order** |
| ConfigMaps are deployment configuration | ConfigMap files and commented deployment section | `envFrom` is commented; equivalent values are inline in deployments | **Artifact exists but is unused** |
| ConfigMap has one external auth cookie value | YAML logical map | key appears twice in both environments | **Contradicted / invalid duplicate intent** |
| Maven project compiles Java 21 | POM properties/source/target | clean Java 21/Maven 3.9.11 package passed; executable JAR contains 370 application classes and 158 nested JARs | **Confirmed dynamically despite unusual compiler-plugin block** |
| query-builder supports metrics/Prometheus/shutdown actuator endpoints | YAML management configuration | resolved build supplies Actuator transitively; live health, mappings, and env endpoints responded | **Partially confirmed:** registration/runtime verified; Prometheus/shutdown operations were not invoked |
| README says edit `app/page.tsx` | web README | application is under `src/app/[lng]` with 112 pages; no root `app/page.tsx` | **Outdated** |
| README says Inter is loaded with `next/font` | web README | repository-wide source search did not confirm the described default template behavior as the application identity | **Not verifiable / likely template residue** |
| README offers npm, Yarn, pnpm, or Bun | Getting Started | same README later says “Please use npm only”; only `package-lock.json` is committed | **Internally contradicted; npm is implemented** |
| README package reference is `"quilr-components": "github:..."` | README UI library section | package manifest uses `@quilrbusiness/quilr-components@^0.2.79` from private registry | **Outdated** |
| README environment examples are complete | README | `.env.example` and 30+ code/build references contain additional variables | **Incomplete/outdated** |
| self-service users get a separate limited shell and are forced to the route | `for_coding_agents/SELF_SERVICE_DASHBOARD.md` | auth middleware detects `accessMode: self_service`, redirects to `/<lng>/self-service`; `AppLayout` bypasses admin chrome | **Confirmed** |
| self-service does not fetch normal admin permissions | same | OAuth/auth and self-service code branch around permission behavior | **Confirmed in inspected flow** |
| MCP gateway shares the `ai-getway` settings shell and has route sharp edges | `for_coding_agents/mcp-gateway.md` | exact directories/routes and unlocalized/hard-coded navigation exist | **Confirmed** |
| LLM gateway active inventory uses direct hooks while a service exists unused | `for_coding_agents/llm-gateway.md` | import/reference search matches the described active component and unused service candidate | **Confirmed** |
| OpenAI compliance screens call `compliance-dlp/*` | `for_coding_agents/openai_compliance.md` | web API builders reference those external service paths; query-builder does not implement them | **Frontend confirmed; backend outside these repos** |

## Web README audit

The README begins with a non-descriptive `#test-changes-ecr-sync-imagetag` line and retains Create Next App boilerplate. Accurate portions:

- `npm run dev` exists;
- default port 3000 is used;
- npm is the repository's implemented lockfile/package workflow;
- server/client i18n modules exist;
- a Verdaccio-oriented `localInstall` script exists.

Outdated or incomplete portions:

- alternative package manager commands conflict with “npm only” and have no lockfiles;
- edit path is wrong;
- environment reference omits most variables and shows repeated base URLs;
- private component dependency syntax/version/source is stale;
- code fence/section formatting around Verdaccio steps is malformed;
- no build, lint, typecheck, private Nexus, Docker, Kubernetes, authentication, test, or architecture guidance is current.

Status: **outdated scaffold plus partial developer notes**, not an operational source of truth.

## `for_coding_agents` reference audit

### Confirmed implementation maps

The self-service, LLM gateway, MCP gateway, and OpenAI compliance references contain unusually concrete file paths and “sharp edge” warnings. Those paths were checked against the inventory and symbol index. Their principal frontend route/component claims agree with current code.

They should still not be read as backend contracts:

- LLM/MCP/config-manager/compliance service implementations live outside query-builder for many paths.
- response examples in those references demonstrate the frontend's expected shape, not server-schema proof in these two repositories.
- “permission” language often refers to frontend checks; external backend policy is unresolved.

### Text/JSON screen specifications

Files such as `apps_screen.txt`, `detection_models_screen.txt`, `endpoint_agent_config.txt`, `v2_findings.txt`, `v2_inventory_screen.txt`, `v2_red_teaming.txt`, and `blast_radius_sample.json` are design/reference inputs. They are not executed, imported application modules, schemas, or tests unless a source reference explicitly consumes them.

Classification: **documentation/design evidence**. Features described there were only marked implemented where the route/component/API code exists.

## Plan documents

`plan_self_service_and_audit_logs_llmgateway.md`, `platform_docs_plan.md`, and `updating_openai_compliance_plan.md` describe intended work and release/documentation procedures. They contain a mixture of already implemented paths and future/checklist language.

Rules applied in this analysis:

- checked/worded completion was not accepted without code;
- a named endpoint outside the two repos is treated as an expected external contract;
- a TODO/plan item with no route/component/import remains **Documentation-only**;
- current source wins when a plan's filename/path has drifted.

The release-notes workflow actually uses an AI tool to edit a separate `platformdocs` repository and open a pull request. That confirms the documentation workflow exists, not the correctness of generated external docs.

## Source comments and names that overstate behavior

| Source | Overstatement | Implemented reality |
| --- | --- | --- |
| `HuntingScheduler.startScheduler` | name suggests daily hunt jobs | active list is empty, so daily method performs no actual scheduler work |
| `MasterDataBootstrap` run-once schedule | scheduler appears periodic | fixed delay defaults to `Long.MAX_VALUE`, making it practical one-shot |
| `FindingsWhitelistService` | class implies complete whitelist persistence | two important graph/ClickHouse writes are TODO-only |
| `CHCleanupService` | component/service implies cleanup startup | initializer is no-op and methods have no active caller |
| `Widget4` executive comment | widget slot exists | implementation is a stub |
| `ServerApiService` | name implies server API path | no active consumer found |
| `/api/cookie` comments in Axios | route might persist server cookie | calls are commented; route has no confirmed active consumer |
| files suffixed `_bkp`, `backup`, `_wrk`, `_30jul` | may look like alternatives | thirteen Java files are entirely comment-disabled; active imports use current processors |

## Implementation-only behavior

Notable behavior with no adequate README/architecture coverage:

- every Spring authorization request is locally `permitAll` while an external decoder still runs;
- seven method-level permission operations and the many unannotated administrative routes;
- raw-header tenant/subscriber fallback;
- ad-hoc ClickHouse SQL endpoints and their shared code;
- browser-readable token/refresh cookie;
- 53 frontend pages with no matching permission rule;
- seven background schedules, Redis locks/markers, and queue-loss behavior;
- PostgreSQL whitelist as the only local JPA entity;
- cross-store partial failure;
- root container execution;
- current encryption and legacy AES/ECB decrypt compatibility;
- both Next route handlers and their trust boundaries.

## Documentation-only or unverified behavior

- real identity-issuer and deployed PDP/gateway-global policy;
- live ClickHouse/Neo4j schema drift, grants, data, and operational topology;
- current rendered production Kubernetes/Vault/registry state;
- complete LLM/MCP/compliance/config-manager backend contracts;
- comments suggesting consumers/cleanup/startup work where bodies only log or are commented.

## Contradictions resolved with external/runtime evidence

| Documentation/workflow claim | Evidence | Result |
| --- | --- | --- |
| reusable target workflow comments imply an application compile/publish gate | exact query-builder run `30017726685` and web run `30077640570` had skipped build jobs because neither repo is in the library allowlist | **Contradicted** |
| Maven compiler `<skip>true>` might prevent main compilation | unmodified Java 21/Maven 3.9.11 package succeeded and produced 370 application-class entries | **Resolved** |
| route-prefix behavior was unknown | NGINX rewrite source, BFF mount source, and live BFF echo trace | **Confirmed** prefix-only stripping |
| `/aiconversations/filters/app/users` might be gateway-rewritten | known routing removes only `/bff` and service prefix; no method/suffix transformation | **Contradicted** at inspected commits |
| `/findings/kpi` might be gateway-synthesized | target mapping is commented and known routing is prefix-only | **Not implemented by inspected target/routing sources** |
| Actuator availability was uncertain because no direct dependency is declared | live JAR exposed Actuator mappings/health/environment/metrics handlers | **Confirmed transitively** |
| target green CI conclusions might serve as build evidence | exact application jobs skipped | **Contradicted** |
| component package looks test-covered because 18 Jest suites exist | with declared peers, 6/18 suites and 23/113 tests failed | **Partially confirmed; suite not green** |
