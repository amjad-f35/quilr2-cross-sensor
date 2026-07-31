# LLM field register


Fields registered: **26,292**. Every row has a deterministic ID,
source locator, native semantics, proof, reachability, exactly one disposition,
observability boundary, sensitivity, evidence and access recipe.

The register is occurrence-level because the source dossier records every
native key occurrence. It does not collapse same-named keys across unrelated
records. Values such as native type, cardinality, nullability, or units remain
`Unresolved` where the source expression does not prove them.

| field_id | native_name | source_locator | proof_status | reachability | disposition | observability_boundary | target_field_ids |
| --- | --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:field:201d7b20-1e89-50e4-83af-0b88696160db | GET | DataClassifier/blacksheep_app.py:833 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:861e141c-2fb2-5b46-9d3c-85d45d994617 | POST | DataClassifier/blacksheep_app.py:834 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:378e3053-b90a-5991-b427-5209433ff4ef | DELETE | DataClassifier/blacksheep_app.py:835 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:ba96ddee-972a-58be-a1e1-0eae54f4caf5 | GET | DataClassifier/blacksheep_app.py:877 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:96c4d441-4c18-5d4c-99d1-3aa1fd589833 | POST | DataClassifier/blacksheep_app.py:878 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:16e1636f-656f-56d2-a425-7ae557fbf63e | DELETE | DataClassifier/blacksheep_app.py:879 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:4f8d7c97-be34-585e-b364-e28af914b2f0 | __name__ | DataClassifier/blacksheep_app.py:343 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f28a5b66-aa7e-551d-a22d-fad98b04ccb0 | config_route | DataClassifier/blacksheep_app.py:343 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:b45d3cf0-4c48-541b-89fe-631ced4bc610 | _clickhouse_startup_retry_task | DataClassifier/blacksheep_app.py:520 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:73a7bae1-aac7-5a83-bb64-36be4bb313a8 | _llmgateway_db | DataClassifier/blacksheep_app.py:544 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:a7013fc4-80b3-5275-9db6-546441db65bd | _ratelimit_cleanup_task | DataClassifier/blacksheep_app.py:561 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:205dc1df-907f-547f-afd8-990ddebb74b6 | _clickhouse_startup_ready | DataClassifier/blacksheep_app.py:426 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:a9e051b2-26c2-5a41-958d-97e8647ceced | status | DataClassifier/blacksheep_app.py:330 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:c07da12d-01fe-5071-9e6a-6b7004a1bc1a |
| urn:quilr:lg008:field:03e319d4-6b09-57a0-ab73-d8e79fba4fbe | Authorization | DataClassifier/clickhouse_client.py:104 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:60988dfb-88e4-5d9a-b4e4-a4cb87596234 | X-Quilr-Source-Server | DataClassifier/clickhouse_client.py:105 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:3fd1e2f1-10f3-5a62-b04f-959974897f8e | utc_tz_aware | DataClassifier/clickhouse_client.py:347 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:2e575a70-32a4-5111-ba41-41400f6ca143 | readonly | DataClassifier/clickhouse_client.py:282 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:e1ac44d6-b7ec-5fee-b5e1-75ab8f52cb8f | tz_mode | DataClassifier/clickhouse_client.py:346 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:90d5ccbf-8147-5530-afbc-e3097654082d | __version__ | DataClassifier/clickhouse_client.py:333 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:2b9f3f70-8705-58a0-8a5f-bfbb99af374f | detail | DataClassifier/clickhouse_client.py:118 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:4732cd2c-7481-5b2d-9271-1707d05784b9 | error | DataClassifier/clickhouse_client.py:118 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:d4df182d-10ca-5a8e-b493-5069bcfee96e | operation | DataClassifier/clickhouse_client.py:172 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:01d8c2dc-fe21-5150-aa1e-034b7dca2d21 |
| urn:quilr:lg008:field:590c5930-0832-5562-86e5-4ee4f7f37ef7 | sql | DataClassifier/clickhouse_client.py:173 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:a57cbf53-fe74-5792-975a-060c2c5c94a7 | parameters | DataClassifier/clickhouse_client.py:174 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:dffb1e7e-b634-56a0-8cc0-1f011bd2fc36 | settings | DataClassifier/clickhouse_client.py:175 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:18bcaf18-2131-5fe6-b484-ff1a24360d1a | operation | DataClassifier/clickhouse_client.py:204 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:01d8c2dc-fe21-5150-aa1e-034b7dca2d21 |
| urn:quilr:lg008:field:ce6ba1b2-27de-5b48-8d36-b294cad3c990 | resource | DataClassifier/clickhouse_client.py:205 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:c6535c9e-41da-5cab-b0d3-30b8292fc738 | tenant_ids | DataClassifier/clickhouse_client.py:206 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:472905bd-b352-5aaa-a8c7-9680dda72308 | since | DataClassifier/clickhouse_client.py:207 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f0eca7c2-692d-515f-9045-d411426313f6 | operation | DataClassifier/clickhouse_client.py:229 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:01d8c2dc-fe21-5150-aa1e-034b7dca2d21 |
| urn:quilr:lg008:field:3787c0a6-b5c0-5399-aa3f-f0c610901dfe | sql | DataClassifier/clickhouse_client.py:230 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f8b90844-425b-5551-b192-acd65a2fdd51 | parameters | DataClassifier/clickhouse_client.py:231 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:c55c4070-cfea-5553-bc77-06e001c6c3e1 | settings | DataClassifier/clickhouse_client.py:232 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:9afa4c59-1e2a-5eb4-8c8d-adbc1aaf0e2a | result | DataClassifier/clickhouse_client.py:236 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:bcbef273-fcfb-55ca-805b-abd7fe74fba6 | operation | DataClassifier/clickhouse_client.py:287 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:01d8c2dc-fe21-5150-aa1e-034b7dca2d21 |
| urn:quilr:lg008:field:906e81dc-6fb8-59d3-aca9-fa953bea1ddc | sql | DataClassifier/clickhouse_client.py:288 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:536d20d1-aa63-5e7c-9bf5-d57e9d80d858 | parameters | DataClassifier/clickhouse_client.py:289 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:ad0bace9-630f-5980-9ddf-347651169a08 | settings | DataClassifier/clickhouse_client.py:290 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:9a9cce50-470d-5a8c-b577-ce8dff03b645 | host | DataClassifier/clickhouse_client.py:455 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:4d4be171-43ee-5314-beac-2f249fe4fe92 | created_at | DataClassifier/db_write_queue.py:99 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:65650102-9fc1-5dc1-9406-de01124106f0 | request_id | DataClassifier/db_write_queue.py:105 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:64f96d30-3052-5511-b437-de7b251bbf79;urn:quilr:lg008:target-field:ce0313bf-1ef7-5b20-85ba-0abeb32b610e;urn:quilr:lg008:target-field:9f824483-839c-5c02-bdca-3dd5cf58a008 |
| urn:quilr:lg008:field:eb3e9505-9ecb-5eb3-b4c1-875558b54045 | tenant_id | DataClassifier/db_write_queue.py:106 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:305f7376-bdd4-5931-956a-049af0fc3b6d | started_at | DataClassifier/db_write_queue.py:107 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:275a8bb7-586c-5b08-a22d-3dfaeae2c6eb | total_time_ms | DataClassifier/db_write_queue.py:108 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:14a66837-bce6-5651-b311-4ea3656a3ecc | input_text | DataClassifier/db_write_queue.py:109 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:518efc3f-e213-5e18-9e57-839a5b59d5ff | decoded_text | DataClassifier/db_write_queue.py:110 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:9f748fb0-119a-5f1a-b5d2-798338c25427 | encoding_detected | DataClassifier/db_write_queue.py:111 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:1dc8df3b-c04e-5c7c-8d30-1a2e8576f53d | encodings_found | DataClassifier/db_write_queue.py:112 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:5578c311-2ae1-5020-a656-edf92f2bb74c | response_jsonl | DataClassifier/db_write_queue.py:113 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:1e1c858b-d79e-59c1-8934-b18737eb37c3 | processing_times | DataClassifier/db_write_queue.py:114 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:61fd9652-313f-543a-9c77-232444af2380 | metadata | DataClassifier/db_write_queue.py:115 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f36ba3b7-36fb-51f8-9d9e-c7630ec33172 | errors | DataClassifier/db_write_queue.py:116 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:cc9bd09c-e45d-538f-b1e5-4cd83af72aff | created_at | DataClassifier/db_write_queue.py:117 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:a3f1d24e-0299-5b75-a9c9-781b3609fc89 | request_id | DataClassifier/db_write_queue.py:142 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:64f96d30-3052-5511-b437-de7b251bbf79;urn:quilr:lg008:target-field:ce0313bf-1ef7-5b20-85ba-0abeb32b610e;urn:quilr:lg008:target-field:9f824483-839c-5c02-bdca-3dd5cf58a008 |
| urn:quilr:lg008:field:32eedbb5-9c53-5420-ab2e-bb26f32f42ae | useremail | DataClassifier/db_write_queue.py:143 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:190dffe4-8afe-5ec6-aad3-a4180c9c7523 | tenant_id | DataClassifier/db_write_queue.py:144 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:09bc66d6-c245-5e2f-888c-a8737669e00e | received_at | DataClassifier/db_write_queue.py:145 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:45014b03-f896-5fc1-8bd4-4d8b7b429322 | payload | DataClassifier/db_write_queue.py:146 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:0055a05f-5af1-5a7e-9794-d92f09516745 | payload | DataClassifier/db_write_queue.py:168 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:c946cb31-54b8-5466-b4ed-7e358e7ebd81 | tenant | DataClassifier/db_write_queue.py:169 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:9491c429-4198-513a-9e33-fc06137a35b5 | subscriber | DataClassifier/db_write_queue.py:170 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:4e7508ce-cf80-5c57-8546-c905edf38e17 | backend_url | DataClassifier/db_write_queue.py:171 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:0733d0be-dcbf-5777-a83a-9505f94d3a3d | status | DataClassifier/db_write_queue.py:172 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:c07da12d-01fe-5071-9e6a-6b7004a1bc1a |
| urn:quilr:lg008:field:b8107572-8dc5-5097-b674-83bb784a1a83 | attempts | DataClassifier/db_write_queue.py:173 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:21ff8ee9-05e2-50eb-b785-e78becb7caa6 | last_error | DataClassifier/db_write_queue.py:174 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:6e803eed-a1b6-53a5-a7a4-98fd27a40d0a | next_retry_at | DataClassifier/db_write_queue.py:175 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:be122303-c62e-5ac8-9c10-fb02790484cc | created_at | DataClassifier/db_write_queue.py:176 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f8c1d595-e573-5098-82d1-7bc6c5f68807 | updated_at | DataClassifier/db_write_queue.py:177 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:0911f81d-98c9-5724-a6d7-c88871ff186c | request_id | DataClassifier/db_write_queue.py:235 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:64f96d30-3052-5511-b437-de7b251bbf79;urn:quilr:lg008:target-field:ce0313bf-1ef7-5b20-85ba-0abeb32b610e;urn:quilr:lg008:target-field:9f824483-839c-5c02-bdca-3dd5cf58a008 |
| urn:quilr:lg008:field:4fad278b-2fbc-5155-a9a6-df54e62c83c4 | tenant_id | DataClassifier/db_write_queue.py:236 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f7b4990a-03d7-5a34-bbb5-2f89cf3c2779 | org_tenant_id | DataClassifier/db_write_queue.py:237 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:37fdf0ea-76c3-597c-9c89-2b3a920db7a2 | api_key_hash | DataClassifier/db_write_queue.py:238 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:6b1af408-2f84-5b03-a5b6-31a35e098407 | request_messages | DataClassifier/db_write_queue.py:239 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:67056259-0968-5e0f-8eeb-f14b586bf0ec | response_messages | DataClassifier/db_write_queue.py:240 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:7f78abb8-468e-567c-8c78-8742b86cf6bd | request_predictions | DataClassifier/db_write_queue.py:241 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:3a505f03-16a7-5022-8d93-10423ae58c9e | response_predictions | DataClassifier/db_write_queue.py:242 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:a83258a7-8243-5e42-b119-de13c411b01d | model_name | DataClassifier/db_write_queue.py:243 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:5fe81a82-d6a5-59bb-b8fd-5c3ec7366bc7 |
| urn:quilr:lg008:field:01896326-5792-56b2-b073-6ace5f5b2f5f | provider | DataClassifier/db_write_queue.py:244 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:2c125ed7-62d8-5a90-9422-aa64914fe402 |
| urn:quilr:lg008:field:fc0c14b0-5407-57da-ae1d-7b441c91df0d | is_blocked | DataClassifier/db_write_queue.py:245 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:5c42c8b5-9af5-5000-a1a3-ee7a05b65d24 | request_received_at | DataClassifier/db_write_queue.py:246 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:c8561e55-84e6-57fd-a236-1f6f540f15fd | request_id | DataClassifier/db_write_queue.py:266 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | urn:quilr:lg008:target-field:64f96d30-3052-5511-b437-de7b251bbf79;urn:quilr:lg008:target-field:ce0313bf-1ef7-5b20-85ba-0abeb32b610e;urn:quilr:lg008:target-field:9f824483-839c-5c02-bdca-3dd5cf58a008 |
| urn:quilr:lg008:field:46dd4fe4-40a6-5646-9650-1dad02af1bc2 | tenant_id | DataClassifier/db_write_queue.py:267 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:35f736cf-cac0-555a-bec1-0bc8dc222a4c | api_key_hash | DataClassifier/db_write_queue.py:268 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:2458718d-dd29-558d-bda2-6971892f2de0 | metadata | DataClassifier/db_write_queue.py:269 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:c3969d23-28d5-5474-b16b-665b46de59be | created_at | DataClassifier/db_write_queue.py:270 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:a9e32785-9c1c-5ce5-9fa5-c6165cd8edc3 | db | DataClassifier/db_write_queue.py:53 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:d5cbf4c4-a253-5070-9bce-ad334f974bff | table | DataClassifier/db_write_queue.py:54 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:927deea7-34cd-5339-b9c1-21561a1755dc | op | DataClassifier/db_write_queue.py:55 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:cf5b249a-125b-5607-a2be-c9d20344c4aa | data | DataClassifier/db_write_queue.py:56 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:bef941b9-4c00-577d-b79d-a89b168a272f | tenant_config | DataClassifier/handlers/clickhouse_master_rpc.py:75 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:990c011c-f6d4-5051-8269-72474e54d4d8 | policy_engine_config | DataClassifier/handlers/clickhouse_master_rpc.py:82 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:4c67e7e8-c2ac-59e8-b086-9449f24fb698 | policy_engine_settings | DataClassifier/handlers/clickhouse_master_rpc.py:89 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:0a2d23e5-231d-5636-88a9-4a164878c073 | llmgateway_users | DataClassifier/handlers/clickhouse_master_rpc.py:96 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:3fd447e1-fadd-56f9-b12a-b1f74b696aa0 | llmgateway_user_app_permissions | DataClassifier/handlers/clickhouse_master_rpc.py:104 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:729e2891-2b9a-5883-b529-f3972a335c73 | llmgateway_api_key_settings | DataClassifier/handlers/clickhouse_master_rpc.py:116 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:e0478eac-d388-5594-ab71-e136a7a71ccc | llmgateway_self_service_api_keys | DataClassifier/handlers/clickhouse_master_rpc.py:129 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:f6046c0b-65c2-5320-9fab-62178438f684 | llmgateway_smart_groups | DataClassifier/handlers/clickhouse_master_rpc.py:139 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:75fc1fbb-d274-50b1-9b74-c4ae15d1493d | custom_categories_configs | DataClassifier/handlers/clickhouse_master_rpc.py:154 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:cd10b074-b0b0-5b6c-87c1-ffa36a6562f7 | custom_categories_semantic_phrases | DataClassifier/handlers/clickhouse_master_rpc.py:167 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |
| urn:quilr:lg008:field:cbde1d63-85e2-566a-a16f-9999f2247f7c | custom_categories_edm_keyphrases | DataClassifier/handlers/clickhouse_master_rpc.py:181 | SOURCE_PROVEN | UNKNOWN | SOURCE_LOCAL_STATE | CONDITIONALLY_COLLECTED | NOT_APPLICABLE |

_Complete ledger: 26,292 rows in the linked machine-readable artifact._

Complete register: [`fields.csv`](../../lg008-llm-gateway/catalogs/fields.csv).
