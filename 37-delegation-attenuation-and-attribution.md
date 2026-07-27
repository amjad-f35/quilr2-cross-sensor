# 37. Delegation, attenuation, and attribution

## Actor modes

Always distinguish:

- a user acts directly;
- an agent acts on behalf of a user;
- an agent acts as its own service principal;
- a service impersonates a user;
- a parent agent delegates to a child;
- an administrator temporarily assumes privilege;
- a CI/workflow or connector acts under delegated authority.

## Canonical actor chain

Every consequential event references [actor-chain.schema.json](schemas/actor-chain.schema.json):

```text
human/workflow initiator
→ delegating principal
→ agent definition/version/deployment
→ runtime workload/instance/artifact
→ effective principal
→ delegation/grant/credential
→ approval
→ session/run/parent run/step/intent
→ policy decision
→ observing sensor/enforcement point
```

`authenticated_as`, `runs_as`, `effective_principal`, and `initiated_by` can legitimately differ.

## Attenuation invariant

For parent `P` and child `C`:

```text
C.actions ⊆ P.actions
C.resources ⊆ P.resources
C.data_access ⊆ P.data_access
C.audiences ⊆ P.audiences
C.duration ≤ P.remaining_duration
C.spend ≤ P.remaining_spend
C.depth < P.maximum_depth
C.environment ∈ P.permitted_environments
C.purpose ∈ P.permitted_purposes
```

The Credential Broker validates every constraint before issuance and records the compared parent snapshot. A child may narrow authority but never broaden it.

## Mechanisms

Evaluate:

- OAuth Token Exchange ([RFC 8693](https://www.rfc-editor.org/info/rfc8693/));
- Rich Authorization Requests ([RFC 9396](https://www.rfc-editor.org/info/rfc9396/));
- OAuth Resource Indicators ([RFC 8707](https://www.rfc-editor.org/info/rfc8707/));
- DPoP ([RFC 9449](https://www.rfc-editor.org/info/rfc9449/)) or mTLS sender binding;
- actor claims, short-lived credentials, capability tokens/caveats, and signed Intent Bundles.

The platform does not forward a full-power human token to every agent or child. It exchanges the parent authority for a narrower, audience-bound, time-bound credential.

## Grant model

The [credential grant schema](schemas/credential-grant.schema.json) records:

```text
issuer
subject and actor
parent grant
actions/resources/data
audiences and authorization details
purpose/environment/spend
issue/expiration
key binding
delegation depth and attenuation result
revocation cascade
```

Credential material is returned only through the broker’s secure channel; the inventory stores metadata.

## Revocation

Each grant defines:

- whether parent revocation blocks new exchanges;
- whether descendants are revoked immediately;
- whether already issued credentials are introspected/revoked or allowed to expire;
- whether active runs stop, drain, or enter approval;
- propagation SLO and failure handling.

The safe default for material authority is parent-to-descendant cascade plus immediate block on new exchanges.

## Authentication, authorization, attribution

| Plane | Required fields |
| --- | --- |
| Authentication | authenticated principal, method/authority/time/strength, credential/key/session |
| Authorization | authorized subject, effective principal, grant/delegation, policy/version, decision, approval |
| Attribution | initiated/requested/delegated/planned/approved/executed/runs-as/authenticated-as/effective/observed/decided/enforced/deployed/built/signed identities |

No single `user_id` or `actor_id` can represent all three planes.

## Current coverage

Current sources can often provide tenant, user/email/account, request, application, process, model/provider, action, and sensor/source context. They do not consistently provide agent version/deployment, workload identity, grant/delegation, credential binding, or full parent-run causality.

The exact event-by-event gap is [attribution-coverage.csv](matrices/attribution-coverage.csv). Until the missing links exist, product copy must say “observed account/source” rather than “this human authorized this exact agent runtime.”

## Delegation product view

Show:

```text
delegator → delegate → purpose
actions/resources/data/audience
duration/depth/spend
credential and current use
parent and child grants
approval and policy
revocation status
```

Effective Access translates this into plain-language paths with evidence and event-time validity.

