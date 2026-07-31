# Runtime Verification

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Separate source verification, test execution, machine validation and unavailable runtime evidence.


## Inherited first-pass runtime evidence

- Project-Vanguard: two Jest suites / eight tests passed. Two other compile/test
  attempts exposed TypeScript/open-handle problems documented in the prior
  test analysis.
- project-sentinel: 203 test annotations were inventoried (one ignored), but a
  complete local test run was blocked by unavailable Rust toolchain/private
  path dependencies in the analysis environment.
- browser-extension-service: 57 tests were inventoried, concentrated in the
  heartbeat subsystem; a full Java runtime/build was not available.
- No cross-repository browser-to-native-to-backend end-to-end test exists in
  the pinned evidence.

## This pass

This pass performs machine validation of every generated CSV/YAML/JSON artifact,
required directory/file names, evidence/status vocabularies, fixture origin
labels, Markdown links and matrix counts. Proposed Starliner fixtures are
generated from the inspected target contracts; they are not labelled runtime
captures.

## Runtime-unverified claims

External extension-log-service behavior, actual production Kafka/gateway
routing, private JWT decoder/authz details, active AI-site parser success,
Windows/macOS OS effects and gRPC (absent) were not dynamically exercised.
Their statuses remain `Unresolved`, `Configured but runtime-unverified`, or
source-verified as appropriate.
