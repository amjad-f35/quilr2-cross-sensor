# Unresolved evidence


| unresolved_id | question | what_evidence_is_missing | authorized_future_validation_procedure | owner | classification | closure_blocking |
| --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:unresolved-evidence-item:1e1902b2-34ee-569c-b0fa-7cf6f5282ad3 | Effective production routes/configuration | deployment manifests and live safe route listing | urn:quilr:lg008:validation-procedure:50d09f6b-3a1c-5eaf-851c-888e6e2d2636 | llm_gateway_lead | BLOCKING | Yes |
| urn:quilr:lg008:unresolved-evidence-item:caeef422-b054-5a82-9a4c-1641af6a61fa | Provider/NATS/ClickHouse/Axis behavior | authorized non-production integration environment | urn:quilr:lg008:validation-procedure:0ece21c3-8ef6-5d48-a8e7-5376e68cd48c | quality_lead | BLOCKING | Yes |
| urn:quilr:lg008:unresolved-evidence-item:9565543e-f6a8-56f9-81ef-0d4575e678eb | Starliner sidecar ABI and durability | release-selected Starliner build plus crash/replay test | urn:quilr:lg008:validation-procedure:61e3fe2f-fe09-519e-97cb-6e6622659311 | edge_lead | BLOCKING | Yes |
| urn:quilr:lg008:unresolved-evidence-item:0003d8e1-253c-585b-a5a7-1628b8331a65 | Protocol parity across 252 routes | transport conformance suite per advertised route | urn:quilr:lg008:validation-procedure:df031cfc-5611-5805-a9f6-abadef82815e | llm_gateway_lead | BLOCKING | Yes |
| urn:quilr:lg008:unresolved-evidence-item:a454fdb5-e1e2-59e4-ad00-2c242bc18556 | Production secret rotation and tenant isolation | security architecture and non-production isolation assessment | urn:quilr:lg008:validation-procedure:ded5cdec-e820-5966-995e-1a1c2c90b960 | security_lead | BLOCKING | Yes |
| urn:quilr:lg008:unresolved-evidence-item:daf07297-c90e-58a9-9779-6e2eeee0353d | Provider account/model registry authority | provider connector/model registry | urn:quilr:lg008:validation-procedure:d770dd0d-dde5-5980-a525-3c17674356fb | connector_lead | DEFERRED_FUTURE_CONNECTOR | No |
| urn:quilr:lg008:unresolved-evidence-item:132cc093-ef22-5a81-8ed5-b72f220174c3 | Authoritative human/workload identity | IdP/agent runtime attestation | urn:quilr:lg008:validation-procedure:48c16ec8-a234-5a77-9a66-c73c5e897cfa | data_identity_lead | DEFERRED_FUTURE_CONNECTOR | No |
| urn:quilr:lg008:unresolved-evidence-item:1617e1e2-4c6b-54ca-bf34-7228427d4442 | Frozen artifact immutable revision/sign-off | signed release manifest | urn:quilr:lg008:validation-procedure:bf1841e6-aa62-5e8e-920c-4d73e356f97f | program_lead | CHANGE_CONTROL_PENDING | Yes |

Six items block closure. Two are explicitly accepted future-connector
boundaries and do not independently block this LLM package. Every item has a
registered validation procedure, evidence expectation, owner, priority,
closure flag, target-date state, and accepted-boundary decision.

`Unresolved:` executable live commands cannot be supplied until an owner
provides an approved non-production endpoint, authorization method, deployment
revision, and credential type. The procedures record that prerequisite instead
of inventing commands.

Machine register:
[`unresolved-evidence-register.yaml`](../../lg008-llm-gateway/unresolved/unresolved-evidence-register.yaml).
