# DDL statement ledger

Literal schema and migration evidence.

`Verified:` 255 literal DDL fragments were extracted from Python and Rust source strings. Dynamic f-string identifiers remain verbatim; executing a fragment is not implied merely by its presence.

## `clickhouse_sync_utils/syncer.py:1665`

```sql
CREATE TABLE IF NOT EXISTS
```

## `clickhouse_sync_utils/syncer.py:1750`

```sql
CREATE TABLE IF NOT EXISTS
```

## `clickhouse_sync_utils/syncer.py:1821`

```sql
CREATE TABLE IF NOT EXISTS
```

## `db/clickhouse_settings.py:126`

```sql
CREATE TABLE IF NOT EXISTS clickhouse_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            ch_host TEXT NOT NULL,
            ch_port INTEGER NOT NULL,
            ch_username TEXT NOT NULL,
            ch_password_encrypted TEXT NOT NULL,
            run_environment TEXT NOT NULL CHECK (run_environment IN ('preprod', 'prod')),
            clickhouse_env TEXT NOT NULL DEFAULT 'prod',
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:80`

```sql
ALTER TABLE
```

## `db/connection.py:150`

```sql
CREATE TABLE IF NOT EXISTS backends (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            transport TEXT NOT NULL,
            transport_type TEXT NOT NULL,
            description TEXT,
            endpoint TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            settings TEXT NOT NULL DEFAULT '{}',
            capabilities TEXT NOT NULL DEFAULT '{}',
            oauth_passthrough INTEGER NOT NULL DEFAULT 0
        )
```

## `db/connection.py:166`

```sql
CREATE INDEX IF NOT EXISTS idx_backends_user_id ON backends(user_id)
```

## `db/connection.py:170`

```sql
CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            subscriber_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:180`

```sql
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
```

## `db/connection.py:181`

```sql
CREATE INDEX IF NOT EXISTS idx_users_tenant_subscriber ON users(tenant_id, subscriber_id)
```

## `db/connection.py:184`

```sql
CREATE TABLE IF NOT EXISTS oauth_clients (
            backend_id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            client_secret TEXT,
            registered_at TEXT NOT NULL
        )
```

## `db/connection.py:194`

```sql
CREATE TABLE IF NOT EXISTS oauth_user_clients (
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            client_id TEXT NOT NULL,
            client_secret TEXT,
            registered_at TEXT NOT NULL,
            PRIMARY KEY (backend_id, user_email)
        )
```

## `db/connection.py:204`

```sql
CREATE INDEX IF NOT EXISTS idx_oauth_user_clients_backend ON oauth_user_clients(backend_id)
```

## `db/connection.py:207`

```sql
CREATE TABLE IF NOT EXISTS oauth_states (
            state TEXT PRIMARY KEY,
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            original_redirect_uri TEXT NOT NULL,
            original_state TEXT,
            code_verifier TEXT,
            code TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
        )
```

## `db/connection.py:220`

```sql
CREATE INDEX IF NOT EXISTS idx_oauth_states_backend ON oauth_states(backend_id)
```

## `db/connection.py:221`

```sql
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at)
```

## `db/connection.py:224`

```sql
CREATE TABLE IF NOT EXISTS oauth_tokens (
            token_hash TEXT PRIMARY KEY,
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            access_token_encrypted TEXT NOT NULL,
            refresh_token_encrypted TEXT,
            expires_at TEXT,
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:235`

```sql
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_backend ON oauth_tokens(backend_id)
```

## `db/connection.py:236`

```sql
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON oauth_tokens(user_email)
```

## `db/connection.py:239`

```sql
CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            admin_email TEXT UNIQUE NOT NULL,
            tenant_id TEXT NOT NULL,
            subscriber_id TEXT NOT NULL,
            entra_tenant_id TEXT DEFAULT '',
            entra_client_id TEXT DEFAULT '',
            entra_client_secret TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:251`

```sql
CREATE INDEX IF NOT EXISTS idx_companies_admin_email ON companies(admin_email)
```

## `db/connection.py:252`

```sql
CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id)
```

## `db/connection.py:255`

```sql
CREATE TABLE IF NOT EXISTS company_admins (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            admin_email TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(company_id, admin_email)
        )
```

## `db/connection.py:264`

```sql
CREATE INDEX IF NOT EXISTS idx_company_admins_company ON company_admins(company_id)
```

## `db/connection.py:265`

```sql
CREATE INDEX IF NOT EXISTS idx_company_admins_email ON company_admins(admin_email)
```

## `db/connection.py:269`

```sql
CREATE TABLE IF NOT EXISTS company_domain_aliases (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            domain TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'manual',
            created_at TEXT NOT NULL,
            UNIQUE(company_id, domain)
        )
```

## `db/connection.py:280`

```sql
CREATE INDEX IF NOT EXISTS idx_company_domain_aliases_company ON company_domain_aliases(company_id)
```

## `db/connection.py:284`

```sql
CREATE INDEX IF NOT EXISTS idx_company_domain_aliases_domain ON company_domain_aliases(domain)
```

## `db/connection.py:289`

```sql
CREATE TABLE IF NOT EXISTS entra_auth_states (
            state TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            redirect_uri TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            is_user_login INTEGER NOT NULL DEFAULT 0,
            auth_provider TEXT NOT NULL DEFAULT 'entra'
        )
```

## `db/connection.py:300`

```sql
CREATE INDEX IF NOT EXISTS idx_entra_auth_states_expires ON entra_auth_states(expires_at)
```

## `db/connection.py:303`

```sql
CREATE TABLE IF NOT EXISTS mcp_users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            company_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            subscriber_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:315`

```sql
CREATE TABLE IF NOT EXISTS user_mcp_preferences (
            user_email TEXT NOT NULL,
            backend_id TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_email, backend_id)
        )
```

## `db/connection.py:324`

```sql
CREATE INDEX IF NOT EXISTS idx_user_mcp_prefs_email ON user_mcp_preferences(user_email)
```

## `db/connection.py:325`

```sql
CREATE INDEX IF NOT EXISTS idx_user_mcp_prefs_backend ON user_mcp_preferences(backend_id)
```

## `db/connection.py:327`

```sql
CREATE INDEX IF NOT EXISTS idx_user_mcp_prefs_backend_user_ci ON user_mcp_preferences(backend_id, LOWER(user_email))
```

## `db/connection.py:333`

```sql
CREATE INDEX IF NOT EXISTS idx_user_mcp_prefs_email_ci ON user_mcp_preferences(LOWER(user_email))
```

## `db/connection.py:338`

```sql
CREATE TABLE IF NOT EXISTS user_smart_mode (
            user_email TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:346`

```sql
CREATE INDEX IF NOT EXISTS idx_user_smart_mode_email_ci ON user_smart_mode(LOWER(user_email))
```

## `db/connection.py:352`

```sql
CREATE TABLE IF NOT EXISTS tenant_smart_mode_policies (
            tenant_id TEXT PRIMARY KEY,
            mode TEXT NOT NULL DEFAULT 'user_preference'
                CHECK (mode IN ('user_preference', 'force_enabled', 'force_disabled')),
            updated_by TEXT,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:364`

```sql
CREATE TABLE IF NOT EXISTS tenant_memory_settings (
            tenant_id TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
            updated_by TEXT,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:374`

```sql
CREATE TABLE IF NOT EXISTS custom_agents (
            keyword TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (tenant_id, keyword)
        )
```

## `db/connection.py:383`

```sql
CREATE INDEX IF NOT EXISTS idx_custom_agents_tenant ON custom_agents(tenant_id)
```

## `db/connection.py:387`

```sql
CREATE TABLE IF NOT EXISTS workflow_agents (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            agent_mode TEXT NOT NULL DEFAULT 'background',
            status TEXT NOT NULL,
            current_version_id TEXT,
            created_by TEXT NOT NULL,
            updated_by TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:403`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agents_tenant_status ON workflow_agents(tenant_id, status)
