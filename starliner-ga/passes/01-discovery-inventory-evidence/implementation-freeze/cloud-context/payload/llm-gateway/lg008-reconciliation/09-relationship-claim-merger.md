# Relationship claims


| claim_id | subject | relationship_type_id | object | direct_or_inferred | proof_status | authority |
| --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:relationship-claim:690b27d4-39c0-562f-9d2c-dba3157ed7f3 | Gateway API key | urn:quilr:lg008:relationship-type:afbd3751-70fe-5f3f-a061-3b5aa907480f | Application configuration | Configuration | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:d6df916a-f0b1-5e3a-be50-3a4fac4deb66 | User account | urn:quilr:lg008:relationship-type:aa641909-3459-5058-967e-86202989153c | Application configuration | Configuration | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:072a7b51-7dc8-5e1b-84f3-e6c35333ac2c | Request | urn:quilr:lg008:relationship-type:b94adcf6-3cf1-5339-8155-a020b5d58a31 | Gateway deployment | Direct observed | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:cf986118-4868-5444-8442-9fbe7c772b0b | Request | urn:quilr:lg008:relationship-type:225b0248-7edc-5516-92ae-1decad4d1145 | Model route | Direct observed | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:f94f003f-4328-57cf-ab37-53fdfa0ebe9e | Request | urn:quilr:lg008:relationship-type:5332d02d-07b7-566b-9d26-cdc1aa521914 | Gateway-observed account | Direct when user context present | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:fabbb009-5844-543a-823b-19452acf23b8 | Guardrail decision | urn:quilr:lg008:relationship-type:98278f32-242d-591f-87c3-5293ab1a26c6 | Request or response | Direct | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:42e56329-bab4-5224-9e44-ef9619e5eafc | Gateway | urn:quilr:lg008:relationship-type:f4f64d1c-a8a9-575f-920f-9e3c4196cd5a | Provider endpoint | Direct | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:15fd759f-c6a4-5d9f-92c2-2783042ea7b8 | DLP result | urn:quilr:lg008:relationship-type:0111957a-ec76-5dae-b26c-38e8ef1e73da | Prompt/response evidence | Direct | SOURCE_PROVEN | Source-native claim; not canonical identity |
| urn:quilr:lg008:relationship-claim:c8868a92-239b-5886-ae1c-ee216ad9fd75 | Red-team run | urn:quilr:lg008:relationship-type:2fce0e4d-3954-5910-87a7-bfa9c39ff7a2 | Application/model target | Configured plus observed run | SOURCE_PROVEN | Source-native claim; not canonical identity |

These are source-native claims, never canonical identity decisions. Each claim
has an evidence ID, access recipe, reachability, confidence, authority,
disposition, and owner. Validity windows stay unresolved where no lifecycle
timestamps exist.

Complete catalog:
[`relationships.csv`](../../lg008-llm-gateway/catalogs/relationships.csv).
