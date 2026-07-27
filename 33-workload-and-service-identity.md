# 33. Workload and service identity

## Definition

A workload identity answers:

> Which currently executing software instance presents this request, under which trust authority, and on what attestation?

Separate:

```text
logical workload
deployment
runtime instance
node
container
process
credential
trust domain
service account
agent/model binding
```

## Current assessment

The supplied analyses expose deployments, services, processes, device/persona context, API/JWT credentials, and Kubernetes/manifests. They do not demonstrate SPIFFE/SPIRE, SVID issuance, a canonical cloud-workload identity, runtime attestation, or a signed workload-to-agent/model/artifact binding. Live service-account/RBAC, image digests, and several deployment details are explicitly unresolved.

Therefore workload identity is a **target capability**, not a current claim.

## Proposed mechanism

Use a layered approach:

1. platform-native cloud/Kubernetes identity where available;
2. SPIFFE/SPIRE for portable logical workload IDs, short-lived SVIDs, and trust-domain federation;
3. orchestrator instance IDs such as pod UID for runtime identity;
4. signed/verified deployment bindings for agent/model/artifact/config identity;
5. process/device identity for endpoint-resident workloads.

The [SPIFFE Workload API](https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/) streams updated X.509/JWT SVIDs and trust bundles; [SPIRE workload attestation](https://spiffe.io/docs/latest/spire-about/spire-concepts/) maps runtime selectors to registered identities. Adoption requires deployment-specific threat modeling and operational validation.

## Trust domains

- Separate production and non-production.
- Scope customer-hosted gateways and external agent platforms explicitly.
- Name environment/region/tenant in registration/policy, not necessarily in the stable logical identity.
- Record federation boundaries and accepted audiences.
- Rotate trust bundles and credentials continuously.

## Attestation selectors

Candidate selectors include:

```text
Kubernetes namespace/service account/pod UID
container image digest
container labels
Unix UID/GID
executable path and digest
cloud account/project/VM instance
cluster/node pool/region
device certificate/TPM measurement
```

Selectors support identity issuance; they are not all canonical identifiers.

## Credential lifecycle

Workload credentials must support:

- automatic issuance and short expiry;
- automatic renewal before expiry;
- key and trust-bundle rotation;
- audience restriction;
- revocation and node-compromise response;
- restart/move without changing logical workload identity;
- clear failure behavior when renewal or attestation fails.

X.509-SVID is preferred for mutual authentication when architecture permits; JWT-SVID/cloud tokens require audience validation and replay-aware controls.

## Runtime binder

The deployment authority creates a signed or otherwise verified binding:

```text
workload identity
agent deployment/version or model deployment
artifact digest
configuration digest
tenant
environment
valid interval
deployment authority
```

The runtime verifier compares the presented workload, orchestrator instance, and actual artifact/config against that binding. A valid workload credential with the wrong artifact still fails.

## Non-human inventory

Every service account, OAuth client, connector, sensor, CI job, build/deploy service, database role, robot, and webhook sender requires:

```text
canonical ID and native IDs
principal type
business/technical owner
purpose
tenant/environment
creator and creation time
last use
credentials and permissions
delegations
expiration/review/revocation
```

The full inventory specification is [non-human-identities.csv](matrices/non-human-identities.csv); current runtime support is [workload-identity-support.csv](matrices/workload-identity-support.csv); the object contract is [workload-identity.schema.json](schemas/workload-identity.schema.json).

## Failure policy

- Unknown workload: reject sensitive action or route to an explicitly limited bootstrap policy.
- Expired/failed attestation: no new consequential action.
- Credential renewal failure: stop accepting new work before credential expiry; surface material incident.
- Artifact mismatch: quarantine deployment, preserve evidence, and revoke dependent authority under policy.
- Shared identity across tenants: critical finding and immediate containment.