```

## `db/connection.py:404`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agents_tenant_name ON workflow_agents(tenant_id, name)
```

## `db/connection.py:405`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agents_tenant_mode_status ON workflow_agents(tenant_id, agent_mode, status)
```

## `db/connection.py:407`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_versions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            version_number INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            system_prompt TEXT NOT NULL,
            model_config TEXT NOT NULL,
            runtime_config TEXT NOT NULL DEFAULT '{}',
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(agent_id, version_number)
        )
```

## `db/connection.py:423`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_versions_agent ON workflow_agent_versions(tenant_id, agent_id)
```

## `db/connection.py:424`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_versions_tenant ON workflow_agent_versions(tenant_id)
```

## `db/connection.py:426`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_tool_allowlist (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            agent_version_id TEXT NOT NULL,
            backend_id TEXT NOT NULL,
            tool_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(agent_version_id, backend_id, tool_name)
        )
```

## `db/connection.py:437`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_tools_version ON workflow_agent_tool_allowlist(tenant_id, agent_version_id)
```

## `db/connection.py:438`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_tools_backend ON workflow_agent_tool_allowlist(tenant_id, backend_id, tool_name)
```

## `db/connection.py:440`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_bindings (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            scope_type TEXT NOT NULL CHECK(scope_type IN ('tenant', 'smart_group', 'user')),
            scope_value TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(agent_id, scope_type, scope_value)
        )
```

## `db/connection.py:454`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_bindings_agent ON workflow_agent_bindings(tenant_id, agent_id)
```

## `db/connection.py:455`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_bindings_scope ON workflow_agent_bindings(tenant_id, scope_type, scope_value)
```

## `db/connection.py:457`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_run_requests (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            agent_version_id TEXT NOT NULL,
            input TEXT NOT NULL DEFAULT '{}',
            delegation_expires_at TEXT,
            trigger_type TEXT NOT NULL DEFAULT 'manual',
            schedule_id TEXT,
            parent_run_id TEXT,
            created_by TEXT,
            run_owner_email TEXT,
            execution_identity_type TEXT NOT NULL DEFAULT 'user',
            idempotency_key TEXT,
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:483`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_run_requests_agent ON workflow_agent_run_requests(tenant_id, agent_id)
```

## `db/connection.py:484`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_run_requests_user ON workflow_agent_run_requests(tenant_id, user_email)
```

## `db/connection.py:485`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_run_requests_trigger ON workflow_agent_run_requests(tenant_id, trigger_type, created_at)
```

## `db/connection.py:486`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_run_requests_schedule ON workflow_agent_run_requests(tenant_id, schedule_id, created_at)
```

## `db/connection.py:487`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_run_requests_parent ON workflow_agent_run_requests(tenant_id, parent_run_id)
```

