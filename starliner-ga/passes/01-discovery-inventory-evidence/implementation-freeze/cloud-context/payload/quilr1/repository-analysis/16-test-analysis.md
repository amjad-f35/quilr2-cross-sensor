# Test analysis

## Finding

**Verified:** neither pinned repository contains a tracked automated unit, integration, end-to-end, contract, property, security, or performance test suite.

Discovery covered:

- all tracked paths containing common `test`, `spec`, and `__tests__` patterns;
- Java `src/test` and test annotations/framework imports;
- JavaScript package scripts and Jest/Vitest/Playwright/Cypress configuration;
- CI/Jenkins command bodies;
- disabled/skipped test markers;
- manual executables and smoke scripts whose names contain “test”.

There is no `quilr-query-builder/src/test` tree. `quilr-web/package.json` has no `test` script and no test-runner dependency/configuration.

## Artifacts that look like tests but are not automated suites

### `CHLatestTest`

**Location:** `quilr-query-builder/src/main/java/com/quilr/CHLatestTest.java`

This is a production-source `main` method, not a JUnit test. It:

1. builds the newer ClickHouse client with a hard-coded cloud endpoint, username, and password;
2. executes a fixed query against `users_with_json`;
3. waits up to ten seconds;
4. prints every selected column;
5. catches and prints exceptions;
6. closes the client.

It contains no assertion and is not invoked by Maven as a test. The embedded credential is distinct from the active YAML fallback and should be treated as committed sensitive material, not as a fixture.

### `TestDateJava`

**Location:** `quilr-query-builder/src/main/java/com/quilr/qb/processors/impl/aiapps/TestDateJava.java`

Another production-source `main` method. It parses `"01 Jul 2025"`, prints `2025-07-01`, and prints the current year. There are no assertions or registrations.

### Frontend `test.ts` and `testSingleTon.ts`

These are ordinary source utilities:

- `test.ts` creates a cookie-reading singleton with a no-op `printValue`.
- `testSingleTon.ts` exports a singleton whose `data` is `"abc"`.

`AxiosService` imports `TestSingle` but does not use it. These files are not a test framework.

React components with names such as `AITest`, `PresetTest`, `RunTestButton`, `TestTypeSelector`, `TestAndRefine*`, and `ReviewTest` implement product UI for running/configuring tests. They are not repository verification suites.

### `quilr-saas-test-sync.yml`

Despite “test” in its filename, this workflow synchronizes branch content:

1. checks out `main`;
2. fetches and preserves selected files from `dev-onprem`;
3. deletes the remote `dev-onprem` branch;
4. recreates it from `main`;
5. restores/commits selected environment files;
6. force-like replaces branch history by deleting/pushing.

It performs no assertions or test command.

## Manual guardrail smoke script

**Location:** `quilr-web/scripts/llm-gateway-guardrails-smoke-test.mjs`  
**Size:** 712 lines  
**Package script:** none; invoked directly with Node

This is the only verification-oriented executable found.

### Inputs

| Input | Flag | Environment equivalent | Default behavior |
| --- | --- | --- | --- |
| target URL | `--base-url` | `GUARDRAILS_BASE_URL` | committed remote Quilr URL |
| app | `--app` | `LLM_GATEWAY_APP_NAME` | committed app name |
| tenant | `--tenant` | `TENANT` | committed UUID |
| subscriber | `--subscriber` | `SUBSCRIBER_ID` | committed UUID |
| bearer | `--token` | `AUTH_TOKEN` | `"dummy"` |
| mutate | `--apply` | none | false/dry run |
| retain mutation | `--no-restore` | none | restore true |
| reset test EDMs | `--reset-test-edms` | none | false |

### Behavior

Default invocation reads the remote application configuration, validates UI split/shape, computes and prints a planned mutation, and stops without saving.

With `--apply` it:

1. reads and clones original configuration;
2. enables/disables selected data-risk/EDM categories and sets scopes, sensitivity, and actions;
3. posts the configuration;
4. reads it back and asserts expected values;
5. restores original values by default;
6. reads again and verifies restoration.

If verification throws after a save and restoration is enabled, the catch block attempts restoration before rethrowing. `--no-restore` intentionally leaves external state changed.

Assertions cover:

- UI category split;
- inherited versus explicit actions;
- scope/sensitivity/enabled fields for chosen risk/EDM IDs;
- disabled contextual categories;
- restored values matching the original.

Limitations:

- operates against a remote live-like service and needs tenant credentials;
- not registered in npm scripts, Jenkins, or local GitHub workflow bodies;
- no isolation/fixture provisioning;
- cleanup is best effort and can fail if the network/process stops;
- validates a narrow guardrail configuration flow, not `quilr-web` rendering or query-builder;
- the generated payload is based on current remote configuration, so reproducibility depends on external state.

Classification: **manual mutating smoke/contract check**, not CI test coverage.

## CI test execution

