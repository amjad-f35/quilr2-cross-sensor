# Configuration reference

## Complete environment/build variable table

[Executable environment-variable reference](evidence/executable-environment-reference.md) is the exhaustive table of the 130 distinct names read or explicitly declared in Python, Rust, shell, Docker, or example environment files. It records every source location and safe default/expression; credential-bearing values are redacted.

Precedence is source-specific:

1. `constants._env_first` chooses the first nonempty name in its argument order.
2. Ordinary `os.environ.get` uses the process environment and then its explicit source default.
3. `run_dev.sh` and sync utilities can load env files before launching/reading values.
4. ClickHouse settings can be persisted in SQLite and seeded from environment; `require_clickhouse_settings` determines the effective source.
5. Google `load_dotenv()` loads local dotenv data, while `get_mcp_secret` first consults the out-of-scope secret helper's configured source and then named environment fallbacks.
6. Docker `ARG` values exist at build time; Docker `ENV` values become image defaults and can be overridden at container run time.

## Gateway and URL settings

| Name | Type/default | Consumer/effect |
| --- | --- | --- |
| `ENV` | string, empty; special value `japan` | selects a built-in public gateway URL |
| `PROD` | boolean string, default false | selects production URLs and provider credential branch |
| `GATEWAY_BASE_URL`, `PUBLIC_BASE_URL`, `BASE_URL` | first nonempty URL; built-in environment-dependent default | externally generated callback, metadata, asset, and MCP URLs |
| `GATEWAY_HOST` | string, `0.0.0.0` | `gateway.py` direct launcher |
| `GATEWAY_PORT`, then `PORT` | integer, 8005 | direct launcher and displayed URL |
| `MCP_GATEWAY_DATA_DIR` | path, scoped `data/` | all primary SQLite files |
| `LLM_GATEWAY_BASE_URL`, `QUILR_LLM_GATEWAY_BASE_URL` | first nonempty URL; built-in hosted default | workflow/LLM gateway client |
| `EMBED_API_URL`, `EMBED_URL` | first nonempty URL; built-in hosted default | memory embedding service |
| `CORS_ALLOW_ORIGIN_REGEX` | regular-expression string, `.*` | CORS middleware and origin validation |
| `LOG_LEVEL` | level string, `INFO` | Python logging and Google service |
| `GIT_COMMIT`, `GIT_REF` | optional build metadata | health/version response fallback |

`DATABASE_URL` is declared with a SQLite URL default in `constants.py`, but the main DB modules construct paths from `DATA_DIR` and do not consume it. `Dead-code candidate:` repository-wide search found no scoped runtime consumer beyond its declaration.

## Authentication and security settings

| Name | Type/default classification | Effect |
| --- | --- | --- |
| `ADMIN_AUTH_TOKEN` | secret string; insecure source fallback exists | admin token checks and Rust fallback |
| `JWT_SECRET_KEY` | secret string; source fallback exists | HS256 gateway/delegation JWT signing |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | integer, 1,440 | gateway token lifetime |
| `WORKFLOW_DELEGATION_TOKEN_TTL_SECONDS` | integer, 600 | delegation JWT lifetime |
| `WORKFLOW_RUNNER_AUTH_TOKEN` | secret; source fallback exists | gateway↔runner internal auth |
| `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` | client identifier/secret; source defaults exist | shared Entra/OAuth application |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | secret/identifier env fallback in Google service; hardcoded in main constants | platform/Google Workspace OAuth |
| `MCP_SECRET_ENCRYPTION_KEY` | secret; falls back to JWT secret | Fernet encryption for static upstream credentials |
| `MCP_SECRETS_FILE` | path | out-of-scope Google secret-helper input |
| `DLP_API_AUTH_TOKEN` | secret; source fallback exists | remote DLP authorization |
| `DETAILED_LOGS_TOKEN` | secret; source fallback exists | detailed diagnostics |
| `INTERNAL_LOGIN_PASSWORD` | secret; source fallback exists | internal login route |
| `ALLOW_QUILR_EMAIL_COMPANY_AUTOCREATE` | boolean false | opt-in external-JWT tenant auto-provision |
| `QUILR_AUTOCREATE_ALLOWED_EMAIL` | email allowlist value | narrows auto-provision to one email |
| `ONEMCP_ACCEPT_RAW_OAUTH_TOKENS` | boolean-like | compatibility acceptance of raw OneMCP OAuth tokens |