## `db/connection.py:488`

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_agent_run_requests_idempotency
        ON workflow_agent_run_requests(tenant_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL
```

## `db/connection.py:494`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_schedules (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            schedule_type TEXT NOT NULL,
            schedule_spec TEXT NOT NULL,
            timezone TEXT NOT NULL DEFAULT 'UTC',
            input TEXT NOT NULL DEFAULT '{}',
            run_owner_email TEXT NOT NULL,
            execution_identity_type TEXT NOT NULL DEFAULT 'user',
            created_by TEXT NOT NULL,
            updated_by TEXT,
            catch_up_policy TEXT NOT NULL DEFAULT 'skip',
            max_concurrent_runs INTEGER NOT NULL DEFAULT 1,
            enabled_from TEXT,
            enabled_until TEXT,
            next_run_at TEXT,
            last_due_at TEXT,
            last_enqueued_run_id TEXT,
            last_successful_enqueue_at TEXT,
            last_failed_enqueue_at TEXT,
            last_error TEXT,
            lease_owner TEXT,
            lease_expires_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:526`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_schedules_agent_status ON workflow_agent_schedules(tenant_id, agent_id, status)
```

## `db/connection.py:527`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_schedules_due ON workflow_agent_schedules(status, next_run_at)
```

## `db/connection.py:528`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_schedules_owner ON workflow_agent_schedules(tenant_id, run_owner_email)
```

## `db/connection.py:529`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_schedules_lease ON workflow_agent_schedules(lease_expires_at)
```

## `db/connection.py:531`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_schedule_events (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            schedule_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            run_id TEXT,
            due_at TEXT,
            actor_email TEXT,
            metadata TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:544`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_schedule_events_schedule ON workflow_agent_schedule_events(tenant_id, schedule_id, created_at)
```

## `db/connection.py:545`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_schedule_events_type ON workflow_agent_schedule_events(tenant_id, event_type, created_at)
```

## `db/connection.py:547`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_quota_policies (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            policy_kind TEXT NOT NULL DEFAULT 'entitlement',
            scope_type TEXT NOT NULL,
            scope_value TEXT NOT NULL,
            agent_id TEXT,
            enabled INTEGER NOT NULL DEFAULT 1,
            max_runs_per_day INTEGER,
            max_runs_per_hour INTEGER,
            max_concurrent_runs INTEGER,
            max_scheduled_runs INTEGER,
            max_active_schedules_per_agent INTEGER,
            max_chat_turns_per_day INTEGER,
            max_chat_turns_per_hour INTEGER,
            max_active_chat_sessions INTEGER,
            max_concurrent_chat_turns INTEGER,
            created_by TEXT NOT NULL,
            updated_by TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:581`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_quota_policies_scope ON workflow_agent_quota_policies(tenant_id, policy_kind, scope_type, scope_value, agent_id)
```

## `db/connection.py:590`

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_agent_quota_policies_unique_selector
        ON workflow_agent_quota_policies(tenant_id, policy_kind, scope_type, scope_value, COALESCE(agent_id, ''))
```

## `db/connection.py:595`

```sql
CREATE TABLE IF NOT EXISTS workflow_agent_chat_sessions (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            agent_version_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            title TEXT,
            status TEXT NOT NULL,
            created_by TEXT NOT NULL,
            last_message_at TEXT,
            retention_expires_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:611`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_chat_sessions_agent_user ON workflow_agent_chat_sessions(tenant_id, agent_id, user_email, updated_at)
```

## `db/connection.py:612`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_chat_sessions_user_status ON workflow_agent_chat_sessions(tenant_id, user_email, status, updated_at)
```

## `db/connection.py:613`

```sql
CREATE INDEX IF NOT EXISTS idx_workflow_agent_chat_sessions_retention ON workflow_agent_chat_sessions(tenant_id, retention_expires_at)
```

## `db/connection.py:617`

```sql
CREATE TABLE IF NOT EXISTS proxy_tokens (
            token_hash TEXT PRIMARY KEY,
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(backend_id, user_email)
        )
```

## `db/connection.py:626`

```sql
CREATE INDEX IF NOT EXISTS idx_proxy_tokens_backend ON proxy_tokens(backend_id)
```

## `db/connection.py:627`

```sql
CREATE INDEX IF NOT EXISTS idx_proxy_tokens_user ON proxy_tokens(user_email)
```

## `db/connection.py:628`

```sql
CREATE INDEX IF NOT EXISTS idx_mcp_users_email ON mcp_users(email)
```

## `db/connection.py:629`

```sql
CREATE INDEX IF NOT EXISTS idx_mcp_users_company ON mcp_users(company_id)
```

## `db/connection.py:630`

```sql
CREATE INDEX IF NOT EXISTS idx_mcp_users_tenant ON mcp_users(tenant_id)
```

## `db/connection.py:633`

```sql
CREATE TABLE IF NOT EXISTS mcp_catalog (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            transport TEXT NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'General',
            icon TEXT DEFAULT 'fa-solid fa-server',
            oauth_with_login INTEGER NOT NULL DEFAULT 0,
            custom_oauth_credentials_required INTEGER NOT NULL DEFAULT 0,
            upstream_auth_type TEXT,
            upstream_auth_header_name TEXT,
            upstream_auth_query_param TEXT,
            upstream_auth_scheme TEXT,
            upstream_auth_extra_headers TEXT NOT NULL DEFAULT '{}',
            upstream_auth_extra_query_params TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL
        )
```

## `db/connection.py:655`

```sql
CREATE TABLE IF NOT EXISTS backend_upstream_auth (
            backend_id TEXT PRIMARY KEY,
            auth_type TEXT NOT NULL,
            secret_encrypted TEXT,
            header_name TEXT,
            query_param TEXT,
            scheme TEXT,
            credential_mode TEXT NOT NULL DEFAULT 'admin_shared',
            required_fields TEXT NOT NULL DEFAULT '[]',
            extra_headers TEXT NOT NULL DEFAULT '{}',
            extra_query_params TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
```

## `db/connection.py:674`

```sql
CREATE TABLE IF NOT EXISTS user_upstream_auth (
            backend_id TEXT NOT NULL,
            tenant_id TEXT,
            user_email TEXT NOT NULL,
            values_encrypted TEXT NOT NULL,
            last_validated_at TEXT,
            last_validation_error TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (backend_id, user_email)
        )
```

## `db/connection.py:687`

```sql
CREATE INDEX IF NOT EXISTS idx_user_upstream_auth_backend ON user_upstream_auth(backend_id)
```

## `db/connection.py:688`

```sql
CREATE INDEX IF NOT EXISTS idx_user_upstream_auth_user ON user_upstream_auth(user_email)
```

## `db/connection.py:691`

```sql
CREATE TABLE IF NOT EXISTS backend_scoped_settings (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            backend_id TEXT NOT NULL,
            scope_type TEXT NOT NULL CHECK(scope_type IN ('smart_group', 'user')),
            scope_value TEXT NOT NULL,
            settings TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            updated_by TEXT,
            UNIQUE(backend_id, scope_type, scope_value)
        )
```

## `db/connection.py:706`

```sql
CREATE INDEX IF NOT EXISTS idx_backend_scoped_settings_backend ON backend_scoped_settings(backend_id)
```

## `db/connection.py:707`

```sql
CREATE INDEX IF NOT EXISTS idx_backend_scoped_settings_tenant_scope ON backend_scoped_settings(tenant_id, scope_type, scope_value)
```

## `db/connection.py:710`

```sql
CREATE TABLE IF NOT EXISTS mcp_requests (
            id TEXT PRIMARY KEY,
            catalog_id TEXT NOT NULL,
            catalog_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            resolved_at TEXT
        )
```

## `db/connection.py:722`

```sql
CREATE INDEX IF NOT EXISTS idx_mcp_requests_tenant ON mcp_requests(tenant_id)
```

## `db/connection.py:723`

```sql
CREATE INDEX IF NOT EXISTS idx_mcp_requests_status ON mcp_requests(tenant_id, status)
```

## `db/connection.py:726`

```sql
CREATE TABLE IF NOT EXISTS api_tokens (
            id TEXT PRIMARY KEY,
            token_hash TEXT NOT NULL UNIQUE,
            backend_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_used_at TEXT,
            agent_key TEXT NOT NULL DEFAULT ''
        )
```

## `db/connection.py:739`

```sql
CREATE INDEX IF NOT EXISTS idx_api_tokens_token_hash ON api_tokens(token_hash)
```

## `db/connection.py:740`

```sql
CREATE INDEX IF NOT EXISTS idx_api_tokens_backend ON api_tokens(backend_id)
```

## `db/connection.py:741`

```sql
CREATE INDEX IF NOT EXISTS idx_api_tokens_tenant ON api_tokens(tenant_id)
```

## `db/connection.py:758`

```sql
CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            actor_user_id TEXT,
            actor_email TEXT,
            actor_role TEXT,
            action TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id TEXT NOT NULL,
            resource_name TEXT,
            before_state TEXT,
            after_state TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL,
            rolled_back_at TEXT,
            rolled_back_by TEXT,
            rollback_audit_id TEXT,
            rollback_error TEXT
        )
```

## `db/connection.py:779`

```sql
CREATE INDEX IF NOT EXISTS idx_admin_audit_tenant_time ON admin_audit_logs(tenant_id, created_at)
```

## `db/connection.py:780`

```sql
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON admin_audit_logs(resource_type, resource_id)
```

## `db/connection.py:781`

```sql
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON admin_audit_logs(actor_email)
```

## `db/connection.py:782`

```sql
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs(action)
```

## `db/connection.py:795`

```sql
CREATE TABLE IF NOT EXISTS memories (
            id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            tags TEXT NOT NULL DEFAULT '[]',
            source TEXT,
            shared_with TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            expires_at TEXT,
            PRIMARY KEY (tenant_id, id),
            UNIQUE(tenant_id, user_email, title)
        )
```

## `db/connection.py:817`

```sql
ALTER TABLE memories RENAME TO memories_old
```

## `db/connection.py:818`

```sql
CREATE TABLE memories (
                id TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                tags TEXT NOT NULL DEFAULT '[]',
                source TEXT,
                shared_with TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                expires_at TEXT,
                PRIMARY KEY (tenant_id, id),
                UNIQUE(tenant_id, user_email, title)
            )
```

## `db/connection.py:846`

```sql
CREATE INDEX IF NOT EXISTS idx_memories_tenant_user ON memories(tenant_id, user_email)
```

## `db/connection.py:847`

```sql
CREATE INDEX IF NOT EXISTS idx_memories_tenant_updated ON memories(tenant_id, updated_at)
```

## `db/connection.py:848`

```sql
CREATE INDEX IF NOT EXISTS idx_memories_expires_at ON memories(expires_at)
```

## `db/connection.py:854`

```sql
CREATE INDEX IF NOT EXISTS idx_users_username_ci ON users(LOWER(username))
```

## `db/connection.py:858`

```sql
CREATE INDEX IF NOT EXISTS idx_mcp_users_email_ci ON mcp_users(LOWER(email))
```

## `db/connection.py:862`

```sql
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_backend_latest ON oauth_tokens(LOWER(user_email), backend_id, created_at DESC, token_hash DESC)
```

## `db/connection.py:866`

```sql
CREATE INDEX IF NOT EXISTS idx_proxy_tokens_user_backend_ci ON proxy_tokens(LOWER(user_email), backend_id, created_at DESC, token_hash DESC)
```

## `db/connection.py:870`

```sql
CREATE INDEX IF NOT EXISTS idx_user_upstream_auth_backend_user_ci ON user_upstream_auth(backend_id, LOWER(user_email))
```

## `db/connection.py:874`

```sql
CREATE INDEX IF NOT EXISTS idx_backend_scoped_settings_tenant_backend_enabled ON backend_scoped_settings(tenant_id, backend_id, enabled)
```

## `db/connection.py:878`

```sql
CREATE INDEX IF NOT EXISTS idx_memories_owner_title_ci ON memories(tenant_id, LOWER(user_email), LOWER(title))
```

## `db/connection.py:886`

```sql
ALTER TABLE api_tokens ADD COLUMN agent_key TEXT NOT NULL DEFAULT ''
```

## `db/connection.py:893`

```sql
ALTER TABLE backends ADD COLUMN settings TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:896`

```sql
ALTER TABLE backends ADD COLUMN capabilities TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:899`

```sql
ALTER TABLE backends ADD COLUMN oauth_via_dcr INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:902`

```sql
ALTER TABLE backends ADD COLUMN oauth_with_login INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:905`

```sql
ALTER TABLE backends ADD COLUMN oauth_passthrough INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:909`

```sql
ALTER TABLE backends ADD COLUMN parent_id TEXT DEFAULT NULL
```

## `db/connection.py:912`

```sql
ALTER TABLE backends ADD COLUMN usage_count INTEGER DEFAULT 0
```

## `db/connection.py:915`

```sql
ALTER TABLE backends ADD COLUMN last_used_at TEXT DEFAULT NULL
```

## `db/connection.py:919`

```sql
ALTER TABLE backends ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:923`

```sql
CREATE INDEX IF NOT EXISTS idx_backends_parent_id ON backends(parent_id)
```

## `db/connection.py:927`

```sql
ALTER TABLE backends ADD COLUMN catalog_id TEXT DEFAULT NULL
```

## `db/connection.py:932`

```sql
ALTER TABLE backends ADD COLUMN raw_capabilities TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:937`

```sql
ALTER TABLE backends ADD COLUMN slug TEXT DEFAULT NULL
```

## `db/connection.py:940`

```sql
ALTER TABLE backends ADD COLUMN tenant_id TEXT DEFAULT NULL
```

## `db/connection.py:946`

```sql
CREATE INDEX IF NOT EXISTS idx_backends_tenant_slug ON backends(tenant_id, slug)
```

## `db/connection.py:952`

```sql
ALTER TABLE companies ADD COLUMN email_domain TEXT
```

## `db/connection.py:960`

```sql
CREATE INDEX IF NOT EXISTS idx_companies_email_domain ON companies(email_domain)
```

## `db/connection.py:964`

```sql
ALTER TABLE companies ADD COLUMN platform_url TEXT DEFAULT ''
```

## `db/connection.py:971`

```sql
ALTER TABLE entra_auth_states ADD COLUMN is_user_login INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:976`

```sql
ALTER TABLE entra_auth_states ADD COLUMN oauth_backend_id TEXT
```

## `db/connection.py:979`

```sql
ALTER TABLE entra_auth_states ADD COLUMN oauth_redirect_uri TEXT
```

## `db/connection.py:982`

```sql
ALTER TABLE entra_auth_states ADD COLUMN oauth_original_state TEXT
```

## `db/connection.py:985`

```sql
ALTER TABLE entra_auth_states ADD COLUMN oauth_client_id TEXT
```

## `db/connection.py:988`

```sql
ALTER TABLE entra_auth_states ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'entra'
```

## `db/connection.py:1021`

```sql
CREATE TABLE IF NOT EXISTS users_new (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                subscriber_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
```

## `db/connection.py:1040`

```sql
ALTER TABLE users_new RENAME TO users
```

## `db/connection.py:1043`

```sql
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
```

## `db/connection.py:1044`

```sql
CREATE INDEX IF NOT EXISTS idx_users_tenant_subscriber ON users(tenant_id, subscriber_id)
```

## `db/connection.py:1053`

```sql
ALTER TABLE oauth_clients ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:1089`

```sql
ALTER TABLE oauth_states ADD COLUMN snapshot_client_id TEXT
```

## `db/connection.py:1092`

```sql
ALTER TABLE oauth_states ADD COLUMN snapshot_client_secret TEXT
```

## `db/connection.py:1099`

```sql
ALTER TABLE oauth_tokens ADD COLUMN minting_client_id TEXT
```

## `db/connection.py:1102`

```sql
ALTER TABLE oauth_tokens ADD COLUMN minting_client_secret TEXT
```

## `db/connection.py:1108`

```sql
ALTER TABLE proxy_tokens ADD COLUMN token_plaintext TEXT
```

## `db/connection.py:1115`

```sql
ALTER TABLE mcp_catalog ADD COLUMN auth_type TEXT DEFAULT 'none'
```

## `db/connection.py:1118`

```sql
ALTER TABLE mcp_catalog ADD COLUMN oauth_client_id TEXT
```

## `db/connection.py:1121`

```sql
ALTER TABLE mcp_catalog ADD COLUMN oauth_client_secret TEXT
```

## `db/connection.py:1124`

```sql
ALTER TABLE mcp_catalog ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:1127`

```sql
ALTER TABLE mcp_catalog ADD COLUMN custom_oauth_credentials_required INTEGER NOT NULL DEFAULT 0
```

## `db/connection.py:1130`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_type TEXT
```

## `db/connection.py:1133`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_header_name TEXT
```

## `db/connection.py:1136`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_query_param TEXT
```

## `db/connection.py:1139`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_scheme TEXT
```

## `db/connection.py:1142`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_mode TEXT NOT NULL DEFAULT 'admin_shared'
```

## `db/connection.py:1145`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_extra_headers TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:1148`

```sql
ALTER TABLE mcp_catalog ADD COLUMN upstream_auth_extra_query_params TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:1153`

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS mcp_catalog_fts USING fts5(
            id,
            name,
            description,
            category,
            transport,
            content='mcp_catalog',
            content_rowid='rowid',
            tokenize='unicode61 remove_diacritics 2'
        )
```

## `db/connection.py:1207`

```sql
ALTER TABLE backend_upstream_auth ADD COLUMN credential_mode TEXT NOT NULL DEFAULT 'admin_shared'
```

## `db/connection.py:1210`

```sql
ALTER TABLE backend_upstream_auth ADD COLUMN required_fields TEXT NOT NULL DEFAULT '[]'
```

## `db/connection.py:1213`

```sql
ALTER TABLE backend_upstream_auth ADD COLUMN extra_headers TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:1216`

```sql
ALTER TABLE backend_upstream_auth ADD COLUMN extra_query_params TEXT NOT NULL DEFAULT '{}'
```

## `db/connection.py:1222`

```sql
CREATE INDEX IF NOT EXISTS idx_users_username_ci ON users(LOWER(username))
```

## `db/event_log_database.py:71`

```sql
CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level TEXT NOT NULL,
            category TEXT NOT NULL,
            event_type TEXT NOT NULL,
            tenant_id TEXT,
            user_email TEXT,
            backend_id TEXT,
            backend_name TEXT,
            duration_ms INTEGER,
            success INTEGER,
            error_message TEXT,
            data TEXT
        )