| Pipeline | Visible test behavior |
| --- | --- |
| backend Jenkins | explicitly `mvn clean package -DskipTests` |
| web Jenkins | Docker build runs `npm ci` and `npm run build`; no lint/typecheck/test command is explicit |
| dev web Jenkins | same build pattern; no tests |
| local GitHub build workflows | delegate to external reusable workflow |
| local GitHub security workflows | delegate to external reusable workflow |
| branch sync/release workflows | repository/branch/docs operations, not code tests |

Exact reusable source and target-commit logs were inspected. Both application build jobs were skipped because `ci-scripts@cf687f6a1713498d2843f0f60a8ddf30d672775d` treats the targets as applications rather than published libraries. Therefore neither green target GitHub Actions run compiled or tested the application. Security-scanner workflows are separate; their linter jobs are comment-disabled in the inspected reusable workflow.

`next build` performs some TypeScript/build validation according to Next behavior, but it is not a behavioral test suite. The exact target GitHub run called neither lint nor typecheck because the build job was skipped; this analysis ran both commands directly and they passed.

## Coverage tooling

Backend JaCoCo 0.8.2:

- attaches `prepare-agent`;
- generates a report in Maven `test`;
- has no tracked tests to instrument;
- Jenkins skips tests.

No coverage threshold/check rule appears. No coverage output is committed. No frontend coverage dependency/configuration exists.

Therefore repository behavioral coverage cannot be quantified as a percentage.

## Feature-to-test matrix

| Feature/domain | Automated tests | Manual/runtime artifact | Verification gap |
| --- | --- | --- | --- |
| auth/login/OAuth/refresh | none | decoder harness + frontend HTTP/browser probes | real issuer/OAuth/refresh loop/logout cleanup |
| route permissions | none | static analysis matrix in this documentation | rule precedence/loading/fallback behavior |
| query processor dispatch | none | none | duplicate names, unknown names, every processor contract |
| AI apps/users/accounts | none | `TestDateJava` is unrelated demonstration | table queries, synchronization, cache |
| conversations/masking | none | none | GCM/legacy vectors, null attributes, audit |
| findings/password whitelist | none | none | graph/ClickHouse/JPA/external partial failure |
| status events | none | none | validation, pagination, partial bulk writes |
| interactions | none | none | DSL whitelist, strategies, cache keys |
| AI assets | none | none | dynamic identifiers, mapping, malformed JSON |
| ClickHouse ops | none | `CHLatestTest` uses separate manual client/query | SQL guards, access code, row limit |
| schedulers/locks | none | two-consumer live Redis harness | lock denial/expiry, downstream loss, marker recovery |
| guardrail product config | none | remote smoke script | narrow manual mutation/restore |
| Next route handlers | none | success/failure HTTP probes for both handlers | deployed egress limits, large-body concurrency |
| build/deploy | none | both targets built/started locally; exact CI logs inspected | real container/cluster/Vault/Jenkins execution |

## Disabled, skipped, or flaky tests

- No `@Disabled`, `@Ignore`, `describe.skip`, `it.skip`, `test.skip`, quarantine, retry, or flaky marker exists in a test suite because no suite exists.
- Commented cron/test code is runtime experimentation, not a disabled automated test.
- Comment-disabled backup processors are production-tree legacy artifacts, not test fixtures.

## Validation performed during this archaeology

This documentation process is not claimed as target-owned product test coverage. It performed:

- Java CST parsing of all 312 tracked Java files with zero parse errors;
- TypeScript/JavaScript AST parsing of all 2,439 tracked source/tooling files with zero parse errors;
- extraction of 141 Spring routes and 134 Next route artifacts;
- static frontend-to-backend path matching;
- Git status and inventory consistency checks;
- a clean query-builder package under Java 21/Maven 3.9.11;
- web exact-version install, typecheck, lint, format check, production build, and production start;
- 17/17 dynamic harness tests for decoder, authorization/PDP client, response serialization, and Redis queue concurrency;
- query-builder startup/failure matrix, live mapping/API probes, load smoke, and shutdown;
- frontend middleware/route-handler probes, browser hydration/redirect, load smoke, and shutdown;
- BFF mount-prefix and header/body forwarding trace;
- supporting component repository tests.

The supporting component suite is not green at its inspected commit. With declared React peers installed, 12/18 suites and 90/113 tests passed; ToggleSwitch, TextToPDF, Tabs, Select, Dropdown, and Drawer suites had 23 failures. Without peer provisioning, all suites fail before test execution because the component declares React only as a peer.

See [dynamic verification](22-dynamic-verification.md) for the exact evidence boundary.

## Highest-priority missing tests

1. authentication cookie/proxy and Axios refresh/logout cases;
2. authorization annotations/global decoder integration and tenant spoofing resistance;
3. status-event multi-write partial failure/idempotency;
4. ClickHouse ops statement guards and database grant boundary;
5. asset inventory identifier validation;
6. queue pop/failure, Redis lock, and bootstrap marker recovery;
7. masking current/legacy formats and null/malformed fields;
8. every query processor's name, input, generated SQL parameters, and mapper;
9. `/api/download-mdm-file` URL/size/header controls;
10. a repeatable CI application-build gate; the current green GitHub workflow skips both target builds.
