# Acceptance scenarios


1. A gateway instance enrolls and reports an authenticated instance/artifact identity.
2. The instance reports a versioned capability manifest matching enabled protocol hooks.
3. One OpenAI-compatible request produces a finalized observation with tenant, request, app, provider/model, status and timing.
4. The observation remains in the local outbox through process restart and network loss.
5. Replayed duplicate delivery is idempotently acknowledged.
6. Source freshness and outbox health appear in Coverage.
7. Gateway, application surface and model route inventory show source provenance.
8. A request-side sensitive-data event creates one finding only when detector/capture coverage is healthy.
9. The finding links to access-controlled evidence without displaying raw prompt content by default.
10. Gateway outage lowers coverage and freshness but does not delete inventory.
11. A protocol unsupported by the manifest cannot generate a false coverage claim.
12. A provider/model routing change creates a new source claim/audit event without overwriting historical evidence.
13. User email is an identifier candidate and resolves only through central identity authority.
14. Post-response blocking is displayed as gateway withholding, not provider-side rollback.
15. Any future signed control command is authenticated, replay-protected, acknowledged and effect-reported.