```

## `db/event_log_database.py:89`

```sql
CREATE TABLE IF NOT EXISTS mcp_rejected_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            tenant_id TEXT,
            backend_id TEXT,
            backend_name TEXT,
            backend_slug TEXT,
            path_id TEXT,
            user_email TEXT,
            auth_mode TEXT,
            user_agent TEXT,
            agent_keyword TEXT,
            agent_display_name TEXT,
            reason TEXT NOT NULL,
            stage TEXT NOT NULL,
            http_status INTEGER,
            jsonrpc_code INTEGER,
            request_id TEXT,
            mcp_method TEXT,
            tool_name TEXT,
            message TEXT,
            metadata TEXT
        )
```

## `db/event_log_database.py:115`

```sql
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)
```

## `db/event_log_database.py:116`

```sql
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)
```

## `db/event_log_database.py:117`

```sql
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type)
```

## `db/event_log_database.py:118`

```sql
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id)
```

## `db/event_log_database.py:119`

```sql
CREATE INDEX IF NOT EXISTS idx_events_user_email ON events(user_email)
```

## `db/event_log_database.py:120`

```sql
CREATE INDEX IF NOT EXISTS idx_events_backend_id ON events(backend_id)
```

## `db/event_log_database.py:121`

```sql
CREATE INDEX IF NOT EXISTS idx_events_level ON events(level)
```

## `db/event_log_database.py:122`

```sql
CREATE INDEX IF NOT EXISTS idx_rejected_tenant_time ON mcp_rejected_requests(tenant_id, created_at)
```

## `db/event_log_database.py:123`

```sql
CREATE INDEX IF NOT EXISTS idx_rejected_tenant_backend_time ON mcp_rejected_requests(tenant_id, backend_id, created_at)
```

## `db/event_log_database.py:124`

```sql
CREATE INDEX IF NOT EXISTS idx_rejected_tenant_user_time ON mcp_rejected_requests(tenant_id, user_email, created_at)
```

## `db/event_log_database.py:125`

```sql
CREATE INDEX IF NOT EXISTS idx_rejected_tenant_agent_time ON mcp_rejected_requests(tenant_id, agent_keyword, created_at)
```

## `db/event_log_database.py:126`

```sql
CREATE INDEX IF NOT EXISTS idx_rejected_tenant_reason_time ON mcp_rejected_requests(tenant_id, reason, created_at)
```

## `db/event_log_database.py:127`

```sql
CREATE INDEX IF NOT EXISTS idx_rejected_backend_time ON mcp_rejected_requests(backend_id, created_at)
```

## `db/log_database.py:66`

```sql
ALTER TABLE tool_call_logs ADD COLUMN metadata TEXT
```

## `db/log_database.py:71`

```sql
ALTER TABLE tool_call_logs ADD COLUMN dlp_output_blocked INTEGER DEFAULT 0
```

## `db/log_database.py:82`

```sql
CREATE TABLE IF NOT EXISTS tool_call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            -- Timing
            started_at TEXT NOT NULL,
            completed_at TEXT,
            duration_ms INTEGER,

            -- Request identification
            request_id TEXT,

            -- Backend info
            backend_id TEXT NOT NULL,
            backend_name TEXT,
            transport_url TEXT,
            transport_type TEXT,

            -- Auth info
            auth_mode TEXT,
            user_email TEXT,
            bearer_token TEXT,

            -- Profile info (if using a profile)
            profile_id TEXT,
            profile_name TEXT,

            -- Request details
            request_headers TEXT,
            tool_name TEXT NOT NULL,
            tool_arguments TEXT,

            -- DLP on input
            dlp_input_outcome TEXT,
            dlp_input_predictions TEXT,
            dlp_input_blocked INTEGER DEFAULT 0,

            -- DLP on output
            dlp_output_outcome TEXT,
            dlp_output_predictions TEXT,
            dlp_output_blocked INTEGER DEFAULT 0,

            -- Final response
            response_success INTEGER,
            response_content TEXT,
            error_message TEXT,

            -- Additional metadata (JSON)
            metadata TEXT
        )
