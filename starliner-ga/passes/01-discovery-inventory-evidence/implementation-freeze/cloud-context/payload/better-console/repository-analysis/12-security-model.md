# Security Model

## Verified controls

| Control | Enforcement | Protected resource | Failure |
| --- | --- | --- | --- |
| authentication | AuthService + session extractor | console APIs | 401/503; credential errors avoid account-state detail |
| authorization | authz permission/resource/action evaluation | routes/features/mutations | 403/fail closed |
| tenant isolation | principal-selected tenant/subscriber predicates | all source/store reads | caller tenant headers cannot widen scope |
| browser mutation CSRF | trusted exact/wildcard Origin + X-Quilr-CSRF | state-changing browser requests | 403 |
| session storage | opaque IDs, secure cookie settings, Redis TTL | authenticated state | invalid/revoked rejected |
| upstream request safety | fixed roots, encoded/validated path segments, timeouts/body caps | management services | 400/502/504 |
| secret redaction | custom Debug impls, content sanitizer, export sanitizer | credentials/content/logs | safe projection/error |
| read-only analytics | ClickHouse readonly=2 | source tables | database rejects writes |
| file/network constraints | icon origin/content/size checks; dashboard sandbox limits | filesystem/HTTP/process execution | reject/error |

## Security boundaries and limits

- The activity-topic writer is a deliberate exception and must be grant-scoped externally; source proves client separation, not deployed grants.
- Authentication can be disabled by configuration. **Verified:** this is a supported mode, not an inferred bypass. Deployment policy determines acceptability.
- The tracked compatibility key is not copied to the final image according to Dockerfile stages. Its presence in git is repository-visible legacy material; contents were not reproduced.
- **Potential issue requiring validation:** `npm audit` reported 17 dependency advisories in the reconstructed frontend install. Registry-accurate advisory identities/severity remediation were not established.
