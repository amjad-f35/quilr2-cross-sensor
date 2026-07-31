# Sensor role and boundaries

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Separates the central Browser Extension Service from the extension/native-host Browser profile and from downstream platform responsibilities.

## Verified findings

- **Verified:** The service receives browser records only after network/authentication boundaries.
- **Verified:** It enriches and forwards event records and aggregates heartbeat records.

## Unresolved or non-implemented behavior

- **Unresolved:** It cannot observe events lost before backend ingress or prove end-to-end platform materialization.

## `coverage.csv`

Complete machine-readable ledger: [`coverage.csv`](../../../matrices/sensor-intelligence/browser-backend/coverage.csv) (2 rows).

| Coverage ID | Environment/surface | Capability | Supported code path | Coverage class | Known blind spots | Negative-event semantics | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CV-011 | Browser backend ingress | Event acceptance | BES HTTP | Direct when request reaches service | Network failure, auth, validation, missing extension-log-service | No backend record may be upstream delivery failure | Available through adapter mapping only | Verified in source |
| CV-012 | Backend heartbeat | Health aggregation | Process-local bucket/Kafka/Neo4j | Partial durability | Pod restart, multi-pod fragmentation, false send deletion | Missing graph update does not prove sensor offline | Requires substantial sensor changes | Verified in source |

## `cross-sensor-overlaps.csv`

Complete machine-readable ledger: [`cross-sensor-overlaps.csv`](../../../matrices/sensor-intelligence/browser-backend/cross-sensor-overlaps.csv) (6 rows).

| Overlap ID | Browser sensor contribution | Other sensor/source | Overlap or complement | Correlation keys | Authority rule | Conflict handling | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XO-001 | Persona email/account activity | Identity provider/HR | Browser observes use; IdP/HR owns identity/account authority | tenant, personaId, provider account ID, email weakly | External authoritative source owns person/account lifecycle | Keep both observations; do not merge solely on email | Requires an external authoritative source | Proposed |
| XO-002 | Device ID/hostname/serial clues | Endpoint/MDM | Browser provides heartbeat use; endpoint/MDM owns device inventory/health | tenant, assigned device ID, hardware token | MDM/endpoint should own canonical device identity | Quality-ranked identifiers and temporal assertions | Requires an external authoritative source | Proposed |
| XO-003 | Browser product/version | Endpoint software inventory | Browser is direct for active extension context; endpoint may inventory installed browsers | device ID, browser product, profile instance ID | Browser sensor owns observed profile activity; endpoint owns host software inventory | Represent separate product/install/profile entities | Requires minor sensor instrumentation | Proposed |
| XO-005 | Web app/account use | SaaS connector/CASB/IdP | Browser sees interaction; connector sees server-side tenancy/data | tenant, provider account ID, app domain, time | Neither source alone is global authority for use | Correlate with confidence and preserve source | Available through adapter mapping only | Proposed |
| XO-006 | AI prompt activity | LLM gateway | Browser sees UI and unsupported direct traffic; gateway sees proxied API | user/account, app/model, time, content hash if allowed | Do not double count; gateway authoritative for proxied request delivery, browser for UI action | Dedup by explicit request/correlation ID preferred | Requires minor sensor instrumentation | Proposed |
| XO-012 | Sensor health | Endpoint deployment/extension admin | Heartbeat observes runtime; deployment source owns expected installations | sensor instance/device/browser profile | Expected vs observed sources distinct | Coverage finding needs both expected and observed | Requires an external authoritative source | Proposed |