```

## `db/log_database.py:138`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_user_email ON tool_call_logs(user_email)
```

## `db/log_database.py:139`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_backend_id ON tool_call_logs(backend_id)
```

## `db/log_database.py:140`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_started_at ON tool_call_logs(started_at)
```

## `db/log_database.py:141`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_export_backend_time_id ON tool_call_logs(backend_id, started_at, id)
```

## `db/log_database.py:142`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_export_time_id_backend ON tool_call_logs(started_at, id, backend_id)
```

## `db/log_database.py:143`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_dlp_input_outcome ON tool_call_logs(dlp_input_outcome)
```

## `db/log_database.py:144`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_dlp_output_outcome ON tool_call_logs(dlp_output_outcome)
```

## `db/log_database.py:145`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_tool_name ON tool_call_logs(tool_name)
```

## `db/log_database.py:146`

```sql
CREATE INDEX IF NOT EXISTS idx_logs_profile_id ON tool_call_logs(profile_id)
```

## `db/smart_groups_snapshot.py:40`

```sql
CREATE TABLE IF NOT EXISTS smart_group_snapshot (
            tenant_id TEXT NOT NULL,
            group_name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            emails TEXT NOT NULL DEFAULT '[]',
            enabled INTEGER NOT NULL DEFAULT 1,
            priority INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            resolved_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (tenant_id, group_name)
        )
```

## `db/smart_groups_snapshot.py:56`

```sql
CREATE TABLE IF NOT EXISTS smart_group_snapshot_meta (
            id INTEGER PRIMARY KEY CHECK(id = 1),
            resolved_at TEXT NOT NULL,
            row_count INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        )
```

## `db/smart_groups_snapshot.py:66`

```sql
CREATE INDEX IF NOT EXISTS idx_smart_group_snapshot_tenant
        ON smart_group_snapshot(tenant_id)
```

## `db/starliner_outbox_repository.py:134`

```sql
ALTER TABLE starliner_outbox RENAME TO
```

## `db/starliner_outbox_schema.py:3`

```sql
CREATE TABLE IF NOT EXISTS starliner_outbox (
    outbox_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    sensor_id TEXT NOT NULL,
    record_type TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    body_hash TEXT NOT NULL,
    record_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT,
    lease_until TEXT,
    last_error_code TEXT,
    last_safe_error TEXT,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(tenant_id, sensor_id, record_type, idempotency_key)
)
```

## `db/starliner_outbox_schema.py:26`

```sql
CREATE INDEX IF NOT EXISTS idx_starliner_outbox_due
    ON starliner_outbox(status, next_attempt_at, outbox_id)
```

## `db/starliner_outbox_schema.py:30`

```sql
CREATE INDEX IF NOT EXISTS idx_starliner_outbox_tenant_sensor
    ON starliner_outbox(tenant_id, sensor_id, outbox_id)
```

## `db/starliner_outbox_schema.py:62`

```sql
CREATE TABLE IF NOT EXISTS starliner_terminal_delivery (
    terminal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    sensor_id TEXT NOT NULL,
    record_type TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    body_hash TEXT NOT NULL,
    record_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    evidence_id TEXT,
    last_error_code TEXT,
    last_safe_error TEXT,
    attempt_count INTEGER NOT NULL,
    retry_count INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    terminal_at TEXT NOT NULL,
    UNIQUE(tenant_id, sensor_id, record_type, idempotency_key)
)
```

## `db/starliner_outbox_schema.py:84`

```sql
CREATE INDEX IF NOT EXISTS idx_starliner_terminal_status
    ON starliner_terminal_delivery(status, terminal_at)
```

## `db/starliner_outbox_schema.py:88`

```sql
CREATE INDEX IF NOT EXISTS idx_starliner_terminal_evidence
    ON starliner_terminal_delivery(evidence_id)
    WHERE evidence_id IS NOT NULL
```

## `mcpgateway-rs/src/db.rs:22`

```sql
CREATE TABLE IF NOT EXISTS backends (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            transport TEXT NOT NULL,
            transport_type TEXT NOT NULL,
            description TEXT,
            endpoint TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            settings TEXT NOT NULL DEFAULT '{}',
            capabilities TEXT NOT NULL DEFAULT '{}',
            oauth_passthrough INTEGER NOT NULL DEFAULT 0,
            oauth_via_dcr INTEGER NOT NULL DEFAULT 0,
            oauth_with_login INTEGER NOT NULL DEFAULT 0,
            parent_id TEXT DEFAULT NULL,
            usage_count INTEGER DEFAULT 0,
            last_used_at TEXT DEFAULT NULL,
            is_system INTEGER NOT NULL DEFAULT 0,
            catalog_id TEXT DEFAULT NULL,
            raw_capabilities TEXT NOT NULL DEFAULT '{}',
            slug TEXT DEFAULT NULL,
            tenant_id TEXT DEFAULT NULL
        )
```

## `mcpgateway-rs/src/db.rs:53`

```sql
CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            subscriber_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
```

## `mcpgateway-rs/src/db.rs:68`

```sql
CREATE TABLE IF NOT EXISTS mcp_users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            company_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            subscriber_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
```

## `mcpgateway-rs/src/db.rs:83`

```sql
CREATE TABLE IF NOT EXISTS oauth_tokens (
            token_hash TEXT PRIMARY KEY,
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            access_token_encrypted TEXT NOT NULL,
            refresh_token_encrypted TEXT,
            expires_at TEXT,
            created_at TEXT NOT NULL,
            minting_client_id TEXT,
            minting_client_secret TEXT
        )
