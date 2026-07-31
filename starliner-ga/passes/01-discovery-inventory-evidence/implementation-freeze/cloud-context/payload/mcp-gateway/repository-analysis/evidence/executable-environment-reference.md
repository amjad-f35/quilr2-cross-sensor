# Executable environment-variable reference

Runtime/build configuration evidence.

`Verified:` 130 distinct environment/build-variable names are read or declared by executable Python, Rust, shell, Docker, or example-environment files. Documentation-only names and minified-JavaScript identifiers are excluded.

| Name | Evidence and defaults |
| --- | --- |
| `ADMIN_AUTH_TOKEN` | `constants.py:43` os.environ.get; default/expression `[redacted credential-bearing default/expression]`; `e2e_test/conftest.py:62` mapping subscript; default/expression `Required at access`; `mcpgateway-rs/src/routes/mod.rs:102` Rust env::var; default/expression `[redacted credential-bearing default/expression]` |
| `ALLOW_QUILR_EMAIL_COMPANY_AUTOCREATE` | `constants.py:62` os.environ.get; default/expression `"false"` |
| `BASE_URL` | `constants.py:32` _env_first alias candidate; default/expression `_DEFAULT_GATEWAY_URL` |
| `CH_ENV_FILE` | `db/clickhouse_settings.py:155` os.environ.get; default/expression `None/no explicit default` |
| `CH_HOST` | `db/clickhouse_settings.py:217` mapping subscript; default/expression `Required at access`; `db/clickhouse_settings.py:228` mapping subscript; default/expression `Required at access` |
| `CH_PASSWORD` | `db/clickhouse_settings.py:220` mapping subscript; default/expression `Required at access` |
| `CH_PORT` | `db/clickhouse_settings.py:191` mapping subscript; default/expression `Required at access` |
| `CH_USERNAME` | `db/clickhouse_settings.py:219` mapping subscript; default/expression `Required at access` |
| `CLICKHOUSE_ENV` | `db/clickhouse_settings.py:222` os.environ.get; default/expression `DEFAULT_CLICKHOUSE_ENV` |
| `CLICKHOUSE_ENV_FILE` | `db/clickhouse_settings.py:155` os.environ.get; default/expression `None/no explicit default` |
| `CLICKHOUSE_SYNC_EVENT_BATCH_SIZE` | `clickhouse_sync_utils/syncer.py:288` os.environ.get; default/expression `"2000"` |
| `CLICKHOUSE_SYNC_INTERVAL_SECONDS` | `clickhouse_sync_utils/syncer.py:281` os.environ.get; default/expression `str(DEFAULT_INTERVAL_SECONDS)` |
| `CLICKHOUSE_SYNC_REJECTED_BATCH_SIZE` | `clickhouse_sync_utils/syncer.py:291` os.environ.get; default/expression `"2000"` |
| `CLICKHOUSE_SYNC_TOOL_BATCH_SIZE` | `clickhouse_sync_utils/syncer.py:286` os.environ.get; default/expression `"500"` |
| `CORS_ALLOW_ORIGIN_REGEX` | `constants.py:222` os.environ.get; default/expression `_DEFAULT_CORS_ALLOW_ORIGIN_REGEX` |
| `DATABASE_URL` | `constants.py:346` os.getenv; default/expression `"sqlite:///./data/mcp_gateway.db"` |
| `DETAILED_LOGS_TOKEN` | `constants.py:200` os.environ.get; default/expression `[redacted credential-bearing default/expression]`; `mcpgateway-rs/src/config.rs:57` Rust env::var; default/expression `[redacted credential-bearing default/expression]` |
| `DLP_API_AUTH_TOKEN` | `constants.py:193` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `DLP_API_URL` | `constants.py:192` os.environ.get; default/expression `_DEFAULT_DLP_API_URL` |
| `EMBED_API_URL` | `constants.py:197` _env_first alias candidate; default/expression `_DEFAULT_EMBED_API_URL` |
| `EMBED_URL` | `constants.py:197` _env_first alias candidate; default/expression `_DEFAULT_EMBED_API_URL` |
| `ENV` | `constants.py:23` os.environ.get; default/expression `""` |
| `ENV_FILE` | `run_dev.sh:13` shell expansion; default/expression `No shell default`; `run_dev.sh:17` shell expansion; default/expression `No shell default`; `run_dev.sh:26` shell expansion; default/expression `No shell default`; `run_dev.sh:28` shell expansion; default/expression `No shell default` |
| `GATEWAY_BASE_URL` | `constants.py:32` _env_first alias candidate; default/expression `_DEFAULT_GATEWAY_URL`; `e2e_test/conftest.py:60` mapping subscript; default/expression `Required at access` |
| `GATEWAY_HOST` | `Dockerfile:7` container environment declaration; default/expression `0.0.0.0`; `Dockerfile:43` shell expansion; default/expression `0.0.0.0`; `constants.py:34` os.environ.get; default/expression `"0.0.0.0"`; `mcpgateway-rs/src/config.rs:47` Rust env::var; default/expression `See chained unwrap/fallback expression at source` |
| `GATEWAY_PORT` | `Dockerfile:7` container environment declaration; default/expression `8005`; `Dockerfile:43` shell expansion; default/expression `8005`; `constants.py:35` os.environ.get; default/expression `os.environ.get("PORT", "8005")`; `mcpgateway-rs/src/config.rs:48` Rust env::var; default/expression `See chained unwrap/fallback expression at source`; `run_dev.sh:59` shell expansion; default/expression `8005` |
| `GATEWAY_PYTHON` | `run_dev.sh:39` shell expansion; default/expression `No shell default`; `run_dev.sh:40` shell expansion; default/expression `No shell default` |
| `GATEWAY_RELOAD` | `run_dev.sh:55` shell expansion; default/expression `true` |
| `GATEWAY_REQUIRE_ENV_FILE` | `run_dev.sh:14` shell expansion; default/expression `true` |
| `GIT_COMMIT` | `starliner/manifest.py:29` os.environ.get; default/expression `"unknown"` |
| `GIT_REF` | `starliner/manifest.py:28` os.environ.get; default/expression `"unknown"` |
| `GOOGLE_OAUTH_ACCESS_TYPE` | `google_workspace/google_auth.py:463` os.environ.get; default/expression `"offline"` |
| `GOOGLE_OAUTH_CLIENT_ID` | `google_workspace/server.py:61` get_mcp_secret fallback name; default/expression `Secret-store lookup precedes environment fallback; helper is outside scoped subtree` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `google_workspace/server.py:66` get_mcp_secret fallback name; default/expression `[redacted credential-bearing default/expression]` |
| `GOOGLE_OAUTH_INCLUDE_GRANTED_SCOPES` | `google_workspace/google_auth.py:464` os.environ.get; default/expression `"true"` |
| `GOOGLE_OAUTH_PROMPT` | `google_workspace/google_auth.py:467` os.environ.get; default/expression `"consent"` |
| `GOOGLE_WORKSPACE_MCP_BASE_URL` | `google_workspace/server.py:54` os.environ.get; default/expression `f"http://localhost:{DEFAULT_PORT}"` |
| `GOOGLE_WORKSPACE_MCP_HOST` | `google_workspace/server.py:47` os.environ.get; default/expression `"0.0.0.0"` |
| `GOOGLE_WORKSPACE_MCP_PORT` | `google_workspace/server.py:52` os.environ.get; default/expression `"3004"` |
| `HOST` | `google_workspace/Dockerfile:24` container/build declaration; default/expression `0.0.0.0 PORT=3004 MCP_SECRETS_FILE=/secrets/mcp_secrets.json`; `google_workspace/Dockerfile:24` container environment declaration; default/expression `0.0.0.0`; `google_workspace/server.py:47` os.environ.get; default/expression `None/no explicit default` |
| `INTERNAL_LOGIN_PASSWORD` | `constants.py:201` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `constants.py:48` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `JWT_SECRET_KEY` | `constants.py:46` os.environ.get; default/expression `[redacted credential-bearing default/expression]`; `e2e_test/conftest.py:61` mapping subscript; default/expression `Required at access`; `mcpgateway-rs/src/config.rs:59` Rust env::var; default/expression `[redacted credential-bearing default/expression]` |
| `LLM_GATEWAY_BASE_URL` | `constants.py:53` _env_first alias candidate; default/expression `"https://guardrails.quilr.ai"` |
| `LOG_LEVEL` | `constants.py:349` os.getenv; default/expression `"INFO"`; `google_workspace/server.py:10` os.environ.get; default/expression `"INFO"` |
| `MCP_ALTERDOMUS_LIBRECHAT_METADATA_CACHE_CLIENTS` | `routes/mcp.py:106` os.environ.get; default/expression `"@librechat/api-client"` |
| `MCP_ALTERDOMUS_LIBRECHAT_METADATA_CACHE_TENANTS` | `routes/mcp.py:97` os.environ.get; default/expression `"cd4dcb54-5b94-4712-b1d0-0db0de5917c6,"<br>        "aa8e2001-8791-40bb-a52d-04365cf8f385"` |
| `MCP_ALTERDOMUS_LIBRECHAT_METADATA_MARKER_TTL_SECONDS` | `routes/mcp.py:113` os.environ.get; default/expression `"300"` |
| `MCP_CAPABILITIES_CACHE_TTL_SECONDS` | `routes/backends.py:75` os.environ.get; default/expression `"600"`; `routes/mcp.py:93` os.environ.get; default/expression `"600"` |
| `MCP_EVENT_ABANDONED_LAZY_GRACE_SECONDS` | `utils/mcp_event_sessions.py:220` os.environ.get; default/expression `"5"` |
| `MCP_EVENT_MAX_SESSIONS_PER_IDENTITY` | `utils/mcp_event_sessions.py:225` os.environ.get; default/expression `"8"` |
| `MCP_GATEWAY_DATA_DIR` | `Dockerfile:7` container environment declaration; default/expression `/app/mcpgateway/data`; `Dockerfile:39` shell expansion; default/expression `No shell default`; `constants.py:40` os.environ.get; default/expression `BASE_DIR / "data"`; `mcpgateway-rs/src/config.rs:38` Rust env::var; default/expression `See chained unwrap/fallback expression at source` |
| `MCP_SECRETS_FILE` | `google_workspace/Dockerfile:24` container environment declaration; default/expression `[redacted credential-bearing default/expression]` |
| `MCP_SECRET_ENCRYPTION_KEY` | `utils/secret_crypto.py:25` os.environ.get; default/expression `None/no explicit default` |
| `MCP_TOKEN` | `debug_repro_mcp_loop.py:139` os.environ.get; default/expression `None/no explicit default` |
| `MCP_URL` | `debug_repro_mcp_loop.py:138` os.environ.get; default/expression `None/no explicit default` |
| `OAUTH_CLIENT_ID` | `constants.py:88` os.environ.get; default/expression `"46aa8f87-52c1-4d5f-96c0-e71f14af6f55"` |
| `OAUTH_CLIENT_SECRET` | `constants.py:89` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `ONEMCP_ACCEPT_RAW_OAUTH_TOKENS` | `routes/quilrone.py:80` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `ONEMCP_CLIENT_MAX_SESSIONS_PER_IDENTITY` | `services/onemcp_session_notifications.py:186` os.environ.get; default/expression `"512"` |
| `ONEMCP_CLIENT_NOTIFICATION_QUEUE_SIZE` | `services/onemcp_session_notifications.py:189` os.environ.get; default/expression `"128"` |
| `ONEMCP_CLIENT_SESSION_TTL_SECONDS` | `services/onemcp_session_notifications.py:181` os.environ.get; default/expression `"1800"` |
| `ONEMCP_EVENT_TTL_SECONDS` | `services/onemcp_event_store.py:73` os.environ.get; default/expression `"1800"` |
| `ONEMCP_MAX_EVENTS_PER_STREAM` | `services/onemcp_event_store.py:76` os.environ.get; default/expression `"256"` |
| `ONEMCP_REQUEST_NOTIFICATION_QUEUE_SIZE` | `services/onemcp_request_stream.py:29` os.environ.get; default/expression `"128"` |
| `ONEMCP_RICH_CLIENT_DENY_PATTERNS` | `services/onemcp_client_profile.py:24` os.environ.get; default/expression `None/no explicit default` |
| `ONEMCP_SSE_RETRY_MS` | `services/onemcp_event_store.py:75` os.environ.get; default/expression `"3000"` |
| `PIP_DISABLE_PIP_VERSION_CHECK` | `google_workspace/Dockerfile:3` container environment declaration; default/expression `1` |
| `PIP_NO_CACHE_DIR` | `google_workspace/Dockerfile:3` container environment declaration; default/expression `1` |
| `PORT` | `constants.py:35` os.environ.get; default/expression `"8005"`; `google_workspace/Dockerfile:24` container environment declaration; default/expression `3004`; `google_workspace/server.py:52` os.environ.get; default/expression `None/no explicit default`; `mcpgateway-rs/src/config.rs:49` Rust env::var; default/expression `See chained unwrap/fallback expression at source` |
| `PROD` | `constants.py:24` os.environ.get; default/expression `"false"`; `mcpgateway-rs/src/config.rs:24` Rust env::var; default/expression `See chained unwrap/fallback expression at source` |
| `PUBLIC_BASE_URL` | `constants.py:32` _env_first alias candidate; default/expression `_DEFAULT_GATEWAY_URL` |
| `PYTHONDONTWRITEBYTECODE` | `Dockerfile:7` container/build declaration; default/expression `1 PYTHONUNBUFFERED=1 GATEWAY_HOST=0.0.0.0 GATEWAY_PORT=8005 MCP_GATEWAY_DATA_DIR=/app/mcpgateway/data`; `Dockerfile:7` container environment declaration; default/expression `1`; `google_workspace/Dockerfile:3` container/build declaration; default/expression `1 PYTHONUNBUFFERED=1 PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1`; `google_workspace/Dockerfile:3` container environment declaration; default/expression `1` |
| `PYTHONPATH` | `run_dev.sh:52` shell expansion; default/expression `No shell default` |
| `PYTHONUNBUFFERED` | `Dockerfile:7` container environment declaration; default/expression `1`; `google_workspace/Dockerfile:3` container environment declaration; default/expression `1` |
| `QUILR_AUTOCREATE_ALLOWED_EMAIL` | `constants.py:64` os.environ.get; default/expression `"monitor@quilr.ai"` |
| `QUILR_LLM_GATEWAY_BASE_URL` | `constants.py:53` _env_first alias candidate; default/expression `"https://guardrails.quilr.ai"` |
| `QUILR_PUBLIC_KEY` | `decode_token.py:32` os.environ.get; default/expression `None/no explicit default` |
| `RUN_ENVIRONMENT` | `db/clickhouse_settings.py:178` os.environ.get; default/expression `None/no explicit default`; `db/clickhouse_settings.py:181` os.environ.get; default/expression `None/no explicit default` |
| `SERVICE_DIR` | `run_dev.sh:8` shell expansion; default/expression `No shell default`; `run_dev.sh:10` shell expansion; default/expression `No shell default`; `run_dev.sh:11` shell expansion; default/expression `No shell default`; `run_dev.sh:37` shell expansion; default/expression `No shell default`; `run_dev.sh:38` shell expansion; default/expression `No shell default`; `run_dev.sh:52` shell expansion; default/expression `No shell default` |
| `SMART_GROUPS_FILE` | `mcpgateway-rs/src/config.rs:42` Rust env::var; default/expression `See chained unwrap/fallback expression at source` |
| `SMART_GROUPS_SYNC_INTERVAL_SECONDS` | `utils/smart_groups.py:45` os.environ.get; default/expression `"60"`; `utils/smart_groups.py:55` os.environ.get; default/expression `str(SYNC_INTERVAL_SECONDS)` |
| `STARLINER_ACTOR_HASH_KEY` | `env_file.starliner.example:5` example environment assignment; default/expression `No value`; `starliner/config.py:128` environment Mapping lookup; default/expression `[redacted credential-bearing default/expression]` |
| `STARLINER_ADAPTER_VERSION` | `env_file.starliner.example:9` example environment assignment; default/expression `No value`; `starliner/config.py:119` environment Mapping lookup; default/expression `"0.1.0"` |
| `STARLINER_ALLOW_UNAUTHENTICATED_INGEST` | `starliner/config.py:105` environment Mapping lookup; default/expression `None/no explicit default` |
| `STARLINER_CERTIFICATION_ID` | `env_file.starliner.example:7` example environment assignment; default/expression `No value`; `starliner/config.py:121` environment Mapping lookup; default/expression `"uncertified-local"` |
| `STARLINER_CONTRACT_COMMIT` | `Dockerfile:5` container/build declaration; default/expression `860079c312c13f842b5804a590fa1d5430860286`; `Dockerfile:26` shell expansion; default/expression `No shell default`; `services/starliner_mcp_certification.py:39` os.environ.get; default/expression `"860079c312c13f842b5804a590fa1d5430860286"` |
| `STARLINER_CONTRACT_REF` | `services/starliner_mcp_certification.py:42` os.environ.get; default/expression `"main"` |
| `STARLINER_CONTRACT_VERSION` | `starliner/config.py:130` environment Mapping lookup; default/expression `"starliner.sensor.v1"` |
| `STARLINER_DELIVERY_POLL_SECONDS` | `starliner/config.py:144` environment Mapping lookup; default/expression `2.0` |
| `STARLINER_ENABLED` | `env_file.starliner.example:3` example environment assignment; default/expression `No value`; `starliner/config.py:102` environment Mapping lookup; default/expression `None/no explicit default` |
| `STARLINER_ENV_FILE` | `run_dev.sh:30` shell expansion; default/expression `No shell default`; `run_dev.sh:32` shell expansion; default/expression `No shell default` |
| `STARLINER_EVIDENCE_QUALITY` | `starliner/config.py:134` environment Mapping lookup; default/expression `"operational"` |
| `STARLINER_INGEST_BEARER_TOKEN` | `env_file.starliner.example:11` example environment assignment; default/expression `No value`; `starliner/config.py:50` environment Mapping lookup; default/expression `None/no explicit default` |
| `STARLINER_INGEST_URL` | `env_file.starliner.example:10` example environment assignment; default/expression `No value`; `starliner/config.py:37` environment Mapping lookup; default/expression `None/no explicit default` |
| `STARLINER_MAX_ATTEMPTS` | `starliner/config.py:143` environment Mapping lookup; default/expression `8` |
| `STARLINER_MAX_PENDING_TASKS` | `starliner/config.py:147` environment Mapping lookup; default/expression `1_000` |
| `STARLINER_MODE` | `env_file.starliner.example:4` example environment assignment; default/expression `No value`; `starliner/config.py:101` environment Mapping lookup; default/expression `"off"` |
| `STARLINER_OUTBOX_BATCH_SIZE` | `starliner/config.py:139` environment Mapping lookup; default/expression `100` |
| `STARLINER_OUTBOX_MAX_ROWS` | `starliner/config.py:140` environment Mapping lookup; default/expression `10_000` |
| `STARLINER_RECORD_ORIGIN` | `starliner/config.py:132` environment Mapping lookup; default/expression `"live_sensor"` |
| `STARLINER_RETRY_BASE_SECONDS` | `starliner/config.py:141` environment Mapping lookup; default/expression `1.0` |
| `STARLINER_RETRY_MAX_SECONDS` | `starliner/config.py:142` environment Mapping lookup; default/expression `60.0` |
| `STARLINER_RUNTIME_ENABLED` | `Dockerfile:4` container/build declaration; default/expression `false`; `Dockerfile:26` shell expansion; default/expression `No shell default` |
| `STARLINER_RUNTIME_INSTANCE_ID` | `env_file.starliner.example:6` example environment assignment; default/expression `No value`; `starliner/config.py:124` environment Mapping lookup; default/expression `"mcp-gateway-local"` |
| `STARLINER_SENSOR_ID` | `env_file.starliner.example:8` example environment assignment; default/expression `No value`; `starliner/config.py:118` environment Mapping lookup; default/expression `"mcp_gateway"` |
| `STARLINER_SHUTDOWN_DRAIN_SECONDS` | `starliner/config.py:152` environment Mapping lookup; default/expression `5.0` |
| `VIRTUAL_ENV` | `run_dev.sh:41` shell expansion; default/expression `No shell default`; `run_dev.sh:42` shell expansion; default/expression `No shell default` |
| `WORKFLOW_AGENT_RUNNER_URL` | `constants.py:51` os.environ.get; default/expression `"http://127.0.0.1:8015"`; `workflow_scheduler/config.py:31` os.environ.get; default/expression `WORKFLOW_AGENT_RUNNER_URL` |
| `WORKFLOW_DELEGATION_TOKEN_TTL_SECONDS` | `constants.py:49` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `WORKFLOW_RETENTION_BATCH_SIZE` | `workflow_runner/config.py:55` os.environ.get; default/expression `"100"` |
| `WORKFLOW_RETENTION_ERROR_BACKOFF_SECONDS` | `workflow_runner/config.py:51` os.environ.get; default/expression `"30"` |
| `WORKFLOW_RETENTION_POLL_INTERVAL_SECONDS` | `workflow_runner/config.py:47` os.environ.get; default/expression `"300"` |
| `WORKFLOW_RUNNER_ARTIFACT_DIR` | `workflow_runner/config.py:22` os.environ.get; default/expression `None/no explicit default` |
| `WORKFLOW_RUNNER_AUTH_TOKEN` | `constants.py:50` os.environ.get; default/expression `[redacted credential-bearing default/expression]`; `e2e_test/conftest.py:63` mapping subscript; default/expression `Required at access`; `workflow_runner/config.py:27` os.environ.get; default/expression `[redacted credential-bearing default/expression]`; `workflow_scheduler/config.py:35` os.environ.get; default/expression `[redacted credential-bearing default/expression]` |
| `WORKFLOW_RUNNER_DB_PATH` | `workflow_runner/config.py:17` os.environ.get; default/expression `None/no explicit default` |
| `WORKFLOW_RUNNER_ERROR_BACKOFF_SECONDS` | `workflow_runner/config.py:39` os.environ.get; default/expression `"5.0"` |
| `WORKFLOW_RUNNER_HTTP_TIMEOUT_SECONDS` | `workflow_runner/config.py:59` os.environ.get; default/expression `"60"` |
| `WORKFLOW_RUNNER_LEASE_SECONDS` | `workflow_runner/config.py:35` os.environ.get; default/expression `"300"` |
| `WORKFLOW_RUNNER_MAX_ATTEMPTS` | `workflow_runner/config.py:43` os.environ.get; default/expression `"3"` |
| `WORKFLOW_RUNNER_POLL_INTERVAL_SECONDS` | `workflow_runner/config.py:31` os.environ.get; default/expression `"1.0"` |
| `WORKFLOW_RUNNER_WORKER_ID` | `workflow_runner/worker.py:23` os.environ.get; default/expression `None/no explicit default` |
| `WORKFLOW_SCHEDULER_ERROR_BACKOFF_SECONDS` | `workflow_scheduler/config.py:27` os.environ.get; default/expression `"5"` |
| `WORKFLOW_SCHEDULER_LEASE_SECONDS` | `workflow_scheduler/config.py:23` os.environ.get; default/expression `"120"` |
| `WORKFLOW_SCHEDULER_MAX_DUE_PER_TICK` | `workflow_scheduler/config.py:15` os.environ.get; default/expression `"50"` |
| `WORKFLOW_SCHEDULER_MAX_PARALLEL_ENQUEUES` | `workflow_scheduler/config.py:19` os.environ.get; default/expression `"5"` |
| `WORKFLOW_SCHEDULER_MIN_INTERVAL_SECONDS` | `db/workflow_agent_repository.py:136` os.environ.get; default/expression `"300"` |
| `WORKFLOW_SCHEDULER_POLL_INTERVAL_SECONDS` | `workflow_scheduler/config.py:11` os.environ.get; default/expression `"30"` |
| `WORKFLOW_SCHEDULER_WORKER_ID` | `workflow_scheduler/worker.py:36` os.environ.get; default/expression `None/no explicit default` |
| `ZIA_FOR_SEARCH` | `constants.py:57` os.environ.get; default/expression `"true"` |
