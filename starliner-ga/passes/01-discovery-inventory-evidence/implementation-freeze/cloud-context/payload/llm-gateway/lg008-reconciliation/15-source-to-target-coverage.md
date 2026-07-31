# Source-to-target coverage


Frozen LLM profile target fields reconciled: **128**.

No target field is confirmed merely because a source key shares its spelling.
Exact-name candidates are `SOURCE_FACT_UNMAPPED`; alias candidates are
`PARTIALLY_CONFIRMED`; absent mandatory fields are `UNSOURCED`; absent optional
fields are `NEEDS_LIVE_VALIDATION`.

Mandatory gaps: **54**. They block closure until an
implemented mapping is proven or change control accepts a different contract.

| target_item | record | field | required | status | contradiction | closure_impact |
| --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:target-field:d3837da8-17f0-5d55-86e6-632a27a817c6 | attributionSignature | format | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:3ae28f0f-9e54-5fb5-b46b-01534af9cbd4 | attributionSignature | algorithm | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:bcd6f5a3-217f-542c-9e4e-2ff0d77fb80a | attributionSignature | key_id | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:9e97fe1c-4f31-5467-8113-0fcfdb66227c | attributionSignature | value | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:ebd88ecb-662f-5bf5-ac26-89a69ecba46f | crossSensorAttribution | assertion_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:83ea9ac5-bf29-55b0-b26f-efb7161a2220 | crossSensorAttribution | issuer_producer_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:fe1cfb4d-5512-539f-a0c1-3cf364d1f23b | crossSensorAttribution | subject_profile | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:bd9a3c16-cc11-53ba-83f1-8e1e5d64c48d | crossSensorAttribution | subject_namespace | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:d6c2dc1f-c6be-5b78-8d3a-07a21b73cbf3 | crossSensorAttribution | agent_deployment_source_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:0e310008-c5ce-5740-b76d-e01e630d20e3 | crossSensorAttribution | workload_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:91ce2d2f-4b74-58f8-be4b-f9a77b6fb9c8 | crossSensorAttribution | issued_at | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:fb06cacf-094f-5b15-8e70-ec2a22c188ae | crossSensorAttribution | expires_at | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:d948ea9e-007b-5d2f-a5c7-9737735c2118 | crossSensorAttribution | nonce | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:8f6e278a-9e2f-53d8-9972-9be1013901a6 | crossSensorAttribution | audience_gateway_source_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:22fee87b-445a-5e35-8b30-c60c73bbd433 | crossSensorAttribution | request_binding_digest | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:404a43f3-c443-5606-96ec-489c9c3ee482 | crossSensorAttribution | assurance | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:960053bf-82a1-5ddd-8bfe-272bd65b5544 | crossSensorAttribution | signature | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:f21931a4-9572-5787-be1f-3cc35475af7a | entity | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:a008ff82-08d3-5142-9ded-bf4b78e0689c | entity | entity_type | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:955e26f5-3452-5585-a871-c7d5c77cdc4d | entity | source_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:aef3d9d3-bd87-512b-a775-07e5686cec54 | entity | parent_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:3ade8503-daeb-5bc4-aeb6-28279c7fcff0 | entity | lifecycle | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:2c125ed7-62d8-5a90-9422-aa64914fe402 | entity | provider | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:82ef96da-ace3-579f-8d9a-37b55fc82abd | entity | provider_model_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ad1e6f4b-4b41-51cc-b18b-a52051c6bd8d | entity | deployment_name | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:0b643493-a97f-553b-ba59-39a878eefcb8 | entity | route_name | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:da27b367-78b0-58ab-a7d5-6be5c753a9e2 | entity | region | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:6271af55-e1f0-51fb-a414-28cc4c3a4f4e | entity | display_name | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:bfb528d8-ef81-578e-a8ec-112af42ffc81 | entity | owner_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:cd1f5593-61dc-5c12-b7ee-34892f9ba918 | entity | definition_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:56d18ced-d547-579e-bc98-02d0143215b9 | entity | execution_identity_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:5398b91e-8bc8-5f9c-ba53-8abc999a6a4f | entity | deployment_locality | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:6828c1a0-9c5c-5974-ada2-58d9ad464546 | entity | agent_kind | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:017bd7c6-f761-55f9-9a3b-72fd71b6ec38 | entity | key_fingerprint_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:bfb3fe11-c7ab-5b59-9492-c7127e4ead90 | entity | labels | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:33c011ff-7cda-576a-94c2-187bdf1ca017 | relationship | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:89fa9971-fb61-5e9b-8480-c58ebff8eb55 | relationship | subject_type | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:a2315628-c656-5537-918a-44fac8500258 | relationship | subject_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:7a3c56a1-a4b0-566e-84a1-0faa14431500 | relationship | predicate | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:b67649ea-fff4-5f30-98f6-a51d302efb6d | relationship | object_type | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:6bfd9243-ded0-5b43-9bb5-1a24f69f0ed7 | relationship | object_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:747ec83a-9cd0-5429-8004-0f2908d91239 | relationship | semantic | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:01d8c2dc-fe21-5150-aa1e-034b7dca2d21 | relationship | operation | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:9d591daf-eb00-52cb-b0e3-200415a9a247 | relationship | confidence | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:d4682421-c540-5151-bbc2-7b134297c727 | invocation | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:64f96d30-3052-5511-b437-de7b251bbf79 | invocation | invocation_id | Yes | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:1cff12c1-4cca-565f-adc2-2089f78672ba | invocation | stage | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:1390dc12-0c06-5160-8bab-4dbf95fa2b39 | invocation | provider_request_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:5fe81a82-d6a5-59bb-b8fd-5c3ec7366bc7 | invocation | model_source_id | Yes | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:c63be97c-a196-575a-869e-f07b2e119dda | invocation | deployment_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ab1f004a-e027-5d6a-a304-523225e30659 | invocation | route_source_id | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:3c4a4946-afab-555c-a018-0059021e49e3 | invocation | actor_source_id | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:73e0a1f0-a93a-5215-9988-156ea6ad9b70 | invocation | workload_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:3e1b9777-d47a-5aa6-8102-6f97238639ef | invocation | agent_deployment_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:15ee314e-d83b-5e47-8a56-11f94bb108b1 | invocation | cross_sensor_attribution | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:c07da12d-01fe-5071-9e6a-6b7004a1bc1a | invocation | status | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:39da9d88-60dc-5f11-9947-5953b42e4d7a | invocation | http_status_class | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:22349700-3abe-52cd-a8d7-e391f5bfb5b7 | invocation | request_tokens | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:0c44a348-63ee-5f24-b5f4-57c4b2a5f407 | invocation | response_tokens | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:4a76be7e-bba4-5377-9301-297d5d9b75e6 | invocation | cached_input_tokens | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:959f9775-16e8-500f-a73d-526a9a15624d | invocation | cache_write_tokens | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:36e67b75-3a23-52f3-9489-8ced49056a6f | invocation | reasoning_tokens | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:64728d79-13f6-53e7-b150-b44037e4ff54 | invocation | total_tokens | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:86026af0-c4ba-51d1-84aa-856a51748d4c | invocation | latency_ms | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:0db5eaf0-7820-5847-a282-e60109625841 | invocation | upstream_latency_ms | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:0f4a3f9f-9269-5ebc-ac71-8d3add7f3efe | invocation | gateway_latency_ms | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:69cc24d7-3d93-5215-8284-20d148ca7004 | invocation | guardrail_latency_ms | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ece91b05-0661-55ac-ad8c-b43f18b0aa57 | invocation | time_to_first_token_ms | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:c3e84263-4be8-5999-8b14-7646436c8c0e | invocation | route_group | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:b0e2d280-e93c-566b-8d5c-30d282911835 | invocation | route_mode | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ec529197-0b80-5c23-a5f1-9006d05bbabf | invocation | template_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:fd4f54ae-52f0-5e9d-8e37-8f97455a2a83 | invocation | conversation_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:5f45dda1-0a37-5f4c-92d9-ef832cf657ee | invocation | thread_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:a1330d76-6b2e-5956-a818-c9a8a5710517 | invocation | run_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:3ed0736d-c7a1-5d15-8e64-63ca7b1c0630 | invocation | span_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ef6d81de-e514-53e0-ba89-c5a3005a5704 | invocation | step_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:d9ef2f20-aabb-5b94-8769-a6bd41a0f410 | invocation | workflow_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:9b8e1e02-1bdf-5c97-b823-262f105cb53e | invocation | tool_names | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:7116a313-34ad-5565-9cea-eb4cc3950e13 | invocation | tool_call_count | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:a91416d3-120e-5765-9f0d-d373131ad4e6 | invocation | was_blocked | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:3d676143-2bdb-530d-bae7-872e1e2af209 | invocation | was_anonymized | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ef89b5a8-5239-54f3-9387-9fb1c088589b | invocation | was_monitored | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:656b39cc-fb67-5ca4-9a3b-3f02283c28b4 | invocation | guardrail_outcome | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ac1c5b76-f30c-5526-b27b-620e85278a30 | invocation | feature_labels | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:1d19ba0a-2c58-527d-a50d-a7484741e405 | invocation | streamed | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:42fc92b2-29b5-5cf0-b0cd-388df8bf9147 | invocation | error_class | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:fb535e42-f4af-53d4-834f-8d8f65a9d2e6 | invocation | data_labels | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ee85346b-eb99-5ebe-9eac-50205f1024dc | nativeDecision | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:9a246579-cfce-582e-8b4d-8d54fafd9ded | nativeDecision | decision_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:ce0313bf-1ef7-5b20-85ba-0abeb32b610e | nativeDecision | invocation_id | Yes | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:6dabe153-c40a-5666-99b4-2f52c28312f8 | nativeDecision | decision | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:0d1789d1-cfe8-5ef1-8ddb-485754becfea | nativeDecision | policy_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:053887d9-e62a-5d2d-bb05-aa2e945ec1a6 | nativeDecision | classification_labels | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:4cd5d147-66d1-58af-adb2-3f05cb12c04c | nativeEffect | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:730442c6-332d-5aee-b8a4-f55dddaab508 | nativeEffect | decision_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:9f824483-839c-5c02-bdca-3dd5cf58a008 | nativeEffect | invocation_id | Yes | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:52baed64-cb94-51aa-ae5a-6c7c9fa28d68 | nativeEffect | effect | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:f4fc03db-2dc3-5c82-9b8b-1865b66dd006 | nativeEffect | provider_request_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:ab64736e-f0ba-5691-98c9-24ecd3f18bf1 | nativeEffect | error_class | No | PARTIALLY_CONFIRMED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:13f9d345-0c0d-52c4-8d53-76823be3fb66 | nativeEffect | classification_labels | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:d35eb3a7-5ce8-5d19-82b2-9b3476cb5cba | snapshot | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:39cb3d6e-3715-500d-aef7-b3206e06f8f7 | snapshot | snapshot_id | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:b2c643e1-7ebb-5588-9f4e-1e83692d65a8 | snapshot | stage | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:376a57d9-4fcc-595c-9d42-0ccaae6a9d6f | snapshot | scope_type | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:3e017952-7d2c-5aeb-80dc-5ffb0dba164f | snapshot | scope_source_id | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:2f08013d-cd3b-547d-93ce-955288cd483d | snapshot | page_sequence | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:f9746de7-caab-58cf-b6d4-7e71d595747d | snapshot | page_count | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:eb36592b-5678-5f58-be4c-c6c0b1318ea3 | snapshot | cursor | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:2b7a76d2-49d6-5809-90d4-bc2063d57014 | snapshot | members | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:54a3c436-fdd4-530d-9e75-fad7b2587a18 | snapshot | expected_count | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:970f610a-4719-5fcf-85e4-25ab641264d7 | snapshot | observed_count | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:61c34bce-fcd2-5307-a83d-4b30c15f83fe | snapshot | completeness | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:9d39581e-27e3-5cc5-ac3e-15ae887e58dd | snapshot | source_revision | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:8aa111de-b7e2-5dac-b3d1-9e515423621f | snapshot | snapshot_digest | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:d0828565-38c1-57ba-b1a4-f7208a6c5aec | snapshot | reason_code | No | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | Nonblocking or mapping work |
| urn:quilr:lg008:target-field:5ac898e2-c995-5c00-b495-d1ea91b554bb | health | kind | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:296e9151-3275-5d33-9c1d-16d5f68a0c32 | health | component | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:c8182782-a582-5c61-a601-9d1bd0a5a126 | health | state | Yes | SOURCE_FACT_UNMAPPED | Name-level source support only; record semantics and adapter transformation are unverified | BLOCKER |
| urn:quilr:lg008:target-field:49d17850-a489-56cd-9196-c20b6de4cf47 | health | transports | Yes | UNSOURCED | Required frozen target has no current source field | BLOCKER |
| urn:quilr:lg008:target-field:140f2406-e818-5934-a276-8a35bf0f7955 | health | queue_depth | No | NEEDS_LIVE_VALIDATION | Optional field not statically sourced | Nonblocking or mapping work |

_Complete ledger: 128 rows in the linked machine-readable artifact._

Complete ledger:
[`target-field-coverage.csv`](../../lg008-llm-gateway/reconciliation/target-field-coverage.csv).
