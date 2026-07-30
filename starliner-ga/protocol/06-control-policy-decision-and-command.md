# Control, Policy, Decision, Approval, and Command Protocol

## Separate mechanisms

```text
policy distribution
decision escalation
approval continuation
targeted command
effect verification
```

They are versioned separately and never overloaded into observation delivery.

## Policy bundle

Required:

```text
bundle ID/tenant/target profiles
policy version
issued/not-before/expires
minimum runtime/profile
content digest
signing key/algorithm/signature
rules/obligations/fail modes
rollback and supersession
```

Lifecycle:

```text
published → discovered → downloaded → verified → compatible
→ staged → activated → superseded/rolled_back/expired/rejected
```

Push invalidation announces a version; edge pulls the signed bundle.

## Local PEP evaluation

```text
non-overridable platform safety revocation
→ tenant emergency deny
→ active signed bundle
→ valid decision/approval lease
→ optional certified local analysis
→ central escalation
→ action-class fail mode
→ native enforcement
→ decision/outcome evidence
```

Vendor/platform safety precedence is separate from tenant-configurable precedence.

## Decision request

Contains safe, bounded:

```text
request/tenant/source identity
subject source refs and assurance
canonical binding tokens if current
action and stable action hash
resource/source refs
policy/bundle/context versions
authority/delegation refs
environment/posture/data labels
requested verdicts
deadline
```

## Decision response

```text
decision ID
PERMIT | DEFER | DENY
user-facing primitive/obligations
policy/bundle/context versions
reason codes
authority snapshot
issued/expires
optional signed lease
signature
```

Consequential central permits MUST be durably logged before response.

## Leases

Lease scope binds:

- tenant;
- subject assurance and source/runtime;
- normalized action hash;
- resource/binding;
- policy/bundle/context versions;
- allowed operation count/budget;
- issue/expiry using trusted time;
- exclusions and revocation epoch.

Local expiry uses monotonic elapsed time plus validated server-time offset. Clock rollback cannot extend a lease.

## Approval

Approval records request, scope, requester, approver eligibility, separation of duties, evidence summary, expiry, decision, and optional bounded lease. Authorization is checked when approving and again when executing.

## Commands

Each command type has a registered typed schema:

```text
command ID/tenant/type/version
target canonical ref
target source binding and binding revision
preconditions/expected state
typed parameters
issued/not-before/expires
actor/approval/authorization/policy snapshot
transport idempotency
native action idempotency
retry/compensation rules
verification policy
signature
```

Lifecycle:

```text
issued
→ authenticated
→ accepted/rejected
→ attempted
→ execution outcome
→ effect observed/not observed/conflicting
→ verified/failed/expired/cancelled
```

Transport retries cannot automatically repeat a non-idempotent native action.

## Verification

The command definition names eligible verification sources, minimum independence/authority, required postcondition, timeout, and conflict behavior. Same-source verification is allowed only when explicitly certified as sufficiently authoritative.