`Verified:` `constants.py` also commits Google/Auth0 and built-in GitHub/Slack client credential material without environment indirection. Values are intentionally omitted here. This is configuration embedded in source, not an environment setting.

## MCP/OneMCP limits and caches

| Name | Value type/effect |
| --- | --- |
| `MCP_CAPABILITIES_CACHE_TTL_SECONDS` | capability cache lifetime |
| `MCP_EVENT_ABANDONED_LAZY_GRACE_SECONDS` | grace before abandoned lazy event cleanup |
| `MCP_EVENT_MAX_SESSIONS_PER_IDENTITY` | per-identity event-session bound |
| `ONEMCP_CLIENT_MAX_SESSIONS_PER_IDENTITY` | client-session bound |
| `ONEMCP_CLIENT_NOTIFICATION_QUEUE_SIZE` | per-session notification queue capacity |
| `ONEMCP_CLIENT_SESSION_TTL_SECONDS` | client-session expiration |
| `ONEMCP_EVENT_TTL_SECONDS` | event replay retention |
| `ONEMCP_MAX_EVENTS_PER_STREAM` | stream event limit |
| `ONEMCP_REQUEST_NOTIFICATION_QUEUE_SIZE` | request notification capacity |
| `ONEMCP_RICH_CLIENT_DENY_PATTERNS` | pattern list/config for rich-client metadata behavior |
| `ONEMCP_SSE_RETRY_MS` | SSE retry hint |
| `MCP_ALTERDOMUS_LIBRECHAT_METADATA_CACHE_CLIENTS`, `...TENANTS`, `...MARKER_TTL_SECONDS` | targeted client/tenant metadata cache controls |

Exact numeric defaults and parsing sites are in the generated environment table; invalid numeric strings raise during import/use rather than being universally normalized.

## Workflow settings

| Name | Default/effect |
| --- | --- |
| `WORKFLOW_AGENT_RUNNER_URL` | `http://127.0.0.1:8015`; runner control base URL |
| `WORKFLOW_RUNNER_DB_PATH` | `DATA_DIR/workflow_runner.db` |
| `WORKFLOW_RUNNER_ARTIFACT_DIR` | `DATA_DIR/workflow_artifacts` |
| `WORKFLOW_RUNNER_POLL_INTERVAL_SECONDS` | 1.0 |
| `WORKFLOW_RUNNER_LEASE_SECONDS` | 300 |
| `WORKFLOW_RUNNER_ERROR_BACKOFF_SECONDS` | 5.0 |
| `WORKFLOW_RUNNER_MAX_ATTEMPTS` | 3 |
| `WORKFLOW_RUNNER_HTTP_TIMEOUT_SECONDS` | 60 |
| `WORKFLOW_RUNNER_WORKER_ID` | optional explicit worker identity |
| `WORKFLOW_RETENTION_POLL_INTERVAL_SECONDS` | 300 |
| `WORKFLOW_RETENTION_ERROR_BACKOFF_SECONDS` | 30 |
| `WORKFLOW_RETENTION_BATCH_SIZE` | 100 |
| `WORKFLOW_SCHEDULER_POLL_INTERVAL_SECONDS` | scheduler polling |
| `WORKFLOW_SCHEDULER_ERROR_BACKOFF_SECONDS` | loop error backoff |
| `WORKFLOW_SCHEDULER_LEASE_SECONDS` | schedule claim duration |
| `WORKFLOW_SCHEDULER_MAX_DUE_PER_TICK` | due-schedule batch |
| `WORKFLOW_SCHEDULER_MAX_PARALLEL_ENQUEUES` | dispatch semaphore |
| `WORKFLOW_SCHEDULER_MIN_INTERVAL_SECONDS` | minimum interval validation |
| `WORKFLOW_SCHEDULER_WORKER_ID` | optional scheduler identity |

## ClickHouse and smart-group settings

`CH_HOST`, `CH_PORT`, `CH_USERNAME`, and `CH_PASSWORD` are the required connection quartet in `db/clickhouse_settings.py`. `CLICKHOUSE_ENV`/`RUN_ENVIRONMENT`, `CH_ENV_FILE`, `CLICKHOUSE_ENV_FILE`, and generic `ENV_FILE` select/load context. Tool/event/rejection batch sizes and `CLICKHOUSE_SYNC_INTERVAL_SECONDS` control synchronization. `SMART_GROUPS_SYNC_INTERVAL_SECONDS` controls gateway refresh; `SMART_GROUPS_FILE` appears in test/tool context.

