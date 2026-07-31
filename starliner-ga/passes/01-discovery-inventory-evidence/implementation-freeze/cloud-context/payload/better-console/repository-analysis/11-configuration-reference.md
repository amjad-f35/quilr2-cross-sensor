# Configuration Reference

The authoritative 130-setting ledger is `generated-analysis/environment-variables.csv`. `.env.example` supplies example/default intent; `src/config.rs::Config::from_env` is runtime authority.

## Precedence

`dotenvy::dotenv()` loads a local file only when present and does not overwrite process values. Process environment therefore wins. `Config::from_env` validates modes, origins, URLs, paths, numeric bounds, provider pairs, and required relationships.

## Configuration families

| Family | Examples | Effect |
| --- | --- | --- |
| listen | APP_HOST, APP_PORT | Axum bind address |
| auth PostgreSQL/Redis | PG_*, REDIS_*, AUTH_* | principal/session/rate-limit state |
| browser trust | SAML_SP_BASE_URL, CORS_ALLOWED_ORIGINS | redirect/origin/CSRF policy |
| ClickHouse | gateway/endpoint/browser URL, DB, user, password | three read profiles and topic writer |
| local state | LOCAL_STORE_PATH and TTL/refresh values | SQLite mirror behavior |
| external services | LLM/MCP/policy/detection/app service URLs | fixed adapter roots/timeouts |
| providers | DeepSeek, Cloudflare, Anthropic, Azure, Slack | conditional classifier/assist/integration behavior |
| topics | TOPIC_GENERATON_ENABLED and TOPIC_* | mirror/generation/interval/concurrency |
| dashboard execution | CUSTOM_DASHBOARD_* | CLI/Python model workflow and limits |

**Contradiction:** `TOPIC_GENERATON_ENABLED` is misspelled in source/deployment and is therefore the actual contract; correcting the spelling without compatibility handling would be breaking.
