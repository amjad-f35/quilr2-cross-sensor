# Acceptance Scenarios

1. Fresh source record emits one evidence envelope and one admitted candidate.
2. Duplicate/replay is idempotent.
3. Out-of-order and late records retain source/event/receive time.
4. Missing tenant fails closed and quarantines.
5. Sensitive content follows restricted/redacted disposition.
6. Unsupported profile sets explicit coverage state.
7. Source outage lowers coverage without deleting entities.
8. Restart resumes only after last acknowledged checkpoint.
9. Reconciliation balances source/admitted/quarantine/in-flight counts.
10. Cross-sensor name collision remains separate until resolver evidence is sufficient.
11. Control acceptance does not equal effect; later observation closes the result.
12. Compatibility cohort can roll back to prior reads.
13. Topic classifier provider loss leaves read mirror/HTTP active and reports degraded generation.
14. Poison bucket retries four times then records dead-letter state.
15. Tenant/subscriber attempts cannot broaden trusted scope.
