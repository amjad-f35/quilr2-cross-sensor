# Field transformation lineage


The occurrence-level lineage ledger preserves acquisition/consumer locations
without fabricating a universal outbound schema. Record-specific verified
lineage:

`request/body/header → protocol text walker → prediction input → optional
redaction/transformation → provider body → provider response walker → optional
response DLP → PerformanceLoggerAsync log_entry → DatabaseManager/db writer →
SQLite/ClickHouse`

`prediction + original/final text + identity/context → convert_predictions_to_axis_format
→ NATS DB writer queue → Axis backend`

| original_field | capture_point | transformation | final_emitted_field | information_lost |
| --- | --- | --- | --- | --- |
| GET | DataClassifier/blacksheep_app.py:833 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| POST | DataClassifier/blacksheep_app.py:834 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| DELETE | DataClassifier/blacksheep_app.py:835 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| GET | DataClassifier/blacksheep_app.py:877 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| POST | DataClassifier/blacksheep_app.py:878 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| DELETE | DataClassifier/blacksheep_app.py:879 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| __name__ | DataClassifier/blacksheep_app.py:343 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| config_route | DataClassifier/blacksheep_app.py:343 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| _clickhouse_startup_retry_task | DataClassifier/blacksheep_app.py:520 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| _llmgateway_db | DataClassifier/blacksheep_app.py:544 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| _ratelimit_cleanup_task | DataClassifier/blacksheep_app.py:561 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| _clickhouse_startup_ready | DataClassifier/blacksheep_app.py:426 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| status | DataClassifier/blacksheep_app.py:330 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| Authorization | DataClassifier/clickhouse_client.py:104 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| X-Quilr-Source-Server | DataClassifier/clickhouse_client.py:105 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| utc_tz_aware | DataClassifier/clickhouse_client.py:347 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| readonly | DataClassifier/clickhouse_client.py:282 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tz_mode | DataClassifier/clickhouse_client.py:346 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| __version__ | DataClassifier/clickhouse_client.py:333 | getattr | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| detail | DataClassifier/clickhouse_client.py:118 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| error | DataClassifier/clickhouse_client.py:118 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| operation | DataClassifier/clickhouse_client.py:172 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| sql | DataClassifier/clickhouse_client.py:173 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| parameters | DataClassifier/clickhouse_client.py:174 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| settings | DataClassifier/clickhouse_client.py:175 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| operation | DataClassifier/clickhouse_client.py:204 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| resource | DataClassifier/clickhouse_client.py:205 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant_ids | DataClassifier/clickhouse_client.py:206 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| since | DataClassifier/clickhouse_client.py:207 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| operation | DataClassifier/clickhouse_client.py:229 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| sql | DataClassifier/clickhouse_client.py:230 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| parameters | DataClassifier/clickhouse_client.py:231 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| settings | DataClassifier/clickhouse_client.py:232 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| result | DataClassifier/clickhouse_client.py:236 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| operation | DataClassifier/clickhouse_client.py:287 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| sql | DataClassifier/clickhouse_client.py:288 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| parameters | DataClassifier/clickhouse_client.py:289 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| settings | DataClassifier/clickhouse_client.py:290 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| host | DataClassifier/clickhouse_client.py:455 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| created_at | DataClassifier/db_write_queue.py:99 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_id | DataClassifier/db_write_queue.py:105 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant_id | DataClassifier/db_write_queue.py:106 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| started_at | DataClassifier/db_write_queue.py:107 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| total_time_ms | DataClassifier/db_write_queue.py:108 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| input_text | DataClassifier/db_write_queue.py:109 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| decoded_text | DataClassifier/db_write_queue.py:110 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| encoding_detected | DataClassifier/db_write_queue.py:111 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| encodings_found | DataClassifier/db_write_queue.py:112 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| response_jsonl | DataClassifier/db_write_queue.py:113 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| processing_times | DataClassifier/db_write_queue.py:114 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| metadata | DataClassifier/db_write_queue.py:115 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| errors | DataClassifier/db_write_queue.py:116 | log_data.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| created_at | DataClassifier/db_write_queue.py:117 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_id | DataClassifier/db_write_queue.py:142 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| useremail | DataClassifier/db_write_queue.py:143 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant_id | DataClassifier/db_write_queue.py:144 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| received_at | DataClassifier/db_write_queue.py:145 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| payload | DataClassifier/db_write_queue.py:146 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| payload | DataClassifier/db_write_queue.py:168 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant | DataClassifier/db_write_queue.py:169 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| subscriber | DataClassifier/db_write_queue.py:170 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| backend_url | DataClassifier/db_write_queue.py:171 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| status | DataClassifier/db_write_queue.py:172 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| attempts | DataClassifier/db_write_queue.py:173 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| last_error | DataClassifier/db_write_queue.py:174 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| next_retry_at | DataClassifier/db_write_queue.py:175 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| created_at | DataClassifier/db_write_queue.py:176 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| updated_at | DataClassifier/db_write_queue.py:177 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_id | DataClassifier/db_write_queue.py:235 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant_id | DataClassifier/db_write_queue.py:236 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| org_tenant_id | DataClassifier/db_write_queue.py:237 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| api_key_hash | DataClassifier/db_write_queue.py:238 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_messages | DataClassifier/db_write_queue.py:239 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| response_messages | DataClassifier/db_write_queue.py:240 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_predictions | DataClassifier/db_write_queue.py:241 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| response_predictions | DataClassifier/db_write_queue.py:242 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| model_name | DataClassifier/db_write_queue.py:243 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| provider | DataClassifier/db_write_queue.py:244 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| is_blocked | DataClassifier/db_write_queue.py:245 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_received_at | DataClassifier/db_write_queue.py:246 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| request_id | DataClassifier/db_write_queue.py:266 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant_id | DataClassifier/db_write_queue.py:267 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| api_key_hash | DataClassifier/db_write_queue.py:268 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| metadata | DataClassifier/db_write_queue.py:269 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| created_at | DataClassifier/db_write_queue.py:270 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| db | DataClassifier/db_write_queue.py:53 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| table | DataClassifier/db_write_queue.py:54 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| op | DataClassifier/db_write_queue.py:55 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| data | DataClassifier/db_write_queue.py:56 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| tenant_config | DataClassifier/handlers/clickhouse_master_rpc.py:75 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| policy_engine_config | DataClassifier/handlers/clickhouse_master_rpc.py:82 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| policy_engine_settings | DataClassifier/handlers/clickhouse_master_rpc.py:89 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| llmgateway_users | DataClassifier/handlers/clickhouse_master_rpc.py:96 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| llmgateway_user_app_permissions | DataClassifier/handlers/clickhouse_master_rpc.py:104 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| llmgateway_api_key_settings | DataClassifier/handlers/clickhouse_master_rpc.py:116 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| llmgateway_self_service_api_keys | DataClassifier/handlers/clickhouse_master_rpc.py:129 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| llmgateway_smart_groups | DataClassifier/handlers/clickhouse_master_rpc.py:139 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| custom_categories_configs | DataClassifier/handlers/clickhouse_master_rpc.py:154 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| custom_categories_semantic_phrases | DataClassifier/handlers/clickhouse_master_rpc.py:167 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| custom_categories_edm_keyphrases | DataClassifier/handlers/clickhouse_master_rpc.py:181 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| custom_categories_configs | DataClassifier/handlers/clickhouse_master_rpc.py:197 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| custom_categories_semantic_phrases | DataClassifier/handlers/clickhouse_master_rpc.py:205 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| custom_categories_edm_keyphrases | DataClassifier/handlers/clickhouse_master_rpc.py:214 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| table | DataClassifier/handlers/clickhouse_master_rpc.py:155 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| columns | DataClassifier/handlers/clickhouse_master_rpc.py:156 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| key_columns | DataClassifier/handlers/clickhouse_master_rpc.py:165 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| table | DataClassifier/handlers/clickhouse_master_rpc.py:168 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| columns | DataClassifier/handlers/clickhouse_master_rpc.py:169 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| key_columns | DataClassifier/handlers/clickhouse_master_rpc.py:179 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| table | DataClassifier/handlers/clickhouse_master_rpc.py:182 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| columns | DataClassifier/handlers/clickhouse_master_rpc.py:183 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| key_columns | DataClassifier/handlers/clickhouse_master_rpc.py:192 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| resource | DataClassifier/handlers/clickhouse_master_rpc.py:408 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| sql | DataClassifier/handlers/clickhouse_master_rpc.py:421 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| parameters | DataClassifier/handlers/clickhouse_master_rpc.py:422 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| settings | DataClassifier/handlers/clickhouse_master_rpc.py:426 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| resource | DataClassifier/handlers/clickhouse_master_rpc.py:427 | dict key | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| resource | DataClassifier/handlers/clickhouse_master_rpc.py:432 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| cursor_key | DataClassifier/handlers/clickhouse_master_rpc.py:446 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |
| limit | DataClassifier/handlers/clickhouse_master_rpc.py:462 | body.get | No universal emission; see platform-contract-mapping.csv | Unresolved without the record-specific producer/consumer; no loss invented |

_The complete 26,292-row ledger is machine-readable in the linked CSV._

Complete ledger: [`field-lineage.csv`](../../../matrices/sensor-intelligence/llm-gateway/field-lineage.csv).
