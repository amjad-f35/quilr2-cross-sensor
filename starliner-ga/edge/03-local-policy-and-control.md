# Local Policy and Control

Status: **normative**

## Principle

The edge enforces only what must be decided or effected locally. Central services remain authoritative for enterprise policy, decision history, approvals, commands, and verified outcomes.

## Policy package

A local policy package is signed and contains:

- tenant and environment;
- policy ID and immutable version;
- compiled rule artifact and source-policy digest;
- intended sensor profile and minimum runtime version;
- permitted enforcement capabilities;
- activation and expiry time;
- fail-open or fail-closed behavior;
- rollback version;
- data handling directives;
- signature chain and signing identity;
- rollout cohort and emergency-stop state.

The runtime rejects packages for another tenant, profile, or capability.

## Evaluation modes

| Mode | Meaning |
|---|---|
| Observe | Evaluate and report; never alter the protected workload |
| Warn | Present a user/operator warning; permit continuation |
| Require justification | Collect a bounded reason and report it |
| Require approval | Pause only where the profile can safely do so; central approval is required |
| Block | Deny the declared action |
| Quarantine | Isolate a supported artifact or integration |
| Reconfigure | Apply a registered reversible source configuration |

The UI must not label an observe-only rule “enforced.”

## Decision record

Each evaluation produces, subject to capture policy:

- policy and version;
- evaluated action and target source identifiers;
- input fact digests;
- evaluation time and engine version;
- result and reason codes;
- local/central decision origin;
- override or approval reference;
- resulting command reference, if any;
- privacy-safe context.

Decision records are evidence, not final proof of effect.

## Command verification

Before execution, the runtime verifies:

1. signature and trust chain;
2. tenant, producer, workload, and target binding;
3. command type is declared in the installed capability manifest;
4. issuer is authorized for the policy purpose;
5. approval class is satisfied;
6. validity interval and nonce/replay window;
7. idempotency key;
8. current local preconditions;
9. kill switch and rollout cohort;
10. runtime health is sufficient to execute safely.

Any failed check returns a typed non-executed outcome.

## Outcome state machine

```text
issued
  -> delivered
  -> accepted | rejected
  -> executing
  -> succeeded | failed | expired | cancelled | indeterminate
  -> effect_observed | effect_not_observed | effect_lost
```

“Succeeded” means the adapter completed its command contract. “Effect observed” means a subsequent observation confirms the intended state. They are not interchangeable.

## Approval and break-glass

- Approvals bind to immutable policy, target selector, action, and expiry.
- Self-approval is prohibited where separation of duties is configured.
- Break-glass requires a reason, strong authentication, bounded duration, and immediate audit.
- Emergency tenant disable can prevent new commands without disabling visibility.
- Global emergency disable is a separately controlled, audited operational action.

## Offline behavior

The signed policy declares offline behavior for each decision class:

- use cached policy until expiry;
- permit and report;
- deny and report;
- require an already issued offline grant;
- degrade to warn.

There is no implicit global choice. Safety, availability, and customer contract determine the configured behavior.

## Rollout

Policies and command capabilities progress through:

1. static validation;
2. historical evaluation against authorized data;
3. observe-only;
4. bounded cohort;
5. staged production;
6. general availability;
7. continuous outcome and false-positive monitoring.

Promotion requires measurable precision, customer-impact, latency, and rollback evidence. The platform can stop rollout independently from sensor release.

## Prohibitions

- no arbitrary remote execution;
- no unversioned policy;
- no command without an idempotency key;
- no irreversible action without an explicit irreversible command class and approval policy;
- no inference of effect from dispatch;
- no expired policy silently treated as current;
- no UI promise of enforcement if the target lacks certified capability or fresh coverage.
