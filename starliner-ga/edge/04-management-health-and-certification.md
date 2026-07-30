# Edge Management, Health, and Certification

Status: **normative**

## Fleet object

Each deployed runtime is represented centrally as a managed producer/workload, not as an AI estate entity. Its management record includes:

- tenant, environment, and region;
- producer and workload identity;
- sensor profile and deployment form;
- runtime, adapter, manifest, and policy versions;
- advertised and centrally admitted capabilities;
- installation and last-seen time;
- heartbeat and coverage state;
- WAL depth and oldest age;
- authentication and certificate status;
- update channel and rollout cohort;
- recent self-test and certification result;
- privacy mode and restricted-content eligibility.

## Health dimensions

Health is multi-dimensional:

| Dimension | Examples |
|---|---|
| Capture | adapter connected, native source reachable, permissions intact |
| Privacy | rules loaded, redaction tests current, prohibited-content count |
| Durability | WAL writable, backlog age, corruption state |
| Delivery | ingest reachable, authentication valid, retry/throttle state |
| Time | clock offset, monotonic source available, timestamp quality |
| Policy | active version, expiry, signature, evaluation errors |
| Control | command queue, rejected commands, effect-observation capability |
| Software | supported version, provenance, vulnerability posture |

A single green heartbeat cannot mask a red capture dimension.

## Coverage mapping

Management health feeds the central coverage model. Coverage expresses what visibility or enforcement was reasonably expected and actually available for:

- population or account;
- source profile;
- capability;
- entity class;
- time interval;
- geography or network boundary.

Coverage is never inferred only from the presence of recent events.

## Enrollment

Enrollment:

1. bootstraps through a time-bounded one-use credential;
2. attests the signed software and manifest when supported;
3. exchanges for workload identity;
4. binds to tenant, environment, region, profile, and cohort;
5. downloads the trust bundle and initial policy;
6. runs self-test;
7. starts delivery only after regional routing is confirmed.

Long-lived shared API keys are not the default workload identity.

## Updates

- All artifacts are signed and provenance-verifiable.
- Runtime and adapter compatibility is declared in the manifest.
- Rollout supports canary, bounded cohort, pause, resume, and rollback.
- Backlogged WAL data must survive an update.
- Security revocation can block a compromised version.
- Rollback cannot downgrade below a protocol or security floor.
- Customer maintenance windows and emergency security updates are separate policies.

## Support diagnostics

An operator bundle contains:

- versions and manifest digests;
- redacted configuration metadata;
- health transitions and reason codes;
- queue and retry statistics;
- schema rejection summaries;
- recent self-test results;
- OS/runtime environment facts allowed by policy.

It excludes secrets, normal restricted content, and unbounded raw event payloads. Bundle creation and access are audited.

## Certification levels

| Level | Meaning |
|---|---|
| Development | Local schema compatibility only; not customer deployable |
| Integration | Interoperates with a non-production tenant cell |
| Production candidate | Passes functional, security, privacy, recovery, upgrade, and load suites |
| Production certified | Exact signed artifact is approved for specified profiles and environments |
| Revoked | Must not enroll or receive new commands |

Only production-certified artifacts may be used for GA claims.

## Required certification suites

- contract compatibility and unknown-field behavior;
- source-native identity fidelity;
- privacy and secret leakage;
- resource limits and application latency;
- offline durability and recovery;
- upgrade, downgrade prevention, and rollback;
- tenant and region binding;
- credential rotation and revocation;
- hostile command, replay, and confused-deputy tests;
- reconciliation correctness;
- time quality and late arrival;
- management-plane partition;
- enforcement safety and effect observation;
- supported OS/browser/gateway matrix;
- software supply-chain verification.

## GA evidence

Certification results, exact artifact digests, exception approvals, and expiration are stored centrally. A marketing or UI capability claim must resolve to a current production certification for the actual deployment profile.