```

## `mcpgateway-rs/src/db.rs:101`

```sql
CREATE TABLE IF NOT EXISTS proxy_tokens (
            token_hash TEXT PRIMARY KEY,
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            created_at TEXT NOT NULL,
            token_plaintext TEXT,
            UNIQUE(backend_id, user_email)
        )
```

## `mcpgateway-rs/src/db.rs:116`

```sql
CREATE TABLE IF NOT EXISTS user_mcp_preferences (
            user_email TEXT NOT NULL,
            backend_id TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_email, backend_id)
        )
```

## `mcpgateway-rs/src/db.rs:130`

```sql
CREATE TABLE IF NOT EXISTS user_smart_mode (
            user_email TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        )
```

## `mcpgateway-rs/src/db.rs:142`

```sql
CREATE TABLE IF NOT EXISTS custom_agents (
            keyword TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (tenant_id, keyword)
        )
```

## `mcpgateway-rs/src/db.rs:156`

```sql
CREATE TABLE IF NOT EXISTS api_tokens (
            id TEXT PRIMARY KEY,
            token_hash TEXT NOT NULL UNIQUE,
            backend_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_used_at TEXT,
            agent_key TEXT NOT NULL DEFAULT ''
        )
```

## `mcpgateway-rs/src/db.rs:174`

```sql
CREATE TABLE IF NOT EXISTS oauth_clients (
            backend_id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            client_secret TEXT,
            registered_at TEXT NOT NULL,
            is_custom INTEGER NOT NULL DEFAULT 0
        )
```

## `mcpgateway-rs/src/db.rs:188`

```sql
CREATE TABLE IF NOT EXISTS oauth_user_clients (
            backend_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            client_id TEXT NOT NULL,
            client_secret TEXT,
            registered_at TEXT NOT NULL,
            PRIMARY KEY (backend_id, user_email)
        )
```

## `mcpgateway-rs/src/db.rs:220`

```sql
CREATE TABLE IF NOT EXISTS tool_call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            duration_ms INTEGER,
            request_id TEXT,
            backend_id TEXT NOT NULL,
            backend_name TEXT,
            transport_url TEXT,
            transport_type TEXT,
            auth_mode TEXT,
            user_email TEXT,
            bearer_token TEXT,
            profile_id TEXT,
            profile_name TEXT,
            request_headers TEXT,
            tool_name TEXT NOT NULL,
            tool_arguments TEXT,
            dlp_input_outcome TEXT,
            dlp_input_predictions TEXT,
            dlp_input_blocked INTEGER DEFAULT 0,
            dlp_output_outcome TEXT,
            dlp_output_predictions TEXT,
            dlp_output_blocked INTEGER DEFAULT 0,
            response_success INTEGER,
            response_content TEXT,
            error_message TEXT,
            metadata TEXT
        )
```

## `mcpgateway-rs/src/db.rs:269`

```sql
CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level TEXT NOT NULL,
            category TEXT NOT NULL,
            event_type TEXT NOT NULL,
            tenant_id TEXT,
            user_email TEXT,
            backend_id TEXT,
            backend_name TEXT,
            duration_ms INTEGER,
            success INTEGER,
            error_message TEXT,
            data TEXT
        )
```

## `test_starliner_observe_runtime.py:677`

```sql
CREATE TABLE starliner_outbox (
                outbox_id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT NOT NULL,
                record_type TEXT NOT NULL,
                idempotency_key TEXT NOT NULL UNIQUE,
                body_hash TEXT NOT NULL,
                record_hash TEXT NOT NULL,
                status TEXT NOT NULL,
                attempt_count INTEGER NOT NULL DEFAULT 0,
                next_attempt_at TEXT,
                lease_until TEXT,
                last_error_code TEXT,
                last_safe_error TEXT,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
```

## `test_starliner_outbox_repository.py:82`

```sql
CREATE TABLE starliner_outbox (
        outbox_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT NOT NULL,
        record_type TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        body_hash TEXT NOT NULL,
        record_hash TEXT NOT NULL,
        status TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT,
        lease_until TEXT,
        last_error_code TEXT,
        last_safe_error TEXT,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
```

## `test_sync_sqlite_to_clickhouse.py:77`

```sql
CREATE TABLE backends (
            id TEXT PRIMARY KEY,
            name TEXT,
            tenant_id TEXT,
            slug TEXT
        )
```

## `test_sync_sqlite_to_clickhouse.py:87`

```sql
CREATE TABLE custom_agents (
            keyword TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (tenant_id, keyword)
        )
```

## `test_sync_sqlite_to_clickhouse.py:108`

```sql
CREATE TABLE tool_call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            duration_ms INTEGER,
            request_id TEXT,
            backend_id TEXT,
            backend_name TEXT,
            transport_url TEXT,
            transport_type TEXT,
            auth_mode TEXT,
            user_email TEXT,
            bearer_token TEXT,
            profile_id TEXT,
            profile_name TEXT,
            request_headers TEXT,
            tool_name TEXT,
            tool_arguments TEXT,
            dlp_input_outcome TEXT,
            dlp_input_predictions TEXT,
            dlp_input_blocked INTEGER,
            dlp_output_outcome TEXT,
            dlp_output_predictions TEXT,
            dlp_output_blocked INTEGER,
            response_success INTEGER,
            response_content TEXT,
            error_message TEXT,
            metadata TEXT
        )
```

## `test_sync_sqlite_to_clickhouse.py:147`

```sql
CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level TEXT,
            category TEXT,
            event_type TEXT,
            tenant_id TEXT,
            user_email TEXT,
            backend_id TEXT,
            backend_name TEXT,
            duration_ms INTEGER,
            success INTEGER,
            error_message TEXT,
            data TEXT
        )
```

## `test_sync_sqlite_to_clickhouse.py:166`

```sql
CREATE TABLE mcp_rejected_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            tenant_id TEXT,
            backend_id TEXT,
            backend_name TEXT,
            backend_slug TEXT,
            path_id TEXT,
            user_email TEXT,
            auth_mode TEXT,
            user_agent TEXT,
            agent_keyword TEXT,
            agent_display_name TEXT,
            reason TEXT,
            stage TEXT,
            http_status INTEGER,
            jsonrpc_code INTEGER,
            request_id TEXT,
            mcp_method TEXT,
            tool_name TEXT,
            message TEXT,
            metadata TEXT
        )
```

## `test_sync_sqlite_to_clickhouse.py:863`

```sql
CREATE TABLE IF NOT EXISTS
```

## `test_sync_sqlite_to_clickhouse.py:866`

```sql
ALTER TABLE
```

## `workflow_runner/db.py:43`

```sql
ALTER TABLE
```

## `workflow_runner/db.py:48`

```sql
CREATE TABLE IF NOT EXISTS
```

## `workflow_runner/db.py:101`

```sql
ALTER TABLE workflow_artifacts RENAME TO workflow_artifacts_old
```

## `workflow_runner/db.py:194`

```sql
CREATE TABLE IF NOT EXISTS workflow_runs (
                id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                agent_version_id TEXT NOT NULL,
                status TEXT NOT NULL,
                input TEXT NOT NULL DEFAULT '{}',
                output TEXT,
                error TEXT,
                start_payload TEXT NOT NULL,
                gateway_base_url TEXT,
                worker_id TEXT,
                attempt_count INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 3,
                cancel_requested INTEGER NOT NULL DEFAULT 0,
                trigger_type TEXT NOT NULL DEFAULT 'manual',
                schedule_id TEXT,
                parent_run_id TEXT,
                runtime_config TEXT NOT NULL DEFAULT '{}',
                deadline_at TEXT,
                max_tool_calls INTEGER,
                tool_call_count INTEGER NOT NULL DEFAULT 0,
                max_python_executions INTEGER,
                python_execution_count INTEGER NOT NULL DEFAULT 0,
                network_access INTEGER NOT NULL DEFAULT 0,
                web_fetch_enabled INTEGER NOT NULL DEFAULT 0,
                retention_expires_at TEXT,
                artifact_retention_expires_at TEXT,
                queued_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                updated_at TEXT NOT NULL,
                lease_expires_at TEXT
            )
