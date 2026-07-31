# Discovery and inventory contributions

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents the limited inventory claims available from accepted heartbeats and graph projections.

## Verified findings

- **Verified:** Heartbeat data contributes device/browser/persona freshness and projection inputs.
- **Verified:** A graph projection is derived state, not immutable source evidence.

## Unresolved or non-implemented behavior

- **Unresolved:** The separate extension-log-service repository/contract is absent.

## `inventory-entities.csv`

Complete machine-readable ledger: [`inventory-entities.csv`](../../../matrices/sensor-intelligence/browser-backend/inventory-entities.csv) (5 rows).

| Entity ID | Object type | Directly discovered | Evidence | Native IDs | Attributes | Lifecycle signals | Relationships | Platform availability | Confidence and limits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IE-001 | Human user/persona | Yes, authenticated context and persona APIs | Verified in source | personaId, email, subscriber, tenant | email, groups/roles and selected tenant in context | persona register/update/delete; heartbeat freshness | uses device, browser and application account | Available through adapter mapping only | Email is not a canonical person key by itself |
| IE-002 | Device/workstation | Partial | Verified in source | numeric device ID; weak hostname; raw serial on some native platforms | deviceType, OS/platform, versions, last access | heartbeats; native identifier refresh | hosts browser/native sensor; used by persona | Available through adapter mapping only | Current SystemID strong top-level fields are empty |
| IE-003 | Browser product | Yes | Verified in source | browser name plus version | name, version, user agent, OS | heartbeat/version changes | runs extension and observes applications | Available through adapter mapping only | Product/version is not a browser profile or installation identity |
| IE-004 | Browser installation/profile | Partial | Verified in source | extension device/browser IDs in diagnostic snapshot; no stable ordinary-event browser instance ID | browser/extension version and local profile storage | heartbeats and extension lifecycle | installed on device; has extensions | Requires minor sensor instrumentation | No consistently emitted stable browser-instance identifier |
| IE-007 | Web application surface | Yes | Verified in source | domain, URL, backend application identity when resolved | name, domain, URL, authentication type, AI/new flags | visit/auth/prompt/file/clipboard events | used by account/persona; source/destination | Available through adapter mapping only | URLs may contain sensitive path/query; domain is not tenant-specific app identity |

## `coverage.csv`

Complete machine-readable ledger: [`coverage.csv`](../../../matrices/sensor-intelligence/browser-backend/coverage.csv) (2 rows).

| Coverage ID | Environment/surface | Capability | Supported code path | Coverage class | Known blind spots | Negative-event semantics | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CV-011 | Browser backend ingress | Event acceptance | BES HTTP | Direct when request reaches service | Network failure, auth, validation, missing extension-log-service | No backend record may be upstream delivery failure | Available through adapter mapping only | Verified in source |
| CV-012 | Backend heartbeat | Health aggregation | Process-local bucket/Kafka/Neo4j | Partial durability | Pod restart, multi-pod fragmentation, false send deletion | Missing graph update does not prove sensor offline | Requires substantial sensor changes | Verified in source |
