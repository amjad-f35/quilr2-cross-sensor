# 38. Source, artifact, build, release, and deployment identity

## Required separation

```text
Repository
→ Source Revision / Tree
→ Build Invocation
→ Build Output Artifact
→ Release
→ Deployment
→ Runtime Workload Instance
```

A source commit is not an artifact; an artifact is not a release; a release is not a deployment; a deployment is not the executing workload.

## Repository identity

Store:

```text
forge provider and installation
organization/namespace native ID
repository native ID
canonical clone URLs as aliases
visibility/default branch/archival state
```

Repository names and URLs can change.

## Git object identity

Every Git reference records:

```text
repository canonical ID
full object ID
object format/hash algorithm
object type: blob/tree/commit/annotated tag
observed branch/tag context
observed_at
provenance reference
```

Never store an abbreviated hash as canonical evidence. Branch/tag names are mutable references. A commit identifies the commit object; a tree identifies a source tree.

## SWHID policy

[SWHIDs](https://docs.softwareheritage.org/devel/swh-model/persistent-identifiers.html) are intrinsic persistent identifiers for Software Heritage source objects such as contents, directories, revisions, releases, and snapshots. Use them:

- as optional source-object identifiers;
- with suitable object type and context qualifiers;
- when the source is archived/resolvable or locally computable;
- when private-source archival and disclosure policy permits.

Do not use SWHID as the canonical identity for humans, accounts, agents, models, workloads, credentials, deployments, or built artifacts. A SWHID for source does not identify the resulting binary/container.

## Build identity

Capture:

```text
build ID
builder identity and platform
source revision/tree
build definition/parameters/dependencies
start/finish
environment
output artifact digests
provenance/signatures/approval
```

Two builds from one commit may legitimately produce different artifacts when inputs/platforms differ; unexplained differences produce a finding.

## Artifact identity

Every immutable artifact uses an algorithm-qualified digest. Coordinates/tags/versions are additional locators:

- OCI manifest/index digest;
- package or binary digest plus package URL/registry coordinate;
- agent/prompt/tool/model/policy/configuration manifest digest;
- SBOM digest and subject artifact;
- release-manifest digest.

The complete matrix is [artifact-identifiers.csv](matrices/artifact-identifiers.csv); the canonical object is [artifact-identity.schema.json](schemas/artifact-identity.schema.json).

## Release identity

A release records:

```text
release ID/product/version
source revision set
artifact set by platform
SBOMs and evaluations
certifications/signatures/attestations
publisher and release time
```

The release manifest is immutable/content addressed. A display version can be reused only under an explicit generation policy.

## Deployment identity

Deployment records:

```text
tenant/environment/region
release and exact artifact digests
runtime configuration digest
deployment revision/platform
deployer/time/rollout/current status
```

At runtime, verify the actual digest/configuration against the deployment record. An image tag is retained only as an observed alias.

## Current assessment

The supplied analyses provide pinned repository revisions, build/deploy configurations, images/tags, package/update machinery, and unresolved live-deployment state. They do not demonstrate an end-to-end canonical source/build/artifact/release/deployment/runtime identity chain, and several analyses explicitly note absent/unresolved SBOM, signing, image digest, or live manifest evidence.

Per-component evidence and target work are in [provenance-support.csv](matrices/provenance-support.csv).

