# Utility and subsystem catalog


The exhaustive utility ledger includes every scoped Python/Rust declaration.
Declarations are not marked reusable merely because their name sounds generic.

| utility | category | location | inputs | feature_users | status |
| --- | --- | --- | --- | --- | --- |
| _decode_maybe_bytes | Classification/detection | DataClassifier/blacksheep_app.py:287 | value | blacksheep_app | Verified in source |
| _config_request_identifier | Classification/detection | DataClassifier/blacksheep_app.py:293 | request | blacksheep_app | Verified in source |
| _alert_on_config_failure | Classification/detection | DataClassifier/blacksheep_app.py:308 | handler, endpoint_label | blacksheep_app | Verified in source |
| _initialize_clickhouse_resources | Classification/detection | DataClassifier/blacksheep_app.py:362 | app: Application | blacksheep_app | Verified in source |
| _clickhouse_startup_retry_loop | Classification/detection | DataClassifier/blacksheep_app.py:425 | app: Application | blacksheep_app | Verified in source |
| on_start | Classification/detection | DataClassifier/blacksheep_app.py:439 | app: Application | blacksheep_app | Verified in source |
| on_stop | Classification/detection | DataClassifier/blacksheep_app.py:515 | app: Application | blacksheep_app | Verified in source |
| dashboard_shell | Classification/detection | DataClassifier/blacksheep_app.py:992 | _request: Request | blacksheep_app | Verified in source |
| dashboard_legacy_shell | Classification/detection | DataClassifier/blacksheep_app.py:1005 | _request: Request | blacksheep_app | Verified in source |
| dashboard_tenant_names_csv | Classification/detection | DataClassifier/blacksheep_app.py:1014 | _request: Request | blacksheep_app | Verified in source |
| _wrapped | Classification/detection | DataClassifier/blacksheep_app.py:315 | request: Request | blacksheep_app | Verified in source |
| _ratelimit_cleanup_loop | Classification/detection | DataClassifier/blacksheep_app.py:487 | See exact symbol body | blacksheep_app | Verified in source |
| RemoteClickHouseError | Classification/detection | DataClassifier/clickhouse_client.py:62 | See exact symbol body | clickhouse_client | Verified in source |
| RemoteQueryResult | Classification/detection | DataClassifier/clickhouse_client.py:66 | See exact symbol body | clickhouse_client | Verified in source |
| _validate_master_url | Classification/detection | DataClassifier/clickhouse_client.py:85 | base_url: str | clickhouse_client | Verified in source |
| _master_headers | Classification/detection | DataClassifier/clickhouse_client.py:101 | See exact symbol body | clickhouse_client | Verified in source |
| _remote_response_body | Classification/detection | DataClassifier/clickhouse_client.py:109 | response | clickhouse_client | Verified in source |
| RemoteClickHouseClient | Classification/detection | DataClassifier/clickhouse_client.py:131 | See exact symbol body | clickhouse_client | Verified in source |
| RemoteSyncClickHouseClient | Classification/detection | DataClassifier/clickhouse_client.py:262 | See exact symbol body | clickhouse_client | Verified in source |
| query_tenant_sync | Classification/detection | DataClassifier/clickhouse_client.py:312 | client, *, resource: str, since: Any, fallback_sql: str, fallback_parameters: Optional[Dict[str, Any]]=None | clickhouse_client | Verified in source |
| _get_clickhouse_connect_major_minor | Classification/detection | DataClassifier/clickhouse_client.py:329 | See exact symbol body | clickhouse_client | Verified in source |
| _get_timezone_client_kwargs | Classification/detection | DataClassifier/clickhouse_client.py:342 | See exact symbol body | clickhouse_client | Verified in source |
| _get_async_client_compat | Classification/detection | DataClassifier/clickhouse_client.py:350 | **kwargs | clickhouse_client | Verified in source |
| get_ch_client | Classification/detection | DataClassifier/clickhouse_client.py:364 | See exact symbol body | clickhouse_client | Verified in source |
| close_ch_client | Classification/detection | DataClassifier/clickhouse_client.py:463 | See exact symbol body | clickhouse_client | Verified in source |
| RemoteQueryResult.__init__ | Classification/detection | DataClassifier/clickhouse_client.py:69 | self, column_names: Iterable[str], result_rows: Iterable[Iterable[Any]] | clickhouse_client | Verified in source |
| RemoteQueryResult.named_results | Classification/detection | DataClassifier/clickhouse_client.py:80 | self | clickhouse_client | Verified in source |
| RemoteClickHouseClient.__init__ | Classification/detection | DataClassifier/clickhouse_client.py:134 | self, base_url: str | clickhouse_client | Verified in source |
| RemoteClickHouseClient._request | Classification/detection | DataClassifier/clickhouse_client.py:143 | self, payload: Dict[str, Any] | clickhouse_client | Verified in source |
| RemoteClickHouseClient._supported_kwargs | Classification/detection | DataClassifier/clickhouse_client.py:154 | kwargs: Dict[str, Any] | clickhouse_client | Verified in source |
| RemoteClickHouseClient.query | Classification/detection | DataClassifier/clickhouse_client.py:162 | self, query: str, parameters: Optional[Dict[str, Any]]=None, settings: Optional[Dict[str, Any]]=None, **kwargs | clickhouse_client | Verified in source |
| RemoteClickHouseClient.tenant_sync | Classification/detection | DataClassifier/clickhouse_client.py:187 | self, resource: str, since: Any | clickhouse_client | Verified in source |
| RemoteClickHouseClient.command | Classification/detection | DataClassifier/clickhouse_client.py:219 | self, command: str, parameters: Optional[Dict[str, Any]]=None, settings: Optional[Dict[str, Any]]=None, **kwargs | clickhouse_client | Verified in source |
| RemoteClickHouseClient.insert | Classification/detection | DataClassifier/clickhouse_client.py:242 | self, table: str, data, column_names=None, database=None, column_oriented: bool=False, settings: Optional[Dict[str, Any]]=None, **kwargs | clickhouse_client | Verified in source |
| RemoteClickHouseClient.close | Classification/detection | DataClassifier/clickhouse_client.py:258 | self | clickhouse_client | Verified in source |
| RemoteSyncClickHouseClient.__init__ | Classification/detection | DataClassifier/clickhouse_client.py:265 | self, base_url: str | clickhouse_client | Verified in source |
| RemoteSyncClickHouseClient.query | Classification/detection | DataClassifier/clickhouse_client.py:274 | self, query: str, parameters: Optional[Dict[str, Any]]=None, settings: Optional[Dict[str, Any]]=None, **kwargs | clickhouse_client | Verified in source |
| RemoteSyncClickHouseClient.close | Classification/detection | DataClassifier/clickhouse_client.py:308 | self | clickhouse_client | Verified in source |
| bearer_token | Classification/detection | DataClassifier/clickhouse_master_protocol.py:22 | request | clickhouse_master_protocol | Verified in source |
| is_master_api_authorized | Classification/detection | DataClassifier/clickhouse_master_protocol.py:38 | request, expected_token: str | clickhouse_master_protocol | Verified in source |
| encode_wire | Classification/detection | DataClassifier/clickhouse_master_protocol.py:48 | value: Any | clickhouse_master_protocol | Verified in source |
| decode_wire | Classification/detection | DataClassifier/clickhouse_master_protocol.py:84 | value: Any | clickhouse_master_protocol | Verified in source |
| _get_nats_connection | Classification/detection | DataClassifier/db_write_queue.py:25 | See exact symbol body | db_write_queue | Verified in source |
| publish_db_write | Classification/detection | DataClassifier/db_write_queue.py:31 | db_name: str, table_name: str, operation: str, data: Dict[str, Any] | db_write_queue | Verified in source |
| _sanitize_text | Classification/detection | DataClassifier/db_write_queue.py:68 | text | db_write_queue | Verified in source |
| _sanitize_json | Classification/detection | DataClassifier/db_write_queue.py:77 | obj | db_write_queue | Verified in source |
| queue_dlp_v2_prediction_log | Classification/detection | DataClassifier/db_write_queue.py:94 | request_id: str, log_data: Dict[str, Any] | db_write_queue | Verified in source |
| queue_hooks_activity_log | Classification/detection | DataClassifier/db_write_queue.py:128 | request_id: str, useremail: str, payload: Any, tenant_id: Optional[str]=None, received_at: Optional[str]=None | db_write_queue | Verified in source |
| queue_axis_log | Classification/detection | DataClassifier/db_write_queue.py:157 | payload: Dict[str, Any], tenant: Optional[str], subscriber: Optional[str], backend_url: Optional[str] | db_write_queue | Verified in source |
| queue_api_request_log | Classification/detection | DataClassifier/db_write_queue.py:187 | log_data: Dict[str, Any] | db_write_queue | Verified in source |
| queue_request_outcome | Classification/detection | DataClassifier/db_write_queue.py:197 | outcome: Dict[str, Any] | db_write_queue | Verified in source |
| queue_prediction_log | Classification/detection | DataClassifier/db_write_queue.py:214 | request_id: str, tenant_id: str, api_key_hash: str, request_messages: Any, response_messages: Any, request_predictions: Any, response_predictions: Any, model_name: str=None, provider: str=None, is_blocked: bool=False, request_received_at: str=None, org_tenant_id: str=None | db_write_queue | Verified in source |
| queue_sdk_metadata | Classification/detection | DataClassifier/db_write_queue.py:256 | request_id: str, metadata: Any, tenant_id: Optional[str]=None, api_key_hash: Optional[str]=None | db_write_queue | Verified in source |
| parse_deployed_tenant_ids | Classification/detection | DataClassifier/deployed_tenants.py:16 | raw: str | deployed_tenants | Verified in source |
| tenant_scope_description | Classification/detection | DataClassifier/deployed_tenants.py:33 | See exact symbol body | deployed_tenants | Verified in source |
| RpcValidationError | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:225 | See exact symbol body | clickhouse_master_rpc | Verified in source |
| _strip_leading_comments | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:229 | sql: str | clickhouse_master_rpc | Verified in source |
| _has_multiple_statements | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:245 | sql: str | clickhouse_master_rpc | Verified in source |
| _code_without_literals_or_comments | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:282 | sql: str | clickhouse_master_rpc | Verified in source |
| validate_sql | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:333 | sql: Any, operation: str | clickhouse_master_rpc | Verified in source |
| _decode_mapping | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:359 | body: Dict[str, Any], name: str | clickhouse_master_rpc | Verified in source |
| _validated_tenant_ids | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:369 | value: Any, *, allow_empty: bool | clickhouse_master_rpc | Verified in source |
| _decoded_since | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:397 | body: Dict[str, Any] | clickhouse_master_rpc | Verified in source |
| _validate_tenant_sync | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:407 | body: Dict[str, Any] | clickhouse_master_rpc | Verified in source |
| _validate_custom_category_sync | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:431 | body: Dict[str, Any] | clickhouse_master_rpc | Verified in source |
| _validate_custom_category_insert | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:507 | body: Dict[str, Any] | clickhouse_master_rpc | Verified in source |
| validate_rpc | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:570 | body: Any | clickhouse_master_rpc | Verified in source |
| _bounded_settings | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:594 | requested: Optional[Dict[str, Any]], *, cap_result_rows: bool | clickhouse_master_rpc | Verified in source |
| clickhouse_master_rpc | Classification/detection | DataClassifier/handlers/clickhouse_master_rpc.py:625 | request: Request | clickhouse_master_rpc | Verified in source |
| WriteValidationError | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:48 | See exact symbol body | clickhouse_master_write | Verified in source |
| _parse_allowed_values | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:56 | name: str, *, hashes: bool=False | clickhouse_master_write | Verified in source |
| is_master_api_authorized | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:81 | request: Request | clickhouse_master_write | Verified in source |
| _nonempty_scope_values | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:85 | data: Dict[str, Any], fields: Iterable[str] | clickhouse_master_write | Verified in source |
| _tenant_scope_values | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:97 | data: Dict[str, Any] | clickhouse_master_write | Verified in source |
| _validate_scope | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:112 | index: int, data: Dict[str, Any] | clickhouse_master_write | Verified in source |
| validate_write_batch | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:148 | body: Any | clickhouse_master_write | Verified in source |
| _publish_queue_writes | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:216 | writes: List[Dict[str, Any]] | clickhouse_master_write | Verified in source |
| _insert_error_rows | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:230 | rows: List[Dict[str, str]] | clickhouse_master_write | Verified in source |
| clickhouse_master_write | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:246 | request: Request | clickhouse_master_write | Verified in source |
| WriteValidationError.__init__ | Classification/detection | DataClassifier/handlers/clickhouse_master_write.py:51 | self, message: str, *, status: int=400 | clickhouse_master_write | Verified in source |
| conversation_title | Classification/detection | DataClassifier/handlers/conversation.py:18 | request: Request | conversation | Verified in source |
| _convert_categories_dict_to_list | Classification/detection | DataClassifier/handlers/demo.py:18 | categories_dict: dict | demo | Verified in source |
| _extract_categories_detected | Classification/detection | DataClassifier/handlers/demo.py:25 | predictions: list | demo | Verified in source |
| _apply_redactions | Classification/detection | DataClassifier/handlers/demo.py:68 | text: str, predictions: list | demo | Verified in source |
| guardrails_demo_check | Classification/detection | DataClassifier/handlers/demo.py:90 | request: Request | demo | Verified in source |
| _parse_title | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:40 | body: dict | false_positive_analysis | Verified in source |
| _parse_models | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:69 | body: dict | false_positive_analysis | Verified in source |
| _parse_confidence_threshold | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:91 | body: dict | false_positive_analysis | Verified in source |
| _parse_custom_window | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:105 | body: dict | false_positive_analysis | Verified in source |
| _get_query_param | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:128 | request: Request, name: str, default: str=None | false_positive_analysis | Verified in source |
| _json_response | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:139 | data: dict, status: int=200 | false_positive_analysis | Verified in source |
| _error_response | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:147 | error: str, status: int=400, details: str=None | false_positive_analysis | Verified in source |
| fp_analysis_job_create | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:162 | request: Request | false_positive_analysis | Verified in source |
| fp_analysis_job_get | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:344 | request: Request, job_id: str | false_positive_analysis | Verified in source |
| fp_analysis_jobs_list | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:393 | request: Request | false_positive_analysis | Verified in source |
| fp_analysis_saved_list | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:427 | request: Request | false_positive_analysis | Verified in source |
| fp_analysis_saved_delete | Classification/detection | DataClassifier/handlers/false_positive_analysis.py:463 | request: Request | false_positive_analysis | Verified in source |
| _now_iso | Classification/detection | DataClassifier/handlers/false_positive_learning.py:125 | See exact symbol body | false_positive_learning | Verified in source |
| _query_one | Classification/detection | DataClassifier/handlers/false_positive_learning.py:129 | request: Request, name: str | false_positive_learning | Verified in source |
| _string | Classification/detection | DataClassifier/handlers/false_positive_learning.py:136 | value: Any, *, max_length: int, strip: bool=True | false_positive_learning | Verified in source |
| _list_of_strings | Classification/detection | DataClassifier/handlers/false_positive_learning.py:147 | value: Any, *, max_items: int, max_length: int | false_positive_learning | Verified in source |
| _feedback_fingerprint | Classification/detection | DataClassifier/handlers/false_positive_learning.py:159 | item: Dict[str, Any] | false_positive_learning | Verified in source |
| _normalize_false_positive_items | Classification/detection | DataClassifier/handlers/false_positive_learning.py:172 | body: Dict[str, Any] | false_positive_learning | Verified in source |
| _normalize_false_negative_items | Classification/detection | DataClassifier/handlers/false_positive_learning.py:240 | body: Dict[str, Any] | false_positive_learning | Verified in source |
| _existing_false_positive_rules | Classification/detection | DataClassifier/handlers/false_positive_learning.py:311 | config: Dict[str, Any] | false_positive_learning | Verified in source |
| _existing_false_negative_rules | Classification/detection | DataClassifier/handlers/false_positive_learning.py:322 | config: Dict[str, Any] | false_positive_learning | Verified in source |
| _false_positive_exclusions | Classification/detection | DataClassifier/handlers/false_positive_learning.py:333 | config: Dict[str, Any], *, create: bool=False | false_positive_learning | Verified in source |
| _false_negative_inclusions | Classification/detection | DataClassifier/handlers/false_positive_learning.py:357 | config: Dict[str, Any], *, create: bool=False | false_positive_learning | Verified in source |
| _save_tenant_config | Classification/detection | DataClassifier/handlers/false_positive_learning.py:381 | tenant_id: str, config: Dict[str, Any] | false_positive_learning | Verified in source |
| _tenant_id_from_body_or_query | Classification/detection | DataClassifier/handlers/false_positive_learning.py:393 | request: Request, body: Optional[Dict[str, Any]]=None | false_positive_learning | Verified in source |
| _truthy_query | Classification/detection | DataClassifier/handlers/false_positive_learning.py:401 | value: Optional[str] | false_positive_learning | Verified in source |
| _rejection_reason_counts | Classification/detection | DataClassifier/handlers/false_positive_learning.py:405 | rejected_rules: List[Dict[str, Any]], *, max_reasons: int=5 | false_positive_learning | Verified in source |
| _coerce_bool | Classification/detection | DataClassifier/handlers/false_positive_learning.py:422 | value: Any | false_positive_learning | Verified in source |
| _find_rule | Classification/detection | DataClassifier/handlers/false_positive_learning.py:434 | rules: List[Dict[str, Any]], rule_id: str | false_positive_learning | Verified in source |
| _linked_feedback_items | Classification/detection | DataClassifier/handlers/false_positive_learning.py:441 | rule: Dict[str, Any], exclusions: Dict[str, Any] | false_positive_learning | Verified in source |
| _sample_matches | Classification/detection | DataClassifier/handlers/false_positive_learning.py:458 | pattern: str, samples: List[str] | false_positive_learning | Verified in source |
| _pattern_text | Classification/detection | DataClassifier/handlers/false_positive_learning.py:463 | pattern: Any | false_positive_learning | Verified in source |
| _coerce_regex_list | Classification/detection | DataClassifier/handlers/false_positive_learning.py:469 | value: Any | false_positive_learning | Verified in source |
| _rule_positive_regexes | Classification/detection | DataClassifier/handlers/false_positive_learning.py:482 | rule: Dict[str, Any] | false_positive_learning | Verified in source |
| _rule_negative_regexes | Classification/detection | DataClassifier/handlers/false_positive_learning.py:490 | rule: Dict[str, Any] | false_positive_learning | Verified in source |

_The complete 6,526-row ledger is machine-readable in the linked CSV._

Complete ledger: [`utilities.csv`](../../../matrices/sensor-intelligence/llm-gateway/utilities.csv).
Silent transformations of special concern are the protocol-specific text
walkers, redaction functions, token-saving replacements, prediction
normalizers, logging projections, and database serializers. Their native keys
and call sites remain linked in the first-pass symbol/call evidence.
