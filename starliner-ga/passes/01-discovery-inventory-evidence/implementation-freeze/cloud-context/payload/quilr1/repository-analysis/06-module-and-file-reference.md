# Module and file reference

Every tracked file is listed in the two inventories:

- [328 query-builder files](inventory/quilr-query-builder-files.md)
- [2,575 web files](inventory/quilr-web-files.md)

Every parser-recognized source declaration is separately indexed:

- [2,498 Java declarations](07-symbol-reference/quilr-query-builder-symbol-index.md)
- [33,512 TypeScript/JavaScript declarations](07-symbol-reference/quilr-web-symbol-index.md)

## Query-builder directory map

| Path | Files | Role and relationships |
| --- | ---: | --- |
| root / `.github` | 11 | Maven/Nexus, Jenkins, Docker, reusable CI/security workflows, precheck scripts |
| `db/` | 1 | standalone ClickHouse dashboard query examples; no migration runner references it |
| `src/main/resources` | 5 | Spring configuration, mock conversation JSON, gen-AI app names, two master-data CSVs |
| `com.quilr` | 4 | Spring executable/listener/security plus standalone ClickHouse test main |
| `com.quilr.config` | 5 | CORS/security properties, request filter/context headers, Tomcat error-page config |
| `com.quilr.entities`, `com.quilr.repository` | 3 | only local JPA entity/embedded ID/repository |
| `qb.controller` | 22 | main Spring MVC controllers |
| `qb.aiassets` | 21 | asset constants, DTOs, row mappers, DAO, service, controller |
| `qb.audit` | 14 | audit SQL, DTOs, repositories, services, controllers |
| `qb.findings` | 33 | mappings, graph bootstrap, query constants, processors, postprocessors, whitelist services, browser-extension client |
| `qb.processors` | 3 | processor interface, abstract base, name-to-bean factory |
| `qb.processors.impl` | 87 | named dashboard processors, SQL/query formatters, mappers, interaction strategies |
| `qb.service` | 39 | domain services, cache/sync, guardrails, cleanup, user/app operations |
| `qb.repository` | 4 | status-event repository/query implementation |
| `qb.scheduler` | 4 | periodic app/user sync, Redis queue, app-admin backfill, master-data bootstrap |
| `qb.executive`, `qb.device`, `qb.redteam`, `qb.mcpgateway` | 19 | dedicated feature services/queries |
| `qb.common`, `qb.config`, `qb.util`, `qb.masking` | 22 | headers, caches, Redis, executors, time/JSON/JDBC helpers, encryption |

Thirteen `.java` files are entirely comment-disabled. They have no parsed package or declaration and are cataloged in [dead/incomplete code](19-dead-legacy-and-incomplete-code.md).

## Backend detailed symbol groups

The generated group files contain an entry for every Java type, field, constant, constructor, and method, including exact signature, compact implementation, direct calls, control-flow counts, and test evidence:

- [bootstrap and persistence](07-symbol-reference/backend/README.md)
- [controllers](07-symbol-reference/backend/controller.md)
- [services](07-symbol-reference/backend/service.md)
- [processors](07-symbol-reference/backend/processors.md)
- [findings](07-symbol-reference/backend/findings.md)
- [configuration/common/utilities](07-symbol-reference/backend/config.md)
- [audit, AI assets, device, executive, red team, MCP, masking, DTOs and repositories](07-symbol-reference/backend/README.md)

## Web directory map

| Path | Approximate tracked source scope | Role |
| --- | ---: | --- |
| root | 30 artifacts | Next/npm/TypeScript/ESLint/Prettier/PostCSS/Tailwind config, Docker/Jenkins, instrumentation, scripts, planning docs |
| `.github` | 15 | reusable CI/security, branch synchronization, release-note generation |
| `deployment` | 6 | dev and preprod ConfigMap/Deployment/Service |
| `for_coding_agents` | 11 | internal implementation guides and one sample JSON artifact |
| `src/app` | 1,000+ | App Router routes plus legacy/page-local components, types, utilities and assets |
| `src/components/settings` | 438 | largest domain: organization, endpoint, browser extension, AI/LLM/MCP gateway, controls |
| `src/components/ai-assets` | 143 | inventory, compliance, endpoint/LLM/MCP/browser source views and drawers |
| `src/components/findings` | 89 | finding insights/streams/widgets, gateway and compliance findings |
| `src/components/apps` | 84 | active AI application table/drawers plus non-AI apps |
| `src/components/integration` | 68 | MCP integration/gateway components |
| `src/components/ai-axis` | 49 | shared application/account/user tables and AI-axis views |
| `src/components/home` | 41 | insight/executive/dashboard widgets |
| `src/components/users` | 37 | users table, drawer, conversation and lens surfaces |
| `src/components/data-detections` | 37 | detection-model tabs, editors, API constants |
| other component domains | 200+ | policies, controls, lens, self-service, exports, browser extension, data risks, notifications, UI primitives |
| `src/hooks` | 20 | sidebar, duration, query/filter, permission-adjacent and capability hooks |
| `src/utils` | 19 | API surfaces, request wrappers, permissions, storage, formatting and routing |
| `src/store` | 7 | Jotai stores for filters, layout, timezone, detection config and navigation handoff |
| `src/types` | 24 | shared TypeScript API/view contracts |
| `src/Middlewares`, `src/proxy.ts`, `src/config` | 6 | locale/auth proxy and page-permission policy |

Counts by exact file and byte size remain in the inventory. Counts by declarations are in the frontend group index.

## Frontend detailed module groups

The [frontend symbol-reference index](07-symbol-reference/frontend/README.md) divides all 2,439 TS/JS-family modules into 65 domain files. For each module it records:

- line count and client/server directive;
- imports and exports;
- App Router role;
- every top-level type/interface/enum/variable and field;
- every function/method/functional component, parameters/defaults, inferred or explicit return type;
- compact body, direct call targets, and structural effect counts.

Important groups include:

- [auth](07-symbol-reference/frontend/auth.md), [login](07-symbol-reference/frontend/login.md), [middleware](07-symbol-reference/frontend/middleware.md)
- [apps](07-symbol-reference/frontend/apps.md), [users](07-symbol-reference/frontend/users.md), [findings](07-symbol-reference/frontend/findings.md)
- [AI assets](07-symbol-reference/frontend/ai-assets.md), [AI axis](07-symbol-reference/frontend/ai-axis.md)
- [settings](07-symbol-reference/frontend/settings.md), [integration](07-symbol-reference/frontend/integration.md)
- [data detections](07-symbol-reference/frontend/data-detections.md), [controls](07-symbol-reference/frontend/control-management.md)
- [self service](07-symbol-reference/frontend/self-service.md), [hooks](07-symbol-reference/frontend/hooks.md), [utilities](07-symbol-reference/frontend/utils.md), [types](07-symbol-reference/frontend/types.md)

## Non-source and generated classification

- `package-lock.json` is npm-generated and committed; it is runtime/build critical because it pins private Nexus-resolved packages.
- `next-env.d.ts` is generated by Next.js and committed.
- Static images/SVG/GIF/font-like artifacts are individually inventoried but behaviorally grouped as UI assets.
- No vendored source tree, submodule, or LFS pointer was found.
- `.cate`, `.vscode`, `.husky`, and editor/config artifacts are operational support files, not application modules.
- Private package code under Maven/npm dependencies is not copied into this analysis and is an external evidence boundary.
