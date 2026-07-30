# Secure Development, Supply Chain, and Release

Status: **normative**

## Development controls

- protected source repositories and reviewed changes;
- branch and change-management policy;
- least-privilege CI identities;
- isolated and reproducible build environments;
- secrets never stored in source or build logs;
- dependency pinning and review;
- static, dynamic, composition, and secret scanning;
- threat model for material changes;
- security/privacy review gates;
- signed release approval.

The program aligns its secure-development controls to NIST SSDF and release provenance to the adopted SLSA level. Exact control mappings live in compliance evidence, not marketing claims.

## Artifact identity

Every deployable artifact has:

- immutable digest;
- source revision;
- build workflow and builder identity;
- dependency/SBOM reference;
- provenance statement;
- signature;
- target platform/profile;
- compatibility metadata;
- vulnerability and exception state;
- promotion history.

Tags and filenames are not sufficient artifact identity.

## Build and provenance

- Builds run from reviewed, immutable source.
- The build service produces verifiable provenance.
- Signing keys are isolated from developer workstations.
- Artifacts are promoted by digest across environments; they are not rebuilt for production.
- Generated protocol/API code is reproducible from pinned contracts.
- Third-party binaries have source, license, vulnerability, and integrity records.

## Release train

Each service, edge runtime, adapter, schema, normalizer, resolver, materializer, insight, and policy bundle can roll out independently only when compatibility permits. Promotion stages:

1. development verification;
2. integration;
3. production candidate;
4. internal/canary tenant;
5. bounded customer cohort;
6. staged regional production;
7. GA;
8. deprecation and removal.

## Release evidence

- change set and decision references;
- tests and conformance;
- security/privacy results;
- migration and rollback;
- performance/capacity;
- compatibility matrix;
- known issues and customer impact;
- artifact digests/provenance;
- approvals and separation of duties;
- observed canary health;
- support/runbook readiness.

## Database and data releases

- Expand/contract migrations.
- Backward-compatible mixed-version window.
- Online migration where required by SLO.
- Tenant-bounded batches.
- Progress, pause, resume, and rollback/forward repair.
- Pre/post invariants and backups.
- No destructive schema removal before all readers are retired.

## Emergency releases

Emergency changes still require traceability, artifact signing, bounded rollout, and post-release review. Bypassed gates are explicitly recorded with approver and expiration; they do not disappear after the incident.

## Vulnerability management

The program maintains asset/SBOM inventory, intake and triage, exploitability assessment, remediation SLA by severity/exposure, customer advisory process, artifact revocation, and exception governance. Unsupported runtimes are blocked from new enrollment and may be isolated under policy.

## Deprecation

Deprecation includes announcement, tenant usage visibility, migration tooling, compatibility period, support plan, final gate, and removal evidence. Protocol evolution follows the compatibility rules; forced silent edge upgrades are not the only migration mechanism.
