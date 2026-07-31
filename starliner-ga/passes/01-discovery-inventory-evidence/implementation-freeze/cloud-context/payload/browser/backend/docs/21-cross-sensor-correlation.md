# Cross-sensor correlation

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Documents how Backend observations may correlate with Browser, endpoint, gateway, directory, and platform evidence without arbitrary identity collapse.

## Verified findings

- **Verified:** Backend auth context can strengthen attribution for received events.
- **Verified:** Correlation does not prove missing upstream activity.

## Unresolved or non-implemented behavior

- **Unresolved:** Stable installation IDs and external connector evidence are required for stronger joins.

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

## `relationships.csv`

Complete machine-readable ledger: [`relationships.csv`](../../../matrices/sensor-intelligence/browser-backend/relationships.csv) (2 rows).

| Relationship ID | Source entity | Relationship | Target entity | Direct or inferred | Native evidence | Lifecycle | Confidence | Platform availability | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Persona | USES | Device | Direct | DeviceHeartbeat personaId/deviceId | Refreshed by heartbeat | High within auth context | Available through adapter mapping only | Verified in source | Do not infer absence from missed heartbeat |
| R-002 | Device | HOSTS | Browser product/instance | Inferred from same heartbeat | DeviceHeartbeat browser fields | Refreshed by heartbeat | Medium until browser-instance ID exists | Derivable centrally from current output | Inference | Browser product is not instance |