```

## `workflow_runner/db.py:248`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_runs_status ON workflow_runs(status, queued_at)
```

## `workflow_runner/db.py:249`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_runs_tenant_user ON workflow_runs(tenant_id, user_email)
```

## `workflow_runner/db.py:250`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_runs_agent ON workflow_runs(tenant_id, agent_id)
```

## `workflow_runner/db.py:251`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_runs_schedule ON workflow_runs(tenant_id, schedule_id, status)
```

## `workflow_runner/db.py:254`

```sql
CREATE TABLE IF NOT EXISTS workflow_run_steps (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                step_index INTEGER NOT NULL,
                step_type TEXT NOT NULL,
                status TEXT NOT NULL,
                name TEXT,
                input TEXT,
                output TEXT,
                error TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                UNIQUE(run_id, step_index)
            )
```

## `workflow_runner/db.py:271`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_steps_run ON workflow_run_steps(run_id, step_index)
```

## `workflow_runner/db.py:274`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_artifacts_run ON workflow_artifacts(run_id, created_at)
```

## `workflow_runner/db.py:275`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_artifacts_retention ON workflow_artifacts(tenant_id, retention_expires_at)
```

## `workflow_runner/db.py:276`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_artifacts_step ON workflow_artifacts(run_id, step_id)
```

## `workflow_runner/db.py:277`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_artifacts_chat ON workflow_artifacts(chat_session_id, chat_turn_id)
```

## `workflow_runner/db.py:278`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_artifacts_source ON workflow_artifacts(tenant_id, source_type, created_at)
```

## `workflow_runner/db.py:281`

```sql
CREATE TABLE IF NOT EXISTS workflow_chat_sessions (
                id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                agent_version_id TEXT NOT NULL,
                status TEXT NOT NULL,
                runtime_config TEXT NOT NULL DEFAULT '{}',
                gateway_base_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retention_expires_at TEXT
            )
```

## `workflow_runner/db.py:297`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_sessions_user ON workflow_chat_sessions(tenant_id, user_email, updated_at)
```

## `workflow_runner/db.py:298`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_sessions_retention ON workflow_chat_sessions(tenant_id, retention_expires_at)
```

## `workflow_runner/db.py:301`

```sql
CREATE TABLE IF NOT EXISTS workflow_chat_turns (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                status TEXT NOT NULL,
                attempt_count INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 3,
                user_message_id TEXT,
                assistant_message_id TEXT,
                error TEXT,
                tool_call_count INTEGER NOT NULL DEFAULT 0,
                python_execution_count INTEGER NOT NULL DEFAULT 0,
                cancel_requested INTEGER NOT NULL DEFAULT 0,
                worker_id TEXT,
                gateway_base_url TEXT,
                lease_expires_at TEXT,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                updated_at TEXT NOT NULL
            )
```

## `workflow_runner/db.py:328`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_turns_session ON workflow_chat_turns(session_id, created_at)
```

## `workflow_runner/db.py:329`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_turns_user ON workflow_chat_turns(tenant_id, user_email, created_at)
```

## `workflow_runner/db.py:330`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_turns_status ON workflow_chat_turns(status, created_at)
```

## `workflow_runner/db.py:333`

```sql
CREATE TABLE IF NOT EXISTS workflow_chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                turn_id TEXT,
                tenant_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT,
                content_json TEXT,
                metadata TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL
            )
```

## `workflow_runner/db.py:348`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_messages_session ON workflow_chat_messages(session_id, created_at)
```

## `workflow_runner/db.py:349`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_messages_turn ON workflow_chat_messages(turn_id, created_at)
```

## `workflow_runner/db.py:352`

```sql
CREATE TABLE IF NOT EXISTS workflow_chat_steps (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                turn_id TEXT NOT NULL,
                step_index INTEGER NOT NULL,
                step_type TEXT NOT NULL,
                status TEXT NOT NULL,
                name TEXT,
                input TEXT,
                output TEXT,
                error TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                UNIQUE(turn_id, step_index)
            )
```

## `workflow_runner/db.py:370`

```sql
CREATE INDEX IF NOT EXISTS idx_runner_chat_steps_turn ON workflow_chat_steps(session_id, turn_id, step_index)
```

## Referenced DDL object-name counts

