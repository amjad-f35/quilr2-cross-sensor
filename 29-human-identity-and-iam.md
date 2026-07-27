# 29. Human identity and IAM

## Human model

Model separately:

```text
Person
→ Employment Relationship
→ Directory Account
→ IdP Account
→ SaaS / Local / Privileged Account
→ Session
→ Authentication Event
```

One person can have many employment relationships and accounts. One account does not prove one person. Account linking is governed by [human-account-linking.csv](matrices/human-account-linking.csv).

## Stable identity

Preferred identifiers:

- OIDC issuer+subject;
- SCIM provider tenant+resource ID;
- HRIS system+immutable employment ID;
- directory tenant+object ID.

Email, username, phone, display name, department name, and manager name are claims/aliases with valid intervals. They are never the canonical person ID.

## Current state

**Verified:**

- Quilr web stores access/refresh token and user/tenant identity in a browser cookie and attaches bearer, tenant, and subscriber context to API calls.
- The query-builder’s external decoder validates configured token properties and tenant context on covered paths; repository-local Spring route rules and frontend permission visibility are not complete authorization proof.
- Gateway authentication uses API keys, JWTs, and an Entra operator session on different paths; user/email identity semantics depend on credential and application settings.
- Endpoint Persona/email discovery gathers several local account/email candidates but is not an authoritative workforce directory.
- Application/user synchronization jobs exist, but no complete joiner/mover/leaver fabric is demonstrated.

Evidence: [Quilr security model](../../quilr-platform-analysis/12-security-model.md), [Quilr data dictionary](../../quilr-platform-analysis/08-data-dictionary.md), [gateway data dictionary](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md), and [endpoint security model](../../Endpoint-agent-sensor-analysis/repository-analysis/12-security-model.md).

## Human attributes

The target claim set includes:

```text
person_id
employment_id and status
directory/account IDs
OIDC issuer+subject
account type: employee/contractor/guest/partner/customer
start/end dates
department/team/manager/cost center
geography/legal entity
groups/roles/privileged state
authentication methods and strength
last authentication/session age
device posture
account owner/sponsor
joiner-mover-leaver state
```

Each attribute retains source, valid time, assurance, proof, and authority.

## Joiner, mover, leaver lifecycle

| Transition | Required identity actions |
| --- | --- |
| Pre-hire→active | Create employment and directory-account relationships; issue only approved roles/sessions; assign sponsor/manager |
| Role/department change | End-date old organization/role edges; compute effective access; review agent ownership and delegations |
| Leave of absence | Suspend policy-selected sessions, grants, and agent authority without destroying identity |
| Termination | Disable accounts; revoke sessions/grants/credentials; reassign agent/data/application ownership; preserve evidence |
| Archive | Retain identity/tombstones under privacy and evidence policy; remove active access |
| Rehire | Reconcile the person through authoritative ID; create a new employment relationship and re-evaluate prior aliases/access |

Email reassignment must end-date the prior account alias before attaching it to another account. Historical events continue to resolve to the original event-time account/person.

## Authentication target

Evaluate and integrate:

- OIDC and SAML federation;
- enterprise directory/LDAP where required;
- WebAuthn/passkeys and MFA;
- certificate/device-bound authentication;
- step-up authentication for merge/split, trust, revocation, policy, and evidence operations;
- short-lived sessions with server-side revocation.

OIDC account identity uses issuer+subject. The client must also validate issuer, audience, signature, time, nonce/state where applicable, and authentication context.

## Provisioning target

Use SCIM/HRIS/directory change events plus periodic reconciliation for:

- users, groups, and memberships;
- joiner/mover/leaver transitions;
- deactivation and session revocation;
- ownership reassignment;
- sponsor and privileged-account review.

Cursor commits occur only after durable identity observations. Full sync compares provider inventory, preserves source tombstones, and never infers canonical deletion from connector failure.

## Administrative authority

Distinguish:

```text
organization administrator
platform administrator
security administrator
policy administrator
agent administrator
data owner
model administrator
connector administrator
auditor
approver
billing administrator
read-only operator
```

Every assignment records origin, tenant/environment/resource scope, approval, separation-of-duties rule, start/expiration, review cadence, and revocation. Frontend route visibility is never the authorization authority.

## Product behavior

People & Accounts must show:

- person and account identities separately;
- linking evidence and confidence;
- employment/group/role history;
- current sessions and authentication strength;
- SaaS/personal/enterprise account separation;
- ownership/sponsorship;
- effective access paths;
- unresolved candidates and lifecycle findings.

Raw identity proofs and sensitive claims require privileged evidence access.

