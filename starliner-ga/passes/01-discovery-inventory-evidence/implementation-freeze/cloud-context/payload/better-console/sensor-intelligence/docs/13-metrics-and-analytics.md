# Metrics and Analytics

| Metric | Existing/derived | Formula | Dimensions | Source |
| --- | --- | --- | --- | --- |
| api_latency_ms | existing | request completion elapsed milliseconds | route/status/tenant fingerprint | api_log.rs |
| clickhouse_query_ms | existing | timed ClickHouse future duration | client/query label | api_log.rs |
| llm_request_count | derived | count scoped llmgateway_logs_v3 rows | tenant/time/app/model/provider | analytics/admin_usage |
| llm_tokens | derived | sum input/output/cache token columns | tenant/time/app/model/provider | admin_usage.rs |
| llm_cost_usd | derived | fresh input + cache + output token prices | tenant/time/model | model_pricing.rs |
| llm_latency | derived | average/quantile source duration | tenant/time/app/model | analytics |
| mcp_tool_calls | derived | count scoped tool-call rows | tenant/time/backend/tool/user | mcpgateway |
| mcp_rejections | derived | count scoped rejection rows | tenant/time/reason | mcpgateway |
| endpoint_events | derived | count scoped endpoint rows | tenant/subscriber/time/app/user/device | endpointagent |
| browser_findings | derived | count scoped browser alert rows | tenant/subscriber/time/status/type | browser_extension |
| topic_buckets_completed | existing counter | RunnerState cumulative count | tenant | activity_topics::RunCounters |
| topic_batches_failed | existing counter | RunnerState cumulative failed batches | tenant | activity_topics::RunCounters |
| topic_source_events_seen | existing counter | RunnerState cumulative source events | tenant | activity_topics::RunCounters |
| topic_lag | derived/read model | latest completed bucket versus now | tenant | activity_topics/local_store |
| cache_hit_state | existing diagnostics | fresh/stale/expired/miss state | cache/source | LocalStore/cache modules |
| inventory_coverage | derived | observed channel/source readiness counts | tenant/source/entity type | console/inventory |
| user_product_summary | derived | per-source observed/provisioned counters | tenant/user/source | console/users |
| frontend_chunk_size | build output | minified/gzip bytes per Vite chunk | chunk | Vite build |
| test_pass_count | runtime evidence | 897 Rust + 537 frontend on verified run | suite | analysis runtime log |
| adapter_reconciliation_balance | proposed | source count - admitted - quarantined - in-flight | tenant/profile/window | not implemented |

Metric formulas are source/window/version dependent. Cost computation explicitly separates fresh input, cache, and output token pricing; unknown models cost zero by tested behavior. Product cards should show formula/version/coverage and drill to evidence.
