# Relationship contributions

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Catalogs direct and inferred Browser Backend relationship claims without collapsing graph projections into authoritative identity.

## Verified findings

- **Verified:** Relationship confidence and lifecycle are retained per row.
- **Verified:** Neo4j heartbeat relations are derived projections.

## `relationships.csv`

Complete machine-readable ledger: [`relationships.csv`](../../../matrices/sensor-intelligence/browser-backend/relationships.csv) (2 rows).

| Relationship ID | Source entity | Relationship | Target entity | Direct or inferred | Native evidence | Lifecycle | Confidence | Platform availability | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Persona | USES | Device | Direct | DeviceHeartbeat personaId/deviceId | Refreshed by heartbeat | High within auth context | Available through adapter mapping only | Verified in source | Do not infer absence from missed heartbeat |
| R-002 | Device | HOSTS | Browser product/instance | Inferred from same heartbeat | DeviceHeartbeat browser fields | Refreshed by heartbeat | Medium until browser-instance ID exists | Derivable centrally from current output | Inference | Browser product is not instance |
