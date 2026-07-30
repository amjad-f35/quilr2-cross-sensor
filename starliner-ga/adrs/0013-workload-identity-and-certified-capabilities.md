# ADR-0013: Workload identity and certified capabilities

Status: **accepted**

## Context

Static shared API keys cannot safely bind a producer to tenant, environment, region, software, source profile, or enforcement capability.

## Decision

Producers enroll with time-bounded bootstrap, obtain renewable workload identity, and present a signed release-pinned capability manifest. Ingest and control authorize against centrally admitted capabilities and certification.

## Consequences

- Credential rotation/revocation and artifact provenance are operational dependencies.
- A compromised adapter cannot self-declare command capability.
- Enrollment and certification are separate.
- On-prem/dedicated profiles require compatible trust bootstrapping.

## Rejected

Permanent shared tenant keys and producer-supplied unsignatured capability flags.

## Validation

Wrong tenant/profile/region, expired/revoked credential, downgraded runtime, forged manifest, rotation, and disaster recovery.
