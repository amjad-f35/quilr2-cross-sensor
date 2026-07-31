# Global Stable-ID Registry

The registry contains 267 deterministic URNs. UUIDs are derived from a fixed LG-008 namespace plus kind and canonical source locator/revision inputs; line numbers are never identity inputs.

| Kind | Count |
| --- | ---: |
| CHANGE_REQUEST | 3 |
| EVIDENCE_ITEM | 87 |
| REPOSITORY | 5 |
| REVISION | 5 |
| RUNTIME_EXPERIMENT | 5 |
| SOURCE_FILE | 74 |
| SOURCE_PROFILE | 5 |
| TARGET_CONTRACT | 74 |
| UNRESOLVED_EVIDENCE_ITEM | 9 |

**Verified:** every ID matches `urn:quilr:lg008:<kind>:<uuid>` and is unique when the stable-ID validator passes.

**Unresolved:** ownership is intentionally blank where the source artifacts declare no accountable owner. The ownership validator must fail rather than invent one.