- `IF`: 5 literal fragments.
- `admin_audit_logs`: 1 literal fragments.
- `api_tokens`: 3 literal fragments.
- `backend_scoped_settings`: 1 literal fragments.
- `backend_upstream_auth`: 5 literal fragments.
- `backends`: 16 literal fragments.
- `clickhouse_settings`: 1 literal fragments.
- `companies`: 3 literal fragments.
- `company_admins`: 1 literal fragments.
- `company_domain_aliases`: 1 literal fragments.
- `custom_agents`: 3 literal fragments.
- `entra_auth_states`: 7 literal fragments.
- `events`: 3 literal fragments.
- `idx_admin_audit_action`: 1 literal fragments.
- `idx_admin_audit_actor`: 1 literal fragments.
- `idx_admin_audit_resource`: 1 literal fragments.
- `idx_admin_audit_tenant_time`: 1 literal fragments.
- `idx_api_tokens_backend`: 1 literal fragments.
- `idx_api_tokens_tenant`: 1 literal fragments.
- `idx_api_tokens_token_hash`: 1 literal fragments.
- `idx_backend_scoped_settings_backend`: 1 literal fragments.
- `idx_backend_scoped_settings_tenant_backend_enabled`: 1 literal fragments.
- `idx_backend_scoped_settings_tenant_scope`: 1 literal fragments.
- `idx_backends_parent_id`: 1 literal fragments.
- `idx_backends_tenant_slug`: 1 literal fragments.
- `idx_backends_user_id`: 1 literal fragments.
- `idx_companies_admin_email`: 1 literal fragments.
- `idx_companies_email_domain`: 1 literal fragments.
- `idx_companies_tenant`: 1 literal fragments.
- `idx_company_admins_company`: 1 literal fragments.
- `idx_company_admins_email`: 1 literal fragments.
- `idx_company_domain_aliases_company`: 1 literal fragments.
- `idx_company_domain_aliases_domain`: 1 literal fragments.
- `idx_custom_agents_tenant`: 1 literal fragments.
- `idx_entra_auth_states_expires`: 1 literal fragments.
- `idx_events_backend_id`: 1 literal fragments.
- `idx_events_category`: 1 literal fragments.
- `idx_events_event_type`: 1 literal fragments.
- `idx_events_level`: 1 literal fragments.
- `idx_events_tenant_id`: 1 literal fragments.
- `idx_events_timestamp`: 1 literal fragments.
- `idx_events_user_email`: 1 literal fragments.
- `idx_logs_backend_id`: 1 literal fragments.
- `idx_logs_dlp_input_outcome`: 1 literal fragments.
- `idx_logs_dlp_output_outcome`: 1 literal fragments.
- `idx_logs_export_backend_time_id`: 1 literal fragments.
- `idx_logs_export_time_id_backend`: 1 literal fragments.
- `idx_logs_profile_id`: 1 literal fragments.
- `idx_logs_started_at`: 1 literal fragments.
- `idx_logs_tool_name`: 1 literal fragments.
- `idx_logs_user_email`: 1 literal fragments.
- `idx_mcp_requests_status`: 1 literal fragments.
- `idx_mcp_requests_tenant`: 1 literal fragments.
- `idx_mcp_users_company`: 1 literal fragments.
- `idx_mcp_users_email`: 1 literal fragments.
- `idx_mcp_users_email_ci`: 1 literal fragments.
- `idx_mcp_users_tenant`: 1 literal fragments.
- `idx_memories_expires_at`: 1 literal fragments.
- `idx_memories_owner_title_ci`: 1 literal fragments.
- `idx_memories_tenant_updated`: 1 literal fragments.
- `idx_memories_tenant_user`: 1 literal fragments.
- `idx_oauth_states_backend`: 1 literal fragments.
- `idx_oauth_states_expires`: 1 literal fragments.
- `idx_oauth_tokens_backend`: 1 literal fragments.
- `idx_oauth_tokens_user`: 1 literal fragments.
- `idx_oauth_tokens_user_backend_latest`: 1 literal fragments.
- `idx_oauth_user_clients_backend`: 1 literal fragments.
- `idx_proxy_tokens_backend`: 1 literal fragments.
- `idx_proxy_tokens_user`: 1 literal fragments.
- `idx_proxy_tokens_user_backend_ci`: 1 literal fragments.
- `idx_rejected_backend_time`: 1 literal fragments.
- `idx_rejected_tenant_agent_time`: 1 literal fragments.
- `idx_rejected_tenant_backend_time`: 1 literal fragments.
- `idx_rejected_tenant_reason_time`: 1 literal fragments.
- `idx_rejected_tenant_time`: 1 literal fragments.
- `idx_rejected_tenant_user_time`: 1 literal fragments.
- `idx_runner_artifacts_chat`: 1 literal fragments.
- `idx_runner_artifacts_retention`: 1 literal fragments.
- `idx_runner_artifacts_run`: 1 literal fragments.
- `idx_runner_artifacts_source`: 1 literal fragments.
- `idx_runner_artifacts_step`: 1 literal fragments.
- `idx_runner_chat_messages_session`: 1 literal fragments.
- `idx_runner_chat_messages_turn`: 1 literal fragments.
- `idx_runner_chat_sessions_retention`: 1 literal fragments.
- `idx_runner_chat_sessions_user`: 1 literal fragments.
- `idx_runner_chat_steps_turn`: 1 literal fragments.
- `idx_runner_chat_turns_session`: 1 literal fragments.
- `idx_runner_chat_turns_status`: 1 literal fragments.
- `idx_runner_chat_turns_user`: 1 literal fragments.
- `idx_runner_runs_agent`: 1 literal fragments.
- `idx_runner_runs_schedule`: 1 literal fragments.
- `idx_runner_runs_status`: 1 literal fragments.
- `idx_runner_runs_tenant_user`: 1 literal fragments.
- `idx_runner_steps_run`: 1 literal fragments.
- `idx_smart_group_snapshot_tenant`: 1 literal fragments.
- `idx_starliner_outbox_due`: 1 literal fragments.
- `idx_starliner_outbox_tenant_sensor`: 1 literal fragments.
- `idx_starliner_terminal_evidence`: 1 literal fragments.
- `idx_starliner_terminal_status`: 1 literal fragments.
- `idx_user_mcp_prefs_backend`: 1 literal fragments.
- `idx_user_mcp_prefs_backend_user_ci`: 1 literal fragments.
- `idx_user_mcp_prefs_email`: 1 literal fragments.
- `idx_user_mcp_prefs_email_ci`: 1 literal fragments.
- `idx_user_smart_mode_email_ci`: 1 literal fragments.
- `idx_user_upstream_auth_backend`: 1 literal fragments.
- `idx_user_upstream_auth_backend_user_ci`: 1 literal fragments.
- `idx_user_upstream_auth_user`: 1 literal fragments.
- `idx_users_tenant_subscriber`: 2 literal fragments.
- `idx_users_username`: 2 literal fragments.
- `idx_users_username_ci`: 2 literal fragments.
- `idx_workflow_agent_bindings_agent`: 1 literal fragments.
- `idx_workflow_agent_bindings_scope`: 1 literal fragments.
- `idx_workflow_agent_chat_sessions_agent_user`: 1 literal fragments.
- `idx_workflow_agent_chat_sessions_retention`: 1 literal fragments.
- `idx_workflow_agent_chat_sessions_user_status`: 1 literal fragments.
- `idx_workflow_agent_quota_policies_scope`: 1 literal fragments.
- `idx_workflow_agent_quota_policies_unique_selector`: 1 literal fragments.
- `idx_workflow_agent_run_requests_agent`: 1 literal fragments.
- `idx_workflow_agent_run_requests_idempotency`: 1 literal fragments.
- `idx_workflow_agent_run_requests_parent`: 1 literal fragments.
- `idx_workflow_agent_run_requests_schedule`: 1 literal fragments.
- `idx_workflow_agent_run_requests_trigger`: 1 literal fragments.
- `idx_workflow_agent_run_requests_user`: 1 literal fragments.
- `idx_workflow_agent_schedule_events_schedule`: 1 literal fragments.
- `idx_workflow_agent_schedule_events_type`: 1 literal fragments.
- `idx_workflow_agent_schedules_agent_status`: 1 literal fragments.
- `idx_workflow_agent_schedules_due`: 1 literal fragments.
- `idx_workflow_agent_schedules_lease`: 1 literal fragments.
- `idx_workflow_agent_schedules_owner`: 1 literal fragments.
- `idx_workflow_agent_tools_backend`: 1 literal fragments.
- `idx_workflow_agent_tools_version`: 1 literal fragments.
- `idx_workflow_agent_versions_agent`: 1 literal fragments.
- `idx_workflow_agent_versions_tenant`: 1 literal fragments.
- `idx_workflow_agents_tenant_mode_status`: 1 literal fragments.
- `idx_workflow_agents_tenant_name`: 1 literal fragments.
- `idx_workflow_agents_tenant_status`: 1 literal fragments.
- `mcp_catalog`: 13 literal fragments.
- `mcp_catalog_fts`: 1 literal fragments.
- `mcp_rejected_requests`: 2 literal fragments.
- `mcp_requests`: 1 literal fragments.
- `mcp_users`: 2 literal fragments.
- `memories`: 3 literal fragments.
- `oauth_clients`: 3 literal fragments.
- `oauth_states`: 3 literal fragments.
- `oauth_tokens`: 4 literal fragments.
- `oauth_user_clients`: 2 literal fragments.
- `proxy_tokens`: 3 literal fragments.
- `smart_group_snapshot`: 1 literal fragments.
- `smart_group_snapshot_meta`: 1 literal fragments.
- `starliner_outbox`: 4 literal fragments.
- `starliner_terminal_delivery`: 1 literal fragments.
- `tenant_memory_settings`: 1 literal fragments.
- `tenant_smart_mode_policies`: 1 literal fragments.
- `tool_call_logs`: 5 literal fragments.
- `user_mcp_preferences`: 2 literal fragments.
- `user_smart_mode`: 2 literal fragments.
- `user_upstream_auth`: 1 literal fragments.
- `users`: 2 literal fragments.
- `users_new`: 2 literal fragments.
- `workflow_agent_bindings`: 1 literal fragments.
- `workflow_agent_chat_sessions`: 1 literal fragments.
- `workflow_agent_quota_policies`: 1 literal fragments.
- `workflow_agent_run_requests`: 1 literal fragments.
- `workflow_agent_schedule_events`: 1 literal fragments.
- `workflow_agent_schedules`: 1 literal fragments.
- `workflow_agent_tool_allowlist`: 1 literal fragments.
- `workflow_agent_versions`: 1 literal fragments.
- `workflow_agents`: 1 literal fragments.
- `workflow_artifacts`: 1 literal fragments.
- `workflow_chat_messages`: 1 literal fragments.
- `workflow_chat_sessions`: 1 literal fragments.
- `workflow_chat_steps`: 1 literal fragments.
- `workflow_chat_turns`: 1 literal fragments.
- `workflow_run_steps`: 1 literal fragments.
- `workflow_runs`: 1 literal fragments.