`RUN_ENVIRONMENTS` accepts `preprod` and `prod` for the persisted-settings validation path. Missing required settings raise `ClickHouseSettingsMissing`; gateway startup catches initial group-sync failure.

## Starliner settings

`STARLINER_RUNTIME_ENABLED` gates optional package installation. `STARLINER_ENV_FILE`, `STARLINER_CONTRACT_REF`, and `STARLINER_CONTRACT_COMMIT` are build/development inputs. The Dockerfile uses a BuildKit secret to install the private package only when enabled.

The scoped `ObserveConfig` reads `STARLINER_ENABLED`, `STARLINER_MODE`, `STARLINER_ACTOR_HASH_KEY`, `STARLINER_RUNTIME_INSTANCE_ID`, `STARLINER_CERTIFICATION_ID`, `STARLINER_SENSOR_ID`, `STARLINER_ADAPTER_VERSION`, `STARLINER_INGEST_URL`, `STARLINER_INGEST_BEARER_TOKEN`, `STARLINER_ALLOW_UNAUTHENTICATED_INGEST`, `STARLINER_CONTRACT_VERSION`, `STARLINER_RECORD_ORIGIN`, `STARLINER_EVIDENCE_QUALITY`, `STARLINER_OUTBOX_BATCH_SIZE`, `STARLINER_OUTBOX_MAX_ROWS`, `STARLINER_RETRY_BASE_SECONDS`, `STARLINER_RETRY_MAX_SECONDS`, `STARLINER_MAX_ATTEMPTS`, `STARLINER_DELIVERY_POLL_SECONDS`, `STARLINER_MAX_PENDING_TASKS`, and `STARLINER_SHUTDOWN_DRAIN_SECONDS`. `env_file.starliner.example` declares the core subset without populated values. The private package may consume additional settings; that external behavior is `Unresolved`.

## Google Workspace settings

`HOST`/`PORT` override `GOOGLE_WORKSPACE_MCP_HOST`/`GOOGLE_WORKSPACE_MCP_PORT`; the base URL defaults from the resulting port unless `GOOGLE_WORKSPACE_MCP_BASE_URL` is set. `GOOGLE_OAUTH_ACCESS_TYPE`, `GOOGLE_OAUTH_INCLUDE_GRANTED_SCOPES`, and `GOOGLE_OAUTH_PROMPT` shape the provider authorization request. Client credentials are eagerly resolved and missing values fail startup.

## Development/build-only settings

`GATEWAY_PYTHON`, `GATEWAY_RELOAD`, `GATEWAY_REQUIRE_ENV_FILE`, `SERVICE_DIR`, `VIRTUAL_ENV`, `PYTHONPATH`, `PYTHONDONTWRITEBYTECODE`, `PYTHONUNBUFFERED`, and Pip cache/version flags are launcher/image settings. `MCP_URL`, `MCP_TOKEN`, and `ZIA_FOR_SEARCH` are tool/integration inputs. Exact Docker declarations are in `Dockerfile` and `google_workspace/Dockerfile`.

## Non-environment configuration

- `pytest.ini`: `testpaths = e2e_test`; top-level tests are excluded by default.
- `.dockerignore`: omits data/databases, tests, `.env`, caches, and local artifacts from the main image context.
- `requirements.txt` and `token_saving_requirements.txt`: Python dependency pins/supplements.
- `google_workspace/requirements.txt`: standalone Google service dependencies.
- `mcpgateway-rs/Cargo.toml`/`Cargo.lock`: Rust direct and resolved dependencies.
- `Jenkinsfile`: branch-to-Dockerfile mapping and shared-library build.
- `BackendSettings`/scoped settings: database-stored runtime configuration with Pydantic validation.
- ClickHouse settings: database-stored runtime configuration seeded from environment.
- CLI flags: exact parser declarations are indexed in the Python symbol reference and entrypoint ledger.

## Invalid configuration behavior

Integer/float casts generally raise `ValueError` at import or first accessor. Invalid regex raises when compiled/used. Missing private Google/Starliner dependencies fail their import paths. Missing ClickHouse configuration is explicit and often caught only in best-effort callers. Missing environment files can be optional or fatal depending on `GATEWAY_REQUIRE_ENV_FILE` and launcher logic. There is no single centralized configuration validator for the whole system.
