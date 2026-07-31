# 16 — Policy, Control, and Enforcement

## Control domains

The endpoint has four separate control planes:

1. agent/tenant/device kill switch;
2. Application execution governance in System Monitor v2;
3. inline proxy DLP/policy actions;
4. IDE hook decision protocol.

They have different schemas, enforcement points and effect evidence. The
machine contract is
[control-capabilities.csv](../../../matrices/sensor-intelligence/endpoint-sensor/control-capabilities.csv)
and [control-capabilities.yaml](../../../schemas/sensor-intelligence/endpoint-sensor/control-capabilities.yaml).

## Kill switch

Persona `fetch-user-details` supplies tenant and device enabled flags. Missing
values default enabled. The main agent publishes state over the kill-switch
broker bridge; monitor/proxy consumers react through their local IPC clients.

- Tenant `false`: intended tenant-wide disable.
- Matching device `false`: intended device disable.
- Missing flags: fail open/enabled.
- Initial System Monitor gate retries for a fixed budget and continues enabled
  if no authoritative disabled value is obtained.
- Shutdown also deliberately disables the controller to trigger proxy drain
  before stopping services, so “disabled” may represent administrative kill or
  local shutdown coordination depending context.

No signed command ID, policy version or acknowledgement/effect record is common
across participants.

## Application execution governance

`ExecutionPolicy` values:

- `Allowed`: no action;
- `Audit`: log only;
- `Blocked`: terminate matching processes and show block UI when user-facing;
- `Quarantined`: currently uses the same terminate path, with a distinct
  notification/action label.

### Matching

Enforcer responds to entity Added/GovernanceUpdated/Rediscovered and periodic
sweeps. It:

- matches all executables under a configured application bundle path when
  possible;
- otherwise matches known executable/process/entity names case-insensitively,
  including dash-prefixed names and `argv[0]`;
- expands matched seed processes to descendants.

Name matching can catch unrelated same-name processes. Bundle/path matching is
stronger but still path-based, not signing/digest based.

### Action sequence

For Blocked/Quarantined:

1. find matching PID tree;
2. if dry run, report only;
3. macOS `.app`: Apple Events quit, wait 5 s, recheck;
4. signal root PIDs gracefully (`SIGTERM`; Windows `taskkill /T`);
5. wait 5 s;
6. force-kill survivors (`SIGKILL`; Windows `taskkill /F /T`);
7. if any action call returned true, notify user subject to cooldown and POST
   an audit alert;
8. record kill/backoff state.

### Effect limitations

- macOS clean Apple Events exit is rechecked.
- The final force-kill loop is not followed by a final “all survivors gone”
  verification record.
- Windows graceful `taskkill` returns `Ok(true)` for a non-success status unless
  stderr contains `"not found"`; this can overstate signal success.
- `any_killed` means at least one action call reported true, not necessarily
  that all matched processes terminated.
- Audit reporting is best effort: initial POST plus one retry. The second
  non-success HTTP response is not treated as an `Err` in the shown code, so it
  can exit without the “event lost” warning that only covers transport error.
- No durable enforcement result/event ID exists.

Blocked and Quarantined are therefore action labels, not distinct filesystem
or containment mechanisms.

## Proxy policy and DLP control

`DlpAction` chooses LogOnly or Enforce. Enforce first runs the detector, then
maps to `EnrichedEvent` and evaluates the local policy pipeline.

Policy actions:

- Allow;
- Block;
- Ask / legacy Prompt;
- Justify;
- Allow original with no/optional/mandatory justification;
- Allow prompt after removal of sensitive data.

Verified behavior includes:

- adversarial detection blocks immediately and sends non-blocking information;
- policy Block returns a local blocked HTTP response;
- Ask/Prompt shows information and allows request;
- Allow proceeds;
- optional/no-justification variants proceed with non-blocking UI;
- mandatory Justify waits for UI; default/cancel/timeout blocks;
- policy engine unavailable, task error or 100 ms timeout returns Allow;
- `AllowPromptAfterRemovalOfSensitiveData` is handled in the same branch as
  Block in `handle_dlp_for_ctx`; a verified redaction/effect record is not
  produced by that branch.

The proxy therefore explicitly fails open on policy engine readiness/timeout
for productivity. DLP analyzer paths have their own fallback/no-detection
behaviors.

## Hook decision protocol

The protocol supports Allow, Deny, Ask and Justify plus detection details.
The active `ActivityEvaluator` always returns `HookResponse::allow()`. Tool
input, command and prompt are not evaluated by policy/DLP in this path.
Thin-client parse/IPC errors also generally fail open.

`Contradiction:` protocol/tests demonstrate deny/ask shapes, but production
hook evaluation implements only Allow.

## Authorization versus enforcement

- Persona roles/permissions and policy conditions are inputs.
- Backend governance controls entity execution.
- Proxy policy engine controls selected inline requests.
- Local template UI collects user response.

No single component proves that the user had authority to approve, that an
external action succeeded, or that the downstream resource state changed.

## Proposed control result contract

Every control should return:

- command/decision ID;
- sensor instance/version;
- policy ID/version and behavior ID;
- target source alias and expected state;
- requested/authorized/executed/succeeded/effect-observed stages;
- timestamps and actor/approver;
- platform-native return status/error;
- coverage/bypass/degraded state;
- evidence locator;
- idempotency and replay disposition.

No current control family supplies the full set.

